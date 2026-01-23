/**
 * Origin Link & Proof Bundle utilities
 * 
 * Provides:
 * - Origin Link: Deeplink to specific origin with verification capability
 * - Proof Bundle: Standalone JSON proof for external verification
 */

import type { Page } from './abstractions/types';

/**
 * Base URL for origin links (deployed app)
 */
const getBaseUrl = (): string => {
  // Use published URL if available, otherwise current origin
  if (typeof window !== 'undefined') {
    // In production, use the actual deployed URL
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return window.location.origin;
    }
    // Use the published URL
    return 'https://umarise.lovable.app';
  }
  return 'https://umarise.lovable.app';
};

/**
 * Origin Link structure
 */
export interface OriginLink {
  url: string;
  originId: string;
  hash: string | null;
}

/**
 * Generate a shareable Origin Link for a page
 * Format: {baseUrl}/origin/{originId}?verify={hash}
 */
export function generateOriginLink(page: Page): OriginLink {
  const baseUrl = getBaseUrl();
  const hash = page.originHashSha256 || null;
  
  let url = `${baseUrl}/origin/${page.id}`;
  if (hash) {
    url += `?verify=${hash}`;
  }
  
  return {
    url,
    originId: page.id,
    hash,
  };
}

/**
 * Copy Origin Link to clipboard
 * Returns true if successful
 */
export async function copyOriginLink(page: Page): Promise<boolean> {
  const link = generateOriginLink(page);
  
  try {
    await navigator.clipboard.writeText(link.url);
    return true;
  } catch (error) {
    console.error('[OriginLink] Failed to copy:', error);
    return false;
  }
}

/**
 * Proof Bundle structure - standalone verification document
 * Can be used by external systems to verify origin without Umarise access
 */
export interface ProofBundle {
  // Meta
  version: '1.0';
  generatedAt: string;
  generator: 'umarise-origin-layer';
  
  // Origin identification
  originId: string;
  deviceUserId: string;
  
  // Cryptographic proof
  originHashSha256: string | null;
  originHashAlgo: 'sha256' | null;
  hashStatus: 'verified' | 'legacy_no_hash';
  
  // Temporal proof
  capturedAt: string; // ISO 8601
  
  // Retrieval metadata (user-assigned)
  labels: {
    futureYouCues: string[];
    keywords: string[];
    primaryKeyword: string | null;
    userKeywords: string[];
  };
  
  // Reference
  imageUrl: string;
  originLinkUrl: string;
  
  // Verification instructions
  verification: {
    procedure: string;
    command_macos: string;
    command_windows: string;
  };
}

/**
 * Generate a Proof Bundle for a page
 */
export function generateProofBundle(page: Page): ProofBundle {
  const hasHash = !!page.originHashSha256;
  const originLink = generateOriginLink(page);
  
  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    generator: 'umarise-origin-layer',
    
    originId: page.id,
    deviceUserId: page.deviceUserId,
    
    originHashSha256: page.originHashSha256 || null,
    originHashAlgo: hasHash ? 'sha256' : null,
    hashStatus: hasHash ? 'verified' : 'legacy_no_hash',
    
    capturedAt: page.createdAt.toISOString(),
    
    labels: {
      futureYouCues: page.futureYouCues || [],
      keywords: page.keywords || [],
      primaryKeyword: page.primaryKeyword || null,
      userKeywords: page.highlights || [],
    },
    
    imageUrl: page.imageUrl,
    originLinkUrl: originLink.url,
    
    verification: {
      procedure: 'Download the image from imageUrl. Calculate SHA-256 of the file bytes. Compare to originHashSha256. Match = artifact is authentic and unmodified since capture.',
      command_macos: 'shasum -a 256 <downloaded_image_file>',
      command_windows: 'Get-FileHash <downloaded_image_file> -Algorithm SHA256',
    },
  };
}

/**
 * Download Proof Bundle as JSON file
 */
export function downloadProofBundle(page: Page): void {
  const bundle = generateProofBundle(page);
  const jsonString = JSON.stringify(bundle, null, 2);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `origin-proof-${page.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
