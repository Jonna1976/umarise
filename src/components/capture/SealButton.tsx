import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';
import { Check } from 'lucide-react';

interface SealButtonProps {
  onSeal: () => void;
  count?: number;
  disabled?: boolean;
}

const SEAL_DURATION = 1200; // 1.2 seconds to complete the seal (faster)
const HAPTIC_INTERVALS = [0, 300, 600, 900]; // Building haptic feedback (faster)

/**
 * SealButton — A press-and-hold ritual button
 * 
 * The user must hold the button while a golden ring closes around it.
 * Release too early → ring retracts (incomplete gesture)
 * Hold until complete → glow flash, seal complete, callback fires
 */
export function SealButton({ onSeal, count = 1, disabled = false }: SealButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [isSealed, setIsSealed] = useState(false);
  const progressRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hapticTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const startTimeRef = useRef<number>(0);

  // Clean up all timers
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    hapticTimeoutsRef.current.forEach(t => clearTimeout(t));
    hapticTimeoutsRef.current = [];
  }, []);

  // Handle press start
  const handlePressStart = useCallback(() => {
    if (disabled || isSealed) return;
    
    setIsPressed(true);
    startTimeRef.current = Date.now();
    triggerHaptic('light');

    // Schedule building haptics
    hapticTimeoutsRef.current = HAPTIC_INTERVALS.map((delay, i) => 
      setTimeout(() => {
        const style = i < 2 ? 'light' : i < 4 ? 'medium' : 'heavy';
        triggerHaptic(style as 'light' | 'medium' | 'heavy');
      }, delay)
    );

    // Animate progress
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / SEAL_DURATION) * 100, 100);
      progressRef.current = newProgress;
      setProgress(newProgress);

      if (newProgress >= 100) {
        cleanup();
        setIsSealed(true);
        triggerHaptic('success');
        
        // Small delay before firing callback for visual feedback
        setTimeout(() => {
          onSeal();
        }, 400);
      }
    }, 16); // ~60fps
  }, [disabled, isSealed, cleanup, onSeal]);

  // Handle press end (release)
  const handlePressEnd = useCallback(() => {
    if (!isPressed) return;
    
    setIsPressed(false);
    cleanup();

    // If not sealed, retract the ring
    if (progressRef.current < 100) {
      triggerHaptic('light');
      
      // Animate retraction
      const retractInterval = setInterval(() => {
        setProgress(prev => {
          const newVal = prev - 8; // Faster retraction than progress
          if (newVal <= 0) {
            clearInterval(retractInterval);
            progressRef.current = 0;
            return 0;
          }
          progressRef.current = newVal;
          return newVal;
        });
      }, 16);
    }
  }, [isPressed, cleanup]);

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Reset when count changes (new capture)
  useEffect(() => {
    setIsSealed(false);
    setProgress(0);
    progressRef.current = 0;
  }, [count]);

  const circumference = 2 * Math.PI * 42; // radius 42 for the ring
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <motion.button
      className="relative w-20 h-20 rounded-full flex items-center justify-center select-none touch-none"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      disabled={disabled || isSealed}
      whileTap={{ scale: 0.95 }}
      aria-label="Hold to seal"
    >
      {/* Background base */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-codex-gold/20"
        animate={{
          backgroundColor: isPressed 
            ? 'rgba(200, 170, 100, 0.35)' 
            : isSealed 
              ? 'rgba(200, 170, 100, 0.8)'
              : 'rgba(200, 170, 100, 0.2)',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Progress ring */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="3"
          opacity="0.2"
        />
        {/* Progress arc */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: isPressed ? 'drop-shadow(0 0 8px rgba(200, 170, 100, 0.6))' : 'none',
          }}
        />
      </svg>

      {/* Glow effect when sealing */}
      <AnimatePresence>
        {isSealed && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [1, 0], 
              scale: [1, 1.4],
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 40px 20px rgba(200, 170, 100, 0.5)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Inner content */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={{
          scale: isPressed ? 0.9 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        {isSealed ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Check className="w-8 h-8 text-codex-ink" strokeWidth={2.5} />
          </motion.div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-codex-gold font-serif text-2xl">{count}</span>
          </div>
        )}
      </motion.div>

      {/* Subtle pulse when not pressed */}
      {!isPressed && !isSealed && (
        <motion.div
          className="absolute inset-0 rounded-full border border-codex-gold/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
}
