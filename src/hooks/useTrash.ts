/**
 * useTrash Hook - Hetzner-native trash management
 * 
 * Trash state is fully managed by the Hetzner backend via the abstraction layer.
 * No Supabase/Lovable Cloud dependencies - this follows the architecture where
 * only frontend and proxy functions run on Lovable, all data is on Hetzner.
 * 
 * Cross-device sync happens automatically because all devices with the same
 * device_user_id share the same Hetzner data.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Page } from '@/lib/pageService';
import { 
  moveToTrash as moveToTrashDb, 
  restoreFromTrash as restoreFromTrashDb,
  getTrashedPages,
  deletePage as deletePageDb
} from '@/lib/pageService';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { getDeviceId } from '@/lib/deviceId';

interface UseTrashOptions {
  // Support both void and Promise<boolean> return types for flexibility
  onPermanentDelete?: (pageId: string) => void | Promise<void> | Promise<boolean>;
}

export function useTrash(options: UseTrashOptions = {}) {
  const { isDemoMode } = useDemoMode();
  const [trashedPages, setTrashedPages] = useState<Page[]>([]);
  // Pending IDs: hide immediately in History even if backend read-path lags
  const [pendingTrashedIds, setPendingTrashedIds] = useState<string[]>(() => {
    try {
      const deviceId = getDeviceId();
      if (!deviceId) return [];
      const raw = localStorage.getItem(`umarise:trash:pending:${deviceId}`);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Persist pending ids locally so trash survives a refresh (device-local, not backend).
  useEffect(() => {
    try {
      const deviceId = getDeviceId();
      if (!deviceId) return;
      localStorage.setItem(`umarise:trash:pending:${deviceId}`, JSON.stringify(pendingTrashedIds));
    } catch {
      // ignore
    }
  }, [pendingTrashedIds]);

  // Load trashed pages from Hetzner backend
  const loadTrashedPages = useCallback(async (): Promise<Page[]> => {
    setIsLoading(true);
    try {
      const pages = await getTrashedPages();
      setTrashedPages(pages);
      
      // Sync pending IDs with reality: remove any pending IDs that are now confirmed
      // in the backend OR that no longer exist (were permanently deleted)
      const backendTrashedIds = new Set(pages.map(p => p.id));
      setPendingTrashedIds(prev => {
        // Only keep pending IDs that are NOT yet in backend trash
        // (they're still "in flight" to the backend)
        const stillPending = prev.filter(id => !backendTrashedIds.has(id));
        // If trash is empty from backend, also clear all pending (they were deleted)
        if (pages.length === 0 && prev.length > 0) {
          console.log('[useTrash] Trash is empty, clearing all pending IDs');
          return [];
        }
        return stillPending;
      });
      
      return pages;
    } catch (e) {
      console.error('[useTrash] Failed to load trashed pages:', e);
      setTrashedPages([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPending = useCallback((pageId: string) => {
    setPendingTrashedIds(prev => (prev.includes(pageId) ? prev : [...prev, pageId]));
  }, []);

  const removePending = useCallback((pageId: string) => {
    setPendingTrashedIds(prev => prev.filter(id => id !== pageId));
  }, []);

  // Re-fetch when demo mode changes
  useEffect(() => {
    loadTrashedPages();
  }, [loadTrashedPages, isDemoMode]);

  // Move page to trash (soft delete - syncs to database)
  const moveToTrash = useCallback(async (pageId: string): Promise<boolean> => {
    console.log('[useTrash] Moving page to trash:', pageId);

    // Optimistic UI: hide immediately even if backend read-path lags
    addPending(pageId);
    
    const success = await moveToTrashDb(pageId);
    if (success) {
      // Refresh trashed pages list immediately for local UX
      const pages = await loadTrashedPages();

      // If the backend is already returning this page as trashed, we can drop the pending flag.
      // Otherwise we keep it pending so History stays consistent until the backend catches up.
      if (pages.some(p => p.id === pageId)) {
        removePending(pageId);
      }
      console.log('[useTrash] Page moved to trash successfully');
    } else {
      console.error('[useTrash] Failed to move page to trash');
      // Roll back optimistic state
      removePending(pageId);
    }
    
    return success;
  }, [addPending, loadTrashedPages, removePending]);

  // Restore page from trash
  const restoreFromTrash = useCallback(async (pageId: string): Promise<boolean> => {
    console.log('[useTrash] Restoring page from trash:', pageId);
    
    const success = await restoreFromTrashDb(pageId);
    if (success) {
      // Update local state immediately for responsive UI
      setTrashedPages(prev => prev.filter(p => p.id !== pageId));
      removePending(pageId);
      console.log('[useTrash] Page restored from trash successfully');
    } else {
      console.error('[useTrash] Failed to restore page from trash');
    }
    
    return success;
  }, [removePending]);

  const trashedIds = useMemo(() => {
    return Array.from(new Set([...trashedPages.map(p => p.id), ...pendingTrashedIds]));
  }, [trashedPages, pendingTrashedIds]);

  // Permanently delete a page
  const permanentlyDelete = useCallback(async (pageId: string): Promise<boolean> => {
    console.log('[useTrash] Permanently deleting page:', pageId);
    
    // Update local state immediately for responsive UI
    setTrashedPages(prev => prev.filter(p => p.id !== pageId));
    // Also remove from pending list so Trash modal/History can't keep it around visually
    removePending(pageId);
    
    try {
      // Use custom delete handler if provided, otherwise default to pageService
      if (options.onPermanentDelete) {
        const result = await Promise.resolve(options.onPermanentDelete(pageId));
        const ok = result !== false;
        if (!ok) {
          await loadTrashedPages();
        }
        return ok;
      } else {
        const ok = await deletePageDb(pageId);
        if (!ok) {
          await loadTrashedPages();
        }
        return ok;
      }
    } catch (e) {
      console.error('[useTrash] Failed to delete page from database:', e);
      await loadTrashedPages();
      return false;
    }
  }, [options.onPermanentDelete, loadTrashedPages, removePending]);

  // Empty entire trash
  const emptyTrash = useCallback(async (): Promise<void> => {
    const idsToDelete = Array.from(new Set([...trashedPages.map(p => p.id), ...pendingTrashedIds]));
    console.log('[useTrash] Emptying trash, pages:', idsToDelete.length);
    
    // Clear local state first for responsive UI
    setTrashedPages([]);
    setPendingTrashedIds([]);
    
    // Delete all pages
    let hadFailure = false;
    for (const pageId of idsToDelete) {
      try {
        if (options.onPermanentDelete) {
          const result = await Promise.resolve(options.onPermanentDelete(pageId));
          if (result === false) hadFailure = true;
        } else {
          const ok = await deletePageDb(pageId);
          if (!ok) hadFailure = true;
        }
      } catch (e) {
        hadFailure = true;
        console.error('[useTrash] Failed to delete page:', pageId, e);
      }
    }

    // Re-sync trash list so the UI matches reality (esp. if any delete failed)
    if (hadFailure) {
      await loadTrashedPages();
    }
  }, [trashedPages, pendingTrashedIds, options.onPermanentDelete, loadTrashedPages]);

  // Refresh trash from database
  const refresh = useCallback(async () => {
    await loadTrashedPages();
  }, [loadTrashedPages]);

  return {
    trashedPages,
    // Expose ids so History can hide instantly and safely
    trashedIds,
    pendingTrashedIds,
    trashedCount: trashedIds.length,
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
