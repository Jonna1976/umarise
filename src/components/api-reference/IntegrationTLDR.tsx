import { Zap, Package, Key, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function TLDRCodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)] p-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.45)] mb-2">{label}</p>
      <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.85)] whitespace-pre-wrap break-all leading-relaxed">{code}</pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.6)]" />}
      </button>
    </div>
  );
}

export default function IntegrationTLDR() {
  return (
    <section id="tldr" className="border border-[hsl(var(--landing-copper)/0.25)] rounded-lg p-6 bg-[hsl(var(--landing-copper)/0.04)]">
      {/* Header */}
      <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))] mb-4">Integration TL;DR</h2>

      {/* What it is */}
      <p className="text-[hsl(var(--landing-cream))] text-base font-serif mb-1">
        Umarise Core anchors SHA-256 hashes to the Bitcoin blockchain. Immutable proof that data existed at a specific moment.
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
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs">attest() + verify()</p>
          </div>
        </div>
      </div>

      {/* Minimal code */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <TLDRCodeBlock label="Node.js" code={`import { anchor, verify, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

const hash = await hashBuffer(readFileSync('contract.pdf'));
const result = await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });

// Verify (public, no key)
const check = await verify(hash);`} />
        <TLDRCodeBlock label="Python" code={`from umarise import UmariseCore, hash_buffer
import os

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])
file_hash = hash_buffer(open("contract.pdf", "rb").read())
origin = core.attest(file_hash)

# Verify (public, no key)
result = UmariseCore().verify(file_hash)`} />
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
