import { motion } from 'framer-motion';
import { FileText, ShieldCheck } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
});

const slideIn = (delay = 0) => ({
  initial: { opacity: 0, x: -6 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

const layers = [
  { num: '1', label: 'artifact hash', value: 'sha256: 9f3a4b2c…e7f1d8a0', variant: 'default' },
  { num: '2', label: 'timestamp anchor', value: 'Bitcoin block 884201 — 2026-03-06', variant: 'default' },
  { num: '3', label: 'device signature', value: 'passkey · human anchored', variant: 'gold' },
  { num: '4', label: 'verification metadata', value: 'anchoring-spec.org · v1', variant: 'dim' },
] as const;

export default function ArtifactPairVisual() {
  return (
    <div className="flex flex-col items-center gap-12 py-8">
      {/* Siamese pair */}
      <motion.div className="flex flex-col items-center gap-0" {...fadeIn()}>
        <div className="group flex items-stretch relative">
          {/* Gold spine */}
          <div className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 z-10 bg-gradient-to-b from-transparent via-[hsl(var(--landing-copper))] to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

          {/* Artifact card */}
          <div className="w-[200px] p-7 pb-6 flex flex-col gap-3 items-start border border-[hsl(var(--landing-cream)/0.15)] border-r-0 rounded-l bg-[hsl(var(--landing-cream)/0.04)] group-hover:bg-[hsl(var(--landing-copper)/0.04)] group-hover:border-[hsl(var(--landing-copper)/0.3)] transition-all duration-300">
            <FileText className="w-7 h-7 text-[hsl(var(--landing-cream))]" strokeWidth={1.2} />
            <div className="font-mono text-xs text-[hsl(var(--landing-cream))] tracking-wider">artifact</div>
            <div className="font-mono text-[10px] text-[hsl(var(--landing-cream))] opacity-55 tracking-widest">contract.pdf</div>
          </div>

          {/* Proof card */}
          <div className="w-[200px] p-7 pb-6 flex flex-col gap-3 items-start border border-[hsl(var(--landing-cream)/0.15)] border-l-0 rounded-r bg-[hsl(var(--landing-cream)/0.04)] group-hover:bg-[hsl(var(--landing-copper)/0.04)] group-hover:border-[hsl(var(--landing-copper)/0.3)] transition-all duration-300">
            <ShieldCheck className="w-7 h-7 text-[hsl(var(--landing-copper))]" strokeWidth={1.2} />
            <div className="font-mono text-xs text-[hsl(var(--landing-copper))] tracking-wider">artifact.proof</div>
            <div className="font-mono text-[10px] text-[hsl(var(--landing-copper))] opacity-55 tracking-widest">contract.pdf.proof</div>
          </div>
        </div>

        {/* Connector */}
        <div className="w-[400px] max-w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--landing-cream)/0.2)] to-transparent relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[hsl(var(--landing-deep))] px-3 font-mono text-[9px] tracking-[3px] uppercase text-[hsl(var(--landing-cream))] opacity-55 whitespace-nowrap">
            travel together
          </span>
        </div>
      </motion.div>

      {/* Proof layers */}
      <motion.div className="w-[400px] max-w-full flex flex-col" {...fadeIn(0.15)}>
        {layers.map((layer, i) => (
          <motion.div
            key={layer.num}
            className={`flex items-center px-5 py-3.5 border border-[hsl(var(--landing-cream)/0.15)] gap-4 transition-colors hover:bg-[hsl(var(--landing-cream)/0.04)] ${
              i === 0 ? 'rounded-t border-b-0' : i === layers.length - 1 ? 'rounded-b' : 'border-b-0'
            }`}
            {...slideIn(0.2 + i * 0.08)}
          >
            <span className="font-mono text-[9px] text-[hsl(var(--landing-copper))] w-4 shrink-0">{layer.num}</span>
            <div className="flex-1">
              <div className={`font-mono text-[11px] tracking-wider mb-0.5 ${
                layer.variant === 'gold' ? 'text-[hsl(var(--landing-copper))]' :
                'text-[hsl(var(--landing-cream))]'
              }`}>{layer.label}</div>
              <div className={`font-mono text-[10px] tracking-wide opacity-55 ${
                layer.variant === 'gold' ? 'text-[hsl(var(--landing-copper))]' :
                'text-[hsl(var(--landing-cream))]'
              }`}>{layer.value}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Truth table */}
      <motion.div className="font-mono text-[11px] tracking-wider leading-relaxed space-y-1.5" {...fadeIn(0.3)}>
        <div className="text-[hsl(var(--landing-cream))]">
          artifact + artifact.proof <span className="text-[hsl(var(--landing-copper))]">= proof</span>
        </div>
        <div className="text-[hsl(var(--landing-cream))]">
          artifact alone <span className="opacity-55">= no proof</span>
        </div>
        <div className="text-[hsl(var(--landing-cream))]">
          artifact.proof alone <span className="opacity-55">= incomplete</span>
        </div>
      </motion.div>
    </div>
  );
}
