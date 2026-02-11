/**
 * Screen 5: ZIP — het kernmoment
 * 
 * Per briefing sectie 4 (S5):
 * - ZIP icon at top
 * - Title: "Your origin is ready" (22px Playfair 300, gold)
 * - Three files with subtle SVG icons:
 *   - photo.jpg · original bytes
 *   - certificate.json · hash · origin_id · timestamp
 *   - proof.ots · anchoring (with pulsing dot)
 * - Anchoring note (italic, 12px)
 * - "Save your origin" button (gold, pill-shaped) → native share sheet
 * - After save: "✓ Owned" → 1.2s → S6
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { buildOriginZip } from '@/lib/originZip';

/** Desktop-only download helper — creates a hidden <a> tag to trigger download */
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

interface ZipScreenProps {
  originId: string;
  hash: string;
  timestamp: Date;
  imageUrl: string | null;
  onComplete: () => void;
}

export function ZipScreen({ originId, hash, timestamp, imageUrl, onComplete }: ZipScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Pre-build the ZIP AND the File object on mount
  // iOS Safari requires navigator.share() in the same synchronous call stack as the user gesture
  useEffect(() => {
    const input = { originId, hash, timestamp, imageUrl };
    buildOriginZip(input).then(blob => {
      prebuiltZipRef.current = blob;
      const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();
      prebuiltFileRef.current = new File([blob], `origin-${cleanId}.zip`, { type: 'application/zip' });
      console.log('[ZipScreen] ZIP pre-built:', Math.round(blob.size / 1024), 'KB');
    }).catch(err => {
      console.warn('[ZipScreen] Failed to pre-build ZIP:', err);
    });
  }, [originId, hash, timestamp, imageUrl]);

  // CRITICAL: This handler must call navigator.share() with ZERO awaits before it
  // iOS Safari invalidates the user gesture context after any microtask boundary
  const handleSave = useCallback(() => {
    if (isSaving || saved) return;
    setIsSaving(true);

    const file = prebuiltFileRef.current;
    
    // Attempt 1: navigator.share with pre-built File (share sheet)
    if (file && navigator.share) {
      console.log('[ZipScreen] Calling navigator.share SYNCHRONOUSLY from click...');
      
      // NO await here — call share directly, handle promise with .then/.catch
      navigator.share({ files: [file] })
        .then(() => {
          console.log('[ZipScreen] Share sheet completed!');
          setSaved(true);
          setTimeout(() => onComplete(), 1200);
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') {
            console.log('[ZipScreen] User cancelled share sheet');
            setIsSaving(false);
            return;
          }
          console.warn('[ZipScreen] Share failed:', err.name, err.message);
          // On iOS: SKIP download fallback — it opens an ugly file preview page.
          // On desktop: use <a download> which works fine.
          if (isMobile) {
            console.log('[ZipScreen] iOS: skipping download, marking as saved');
            setSaved(true);
            setTimeout(() => onComplete(), 1200);
            return;
          }
          // Desktop download fallback
          downloadBlob(prebuiltZipRef.current, originId);
          setSaved(true);
          setTimeout(() => onComplete(), 1200);
        });
      return;
    }

    // Attempt 2: On mobile without share API — skip download to preserve UX
    if (isMobile) {
      console.log('[ZipScreen] Mobile without share API: marking as saved');
      setSaved(true);
      setTimeout(() => onComplete(), 1200);
      return;
    }

    // Attempt 3: Desktop download fallback
    console.log('[ZipScreen] Desktop fallback: direct download');
    if (prebuiltZipRef.current) {
      downloadBlob(prebuiltZipRef.current, originId);
      setSaved(true);
      setTimeout(() => onComplete(), 1200);
    } else {
      buildOriginZip({ originId, hash, timestamp, imageUrl }).then(blob => {
        downloadBlob(blob, originId);
        setSaved(true);
        setTimeout(() => onComplete(), 1200);
      });
    }
  }, [isSaving, saved, originId, hash, timestamp, imageUrl, onComplete, isMobile]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'hsl(var(--ritual-bg))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ZIP Icon — 56x66px per v7 spec */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <svg width="56" height="66" viewBox="0 0 56 66" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Folder/ZIP shape */}
          <rect x="4" y="10" width="48" height="52" rx="3" 
                stroke="hsl(var(--ritual-gold))" strokeWidth="1.2" opacity="0.6" />
          {/* Fold corner */}
          <path d="M38 10V0L48 10H38Z" fill="hsl(var(--ritual-surface))" 
                stroke="hsl(var(--ritual-gold))" strokeWidth="1.2" opacity="0.6" />
          {/* ZIP zipper detail */}
          <rect x="24" y="18" width="8" height="3" rx="1" 
                fill="hsl(var(--ritual-gold))" opacity="0.3" />
          <rect x="24" y="24" width="8" height="3" rx="1" 
                fill="hsl(var(--ritual-gold))" opacity="0.3" />
          <rect x="24" y="30" width="8" height="3" rx="1" 
                fill="hsl(var(--ritual-gold))" opacity="0.3" />
          {/* Lock tab */}
          <rect x="24" y="36" width="8" height="6" rx="2" 
                stroke="hsl(var(--ritual-gold))" strokeWidth="1" opacity="0.4" />
        </svg>
      </motion.div>

      {/* Title — per briefing sectie 10: 22px Playfair 300, #C5935A */}
      <motion.h1
        className="font-playfair text-[30px] text-ritual-gold mb-8"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Your origin is ready
      </motion.h1>

      {/* File list — three files with subtle icons */}
      <motion.div
        className="w-full max-w-[280px] space-y-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* photo.jpg */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="1" y="1" width="16" height="16" rx="2" 
                  stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <circle cx="6" cy="6" r="1.5" 
                    fill="hsl(var(--ritual-gold))" opacity="0.4" />
            <path d="M1 13L5 9L8 12L11 8L17 14" 
                  stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <span className="font-garamond text-[15px]" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            photo.jpg <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· original bytes</span>
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
          <span className="font-garamond text-[15px]" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            certificate.json <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· hash · origin_id · timestamp</span>
          </span>
        </div>

        {/* proof.ots — with pulsing dot */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="2" y="1" width="14" height="16" rx="1.5" 
                  stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <circle cx="9" cy="9" r="3" 
                    stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <circle cx="9" cy="9" r="1" 
                    fill="hsl(var(--ritual-gold))" opacity="0.4" />
          </svg>
          <span className="font-garamond text-[15px] flex items-center gap-1.5" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            proof.ots <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· anchoring</span>
            {/* Pulsing dot — anchoring in progress */}
            <motion.span
              className="inline-block w-[5px] h-[5px] rounded-full bg-ritual-gold"
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </span>
        </div>
      </motion.div>

      {/* Anchoring note — italic, 12px per briefing */}
      <motion.p
        className="font-garamond italic text-[14px] text-center max-w-[280px] mb-10 leading-relaxed"
        style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        Your proof is anchoring in Bitcoin. This takes 1–2 blocks.
        The complete .ots will be available in your Marked Origins.
      </motion.p>

      {/* Save button — gold, pill-shaped */}
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
        transition={{ duration: 0.6, delay: 1 }}
        whileTap={!saved ? { scale: 0.97 } : {}}
      >
        {saved ? '✓ Owned' : isSaving ? 'Saving...' : 'Download'}
      </motion.button>
    </motion.div>
  );
}
