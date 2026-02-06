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

import { getStorageProvider } from './abstractions';
import { getDeviceId } from './deviceId';
import { supabase } from '@/integrations/supabase/client';
import type { Page, Project, CapsulePages } from './abstractions/types';

// Re-export types for backward compatibility
export type { Page, Project, CapsulePages };

// ============= Origin Hash Sidecar =============

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

// ============= Page Operations =============

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
