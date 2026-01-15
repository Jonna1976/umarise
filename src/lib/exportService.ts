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
  pages: ExportedPage[];
}

/**
 * Exported page with origin hash for verification
 */
export interface ExportedPage extends Omit<Page, 'embedding' | 'embeddingVector'> {
  originHashSha256?: string;
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
    version: '1.1', // Upgraded version for origin hash support
    deviceId,
    pageCount: pages.length,
    pages: pages.map(page => {
      const exported: ExportedPage = {
        ...page,
        // Clean up any sensitive or unnecessary fields
        embedding: undefined,
        embeddingVector: undefined,
      } as ExportedPage;
      // Ensure origin hash is explicitly included
      if (page.originHashSha256) {
        exported.originHashSha256 = page.originHashSha256;
      }
      return exported;
    }),
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
 * Fetches all pages and creates a downloadable ZIP file with images
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

  // Download and add images to ZIP
  const pagesWithLocalImages: Page[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    onProgress?.({
      current: i + 1,
      total: pages.length,
      status: `Downloading image ${i + 1}/${pages.length}...`
    });

    let localImagePath = `images/${page.id}.jpg`;
    
    try {
      // Fetch the image
      const response = await fetch(page.imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        
        // Determine file extension from content type
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : 
                   contentType.includes('webp') ? 'webp' : 'jpg';
        localImagePath = `images/${page.id}.${ext}`;
        
        // Add to ZIP
        imagesFolder?.file(`${page.id}.${ext}`, blob);
      }
    } catch (error) {
      console.warn(`Failed to download image for page ${page.id}:`, error);
      localImagePath = page.imageUrl; // Keep original URL as fallback
    }

    // Store page with local image reference
    pagesWithLocalImages.push({
      ...page,
      embedding: undefined,
      embeddingVector: undefined,
      // Add local image path reference
      localImagePath,
    } as Page & { localImagePath: string });
  }

  onProgress?.({
    current: pages.length,
    total: pages.length,
    status: 'Creating ZIP file...'
  });

  // Create metadata JSON
  const exportData: ExportData & { localImagePaths: boolean } = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    deviceId,
    pageCount: pages.length,
    pages: pagesWithLocalImages,
    localImagePaths: true, // Indicates images are in the ZIP
  };

  // Add metadata.json to ZIP
  zip.file('metadata.json', JSON.stringify(exportData, null, 2));

  // Add README with origin hash verification instructions
  const readme = `# Umarise Export
  
Exported: ${new Date().toISOString()}
Pages: ${pages.length}
Device: ${deviceId}

## Contents
- metadata.json: All page data including OCR text, summaries, keywords, and origin hashes
- images/: Original page images

## Origin Hash Verification
Each page includes an \`originHashSha256\` field - a SHA-256 fingerprint of the original artifact.
This allows forensic verification that the image has not been modified since capture.

To verify: Calculate SHA-256 of the image file and compare to the stored hash.

## Structure
Each page in metadata.json contains:
- id: Unique page identifier
- imageUrl: Original cloud URL
- localImagePath: Path to image in this archive
- originHashSha256: SHA-256 fingerprint (64 hex chars) for verification
- ocrText: Recognized text from handwriting
- summary: AI-generated summary
- keywords: Extracted keywords
- tone: Detected emotional tone
- futureYouCues: Retrieval hints
- createdAt: Capture timestamp (UTC)
- And more...

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
    version: '1.1', // Upgraded version for origin hash support
    deviceId,
    pageCount: pages.length,
    pages: pages.map(page => {
      const exported: ExportedPage = {
        ...page,
        embedding: undefined,
        embeddingVector: undefined,
      } as ExportedPage;
      if (page.originHashSha256) {
        exported.originHashSha256 = page.originHashSha256;
      }
      return exported;
    }),
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
  const pagesWithLocalImages: Page[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    onProgress?.({
      current: i + 1,
      total: pages.length,
      status: `Downloading image ${i + 1}/${pages.length}...`
    });

    let localImagePath = `images/${page.id}.jpg`;
    
    try {
      const response = await fetch(page.imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : 
                   contentType.includes('webp') ? 'webp' : 'jpg';
        localImagePath = `images/${page.id}.${ext}`;
        imagesFolder?.file(`${page.id}.${ext}`, blob);
      }
    } catch (error) {
      console.warn(`Failed to download image for page ${page.id}:`, error);
      localImagePath = page.imageUrl;
    }

    pagesWithLocalImages.push({
      ...page,
      embedding: undefined,
      embeddingVector: undefined,
      localImagePath,
    } as Page & { localImagePath: string });
  }

  onProgress?.({
    current: pages.length,
    total: pages.length,
    status: 'Creating ZIP file...'
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    deviceId,
    pageCount: pages.length,
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
