import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CapturedFile {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
}

export interface CapturedRawFile {
  file: File;
  mimeType: string;
  fileName: string;
  fileSize: number;
  previewDataUrl: string | null;
}

interface CaptureScreenProps {
  onCapture: (file: CapturedFile) => void;
  onCaptureFile: (rf: CapturedRawFile) => void;
  isFirstVisit?: boolean;
}

function routeFile(
  file: File,
  onCapture: CaptureScreenProps['onCapture'],
  onCaptureFile: CaptureScreenProps['onCaptureFile'],
) {
  const mimeType = file.type || 'application/octet-stream';

  if (!mimeType.startsWith('image/')) {
    console.log('[Capture] Non-image file → file path:', file.name, `(${mimeType}, ${(file.size / 1024).toFixed(1)}KB)`);
    onCaptureFile({ file, mimeType, fileName: file.name, fileSize: file.size, previewDataUrl: null });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    console.log('[Capture] Image file loaded:', file.name, `(${mimeType}, ${(file.size / 1024).toFixed(1)}KB)`);
    onCapture({ dataUrl, mimeType, fileName: file.name, fileSize: file.size });
  };
  reader.onerror = () => console.error('[Capture] Failed to read file');
  reader.readAsDataURL(file);
}

export function CaptureScreen({ onCapture, onCaptureFile, isFirstVisit = false }: CaptureScreenProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // ── Prevent browser from downloading/opening dropped files ──
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent, true);
    window.addEventListener('drop', prevent, true);
    return () => {
      window.removeEventListener('dragover', prevent, true);
      window.removeEventListener('drop', prevent, true);
    };
  }, []);

  // ── Drag handlers on the full screen ──
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    console.log('[Capture] Drop:', file.name, `(${file.type}, ${(file.size / 1024).toFixed(1)}KB)`);
    routeFile(file, onCapture, onCaptureFile);
  }, [onCapture, onCaptureFile]);

  // ── File picker handler ──
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    routeFile(file, onCapture, onCaptureFile);
    e.target.value = '';
  }, [onCapture, onCaptureFile]);

  const circleSize = isFirstVisit ? 120 : 180;
  const plusSize = isFirstVisit ? 26 : 32;
  const circleR = (circleSize / 2) - 10;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center relative"
      style={{
        background: isFirstVisit
          ? 'radial-gradient(ellipse at 50% 35%, hsl(120 25% 11%), hsl(var(--ritual-surface)) 65%)'
          : 'hsl(var(--ritual-surface))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      // Drop zone covers the full screen
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        id={inputId}
        type="file"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* ── Full-screen drag overlay ────────────────────────── */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 pointer-events-none"
            style={{
              background: 'hsl(var(--ritual-surface) / 0.92)',
              border: '1px solid hsl(var(--ritual-gold) / 0.35)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Pulsing hexagon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg viewBox="0 0 56 56" width={56} height={56}>
                <polygon
                  points="28,4 50,16 50,40 28,52 6,40 6,16"
                  fill="none"
                  stroke="hsl(var(--ritual-gold))"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <polygon
                  points="28,12 42,20 42,36 28,44 14,36 14,20"
                  fill="none"
                  stroke="hsl(var(--ritual-gold))"
                  strokeWidth="0.5"
                  opacity="0.25"
                />
              </svg>
            </motion.div>

              <span
              className="font-garamond text-[13px] tracking-[0.18em] uppercase"
              style={{ color: 'hsl(var(--ritual-gold) / 0.65)' }}
            >
              Drop to anchor
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top section ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-16 pb-8">

        {isFirstVisit && (
          <>
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

        {/* Circle — tap to pick file */}
        <motion.label
          htmlFor={inputId}
          className="relative flex items-center justify-center cursor-pointer group"
          style={{ width: circleSize, height: circleSize }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Selecteer een bestand om te ankeren"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: isFirstVisit ? 1.0 : 0.3 }}
        >
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

          <motion.span
            className="relative z-10 select-none font-playfair font-light"
            style={{ fontSize: `${plusSize}px`, lineHeight: 1, color: '#C5935A', opacity: 0.5 }}
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            +
          </motion.span>
        </motion.label>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-3 mt-10 w-full max-w-[240px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: isFirstVisit ? 1.3 : 0.7 }}
        >
          <div className="flex-1 h-px" style={{ background: 'hsl(var(--ritual-gold) / 0.10)' }} />
          <span
            className="font-garamond italic text-[10px] tracking-[0.08em]"
            style={{ color: 'hsl(var(--ritual-cream) / 0.18)' }}
          >
            or drop a file
          </span>
          <div className="flex-1 h-px" style={{ background: 'hsl(var(--ritual-gold) / 0.10)' }} />
        </motion.div>
      </div>

      {/* ── Bottom hint ─────────────────────────────────────── */}
      <motion.div
        className="w-full px-6 pb-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: isFirstVisit ? 1.4 : 0.6 }}
      >
        <p
          className="font-garamond italic text-[10px] text-center"
          style={{ color: 'hsl(var(--ritual-cream) / 0.12)' }}
        >
          PDF, Excel, Word, Keynote, afbeelding, audio, video…
        </p>

        {!isFirstVisit && (
          <motion.p
            className="text-center font-garamond italic text-[10px]"
            style={{ color: 'hsl(var(--ritual-cream) / 0.10)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
          >
            You are the origin.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
