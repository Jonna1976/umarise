import { useCallback, useId } from 'react';
import { motion } from 'framer-motion';

export interface CapturedFile {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
}

interface CaptureScreenProps {
  onCapture: (file: CapturedFile) => void;
  /** Whether this is the user's first visit (0 anchors) */
  isFirstVisit?: boolean;
}

/**
 * Screen 1: Capture — Two States
 * 
 * EERSTE BEZOEK (0 anchors):
 * - V7 mark centered, 42px, decorative (no navigation)
 * - Hero text: "Digital things change. / This does not. / Anchor."
 * - Dashed circle 120px with + (26px)
 * - No scroll, no navigation
 * 
 * TERUGKEREND (≥1 anchor):
 * - V7 mark top-left, 24px, tap → Wall (handled by parent)
 * - No text
 * - Dashed circle 180px with + (32px)
 * - Whisper "You are the origin." at bottom
 * - No scroll
 */
export function CaptureScreen({ onCapture, isFirstVisit = false }: CaptureScreenProps) {
  const inputId = useId();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      console.log('[Capture] File loaded:', file.name, `(${file.type}, ${(file.size / 1024).toFixed(1)}KB)`);
      onCapture({
        dataUrl,
        mimeType: file.type || 'application/octet-stream',
        fileName: file.name,
        fileSize: file.size,
      });
    };
    reader.onerror = () => {
      console.error('[Capture] Failed to read file');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [onCapture]);

  const circleSize = isFirstVisit ? 120 : 180;
  const plusSize = isFirstVisit ? 26 : 32;
  const circleR = (circleSize / 2) - 10;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{
        background: isFirstVisit
          ? 'radial-gradient(ellipse at 50% 35%, hsl(120 25% 11%), hsl(var(--ritual-surface)) 65%)'
          : 'hsl(var(--ritual-surface))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*,application/pdf,audio/*,video/*,text/*"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* EERSTE BEZOEK: V7 centered + hero text */}
      {isFirstVisit && (
        <>
          {/* V7 Mark — centered, 42px, decorative */}
          <motion.div
            className="mb-7"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <svg viewBox="0 0 48 48" width={42} height={42}>
              <polygon
                points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
                fill="hsl(var(--ritual-gold))"
              />
              <rect x="17" y="17" width="14" height="14" rx="1.8" fill="hsl(var(--ritual-surface))" />
            </svg>
          </motion.div>

          {/* Hero text */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <h1
              className="font-playfair font-light text-[19px] leading-[1.65]"
              style={{ color: 'hsl(var(--ritual-cream))' }}
            >
              Digital things change.
              <br />
              This does not.
              <br />
              <span style={{ color: 'hsl(var(--ritual-gold))' }}>Anchor.</span>
            </h1>
          </motion.div>
        </>
      )}

      {/* Capture circle with + */}
      <motion.label
        htmlFor={inputId}
        className="relative flex items-center justify-center cursor-pointer group"
        style={{ width: circleSize, height: circleSize }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Select a file to anchor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: isFirstVisit ? 1.0 : 0.3 }}
      >
        {/* Dashed circle */}
        <svg
          viewBox={`0 0 ${circleSize} ${circleSize}`}
          className="absolute inset-0 w-full h-full"
        >
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={circleR}
            fill="none"
            stroke="hsl(var(--ritual-gold))"
            strokeWidth="1"
            strokeDasharray="4 10"
            opacity="0.25"
          />
        </svg>

        {/* Pulsing + */}
        <motion.span
          className="relative z-10 select-none font-playfair font-light"
          style={{
            fontSize: `${plusSize}px`,
            lineHeight: 1,
            color: '#C5935A',
            opacity: 0.5,
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          +
        </motion.span>
      </motion.label>

      {/* TERUGKEREND: Whisper at bottom */}
      {!isFirstVisit && (
        <motion.p
          className="absolute bottom-8 font-garamond italic text-[11px]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.12)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        >
          You are the origin.
        </motion.p>
      )}
    </motion.div>
  );
}
