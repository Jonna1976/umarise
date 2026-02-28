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

export function KaartenbakProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<KaartenbakItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItems = useCallback((newItems: KaartenbakItem[]) => {
    setItems(prev => {
      const existing = new Set(prev.map(i => i.originId));
      const unique = newItems.filter(i => !existing.has(i.originId));
      const merged = [...prev, ...unique];
      // Sort chronologically descending
      merged.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
      return merged;
    });
  }, []);

  const clearItems = useCallback(() => setItems([]), []);

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
