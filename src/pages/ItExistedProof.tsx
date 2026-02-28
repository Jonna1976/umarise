import { useEffect, useMemo, useState, useCallback } from 'react';
import { Copy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { buildOriginZip, buildZipFileName } from '@/lib/originZip';
import { arrayBufferToBase64, fetchOriginByToken, fetchProofStatus } from '@/lib/coreApi';
import { calculateSHA256 } from '@/lib/originHash';
import InlineVerify from '@/components/itexisted/InlineVerify';
import InlineAttestation from '@/components/itexisted/InlineAttestation';

/** Countdown: shows time remaining until ~2h after capture */
function CountdownTimer({ capturedAt }: { capturedAt: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(capturedAt).getTime() + 2 * 60 * 60 * 1000;
  const remaining = Math.max(0, target - now);
  if (remaining <= 0) {
    return (
      <span className="font-mono text-[15px] tracking-[2px] uppercase"
        style={{ color: 'rgba(201,169,110,0.7)' }}>
        Almost ready — refresh to check
      </span>
    );
  }
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return (
    <span className="font-mono text-[18px] tracking-[2px]"
      style={{ color: '#c9a96e' }}>
      Ready in {h > 0 ? `${h}h ` : ''}{String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
    </span>
  );
}

interface ProofState {
  originId: string;
  hash: string;
  capturedAt: string;
  shortToken: string;
  proofStatus: 'pending' | 'anchored';
  bitcoinBlockHeight: number | null;
  deviceSignature: string | null;
  devicePublicKey: string | null;
}

export default function ItExistedProof() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProofState | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [verifyKey, setVerifyKey] = useState(0);

  // Artifact file state (user-provided for ZIP inclusion)
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [artifactStatus, setArtifactStatus] = useState<'idle' | 'checking' | 'matched' | 'mismatch'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(null);

  // When proof becomes anchored, auto-open verify step
  useEffect(() => {
    if (state?.proofStatus === 'anchored') {
      setOpenStep('verify');
    }
  }, [state?.proofStatus]);

  const isValidToken = /^[0-9a-fA-F]{8}$/.test(token);

  const load = async () => {
    if (!isValidToken) { setState(null); setLoading(false); return; }
    const resolved = await fetchOriginByToken(token);
    if (!resolved) { setState(null); setLoading(false); return; }

    // Use status from resolve response first (fast path, no binary proof download)
    let proofStatus: 'pending' | 'anchored' = resolved.proof_status === 'anchored' ? 'anchored' : 'pending';
    let bitcoinBlockHeight: number | null = resolved.bitcoin_block_height ?? null;

    // Fallback only if resolve didn't include status
    if (!resolved.proof_status) {
      const proof = await fetchProofStatus(resolved.origin_id);
      proofStatus = proof.status === 'anchored' ? 'anchored' : 'pending';
      bitcoinBlockHeight = proof.bitcoinBlockHeight;
    }

    // Try to recover Layer 2 data from localStorage (set during sealing)
    let deviceSignature: string | null = null;
    let devicePublicKey: string | null = null;
    try {
      const raw = localStorage.getItem('itexisted_last_anchor');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.originId === resolved.origin_id || saved.shortToken === (resolved.short_token ?? token.toUpperCase())) {
          deviceSignature = saved.deviceSignature ?? null;
          devicePublicKey = saved.devicePublicKey ?? null;
        }
      }
    } catch { /* ignore */ }
    setState({
      originId: resolved.origin_id,
      hash: resolved.hash,
      capturedAt: resolved.captured_at,
      shortToken: resolved.short_token ?? token.toUpperCase(),
      proofStatus,
      bitcoinBlockHeight,
      deviceSignature,
      devicePublicKey,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => {
    if (!state || state.proofStatus === 'anchored') return;
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [state?.proofStatus, token]);

  const captured = useMemo(() => (state ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const shareUrl = `${window.location.origin}/itexisted/proof/${token.toUpperCase()}`;

  // ── Artifact file handler: hash-verify before accepting ──
  const onArtifactFile = useCallback(async (file: File) => {
    if (!state) return;
    setArtifactStatus('checking');
    try {
      const buffer = await file.arrayBuffer();
      const fileHash = await calculateSHA256(buffer);
      const expectedHash = state.hash.toLowerCase().replace(/^sha256:/, '');
      console.log('[ArtifactCheck] file:', file.name, 'size:', file.size);
      console.log('[ArtifactCheck] fileHash:    ', fileHash);
      console.log('[ArtifactCheck] expectedHash:', expectedHash);
      console.log('[ArtifactCheck] match:', fileHash === expectedHash);
      setComputedHash(fileHash);
      if (fileHash === expectedHash) {
        setArtifactFile(file);
        setArtifactStatus('matched');
        toast.success('File verified — will be included in your ZIP.');
      } else {
        setArtifactFile(null);
        setArtifactStatus('mismatch');
        toast.error('Hash mismatch — this is not the original file.');
      }
    } catch (e) {
      console.error('[ArtifactCheck] error:', e);
      setArtifactStatus('mismatch');
      toast.error('Could not read file.');
    }
  }, [state]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0f0a' }}>
        <span className="font-mono text-[14px] tracking-[2px] uppercase"
          style={{ color: 'rgba(240,234,214,0.35)' }}>Loading…</span>
      </main>
    );
  }

  /* ── NOT FOUND ── */
  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8"
        style={{ background: '#0a0f0a' }}>
        <div className="text-center">
          <p className="font-garamond text-[24px] mb-4"
            style={{ color: 'rgba(240,234,214,0.35)' }}>Proof not found.</p>
          <button onClick={() => navigate('/itexisted')}
            className="font-mono text-[14px] tracking-[5px] uppercase transition-colors"
            style={{ color: 'rgba(240,234,214,0.35)' }}>
            Anchor a file
          </button>
        </div>
      </main>
    );
  }

  const testAnchored = new URLSearchParams(window.location.search).get('test') === 'anchored';
  const anchored = testAnchored || state.proofStatus === 'anchored';
  const date = captured.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`;

  /* ── Countdown for pending ── */
  const pendingLabel = (() => {
    const expectedAt = new Date(captured.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expectedAt.getTime() - now.getTime();
    const diffMin = Math.max(0, Math.round(diffMs / 60000));
    if (diffMin <= 0) return 'Bitcoin proof in progress, any moment now';
    if (diffMin < 60) return `Bitcoin proof in progress, ready in ~${diffMin} min`;
    return `Bitcoin proof in progress, ready in ~${Math.ceil(diffMin / 60)} hours`;
  })();

  /* ── ACTIONS ── */
  const onShare = async () => {
    // If artifact + anchored → share ZIP bundle
    if (anchored && artifactFile) {
      try {
        const testAnchored = new URLSearchParams(window.location.search).get('test') === 'anchored';
        let zipBlob: Blob;

        if (testAnchored) {
          zipBlob = await buildOriginZip({
            originId: state.originId, hash: state.hash,
            timestamp: new Date(state.capturedAt), imageUrl: null,
            otsProof: null,
            artifactFile, originalFileName: artifactFile.name,
            deviceSignature: state.deviceSignature,
            devicePublicKey: state.devicePublicKey,
          });
        } else {
          const proof = await fetchProofStatus(state.originId);
          if (proof.status !== 'anchored' || !proof.otsProofBytes) {
            toast.error('Proof not ready yet.');
            return;
          }
          zipBlob = await buildOriginZip({
            originId: state.originId, hash: state.hash,
            timestamp: new Date(state.capturedAt), imageUrl: null,
            otsProof: arrayBufferToBase64(proof.otsProofBytes),
            artifactFile, originalFileName: artifactFile.name,
            deviceSignature: state.deviceSignature,
            devicePublicKey: state.devicePublicKey,
          });
        }

        const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), artifactFile.name, state.shortToken);
        const zipFile = new File([zipBlob], fileName, { type: 'application/zip' });

        // iOS: direct download to avoid byte corruption via navigator.share
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url; a.download = fileName; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          toast.success('ZIP downloaded. Share via email or messaging app.\nSend the original file separately via a secure channel.');
          return;
        }

        if (navigator.share && navigator.canShare?.({ files: [zipFile] })) {
          await navigator.share({
            title: `Origin ${state.shortToken}`,
            text: `Anchored proof for origin ${state.shortToken}.\nSend your original file separately via a secure channel.`,
            files: [zipFile],
          });
          return;
        }

        // Desktop fallback: download
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        toast.success('ZIP downloaded. Share it manually.');
        return;
      } catch (e) {
        console.warn('[Share] ZIP share failed, falling back to URL:', e);
      }
    }

    // Fallback: share proof URL only
    if (navigator.share) {
      try {
        const msg = `Origin ${state.shortToken}, anchored proof.\nVerify: ${shareUrl}\n\nSend your original file separately via a secure channel, because bytes must stay intact for verification.`;
        await navigator.share({ title: `Origin ${state.shortToken}`, text: msg, url: shareUrl });
        return;
      } catch {
        // cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Proof URL copied.');
    } catch {
      toast.error('Could not copy URL.');
    }
  };

  const onDownload = async () => {
    if (!anchored) { toast.info('Proof is still pending. Come back in ~2 hours.'); return; }
    const testMode = new URLSearchParams(window.location.search).get('test') === 'anchored';
    let otsProofBase64: string | null = null;

    if (!testMode) {
      const proof = await fetchProofStatus(state.originId);
      if (proof.status !== 'anchored' || !proof.otsProofBytes) { toast.error('Not ready yet.'); return; }
      otsProofBase64 = arrayBufferToBase64(proof.otsProofBytes);
    }

    const zip = await buildOriginZip({
      originId: state.originId, hash: state.hash,
      timestamp: new Date(state.capturedAt), imageUrl: null,
      otsProof: otsProofBase64,
      artifactFile: artifactFile,
      originalFileName: artifactFile?.name ?? null,
      deviceSignature: state.deviceSignature,
      devicePublicKey: state.devicePublicKey,
    });
    const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), artifactFile?.name, state.shortToken);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const toggleStep = (id: string) => {
    setOpenStep(prev => prev === id ? null : id);
  };

  /* locked: steps 2-4 and + require file verification (step 1) first */
  const lockedStyle = (artifactStatus !== 'matched') ? { opacity: 0.45, pointerEvents: 'none' as const } : {};

  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0a0f0a', WebkitFontSmoothing: 'antialiased', padding: '60px 24px' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-start"
        style={{ maxWidth: 420 }}>

        {/* TOP BLOCK */}
        <div className="w-full flex flex-col items-start mb-12">
          {anchored ? (
            <h1 className="font-garamond text-[41px] font-normal flex items-center gap-1"
              style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
              Your file is anchored
              <motion.span
                className="inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.8 }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(197,147,90,0.5))' }}>
                <svg viewBox="0 0 42 42" width="24" height="24" style={{ overflow: 'visible', display: 'inline-block', verticalAlign: '1px' }}>
                  <motion.circle
                    cx="21" cy="38" fill="none"
                    stroke="rgba(197,147,90,0.45)" strokeWidth="0.9"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 15, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 2.2, ease: [0.2, 0, 0.2, 1] }}
                  />
                  <circle cx="21" cy="38" r="3.2" fill="#C5935A" />
                </svg>
              </motion.span>
            </h1>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <h1 className="font-garamond text-[34px] font-normal"
                style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
                Anchoring to Bitcoin in progress
              </h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'rgba(201,169,110,0.5)' }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#c9a96e' }}></span>
                </span>
                <CountdownTimer capturedAt={state.capturedAt} />
              </div>
            </div>
          )}
        </div>

        {/* ── RECORD DETAILS ── */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[15px] tracking-[2px] uppercase"
              style={{ color: 'rgba(201,169,110,0.45)' }}>Origin ID</span>
            <span className="font-mono text-[18px] tracking-[3px]"
              style={{ color: '#c9a96e' }}>{state.shortToken}</span>
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[15px] tracking-[2px] uppercase"
              style={{ color: 'rgba(201,169,110,0.45)' }}>Date</span>
            <span className="font-garamond text-[18px]"
              style={{ color: 'rgba(240,234,214,0.5)' }}>{date} · {time}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-[15px] tracking-[2px] uppercase pt-1"
              style={{ color: 'rgba(201,169,110,0.45)' }}>Hash</span>
            <span className="font-mono text-[15px] text-right break-all"
              style={{ color: 'rgba(240,234,214,0.35)', letterSpacing: '0.3px', lineHeight: 1.7, maxWidth: 250 }}>
              {state.hash}
            </span>
          </div>
        </div>

        {/* BOOKMARK HINT (pending only) */}
        {!anchored && (
          <div className="w-full mb-10">
            <p className="font-garamond text-[18px]" style={{ color: 'rgba(240,234,214,0.5)', lineHeight: 1.8 }}>
              Bookmark this page
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://itexisted.app/proof/${state.shortToken}`);
                toast.success('URL copied');
              }}
              className="flex items-center gap-2 mt-1 group"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <span className="font-mono text-[18px] tracking-[1px]"
                style={{ color: '#c9a96e' }}>
                https://itexisted.app/proof/{state.shortToken}
              </span>
              <Copy size={16} className="opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: '#c9a96e' }} />
            </button>
            <p className="font-garamond text-[18px] mt-2" style={{ color: 'rgba(240,234,214,0.5)', lineHeight: 1.8 }}>
              we'll have your proof ready soon.
            </p>
          </div>
        )}

        {/* ── STEPS ── */}
        <div className="w-full flex flex-col items-start">

          {/* ── STEP 1: VERIFY ORIGINAL FILE ── */}
          <div className="w-full mb-8">
            <div className="flex items-baseline w-full mb-3">
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: '#f0ead6' }}>1.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Verify your original file</span>
              {(artifactStatus === 'matched' || artifactStatus === 'mismatch') && (
                <button
                  onClick={() => { setArtifactFile(null); setArtifactStatus('idle'); setComputedHash(null); }}
                  className="font-mono text-[15px] tracking-[1px] uppercase ml-auto"
                  style={{ color: 'rgba(240,234,214,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  New
                </button>
              )}
            </div>
            <div className="pl-[23px]">
              {artifactStatus !== 'matched' && artifactStatus !== 'mismatch' ? (
                <label
                  className="block w-full rounded-[8px] border-dashed border-[1.5px] p-5 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? 'rgba(201,169,110,0.5)' : 'rgba(201,169,110,0.25)',
                    background: dragOver ? 'rgba(201,169,110,0.06)' : 'rgba(201,169,110,0.02)',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onArtifactFile(f); }}
                >
                  <input type="file" className="hidden" accept="*/*"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onArtifactFile(f); }} />
                  <p className="font-mono text-[15px] tracking-[2px] uppercase mb-1"
                    style={{ color: 'rgba(201,169,110,0.5)' }}>
                    {artifactStatus === 'checking' ? 'Checking…' : 'Drop your original file here'}
                  </p>
                </label>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[15px] tracking-[1px] uppercase"
                    style={{ color: artifactStatus === 'matched' ? '#7fba6a' : 'rgba(220,80,60,0.8)' }}>
                    {artifactStatus === 'matched' ? 'Hash match confirmed' : 'Hash mismatch — wrong file'}
                  </p>
                  {computedHash && (
                    <p className="font-mono text-[13px] break-all"
                      style={{ color: artifactStatus === 'matched' ? 'rgba(127,186,106,0.6)' : 'rgba(220,80,60,0.5)', lineHeight: 1.6 }}>
                      {computedHash}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── STEP 2: DOWNLOAD ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => onDownload()}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: artifactStatus === 'matched' ? 'pointer' : 'default', padding: 0 }}>
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: anchored ? '#f0ead6' : 'rgba(201,169,110,0.4)' }}>2.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase mr-1.5"
                style={{ color: 'rgba(240,234,214,0.85)' }}>
                Download your proof
              </span>
            </button>
          </div>

          {/* ── STEP 3: VERIFY ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <div className="flex items-baseline w-full">
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: anchored ? '#f0ead6' : 'rgba(201,169,110,0.4)' }}>3.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Verify your ZIP</span>
              <button
                onClick={() => setVerifyKey(k => k + 1)}
                className="font-mono text-[15px] tracking-[1px] uppercase ml-auto"
                style={{ color: 'rgba(240,234,214,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
                New
              </button>
            </div>
            <div className="pt-4 pl-[23px]">
              <InlineVerify key={verifyKey} expectedOriginId={state?.originId} expectedShortToken={state?.shortToken} />
            </div>
          </div>

          {/* ── STEP 4: ATTESTATION ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => !lockedStyle.opacity && toggleStep('attest')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: anchored ? '#f0ead6' : 'rgba(201,169,110,0.4)' }}>4.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Request attestation</span>
              <span className="font-mono text-[15px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
              <span className="ml-auto text-[15px] flex-shrink-0 transition-transform"
                style={{
                  color: 'rgba(240,234,214,0.35)',
                  transform: openStep === 'attest' ? 'rotate(180deg)' : 'none',
                }}>▾</span>
            </button>
            <div style={{
              maxHeight: openStep === 'attest' ? 800 : 0,
              overflow: 'hidden',
              opacity: openStep === 'attest' ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div className="pt-4 pl-[23px]">
                <InlineAttestation originId={state.originId} shortToken={state.shortToken} />
              </div>
            </div>
          </div>

          {/* ── ANCHOR ANOTHER ── */}
          <div className="w-full mb-8 flex justify-center mt-4" style={!anchored ? { opacity: 0.45 } : {}}>
            <button
              onClick={() => navigate('/itexisted')}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 56, height: 56,
                border: '1.5px solid rgba(201,169,110,0.35)',
                background: 'none',
                cursor: 'pointer',
              }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <line x1="11" y1="4" x2="11" y2="18" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="4" y1="11" x2="18" y2="11" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

        </div>
      </motion.div>
    </main>
  );
}
