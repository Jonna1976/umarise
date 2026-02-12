import { motion } from 'framer-motion';

interface OriginButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * V7 Hexagon navigation button — 24px, tap → Wall
 * Position: top-left (handled by parent)
 */
export function OriginButton({ onClick, className = '' }: OriginButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-[42px] h-[42px] cursor-pointer flex items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ opacity: 1 }}
      aria-label="Open Anchor Registry"
    >
      <svg viewBox="0 0 28 28" width={24} height={24}>
        <polygon
          points="14,2.5 24.5,8.5 24.5,20.5 14,26.5 3.5,20.5 3.5,8.5"
          fill="hsl(var(--ritual-gold))"
        />
        <rect x="9.5" y="9.5" width="9" height="9" rx="1.2" fill="hsl(var(--ritual-surface))" />
      </svg>
    </motion.button>
  );
}
