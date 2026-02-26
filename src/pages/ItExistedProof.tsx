import { useEffect, useMemo, useState, useCallback } from 'react';
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

  const anchored = state.proofStatus === 'anchored';
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
    if (navigator.share) {
      try {
        const msg = `Origin ${state.shortToken}, anchored proof.\nVerify: ${shareUrl}\n\nSend your original file separately via a secure channel, because bytes must stay intact for verification.`;
        await navigator.share({ title: `Origin ${state.shortToken}`, text: msg, url: shareUrl });
        return;
      } catch {
        // Share cancelled or unavailable in this context, fall through to clipboard
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
    const proof = await fetchProofStatus(state.originId);
    if (proof.status !== 'anchored' || !proof.otsProofBytes) { toast.error('Not ready yet.'); return; }
    const zip = await buildOriginZip({
      originId: state.originId, hash: state.hash,
      timestamp: new Date(state.capturedAt), imageUrl: null,
      otsProof: arrayBufferToBase64(proof.otsProofBytes),
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
        <div className="w-full flex flex-col items-center mb-12">
          <h1 className="font-garamond text-[48px] font-normal text-center mb-10"
            style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
            {anchored ? 'Your proof is ready.' : 'Your proof is on its way.'}
          </h1>
          <p className="font-mono text-[26px] tracking-[6px] text-center mb-4"
            style={{ color: '#c9a96e' }}>
            {state.shortToken}
          </p>
          <p className="font-garamond text-[24px] text-center"
            style={{ color: 'rgba(240,234,214,0.85)' }}>
            {date} - {time}
          </p>

          {/* Layer 2 device binding indicator */}
          {state.deviceSignature && (
            <div className="flex items-center gap-2 mt-4">
              <span className="font-mono text-[10px]" style={{ color: '#7fba6a' }}>✓</span>
              <span className="font-mono text-[11px] tracking-[2px] uppercase"
                style={{ color: 'rgba(127,186,106,0.7)' }}>
                Device-signed
              </span>
            </div>
          )}

          {!anchored && (
            <div className="flex items-center gap-3 mt-5">
              <motion.div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'rgba(201,169,110,0.6)' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="font-mono text-[14px] tracking-[4px] uppercase"
                style={{ color: 'rgba(201,169,110,0.6)' }}
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                {pendingLabel}
              </motion.span>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="w-full mb-10" style={{ height: 1, background: 'rgba(240,234,214,0.12)' }} />

        {/* STEPS */}
        <div className="w-full flex flex-col">

          {/* ── STEP 1: ADD YOUR FILE ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <div className="flex items-baseline w-full mb-3">
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>1.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Upload your original file</span>
              <span className="font-mono text-[12px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
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
                  <p className="font-mono text-[11px] tracking-[2px] uppercase mb-1"
                    style={{ color: 'rgba(201,169,110,0.5)' }}>
                    {dragOver ? 'Release to verify' : 'Drop your original file here'}
                  </p>
                   <p className="font-garamond italic text-[14px]"
                    style={{ color: 'rgba(240,234,214,0.25)' }}>
                     Included in the ZIP so you have everything in one bundle on your device
                   </p>
                  {artifactStatus === 'mismatch' && (
                    <p className="font-mono text-[10px] mt-2"
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
                  <span className="font-mono text-[11px] tracking-[2px] uppercase"
                    style={{ color: 'rgba(240,234,214,0.35)' }}>Verifying hash…</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2">
                  <span className="font-mono text-[12px]" style={{ color: '#7fba6a' }}>✓</span>
                  <span className="font-mono text-[11px] tracking-[1px]"
                    style={{ color: 'rgba(240,234,214,0.65)' }}>
                    {artifactFile?.name}
                  </span>
                  <button onClick={() => { setArtifactFile(null); setArtifactStatus('idle'); }}
                    className="font-mono text-[9px] tracking-[1px] uppercase ml-auto"
                    style={{ color: 'rgba(240,234,214,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── STEP 2: DOWNLOAD ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={onDownload}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>2.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase mr-1.5"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Download your proof</span>
              {artifactFile ? (
                <span className="font-mono text-[10px] tracking-[1px] lowercase ml-1"
                  style={{ color: 'rgba(127,186,106,0.6)', whiteSpace: 'nowrap' }}>incl. original</span>
              ) : (
                <span className="font-mono text-[10px] tracking-[1px] lowercase ml-1"
                  style={{ color: 'rgba(240,234,214,0.25)', whiteSpace: 'nowrap' }}>without original</span>
              )}
              <span className="ml-auto text-[12px] flex-shrink-0"
                style={{ color: 'rgba(240,234,214,0.35)' }}>→</span>
            </button>
            {!artifactFile && anchored && (
              <p className="font-garamond italic text-[13px] pl-[23px] mt-2"
                style={{ color: 'rgba(240,234,214,0.3)', lineHeight: 1.5 }}>
                Add your original file in step 1 so everything stays together in one ZIP bundle.
              </p>
            )}
          </div>

          {/* ── STEP 3: VERIFY ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => !lockedStyle.opacity && toggleStep('verify')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>3.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase mr-1.5"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Verify it</span>
              <span className="ml-auto text-[12px] flex-shrink-0 transition-transform"
                style={{
                  color: 'rgba(240,234,214,0.35)',
                  transform: openStep === 'verify' ? 'rotate(180deg)' : 'none',
                }}>▾</span>
            </button>
            <div style={{
              maxHeight: openStep === 'verify' ? 800 : 0,
              overflow: 'hidden',
              opacity: openStep === 'verify' ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div className="pt-4 pl-[23px]">
                <InlineVerify expectedOriginId={state?.originId} expectedShortToken={state?.shortToken} />
              </div>
            </div>
          </div>




          {/* ── STEP 4: SHARE ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={onShare}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>4.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Share it</span>
              <span className="font-mono text-[12px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
            </button>
          </div>

          {/* ── STEP 5: ATTESTATION ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => !lockedStyle.opacity && toggleStep('attest')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>5.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Request attestation</span>
              <span className="font-mono text-[12px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
              <span className="ml-auto text-[12px] flex-shrink-0 transition-transform"
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
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>6.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Anchor another file</span>
              <span className="font-mono text-[12px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
              <span className="ml-auto text-[12px] flex-shrink-0"
                style={{ color: 'rgba(240,234,214,0.35)' }}>→</span>
            </button>
          </div>

        </div>
      </motion.div>
    </main>
  );
}
