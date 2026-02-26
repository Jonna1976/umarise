import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AnchoredState {
  originId: string;
  shortToken: string;
  hash: string;
  capturedAt: string;
  deviceSignature?: string | null;
  devicePublicKey?: string | null;
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
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0a0f0a', WebkitFontSmoothing: 'antialiased' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-center"
        style={{ maxWidth: 390 }}>

        {/* ── CHECKMARK ── */}
        <div className="flex items-center justify-center rounded-full mb-6"
          style={{ width: 48, height: 48, border: '1px solid rgba(201,169,110,0.4)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <polyline points="3,9 7,13 15,5" stroke="#c9a96e" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── TITLE ── */}
        <h1 className="font-garamond text-[36px] font-normal text-center mb-10"
          style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
          Submitted.
        </h1>

        {/* ── RECORD DETAILS (left-aligned table) ── */}
        <div className="w-full mb-10" style={{ maxWidth: 340 }}>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[9px] tracking-[3px] uppercase"
              style={{ color: 'rgba(201,169,110,0.4)' }}>Origin ID</span>
            <span className="font-mono text-[15px] tracking-[3px]"
              style={{ color: '#c9a96e' }}>{state.shortToken}</span>
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[9px] tracking-[3px] uppercase"
              style={{ color: 'rgba(201,169,110,0.4)' }}>Date</span>
            <span className="font-garamond text-[14px]"
              style={{ color: 'rgba(240,234,214,0.5)' }}>{date} · {time}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] tracking-[3px] uppercase pt-0.5"
              style={{ color: 'rgba(201,169,110,0.4)' }}>Hash</span>
            <span className="font-mono text-[9px] text-right break-all"
              style={{ color: 'rgba(240,234,214,0.35)', letterSpacing: '0.3px', lineHeight: 1.7, maxWidth: 240 }}>
              {state.hash}
            </span>
          </div>
        </div>

        {/* ── WHAT'S DONE ── */}
        <div className="w-full mb-8" style={{ maxWidth: 340 }}>
          <p className="font-mono text-[8px] tracking-[4px] uppercase mb-4"
            style={{ color: 'rgba(201,169,110,0.35)' }}>
            ✓ Completed
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-3">
              <span className="font-mono text-[11px] mt-0.5" style={{ color: '#c9a96e' }}>✓</span>
              <p className="font-garamond text-[15px]" style={{ color: 'rgba(240,234,214,0.7)', lineHeight: 1.5 }}>
                SHA-256 fingerprint calculated from your file
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[11px] mt-0.5" style={{ color: '#c9a96e' }}>✓</span>
              <p className="font-garamond text-[15px]" style={{ color: 'rgba(240,234,214,0.7)', lineHeight: 1.5 }}>
                Fingerprint submitted to the Umarise registry
              </p>
            </div>
            {state.deviceSignature && (
              <div className="flex items-start gap-3">
                <span className="font-mono text-[11px] mt-0.5" style={{ color: '#c9a96e' }}>✓</span>
                <p className="font-garamond text-[15px]" style={{ color: 'rgba(240,234,214,0.7)', lineHeight: 1.5 }}>
                  Signed with your device's hardware key
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── WHAT'S PENDING ── */}
        <div className="w-full mb-10" style={{ maxWidth: 340 }}>
          <p className="font-mono text-[8px] tracking-[4px] uppercase mb-4"
            style={{ color: 'rgba(240,234,214,0.2)' }}>
            ⏳ Pending (~2 hours)
          </p>
          <div className="flex items-start gap-3">
            <span className="font-mono text-[11px] mt-0.5" style={{ color: 'rgba(240,234,214,0.25)' }}>○</span>
            <p className="font-garamond text-[15px]" style={{ color: 'rgba(240,234,214,0.4)', lineHeight: 1.5 }}>
              Bitcoin blockchain anchoring — your fingerprint will be included in the next batch and permanently recorded in a Bitcoin block
            </p>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="w-full mb-8" style={{ height: 1, background: 'rgba(240,234,214,0.08)' }} />

        {/* ── PROOF LINK ── */}
        <p className="font-garamond text-[15px] text-center mb-3"
          style={{ color: 'rgba(240,234,214,0.45)', lineHeight: 1.5, maxWidth: 300 }}>
          Your permanent proof page — bookmark or share it:
        </p>
        <a href={fullProofUrl} 
          className="flex items-center gap-2.5 mb-8 group"
          onClick={(e) => { e.preventDefault(); navigate(`/itexisted/proof/${state.shortToken}`); }}>
          <span className="font-mono text-[15px] transition-opacity group-hover:opacity-80"
            style={{ color: '#c9a96e', letterSpacing: '0.5px' }}>
            {proofUrl}
          </span>
          <svg className="flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity"
            width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M5 9l4-4" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" />
            <path d="M5 5h4v4" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        {/* ── TIP ── */}
        <p className="font-garamond italic text-[14px] text-center mb-10"
          style={{ color: 'rgba(240,234,214,0.3)', lineHeight: 1.6, maxWidth: 280 }}>
          Tip: rename your file to include{' '}
          <span className="font-mono text-[12px]" style={{ color: 'rgba(201,169,110,0.45)' }}>{state.shortToken}</span>{' '}
          so you can always match it to this proof.
        </p>

        {/* ── SUBMIT ANOTHER ── */}
        <button onClick={() => navigate('/itexisted')}
          className="font-mono text-[9px] tracking-[5px] uppercase transition-colors hover:text-white/60 mb-8"
          style={{ color: 'rgba(240,234,214,0.25)' }}>
          Submit another file
        </button>

      </motion.div>
    </main>
  );
}
