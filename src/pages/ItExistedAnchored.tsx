import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

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

/** V7 Pending nail with pulse */
function V7Pending() {
  return (
    <motion.svg viewBox="0 0 48 48" width="36" height="36"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <polygon points="24,4 42,14 42,34 24,44 6,34 6,14"
        fill="none" stroke="hsl(var(--itx-gold) / 0.4)" strokeWidth="1.2"
        strokeDasharray="3 3" />
      <rect x="17" y="17" width="14" height="14" rx="1.8"
        fill="hsl(var(--itx-gold) / 0.15)" />
    </motion.svg>
  );
}

function CopyUrlButton({ url, token }: { url: string; token: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-2 font-mono text-[10px] tracking-[1px] transition-colors"
      style={{ color: copied ? 'hsl(var(--itx-gold) / 0.7)' : 'hsl(var(--itx-cream) / 0.3)' }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span>itexisted.app/{token}</span>
    </button>
  );
}

export default function ItExistedAnchored() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as AnchoredState | null) ?? getFallbackState();

  const captured = useMemo(() => (state?.capturedAt ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const proofUrl = state ? `${window.location.origin}/itexisted/proof/${state.shortToken}` : '';

  useEffect(() => {
    if (proofUrl && navigator.clipboard) {
      navigator.clipboard.writeText(proofUrl).catch(() => undefined);
    }
  }, [proofUrl]);

  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'hsl(var(--itx-bg))' }}>
        <div className="text-center">
          <p className="font-garamond text-[16px] mb-4"
            style={{ color: 'hsl(var(--itx-cream) / 0.5)' }}>No anchor found.</p>
          <button onClick={() => navigate('/itexisted')}
            className="font-mono text-[9px] tracking-[2px] uppercase"
            style={{ color: 'hsl(var(--itx-gold))' }}>
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
      style={{ background: 'hsl(var(--itx-bg))' }}>
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
        style={{ maxWidth: 340 }}>

        {/* Confirmation */}
        <svg viewBox="0 0 48 48" width="40" height="40" className="mb-4">
          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--itx-gold) / 0.3)" strokeWidth="1.2" />
          <path d="M15 24L22 31L34 17" fill="none" stroke="hsl(var(--itx-gold) / 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h1 className="font-playfair text-[22px] font-light mb-1"
          style={{ color: 'hsl(var(--itx-cream))' }}>
          Anchored.
        </h1>

        <p className="font-garamond text-[15px] mb-6 max-w-[280px] leading-relaxed"
          style={{ color: 'hsl(var(--itx-cream) / 0.45)' }}>
          Your file is registered. The Bitcoin proof takes ~2 hours to complete.
        </p>

        {/* Divider */}
        <div className="w-10 h-px mb-5" style={{ background: 'hsl(var(--itx-gold) / 0.15)' }} />

        {/* Token + date */}
        <p className="font-mono text-[14px] tracking-[3px] mb-1"
          style={{ color: 'hsl(var(--itx-gold) / 0.5)' }}>{state.shortToken}</p>
        <p className="font-garamond text-[15px] mb-2"
          style={{ color: 'hsl(var(--itx-cream) / 0.3)' }}>{date} · {time}</p>
        <p className="font-mono text-[9px] tracking-[0.5px] mb-6 max-w-[280px] break-all"
          style={{ color: 'hsl(var(--itx-gold-muted) / 0.2)' }}>{state.hash}</p>

        {/* What happens next — key clarity */}
        <div className="w-full rounded-lg p-4 mb-6"
          style={{ background: 'hsl(var(--itx-surface))', border: '1px solid hsl(var(--itx-gold) / 0.1)' }}>
          <p className="font-mono text-[9px] tracking-[2px] uppercase mb-3"
            style={{ color: 'hsl(var(--itx-gold) / 0.5)' }}>What happens next</p>
          
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] mt-px" style={{ color: 'hsl(var(--itx-gold) / 0.4)' }}>1.</span>
              <p className="font-garamond text-[13px] leading-snug"
                style={{ color: 'hsl(var(--itx-cream) / 0.5)' }}>
                Your file's hash is being anchored to the Bitcoin blockchain (~2 hours)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] mt-px" style={{ color: 'hsl(var(--itx-gold) / 0.4)' }}>2.</span>
              <p className="font-garamond text-[13px] leading-snug"
                style={{ color: 'hsl(var(--itx-cream) / 0.5)' }}>
                Come back to your proof URL to download the complete proof bundle
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] mt-px" style={{ color: 'hsl(var(--itx-gold) / 0.4)' }}>3.</span>
              <p className="font-garamond text-[13px] leading-snug"
                style={{ color: 'hsl(var(--itx-cream) / 0.5)' }}>
                Keep your original file — you'll need the exact bytes to verify
              </p>
            </div>
          </div>
        </div>

        {/* Proof URL — the thing to bookmark */}
        <p className="font-mono text-[8px] tracking-[2px] uppercase mb-2"
          style={{ color: 'hsl(var(--itx-gold) / 0.3)' }}>Your proof URL</p>
        <CopyUrlButton url={proofUrl} token={state.shortToken} />

        {/* Anchor another */}
        <button onClick={() => navigate('/itexisted')}
          className="mt-8 font-mono text-[9px] tracking-[1px] uppercase"
          style={{ color: 'hsl(var(--itx-cream) / 0.2)' }}>
          Anchor another file
        </button>
      </motion.section>
    </main>
  );
}
