/**
 * SealedScreen — "The Nail"
 * 
 * V7 is de spijker. Het schilderij hangt eraan.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

const POST_SEAL_HINT_KEY = 'umarise_post_seal_hint_shown';
import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { OriginMark } from '../components/OriginMark';
import { buildOriginZip } from '@/lib/originZip';
import { fetchProofStatus, arrayBufferToBase64, fetchOriginByHash } from '@/lib/coreApi';
import { calculateSHA256FromFile } from '@/lib/originHash';

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
  isAnchored?: boolean;
  onComplete: () => void;
  onNavigateToGallery?: () => void;
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
  onNavigateToGallery,
}: SealedScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [coreOriginId, setCoreOriginId] = useState<string | null>(null);
  const [anchoredState, setAnchoredState] = useState(isAnchored);
  const [isResolvingOrigin, setIsResolvingOrigin] = useState(true);
  const [otsProofBase64, setOtsProofBase64] = useState<string | null>(null);
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [artifactStatus, setArtifactStatus] = useState<'none' | 'matched' | 'mismatch'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isImage = mimeType.startsWith('image/');

  const shortId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();

  // Resolve core origin UUID from hash, then poll for Bitcoin anchor status
  useEffect(() => {
    let cancelled = false;

    const resolveOrigin = async () => {
      setIsResolvingOrigin(true);
      try {
        const resolved = await fetchOriginByHash(hash);
        if (cancelled) return;

        if (!resolved?.origin_id) {
          setCoreOriginId(null);
          setAnchoredState(false);
          return;
        }

        setCoreOriginId(resolved.origin_id);
        if (resolved.proof_status === 'anchored') {
          setAnchoredState(true);
        }
      } finally {
        if (!cancelled) setIsResolvingOrigin(false);
      }
    };

    resolveOrigin();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  useEffect(() => {
    if (!coreOriginId || anchoredState) return;

    const poll = async () => {
      try {
        const result = await fetchProofStatus(coreOriginId);
        if (result.status === 'anchored') {
          setAnchoredState(true);
          if (result.otsProofBytes) setOtsProofBase64(arrayBufferToBase64(result.otsProofBytes));
        }
      } catch {
        // keep waiting state
      }
    };

    poll();
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, [coreOriginId, anchoredState]);

  // Countdown label
  const pendingLabel = useMemo(() => {
    const expectedAt = new Date(timestamp.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expectedAt.getTime() - now.getTime();
    const diffMin = Math.max(0, Math.round(diffMs / 60000));
    if (diffMin <= 0) return 'Bitcoin proof in progress, any moment now';
    if (diffMin < 60) return `Bitcoin proof in progress, ready in ~${diffMin} min`;
    return `Bitcoin proof in progress, ready in ~${Math.ceil(diffMin / 60)} hours`;
  }, [timestamp]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

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

  // Handle artifact re-upload for double verification
  const handleArtifactSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileHash = await calculateSHA256FromFile(file);
    const expectedHash = hash.toLowerCase().replace(/^sha256:/, '');
    
    if (fileHash === expectedHash) {
      setArtifactFile(file);
      setArtifactStatus('matched');
      // Invalidate pre-built ZIP so it gets rebuilt with artifact
      prebuiltZipRef.current = null;
      prebuiltFileRef.current = null;
    } else {
      setArtifactFile(null);
      setArtifactStatus('mismatch');
    }
  }, [hash]);

  // Build ZIP only when anchored + ots proof available
  useEffect(() => {
    if (!anchoredState) return;
    const input = { originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey, otsProof: otsProofBase64 ?? undefined, artifactFile: artifactFile ?? undefined, originalFileName: fileName };
    buildOriginZip(input).then(blob => {
      prebuiltZipRef.current = blob;
      const zipName = `origin-${originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim()}.zip`;
      prebuiltFileRef.current = new File([blob], zipName, { type: 'application/zip' });
    }).catch(err => {
      console.warn('[SealedScreen] Failed to pre-build ZIP:', err);
    });
  }, [originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey, anchoredState, otsProofBase64, artifactFile, fileName]);

  const handleSave = useCallback(() => {
    if (isSaving || saved || !anchoredState) return;
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
      buildOriginZip({ originId, hash, timestamp, imageUrl, deviceSignature, devicePublicKey, otsProof: otsProofBase64 ?? undefined, artifactFile: artifactFile ?? undefined, originalFileName: fileName }).then(blob => {
        downloadBlob(blob, originId);
        setSaved(true);
        setTimeout(() => onComplete(), 800);
      });
    }
  }, [isSaving, saved, originId, hash, timestamp, imageUrl, onComplete, isMobile, deviceSignature, devicePublicKey, anchoredState, otsProofBase64]);

  return (
    <motion.div
      className="relative min-h-screen flex flex-col items-center px-6 pt-12"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── GALLERY NAV (top-left) ── */}
      {onNavigateToGallery && (
        <motion.button
          onClick={onNavigateToGallery}
          className="absolute top-5 left-5 p-2 rounded-full transition-all"
          style={{ background: 'rgba(197,147,90,0.06)', border: '1px solid rgba(197,147,90,0.15)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          aria-label="View gallery"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="rgba(197,147,90,0.45)">
            <rect x="1" y="1" width="7" height="7" rx="1.5" />
            <rect x="10" y="1" width="7" height="7" rx="1.5" />
            <rect x="1" y="10" width="7" height="7" rx="1.5" />
            <rect x="10" y="10" width="7" height="7" rx="1.5" />
          </svg>
        </motion.button>
      )}

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
            background: anchoredState
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
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Gold divider */}
        <div className="w-10 h-px mb-4" style={{ background: 'rgba(197,147,90,0.2)' }} />

        {/* Origin ID */}
        <p
          className="font-mono text-[21px] tracking-[3px] mb-1"
          style={{ color: 'rgba(197,147,90,0.75)' }}
        >
          {shortId}
        </p>

        {/* Date */}
        <p
          className="font-garamond text-[17px] mb-2.5"
          style={{ color: 'hsl(var(--ritual-cream) / 0.55)' }}
        >
          {formatDate(timestamp)}
        </p>

        {/* Hash — full, one line */}
        <p
          className="font-mono text-[17px] tracking-[0.5px] mb-3.5 max-w-[280px] text-center break-all leading-[1.6]"
          style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.45 }}
        >
          {hash}
        </p>

        {/* Proof components — one line */}
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-[15px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.55)' }}>
            certificate
          </span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
          <span className="font-mono text-[15px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.55)' }}>
            hash
          </span>
          {anchoredState ? (
            <>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
              <span className="font-mono text-[15px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.55)' }}>
                proof.ots
              </span>
            </>
          ) : (
            <>
              <motion.span
                className="w-[3px] h-[3px] rounded-full"
                style={{ background: 'rgba(197,147,90,0.35)' }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="font-mono text-[15px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.55)', opacity: 0.7 }}>
                proof.ots
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* ── PENDING COUNTDOWN ── */}
      {!anchoredState && (
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'rgba(197,147,90,0.6)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-mono text-[12px] tracking-[2px] uppercase"
            style={{ color: 'rgba(197,147,90,0.5)' }}>
            {pendingLabel}
          </span>
        </motion.div>
      )}

      {/* ── ARTIFACT RE-UPLOAD (Double Verification) ── */}
      {anchoredState && (
        <motion.div
          className="flex flex-col items-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleArtifactSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-mono text-[13px] tracking-[1px] px-4 py-2 rounded-full transition-all"
            style={{
              background: artifactStatus === 'matched' ? 'rgba(90,160,90,0.1)' : 'rgba(197,147,90,0.06)',
              border: `1px solid ${artifactStatus === 'matched' ? 'rgba(90,160,90,0.35)' : artifactStatus === 'mismatch' ? 'rgba(200,80,80,0.35)' : 'rgba(197,147,90,0.2)'}`,
              color: artifactStatus === 'matched' ? 'rgba(90,160,90,0.8)' : artifactStatus === 'mismatch' ? 'rgba(200,80,80,0.7)' : 'rgba(197,147,90,0.5)',
            }}
          >
            {artifactStatus === 'matched'
              ? `✓ ${artifactFile?.name ?? 'original'} verified`
              : artifactStatus === 'mismatch'
              ? '✗ hash mismatch — try again'
              : '↑ Upload original file (optional)'}
          </button>
          {artifactStatus === 'none' && (
            <span className="font-garamond text-[13px] mt-1.5 italic" style={{ color: 'hsl(var(--ritual-cream) / 0.3)' }}>
              Include your original in the ZIP for complete proof
            </span>
          )}
        </motion.div>
      )}

      {/* ── SAVE BUTTON ── */}
      <motion.button
        onClick={handleSave}
        disabled={isSaving || isResolvingOrigin || !anchoredState}
        className="font-playfair text-[17px] px-10 py-3 rounded-full transition-all disabled:opacity-40"
        style={{
          fontWeight: 300,
          background: saved ? 'hsl(var(--ritual-gold) / 0.15)' : 'hsl(var(--ritual-gold) / 0.08)',
          border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.5' : anchoredState ? '0.3' : '0.15'})`,
          color: `hsl(var(--ritual-gold) / ${saved ? '1' : anchoredState ? '0.8' : '0.4'})`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        whileTap={!saved && anchoredState ? { scale: 0.97 } : {}}
      >
        {saved ? '✓' : isSaving ? 'Saving...' : isResolvingOrigin ? 'Save (checking proof...)' : anchoredState ? (artifactStatus === 'matched' ? 'Save incl. original' : 'Save') : 'Save (waiting for Bitcoin)'}
      </motion.button>

      {/* ── POST-SEAL HINT ── */}
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
          className="font-garamond italic text-[18px] leading-relaxed"
          style={{ color: 'hsl(var(--ritual-cream) / 0.38)' }}
        >
          Tip: rename your file to include <span className="font-mono text-[16px]" style={{ color: 'rgba(197,147,90,0.5)' }}>{shortId}</span> so you can always match it to this proof.
        </p>
      </motion.div>

      {/* ── Device signed ── */}
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
          <span className="font-mono text-[15px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.25)' }}>
            device signed
          </span>
        </motion.div>
      )}

    </motion.div>
  );
}
