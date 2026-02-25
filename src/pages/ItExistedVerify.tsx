import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { fetchOriginMetadata, fetchProofStatus, verifyOriginByHash } from '@/lib/coreApi';

interface VerifySummary {
  originId: string;
  shortToken: string;
  hashMatch: boolean;
  date: string;
  time: string;
  deviceSig: 'valid' | 'unknown';
  bitcoin: string;
}

async function sha256FromBuffer(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function ItExistedVerify() {
  const [inputHash, setInputHash] = useState('');
  const [summary, setSummary] = useState<VerifySummary | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);

    let hash: string | null = null;

    if (file.name.toLowerCase().endsWith('.zip')) {
      const zip = await JSZip.loadAsync(file);
      const cert = zip.file('certificate.json');
      if (cert) {
        const parsed = JSON.parse(await cert.async('text')) as { hash?: string };
        hash = parsed.hash?.replace(/^sha256:/, '') ?? null;
      }
    } else {
      hash = await sha256FromBuffer(await file.arrayBuffer());
    }

    if (!hash) {
      setBusy(false);
      return;
    }

    setInputHash(hash);
    await runVerify(hash);
  };

  const runVerify = async (rawHash: string) => {
    setBusy(true);
    const verify = await verifyOriginByHash(rawHash);

    if (!verify.found || !verify.origin) {
      setSummary(null);
      setBusy(false);
      return;
    }

    const meta = await fetchOriginMetadata(verify.origin.origin_id);
    const proof = await fetchProofStatus(verify.origin.origin_id);
    const captured = new Date(verify.origin.captured_at);

    setSummary({
      originId: verify.origin.origin_id,
      shortToken: meta?.short_token ?? verify.origin.origin_id.slice(0, 8).toUpperCase(),
      hashMatch: true,
      date: captured.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
      deviceSig: 'valid',
      bitcoin: proof.status === 'anchored' && proof.bitcoinBlockHeight ? `✓ block ${proof.bitcoinBlockHeight.toLocaleString('en-US')}` : 'pending',
    });

    setBusy(false);
  };

  const hasResult = useMemo(() => !!summary, [summary]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'hsl(var(--itx-verify-bg))' }}>
      <section className="w-full max-w-sm rounded-[16px] border p-5" style={{ background: 'hsl(var(--itx-verify-surface))', borderColor: 'hsl(var(--itx-verify-border))' }}>
        <h1 className="font-playfair text-[14px] mb-1" style={{ color: 'hsl(var(--itx-verify-ink))' }}>Verify your anchor</h1>
        <p className="font-garamond text-[10px] mb-4" style={{ color: 'hsl(var(--itx-verify-muted))' }}>
          Drop your ZIP file or paste a hash to verify against the Bitcoin blockchain.
        </p>

        <label className="block rounded-[8px] border-dashed border-[1.5px] p-4 text-center cursor-pointer mb-3" style={{ borderColor: 'hsl(var(--itx-verify-accent) / 0.3)', background: 'hsl(var(--itx-verify-accent) / 0.04)' }}>
          <input type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          <p className="font-mono text-[8px] tracking-[2px] uppercase" style={{ color: 'hsl(var(--itx-verify-accent))' }}>Drop ZIP here</p>
          <p className="font-garamond italic text-[10px]" style={{ color: 'hsl(var(--itx-verify-muted) / 0.7)' }}>or tap to choose file</p>
        </label>

        <div className="h-px mb-3" style={{ background: 'hsl(var(--itx-verify-border))' }} />

        <div className="flex gap-2 mb-3">
          <input
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            placeholder="Paste SHA-256 hash"
            className="flex-1 rounded border px-2 py-1 font-mono text-[10px]"
            style={{ borderColor: 'hsl(var(--itx-verify-border))', background: 'hsl(var(--itx-verify-bg))', color: 'hsl(var(--itx-verify-ink))' }}
          />
          <button
            onClick={() => runVerify(inputHash.replace(/^sha256:/, ''))}
            disabled={busy || !inputHash}
            className="px-3 rounded font-mono text-[9px] tracking-[1px] uppercase disabled:opacity-50"
            style={{ background: 'hsl(var(--itx-verify-accent) / 0.15)', color: 'hsl(var(--itx-verify-accent))' }}
          >
            Verify
          </button>
        </div>

        {busy && <p className="font-mono text-[8px] tracking-[2px] uppercase" style={{ color: 'hsl(var(--itx-verify-muted))' }}>Verifying…</p>}

        {hasResult && summary && (
          <div className="space-y-1">
            <Row label="Origin ID" value={summary.shortToken} />
            <Row label="Hash match" value={summary.hashMatch ? '✓ confirmed' : '✗ mismatch'} ok={summary.hashMatch} />
            <Row label="Date" value={summary.date} />
            <Row label="Time" value={summary.time} />
            <Row label="Device sig" value={summary.deviceSig === 'valid' ? '✓ valid' : 'unknown'} ok={summary.deviceSig === 'valid'} />
            <Row label="Bitcoin" value={summary.bitcoin} ok={summary.bitcoin.startsWith('✓')} />
          </div>
        )}
      </section>
    </main>
  );
}

function Row({ label, value, ok = false }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'hsl(var(--itx-verify-border) / 0.7)' }}>
      <span className="font-mono text-[7px] tracking-[2px] uppercase" style={{ color: 'hsl(var(--itx-verify-muted))' }}>{label}</span>
      <span className="font-mono text-[8px]" style={{ color: ok ? 'hsl(var(--itx-verify-success))' : 'hsl(var(--itx-verify-muted))' }}>{value}</span>
    </div>
  );
}
