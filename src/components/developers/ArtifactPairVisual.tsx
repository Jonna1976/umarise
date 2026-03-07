import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';

const layers = [
  { num: '1', label: 'artifact.{ext}', value: 'the original file (hash-verified)' },
  { num: '2', label: 'certificate.json', value: 'hash, origin_id, timestamps, device signature' },
  { num: '3', label: 'proof.ots', value: 'Bitcoin anchor (OpenTimestamps binary)' },
  { num: '4', label: 'VERIFY.txt', value: 'human-readable verification instructions' },
];

/** Circumpunct SVG — three concentric circles */
function CircumpunctIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} fill="none">
      <motion.circle
        cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="0.9"
        animate={{ opacity: [0.9, 0.4, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="14" cy="14" r="7.5" stroke="currentColor" strokeWidth="0.5"
        animate={{ opacity: [0.3, 0.15, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.circle
        cx="14" cy="14" r="2.8" fill="currentColor"
        animate={{ opacity: [0.95, 0.5, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
    </svg>
  );
}

export default function ArtifactPairVisual() {
  const [transformed, setTransformed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTransformed(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 py-8">
      {/* Single card: artifact → self-proving artifact */}
      <motion.div
        className="flex flex-col items-center gap-0"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="w-[240px] p-7 pb-6 flex flex-col gap-3 items-start border border-[hsl(var(--landing-cream)/0.15)] rounded-md bg-[hsl(var(--landing-cream)/0.04)]"
          layout
        >
          <AnimatePresence mode="wait">
            {!transformed ? (
              <motion.div
                key="file-icon"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <FileText className="w-7 h-7 text-[hsl(var(--landing-cream))]" strokeWidth={1.2} />
              </motion.div>
            ) : (
              <motion.div
                key="circumpunct"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CircumpunctIcon className="w-7 h-7 text-[hsl(var(--landing-copper))]" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!transformed ? (
              <motion.div key="artifact-label" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="font-mono text-xs text-[hsl(var(--landing-cream))] tracking-wider">artifact</div>
                <div className="font-mono text-[10px] text-[hsl(var(--landing-cream))] opacity-55 tracking-widest">contract.pdf</div>
              </motion.div>
            ) : (
              <motion.div
                key="spa-label"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="font-mono text-xs text-[hsl(var(--landing-cream))] tracking-wider">self-proving artifact</div>
                <div className="font-mono text-[10px] text-[hsl(var(--landing-copper))] opacity-55 tracking-widest">contract.pdf.proof</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Anchoring indicator — visible before transform */}
        <AnimatePresence>
          {!transformed && (
            <motion.div
              className="mt-4 font-mono text-[9px] tracking-[3px] uppercase text-[hsl(var(--landing-cream))] opacity-40"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              anchoring…
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Proof layers — revealed only after transformation */}
      <AnimatePresence>
        {transformed && (
          <motion.div
            className="w-[400px] max-w-full flex flex-col"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            {layers.map((layer, i) => (
              <motion.div
                key={layer.num}
                className={`flex items-center px-5 py-3.5 border border-[hsl(var(--landing-cream)/0.15)] gap-4 transition-colors hover:bg-[hsl(var(--landing-cream)/0.04)] ${
                  i === 0 ? 'rounded-t border-b-0' : i === layers.length - 1 ? 'rounded-b' : 'border-b-0'
                }`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
              >
                <span className="font-mono text-[9px] text-[hsl(var(--landing-copper))] w-4 shrink-0">{layer.num}</span>
                <div className="flex-1">
                  <div className="font-mono text-[11px] tracking-wider mb-0.5 text-[hsl(var(--landing-cream))]">{layer.label}</div>
                  <div className="font-mono text-[10px] tracking-wide opacity-55 text-[hsl(var(--landing-cream))]">{layer.value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Truth table — only after transformation */}
      <AnimatePresence>
        {transformed && (
          <motion.div
            className="font-mono text-[11px] tracking-wider leading-relaxed space-y-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: 'easeOut' }}
          >
            <div className="text-[hsl(var(--landing-cream))]">
              artifact.proof <span className="text-[hsl(var(--landing-copper))]">= self-proving</span>
            </div>
            <div className="text-[hsl(var(--landing-cream))]">
              artifact alone <span className="opacity-55">= no proof</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
