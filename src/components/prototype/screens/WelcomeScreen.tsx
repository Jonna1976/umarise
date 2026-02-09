import { motion } from 'framer-motion';
import { OriginMark } from '../components/OriginMark';

interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * Screen 0: Welcome (First Launch Only)
 * Silence, a sentence, a breathing origin mark.
 * After first interaction this screen is never shown again.
 * 
 * Copy: "You are the origin." — dienend, erkenning dat de gebruiker de bron is.
 * 
 * Animation sequence (per briefing):
 * 1. Text "You are the origin." fade in (1.5s ease, delay 0.5s)
 * 2. Dot appears (scale 0→1, 0.8s ease, delay 1.5s)
 * 3. Circle draws itself around dot (stroke-dashoffset, 2s, delay 2s)
 * 4. Dot starts subtle pulse (3s infinite, delay 3.5s)
 * 
 * De bron eerst, de verankering volgt.
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

      {/* Origin Mark — circumpunct with intro animation sequence
          48x48px, with glow filter, intro animation:
          dot scale-in → ring stroke-draw → heartbeat pulse */}
      <OriginMark
        size={48}
        state="anchored"
        glow
        introAnimation
      />
    </motion.div>
  );
}
