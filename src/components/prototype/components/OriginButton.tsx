import { motion } from 'framer-motion';
import { OriginMark } from './OriginMark';

interface OriginButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * The Origin Mark navigation button — 28px circumpunct (orbit symbol)
 * Position: top: 40px, left: 18px (main screens) or top: 38px, left: 16px (registry)
 * Tapping opens Origin Registry
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
      aria-label="Open Origin Registry"
    >
      <OriginMark
        size={28}
        state="anchored"
        animated
        variant="dark"
      />
    </motion.button>
  );
}
