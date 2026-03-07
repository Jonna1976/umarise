import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

const layers = [
  { num: '1', label: 'artifact.{ext}', value: 'the original file (hash-verified)' },
  { num: '2', label: 'certificate.json', value: 'hash, origin_id, timestamps, device signature' },
  { num: '3', label: 'proof.ots', value: 'Bitcoin anchor (OpenTimestamps binary)' },
  { num: '4', label: 'VERIFY.txt', value: 'human-readable verification instructions' },
];

function CircumpunctIcon({ flash }: { flash: boolean }) {
  return (
    <svg viewBox="0 0 90 90" fill="none" className="w-[90px] h-[90px]">
      <circle
        cx="45" cy="45" r="40"
        stroke="hsl(var(--landing-copper))"
        strokeWidth="1.2"
        className="animate-[circumpunct-pulse_2.8s_ease-in-out_infinite]"
        style={{ transformOrigin: '45px 45px' }}
      />
      <circle
        cx="45" cy="45" r="40"
        stroke="hsl(var(--landing-copper))"
        strokeWidth="1.2"
        opacity={0.9}
        className={flash ? 'animate-[absorb-flash_0.6s_ease-out_forwards]' : ''}
      />
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

export default function ArtifactPairVisual() {
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle');
  const [rightVisible, setRightVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [filenameVisible, setFilenameVisible] = useState(false);
  const [bundleVisible, setBundleVisible] = useState(false);
  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const [equationsVisible, setEquationsVisible] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const run = useCallback(() => {
    clear();
    setPhase('idle');
    setRightVisible(false);
    setFlash(false);
    setFilenameVisible(false);
    setBundleVisible(false);
    setVisibleRows([]);
    setEquationsVisible(false);

    at(() => setPhase('animating'), 100);
    at(() => setRightVisible(true), 1300);
    at(() => setFlash(true), 4000);
    at(() => setFilenameVisible(true), 4700);
    at(() => setBundleVisible(true), 5100);
    for (let i = 0; i < 4; i++) {
      at(() => setVisibleRows(p => [...p, i]), 5500 + i * 400);
    }
    at(() => setEquationsVisible(true), 5500 + 4 * 400);
  }, []);

  useEffect(() => { run(); return clear; }, [runKey, run]);

  const replay = () => setRunKey(k => k + 1);

  return (
    <div className="relative py-8" key={runKey}>
      {/* Replay button */}
      <button
        onClick={replay}
        className="absolute top-2 right-2 w-8 h-8 rounded-full border border-[hsl(var(--landing-cream)/0.1)] flex items-center justify-center opacity-60 hover:opacity-100 hover:border-[hsl(var(--landing-copper)/0.3)] transition-all z-10"
        title="replay"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.5)]" />
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes artifact-slide {
          0%   { transform: translateX(0);     opacity: 1; }
          65%  { transform: translateX(140px); opacity: 1; }
          100% { transform: translateX(220px); opacity: 0; }
        }
        @keyframes circumpunct-pulse {
          0%   { opacity: 0.55; transform: scale(1); }
          60%  { opacity: 0;    transform: scale(1.28); }
          100% { opacity: 0.55; transform: scale(1); }
        }
        @keyframes absorb-flash {
          0%   { opacity: 0.9; }
          30%  { opacity: 1;   filter: drop-shadow(0 0 8px hsl(var(--landing-copper))); }
          100% { opacity: 0.9; filter: none; }
        }
      `}</style>

      {/* Main row — 3 columns */}
      <div className="flex items-start justify-center w-full max-w-[640px] mx-auto" style={{ gap: 0 }}>

        {/* LEFT: artifact */}
        <div
          className="w-[160px] flex flex-col items-center gap-4"
          style={phase === 'animating' ? {
            animation: 'artifact-slide 4.0s cubic-bezier(0.6, 0, 0.35, 1) forwards',
          } : undefined}
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
        </div>

        {/* ARROW */}
        <div
          className="flex flex-col items-center gap-1.5 px-4 flex-shrink-0"
          style={{
            marginTop: 57,
            ...(phase === 'animating' ? {
              animation: 'artifact-slide 4.0s cubic-bezier(0.6, 0, 0.35, 1) forwards',
            } : {}),
          }}
        >
          <div className="flex items-center">
            <div className="w-14 h-px" style={{ background: `linear-gradient(to right, hsl(var(--landing-cream) / 0.1), hsl(var(--landing-copper)))` }} />
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[hsl(var(--landing-copper))]" />
          </div>
          <span className="font-mono text-[8px] tracking-[0.16em] uppercase text-[hsl(var(--landing-cream))] whitespace-nowrap">
            anchoring
          </span>
        </div>

        {/* RIGHT: self-proving artifact */}
        <div
          className="w-[260px] flex flex-col items-center gap-4 transition-opacity duration-[800ms] ease-in-out"
          style={{ opacity: rightVisible ? 1 : 0 }}
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--landing-cream))] h-[14px] flex items-center">
            self-proving artifact
          </span>
          <div className="w-[90px] h-[90px] flex items-center justify-center">
            <CircumpunctIcon flash={flash} />
          </div>
          <span
            className="font-mono text-xs text-[hsl(var(--landing-copper))] h-[18px] flex items-center transition-opacity duration-500"
            style={{ opacity: filenameVisible ? 1 : 0 }}
          >
            contract.pdf.proof
          </span>

          {/* Bundle */}
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
            className="flex flex-col gap-1.5 items-start w-full mt-1 transition-all duration-[600ms]"
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
          </div>
        </div>
      </div>
    </div>
  );
}
