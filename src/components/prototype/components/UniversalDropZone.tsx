/**
 * UniversalDropZone — Museum-aesthetic file drop zone
 * 
 * Accepts any file type (accept="*\/*").
 * For large files (>50MB), shows a hashing progress indicator.
 * Camera flow is completely untouched.
 */
import { useCallback, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UniversalFile {
  file: File;
  previewUrl: string | null; // Only for images/video
  mimeType: string;
  fileName: string;
  fileSize: number;
}

interface UniversalDropZoneProps {
  onFile: (uf: UniversalFile) => void;
  disabled?: boolean;
}

const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(mimeType: string, fileName: string): string {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('text/')) return 'TEXT';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'ARCHIVE';
  const ext = fileName.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
}

export function UniversalDropZone({ onFile, disabled }: UniversalDropZoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const processFile = useCallback((file: File) => {
    // For images, generate a preview URL for immediate display
    let previewUrl: string | null = null;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    onFile({
      file,
      previewUrl,
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name,
      fileSize: file.size,
    });
  }, [onFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('[UniversalDropZone] File selected:', file.name, `(${file.type}, ${formatBytes(file.size)})`);
    processFile(file);
    e.target.value = '';
  }, [processFile]);

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
    console.log('[UniversalDropZone] File dropped:', file.name, `(${file.type}, ${formatBytes(file.size)})`);
    processFile(file);
  }, [processFile]);

  return (
    <div className="w-full">
      {/* Hidden file input — no accept filter so ALL file types are selectable */}
      <input
        id={inputId}
        type="file"
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
        tabIndex={-1}
      />

      {/*
        Drop zone is a <div> — NOT a <label>.
        Labels don't reliably receive onDrop in all browsers.
        A separate visible label triggers the file picker on tap/click.
      */}
      <div
        role="button"
        aria-label="Drop any file here, or tap to select"
        className="relative w-full rounded-sm cursor-pointer select-none"
        style={{
          minHeight: '148px',
          border: isDragging
            ? '1px solid hsl(var(--ritual-gold) / 0.6)'
            : '1px dashed hsl(var(--ritual-gold) / 0.18)',
          background: isDragging
            ? 'hsl(var(--ritual-gold) / 0.04)'
            : 'transparent',
          transition: 'border-color 0.25s ease, background 0.25s ease',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled) document.getElementById(inputId)?.click();
        }}
      >
        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 48 48" width={32} height={32}>
                <polygon
                  points="24,4 42,14 42,34 24,44 6,34 6,14"
                  fill="none"
                  stroke="hsl(var(--ritual-gold))"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
              </svg>
              <span
                className="font-garamond text-[11px] tracking-[0.14em] uppercase"
                style={{ color: 'hsl(var(--ritual-gold) / 0.7)' }}
              >
                Release to anchor
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Icon grid — 3 file type glyphs */}
              <div className="flex items-center gap-2 opacity-30">
                {/* PDF */}
                <svg viewBox="0 0 20 24" width={14} height={17}>
                  <rect x="1" y="1" width="18" height="22" rx="2" fill="none" stroke="hsl(var(--ritual-cream))" strokeWidth="1"/>
                  <text x="3" y="15" fontSize="7" fontFamily="serif" fill="hsl(var(--ritual-cream))">PDF</text>
                </svg>
                {/* Audio wave */}
                <svg viewBox="0 0 20 20" width={14} height={14}>
                  <line x1="2" y1="10" x2="2" y2="10" stroke="hsl(var(--ritual-cream))" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="5" x2="6" y2="15" stroke="hsl(var(--ritual-cream))" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="10" y1="3" x2="10" y2="17" stroke="hsl(var(--ritual-cream))" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="5" x2="14" y2="15" stroke="hsl(var(--ritual-cream))" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="8" x2="18" y2="12" stroke="hsl(var(--ritual-cream))" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {/* Generic file */}
                <svg viewBox="0 0 18 22" width={12} height={15}>
                  <path d="M2,1 L12,1 L17,6 L17,21 L2,21 Z" fill="none" stroke="hsl(var(--ritual-cream))" strokeWidth="1"/>
                  <path d="M12,1 L12,6 L17,6" fill="none" stroke="hsl(var(--ritual-cream))" strokeWidth="1"/>
                </svg>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span
                  className="font-garamond text-[12px] tracking-[0.10em] uppercase"
                  style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
                >
                  Any file · Drop or tap
                </span>
                <span
                  className="font-garamond italic text-[10px]"
                  style={{ color: 'hsl(var(--ritual-cream) / 0.15)' }}
                >
                  PDF, Excel, Word, Keynote, audio, video…
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Large-file hashing progress indicator ───────────────────────────────────

interface HashingProgressProps {
  fileName: string;
  fileSize: number;
  progress: number; // 0–1
}

export function HashingProgress({ fileName, fileSize, progress }: HashingProgressProps) {
  const pct = Math.round(progress * 100);
  const isLarge = fileSize >= LARGE_FILE_THRESHOLD;

  return (
    <motion.div
      className="flex flex-col items-center gap-4 w-full px-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {/* Breathing hex */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 48 48" width={40} height={40}>
          <polygon
            points="24,4 42,14 42,34 24,44 6,34 6,14"
            fill="hsl(var(--ritual-gold))"
            opacity="0.65"
          />
          <rect x="17" y="17" width="14" height="14" rx="1.8" fill="hsl(var(--ritual-surface))" opacity="0.9" />
        </svg>
      </motion.div>

      {/* File label */}
      <div className="text-center">
        <p
          className="font-garamond text-[12px] tracking-[0.08em] uppercase truncate max-w-[200px]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}
        >
          {fileName}
        </p>
        <p
          className="font-garamond italic text-[10px] mt-0.5"
          style={{ color: 'hsl(var(--ritual-cream) / 0.25)' }}
        >
          {formatBytes(fileSize)}
        </p>
      </div>

      {/* Progress bar — only for large files where hashing takes time */}
      {isLarge && (
        <div className="w-full max-w-[180px]">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '1px', background: 'hsl(var(--ritual-gold) / 0.12)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'hsl(var(--ritual-gold) / 0.55)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <p
            className="text-center font-garamond text-[10px] mt-1.5"
            style={{ color: 'hsl(var(--ritual-gold) / 0.4)' }}
          >
            {pct < 100 ? `Computing fingerprint… ${pct}%` : 'Sealing…'}
          </p>
        </div>
      )}

      {/* Small file: just a simple label */}
      {!isLarge && (
        <p
          className="font-garamond text-[10px] tracking-[0.08em]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
        >
          Computing fingerprint…
        </p>
      )}
    </motion.div>
  );
}

export { LARGE_FILE_THRESHOLD, formatBytes, fileTypeLabel };
