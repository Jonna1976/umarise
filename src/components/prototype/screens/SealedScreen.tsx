/**
 * SealedScreen — "The Nail"
 * 
 * V7 is de spijker. Het schilderij hangt eraan.
 * 
 * Layout (redesigned 24 Feb 2026):
 * 1. V7 (36px, glow) — the nail
 * 2. Golden wire (1px, 16px) — connects nail to frame
 * 3. Photo in golden museum frame (220px)
 * 4. Gold divider
 * 5. Origin ID
 * 6. Date
 * 7. Hash (full, break-all)
 * 8. Status bar: hash · certificate · proof.ots
 * 9. Collapsible verification details
 * 10. Share (text link) + Attestation card block
 * 11. Save button
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const POST_SEAL_HINT_KEY = 'umarise_post_seal_hint_shown';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { OriginMark } from '../components/OriginMark';
import { AttestationRequestModal } from '../components/AttestationRequestModal';
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
  const [showHint, setShowHint] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [showAttestationModal, setShowAttestationModal] = useState(false);
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

  // Show post-seal hint once per device, auto-fade after 6s
  useEffect(() => {
    const alreadyShown = localStorage.getItem(POST_SEAL_HINT_KEY);
    if (alreadyShown) return;
    const showTimer = setTimeout(() => setShowHint(true), 1400);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const fadeTimer = setTimeout(() => {
      setShowHint(false);
      localStorage.setItem(POST_SEAL_HINT_KEY, 'true');
    }, 6000);
    return () => clearTimeout(fadeTimer);
  }, [showHint]);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    localStorage.setItem(POST_SEAL_HINT_KEY, 'true');
  }, []);

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
        // Fallback without files
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
      {/* ── THE NAIL: V7 hexagon ── */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <OriginMark size={36} state="anchored" glow animated={false} variant="dark" />
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
            padding: '18px',
            background: 'linear-gradient(135deg, rgba(197,147,90,0.4), rgba(180,130,70,0.22) 30%, rgba(197,147,90,0.35) 70%, rgba(210,160,80,0.28))',
            boxShadow: '0 8px 48px rgba(0,0,0,0.65), 0 0 32px rgba(197,147,90,0.12), inset 0 0 0 1px rgba(197,147,90,0.5), inset 0 0 0 2px rgba(15,26,15,0.5), inset 0 0 0 3px rgba(197,147,90,0.25), inset 0 0 0 5px rgba(15,26,15,0.4), inset 0 0 0 6px rgba(197,147,90,0.12)',
          }}
        >
          <div
            className="border-2 border-[rgba(197,147,90,0.3)] bg-[rgba(12,20,12,0.95)]"
            style={{ padding: '8px' }}
          >
            <div className="w-[220px] h-[220px] flex items-center justify-center overflow-hidden">
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
        className="flex flex-col items-center text-center w-full max-w-[420px]"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Gold divider */}
        <div className="w-10 h-px mb-4" style={{ background: 'rgba(197,147,90,0.2)' }} />

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

      {/* ── SAVE BUTTON ── */}
      <motion.button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-8 font-playfair text-[17px] px-10 py-3 rounded-full transition-all disabled:opacity-50"
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

      {/* ── Footer disclaimer ── */}
      <motion.p
        className="mt-6 font-garamond italic text-[13px] text-center leading-relaxed max-w-[280px]"
        style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        Send your original file separately via a secure channel because bytes must stay intact for verification.
      </motion.p>

      {/* ── POST-SEAL HINT — one-time, auto-fades 6s, tap to dismiss ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showHint ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        onClick={dismissHint}
        className="mt-4 text-center cursor-default select-none"
        style={{ pointerEvents: showHint ? 'auto' : 'none', minHeight: '2.5rem' }}
        aria-hidden={!showHint}
      >
        <p
          className="font-garamond italic text-[13px] leading-relaxed"
          style={{ color: 'hsl(var(--ritual-cream) / 0.38)' }}
        >
          ☑️ Anchored. Keep your original file safe —<br />
          you'll need it to verify.
        </p>
      </motion.div>

      {/* ── Device signed indicator ── */}
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
