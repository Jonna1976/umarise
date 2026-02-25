import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AnchoredState {
  originId: string;
  shortToken: string;
  hash: string;
  capturedAt: string;
}

function getFallbackState(): AnchoredState | null {
  const raw = localStorage.getItem('itexisted_last_anchor');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnchoredState;
  } catch {
    return null;
  }
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
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'hsl(var(--itx-bg))' }}>
        <div className="text-center">
          <p className="font-garamond text-lg mb-4" style={{ color: 'hsl(var(--itx-cream) / 0.7)' }}>No anchor found.</p>
          <button onClick={() => navigate('/itexisted')} className="font-mono text-xs tracking-[2px] uppercase" style={{ color: 'hsl(var(--itx-gold))' }}>
            Start anchoring
          </button>
        </div>
      </main>
    );
  }

  const date = captured.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`;

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'hsl(var(--itx-bg))' }}>
      <section className="w-full max-w-sm rounded-[28px] border px-6 py-10 text-center" style={{ background: 'hsl(var(--itx-surface))', borderColor: 'hsl(var(--itx-border))' }}>
        <p className="font-mono text-[7px] tracking-[3px] uppercase mb-1" style={{ color: 'hsl(var(--itx-muted))' }}>Origin ID</p>
        <p className="font-mono text-[16px] tracking-[6px] mb-4" style={{ color: 'hsl(var(--itx-gold))' }}>{state.shortToken}</p>

        <p className="font-playfair text-[16px]" style={{ color: 'hsl(var(--itx-cream))' }}>{date}</p>
        <p className="font-garamond text-[12px] mb-4" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>{time}</p>

        <p className="font-mono text-[7px] tracking-[3px] uppercase mb-1" style={{ color: 'hsl(var(--itx-muted))' }}>Hash</p>
        <p className="font-mono text-[8px] leading-6 break-all mb-5" style={{ color: 'hsl(var(--itx-muted))' }}>{state.hash}</p>

        <div className="h-px mb-4" style={{ background: 'hsl(var(--itx-border))' }} />

        <button
          onClick={() => navigator.clipboard?.writeText(proofUrl).catch(() => undefined)}
          className="font-mono text-[9px] tracking-[1px] mb-1"
          style={{ color: 'hsl(var(--itx-cream) / 0.7)' }}
        >
          itexisted.app/{state.shortToken}
        </button>

        <p className="font-garamond italic text-[10px] leading-5 mb-4" style={{ color: 'hsl(var(--itx-cream) / 0.12)' }}>
          Your anchor will be ready at this URL within 2 hours
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: 'hsl(var(--itx-gold))', boxShadow: '0 0 14px hsl(var(--itx-gold) / 0.35)' }} />
          <span className="font-mono text-[8px] tracking-[2px] uppercase" style={{ color: 'hsl(var(--itx-gold))' }}>proof pending</span>
        </div>

        <button
          onClick={() => navigate(`/itexisted/proof/${state.shortToken}`)}
          className="px-6 py-2 rounded-full font-garamond text-[14px]"
          style={{ background: 'hsl(var(--itx-gold) / 0.08)', color: 'hsl(var(--itx-gold))', border: '1px solid hsl(var(--itx-gold) / 0.3)' }}
        >
          Open proof page
        </button>
      </section>
    </main>
  );
}
