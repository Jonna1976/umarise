import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

const FIRST_ARRIVAL_KEY = 'umarise-first-arrival-shown';

interface FirstArrivalScreenProps {
  onComplete: () => void;
}

/**
 * FirstArrivalScreen - The origin moment.
 * 
 * Shown once when someone arrives at the PWA for the first time
 * (typically via a shared link). Never shown again.
 * 
 * Design: Deep forest green background, centered text "This is where it began",
 * with a breathing golden origin dot below. Minimal, ritualistic, silent.
 * 
 * Auto-dismisses after ~4 seconds, or user can tap anywhere to continue.
 */
export function FirstArrivalScreen({ onComplete }: FirstArrivalScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Mark as shown and transition out
  const handleDismiss = useCallback(() => {
    if (!isVisible) return;
    
    triggerHaptic('light');
    localStorage.setItem(FIRST_ARRIVAL_KEY, 'true');
    setIsVisible(false);
    
    // Wait for fade out animation before calling onComplete
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [isVisible, onComplete]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-codex-ink-deep via-codex-ink to-codex-forest cursor-pointer"
    >
      {/* The recognition statement */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        className="font-serif text-2xl sm:text-3xl text-codex-cream/80 leading-relaxed text-center px-8"
      >
        This is where it began
      </motion.p>

      {/* Breathing origin dot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
        className="mt-8"
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-codex-gold"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            boxShadow: '0 0 24px 10px rgba(200, 170, 100, 0.25)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Check if first arrival screen should be shown.
 * Now always returns true - First Arrival is part of the permanent ritual flow.
 */
export function shouldShowFirstArrival(): boolean {
  return true;
}
