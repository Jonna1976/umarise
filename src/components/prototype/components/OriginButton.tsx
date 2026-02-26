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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="hsl(var(--ritual-gold))">
        <rect x="1" y="1" width="7" height="7" rx="1.5" />
        <rect x="10" y="1" width="7" height="7" rx="1.5" />
        <rect x="1" y="10" width="7" height="7" rx="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="1.5" />
      </svg>
    </motion.button>
  );
}
