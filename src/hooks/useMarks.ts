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
import { hashAndDecodeDataUrl } from '@/lib/originHash';
import { generateOriginId } from '@/lib/originId';
import { getDeviceFingerprintHash } from '@/lib/deviceFingerprint';
import { getDeviceId } from '@/lib/deviceId';
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
}

export function useMarks() {
  const [marks, setMarks] = useState<DisplayMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert LocalMark to DisplayMark with thumbnail URL
  const toDisplayMark = useCallback((mark: LocalMark): DisplayMark => {
    let thumbnailUrl: string | undefined;
    
    if (mark.thumbnail) {
      thumbnailUrl = URL.createObjectURL(mark.thumbnail);
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

  // Load marks from IndexedDB
  const loadMarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const localMarks = await getAllMarks();
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
      // Step 1: Generate compressed thumbnail
      console.log('[createMark] Generating thumbnail...');
      const thumbnailBlob = await generateThumbnail(imageDataUrl);
      
      // Step 2: Compute SHA-256 hash from ORIGINAL image (not thumbnail)
      console.log('[createMark] Computing hash...');
      const { hash } = await hashAndDecodeDataUrl(imageDataUrl);
      
      // Step 3: Generate origin ID and get device fingerprint
      const originId = generateOriginId();
      const deviceFingerprint = await getDeviceFingerprintHash();
      
      // Step 4: Determine size class based on thumbnail
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = imageDataUrl;
      });
      const aspectRatio = img.width / img.height;
      const sizeClass: LocalMark['sizeClass'] = 
        aspectRatio > 1.5 ? 'large' : 
        aspectRatio < 0.7 ? 'small' : 'medium';

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
      setMarks(prev => [displayMark, ...prev]);
      
      return displayMark;
    } catch (e) {
      console.error('[createMark] Failed:', e);
      toast.error('Failed to create mark');
      return null;
    }
  }, [toDisplayMark]);

  /**
   * Delete a mark from both IndexedDB and Supabase
   */
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
        // Skip pages with no image source at all
        const hasLegacyImage = page.image_url && page.image_url !== '';
        const hasThumbnail = page.thumbnail_uri && page.thumbnail_uri !== '';
        if (!hasLegacyImage && !hasThumbnail) continue;

        // Check if already in IndexedDB
        const existing = await getMark(page.id);
        if (existing) continue;

        // Import — use thumbnail_uri as fallback when image_url is empty
        const displayUrl = hasLegacyImage ? page.image_url : (page.thumbnail_uri || '');
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
        console.log(`[importLegacyMarks] Imported ${imported} legacy marks`);
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
    deleteMark,
    importLegacyMarks,
    refresh: loadMarks,
    getMarkCount,
  };
}
