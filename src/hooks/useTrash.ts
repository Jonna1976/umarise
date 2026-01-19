import { useState, useCallback, useEffect, useMemo } from 'react';
import { Page } from '@/lib/pageService';
import { getDeviceId } from '@/lib/deviceId';

const TRASH_STORAGE_PREFIX = 'umarise_trash_';

interface TrashState {
  pageIds: string[];
}

/**
 * Get the storage key for the current device's trash
 * This ensures trash state is isolated per device ID
 */
function getTrashStorageKey(): string {
  const deviceId = getDeviceId();
  return `${TRASH_STORAGE_PREFIX}${deviceId || 'anonymous'}`;
}

export function useTrash(allPages: Page[], onPermanentDelete: (pageId: string) => Promise<boolean> | void) {
  const [trashedIds, setTrashedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  // Get current storage key (changes if device ID changes)
  const storageKey = useMemo(() => getTrashStorageKey(), []);

  // Load trash state from localStorage on mount (device-specific)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const state: TrashState = JSON.parse(stored);
        setTrashedIds(new Set(state.pageIds));
        console.log('[useTrash] Loaded trash for device:', storageKey, 'IDs:', state.pageIds.length);
      } else {
        // No trash state for this device - start fresh
        setTrashedIds(new Set());
        console.log('[useTrash] No trash state found for device:', storageKey);
      }
    } catch (e) {
      console.error('Failed to load trash state:', e);
    }
  }, [storageKey]);

  // Persist trash state to localStorage (device-specific)
  const persistTrash = useCallback((ids: Set<string>) => {
    try {
      const state: TrashState = { pageIds: Array.from(ids) };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist trash state:', e);
    }
  }, [storageKey]);

  // Move page to trash (soft delete)
  const moveToTrash = useCallback((pageId: string) => {
    console.log('[useTrash] Moving page to trash:', pageId);
    setTrashedIds(prev => {
      const next = new Set(prev);
      next.add(pageId);
      persistTrash(next);
      console.log('[useTrash] Trashed IDs now:', Array.from(next));
      return next;
    });
  }, [persistTrash]);

  // Restore page from trash
  const restoreFromTrash = useCallback((pageId: string) => {
    setTrashedIds(prev => {
      const next = new Set(prev);
      next.delete(pageId);
      persistTrash(next);
      return next;
    });
  }, [persistTrash]);

  // Permanently delete a page
  const permanentlyDelete = useCallback(async (pageId: string) => {
    console.log('[useTrash] Permanently deleting page:', pageId);
    
    // Remove from trash state immediately for responsive UI
    setTrashedIds(prev => {
      const next = new Set(prev);
      next.delete(pageId);
      persistTrash(next);
      console.log('[useTrash] Removed from trash, remaining:', Array.from(next));
      return next;
    });
    
    // Then call the actual delete function (fire and forget for responsive UI)
    try {
      await Promise.resolve(onPermanentDelete(pageId));
    } catch (e) {
      console.error('[useTrash] Failed to delete page from database:', e);
    }
  }, [onPermanentDelete, persistTrash]);

  // Empty entire trash
  const emptyTrash = useCallback(async () => {
    // Get all trashed page IDs before clearing
    const toDelete = Array.from(trashedIds);
    
    // Clear trash state first for responsive UI
    setTrashedIds(new Set());
    persistTrash(new Set());
    
    // Delete all pages
    for (const pageId of toDelete) {
      await onPermanentDelete(pageId);
    }
  }, [trashedIds, onPermanentDelete, persistTrash]);

  // Get pages that are NOT in trash (for main view)
  const visiblePages = allPages.filter(page => !trashedIds.has(page.id));
  
  // Get pages that ARE in trash
  const trashedPages = allPages.filter(page => trashedIds.has(page.id));

  // Clean up trash state by removing IDs for pages that no longer exist
  useEffect(() => {
    const existingIds = new Set(allPages.map(p => p.id));
    const validTrashedIds = Array.from(trashedIds).filter(id => existingIds.has(id));
    
    if (validTrashedIds.length !== trashedIds.size) {
      const cleaned = new Set(validTrashedIds);
      setTrashedIds(cleaned);
      persistTrash(cleaned);
    }
  }, [allPages, trashedIds, persistTrash]);

  return {
    visiblePages,
    trashedPages,
    trashedCount: trashedPages.length,
    isDragging,
    setIsDragging,
    moveToTrash,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
  };
}
