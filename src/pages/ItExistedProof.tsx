import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { buildOriginZip } from '@/lib/originZip';
import { arrayBufferToBase64, fetchOriginByToken, fetchProofStatus } from '@/lib/coreApi';
import InlineVerify from '@/components/itexisted/InlineVerify';
import InlineAttestation from '@/components/itexisted/InlineAttestation';

interface ProofState {
  originId: string;
  hash: string;
  capturedAt: string;
  shortToken: string;
  proofStatus: 'pending' | 'anchored';
  bitcoinBlockHeight: number | null;
}

export default function ItExistedProof() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProofState | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);

  // When proof becomes anchored, auto-open verify step
  useEffect(() => {
    if (state?.proofStatus === 'anchored') {
      setOpenStep('verify');
    }
  }, [state?.proofStatus]);

  const isValidToken = /^[0-9a-fA-F]{8}$/.test(token);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    toast.success('Proof URL copied.');
  };

  const load = async () => {
    if (!isValidToken) { setState(null); setLoading(false); return; }
    const resolved = await fetchOriginByToken(token);
    if (!resolved) { setState(null); setLoading(false); return; }
    const proof = await fetchProofStatus(resolved.origin_id);
    setState({
      originId: resolved.origin_id,
      hash: resolved.hash,
      capturedAt: resolved.captured_at,
      shortToken: resolved.short_token ?? token.toUpperCase(),
      proofStatus: proof.status === 'anchored' ? 'anchored' : 'pending',
      bitcoinBlockHeight: proof.bitcoinBlockHeight,
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
      const msg = `Origin ${state.shortToken} — anchored proof.\nVerify: ${shareUrl}\n\nSend your original file separately via a secure channel, because bytes must stay intact for verification.`;
      await navigator.share({ title: `Origin ${state.shortToken}`, text: msg, url: shareUrl }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    toast.success('Proof URL copied.');
  };

  const onDownload = async () => {
    if (!anchored) { toast.info('Proof is still pending. Come back in ~2 hours.'); return; }
    const proof = await fetchProofStatus(state.originId);
    if (proof.status !== 'anchored' || !proof.otsProofBytes) { toast.error('Not ready yet.'); return; }
    const zip = await buildOriginZip({
      originId: state.originId, hash: state.hash,
      timestamp: new Date(state.capturedAt), imageUrl: null,
      otsProof: arrayBufferToBase64(proof.otsProofBytes),
    });
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url; a.download = `origin-${state.shortToken}.zip`; a.click();
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

        {/* ══════════════════════════════════════════════
            TOP BLOCK — centered
        ══════════════════════════════════════════════ */}
        <div className="w-full flex flex-col items-center mb-12">
          {/* TITLE */}
          <h1 className="font-garamond text-[48px] font-normal text-center mb-10"
            style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
            {anchored ? 'Your proof is ready.' : 'Your proof is on its way.'}
          </h1>

          {/* ORIGIN ID */}
          <p className="font-mono text-[26px] tracking-[6px] text-center mb-4"
            style={{ color: '#c9a96e' }}>
            {state.shortToken}
          </p>

          {/* DATE */}
          <p className="font-garamond text-[24px] text-center"
            style={{ color: 'rgba(240,234,214,0.85)' }}>
            {date} - {time}
          </p>

          {/* PENDING STATUS */}
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

        {/* ══════════════════════════════════════════════
            NUMBERED STEPS — left-aligned
        ══════════════════════════════════════════════ */}
        <div className="w-full flex flex-col">

          {/* ── STEP 1: DOWNLOAD ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={onDownload}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>1.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase mr-1.5"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Download your proof</span>
              <span className="ml-auto text-[12px] flex-shrink-0"
                style={{ color: 'rgba(240,234,214,0.35)' }}>→</span>
            </button>
          </div>

          {/* ── STEP 2: VERIFY ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => !lockedStyle.opacity && toggleStep('verify')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>2.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase mr-1.5"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Verify it</span>
              <span className="ml-auto text-[12px] flex-shrink-0 transition-transform"
                style={{
                  color: 'rgba(240,234,214,0.35)',
                  transform: openStep === 'verify' ? 'rotate(180deg)' : 'none',
                }}>▾</span>
            </button>
            {/* Expandable body */}
            <div style={{
              maxHeight: openStep === 'verify' ? 500 : 0,
              overflow: 'hidden',
              opacity: openStep === 'verify' ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div className="pt-4 pl-[23px]">
                <InlineVerify expectedOriginId={state?.originId} expectedShortToken={state?.shortToken} />
              </div>
            </div>
          </div>

          {/* ── REMEMBER NOTE ── */}
          <p className="font-garamond italic text-[20px] mb-8"
            style={{
              color: anchored ? 'rgba(240,234,214,0.85)' : 'rgba(240,234,214,0.45)',
              lineHeight: 1.65,
              maxWidth: 380,
              opacity: !anchored ? 0.65 : 1,
            }}>
            Remember: the ZIP you've downloaded does not contain your original file. Keep your original file and your ZIP together on your device. You will need it to verify.
          </p>

          {/* ── STEP 3: SHARE ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={onShare}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>3.</span>
              <span className="font-mono text-[17px] tracking-[4px] uppercase"
                style={{ color: 'rgba(240,234,214,0.85)' }}>Share it</span>
              <span className="font-mono text-[12px] tracking-[1px] lowercase ml-2"
                style={{ color: 'rgba(240,234,214,0.35)', whiteSpace: 'nowrap' }}>(optional)</span>
            </button>
          </div>

          {/* ── STEP 4: ATTESTATION ── */}
          <div className="w-full mb-8" style={lockedStyle}>
            <button
              onClick={() => !lockedStyle.opacity && toggleStep('attest')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>4.</span>
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
            {/* Expandable body */}
            <div style={{
              maxHeight: openStep === 'attest' ? 500 : 0,
              overflow: 'hidden',
              opacity: openStep === 'attest' ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div className="pt-4 pl-[23px]">
                <InlineAttestation originId={state.originId} shortToken={state.shortToken} />
              </div>
            </div>
          </div>

          {/* ── STEP 5: ANCHOR ANOTHER ── */}
          <div className="w-full mb-8" style={!anchored ? { opacity: 0.45 } : {}}>
            <button
              onClick={() => navigate('/itexisted')}
              className="flex items-baseline w-full text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span className="font-mono text-[17px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: 'rgba(201,169,110,0.4)' }}>5.</span>
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

