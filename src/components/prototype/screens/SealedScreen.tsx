/**
 * SealedScreen — Redesigned 24 Feb 2026
 * 
 * Per briefing: bevestigingsmoment, geen technisch rapport.
 * 
 * Zone 1 — Het moment: Thumbnail, Origin ID, Datum, Hash
 * Zone 2 — Status: ANCHORED · certificate · proof.ots · hash
 * Zone 3 — Acties: Share (primair), Add attestation (secundair + uitleg)
 * Zone 4 — Disclaimer
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { OriginButton } from '../components/OriginButton';
import { AttestationRequestModal } from '../components/AttestationRequestModal';
import { buildOriginZip } from '@/lib/originZip';

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
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

  const isImage = mimeType.startsWith('image/');
  const shortId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Pre-build ZIP on mount
  useEffect(() => {
    const input = { originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey };
    buildOriginZip(input).then(blob => {
      prebuiltZipRef.current = blob;
      prebuiltFileRef.current = new File([blob], `origin-${shortId}.zip`, { type: 'application/zip' });
    }).catch(err => {
      console.warn('[SealedScreen] Failed to pre-build ZIP:', err);
    });
  }, [originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey, shortId]);

  // Auto-complete after 60s
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 60000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Share handler — native share with ZIP, fallback to download
  const handleShare = useCallback(async () => {
    const file = prebuiltFileRef.current;
    if (!file) {
      console.warn('[SealedScreen] ZIP not ready yet');
      return;
    }

    // Try native share
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Origin ${shortId}`,
          text: `Proof of existence — ${shortId}`,
          files: [file],
        });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to download
        if ((err as Error).name !== 'AbortError') {
          console.warn('[SealedScreen] Share failed, falling back to download:', err);
        }
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [shortId]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-6 pt-12 pb-16 relative"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Gallery nav (top-left) ── */}
      <OriginButton onClick={onComplete} className="absolute top-[40px] left-[18px] z-50" />

      {/* ── ZONE 1: Het moment ── */}
      <motion.div
        className="rounded-[4px] mb-7 overflow-hidden relative"
        style={{
          width: 180,
          height: 220,
          background: 'hsl(var(--ritual-surface))',
          border: '1px solid rgba(201,169,110,0.12)',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {imageUrl && isImage ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ArtifactDisplay type={artifactType} mimeType={mimeType} fileName={fileName} />
        )}
      </motion.div>

      <motion.div
        className="flex flex-col items-center text-center w-full max-w-[420px]"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* Origin ID */}
        <p
          className="font-mono text-[28px] tracking-[8px] mb-2.5"
          style={{ color: 'hsl(var(--ritual-gold))' }}
        >
          {shortId}
        </p>

        {/* Date */}
        <p
          className="font-garamond text-[20px] mb-4"
          style={{ color: 'hsl(var(--ritual-cream) / 0.9)' }}
        >
          {formatDate(timestamp)}
        </p>

        {/* Hash — full, break-all, two lines */}
        <p
          className="font-mono text-[11px] tracking-[1px] mb-6 max-w-[320px] text-center break-all leading-[1.7]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.55)' }}
        >
          {hash}
        </p>

        {/* ── ZONE 2: Status ── */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="font-mono text-[9px] tracking-[4px] uppercase" style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>
            anchored
          </span>
          <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'hsl(var(--ritual-gold) / 0.5)' }} />
          <span className="font-mono text-[9px] tracking-[4px] uppercase" style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>
            certificate
          </span>
          <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'hsl(var(--ritual-gold) / 0.5)' }} />
          {isAnchored ? (
            <span className="font-mono text-[9px] tracking-[4px] uppercase" style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>
              proof.ots
            </span>
          ) : (
            <motion.span
              className="font-mono text-[9px] tracking-[4px] uppercase"
              style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              proof.ots
            </motion.span>
          )}
          <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'hsl(var(--ritual-gold) / 0.5)' }} />
          <span className="font-mono text-[9px] tracking-[4px] uppercase" style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>
            hash
          </span>
        </div>

        {/* ── ZONE 3: Acties ── */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Primary: Share */}
          <button
            onClick={handleShare}
            className="font-mono text-[14px] tracking-[6px] uppercase px-10 py-3.5 rounded-full cursor-pointer transition-all hover:tracking-[7px]"
            style={{
              color: 'hsl(var(--ritual-cream) / 0.9)',
              background: 'rgba(201,169,110,0.08)',
              border: '1px solid rgba(201,169,110,0.25)',
            }}
          >
            Share
          </button>

          {/* Secondary: Add attestation */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowAttestationModal(true)}
              className="bg-transparent border-none cursor-pointer font-mono text-[11px] tracking-[4px] uppercase py-1 transition-all hover:tracking-[5px]"
              style={{ color: 'hsl(var(--ritual-gold) / 0.7)' }}
            >
              Add attestation →
            </button>
            <p
              className="font-garamond italic text-[11px] leading-[1.6] max-w-[260px] text-center"
              style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
            >
              A certified third party confirms it was you. €4,95. Optional.
            </p>
          </div>
        </div>

        {/* ── ZONE 4: Disclaimer ── */}
        <p
          className="font-garamond italic text-[11px] leading-[1.6] max-w-[280px] text-center mt-12"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
        >
          Send your original file separately via a secure channel because bytes must stay intact for verification.
        </p>
      </motion.div>

      {/* ── Attestation Modal ── */}
      {showAttestationModal && (
        <AttestationRequestModal
          originId={originId}
          onClose={() => setShowAttestationModal(false)}
          onConfirm={() => setShowAttestationModal(false)}
        />
      )}
    </motion.div>
  );
}
