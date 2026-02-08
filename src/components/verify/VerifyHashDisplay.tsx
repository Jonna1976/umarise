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
      className="mt-5 p-3.5 px-4 bg-landing-muted/5 border border-landing-muted/10 rounded"
    >
      <div className="font-mono text-[10px] tracking-[2px] uppercase text-landing-muted/50 mb-1">
        SHA-256 hash of your file
      </div>
      <div className="font-mono text-[11px] font-light text-landing-cream/70 break-all leading-relaxed">
        {hash}
      </div>
      {matchStatus === 'match' && (
        <div className="font-mono text-[10px] mt-1.5 text-verify-green-bright">
          ✓ Hash matches certificate
        </div>
      )}
      {matchStatus === 'mismatch' && (
        <div className="font-mono text-[10px] mt-1.5 text-verify-red">
          ✗ Hash does not match certificate. File may have been modified
        </div>
      )}
    </motion.div>
  );
}
