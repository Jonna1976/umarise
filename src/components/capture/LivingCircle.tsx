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
 * - Outer breathing ring (gold, subtle pulse)  
 * - Accent dot at gap
 * - Inner dark core with golden camera icon (iPhone-style)
 * - Breathing pulse effect
 */
export function LivingCircle({ isDraggingOver = false, onClick, className = '' }: LivingCircleProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-72 h-72 rounded-full flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer breathing glow - the aura */}
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

      {/* Outer gold ring - clean single line */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 0 15px rgba(200, 170, 100, 0.4))' }}
      >
        {/* The outer ring - open arc with gap at top-right */}
        <motion.circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="1.5"
          strokeDasharray="580 17" // Creates the gap
          strokeDashoffset="-40" // Positions the gap at top-right
          strokeLinecap="round"
          animate={{
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Accent dot at the gap position */}
        <motion.circle
          cx="175"
          cy="40"
          r="5"
          fill="hsl(var(--codex-gold))"
          animate={{
            opacity: [0.7, 1, 0.7],
            r: [5, 6, 5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(200, 170, 100, 0.8))',
          }}
        />
      </svg>

      {/* Inner ring - second boundary */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '12px',
          border: '1px solid',
          borderColor: 'hsl(var(--codex-gold) / 0.3)',
        }}
        animate={{
          borderColor: [
            'hsl(var(--codex-gold) / 0.25)',
            'hsl(var(--codex-gold) / 0.45)',
            'hsl(var(--codex-gold) / 0.25)',
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
          inset: '16px',
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
        {/* Central glow - the heartbeat center */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 170, 100, 0.1) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Camera icon - golden, iPhone-style */}
        <motion.div
          className="relative z-10"
          animate={{
            opacity: [0.6, 0.9, 0.6],
            scale: [0.95, 1.02, 0.95],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Camera 
            className="w-16 h-16 text-codex-gold" 
            strokeWidth={1.2}
            style={{
              filter: 'drop-shadow(0 0 12px rgba(200, 170, 100, 0.5))',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Pulse rings - the breath - more prominent */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-codex-gold/40"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-codex-gold/25"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2.5,
          delay: 0.8,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.button>
  );
}
