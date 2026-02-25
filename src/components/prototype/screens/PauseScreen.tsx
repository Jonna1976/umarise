import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';

interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
  mimeType?: string;
  fileName?: string;
}

interface PauseScreenProps {
  artifact: Artifact;
  onComplete: () => void;
}

export function PauseScreen({ artifact, onComplete }: PauseScreenProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 cursor-pointer"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onComplete}
    >
      <motion.h1
        className="font-playfair text-[26px] text-ritual-gold mb-6 pointer-events-none"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        Your artifact
      </motion.h1>

      <motion.div
        className="w-[250px] h-[190px] rounded-[4px] overflow-hidden"
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
      >
        <ArtifactDisplay type={artifact.type} imageUrl={artifact.imageUrl || undefined} mimeType={artifact.mimeType} fileName={artifact.fileName} />
      </motion.div>

      <motion.p
        className="mt-5 font-garamond text-[28px] italic pointer-events-none"
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
