import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface LivingCircleProps {
  isDraggingOver?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * LivingCircle — The cosmic origin portal
 * 
 * Visual elements per reference (oerknal aesthetic):
 * - Outer blue/teal ethereal ring
 * - Inner gold origin ring  
 * - Prominent origin dot/sphere on the right edge
 * - Deep void center (the moment before creation)
 * - Subtle camera icon waiting in the void
 */
export function LivingCircle({ isDraggingOver = false, onClick, className = '' }: LivingCircleProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-80 h-80 rounded-full flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cosmic ambient glow - the universe breathing */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDraggingOver
            ? [
                '0 0 100px 50px rgba(200, 170, 100, 0.15), 0 0 200px 100px rgba(100, 140, 160, 0.1)',
                '0 0 150px 75px rgba(200, 170, 100, 0.25), 0 0 250px 120px rgba(100, 140, 160, 0.15)',
                '0 0 100px 50px rgba(200, 170, 100, 0.15), 0 0 200px 100px rgba(100, 140, 160, 0.1)',
              ]
            : [
                '0 0 60px 30px rgba(200, 170, 100, 0.08), 0 0 120px 60px rgba(100, 140, 160, 0.05)',
                '0 0 90px 45px rgba(200, 170, 100, 0.12), 0 0 160px 80px rgba(100, 140, 160, 0.08)',
                '0 0 60px 30px rgba(200, 170, 100, 0.08), 0 0 120px 60px rgba(100, 140, 160, 0.05)',
              ],
        }}
        transition={{
          duration: isDraggingOver ? 1.5 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* SVG rings and origin point */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
      >
        {/* OUTER RING - Blue/teal ethereal (the cosmos) */}
        <motion.circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke="hsl(200, 40%, 45%)"
          strokeWidth="1.2"
          animate={{
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(100, 160, 200, 0.4))',
          }}
        />

        {/* INNER RING - Gold origin ring (the boundary of creation) */}
        <motion.circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="1.5"
          animate={{
            opacity: [0.55, 0.8, 0.55],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'drop-shadow(0 0 10px rgba(200, 170, 100, 0.5))',
          }}
        />

        {/* THE ORIGIN POINT - Prominent sphere on the right edge */}
        {/* This is the "oerknal" - the singular point where everything begins */}
        <motion.circle
          cx="186"
          cy="100"
          r="7"
          fill="hsl(35, 50%, 55%)"
          animate={{
            opacity: [0.8, 1, 0.8],
            r: [7, 8, 7],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'drop-shadow(0 0 12px rgba(200, 170, 100, 0.9))',
          }}
        />
        
        {/* Origin point glow halo */}
        <motion.circle
          cx="186"
          cy="100"
          r="12"
          fill="none"
          stroke="hsl(35, 50%, 55%)"
          strokeWidth="1"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            r: [12, 16, 12],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* The deep void - the space before creation */}
      <motion.div
        className="absolute rounded-full overflow-hidden flex items-center justify-center"
        style={{
          inset: '28px',
          background: 'radial-gradient(ellipse at center, hsl(180, 8%, 8%) 0%, hsl(180, 10%, 4%) 70%, hsl(180, 12%, 2%) 100%)',
          boxShadow: 'inset 0 0 60px 20px rgba(0, 0, 0, 0.8)',
        }}
        animate={{
          scale: isDraggingOver ? [1, 0.98, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isDraggingOver ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {/* Subtle inner luminescence - the potential of creation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(100, 140, 160, 0.03) 0%, transparent 50%)',
          }}
        />

        {/* Camera icon - waiting in the void, subtle and patient */}
        <motion.div
          className="relative z-10"
          animate={{
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Camera 
            className="w-12 h-12"
            strokeWidth={1}
            style={{
              color: 'hsl(35, 35%, 50%)',
              filter: 'drop-shadow(0 0 8px rgba(200, 170, 100, 0.3))',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Breathing pulse ring - emanating from the origin */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: '1px solid hsl(var(--codex-gold) / 0.3)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0, 0.4],
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
