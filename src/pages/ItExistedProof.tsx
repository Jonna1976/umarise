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

  // Artifact file state (user-provided for ZIP inclusion)
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [artifactStatus, setArtifactStatus] = useState<'idle' | 'checking' | 'matched' | 'mismatch'>('idle');
  const [dragOver, setDragOver] = useState(false);

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
    const proof = await fetchProofStatus(resolved.origin_id);
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
      proofStatus: proof.status === 'anchored' ? 'anchored' : 'pending',
      bitcoinBlockHeight: proof.bitcoinBlockHeight,
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

        const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), artifactFile.name);
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
    const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), artifactFile?.name);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const toggleStep = (id: string) => {
    setOpenStep(prev => prev === id ? null : id);
  };

  /* locked class styles */
  const lockedStyle = !anchored ? { opacity: 0.45, pointerEvents: 'none' as const } : {};

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
          {anchored && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center justify-center rounded-full mb-7"
              style={{ width: 56, height: 56, border: '1px solid rgba(201,169,110,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <polyline points="3,9 7,13 15,5" stroke="#c9a96e" strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
          {anchored ? (
            <h1 className="font-garamond text-[41px] font-normal"
              style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
              Your proof is ready.
            </h1>
          ) : (
            <div className="flex items-start gap-3">
              <span className="relative flex h-3 w-3 flex-shrink-0 mt-[18px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'rgba(201,169,110,0.5)' }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#c9a96e' }}></span>
              </span>
              <h1 className="font-garamond text-[38px] font-normal"
                style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
                Bitcoin proof in progress, ready in ~2 hours
              </h1>
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

        {/* DIVIDER */}
        <div className="w-full mb-10" style={{ height: 1, background: 'rgba(240,234,214,0.12)' }} />

        {/* STEPS */}
        <div className="w-full flex flex-col">

          {/* ── STEP 1: ADD YOUR FILE ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <div className="flex items-baseline w-full mb-3">
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>1.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Verify & bundle your original file</span>
            </div>
            <div className="pl-[23px]">
              {artifactStatus === 'idle' || artifactStatus === 'mismatch' ? (
                <label
                  className="block w-full rounded-[8px] border-dashed border-[1.5px] p-5 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? 'rgba(201,169,110,0.6)' : 'rgba(201,169,110,0.2)',
                    background: dragOver ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.02)',
                  }}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onArtifactFile(f); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <input type="file" className="hidden" accept="*/*"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onArtifactFile(f); }} />
                  <p className="font-mono text-[15px] tracking-[2px] uppercase mb-1"
                    style={{ color: 'rgba(201,169,110,0.5)' }}>
                    {dragOver ? 'Release to verify' : 'Select or drop file'}
                  </p>
                  {artifactStatus === 'mismatch' && (
                    <p className="font-mono text-[15px] mt-2"
                      style={{ color: 'rgba(220,80,60,0.7)' }}>
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
                  <span className="font-mono text-[15px] tracking-[2px] uppercase"
                    style={{ color: 'rgba(240,234,214,0.35)' }}>Verifying hash…</span>
                </div>
              ) : (
                <div className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[15px]" style={{ color: '#7fba6a' }}>✓</span>
                    <span className="font-mono text-[15px] tracking-[1px]"
                      style={{ color: 'rgba(240,234,214,0.65)' }}>
                      {artifactFile?.name}
                    </span>
                    <button onClick={() => { setArtifactFile(null); setArtifactStatus('idle'); }}
                      className="font-mono text-[15px] tracking-[1px] uppercase ml-auto"
                      style={{ color: 'rgba(240,234,214,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Change
                    </button>
                  </div>
                  <div className="mt-2 pl-[18px]">
                    <p className="font-mono text-[15px] tracking-[1px] uppercase mb-1"
                      style={{ color: 'rgba(201,169,110,0.35)' }}>Hash match confirmed</p>
                    <p className="font-mono text-[15px] leading-[1.6] break-all"
                      style={{ color: 'rgba(201,169,110,0.45)' }}>
                      {state?.hash}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── STEP 2: DOWNLOAD ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => { if (artifactStatus === 'matched') onDownload(); }}
              disabled={artifactStatus !== 'matched'}
              className="flex items-baseline w-full text-left transition-opacity"
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: artifactStatus === 'matched' ? 'pointer' : 'not-allowed',
                opacity: artifactStatus === 'matched' ? 1 : 0.35,
              }}>
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>2.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase mr-1.5"
                style={{ color: 'rgba(240,234,214,0.85)' }}>
                Download your proof
              </span>
              {artifactFile && (
                <span className="font-mono text-[15px] tracking-[1px] lowercase ml-1"
                  style={{ color: 'rgba(127,186,106,0.6)', whiteSpace: 'nowrap' }}>incl. original</span>
              )}
              <span className="ml-auto text-[15px] flex-shrink-0"
                style={{ color: 'rgba(240,234,214,0.35)' }}>→</span>
            </button>
          </div>

          {/* ── STEP 3: VERIFY ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <div className="flex items-baseline w-full">
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>3.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Verify your ZIP</span>
            </div>
            <div className="pt-4 pl-[23px]">
              <InlineVerify expectedOriginId={state?.originId} expectedShortToken={state?.shortToken} />
            </div>
          </div>




          {/* ── STEP 4: SHARE ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={onShare}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>4.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Share your proof</span>
              <span className="font-mono text-[15px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
            </button>
          </div>

          {/* ── STEP 5: ATTESTATION ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => !lockedStyle.opacity && toggleStep('attest')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>5.</span>
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

          {/* ── STEP 6: ANCHOR ANOTHER ── */}
          <div className="w-full mb-8" style={!anchored ? { opacity: 0.45 } : {}}>
            <button
              onClick={() => navigate('/itexisted')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[15px] tracking-[2px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>6.</span>
              <span className="font-mono text-[15px] tracking-[3px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Anchor another file</span>
              <span className="font-mono text-[15px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
              <span className="ml-auto text-[15px] flex-shrink-0"
                style={{ color: 'rgba(240,234,214,0.35)' }}>→</span>
            </button>
          </div>

        </div>
      </motion.div>
    </main>
  );
}
