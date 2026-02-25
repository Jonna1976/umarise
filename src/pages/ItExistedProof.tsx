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
  const [copied, setCopied] = useState(false);

  const isValidToken = /^[0-9a-fA-F]{8}$/.test(token);

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

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  };

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

  /* attestation is now handled inline via InlineAttestation component */

  /* ── STATUS LINE ── */
  const statusParts = [
    { label: anchored ? 'ANCHORED' : 'PENDING', pulse: !anchored },
    { label: 'certificate', pulse: false },
    { label: 'proof.ots', pulse: !anchored },
    { label: 'hash', pulse: false },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-8"
      style={{ background: '#0a0f0a', WebkitFontSmoothing: 'antialiased' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-center"
        style={{ maxWidth: 390 }}>

        {/* ── STATUS INDICATOR ── */}
        {anchored ? (
          <div className="flex items-center justify-center rounded-full mb-7"
            style={{ width: 48, height: 48, border: '1px solid rgba(201,169,110,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polyline points="3,9 7,13 15,5" stroke="#c9a96e" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <motion.div
            className="flex items-center justify-center rounded-full mb-7"
            style={{ width: 48, height: 48, border: '1px solid rgba(201,169,110,0.25)' }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(201,169,110,0.4)' }} />
          </motion.div>
        )}

        {/* ── TITLE ── */}
        <h1 className="font-garamond text-[36px] font-normal text-center mb-4"
          style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
          {anchored ? 'Your proof is ready.' : 'Pending.'}
        </h1>

        {/* ── ESTIMATED TIME (pending only) ── */}
        {!anchored && (() => {
          const expectedAt = new Date(captured.getTime() + 2 * 60 * 60 * 1000);
          const now = new Date();
          const diffMs = expectedAt.getTime() - now.getTime();
          const diffMin = Math.max(0, Math.round(diffMs / 60000));
          const label = diffMin <= 0
            ? 'Any moment now.'
            : diffMin < 60
              ? `~${diffMin} min remaining`
              : `~${Math.ceil(diffMin / 60)}h remaining`;
          return (
            <p className="font-mono text-[14px] tracking-[1px] text-center mb-12"
              style={{ color: 'rgba(201,169,110,0.4)' }}>
              {label}
            </p>
          );
        })()}

        {/* ── DIVIDER 1 (only when ready) ── */}
        {anchored && (
          <div className="mb-9" style={{ width: 32, height: 1, background: 'rgba(201,169,110,0.4)' }} />
        )}

        {/* ── ORIGIN ID LABEL ── */}
        <p className="font-mono text-[14px] tracking-[5px] uppercase text-center mb-2"
          style={{ color: 'rgba(201,169,110,0.4)' }}>
          Origin ID
        </p>

        {/* ── ORIGIN ID ── */}
        <p className="font-mono text-[22px] tracking-[6px] text-center mb-2.5"
          style={{ color: '#c9a96e' }}>
          {state.shortToken}
        </p>

        {/* ── DATE ── */}
        <p className="font-garamond text-[24px] text-center mb-4"
          style={{ color: 'rgba(240,234,214,0.35)' }}>
          {date} · {time}
        </p>

        {/* ── HASH LABEL ── */}
        <p className="font-mono text-[14px] tracking-[5px] uppercase text-center mb-2"
          style={{ color: 'rgba(201,169,110,0.4)', marginTop: 4 }}>
          Hash
        </p>

        {/* ── HASH ── */}
        <p className="font-mono text-[14px] text-center break-all mb-4"
          style={{ color: 'rgba(240,234,214,0.35)', letterSpacing: '0.5px', lineHeight: 1.8, maxWidth: 320 }}>
          {state.hash}
        </p>

        {/* ── STATUS BAR ── */}
        <div className="flex items-center gap-2.5 mb-10">
          {statusParts.map((part, i) => (
            <span key={i} className="flex items-center gap-2.5">
              {i > 0 && (
                <span className="w-[3px] h-[3px] rounded-full"
                  style={{ background: 'rgba(201,169,110,0.2)' }} />
              )}
              {part.pulse ? (
                <motion.span
                  className="font-mono text-[14px] tracking-[1px] uppercase"
                  style={{ color: 'rgba(201,169,110,0.5)' }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                  {part.label}
                </motion.span>
              ) : (
                <span className="font-mono text-[14px] tracking-[1px] uppercase"
                  style={{ color: 'rgba(201,169,110,0.5)' }}>
                  {part.label}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* ── ACTIONS (only when ready) ── */}
        {anchored && (
          <>
            {/* ── DIVIDER 2 ── */}
            <div className="w-full mb-9" style={{ height: 1, background: 'rgba(240,234,214,0.12)' }} />

            {/* ── 1. Download ── */}
            <button onClick={onDownload}
              className="font-garamond text-[26px] text-center mb-5 transition-colors"
              style={{ color: 'rgba(240,234,214,0.85)' }}>
              Download proof
            </button>

            {/* ── 2. Verify ── */}
            <div className="w-full flex flex-col items-center mb-8">
              <InlineVerify />
            </div>

            {/* ── 3. Share (optional) ── */}
            <button onClick={onShare}
              className="font-mono text-[14px] tracking-[3px] uppercase transition-colors mb-2"
              style={{ color: 'rgba(240,234,214,0.35)' }}>
              Share this proof
            </button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 mb-8 group">
              <span className="font-mono text-[20px] transition-opacity group-hover:opacity-80"
                style={{ color: '#c9a96e', letterSpacing: '0.5px' }}>
                itexisted.app/{state.shortToken}
              </span>
              <svg className="flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity"
                width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 7.5V11a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h3.5" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" />
                <path d="M8 2h4v4" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 8L12 2" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </a>

            {/* ── 4. Attestation (optional) ── */}
            <div className="w-full flex flex-col items-center mb-8">
              <InlineAttestation originId={state.originId} shortToken={state.shortToken} />
            </div>
          </>
        )}

        {/* ── ANCHOR ANOTHER ── */}
        <button onClick={() => navigate('/itexisted')}
          className="font-mono text-[14px] tracking-[5px] uppercase transition-colors hover:text-white/60"
          style={{ color: 'rgba(240,234,214,0.35)' }}>
          Anchor another file
        </button>

      </motion.div>
    </main>
  );
}
