import { motion } from 'framer-motion';

/**
 * Screen 5: Home
 * The invitation to return. Not a notification. A whisper after silence.
 * Encourages PWA install via "add to home screen".
 */
export function HomeScreen() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main message */}
      <motion.h1
        className="font-playfair font-light text-xl text-ritual-cream text-center leading-relaxed mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Anchor what matters.
      </motion.h1>

      {/* Install hint - appears after delay */}
      <motion.p
        className="font-garamond italic text-[13px] text-ritual-gold-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 3 }}
      >
        share › add to home screen
      </motion.p>
    </motion.div>
  );
}
