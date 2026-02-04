import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * Screen 0: Welcome (First Launch Only)
 * Silence, a sentence, a breathing origin dot.
 * After first interaction this screen is never shown again.
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  // Auto-advance after animation completes (optional - can also require tap)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Could auto-advance here, but for demo we require interaction
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, hsl(140 25% 9%), hsl(var(--ritual-surface)) 70%)',
      }}
      onClick={onComplete}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title: "This is where it began" */}
      <motion.h1
        className="font-playfair font-light text-[22px] text-ritual-cream mb-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        This is where it began
      </motion.h1>

      {/* Origin dot - 12x12px, pulsing */}
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
          opacity: { duration: 1, delay: 1.2 },
          boxShadow: { duration: 3, delay: 2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 3, delay: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </motion.div>
  );
}
