import { useEffect, useMemo, useRef, useState } from 'react';
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

/** Countdown hook: returns remaining time string or null when done */
function useCountdown(targetTime: Date) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const diff = targetTime.getTime() - now.getTime();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function ItExistedAnchored() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as AnchoredState | null) ?? getFallbackState();
  const [copied, setCopied] = useState(false);
  const verifyInputRef = useRef<HTMLInputElement>(null);
  const [verifyResult, setVerifyResult] = useState<'idle' | 'checking' | 'match' | 'mismatch'>('idle');

  const captured = useMemo(() => (state?.capturedAt ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const estimatedReady = useMemo(() => new Date(captured.getTime() + 2 * 3600000), [captured]);
  const countdown = useCountdown(estimatedReady);
  const proofUrl = state ? `itexisted.app/${state.shortToken}` : '';
  const fullProofUrl = state ? `${window.location.origin}/itexisted/proof/${state.shortToken}` : '';

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullProofUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  };

  const handleVerifyFile = async (file: File | null) => {
    if (!file || !state) return;
    setVerifyResult('checking');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const normalizedState = state.hash.replace(/^sha256:/i, '').toLowerCase();
      setVerifyResult(normalizedState === hash ? 'match' : 'mismatch');
    } catch {
      setVerifyResult('mismatch');
    }
  };

  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8"
        style={{ background: '#0a0f0a' }}>
        <div className="text-center">
          <p className="font-garamond text-[24px] mb-6"
            style={{ color: 'rgba(240,234,214,0.35)' }}>No submission found.</p>
          <button onClick={() => navigate('/itexisted')}
            className="font-mono text-[11px] tracking-[4px] uppercase transition-colors"
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
    <main className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: '#0a0f0a', WebkitFontSmoothing: 'antialiased' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-center"
        style={{ maxWidth: 400 }}>

        {/* ── CHECKMARK ── */}
        <div className="flex items-center justify-center rounded-full mb-6"
          style={{ width: 56, height: 56, border: '1px solid rgba(201,169,110,0.4)' }}>
          <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
            <polyline points="3,9 7,13 15,5" stroke="#c9a96e" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── TITLE ── */}
        <h1 className="font-garamond text-[48px] font-normal text-center mb-4"
          style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
          Submitted.
        </h1>

        {/* ── TIP (moved to top) ── */}
        <p className="font-garamond italic text-[20px] text-center mb-10"
          style={{ color: 'rgba(240,234,214,0.35)', lineHeight: 1.6, maxWidth: 320 }}>
          Tip: rename your file to include{' '}
          <span className="font-mono text-[17px]" style={{ color: 'rgba(201,169,110,0.5)' }}>{state.shortToken}</span>{' '}
          so you can always match it to this proof.
        </p>

        {/* ── RECORD DETAILS ── */}
        <div className="w-full mb-10" style={{ maxWidth: 360 }}>
          <div className="flex justify-between items-baseline mb-4">
            <span className="font-mono text-[13px] tracking-[2px] uppercase"
              style={{ color: 'rgba(201,169,110,0.45)' }}>Origin ID</span>
            <span className="font-mono text-[22px] tracking-[4px]"
              style={{ color: '#c9a96e' }}>{state.shortToken}</span>
          </div>
          <div className="flex justify-between items-baseline mb-4">
            <span className="font-mono text-[13px] tracking-[2px] uppercase"
              style={{ color: 'rgba(201,169,110,0.45)' }}>Date</span>
            <span className="font-garamond text-[20px]"
              style={{ color: 'rgba(240,234,214,0.5)' }}>{date} · {time}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-[13px] tracking-[2px] uppercase pt-1"
              style={{ color: 'rgba(201,169,110,0.45)' }}>Hash</span>
            <span className="font-mono text-[13px] text-right break-all"
              style={{ color: 'rgba(240,234,214,0.35)', letterSpacing: '0.3px', lineHeight: 1.7, maxWidth: 250 }}>
              {state.hash}
            </span>
          </div>
        </div>

        {/* ── COMPLETED ── */}
        <div className="w-full mb-6" style={{ maxWidth: 360 }}>
          <p className="font-mono text-[12px] tracking-[3px] uppercase mb-5"
            style={{ color: 'rgba(201,169,110,0.4)' }}>
            ✓ Completed
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="font-mono text-[16px] mt-0.5" style={{ color: '#c9a96e' }}>✓</span>
              <p className="font-garamond text-[20px]" style={{ color: 'rgba(240,234,214,0.7)', lineHeight: 1.5 }}>
                SHA-256 fingerprint calculated from your file
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[16px] mt-0.5" style={{ color: '#c9a96e' }}>✓</span>
              <p className="font-garamond text-[20px]" style={{ color: 'rgba(240,234,214,0.7)', lineHeight: 1.5 }}>
                Fingerprint submitted to the origin registry
              </p>
            </div>
            {state.deviceSignature && (
              <div className="flex items-start gap-3">
                <span className="font-mono text-[16px] mt-0.5" style={{ color: '#c9a96e' }}>✓</span>
                <p className="font-garamond text-[20px]" style={{ color: 'rgba(240,234,214,0.7)', lineHeight: 1.5 }}>
                  Signed with your device's hardware key
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="w-full mb-6" style={{ maxWidth: 360, height: 1, background: 'rgba(240,234,214,0.1)' }} />

        {/* ── PENDING ── */}
        <div className="w-full mb-10" style={{ maxWidth: 360 }}>
          <div className="flex items-baseline justify-between mb-5">
            <p className="font-mono text-[12px] tracking-[3px] uppercase"
              style={{ color: 'rgba(240,234,214,0.25)' }}>
              ⏳ Pending
            </p>
            {countdown && (
              <span className="font-mono text-[14px]"
                style={{ color: 'rgba(201,169,110,0.5)' }}>
                ~{countdown}
              </span>
            )}
            {!countdown && (
              <span className="font-mono text-[14px]"
                style={{ color: '#c9a96e' }}>
                Ready — check proof page
              </span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono text-[16px] mt-0.5" style={{ color: 'rgba(240,234,214,0.25)' }}>○</span>
            <p className="font-garamond text-[20px]" style={{ color: 'rgba(240,234,214,0.4)', lineHeight: 1.5 }}>
              Bitcoin blockchain anchoring. Your fingerprint will be included in the next batch and permanently recorded in a Bitcoin block.
            </p>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="w-full mb-8" style={{ maxWidth: 360, height: 1, background: 'rgba(240,234,214,0.06)' }} />

        {/* ── VERIFY FILE (optional) ── */}
        <div className="w-full mb-10" style={{ maxWidth: 360 }}>
          <button
            onClick={() => verifyInputRef.current?.click()}
            className="w-full py-4 rounded-lg border border-dashed transition-all hover:border-solid"
            style={{
              borderColor: verifyResult === 'match' ? 'rgba(120,180,120,0.4)' :
                           verifyResult === 'mismatch' ? 'rgba(200,100,100,0.4)' :
                           'rgba(201,169,110,0.15)',
              background: verifyResult === 'match' ? 'rgba(120,180,120,0.05)' :
                          verifyResult === 'mismatch' ? 'rgba(200,100,100,0.05)' :
                          'transparent',
            }}>
            {verifyResult === 'idle' && (
              <p className="font-garamond text-[18px]" style={{ color: 'rgba(240,234,214,0.35)' }}>
                Optional: upload your file to verify the fingerprint
              </p>
            )}
            {verifyResult === 'checking' && (
              <p className="font-mono text-[14px]" style={{ color: 'rgba(201,169,110,0.5)' }}>
                Checking…
              </p>
            )}
            {verifyResult === 'match' && (
              <div className="flex flex-col items-center gap-1">
                <p className="font-mono text-[14px]" style={{ color: 'rgba(120,180,120,0.8)' }}>
                  ✓ Fingerprint matches
                </p>
                <p className="font-garamond text-[16px]" style={{ color: 'rgba(240,234,214,0.4)' }}>
                  This is the exact file you submitted
                </p>
              </div>
            )}
            {verifyResult === 'mismatch' && (
              <div className="flex flex-col items-center gap-1">
                <p className="font-mono text-[14px]" style={{ color: 'rgba(200,100,100,0.8)' }}>
                  ✗ Fingerprint does not match
                </p>
                <p className="font-garamond text-[16px]" style={{ color: 'rgba(240,234,214,0.4)' }}>
                  This is a different file than the one submitted
                </p>
              </div>
            )}
          </button>
          <input ref={verifyInputRef} type="file" className="hidden"
            onChange={(e) => { handleVerifyFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
        </div>

        {/* ── PROOF LINK ── */}
        <p className="font-garamond text-[20px] text-center mb-4"
          style={{ color: 'rgba(240,234,214,0.45)', lineHeight: 1.5, maxWidth: 320 }}>
          Your permanent proof page:
        </p>
        <a href={fullProofUrl} 
          className="flex items-center gap-2.5 mb-10 group"
          onClick={(e) => { e.preventDefault(); navigate(`/itexisted/proof/${state.shortToken}`); }}>
          <span className="font-mono text-[20px] transition-opacity group-hover:opacity-80"
            style={{ color: '#c9a96e', letterSpacing: '0.5px' }}>
            {proofUrl}
          </span>
          <svg className="flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity"
            width="15" height="15" viewBox="0 0 14 14" fill="none">
            <path d="M5 9l4-4" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" />
            <path d="M5 5h4v4" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        {/* ── SUBMIT ANOTHER ── */}
        <button onClick={() => navigate('/itexisted')}
          className="font-mono text-[12px] tracking-[4px] uppercase transition-colors hover:text-white/60 mb-8"
          style={{ color: 'rgba(240,234,214,0.25)' }}>
          Submit another file
        </button>

      </motion.div>
    </main>
  );
}