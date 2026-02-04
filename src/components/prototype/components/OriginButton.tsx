import { motion } from 'framer-motion';

interface OriginButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * The "U" Origin Button - 42x42px navigational element
 * Tapping opens Wall of Existence
 * Long-press (1.2s) triggers backup (future feature)
 */
export function OriginButton({ onClick, className = '' }: OriginButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-[42px] h-[42px] cursor-pointer ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ opacity: 1 }}
      aria-label="Open Wall of Existence"
    >
      <svg viewBox="0 0 42 42" width="42" height="42">
        {/* Thin circle */}
        <circle 
          cx="21" 
          cy="21" 
          r="17" 
          fill="none" 
          stroke="hsl(var(--ritual-gold))" 
          strokeWidth="0.5" 
          opacity="0.2"
        />
        {/* Arc stroke (~270°) */}
        <path 
          d="M33 12A15 15 0 1 1 29 8.5" 
          fill="none" 
          stroke="hsl(var(--ritual-gold))" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          opacity="0.6"
        />
        {/* Pulsing dot at arc end */}
        <motion.circle 
          cx="33" 
          cy="12" 
          r="2" 
          fill="hsl(var(--ritual-gold))"
          animate={{ opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Centered U */}
        <text 
          x="21" 
          y="26" 
          textAnchor="middle" 
          fontFamily="'Playfair Display', Georgia, serif" 
          fontSize="16" 
          fontWeight="400" 
          fill="hsl(var(--ritual-gold))" 
          opacity="0.85"
        >
          U
        </text>
      </svg>
    </motion.button>
  );
}
