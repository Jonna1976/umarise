/**
 * Umarise Abstraction Layer - Storage Interface
 * 
 * Defines the contract for all storage operations.
 * Current implementation: Lovable Cloud (Supabase)
 * Future implementation: Hetzner (Vault + IPFS)
 * 
 * PRIVATE VAULT: Images are encrypted client-side with AES-256-GCM
 * before upload. Keys stay on device - zero-knowledge architecture.
 */

import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getActiveDeviceId, setDeviceId, isDemoModeActive, DEMO_DEVICE_ID } from '../deviceId';
import { encryptImage, decryptImage, isPrivateVaultEnabled } from '../crypto';
import type { Page, Project, OCRToken, NamedEntity, FutureYouCuesSource } from './types';

// ============= Storage Interface =============

export interface IStorageProvider {
  // Image operations
  uploadImage(imageDataUrl: string): Promise<string>;
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
   */
  async uploadImage(imageDataUrl: string): Promise<string> {
    const deviceUserId = this.getRealDeviceUserId();
    const timestamp = Date.now();
    
    // Check if Private Vault mode is enabled
    if (isPrivateVaultEnabled()) {
      // PRIVATE VAULT: Encrypt image before upload
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
      return urlData.publicUrl;
    }
    
    // DEFAULT: Upload without encryption (standard Supabase storage)
    console.log('[Storage] Uploading image (unencrypted)...');
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const filename = `${deviceUserId}/${timestamp}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('page-images')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: urlData } = supabase.storage
      .from('page-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
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

    // If the current device id is clearly not the "main" one (e.g. older test ID with just a few pages),
    // adopt the most-populated device_user_id and persist it.
    // NOTE: never adopt DEMO_DEVICE_ID.
    if (currentCount < 10) {
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

        const shouldAdopt =
          !!bestId &&
          bestId !== deviceUserId &&
          maxCount >= Math.max(10, currentCount + 10);

        if (shouldAdopt) {
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
    const deviceUserId = getActiveDeviceId();
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
    const deviceUserId = getActiveDeviceId();
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
    };
  }
}

// ============= Hetzner Vault Implementation =============

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

  async uploadImage(imageDataUrl: string): Promise<string> {
    const deviceUserId = this.getRealDeviceUserId();
    
    const response = await this.proxyRequest('POST', '/vault/images', {
      imageDataUrl,
      deviceUserId,
      encrypt: true,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
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
    // Hetzner vault stores everything encrypted via IPFS
    return url.startsWith('ipfs://');
  }

  async createPage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
    const response = await this.proxyRequest('POST', '/vault/pages', {
      deviceUserId: pageData.deviceUserId,
      writerUserId: pageData.writerUserId || pageData.deviceUserId,
      imageUrl: pageData.imageUrl,
      thumbnailUri: pageData.thumbnailUri || null,
      ocrText: pageData.ocrText,
      ocrTokens: pageData.ocrTokens || [],
      namedEntities: pageData.namedEntities || [],
      summary: pageData.summary,
      oneLineHint: pageData.oneLineHint || null,
      tone: pageData.tone,
      keywords: pageData.keywords,
      topicLabels: pageData.topicLabels || [],
      primaryKeyword: pageData.primaryKeyword || null,
      futureYouCues: pageData.futureYouCues || [],
      futureYouCuesSource: pageData.futureYouCuesSource || { ai_prefill_version: null, user_edited: false },
      highlights: pageData.highlights || [],
      confidenceScore: pageData.confidenceScore || null,
      capsuleId: pageData.capsuleId || null,
      pageOrder: pageData.pageOrder ?? 0,
      projectId: pageData.projectId || null,
      sessionId: pageData.sessionId || null,
      captureBatchId: pageData.captureBatchId || null,
      writtenAt: pageData.writtenAt?.toISOString() || null,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to create page');
    }

    const data = await response.json();
    return this.mapApiResponseToPage(data);
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
    const deviceUserId = this.getDeviceUserId();
    
    const apiUpdates: Record<string, unknown> = {};
    if (updates.userNote !== undefined) apiUpdates.userNote = updates.userNote;
    if (updates.primaryKeyword !== undefined) apiUpdates.primaryKeyword = updates.primaryKeyword;
    if (updates.ocrText !== undefined) apiUpdates.ocrText = updates.ocrText;
    if (updates.sources !== undefined) apiUpdates.sources = updates.sources;
    if (updates.projectId !== undefined) apiUpdates.projectId = updates.projectId || null;
    if (updates.futureYouCues !== undefined) apiUpdates.futureYouCues = updates.futureYouCues;
    if (updates.futureYouCuesSource !== undefined) apiUpdates.futureYouCuesSource = updates.futureYouCuesSource;
    if (updates.highlights !== undefined) apiUpdates.highlights = updates.highlights;
    if (updates.tone !== undefined) apiUpdates.tone = updates.tone;
    if (updates.writtenAt !== undefined) apiUpdates.writtenAt = updates.writtenAt?.toISOString() || null;
    if (updates.summary !== undefined) apiUpdates.summary = updates.summary;

    const response = await this.proxyRequest('PATCH', `/vault/pages/${id}`, {
      deviceUserId,
      updates: apiUpdates,
    });

    return response.ok;
  }

  async deletePage(id: string): Promise<boolean> {
    const deviceUserId = this.getDeviceUserId();
    
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
    
    const response = await this.proxyRequest('GET', '/vault/projects', undefined, {
      deviceUserId,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.projects || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      deviceUserId: p.deviceUserId as string,
      name: p.name as string,
      createdAt: new Date(p.createdAt as string),
    }));
  }

  async createProject(name: string): Promise<Project | null> {
    const deviceUserId = this.getRealDeviceUserId();
    
    const response = await this.proxyRequest('POST', '/vault/projects', {
      deviceUserId,
      name: name.trim(),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      deviceUserId: data.deviceUserId,
      name: data.name,
      createdAt: new Date(data.createdAt),
    };
  }

  async checkDuplicate(ocrText: string, excludePageId?: string): Promise<Page | null> {
    const deviceUserId = this.getDeviceUserId();
    if (!ocrText || ocrText.length < 50) return null;

    const response = await this.proxyRequest('POST', '/vault/pages/check-duplicate', {
      deviceUserId,
      ocrText,
      excludePageId,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.duplicate) return null;
    
    return this.mapApiResponseToPage(data.duplicate);
  }

  private mapApiResponseToPage(data: Record<string, unknown>): Page {
    const ocrTokens: OCRToken[] = Array.isArray(data.ocrTokens)
      ? (data.ocrTokens as unknown[]).map((t: unknown) => {
          const token = t as Record<string, unknown>;
          return {
            token: String(token.token || ''),
            confidence: Number(token.confidence || 0.8),
            bbox: token.bbox as OCRToken['bbox'],
          };
        })
      : [];

    const namedEntities: NamedEntity[] = Array.isArray(data.namedEntities)
      ? (data.namedEntities as unknown[]).map((e: unknown) => {
          const entity = e as Record<string, unknown>;
          return {
            type: entity.type as NamedEntity['type'] || 'other',
            value: String(entity.value || ''),
            confidence: Number(entity.confidence || 0.8),
            span: entity.span as NamedEntity['span'],
          };
        })
      : [];

    const futureYouCuesSource: FutureYouCuesSource = data.futureYouCuesSource
      ? (data.futureYouCuesSource as FutureYouCuesSource)
      : { ai_prefill_version: null, user_edited: false };

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
      tone: Array.isArray(data.tone) ? data.tone as string[] : [data.tone as string].filter(Boolean),
      keywords: (data.keywords as string[]) || [],
      topicLabels: (data.topicLabels as string[]) || [],
      primaryKeyword: (data.primaryKeyword as string) || undefined,
      userNote: (data.userNote as string) || undefined,
      sources: (data.sources as string[]) || [],
      highlights: (data.highlights as string[]) || [],
      confidenceScore: data.confidenceScore ? Number(data.confidenceScore) : undefined,
      capsuleId: (data.capsuleId as string) || undefined,
      pageOrder: (data.pageOrder as number) ?? 0,
      projectId: (data.projectId as string) || undefined,
      futureYouCue: (data.futureYouCue as string) || undefined,
      futureYouCues: (data.futureYouCues as string[]) || [],
      futureYouCuesSource,
      embeddingVector: data.embeddingVector as number[] || undefined,
      sessionId: (data.sessionId as string) || undefined,
      captureBatchId: (data.captureBatchId as string) || undefined,
      sourceContainerId: (data.sourceContainerId as string) || undefined,
      writtenAt: data.writtenAt ? new Date(data.writtenAt as string) : undefined,
      createdAt: new Date(data.createdAt as string),
      updatedAt: data.updatedAt ? new Date(data.updatedAt as string) : undefined,
    };
  }
}
