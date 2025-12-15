/**
 * Umarise Abstraction Layer - Storage Interface
 * 
 * Defines the contract for all storage operations.
 * Current implementation: Lovable Cloud (Supabase)
 * Future implementation: Hetzner (Vault + IPFS)
 */

import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, setDeviceId } from '../deviceId';
import type { Page, Project, OCRToken, NamedEntity, FutureYouCuesSource } from './types';

// ============= Storage Interface =============

export interface IStorageProvider {
  // Image operations
  uploadImage(imageDataUrl: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
  
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
  checkDuplicate(ocrText: string): Promise<Page | null>;
}

// ============= Lovable Cloud Implementation =============

export class LovableCloudStorage implements IStorageProvider {
  private getDeviceUserId(): string {
    const id = getDeviceId();
    if (!id) throw new Error('Device ID not initialized');
    return id;
  }

  async uploadImage(imageDataUrl: string): Promise<string> {
    const deviceUserId = this.getDeviceUserId();
    
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${deviceUserId}/${timestamp}.jpg`;
    
    // Upload to storage
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('page-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
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
    let deviceUserId = getDeviceId();
    if (!deviceUserId) return [];

    // First try to load pages for the current device ID
    let { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('device_user_id', deviceUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch pages error:', error);
      return [];
    }

    // If no pages found, try to adopt the device_user_id with the most pages
    if (!data || data.length === 0) {
      const { data: allRows, error: allError } = await supabase
        .from('pages')
        .select('device_user_id');

      if (!allError && allRows && allRows.length > 0) {
        const counts = new Map<string, number>();
        for (const row of allRows) {
          const id = row.device_user_id as string | null;
          if (!id) continue;
          counts.set(id, (counts.get(id) ?? 0) + 1);
        }

        let fallbackId: string | null = null;
        let maxCount = 0;
        for (const [id, count] of counts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            fallbackId = id;
          }
        }

        if (fallbackId) {
          deviceUserId = fallbackId;
          // Persist this so future sessions keep using the same codex identity
          setDeviceId(fallbackId);

          const { data: fallbackData, error: fallbackError } = await supabase
            .from('pages')
            .select('*')
            .eq('device_user_id', fallbackId)
            .order('created_at', { ascending: false });

          if (!fallbackError && fallbackData) {
            data = fallbackData;
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
    if (updates.highlights !== undefined) updateData.highlights = updates.highlights;
    if (updates.embeddingVector !== undefined) updateData.embedding_vector = updates.embeddingVector;
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
    const deviceUserId = getDeviceId();
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

  async checkDuplicate(ocrText: string): Promise<Page | null> {
    const deviceUserId = getDeviceId();
    if (!deviceUserId || !ocrText || ocrText.length < 50) return null;

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('device_user_id', deviceUserId)
      .order('created_at', { ascending: false })
      .limit(20);

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

// ============= Future Hetzner Implementation (Placeholder) =============

export class HetznerVaultStorage implements IStorageProvider {
  constructor(private config: { vaultEndpoint: string; ipfsGateway: string }) {}

  async uploadImage(_imageDataUrl: string): Promise<string> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async deleteImage(_imageUrl: string): Promise<void> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async createPage(_page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async getPages(): Promise<Page[]> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async getPage(_id: string): Promise<Page | null> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async updatePage(_id: string, _updates: Partial<Page>): Promise<boolean> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async deletePage(_id: string): Promise<boolean> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async getCapsulePages(_capsuleId: string): Promise<Page[]> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async getProjects(): Promise<Project[]> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async createProject(_name: string): Promise<Project | null> {
    throw new Error('Hetzner storage not yet implemented');
  }

  async checkDuplicate(_ocrText: string): Promise<Page | null> {
    throw new Error('Hetzner storage not yet implemented');
  }
}
