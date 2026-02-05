import { useEffect } from 'react';
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
 * The artifact appears in darkness. Nothing else.
 * Just the beginning and you. A moment of quiet contemplation.
 */
export function PauseScreen({ artifact, onComplete }: PauseScreenProps) {
  // Auto-advance after contemplation period
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-ritual-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Artifact container with entrance animation */}
      <motion.div
        className="w-[250px] h-[190px] rounded-[4px] overflow-hidden"
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
      >
        <ArtifactDisplay type={artifact.type} imageUrl={artifact.imageUrl || undefined} />
      </motion.div>
    </motion.div>
  );
}
