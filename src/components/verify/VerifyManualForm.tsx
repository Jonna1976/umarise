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
          className="font-garamond italic text-[13px] text-ritual-gold-muted bg-transparent border-none cursor-pointer transition-colors hover:text-ritual-gold p-1"
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
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-ritual-gold-muted mb-2 block">
                  Origin ID
                </label>
                <input
                  type="text"
                  value={originId}
                  onChange={(e) => onOriginIdChange(e.target.value)}
                  placeholder="UUID from certificate.json (optional)"
                  className="w-full py-3.5 px-4 font-mono text-[13px] font-light bg-ritual-surface border border-ritual-gold/[0.08] text-ritual-cream outline-none transition-colors focus:border-ritual-gold/30 placeholder:text-ritual-cream-20"
                />
                <p className="font-garamond italic text-xs text-ritual-gold/30 mt-1.5">
                  Optional — used for proof retrieval
                </p>
              </div>

              {/* Hash field */}
              <div className="mb-4">
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-ritual-gold-muted mb-2 block">
                  SHA-256 Hash
                </label>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => onHashChange(e.target.value)}
                  placeholder="64-character hex string"
                  className="w-full py-3.5 px-4 font-mono text-[13px] font-light bg-ritual-surface border border-ritual-gold/[0.08] text-ritual-cream outline-none transition-colors focus:border-ritual-gold/30 placeholder:text-ritual-cream-20"
                />
              </div>

              {/* Verify button */}
              <button
                onClick={onVerify}
                disabled={!canVerify}
                className="w-full py-3.5 font-mono text-[10px] tracking-[4px] uppercase bg-transparent text-ritual-gold border border-ritual-gold/25 cursor-pointer transition-all duration-300 hover:border-ritual-gold hover:bg-ritual-gold/[0.04] disabled:opacity-30 disabled:cursor-not-allowed mt-2"
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
