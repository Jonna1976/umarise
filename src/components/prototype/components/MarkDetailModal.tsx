/**
 * Mark Detail Modal — S7 detail view
 * 
 * Same visual language as SealedScreen:
 * V7 nail (32px), wire, golden frame, museum label.
 * Share button. Device signed indicator.
 * No title. No privacy whisper. No explanation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OriginMark } from './OriginMark';
import { buildOriginZip, saveOriginZip } from '@/lib/originZip';
import { fetchProofStatus, arrayBufferToBase64 } from '@/lib/coreApi';
import { verifyFileHash } from '@/lib/originHash';
import { toast } from 'sonner';
import { 
  signHash, 
  isWebAuthnSupported,
  type PasskeyCredential,
} from '@/lib/webauthn';
import { getPasskeyCredential } from '@/lib/passkeyStore';

interface MarkDetailModalProps {
  mark: {
    id: string;
    originId: string;
    hash: string;
    timestamp: Date;
    otsStatus: 'pending' | 'submitted' | 'anchored';
    imageUrl?: string;
    originUuid?: string;
  };
  onClose: () => void;
}

export function MarkDetailModal({ mark, onClose }: MarkDetailModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [proofLoaded, setProofLoaded] = useState(false);
  const [fetchingProof, setFetchingProof] = useState(false);
  const [verifyingFile, setVerifyingFile] = useState(false);
  
  const credentialRef = useRef<PasskeyCredential | null>(getPasskeyCredential());
  const signatureRef = useRef<string | null>(null);
  const otsProofRef = useRef<string | null>(null);
  const artifactFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Eagerly fetch OTS proof — silently ignore 404 for pending marks
  useEffect(() => {
    if (!mark.originUuid) return;
    fetchProofStatus(mark.originUuid)
      .then(result => {
        if (result.status === 'anchored' && result.otsProofBytes) {
          otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
          setProofLoaded(true);
        }
      })
      .catch(() => {
        // Expected 404 for marks not yet anchored — no action needed
      });
  }, [mark.originUuid]);

  const formattedDate = mark.timestamp.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedTime = mark.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  // Clean origin ID — no prefix
  const displayOriginId = mark.originId.toUpperCase().replace('UM-', '');

  const isAnchored = mark.otsStatus === 'anchored';

  // Handle file selection → verify hash → build ZIP
  const handleFileSelected = useCallback(async (file: File) => {
    setVerifyingFile(true);
    try {
      const match = await verifyFileHash(file, mark.hash);
      if (!match) {
        toast.error('Hash mismatch — dit is niet het originele bestand');
        setVerifyingFile(false);
        return;
      }
      artifactFileRef.current = file;
      
      setIsSaving(true);
      setVerifyingFile(false);

      if (credentialRef.current && !signatureRef.current) {
        try {
          const sig = await signHash(credentialRef.current.credentialId, mark.hash);
          signatureRef.current = sig.signature;
        } catch (e) {
          console.warn('[MarkDetailModal] Hash signing skipped:', e);
        }
      }

      if (isAnchored && !otsProofRef.current && mark.originUuid) {
        setFetchingProof(true);
        try {
          const result = await fetchProofStatus(mark.originUuid);
          if (result.status === 'anchored' && result.otsProofBytes) {
            otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
            setProofLoaded(true);
          }
        } catch (e) {
          console.warn('[MarkDetailModal] Proof fetch failed:', e);
        } finally {
          setFetchingProof(false);
        }
      }

      const success = await saveOriginZip({
        originId: mark.originId,
        hash: mark.hash,
        timestamp: mark.timestamp,
        imageUrl: mark.imageUrl ?? null,
        claimedBy: credentialRef.current?.publicKey ?? null,
        signature: signatureRef.current ?? null,
        deviceSignature: signatureRef.current ?? null,
        devicePublicKey: credentialRef.current?.publicKey ?? null,
        otsProof: otsProofRef.current,
        artifactFile: artifactFileRef.current,
      });

      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      console.error('[MarkDetailModal] Save error:', error);
    } finally {
      setIsSaving(false);
      setVerifyingFile(false);
    }
  }, [isAnchored, mark.originId, mark.originUuid, mark.hash, mark.timestamp, mark.imageUrl]);

  // Share flow: select ZIP → share via native sheet or clipboard fallback
  const handleShare = useCallback(() => {
    if (saved) return;
    (window as any).__zipInputRef?.click();
  }, [saved]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'hsl(var(--ritual-bg) / 0.96)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
          style={{ background: 'rgba(197,147,90,0.06)' }}
        >
          <X className="w-4 h-4" style={{ color: 'rgba(197,147,90,0.4)' }} />
        </button>

        {/* Content */}
        <motion.div
          className="w-full max-w-[340px] mx-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* V7 nail + wire */}
          <div className="flex flex-col items-center">
            <OriginMark
              size={32}
              state={isAnchored ? 'anchored' : 'pending'}
              glow={isAnchored}
              animated={!isAnchored}
              variant="dark"
            />
            <div
              className="w-px h-3"
              style={{
                background: isAnchored
                  ? 'linear-gradient(to bottom, rgba(197,147,90,0.5), rgba(197,147,90,0.15))'
                  : 'linear-gradient(to bottom, rgba(197,147,90,0.25), rgba(197,147,90,0.08))',
              }}
            />
          </div>

          {/* Photo in golden frame */}
          {mark.imageUrl && (
            <div
              className="rounded-[3px] mb-5"
              style={{
                padding: '8px',
                background: 'linear-gradient(135deg, rgba(197,147,90,0.22), rgba(180,130,70,0.12) 30%, rgba(197,147,90,0.18) 70%, rgba(210,160,80,0.15))',
                boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 20px rgba(197,147,90,0.08), inset 0 0 0 2px rgba(197,147,90,0.25), inset 0 0 0 3px rgba(15,26,15,0.5), inset 0 0 0 4px rgba(197,147,90,0.1)',
              }}
            >
              <div
                className="border border-[rgba(197,147,90,0.15)] bg-[rgba(12,20,12,0.95)]"
                style={{ padding: '4px' }}
              >
                <div className="w-[250px] h-[190px] overflow-hidden">
                  <img src={mark.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* Museum label */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-px mb-4" style={{ background: 'rgba(197,147,90,0.2)' }} />

            <p className="font-mono text-[14px] tracking-[3px] mb-1" style={{ color: 'rgba(197,147,90,0.5)' }}>
              {displayOriginId}
            </p>

            <p className="font-garamond text-[17px] mb-2.5" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>
              {formattedDate} · {formattedTime}
            </p>

            <p className="font-mono text-[11px] tracking-[0.5px] mb-3.5" style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.3 }}>
              {mark.hash}
            </p>

            {/* Proof components */}
            <div className="flex items-center gap-4 mb-5">
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>certificate</span>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.2)' }} />
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>hash</span>
              {isAnchored ? (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.2)' }} />
                  <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>proof.ots</span>
                </>
              ) : (
                <>
                  <motion.span
                    className="w-[3px] h-[3px] rounded-full"
                    style={{ background: 'rgba(197,147,90,0.2)' }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)', opacity: 0.6 }}>proof.ots</span>
                </>
              )}
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*" // V2: expand to application/pdf, audio/*, video/*, text/*
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = '';
            }}
          />
          <input
            ref={(el) => { (window as any).__zipInputRef = el; }}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const verifyUrl = `https://anchoring.app/verify?origin_id=${encodeURIComponent(mark.originId)}`;
              let shared = false;

              if (navigator.share) {
                try {
                  await navigator.share({
                    files: [file],
                    title: `Origin ${displayOriginId.slice(0, 8)}`,
                    url: verifyUrl,
                  });
                  shared = true;
                } catch (err) {
                  if ((err as Error).name === 'AbortError') {
                    e.target.value = '';
                    return;
                  }
                }
              }

              if (!shared) {
                try {
                  await navigator.clipboard.writeText(verifyUrl);
                  toast.success('Verify link gekopieerd');
                } catch {
                  toast.info(verifyUrl, { duration: 8000 });
                }
              }

              setSaved(true);
              setTimeout(() => setSaved(false), 4000);
              e.target.value = '';
            }}
          />

          {/* Verify + Share — inline text links */}
          <div className="flex items-center gap-3 mb-4">
            <a
              href={`/verify?origin_id=${encodeURIComponent(mark.originId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] tracking-[3px] uppercase no-underline transition-opacity hover:opacity-80"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              Verify this proof
            </a>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(197,147,90,0.2)' }}>·</span>
            <button
              onClick={handleShare}
              disabled={saved}
              className="font-mono text-[9px] tracking-[3px] uppercase transition-opacity hover:opacity-80 disabled:opacity-50 bg-transparent border-none cursor-pointer"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              {saved ? '✓ Shared' : 'Share'}
            </button>
          </div>

          {/* Device signed — small checkmark, ghost */}
          {credentialRef.current && (
            <div className="flex items-center gap-1.5 mt-1">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 6L5 9L10 3" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.25)' }}>
                device signed
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
