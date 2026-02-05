import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { toast } from 'sonner';

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
 * 
 * No auto-advance - waits for user to tap the photo to continue.
 * Subtle "save" option for users who want to keep the original on-device.
 */
export function PauseScreen({ artifact, onComplete }: PauseScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveToPhotos = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onComplete
    if (!artifact.imageUrl || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Convert data URL or blob URL to File for native share
      const response = await fetch(artifact.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `umarise-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Use native share with file - opens share sheet where user can "Save to Photos"
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
        setSaved(true);
        toast.success('Saved');
      } else {
        // Fallback for browsers that don't support file sharing
        // Use clipboard or show message
        toast('Open the image and long-press to save', { duration: 3000 });
      }
    } catch (error) {
      // User cancelled share sheet - that's fine
      if ((error as Error).name !== 'AbortError') {
        console.error('[PauseScreen] Save error:', error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [artifact.imageUrl, isSaving]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onComplete}
    >
      {/* Artifact container - tap to continue */}
      <motion.div
        className="w-[250px] h-[190px] rounded-[4px] overflow-hidden cursor-pointer"
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        whileTap={{ scale: 0.98 }}
      >
        <ArtifactDisplay type={artifact.type} imageUrl={artifact.imageUrl || undefined} />
      </motion.div>

      {/* Save to device - very subtle, below artifact */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.button
              key="save"
              onClick={handleSaveToPhotos}
              disabled={isSaving || !artifact.imageUrl}
              className="font-garamond text-[11px] italic transition-opacity
                         disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
              whileHover={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
            >
              {isSaving ? 'saving...' : 'save to device'}
            </motion.button>
          ) : (
            <motion.span
              key="saved"
              className="font-garamond text-[11px] italic"
              style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              saved ✓
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hint to continue */}
      <motion.p
        className="absolute bottom-10 font-garamond text-[10px]"
        style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        tap to mark this beginning
      </motion.p>
    </motion.div>
  );
}