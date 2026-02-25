import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchOriginByToken, fetchProofStatus, startAttestationCheckout } from '@/lib/coreApi';
import { getActiveDeviceId } from '@/lib/deviceId';

interface AttestationViewState {
  originId: string;
  shortToken: string;
  date: string;
  block: number | null;
  anchored: boolean;
}

export default function ItExistedAttestation() {
  const { token = '' } = useParams();
  const [state, setState] = useState<AttestationViewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    (async () => {
      const resolved = await fetchOriginByToken(token);
      if (!resolved) {
        setState(null);
        setLoading(false);
        return;
      }

      const proof = await fetchProofStatus(resolved.origin_id);
      const date = new Date(resolved.captured_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      setState({
        originId: resolved.origin_id,
        shortToken: resolved.short_token ?? token.toUpperCase(),
        date,
        block: proof.bitcoinBlockHeight,
        anchored: proof.status === 'anchored',
      });
      setLoading(false);
    })();
  }, [token]);

  const onPay = async () => {
    if (!state?.anchored) return;
    const deviceId = getActiveDeviceId();
    if (!deviceId) {
      toast.error('Device not ready.');
      return;
    }

    setRedirecting(true);
    const checkout = await startAttestationCheckout(state.originId, deviceId);
    if (!checkout) {
      toast.error('Could not open payment.');
      setRedirecting(false);
      return;
    }

    window.location.href = checkout.url;
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--itx-bg))', color: 'hsl(var(--itx-cream) / 0.7)' }}>Loading…</main>;
  }

  if (!state) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--itx-bg))', color: 'hsl(var(--itx-cream) / 0.7)' }}>Origin not found.</main>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'hsl(var(--itx-bg))' }}>
      <section className="w-full max-w-sm rounded-[28px] border p-5" style={{ background: 'hsl(var(--itx-surface))', borderColor: 'hsl(var(--itx-border))' }}>
        <h1 className="font-playfair text-[14px] mb-1" style={{ color: 'hsl(var(--itx-cream))' }}>Layer 3 attestation</h1>
        <p className="font-garamond text-[10px] mb-3" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>A notary reinforces your anchor with an independent certified statement.</p>

        <div className="h-px mb-2" style={{ background: 'hsl(var(--itx-border))' }} />
        <InfoRow label="Origin" value={state.shortToken} />
        <InfoRow label="Anchored" value={state.date} />
        <InfoRow label="Bitcoin block" value={state.block ? state.block.toLocaleString('en-US') : 'pending'} />
        <InfoRow label="Status" value={state.anchored ? 'Anchored ✓' : 'Pending'} ok={state.anchored} />

        <div className="mt-3 pt-3 border-t flex items-baseline justify-between" style={{ borderColor: 'hsl(var(--itx-border))' }}>
          <span className="font-mono text-[9px] tracking-[3px] uppercase" style={{ color: 'hsl(var(--itx-muted))' }}>Total</span>
          <span className="font-playfair text-[18px]" style={{ color: 'hsl(var(--itx-gold))' }}>€4.95</span>
        </div>

        <button
          onClick={onPay}
          disabled={!state.anchored || redirecting}
          className="w-full mt-3 rounded-full py-2.5 font-garamond text-[14px] disabled:opacity-40"
          style={{ background: 'hsl(var(--itx-gold) / 0.08)', color: 'hsl(var(--itx-gold))', border: '1px solid hsl(var(--itx-gold) / 0.3)' }}
        >
          {redirecting ? 'Opening…' : 'Continue to payment'}
        </button>

        <p className="font-mono text-[7px] tracking-[2px] uppercase text-center mt-2" style={{ color: 'hsl(var(--itx-muted) / 0.7)' }}>Secured by Stripe</p>
      </section>
    </main>
  );
}

function InfoRow({ label, value, ok = false }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="py-2 border-b flex justify-between items-baseline" style={{ borderColor: 'hsl(var(--itx-border))' }}>
      <span className="font-garamond text-[12px]" style={{ color: 'hsl(var(--itx-cream) / 0.7)' }}>{label}</span>
      <span className="font-mono text-[8px]" style={{ color: ok ? 'hsl(var(--itx-success))' : 'hsl(var(--itx-muted))' }}>{value}</span>
    </div>
  );
}
