/**
 * Export Service - Handles data export functionality
 * Exports all pages with metadata as JSON or ZIP with images
 * 
 * ORIGIN HASH VERIFICATION: Exports include SHA-256 fingerprints
 * for forensic verification of artifact authenticity.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getStorageProvider } from './abstractions';
import { calculateSHA256FromFile, verifyFileHashDetailed, type HashVerificationResult } from './originHash';
import type { Page } from './abstractions/types';

export interface ExportData {
  exportedAt: string;
  version: string;
  deviceId: string;
  pageCount: number;
  hashVerificationInfo: {
    algorithm: string;
    howToVerify: string;
  };
  pages: ExportedPage[];
}

/**
 * Exported page with origin hash for verification
 * Follows canonical format for forensic verification
 */
export interface ExportedPage extends Omit<Page, 'embedding' | 'embeddingVector'> {
  // Origin hash fields (explicitly typed for clarity)
  origin_hash_sha256: string | null;
  origin_hash_algo: 'sha256' | null;
  hash_status: 'verified' | 'legacy_no_hash';
  captured_at: string; // ISO timestamp
}

export interface ExportProgress {
  current: number;
  total: number;
  status: string;
}

/**
 * Re-export verification types and function for external use
 */
export { verifyFileHashDetailed, type HashVerificationResult } from './originHash';

/**
 * Transform page to canonical export format with explicit hash status
 */
function toExportedPage(page: Page): ExportedPage {
  const hasHash = !!page.originHashSha256;
  
  return {
    ...page,
    // Remove internal fields
    embedding: undefined,
    embeddingVector: undefined,
    // Canonical origin hash fields
    origin_hash_sha256: page.originHashSha256 || null,
    origin_hash_algo: hasHash ? 'sha256' : null,
    hash_status: hasHash ? 'verified' : 'legacy_no_hash',
    captured_at: page.createdAt.toISOString(),
  } as ExportedPage;
}

/**
 * Fetches all pages and creates a downloadable JSON file
 */
export async function exportPagesAsJSON(): Promise<void> {
  const storage = getStorageProvider();
  
  // Fetch all pages
  const pages = await storage.getPages();
  
  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  // Get device ID from first page
  const deviceId = pages[0]?.deviceUserId || 'unknown';

  // Create export data structure with origin hashes
  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    version: '2.0', // Version 2.0: canonical origin hash format
    deviceId,
    pageCount: pages.length,
    hashVerificationInfo: {
      algorithm: 'SHA-256',
      howToVerify: 'Calculate SHA-256 of the original image file bytes and compare to origin_hash_sha256. Match confirms artifact authenticity.',
    },
    pages: pages.map(toExportedPage),
  };

  // Convert to JSON string with nice formatting
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `umarise-export-${new Date().toISOString().split('T')[0]}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * ZIP Manifest entry for forensic verification
 */
interface ManifestEntry {
  page_id: string;
  filename: string;
  origin_hash_sha256: string | null;
  origin_hash_algo: 'sha256' | null;
  hash_status: 'verified' | 'legacy_no_hash';
  captured_at: string;
  image_url: string;
}

/**
 * Fetches all pages and creates a downloadable ZIP file with images and manifest
 */
export async function exportPagesAsZIP(
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const storage = getStorageProvider();
  
  // Fetch all pages
  const pages = await storage.getPages();
  
  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  const zip = new JSZip();
  const imagesFolder = zip.folder('images');
  
  // Get device ID from first page
  const deviceId = pages[0]?.deviceUserId || 'unknown';

  // Build manifest entries while downloading images
  const manifestEntries: ManifestEntry[] = [];
  const pagesWithLocalImages: ExportedPage[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    onProgress?.({
      current: i + 1,
      total: pages.length,
      status: `Downloading image ${i + 1}/${pages.length}...`
    });

    let filename = `${page.id}.jpg`;
    const hasHash = !!page.originHashSha256;
    
    try {
      // Fetch the image
      const response = await fetch(page.imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        
        // Determine file extension from content type
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : 
                   contentType.includes('webp') ? 'webp' : 'jpg';
        filename = `${page.id}.${ext}`;
        
        // Add to ZIP
        imagesFolder?.file(filename, blob);
      }
    } catch (error) {
      console.warn(`Failed to download image for page ${page.id}:`, error);
    }

    // Add manifest entry
    manifestEntries.push({
      page_id: page.id,
      filename: `images/${filename}`,
      origin_hash_sha256: page.originHashSha256 || null,
      origin_hash_algo: hasHash ? 'sha256' : null,
      hash_status: hasHash ? 'verified' : 'legacy_no_hash',
      captured_at: page.createdAt.toISOString(),
      image_url: page.imageUrl,
    });

    // Store page with local image reference
    pagesWithLocalImages.push({
      ...toExportedPage(page),
      localImagePath: `images/${filename}`,
    } as ExportedPage & { localImagePath: string });
  }

  onProgress?.({
    current: pages.length,
    total: pages.length,
    status: 'Creating ZIP file...'
  });

  // Create manifest.json (canonical verification format)
  const manifest = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    deviceId,
    pageCount: pages.length,
    hashVerificationInfo: {
      algorithm: 'SHA-256',
      howToVerify: 'Calculate SHA-256 of the image file bytes and compare to origin_hash_sha256. Match confirms artifact authenticity.',
    },
    entries: manifestEntries,
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Create full metadata.json (all page data)
  const exportData: ExportData & { localImagePaths: boolean } = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    deviceId,
    pageCount: pages.length,
    hashVerificationInfo: {
      algorithm: 'SHA-256',
      howToVerify: 'Calculate SHA-256 of the image file bytes and compare to origin_hash_sha256. Match confirms artifact authenticity.',
    },
    pages: pagesWithLocalImages,
    localImagePaths: true,
  };
  zip.file('metadata.json', JSON.stringify(exportData, null, 2));

  // Add README with origin hash verification instructions
  const readme = `# Umarise Export

Exported: ${new Date().toISOString()}
Pages: ${pages.length}
Device: ${deviceId}

## Contents
- manifest.json: Minimal verification manifest with origin hashes
- metadata.json: Complete page data including OCR text, summaries, keywords
- images/: Original page images

## Origin Hash Verification

Each page includes:
- \`origin_hash_sha256\`: SHA-256 fingerprint (64 hex characters)
- \`origin_hash_algo\`: Algorithm used (always "sha256")
- \`hash_status\`: "verified" or "legacy_no_hash"
- \`captured_at\`: Timestamp of capture (ISO 8601)

### How to Verify

1. Open manifest.json
2. For each entry with hash_status: "verified":
   - Locate the image file at the specified filename
   - Calculate SHA-256 hash of the file bytes
   - Compare to origin_hash_sha256
   - Match = artifact is authentic and unmodified

### Command Line Verification (macOS/Linux)

\`\`\`bash
# Calculate SHA-256 of an image
shasum -a 256 images/<page_id>.jpg

# Compare output to origin_hash_sha256 in manifest.json
\`\`\`

### Legacy Pages

Pages with hash_status: "legacy_no_hash" were captured before origin hash
verification was implemented. These pages are valid but cannot be
cryptographically verified.

---
Generated by Umarise - Your Personal Codex
`;
  zip.file('README.md', readme);

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // Download using file-saver
  const filename = `umarise-export-${new Date().toISOString().split('T')[0]}.zip`;
  saveAs(zipBlob, filename);
}

/**
 * Export selected pages as JSON
 */
export async function exportSelectedPagesAsJSON(pageIds: string[]): Promise<void> {
  const storage = getStorageProvider();
  
  // Fetch all pages and filter
  const allPages = await storage.getPages();
  const pages = allPages.filter(p => pageIds.includes(p.id));
  
  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  const deviceId = pages[0]?.deviceUserId || 'unknown';

  const exportData: ExportData & { isSelective: boolean } = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    deviceId,
    pageCount: pages.length,
    hashVerificationInfo: {
      algorithm: 'SHA-256',
      howToVerify: 'Calculate SHA-256 of the original image file bytes and compare to origin_hash_sha256. Match confirms artifact authenticity.',
    },
    pages: pages.map(toExportedPage),
    isSelective: true,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `umarise-selected-${pages.length}-pages-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export selected pages as ZIP
 */
export async function exportSelectedPagesAsZIP(
  pageIds: string[],
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const storage = getStorageProvider();
  
  // Fetch all pages and filter
  const allPages = await storage.getPages();
  const pages = allPages.filter(p => pageIds.includes(p.id));
  
  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  const zip = new JSZip();
  const imagesFolder = zip.folder('images');
  
  const deviceId = pages[0]?.deviceUserId || 'unknown';
  const manifestEntries: ManifestEntry[] = [];
  const pagesWithLocalImages: ExportedPage[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    onProgress?.({
      current: i + 1,
      total: pages.length,
      status: `Downloading image ${i + 1}/${pages.length}...`
    });

    let filename = `${page.id}.jpg`;
    const hasHash = !!page.originHashSha256;
    
    try {
      const response = await fetch(page.imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : 
                   contentType.includes('webp') ? 'webp' : 'jpg';
        filename = `${page.id}.${ext}`;
        imagesFolder?.file(filename, blob);
      }
    } catch (error) {
      console.warn(`Failed to download image for page ${page.id}:`, error);
    }

    manifestEntries.push({
      page_id: page.id,
      filename: `images/${filename}`,
      origin_hash_sha256: page.originHashSha256 || null,
      origin_hash_algo: hasHash ? 'sha256' : null,
      hash_status: hasHash ? 'verified' : 'legacy_no_hash',
      captured_at: page.createdAt.toISOString(),
      image_url: page.imageUrl,
    });

    pagesWithLocalImages.push({
      ...toExportedPage(page),
      localImagePath: `images/${filename}`,
    } as ExportedPage & { localImagePath: string });
  }

  onProgress?.({
    current: pages.length,
    total: pages.length,
    status: 'Creating ZIP file...'
  });

  // Create manifest.json
  const manifest = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    deviceId,
    pageCount: pages.length,
    hashVerificationInfo: {
      algorithm: 'SHA-256',
      howToVerify: 'Calculate SHA-256 of the image file bytes and compare to origin_hash_sha256.',
    },
    entries: manifestEntries,
    isSelective: true,
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Create metadata.json
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    deviceId,
    pageCount: pages.length,
    hashVerificationInfo: {
      algorithm: 'SHA-256',
      howToVerify: 'Calculate SHA-256 of the image file bytes and compare to origin_hash_sha256.',
    },
    pages: pagesWithLocalImages,
    localImagePaths: true,
    isSelective: true,
  };
  zip.file('metadata.json', JSON.stringify(exportData, null, 2));

  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const filename = `umarise-selected-${pages.length}-pages-${new Date().toISOString().split('T')[0]}.zip`;
  saveAs(zipBlob, filename);
}

/**
 * Get export statistics without downloading
 */
export async function getExportStats(): Promise<{ pageCount: number; oldestPage: Date | null; newestPage: Date | null }> {
  const storage = getStorageProvider();
  const pages = await storage.getPages();
  
  if (pages.length === 0) {
    return { pageCount: 0, oldestPage: null, newestPage: null };
  }

  const dates = pages.map(p => new Date(p.createdAt)).sort((a, b) => a.getTime() - b.getTime());
  
  return {
    pageCount: pages.length,
    oldestPage: dates[0],
    newestPage: dates[dates.length - 1],
  };
}
