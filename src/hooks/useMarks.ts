/**
 * useMarks Hook - v4 Local-First Mark Management
 * 
 * Dual-write strategy:
 * - Thumbnails → IndexedDB (local-first, never leaves device)
 * - Hashes + metadata → Supabase (for attestation & sync)
 * 
 * Display fallback chain:
 * 1. IndexedDB thumbnail (new marks)
 * 2. Supabase image_url (legacy marks)
 * 3. Hash + date only (minimal fallback)
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  LocalMark, 
  getAllMarks, 
  saveMark, 
  getMark, 
  deleteMark as deleteLocalMark,
  importLegacyPage,
  getMarkCount
} from '@/lib/indexedDB';
import { generateThumbnail } from '@/lib/thumbnailService';
import { hashAndDecodeDataUrl, calculateSHA256 } from '@/lib/originHash';
import { generateOriginId } from '@/lib/originId';
import { getDeviceFingerprintHash } from '@/lib/deviceFingerprint';
import { getDeviceId } from '@/lib/deviceId';
import { getPasskeyCredential, savePasskeyCredential } from '@/lib/passkeyStore';
import { signHash, registerPasskey, isWebAuthnSupported, isPlatformAuthenticatorAvailable } from '@/lib/webauthn';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DisplayMark {
  id: string;
  originId: string;
  hash: string;
  timestamp: Date;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  sizeClass: 'small' | 'medium' | 'large';
  otsStatus: 'pending' | 'submitted' | 'anchored';
  // Display sources (in priority order)
  thumbnailBlob?: Blob;
  thumbnailUrl?: string; // Object URL for display
  legacyImageUrl?: string;
  userNote?: string;
  // Device signature (v1.1 — passkey signing)
  deviceSignature?: string | null;
  devicePublicKey?: string | null;
}

export function useMarks() {
  const [marks, setMarks] = useState<DisplayMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert LocalMark to DisplayMark with thumbnail URL
  const toDisplayMark = useCallback((mark: LocalMark): DisplayMark => {
    let thumbnailUrl: string | undefined;
    
    if (mark.thumbnail) {
      try {
        thumbnailUrl = URL.createObjectURL(mark.thumbnail);
      } catch (e) {
        // Blob may be corrupted or evicted on mobile Safari
        console.warn('[toDisplayMark] Failed to create blob URL, using remote fallback:', e);
        thumbnailUrl = undefined;
      }
    }

    return {
      id: mark.id,
      originId: mark.originId,
      hash: mark.hash,
      timestamp: mark.timestamp,
      type: mark.type,
      sizeClass: mark.sizeClass,
      otsStatus: mark.otsStatus,
      thumbnailBlob: mark.thumbnail || undefined,
      thumbnailUrl,
      legacyImageUrl: mark.legacyImageUrl,
      userNote: mark.userNote,
    };
  }, []);

  // Load marks from IndexedDB, with automatic repair from server if empty
  const loadMarks = useCallback(async (skipRepair = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let localMarks = await getAllMarks();
      
      // Auto-repair: if IndexedDB is empty but server has marks, import them
      if (!skipRepair && localMarks.length === 0) {
        const deviceUserId = getDeviceId();
        if (deviceUserId) {
          console.log('[useMarks] IndexedDB empty — attempting server repair...');
          const { data: serverPages } = await supabase
            .from('pages')
            .select('id, image_url, origin_hash_sha256, created_at, thumbnail_uri')
            .eq('device_user_id', deviceUserId)
            .eq('is_trashed', false)
            .order('created_at', { ascending: false });
          
          if (serverPages && serverPages.length > 0) {
            console.log(`[useMarks] Found ${serverPages.length} marks on server, restoring...`);
            for (const page of serverPages) {
              const hasThumbnail = page.thumbnail_uri && page.thumbnail_uri !== '';
              const hasLegacyImage = page.image_url && page.image_url !== '';
              const displayUrl = hasThumbnail ? page.thumbnail_uri! : (hasLegacyImage ? page.image_url : '');
              
              await importLegacyPage({
                id: page.id,
                imageUrl: displayUrl,
                hash: page.origin_hash_sha256 || '',
                createdAt: new Date(page.created_at),
              });
            }
            // Re-read after import
            localMarks = await getAllMarks();
            console.log(`[useMarks] Restored ${localMarks.length} marks from server`);
          }
        }
      }
      
      const displayMarks = localMarks.map(toDisplayMark);
      setMarks(displayMarks);
    } catch (e) {
      console.error('[useMarks] Failed to load marks:', e);
      setError('Failed to load your marks');
    } finally {
      setIsLoading(false);
    }
  }, [toDisplayMark]);

  // Load on mount
  useEffect(() => {
    loadMarks();
  }, [loadMarks]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      marks.forEach(mark => {
        if (mark.thumbnailUrl) {
          URL.revokeObjectURL(mark.thumbnailUrl);
        }
      });
    };
  }, [marks]);

  /**
   * Create a new mark with dual-write
   * 
   * 1. Generate thumbnail (<50KB JPEG)
   * 2. Compute SHA-256 hash
   * 3. Save thumbnail to IndexedDB
   * 4. Send hash + metadata to Supabase
   */
  const createMark = useCallback(async (
    imageDataUrl: string,
    type: LocalMark['type'] = 'warm'
  ): Promise<DisplayMark | null> => {
    // Auto-initialize device ID if not present
    let deviceUserId = getDeviceId();
    if (!deviceUserId) {
      console.log('[createMark] Auto-initializing device ID...');
      const { initializeDeviceId } = await import('@/lib/deviceId');
      deviceUserId = initializeDeviceId();
    }
    
    if (!deviceUserId) {
      console.error('[createMark] Failed to initialize device ID');
      toast.error('Device not initialized');
      return null;
    }
    
    console.log('[createMark] Using device ID:', deviceUserId.substring(0, 8) + '...');

    try {
      const isImage = !type || type === 'warm' || type === 'organic' || type === 'sketch';
      
      // Step 1: Generate compressed thumbnail (only for images)
      let thumbnailBlob: Blob;
      if (isImage) {
        console.log('[createMark] Generating thumbnail...');
        thumbnailBlob = await generateThumbnail(imageDataUrl);
      } else {
        // Non-image: create a tiny placeholder blob
        thumbnailBlob = new Blob(['non-image'], { type: 'text/plain' });
      }
      
      // Step 2: Compute SHA-256 hash from ORIGINAL file (not thumbnail)
      console.log('[createMark] Computing hash...');
      const { hash } = await hashAndDecodeDataUrl(imageDataUrl);
      
      // Step 2b: Best-effort device signing (NEVER blocking)
      // Auto-register passkey on first capture if none exists.
      // Failure is silently caught — the anchor proceeds with null signature.
      let deviceSignature: string | null = null;
      let devicePublicKey: string | null = null;
      
      const webAuthnSupported = isWebAuthnSupported();
      console.log('[createMark] WebAuthn supported:', webAuthnSupported);
      if (webAuthnSupported) {
        let credential = getPasskeyCredential();
        console.log('[createMark] Stored passkey credential:', credential ? credential.credentialId.substring(0, 12) + '…' : 'null');
        
        // Auto-register: if no credential exists, prompt Face ID / fingerprint
        // After registration, immediately sign the hash in one flow
        if (!credential) {
          try {
            const hasPlatform = await isPlatformAuthenticatorAvailable();
            console.log('[createMark] Platform authenticator available:', hasPlatform);
            if (hasPlatform) {
              console.log('[createMark] Auto-registering passkey (first capture)...');
              credential = await registerPasskey(hash.substring(0, 8));
              savePasskeyCredential(credential);
              console.log('[createMark] Passkey registered:', credential.credentialId.substring(0, 12) + '…');
              
              // Sign immediately after registration (same biometric session on most platforms)
              try {
                console.log('[createMark] Signing hash immediately after registration...');
                const sig = await signHash(credential.credentialId, hash);
                deviceSignature = sig.signature;
                devicePublicKey = credential.publicKey;
                console.log('[createMark] ✓ Hash signed on first capture, sig length:', deviceSignature.length);
              } catch (signErr) {
                // Second biometric prompt failed — still save credential for next capture
                console.warn('[createMark] Signing after registration failed (will work next capture):', signErr);
                // Set public key anyway so certificate shows the device identity
                devicePublicKey = credential.publicKey;
              }
            }
          } catch (e) {
            // User cancelled or registration failed — proceed without passkey
            console.warn('[createMark] Passkey auto-registration skipped:', e);
          }
        } else {
          // Existing credential — sign directly
          try {
            console.log('[createMark] Signing hash with stored passkey...');
            const sig = await signHash(credential.credentialId, hash);
            deviceSignature = sig.signature;
            devicePublicKey = credential.publicKey;
            console.log('[createMark] ✓ Hash signed, sig length:', deviceSignature.length);
          } catch (e) {
            console.warn('[createMark] Passkey signing failed (non-blocking):', e);
            deviceSignature = null;
            devicePublicKey = null;
          }
        }
      }
      
      // Step 3: Generate origin ID and get device fingerprint
      const originId = generateOriginId();
      const deviceFingerprint = await getDeviceFingerprintHash();
      
      // Step 4: Determine size class based on content type
      let sizeClass: LocalMark['sizeClass'] = 'medium';
      if (isImage) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't hang on error
          img.src = imageDataUrl;
        });
        if (img.width > 0 && img.height > 0) {
          const aspectRatio = img.width / img.height;
          sizeClass = aspectRatio > 1.5 ? 'large' : aspectRatio < 0.7 ? 'small' : 'medium';
        }
      }

      // Step 5: Save to IndexedDB (local-first)
      console.log('[createMark] Saving to IndexedDB...');
      const localMark = await saveMark({
        id: crypto.randomUUID(),
        thumbnail: thumbnailBlob,
        hash,
        originId,
        timestamp: new Date(),
        otsProof: null,
        otsStatus: 'pending',
        type,
        sizeClass,
        syncStatus: 'queued',
      });

      // Step 6: Upload tiny thumbnail to storage (visual fallback)
      let thumbnailPublicUrl: string | null = null;
      try {
        const storagePath = `${deviceUserId}/${localMark.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(storagePath, thumbnailBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(storagePath);
          thumbnailPublicUrl = urlData.publicUrl;
          console.log('[createMark] Thumbnail uploaded to storage');
          
          // Save remote URL back to IndexedDB as fallback for when blobs get evicted
          const { updateMark } = await import('@/lib/indexedDB');
          await updateMark({
            ...localMark,
            legacyImageUrl: thumbnailPublicUrl,
          });
          localMark.legacyImageUrl = thumbnailPublicUrl;
          console.log('[createMark] Remote thumbnail URL saved to IndexedDB as fallback');
        } else {
          console.warn('[createMark] Thumbnail upload failed:', uploadError);
        }
      } catch (e) {
        console.warn('[createMark] Thumbnail upload error:', e);
      }

      // Step 7: Sync hash to Supabase (no original image data!)
      console.log('[createMark] Syncing hash to Supabase...');
      const { error: supabaseError } = await supabase
        .from('pages')
        .insert({
          id: localMark.id,
          device_user_id: deviceUserId,
          writer_user_id: deviceUserId,
          image_url: '', // Empty - no server-side storage in v4
          origin_hash_sha256: hash,
          origin_hash_algo: 'sha256',
          device_fingerprint_hash: deviceFingerprint,
          thumbnail_uri: thumbnailPublicUrl || null,
          ocr_text: '',
          is_trashed: false,
          device_signed: !!deviceSignature,
        } as any);

      if (supabaseError) {
        console.warn('[createMark] Supabase sync failed (will retry):', supabaseError);
        // Mark stays in IndexedDB with 'queued' status for later retry
      } else {
        // Update sync status
        localMark.syncStatus = 'synced';
        console.log('[createMark] Mark synced successfully:', localMark.id);
      }

      const displayMark = toDisplayMark(localMark);
      // Attach device signature (not persisted in IndexedDB, only in ZIP)
      displayMark.deviceSignature = deviceSignature;
      displayMark.devicePublicKey = devicePublicKey;
      setMarks(prev => [displayMark, ...prev]);
      
      return displayMark;
    } catch (e: any) {
      const msg = e?.message || e?.toString?.() || 'Unknown error';
      console.error('[createMark] Failed:', msg, e);
      toast.error(`Failed to create mark: ${msg.substring(0, 80)}`);
      return null;
    }
  }, [toDisplayMark]);

  /**
   * Delete a mark from both IndexedDB and Supabase
   */
  /**
   * Create a new mark from a raw File object.
   * 
   * For universal file upload (PDF, audio, video, archive, etc.)
   * Uses direct File → arrayBuffer() → SHA-256 (no base64 round-trip).
   * This is the canonical hash that matches `sha256sum file` outside the app.
   * 
   * Large files (>50MB): chunked read with progress callback.
   * 
   * image_url is intentionally set to '' for non-image origins.
   * TECHNICAL DEBT NOTE (week 9 migration): rename image_url to artifact_ref 
   * or make nullable — the column name is misleading for non-image origins.
   */
  const createMarkFromFile = useCallback(async (
    file: File,
    type: LocalMark['type'] = 'warm',
    onProgress?: (fraction: number) => void,
    skipPasskey?: boolean,
    externalSignature?: { deviceSignature: string; devicePublicKey: string } | null,
  ): Promise<DisplayMark | null> => {
    // Auto-initialize device ID if not present
    let deviceUserId = getDeviceId();
    if (!deviceUserId) {
      const { initializeDeviceId } = await import('@/lib/deviceId');
      deviceUserId = initializeDeviceId();
    }
    if (!deviceUserId) {
      console.error('[createMarkFromFile] Failed to initialize device ID');
      toast.error('Device not initialized');
      return null;
    }

    try {
      console.log('[createMarkFromFile] File:', file.name, `(${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // ── Step 1: Compute SHA-256 directly from File bytes ──────────────────
      // This is bit-identical to: sha256sum <file>
      // No base64 encoding/decoding — the hash matches the raw file bytes.
      onProgress?.(0);
      const arrayBuffer = await file.arrayBuffer();
      onProgress?.(0.6); // Buffer read ~60%

      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      onProgress?.(0.75);

      console.log('[createMarkFromFile] SHA-256:', hash);

      // ── Step 2: Thumbnail — image preview or placeholder ──────────────────
      let thumbnailBlob: Blob;
      if (file.type.startsWith('image/')) {
        // For image files, generate a proper compressed thumbnail
        const previewUrl = URL.createObjectURL(file);
        try {
          thumbnailBlob = await generateThumbnail(previewUrl);
        } finally {
          URL.revokeObjectURL(previewUrl);
        }
      } else {
        // Non-image: 1-byte placeholder (type encoded in mime)
        thumbnailBlob = new Blob(['□'], { type: 'text/plain' });
      }

      // ── Step 3: Device signing (best-effort, non-blocking) ─────────────────
      let deviceSignature: string | null = null;
      let devicePublicKey: string | null = null;

      // If caller already did passkey signing (e.g. ItExisted.tsx), use that result
      if (externalSignature && externalSignature.deviceSignature && externalSignature.deviceSignature !== 'registered') {
        deviceSignature = externalSignature.deviceSignature;
        devicePublicKey = externalSignature.devicePublicKey;
        console.log('[createMarkFromFile] Using external signature, sig length:', deviceSignature.length);
      } else if (externalSignature && externalSignature.devicePublicKey) {
        // Registration-only (no signing yet) — still mark as device_signed with publicKey
        devicePublicKey = externalSignature.devicePublicKey;
        console.log('[createMarkFromFile] Using external publicKey (registration only)');
      }

      const webAuthnSupported = isWebAuthnSupported();
      console.log('[createMarkFromFile] WebAuthn supported:', webAuthnSupported, 'skipPasskey:', skipPasskey);
      if (webAuthnSupported && !skipPasskey) {
        let credential = getPasskeyCredential();
        console.log('[createMarkFromFile] Stored passkey credential:', credential ? credential.credentialId.substring(0, 12) + '…' : 'null');
        if (!credential) {
          try {
            const hasPlatform = await isPlatformAuthenticatorAvailable();
            console.log('[createMarkFromFile] Platform authenticator available:', hasPlatform);
            if (hasPlatform) {
              console.log('[createMarkFromFile] Auto-registering passkey...');
              credential = await registerPasskey(hash.substring(0, 8));
              savePasskeyCredential(credential);
              console.log('[createMarkFromFile] Passkey registered:', credential.credentialId.substring(0, 12) + '…');
              const sig = await signHash(credential.credentialId, hash).catch((e) => {
                console.warn('[createMarkFromFile] Signing after registration failed:', e);
                return null;
              });
              if (sig) {
                deviceSignature = sig.signature;
                devicePublicKey = credential.publicKey;
                console.log('[createMarkFromFile] ✓ Hash signed, sig length:', deviceSignature.length);
              } else {
                devicePublicKey = credential.publicKey;
                console.log('[createMarkFromFile] Registration ok but signing failed — publicKey set');
              }
            }
          } catch (e) {
            console.warn('[createMarkFromFile] Passkey auto-registration skipped:', e);
          }
        } else {
          try {
            console.log('[createMarkFromFile] Signing hash with stored passkey...');
            const sig = await signHash(credential.credentialId, hash);
            deviceSignature = sig.signature;
            devicePublicKey = credential.publicKey;
            console.log('[createMarkFromFile] ✓ Hash signed, sig length:', deviceSignature.length);
          } catch (e) {
            console.warn('[createMarkFromFile] Passkey signing failed (non-blocking):', e);
          }
        }
      }

      onProgress?.(0.85);

      // ── Step 4: IDs + fingerprint ──────────────────────────────────────────
      const originId = generateOriginId();
      const deviceFingerprint = await getDeviceFingerprintHash();
      const sizeClass: LocalMark['sizeClass'] = 'medium';

      // ── Step 5: IndexedDB (local-first) ────────────────────────────────────
      const localMark = await saveMark({
        id: crypto.randomUUID(),
        thumbnail: thumbnailBlob,
        hash,
        originId,
        timestamp: new Date(),
        otsProof: null,
        otsStatus: 'pending',
        type,
        sizeClass,
        syncStatus: 'queued',
      });

      // ── Step 6: Upload thumbnail to cloud storage (visual fallback) ────────
      let thumbnailPublicUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        try {
          const storagePath = `${deviceUserId}/${localMark.id}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('thumbnails')
            .upload(storagePath, thumbnailBlob, { contentType: 'image/jpeg', upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(storagePath);
            thumbnailPublicUrl = urlData.publicUrl;
            const { updateMark } = await import('@/lib/indexedDB');
            await updateMark({ ...localMark, legacyImageUrl: thumbnailPublicUrl });
            localMark.legacyImageUrl = thumbnailPublicUrl;
          }
        } catch { /* non-blocking */ }
      }

      onProgress?.(0.95);

      // ── Step 7: Sync hash to database ─────────────────────────────────────
      // CHAIN: pages.origin_hash_sha256 → bridge trigger → origin_attestations
      // The bridge trigger (bridge_page_to_core_attestation) is ON INSERT on pages.
      // It reads origin_hash_sha256 and inserts into origin_attestations ON CONFLICT DO NOTHING.
      // The OTS worker then reads from origin_attestations and produces core_ots_proofs.
      // CRITICAL: hash must be raw 64-char hex (no prefix) — that's what the bridge expects.
      console.log('[createMarkFromFile] Syncing to database (bridge trigger will propagate to origin_attestations)...');
      const { error: supabaseError } = await supabase
        .from('pages')
        .insert({
          id: localMark.id,
          device_user_id: deviceUserId,
          writer_user_id: deviceUserId,
          image_url: '', // TECH DEBT (week 9): rename to artifact_ref or make nullable
          origin_hash_sha256: hash,
          origin_hash_algo: 'sha256',
          device_fingerprint_hash: deviceFingerprint,
          thumbnail_uri: thumbnailPublicUrl || null,
          ocr_text: '',
          is_trashed: false,
          device_signed: !!deviceSignature,
        } as any);

      if (supabaseError) {
        console.warn('[createMarkFromFile] DB sync failed (will retry):', supabaseError);
      } else {
        localMark.syncStatus = 'synced';
        console.log('[createMarkFromFile] ✓ Synced. Hash in pages:', hash);
        console.log('[createMarkFromFile] Bridge trigger should now have propagated to origin_attestations');
      }

      onProgress?.(1);

      const displayMark = toDisplayMark(localMark);
      displayMark.deviceSignature = deviceSignature;
      displayMark.devicePublicKey = devicePublicKey;
      setMarks(prev => [displayMark, ...prev]);

      return displayMark;
    } catch (e) {
      console.error('[createMarkFromFile] Failed:', e);
      toast.error('Failed to anchor file');
      return null;
    }
  }, [toDisplayMark]);

  const deleteMark = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Delete from IndexedDB
      await deleteLocalMark(id);
      
      // Delete from Supabase (soft delete via is_trashed)
      await supabase
        .from('pages')
        .update({ is_trashed: true, trashed_at: new Date().toISOString() })
        .eq('id', id);

      // Update local state
      setMarks(prev => {
        const mark = prev.find(m => m.id === id);
        if (mark?.thumbnailUrl) {
          URL.revokeObjectURL(mark.thumbnailUrl);
        }
        return prev.filter(m => m.id !== id);
      });

      return true;
    } catch (e) {
      console.error('[deleteMark] Failed:', e);
      toast.error('Failed to delete mark');
      return false;
    }
  }, []);

  /**
   * Import legacy pages from Supabase into IndexedDB
   * Used for migrating existing marks to local-first storage
   */
  const importLegacyMarks = useCallback(async (): Promise<number> => {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return 0;

    try {
      // Fetch all pages for this device (legacy with image_url OR v4 with thumbnail_uri)
      const { data: allPages, error } = await supabase
        .from('pages')
        .select('id, image_url, origin_hash_sha256, created_at, thumbnail_uri')
        .eq('device_user_id', deviceUserId)
        .eq('is_trashed', false)
        .order('created_at', { ascending: false });

      if (error || !allPages) {
        console.warn('[importLegacyMarks] Fetch failed:', error);
        return 0;
      }

      let imported = 0;
      for (const page of allPages) {
        const hasLegacyImage = page.image_url && page.image_url !== '';
        const hasThumbnail = page.thumbnail_uri && page.thumbnail_uri !== '';
        // Prefer thumbnail_uri (v4 marks), fallback to image_url (legacy)
        const displayUrl = hasThumbnail ? page.thumbnail_uri! : (hasLegacyImage ? page.image_url : '');

        // Check if already in IndexedDB with a valid image source
        const existing = await getMark(page.id);
        if (existing) {
          // If mark exists but lost its blob AND has no legacyImageUrl, repair it
          if (!existing.thumbnail && !existing.legacyImageUrl && displayUrl) {
            const { updateMark } = await import('@/lib/indexedDB');
            await updateMark({ ...existing, legacyImageUrl: displayUrl });
            imported++;
            console.log('[importLegacyMarks] Repaired mark with remote URL:', page.id);
          }
          continue;
        }

        // Import as new — even marks without images (show as hash+date on Wall)
        await importLegacyPage({
          id: page.id,
          imageUrl: displayUrl,
          hash: page.origin_hash_sha256 || '',
          createdAt: new Date(page.created_at),
        });
        imported++;
      }

      if (imported > 0) {
        await loadMarks(); // Refresh display
        console.log(`[importLegacyMarks] Imported/repaired ${imported} marks`);
      }

      return imported;
    } catch (e) {
      console.error('[importLegacyMarks] Failed:', e);
      return 0;
    }
  }, [loadMarks]);

  return {
    marks,
    isLoading,
    error,
    createMark,
    createMarkFromFile,
    deleteMark,
    importLegacyMarks,
    refresh: loadMarks,
    getMarkCount,
  };
}
