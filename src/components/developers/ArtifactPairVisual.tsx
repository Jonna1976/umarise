import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const layers = [
  { num: '1', label: 'artifact.{ext}', value: 'the original file (hash-verified)' },
  { num: '2', label: 'certificate.json', value: 'hash, origin_id, timestamps, device signature' },
  { num: '3', label: 'proof.ots', value: 'Bitcoin anchor (OpenTimestamps binary)' },
  { num: '4', label: 'VERIFY.txt', value: 'human-readable verification instructions' },
];

/** Circumpunct SVG — concentric circles with pulse ring */
function CircumpunctIcon({ flash }: { flash?: boolean }) {
  return (
    <svg viewBox="0 0 90 90" fill="none" className="w-[90px] h-[90px]">
      <motion.circle
        cx="45" cy="45" r="40"
        stroke="hsl(var(--landing-copper))"
        strokeWidth="1.2"
        animate={{ opacity: [0.55, 0, 0.55], scale: [1, 1.28, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '45px 45px' }}
      />
      <motion.circle
        cx="45" cy="45" r="40"
        stroke="hsl(var(--landing-copper))"
        strokeWidth="1.2"
        opacity={0.9}
        animate={flash ? { opacity: [0.9, 1, 0.9] } : {}}
        transition={flash ? { duration: 0.6, ease: 'easeOut' } : {}}
      />
      <circle cx="45" cy="45" r="6" fill="hsl(var(--landing-copper))" />
    </svg>
  );
}

/** File icon SVG */
function FileIcon() {
  return (
    <svg width="58" height="70" viewBox="0 0 58 70" fill="none" className="w-[58px] h-[70px]">
      <rect x="1" y="1" width="44" height="58" rx="2" stroke="hsl(var(--landing-copper))" strokeWidth="1.5" opacity={0.5} />
      <line x1="10" y1="20" x2="36" y2="20" stroke="hsl(var(--landing-copper))" strokeWidth="1" opacity={0.2} />
      <line x1="10" y1="30" x2="36" y2="30" stroke="hsl(var(--landing-copper))" strokeWidth="1" opacity={0.2} />
      <line x1="10" y1="40" x2="26" y2="40" stroke="hsl(var(--landing-copper))" strokeWidth="1" opacity={0.2} />
    </svg>
  );
}

type Phase = 'idle' | 'sliding' | 'absorbed' | 'revealed';

export default function ArtifactPairVisual() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [flash, setFlash] = useState(false);

  const runAnimation = useCallback(() => {
    setPhase('idle');
    setFlash(false);

    // Start slide after brief pause
    const t1 = setTimeout(() => setPhase('sliding'), 1500);
    // Absorbed: artifact has merged into circumpunct
    const t2 = setTimeout(() => {
      setPhase('absorbed');
      setFlash(true);
    }, 5500);
    // Reveal bundle contents
    const t3 = setTimeout(() => setPhase('revealed'), 6100);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    return runAnimation();
  }, [runAnimation]);

  const replay = () => {
    runAnimation();
  };

  const isSliding = phase === 'sliding';
  const isAbsorbed = phase === 'absorbed' || phase === 'revealed';
  const isRevealed = phase === 'revealed';

  return (
    <div className="flex flex-col items-center gap-8 py-8 relative">
      {/* Replay button */}
      <button
        onClick={replay}
        className="absolute top-2 right-2 w-8 h-8 rounded-full border border-[hsl(var(--landing-cream)/0.1)] flex items-center justify-center opacity-60 hover:opacity-100 hover:border-[hsl(var(--landing-copper)/0.3)] transition-all"
        title="replay"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.5)]" />
      </button>

      {/* Main row: artifact → arrow → circumpunct */}
      <div className="flex items-start justify-center gap-0 w-full max-w-[640px]">
        {/* LEFT: Artifact */}
        <motion.div
          className="w-[160px] flex flex-col items-center gap-4"
          animate={
            isSliding
              ? { x: 220, opacity: 0 }
              : isAbsorbed
                ? { x: 220, opacity: 0 }
                : { x: 0, opacity: 1 }
          }
          transition={
            isSliding
              ? { duration: 4, ease: [0.6, 0, 0.35, 1] }
              : { duration: 0 }
          }
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--landing-cream))] h-[14px] flex items-center">
            artifact
          </span>
          <div className="w-[90px] h-[90px] flex items-center justify-center">
            <FileIcon />
          </div>
          <span className="font-mono text-xs text-[hsl(var(--landing-copper))] h-[18px] flex items-center">
            contract.pdf
          </span>
        </motion.div>

        {/* ARROW */}
        <motion.div
          className="flex flex-col items-center gap-1.5 px-4 mt-[57px] shrink-0"
          animate={
            isSliding
              ? { x: 220, opacity: 0 }
              : isAbsorbed
                ? { x: 220, opacity: 0 }
                : { x: 0, opacity: 1 }
          }
          transition={
            isSliding
              ? { duration: 4, ease: [0.6, 0, 0.35, 1] }
              : { duration: 0 }
          }
        >
          <div className="flex items-center">
            <div className="w-14 h-px bg-gradient-to-r from-[hsl(var(--landing-cream)/0.1)] to-[hsl(var(--landing-copper))]" />
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[hsl(var(--landing-copper))]" />
          </div>
          <span className="font-mono text-[8px] tracking-[0.16em] uppercase text-[hsl(var(--landing-cream))] whitespace-nowrap">
            anchoring
          </span>
        </motion.div>

        {/* RIGHT: Self-proving artifact */}
        <motion.div
          className="w-[260px] flex flex-col items-center gap-4"
          animate={{ opacity: isAbsorbed ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--landing-cream))] h-[14px] flex items-center">
            self-proving artifact
          </span>
          <div className="w-[90px] h-[90px] flex items-center justify-center">
            <CircumpunctIcon flash={flash} />
          </div>

          {/* Proof filename */}
          <motion.span
            className="font-mono text-xs text-[hsl(var(--landing-copper))] h-[18px] flex items-center"
            animate={{ opacity: isRevealed ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            contract.pdf.proof
          </motion.span>

          {/* Bundle contents */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                className="w-full bg-[hsl(var(--landing-deep))] border border-[hsl(var(--landing-cream)/0.08)] rounded-md overflow-hidden"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {layers.map((layer, i) => (
                  <motion.div
                    key={layer.num}
                    className={`flex items-start gap-3 px-3 py-2 ${i < layers.length - 1 ? 'border-b border-[hsl(var(--landing-cream)/0.04)]' : ''}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + i * 0.4 }}
                  >
                    <span className="font-mono text-[7.5px] text-[hsl(var(--landing-copper))] opacity-40 min-w-[10px] pt-px">{layer.num}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[8.5px] text-[hsl(var(--landing-cream))] opacity-85">{layer.label}</span>
                      <span className="font-mono text-[7.5px] text-[hsl(var(--landing-cream))] opacity-40">{layer.value}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Equations */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                className="flex flex-col gap-1.5 items-start w-full mt-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + 4 * 0.4 }}
              >
                <div className="font-mono text-[10px] flex items-center">
                  <span className="text-[hsl(var(--landing-cream))] opacity-70">artifact.proof</span>
                  <span className="text-[hsl(var(--landing-cream))] opacity-30 mx-0.5">=</span>
                  <span className="text-[hsl(var(--landing-copper))]">self-proving</span>
                </div>
                <div className="font-mono text-[10px] flex items-center">
                  <span className="text-[hsl(var(--landing-cream))] opacity-70">artifact alone</span>
                  <span className="text-[hsl(var(--landing-cream))] opacity-30 mx-0.5">=</span>
                  <span className="text-[hsl(var(--landing-copper))] opacity-60">no proof</span>
                </div>
                <div className="mt-3.5 flex items-center gap-1.5">
                  <a
                    href="https://verify-anchoring.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] text-[hsl(var(--landing-cream))] opacity-40 hover:opacity-100 hover:text-[hsl(var(--landing-copper))] transition-all no-underline"
                  >
                    verify-anchoring.org
                  </a>
                  <span className="text-[hsl(var(--landing-cream))] opacity-20 text-[9px]">·</span>
                  <a
                    href="https://anchoring-spec.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] text-[hsl(var(--landing-cream))] opacity-40 hover:opacity-100 hover:text-[hsl(var(--landing-copper))] transition-all no-underline"
                  >
                    anchoring-spec.org
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
