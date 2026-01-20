/**
 * useTrash Hook - Database-synced trash management
 * 
 * Trash state is stored in the database (is_trashed column on pages table),
 * so it syncs automatically across all devices with the same device_user_id.
 * 
 * This replaces the old localStorage-based implementation.
 */

import { useState, useCallback, useEffect } from 'react';
import { Page } from '@/lib/pageService';
import { 
  moveToTrash as moveToTrashDb, 
  restoreFromTrash as restoreFromTrashDb,
  getTrashedPages,
  deletePage as deletePageDb
} from '@/lib/pageService';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface UseTrashOptions {
  // Support both void and Promise<boolean> return types for flexibility
  onPermanentDelete?: (pageId: string) => void | Promise<void> | Promise<boolean>;
}

export function useTrash(options: UseTrashOptions = {}) {
  const { isDemoMode } = useDemoMode();
  const [trashedPages, setTrashedPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Load trashed pages from database
  const loadTrashedPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const pages = await getTrashedPages();
      setTrashedPages(pages);
    } catch (e) {
      console.error('[useTrash] Failed to load trashed pages:', e);
      setTrashedPages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch when demo mode changes
  useEffect(() => {
    loadTrashedPages();
  }, [loadTrashedPages, isDemoMode]);

  // Move page to trash (soft delete - syncs to database)
  const moveToTrash = useCallback(async (pageId: string): Promise<boolean> => {
    console.log('[useTrash] Moving page to trash:', pageId);
    
    const success = await moveToTrashDb(pageId);
    if (success) {
      // Refresh trashed pages list
      await loadTrashedPages();
      console.log('[useTrash] Page moved to trash successfully');
    } else {
      console.error('[useTrash] Failed to move page to trash');
    }
    
    return success;
  }, [loadTrashedPages]);

  // Restore page from trash
  const restoreFromTrash = useCallback(async (pageId: string): Promise<boolean> => {
    console.log('[useTrash] Restoring page from trash:', pageId);
    
    const success = await restoreFromTrashDb(pageId);
    if (success) {
      // Update local state immediately for responsive UI
      setTrashedPages(prev => prev.filter(p => p.id !== pageId));
      console.log('[useTrash] Page restored from trash successfully');
    } else {
      console.error('[useTrash] Failed to restore page from trash');
    }
    
    return success;
  }, []);

  // Permanently delete a page
  const permanentlyDelete = useCallback(async (pageId: string): Promise<boolean> => {
    console.log('[useTrash] Permanently deleting page:', pageId);
    
    // Update local state immediately for responsive UI
    setTrashedPages(prev => prev.filter(p => p.id !== pageId));
    
    try {
      // Use custom delete handler if provided, otherwise default to pageService
      if (options.onPermanentDelete) {
        await Promise.resolve(options.onPermanentDelete(pageId));
        return true;
      } else {
        return await deletePageDb(pageId);
      }
    } catch (e) {
      console.error('[useTrash] Failed to delete page from database:', e);
      await loadTrashedPages();
      return false;
    }
  }, [options.onPermanentDelete, loadTrashedPages]);

  // Empty entire trash
  const emptyTrash = useCallback(async (): Promise<void> => {
    console.log('[useTrash] Emptying trash, pages:', trashedPages.length);
    
    // Get all trashed page IDs before clearing local state
    const toDelete = [...trashedPages];
    
    // Clear local state first for responsive UI
    setTrashedPages([]);
    
    // Delete all pages
    for (const page of toDelete) {
      try {
        if (options.onPermanentDelete) {
          await Promise.resolve(options.onPermanentDelete(page.id));
        } else {
          await deletePageDb(page.id);
        }
      } catch (e) {
        console.error('[useTrash] Failed to delete page:', page.id, e);
      }
    }
  }, [trashedPages, options.onPermanentDelete]);

  // Refresh trash from database
  const refresh = useCallback(async () => {
    await loadTrashedPages();
  }, [loadTrashedPages]);

  return {
    trashedPages,
    trashedCount: trashedPages.length,
    isLoading,
    isDragging,
    setIsDragging,
    moveToTrash,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
    refresh,
  };
}
