import { useState } from 'react';
import JSZip from 'jszip';
import { fetchOriginMetadata, fetchProofStatus, verifyOriginByHash } from '@/lib/coreApi';

interface VerifyResult {
  shortToken: string;
  hashMatch: boolean;
  date: string;
  time: string;
  bitcoin: string;
  bitcoinOk: boolean;
}

async function sha256FromBuffer(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function InlineVerify() {
  const [expanded, setExpanded] = useState(false);
  const [inputHash, setInputHash] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setNotFound(false);
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
    if (!hash) { setBusy(false); return; }
    setInputHash(hash);
    await runVerify(hash);
  };

  const runVerify = async (rawHash: string) => {
    setBusy(true);
    setNotFound(false);
    const verify = await verifyOriginByHash(rawHash);
    if (!verify.found || !verify.origin) {
      setResult(null);
      setNotFound(true);
      setBusy(false);
      return;
    }
    const meta = await fetchOriginMetadata(verify.origin.origin_id);
    const proof = await fetchProofStatus(verify.origin.origin_id);
    const captured = new Date(verify.origin.captured_at);
    const btcOk = proof.status === 'anchored' && !!proof.bitcoinBlockHeight;
    setResult({
      shortToken: meta?.short_token ?? verify.origin.origin_id.slice(0, 8).toUpperCase(),
      hashMatch: true,
      date: captured.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
      bitcoin: btcOk ? `✓ block ${proof.bitcoinBlockHeight!.toLocaleString('en-US')}` : 'pending',
      bitcoinOk: btcOk,
    });
    setBusy(false);
  };

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="font-mono text-[9px] tracking-[3px] uppercase transition-colors"
        style={{ color: 'rgba(240,234,214,0.35)' }}>
        Verify
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Drop zone */}
      <label className="block w-full rounded-[8px] border-dashed border-[1.5px] p-5 text-center cursor-pointer mb-3 transition-colors hover:border-solid"
        style={{
          borderColor: 'rgba(201,169,110,0.25)',
          background: 'rgba(201,169,110,0.03)',
        }}>
        <input type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
          style={{ color: 'rgba(201,169,110,0.5)' }}>Drop file or ZIP here</p>
        <p className="font-garamond italic text-[12px]"
          style={{ color: 'rgba(240,234,214,0.2)' }}>or tap to choose</p>
      </label>

      {/* Hash input */}
      <div className="flex gap-2 w-full mb-3">
        <input
          value={inputHash}
          onChange={(e) => setInputHash(e.target.value)}
          placeholder="Paste SHA-256 hash"
          className="flex-1 rounded-[6px] border px-3 py-2 font-mono text-[11px]"
          style={{
            borderColor: 'rgba(201,169,110,0.15)',
            background: 'rgba(201,169,110,0.03)',
            color: 'rgba(240,234,214,0.7)',
          }}
        />
        <button
          onClick={() => runVerify(inputHash.replace(/^sha256:/, ''))}
          disabled={busy || !inputHash}
          className="px-3 py-2 rounded-[6px] font-mono text-[9px] tracking-[1px] uppercase disabled:opacity-40 transition-opacity"
          style={{
            background: 'rgba(201,169,110,0.1)',
            color: 'rgba(201,169,110,0.6)',
          }}>
          Verify
        </button>
      </div>

      {busy && (
        <p className="font-mono text-[8px] tracking-[2px] uppercase mb-2"
          style={{ color: 'rgba(240,234,214,0.3)' }}>Verifying…</p>
      )}

      {notFound && !busy && (
        <p className="font-garamond text-[13px] mb-2"
          style={{ color: 'rgba(240,234,214,0.3)' }}>
          No matching origin found.
        </p>
      )}

      {result && (
        <div className="w-full rounded-[8px] border p-3 mt-1"
          style={{ borderColor: 'rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.03)' }}>
          <Row label="Origin ID" value={result.shortToken} gold />
          <Row label="Hash match" value={result.hashMatch ? '✓ confirmed' : '✗ mismatch'} ok={result.hashMatch} />
          <Row label="Date" value={result.date} />
          <Row label="Time" value={result.time} />
          <Row label="Bitcoin" value={result.bitcoin} ok={result.bitcoinOk} last />
        </div>
      )}

      <button onClick={() => { setExpanded(false); setResult(null); setNotFound(false); }}
        className="font-mono text-[8px] tracking-[2px] uppercase mt-3 transition-colors"
        style={{ color: 'rgba(240,234,214,0.2)' }}>
        Close
      </button>
    </div>
  );
}

function Row({ label, value, ok = false, gold = false, last = false }: { label: string; value: string; ok?: boolean; gold?: boolean; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${last ? '' : 'border-b'}`}
      style={{ borderColor: 'rgba(201,169,110,0.1)' }}>
      <span className="font-mono text-[8px] tracking-[2px] uppercase"
        style={{ color: 'rgba(240,234,214,0.3)' }}>{label}</span>
      <span className="font-mono text-[9px]"
        style={{ color: gold ? 'rgba(201,169,110,0.6)' : ok ? '#7fba6a' : 'rgba(240,234,214,0.35)' }}>{value}</span>
    </div>
  );
}
