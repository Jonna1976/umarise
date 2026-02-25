import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

/** V7 Hexagonal nail */
function V7Nail({ anchored }: { anchored: boolean }) {
  if (!anchored) {
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
  return (
    <svg viewBox="0 0 48 48" width="36" height="36"
      style={{ filter: 'drop-shadow(0 0 10px hsl(var(--itx-gold) / 0.35))' }}>
      <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="hsl(var(--itx-gold))" />
      <rect x="17" y="17" width="14" height="14" rx="1.8" fill="hsl(var(--itx-surface))" />
    </svg>
  );
}

export default function ItExistedProof() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProofState | null>(null);

  // Validate token format: must be 8 hex characters
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

  const createdAt = useMemo(() => (state ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const shareUrl = `${window.location.origin}/itexisted/proof/${token.toUpperCase()}`;

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
        <span className="font-garamond text-[16px]">Proof not found.</span>
      </main>
    );
  }

  const anchored = state.proofStatus === 'anchored';
  const date = createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const onShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'itexisted.app proof', text: `Origin ${state.shortToken}`, url: shareUrl }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
    toast.success('Proof URL copied.');
  };

  const onDownload = async () => {
    if (!anchored) { toast.info('Proof is still pending.'); return; }
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

  const onAttestation = () => navigate(`/itexisted/attestation/${state.shortToken}`);

  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'hsl(var(--itx-bg))' }}>
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center"
        style={{ maxWidth: 320 }}>

        {/* V7 nail */}
        <V7Nail anchored={anchored} />

        {/* Anchor wire */}
        <div className="w-px h-4"
          style={{
            background: anchored
              ? 'linear-gradient(to bottom, hsl(var(--itx-gold) / 0.5), hsl(var(--itx-gold) / 0.15))'
              : 'linear-gradient(to bottom, hsl(var(--itx-gold) / 0.25), hsl(var(--itx-gold) / 0.08))',
          }} />

        {/* Golden frame */}
        <div className="mb-5 p-2 rounded-[3px]"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--itx-gold) / 0.22), hsl(var(--itx-gold) / 0.12) 30%, hsl(var(--itx-gold) / 0.18) 70%, hsl(var(--itx-gold) / 0.15))',
            boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 20px hsl(var(--itx-gold) / 0.08), inset 0 0 0 2px hsl(var(--itx-gold) / 0.25), inset 0 0 0 3px hsl(var(--itx-surface) / 0.5), inset 0 0 0 4px hsl(var(--itx-gold) / 0.1)',
            opacity: anchored ? 1 : 0.9,
          }}>
          <div className="p-1 border"
            style={{ borderColor: 'hsl(var(--itx-gold) / 0.15)', background: 'hsl(var(--itx-surface) / 0.95)' }}>
            <div className="w-[220px] h-[180px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D1B0E, #1A2E1A, #1B1B2E)' }}>
              <span className="font-garamond italic text-[13px]"
                style={{ color: 'hsl(var(--itx-gold) / 0.2)' }}>[ origin ]</span>
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

        {/* Proof components line */}
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.35)' }}>certificate</span>
          <span className="w-[3px] h-[3px] rounded-full"
            style={{ background: 'hsl(var(--itx-gold) / 0.2)' }} />
          <span className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.35)' }}>hash</span>
          {anchored ? (
            <span className="w-[3px] h-[3px] rounded-full"
              style={{ background: 'hsl(var(--itx-gold) / 0.2)' }} />
          ) : (
            <motion.span className="w-[3px] h-[3px] rounded-full"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ background: 'hsl(var(--itx-gold) / 0.4)' }} />
          )}
          <span className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.35)', opacity: anchored ? 1 : 0.6 }}>proof.ots</span>
        </div>

        {/* Primary action: Share */}
        <button onClick={onShare}
          className="px-10 py-[11px] rounded-full font-playfair text-[17px] font-light mb-3"
          style={{
            border: '1px solid hsl(var(--itx-gold) / 0.3)',
            background: 'hsl(var(--itx-gold) / 0.08)',
            color: 'hsl(var(--itx-gold) / 0.8)',
          }}>
          Share
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-4 mt-2">
          <button onClick={onDownload}
            className="font-mono text-[9px] tracking-[1px] uppercase"
            style={{ color: 'hsl(var(--itx-cream) / 0.25)' }}>
            Download
          </button>
          <span style={{ color: 'hsl(var(--itx-cream) / 0.1)' }}>·</span>
          <button onClick={() => navigate('/itexisted/verify')}
            className="font-mono text-[9px] tracking-[1px] uppercase"
            style={{ color: 'hsl(var(--itx-cream) / 0.25)' }}>
            Verify
          </button>
        </div>

        {/* Attestation link — only when anchored */}
        {anchored && (
          <button onClick={onAttestation}
            className="mt-6 font-garamond italic text-[13px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.4)' }}>
            Add attestation →
          </button>
        )}

        {/* Device signed indicator */}
        <div className="flex items-center gap-[6px] mt-4">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 6L5 9L10 3" fill="none" stroke="hsl(var(--itx-gold) / 0.35)"
              strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'hsl(var(--itx-gold) / 0.25)' }}>device signed</span>
        </div>
      </motion.section>
    </main>
  );
}
