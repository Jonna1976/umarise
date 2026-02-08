import { motion } from 'framer-motion';

interface VerifyHashDisplayProps {
  hash: string;
  matchStatus: 'match' | 'mismatch' | null;
}

export function VerifyHashDisplay({ hash, matchStatus }: VerifyHashDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-5 p-3.5 px-4 bg-ritual-surface border border-ritual-gold/[0.06]"
    >
      <div className="font-mono text-[8px] tracking-[2px] uppercase text-ritual-gold-muted mb-1">
        SHA-256 hash of your file
      </div>
      <div className="font-mono text-[11px] font-light text-ritual-cream-70 break-all leading-relaxed">
        {hash}
      </div>
      {matchStatus === 'match' && (
        <div className="font-mono text-[9px] mt-1.5 text-verify-green-bright">
          ✓ Hash matches certificate
        </div>
      )}
      {matchStatus === 'mismatch' && (
        <div className="font-mono text-[9px] mt-1.5 text-verify-red">
          ✗ Hash does not match certificate — file may have been modified
        </div>
      )}
    </motion.div>
  );
}
