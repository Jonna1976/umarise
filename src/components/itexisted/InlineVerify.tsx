import { useState, useCallback } from 'react';
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

async function extractHash(file: File): Promise<string | null> {
  if (file.name.toLowerCase().endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);
    const cert = zip.file('certificate.json');
    if (cert) {
      const parsed = JSON.parse(await cert.async('text')) as { hash?: string };
      return parsed.hash?.replace(/^sha256:/, '') ?? null;
    }
  }
  return sha256FromBuffer(await file.arrayBuffer());
}

export default function InlineVerify() {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setBusy(true);
    setNotFound(false);
    setResult(null);
    setFileName(file.name);
    const hash = await extractHash(file);
    if (!hash) { setBusy(false); return; }

    const verify = await verifyOriginByHash(hash);
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
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

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
      {/* Drop zone with real drag & drop */}
      <label
        className="block w-full rounded-[8px] border-dashed border-[1.5px] p-6 text-center cursor-pointer mb-3 transition-all"
        style={{
          borderColor: dragOver ? 'rgba(201,169,110,0.6)' : 'rgba(201,169,110,0.25)',
          background: dragOver ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.03)',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input type="file" className="hidden" accept="*/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
          style={{ color: 'rgba(201,169,110,0.5)' }}>
          {dragOver ? 'Release to verify' : 'Drop file or ZIP here'}
        </p>
        <p className="font-garamond italic text-[12px]"
          style={{ color: 'rgba(240,234,214,0.2)' }}>or tap to choose</p>
      </label>

      {busy && (
        <p className="font-mono text-[8px] tracking-[2px] uppercase mb-2"
          style={{ color: 'rgba(240,234,214,0.3)' }}>
          Verifying {fileName ? `"${fileName}"` : ''}…
        </p>
      )}

      {notFound && !busy && (
        <p className="font-garamond text-[13px] mb-2"
          style={{ color: 'rgba(240,234,214,0.3)' }}>
          No matching origin found in the registry.
        </p>
      )}

      {result && (
        <div className="w-full rounded-[8px] border p-3 mt-1"
          style={{ borderColor: 'rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.03)' }}>
          <Row label="Origin ID" value={result.shortToken} gold />
          <Row label="Hash match" value="✓ confirmed" ok />
          <Row label="Date" value={result.date} />
          <Row label="Time" value={result.time} />
          <Row label="Bitcoin" value={result.bitcoin} ok={result.bitcoinOk} last />
        </div>
      )}

      <button onClick={() => { setExpanded(false); setResult(null); setNotFound(false); setFileName(null); }}
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
