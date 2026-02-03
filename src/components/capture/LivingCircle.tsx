import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface LivingCircleProps {
  isDraggingOver?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * LivingCircle — Elegant open circle with accent dot
 * 
 * Exact reference: Open gold circle, gap at top-right, 
 * accent dot at the opening, camera icon centered.
 * Pure, minimal, no complexity.
 */
export function LivingCircle({ isDraggingOver = false, onClick, className = '' }: LivingCircleProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-72 h-72 rounded-full flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDraggingOver
            ? [
                '0 0 60px 30px rgba(180, 150, 90, 0.12)',
                '0 0 90px 45px rgba(180, 150, 90, 0.2)',
                '0 0 60px 30px rgba(180, 150, 90, 0.12)',
              ]
            : [
                '0 0 40px 20px rgba(180, 150, 90, 0.06)',
                '0 0 60px 30px rgba(180, 150, 90, 0.1)',
                '0 0 40px 20px rgba(180, 150, 90, 0.06)',
              ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* The open circle with accent dot - exact reference match */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 0 15px rgba(180, 150, 90, 0.25))' }}
      >
        {/* Open arc - starting from right side, going almost full circle */}
        {/* Gap is at approximately 1-2 o'clock position */}
        <motion.path
          d="M 94 50 A 44 44 0 1 1 78 14"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Accent dot at the gap opening */}
        <motion.circle
          cx="78"
          cy="14"
          r="3"
          fill="hsl(var(--codex-gold))"
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(180, 150, 90, 0.8))',
          }}
        />
      </svg>

      {/* Camera icon - centered, subtle gold, matching the U reference style */}
      <motion.div
        className="relative z-10"
        animate={{
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Camera 
          className="w-16 h-16 text-codex-gold"
          strokeWidth={1}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(180, 150, 90, 0.4))',
          }}
        />
      </motion.div>

      {/* Breathing pulse - subtle */}
      <motion.div
        className="absolute inset-0 rounded-full border border-codex-gold/20"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.button>
  );
}
