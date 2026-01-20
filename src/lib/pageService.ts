/**
 * Page Service - High-level API for page operations
 * 
 * This service uses the abstraction layer so the underlying
 * backend (Lovable Cloud vs Hetzner) can be swapped without
 * changing any code that imports this service.
 * 
 * MIGRATION: When switching to Hetzner, only the abstraction
 * layer implementation needs to change. This file and all
 * components using it remain unchanged.
 */

import { getStorageProvider, getAIProvider } from './abstractions';
import { getDeviceId } from './deviceId';
import { supabase } from '@/integrations/supabase/client';
import type { Page, Project, CapsulePages, PageAnalysisResult } from './abstractions/types';

// Re-export types for backward compatibility
export type { Page, Project, CapsulePages };

// ============= Origin Hash Sidecar =============

/**
 * Persist origin hash in sidecar table (backend-agnostic)
 * This ensures origin hashes are stored even when the backend doesn't return them
 */
async function persistOriginHashSidecar(
  deviceUserId: string,
  pageId: string,
  imageUrl: string,
  originHash: string
): Promise<void> {
  try {
    const { error } = await supabase.from('page_origin_hashes').insert({
      device_user_id: deviceUserId,
      page_id: pageId,
      image_url: imageUrl,
      origin_hash_sha256: originHash,
      origin_hash_algo: 'sha256',
    });
    
    if (error) {
      // Ignore duplicate key errors (hash already exists)
      if (error.code === '23505') {
        console.log('[Origin Hash] Sidecar already exists for page:', pageId);
        return;
      }
      console.warn('[Origin Hash] Sidecar insert failed:', error.message);
    } else {
      console.log('[Origin Hash] Sidecar persisted for page:', pageId);
    }
  } catch (err) {
    console.warn('[Origin Hash] Sidecar insert failed (non-critical):', err);
  }
}

/**
 * Lookup origin hash from sidecar table
 */
export async function lookupOriginHash(
  pageId: string
): Promise<{ hash: string; algo: string } | null> {
  const deviceUserId = getDeviceId();
  if (!deviceUserId) return null;

  try {
    const { data, error } = await supabase
      .from('page_origin_hashes')
      .select('origin_hash_sha256, origin_hash_algo')
      .eq('device_user_id', deviceUserId)
      .eq('page_id', pageId)
      .maybeSingle();
    
    if (error) {
      console.warn('[Origin Hash] Sidecar lookup failed:', error.message);
      return null;
    }
    
    if (data) {
      return {
        hash: data.origin_hash_sha256,
        algo: data.origin_hash_algo || 'sha256',
      };
    }
  } catch (err) {
    console.warn('[Origin Hash] Sidecar lookup error:', err);
  }
  
  return null;
}

/**
 * Enrich page with origin hash from sidecar if missing
 */
async function enrichPageWithOriginHash(page: Page): Promise<Page> {
  if (page.originHashSha256) return page; // Already has hash
  
  const sidecarHash = await lookupOriginHash(page.id);
  if (sidecarHash) {
    return {
      ...page,
      originHashSha256: sidecarHash.hash,
      originHashAlgo: sidecarHash.algo as 'sha256',
    };
  }
  
  return page;
}

// ============= Helper Functions =============

function extractBase64(dataUrl: string): string {
  const base64Match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (base64Match) {
    return base64Match[1];
  }
  return dataUrl;
}

// ============= Page Operations =============

/**
 * Create a new page with image upload and AI analysis
 * Returns the page and suggested cues for the FutureYouCue prompt
 */
export async function createPage(
  imageDataUrl: string, 
  capsuleId?: string, 
  pageOrder?: number
): Promise<{ page: Page; suggestedCues: string[] }> {
  const deviceUserId = getDeviceId();
  if (!deviceUserId) {
    throw new Error('Device ID not initialized');
  }

  const storage = getStorageProvider();
  const ai = getAIProvider();

  // Step 1: Analyze with AI
  console.log('Analyzing image with AI...');
  const base64 = extractBase64(imageDataUrl);
  const analysis = await ai.analyzePage(base64) as PageAnalysisResult;
  console.log('Analysis complete:', analysis);

  // Step 2: Upload image to storage (also calculates SHA-256 origin hash)
  console.log('Uploading image...');
  const { imageUrl, originHash } = await storage.uploadImage(imageDataUrl);
  console.log('Image uploaded:', imageUrl);
  console.log('Origin hash calculated:', originHash.substring(0, 16) + '...');

  // Step 3: Parse tone - handle both array (new contract) and string (legacy)
  let toneArray: string[];
  if (Array.isArray(analysis.tone)) {
    toneArray = analysis.tone.map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
  } else if (typeof analysis.tone === 'string') {
    toneArray = analysis.tone.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
  } else {
    toneArray = ['reflective'];
  }

  // Step 4: Create page in storage (includes origin hash)
  // Support both camelCase (new contract) and snake_case (legacy) field names
  const page = await storage.createPage({
    deviceUserId,
    writerUserId: deviceUserId,
    imageUrl,
    ocrText: analysis.ocrText || analysis.ocr_text,
    ocrTokens: analysis.ocrTokens || analysis.ocr_tokens || [],
    namedEntities: analysis.namedEntities || analysis.named_entities || [],
    summary: analysis.summary,
    oneLineHint: analysis.oneLineHint || analysis.one_line_hint,
    tone: toneArray.length > 0 ? toneArray : ['reflective'],
    keywords: analysis.keywords,
    topicLabels: analysis.topicLabels || analysis.topic_labels || [],
    highlights: analysis.highlights || [],
    capsuleId: capsuleId || undefined,
    pageOrder: pageOrder ?? 0,
    futureYouCues: [], // Will be set after user confirmation
    futureYouCuesSource: { ai_prefill_version: 'v1', user_edited: false },
    originHashSha256: originHash, // SHA-256 fingerprint for forensic verification
    isTrashed: false, // New pages are never trashed
  });

  // Persist origin hash in sidecar table (backend-agnostic, immutable)
  if (originHash) {
    await persistOriginHashSidecar(deviceUserId, page.id, imageUrl, originHash);
  }

  return { 
    page, 
    suggestedCues: analysis.futureYouCues || analysis.suggested_cues || [] 
  };
}

/**
 * Update page with confirmed Future You Cues
 */
export async function confirmFutureYouCues(
  pageId: string,
  cues: string[],
  userEdited: boolean,
  writtenAt?: Date
): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.updatePage(pageId, {
    futureYouCues: cues.slice(0, 5),
    futureYouCuesSource: { ai_prefill_version: 'v1', user_edited: userEdited },
    writtenAt,
  });
}

/**
 * Add a page to an existing capsule
 */
export async function addToCapsule(imageDataUrl: string, capsuleId: string): Promise<{ page: Page; suggestedCues: string[] }> {
  const storage = getStorageProvider();
  
  // Get the current max page_order for this capsule
  const existingPages = await storage.getCapsulePages(capsuleId);
  const maxOrder = existingPages.reduce((max, p) => Math.max(max, p.pageOrder ?? 0), -1);
  const nextOrder = maxOrder + 1;

  return createPage(imageDataUrl, capsuleId, nextOrder);
}

/**
 * Create a capsule from multiple images - PARALLEL processing
 */
export async function createCapsule(
  imageDataUrls: string[], 
  onProgress?: (completed: number, total: number) => void
): Promise<{ pages: Page[]; suggestedCuesPerPage: string[][] }> {
  if (imageDataUrls.length === 0) {
    throw new Error('No images provided');
  }

  const capsuleId = crypto.randomUUID();
  let completed = 0;

  const pagePromises = imageDataUrls.map(async (imageDataUrl, index) => {
    console.log(`Starting processing of image ${index + 1}...`);
    const result = await createPage(imageDataUrl, capsuleId, index);
    completed++;
    onProgress?.(completed, imageDataUrls.length);
    console.log(`Completed image ${index + 1} of ${imageDataUrls.length}`);
    return { ...result, order: index };
  });

  const results = await Promise.all(pagePromises);
  results.sort((a, b) => a.order - b.order);
  
  return {
    pages: results.map(r => r.page),
    suggestedCuesPerPage: results.map(r => r.suggestedCues),
  };
}

/**
 * Get all pages for current device, enriched with sidecar origin hashes
 */
export async function getPages(): Promise<Page[]> {
  const deviceUserId = getDeviceId();
  if (!deviceUserId) {
    return [];
  }

  const storage = getStorageProvider();
  const pages = await storage.getPages();
  
  // Batch lookup of origin hashes from sidecar for pages missing them
  const pagesNeedingHash = pages.filter(p => !p.originHashSha256);
  
  if (pagesNeedingHash.length > 0) {
    try {
      const pageIds = pagesNeedingHash.map(p => p.id);
      const { data: sidecarHashes } = await supabase
        .from('page_origin_hashes')
        .select('page_id, origin_hash_sha256, origin_hash_algo')
        .eq('device_user_id', deviceUserId)
        .in('page_id', pageIds);
      
      if (sidecarHashes && sidecarHashes.length > 0) {
        const hashMap = new Map(sidecarHashes.map(h => [h.page_id, h]));
        
        return pages.map(page => {
          if (page.originHashSha256) return page;
          const sidecar = hashMap.get(page.id);
          if (sidecar) {
            return {
              ...page,
              originHashSha256: sidecar.origin_hash_sha256,
              originHashAlgo: sidecar.origin_hash_algo as 'sha256',
            };
          }
          return page;
        });
      }
    } catch (err) {
      console.warn('[getPages] Sidecar hash lookup failed:', err);
    }
  }
  
  return pages;
}

/**
 * Get pages grouped by capsule
 */
export function groupPagesByCapsule(pages: Page[]): { standalone: Page[]; capsules: CapsulePages[] } {
  const standalone: Page[] = [];
  const capsuleMap = new Map<string, Page[]>();

  for (const page of pages) {
    if (page.capsuleId) {
      const existing = capsuleMap.get(page.capsuleId) || [];
      existing.push(page);
      capsuleMap.set(page.capsuleId, existing);
    } else {
      standalone.push(page);
    }
  }

  const capsules: CapsulePages[] = [];
  for (const [capsuleId, capsulePages] of capsuleMap) {
    capsulePages.sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0));
    capsules.push({ capsuleId, pages: capsulePages });
  }

  return { standalone, capsules };
}

/**
 * Get single page by ID
 */
export async function getPage(id: string): Promise<Page | null> {
  const storage = getStorageProvider();
  const page = await storage.getPage(id);
  if (!page) return null;
  
  // Enrich with sidecar hash if missing
  return enrichPageWithOriginHash(page);
}

/**
 * Get all pages in a capsule
 */
export async function getCapsulePages(capsuleId: string): Promise<Page[]> {
  const storage = getStorageProvider();
  return storage.getCapsulePages(capsuleId);
}

/**
 * Delete a page
 */
export async function deletePage(id: string): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.deletePage(id);
}

/**
 * Update page with user note, primary keyword, OCR text, sources, project, and future you cue
 */
export async function updatePage(
  id: string, 
  updates: { 
    userNote?: string; 
    primaryKeyword?: string; 
    ocrText?: string; 
    sources?: string[]; 
    projectId?: string; 
    futureYouCue?: string;
    futureYouCues?: string[];
    writtenAt?: Date;
    highlights?: string[];
    tone?: string[];
  }
): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.updatePage(id, updates);
}

/**
 * Mark all pages in a capsule as external source (influence)
 */
export async function markCapsuleAsInfluence(capsuleId: string, isInfluence: boolean): Promise<boolean> {
  const deviceUserId = getDeviceId();
  if (!deviceUserId) {
    return false;
  }

  const storage = getStorageProvider();
  const pages = await storage.getCapsulePages(capsuleId);
  
  const sources = isInfluence ? ['external-source'] : [];
  
  const results = await Promise.all(
    pages.map(page => storage.updatePage(page.id, { sources }))
  );

  return results.every(Boolean);
}

/**
 * Check for duplicate image by comparing OCR text similarity
 */
export async function checkDuplicate(ocrText: string, excludePageId?: string): Promise<Page | null> {
  const storage = getStorageProvider();
  return storage.checkDuplicate(ocrText, excludePageId);
}

/**
 * Get all projects for current device
 */
export async function getProjects(): Promise<Project[]> {
  const storage = getStorageProvider();
  return storage.getProjects();
}

/**
 * Create a new project
 */
export async function createProject(name: string): Promise<Project | null> {
  const storage = getStorageProvider();
  return storage.createProject(name);
}

// ============= Trash Operations (Cross-Device Synced) =============

/**
 * Move a page to trash (soft delete - synced across devices)
 */
export async function moveToTrash(pageId: string): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.moveToTrash(pageId);
}

/**
 * Restore a page from trash
 */
export async function restoreFromTrash(pageId: string): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.restoreFromTrash(pageId);
}

/**
 * Get all pages currently in trash
 */
export async function getTrashedPages(): Promise<Page[]> {
  const storage = getStorageProvider();
  return storage.getTrashedPages();
}
