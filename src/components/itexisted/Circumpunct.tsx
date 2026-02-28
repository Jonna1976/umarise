import { useState } from 'react';
import { motion } from 'framer-motion';
import { useKaartenbak } from '@/contexts/KaartenbakContext';

/**
 * Universal Circumpunct — three visual states:
 * 1. Dim (no items, panel closed) — ring + dot, low opacity
 * 2. Pending (items with pending, panel closed) — dot only, breathing 1→0.2→1
 * 3. Glow (panel open OR all items anchored) — ring + dot + glow, hover intensifies
 */
export default function Circumpunct({ className = '' }: { className?: string }) {
  const { items, isOpen, toggle } = useKaartenbak();
  const [hovered, setHovered] = useState(false);

  const hasItems = items.length > 0;
  const hasPending = items.some(i => i.status === 'pending');

  // Glow when panel is open OR when items exist and all are anchored
  const state = isOpen ? 'glow' : !hasItems ? 'dim' : hasPending ? 'pending' : 'glow';

  const glowFilter = hovered
    ? 'drop-shadow(0 0 16px rgba(197,147,90,0.8))'
    : 'drop-shadow(0 0 8px rgba(197,147,90,0.55))';

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed top-6 right-6 z-50 flex items-center justify-center w-10 h-10 ${className}`}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      aria-label="Open kaartenbak"
    >
      {state === 'dim' && (
        <svg viewBox="0 0 32 32" width={28} height={28} style={{ overflow: 'visible', opacity: 0.35 }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(197,147,90,0.6)" strokeWidth="1.1" />
          <circle cx="16" cy="16" r="4" fill="#C5935A" />
        </svg>
      )}

      {state === 'pending' && (
        <svg viewBox="0 0 32 32" width={28} height={28} style={{ overflow: 'visible' }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="1.1" />
          <motion.circle
            cx="16" cy="16" r="4" fill="#C5935A"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      )}

      {state === 'glow' && (
        <svg viewBox="0 0 32 32" width={28} height={28}
          style={{ overflow: 'visible', filter: glowFilter, transition: 'filter 0.2s ease' }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(197,147,90,0.55)" strokeWidth="1.1" />
          <circle cx="16" cy="16" r="4" fill="#C5935A" />
        </svg>
      )}
    </button>
  );
}
