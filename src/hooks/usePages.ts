// Hook for managing pages with real database operations

import { useState, useEffect, useCallback } from 'react';
import { 
  Page, 
  getPages as fetchPages, 
  createPage as createPageService, 
  deletePage as deletePageService 
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

  // Create new page
  const createPage = useCallback(async (imageDataUrl: string): Promise<Page | null> => {
    try {
      const newPage = await createPageService(imageDataUrl);
      setPages(prev => [newPage, ...prev]);
      return newPage;
    } catch (e) {
      console.error('Failed to create page:', e);
      const message = e instanceof Error ? e.message : 'Failed to save page';
      toast.error(message);
      return null;
    }
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
    deletePage,
    refresh,
  };
}
