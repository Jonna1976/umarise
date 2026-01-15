/**
 * Umarise Abstraction Layer - Storage Interface
 * 
 * Defines the contract for all storage operations.
 * Current implementation: Lovable Cloud (Supabase)
 * Future implementation: Hetzner (Vault + IPFS)
 * 
 * PRIVATE VAULT: Images are encrypted client-side with AES-256-GCM
 * before upload. Keys stay on device - zero-knowledge architecture.
 * 
 * ORIGIN HASH: SHA-256 fingerprint calculated over exact artifact bytes
 * at upload time. Stored immutably for later forensic verification.
 */

import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getActiveDeviceId, setDeviceId, isDemoModeActive, DEMO_DEVICE_ID } from '../deviceId';
import { encryptImage, decryptImage, isPrivateVaultEnabled } from '../crypto';
import { hashAndDecodeDataUrl } from '../originHash';
import type { Page, Project, OCRToken, NamedEntity, FutureYouCuesSource } from './types';

// ============= Storage Interface =============

export interface IStorageProvider {
  // Image operations - returns URL and origin hash
  uploadImage(imageDataUrl: string): Promise<{ imageUrl: string; originHash: string }>;
  deleteImage(imageUrl: string): Promise<void>;
  
  // Encrypted image operations (Private Vault)
  getDecryptedImageUrl(encryptedUrl: string): Promise<string>;
  isEncryptedUrl(url: string): boolean;
  
  // Page CRUD
  createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page>;
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | null>;
  updatePage(id: string, updates: Partial<Page>): Promise<boolean>;
  deletePage(id: string): Promise<boolean>;
  
  // Capsule operations
  getCapsulePages(capsuleId: string): Promise<Page[]>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  createProject(name: string): Promise<Project | null>;
  
  // Duplicate detection
  checkDuplicate(ocrText: string, excludePageId?: string): Promise<Page | null>;
}

// ============= Lovable Cloud Implementation =============

export class LovableCloudStorage implements IStorageProvider {
  /**
   * Get the active device ID (respects demo mode)
   */
  private getDeviceUserId(): string {
    const id = getActiveDeviceId();
    if (!id) throw new Error('Device ID not initialized');
    return id;
  }

  /**
   * Get the user's REAL device ID (never demo ID) - for uploads
   */
  private getRealDeviceUserId(): string {
    const id = getDeviceId();
    if (!id) throw new Error('Device ID not initialized');
    return id;
  }

  /**
   * Upload image - encrypts with AES-256-GCM only if Private Vault is enabled
   * Also calculates SHA-256 origin hash for forensic verification
   * 
   * CRITICAL: Uses single-source bytes for both hash AND upload to ensure
   * forensic integrity - the hash matches exactly what's stored.
   */
  async uploadImage(imageDataUrl: string): Promise<{ imageUrl: string; originHash: string }> {
    const deviceUserId = this.getRealDeviceUserId();
    const timestamp = Date.now();
    
    // Decode data URL to raw bytes - this is our SINGLE SOURCE OF TRUTH
    // Both hash and upload use these exact bytes
    console.log('[Origin Hash] Decoding and hashing artifact...');
    const { hash: originHash, bytes, mimeType } = await hashAndDecodeDataUrl(imageDataUrl);
    console.log('[Origin Hash] Fingerprint:', originHash.substring(0, 16) + '...', 'MIME:', mimeType);
    
    // Check if Private Vault mode is enabled
    if (isPrivateVaultEnabled()) {
      // PRIVATE VAULT: Encrypt image before upload
      // Note: Hash is of PRE-encryption bytes (the original artifact)
      console.log('[Vault] Private Vault enabled - encrypting image...');
      const encryptedBase64 = await encryptImage(imageDataUrl);
      
      // Convert encrypted base64 to blob
      const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
      const encryptedBlob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
      
      // Store in encrypted folder with .enc extension
      const filename = `encrypted/${deviceUserId}/${timestamp}.enc`;
      
      const { data, error } = await supabase.storage
        .from('page-images')
        .upload(filename, encryptedBlob, {
          contentType: 'application/octet-stream',
          cacheControl: '3600',
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload encrypted image');
      }

      const { data: urlData } = supabase.storage
        .from('page-images')
        .getPublicUrl(data.path);

      console.log('[Vault] Encrypted image uploaded successfully');
      return { imageUrl: urlData.publicUrl, originHash };
    }
    
    // DEFAULT: Upload without encryption using the SAME bytes we hashed
    console.log('[Storage] Uploading image (unencrypted)...');
    
    // Determine file extension from MIME type
    const ext = mimeType.includes('png') ? 'png' : 
                mimeType.includes('webp') ? 'webp' : 
                mimeType.includes('gif') ? 'gif' : 'jpg';
    const filename = `${deviceUserId}/${timestamp}.${ext}`;
    
    // Create blob from the EXACT bytes we hashed (single source of truth)
    // Use Array.from to ensure compatibility with all TypeScript targets
    const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
    
    const { data, error } = await supabase.storage
      .from('page-images')
      .upload(filename, blob, {
        contentType: mimeType, // Use detected MIME, not hardcoded
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: urlData } = supabase.storage
      .from('page-images')
      .getPublicUrl(data.path);

    return { imageUrl: urlData.publicUrl, originHash };
  }

  /**
   * Decrypt and return a viewable image URL from an encrypted storage URL
   */
  async getDecryptedImageUrl(encryptedUrl: string): Promise<string> {
    try {
      // Fetch the encrypted blob
      const response = await fetch(encryptedUrl);
      if (!response.ok) throw new Error('Failed to fetch encrypted image');
      
      const encryptedBlob = await response.blob();
      const arrayBuffer = await encryptedBlob.arrayBuffer();
      
      // Convert to base64 for decryption
      const bytes = new Uint8Array(arrayBuffer);
      const encryptedBase64 = btoa(String.fromCharCode(...bytes));
      
      // Decrypt and return object URL
      const decryptedUrl = await decryptImage(encryptedBase64);
      console.log('[Vault] Image decrypted successfully');
      return decryptedUrl;
    } catch (e) {
      console.error('[Vault] Decryption failed:', e);
      throw new Error('Failed to decrypt image. Key may be missing or corrupted.');
    }
  }

  /**
   * Check if an image URL points to an encrypted file
   */
  isEncryptedUrl(url: string): boolean {
    return url.includes('/encrypted/') && url.endsWith('.enc');
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts.slice(-2).join('/');
      
      await supabase.storage
        .from('page-images')
        .remove([filename]);
    } catch (e) {
      console.warn('Failed to delete image from storage:', e);
    }
  }

  async createPage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
    // Cast to any to handle new columns not yet in generated types
    const insertData = {
      device_user_id: pageData.deviceUserId,
      writer_user_id: pageData.writerUserId || pageData.deviceUserId,
      image_url: pageData.imageUrl,
      thumbnail_uri: pageData.thumbnailUri || null,
      ocr_text: pageData.ocrText,
      ocr_tokens: pageData.ocrTokens || [],
      named_entities: pageData.namedEntities || [],
      summary: pageData.summary,
      one_line_hint: pageData.oneLineHint || null,
      tone: pageData.tone[0] || 'reflective',
      keywords: pageData.keywords,
      topic_labels: pageData.topicLabels || [],
      primary_keyword: pageData.primaryKeyword || null,
      user_note: pageData.userNote || null,
      sources: pageData.sources || [],
      highlights: pageData.highlights || [],
      capsule_id: pageData.capsuleId || null,
      page_order: pageData.pageOrder ?? 0,
      project_id: pageData.projectId || null,
      future_you_cue: pageData.futureYouCue || null,
      future_you_cues: pageData.futureYouCues || [],
      future_you_cues_source: pageData.futureYouCuesSource || { ai_prefill_version: null, user_edited: false },
      embedding_vector: pageData.embeddingVector || null,
      session_id: pageData.sessionId || null,
      capture_batch_id: pageData.captureBatchId || null,
      source_container_id: pageData.sourceContainerId || null,
      written_at: pageData.writtenAt?.toISOString() || null,
      // Origin Hash: SHA-256 fingerprint for forensic verification
      origin_hash_sha256: pageData.originHashSha256 || null,
      origin_hash_algo: 'sha256',
    } as Record<string, unknown>;

    const { data, error } = await supabase
      .from('pages')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error('Failed to save page');
    }

    return this.mapRowToPage(data);
  }

  async getPages(): Promise<Page[]> {
    // In demo mode, always use DEMO_DEVICE_ID - no fallback logic
    if (isDemoModeActive()) {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('device_user_id', DEMO_DEVICE_ID)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch demo pages error:', error);
        return [];
      }
      return (data || []).map(row => this.mapRowToPage(row));
    }

    // Normal mode: use user's real device ID with limited adoption logic
    let deviceUserId = getDeviceId();
    if (!deviceUserId) return [];

    const fetchByDeviceId = async (id: string) => {
      return supabase
        .from('pages')
        .select('*')
        .eq('device_user_id', id)
        .order('created_at', { ascending: false });
    };

    // First load pages for the current device ID
    let { data, error } = await fetchByDeviceId(deviceUserId);

    if (error) {
      console.error('Fetch pages error:', error);
      return [];
    }

    const currentCount = data?.length ?? 0;

    // If the current device id has few/no pages and another device has significantly more,
    // adopt the most-populated device_user_id and persist it.
    // This handles browser cache clears or new device sessions.
    // NOTE: never adopt DEMO_DEVICE_ID.
    if (currentCount < 5) {
      const { data: allRows, error: allError } = await supabase
        .from('pages')
        .select('device_user_id');

      if (!allError && allRows && allRows.length > 0) {
        const counts = new Map<string, number>();
        for (const row of allRows) {
          const id = row.device_user_id as string | null;
          if (!id || id === DEMO_DEVICE_ID) continue;
          counts.set(id, (counts.get(id) ?? 0) + 1);
        }

        let bestId: string | null = null;
        let maxCount = 0;
        for (const [id, count] of counts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            bestId = id;
          }
        }

        // Adopt if there's a device with 5+ more pages than current
        const shouldAdopt =
          !!bestId &&
          bestId !== deviceUserId &&
          maxCount >= 5 &&
          maxCount > currentCount;

        if (shouldAdopt) {
          console.log('[Storage] Adopting device ID:', bestId, 'with', maxCount, 'pages');
          deviceUserId = bestId!;
          setDeviceId(bestId!);

          const res = await fetchByDeviceId(bestId!);
          if (!res.error && res.data) {
            data = res.data;
          }
        }
      }
    }

    if (!data) return [];
    return data.map(row => this.mapRowToPage(row));
  }

  async getPage(id: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Fetch page error:', error);
      return null;
    }

    return this.mapRowToPage(data);
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<boolean> {
    // Always use the real device ID for updates - we're updating OUR pages, not demo pages
    // This fixes the bug where updates failed in demo mode because the query used DEMO_DEVICE_ID
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return false;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.userNote !== undefined) updateData.user_note = updates.userNote;
    if (updates.primaryKeyword !== undefined) updateData.primary_keyword = updates.primaryKeyword;
    if (updates.ocrText !== undefined) updateData.ocr_text = updates.ocrText;
    if (updates.sources !== undefined) updateData.sources = updates.sources;
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId || null;
    if (updates.futureYouCue !== undefined) updateData.future_you_cue = updates.futureYouCue || null;
    if (updates.futureYouCues !== undefined) updateData.future_you_cues = updates.futureYouCues;
    if (updates.futureYouCuesSource !== undefined) updateData.future_you_cues_source = updates.futureYouCuesSource;
    if (updates.ocrTokens !== undefined) updateData.ocr_tokens = updates.ocrTokens;
    if (updates.namedEntities !== undefined) updateData.named_entities = updates.namedEntities;
    if (updates.oneLineHint !== undefined) updateData.one_line_hint = updates.oneLineHint;
    if (updates.topicLabels !== undefined) updateData.topic_labels = updates.topicLabels;
    if (updates.highlights !== undefined) {
      console.log('[storage.updatePage] updating highlights', { id, highlights: updates.highlights });
      updateData.highlights = updates.highlights;
    }
    if (updates.embeddingVector !== undefined) updateData.embedding_vector = updates.embeddingVector;
    if (updates.tone !== undefined) updateData.tone = updates.tone;
    if (updates.writtenAt !== undefined) updateData.written_at = updates.writtenAt?.toISOString() || null;

    const { error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .eq('device_user_id', deviceUserId);

    if (error) {
      console.error('Update page error:', error);
      return false;
    }

    return true;
  }

  async deletePage(id: string): Promise<boolean> {
    // Always use the real device ID - we're deleting OUR pages, not demo pages
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return false;

    // First get the page to delete the image
    const page = await this.getPage(id);
    if (page) {
      await this.deleteImage(page.imageUrl);
    }

    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)
      .eq('device_user_id', deviceUserId);

    if (error) {
      console.error('Delete page error:', error);
      return false;
    }

    return true;
  }

  async getCapsulePages(capsuleId: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('capsule_id', capsuleId)
      .order('page_order', { ascending: true });

    if (error || !data) {
      console.error('Fetch capsule pages error:', error);
      return [];
    }

    return data.map(row => this.mapRowToPage(row));
  }

  async getProjects(): Promise<Project[]> {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('device_user_id', deviceUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch projects error:', error);
      return [];
    }

    return data.map(row => ({
      id: row.id,
      deviceUserId: row.device_user_id,
      name: row.name,
      createdAt: new Date(row.created_at),
    }));
  }

  async createProject(name: string): Promise<Project | null> {
    // Always use real device ID for creating projects (user's own data)
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        device_user_id: deviceUserId,
        name: name.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create project error:', error);
      return null;
    }

    return {
      id: data.id,
      deviceUserId: data.device_user_id,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  }

  async checkDuplicate(ocrText: string, excludePageId?: string): Promise<Page | null> {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId || !ocrText || ocrText.length < 50) return null;

    let query = supabase
      .from('pages')
      .select('*')
      .eq('device_user_id', deviceUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (excludePageId) {
      query = query.neq('id', excludePageId);
    }

    const { data, error } = await query;

    if (error || !data) return null;

    const normalizedNew = ocrText.slice(0, 200).toLowerCase().replace(/\s+/g, ' ').trim();

    for (const row of data) {
      if (!row.ocr_text) continue;
      const normalizedExisting = row.ocr_text.slice(0, 200).toLowerCase().replace(/\s+/g, ' ').trim();

      if (this.calculateSimilarity(normalizedNew, normalizedExisting) > 0.8) {
        return this.mapRowToPage(row);
      }
    }

    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;
    
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    const intersection = [...words1].filter(w => words2.has(w));
    
    return intersection.length / Math.max(words1.size, words2.size);
  }

  private mapRowToPage(row: Record<string, unknown>): Page {
    // Parse OCR tokens
    const ocrTokens: OCRToken[] = Array.isArray(row.ocr_tokens) 
      ? (row.ocr_tokens as unknown[]).map((t: unknown) => {
          const token = t as Record<string, unknown>;
          return {
            token: String(token.token || ''),
            confidence: Number(token.confidence || 0.8),
            bbox: token.bbox as OCRToken['bbox'],
          };
        })
      : [];

    // Parse named entities
    const namedEntities: NamedEntity[] = Array.isArray(row.named_entities)
      ? (row.named_entities as unknown[]).map((e: unknown) => {
          const entity = e as Record<string, unknown>;
          return {
            type: entity.type as NamedEntity['type'] || 'other',
            value: String(entity.value || ''),
            confidence: Number(entity.confidence || 0.8),
            span: entity.span as NamedEntity['span'],
          };
        })
      : [];

    // Parse future you cues source
    const futureYouCuesSource: FutureYouCuesSource = row.future_you_cues_source 
      ? (row.future_you_cues_source as FutureYouCuesSource)
      : { ai_prefill_version: null, user_edited: false };

    return {
      id: row.id as string,
      deviceUserId: row.device_user_id as string,
      writerUserId: (row.writer_user_id as string) || (row.device_user_id as string),
      imageUrl: row.image_url as string,
      thumbnailUri: (row.thumbnail_uri as string) || undefined,
      ocrText: (row.ocr_text as string) || '',
      ocrTokens,
      namedEntities,
      summary: (row.summary as string) || '',
      oneLineHint: (row.one_line_hint as string) || undefined,
      tone: row.tone ? [row.tone as string] : [],
      keywords: (row.keywords as string[]) || [],
      topicLabels: (row.topic_labels as string[]) || [],
      primaryKeyword: (row.primary_keyword as string) || undefined,
      userNote: (row.user_note as string) || undefined,
      sources: (row.sources as string[]) || [],
      highlights: (row.highlights as string[]) || [],
      confidenceScore: row.confidence_score ? Number(row.confidence_score) : undefined,
      capsuleId: (row.capsule_id as string) || undefined,
      pageOrder: (row.page_order as number) ?? 0,
      projectId: (row.project_id as string) || undefined,
      futureYouCue: (row.future_you_cue as string) || undefined,
      futureYouCues: (row.future_you_cues as string[]) || [],
      futureYouCuesSource,
      embeddingVector: row.embedding_vector as number[] || undefined,
      sessionId: (row.session_id as string) || undefined,
      captureBatchId: (row.capture_batch_id as string) || undefined,
      sourceContainerId: (row.source_container_id as string) || undefined,
      writtenAt: row.written_at ? new Date(row.written_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
      // Origin Hash: SHA-256 fingerprint for forensic verification
      originHashSha256: (row.origin_hash_sha256 as string) || undefined,
      originHashAlgo: (row.origin_hash_algo as 'sha256') || 'sha256',
    };
  }
}

// ============= Hetzner Vault Implementation =============

// Default IPFS gateway for resolving ipfs:// URLs
const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io/ipfs';

/**
 * Convert an ipfs:// URL to an HTTP gateway URL
 */
export function resolveIpfsUrl(url: string, gateway: string = DEFAULT_IPFS_GATEWAY): string {
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `${gateway}/${cid}`;
  }
  return url;
}

/**
 * Check if a URL is an IPFS URL (not encrypted, just needs gateway resolution)
 */
export function isIpfsUrl(url: string): boolean {
  return url.startsWith('ipfs://');
}

export class HetznerVaultStorage implements IStorageProvider {
  private proxyUrl: string;
  
  constructor(private config: { vaultEndpoint: string; ipfsGateway: string }) {
    // Use Supabase edge function as proxy to avoid CORS issues
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.proxyUrl = `${supabaseUrl}/functions/v1/hetzner-storage-proxy`;
  }

  private getDeviceUserId(): string {
    const id = getActiveDeviceId();
    if (!id) throw new Error('Device ID not initialized');
    return id;
  }

  private getRealDeviceUserId(): string {
    const id = getDeviceId();
    if (!id) throw new Error('Device ID not initialized');
    return id;
  }

  /**
   * Make a proxied request to Hetzner storage
   */
  private async proxyRequest(
    method: string,
    path: string,
    payload?: Record<string, unknown>,
    queryParams?: Record<string, string>
  ): Promise<Response> {
    console.log(`[Hetzner Storage] Proxying ${method} ${path}`);
    
    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, path, payload, queryParams }),
    });
    
    return response;
  }

  /**
   * Upload image to Hetzner Vault via IPFS storage.
   * Returns ipfs:// URL for the uploaded image and SHA-256 origin hash.
   */
  async uploadImage(imageDataUrl: string): Promise<{ imageUrl: string; originHash: string }> {
    const deviceUserId = this.getRealDeviceUserId();
    
    // Decode and hash using single source of truth
    console.log('[HetznerVaultStorage] Decoding and hashing artifact...');
    const { hash: originHash, mimeType } = await hashAndDecodeDataUrl(imageDataUrl);
    console.log('[HetznerVaultStorage] Fingerprint:', originHash.substring(0, 16) + '...', 'MIME:', mimeType);
    
    console.log('[HetznerVaultStorage] Uploading image to Hetzner Vault...');
    
    const response = await this.proxyRequest('POST', '/vault/images', {
      imageDataUrl,
      deviceUserId,
      encrypt: isPrivateVaultEnabled(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error || error.details || 'Failed to upload image';
      console.error('[HetznerVaultStorage] Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[HetznerVaultStorage] Image uploaded successfully:', data.imageUrl);
    return { imageUrl: data.imageUrl, originHash };
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const deviceUserId = this.getDeviceUserId();
    
    const response = await this.proxyRequest('DELETE', '/vault/images', {
      imageUrl,
      deviceUserId,
    });

    if (!response.ok) {
      console.warn('Failed to delete image from Hetzner storage');
    }
  }

  async getDecryptedImageUrl(encryptedUrl: string): Promise<string> {
    // For IPFS URLs that are NOT encrypted, just resolve via gateway
    if (encryptedUrl.startsWith('ipfs://') && !encryptedUrl.includes('.enc')) {
      return resolveIpfsUrl(encryptedUrl, this.config.ipfsGateway);
    }
    
    // For truly encrypted images, call the decrypt endpoint
    const deviceUserId = this.getDeviceUserId();
    
    const response = await this.proxyRequest('GET', '/vault/images/decrypt', undefined, {
      url: encryptedUrl,
      deviceUserId,
    });

    if (!response.ok) {
      throw new Error('Failed to decrypt image');
    }

    const data = await response.json();
    return data.decryptedDataUrl;
  }

  isEncryptedUrl(url: string): boolean {
    // Only truly encrypted URLs need decryption, IPFS URLs just need gateway resolution
    // For now, treat all IPFS URLs as needing resolution (isEncryptedUrl triggers loading)
    return url.startsWith('ipfs://');
  }
  
  /**
   * Resolve IPFS URL to HTTP gateway URL (for non-encrypted images)
   */
  resolveImageUrl(url: string): string {
    if (url.startsWith('ipfs://')) {
      return resolveIpfsUrl(url, this.config.ipfsGateway);
    }
    return url;
  }

  async createPage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
    // Hetzner backend uses SQLite which doesn't support array types
    // JSON-stringify array/object fields before sending
    const response = await this.proxyRequest('POST', '/vault/pages', {
      deviceUserId: pageData.deviceUserId,
      writerUserId: pageData.writerUserId || pageData.deviceUserId,
      imageUrl: pageData.imageUrl,
      thumbnailUri: pageData.thumbnailUri || null,
      ocrText: pageData.ocrText,
      ocrTokens: JSON.stringify(pageData.ocrTokens || []),
      namedEntities: JSON.stringify(pageData.namedEntities || []),
      summary: pageData.summary,
      oneLineHint: pageData.oneLineHint || null,
      tone: JSON.stringify(pageData.tone ? (Array.isArray(pageData.tone) ? pageData.tone : [pageData.tone]) : []),
      keywords: JSON.stringify(pageData.keywords || []),
      topicLabels: JSON.stringify(pageData.topicLabels || []),
      primaryKeyword: pageData.primaryKeyword || null,
      futureYouCues: JSON.stringify(pageData.futureYouCues || []),
      futureYouCuesSource: JSON.stringify(pageData.futureYouCuesSource || { ai_prefill_version: null, user_edited: false }),
      highlights: JSON.stringify(pageData.highlights || []),
      confidenceScore: pageData.confidenceScore || null,
      capsuleId: pageData.capsuleId || null,
      pageOrder: pageData.pageOrder ?? 0,
      projectId: pageData.projectId || null,
      sessionId: pageData.sessionId || null,
      captureBatchId: pageData.captureBatchId || null,
      writtenAt: pageData.writtenAt?.toISOString() || null,
      // Origin Hash (best-effort): allow Hetzner backend to persist if supported
      originHashSha256: pageData.originHashSha256 || null,
      originHashAlgo: pageData.originHashAlgo || 'sha256',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to create page');
    }

    const data = await response.json();
    
    // Hetzner backend only returns {id, createdAt, success} on create
    // Reconstruct the full Page object from pageData + response
    const createdAt = new Date(data.createdAt);
    return {
      ...pageData,
      id: data.id,
      createdAt,
      updatedAt: createdAt,
      // Ensure arrays are properly typed (pageData already has them)
      ocrTokens: pageData.ocrTokens || [],
      namedEntities: pageData.namedEntities || [],
      keywords: pageData.keywords || [],
      topicLabels: pageData.topicLabels || [],
      futureYouCues: pageData.futureYouCues || [],
      highlights: pageData.highlights || [],
      sources: pageData.sources || [],
      tone: pageData.tone || [],
    };
  }

  async getPages(): Promise<Page[]> {
    const deviceUserId = this.getDeviceUserId();
    
    const response = await this.proxyRequest('GET', '/vault/pages', undefined, {
      deviceUserId,
    });

    if (!response.ok) {
      console.error('Failed to fetch pages from Hetzner');
      return [];
    }

    const data = await response.json();
    return (data.pages || []).map((p: Record<string, unknown>) => this.mapApiResponseToPage(p));
  }

  async getPage(id: string): Promise<Page | null> {
    const deviceUserId = this.getDeviceUserId();
    
    const response = await this.proxyRequest('GET', `/vault/pages/${id}`, undefined, {
      deviceUserId,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return this.mapApiResponseToPage(data);
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<boolean> {
    // Always use the real device ID for updates - we're updating OUR pages, not demo pages
    const deviceUserId = this.getRealDeviceUserId();

    // Hetzner Codex Storage has had multiple PATCH payload shapes historically.
    // To be robust across deployments, we send BOTH:
    //  - flat fields (what the current production endpoint expects)
    //  - nested { updates: { ... } } (legacy contract)
    // Array/object fields are persisted as JSON strings in SQLite.

    const flatPayload: Record<string, unknown> = { deviceUserId };
    const nestedUpdates: Record<string, unknown> = {};

    const set = (key: string, flatValue: unknown, nestedValue: unknown = flatValue) => {
      flatPayload[key] = flatValue;
      nestedUpdates[key] = nestedValue;
    };

    if (updates.userNote !== undefined) set('userNote', updates.userNote);
    if (updates.primaryKeyword !== undefined) set('primaryKeyword', updates.primaryKeyword);
    if (updates.ocrText !== undefined) set('ocrText', updates.ocrText);
    if (updates.summary !== undefined) set('summary', updates.summary);

    if (updates.sources !== undefined) set('sources', JSON.stringify(updates.sources), updates.sources);
    if (updates.futureYouCues !== undefined) set('futureYouCues', JSON.stringify(updates.futureYouCues), updates.futureYouCues);
    if (updates.futureYouCuesSource !== undefined) set(
      'futureYouCuesSource',
      JSON.stringify(updates.futureYouCuesSource),
      updates.futureYouCuesSource
    );
    if (updates.highlights !== undefined) set('highlights', JSON.stringify(updates.highlights), updates.highlights);

    if (updates.tone !== undefined) {
      const toneArray = Array.isArray(updates.tone) ? updates.tone : [updates.tone].filter(Boolean);
      set('tone', JSON.stringify(toneArray), toneArray);
    }

    if (updates.projectId !== undefined) set('projectId', updates.projectId || null);
    if (updates.writtenAt !== undefined) {
      const iso = updates.writtenAt?.toISOString() || null;
      set('writtenAt', iso, iso);
    }

    const payload = {
      ...flatPayload,
      ...(Object.keys(nestedUpdates).length > 0 ? { updates: nestedUpdates } : {}),
    };

    const response = await this.proxyRequest('PATCH', `/vault/pages/${id}`, payload);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[HetznerVaultStorage] PATCH failed:', response.status, errorText);
    }

    return response.ok;
  }

  async deletePage(id: string): Promise<boolean> {
    // Always use the real device ID - we're deleting OUR pages, not demo pages
    const deviceUserId = this.getRealDeviceUserId();
    
    // First get the page to delete the image
    const page = await this.getPage(id);
    if (page) {
      await this.deleteImage(page.imageUrl);
    }

    const response = await this.proxyRequest('DELETE', `/vault/pages/${id}`, {
      deviceUserId,
    });

    return response.ok;
  }

  async getCapsulePages(capsuleId: string): Promise<Page[]> {
    const pages = await this.getPages();
    return pages.filter(p => p.capsuleId === capsuleId).sort((a, b) => (a.pageOrder || 0) - (b.pageOrder || 0));
  }

  async getProjects(): Promise<Project[]> {
    const deviceUserId = this.getDeviceUserId();
    
    try {
      const response = await this.proxyRequest('GET', '/vault/projects', undefined, {
        deviceUserId,
      });

      if (!response.ok) {
        // Projects endpoint might not exist on Hetzner - gracefully return empty
        console.log('[HetznerVaultStorage] Projects endpoint not available, returning empty list');
        return [];
      }

      const data = await response.json();
      return (data.projects || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        deviceUserId: p.deviceUserId as string,
        name: p.name as string,
        createdAt: new Date(p.createdAt as string),
      }));
    } catch (error) {
      // Gracefully handle missing endpoint
      console.log('[HetznerVaultStorage] Error fetching projects, returning empty list:', error);
      return [];
    }
  }

  async createProject(name: string): Promise<Project | null> {
    const deviceUserId = this.getRealDeviceUserId();
    
    try {
      const response = await this.proxyRequest('POST', '/vault/projects', {
        deviceUserId,
        name: name.trim(),
      });

      if (!response.ok) {
        console.log('[HetznerVaultStorage] Projects endpoint not available for creation');
        return null;
      }

      const data = await response.json();
      return {
        id: data.id,
        deviceUserId: data.deviceUserId,
        name: data.name,
        createdAt: new Date(data.createdAt),
      };
    } catch (error) {
      console.log('[HetznerVaultStorage] Error creating project:', error);
      return null;
    }
  }

  async checkDuplicate(ocrText: string, excludePageId?: string): Promise<Page | null> {
    const deviceUserId = this.getDeviceUserId();
    if (!ocrText || ocrText.length < 50) return null;

    try {
      const response = await this.proxyRequest('POST', '/vault/pages/check-duplicate', {
        deviceUserId,
        ocrText,
        excludePageId,
      });

      if (!response.ok) {
        // Duplicate check endpoint might not exist
        return null;
      }

      const data = await response.json();
      if (!data.duplicate) return null;
      
      return this.mapApiResponseToPage(data.duplicate);
    } catch (error) {
      console.log('[HetznerVaultStorage] Duplicate check not available:', error);
      return null;
    }
  }

  private mapApiResponseToPage(data: Record<string, unknown>): Page {
    // Helper to parse JSON strings or return arrays directly
    const parseJsonField = <T>(field: unknown, defaultValue: T): T => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field) as T;
        } catch {
          return defaultValue;
        }
      }
      return (field as T) || defaultValue;
    };

    const ocrTokensRaw = parseJsonField<unknown[]>(data.ocrTokens, []);
    const ocrTokens: OCRToken[] = ocrTokensRaw.map((t: unknown) => {
      const token = t as Record<string, unknown>;
      return {
        token: String(token.token || ''),
        confidence: Number(token.confidence || 0.8),
        bbox: token.bbox as OCRToken['bbox'],
      };
    });

    const namedEntitiesRaw = parseJsonField<unknown[]>(data.namedEntities, []);
    const namedEntities: NamedEntity[] = namedEntitiesRaw.map((e: unknown) => {
      const entity = e as Record<string, unknown>;
      return {
        type: entity.type as NamedEntity['type'] || 'other',
        value: String(entity.value || ''),
        confidence: Number(entity.confidence || 0.8),
        span: entity.span as NamedEntity['span'],
      };
    });

    const futureYouCuesSource: FutureYouCuesSource = parseJsonField(
      data.futureYouCuesSource,
      { ai_prefill_version: null, user_edited: false }
    );

    const toneRaw = parseJsonField<string[]>(data.tone, []);
    const tone = Array.isArray(toneRaw) ? toneRaw : [toneRaw].filter(Boolean);

    return {
      id: data.id as string,
      deviceUserId: data.deviceUserId as string,
      writerUserId: (data.writerUserId as string) || (data.deviceUserId as string),
      imageUrl: data.imageUrl as string,
      thumbnailUri: (data.thumbnailUri as string) || undefined,
      ocrText: (data.ocrText as string) || '',
      ocrTokens,
      namedEntities,
      summary: (data.summary as string) || '',
      oneLineHint: (data.oneLineHint as string) || undefined,
      tone,
      keywords: parseJsonField<string[]>(data.keywords, []),
      topicLabels: parseJsonField<string[]>(data.topicLabels, []),
      primaryKeyword: (data.primaryKeyword as string) || undefined,
      userNote: (data.userNote as string) || undefined,
      sources: parseJsonField<string[]>(data.sources, []),
      highlights: parseJsonField<string[]>(data.highlights, []),
      confidenceScore: data.confidenceScore ? Number(data.confidenceScore) : undefined,
      capsuleId: (data.capsuleId as string) || undefined,
      pageOrder: (data.pageOrder as number) ?? 0,
      projectId: (data.projectId as string) || undefined,
      futureYouCue: (data.futureYouCue as string) || undefined,
      futureYouCues: parseJsonField<string[]>(data.futureYouCues, []),
      futureYouCuesSource,
      embeddingVector: parseJsonField<number[]>(data.embeddingVector, undefined as unknown as number[]),
      sessionId: (data.sessionId as string) || undefined,
      captureBatchId: (data.captureBatchId as string) || undefined,
      sourceContainerId: (data.sourceContainerId as string) || undefined,
      writtenAt: data.writtenAt ? new Date(data.writtenAt as string) : undefined,
      createdAt: new Date(data.createdAt as string),
      updatedAt: data.updatedAt ? new Date(data.updatedAt as string) : undefined,
      // Origin Hash: SHA-256 fingerprint for forensic verification
      originHashSha256:
        (data.originHashSha256 as string) ||
        (data.origin_hash_sha256 as string) ||
        (data.origin_hash as string) ||
        undefined,
      originHashAlgo:
        ((data.originHashAlgo as 'sha256') || (data.origin_hash_algo as 'sha256') || 'sha256'),
    };
  }
}
