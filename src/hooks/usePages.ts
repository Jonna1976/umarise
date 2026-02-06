// Hook for managing pages with real database operations

import { useState, useEffect, useCallback } from 'react';
import { 
  Page, 
  getPages as fetchPages, 
  deletePage as deletePageService,
  updatePage as updatePageService,
} from '@/lib/pageService';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function usePages() {
  const { isDemoMode } = useDemoMode();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pages on mount and when demo mode changes
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

  // Re-fetch when demo mode changes
  useEffect(() => {
    loadPages();
  }, [loadPages, isDemoMode]);

  // Update page in local state
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
    updatePage,
    deletePage,
    refresh,
  };
}
