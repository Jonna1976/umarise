import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * Screen 0: Welcome (First Launch Only)
 * Silence, a sentence, a breathing origin dot.
 * After first interaction this screen is never shown again.
 * 
 * Copy: "You are the origin." — dienend, erkenning dat de gebruiker de bron is.
 * Dot: Sterke hartslag-pulsatie, voelbaar als levend centrum.
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, hsl(120 25% 11%), hsl(var(--ritual-surface)) 70%)',
      }}
      onClick={onComplete}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title — dienend, erkenning: jij bent de bron */}
      <motion.h1
        className="font-playfair font-light text-[26px] text-ritual-cream mb-7"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        You are the origin.
      </motion.h1>

      {/* Origin dot — heartbeat pulse, voelbaar als levend centrum */}
      <motion.div
        className="w-3.5 h-3.5 rounded-full bg-ritual-gold"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          boxShadow: [
            '0 0 12px hsl(var(--ritual-gold-glow))',
            '0 0 40px hsl(var(--ritual-gold-glow)), 0 0 80px hsl(32 55% 55% / 0.3)',
            '0 0 18px hsl(var(--ritual-gold-glow)), 0 0 50px hsl(32 55% 55% / 0.15)',
            '0 0 12px hsl(var(--ritual-gold-glow))',
          ],
          scale: [1, 1.3, 1.05, 1],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 1.2 },
          boxShadow: { duration: 2.4, delay: 1.8, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 2.4, delay: 1.8, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </motion.div>
  );
}
