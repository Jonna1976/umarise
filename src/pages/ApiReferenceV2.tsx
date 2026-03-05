import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Copy, Check, Globe, Key } from 'lucide-react';
import IntegrationChecklist from '@/components/api-reference/IntegrationChecklist';
import SupportChatWidget from '@/components/api-reference/SupportChatWidget';

const BASE = 'https://core.umarise.com';

/* -- Primitives -- */

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="absolute top-2 right-2 p-1.5 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors"
    >
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.5)]" />}
    </button>
  );
}

function Code({ code, copy }: { code: string; copy?: string }) {
  return (
    <div className="relative">
      <CopyBtn text={copy ?? code} />
      <pre className="bg-[hsl(220,10%,8%)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 pr-12 text-[13px] font-mono text-[hsl(var(--landing-cream)/0.85)] overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const c = method === 'GET' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400';
  return <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${c}`}>{method}</span>;
}

function AuthBadge({ auth }: { auth: 'public' | 'key' }) {
  return auth === 'public'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Globe className="w-3 h-3" />Public</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"><Key className="w-3 h-3" />API Key</span>;
}

function Param({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-[hsl(var(--landing-cream)/0.04)] last:border-0 text-sm">
      <code className="text-[hsl(var(--landing-copper))] font-mono shrink-0">{name}</code>
      <span className="text-[hsl(var(--landing-cream)/0.55)] font-mono text-xs shrink-0 mt-0.5">{type}</span>
      {required && <span className="text-amber-500/80 text-[10px] font-mono uppercase shrink-0 mt-1">required</span>}
      <span className="text-[hsl(var(--landing-cream)/0.85)]">{desc}</span>
    </div>
  );
}



function GetStartedFlow() {
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
        <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-4 ml-7">One click. No email, no account, no waiting. 100 free anchors included.</p>
        {!generatedKey ? (
          <div className="ml-7">
            <button onClick={generateKey} disabled={loading} className="px-6 py-2.5 rounded text-sm font-mono font-bold bg-[hsl(var(--landing-copper))] text-[hsl(220,10%,6%)] hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? (<span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-[hsl(220,10%,6%)/0.3] border-t-[hsl(220,10%,6%)] rounded-full animate-spin" />Generating...</span>) : 'Generate my API key'}
            </button>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
        ) : (
          <div className="ml-7 space-y-3">
            <div className="flex items-center gap-2 p-3 rounded bg-[hsl(220,10%,8%)] border border-emerald-500/20">
              <code className="text-xs font-mono text-emerald-400 truncate flex-1">{generatedKey}</code>
              <button onClick={copyKey} className={`shrink-0 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[hsl(var(--landing-copper))] text-[hsl(220,10%,6%)] hover:opacity-90 animate-pulse'}`}>
                {copied ? <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Copied</span> : <span className="flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy key</span>}
              </button>
            </div>
            {!copied && (
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <p className="text-sm text-amber-300 font-medium mb-1">⚠ Copy your key before continuing</p>
                <p className="text-xs text-amber-400/70 leading-relaxed">
                  This key is not stored anywhere. Not by Umarise, not in a database, not in your browser. 
                  If you lose it, you'll need to generate a new one. Click <strong className="text-amber-300">Copy key</strong> to continue.
                </p>
              </div>
            )}
            {copied && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-xs text-emerald-400 font-mono">✓ Key copied. Store it securely (password manager, CI/CD secret, or .env file).</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Install CLI */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-40 pointer-events-none select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">2</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Install the CLI</h3>
        </div>
        <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3 ml-7">One-time setup. Requires Node.js ≥ 18. The CLI calls the hosted API — no server to install.</p>
        <div className="ml-7 space-y-3">
          <Code code={`npm install -g @umarise/cli`} />
          <p className="text-xs text-[hsl(var(--landing-cream)/0.8)]">Then set your key (once per terminal session):</p>
          <Code code={`export UMARISE_API_KEY=${generatedKey || 'um_your_key_here'}`} />
        </div>
      </div>

      {/* Step 3: Anchor + Proof (one command, two runs) */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-40 pointer-events-none select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">3</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Anchor & save proof</h3>
        </div>
        <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3 ml-7">One command, same command every time. Your file is hashed locally, only the hash is sent to the API. Requires internet.</p>
        <div className="ml-7 space-y-4">
          <p className="text-xs text-[hsl(var(--landing-cream)/0.85)] mb-1">Type <code className="text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-copper)/0.1)] px-1.5 py-0.5 rounded">umarise proof</code> then drag your file into the terminal:</p>
          <div className="p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <p className="text-sm font-mono text-[hsl(var(--landing-cream)/0.7)]">
              <span className="text-[hsl(var(--landing-cream)/0.9)]">umarise proof </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>
          <p className="text-xs text-[hsl(var(--landing-cream)/0.8)]">The terminal auto-fills the full path. Or type it manually:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
            <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] font-mono leading-relaxed">
              {'  '}umarise proof contract.pdf{'\n'}
              {'  '}umarise proof ./designs/logo-final.png{'\n'}
              {'  '}umarise proof ~/Desktop/research-paper.docx
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[hsl(var(--landing-copper)/0.25)] bg-[hsl(var(--landing-copper)/0.05)]">
            <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">Same command, run it twice:</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.2)] text-[hsl(var(--landing-copper))] text-xs font-mono font-bold flex items-center justify-center">1</span>
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.85)] font-medium">Now: anchors your hash to Bitcoin</p>
                </div>
                <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)] ml-8">
                  <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`✓ hash: sha256:a1b2c3d4e5f6...
✓ anchored: origin_id f47ac10b-58cc-4372-a567-0e02b2c3d479
⏳ proof pending, run again later`}</pre>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-8">
                <div className="w-px h-6 bg-[hsl(var(--landing-copper)/0.3)]" />
                <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] font-mono">~2 hours (Bitcoin confirmation)</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">2</span>
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.85)] font-medium">Later: run the <span className="text-[hsl(var(--landing-copper))]">exact same command</span> again to download & save the .proof bundle</p>
                </div>
                <div className="p-3 rounded border border-emerald-500/10 bg-[hsl(220,10%,8%)] ml-8">
                  <pre className="text-xs font-mono text-emerald-400/90 whitespace-pre leading-relaxed">{`✓ hash: sha256:a1b2c3d4e5f6... (already anchored)
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
            <p className="text-xs text-amber-400/70 leading-relaxed">
              Bitcoin confirmation takes ~2 hours. Until then, your hash is registered but the .proof ZIP doesn't exist yet.
              Run the same command again later. The ZIP is saved automatically next to your original file.
            </p>
          </div>

          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
            <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.8)] whitespace-pre leading-relaxed">{`~/projects/
  ├── document.pdf           ← your original file
  └── document.pdf.proof     ← evidence bundle (ZIP)
                                ├── certificate.json
                                ├── proof.ots
                                └── VERIFY.txt`}</pre>
          </div>
        </div>
      </div>

      {/* Step 4: Verify */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${copied ? 'border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-40 pointer-events-none select-none'}`}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[hsl(var(--landing-copper))] font-mono text-lg font-bold">4</span>
          <h3 className="text-[hsl(var(--landing-cream))] font-medium">Verify: anyone, anytime, offline</h3>
        </div>
        <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3 ml-7">No API key. No internet. No Umarise dependency. Fully offline — verifies locally against the Bitcoin proof.</p>
        <div className="ml-7 space-y-3">
          <p className="text-xs text-[hsl(var(--landing-cream)/0.85)] mb-1">Type <code className="text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-copper)/0.1)] px-1.5 py-0.5 rounded">umarise verify</code> then drag your file into the terminal:</p>
          <div className="p-4 rounded border border-[hsl(var(--landing-copper)/0.3)] bg-[hsl(220,10%,8%)]">
            <p className="text-sm font-mono text-[hsl(var(--landing-cream)/0.7)]">
              <span className="text-[hsl(var(--landing-cream)/0.9)]">umarise verify </span>
              <span className="text-[hsl(var(--landing-copper))] animate-pulse">[drag file here]</span>
            </p>
          </div>
          <p className="text-xs text-[hsl(var(--landing-cream)/0.8)]">The terminal auto-fills the full path. Or type it manually:</p>
          <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
            <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] font-mono leading-relaxed">
              {'  '}umarise verify contract.pdf{'\n'}
              {'  '}umarise verify ./designs/logo-final.png{'\n'}
              {'  '}umarise verify ~/Desktop/research-paper.docx
            </p>
          </div>
          <p className="text-xs text-[hsl(var(--landing-cream)/0.8)]">The CLI automatically finds <code className="text-[hsl(var(--landing-copper))]">.proof</code> next to your file (e.g. <code className="text-[hsl(var(--landing-copper))]">contract.pdf.proof</code>).</p>
          <div className="p-3 rounded border border-emerald-500/10 bg-[hsl(220,10%,8%)]">
            <pre className="text-xs font-mono text-emerald-400/90 whitespace-pre leading-relaxed">{`✓ hash matches
✓ anchored in Bitcoin block 939270
✓ no later than: 2026-03-04
✓ proof valid, independent of Umarise`}</pre>
          </div>
        </div>
      </div>

      {/* Done */}
      <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/5">
        <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Done. No email. No signup. No dashboard.</p>
        <p className="text-sm text-[hsl(var(--landing-cream)/0.85)]">
          Your file + <code className="text-[hsl(var(--landing-copper))]">.proof</code> = independently verifiable evidence. You choose where to store it. We never see your file.
        </p>
      </div>
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-20">{children}</section>;
}

function Endpoint({ method, path, title, auth, children }: {
  method: string; path: string; title: string; auth: 'public' | 'key'; children: React.ReactNode;
}) {
  return (
    <div className="pb-4 mb-4 border-b border-[hsl(var(--landing-cream)/0.06)] last:border-0">
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <MethodBadge method={method} />
        <code className="text-[hsl(var(--landing-cream)/0.9)] font-mono text-sm">{path}</code>
        <AuthBadge auth={auth} />
      </div>
      <p className="text-[hsl(var(--landing-cream)/0.8)] text-sm mb-4">{title}</p>
      {children}
    </div>
  );
}

/* -- Sidebar nav -- */

const NAV = [
  { id: 'intro', label: 'Introduction' },
  { id: 'get-started', label: 'Get Started' },
  { id: 'quick-start', label: 'Quick Start (curl)' },
  { id: 'origins', label: 'POST /origins' },
  { id: 'resolve', label: 'GET /resolve' },
  { id: 'verify', label: 'POST /verify' },
  { id: 'proof', label: 'GET /proof' },
  { id: 'headers', label: 'Headers & Envelope' },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate Limits' },
  { id: 'sdks', label: 'SDKs' },
  { id: 'cli', label: 'CLI & CI/CD' },
  { id: 'verification-paths', label: 'Verification Paths' },
  { id: 'faq', label: 'FAQ' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'checklist', label: 'Checklist' },
];

function Sidebar({ active }: { active: string }) {
  return (
    <nav className="hidden lg:block w-48 shrink-0">
      <div className="sticky top-6 space-y-0.5">
        {NAV.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={`block px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              active === n.id
                ? 'bg-[hsl(var(--landing-cream)/0.08)] text-[hsl(var(--landing-cream))]'
                : 'text-[hsl(var(--landing-cream)/0.6)] hover:text-[hsl(var(--landing-cream)/0.9)]'
            }`}
          >
            {n.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* -- Active section tracker -- */

function useActiveSection() {
  const [active, setActive] = useState('intro');

  useEffect(() => {
    const ids = NAV.map(n => n.id);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}

/* -- Page -- */

export default function ApiReferenceV2() {
  const active = useActiveSection();

  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream)/0.85)]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.08)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-cream))] transition-colors text-sm">
            <ArrowUp className="w-4 h-4" /> umarise.com
          </Link>
          <span className="font-serif text-lg text-[hsl(var(--landing-cream)/0.9)]">Umarise</span>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-12">
        <Sidebar active={active} />

        <div className="flex-1 min-w-0 space-y-16">

          {/* -- Introduction -- */}
          <Section id="intro">
            <h1 className="text-3xl font-serif text-[hsl(var(--landing-cream))] mb-2">API Reference</h1>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.85)] leading-relaxed">
              An anchoring primitive that lets you independently verify that specific bytes existed on or before a ledger-derived time without relying on you or Umarise after creation.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono mt-3">
              Base URL: <code className="text-[hsl(var(--landing-copper))]">{BASE}</code> · All responses include <code className="text-[hsl(var(--landing-copper))]">X-API-Version: v1</code>
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.55)] text-xs font-mono mt-2">
              Target uptime: 99.9% · <Link to="/status" className="text-[hsl(var(--landing-copper))] hover:underline">Current status</Link>
            </p>

            {/* Live example: DocPro.pdf */}
            <div className="mt-6 p-4 rounded border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Live example · DocPro.pdf anchored to Bitcoin block 938,978</p>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] mb-3">
                Public endpoint, no key required. Copy, paste, verify:
              </p>
              <Code
                code={`curl -X POST ${BASE}/v1-core-verify \\
  -H "Content-Type: application/json" \\
  -d '{"hash":"sha256:a3dccbd78865422db16db34fe0e47625b725a52e198f37867d0643ee3096a66e"}'`}
                copy={`curl -X POST ${BASE}/v1-core-verify -H "Content-Type: application/json" -d '{"hash":"sha256:a3dccbd78865422db16db34fe0e47625b725a52e198f37867d0643ee3096a66e"}'`}
              />
              <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
                <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre-wrap leading-relaxed">{`{
  "origin_id":  "352eddba-a6be-4880-83c7-a0c22de39614",
  "short_token": "9377D98B",
  "hash":       "a3dccbd78865422db16db34fe0e47625b725a52e198f37867d0643ee3096a66e",
  "hash_algo":  "sha256",
  "captured_at": "2026-03-02T07:50:07.805+00:00",
  "proof_status": "anchored",
  "bitcoin_block_height": 938978,
  "anchored_at": "2026-03-02T10:00:03.831+00:00",
  "proof_url":  "${BASE}/v1-core-proof?origin_id=352eddba-a6be-4880-83c7-a0c22de39614"
}`}</pre>
              </div>
              <p className="text-[10px] text-[hsl(var(--landing-cream)/0.55)] mt-2">
                Run this command in any terminal. No account, no key, no SDK. The response is identical for everyone.
              </p>
            </div>
          </Section>

          {/* -- Get Started -- */}
          <Section id="get-started">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Get Started</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.85)] mb-6">
              Generate a key, install the CLI, anchor your first file. <strong className="text-[hsl(var(--landing-cream))]">Under 2 minutes.</strong>
            </p>
            <GetStartedFlow />
          </Section>

          {/* -- Quick Start -- */}
          <Section id="quick-start">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Quick Start</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] mb-4">
              Five steps in your terminal. Replace <code className="text-[hsl(var(--landing-copper))]">YOUR_KEY</code> with your API key.
            </p>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.65)] mb-6">
              Or use the SDK:{' '}
              <code className="text-[hsl(var(--landing-copper))]">npm install @umarise/anchor</code>
              {' '}&gt;{' '}
              <a href="/sdk-download" className="text-[hsl(var(--landing-copper))] underline underline-offset-2 hover:text-[hsl(var(--landing-cream)/0.8)] transition-colors">
                docs &amp; quick start
              </a>
            </p>

            <div className="space-y-6">
              {/* Step 0 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-cream)/0.55)] font-mono text-sm font-bold">0.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Check API status</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">Optional. Confirm the API is online.</p>
                <Code
                  code={`curl "${BASE}/v1-core-health"`}
                  copy={`curl "${BASE}/v1-core-health"`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] font-mono">
                    {">"} <span className="text-emerald-400">200</span>{' '}
                    {`{ "status": "operational", "version": "v1" }`}
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">1.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Hash your file locally</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">Use the full file path, or run <code className="text-[hsl(var(--landing-copper))]">cd</code> to the file directory first. Your content never leaves your device.</p>
                <Code
                  code={`shasum -a 256 /path/to/yourfile.pdf`}
                  copy="shasum -a 256 /path/to/yourfile.pdf"
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] font-mono">
                    {">"} <span className="text-[hsl(var(--landing-cream)/0.9)]">a1b2c3d4e5f6...64 hex chars...</span>  /path/to/yourfile.pdf
                  </p>
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.4)] mt-1">Can’t find the file? Try: <code className="text-[hsl(var(--landing-copper))]">find ~ -name "yourfile.pdf" 2&gt;/dev/null</code></p>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">2.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Anchor the hash</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">Replace YOUR_KEY with your API key and paste the hash from step 1.</p>
                <Code
                  code={`curl -X POST ${BASE}/v1-core-origins \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                  copy={`curl -X POST ${BASE}/v1-core-origins -H "Content-Type: application/json" -H "X-API-Key: YOUR_KEY" -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] font-mono">
                    {">"} <span className="text-emerald-400">201</span>{' '}
                    {`{ "origin_id": "...", "proof_status": "pending" }`}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">3.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Wait for Bitcoin anchoring</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">Poll until <code className="text-[hsl(var(--landing-copper))]">proof_status</code> changes to <code className="text-[hsl(var(--landing-copper))]">"anchored"</code>. Typical: ~1 hour, ledger-dependent.</p>
                <Code
                  code={`curl "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID"`}
                  copy={`curl "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID"`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] font-mono">
                    {">"} <span className="text-emerald-400">200</span>{' '}
                    {`{ "proof_status": "anchored", "bitcoin_block_height": 935037 }`}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">4.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Download the .ots proof</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">Binary OpenTimestamps proof file. Available once <code className="text-[hsl(var(--landing-copper))]">proof_status</code> is <code className="text-[hsl(var(--landing-copper))]">"anchored"</code>.</p>
                <Code
                  code={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ORIGIN_ID" -o proof.ots`}
                  copy={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ORIGIN_ID" -o proof.ots`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.75)]">
                    This file completes your evidence bundle. Without it, only a registry check is possible - not independent Bitcoin verification.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">5.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Verify independently</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">No API key needed. No Umarise infrastructure required. Verify against Bitcoin using your hash + .ots proof.</p>
                <Code
                  code={`curl -X POST ${BASE}/v1-core-verify \\
  -H "Content-Type: application/json" \\
  -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                  copy={`curl -X POST ${BASE}/v1-core-verify -H "Content-Type: application/json" -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] font-mono">
                    {">"} <span className="text-emerald-400">200</span>{' '}
                    {`{ "origin_id": "...", "captured_at": "...", "proof_status": "anchored" }`}
                  </p>
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mt-2">
                    Or verify fully offline at{' '}
                    <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">
                      verify-anchoring.org
                    </a>
                    {' '}- drop your hash + .ots file. Zero API calls.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">6.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Build your evidence bundle <span className="text-xs text-[hsl(var(--landing-cream)/0.4)]">(optional)</span></p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-2 ml-5">Compose a self-contained ZIP for third parties. All components come from previous steps.</p>
                <Code
                  code={`# Compose an Anchor ZIP from API components
mkdir evidence && cd evidence

# 1. Your original file (never uploaded - already on your device)
cp /path/to/yourfile.pdf artifact.pdf

# 2. Certificate from resolve endpoint
curl -s "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID" | \\
  jq '{origin_id, hash, captured_at, hash_algo, short_token, proof_status}' \\
  > certificate.json

# 3. Binary .ots proof (already downloaded in step 4)
cp ../proof.ots proof.ots

# 4. Bundle into ZIP
zip -r ../evidence-bundle.zip .`}
                  copy={`mkdir evidence && cd evidence && cp /path/to/yourfile.pdf artifact.pdf && curl -s "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID" | jq '{origin_id, hash, captured_at, hash_algo, short_token, proof_status}' > certificate.json && cp ../proof.ots proof.ots && zip -r ../evidence-bundle.zip .`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)]">
                    Drop this ZIP at{' '}
                    <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">
                      verify-anchoring.org
                    </a>
                    {' '}- the ZIP box verifies hash integrity + Bitcoin timestamp in one step.
                  </p>
                  <p className="text-xs text-amber-400/70 mt-1">
                    ⚠ The .ots file must be saved as binary. Using text mode will corrupt the proof.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-3">
                <span className="text-amber-400/80 font-mono">Smart polling with Retry-After:</span> When <code className="text-[hsl(var(--landing-copper))]">proof_status</code> is <code className="text-[hsl(var(--landing-copper))]">"pending"</code>, the response includes a <code className="text-[hsl(var(--landing-copper))]">Retry-After: 3600</code> header (~1 hour). Use this to schedule your next check - no guessing needed.
              </p>
              <Code
                code={`# Smart polling using Retry-After header (bash)
while true; do
  RESPONSE=$(curl -si "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID")
  STATUS=$(echo "$RESPONSE" | grep -o '"proof_status":"[^"]*"')
  echo "$STATUS"
  [[ "$STATUS" == *"anchored"* ]] && break
  RETRY=$(echo "$RESPONSE" | grep -i retry-after | grep -o '[0-9]*')
  sleep \${RETRY:-900}
done`}
                copy={`while true; do RESPONSE=$(curl -si "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID"); STATUS=$(echo "$RESPONSE" | grep -o '"proof_status":"[^"]*"'); echo "$STATUS"; [[ "$STATUS" == *"anchored"* ]] && break; RETRY=$(echo "$RESPONSE" | grep -i retry-after | grep -o '[0-9]*'); sleep \${RETRY:-900}; done`}
              />
              <p className="text-xs text-[hsl(var(--landing-cream)/0.4)] mt-3">
                Typical anchoring time: 10-20 minutes. In rare cases of Bitcoin network congestion, this may take longer. The <code className="text-[hsl(var(--landing-copper))]">Retry-After</code> header always reflects the recommended wait time.
              </p>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.4)] mt-1">
                <span className="text-amber-400/70">Coming soon:</span> Webhook callbacks - register a URL and the system POSTs when your proof is anchored. Zero polling.
              </p>
            </div>
            {/* Real-world integration example */}
            <div className="mt-8 pt-6 border-t border-[hsl(var(--landing-cream)/0.08)]">
              <h3 className="text-sm font-serif text-[hsl(var(--landing-cream))] mb-1">Real-world integration</h3>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-4">
                A production Node.js service anchoring uploads in 15 lines. Hash locally, POST the hash, store the origin_id.
              </p>
              <Code code={`const crypto = require('crypto');
const fetch = require('node-fetch');

app.post('/upload', async (req, res) => {
  const fileBuffer = req.file.buffer;

  // 1. Hash locally - your content never leaves your server
  const hash = crypto.createHash('sha256')
    .update(fileBuffer).digest('hex');

  // 2. Anchor the hash
  const resp = await fetch('${BASE}/v1-core-origins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.CORE_API_KEY
    },
    body: JSON.stringify({ hash: 'sha256:' + hash })
  });

  const { origin_id, captured_at } = await resp.json();

  // 3. Store the origin_id alongside your record
  await db.files.update(record.id, { origin_id });

  res.json({ origin_id, captured_at });
});`} />
              <p className="text-xs text-[hsl(var(--landing-cream)/0.4)] mt-3">
                This pattern works with any language or framework. The API receives only the hash - never the original content.
              </p>
            </div>
          </Section>

          {/* -- Endpoints -- */}




          <Section id="origins">
            <Endpoint method="POST" path="/v1-core-origins" title="Create an attestation. Returns an immutable origin record." auth="key">
              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Request</h4>
              <Param name="hash" type="string" required desc="SHA-256 hash (64 hex chars, optional sha256: prefix)" />
              <Code code={`{ "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 201</h4>
              <Code code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "pending"
}`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response fields</h4>
              <Param name="origin_id" type="uuid" desc="Unique identifier for this attestation. Use for resolve/proof calls." />
              <Param name="hash" type="string" desc="Echoed hash with algorithm prefix." />
              <Param name="captured_at" type="ISO 8601" desc="Timestamp when the hash was registered. Immutable." />
              <Param name="proof_status" type="string" desc={`"pending" > "anchored" after Bitcoin confirmation. When pending, response includes Retry-After: 3600 header.`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Error responses</h4>
              <div className="space-y-2">
                <Code code={`// 401 - Missing or invalid API key
{ "error": { "code": "UNAUTHORIZED", "message": "Invalid API key" } }`} />
                <Code code={`// 409 - Hash already attested with this key
{ "error": { "code": "DUPLICATE_HASH", "message": "Hash already attested", "existing_origin_id": "..." } }`} />
                <Code code={`// 400 - Invalid hash format
{ "error": { "code": "INVALID_HASH_FORMAT", "message": "Expected 64 hex characters" } }`} />
              </div>

              <p className="text-xs text-[hsl(var(--landing-cream)/0.35)] mt-3">
                Typical response time: &lt;500ms.
              </p>
            </Endpoint>
          </Section>

          <Section id="resolve">
            <Endpoint method="GET" path="/v1-core-resolve" title="Look up an origin by ID or hash. Hash lookups return the earliest attestation." auth="public">
              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
              <Param name="origin_id" type="uuid" desc="Look up by origin ID (mutually exclusive with hash)" />
              <Param name="hash" type="string" desc="Look up by SHA-256 hash. Returns earliest attestation." />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Examples</h4>
              <Code code={`curl "${BASE}/v1-core-resolve?origin_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"`} />
              <Code code={`curl "${BASE}/v1-core-resolve?hash=sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 200</h4>
              <Code code={`{
  "origin_id": "a1b2c3d4-...",
  "hash": "sha256:e3b0c44...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored",
  "bitcoin_block_height": 880123,
  "anchored_at": "2026-02-17T14:30:00.000Z"
}`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response fields</h4>
              <Param name="origin_id" type="uuid" desc="Unique identifier for this attestation." />
              <Param name="hash" type="string" desc="SHA-256 hash with algorithm prefix." />
              <Param name="captured_at" type="ISO 8601" desc="Timestamp when the hash was first registered. Immutable." />
              <Param name="proof_status" type="string" desc={`"pending" or "anchored". When pending, Retry-After: 3600 header is included.`} />
              <Param name="bitcoin_block_height" type="integer" desc="Bitcoin block number. Present only when anchored." />
              <Param name="anchored_at" type="ISO 8601" desc="Timestamp of Bitcoin confirmation. Present only when anchored." />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Error responses</h4>
              <Code code={`// 404 - Origin or hash not found
{ "error": { "code": "NOT_FOUND", "message": "No attestation found" } }`} />
              <Code code={`// 400 - Missing parameter
{ "error": { "code": "INVALID_REQUEST_BODY", "message": "Provide origin_id or hash" } }`} />

              <p className="text-xs text-[hsl(var(--landing-cream)/0.35)] mt-3">
                Typical response time: &lt;200ms. Rate limit: 1,000/min per IP.
              </p>
            </Endpoint>
          </Section>

          <Section id="verify">
            <Endpoint method="POST" path="/v1-core-verify" title="Check if a hash exists in the registry. Returns the earliest attestation for this hash." auth="public">
              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-2">Request</h4>
              <Param name="hash" type="string" required desc="SHA-256 hash to verify (64 hex chars, optional sha256: prefix)" />
              <Code code={`{ "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 200 (match)</h4>
              <Code code={`{
  "origin_id": "a1b2c3d4-...",
  "hash": "sha256:e3b0c44...",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored"
}`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response fields</h4>
              <Param name="origin_id" type="uuid" desc="Unique identifier for the earliest attestation of this hash." />
              <Param name="hash" type="string" desc="Echoed hash with algorithm prefix." />
              <Param name="captured_at" type="ISO 8601" desc="When this hash was first registered." />
              <Param name="proof_status" type="string" desc={`"pending" or "anchored".`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Error responses</h4>
              <Code code={`// 404 - Hash not found in registry
{ "error": { "code": "NOT_FOUND", "message": "No attestation found for this hash" } }`} />
              <Code code={`// 400 - Invalid hash format
{ "error": { "code": "INVALID_HASH_FORMAT", "message": "Expected 64 hex characters" } }`} />

              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-3">
                Typical response time: &lt;200ms. Rate limit: 1,000/min per IP. No API key required.
              </p>
            </Endpoint>
          </Section>

          <Section id="proof">
            <Endpoint method="GET" path="/v1-core-proof" title="Download the OpenTimestamps (.ots) proof file." auth="public">
              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
              <Param name="origin_id" type="uuid" required desc="Origin to download proof for" />

              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 200</h4>
              <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] mb-1">Binary <code className="text-[hsl(var(--landing-copper))]">application/octet-stream</code>. Save as <code className="text-[hsl(var(--landing-copper))]">.ots</code> file.</p>
              <Code code={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ID" -o proof.ots`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 202 (pending)</h4>
              <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] mb-1">Proof not yet available. Bitcoin anchoring in progress.</p>
              <Code code={`{ "error": { "code": "PROOF_PENDING", "message": "Proof is pending Bitcoin confirmation" } }`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Error responses</h4>
              <Code code={`// 404 - Origin not found
{ "error": { "code": "NOT_FOUND", "message": "No attestation found for this origin_id" } }`} />

              <p className="text-xs text-[hsl(var(--landing-cream)/0.75)] mt-4">
                Verify independently at{' '}
                <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">
                  verify-anchoring.org
                </a>
                {' '}- no account required.
              </p>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-1">
                Typical response time: &lt;200ms. Rate limit: 1,000/min per IP.
              </p>
            </Endpoint>
          </Section>

          {/* -- Headers & Envelope -- */}
          <Section id="headers">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Headers & Envelope</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.85)] mb-4">
              Standard headers and response format for all endpoints.
            </p>

            <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Request Headers</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Header</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Required</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Content-Type', 'POST only', 'application/json'],
                    ['X-API-Key', 'POST /origins', 'Partner API key (um_...)'],
                    ['X-API-Version', 'No', 'Returned in all responses. Currently v1.'],
                  ].map(([header, req, desc]) => (
                    <tr key={header} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                      <td className="py-2 pr-4 font-mono text-[hsl(var(--landing-copper))] text-xs">{header}</td>
                      <td className="py-2 pr-4 text-xs">{req}</td>
                      <td className="py-2 text-[hsl(var(--landing-cream)/0.85)] text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response Envelope</h4>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-2">
              Success responses return the resource directly. Error responses use a consistent envelope:
            </p>
            <Code code={`// Success (2xx)
{ "origin_id": "...", "hash": "...", ... }

// Error (4xx/5xx)
{ "error": { "code": "ERROR_CODE", "message": "Human-readable description" } }`} />
          </Section>

          {/* -- Errors -- */}
          <Section id="errors">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-4">Errors</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Code</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">HTTP</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['UNAUTHORIZED', '401', 'Missing or invalid API key'],
                    ['API_KEY_REVOKED', '401', 'API key has been revoked'],
                    ['INVALID_HASH_FORMAT', '400', 'Not a valid SHA-256 hash'],
                    ['DUPLICATE_HASH', '409', 'Hash already attested with this key'],
                    ['NOT_FOUND', '404', 'Origin or hash not found'],
                    ['RATE_LIMIT_EXCEEDED', '429', 'Too many requests'],
                    ['INTERNAL_ERROR', '500', 'Server error'],
                  ].map(([code, http, desc]) => (
                    <tr key={code} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                      <td className="py-2 pr-4 font-mono text-[hsl(var(--landing-copper))] text-xs">{code}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{http}</td>
                      <td className="py-2 text-[hsl(var(--landing-cream)/0.85)] text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* -- Rate Limits -- */}
          <Section id="rate-limits">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-4">Rate Limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Endpoint</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Limit</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.65)] font-mono text-xs">Scope</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['/v1-core-origins', '100/min', 'Per API key'],
                    ['/v1-core-resolve', '1,000/min', 'Per IP'],
                    ['/v1-core-verify', '1,000/min', 'Per IP'],
                    ['/v1-core-proof', '1,000/min', 'Per IP'],
                    ['/v1-core-health', 'No limit', '-'],
                  ].map(([ep, limit, scope]) => (
                    <tr key={ep} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                      <td className="py-2 pr-4 font-mono text-[hsl(var(--landing-copper))] text-xs">{ep}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{limit}</td>
                      <td className="py-2 text-[hsl(var(--landing-cream)/0.75)] text-xs">{scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mt-3">
              Headers: <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Limit</code>, <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Remaining</code>, <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Reset</code> (Unix timestamp)
            </p>
          </Section>

          {/* -- SDKs -- */}
          <Section id="sdks">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-2">SDKs</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] mb-4">
              Thin wrappers around the REST API. Zero dependencies. Copy into your project or install from the package registry.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.65)] mb-2">Node.js / TypeScript</p>
                <Code code={`npm install @umarise/anchor`} />
                <Code code={`import { anchor, verify, resolve, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

// 1. Hash locally
const hash = await hashBuffer(readFileSync('doc.pdf'));

// 2. Anchor (requires API key)
const origin = await anchor(hash, {
  apiKey: process.env.UMARISE_API_KEY
});
console.log(origin.origin_id); // save this

// 3. Poll using Retry-After header
let status = origin;
while (status.proof_status === 'pending') {
  const res = await fetch(\`${BASE}/v1-core-resolve?origin_id=\${origin.origin_id}\`);
  const retryAfter = parseInt(res.headers.get('retry-after') || '900');
  await new Promise(r => setTimeout(r, retryAfter * 1000));
  status = await res.json();
}
console.log('Anchored at block', status.bitcoin_block_height);

// 4. Verify anytime (public, no key)
const proof = await verify(hash);
console.log(proof.captured_at);`} />
                <a href="https://github.com/Jonna1976/umarise-anchor" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-mono text-[hsl(var(--landing-copper))] hover:underline">
                  GitHub
                </a>
              </div>
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.65)] mb-2">Python</p>
                <Code code={`pip install umarise`} />
                <Code code={`from umarise import UmariseCore, hash_buffer
import os, time

# 1. Hash locally
file_hash = hash_buffer(open("doc.pdf", "rb").read())

# 2. Anchor (requires API key)
core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])
origin = core.attest(file_hash)
print(origin["origin_id"])  # save this

# 3. Poll using Retry-After header
while origin["proof_status"] == "pending":
    r = requests.get(f"{BASE}/v1-core-resolve", params={"origin_id": origin["origin_id"]})
    retry_after = int(r.headers.get("Retry-After", 3600))
    time.sleep(retry_after)
    origin = r.json()
print(f"Anchored at block {origin['bitcoin_block_height']}")

# 4. Verify anytime (public, no key)
result = UmariseCore().verify(file_hash)
print(result["captured_at"])`} />
                <a href="https://github.com/Jonna1976/umarise-python" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-mono text-[hsl(var(--landing-copper))] hover:underline">
                  GitHub
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.65)]">
                <span className="text-emerald-400/80 font-mono">v1.0.0</span> - REST API and SDKs are production-ready. Released under the <a href="https://unlicense.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Unlicense</a> (Public Domain).
              </p>
            </div>
          </Section>

          {/* -- CLI & CI/CD -- */}
          <Section id="cli">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-2">CI/CD Quick Start</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.85)] mb-2">
              Add proof to every build. Your artifacts ship with a <code className="text-[hsl(var(--landing-copper))]">.proof</code> file, like a <code className="text-[hsl(var(--landing-copper))]">.sig</code> or <code className="text-[hsl(var(--landing-copper))]">.sbom</code>, but anchored to Bitcoin.
            </p>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-8">
              No accounts. No dashboards. No vendor lock-in. The proof is the product.
            </p>

            {/* What you'll see */}
            <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/5 mb-8">
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">What your build output looks like</p>
              <pre className="text-sm font-mono text-[hsl(var(--landing-cream)/0.85)] leading-relaxed">{`build/
 ├ release.tar.gz
 ├ release.tar.gz.proof    ← added automatically
 └ checksums.txt`}</pre>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mt-3">
                The <code className="text-[hsl(var(--landing-copper))]">.proof</code> file is a ZIP containing <code className="text-[hsl(var(--landing-copper))]">certificate.json</code> + <code className="text-[hsl(var(--landing-copper))]">proof.ots</code> + <code className="text-[hsl(var(--landing-copper))]">VERIFY.txt</code>. Verifiable offline, independent of Umarise.
              </p>
            </div>

            {/* The minimal version */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">The one line you add</h4>
            <Code code={`- uses: AnchoringTrust/anchor-action@v1
  with:
    file: \${{ env.BUILD_ARTIFACT }}
  env:
    UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}`} />
            <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mt-3 mb-10">
              Copy this into any existing workflow. That's the entire integration.
            </p>

            {/* GitHub Actions — full workflow */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">GitHub Actions: full workflow</h4>
            <Code code={`name: Build & Anchor

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          tar czf release.tar.gz dist/

      - name: Anchor build artifact
        uses: AnchoringTrust/anchor-action@v1
        with:
          file: release.tar.gz
        env:
          UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release
          path: |
            release.tar.gz
            release.tar.gz.proof`} />
            <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
              <p className="text-[10px] font-mono text-[hsl(var(--landing-cream)/0.4)] mb-2">After a successful run:</p>
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`✓ hash computed: sha256:a3dc...
✓ anchored: origin_id 3cb5...
✓ proof saved: release.tar.gz.proof`}</pre>
              <p className="text-[10px] font-mono text-[hsl(var(--landing-cream)/0.4)] mt-3 mb-2">In the artifacts tab:</p>
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`release.tar.gz          2.4 MB
release.tar.gz.proof    1.2 KB`}</pre>
            </div>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mt-3">
              Add <code className="text-[hsl(var(--landing-copper))]">UMARISE_API_KEY</code> to your repo: Settings → Secrets → Actions → New secret.
            </p>

            {/* GitLab CI */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-10 mb-2">GitLab CI</h4>
            <Code code={`build-and-anchor:
  stage: build
  script:
    - tar czf release.tar.gz dist/
    - npm install -g @umarise/cli
    - umarise proof release.tar.gz
  artifacts:
    paths:
      - release.tar.gz
      - release.tar.gz.proof
  variables:
    UMARISE_API_KEY: $UMARISE_API_KEY`} />
            <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mt-3">
              Add <code className="text-[hsl(var(--landing-copper))]">UMARISE_API_KEY</code> as a CI/CD variable in Settings → CI/CD → Variables.
            </p>

            {/* Docker build */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-10 mb-2">Docker build</h4>
            <Code code={`- name: Build Docker image
  run: docker build -t myapp:\${{ github.sha }} .

- name: Save and anchor image
  run: |
    docker save myapp:\${{ github.sha }} | gzip > image.tar.gz
    umarise proof image.tar.gz
  env:
    UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}`} />

            {/* Downstream verification */}
            <div className="mt-10 p-4 rounded border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-cream)/0.02)]">
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-2">Verification by a downstream team</h4>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3">
                A team that receives the release can verify without Umarise, without an API key, using only standard tools:
              </p>
              <Code code={`# With CLI
umarise verify release.tar.gz

# Or without CLI, standard tools only:
unzip release.tar.gz.proof
sha256sum release.tar.gz        # compare with certificate.json
ots verify proof.ots             # verify against Bitcoin`} />
              <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
                <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`✓ hash matches
✓ anchored in Bitcoin block 935037
✓ no later than: 2026-03-04
✓ proof valid, independent of Umarise`}</pre>
              </div>
            </div>

            <div className="border-t border-[hsl(var(--landing-cream)/0.08)] my-10" />

            {/* Setup — 2 minutes */}
            <h3 className="text-[hsl(var(--landing-cream)/0.95)] font-serif text-base mb-4">Setup: two minutes</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-[hsl(var(--landing-copper))] font-mono font-bold text-sm shrink-0">1.</span>
                <div>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Add <code className="text-[hsl(var(--landing-copper))]">UMARISE_API_KEY</code> to your repository secrets</p>
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-1">Settings → Secrets and variables → Actions → New repository secret</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[hsl(var(--landing-copper))] font-mono font-bold text-sm shrink-0">2.</span>
                <div>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Add one step to your existing workflow</p>
                  <div className="mt-2">
                    <Code code={`- uses: AnchoringTrust/anchor-action@v1
  with:
    file: your-build-artifact.tar.gz
  env:
    UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}`} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[hsl(var(--landing-copper))] font-mono font-bold text-sm shrink-0">3.</span>
                <p className="text-sm text-[hsl(var(--landing-cream))] font-medium">Push. Done.</p>
              </div>
            </div>

            <div className="border-t border-[hsl(var(--landing-cream)/0.08)] my-10" />

            {/* CLI standalone */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">CLI: install</h4>
            <Code code={`npm install -g @umarise/cli`} />
            <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-2 mb-8">
              Requires Node.js ≥ 18. Published as <a href="https://www.npmjs.com/package/@umarise/cli" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">@umarise/cli</a> (v1.1.4).
            </p>

            {/* Command reference */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-3">Commands</h4>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Command</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">API Key</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['umarise proof <file>', 'Required', 'Full lifecycle: anchor, resolve, download proof. Idempotent: run the same command twice, it picks up where it left off.'],
                    ['umarise anchor <file>', 'Required', 'Hash and anchor only. Creates .proof with certificate.json (proof.ots added if available).'],
                    ['umarise verify <file> [proof]', 'No', 'Verify a file against its .proof bundle. Offline-first via OTS, with online fallback.'],
                  ].map(([cmd, key, desc]) => (
                    <tr key={cmd} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                      <td className="py-2.5 pr-4 font-mono text-[hsl(var(--landing-copper))] text-xs whitespace-nowrap">{cmd}</td>
                      <td className="py-2.5 pr-4 text-xs whitespace-nowrap">{key}</td>
                      <td className="py-2.5 text-[hsl(var(--landing-cream)/0.7)] text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* umarise proof — the recommended command */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">
              <code className="text-[hsl(var(--landing-copper))]">umarise proof</code>: recommended
            </h4>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3">
              One command, stateless, idempotent. Handles the entire lifecycle: hash → anchor → resolve → download proof → write <code className="text-[hsl(var(--landing-copper))]">.proof</code> ZIP. If the proof isn't ready yet, it tells you to run again later. Same command, always does the right thing.
            </p>
            <Code code={`export UMARISE_API_KEY=um_your_key
umarise proof document.pdf`} />
            <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`# First run (new file):
✓ hash: sha256:a1b2c3...
✓ anchored: origin_id f47ac10b-58cc-4372-a567-0e02b2c3d479
⏳ proof pending, run again later

# Second run (after ~2 hours):
✓ hash: sha256:a1b2c3... (already anchored)
✓ origin_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
✓ anchored in Bitcoin block 935037
✓ no later than: 2026-03-04
✓ saved: document.pdf.proof
✓ proof valid, independent of Umarise`}</pre>
            </div>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.55)] mt-2">
              No daemon. No state files. No background process. The idempotency means you can safely run it in cron or CI. It won't create duplicates.
            </p>

            {/* umarise anchor */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-8 mb-2">
              <code className="text-[hsl(var(--landing-copper))]">umarise anchor</code>: anchor only
            </h4>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3">
              Hash and register. Creates a <code className="text-[hsl(var(--landing-copper))]">.proof</code> file immediately with <code className="text-[hsl(var(--landing-copper))]">certificate.json</code>. The OTS proof is included if already available, otherwise the certificate alone is written.
            </p>
            <Code code={`umarise anchor build.tar.gz`} />
            <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`✓ hash computed: sha256:a1b2c3...
✓ anchored: origin_id abc-123
✓ proof saved: build.tar.gz.proof`}</pre>
            </div>

            {/* umarise verify */}
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-8 mb-2">
              <code className="text-[hsl(var(--landing-copper))]">umarise verify</code>: verify offline
            </h4>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3">
              Verify a file against its <code className="text-[hsl(var(--landing-copper))]">.proof</code> bundle. Offline-first: uses the local OTS library to verify directly against Bitcoin. Falls back to the public API if offline verification isn't possible.
            </p>
            <Code code={`umarise verify document.pdf`} />
            <div className="mt-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,8%)]">
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] whitespace-pre leading-relaxed">{`✓ hash matches
✓ anchored in Bitcoin block 939270
✓ no later than: 2026-03-04
✓ proof valid, independent of Umarise`}</pre>
            </div>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.55)] mt-2 mb-4">
              No API key required. Verification is a public utility.
            </p>

            {/* What verify does step by step */}
            <div className="p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-3">What happens when you run verify</h4>
              <div className="space-y-3">
                <div className="flex gap-3 text-xs">
                  <span className="text-[hsl(var(--landing-copper))] font-mono font-medium shrink-0">Step 1</span>
                  <span className="text-[hsl(var(--landing-cream)/0.8)]">
                    Reads <code className="text-[hsl(var(--landing-copper))]">document.pdf</code> and computes the SHA-256 hash.
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-[hsl(var(--landing-copper))] font-mono font-medium shrink-0">Step 2</span>
                  <span className="text-[hsl(var(--landing-cream)/0.8)]">
                    Opens <code className="text-[hsl(var(--landing-copper))]">document.pdf.proof</code> (ZIP) and reads <code className="text-[hsl(var(--landing-copper))]">certificate.json</code>.
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-[hsl(var(--landing-copper))] font-mono font-medium shrink-0">Step 3</span>
                  <span className="text-[hsl(var(--landing-cream)/0.8)]">
                    Compares the computed hash with the hash in the certificate. If they don't match → the file has been modified.
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-[hsl(var(--landing-copper))] font-mono font-medium shrink-0">Step 4</span>
                  <span className="text-[hsl(var(--landing-cream)/0.8)]">
                    Extracts <code className="text-[hsl(var(--landing-copper))]">proof.ots</code> and verifies it against the Bitcoin blockchain using the OpenTimestamps library (offline, no API needed).
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-[hsl(var(--landing-copper))] font-mono font-medium shrink-0">Result</span>
                  <span className="text-[hsl(var(--landing-cream)/0.8)]">
                    If both checks pass: these exact bytes existed no later than Bitcoin block height H. Mathematically certain, independently verifiable, no trust required.
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded border border-amber-500/20 bg-amber-500/5">
                <p className="text-xs text-amber-400/80">
                  <strong>Important:</strong> You always need the original file alongside the <code className="text-[hsl(var(--landing-copper))]">.proof</code> bundle. The proof says "this hash existed before time T". Without the file, there is nothing to hash and compare.
                </p>
              </div>
            </div>

            {/* .proof file format */}
            <div className="mt-8 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-3">.proof file format</h4>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3">
                A <code className="text-[hsl(var(--landing-copper))]">.proof</code> file is a standard ZIP archive containing:
              </p>
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] leading-relaxed mb-3">{`document.pdf.proof (ZIP)
 ├ certificate.json    ← metadata + hash + origin_id
 ├ proof.ots           ← OpenTimestamps binary proof
 └ VERIFY.txt          ← human-readable verification instructions`}</pre>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.65)]">
                The certificate follows the <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification v1.0</a>. 
                Anyone can verify without Umarise using <code className="text-[hsl(var(--landing-copper))]">sha256sum</code> + <code className="text-[hsl(var(--landing-copper))]">ots verify</code>.
              </p>
            </div>

            {/* Storage & ownership */}
            <div className="mt-6 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-3">Where does the proof live?</h4>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-3">
                The <code className="text-[hsl(var(--landing-copper))]">.proof</code> file is saved next to your original file. There is no cloud storage, no server, no account. You are the sole custodian.
              </p>
              <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.75)] leading-relaxed mb-3">{`~/project/
 ├ document.pdf          ← your file
 └ document.pdf.proof    ← the proof`}</pre>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] mb-2 font-medium">Common storage patterns:</p>
              <div className="space-y-2 mb-3">
                <div className="text-xs text-[hsl(var(--landing-cream)/0.65)]">
                  <span className="text-[hsl(var(--landing-cream)/0.85)] font-medium">Git repository</span>: commit <code className="text-[hsl(var(--landing-copper))]">.proof</code> files alongside source code. Anyone who clones the repo can verify.
                </div>
                <div className="text-xs text-[hsl(var(--landing-cream)/0.65)]">
                  <span className="text-[hsl(var(--landing-cream)/0.85)] font-medium">Release artifacts</span>: the GitHub Action adds <code className="text-[hsl(var(--landing-copper))]">.proof</code> files to your build output automatically.
                </div>
                <div className="text-xs text-[hsl(var(--landing-cream)/0.65)]">
                  <span className="text-[hsl(var(--landing-cream)/0.85)] font-medium">Backup / archive</span>: copy both files to any storage you trust.
                </div>
              </div>
              <div className="p-3 rounded border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-xs font-mono text-emerald-400">
                  Keep file + file.proof together. As long as you have both, anyone can verify. Forever.
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="mt-8 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.65)]">
                <a href="#get-started" className="text-[hsl(var(--landing-copper))] hover:underline">Generate your API key</a> · 
                Source: <a href="https://github.com/AnchoringTrust/cli" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">CLI</a> · <a href="https://github.com/AnchoringTrust/anchor-action" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Action</a> · 
                License: <a href="https://unlicense.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Unlicense</a> (Public Domain)
              </p>
            </div>
          </Section>

          {/* -- Verification Paths -- */}
          <Section id="verification-paths">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Verification Paths</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] mb-6">
              Three integration models, three verification flows. Same cryptographic guarantee.
            </p>

            <div className="space-y-6">
              {/* Reference implementation example */}
              <div className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-cream)/0.02)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[hsl(var(--landing-cream)/0.1)] text-[hsl(var(--landing-cream)/0.7)]">EXAMPLE</span>
                  <h3 className="text-[hsl(var(--landing-cream))] font-medium text-sm">Origin ZIP verification</h3>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] mb-3">For apps that generate origin ZIPs containing the artifact + proof bundle (e.g. consumer implementations of the Anchoring Specification).</p>

                <div className="ml-0 space-y-3">
                  <div>
                    <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-1">You have</p>
                    <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">Origin ZIP — contains artifact + certificate.json + proof.ots + VERIFY.txt</p>
                  </div>

                  <div>
                    <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-1">Verify via</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">①</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">verify-anchoring.org</a> — drop ZIP, full autonomous verification in-browser
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">②</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          Manual: <code className="text-[hsl(var(--landing-copper))] text-xs">unzip</code> + <code className="text-[hsl(var(--landing-copper))] text-xs">sha256sum</code> + <code className="text-[hsl(var(--landing-copper))] text-xs">ots verify</code> — fully offline, highest independence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* B2B Core API */}
              <div className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-cream)/0.02)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))]">B2B</span>
                  <h3 className="text-[hsl(var(--landing-cream))] font-medium text-sm">Core API Integration</h3>
                </div>

                <div className="ml-0 space-y-3">
                  <div>
                    <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-1">You have</p>
                    <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">SHA-256 hash + <code className="text-[hsl(var(--landing-copper))] text-xs">.ots</code> proof file (via <code className="text-[hsl(var(--landing-copper))] text-xs">GET /v1-core-proof</code>)</p>
                  </div>

                  <div>
                    <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-1">Verify via</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">①</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <code className="text-[hsl(var(--landing-copper))] text-xs">POST /v1-core-verify</code> — API confirms status (convenience, requires Umarise)
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">②</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">verify-anchoring.org</a> — paste hash + upload <code className="text-[hsl(var(--landing-copper))] text-xs">.ots</code> file (independent, in-browser)
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">③</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <code className="text-[hsl(var(--landing-copper))] text-xs">ots verify</code> locally — fully offline, highest independence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CLI */}
              <div className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-cream)/0.02)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400">DEV</span>
                  <h3 className="text-[hsl(var(--landing-cream))] font-medium text-sm">CLI — Developer go-to</h3>
                </div>

                <div className="ml-0 space-y-3">
                  <div>
                    <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-1">You have</p>
                    <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">Original file + <code className="text-[hsl(var(--landing-copper))] text-xs">.proof</code> bundle (contains certificate.json + proof.ots + VERIFY.txt — no artifact)</p>
                  </div>

                  <div>
                    <p className="text-[hsl(var(--landing-cream)/0.65)] text-xs font-mono uppercase tracking-wider mb-1">Verify via</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">①</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <code className="text-[hsl(var(--landing-copper))] text-xs">umarise verify [file]</code> — terminal, 4 green checkmarks, no API key needed
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5">②</span>
                        <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          Unzip <code className="text-[hsl(var(--landing-copper))] text-xs">.proof</code> → use <code className="text-[hsl(var(--landing-copper))] text-xs">proof.ots</code> on <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">verify-anchoring.org</a> or with <code className="text-[hsl(var(--landing-copper))] text-xs">ots verify</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                <strong className="text-[hsl(var(--landing-cream))]">Independence guarantee:</strong> Every path ultimately resolves to the same mathematical proof — a SHA-256 hash anchored in a Bitcoin block via OpenTimestamps. No path requires trust in Umarise.
              </p>
            </div>
          </Section>

          {/* -- FAQ -- */}
          <Section id="faq">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">

              {/* Q1 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"This looks simple. Can't anyone build this?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  Yes. The <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> is public domain. The <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">reference verifier</a> is forkable. That is the point. Anchoring is infrastructure, not a product. The specification exists so anyone can implement it. The API exists so no one has to build Merkle-batching, OTS calendar management, and Bitcoin monitoring from scratch.
                </p>
              </div>

              {/* Q2 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"We already hash our files with SHA-256. How is this different?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  SHA-256 proves <em>integrity</em>: the bytes have not changed. Anchoring proves <em>chronology</em>: these bytes existed no later than Bitcoin block height H. A hash without external time binding is self-attested. It could be generated today and claimed to be from last year. Anchoring binds the hash to Bitcoin's public ledger, creating an independently verifiable reference that no single party controls.
                </p>
              </div>

              {/* Q3 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"What does this add beyond raw OpenTimestamps?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  OpenTimestamps is a protocol, like HTTP is a protocol. A web application is not "HTTP." OTS defines how to commit a hash to Bitcoin. The Core API uses OTS as transport and adds everything above it: a standardized REST interface, automatic Merkle-batching, stable <code className="text-[hsl(var(--landing-copper))]">origin_id</code> references, resolve/verify/proof endpoints, idempotent registration, and the <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a>. This is a semantic framework defining exactly what a proof does and does not establish.
                </p>
              </div>

              {/* Q4 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Most proof systems store the proof. How is this different?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  Most proof systems store the proof. We return it.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mt-2">
                  Other timestamping services keep verification dependent on their infrastructure. If the service disappears, the proof becomes difficult or impossible to verify.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mt-2">
                  The Core API does the opposite. The proof bundle is returned to the caller and stored next to the artifact. Verification requires only the original file, the <code className="text-[hsl(var(--landing-copper))]">.proof</code> bundle, and the public Bitcoin blockchain. No Umarise server. No account. No dependency on anyone.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mt-2">
                  The claim is mathematically precise: these exact bytes existed no later than Bitcoin block height H. Not "we say so." A fact verifiable by anyone, independently, forever.
                </p>
              </div>

              {/* Q5 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Is this ledger-agnostic? We use a different blockchain."</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  The <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> defines <em>ledger qualification criteria</em>, not a specific blockchain. Bitcoin is the current ledger. Any ledger that is publicly accessible, append-only, provides independently verifiable time ordering, and is not controlled by the proof issuer qualifies under the specification.
                </p>
              </div>

              {/* Q6 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Can we bulk-anchor existing files retroactively?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  Yes. The API accepts hashes, not files. Hash locally, POST each hash to <code className="text-[hsl(var(--landing-copper))]">/v1-core-origins</code>. The backend batches hashes into Merkle trees automatically. Rate limit: 100 requests/min per API key. The anchor timestamp reflects when the hash was submitted, not when the file was originally created. Anchoring proves "existed no later than T." It cannot backdate.
                </p>
              </div>

              {/* Q7 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"What if the infrastructure provider disappears?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  Once anchored, the proof is self-contained. The .ots file combined with the original artifact, <code className="text-[hsl(var(--landing-copper))]">sha256sum</code>, and the public Bitcoin blockchain provides complete verification. No API, no account, no issuer infrastructure required. The <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">reference verifier</a> is open source, zero-backend, and forkable. The proof survives the issuer.
                </p>
              </div>

              {/* Q8 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Can the API operator see our data?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  No. The API receives SHA-256 hashes only, never files. A SHA-256 hash is a one-way function: without the original artifact, the hash is meaningless. There is no mechanism in the infrastructure to store, receive, or reconstruct file content. The hash crosses the network boundary. The content does not.
                </p>
              </div>

              {/* Q9 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Can anyone, including the operator, modify or delete an existing record?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  No. Database-level immutability triggers block UPDATE and DELETE operations, including for internal service roles. Row-level security blocks all client-side mutations. Bitcoin anchoring makes retroactive modification mathematically detectable. This is enforced by architecture, not policy. No administrative override exists that can alter a committed record.
                </p>
              </div>

              {/* Q10 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"We already use an RFC 3161 TSA. Should we switch?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  Not necessarily. RFC 3161 TSAs rely on a trusted Certificate Authority. If the CA is compromised or discontinued, verification depends on that infrastructure. The Core API anchors to Bitcoin via OTS, making it trustless with no CA dependency. The <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> is open: any timestamping solution meeting the ledger qualification criteria can be conformant regardless of transport. The relevant question is whether proofs remain verifiable independent of the issuer.
                </p>
              </div>

              {/* Q11 */}
              <div>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"How does Umarise anchoring differ from C2PA?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
                  Umarise anchoring and C2PA operate at different verification layers. An anchoring proof asserts only that the exact byte sequence (or its cryptographic hash) existed at or before time T. Time T is derived from a publicly verifiable ledger. Verification requires recomputing the hash, validating the ledger inclusion proof, and confirming ledger timestamp finality.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mt-2">
                  Anchoring does not assert authorship, identity, ownership, originality, tool usage, editing history, or whether content is AI-generated.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mt-2">
                  C2PA, by contrast, asserts that a specific identity signed a manifest describing provenance and production history. C2PA binds time to identity via PKI. Anchoring binds time directly to exact bytes via ledger inclusion.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mt-2">
                  Anchoring proofs may be embedded as C2PA assertions when both identity provenance and independently verifiable temporal existence are required.
                </p>
              </div>

            </div>

            {/* Bitcoin disclaimer */}
            <div className="mt-8 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.6)]">
                Umarise uses the Bitcoin blockchain as a public, immutable timestamp ledger, not as a currency. No wallets, no coins, no financial transactions.
              </p>
            </div>
          </Section>

          {/* -- Privacy by Architecture -- */}
          <Section id="privacy">
            <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))] mb-4">Privacy by Architecture</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.8)] leading-relaxed mb-6">
              We don't know who you are. That's not a policy. It's how the system works.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded border border-emerald-500/15 bg-emerald-500/5">
                <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">What we store</p>
                <ul className="space-y-2 text-sm text-[hsl(var(--landing-cream)/0.85)]">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">·</span> <code className="text-[hsl(var(--landing-copper))]">key_prefix</code>: first 8 chars (for lookup)</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">·</span> <code className="text-[hsl(var(--landing-copper))]">key_hash</code>: HMAC-SHA256 (not the key itself)</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">·</span> <code className="text-[hsl(var(--landing-copper))]">credit_balance</code>: current anchor credits</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">·</span> <code className="text-[hsl(var(--landing-copper))]">partner_name</code>: free text you chose at generation</li>
                </ul>
              </div>

              <div className="p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(220,10%,7%)]">
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.65)] uppercase tracking-wider mb-3">What we don't store</p>
                <ul className="space-y-2 text-sm text-[hsl(var(--landing-cream)/0.65)]">
                  <li className="flex items-start gap-2"><span className="text-[hsl(var(--landing-cream)/0.3)] mt-0.5">✕</span> Email, name, or any PII</li>
                  <li className="flex items-start gap-2"><span className="text-[hsl(var(--landing-cream)/0.3)] mt-0.5">✕</span> Your API key (only the hash)</li>
                  <li className="flex items-start gap-2"><span className="text-[hsl(var(--landing-cream)/0.3)] mt-0.5">✕</span> Your files or their content</li>
                  <li className="flex items-start gap-2"><span className="text-[hsl(var(--landing-cream)/0.3)] mt-0.5">✕</span> IP addresses (hashed, then discarded)</li>
                </ul>
              </div>
            </div>

            <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.65)] leading-relaxed">
                Credit top-ups go through Stripe. Stripe knows who paid, we only see: <code className="text-[hsl(var(--landing-copper))]">key_prefix um_abc12 received 500 credits</code>. No account, no login, no dashboard. The key is an anonymous credit token, not a customer relationship.
              </p>
            </div>
          </Section>

          {/* -- Integration Checklist -- */}
          <Section id="checklist">
            <IntegrationChecklist />
          </Section>

          {/* -- For Partners -- */}

          <div className="text-center py-4">
            <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] font-mono">
              The v1 contract is frozen. No breaking changes. Additions are backward-compatible.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-[hsl(var(--landing-cream)/0.06)] text-center">
            <p className="text-[hsl(var(--landing-cream)/0.45)] text-xs font-mono">
              Core v1 · Frozen protocol · <Link to="/status" className="underline hover:text-[hsl(var(--landing-cream)/0.7)]">Status</Link> · <Link to="/legal" className="underline hover:text-[hsl(var(--landing-cream)/0.7)]">Legal</Link>
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono mt-1">
              Independent verification: <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[hsl(var(--landing-cream)/0.6)]">verify-anchoring.org</a>
            </p>
          </div>
        </div>
      </div>
      <SupportChatWidget />
    </div>
  );
}