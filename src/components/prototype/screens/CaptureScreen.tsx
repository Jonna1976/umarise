import { useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { OriginMark } from '../components/OriginMark';

/**
 * Metadata passed from capture to the rest of the ritual flow.
 * Downstream screens use mimeType to decide visual representation:
 * - image/*  → show the actual image
 * - audio/*  → stylised waveform icon in golden frame
 * - other    → document icon in golden frame
 */
export interface CapturedFile {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
}

interface CaptureScreenProps {
  onCapture: (file: CapturedFile) => void;
}

/**
 * Screen 1: Capture
 * 
 * Per briefing sectie 4 (S1):
 * - Origin Mark centraal in capture ring
 * - Dezelfde circumpunct als op het welkomstscherm, dezelfde ademhaling
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

    // Read any file as data URL — SHA-256 operates on raw bytes regardless of type
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
        accept="image/*,application/pdf,audio/*,video/*,text/*"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Capture ring with origin mark — grotere ring, zelfde hartslag als S0 */}
      <motion.label
        htmlFor={inputId}
        className="relative w-[240px] h-[240px] flex items-center justify-center cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Select a photo"
      >
        {/* Dashed circle (capture ring) — groter, subtiel */}
        <svg 
          viewBox="0 0 240 240" 
          className="absolute inset-0 w-full h-full"
        >
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="hsl(var(--ritual-gold))"
            strokeWidth="1"
            strokeDasharray="4 10"
            opacity="0.25"
          />
        </svg>

        {/* Origin Mark — circumpunct with breathe animation, gesynchroniseerd met S0 */}
        <OriginMark
          size={48}
          state="anchored"
          glow
          animated
          variant="dark"
        />
      </motion.label>

    </motion.div>
  );
}
