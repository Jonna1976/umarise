import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface KaartenbakItem {
  originId: string;
  shortToken: string;
  hash: string;
  capturedAt: string;
  verifyUrl: string;
  status?: 'pending' | 'anchored';
  fileName?: string | null;
  deviceSigned?: boolean;
}

interface KaartenbakState {
  items: KaartenbakItem[];
  isOpen: boolean;
  addItems: (newItems: KaartenbakItem[]) => void;
  clearItems: () => void;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const KaartenbakContext = createContext<KaartenbakState | null>(null);

const STORAGE_KEY = 'kaartenbak_items';

function loadFromStorage(): KaartenbakItem[] {
  try {
    // Migrate from sessionStorage → localStorage (one-time)
    const session = sessionStorage.getItem(STORAGE_KEY);
    const local = localStorage.getItem(STORAGE_KEY);
    if (session && !local) {
      localStorage.setItem(STORAGE_KEY, session);
      sessionStorage.removeItem(STORAGE_KEY);
      return JSON.parse(session);
    }
    return local ? JSON.parse(local) : [];
  } catch { return []; }
}

export function KaartenbakProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<KaartenbakItem[]>(loadFromStorage);
  const [isOpen, setIsOpen] = useState(false);

  // Persist to sessionStorage on every change
  const syncStorage = useCallback((updated: KaartenbakItem[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  const addItems = useCallback((newItems: KaartenbakItem[]) => {
    setItems(prev => {
      const existingMap = new Map(prev.map(i => [i.originId, i]));
      // Update existing items' status, add new ones
      for (const item of newItems) {
        const existing = existingMap.get(item.originId);
        if (existing) {
          existingMap.set(item.originId, { ...existing, status: item.status, fileName: item.fileName ?? existing.fileName });
        } else {
          existingMap.set(item.originId, item);
        }
      }
      const merged = Array.from(existingMap.values());
      merged.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
      syncStorage(merged);
      return merged;
    });
  }, [syncStorage]);

  const clearItems = useCallback(() => { setItems([]); syncStorage([]); }, [syncStorage]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <KaartenbakContext.Provider value={{ items, isOpen, addItems, clearItems, setOpen: setIsOpen, toggle }}>
      {children}
    </KaartenbakContext.Provider>
  );
}

export function useKaartenbak() {
  const ctx = useContext(KaartenbakContext);
  if (!ctx) throw new Error('useKaartenbak must be used within KaartenbakProvider');
  return ctx;
}
