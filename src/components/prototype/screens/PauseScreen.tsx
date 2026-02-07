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
      let blob: Blob;
      
      // Handle data URL directly without fetch (more reliable)
      if (artifact.imageUrl.startsWith('data:')) {
        const [header, base64] = artifact.imageUrl.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const byteString = atob(base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([uint8Array], { type: mimeType });
      } else {
        // For blob URLs or http URLs
        const response = await fetch(artifact.imageUrl);
        blob = await response.blob();
      }
      
      const file = new File([blob], `umarise-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Check if Web Share API with files is supported
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        setSaved(true);
        toast.success('Saved');
      } else {
        // Fallback: create object URL and open in new tab
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank');
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
        toast('Long-press image to save', { duration: 3000 });
        setSaved(true);
      }
    } catch (error) {
      // User cancelled share sheet - that's fine
      if ((error as Error).name === 'AbortError') {
        setSaved(true);
      } else {
        console.error('[PauseScreen] Save error:', error);
        // Last resort fallback - open image directly
        if (artifact.imageUrl) {
          window.open(artifact.imageUrl, '_blank');
          toast('Long-press image to save', { duration: 3000 });
        } else {
          toast.error('Could not save');
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [artifact.imageUrl, isSaving]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
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

      {/* Save confirmation — per briefing: "✓ saved to your device" italic */}
      <motion.div
        className="mt-5"
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
              className="font-garamond text-[12px] italic transition-opacity
                         disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
              whileHover={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
            >
              {isSaving ? 'saving...' : '✓ saved to your device'}
            </motion.button>
          ) : (
            <motion.span
              key="saved"
              className="font-garamond text-[12px] italic"
              style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ saved to your device
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hint to continue */}
      <motion.p
        className="absolute bottom-10 font-garamond text-[11px] italic"
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