import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AnchoredState {
  originId: string;
  shortToken: string;
  hash: string;
  capturedAt: string;
}

function getFallbackState(): AnchoredState | null {
  const raw = localStorage.getItem('itexisted_last_anchor');
  if (!raw) return null;
  try { return JSON.parse(raw) as AnchoredState; } catch { return null; }
}

export default function ItExistedAnchored() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as AnchoredState | null) ?? getFallbackState();
  const [copied, setCopied] = useState(false);

  const captured = useMemo(() => (state?.capturedAt ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const proofUrl = state ? `itexisted.app/${state.shortToken}` : '';
  const fullProofUrl = state ? `${window.location.origin}/itexisted/proof/${state.shortToken}` : '';

  useEffect(() => {
    if (fullProofUrl && navigator.clipboard) {
      navigator.clipboard.writeText(fullProofUrl).catch(() => undefined);
    }
  }, [fullProofUrl]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullProofUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  };

  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8"
        style={{ background: '#0a0f0a' }}>
        <div className="text-center">
          <p className="font-garamond text-[16px] mb-4"
            style={{ color: 'rgba(240,234,214,0.35)' }}>No anchor found.</p>
          <button onClick={() => navigate('/itexisted')}
            className="font-mono text-[9px] tracking-[5px] uppercase transition-colors"
            style={{ color: 'rgba(240,234,214,0.35)' }}>
            Start anchoring
          </button>
        </div>
      </main>
    );
  }

  const date = captured.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`;

  return (
    <main className="min-h-screen flex items-center justify-center px-8"
      style={{ background: '#0a0f0a', WebkitFontSmoothing: 'antialiased' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-center"
        style={{ maxWidth: 390 }}>

        {/* ── CHECKMARK ── */}
        <div className="flex items-center justify-center rounded-full mb-7"
          style={{ width: 48, height: 48, border: '1px solid rgba(201,169,110,0.4)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <polyline points="3,9 7,13 15,5" stroke="#c9a96e" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── TITLE ── */}
        <h1 className="font-garamond text-[36px] font-normal text-center mb-12"
          style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
          Anchored.
        </h1>

        {/* ── DIVIDER 1 ── */}
        <div className="mb-9" style={{ width: 32, height: 1, background: 'rgba(201,169,110,0.4)' }} />

        {/* ── ORIGIN ID LABEL ── */}
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-center mb-2"
          style={{ color: 'rgba(201,169,110,0.4)' }}>
          Origin ID
        </p>

        {/* ── ORIGIN ID ── */}
        <p className="font-mono text-[22px] tracking-[6px] text-center mb-2.5"
          style={{ color: '#c9a96e' }}>
          {state.shortToken}
        </p>

        {/* ── DATE ── */}
        <p className="font-garamond text-[16px] text-center mb-4"
          style={{ color: 'rgba(240,234,214,0.35)' }}>
          {date} · {time}
        </p>

        {/* ── HASH LABEL ── */}
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-center mb-2"
          style={{ color: 'rgba(201,169,110,0.4)', marginTop: 4 }}>
          Hash
        </p>

        {/* ── HASH ── */}
        <p className="font-mono text-[9px] text-center break-all mb-12"
          style={{ color: 'rgba(240,234,214,0.35)', letterSpacing: '0.5px', lineHeight: 1.8, maxWidth: 320 }}>
          {state.hash}
        </p>

        {/* ── DIVIDER 2 ── */}
        <div className="w-full mb-9" style={{ height: 1, background: 'rgba(240,234,214,0.12)' }} />

        {/* ── URL INSTRUCTION ── */}
        <p className="font-garamond text-[18px] text-center mb-5"
          style={{ color: 'rgba(240,234,214,0.85)', lineHeight: 1.55, maxWidth: 300 }}>
          Copy and go to this URL in ~2 hours to download your proof.
        </p>

        {/* ── URL ROW ── */}
        <div className="flex items-center gap-2.5 mb-12">
          <span className="font-mono text-[16px]"
            style={{ color: '#c9a96e', letterSpacing: '0.5px' }}>
            {proofUrl}
          </span>
          <svg className="cursor-pointer flex-shrink-0 transition-opacity"
            style={{ opacity: copied ? 1 : 0.5 }}
            onClick={handleCopy}
            width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="9" height="9" rx="1" stroke="#c9a96e" strokeWidth="1" />
            <path d="M3 11V3a1 1 0 011-1h8" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        {/* ── KEEP FILE ── */}
        <p className="font-garamond italic text-[14px] text-center mb-12"
          style={{ color: 'rgba(240,234,214,0.35)', lineHeight: 1.6, maxWidth: 280 }}>
          Keep your original file. You'll need the exact bytes to verify.
        </p>

        {/* ── ANCHOR ANOTHER ── */}
        <button onClick={() => navigate('/itexisted')}
          className="font-mono text-[9px] tracking-[5px] uppercase transition-colors hover:text-white/60"
          style={{ color: 'rgba(240,234,214,0.35)' }}>
          Anchor another file
        </button>

      </motion.div>
    </main>
  );
}
