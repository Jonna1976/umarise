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

// ============= AI Suggested Cues Normalization =============

const STOPWORDS_SINGLE = new Set([
  'i', 'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'am', 'it', 'this', 'that', 'these', 'those',
  'you', 'we', 'me', 'my', 'our', 'your', 'their', 'they', 'he', 'she', 'him', 'her',
]);

const GENERIC_CUE_TERMS = new Set([
  'note', 'notes', 'idea', 'ideas', 'thought', 'thoughts', 'random', 'misc', 'important',
  'todo', 'list', 'plan', 'plans', 'meeting', 'stuff',
]);

function splitCueString(raw: string): string[] {
  // Handles: "a, b, c" or "a\n b" or "a | b" returned by some backends.
  return raw
    .split(/[\n,|]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dedupeCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
}

function isBadCue(cue: string): boolean {
  const trimmed = cue.trim();
  if (!trimmed) return true;

  // Single-character cues ("I") are useless because search ignores 1-char tokens.
  if (trimmed.length <= 1) return true;

  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const w = words[0];
    if (STOPWORDS_SINGLE.has(w)) return true;
    if (GENERIC_CUE_TERMS.has(w)) return true;
  }

  return false;
}

function tokenizeOcr(ocrText: string): string[] {
  // Keep simple + robust across languages; keeps apostrophes inside words.
  const matches = ocrText.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9']+/g);
  return matches ? matches : [];
}

function capPhraseTo30Chars(words: string[]): string {
  let end = words.length;
  while (end > 1) {
    const phrase = words.slice(0, end).join(' ');
    if (phrase.length <= 30) return phrase;
    end -= 1;
  }
  return words[0]?.slice(0, 30) || '';
}

function derivePhrasesFromOcr(ocrText: string, seedTerms: string[]): string[] {
  const tokens = tokenizeOcr(ocrText);
  if (tokens.length < 2) return [];

  const tokensLower = tokens.map((t) => t.toLowerCase());

  // Seeds: only keep meaningful single terms ("got", "umarise", etc.)
  const seeds = dedupeCaseInsensitive(
    seedTerms
      .flatMap((s) => s.toLowerCase().split(/\s+/))
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && !STOPWORDS_SINGLE.has(s) && !GENERIC_CUE_TERMS.has(s))
  );

  const phrases: string[] = [];

  // Try to build a short phrase around the first occurrence of each seed.
  for (const seed of seeds) {
    const idx = tokensLower.indexOf(seed);
    if (idx === -1) continue;

    // Include 1 token BEFORE the seed when possible (helps reconstruct "I got you there")
    const start = Math.max(0, idx - 1);
    const window = tokens.slice(start, start + 6); // up to 6 words
    const phrase = capPhraseTo30Chars(window);
    if (phrase && !isBadCue(phrase)) phrases.push(phrase);
  }

  // Fallback: first 4-6 words of OCR as a compact phrase.
  if (phrases.length === 0) {
    const window = tokens.slice(0, 6);
    const phrase = capPhraseTo30Chars(window);
    if (phrase && !isBadCue(phrase)) phrases.push(phrase);
  }

  return dedupeCaseInsensitive(phrases);
}

function extractSuggestedCuesFromAnalysis(analysis: PageAnalysisResult): string[] {
  const candidates: string[] = [];

  // 1) Known contracts
  if (Array.isArray(analysis.futureYouCues)) candidates.push(...analysis.futureYouCues);
  if (Array.isArray(analysis.suggested_cues)) candidates.push(...analysis.suggested_cues);

  // 2) Common alternates (Hetzner/legacy variants)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyA = analysis as any;
  if (Array.isArray(anyA.suggestedCues)) candidates.push(...anyA.suggestedCues);
  if (Array.isArray(anyA.future_you_cues)) candidates.push(...anyA.future_you_cues);

  // 3) Sometimes returned as a single string
  if (typeof anyA.futureYouCues === 'string') candidates.push(...splitCueString(anyA.futureYouCues));
  if (typeof anyA.suggested_cues === 'string') candidates.push(...splitCueString(anyA.suggested_cues));
  if (typeof anyA.suggestedCues === 'string') candidates.push(...splitCueString(anyA.suggestedCues));

  // Normalize strings that contain delimiters
  const normalized = candidates.flatMap((c) => (typeof c === 'string' ? splitCueString(c) : [])).map((c) => c.trim());
  const unique = dedupeCaseInsensitive(normalized);

  // Filter out obviously-bad cues
  const good = unique.filter((c) => !isBadCue(c));

  // If cues are low-quality (e.g., single letters like "I"), derive a better phrase from OCR.
  const ocr = analysis.ocrText || analysis.ocr_text || '';
  if (ocr && good.length < 3) {
    const derived = derivePhrasesFromOcr(ocr, unique);
    for (const d of derived) {
      if (good.length >= 3) break;
      if (!good.some((x) => x.toLowerCase() === d.toLowerCase())) good.push(d);
    }
  }

  return good.slice(0, 3);
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
    suggestedCues: extractSuggestedCuesFromAnalysis(analysis),
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
 * Get all pages in a capsule, enriched with sidecar origin hashes
 */
export async function getCapsulePages(capsuleId: string): Promise<Page[]> {
  const deviceUserId = getDeviceId();
  const storage = getStorageProvider();
  const pages = await storage.getCapsulePages(capsuleId);
  
  if (!deviceUserId || pages.length === 0) {
    return pages;
  }
  
  // Enrich pages missing origin hashes from sidecar table
  const pagesNeedingHash = pages.filter(p => !p.originHashSha256);
  
  if (pagesNeedingHash.length === 0) {
    return pages;
  }
  
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
    console.warn('[getCapsulePages] Sidecar hash lookup failed:', err);
  }
  
  return pages;
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

// ============= Herroepbaarheid (Revoke Association) =============

/**
 * Revoke association with an origin
 * 
 * This follows the Herroepbaarheid principle:
 * "An origin cannot be deleted. Association with an origin can be revoked."
 * 
 * The origin remains intact for forensic verification, but the user's
 * connection to it is severed. The page will no longer appear in the
 * user's codex, but the record exists for verification purposes.
 */
export async function revokeAssociation(pageId: string): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.revokeAssociation(pageId);
}

/**
 * Restore association with a previously released origin
 * 
 * This allows users to reconnect with an origin they previously released.
 * The origin record was never modified—only the user's association is restored.
 */
export async function restoreAssociation(pageId: string): Promise<boolean> {
  const storage = getStorageProvider();
  return storage.restoreAssociation(pageId);
}

/**
 * Get all pages with revoked associations for current device
 * 
 * These are origins the user has released but which still exist
 * as verifiable records. Users can view them read-only or restore association.
 */
export async function getRevokedPages(): Promise<Page[]> {
  const storage = getStorageProvider();
  return storage.getRevokedPages();
}
