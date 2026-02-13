/**
 * SealedScreen — "The Nail"
 * 
 * V7 is de spijker. Het schilderij hangt eraan.
 * 
 * Layout:
 * 1. V7 (36px, glow) — the nail
 * 2. Golden wire (1px, 16px) — connects nail to frame
 * 3. Photo in golden museum frame (220px)
 * 4. Gold divider
 * 5. Origin ID (no prefix)
 * 6. Date
 * 7. Hash (full, one line, 30% opacity)
 * 8. Proof components: certificate · hash · proof.ots
 * 9. Save button
 * 
 * No title. No explanation. No privacy whisper.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { OriginMark } from '../components/OriginMark';
import { buildOriginZip } from '@/lib/originZip';

/** Desktop-only download helper */
function downloadBlob(blob: Blob | null, originId: string) {
  if (!blob) return;
  const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();
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
  deviceSignature?: string | null;
  devicePublicKey?: string | null;
  /** Whether Bitcoin proof is confirmed */
  isAnchored?: boolean;
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
  deviceSignature = null,
  devicePublicKey = null,
  isAnchored = false,
  onComplete,
}: SealedScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isImage = mimeType.startsWith('image/');

  // Derive display values
  const shortId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Pre-build the ZIP on mount
  useEffect(() => {
    const input = { originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey };
    buildOriginZip(input).then(blob => {
      prebuiltZipRef.current = blob;
      const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();
      prebuiltFileRef.current = new File([blob], `origin-${cleanId}.zip`, { type: 'application/zip' });
    }).catch(err => {
      console.warn('[SealedScreen] Failed to pre-build ZIP:', err);
    });
  }, [originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey]);

  // Save handler
  const handleSave = useCallback(() => {
    if (isSaving || saved) return;
    setIsSaving(true);

    const file = prebuiltFileRef.current;
    
    if (file && navigator.share) {
      navigator.share({ files: [file] })
        .then(() => {
          setSaved(true);
          setTimeout(() => onComplete(), 800);
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') {
            setIsSaving(false);
            return;
          }
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
      buildOriginZip({ originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey }).then(blob => {
        downloadBlob(blob, originId);
        setSaved(true);
        setTimeout(() => onComplete(), 800);
      });
    }
  }, [isSaving, saved, originId, hash, timestamp, imageUrl, onComplete, isMobile, deviceSignature, devicePublicKey]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-6 pt-12"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── THE NAIL: V7 hexagon ── */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <OriginMark
          size={36}
          state={isAnchored ? 'anchored' : 'pending'}
          glow={isAnchored}
          animated={!isAnchored}
          variant="dark"
        />
        {/* Golden wire — connects nail to frame */}
        <div
          className="w-px h-4"
          style={{
            background: isAnchored
              ? 'linear-gradient(to bottom, rgba(197,147,90,0.5), rgba(197,147,90,0.15))'
              : 'linear-gradient(to bottom, rgba(197,147,90,0.25), rgba(197,147,90,0.08))',
          }}
        />
      </motion.div>

      {/* ── PHOTO IN GOLDEN MUSEUM FRAME ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div
          className="rounded-[4px] mb-5"
          style={{
            padding: '14px',
            background: 'linear-gradient(135deg, rgba(197,147,90,0.28), rgba(180,130,70,0.15) 30%, rgba(197,147,90,0.22) 70%, rgba(210,160,80,0.18))',
            boxShadow: '0 6px 40px rgba(0,0,0,0.6), 0 0 24px rgba(197,147,90,0.1), inset 0 0 0 1px rgba(197,147,90,0.35), inset 0 0 0 3px rgba(15,26,15,0.6), inset 0 0 0 4px rgba(197,147,90,0.15)',
          }}
        >
          <div
            className="border border-[rgba(197,147,90,0.2)] bg-[rgba(12,20,12,0.95)]"
            style={{ padding: '6px' }}
          >
            <div className="w-[240px] h-[240px] flex items-center justify-center overflow-hidden">
              {imageUrl && isImage ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <ArtifactDisplay type={artifactType} mimeType={mimeType} fileName={fileName} />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── MUSEUM LABEL ── */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Gold divider */}
        <div
          className="w-10 h-px mb-4"
          style={{ background: 'rgba(197,147,90,0.2)' }}
        />

        {/* Origin ID — no prefix */}
        <p
          className="font-mono text-[14px] tracking-[3px] mb-1"
          style={{ color: 'rgba(197,147,90,0.5)' }}
        >
          {shortId}
        </p>

        {/* Date */}
        <p
          className="font-garamond text-[17px] mb-2.5"
          style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        >
          {formatDate(timestamp)}
        </p>

        {/* Hash — full, one line */}
        <p
          className="font-mono text-[11px] tracking-[0.5px] mb-3.5"
          style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.3 }}
        >
          {hash}
        </p>

        {/* Proof components — one line */}
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>
            certificate
          </span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.2)' }} />
          <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>
            hash
          </span>
          {isAnchored ? (
            <>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.2)' }} />
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>
                proof.ots
              </span>
            </>
          ) : (
            <>
              <motion.span
                className="w-[3px] h-[3px] rounded-full"
                style={{ background: 'rgba(197,147,90,0.2)' }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)', opacity: 0.6 }}>
                proof.ots
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* ── SAVE BUTTON ── */}
      <motion.button
        onClick={handleSave}
        disabled={isSaving}
        className="font-playfair text-[17px] px-10 py-3 rounded-full transition-all disabled:opacity-50"
        style={{
          fontWeight: 300,
          background: saved
            ? 'hsl(var(--ritual-gold) / 0.15)'
            : 'hsl(var(--ritual-gold) / 0.08)',
          border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.5' : '0.3'})`,
          color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.8'})`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        whileTap={!saved ? { scale: 0.97 } : {}}
      >
        {saved ? '✓' : isSaving ? 'Saving...' : 'Save'}
      </motion.button>

      {/* ── Device signed (small checkmark, ghost, no explanation) ── */}
      {deviceSignature && (
        <motion.div
          className="flex items-center gap-1.5 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 6L5 9L10 3" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.25)' }}>
            device signed
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
