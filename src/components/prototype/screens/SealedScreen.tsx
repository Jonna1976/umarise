/**
 * SealedScreen — Production merged screen: Release + ZIP + Owned → one screen
 * 
 * Flow: Mark → Sealed → Wall
 * After "Save your origin" → "✓ Owned" (0.8s) → auto-advance to Wall
 * 
 * Layout:
 * 1. "Your origin is ready" title
 * 2. Artifact in golden frame (photo preview or type icon)
 * 3. Museum label: Origin ID + date + hash
 * 4. Gold divider
 * 5. Three files (photo.jpg, certificate.json, proof.ots)
 * 6. "Save your origin" button → triggers ZIP share/download
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { OriginMark } from '../components/OriginMark';
import { buildOriginZip } from '@/lib/originZip';

/** Desktop-only download helper */
function downloadBlob(blob: Blob | null, originId: string) {
  if (!blob) return;
  const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `origin-${cleanId}.zip`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}

interface SealedScreenProps {
  originId: string;
  hash: string;
  timestamp: Date;
  imageUrl: string | null;
  mimeType?: string;
  fileName?: string;
  artifactType?: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  onComplete: () => void;
}

export function SealedScreen({
  originId,
  hash,
  timestamp,
  imageUrl,
  mimeType = 'image/jpeg',
  fileName = 'photo.jpg',
  artifactType = 'warm',
  onComplete,
}: SealedScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isImage = mimeType.startsWith('image/');

  // Derive display values
  const shortId = originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();
  const hashLine1 = hash.slice(0, 32);
  const hashLine2 = hash.slice(32);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Derive the file name shown in the list based on MIME type
  const displayFileName = isImage ? 'photo.jpg'
    : mimeType === 'application/pdf' ? 'document.pdf'
    : mimeType.startsWith('audio/') ? 'audio.mp3'
    : fileName || 'file';

  const displayFileHint = isImage ? 'original bytes'
    : mimeType === 'application/pdf' ? 'original document'
    : mimeType.startsWith('audio/') ? 'original audio'
    : 'original file';

  // Pre-build the ZIP on mount
  useEffect(() => {
    const input = { originId, hash, timestamp, imageUrl };
    buildOriginZip(input).then(blob => {
      prebuiltZipRef.current = blob;
      const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();
      prebuiltFileRef.current = new File([blob], `origin-${cleanId}.zip`, { type: 'application/zip' });
      console.log('[SealedScreen] ZIP pre-built:', Math.round(blob.size / 1024), 'KB');
    }).catch(err => {
      console.warn('[SealedScreen] Failed to pre-build ZIP:', err);
    });
  }, [originId, hash, timestamp, imageUrl]);

  // Save handler — identical logic to ZipScreen (share sheet or download)
  const handleSave = useCallback(() => {
    if (isSaving || saved) return;
    setIsSaving(true);

    const file = prebuiltFileRef.current;
    
    if (file && navigator.share) {
      navigator.share({ files: [file] })
        .then(() => {
          console.log('[SealedScreen] Share sheet completed!');
          setSaved(true);
          setTimeout(() => onComplete(), 800);
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') {
            console.log('[SealedScreen] User cancelled share sheet');
            setIsSaving(false);
            return;
          }
          console.warn('[SealedScreen] Share failed:', err.name, err.message);
          if (isMobile) {
            setSaved(true);
            setTimeout(() => onComplete(), 800);
            return;
          }
          downloadBlob(prebuiltZipRef.current, originId);
          setSaved(true);
          setTimeout(() => onComplete(), 800);
        });
      return;
    }

    if (isMobile) {
      setSaved(true);
      setTimeout(() => onComplete(), 800);
      return;
    }

    if (prebuiltZipRef.current) {
      downloadBlob(prebuiltZipRef.current, originId);
      setSaved(true);
      setTimeout(() => onComplete(), 800);
    } else {
      buildOriginZip({ originId, hash, timestamp, imageUrl }).then(blob => {
        downloadBlob(blob, originId);
        setSaved(true);
        setTimeout(() => onComplete(), 800);
      });
    }
  }, [isSaving, saved, originId, hash, timestamp, imageUrl, onComplete, isMobile]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Origin Mark — circumpunct (28x28, glow) ── */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <OriginMark
          size={48}
          state="anchored"
          glow
          variant="dark"
        />
      </motion.div>

      {/* ── Title ── */}
      <motion.h1
        className="font-playfair text-[30px] text-ritual-gold mb-8"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Your origin is ready
      </motion.h1>

      {/* ── Artifact in golden frame ── */}
      <motion.div
        className="w-[200px] h-[200px] rounded-[3px] mb-6 flex items-center justify-center overflow-hidden"
        style={{
          border: '1px solid hsl(var(--ritual-gold) / 0.3)',
          background: 'hsl(var(--ritual-gold) / 0.03)',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {imageUrl && isImage ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ArtifactDisplay type={artifactType} mimeType={mimeType} fileName={fileName} />
        )}
      </motion.div>

      {/* ── Museum label: Origin ID + date + hash ── */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <p
          className="font-mono text-[13px] tracking-[2px] uppercase mb-1"
          style={{ color: 'hsl(var(--ritual-gold) / 0.45)' }}
        >
          ORIGIN {shortId}
        </p>
        <p
          className="font-garamond text-[17px] mb-3"
          style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        >
          {formatDate(timestamp)}
        </p>
        <div style={{ opacity: 0.35 }}>
          <p
            className="font-mono text-[12px] tracking-[0.5px] leading-relaxed"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            {hashLine1}
          </p>
          <p
            className="font-mono text-[12px] tracking-[0.5px] leading-relaxed"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            {hashLine2}
          </p>
        </div>
      </motion.div>

      {/* ── Gold divider ── */}
      <motion.div
        className="w-[50px] h-px mb-8"
        style={{ background: 'hsl(var(--ritual-gold) / 0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      />

      {/* ── File list ── */}
      <motion.div
        className="w-full max-w-[280px] space-y-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        {/* Original file */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="1" y="1" width="16" height="16" rx="2"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <circle cx="6" cy="6" r="1.5"
              fill="hsl(var(--ritual-gold))" opacity="0.4" />
            <path d="M1 13L5 9L8 12L11 8L17 14"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <span className="font-garamond text-[17px]" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            {displayFileName} <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· {displayFileHint}</span>
          </span>
        </div>

        {/* certificate.json */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="2" y="1" width="14" height="16" rx="1.5"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <line x1="5" y1="6" x2="13" y2="6"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <line x1="5" y1="9" x2="13" y2="9"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <line x1="5" y1="12" x2="10" y2="12"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
          </svg>
          <span className="font-garamond text-[17px]" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            certificate.json <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· hash · origin_id · timestamp</span>
          </span>
        </div>

        {/* proof.ots */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="2" y="1" width="14" height="16" rx="1.5"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <circle cx="9" cy="9" r="3"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <circle cx="9" cy="9" r="1"
              fill="hsl(var(--ritual-gold))" opacity="0.4" />
          </svg>
          <span className="font-garamond text-[17px] flex items-center gap-1.5" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            proof.ots <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· anchoring</span>
            <motion.span
              className="inline-block w-[5px] h-[5px] rounded-full bg-ritual-gold"
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </div>
      </motion.div>

      {/* ── Save button ── */}
      <motion.button
        onClick={handleSave}
        disabled={isSaving}
        className="font-playfair text-[17px] px-8 py-3 rounded-full transition-all disabled:opacity-50"
        style={{
          fontWeight: 300,
          background: saved
            ? 'hsl(var(--ritual-gold) / 0.15)'
            : 'hsl(var(--ritual-gold) / 0.12)',
          border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.5' : '0.35'})`,
          color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.85'})`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        whileTap={!saved ? { scale: 0.97 } : {}}
      >
        {saved ? '✓ Owned' : isSaving ? 'Saving...' : 'Download'}
      </motion.button>

      {/* ── Verify link (subtle, secondary) ── */}
      <motion.a
        href="/verify"
        target="_blank"
        rel="noopener noreferrer"
        className="font-garamond italic text-[15px] mt-4 transition-opacity hover:opacity-60"
        style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.35 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 0.6, delay: 2.0 }}
      >
        Verifieer je origin
      </motion.a>
    </motion.div>
  );
}
