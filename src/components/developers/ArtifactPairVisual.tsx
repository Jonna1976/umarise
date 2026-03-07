import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const layers = [
  { num: '1', label: 'artifact.{ext}', value: 'the original file (hash-verified)' },
  { num: '2', label: 'certificate.json', value: 'hash, origin_id, timestamps, device signature' },
  { num: '3', label: 'proof.ots', value: 'Bitcoin anchor (OpenTimestamps binary)' },
  { num: '4', label: 'VERIFY.txt', value: 'human-readable verification instructions' },
];

/** Circumpunct SVG */
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
        animate={flash ? { filter: ['none', 'drop-shadow(0 0 8px hsl(var(--landing-copper)))', 'none'] } : {}}
        transition={flash ? { duration: 0.6 } : {}}
        opacity={0.9}
      />
      <circle cx="45" cy="45" r="6" fill="hsl(var(--landing-copper))" />
    </svg>
  );
}

/** File icon SVG */
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

export default function ArtifactPairVisual() {
  const [key, setKey] = useState(0);
  const [rightVisible, setRightVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [filenameVisible, setFilenameVisible] = useState(false);
  const [bundleVisible, setBundleVisible] = useState(false);
  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const [equationsVisible, setEquationsVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const runAnimation = useCallback(() => {
    clearTimers();
    setRightVisible(false);
    setFlash(false);
    setFilenameVisible(false);
    setBundleVisible(false);
    setVisibleRows([]);
    setEquationsVisible(false);

    // Right side fades in while artifact is still sliding (1.2s into 4s slide)
    schedule(() => setRightVisible(true), 1200);
    // Flash when artifact "arrives" at circumpunct (~3.9s)
    schedule(() => setFlash(true), 3900);
    // Filename appears
    schedule(() => setFilenameVisible(true), 4600);
    // Bundle appears
    schedule(() => setBundleVisible(true), 5000);
    // Rows stagger in
    for (let i = 0; i < 4; i++) {
      schedule(() => setVisibleRows(prev => [...prev, i]), 5400 + i * 400);
    }
    // Equations
    schedule(() => setEquationsVisible(true), 5400 + 4 * 400);
  }, []);

  useEffect(() => {
    const t = setTimeout(runAnimation, 800);
    return () => { clearTimeout(t); clearTimers(); };
  }, [key, runAnimation]);

  const replay = () => {
    setKey(k => k + 1);
  };

  const slideEase = [0.6, 0, 0.35, 1] as const;
  const slideTransition = { duration: 4, ease: slideEase as unknown as [number, number, number, number] };

  return (
    <div className="flex flex-col items-center gap-8 py-8 relative" key={key}>
      {/* Replay button */}
      <button
        onClick={replay}
        className="absolute top-2 right-2 w-8 h-8 rounded-full border border-[hsl(var(--landing-cream)/0.1)] flex items-center justify-center opacity-60 hover:opacity-100 hover:border-[hsl(var(--landing-copper)/0.3)] transition-all"
        title="replay"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.5)]" />
      </button>

      {/* Main row */}
      <div className="flex items-start justify-center gap-0 w-full max-w-[640px]">
        {/* LEFT: Artifact (slides right) */}
        <motion.div
          className="w-[160px] flex flex-col items-center gap-4"
          variants={slideVariants}
          initial="initial"
          animate="animate"
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

        {/* ARROW (slides right with artifact) */}
        <motion.div
          className="flex flex-col items-center gap-1.5 px-4 mt-[57px] shrink-0"
          variants={slideVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center">
            <div className="w-14 h-px bg-gradient-to-r from-[hsl(var(--landing-cream)/0.1)] to-[hsl(var(--landing-copper))]" />
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[hsl(var(--landing-copper))]" />
          </div>
          <span className="font-mono text-[8px] tracking-[0.16em] uppercase text-[hsl(var(--landing-cream))] whitespace-nowrap">
            anchoring
          </span>
        </motion.div>

        {/* RIGHT: Self-proving artifact (fades in while artifact slides) */}
        <div
          className="w-[260px] flex flex-col items-center gap-4 transition-opacity duration-[800ms] ease-out"
          style={{ opacity: rightVisible ? 1 : 0 }}
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--landing-cream))] h-[14px] flex items-center">
            self-proving artifact
          </span>
          <div className="w-[90px] h-[90px] flex items-center justify-center">
            <CircumpunctIcon flash={flash} />
          </div>

          {/* Proof filename */}
          <span
            className="font-mono text-xs text-[hsl(var(--landing-copper))] h-[18px] flex items-center transition-opacity duration-500"
            style={{ opacity: filenameVisible ? 1 : 0 }}
          >
            contract.pdf.proof
          </span>

          {/* Bundle contents */}
          <div
            className="w-full bg-[hsl(var(--landing-deep))] border border-[hsl(var(--landing-cream)/0.08)] rounded-md overflow-hidden transition-all duration-[600ms]"
            style={{
              opacity: bundleVisible ? 1 : 0,
              transform: bundleVisible ? 'translateY(0)' : 'translateY(8px)',
            }}
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
          </div>

          {/* Equations */}
          <div
            className="flex flex-col gap-1.5 items-start w-full mt-3 transition-all duration-[600ms]"
            style={{
              opacity: equationsVisible ? 0.8 : 0,
              transform: equationsVisible ? 'translateY(0)' : 'translateY(6px)',
            }}
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
          </div>
        </div>
      </div>
    </div>
  );
}
