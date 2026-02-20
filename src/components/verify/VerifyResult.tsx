import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { downloadProofFile } from '@/lib/coreApi';

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
}

interface VerifyResultProps {
  result: VerifyResultData;
  onReset: () => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }) + ' om ' + d.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-landing-muted/10 last:border-b-0">
      <span className="font-mono text-[10px] tracking-[2px] uppercase text-landing-muted/40 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-[11px] font-light text-right break-all ml-5 text-landing-cream/50">
        {value}
      </span>
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
          className="rounded-sm p-8"
          style={{
            background: 'hsl(142 30% 8%)',
            border: '1px solid hsl(142 40% 25% / 0.4)',
          }}
        >
          {/* Mark */}
          <div className="flex items-center gap-3 mb-6">
            <svg viewBox="0 0 20 20" width={16} height={16}>
              <circle cx="10" cy="10" r="9" fill="none" stroke="hsl(142 50% 45%)" strokeWidth="1.2" />
              <polyline points="5.5,10 8.5,13 14.5,7" fill="none" stroke="hsl(142 50% 45%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="font-mono text-[10px] tracking-[3px] uppercase"
              style={{ color: 'hsl(142 50% 45%)' }}
            >
              Geverifieerd
            </span>
          </div>

          {/* Primary statement */}
          <p
            className="font-serif text-[22px] leading-[1.4] mb-2"
            style={{ color: 'hsl(142 20% 85%)' }}
          >
            Dit bestand bestond aantoonbaar op{' '}
            <span style={{ color: 'hsl(142 30% 75%)' }}>
              {result.captured_at ? formatDateTime(result.captured_at) : '—'}
            </span>
            .
          </p>

          {/* Bitcoin block */}
          {result.bitcoin_block_height ? (
            <div className="mt-5 flex items-center gap-3">
              <span
                className="font-garamond text-[14px]"
                style={{ color: 'hsl(142 20% 60%)' }}
              >
                Verankerd in Bitcoin block {result.bitcoin_block_height.toLocaleString('nl-NL')}
              </span>
              {blockstreamUrl && (
                <a
                  href={blockstreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[1.5px] uppercase transition-opacity hover:opacity-70"
                  style={{ color: 'hsl(142 40% 50%)' }}
                >
                  Bekijk op blockstream.info
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <p
              className="mt-3 font-garamond text-[13px]"
              style={{ color: 'hsl(142 15% 50%)' }}
            >
              Verankerd in Bitcoin — blocknummer wordt opgehaald.
            </p>
          )}

          {/* Download .ots */}
          {result.proof_status === 'anchored' && (
            <button
              onClick={handleDownloadProof}
              disabled={downloading}
              className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] tracking-[2px] uppercase px-4 py-2 rounded-sm transition-all disabled:opacity-50"
              style={{
                color: 'hsl(142 40% 50%)',
                border: '1px solid hsl(142 40% 25% / 0.5)',
                background: 'transparent',
              }}
            >
              {downloading ? '↓  Downloading…' : '↓  Download proof.ots'}
            </button>
          )}

          {/* Collapsible details */}
          <button
            onClick={() => setShowDetails(v => !v)}
            className="flex items-center gap-2 mt-6 font-mono text-[9px] tracking-[2px] uppercase transition-opacity hover:opacity-70 bg-transparent border-none cursor-pointer"
            style={{ color: 'hsl(142 15% 45%)' }}
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDetails ? 'Verberg details' : 'Toon technische details'}
          </button>

          {showDetails && (
            <motion.div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid hsl(142 20% 15%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {result.origin_id && (
                <DetailRow label="Origin ID" value={result.origin_id} />
              )}
              {result.hash && (
                <DetailRow label="SHA-256" value={result.hash} />
              )}
              {result.bitcoin_block_height && (
                <DetailRow label="Bitcoin block" value={result.bitcoin_block_height.toLocaleString()} />
              )}
              {result.device_signature ? (
                <DetailRow label="Device handtekening" value="✓ Aanwezig" />
              ) : result.claimed_by ? (
                <DetailRow label="Passkey claim" value={result.claimed_by.substring(0, 32) + '…'} />
              ) : (
                <DetailRow label="Geclaimd door" value="Anoniem — geen passkey" />
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ── PENDING ───────────────────────────────────────────── */}
      {result.status === 'pending' && (
        <div
          className="rounded-sm p-8"
          style={{
            background: 'hsl(38 25% 8%)',
            border: '1px solid hsl(38 40% 30% / 0.35)',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <svg viewBox="0 0 20 20" width={16} height={16}>
              <circle cx="10" cy="10" r="9" fill="none" stroke="hsl(38 65% 55%)" strokeWidth="1.2" />
              <line x1="10" y1="6" x2="10" y2="10.5" stroke="hsl(38 65% 55%)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="13.5" r="0.8" fill="hsl(38 65% 55%)" />
            </svg>
            <span
              className="font-mono text-[10px] tracking-[3px] uppercase"
              style={{ color: 'hsl(38 65% 55%)' }}
            >
              Nog niet verankerd
            </span>
          </div>

          <p
            className="font-serif text-[19px] leading-[1.45] mb-3"
            style={{ color: 'hsl(38 20% 80%)' }}
          >
            Deze hash is geregistreerd maar nog niet verankerd in Bitcoin.
          </p>
          <p
            className="font-garamond text-[14px] leading-relaxed"
            style={{ color: 'hsl(38 15% 55%)' }}
          >
            Het ankerproces duurt maximaal een uur. Probeer het later opnieuw.
          </p>

          {result.captured_at && (
            <p
              className="font-garamond italic text-[12px] mt-4"
              style={{ color: 'hsl(38 15% 45%)' }}
            >
              Geregistreerd op {formatDateTime(result.captured_at)}
            </p>
          )}
        </div>
      )}

      {/* ── NOT FOUND ─────────────────────────────────────────── */}
      {result.status === 'not_found' && (
        <div
          className="rounded-sm p-8"
          style={{
            background: 'hsl(0 0% 7%)',
            border: '1px solid hsl(0 0% 20% / 0.4)',
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[3px] uppercase mb-5"
            style={{ color: 'hsl(0 0% 45%)' }}
          >
            Niet gevonden
          </p>
          <p
            className="font-serif text-[19px] leading-[1.45]"
            style={{ color: 'hsl(0 0% 65%)' }}
          >
            Deze hash is niet gevonden in het Umarise-register.
          </p>
        </div>
      )}

      {/* ── MISMATCH ──────────────────────────────────────────── */}
      {result.status === 'mismatch' && (
        <div
          className="rounded-sm p-8"
          style={{
            background: 'hsl(0 25% 7%)',
            border: '1px solid hsl(0 50% 25% / 0.4)',
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[3px] uppercase mb-5"
            style={{ color: 'hsl(0 60% 55%)' }}
          >
            Hash komt niet overeen
          </p>
          <p
            className="font-serif text-[19px] leading-[1.45] mb-3"
            style={{ color: 'hsl(0 15% 75%)' }}
          >
            Het bestand in deze ZIP komt niet overeen met de hash in het certificaat.
          </p>
          <p
            className="font-garamond text-[13px]"
            style={{ color: 'hsl(0 15% 50%)' }}
          >
            Het bestand is mogelijk gewijzigd na het aanmaken van het anker.
          </p>
        </div>
      )}

      {/* ── ERROR ─────────────────────────────────────────────── */}
      {result.status === 'error' && (
        <div
          className="rounded-sm p-8"
          style={{
            background: 'hsl(0 0% 7%)',
            border: '1px solid hsl(0 0% 20% / 0.4)',
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[3px] uppercase mb-4"
            style={{ color: 'hsl(0 0% 45%)' }}
          >
            Verificatie mislukt
          </p>
          <p
            className="font-garamond text-[14px]"
            style={{ color: 'hsl(0 0% 55%)' }}
          >
            Er is iets misgegaan. Probeer het opnieuw.
          </p>
        </div>
      )}

      {/* ── Onafhankelijkheidsverklaring (altijd zichtbaar) ───── */}
      <p
        className="mt-8 font-garamond italic text-[12px] text-center leading-relaxed"
        style={{ color: 'hsl(var(--landing-muted) / 0.3)' }}
      >
        Dit bewijs is onafhankelijk verifieerbaar.{' '}
        <a
          href="https://opentimestamps.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-opacity hover:opacity-70"
        >
          opentimestamps.org
        </a>{' '}
        of met de{' '}
        <code className="font-mono text-[11px]">ots-cli</code>{' '}
        tool.
      </p>

      {/* Verify another */}
      <div className="text-center mt-5">
        <button
          onClick={onReset}
          className="font-mono text-[10px] tracking-[2px] uppercase bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: 'hsl(var(--landing-muted) / 0.35)' }}
        >
          Ander bestand verifiëren
        </button>
      </div>
    </motion.div>
  );
}
