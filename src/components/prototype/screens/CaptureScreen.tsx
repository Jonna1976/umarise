import { useCallback, useId } from 'react';
import { motion } from 'framer-motion';

interface CaptureScreenProps {
  onCapture: (imageDataUrl: string) => void;
}

/**
 * Screen 1: Capture
 * The "+" opens the system picker.
 * Semantically empty - no copy, instructions, or framing.
 *
 * iOS/Safari note:
 * Use a real <label htmlFor> click target (not input.click()) to preserve
 * the user-gesture context reliably inside mobile webviews.
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
      className="min-h-screen flex items-center justify-center bg-ritual-surface"
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

      {/* Capture circle with dashed stroke */}
      <motion.label
        htmlFor={inputId}
        className="relative w-[180px] h-[180px] flex items-center justify-center cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Select a photo"
      >
        {/* Dashed circle */}
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

        {/* Status dot - breathing animation, top-right of circle */}
        <motion.div
          className="absolute top-[10px] right-[24px] w-2 h-2 rounded-full bg-ritual-gold"
          animate={{
            opacity: [0.9, 0.4, 0.9],
            boxShadow: [
              '0 0 6px hsl(var(--ritual-gold-glow))',
              '0 0 2px hsl(var(--ritual-gold-glow))',
              '0 0 6px hsl(var(--ritual-gold-glow))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Plus symbol */}
        <motion.span
          className="font-playfair font-light text-[40px] text-ritual-gold opacity-50 group-hover:opacity-80 transition-opacity duration-300"
        >
          +
        </motion.span>
      </motion.label>
    </motion.div>
  );
}
