import { motion } from 'framer-motion';

interface LivingCircleProps {
  isDraggingOver?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * LivingCircle — The beating heart of the capture interface
 * 
 * Visual elements per reference:
 * - Outer breathing ring (gold, subtle pulse)
 * - Accent dot (orbiting or fixed at gap)
 * - Inner dark core with faint U
 * - Particles/traces that fade toward center (heartbeat rhythm)
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
                '0 0 60px 25px rgba(200, 170, 100, 0.15)',
                '0 0 80px 35px rgba(200, 170, 100, 0.25)',
                '0 0 60px 25px rgba(200, 170, 100, 0.15)',
              ]
            : [
                '0 0 40px 15px rgba(200, 170, 100, 0.08)',
                '0 0 60px 25px rgba(200, 170, 100, 0.15)',
                '0 0 40px 15px rgba(200, 170, 100, 0.08)',
              ],
        }}
        transition={{
          duration: isDraggingOver ? 1.5 : 4, // Heartbeat rhythm
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Outer gold ring with gap - the boundary */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 0 12px rgba(200, 170, 100, 0.3))' }}
      >
        {/* The breathing ring - open arc */}
        <motion.path
          d="M 185 100 A 85 85 0 1 1 165 35"
          fill="none"
          stroke="hsl(var(--codex-gold))"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Accent dot at the gap - the pulse point */}
        <motion.circle
          cx="165"
          cy="35"
          r="4"
          fill="hsl(var(--codex-gold))"
          animate={{
            opacity: [0.6, 1, 0.6],
            r: [4, 5, 4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Inner ring - the second boundary */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '20px',
          border: '1px solid rgba(200, 170, 100, 0.25)',
        }}
        animate={{
          borderColor: [
            'rgba(200, 170, 100, 0.2)',
            'rgba(200, 170, 100, 0.35)',
            'rgba(200, 170, 100, 0.2)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* The dark core */}
      <motion.div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: '24px',
          background: 'radial-gradient(ellipse at center, #12140f 0%, #0a0c08 100%)',
        }}
        animate={{
          scale: isDraggingOver ? [1, 0.97, 1] : [1, 0.99, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Fading traces/particles - drifting toward center */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * 360;
          const startDistance = 65 + (i % 4) * 10;
          const duration = 5 + (i % 3) * 2;
          const opacity = 0.15 + (i % 4) * 0.08;
          const size = 2 + (i % 3);

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                background: `rgba(200, 170, 100, ${opacity})`,
                left: '50%',
                top: '50%',
                boxShadow: `0 0 ${size * 2}px rgba(200, 170, 100, ${opacity * 0.5})`,
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * startDistance,
                  0,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * startDistance,
                  0,
                ],
                opacity: [opacity, 0],
                scale: [1, 0.3],
              }}
              transition={{
                duration: isDraggingOver ? duration * 0.5 : duration,
                repeat: Infinity,
                delay: (i % 6) * 0.6,
                ease: 'easeIn',
              }}
            />
          );
        })}

        {/* Central glow - the heartbeat center */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 170, 100, 0.08) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.9, 1.05, 0.9],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* The U - barely visible, felt more than seen */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span
            className="font-serif text-5xl text-codex-gold select-none"
            style={{ fontWeight: 400 }}
          >
            U
          </span>
        </motion.div>
      </motion.div>

      {/* Pulse rings - the breath */}
      <motion.div
        className="absolute inset-4 rounded-full border border-codex-gold/20"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-codex-gold/15"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0, 0.2],
        }}
        transition={{
          duration: 4,
          delay: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.button>
  );
}
