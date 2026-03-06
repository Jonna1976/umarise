import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

const BASE = 'https://core.umarise.com';

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="absolute top-2 right-2 z-10 p-1.5 rounded bg-[hsl(220,10%,12%)] hover:bg-[hsl(220,10%,16%)] transition-colors border border-[hsl(var(--landing-cream)/0.1)]"
    >
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream))]" />}
    </button>
  );
}

function Code({ code, copy }: { code: string; copy?: string }) {
  return (
    <div className="relative">
      <CopyBtn text={copy ?? code} />
      <pre className="bg-[hsl(220,10%,8%)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 pr-14 text-[13px] font-mono text-[hsl(var(--landing-cream))] overflow-x-auto whitespace-pre leading-relaxed scrollbar-hide">{code}</pre>
    </div>
  );
}

export default function GetStartedFlow({ onUnlock }: { onUnlock?: (unlocked: boolean) => void } = {}) {
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);

  const generateKey = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/v1-developer-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Developer' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error?.message || 'Failed to generate key'); return; }
      setGeneratedKey(data.api_key);
      setStep(1);
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  };

  const copyKey = () => {
    if (generatedKey) { navigator.clipboard.writeText(generatedKey); setCopied(true); }
  };

  useEffect(() => { onUnlock?.(copied); }, [copied, onUnlock]);

  return (
    <div className="space-y-8">
      <div className="p-5 rounded-lg border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,6%)]">
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`font-mono text-lg font-bold ${step >= 1 ? 'text-emerald-400' : 'text-[hsl(var(--landing-copper))]'}`}>{step >= 1 ? '✓ 0' : '0'}</span>
          <h3 className={`font-medium ${step >= 1 ? 'text-emerald-400' : 'text-[hsl(var(--landing-cream))]'}`}>Get your API key</h3>
        </div>
        
        {!generatedKey ? (
          <div className="ml-7">
            <button onClick={generateKey} disabled={loading} className="px-6 py-2.5 rounded text-sm font-mono font-bold bg-[hsl(var(--landing-copper))] text-[hsl(220,10%,6%)] hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? (<span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-[hsl(220,10%,6%)/0.3] border-t-[hsl(220,10%,6%)] rounded-full animate-spin" />Generating...</span>) : 'Generate my API key'}
            </button>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
        ) : (
          <div className="ml-7 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded bg-[hsl(220,10%,8%)] border border-emerald-500/20">
              <code className="text-xs font-mono text-emerald-400 break-all flex-1 min-w-0">{generatedKey}</code>
              <button onClick={copyKey} className={`shrink-0 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all whitespace-nowrap ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[hsl(var(--landing-copper))] text-[hsl(220,10%,6%)] hover:opacity-90 animate-pulse'}`}>
                {copied ? <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Copied</span> : <span className="flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy key</span>}
              </button>
            </div>
            {!copied && (
              <p className="text-xs text-[hsl(var(--landing-cream)/0.35)] font-mono">
                Copy to continue. You can always generate a new one.
              </p>
            )}
            {copied && (
              <div className="flex items-center gap-3">
                <p className="text-xs font-mono text-emerald-400/70">✓ Key copied</p>
                <button
                  onClick={() => { setGeneratedKey(''); setCopied(false); setStep(0); onUnlock?.(false); }}
                  className="text-xs font-mono text-[hsl(var(--landing-cream)/0.3)] hover:text-[hsl(var(--landing-cream)/0.6)] transition-colors"
                >
                  Generate new key
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Install CLI */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.35] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">1</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Install CLI</h3>
        </div>
        <div className="ml-7 space-y-4">
          <div>
            <p className="text-xs text-[hsl(var(--landing-copper))] font-mono font-bold mb-2">1.1 Install</p>
            <Code code={`npm install -g @umarise/cli`} />
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--landing-copper))] font-mono font-bold mb-2">1.2 Paste API key into your terminal</p>
            <Code code={`export UMARISE_API_KEY=${generatedKey || 'um_your_key_here'}`} />
          </div>
        </div>
      </div>

      {/* Step 3: Anchor */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.35] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">2</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Anchor file</h3>
        </div>
        <div className="ml-7 space-y-4">
          <p className="text-[13px] text-[hsl(var(--landing-cream))]">Paste <code className="text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-copper)/0.1)] px-1.5 py-0.5 rounded">umarise proof</code> into your terminal, then drag your file in:</p>
          <div className="relative p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <CopyBtn text="umarise proof " />
            <p className="text-[13px] font-mono text-[hsl(var(--landing-cream))]">
              <span className="text-[hsl(var(--landing-cream))]">umarise proof </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>
          <p className="text-[13px] text-[hsl(var(--landing-cream))]">The terminal auto-fills the full path. Or type it manually:</p>
          <pre className="bg-[hsl(220,10%,8%)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 text-[13px] font-mono text-[hsl(var(--landing-muted))] whitespace-pre leading-relaxed">{`umarise proof contract.pdf\numarise proof ./designs/logo-final.png\numarise proof ~/Desktop/research-paper.docx`}</pre>

          <p className="text-[13px] text-[hsl(var(--landing-cream))] mt-2">Expected output:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
            <pre className="text-[13px] font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed">{`✓ hash: sha256:a1b2c3d4e5f6...
✓ anchored: origin_id f47ac10b-58cc-4372-a567-0e02b2c3d479`}</pre>
            <p className="text-[14px] font-mono text-[hsl(var(--landing-copper))] mt-2 font-bold">⏳ proof pending, wait for Bitcoin confirmation, run again later. Keep your terminal open.</p>
          </div>
        </div>
      </div>

      {/* Step 4: Save proof */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.35] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">3</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Save proof bundle</h3>
        </div>
        <div className="ml-7 space-y-4">
          <div className="mb-2">
            <p className="text-xs text-[hsl(var(--landing-copper))] font-mono font-bold mb-2">3.1 Run the same command again after ~2 hours (Bitcoin confirmation) and save the proof bundle</p>
          </div>
          <div className="relative p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <CopyBtn text="umarise proof " />
            <p className="text-[13px] font-mono text-[hsl(var(--landing-cream))]">
              <span className="text-[hsl(var(--landing-cream))]">umarise proof </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>

          <p className="text-[13px] text-[hsl(var(--landing-cream))] mt-2">Expected output:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
            <pre className="text-[13px] font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed">{`✓ hash: sha256:a1b2c3d4e5f6... (already anchored)
✓ anchored origin_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
✓ anchored in Bitcoin block 939270
✓ no later than: 2026-03-04
✓ saved: document.pdf.proof
✓ proof valid, independent of Umarise`}</pre>
          </div>

          <p className="text-[13px] text-[hsl(var(--landing-cream))]">The <code className="text-[hsl(var(--landing-copper))]">.proof</code> file is saved next to your original.</p>

          <div className="mt-4 pt-4 border-t border-[hsl(var(--landing-cream)/0.06)]">
            <p className="text-xs text-[hsl(var(--landing-copper))] font-mono font-bold mb-2">3.2 Inspect the bundle</p>
            <p className="text-[13px] text-[hsl(var(--landing-cream))] mb-3">The <code className="text-[hsl(var(--landing-copper))]">.proof</code> file is a ZIP. Unpack and inspect:</p>
            <Code code={`unzip document.pdf.proof\ncat certificate.json\ncat VERIFY.txt`} />
            <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
              <pre className="text-[13px] font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed">{`certificate.json  → origin metadata (hash, origin_id, timestamp, block)
proof.ots         → binary OpenTimestamps proof (Bitcoin anchor)
VERIFY.txt        → independent verification instructions`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Verify */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.35] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">4</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Verify</h3>
        </div>
        <div className="ml-7 space-y-4">
          <p className="text-[13px] text-[hsl(var(--landing-cream))]">No API key required. Works offline.</p>
          <p className="text-[13px] text-[hsl(var(--landing-cream))]">Type <code className="text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-copper)/0.1)] px-1.5 py-0.5 rounded">umarise verify</code> then drag your file into the terminal:</p>
          <div className="relative p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <CopyBtn text="umarise verify " />
            <p className="text-[13px] font-mono text-[hsl(var(--landing-cream))]">
              <span className="text-[hsl(var(--landing-cream))]">umarise verify </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>
          <p className="text-[13px] text-[hsl(var(--landing-cream))]">The CLI finds <code className="text-[hsl(var(--landing-copper))]">.proof</code> automatically next to your file.</p>
          <p className="text-[13px] text-[hsl(var(--landing-cream))] mt-2">Expected output:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
            <pre className="text-[13px] font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed">{`✓ hash matches
✓ anchored in Bitcoin block 939582
✓ no later than: 2026-03-06
✓ proof valid, independent of Umarise`}</pre>
          </div>
        </div>
      </div>

    </div>
  );
}
