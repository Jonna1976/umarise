import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface KaartenbakItem {
  originId: string;
  shortToken: string;
  hash: string;
  capturedAt: string;
  verifyUrl: string;
  status?: 'pending' | 'anchored';
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

function loadFromSession(): KaartenbakItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function KaartenbakProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<KaartenbakItem[]>(loadFromSession);
  const [isOpen, setIsOpen] = useState(false);

  // Persist to sessionStorage on every change
  const syncStorage = useCallback((updated: KaartenbakItem[]) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  const addItems = useCallback((newItems: KaartenbakItem[]) => {
    setItems(prev => {
      const existingMap = new Map(prev.map(i => [i.originId, i]));
      // Update existing items' status, add new ones
      for (const item of newItems) {
        const existing = existingMap.get(item.originId);
        if (existing) {
          // Update status if changed
          existingMap.set(item.originId, { ...existing, status: item.status });
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
