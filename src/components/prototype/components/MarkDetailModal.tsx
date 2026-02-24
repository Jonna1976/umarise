/**
 * Mark Detail Modal — S7 detail view
 * 
 * Same visual language as SealedScreen:
 * V7 nail (32px), wire, golden frame, museum label.
 * Inline verify (full verification logic like /verify) + share via ZIP.
 * No title. No privacy whisper. No explanation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OriginMark } from './OriginMark';
import { fetchProofStatus, arrayBufferToBase64, verifyOriginByHash } from '@/lib/coreApi';
import { supabase } from '@/integrations/supabase/client';
import { getActiveDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';
import { type VerifyStep, type VerifyResultData } from '@/components/verify/VerifyResult';
import JSZip from 'jszip';
import { 
  type PasskeyCredential,
} from '@/lib/webauthn';
import { getPasskeyCredential } from '@/lib/passkeyStore';
import { AttestationRequestModal } from './AttestationRequestModal';

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

/** Document placeholder SVG — lines pattern */
function DocumentPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(15,26,15,0.95), rgba(20,30,30,0.95))' }}
    >
      <svg width="100" height="100" viewBox="0 0 80 80">
        <line x1="14" y1="18" x2="66" y2="18" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25"/>
        <line x1="14" y1="27" x2="58" y2="27" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.2"/>
        <line x1="14" y1="36" x2="63" y2="36" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25"/>
        <line x1="14" y1="45" x2="42" y2="45" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18"/>
        <line x1="14" y1="56" x2="60" y2="56" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.22"/>
        <line x1="14" y1="65" x2="48" y2="65" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18"/>
      </svg>
    </div>
  );
}

// ── Inline verification result display ──

function InlineVerifyResult({ result, zipFile, onReset, originId, displayOriginId }: {
  result: VerifyResultData;
  zipFile: File;
  onReset: () => void;
  originId: string;
  displayOriginId: string;
}) {
  const [saved, setSaved] = useState(false);

  const handleShare = useCallback(async () => {
    // Try native share with the ZIP file itself
    if (navigator.share && navigator.canShare?.({ files: [zipFile] })) {
      try {
        await navigator.share({
          files: [zipFile],
          title: `Origin ${displayOriginId.slice(0, 8)}`,
          text: `Anchor proof — verify at anchoring.app/verify`,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    // Fallback: download the ZIP directly
    const url = URL.createObjectURL(zipFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFile.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success('ZIP downloaded — share it with your recipient');
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  }, [zipFile, displayOriginId]);

  return (
    <motion.div
      className="w-full max-w-[340px] flex flex-col items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Steps log */}
      {result.steps && result.steps.length > 0 && (
        <div className="w-full rounded-lg px-5 py-5 mb-5 space-y-3" style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(197,147,90,0.12)',
        }}>
          {result.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-mono text-[15px] flex-shrink-0" style={{
                color: step.status === 'ok' ? 'hsl(142 50% 55%)'
                  : step.status === 'warn' ? 'hsl(38 65% 60%)'
                  : step.status === 'error' ? 'hsl(0 60% 60%)'
                  : 'rgba(197,147,90,0.35)',
              }}>
                {step.status === 'ok' ? '✓' : step.status === 'warn' ? '!' : step.status === 'error' ? '✗' : '·'}
              </span>
              <div>
                <span className="font-mono text-[14px]" style={{
                  color: step.status === 'ok' ? 'hsl(142 35% 72%)'
                    : step.status === 'warn' ? 'hsl(38 55% 68%)'
                    : step.status === 'error' ? 'hsl(0 55% 68%)'
                    : 'rgba(245,240,232,0.45)',
                }}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="ml-2 font-mono text-[12px] break-all" style={{ color: 'rgba(245,240,232,0.3)' }}>
                    {step.detail}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status badge */}
      {result.status === 'verified' && (
        <div className="flex items-center gap-3 mb-4">
          <svg viewBox="0 0 20 20" width={20} height={20}>
            <circle cx="10" cy="10" r="9" fill="none" stroke="hsl(142 50% 50%)" strokeWidth="1.3" />
            <polyline points="5.5,10 8.5,13 14.5,7" fill="none" stroke="hsl(142 50% 50%)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[14px] tracking-[3px] uppercase" style={{ color: 'hsl(142 50% 55%)' }}>
            Verified
          </span>
        </div>
      )}
      {result.status === 'not_found' && (
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[14px] tracking-[3px] uppercase" style={{ color: 'rgba(245,240,232,0.5)' }}>
            Not found in registry
          </span>
        </div>
      )}

      {/* Bitcoin block info */}
      {result.bitcoin_block_height && (
        <p className="font-mono text-[13px] mb-4" style={{ color: 'hsl(142 20% 65%)' }}>
          Bitcoin block {result.bitcoin_block_height.toLocaleString('en-US')}
        </p>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        disabled={saved}
        className="font-playfair text-[20px] px-10 py-3.5 rounded-full transition-all disabled:opacity-50 mb-3"
        style={{
          fontWeight: 300,
          background: saved ? 'hsl(var(--ritual-gold) / 0.15)' : 'hsl(var(--ritual-gold) / 0.08)',
          border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.5' : '0.25'})`,
          color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.85'})`,
        }}
      >
        {saved ? '✓ Shared' : 'Share'}
      </button>

      {/* Reminder: send original file separately */}
      <p className="font-garamond italic text-[14px] text-center max-w-[300px] mb-4 leading-[1.6]" style={{ color: 'rgba(245,240,232,0.35)' }}>
        Send your original file separately via a secure channel because bytes must stay intact for verification.
      </p>

      <button
        onClick={onReset}
        className="font-mono text-[13px] tracking-[1px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-80"
        style={{ color: 'rgba(245,240,232,0.35)' }}
      >
        choose different file
      </button>
    </motion.div>
  );
}

// ── ZIP verification logic (same as /verify page) ──

interface CertificateData {
  origin_id: string;
  hash: string;
  captured_at?: string;
  proof_status?: string;
  claimed_by?: string | null;
  signature?: string | null;
  device_signature?: string | null;
  device_public_key?: string | null;
}

async function verifyZipFile(file: File, expectedHash?: string): Promise<VerifyResultData> {
  const steps: VerifyStep[] = [];

  // Step 1: open ZIP
  let zip: JSZip;
  try {
    console.log('[Verify] Opening ZIP:', file.name, 'size:', file.size, 'type:', file.type);
    const arrayBuffer = await file.arrayBuffer();
    console.log('[Verify] ArrayBuffer loaded, size:', arrayBuffer.byteLength);
    zip = await JSZip.loadAsync(arrayBuffer);
    steps.push({ label: `ZIP opened: ${file.name}`, status: 'ok' });
  } catch (err) {
    console.error('[Verify] ZIP open failed:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'error', steps: [{ label: `Could not open ZIP: ${msg}`, status: 'error' }] };
  }

  // Step 2: certificate.json
  const certFile = zip.file('certificate.json');
  if (!certFile) {
    steps.push({ label: 'certificate.json not found', status: 'error' });
    return { status: 'error', steps };
  }
  steps.push({ label: 'certificate.json found', status: 'ok' });

  // Step 3: parse cert
  let cert: CertificateData;
  try {
    const text = await certFile.async('text');
    cert = JSON.parse(text);
  } catch {
    steps.push({ label: 'Certificate could not be read', status: 'error' });
    return { status: 'error', steps };
  }

  if (!cert.hash) {
    steps.push({ label: 'No hash in certificate', status: 'error' });
    return { status: 'error', steps };
  }

  const rawHash = cert.hash.startsWith('sha256:') ? cert.hash.slice(7) : cert.hash;
  steps.push({ label: 'SHA-256 from certificate', status: 'ok', detail: rawHash.substring(0, 20) + '…' });

  // Critical: verify the ZIP's hash matches this specific mark's hash
  if (expectedHash) {
    const normalizedExpected = expectedHash.startsWith('sha256:') ? expectedHash.slice(7) : expectedHash;
    console.log('[Verify] Hash comparison:', {
      certHash: rawHash.substring(0, 16),
      expectedHash: normalizedExpected.substring(0, 16),
      certHashLength: rawHash.length,
      expectedHashLength: normalizedExpected.length,
      match: rawHash.toLowerCase() === normalizedExpected.toLowerCase(),
    });
    if (rawHash.toLowerCase() !== normalizedExpected.toLowerCase()) {
      steps.push({ label: 'Wrong proof file', status: 'error', detail: `This ZIP belongs to a different origin` });
      return { status: 'error', steps };
    }
    steps.push({ label: 'Hash matches this origin', status: 'ok' });
  }

  if (cert.origin_id) {
    steps.push({ label: 'Origin ID', status: 'ok', detail: cert.origin_id.substring(0, 16) + '…' });
  }

  // Step 4: Layer 2 identity binding placeholder
  steps.push({ label: 'Layer 2 identity binding', status: 'info' });

  // Step 5: registry lookup
  steps.push({ label: 'Looking up hash in registry', status: 'info' });
  const verifyResult = await verifyOriginByHash(rawHash);

  if (!verifyResult.found || !verifyResult.origin) {
    steps[steps.length - 1] = { label: 'Hash not found in registry', status: 'error' };
    return { status: 'not_found', steps };
  }

  steps[steps.length - 1] = { label: 'Hash found in registry', status: 'ok', detail: rawHash.substring(0, 16) + '…' };

  const origin = verifyResult.origin;
  const proofStatus: 'pending' | 'anchored' = origin.proof_status || 'pending';

  // Step 6: Bitcoin anchor
  if (proofStatus === 'anchored') {
    steps.push({ label: 'Bitcoin anchor confirmed', status: 'ok' });
  } else {
    steps.push({ label: 'Bitcoin anchor pending', status: 'warn' });
  }

  let bitcoinBlockHeight: number | null = null;
  if (proofStatus === 'anchored') {
    const proofResult = await fetchProofStatus(origin.origin_id);
    if (proofResult.status === 'anchored') {
      bitcoinBlockHeight = proofResult.bitcoinBlockHeight;
      if (bitcoinBlockHeight) {
        steps.push({ label: `Bitcoin block ${bitcoinBlockHeight.toLocaleString('en-US')}`, status: 'ok' });
      }
    }
  }

  return {
    status: proofStatus === 'anchored' ? 'verified' : 'pending',
    origin_id: origin.origin_id,
    hash: origin.hash,
    captured_at: origin.captured_at,
    proof_status: proofStatus,
    bitcoin_block_height: bitcoinBlockHeight,
    claimed_by: cert.claimed_by ?? null,
    signature: cert.signature ?? null,
    device_signature: cert.device_signature ?? null,
    device_public_key: cert.device_public_key ?? null,
    steps,
  };
}

// ── Main modal ──

export function MarkDetailModal({ mark, onClose }: MarkDetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResultData | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const credentialRef = useRef<PasskeyCredential | null>(getPasskeyCredential());
  const otsProofRef = useRef<string | null>(null);

  // Attestation state (Layer 3)
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const [attestationStatus, setAttestationStatus] = useState<'none' | 'pending' | 'attested'>('none');
  const [attestantInfo, setAttestantInfo] = useState<{ name: string; date: string } | null>(null);

  // Poll attestation status on open
  useEffect(() => {
    if (!mark.originUuid) return;
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId) return;

    (async () => {
      try {
        const { data } = await supabase
          .from('attestation_requests')
          .select('status, attestant_name, completed_at')
          .eq('origin_id', mark.originUuid!)
          .eq('device_user_id', deviceUserId)
          .order('requested_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!data) return;
        if (data.status === 'confirmed') {
          setAttestationStatus('attested');
          setAttestantInfo({
            name: data.attestant_name || 'Attestant',
            date: data.completed_at
              ? new Date(data.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : '',
          });
        } else if (data.status === 'pending') {
          setAttestationStatus('pending');
        }
      } catch {
        // silent
      }
    })();
  }, [mark.originUuid]);

  // Eagerly fetch OTS proof (only when anchored — pending/not_found are expected)
  useEffect(() => {
    if (!mark.originUuid || mark.otsStatus !== 'anchored') return;
    fetchProofStatus(mark.originUuid)
      .then(result => {
        if (result.status === 'anchored' && result.otsProofBytes) {
          otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
        }
      })
      .catch(() => {});
  }, [mark.originUuid, mark.otsStatus]);

  const formattedDate = mark.timestamp.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedTime = mark.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  const displayOriginId = mark.originId.toUpperCase().replace('UM-', '');
  const isAnchored = mark.otsStatus === 'anchored';
  const isImage = mark.imageUrl && !imgError;

  // ── ZIP drop/upload → run verification ──
  const handleZipFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip') {
      toast.error('Please drop a ZIP file');
      return;
    }
    setZipFile(file);
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await verifyZipFile(file, mark.hash);
      setVerifyResult(result);
    } catch {
      setVerifyResult({ status: 'error', steps: [{ label: 'Verification failed', status: 'error' }] });
    } finally {
      setVerifying(false);
    }
  }, [mark.hash]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleZipFile(file);
  }, [handleZipFile]);

  const resetZip = useCallback(() => {
    setZipFile(null);
    setVerifyResult(null);
    setVerifying(false);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto"
        style={{ background: 'hsl(var(--ritual-surface))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
          style={{ background: 'rgba(197,147,90,0.06)' }}
        >
          <X className="w-5 h-5" style={{ color: 'rgba(197,147,90,0.5)' }} />
        </button>

        {/* Content */}
        <motion.div
          className="w-full max-w-[400px] mx-4 flex flex-col items-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* V7 nail + wire */}
          <div className="flex flex-col items-center">
            <OriginMark
              size={36}
              state={isAnchored ? 'anchored' : 'pending'}
              glow={isAnchored}
              animated={!isAnchored}
              variant="dark"
            />
            <div
              className="w-px h-4"
              style={{
                background: isAnchored
                  ? 'linear-gradient(to bottom, rgba(197,147,90,0.5), rgba(197,147,90,0.15))'
                  : 'linear-gradient(to bottom, rgba(197,147,90,0.25), rgba(197,147,90,0.08))',
              }}
            />
          </div>

          {/* Photo in golden frame — show placeholder on error */}
          <div
            className="rounded-[4px] mb-6"
            style={{
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(197,147,90,0.3), rgba(180,130,70,0.15) 30%, rgba(197,147,90,0.25) 70%, rgba(210,160,80,0.2))',
              boxShadow: '0 6px 40px rgba(0,0,0,0.55), 0 0 24px rgba(197,147,90,0.1), inset 0 0 0 1px rgba(197,147,90,0.4), inset 0 0 0 2px rgba(15,26,15,0.5), inset 0 0 0 3px rgba(197,147,90,0.2)',
            }}
          >
            <div
              className="border border-[rgba(197,147,90,0.2)] bg-[rgba(12,20,12,0.95)]"
              style={{ padding: '6px' }}
            >
              <div className="w-[260px] h-[200px] overflow-hidden">
                {isImage ? (
                  <img src={mark.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <DocumentPlaceholder />
                )}
              </div>
            </div>
          </div>

          {/* Museum label */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-px mb-5" style={{ background: 'rgba(197,147,90,0.25)' }} />

            <p className="font-mono text-[24px] tracking-[5px] mb-2" style={{ color: 'rgba(197,147,90,0.75)' }}>
              {displayOriginId}
            </p>

            <p className="font-garamond text-[26px] mb-3" style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}>
              {formattedDate} · {formattedTime}
            </p>

            <p className="font-mono text-[15px] tracking-[0.5px] mb-5 max-w-[340px] break-all leading-[1.7] text-center" style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.5 }}>
              {mark.hash}
            </p>

            {/* Proof components */}
            <div className="flex items-center gap-5 mb-8">
              <span className="font-mono text-[15px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)' }}>certificate</span>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
              <span className="font-mono text-[15px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)' }}>hash</span>
              {isAnchored ? (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
                  <span className="font-mono text-[15px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)' }}>proof.ots</span>
                </>
              ) : (
                <>
                  <motion.span
                    className="w-[3px] h-[3px] rounded-full"
                    style={{ background: 'rgba(197,147,90,0.35)' }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="font-mono text-[15px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)', opacity: 0.6 }}>proof.ots</span>
                </>
              )}
            </div>

            {/* Attestation status (Layer 3) */}
            {attestationStatus === 'pending' && (
              <p className="font-garamond italic text-[15px] mb-4" style={{ color: 'rgba(245,240,232,0.5)' }}>
                Attestation requested. You will be notified when complete.
              </p>
            )}
            {attestationStatus === 'attested' && attestantInfo && (
              <div className="flex flex-col items-center mb-4">
                <button
                  onClick={() => {/* TODO: open attestant details modal */}}
                  className="font-garamond italic text-[15px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
                >
                  Attested by {attestantInfo.name} ✓
                </button>
                {attestantInfo.date && (
                  <span className="font-mono text-[12px] tracking-[1px] mt-1" style={{ color: 'rgba(197,147,90,0.35)' }}>
                    {attestantInfo.date}
                  </span>
                )}
              </div>
            )}
            {attestationStatus === 'attested' && !attestantInfo && (
              <button
                onClick={() => {/* TODO: open attestant details modal */}}
                className="font-garamond italic text-[15px] mb-4 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
              >
                Attested ✓
              </button>
            )}

            {/* Request attestation link — only when Bitcoin-confirmed and no attestation yet */}
            {isAnchored && attestationStatus === 'none' && (
              <button
                onClick={() => setShowAttestationModal(true)}
                className="font-mono text-[13px] tracking-[3px] uppercase bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70 mb-4"
                style={{ color: 'rgba(245,240,232,0.4)' }}
              >
                Request attestation
              </button>
            )}
          </div>

          {/* ── Inline Verify + Share zone ── */}
          <div className="w-full flex flex-col items-center">
            {!zipFile ? (
              /* Drop zone for ZIP */
              <div
                className="w-full max-w-[340px] flex flex-col items-center gap-3 py-8 px-4 rounded-lg cursor-pointer transition-all"
                style={{
                  border: `1px dashed rgba(197,147,90,${isDragging ? '0.5' : '0.2'})`,
                  background: isDragging ? 'rgba(197,147,90,0.04)' : 'transparent',
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => zipInputRef.current?.click()}
              >
                <p className="font-garamond text-[20px] text-center" style={{ color: 'rgba(245,240,232,0.55)' }}>
                  {isDragging ? 'Drop your ZIP here' : 'Drop or select your proof ZIP'}
                </p>
                <p className="font-mono text-[14px] tracking-[1px] text-center" style={{ color: 'rgba(197,147,90,0.4)' }}>
                  to verify and share
                </p>
              </div>
            ) : verifying ? (
              /* Verifying spinner */
              <div className="flex flex-col items-center gap-4 py-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <svg viewBox="0 0 48 48" width={32} height={32}>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(197,147,90,0.2)" strokeWidth="1.5" />
                    <path d="M24 4 A20 20 0 0 1 44 24" fill="none" stroke="rgba(197,147,90,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
                <span className="font-mono text-[14px] tracking-[2px] uppercase" style={{ color: 'rgba(245,240,232,0.6)' }}>
                  Verifying…
                </span>
              </div>
            ) : verifyResult ? (
              /* Verification result + share */
              <InlineVerifyResult
                result={verifyResult}
                zipFile={zipFile}
                onReset={resetZip}
                originId={mark.originId}
                displayOriginId={displayOriginId}
              />
            ) : null}

            {/* Hidden ZIP input */}
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleZipFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Device signed */}
          {credentialRef.current && (
            <div className="flex items-center gap-2 mt-6">
              <svg width="16" height="16" viewBox="0 0 12 12">
                <path d="M2 6L5 9L10 3" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-mono text-[14px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>
                device signed
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Attestation request modal (Layer 3) */}
      {showAttestationModal && mark.originUuid && (
        <AttestationRequestModal
          originId={mark.originUuid}
          onClose={() => setShowAttestationModal(false)}
          onConfirm={() => {
            setShowAttestationModal(false);
            setAttestationStatus('pending');
          }}
        />
      )}
    </AnimatePresence>
  );
}
