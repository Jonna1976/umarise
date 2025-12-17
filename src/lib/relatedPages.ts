/**
 * Related Pages - Connection Layer (B)
 * 
 * Finds related pages based on shared cues, entities, and keywords.
 * Compounding value = more pages → more connections → richer memory.
 * 
 * Ranking priority (transparent, no black box):
 * 1. Shared Future You Cues (highest weight - user intent)
 * 2. Shared Named Entities (people, orgs, places)
 * 3. Shared Keywords (AI-extracted topics)
 */

import type { Page, NamedEntity } from './abstractions/types';

export interface RelatedReason {
  type: 'cue' | 'entity' | 'keyword';
  value: string;
}

export interface RelatedPage {
  page: Page;
  score: number;
  reasons: RelatedReason[];
  primaryReason: RelatedReason;
}

// Weights for ranking (transparent, adjustable)
const WEIGHTS = {
  cue: 10,      // Shared cue = highest signal (user's retrieval intent)
  entity: 5,    // Shared entity = strong connection (people/places)
  keyword: 2,   // Shared keyword = topical overlap
};

/**
 * Find pages related to a given page
 * Returns max 5 related pages with reasons
 */
export function findRelatedPages(
  currentPage: Page,
  allPages: Page[],
  maxResults: number = 5
): RelatedPage[] {
  const currentCues = new Set(
    (currentPage.futureYouCues || []).map(c => c.toLowerCase().trim())
  );
  
  const currentEntities = new Set(
    (currentPage.namedEntities || [])
      .filter(e => e.type === 'person' || e.type === 'organization' || e.type === 'location')
      .map(e => e.value.toLowerCase().trim())
  );
  
  const currentKeywords = new Set(
    (currentPage.keywords || []).map(k => k.toLowerCase().trim())
  );

  const results: RelatedPage[] = [];

  for (const page of allPages) {
    // Skip the current page itself
    if (page.id === currentPage.id) continue;
    
    // Skip pages in the same capsule (they're already grouped)
    if (currentPage.capsuleId && page.capsuleId === currentPage.capsuleId) continue;

    const reasons: RelatedReason[] = [];
    let score = 0;

    // Check shared cues (highest weight)
    const pageCues = (page.futureYouCues || []).map(c => c.toLowerCase().trim());
    for (const cue of pageCues) {
      if (currentCues.has(cue)) {
        reasons.push({ type: 'cue', value: cue });
        score += WEIGHTS.cue;
      }
    }

    // Check shared entities
    const pageEntities = (page.namedEntities || [])
      .filter(e => e.type === 'person' || e.type === 'organization' || e.type === 'location')
      .map(e => e.value.toLowerCase().trim());
    
    for (const entity of pageEntities) {
      if (currentEntities.has(entity)) {
        // Avoid duplicate reasons
        if (!reasons.some(r => r.type === 'entity' && r.value === entity)) {
          reasons.push({ type: 'entity', value: entity });
          score += WEIGHTS.entity;
        }
      }
    }

    // Check shared keywords
    const pageKeywords = (page.keywords || []).map(k => k.toLowerCase().trim());
    for (const keyword of pageKeywords) {
      if (currentKeywords.has(keyword)) {
        // Avoid duplicate reasons
        if (!reasons.some(r => r.type === 'keyword' && r.value === keyword)) {
          reasons.push({ type: 'keyword', value: keyword });
          score += WEIGHTS.keyword;
        }
      }
    }

    // Only include if there's at least one connection
    if (reasons.length > 0 && score > 0) {
      // Sort reasons by weight (cue > entity > keyword)
      reasons.sort((a, b) => WEIGHTS[b.type] - WEIGHTS[a.type]);
      
      results.push({
        page,
        score,
        reasons,
        primaryReason: reasons[0],
      });
    }
  }

  // Sort by score descending, then by most recent
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.page.createdAt.getTime() - a.page.createdAt.getTime();
  });

  return results.slice(0, maxResults);
}

/**
 * Format reason for display
 */
export function formatReason(reason: RelatedReason): string {
  switch (reason.type) {
    case 'cue':
      return `Shared cue: ${reason.value}`;
    case 'entity':
      return `Shared name: ${reason.value}`;
    case 'keyword':
      return `Shared topic: ${reason.value}`;
  }
}

/**
 * Get icon name for reason type
 */
export function getReasonIcon(type: RelatedReason['type']): 'tag' | 'user' | 'hash' {
  switch (type) {
    case 'cue':
      return 'tag';
    case 'entity':
      return 'user';
    case 'keyword':
      return 'hash';
  }
}
