/**
 * SealedScreen — Confirmation moment after anchoring
 * 
 * Pure bevestiging. Geen acties. Geen technisch rapport.
 * Share en attestation leven in de gallery (MarkDetailModal).
 * 
 * Zone 1 — Het moment: Thumbnail, Origin ID, Datum, Hash
 * Zone 2 — Status: certificate · proof.ots · hash
 * Zone 3 — Disclaimer
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ArtifactDisplay } from '../components/ArtifactDisplay';
import { OriginButton } from '../components/OriginButton';
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

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className="inline-block w-[6px] h-[6px] rounded-full mr-2"
      style={{
        background: active
          ? 'hsl(var(--ritual-gold))'
          : 'hsl(var(--ritual-cream) / 0.2)',
      }}
    />
  );
}

function StatusAccordion({ isAnchored }: { isAnchored?: boolean }) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'SHA-256 hash', done: true, detail: 'Fingerprint van je bestand — onmiddellijk berekend.' },
    { label: 'Certificate', done: true, detail: 'Umarise Origin Certificate — direct gegenereerd.' },
    { label: 'Bitcoin proof (OTS)', done: !!isAnchored, detail: isAnchored ? 'Verankerd in de Bitcoin blockchain.' : 'Wacht op Bitcoin-bevestiging — dit duurt enkele uren.' },
  ];

  return (
    <div className="w-full max-w-[320px] mb-10">
      {/* Collapsed summary */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center gap-2.5 w-full bg-transparent border-none cursor-pointer py-1"
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="w-[2px] h-[2px] rounded-full mr-2.5" style={{ background: 'hsl(var(--ritual-gold) / 0.5)' }} />}
            {!item.done ? (
              <motion.span
                className="font-mono text-[9px] tracking-[4px] uppercase"
                style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {item.label.split(' ')[0].toLowerCase()}
              </motion.span>
            ) : (
              <span className="font-mono text-[9px] tracking-[4px] uppercase" style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>
                {item.label.split(' ')[0].toLowerCase()}
              </span>
            )}
          </span>
        ))}
        <ChevronDown
          className="w-3 h-3 ml-1 transition-transform duration-300"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <StatusDot active={item.done} />
                  <div>
                    <p className="font-mono text-[11px] tracking-[2px] uppercase m-0" style={{ color: item.done ? 'hsl(var(--ritual-gold) / 0.8)' : 'hsl(var(--ritual-cream) / 0.5)' }}>
                      {item.label}
                    </p>
                    <p className="font-garamond text-[11px] leading-[1.5] mt-0.5 m-0" style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}>
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const isImage = mimeType.startsWith('image/');
  const shortId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();
  const prebuiltZipRef = useRef<Blob | null>(null);
  const prebuiltFileRef = useRef<File | null>(null);

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

  // Save handler — native share with ZIP, fallback to download
  const handleSave = useCallback(async () => {
    const file = prebuiltFileRef.current;
    if (!file) {
      console.warn('[SealedScreen] ZIP not ready yet');
      return;
    }
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Origin ${shortId}`,
          text: `Proof of existence — ${shortId}`,
          files: [file],
        });
        return;
      } catch (err) {
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

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Auto-complete after 60s
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 60000);
    return () => clearTimeout(timer);
  }, [onComplete]);

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

        {/* ── ZONE 2: Status (expandable) ── */}
        <StatusAccordion isAnchored={isAnchored} />

        {/* Save — ZIP download */}
        <button
          onClick={handleSave}
          className="bg-transparent border-none cursor-pointer font-mono text-[13px] tracking-[5px] uppercase transition-all hover:tracking-[6px]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}
        >
          Save
        </button>

        {/* ── ZONE 3: Disclaimer ── */}
        <p
          className="font-garamond italic text-[11px] leading-[1.6] max-w-[280px] text-center mt-8"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
        >
          Send your original file separately via a secure channel because bytes must stay intact for verification.
        </p>
        <button
          onClick={onComplete}
          className="mt-10 bg-transparent border-none cursor-pointer font-mono text-[11px] tracking-[4px] uppercase transition-opacity hover:opacity-70"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
        >
          Continue →
        </button>
      </motion.div>
    </motion.div>
  );
}
