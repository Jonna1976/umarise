import { motion, AnimatePresence } from 'framer-motion';

interface VerifyManualFormProps {
  isOpen: boolean;
  onToggle: () => void;
  originId: string;
  hash: string;
  onOriginIdChange: (v: string) => void;
  onHashChange: (v: string) => void;
  onVerify: () => void;
  isVerifying: boolean;
}

export function VerifyManualForm({
  isOpen,
  onToggle,
  originId,
  hash,
  onOriginIdChange,
  onHashChange,
  onVerify,
  isVerifying,
}: VerifyManualFormProps) {
  const canVerify = hash.trim().length === 64 && !isVerifying;

  return (
    <div>
      {/* Toggle button */}
      <div className="text-center mt-8">
        <button
          onClick={onToggle}
          className="text-sm text-landing-muted/50 bg-transparent border-none cursor-pointer transition-colors hover:text-landing-cream p-1"
        >
          No ZIP? Enter Origin ID and hash manually
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6">
              {/* Origin ID field */}
              <div className="mb-4">
                <label className="font-mono text-[10px] tracking-[2px] uppercase text-landing-muted/50 mb-2 block">
                  Origin ID
                </label>
                <input
                  type="text"
                  value={originId}
                  onChange={(e) => onOriginIdChange(e.target.value)}
                  placeholder="UUID from certificate.json (optional)"
                  className="w-full py-3.5 px-4 font-mono text-[13px] font-light bg-landing-muted/5 border border-landing-muted/10 text-landing-cream outline-none transition-colors focus:border-landing-copper/30 placeholder:text-landing-muted/30 rounded"
                />
                <p className="text-xs text-landing-muted/30 mt-1.5">
                  Optional. Used for proof retrieval
                </p>
              </div>

              {/* Hash field */}
              <div className="mb-4">
                <label className="font-mono text-[10px] tracking-[2px] uppercase text-landing-muted/50 mb-2 block">
                  SHA-256 Hash
                </label>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => onHashChange(e.target.value)}
                  placeholder="64-character hex string"
                  className="w-full py-3.5 px-4 font-mono text-[13px] font-light bg-landing-muted/5 border border-landing-muted/10 text-landing-cream outline-none transition-colors focus:border-landing-copper/30 placeholder:text-landing-muted/30 rounded"
                />
              </div>

              {/* Verify button */}
              <button
                onClick={onVerify}
                disabled={!canVerify}
                className="w-full py-3.5 font-mono text-[10px] tracking-[4px] uppercase bg-transparent text-landing-copper border border-landing-copper/25 cursor-pointer transition-all duration-300 hover:border-landing-copper hover:bg-landing-muted/5 disabled:opacity-30 disabled:cursor-not-allowed mt-2 rounded"
              >
                Verify
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
