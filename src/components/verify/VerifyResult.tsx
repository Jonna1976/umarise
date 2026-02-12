import { useState } from 'react';
import { motion } from 'framer-motion';
import { downloadProofFile } from '@/lib/coreApi';
import { OriginMark } from '@/components/prototype/components/OriginMark';

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

function ResultRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-landing-muted/10 last:border-b-0">
      <span className="font-mono text-[10px] tracking-[2px] uppercase text-landing-muted/50 flex-shrink-0">
        {label}
      </span>
      <span className={`font-mono text-xs font-light text-right break-all ml-5 ${valueClassName || 'text-landing-cream/70'}`}>
        {value}
      </span>
    </div>
  );
}

export function VerifyResult({ result, onReset }: VerifyResultProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadProof = async () => {
    if (!result.origin_id) return;
    setDownloading(true);
    try {
      const success = await downloadProofFile(result.origin_id);
      if (!success) {
        console.warn('[verify] Proof download failed — may not be anchored yet');
      }
    } finally {
      setDownloading(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-9">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Verified + Anchored */}
        {result.status === 'verified' && (
          <div className="p-6 border border-verify-green/30 bg-landing-muted/5 rounded">
            <div className="font-serif text-xl text-verify-green-bright mb-3 flex items-center gap-3">
              <OriginMark size={28} state="anchored" variant="light" glow />
              <span>Anchor Verified</span>
            </div>
            <p className="text-sm text-landing-cream/70 mb-5 leading-relaxed">
              This file was registered and anchored in the Bitcoin blockchain.
            </p>

            <ResultRow label="Anchor" value={result.origin_id ? `${result.origin_id.substring(0, 13)}...` : '—'} />
            <ResultRow label="Registered" value={result.captured_at ? formatTimestamp(result.captured_at) : '—'} />
            <ResultRow label="Hash" value={result.hash ? `${result.hash.substring(0, 24)}...` : '—'} />
            {result.bitcoin_block_height && (
              <ResultRow label="Bitcoin block" value={result.bitcoin_block_height.toLocaleString()} />
            )}

            {/* Passkey claim section */}
            <div className="border-t border-landing-muted/10 mt-1 pt-3">
              {result.claimed_by ? (
                <>
                  <ResultRow
                    label="Claimed by"
                    value={`${result.claimed_by.substring(0, 20)}...`}
                    valueClassName="text-landing-copper"
                  />
                  {result.signature && (
                    <ResultRow
                      label="Signature"
                      value="✓ Present"
                      valueClassName="text-verify-green-bright"
                    />
                  )}
                </>
              ) : (
                <ResultRow
                  label="Claimed by"
                  value="Anonymous (no passkey)"
                  valueClassName="text-landing-muted/30"
                />
              )}
            </div>

            {/* Device signature section (v1.1) */}
            <div className="border-t border-landing-muted/10 mt-1 pt-3">
              {result.device_signature ? (
                <>
                  <ResultRow
                    label="Device signed"
                    value="✓ Signed by holder of this device"
                    valueClassName="text-verify-green-bright"
                  />
                  {result.device_public_key && (
                    <ResultRow
                      label="Device key"
                      value={`${result.device_public_key.substring(0, 20)}...`}
                      valueClassName="text-landing-copper"
                    />
                  )}
                </>
              ) : (
                <ResultRow
                  label="Device signed"
                  value="— not signed"
                  valueClassName="text-landing-muted/30"
                />
              )}
            </div>

            {/* Proof download button */}
            {result.proof_status === 'anchored' && (
              <button
                onClick={handleDownloadProof}
                disabled={downloading}
                className="inline-flex items-center gap-2 mt-5 px-5 py-3 font-mono text-[10px] tracking-[2px] uppercase text-verify-green-bright border border-verify-green/25 bg-transparent cursor-pointer transition-all duration-300 hover:border-verify-green/50 hover:bg-verify-green/[0.04] disabled:opacity-50 rounded"
              >
                {downloading ? '↓  Downloading...' : '↓  Download proof.ots'}
              </button>
            )}
          </div>
        )}

        {/* Pending */}
        {result.status === 'pending' && (
          <div className="p-6 border border-landing-copper/20 bg-landing-muted/5 rounded">
            <div className="font-serif text-xl text-landing-copper mb-3 flex items-center gap-3">
              <OriginMark size={20} state="pending" variant="light" animated />
              <span>Pending</span>
            </div>
            <p className="text-sm text-landing-cream/70 leading-relaxed">
              This anchor is registered but the Bitcoin proof is not yet ready. This typically takes 10–20 minutes after registration.
            </p>
          </div>
        )}

        {/* Not Found */}
        {result.status === 'not_found' && (
          <div className="p-6 border border-verify-red/20 bg-landing-muted/5 rounded">
            <div className="font-serif text-xl text-verify-red mb-3">
              Not found
            </div>
            <p className="text-sm text-landing-cream/70 leading-relaxed">
              No anchor matches this ID and hash. The Anchor ID may not exist, or the hash does not match.
            </p>
          </div>
        )}

        {/* Hash Mismatch */}
        {result.status === 'mismatch' && (
          <div className="p-6 border border-verify-red/20 bg-landing-muted/5 rounded">
            <div className="font-serif text-xl text-verify-red mb-3">
              Hash mismatch
            </div>
            <p className="text-sm text-landing-cream/70 leading-relaxed">
              The file in this ZIP does not match the hash recorded in the certificate. The file may have been modified after the anchor was created.
            </p>
          </div>
        )}

        {/* Error */}
        {result.status === 'error' && (
          <div className="p-6 border border-verify-red/20 bg-landing-muted/5 rounded">
            <div className="font-serif text-xl text-verify-red mb-3">
              Verification error
            </div>
            <p className="text-sm text-landing-cream/70 leading-relaxed">
              Something went wrong while verifying. Please try again.
            </p>
          </div>
        )}
      </motion.div>

      {/* Verify another */}
      <div className="text-center mt-6">
        <button
          onClick={onReset}
          className="text-sm text-landing-muted/50 bg-transparent border-none cursor-pointer transition-colors hover:text-landing-cream"
        >
          Verify another anchor
        </button>
      </div>
    </div>
  );
}
