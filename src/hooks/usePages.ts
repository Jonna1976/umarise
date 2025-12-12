// Hook for managing pages with real database operations

import { useState, useEffect, useCallback } from 'react';
import { 
  Page, 
  getPages as fetchPages, 
  createPage as createPageService, 
  createCapsule as createCapsuleService,
  addToCapsule as addToCapsuleService,
  deletePage as deletePageService,
  updatePage as updatePageService,
  checkDuplicate
} from '@/lib/pageService';
import { toast } from 'sonner';

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pages on mount
  const loadPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedPages = await fetchPages();
      setPages(loadedPages);
    } catch (e) {
      console.error('Failed to load pages:', e);
      setError('Failed to load your codex');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Create new page with duplicate detection
  const createPage = useCallback(async (imageDataUrl: string): Promise<Page | null> => {
    try {
      const newPage = await createPageService(imageDataUrl);
      
      // Check for duplicate after creation (we have OCR text now)
      const duplicate = await checkDuplicate(newPage.ocrText);
      if (duplicate && duplicate.id !== newPage.id) {
        toast.warning('This page looks similar to one you already captured', {
          description: `Similar to page from ${duplicate.createdAt.toLocaleDateString()}`,
          duration: 5000,
        });
      }
      
      setPages(prev => [newPage, ...prev]);
      return newPage;
    } catch (e) {
      console.error('Failed to create page:', e);
      const message = e instanceof Error ? e.message : 'Failed to save page';
      toast.error(message);
      return null;
    }
  }, []);

  // Create multiple pages as a capsule with progress callback
  const createCapsule = useCallback(async (
    imageDataUrls: string[], 
    onProgress?: (completed: number, total: number) => void
  ): Promise<Page[] | null> => {
    try {
      const newPages = await createCapsuleService(imageDataUrls, onProgress);
      setPages(prev => [...newPages, ...prev]);
      toast.success(`Capsule created with ${newPages.length} pages`);
      return newPages;
    } catch (e) {
      console.error('Failed to create capsule:', e);
      const message = e instanceof Error ? e.message : 'Failed to save capsule';
      toast.error(message);
      return null;
    }
  }, []);

  // Add page to existing capsule
  const addToCapsule = useCallback(async (imageDataUrl: string, capsuleId: string): Promise<Page | null> => {
    try {
      const newPage = await addToCapsuleService(imageDataUrl, capsuleId);
      setPages(prev => [newPage, ...prev]);
      toast.success('Page added to capsule');
      return newPage;
    } catch (e) {
      console.error('Failed to add to capsule:', e);
      const message = e instanceof Error ? e.message : 'Failed to add page';
      toast.error(message);
      return null;
    }
  }, []);

  // Update page in local state
  // Note: Database save should already be done by the caller (e.g., SnapshotView)
  // This function just ensures local state is synchronized
  const updatePage = useCallback((page: Page): boolean => {
    setPages(prev => prev.map(p => p.id === page.id ? page : p));
    return true;
  }, []);

  // Delete page
  const deletePage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await deletePageService(id);
      if (success) {
        setPages(prev => prev.filter(p => p.id !== id));
        toast.success('Page deleted');
      }
      return success;
    } catch (e) {
      console.error('Failed to delete page:', e);
      toast.error('Failed to delete page');
      return false;
    }
  }, []);

  // Refresh pages
  const refresh = useCallback(async () => {
    await loadPages();
  }, [loadPages]);

  return {
    pages,
    isLoading,
    error,
    createPage,
    createCapsule,
    addToCapsule,
    updatePage,
    deletePage,
    refresh,
  };
}
