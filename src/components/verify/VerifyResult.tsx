import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { downloadProofFile } from '@/lib/coreApi';

export interface VerifyStep {
  label: string;
  status: 'ok' | 'warn' | 'error' | 'info';
  detail?: string;
}

export interface VerifyResultData {
  status: 'verified' | 'pending' | 'not_found' | 'mismatch' | 'error';
  origin_id?: string;
  hash?: string;
  captured_at?: string;
  proof_status?: 'pending' | 'anchored';
  bitcoin_block_height?: number | null;
  claimed_by?: string | null;
  signature?: string | null;
  device_signature?: string | null;
  device_public_key?: string | null;
  revocation?: { revoked: boolean; revoked_at?: string; reason?: string } | null;
  steps?: VerifyStep[];
}

interface VerifyResultProps {
  result: VerifyResultData;
  onReset: () => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-[hsl(var(--landing-cream)/0.08)] last:border-b-0">
      <span className="font-mono text-xs tracking-[2px] uppercase flex-shrink-0" style={{ color: 'hsl(var(--landing-cream) / 0.5)' }}>
        {label}
      </span>
      <span className="font-mono text-sm font-light text-right break-all ml-5" style={{ color: 'hsl(var(--landing-cream) / 0.85)' }}>
        {value}
      </span>
    </div>
  );
}

function StepIcon({ status }: { status: VerifyStep['status'] }) {
  if (status === 'ok') return (
    <span className="font-mono text-[13px]" style={{ color: 'hsl(142 50% 55%)' }}>✓</span>
  );
  if (status === 'warn') return (
    <span className="font-mono text-[13px]" style={{ color: 'hsl(38 65% 60%)' }}>!</span>
  );
  if (status === 'error') return (
    <span className="font-mono text-[13px]" style={{ color: 'hsl(0 60% 60%)' }}>✗</span>
  );
  return (
    <span className="font-mono text-[13px]" style={{ color: 'hsl(var(--landing-cream) / 0.3)' }}>·</span>
  );
}

function VerificationSteps({ steps }: { steps: VerifyStep[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-7">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 font-mono text-[10px] tracking-[2px] uppercase cursor-pointer transition-all rounded-sm px-2.5 py-1.5"
        style={{
          color: open ? 'hsl(var(--landing-cream) / 0.75)' : 'hsl(var(--landing-cream) / 0.45)',
          border: open
            ? '1px solid hsl(var(--landing-cream) / 0.25)'
            : '1px solid transparent',
          background: 'transparent',
        }}
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? 'Hide verification steps' : 'Show verification steps'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-sm px-5 py-5 font-mono text-[13px] space-y-3"
              style={{
                background: 'hsl(0 0% 4%)',
                border: '1px solid hsl(var(--landing-cream) / 0.07)',
              }}
            >
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <StepIcon status={step.status} />
                  <div>
                    <span
                      style={{
                        color: step.status === 'ok'
                          ? 'hsl(142 35% 72%)'
                          : step.status === 'warn'
                          ? 'hsl(38 55% 68%)'
                          : step.status === 'error'
                          ? 'hsl(0 55% 68%)'
                          : 'hsl(var(--landing-cream) / 0.45)',
                      }}
                    >
                      {step.label}
                    </span>
                    {step.detail && (
                      <span
                        className="ml-2 text-[11px] break-all"
                        style={{ color: 'hsl(var(--landing-cream) / 0.35)' }}
                      >
                        {step.detail}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VerifyResult({ result, onReset }: VerifyResultProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadProof = async () => {
    if (!result.origin_id) return;
    setDownloading(true);
    try {
      await downloadProofFile(result.origin_id);
    } finally {
      setDownloading(false);
    }
  };

  const blockstreamUrl = result.bitcoin_block_height
    ? `https://blockstream.info/block-height/${result.bitcoin_block_height}`
    : null;

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── VERIFIED ──────────────────────────────────────────── */}
      {result.status === 'verified' && (
        <div
          className="rounded-sm px-8 py-9"
          style={{
            background: 'hsl(142 30% 7%)',
            border: '1px solid hsl(142 40% 28% / 0.5)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <svg viewBox="0 0 20 20" width={18} height={18}>
              <circle cx="10" cy="10" r="9" fill="none" stroke="hsl(142 50% 50%)" strokeWidth="1.3" />
              <polyline points="5.5,10 8.5,13 14.5,7" fill="none" stroke="hsl(142 50% 50%)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-[10px] tracking-[3px] uppercase" style={{ color: 'hsl(142 50% 55%)' }}>
              Verified
            </span>
          </div>

          <p className="font-serif leading-[1.35] mb-3" style={{ fontSize: '1.75rem', color: 'hsl(142 20% 88%)' }}>
            This file demonstrably existed on{' '}
            <span style={{ color: 'hsl(142 30% 78%)' }}>
              {result.captured_at ? formatDateTime(result.captured_at) : '—'}
            </span>
            .
          </p>

          {result.bitcoin_block_height ? (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-[15px]" style={{ color: 'hsl(142 20% 65%)' }}>
                Anchored in Bitcoin block {result.bitcoin_block_height.toLocaleString('en-US')}
              </span>
              {blockstreamUrl && (
                <a
                  href={blockstreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[1.5px] uppercase transition-opacity hover:opacity-70"
                  style={{ color: 'hsl(142 40% 55%)' }}
                >
                  View on blockstream.info
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <p className="mt-3 text-[14px] italic" style={{ color: 'hsl(142 15% 52%)' }}>
              Anchored in Bitcoin — block number loading.
            </p>
          )}

          {result.revocation?.revoked && (
            <div
              className="mt-5 rounded-sm px-5 py-4 flex items-start gap-3"
              style={{
                background: 'hsl(38 25% 8%)',
                border: '1px solid hsl(38 40% 32% / 0.5)',
              }}
            >
              <span className="font-mono text-[13px] flex-shrink-0" style={{ color: 'hsl(38 65% 60%)' }}>!</span>
              <div>
                <p className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: 'hsl(38 65% 60%)' }}>
                  Association released
                </p>
                <p className="text-[13px]" style={{ color: 'hsl(38 20% 65%)' }}>
                  The creator has released their association with this origin. The anchor record and proof remain valid and independently verifiable.
                </p>
              </div>
            </div>
          )}

          {result.proof_status === 'anchored' && (
            <button
              onClick={handleDownloadProof}
              disabled={downloading}
              className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] tracking-[2px] uppercase px-4 py-2.5 rounded-sm transition-all disabled:opacity-50 hover:opacity-80"
              style={{
                color: 'hsl(142 40% 55%)',
                border: '1px solid hsl(142 40% 32% / 0.7)',
                background: 'transparent',
              }}
            >
              {downloading ? '↓  Downloading…' : '↓  Download proof.ots'}
            </button>
          )}

          <button
            onClick={() => setShowDetails(v => !v)}
            className="flex items-center gap-2 mt-5 font-mono text-[10px] tracking-[2px] uppercase cursor-pointer transition-all rounded-sm px-2.5 py-1.5"
            style={{
              color: showDetails ? 'hsl(142 25% 60%)' : 'hsl(142 15% 45%)',
              border: showDetails
                ? '1px solid hsl(142 25% 28% / 0.6)'
                : '1px solid transparent',
              background: 'transparent',
            }}
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDetails ? 'Hide technical details' : 'Show technical details'}
          </button>

          {showDetails && (
            <motion.div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid hsl(142 20% 12%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {result.origin_id && <DetailRow label="Origin ID" value={result.origin_id} />}
              {result.hash && <DetailRow label="SHA-256" value={result.hash} />}
              {result.bitcoin_block_height && <DetailRow label="Bitcoin block" value={result.bitcoin_block_height.toLocaleString()} />}
              {result.device_signature
                ? <DetailRow label="Device signature" value="✓ Present" />
                : result.claimed_by
                ? <DetailRow label="Passkey claim" value={result.claimed_by.substring(0, 32) + '…'} />
                : <DetailRow label="Claimed by" value="Anonymous — no passkey" />
              }
            </motion.div>
          )}

          {result.steps && result.steps.length > 0 && (
            <VerificationSteps steps={result.steps} />
          )}
        </div>
      )}

      {/* ── PENDING ───────────────────────────────────────────── */}
      {result.status === 'pending' && (
        <div
          className="rounded-sm p-8"
          style={{ background: 'hsl(38 25% 7%)', border: '1px solid hsl(38 40% 32% / 0.45)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <svg viewBox="0 0 20 20" width={18} height={18}>
              <circle cx="10" cy="10" r="9" fill="none" stroke="hsl(38 65% 60%)" strokeWidth="1.3" />
              <line x1="10" y1="6" x2="10" y2="10.5" stroke="hsl(38 65% 60%)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="13.5" r="0.8" fill="hsl(38 65% 60%)" />
            </svg>
            <span className="font-mono text-xs tracking-[3px] uppercase" style={{ color: 'hsl(38 65% 60%)' }}>
              Not yet anchored
            </span>
          </div>

          <p className="font-serif text-2xl leading-[1.45] mb-3" style={{ color: 'hsl(38 20% 85%)' }}>
            This hash is registered but not yet anchored in Bitcoin.
          </p>
          <p className="text-[16px] leading-relaxed" style={{ color: 'hsl(38 15% 62%)' }}>
            The anchoring process takes up to one hour. Please check back later.
          </p>

          {result.captured_at && (
            <p className="text-sm italic mt-4" style={{ color: 'hsl(38 15% 52%)' }}>
              Registered on {formatDateTime(result.captured_at)}
            </p>
          )}

          {result.steps && result.steps.length > 0 && (
            <VerificationSteps steps={result.steps} />
          )}
        </div>
      )}

      {/* ── NOT FOUND ─────────────────────────────────────────── */}
      {result.status === 'not_found' && (
        <div
          className="rounded-sm p-8"
          style={{ background: 'hsl(var(--landing-deep))', border: '1px solid hsl(var(--landing-cream) / 0.12)' }}
        >
          <p className="font-mono text-xs tracking-[3px] uppercase mb-5" style={{ color: 'hsl(var(--landing-cream) / 0.5)' }}>
            Not found
          </p>
          <p className="font-serif text-2xl leading-[1.45]" style={{ color: 'hsl(var(--landing-cream) / 0.9)' }}>
            This hash was not found in the registry.
          </p>
          <p className="text-[15px] mt-3 leading-relaxed" style={{ color: 'hsl(var(--landing-cream) / 0.6)' }}>
            This file has not been anchored via Umarise, or was submitted with a different hash.
          </p>

          {result.steps && result.steps.length > 0 && (
            <VerificationSteps steps={result.steps} />
          )}
        </div>
      )}

      {/* ── MISMATCH ──────────────────────────────────────────── */}
      {result.status === 'mismatch' && (
        <div
          className="rounded-sm p-8"
          style={{ background: 'hsl(0 25% 7%)', border: '1px solid hsl(0 50% 28% / 0.5)' }}
        >
          <p className="font-mono text-xs tracking-[3px] uppercase mb-5" style={{ color: 'hsl(0 60% 62%)' }}>
            Hash mismatch
          </p>
          <p className="font-serif text-2xl leading-[1.45] mb-3" style={{ color: 'hsl(0 15% 85%)' }}>
            The file in this ZIP does not match the hash in the certificate.
          </p>
          <p className="text-[15px]" style={{ color: 'hsl(0 15% 60%)' }}>
            The file may have been modified after the anchor was created.
          </p>

          {result.steps && result.steps.length > 0 && (
            <VerificationSteps steps={result.steps} />
          )}
        </div>
      )}

      {/* ── ERROR ─────────────────────────────────────────────── */}
      {result.status === 'error' && (
        <div
          className="rounded-sm p-8"
          style={{ background: 'hsl(var(--landing-deep))', border: '1px solid hsl(var(--landing-cream) / 0.1)' }}
        >
          <p className="font-mono text-xs tracking-[3px] uppercase mb-4" style={{ color: 'hsl(var(--landing-cream) / 0.5)' }}>
            Verification failed
          </p>
          <p className="text-[16px]" style={{ color: 'hsl(var(--landing-cream) / 0.75)' }}>
            Something went wrong. Please try again.
          </p>

          {result.steps && result.steps.length > 0 && (
            <VerificationSteps steps={result.steps} />
          )}
        </div>
      )}

      {/* Verify another */}
      <div className="text-center mt-6">
        <button
          onClick={onReset}
          className="font-mono text-xs tracking-[2px] uppercase bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: 'hsl(var(--landing-cream) / 0.45)' }}
        >
          Verify another file →
        </button>
      </div>
    </motion.div>
  );
}
