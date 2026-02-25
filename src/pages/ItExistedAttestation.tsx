import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchOriginByToken, fetchProofStatus, startAttestationCheckout } from '@/lib/coreApi';
import { getActiveDeviceId } from '@/lib/deviceId';

interface AttState {
  originId: string;
  shortToken: string;
  date: string;
  block: number | null;
  anchored: boolean;
}

export default function ItExistedAttestation() {
  const { token = '' } = useParams();
  const [state, setState] = useState<AttState | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    (async () => {
      const resolved = await fetchOriginByToken(token);
      if (!resolved) { setState(null); setLoading(false); return; }
      const proof = await fetchProofStatus(resolved.origin_id);
      setState({
        originId: resolved.origin_id,
        shortToken: resolved.short_token ?? token.toUpperCase(),
        date: new Date(resolved.captured_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        block: proof.bitcoinBlockHeight,
        anchored: proof.status === 'anchored',
      });
      setLoading(false);
    })();
  }, [token]);

  const onPay = async () => {
    if (!state?.anchored) return;
    const deviceId = getActiveDeviceId();
    if (!deviceId) { toast.error('Device not ready.'); return; }
    setRedirecting(true);
    const checkout = await startAttestationCheckout(state.originId, deviceId);
    if (!checkout) { toast.error('Could not open payment.'); setRedirecting(false); return; }
    window.location.href = checkout.url;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--itx-bg))', color: 'hsl(var(--itx-cream) / 0.5)' }}>
        <span className="font-mono text-[9px] tracking-[2px] uppercase">Loading…</span>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--itx-bg))', color: 'hsl(var(--itx-cream) / 0.5)' }}>
        <span className="font-garamond text-[16px]">Origin not found.</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'hsl(var(--itx-bg))' }}>
      <section className="flex flex-col items-center text-center" style={{ maxWidth: 320 }}>

        {/* V7 nail — anchored */}
        <svg viewBox="0 0 48 48" width="32" height="32"
          style={{ filter: 'drop-shadow(0 0 8px hsl(var(--itx-gold) / 0.3))' }}>
          <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="hsl(var(--itx-gold))" />
          <rect x="17" y="17" width="14" height="14" rx="1.8" fill="hsl(var(--itx-surface))" />
        </svg>

        <div className="w-px h-3 mb-5"
          style={{ background: 'linear-gradient(to bottom, hsl(var(--itx-gold) / 0.4), hsl(var(--itx-gold) / 0.1))' }} />

        <h1 className="font-playfair text-[18px] font-light mb-1"
          style={{ color: 'hsl(var(--itx-cream))' }}>Layer 3 Attestation</h1>
        <p className="font-garamond italic text-[13px] mb-6"
          style={{ color: 'hsl(var(--itx-cream) / 0.3)' }}>
          A notary reinforces your anchor with an independent certified statement.
        </p>

        {/* Info rows */}
        <div className="w-full border-t" style={{ borderColor: 'hsl(var(--itx-border))' }}>
          <InfoRow label="Origin" value={state.shortToken} gold />
          <InfoRow label="Anchored" value={state.date} />
          <InfoRow label="Bitcoin block" value={state.block ? state.block.toLocaleString('en-US') : 'pending'} />
          <InfoRow label="Status" value={state.anchored ? 'Anchored ✓' : 'Pending'} ok={state.anchored} />
        </div>

        {/* Price */}
        <div className="w-full flex items-baseline justify-between mt-4 pt-4 border-t"
          style={{ borderColor: 'hsl(var(--itx-border))' }}>
          <span className="font-mono text-[9px] tracking-[3px] uppercase"
            style={{ color: 'hsl(var(--itx-gold-muted) / 0.6)' }}>Total</span>
          <span className="font-playfair text-[22px] font-light"
            style={{ color: 'hsl(var(--itx-gold))' }}>€4.95</span>
        </div>

        {/* Pay button */}
        <button onClick={onPay}
          disabled={!state.anchored || redirecting}
          className="w-full mt-4 px-8 py-[11px] rounded-full font-playfair text-[17px] font-light disabled:opacity-40 transition-opacity"
          style={{
            border: '1px solid hsl(var(--itx-gold) / 0.3)',
            background: 'hsl(var(--itx-gold) / 0.08)',
            color: 'hsl(var(--itx-gold) / 0.8)',
          }}>
          {redirecting ? 'Opening…' : 'Continue to payment'}
        </button>

        <p className="font-mono text-[7px] tracking-[2px] uppercase mt-3"
          style={{ color: 'hsl(var(--itx-gold-muted) / 0.4)' }}>Secured by Stripe</p>
      </section>
    </main>
  );
}

function InfoRow({ label, value, ok = false, gold = false }: { label: string; value: string; ok?: boolean; gold?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-[10px] border-b"
      style={{ borderColor: 'hsl(var(--itx-border))' }}>
      <span className="font-garamond text-[13px]"
        style={{ color: 'hsl(var(--itx-cream) / 0.5)' }}>{label}</span>
      <span className="font-mono text-[10px] tracking-[1px]"
        style={{
          color: gold
            ? 'hsl(var(--itx-gold) / 0.7)'
            : ok
              ? 'hsl(var(--itx-success))'
              : 'hsl(var(--itx-gold-muted) / 0.5)',
        }}>{value}</span>
    </div>
  );
}
