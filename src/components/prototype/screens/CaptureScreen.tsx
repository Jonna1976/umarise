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

type SizeWarning = 'none' | 'large' | 'blocked';

function classifyFileSize(size: number): SizeWarning {
  const mb = size / (1024 * 1024);
  if (mb > 200) return 'blocked';
  if (mb >= 50) return 'large';
  return 'none';
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
  setSizeWarning: (w: SizeWarning) => void,
) {
  const mimeType = file.type || 'application/octet-stream';
  const warning = classifyFileSize(file.size);
  setSizeWarning(warning);

  if (warning === 'blocked') {
    console.warn('[Capture] File blocked:', (file.size / 1024 / 1024).toFixed(1), 'MB (max 200MB)');
    return;
  }

  if (!mimeType.startsWith('image/')) {
    console.log('[Capture] Non-image file → file path:', file.name, `(${mimeType}, ${(file.size / 1024).toFixed(1)}KB)`);
    try {
      onCaptureFile({ file, mimeType, fileName: file.name, fileSize: file.size, previewDataUrl: null });
    } catch (e) {
      console.error('[Capture] onCaptureFile threw:', e);
      import('sonner').then(({ toast }) => toast.error('Failed to process file'));
    }
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    console.log('[Capture] Image file loaded:', file.name, `(${mimeType}, ${(file.size / 1024).toFixed(1)}KB)`);
    onCapture({ dataUrl, mimeType, fileName: file.name, fileSize: file.size });
  };
  reader.onerror = () => {
    console.error('[Capture] FileReader failed:', reader.error);
    import('sonner').then(({ toast }) => toast.error('Could not read file. Try a smaller file or different format.'));
  };
  try {
    reader.readAsDataURL(file);
  } catch (e) {
    console.error('[Capture] readAsDataURL threw:', e);
    import('sonner').then(({ toast }) => toast.error('Could not read file'));
  }
}

export function CaptureScreen({ onCapture, onCaptureFile, isFirstVisit = false }: CaptureScreenProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<SizeWarning>('none');
  
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
    setSizeWarning('none');
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    console.log('[Capture] Drop:', file.name, `(${file.type}, ${(file.size / 1024).toFixed(1)}KB)`);
    routeFile(file, onCapture, onCaptureFile, setSizeWarning);
  }, [onCapture, onCaptureFile]);

  // ── File picker handler ──
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSizeWarning('none');
    routeFile(file, onCapture, onCaptureFile, setSizeWarning);
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
              Anchor what matters.
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

        {/* Size warning messages */}
        <AnimatePresence>
          {sizeWarning === 'large' && (
            <motion.p
              className="mt-6 font-garamond italic text-[13px] text-center"
              style={{ color: 'hsl(var(--ritual-cream-dim, var(--ritual-cream) / 0.45))' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              Large file — hashing may take a moment.
            </motion.p>
          )}
          {sizeWarning === 'blocked' && (
            <motion.p
              className="mt-6 font-mono text-[11px] tracking-[2px] text-center"
              style={{ color: 'hsl(var(--ritual-cream-dim, var(--ritual-cream) / 0.45))' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              File too large. Maximum 200MB.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom spacer */}
      <div className="pb-12" />
    </motion.div>
  );
}
