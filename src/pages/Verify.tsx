/**
 * /verify — Standalone verificatiepagina
 * 
 * Doelgroep: advocaat, rechter, platform-medewerker.
 * Geen account vereist. Geen technische kennis vereist.
 * 
 * Drie input-typen (auto-detectie):
 *   .zip  → leest certificate.json, verifieer via registry
 *   .ots  → toekomstig: OTS-directe verificatie
 *   *     → hash het bestand client-side, zoek op in registry
 * 
 * Drie resultaten:
 *   verified   → datum + Bitcoin block + blockstream link
 *   pending    → geregistreerd, nog niet verankerd
 *   not_found  → niet gevonden
 * 
 * Alles client-side. Bestand verlaat de browser NIET.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { verifyOriginByHash, fetchProofStatus } from '@/lib/coreApi';
import { VerifyResult, type VerifyResultData, type VerifyStep } from '@/components/verify/VerifyResult';

// ─── Helpers ───

async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface CertificateData {
  origin_id: string;
  hash: string;
  captured_at?: string;
  proof_status?: string;
  claimed_by?: string | null;
  signature?: string | null;
  device_signature?: string | null;
  device_public_key?: string | null;
}

async function verifyHash(hash: string, cert?: CertificateData, extraSteps: VerifyStep[] = []): Promise<VerifyResultData> {
  const steps: VerifyStep[] = [...extraSteps];

  // Step: registry lookup
  steps.push({ label: 'Looking up hash in registry', status: 'info' });
  const verifyResult = await verifyOriginByHash(hash);

  if (!verifyResult.found || !verifyResult.origin) {
    steps[steps.length - 1] = { label: 'Hash not found in registry', status: 'error' };
    return { status: 'not_found', steps };
  }

  steps[steps.length - 1] = { label: 'Hash found in registry', status: 'ok', detail: hash.substring(0, 16) + '…' };

  const origin = verifyResult.origin;
  const proofStatus: 'pending' | 'anchored' = origin.proof_status || 'pending';

  // Step: Bitcoin anchor
  if (proofStatus === 'anchored') {
    steps.push({ label: 'Bitcoin anchor confirmed', status: 'ok' });
  } else {
    steps.push({ label: 'Bitcoin anchor pending', status: 'warn' });
  }

  // Layer 2 device identity: opt-in placeholder, only shown in ZIP flow (extraSteps pre-built)
  // For raw file hash flow (no extraSteps), this slot is omitted — no cert context available


  let bitcoinBlockHeight: number | null = null;
  if (proofStatus === 'anchored') {
    const proofResult = await fetchProofStatus(origin.origin_id);
    if (proofResult.status === 'anchored') {
      bitcoinBlockHeight = proofResult.bitcoinBlockHeight;
      if (bitcoinBlockHeight) {
        steps.push({ label: `Bitcoin block ${bitcoinBlockHeight.toLocaleString('en-US')}`, status: 'ok' });
      }
    }
  }

  return {
    status: proofStatus === 'anchored' ? 'verified' : 'pending',
    origin_id: origin.origin_id,
    hash: origin.hash,
    captured_at: origin.captured_at,
    proof_status: proofStatus,
    bitcoin_block_height: bitcoinBlockHeight,
    claimed_by: cert?.claimed_by ?? null,
    signature: cert?.signature ?? null,
    device_signature: cert?.device_signature ?? null,
    device_public_key: cert?.device_public_key ?? null,
    steps,
  };
}

// ─── Drop zone ───

type DropState = 'idle' | 'dragging';

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

function VerifyDropArea({ onFile, disabled }: DropZoneProps) {
  const [dropState, setDropState] = useState<DropState>('idle');
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent, true);
    window.addEventListener('drop', prevent, true);
    return () => {
      window.removeEventListener('dragover', prevent, true);
      window.removeEventListener('drop', prevent, true);
    };
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setDropState('dragging');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDropState('idle');
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDropState('idle');
    const file = e.dataTransfer.files?.[0];
    if (file && !disabled) onFile(file);
  };

  return (
    <div
      role="button"
      aria-label="Drop a file here or click to select"
      className="relative w-full rounded-sm cursor-pointer select-none transition-all duration-300"
      style={{
        minHeight: 200,
        border: dropState === 'dragging'
          ? '1px solid hsl(var(--landing-copper) / 0.6)'
          : '1px dashed hsl(var(--landing-cream) / 0.18)',
        background: dropState === 'dragging'
          ? 'hsl(var(--landing-copper) / 0.05)'
          : 'hsl(var(--landing-cream) / 0.02)',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        disabled={disabled}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && !disabled) onFile(file);
          e.target.value = '';
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
        {dropState === 'dragging' ? (
          <span
            className="font-mono text-[13px] tracking-[0.15em] uppercase"
            style={{ color: 'hsl(var(--landing-copper))' }}
          >
            Drop to verify
          </span>
        ) : disabled ? (
          <span
            className="font-mono text-[12px] tracking-[0.12em] uppercase"
            style={{ color: 'hsl(var(--landing-cream) / 0.4)' }}
          >
            Verifying…
          </span>
        ) : (
          <>
            <svg viewBox="0 0 40 40" width={32} height={32} style={{ opacity: 0.45 }}>
              <rect x="6" y="4" width="20" height="26" rx="2" fill="none" stroke="hsl(var(--landing-cream))" strokeWidth="1.2" />
              <path d="M22 4 L22 12 L30 12" fill="none" stroke="hsl(var(--landing-cream))" strokeWidth="1.2" />
              <line x1="6" y1="18" x2="28" y2="18" stroke="hsl(var(--landing-cream))" strokeWidth="0.8" opacity="0.6" />
              <line x1="6" y1="22" x2="22" y2="22" stroke="hsl(var(--landing-cream))" strokeWidth="0.8" opacity="0.6" />
            </svg>
            <div className="text-center">
              <p
                className="font-garamond text-[17px] tracking-[0.04em]"
                style={{ color: 'hsl(var(--landing-cream) / 0.85)' }}
              >
                Drop a file here or click to select
              </p>
              <p
                className="font-garamond italic text-[14px] mt-1.5"
                style={{ color: 'hsl(var(--landing-cream) / 0.45)' }}
              >
                ZIP, original file, or .ots proof
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Loading state ───

function VerifyingState({ fileName }: { fileName: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-5 py-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 48 48" width={36} height={36}>
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="hsl(var(--landing-copper) / 0.2)"
            strokeWidth="1.5"
          />
          <path
            d="M24 4 A20 20 0 0 1 44 24"
            fill="none"
            stroke="hsl(var(--landing-copper) / 0.75)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
      <div className="text-center">
        <p
          className="font-mono text-[11px] tracking-[2px] uppercase"
          style={{ color: 'hsl(var(--landing-cream) / 0.7)' }}
        >
          Verifying…
        </p>
        <p
          className="font-garamond italic text-[14px] mt-1.5 truncate max-w-[240px]"
          style={{ color: 'hsl(var(--landing-cream) / 0.4)' }}
        >
          {fileName}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Error display ───

function VerifyError({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <motion.div
      className="mt-6 rounded-sm p-7"
      style={{
        background: 'hsl(0 15% 8%)',
        border: '1px solid hsl(0 40% 35% / 0.35)',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p
        className="font-mono text-[10px] tracking-[3px] uppercase mb-3"
        style={{ color: 'hsl(0 60% 55%)' }}
      >
        Error
      </p>
      <p
        className="font-garamond text-[16px]"
        style={{ color: 'hsl(var(--landing-cream) / 0.75)' }}
      >
        {message}
      </p>
      <button
        onClick={onReset}
        className="mt-5 font-mono text-[10px] tracking-[2px] uppercase bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
        style={{ color: 'hsl(var(--landing-cream) / 0.45)' }}
      >
        Try again →
      </button>
    </motion.div>
  );
}

// ─── Main page ───



type PageState =
  | { phase: 'idle' }
  | { phase: 'verifying'; fileName: string }
  | { phase: 'result'; result: VerifyResultData }
  | { phase: 'error'; message: string };

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PageState>({ phase: 'idle' });

  // URL-param: ?hash= pre-triggers a hash lookup on mount
  useEffect(() => {
    const hash = searchParams.get('hash');
    if (hash && hash.length === 64) {
      setState({ phase: 'verifying', fileName: 'hash from URL' });
      verifyHash(hash).then(result => {
        setState({ phase: 'result', result });
      }).catch(() => {
        setState({ phase: 'error', message: 'Verification failed. Please try again.' });
      });
    }
  }, []);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  const handleFile = useCallback(async (file: File) => {
    setState({ phase: 'verifying', fileName: file.name });

    try {
      const name = file.name.toLowerCase();
      const isZip = name.endsWith('.zip') || file.type === 'application/zip';
      const isOts = name.endsWith('.ots');

      if (isZip) {
        const steps: VerifyStep[] = [];

        // Step 1: open ZIP
        let zip: JSZip;
        try {
          zip = await JSZip.loadAsync(file);
          steps.push({ label: `ZIP opened: ${file.name}`, status: 'ok' });
        } catch {
          setState({ phase: 'error', message: 'Could not open file.' });
          return;
        }

        // Step 2: certificate.json
        const certFile = zip.file('certificate.json');
        if (!certFile) {
          setState({ phase: 'error', message: 'This does not appear to be an Umarise origin ZIP. Expected: certificate.json.' });
          return;
        }
        steps.push({ label: 'certificate.json found', status: 'ok' });

        // Step 3: parse cert
        let cert: CertificateData;
        try {
          const text = await certFile.async('text');
          cert = JSON.parse(text);
        } catch {
          setState({ phase: 'error', message: 'Certificate could not be read.' });
          return;
        }

        if (!cert.hash) {
          setState({ phase: 'error', message: 'Certificate unreadable — no hash found.' });
          return;
        }

        const rawHash = cert.hash.startsWith('sha256:') ? cert.hash.slice(7) : cert.hash;
        steps.push({ label: 'SHA-256 from certificate', status: 'ok', detail: rawHash.substring(0, 20) + '…' });

        // Step 4: origin ID
        if (cert.origin_id) {
          steps.push({ label: 'Origin ID', status: 'ok', detail: cert.origin_id.substring(0, 16) + '…' });
        }

        // Step 5: Layer 2 device identity (opt-in — passkey / EUDI wallet / C2PA)
        // Not yet active; displayed as a placeholder so the slot is always visible
        steps.push({ label: 'Layer 2 identity binding', status: 'info' });

        const result = await verifyHash(rawHash, cert, steps);
        setState({ phase: 'result', result });

      } else if (isOts) {
        setState({
          phase: 'error',
          message: 'Direct .ots verification is not supported here. Use opentimestamps.org or the ots-cli tool to verify an .ots file.',
        });

      } else {
        // Any file: hash client-side
        const steps: VerifyStep[] = [];
        steps.push({ label: `File read: ${file.name}`, status: 'ok', detail: `${(file.size / 1024).toFixed(1)} KB` });
        const buffer = await file.arrayBuffer();
        const hash = await computeSHA256(buffer);
        steps.push({ label: 'SHA-256 computed', status: 'ok', detail: hash.substring(0, 20) + '…' });
        const result = await verifyHash(hash, undefined, steps);
        setState({ phase: 'result', result });
      }
    } catch {
      setState({ phase: 'error', message: 'Verification failed. Please try again.' });
    }
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'hsl(var(--landing-deep))', color: 'hsl(var(--landing-cream))' }}
    >
      {/* Header */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.08)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-cream))] transition-colors text-sm"
          >
            ← Back
          </a>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-10 pt-6">
          <p className="text-[hsl(var(--landing-muted))] text-sm uppercase tracking-[0.2em] mb-3">
            Origin Verification
          </p>
          <h1 className="text-4xl font-serif text-[hsl(var(--landing-cream))] mb-3">
            Verify a proof
          </h1>
          <p className="text-[hsl(var(--landing-cream)/0.7)] max-w-xl">
            Upload a file, an origin ZIP, or an .ots proof to check whether its existence has been recorded.
          </p>
          <p className="text-sm mt-2 text-[hsl(var(--landing-cream)/0.5)]">
            The file never leaves your browser. Verification is performed client-side.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">



        {/* Drop zone + result */}
        <AnimatePresence mode="wait">
          {state.phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VerifyDropArea onFile={handleFile} disabled={false} />
            </motion.div>
          )}

          {state.phase === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VerifyingState fileName={state.fileName} />
            </motion.div>
          )}

          {state.phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VerifyResult result={state.result} onReset={reset} />
            </motion.div>
          )}

          {state.phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VerifyError message={state.message} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Independence statement — always visible */}
        <div
          className="mt-10 py-5 px-6 rounded-sm text-center"
          style={{ border: '1px solid hsl(var(--landing-cream) / 0.06)', background: 'hsl(var(--landing-cream) / 0.02)' }}
        >
          <p
            className="text-[15px] leading-relaxed italic"
            style={{ color: 'hsl(var(--landing-cream) / 0.6)' }}
          >
            This proof is independently verifiable via{' '}
            <a
              href="https://opentimestamps.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'hsl(var(--landing-copper))' }}
            >
              opentimestamps.org
            </a>{' '}
            or with the <code className="font-mono text-[13px]" style={{ color: 'hsl(var(--landing-cream) / 0.75)' }}>ots-cli</code> tool.
          </p>
          <p className="text-sm mt-1.5 not-italic" style={{ color: 'hsl(var(--landing-cream) / 0.4)' }}>
            No contact with Umarise required.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-6 text-center text-sm font-mono"
        style={{
          borderTop: '1px solid hsl(var(--landing-cream) / 0.07)',
          color: 'hsl(var(--landing-cream) / 0.3)',
        }}
      >
        anchoring.app · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

