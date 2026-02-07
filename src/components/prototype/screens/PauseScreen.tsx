import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';

interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
}

interface PauseScreenProps {
  artifact: Artifact;
  onComplete: () => void;
}

/**
 * Screen 2: Pause
 * 
 * Per briefing sectie 4 (S2):
 * - "Your artifact" — 22px Playfair 300, gold
 * - Foto in native oriëntatie (object-fit: contain)
 * - "✓ saved to your device" — italic, bevestiging (NIET een knop)
 * - Tap anywhere to continue to S3
 * 
 * No auto-advance — waits for user to tap to continue.
 */
export function PauseScreen({ artifact, onComplete }: PauseScreenProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 cursor-pointer"
      style={{ background: 'hsl(var(--ritual-bg))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onComplete}
    >
      {/* Title — per briefing sectie 10: 22px Playfair 300, #C5935A */}
      <motion.h1
        className="font-playfair text-[22px] text-ritual-gold mb-6 pointer-events-none"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        Your artifact
      </motion.h1>

      {/* Artifact container — tap anywhere to continue */}
      <motion.div
        className="w-[250px] h-[190px] rounded-[4px] overflow-hidden"
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
      >
        <ArtifactDisplay type={artifact.type} imageUrl={artifact.imageUrl || undefined} />
      </motion.div>

      {/* Save confirmation — per briefing: "✓ saved to your device" is a static confirmation, NOT a button */}
      <motion.p
        className="mt-5 font-garamond text-[12px] italic pointer-events-none"
        style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        ✓ saved to your device
      </motion.p>
    </motion.div>
  );
}