import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface LivingCircleProps {
  isDraggingOver?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * LivingCircle — Breathing portal where beginnings arise
 * 
 * All elements pulse together in sync - unified breathing.
 */
export function LivingCircle({ isDraggingOver = false, onClick, className = '' }: LivingCircleProps) {
  // Unified breathing rhythm - everything pulses together
  const breathDuration = 3;
  const breathEase = 'easeInOut';

  return (
    <motion.button
      onClick={onClick}
      className={`relative w-72 h-72 rounded-full flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Breathing ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDraggingOver
            ? [
                '0 0 80px 40px rgba(180, 150, 90, 0.15)',
                '0 0 120px 60px rgba(180, 150, 90, 0.25)',
                '0 0 80px 40px rgba(180, 150, 90, 0.15)',
              ]
            : [
                '0 0 40px 15px rgba(180, 150, 90, 0.05)',
                '0 0 80px 35px rgba(180, 150, 90, 0.12)',
                '0 0 40px 15px rgba(180, 150, 90, 0.05)',
              ],
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: breathEase,
        }}
      />

      {/* The open circle with pulsing accent dot */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        {/* Glow layer for the arc - synced */}
        <motion.path
          d="M 94 50 A 44 44 0 1 1 78 14"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.15"
          style={{ filter: 'blur(8px)' }}
          animate={{
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: breathEase,
          }}
        />

        {/* Main arc - synced */}
        <motion.path
          d="M 94 50 A 44 44 0 1 1 78 14"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="0.8"
          strokeLinecap="round"
          animate={{
            opacity: [0.6, 0.85, 0.6],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: breathEase,
          }}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(180, 150, 90, 0.5))',
          }}
        />
        
        {/* Pulsing accent dot - synced */}
        <motion.circle
          cx="78"
          cy="14"
          r="2.5"
          fill="hsl(var(--codex-gold))"
          animate={{
            opacity: [0.7, 1, 0.7],
            r: [2.5, 3.5, 2.5],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: breathEase,
          }}
          style={{
            filter: 'drop-shadow(0 0 10px rgba(180, 150, 90, 0.9))',
          }}
        />

        {/* Dot glow halo - synced */}
        <motion.circle
          cx="78"
          cy="14"
          r="6"
          fill="rgba(180, 150, 90, 0.3)"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            r: [6, 10, 6],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: breathEase,
          }}
          style={{
            filter: 'blur(3px)',
          }}
        />
      </svg>

      {/* Camera icon - synced breathing */}
      <motion.div
        className="relative z-10"
        animate={{
          opacity: [0.4, 0.65, 0.4],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: breathEase,
        }}
      >
        <Camera 
          className="w-14 h-14 text-codex-gold"
          strokeWidth={1}
          style={{
            filter: 'drop-shadow(0 0 12px rgba(180, 150, 90, 0.4))',
          }}
        />
      </motion.div>

      {/* Outer breathing pulse ring - synced */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: '1px solid',
          borderColor: 'hsl(var(--codex-gold) / 0.2)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Inner subtle glow pulse - synced */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '20%',
          background: 'radial-gradient(circle, rgba(180, 150, 90, 0.08) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: breathEase,
        }}
      />
    </motion.button>
  );
}
