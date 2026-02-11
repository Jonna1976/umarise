/**
 * Screen 6: Owned.
 * 
 * Per briefing sectie 4 (S6):
 * - "Owned." with period — one word
 * - Origin dot returns with same breathing as S0
 * - Auto-advance to S7 (Wall) after 2 seconds
 * - Nothing more. Resist the urge.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface OwnedScreenProps {
  onComplete: () => void;
}

export function OwnedScreen({ onComplete }: OwnedScreenProps) {
  // Auto-advance to Wall after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title — per briefing sectie 10: 22px Playfair 300, #C5935A */}
      <motion.h1
        className="font-playfair text-[26px] text-ritual-gold mb-7"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Owned.
      </motion.h1>

      {/* Origin dot — same breathing animation as S0 */}
      <motion.div
        className="w-3 h-3 rounded-full bg-ritual-gold"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          boxShadow: [
            '0 0 20px hsl(var(--ritual-gold-glow))',
            '0 0 35px hsl(var(--ritual-gold-glow)), 0 0 70px hsl(32 55% 55% / 0.2)',
            '0 0 20px hsl(var(--ritual-gold-glow))',
          ],
          scale: [1, 1.15, 1],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6 },
          boxShadow: { duration: 3, delay: 1, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 3, delay: 1, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </motion.div>
  );
}
