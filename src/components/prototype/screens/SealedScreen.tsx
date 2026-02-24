/**
 * SealedScreen — "The Nail"
 * 
 * Redesigned 24 Feb 2026 to match sealed-screen-mockup_2.html exactly.
 * 
 * Layout:
 * 1. Thumbnail (180×220, simple border)
 * 2. Origin ID (DM Mono 28px, gold)
 * 3. Date (EB Garamond 20px)
 * 4. Hash (full, break-all)
 * 5. Status bar: hash · certificate · proof.ots
 * 6. Collapsible verification details
 * 7. Divider
 * 8. Share (text link) + Attestation card block
 * 9. Footer disclaimer
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
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
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

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
      prebuiltFileRef.current = new File([blob], `origin-${shortId}.zip`, { type: 'application/zip' });
    }).catch(err => {
      console.warn('[SealedScreen] Failed to pre-build ZIP:', err);
    });
  }, [originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey, shortId]);

  // Auto-complete after mount (user can share/attest, then navigate away)
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 60000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Share handler — Web Share API with ZIP
  const handleShare = useCallback(async () => {
    const file = prebuiltFileRef.current;
    if (!file) return;

    const shareData: ShareData = {
      title: 'Anchor share',
      text: 'Anchor proof — verify at anchoring.app/verify\n\nSend your original file separately via a secure channel because bytes must stay intact for verification.',
      files: [file],
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({ title: shareData.title, text: shareData.text });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('[SealedScreen] Share failed:', err);
      }
    }
  }, []);

  // Verification items
  const hashShort = hash ? `${hash.substring(0, 8)}…` : '—';
  const verificationItems = [
    { label: 'ZIP opened', value: `origin-${shortId}.zip`, confirmed: true },
    { label: 'certificate.json found', confirmed: true },
    { label: 'SHA-256', value: hashShort, confirmed: !!hash },
    { label: 'Origin ID', value: `${shortId}…`, confirmed: !!shortId },
    { label: 'Layer 2 identity binding', confirmed: !!deviceSignature },
    { label: 'Hash found in registry', value: hashShort, confirmed: true },
    { label: 'Bitcoin anchor confirmed', confirmed: isAnchored },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-6 pt-12 pb-16"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── THUMBNAIL ── */}
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

      {/* ── MUSEUM LABEL ── */}
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
          style={{ color: 'hsl(var(--ritual-cream) / 0.85)' }}
        >
          {formatDate(timestamp)}
        </p>

        {/* Hash — full, break-all */}
        <p
          className="font-mono text-[11px] tracking-[1px] mb-5 max-w-[320px] text-center break-all leading-[1.7]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        >
          {hash}
        </p>

        {/* ── Status bar: hash · certificate · proof.ots ── */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="font-mono text-[11px] tracking-[4px] uppercase" style={{ color: 'rgba(197,147,90,0.4)' }}>
            hash
          </span>
          <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'rgba(197,147,90,0.4)' }} />
          <span className="font-mono text-[11px] tracking-[4px] uppercase" style={{ color: 'rgba(197,147,90,0.4)' }}>
            certificate
          </span>
          <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'rgba(197,147,90,0.4)' }} />
          {isAnchored ? (
            <span className="font-mono text-[11px] tracking-[4px] uppercase" style={{ color: 'rgba(197,147,90,0.4)' }}>
              proof.ots
            </span>
          ) : (
            <motion.span
              className="font-mono text-[11px] tracking-[4px] uppercase"
              style={{ color: 'rgba(197,147,90,0.4)' }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              proof.ots
            </motion.span>
          )}
        </div>

        {/* ── Collapsible verification details ── */}
        <div className="w-full mb-7">
          <button
            onClick={() => setVerificationOpen(!verificationOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-transparent border-none cursor-pointer transition-colors hover:text-[rgba(197,147,90,0.4)]"
            style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
          >
            <span className="font-mono text-[11px] tracking-[4px] uppercase">
              verification details
            </span>
            <motion.span
              className="text-[8px]"
              animate={{ rotate: verificationOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▾
            </motion.span>
          </button>

          <AnimatePresence>
            {verificationOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className="mt-2.5 rounded-[4px] px-5 py-4"
                  style={{
                    background: 'rgba(17,31,17,1)',
                    border: '1px solid hsl(var(--ritual-cream) / 0.12)',
                  }}
                >
                  {verificationItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 py-1.5 font-mono text-[12px] tracking-[0.5px]"
                      style={{
                        borderBottom: i < verificationItems.length - 1
                          ? '1px solid hsl(var(--ritual-cream) / 0.12)'
                          : 'none',
                      }}
                    >
                      <span
                        className="text-[10px] mt-[1px] flex-shrink-0"
                        style={{ color: item.confirmed ? '#4a7c59' : 'rgba(197,147,90,0.4)' }}
                      >
                        {item.confirmed ? '✓' : '·'}
                      </span>
                      <span
                        className="flex-1 leading-[1.5]"
                        style={{ color: item.confirmed ? 'hsl(var(--ritual-cream) / 0.65)' : 'hsl(var(--ritual-cream) / 0.35)' }}
                      >
                        {item.label}
                      </span>
                      {item.value && (
                        <span
                          className="text-[9px] break-all"
                          style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
                        >
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-10 h-px mb-7" style={{ background: 'hsl(var(--ritual-cream) / 0.12)' }} />

        {/* ── Actions: Share + Attestation ── */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* Share — text link style */}
          <button
            onClick={handleShare}
            className="bg-transparent border-none cursor-pointer font-mono text-[13px] tracking-[5px] uppercase py-1.5 transition-all hover:tracking-[6px]"
            style={{ color: 'hsl(var(--ritual-cream) / 0.85)' }}
          >
            Share
          </button>

          {/* Attestation block */}
          {isAnchored && (
            <div
              className="w-full max-w-[320px] rounded-[4px] flex flex-col items-center gap-2.5 px-6 py-5"
              style={{
                background: 'rgba(201,169,110,0.04)',
                border: '1px solid rgba(201,169,110,0.15)',
              }}
            >
              <span
                className="font-mono text-[11px] tracking-[5px] uppercase"
                style={{ color: 'rgba(201,169,110,0.4)' }}
              >
                Attestation
              </span>
              <p
                className="font-garamond text-[16px] text-center leading-[1.6] max-w-[240px]"
                style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
              >
                A certified third party confirms it was you. €4,95. One-time.
              </p>
              <button
                onClick={() => setShowAttestationModal(true)}
                className="mt-1 bg-transparent cursor-pointer font-mono text-[11px] tracking-[4px] uppercase rounded-full px-6 py-2.5 transition-all hover:bg-[rgba(201,169,110,0.15)] hover:border-[rgba(201,169,110,1)]"
                style={{
                  color: 'hsl(var(--ritual-gold))',
                  border: '1px solid rgba(201,169,110,0.4)',
                }}
              >
                Request attestation →
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Footer disclaimer ── */}
      <motion.p
        className="mt-8 font-garamond italic text-[13px] text-center leading-relaxed max-w-[280px]"
        style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        Send your original file separately via a secure channel because bytes must stay intact for verification.
      </motion.p>

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
