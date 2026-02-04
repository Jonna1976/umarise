import { motion } from 'framer-motion';

interface CaptureScreenProps {
  onCapture: () => void;
}

/**
 * Screen 1: Capture
 * The capture space. The "+" opens the camera directly.
 * Semantically empty - no copy, instructions, or framing.
 */
export function CaptureScreen({ onCapture }: CaptureScreenProps) {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-ritual-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Capture circle with dashed stroke */}
      <motion.div
        className="relative w-[180px] h-[180px] flex items-center justify-center cursor-pointer group"
        onClick={onCapture}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Dashed circle */}
        <svg 
          viewBox="0 0 180 180" 
          className="absolute inset-0 w-full h-full"
        >
          <circle
            cx="90"
            cy="90"
            r="82"
            fill="none"
            stroke="hsl(var(--ritual-gold))"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.3"
          />
        </svg>

        {/* Status dot - breathing animation, top-right of circle */}
        <motion.div
          className="absolute top-[10px] right-[24px] w-2 h-2 rounded-full bg-ritual-gold"
          animate={{
            opacity: [0.9, 0.4, 0.9],
            boxShadow: [
              '0 0 6px hsl(var(--ritual-gold-glow))',
              '0 0 2px hsl(var(--ritual-gold-glow))',
              '0 0 6px hsl(var(--ritual-gold-glow))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Plus symbol */}
        <motion.span
          className="font-playfair font-light text-[40px] text-ritual-gold opacity-50 group-hover:opacity-80 transition-opacity duration-300"
        >
          +
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
