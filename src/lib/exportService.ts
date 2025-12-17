/**
 * Export Service - Handles data export functionality
 * Exports all pages with metadata as JSON
 */

import { getStorageProvider } from './abstractions';
import type { Page } from './abstractions/types';

export interface ExportData {
  exportedAt: string;
  version: string;
  deviceId: string;
  pageCount: number;
  pages: Page[];
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

  // Create export data structure
  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    deviceId,
    pageCount: pages.length,
    pages: pages.map(page => ({
      ...page,
      // Clean up any sensitive or unnecessary fields
      embedding: undefined,
      embeddingVector: undefined,
    })),
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
