import { Zap, Package, Key, ArrowRight } from 'lucide-react';

export default function IntegrationTLDR() {
  return (
    <section className="border border-[hsl(var(--landing-copper)/0.25)] rounded-lg p-6 bg-[hsl(var(--landing-copper)/0.04)]">
      {/* What it is */}
      <p className="text-[hsl(var(--landing-cream))] text-base font-serif mb-1">
        Umarise Core anchors SHA-256 hashes to the Bitcoin blockchain — immutable proof that data existed at a specific moment.
      </p>
      <p className="text-[hsl(var(--landing-cream)/0.55)] text-xs font-mono mb-6">
        You hash locally. We anchor. Anyone can verify. No files leave your system.
      </p>

      {/* What you need */}
      <h3 className="text-[hsl(var(--landing-cream)/0.5)] text-[10px] font-mono uppercase tracking-[0.15em] mb-3">What you need</h3>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="flex items-start gap-2.5 p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
          <Key className="w-4 h-4 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
          <div>
            <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium">API Key</p>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs">
              <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:underline">partners@umarise.com</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
          <Package className="w-4 h-4 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
          <div>
            <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium">SDK</p>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs">Node.js or Python</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
          <Zap className="w-4 h-4 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
          <div>
            <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium">2 functions</p>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs">anchor() + verify()</p>
          </div>
        </div>
      </div>

      {/* Minimal code */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)] p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.45)] mb-2">Node.js</p>
          <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.85)] whitespace-pre leading-relaxed">{`import { anchor, verify } from '@umarise/anchor';

// Attest a hash
await anchor(hash, { apiKey });

// Verify (public, no key)
const result = await verify(hash);`}</pre>
        </div>
        <div className="rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)] p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.45)] mb-2">Python</p>
          <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.85)] whitespace-pre leading-relaxed">{`import umarise

# Attest a hash
umarise.anchor(hash, api_key=key)

# Verify (public, no key)
result = umarise.verify(hash)`}</pre>
        </div>
      </div>

      {/* SDK links */}
      <div className="flex flex-wrap gap-3">
        <a
          href="https://github.com/Jonna1976/umarise-anchor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[hsl(var(--landing-cream)/0.9)] bg-[hsl(var(--landing-copper)/0.15)] hover:bg-[hsl(var(--landing-copper)/0.25)] border border-[hsl(var(--landing-copper)/0.2)] transition-colors"
        >
          Node.js SDK <ArrowRight className="w-3 h-3" />
        </a>
        <a
          href="https://github.com/Jonna1976/umarise-python"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[hsl(var(--landing-cream)/0.9)] bg-[hsl(var(--landing-copper)/0.15)] hover:bg-[hsl(var(--landing-copper)/0.25)] border border-[hsl(var(--landing-copper)/0.2)] transition-colors"
        >
          Python SDK <ArrowRight className="w-3 h-3" />
        </a>
        <a
          href="#quick-start"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[hsl(var(--landing-cream)/0.6)] hover:text-[hsl(var(--landing-cream)/0.9)] bg-[hsl(var(--landing-cream)/0.04)] hover:bg-[hsl(var(--landing-cream)/0.08)] transition-colors"
        >
          curl Quick Start ↓
        </a>
      </div>
    </section>
  );
}
