import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { buildOriginZip } from '@/lib/originZip';
import { arrayBufferToBase64, fetchOriginByToken, fetchProofStatus, startAttestationCheckout } from '@/lib/coreApi';
import { getActiveDeviceId } from '@/lib/deviceId';

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

  const load = async () => {
    const resolved = await fetchOriginByToken(token);
    if (!resolved) {
      setState(null);
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (!state || state.proofStatus === 'anchored') return;
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [state?.proofStatus, token]);

  const createdAt = useMemo(() => (state ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const shareUrl = `${window.location.origin}/itexisted/proof/${token.toUpperCase()}`;

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--itx-bg))', color: 'hsl(var(--itx-cream) / 0.7)' }}>Loading proof…</main>;
  }

  if (!state) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--itx-bg))', color: 'hsl(var(--itx-cream) / 0.7)' }}>Proof not found.</main>;
  }

  const onDownload = async () => {
    if (state.proofStatus !== 'anchored') {
      toast.info('Proof is still pending.');
      return;
    }

    const proof = await fetchProofStatus(state.originId);
    if (proof.status !== 'anchored' || !proof.otsProofBytes) {
      toast.error('Proof download is not ready yet.');
      return;
    }

    const zip = await buildOriginZip({
      originId: state.originId,
      hash: state.hash,
      timestamp: new Date(state.capturedAt),
      imageUrl: null,
      otsProof: arrayBufferToBase64(proof.otsProofBytes),
    });

    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = `origin-${state.shortToken}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const onShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'itexisted.app proof', text: `Origin ${state.shortToken}`, url: shareUrl }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    toast.success('Proof URL copied.');
  };

  const onAttestation = async () => {
    if (state.proofStatus !== 'anchored') return;
    const deviceId = getActiveDeviceId();
    if (!deviceId) {
      toast.error('Device ID unavailable.');
      return;
    }

    const checkout = await startAttestationCheckout(state.originId, deviceId);
    if (!checkout) {
      toast.error('Could not start attestation checkout.');
      return;
    }

    window.location.href = checkout.url;
  };

  const expiry = new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'hsl(var(--itx-bg))' }}>
      <section className="w-full max-w-sm rounded-[28px] border px-5 py-8" style={{ background: 'hsl(var(--itx-surface))', borderColor: 'hsl(var(--itx-border))' }}>
        <p className="font-mono text-[7px] tracking-[3px] uppercase" style={{ color: 'hsl(var(--itx-muted))' }}>Origin ID</p>
        <p className="font-mono text-[13px] tracking-[4px] mb-1" style={{ color: 'hsl(var(--itx-gold))' }}>{state.shortToken}</p>
        <p className="font-garamond text-[12px] mb-3" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>
          {createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div className="h-px mb-3" style={{ background: 'hsl(var(--itx-border))' }} />

        <div className="flex items-center gap-2 mb-5">
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: state.proofStatus === 'anchored' ? 'hsl(var(--itx-success))' : 'hsl(var(--itx-gold))', boxShadow: state.proofStatus === 'anchored' ? 'none' : '0 0 12px hsl(var(--itx-gold) / 0.35)' }} />
          <span className="font-mono text-[8px] tracking-[2px] uppercase flex-1" style={{ color: state.proofStatus === 'anchored' ? 'hsl(var(--itx-success))' : 'hsl(var(--itx-gold))' }}>
            {state.proofStatus === 'anchored' ? 'Anchored in Bitcoin' : 'Proof pending'}
          </span>
          <span className="font-mono text-[8px]" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>{state.bitcoinBlockHeight ? state.bitcoinBlockHeight.toLocaleString('en-US') : '—'}</span>
        </div>

        <div className="space-y-0">
          <button onClick={onDownload} className="w-full py-2 border-b flex justify-between" style={{ borderColor: 'hsl(var(--itx-border))' }}><span className="font-playfair text-[14px]" style={{ color: 'hsl(var(--itx-cream))' }}>Download</span><span className="font-mono text-[7px] tracking-[1px] uppercase" style={{ color: 'hsl(var(--itx-muted))' }}>→ Files</span></button>
          <button onClick={onShare} className="w-full py-2 border-b flex justify-between" style={{ borderColor: 'hsl(var(--itx-border))' }}><span className="font-playfair text-[14px]" style={{ color: 'hsl(var(--itx-cream))' }}>Share</span><span className="font-mono text-[7px] tracking-[1px] uppercase" style={{ color: 'hsl(var(--itx-muted))' }}>→ Mail · Messages</span></button>
          <button onClick={() => navigate('/itexisted/verify')} className="w-full py-2 border-b flex justify-between" style={{ borderColor: 'hsl(var(--itx-border))' }}><span className="font-playfair text-[14px]" style={{ color: 'hsl(var(--itx-cream))' }}>Verify</span><span className="font-mono text-[7px] tracking-[1px] uppercase" style={{ color: 'hsl(var(--itx-muted))' }}>→ /verify</span></button>
          <button onClick={onAttestation} disabled={state.proofStatus !== 'anchored'} className="w-full py-2 flex justify-between disabled:opacity-40"><span className="font-playfair text-[14px]" style={{ color: 'hsl(var(--itx-gold))' }}>Request attestation</span><span className="font-mono text-[7px] tracking-[1px] uppercase" style={{ color: 'hsl(var(--itx-gold) / 0.5)' }}>→ Stripe · €4.95</span></button>
        </div>

        <p className="font-garamond italic text-[9px] mt-4" style={{ color: 'hsl(var(--itx-cream) / 0.12)' }}>
          Download link expires {expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. The Bitcoin anchor is permanent.
        </p>
      </section>
    </main>
  );
}
