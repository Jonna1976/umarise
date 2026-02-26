/**
 * Mark Detail Modal — S7 detail view
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
import { type PasskeyCredential } from '@/lib/webauthn';
import { getPasskeyCredential } from '@/lib/passkeyStore';
import { AttestationRequestModal } from './AttestationRequestModal';
import { calculateSHA256 } from '@/lib/originHash';
import { buildOriginZip, buildZipFileName } from '@/lib/originZip';

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

function DocumentPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(15,26,15,0.95), rgba(20,30,30,0.95))' }}>
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
  result: VerifyResultData; zipFile: File; onReset: () => void; originId: string; displayOriginId: string;
}) {
  const [saved, setSaved] = useState(false);

  const handleShare = useCallback(async () => {
    const shareText = [
      `Anchor proof for origin ${displayOriginId.slice(0, 8)}`, '',
      'Verify this proof at: https://anchoring.app/verify', '',
      'Important: Send your original file separately via a secure channel, because bytes must stay intact for verification.',
    ].join('\n');

    if (navigator.share && navigator.canShare?.({ files: [zipFile] })) {
      try {
        await navigator.share({ files: [zipFile], title: `Anchor proof — ${displayOriginId.slice(0, 8)}`, text: shareText });
        setSaved(true); setTimeout(() => setSaved(false), 4000); return;
      } catch (err) { if ((err as Error).name === 'AbortError') return; }
    }

    const subject = encodeURIComponent(`Anchor proof — ${displayOriginId.slice(0, 8)}`);
    const body = encodeURIComponent(shareText + '\n\nThe proof ZIP is attached separately (downloaded to your device).');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    const url = URL.createObjectURL(zipFile);
    const a = document.createElement('a'); a.href = url; a.download = zipFile.name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success('ZIP downloaded — attach it to the email');
    setSaved(true); setTimeout(() => setSaved(false), 4000);
  }, [zipFile, displayOriginId]);

  return (
    <motion.div className="w-full max-w-[340px] flex flex-col items-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {result.status === 'verified' && (
        <div className="flex items-center gap-3 mb-4">
          <svg viewBox="0 0 20 20" width={20} height={20}>
            <circle cx="10" cy="10" r="9" fill="none" stroke="hsl(142 50% 50%)" strokeWidth="1.3" />
            <polyline points="5.5,10 8.5,13 14.5,7" fill="none" stroke="hsl(142 50% 50%)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[21px] tracking-[3px] uppercase" style={{ color: 'hsl(142 50% 55%)' }}>Verified</span>
        </div>
      )}
      {result.status === 'not_found' && (
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[21px] tracking-[3px] uppercase" style={{ color: 'rgba(245,240,232,0.5)' }}>Not found in registry</span>
        </div>
      )}
      {result.bitcoin_block_height && (
        <p className="font-mono text-[20px] mb-4" style={{ color: 'hsl(142 20% 65%)' }}>Bitcoin block {result.bitcoin_block_height.toLocaleString('en-US')}</p>
      )}
      {result.status === 'verified' && (
        <button onClick={handleShare} disabled={saved}
          className="bg-transparent border-none cursor-pointer transition-all disabled:opacity-50 mb-3 hover:tracking-[6px]"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '20px', letterSpacing: '5px', textTransform: 'uppercase', color: saved ? 'rgba(240,234,214,0.5)' : 'rgba(240,234,214,0.85)' }}>
          {saved ? '✓ Shared' : 'Share'}
        </button>
      )}
      <button onClick={onReset}
        className="font-mono text-[17px] tracking-[1px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-80"
        style={{ color: 'rgba(245,240,232,0.3)' }}>
        verify different file
      </button>
    </motion.div>
  );
}

// ── ZIP verification logic ──

interface CertificateData {
  origin_id: string; hash: string; captured_at?: string; proof_status?: string;
  claimed_by?: string | null; signature?: string | null; device_signature?: string | null; device_public_key?: string | null;
}

async function verifyZipFile(file: File, expectedHash?: string): Promise<VerifyResultData> {
  const steps: VerifyStep[] = [];
  let zip: JSZip;
  try {
    const arrayBuffer = await file.arrayBuffer();
    zip = await JSZip.loadAsync(arrayBuffer);
    steps.push({ label: `ZIP opened: ${file.name}`, status: 'ok' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'error', steps: [{ label: `Could not open ZIP: ${msg}`, status: 'error' }] };
  }

  const certFile = zip.file('certificate.json');
  if (!certFile) { steps.push({ label: 'certificate.json not found', status: 'error' }); return { status: 'error', steps }; }
  steps.push({ label: 'certificate.json found', status: 'ok' });

  let cert: CertificateData;
  try { cert = JSON.parse(await certFile.async('text')); }
  catch { steps.push({ label: 'Certificate could not be read', status: 'error' }); return { status: 'error', steps }; }

  if (!cert.hash) { steps.push({ label: 'No hash in certificate', status: 'error' }); return { status: 'error', steps }; }

  const rawHash = cert.hash.startsWith('sha256:') ? cert.hash.slice(7) : cert.hash;

  if (expectedHash) {
    const normalizedExpected = expectedHash.startsWith('sha256:') ? expectedHash.slice(7) : expectedHash;
    const hashesMatch = rawHash.toLowerCase() === normalizedExpected.toLowerCase();
    if (!hashesMatch) {
      steps.forEach((s) => { s.status = 'error'; });
      steps.push({ label: 'SHA-256 from certificate', status: 'error', detail: rawHash.substring(0, 20) + '…' });
      steps.push({ label: 'Wrong proof file', status: 'error', detail: 'This ZIP belongs to a different origin' });
      return { status: 'error', steps };
    }
    steps.push({ label: 'SHA-256 from certificate', status: 'ok', detail: rawHash.substring(0, 20) + '…' });
    steps.push({ label: 'Hash matches this origin', status: 'ok' });
  } else {
    steps.push({ label: 'SHA-256 from certificate', status: 'ok', detail: rawHash.substring(0, 20) + '…' });
  }

  if (cert.origin_id) steps.push({ label: 'Origin ID', status: 'ok', detail: cert.origin_id.substring(0, 16) + '…' });
  if (cert.device_signature && cert.device_public_key) {
    steps.push({ label: 'Device-signed (Layer 2)', status: 'ok', detail: 'Hardware-bound identity' });
  } else if (cert.device_public_key) {
    steps.push({ label: 'Device key present (Layer 2)', status: 'ok', detail: cert.device_public_key.substring(0, 16) + '…' });
  } else {
    steps.push({ label: 'No device binding (Layer 2)', status: 'warn', detail: 'Not hardware-signed' });
  }
  steps.push({ label: 'Looking up hash in registry', status: 'info' });

  const verifyResult = await verifyOriginByHash(rawHash);
  if (!verifyResult.found || !verifyResult.origin) {
    steps[steps.length - 1] = { label: 'Hash not found in registry', status: 'error' };
    return { status: 'not_found', steps };
  }
  steps[steps.length - 1] = { label: 'Hash found in registry', status: 'ok', detail: rawHash.substring(0, 16) + '…' };

  const origin = verifyResult.origin;
  const proofStatus: 'pending' | 'anchored' = origin.proof_status || 'pending';

  if (proofStatus === 'anchored') steps.push({ label: 'Bitcoin anchor confirmed', status: 'ok' });
  else steps.push({ label: 'Bitcoin anchor pending', status: 'warn' });

  let bitcoinBlockHeight: number | null = null;
  if (proofStatus === 'anchored') {
    const proofResult = await fetchProofStatus(origin.origin_id);
    if (proofResult.status === 'anchored') {
      bitcoinBlockHeight = proofResult.bitcoinBlockHeight;
      if (bitcoinBlockHeight) steps.push({ label: `Bitcoin block ${bitcoinBlockHeight.toLocaleString('en-US')}`, status: 'ok' });
    }
  }

  return {
    status: proofStatus === 'anchored' ? 'verified' : 'pending',
    origin_id: origin.origin_id, hash: origin.hash, captured_at: origin.captured_at,
    proof_status: proofStatus, bitcoin_block_height: bitcoinBlockHeight,
    claimed_by: cert.claimed_by ?? null, signature: cert.signature ?? null,
    device_signature: cert.device_signature ?? null, device_public_key: cert.device_public_key ?? null, steps,
  };
}

// ── Main modal ──

export function MarkDetailModal({ mark, onClose }: MarkDetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResultData | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const credentialRef = useRef<PasskeyCredential | null>(getPasskeyCredential());
  const otsProofRef = useRef<string | null>(null);
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const [attestationStatus, setAttestationStatus] = useState<'none' | 'pending' | 'attested'>('none');
  const [attestantInfo, setAttestantInfo] = useState<{ name: string; date: string } | null>(null);

  // Artifact file state (double verification — matches itexisted.app pattern)
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [artifactStatus, setArtifactStatus] = useState<'idle' | 'checking' | 'matched' | 'mismatch'>('idle');
  const [artifactDragOver, setArtifactDragOver] = useState(false);
  const artifactInputRef = useRef<HTMLInputElement | null>(null);

  const onArtifactFile = useCallback(async (file: File) => {
    setArtifactStatus('checking');
    try {
      const buffer = await file.arrayBuffer();
      const fileHash = await calculateSHA256(buffer);
      const expectedHash = mark.hash.toLowerCase().replace(/^sha256:/, '');
      if (fileHash === expectedHash) {
        setArtifactFile(file);
        setArtifactStatus('matched');
        toast.success('File verified — will be included in your ZIP.');
      } else {
        setArtifactFile(null);
        setArtifactStatus('mismatch');
        toast.error('Hash mismatch — this is not the original file.');
      }
    } catch {
      setArtifactStatus('mismatch');
      toast.error('Could not read file.');
    }
  }, [mark.hash]);

  const onDownloadZip = useCallback(async () => {
    const anchored = mark.otsStatus === 'anchored';
    if (!anchored) { toast.info('Proof is still pending.'); return; }
    if (!mark.originUuid) return;
    const proof = await fetchProofStatus(mark.originUuid);
    if (proof.status !== 'anchored' || !proof.otsProofBytes) { toast.error('Not ready yet.'); return; }
    const zip = await buildOriginZip({
      originId: mark.originUuid, hash: mark.hash,
      timestamp: mark.timestamp, imageUrl: mark.imageUrl ?? null,
      otsProof: arrayBufferToBase64(proof.otsProofBytes),
      artifactFile: artifactFile,
      originalFileName: artifactFile?.name ?? null,
      deviceSignature: null,
      devicePublicKey: credentialRef.current?.publicKey ?? null,
    });
    const fileName = buildZipFileName(mark.originUuid, mark.timestamp, artifactFile?.name);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [mark, artifactFile]);

  useEffect(() => {
    if (!mark.originUuid) return;
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId) return;
    (async () => {
      try {
        const { data } = await supabase.from('attestation_requests').select('status, attestant_name, completed_at')
          .eq('origin_id', mark.originUuid!).eq('device_user_id', deviceUserId)
          .order('requested_at', { ascending: false }).limit(1).maybeSingle();
        if (!data) return;
        if (data.status === 'confirmed') {
          setAttestationStatus('attested');
          setAttestantInfo({ name: data.attestant_name || 'Attestant', date: data.completed_at ? new Date(data.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '' });
        } else if (data.status === 'pending') setAttestationStatus('pending');
      } catch {}
    })();
  }, [mark.originUuid]);

  useEffect(() => {
    if (!mark.originUuid || mark.otsStatus !== 'anchored') return;
    fetchProofStatus(mark.originUuid).then(result => {
      if (result.status === 'anchored' && result.otsProofBytes) otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
    }).catch(() => {});
  }, [mark.originUuid, mark.otsStatus]);

  const formattedDate = mark.timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = mark.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const displayOriginId = mark.originId.toUpperCase().replace('UM-', '');
  const isAnchored = mark.otsStatus === 'anchored';
  const isImage = mark.imageUrl && !imgError;

  const handleZipFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip') { toast.error('Please drop a ZIP file'); return; }
    setZipFile(file); setVerifying(true); setVerifyResult(null);
    try { setVerifyResult(await verifyZipFile(file, mark.hash)); }
    catch { setVerifyResult({ status: 'error', steps: [{ label: 'Verification failed', status: 'error' }] }); }
    finally { setVerifying(false); }
  }, [mark.hash]);

  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current = 0; setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) handleZipFile(file); }, [handleZipFile]);
  const resetZip = useCallback(() => { setZipFile(null); setVerifyResult(null); setVerifying(false); }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto"
        style={{ background: 'hsl(var(--ritual-surface))' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        onClick={onClose} onDragOver={(e) => e.preventDefault()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-60" style={{ background: 'rgba(197,147,90,0.06)' }}>
          <X className="w-5 h-5" style={{ color: 'rgba(197,147,90,0.5)' }} />
        </button>

        <motion.div className="w-full max-w-[400px] mx-4 flex flex-col items-center py-12"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}>

          {/* V7 nail + wire */}
          <div className="flex flex-col items-center">
            <OriginMark size={36} state={isAnchored ? 'anchored' : 'pending'} glow={isAnchored} animated={!isAnchored} variant="dark" />
            <div className="w-px h-4" style={{ background: isAnchored ? 'linear-gradient(to bottom, rgba(197,147,90,0.5), rgba(197,147,90,0.15))' : 'linear-gradient(to bottom, rgba(197,147,90,0.25), rgba(197,147,90,0.08))' }} />
          </div>

          {/* Photo in golden frame */}
          <div className="rounded-[4px] mb-6" style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(197,147,90,0.3), rgba(180,130,70,0.15) 30%, rgba(197,147,90,0.25) 70%, rgba(210,160,80,0.2))', boxShadow: '0 6px 40px rgba(0,0,0,0.55), 0 0 24px rgba(197,147,90,0.1), inset 0 0 0 1px rgba(197,147,90,0.4), inset 0 0 0 2px rgba(15,26,15,0.5), inset 0 0 0 3px rgba(197,147,90,0.2)' }}>
            <div className="border border-[rgba(197,147,90,0.2)] bg-[rgba(12,20,12,0.95)]" style={{ padding: '6px' }}>
              <div className="w-[260px] h-[200px] overflow-hidden">
                {isImage ? <img src={mark.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <DocumentPlaceholder />}
              </div>
            </div>
          </div>

          {/* Museum label */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-px mb-5" style={{ background: 'rgba(197,147,90,0.25)' }} />

            <p className="font-mono text-[18px] tracking-[5px] mb-2" style={{ color: 'rgba(197,147,90,0.75)' }}>{displayOriginId}</p>
            <p className="font-garamond text-[20px] mb-3" style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}>{formattedDate} · {formattedTime}</p>
            <p className="font-mono text-[11px] tracking-[0.5px] mb-5 max-w-[260px] break-all leading-[1.7] text-center" style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.5 }}>{mark.hash}</p>

            {/* Proof components */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(197,147,90,0.4)' }}>hash</span>
              <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
              <span className="font-mono text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(197,147,90,0.4)' }}>certificate</span>
              {isAnchored ? (
                <>
                  <span className="w-[2px] h-[2px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
                  <span className="font-mono text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(197,147,90,0.4)' }}>proof.ots</span>
                </>
              ) : (
                <>
                  <motion.span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.6)' }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                  <span className="font-mono text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(197,147,90,0.4)', opacity: 0.6 }}>proof.ots</span>
                </>
              )}
            </div>

            {/* Upload original file + Download ZIP */}
            {isAnchored && (
              <div className="w-full max-w-[340px] mb-6 space-y-4">
                {/* Upload original */}
                <div>
                  {artifactStatus === 'idle' || artifactStatus === 'mismatch' ? (
                    <label
                      className="block w-full rounded-[8px] border-dashed border-[1.5px] p-4 text-center cursor-pointer transition-all"
                      style={{
                        borderColor: artifactDragOver ? 'rgba(201,169,110,0.6)' : 'rgba(201,169,110,0.2)',
                        background: artifactDragOver ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.02)',
                      }}
                      onDrop={(e) => { e.preventDefault(); setArtifactDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onArtifactFile(f); }}
                      onDragOver={(e) => { e.preventDefault(); setArtifactDragOver(true); }}
                      onDragLeave={() => setArtifactDragOver(false)}
                    >
                      <input ref={artifactInputRef} type="file" className="hidden" accept="*/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) onArtifactFile(f); }} />
                      <p className="font-mono text-[11px] tracking-[2px] uppercase mb-1"
                        style={{ color: 'rgba(201,169,110,0.5)' }}>
                        {artifactDragOver ? 'Release to verify' : '1. Drop your original file here'}
                      </p>
                      <p className="font-garamond italic text-[14px]"
                        style={{ color: 'rgba(240,234,214,0.25)' }}>
                        Hash-verified and included in your ZIP
                      </p>
                      {artifactStatus === 'mismatch' && (
                        <p className="font-mono text-[10px] mt-2" style={{ color: 'rgba(220,80,60,0.7)' }}>
                          ✗ Last file did not match. Try the original
                        </p>
                      )}
                    </label>
                  ) : artifactStatus === 'checking' ? (
                    <div className="flex items-center gap-2 py-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                        <svg viewBox="0 0 24 24" width={16} height={16}>
                          <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth="1.5" />
                          <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke="rgba(201,169,110,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </motion.div>
                      <span className="font-mono text-[11px] tracking-[2px] uppercase" style={{ color: 'rgba(240,234,214,0.35)' }}>Verifying hash…</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <span className="font-mono text-[12px]" style={{ color: '#7fba6a' }}>✓</span>
                      <span className="font-mono text-[11px] tracking-[1px]" style={{ color: 'rgba(240,234,214,0.65)' }}>
                        {artifactFile?.name}
                      </span>
                      <button onClick={() => { setArtifactFile(null); setArtifactStatus('idle'); }}
                        className="font-mono text-[9px] tracking-[1px] uppercase ml-auto bg-transparent border-none cursor-pointer"
                        style={{ color: 'rgba(240,234,214,0.25)' }}>
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Download ZIP */}
                <button onClick={onDownloadZip}
                  className="w-full flex items-center gap-2 py-2 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                  style={{ padding: 0 }}>
                  <span className="font-mono text-[14px] tracking-[3px] flex-shrink-0" style={{ color: 'rgba(197,147,90,0.5)' }}>2.</span>
                  <span className="font-mono text-[14px] tracking-[3px] uppercase" style={{ color: 'rgba(240,234,214,0.6)' }}>Download your proof</span>
                  {artifactFile && (
                    <span className="font-mono text-[10px] tracking-[1px] lowercase ml-1" style={{ color: 'rgba(127,186,106,0.6)' }}>incl. original</span>
                  )}
                  <span className="ml-auto text-[12px] flex-shrink-0" style={{ color: 'rgba(240,234,214,0.35)' }}>→</span>
                </button>
              </div>
            )}

            {/* Verification details — only after Bitcoin confirmation */}
            {isAnchored && (
            <div className="w-full max-w-[340px] mb-6">
              <button onClick={() => setVerificationOpen(!verificationOpen)}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-transparent border-none cursor-pointer transition-colors hover:opacity-70">
                <span className="font-mono text-[13px] tracking-[2px] uppercase" style={{ color: 'rgba(240,234,214,0.3)' }}>verification details</span>
                <motion.span className="text-[12px]" style={{ color: 'rgba(240,234,214,0.3)' }} animate={{ rotate: verificationOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>▾</motion.span>
              </button>

              <AnimatePresence>
                {verificationOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="mt-2 rounded px-5 py-4 space-y-2" style={{ background: 'rgba(17,31,17,0.9)', border: '1px solid rgba(240,234,214,0.08)' }}>
                      {verifying && (
                        <div className="flex flex-col items-center gap-3 py-3">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                            <svg viewBox="0 0 48 48" width={28} height={28}>
                              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(197,147,90,0.2)" strokeWidth="1.5" />
                              <path d="M24 4 A20 20 0 0 1 44 24" fill="none" stroke="rgba(197,147,90,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </motion.div>
                          <span className="font-mono text-[18px] tracking-[2px] uppercase" style={{ color: 'rgba(245,240,232,0.5)' }}>Verifying…</span>
                        </div>
                      )}

                      {!verifying && verifyResult && verifyResult.steps?.length > 0 ? (
                        <>
                          {verifyResult.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5 py-1 font-mono text-[18px]" style={{ borderBottom: i < verifyResult.steps!.length - 1 ? '1px solid rgba(240,234,214,0.06)' : 'none' }}>
                              <span className="flex-shrink-0 text-[15px] mt-0.5" style={{
                                color: step.status === 'ok' ? '#4a7c59' : step.status === 'error' ? 'hsl(0 60% 60%)' : step.status === 'warn' ? 'hsl(38 65% 60%)' : 'rgba(240,234,214,0.35)',
                              }}>
                                {step.status === 'ok' ? '✓' : step.status === 'error' ? '✗' : step.status === 'warn' ? '!' : '·'}
                              </span>
                              <span className="flex-1 leading-[1.5]" style={{ color: step.status === 'ok' ? 'rgba(240,234,214,0.6)' : step.status === 'error' ? 'hsl(0 60% 60%)' : 'rgba(240,234,214,0.35)' }}>
                                {step.label}
                                {step.detail && <span className="text-[14px] ml-1.5" style={{ color: 'rgba(240,234,214,0.35)', wordBreak: 'break-all' }}>{step.detail}</span>}
                              </span>
                            </div>
                          ))}
                          <button onClick={(e) => { e.stopPropagation(); resetZip(); }}
                            className="font-mono text-[17px] tracking-[1px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-80 mt-2"
                            style={{ color: 'rgba(245,240,232,0.3)' }}>choose different file</button>
                        </>
                      ) : !verifying ? (
                        <div className="flex flex-col items-center gap-2 py-2 cursor-pointer rounded transition-colors"
                          style={{ background: isDragging ? 'rgba(197,147,90,0.08)' : 'transparent' }}
                          onClick={(e) => { e.stopPropagation(); zipInputRef.current?.click(); }}
                          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                          <span className="font-mono text-[18px]" style={{ color: 'rgba(240,234,214,0.35)' }}>{isDragging ? 'Drop ZIP here' : 'Drop ZIP to verify'}</span>
                          <span className="font-mono text-[15px]" style={{ color: 'rgba(240,234,214,0.2)' }}>or tap to select file</span>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            <input ref={zipInputRef} type="file" accept=".zip,application/zip" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleZipFile(file); e.target.value = ''; }} />

            <div className="w-10 h-px mb-7" style={{ background: 'rgba(240,234,214,0.08)' }} />

            {verifyResult && zipFile && !verifying && (
              <div className="w-full flex flex-col items-center mb-6">
                <InlineVerifyResult result={verifyResult} zipFile={zipFile} onReset={resetZip} originId={mark.originId} displayOriginId={displayOriginId} />
              </div>
            )}

            {/* Attestation blocks */}
            {attestationStatus === 'pending' && (
              <div className="w-full max-w-[320px] rounded px-6 py-5 flex flex-col items-center gap-2.5 mb-4" style={{ border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.04)' }}>
                <span className="font-mono text-[17px] tracking-[5px] uppercase" style={{ color: 'rgba(201,169,110,0.4)' }}>Attestation</span>
                <p className="font-garamond text-[20px] italic text-center" style={{ color: 'rgba(240,234,214,0.35)' }}>Requested. You will be notified when complete.</p>
              </div>
            )}

            {attestationStatus === 'attested' && (
              <div className="w-full max-w-[320px] rounded px-6 py-5 flex flex-col items-center gap-2.5 mb-4" style={{ border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.04)' }}>
                <span className="font-mono text-[17px] tracking-[5px] uppercase" style={{ color: 'rgba(201,169,110,0.4)' }}>Attestation</span>
                <button onClick={() => {}} className="font-garamond italic text-[21px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70" style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}>
                  Attested by {attestantInfo?.name || 'Attestant'} ✓
                </button>
                {attestantInfo?.date && <span className="font-mono text-[18px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>{attestantInfo.date}</span>}
              </div>
            )}

            {isAnchored && attestationStatus === 'none' && (
              <div className="w-full max-w-[320px] rounded px-6 py-5 flex flex-col items-center gap-2.5 mb-4" style={{ border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.04)' }}>
                <span className="font-mono text-[17px] tracking-[5px] uppercase" style={{ color: 'rgba(201,169,110,0.4)' }}>Attestation</span>
                <p className="font-garamond text-[21px] text-center leading-[1.6] max-w-[240px]" style={{ color: 'rgba(240,234,214,0.35)' }}>
                  A certified independent attestant confirms it was you. €4,95. One-time.
                </p>
                <button onClick={() => setShowAttestationModal(true)}
                  className="font-mono text-[17px] tracking-[4px] uppercase px-6 py-2.5 rounded-full bg-transparent cursor-pointer transition-all hover:bg-[rgba(201,169,110,0.08)]"
                  style={{ border: '1px solid rgba(201,169,110,0.4)', color: 'hsl(var(--ritual-gold))', marginTop: '4px' }}>
                  Request attestation →
                </button>
              </div>
            )}

            {/* Device signed */}
            {credentialRef.current && (
              <div className="flex items-center gap-2 mt-4">
                <svg width="16" height="16" viewBox="0 0 12 12">
                  <path d="M2 6L5 9L10 3" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono text-[21px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.35)' }}>device signed</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {showAttestationModal && mark.originUuid && (
        <AttestationRequestModal originId={mark.originUuid} onClose={() => setShowAttestationModal(false)}
          onConfirm={() => { setShowAttestationModal(false); setAttestationStatus('pending'); }} />
      )}
    </AnimatePresence>
  );
}
