import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const BASE = 'https://core.umarise.com';

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="absolute top-2 right-2 p-1.5 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors"
    >
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream))]" />}
    </button>
  );
}

function Code({ code, copy }: { code: string; copy?: string }) {
  return (
    <div className="relative">
      <CopyBtn text={copy ?? code} />
      <pre className="bg-[hsl(220,10%,8%)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 pr-14 text-[13px] font-mono text-[hsl(var(--landing-cream))] overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
    </div>
  );
}

export default function GetStartedFlow() {
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

  return (
    <div className="space-y-8">
      <div className="p-5 rounded-lg border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,6%)]">
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`font-mono text-lg font-bold ${step >= 1 ? 'text-emerald-400' : 'text-[hsl(var(--landing-copper))]'}`}>{step >= 1 ? '✓' : '1'}</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Get your API key</h3>
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
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <p className="text-sm text-amber-300 font-medium mb-1">⚠ Copy your key before continuing</p>
                <p className="text-xs text-amber-400 leading-relaxed">
                  This key is not stored anywhere. Not by Umarise, not in a database, not in your browser. 
                  If you lose it, you'll need to generate a new one. Click <strong className="text-amber-300">Copy key</strong> to continue.
                </p>
              </div>
            )}
            {copied && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-xs font-mono text-emerald-400">✓ Key copied. Store it securely (password manager, CI/CD secret, or .env file).</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Install CLI */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.10] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">2</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Install the CLI</h3>
        </div>
        <p className="text-xs text-[hsl(var(--landing-cream))] mb-3 ml-7">One-time setup. Requires Node.js ≥ 18. The CLI calls the hosted API, no server to install.</p>
        <div className="ml-7 space-y-3">
          <Code code={`npm install -g @umarise/cli`} />
          <p className="text-xs text-[hsl(var(--landing-cream))]">Then set your key (once per terminal session):</p>
          <Code code={`export UMARISE_API_KEY=${generatedKey || 'um_your_key_here'}`} />
        </div>
      </div>

      {/* Step 3: Anchor + Proof */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.10] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">3</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Anchor & save proof</h3>
        </div>
        <p className="text-xs text-[hsl(var(--landing-cream))] mb-3 ml-7">One command, same command every time. Your file is hashed locally, only the hash is sent to the API. Requires internet.</p>
        <div className="ml-7 space-y-4">
          <p className="text-xs text-[hsl(var(--landing-cream))] mb-1">Type <code className="text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-copper)/0.1)] px-1.5 py-0.5 rounded">umarise proof</code> then drag your file into the terminal:</p>
          <div className="p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <p className="text-sm font-mono text-[hsl(var(--landing-cream))]">
              <span className="text-[hsl(var(--landing-cream))]">umarise proof </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>
          <p className="text-xs text-[hsl(var(--landing-cream))]">The terminal auto-fills the full path. Or type it manually:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
            <p className="text-xs text-[hsl(var(--landing-cream))] font-mono leading-relaxed">
              {'  '}umarise proof contract.pdf{'\n'}
              {'  '}umarise proof ./designs/logo-final.png{'\n'}
              {'  '}umarise proof ~/Desktop/research-paper.docx
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[hsl(var(--landing-copper)/0.25)] bg-[hsl(var(--landing-copper)/0.05)]">
            <p className="text-sm text-[hsl(var(--landing-cream))] font-medium mb-2">Same command, run it twice:</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.2)] text-[hsl(var(--landing-copper))] text-xs font-mono font-bold flex items-center justify-center">1</span>
                  <p className="text-xs text-[hsl(var(--landing-cream))] font-medium">Now: anchors your hash to Bitcoin</p>
                </div>
                <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)] ml-8">
                  <pre className="text-xs font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed">{`✓ hash: sha256:a1b2c3d4e5f6...
✓ anchored: origin_id f47ac10b-58cc-4372-a567-0e02b2c3d479
⏳ proof pending, run again later`}</pre>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-8">
                <div className="w-px h-6 bg-[hsl(var(--landing-copper)/0.3)]" />
                <p className="text-xs text-[hsl(var(--landing-cream))] font-mono">~2 hours (Bitcoin confirmation)</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">2</span>
                  <p className="text-xs text-[hsl(var(--landing-cream))] font-medium">Later: run the <span className="text-[hsl(var(--landing-copper))]">exact same command</span> again to download & save the .proof bundle</p>
                </div>
                <div className="p-3 rounded border border-emerald-500/10 bg-[hsl(220,10%,8%)] ml-8">
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre leading-relaxed">{`✓ hash: sha256:a1b2c3d4e5f6... (already anchored)
✓ origin_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
✓ anchored in Bitcoin block 939270
✓ no later than: 2026-03-04
✓ saved: document.pdf.proof
✓ proof valid, independent of Umarise`}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <p className="text-sm text-amber-300 font-medium mb-1">⚠ The .proof file only appears after Run 2</p>
            <p className="text-xs text-amber-400 leading-relaxed">
              Bitcoin confirmation takes ~2 hours. Until then, your hash is registered but the .proof ZIP doesn't exist yet.
              Run the same command again later. The ZIP is saved automatically next to your original file.
            </p>
          </div>

          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
            <pre className="text-xs font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed">{`~/projects/
  ├── document.pdf           ← your original file
  └── document.pdf.proof     ← evidence bundle (ZIP)
                                ├── certificate.json
                                ├── proof.ots
                                └── VERIFY.txt`}</pre>
          </div>
        </div>
      </div>

      {/* Step 4: Verify */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.10] select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">4</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Verify: anyone, anytime, offline</h3>
        </div>
        <p className="text-xs text-[hsl(var(--landing-cream))] mb-3 ml-7">No API key. No internet. No Umarise dependency. Fully offline, verifies locally against the Bitcoin proof.</p>
        <div className="ml-7 space-y-3">
          <p className="text-xs text-[hsl(var(--landing-cream))] mb-1">Type <code className="text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-copper)/0.1)] px-1.5 py-0.5 rounded">umarise verify</code> then drag your file into the terminal:</p>
          <div className="p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <p className="text-sm font-mono text-[hsl(var(--landing-cream))]">
              <span className="text-[hsl(var(--landing-cream))]">umarise verify </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>
          <p className="text-xs text-[hsl(var(--landing-cream))]">The terminal auto-fills the full path. Or type it manually:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
            <p className="text-xs text-[hsl(var(--landing-cream))] font-mono leading-relaxed">
              {'  '}umarise verify contract.pdf{'\n'}
              {'  '}umarise verify ./designs/logo-final.png{'\n'}
              {'  '}umarise verify ~/Desktop/research-paper.docx
            </p>
          </div>
          <p className="text-xs text-[hsl(var(--landing-cream))]">The CLI automatically finds <code className="text-[hsl(var(--landing-copper))]">.proof</code> next to your file (e.g. <code className="text-[hsl(var(--landing-copper))]">contract.pdf.proof</code>).</p>
          <div className="p-3 rounded border border-emerald-500/10 bg-[hsl(220,10%,8%)]">
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre leading-relaxed">{`✓ hash matches
✓ anchored in Bitcoin block 939270
✓ no later than: 2026-03-04
✓ proof valid, independent of Umarise`}</pre>
          </div>
        </div>
      </div>

      {/* Done */}
      <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/5">
        <p className="text-sm text-[hsl(var(--landing-cream))]">
          Your file + <code className="text-[hsl(var(--landing-copper))]">.proof</code> = independently verifiable evidence. You choose where to store it. The file never leaves your machine.
        </p>
      </div>
    </div>
  );
}
