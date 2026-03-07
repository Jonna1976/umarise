import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const layers = [
  { num: '1', label: 'artifact.{ext}', value: 'the original file (hash-verified)' },
  { num: '2', label: 'certificate.json', value: 'hash, origin_id, timestamps, device signature' },
  { num: '3', label: 'proof.ots', value: 'Bitcoin anchor (OpenTimestamps binary)' },
  { num: '4', label: 'VERIFY.txt', value: 'human-readable verification instructions' },
];

function CircumpunctIcon() {
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
      <circle cx="45" cy="45" r="40" stroke="hsl(var(--landing-copper))" strokeWidth="1.2" opacity={0.9} />
      <circle cx="45" cy="45" r="6" fill="hsl(var(--landing-copper))" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="58" height="70" viewBox="0 0 58 70" fill="none">
      <rect x="1" y="1" width="44" height="58" rx="2" stroke="hsl(var(--landing-copper))" strokeWidth="1.5" opacity={0.5} />
      <line x1="10" y1="20" x2="36" y2="20" stroke="hsl(var(--landing-copper))" strokeWidth="1" opacity={0.2} />
      <line x1="10" y1="30" x2="36" y2="30" stroke="hsl(var(--landing-copper))" strokeWidth="1" opacity={0.2} />
      <line x1="10" y1="40" x2="26" y2="40" stroke="hsl(var(--landing-copper))" strokeWidth="1" opacity={0.2} />
    </svg>
  );
}

/*
  Timeline (all times from mount):
  0.0s  – Only artifact visible (centered)
  1.5s  – Arrow appears, artifact+arrow start sliding right
  3.5s  – Circumpunct fades in at destination
  4.5s  – Artifact+arrow fade out (absorbed into circumpunct)
  5.0s  – "self-proving artifact" label + filename appear
  5.5s  – Bundle rows stagger in
  7.1s  – Equations appear
*/

type Step = 'artifact' | 'sliding' | 'arriving' | 'absorbed' | 'revealed';

export default function ArtifactPairVisual() {
  const [step, setStep] = useState<Step>('artifact');
  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const run = useCallback(() => {
    clear();
    setStep('artifact');
    setVisibleRows([]);

    at(() => setStep('sliding'), 1500);
    at(() => setStep('arriving'), 3500);
    at(() => setStep('absorbed'), 4500);
    at(() => setStep('revealed'), 5000);
    for (let i = 0; i < 4; i++) at(() => setVisibleRows(p => [...p, i]), 5500 + i * 400);
  }, []);

  useEffect(() => { run(); return clear; }, [runKey, run]);

  const replay = () => setRunKey(k => k + 1);

  const isSliding = step === 'sliding' || step === 'arriving';
  const showCircumpunct = step === 'arriving' || step === 'absorbed' || step === 'revealed';
  const showLabel = step === 'absorbed' || step === 'revealed';
  const showBundle = step === 'revealed';

  return (
    <div className="relative py-8" key={runKey}>
      <button
        onClick={replay}
        className="absolute top-2 right-2 w-8 h-8 rounded-full border border-[hsl(var(--landing-cream)/0.1)] flex items-center justify-center opacity-60 hover:opacity-100 hover:border-[hsl(var(--landing-copper)/0.3)] transition-all z-10"
        title="replay"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.5)]" />
      </button>

      {/* Stage — fixed height to prevent layout shift */}
      <div className="relative flex justify-center" style={{ minHeight: 160 }}>

        {/* Artifact + Arrow group — starts centered, slides right, fades out */}
        <motion.div
          className="flex items-center gap-4 absolute"
          initial={{ x: -60, opacity: 1 }}
          animate={
            step === 'artifact'
              ? { x: -60, opacity: 1 }
              : step === 'sliding'
                ? { x: 60, opacity: 1 }
                : step === 'arriving'
                  ? { x: 60, opacity: 1 }
                  : { x: 60, opacity: 0 }
          }
          transition={
            step === 'sliding'
              ? { duration: 2, ease: [0.4, 0, 0.2, 1] }
              : step === 'absorbed'
                ? { duration: 0.8, ease: 'easeOut' }
                : { duration: 0 }
          }
        >
          {/* File icon column */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--landing-cream))]">
              artifact
            </span>
            <FileIcon />
            <span className="font-mono text-xs text-[hsl(var(--landing-copper))]">
              contract.pdf
            </span>
          </div>

          {/* Arrow — only visible once sliding starts */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: isSliding ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="w-14 h-px bg-gradient-to-r from-[hsl(var(--landing-cream)/0.1)] to-[hsl(var(--landing-copper))]" />
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[hsl(var(--landing-copper))]" />
            </div>
            <span className="font-mono text-[8px] tracking-[0.16em] uppercase text-[hsl(var(--landing-cream))] whitespace-nowrap">
              anchoring
            </span>
          </motion.div>
        </motion.div>

        {/* Circumpunct — appears at destination */}
        <motion.div
          className="absolute flex flex-col items-center gap-3"
          style={{ right: 'calc(50% - 130px)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={showCircumpunct ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.span
            className="font-mono text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--landing-cream))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: showLabel ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            self-proving artifact
          </motion.span>
          <CircumpunctIcon />
          <motion.span
            className="font-mono text-xs text-[hsl(var(--landing-copper))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: showLabel ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            contract.pdf.proof
          </motion.span>
        </motion.div>
      </div>

      {/* Bundle + equations — below the stage */}
      <div className="flex flex-col items-center mt-8">
        <motion.div
          className="w-[280px] bg-[hsl(var(--landing-deep))] border border-[hsl(var(--landing-cream)/0.08)] rounded-md overflow-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={showBundle ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.6 }}
        >
          {layers.map((layer, i) => (
            <div
              key={layer.num}
              className={`flex items-start gap-3 px-3 py-2 transition-all duration-[400ms] ${i < layers.length - 1 ? 'border-b border-[hsl(var(--landing-cream)/0.04)]' : ''}`}
              style={{
                opacity: visibleRows.includes(i) ? 1 : 0,
                transform: visibleRows.includes(i) ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              <span className="font-mono text-[7.5px] text-[hsl(var(--landing-copper))] opacity-40 min-w-[10px] pt-px">{layer.num}</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8.5px] text-[hsl(var(--landing-cream))] opacity-85">{layer.label}</span>
                <span className="font-mono text-[7.5px] text-[hsl(var(--landing-cream))] opacity-40">{layer.value}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Equations */}
        <motion.div
          className="flex flex-col gap-1.5 items-start w-[280px] mt-5"
          initial={{ opacity: 0, y: 6 }}
          animate={visibleRows.length === 4 ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
            <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer"
              className="font-mono text-[9px] text-[hsl(var(--landing-cream))] opacity-40 hover:opacity-100 hover:text-[hsl(var(--landing-copper))] transition-all no-underline">
              verify-anchoring.org
            </a>
            <span className="text-[hsl(var(--landing-cream))] opacity-20 text-[9px]">·</span>
            <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer"
              className="font-mono text-[9px] text-[hsl(var(--landing-cream))] opacity-40 hover:opacity-100 hover:text-[hsl(var(--landing-copper))] transition-all no-underline">
              anchoring-spec.org
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
