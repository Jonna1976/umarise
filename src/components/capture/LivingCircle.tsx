import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface LivingCircleProps {
  isDraggingOver?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * LivingCircle — The breathing heart of the capture interface
 * 
 * Visual elements per reference:
 * - Open circle with gap on the RIGHT (~3 o'clock)
 * - Accent dot at the gap position
 * - Inner dark core with golden camera icon
 */
export function LivingCircle({ isDraggingOver = false, onClick, className = '' }: LivingCircleProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-72 h-72 rounded-full flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer breathing glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDraggingOver
            ? [
                '0 0 80px 40px rgba(200, 170, 100, 0.2)',
                '0 0 120px 60px rgba(200, 170, 100, 0.35)',
                '0 0 80px 40px rgba(200, 170, 100, 0.2)',
              ]
            : [
                '0 0 50px 20px rgba(200, 170, 100, 0.1)',
                '0 0 80px 40px rgba(200, 170, 100, 0.2)',
                '0 0 50px 20px rgba(200, 170, 100, 0.1)',
              ],
        }}
        transition={{
          duration: isDraggingOver ? 1.2 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main circle with gap on RIGHT side (~3 o'clock) */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 0 12px rgba(200, 170, 100, 0.35))' }}
      >
        {/* Open arc - starts from bottom-right, goes almost full circle, gap at 3 o'clock */}
        <motion.path
          d="M 195 100 A 95 95 0 1 1 195 95"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            opacity: [0.6, 0.85, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Accent dot - positioned at the gap (3 o'clock, slightly above center-right) */}
        <motion.circle
          cx="195"
          cy="97"
          r="6"
          fill="hsl(var(--codex-gold))"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'drop-shadow(0 0 10px rgba(200, 170, 100, 0.8))',
          }}
        />
      </svg>

      {/* Inner subtle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '14px',
          border: '1px solid',
          borderColor: 'hsl(var(--codex-gold) / 0.25)',
        }}
        animate={{
          borderColor: [
            'hsl(var(--codex-gold) / 0.2)',
            'hsl(var(--codex-gold) / 0.4)',
            'hsl(var(--codex-gold) / 0.2)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* The dark core */}
      <motion.div
        className="absolute rounded-full overflow-hidden flex items-center justify-center"
        style={{
          inset: '18px',
          background: 'radial-gradient(ellipse at center, hsl(var(--codex-ink)) 0%, hsl(var(--codex-ink-deep)) 100%)',
        }}
        animate={{
          scale: isDraggingOver ? [1, 0.97, 1] : [1, 0.99, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Central glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 170, 100, 0.08) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Camera icon - golden, subtle */}
        <motion.div
          className="relative z-10"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.97, 1.02, 0.97],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Camera 
            className="w-14 h-14 text-codex-gold" 
            strokeWidth={1}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(200, 170, 100, 0.4))',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Pulse rings - more prominent breathing effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-codex-gold/30"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-codex-gold/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2.5,
          delay: 0.6,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.button>
  );
}
