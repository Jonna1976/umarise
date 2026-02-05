import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { Download } from 'lucide-react';
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
 * Includes subtle "Save to Photos" option so users keep the original
 * on their device (iCloud/Google Drive) - Umarise never stores the image.
 */
export function PauseScreen({ artifact, onComplete }: PauseScreenProps) {
  const [showSaveHint, setShowSaveHint] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Show save hint after brief delay
  useEffect(() => {
    const hintTimer = setTimeout(() => setShowSaveHint(true), 1200);
    return () => clearTimeout(hintTimer);
  }, []);

  // Auto-advance after contemplation period (extended to allow save action)
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSaveToPhotos = useCallback(async () => {
    if (!artifact.imageUrl || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(artifact.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `umarise-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Try Web Share API first (native share sheet on mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Save to Photos',
        });
        toast.success('Saved to Photos');
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `umarise-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Photo downloaded');
      }
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('[PauseScreen] Save error:', error);
        toast.error('Could not save photo');
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

      {/* Save to Photos hint - appears subtly after delay */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSaveHint ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={handleSaveToPhotos}
          disabled={isSaving || !artifact.imageUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'hsl(var(--ritual-gold) / 0.08)',
            border: '1px solid hsl(var(--ritual-gold) / 0.2)',
            color: 'hsl(var(--ritual-gold) / 0.7)',
          }}
        >
          <Download className="w-4 h-4" />
          <span className="font-garamond text-sm">
            {isSaving ? 'Saving...' : 'Save to Photos'}
          </span>
        </button>
        
        <p className="mt-3 text-center font-garamond italic text-[10px]" 
           style={{ color: 'hsl(var(--ritual-cream) / 0.3)' }}>
          Your photo stays on your device · only the proof leaves
        </p>
      </motion.div>

      {/* Tap anywhere to continue hint */}
      <motion.p
        className="absolute bottom-8 font-garamond text-[11px]"
        style={{ color: 'hsl(var(--ritual-cream) / 0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showSaveHint ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onClick={onComplete}
      >
        tap to continue
      </motion.p>
    </motion.div>
  );
}