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
  const [verifyHovered, setVerifyHovered] = useState(false);
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

  const circleSize = isFirstVisit ? 210 : 270;
  const plusSize = isFirstVisit ? 56 : 68;
  const circleR = (circleSize / 2) - 10;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center relative"
      style={{
        background: isFirstVisit
          ? `radial-gradient(ellipse at 50% 35%, hsl(var(--ritual-surface-elevated)), hsl(var(--ritual-surface)) 65%)`
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
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1
              className="font-playfair font-light text-[26px] leading-[1.6]"
              style={{ color: 'hsl(var(--ritual-cream))' }}
            >
              It exists.
              <br />
              Provable forever.
              <br />
              <span style={{ color: 'hsl(var(--ritual-gold))' }}>Anchor.</span>
            </h1>
          </motion.div>
        )}

        {/* Circle — tap to pick file */}
        <motion.label
          htmlFor={inputId}
          className="relative flex items-center justify-center cursor-pointer group"
          style={{ width: circleSize, height: circleSize }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Selecteer een bestand om te ankeren"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: isFirstVisit ? 1.0 : 0.3 }}
        >
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              viewBox={`0 0 ${circleSize} ${circleSize}`}
              className="w-full h-full"
            >
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={circleR}
                fill="none"
                stroke="hsl(var(--ritual-gold))"
                strokeWidth="1.5"
                strokeDasharray="5 12"
              />
            </svg>
          </motion.div>

          <motion.span
            className="relative z-10 select-none font-playfair font-light"
            style={{ fontSize: `${plusSize}px`, lineHeight: 1, color: 'hsl(var(--ritual-gold))' }}
            animate={{ opacity: [0.6, 0.95, 0.6], scale: [1, 1.07, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            +
          </motion.span>
        </motion.label>
      </div>

      {/* ── Verify link ── */}
      <motion.div
        className="w-full px-6 pb-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: isFirstVisit ? 1.6 : 1.0 }}
      >
        {!isFirstVisit && (
          <p
            className="text-center font-garamond italic text-[10px]"
            style={{ color: 'hsl(var(--ritual-cream) / 0.10)' }}
          >
            You are the origin.
          </p>
        )}
        <a
          href="/verify"
          className="font-garamond text-[22px] text-center leading-relaxed"
          style={{ textDecoration: 'none', color: 'hsl(var(--ritual-cream) / 0.65)' }}
          onMouseEnter={() => setVerifyHovered(true)}
          onMouseLeave={() => setVerifyHovered(false)}
        >
          Already have a proof?{' '}
          <span
            style={{
              color: 'hsl(var(--ritual-gold))',
              fontStyle: 'italic',
              transition: 'text-shadow 0.3s ease',
              textShadow: verifyHovered
                ? '0 0 10px hsl(var(--ritual-gold) / 0.8), 0 0 22px hsl(var(--ritual-gold) / 0.4)'
                : 'none',
            }}
          >
            Verify it here.
          </span>
        </a>
      </motion.div>
    </motion.div>
  );
}
