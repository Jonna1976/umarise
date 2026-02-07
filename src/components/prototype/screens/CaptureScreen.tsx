import { useCallback, useId } from 'react';
import { motion } from 'framer-motion';

interface CaptureScreenProps {
  onCapture: (imageDataUrl: string) => void;
}

/**
 * Screen 1: Capture
 * 
 * Per briefing sectie 4 (S1):
 * - Origin dot centraal in capture ring
 * - Dezelfde dot als op het welkomstscherm, dezelfde ademhaling
 * - Tik op de dot → native OS-menu (Take Photo / Photo Library)
 * - Semantisch leeg — geen copy, instructies, of framing
 * 
 * Technisch: <input type="file" accept="image/*"> via <label>
 */
export function CaptureScreen({ onCapture }: CaptureScreenProps) {
  const inputId = useId();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.warn('[Capture] Invalid file type:', file.type);
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      console.log('[Capture] Image loaded:', file.name, `(${(file.size / 1024).toFixed(1)}KB)`);
      onCapture(dataUrl);
    };
    reader.onerror = () => {
      console.error('[Capture] Failed to read file');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onCapture]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'hsl(var(--ritual-bg))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/*
        Keep input in the layout tree (NOT display:none) for iOS reliability.
        It remains visually hidden but still clickable via <label>.
      */}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Capture ring with origin dot — per briefing: "dezelfde dot als op het welkomstscherm" */}
      <motion.label
        htmlFor={inputId}
        className="relative w-[180px] h-[180px] flex items-center justify-center cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Select a photo"
      >
        {/* Dashed circle (capture ring) */}
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

        {/* Origin dot — same breathing animation as S0, centered in ring */}
        <motion.div
          className="w-3 h-3 rounded-full bg-ritual-gold"
          animate={{
            boxShadow: [
              '0 0 20px hsl(var(--ritual-gold-glow))',
              '0 0 35px hsl(var(--ritual-gold-glow)), 0 0 70px hsl(32 55% 55% / 0.2)',
              '0 0 20px hsl(var(--ritual-gold-glow))',
            ],
            scale: [1, 1.15, 1],
          }}
          transition={{
            boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </motion.label>
    </motion.div>
  );
}