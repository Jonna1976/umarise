import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKaartenbak } from '@/contexts/KaartenbakContext';

/**
 * Universal Circumpunct — three visual states:
 * 1. Dim (no items, panel closed) — ring + dot, low opacity
 * 2. Pending (items with pending, panel closed) — dot only, breathing 1→0.2→1
 * 3. Glow (panel open OR all items anchored) — ring + dot + glow, hover intensifies
 *
 * Now includes a + button partner that navigates to homepage.
 */
export default function Circumpunct({ className = '' }: { className?: string }) {
  const { items, isOpen, toggle } = useKaartenbak();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasItems = items.length > 0;
  const hasPending = items.some(i => i.status === 'pending');

  // Glow when panel is open OR when items exist and all are anchored
  const state = isOpen ? 'glow' : !hasItems ? 'dim' : hasPending ? 'pending' : 'glow';

  const glowFilter = hovered
    ? 'drop-shadow(0 0 16px rgba(197,147,90,0.8))'
    : 'drop-shadow(0 0 8px rgba(197,147,90,0.55))';

  // Only show + button when NOT on the capture homepage
  const isHome = location.pathname === '/itexisted' || location.pathname === '/';
  const showPlus = !isHome;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-[14px] ${className}`}>
      {/* + button — navigate to homepage */}
      {showPlus && (
        <button
          onClick={() => navigate('/itexisted')}
          className="w-[26px] h-[26px] flex items-center justify-center transition-all duration-300"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(197,147,90,0.55)',
            fontSize: 20,
            fontWeight: 300,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(197,147,90,0.7)';
            e.currentTarget.style.color = 'rgba(197,147,90,0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(197,147,90,0.35)';
            e.currentTarget.style.color = 'rgba(197,147,90,0.55)';
          }}
          aria-label="Anchor another file"
        >
          +
        </button>
      )}

      {/* ⊙ circumpunct */}
      <button
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center justify-center w-[26px] h-[26px]"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="Open kaartenbak"
      >
        {state === 'dim' && (
          <svg viewBox="0 0 26 26" width={26} height={26} style={{ overflow: 'visible', opacity: 0.35 }}>
            <circle cx="13" cy="13" r="11" fill="none" stroke="rgba(197,147,90,0.6)" strokeWidth="0.9" />
            <circle cx="13" cy="13" r="3.5" fill="#C5935A" />
          </svg>
        )}

        {state === 'pending' && (
          <svg viewBox="0 0 26 26" width={26} height={26} style={{ overflow: 'visible' }}>
            <circle cx="13" cy="13" r="11" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="0.9" />
            <motion.circle
              cx="13" cy="13" r="3.5" fill="#C5935A"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        )}

        {state === 'glow' && (
          <svg viewBox="0 0 26 26" width={26} height={26}
            style={{ overflow: 'visible', filter: glowFilter, transition: 'filter 0.2s ease' }}>
            <circle cx="13" cy="13" r="11" fill="none" stroke="rgba(197,147,90,0.55)" strokeWidth="0.9" />
            <circle cx="13" cy="13" r="3.5" fill="#C5935A" />
          </svg>
        )}
      </button>
    </div>
  );
}
