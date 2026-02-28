import { motion } from 'framer-motion';
import { useKaartenbak } from '@/contexts/KaartenbakContext';

/**
 * Universal Circumpunct — three visual states:
 * 1. Dim (no items) — ring + dot, low opacity
 * 2. Pending (items, some pending) — dot only, breathing
 * 3. Glow (items, all anchored or panel open) — ring + dot + glow
 */
export default function Circumpunct({ className = '' }: { className?: string }) {
  const { items, toggle } = useKaartenbak();
  
  const hasItems = items.length > 0;
  const hasPending = items.some(i => i.status === 'pending');

  // State: dim | pending | glow
  const state = !hasItems ? 'dim' : hasPending ? 'pending' : 'glow';

  return (
    <button
      onClick={toggle}
      className={`fixed top-6 right-6 z-50 flex items-center justify-center w-10 h-10 ${className}`}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      aria-label="Open kaartenbak"
    >
      {state === 'dim' && (
        <svg viewBox="0 0 32 32" width={24} height={24} style={{ overflow: 'visible', opacity: 0.3 }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(197,147,90,0.5)" strokeWidth="0.9" />
          <circle cx="16" cy="16" r="4" fill="#C5935A" />
        </svg>
      )}

      {state === 'pending' && (
        <svg viewBox="0 0 32 32" width={24} height={24} style={{ overflow: 'visible' }}>
          <motion.circle
            cx="16" cy="16" r="4" fill="#C5935A"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      )}

      {state === 'glow' && (
        <svg viewBox="0 0 32 32" width={24} height={24}
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(197,147,90,0.55))' }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(197,147,90,0.45)" strokeWidth="0.9" />
          <circle cx="16" cy="16" r="4" fill="#C5935A" />
        </svg>
      )}
    </button>
  );
}
