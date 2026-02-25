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
        style={{ maxWidth: 320 }}>

        {/* V7 pending nail */}
        <V7Pending />

        {/* Anchor wire */}
        <div className="w-px h-4"
          style={{ background: 'linear-gradient(to bottom, hsl(var(--itx-gold) / 0.25), hsl(var(--itx-gold) / 0.08))' }} />

        {/* Golden frame placeholder */}
        <div className="mb-5 p-2 rounded-[3px]"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--itx-gold) / 0.22), hsl(var(--itx-gold) / 0.12) 30%, hsl(var(--itx-gold) / 0.18) 70%, hsl(var(--itx-gold) / 0.15))',
            boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 20px hsl(var(--itx-gold) / 0.08), inset 0 0 0 2px hsl(var(--itx-gold) / 0.25), inset 0 0 0 3px hsl(var(--itx-surface) / 0.5), inset 0 0 0 4px hsl(var(--itx-gold) / 0.1)',
          }}>
          <div className="p-1 border"
            style={{ borderColor: 'hsl(var(--itx-gold) / 0.15)', background: 'hsl(var(--itx-surface) / 0.95)' }}>
            <div className="w-[220px] h-[140px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D1B0E, #1A2E1A, #1B1B2E)' }}>
              <span className="font-garamond italic text-[13px]"
                style={{ color: 'hsl(var(--itx-gold) / 0.2)' }}>anchoring…</span>
            </div>
          </div>
        </div>

        {/* Museum label */}
        <div className="w-10 h-px mb-4" style={{ background: 'hsl(var(--itx-gold) / 0.2)' }} />

        <p className="font-mono text-[14px] tracking-[3px] mb-1"
          style={{ color: 'hsl(var(--itx-gold) / 0.5)' }}>{state.shortToken}</p>
        <p className="font-garamond text-[17px] mb-2"
          style={{ color: 'hsl(var(--itx-cream) / 0.35)' }}>{date} · {time}</p>
        <p className="font-mono text-[11px] tracking-[0.5px] mb-4 max-w-[280px] break-all"
          style={{ color: 'hsl(var(--itx-gold-muted) / 0.3)' }}>{state.hash}</p>

        {/* Proof components — pending */}
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.35)' }}>certificate</span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--itx-gold) / 0.2)' }} />
          <span className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.35)' }}>hash</span>
          <motion.span className="w-[3px] h-[3px] rounded-full"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ background: 'hsl(var(--itx-gold) / 0.4)' }} />
          <span className="font-mono text-[10px] tracking-[1px] opacity-60"
            style={{ color: 'hsl(var(--itx-gold) / 0.35)' }}>proof.ots</span>
        </div>

        {/* Share proof link — primary action */}
        <button
          onClick={() => navigate(`/itexisted/proof/${state.shortToken}`)}
          className="px-10 py-[11px] rounded-full font-playfair text-[17px] font-light mb-4"
          style={{
            border: '1px solid hsl(var(--itx-gold) / 0.3)',
            background: 'hsl(var(--itx-gold) / 0.08)',
            color: 'hsl(var(--itx-gold) / 0.8)',
          }}>
          View proof
        </button>

        {/* Copy URL with visible icon */}
        <CopyUrlButton url={proofUrl} token={state.shortToken} />
      </motion.section>
    </main>
  );
}
