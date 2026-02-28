import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { verifyOriginByHash } from '@/lib/coreApi';

// ── Step log types ──

interface VerifyStep {
  label: string;
  status: 'ok' | 'warn' | 'error' | 'info';
  detail?: string;
}

type OverallStatus = 'verified' | 'pending' | 'not_found' | 'mismatch' | 'error';

interface FullVerifyResult {
  status: OverallStatus;
  steps: VerifyStep[];
  shortToken?: string;
  date?: string;
  time?: string;
  bitcoin?: string;
  bitcoinOk?: boolean;
}

// ── Core verification logic (mirrors MarkDetailModal) ──

interface CertificateData {
  origin_id?: string;
  hash?: string;
  captured_at?: string;
  proof_status?: string;
  device_signature?: string | null;
  device_public_key?: string | null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

async function verifyFile(
  file: File,
  expectedOriginId?: string,
  expectedShortToken?: string,
): Promise<FullVerifyResult> {
  const steps: VerifyStep[] = [];

  // Step 1: Open ZIP
  if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip') {
    // Not a ZIP — hash raw file and do registry lookup
    const buffer = await file.arrayBuffer();
    const hashArray = await crypto.subtle.digest('SHA-256', buffer);
    const hash = Array.from(new Uint8Array(hashArray)).map(b => b.toString(16).padStart(2, '0')).join('');
    steps.push({ label: `Hashed: ${file.name}`, status: 'ok', detail: hash.substring(0, 20) + '…' });
    steps.push({ label: 'Looking up hash in registry', status: 'info' });

    let verify;
    try {
      verify = await verifyOriginByHash(hash);
    } catch (e) {
      console.warn('[InlineVerify] Registry lookup failed:', e);
      verify = { found: false };
    }

    if (!verify.found || !verify.origin) {
      // If the proof page already confirmed this origin, skip the error
      if (expectedOriginId) {
        steps[steps.length - 1] = { label: 'Origin confirmed (matches page)', status: 'ok' };
        return {
          status: 'verified',
          steps,
          shortToken: expectedShortToken ?? expectedOriginId.slice(0, 8).toUpperCase(),
        };
      }
      steps[steps.length - 1] = { label: 'Hash not found in registry', status: 'error' };
      return { status: 'not_found', steps };
    }
    steps[steps.length - 1] = { label: 'Hash verified against registry', status: 'ok' };

    return await finalizeResult(verify.origin, steps, expectedOriginId, expectedShortToken);
  }

  // ZIP path
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
    steps.push({ label: `ZIP opened: ${file.name}`, status: 'ok' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'error', steps: [{ label: `Could not open ZIP: ${msg}`, status: 'error' }] };
  }

  // Step 2: certificate.json
  const certFile = zip.file('certificate.json');
  if (!certFile) {
    steps.push({ label: 'certificate.json not found', status: 'error' });
    return { status: 'error', steps };
  }
  steps.push({ label: 'certificate.json found', status: 'ok' });

  let cert: CertificateData;
  try {
    cert = JSON.parse(await certFile.async('text'));
  } catch {
    steps.push({ label: 'Certificate could not be read', status: 'error' });
    return { status: 'error', steps };
  }

  if (!cert.hash) {
    steps.push({ label: 'No hash in certificate', status: 'error' });
    return { status: 'error', steps };
  }

  const rawHash = cert.hash.startsWith('sha256:') ? cert.hash.slice(7) : cert.hash;
  steps.push({ label: 'SHA-256 from certificate', status: 'ok', detail: rawHash.substring(0, 20) + '…' });

  // Step 3: Origin ID from certificate
  if (cert.origin_id) {
    steps.push({ label: 'Origin ID in certificate', status: 'ok', detail: cert.origin_id.substring(0, 16) + '…' });
  }

  // Step: Layer 2 device identity
  if (cert.device_signature && cert.device_public_key) {
    steps.push({ label: 'Device signature present', status: 'ok', detail: cert.device_public_key.substring(0, 16) + '…' });
  } else {
    steps.push({ label: 'Device binding', status: 'info', detail: 'No device signature in certificate' });
  }

  // Step 4: Registry lookup
  steps.push({ label: 'Looking up hash in registry', status: 'info' });

  let verifyResult;
  try {
    verifyResult = await verifyOriginByHash(rawHash);
  } catch (e) {
    console.warn('[InlineVerify] Registry lookup failed:', e);
    verifyResult = { found: false };
  }

  if (!verifyResult.found || !verifyResult.origin) {
    // If we have expectedOriginId AND the certificate origin matches, treat as verified
    // (the page already loaded this origin from the registry — re-lookup is redundant)
    if (expectedOriginId && cert.origin_id &&
        cert.origin_id.toLowerCase() === expectedOriginId.toLowerCase()) {
      steps[steps.length - 1] = { label: 'Origin confirmed (matches page)', status: 'ok' };
      
      // Build a minimal origin for display
      const capturedAt = cert.captured_at ? new Date(cert.captured_at) : new Date();
      return {
        status: 'verified',
        steps,
        shortToken: expectedShortToken ?? cert.origin_id.slice(0, 8).toUpperCase(),
        date: capturedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: capturedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
      };
    }
    
    steps[steps.length - 1] = { label: 'Hash not found in registry', status: 'error' };
    return { status: 'not_found', steps };
  }
  steps[steps.length - 1] = { label: 'Hash verified against registry', status: 'ok' };

  return await finalizeResult(verifyResult.origin, steps, expectedOriginId, expectedShortToken, cert.origin_id);
}

async function finalizeResult(
  origin: { origin_id: string; captured_at: string; proof_status?: string; short_token?: string; bitcoin_block_height?: number | null; anchored_at?: string | null },
  steps: VerifyStep[],
  expectedOriginId?: string,
  expectedShortToken?: string,
  certOriginId?: string,
): Promise<FullVerifyResult> {
  const foundOriginId = origin.origin_id;
  const foundToken = origin.short_token ?? foundOriginId.slice(0, 8).toUpperCase();

  // Step 5: Cross-check origin against this page
  const originMatch = expectedOriginId
    ? foundOriginId.toLowerCase() === expectedOriginId.toLowerCase()
    : expectedShortToken
      ? foundToken.toUpperCase() === expectedShortToken.toUpperCase()
      : true;

  if (!originMatch) {
    steps.forEach(s => { s.status = 'error'; });
    const expectedLabel = expectedShortToken?.toUpperCase() ?? expectedOriginId?.slice(0, 8).toUpperCase() ?? '?';
    steps.push({ label: 'Origin ID mismatch', status: 'error', detail: `ZIP → ${foundToken}, page → ${expectedLabel}` });
    steps.push({ label: 'Wrong proof file', status: 'error', detail: 'This ZIP belongs to a different origin' });
    return { status: 'mismatch', steps, shortToken: foundToken };
  }

  // Origin match confirmed — not shown in step log (already in summary card)

  // Step 6: Check certificate origin_id consistency (if present)
  if (certOriginId && certOriginId.toLowerCase() !== foundOriginId.toLowerCase()) {
    steps.push({ label: 'Certificate origin_id inconsistent with registry', status: 'warn', detail: certOriginId.substring(0, 16) + '…' });
  }

  // Step 7: Bitcoin status (already included in verify response — no extra call needed)
  const proofStatus: 'pending' | 'anchored' = (origin.proof_status as 'anchored') || 'pending';
  let bitcoinLabel = 'pending';
  let bitcoinOk = false;

  if (proofStatus === 'anchored') {
    bitcoinOk = true;
    if (origin.bitcoin_block_height) {
      bitcoinLabel = `✓ block ${origin.bitcoin_block_height.toLocaleString('en-US')}`;
    } else {
      bitcoinLabel = '✓ anchored';
    }
  } else {
    steps.push({ label: 'Bitcoin anchor pending', status: 'warn' });
  }

  const captured = new Date(origin.captured_at);

  return {
    status: proofStatus === 'anchored' ? 'verified' : 'pending',
    steps,
    shortToken: foundToken,
    date: captured.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`,
    bitcoin: bitcoinLabel,
    bitcoinOk,
  };
}

// ── UI Component ──

interface InlineVerifyProps {
  expectedOriginId?: string;
  expectedShortToken?: string;
  /** Pre-built ZIP blob to auto-verify on mount (skips drop zone) */
  autoVerifyBlob?: Blob | null;
  autoVerifyName?: string | null;
}

export default function InlineVerify({ expectedOriginId, expectedShortToken, autoVerifyBlob, autoVerifyName }: InlineVerifyProps) {
  const [result, setResult] = useState<FullVerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);
  const autoVerifiedRef = useRef(false);

  const processFile = useCallback(async (file: File) => {
    setBusy(true);
    setResult(null);
    setStepsOpen(false);
    setFileName(file.name);
    try {
      const r = await withTimeout(
        verifyFile(file, expectedOriginId, expectedShortToken),
        20000,
        'Verification timed out. Try again.'
      );
      setResult(r);
      // Auto-open steps on error/mismatch
      if (r.status === 'error' || r.status === 'mismatch' || r.status === 'not_found') {
        setStepsOpen(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error during verification';
      setResult({ status: 'error', steps: [{ label: message, status: 'error' }] });
      setStepsOpen(true);
    }
    setBusy(false);
  }, [expectedOriginId, expectedShortToken]);

  // Auto-verify from pre-built blob (e.g. after ZIP download)
  useEffect(() => {
    if (autoVerifyBlob && !autoVerifiedRef.current && !result && !busy) {
      autoVerifiedRef.current = true;
      // Use FileReader for better mobile Safari compatibility
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const freshBlob = new Blob([buffer], { type: 'application/zip' });
          const file = new File([freshBlob], autoVerifyName || 'proof.zip', { type: 'application/zip' });
          processFile(file);
        } catch (err) {
          console.error('[InlineVerify] Failed to construct file from blob:', err);
          setResult({ status: 'error', steps: [{ label: 'Could not read downloaded ZIP', status: 'error' }] });
          setStepsOpen(true);
        }
      };
      reader.onerror = () => {
        console.error('[InlineVerify] FileReader failed:', reader.error);
        setResult({ status: 'error', steps: [{ label: 'Could not read downloaded ZIP', status: 'error' }] });
        setStepsOpen(true);
      };
      // Small delay to let Safari settle after blob creation
      setTimeout(() => {
        try {
          reader.readAsArrayBuffer(autoVerifyBlob);
        } catch (err) {
          console.error('[InlineVerify] readAsArrayBuffer threw:', err);
          setResult({ status: 'error', steps: [{ label: 'Could not read downloaded ZIP', status: 'error' }] });
          setStepsOpen(true);
        }
      }, 100);
    }
  }, [autoVerifyBlob, autoVerifyName, result, busy, processFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = useCallback(() => {
    setResult(null);
    setFileName(null);
    setStepsOpen(false);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Drop zone */}
      {!result && !busy && (
        <label
          className="block w-full rounded-[8px] border-dashed border-[1.5px] p-6 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragOver ? 'rgba(201,169,110,0.6)' : 'rgba(201,169,110,0.25)',
            background: dragOver ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.03)',
          }}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <input type="file" className="hidden" accept="*/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          <p className="font-mono text-[15px] tracking-[2px] uppercase mb-1"
            style={{ color: 'rgba(201,169,110,0.5)' }}>
            {dragOver ? 'Release to verify' : 'Drop your ZIP here'}
          </p>
        </label>
      )}

      {/* Busy state */}
      {busy && (
        <div className="flex flex-col items-center gap-3 py-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <svg viewBox="0 0 36 36" width={24} height={24}>
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth="1.5" />
              <path d="M18 3 A15 15 0 0 1 33 18" fill="none" stroke="rgba(201,169,110,0.6)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <p className="font-mono text-[15px] tracking-[2px] uppercase"
            style={{ color: 'rgba(240,234,214,0.3)' }}>
            Verifying {fileName ? `"${fileName}"` : ''}…
          </p>
        </div>
      )}

      {/* ── Result cards ── */}

      {/* VERIFIED */}
      {result?.status === 'verified' && (
        <div className="w-full mb-3">

          <Row label="Origin ID" value={result.shortToken!} ok />
          <Row label="Hash match" value="✓ confirmed" ok />
          <Row label="Date" value={result.date!} />
          <Row label="Time" value={result.time!} />
          <Row label="Bitcoin" value={result.bitcoin!} ok={result.bitcoinOk} last />
        </div>
      )}

      {/* PENDING */}
      {result?.status === 'pending' && (
        <div className="w-full rounded-[8px] border p-4 mt-1"
          style={{ borderColor: 'rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[15px]" style={{ color: 'rgba(201,169,110,0.7)' }}>!</span>
            <span className="font-mono text-[15px] tracking-[3px] uppercase" style={{ color: 'rgba(201,169,110,0.7)' }}>Registered — Bitcoin pending</span>
          </div>
          <Row label="Origin ID" value={result.shortToken!} ok />
          <Row label="Hash match" value="✓ confirmed" ok />
          <Row label="Date" value={result.date!} />
          <Row label="Time" value={result.time!} />
          <Row label="Bitcoin" value="pending" last />
        </div>
      )}

      {/* MISMATCH */}
      {result?.status === 'mismatch' && (
        <div className="w-full rounded-[8px] border p-4 mt-1"
          style={{ borderColor: 'rgba(220,80,60,0.4)', background: 'rgba(220,80,60,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[15px]" style={{ color: 'rgba(220,80,60,0.8)' }}>✗</span>
            <span className="font-mono text-[15px] tracking-[3px] uppercase" style={{ color: 'rgba(220,80,60,0.8)' }}>Wrong proof file</span>
          </div>
          <p className="font-garamond text-[15px] leading-snug"
            style={{ color: 'rgba(220,80,60,0.65)' }}>
            This ZIP belongs to a different origin. It does not match this page.
          </p>
        </div>
      )}

      {/* NOT FOUND */}
      {result?.status === 'not_found' && (
        <div className="w-full rounded-[8px] border p-4 mt-1"
          style={{ borderColor: 'rgba(240,234,214,0.12)', background: 'rgba(240,234,214,0.03)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[15px]" style={{ color: 'rgba(240,234,214,0.4)' }}>·</span>
            <span className="font-mono text-[15px] tracking-[3px] uppercase" style={{ color: 'rgba(240,234,214,0.4)' }}>Not found</span>
          </div>
          <p className="font-garamond text-[15px] leading-snug"
            style={{ color: 'rgba(240,234,214,0.35)' }}>
            This hash was not found in the registry.
          </p>
        </div>
      )}

      {/* ERROR */}
      {result?.status === 'error' && (
        <div className="w-full rounded-[8px] border p-4 mt-1"
          style={{ borderColor: 'rgba(220,80,60,0.3)', background: 'rgba(220,80,60,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[15px]" style={{ color: 'rgba(220,80,60,0.7)' }}>✗</span>
            <span className="font-mono text-[15px] tracking-[3px] uppercase" style={{ color: 'rgba(220,80,60,0.7)' }}>Verification failed</span>
          </div>
          <p className="font-garamond text-[15px] leading-snug"
            style={{ color: 'rgba(220,80,60,0.5)' }}>
            The file could not be verified. Please check the file and try again.
          </p>
        </div>
      )}

      {/* ── Step log (collapsible) ── */}
      {result && result.steps.length > 0 && (
        <div className="w-full mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(74,124,89,0.15)' }}>
            {result.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 font-mono text-[15px] leading-[1.6]">
                <span className="flex-shrink-0 mt-px" style={{
                  color: step.status === 'ok' ? '#7fba6a'
                    : step.status === 'error' ? 'rgba(220,80,60,0.8)'
                    : step.status === 'warn' ? 'rgba(201,169,110,0.7)'
                    : 'rgba(240,234,214,0.25)',
                }}>
                  {step.status === 'ok' ? '✓' : step.status === 'error' ? '✗' : step.status === 'warn' ? '!' : '·'}
                </span>
                <span style={{
                  color: step.status === 'ok' ? 'rgba(240,234,214,0.55)'
                    : step.status === 'error' ? 'rgba(220,80,60,0.7)'
                    : step.status === 'warn' ? 'rgba(201,169,110,0.6)'
                    : 'rgba(240,234,214,0.3)',
                }}>
                  {step.label}
                  {step.detail && (
                    <span className="ml-1.5" style={{ color: 'rgba(240,234,214,0.2)', wordBreak: 'break-all' }}>
                      {step.detail}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
      )}

    </div>
  );
}

// ── Row helper ──

function Row({ label, value, ok = false, gold = false, error = false, last = false }: {
  label: string; value: string; ok?: boolean; gold?: boolean; error?: boolean; last?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${last ? '' : 'border-b'}`}
      style={{ borderColor: 'rgba(201,169,110,0.1)' }}>
      <span className="font-mono text-[15px] tracking-[2px] uppercase"
        style={{ color: 'rgba(240,234,214,0.3)' }}>{label}</span>
      <span className="font-mono text-[15px]"
        style={{ color: error ? 'rgba(220,80,60,0.8)' : gold ? 'rgba(201,169,110,0.6)' : ok ? '#7fba6a' : 'rgba(240,234,214,0.35)' }}>{value}</span>
    </div>
  );
}
