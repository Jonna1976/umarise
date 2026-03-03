import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Globe, Key } from 'lucide-react';

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
      <span className="text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs shrink-0 mt-0.5">{type}</span>
      {required && <span className="text-amber-500/70 text-[10px] font-mono uppercase shrink-0 mt-1">required</span>}
      <span className="text-[hsl(var(--landing-cream)/0.7)]">{desc}</span>
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
      <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm mb-4">{title}</p>
      {children}
    </div>
  );
}

/* -- Sidebar nav -- */

const NAV = [
  { id: 'intro', label: 'Introduction' },
  { id: 'auth', label: 'Authentication' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'origins', label: 'POST /origins' },
  { id: 'resolve', label: 'GET /resolve' },
  { id: 'verify', label: 'POST /verify' },
  { id: 'proof', label: 'GET /proof' },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate Limits' },
  { id: 'sdks', label: 'SDKs' },
  { id: 'faq', label: 'FAQ' },
  { id: 'faq', label: 'FAQ' },
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
                : 'text-[hsl(var(--landing-cream)/0.45)] hover:text-[hsl(var(--landing-cream)/0.8)]'
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
            <ArrowLeft className="w-4 h-4" /> Back
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
            <p className="text-sm text-[hsl(var(--landing-cream)/0.7)] leading-relaxed">
              An anchoring primitive that lets your users independently verify that specific bytes existed on or before a ledger-derived time - without relying on you or Umarise after creation.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono mt-3">
              Base URL: <code className="text-[hsl(var(--landing-copper))]">{BASE}</code> · All responses include <code className="text-[hsl(var(--landing-copper))]">X-API-Version: v1</code>
            </p>

            {/* Verify Now - instant gratification */}
            <div className="mt-6 p-4 rounded border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Verify a live anchor - public endpoint, no key required</p>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] mb-3">
                This hash is already anchored to Bitcoin block 935,037. Copy, paste, verify:
              </p>
              <Code
                code={`curl -X POST ${BASE}/v1-core-verify \\
  -H "Content-Type: application/json" \\
  -d '{"hash":"sha256:1d10e0d184c100b7327d9594a33cd266958ea6420b6cc3f5212921188858dd0a"}'`}
                copy={`curl -X POST ${BASE}/v1-core-verify -H "Content-Type: application/json" -d '{"hash":"sha256:1d10e0d184c100b7327d9594a33cd266958ea6420b6cc3f5212921188858dd0a"}'`}
              />
              <div className="mt-2 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono">
                  {">"} <span className="text-emerald-400">200</span>{' '}
                  {`{ "origin_id": "349d6734-...", "captured_at": "2026-02-02T14:09:41Z", "proof_status": "anchored" }`}
                </p>
              </div>
              <p className="text-[10px] text-[hsl(var(--landing-cream)/0.4)] mt-2">
                Typical response time: &lt;200ms. No account, no key, no SDK required.
              </p>
            </div>
          </Section>

          {/* -- Authentication -- */}
          <Section id="auth">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Authentication</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.7)] mb-3">
              One endpoint requires a key: <code className="text-[hsl(var(--landing-copper))]">POST /v1-core-origins</code>. All other endpoints are public.
            </p>
            <Code code={`X-API-Key: um_your_key_here`} />
            <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-3">
              Request a key: <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:underline">partners@umarise.com</a>
              <span className="text-[hsl(var(--landing-cream)/0.35)]"> - typically issued within 24 hours.</span>
            </p>

            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Request Headers</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Header</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Required</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Description</th>
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
                      <td className="py-2 text-[hsl(var(--landing-cream)/0.7)] text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response Envelope</h4>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] mb-2">
              Success responses return the resource directly. Error responses use a consistent envelope:
            </p>
            <Code code={`// Success (2xx)
{ "origin_id": "...", "hash": "...", ... }

// Error (4xx/5xx)
{ "error": { "code": "ERROR_CODE", "message": "Human-readable description" } }`} />
          </Section>

          {/* -- Quick Start -- */}
          <Section id="quick-start">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Quick Start</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] mb-4">
              Five steps in your terminal. Replace <code className="text-[hsl(var(--landing-copper))]">YOUR_KEY</code> with your API key.
            </p>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.5)] mb-6">
              Or use the SDK:{' '}
              <code className="text-[hsl(var(--landing-copper))]">npm install @umarise/anchor</code>
              {' '}→{' '}
              <a href="/sdk-download" className="text-[hsl(var(--landing-copper))] underline underline-offset-2 hover:text-[hsl(var(--landing-cream)/0.8)] transition-colors">
                docs &amp; quick start
              </a>
            </p>

            <div className="space-y-6">
              {/* Step 0 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-cream)/0.4)] font-mono text-sm font-bold">0.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Check API status</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">Optional. Confirm the API is online.</p>
                <Code
                  code={`curl "${BASE}/v1-core-health"`}
                  copy={`curl "${BASE}/v1-core-health"`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono">
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
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">Use the full file path, or run <code className="text-[hsl(var(--landing-copper))]">cd</code> to the file directory first. Your content never leaves your device.</p>
                <Code
                  code={`shasum -a 256 /path/to/yourfile.pdf`}
                  copy="shasum -a 256 /path/to/yourfile.pdf"
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono">
                    {">"} <span className="text-[hsl(var(--landing-cream)/0.8)]">a1b2c3d4e5f6...64 hex chars...</span>  /path/to/yourfile.pdf
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
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">Replace YOUR_KEY with your API key and paste the hash from step 1.</p>
                <Code
                  code={`curl -X POST ${BASE}/v1-core-origins \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                  copy={`curl -X POST ${BASE}/v1-core-origins -H "Content-Type: application/json" -H "X-API-Key: YOUR_KEY" -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono">
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
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">Poll until <code className="text-[hsl(var(--landing-copper))]">proof_status</code> changes to <code className="text-[hsl(var(--landing-copper))]">"anchored"</code>. Typical: ~1 hour, ledger-dependent.</p>
                <Code
                  code={`curl "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID"`}
                  copy={`curl "${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID"`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono">
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
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">Binary OpenTimestamps proof file. Available once <code className="text-[hsl(var(--landing-copper))]">proof_status</code> is <code className="text-[hsl(var(--landing-copper))]">"anchored"</code>.</p>
                <Code
                  code={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ORIGIN_ID" -o proof.ots`}
                  copy={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ORIGIN_ID" -o proof.ots`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)]">
                    This file completes your evidence bundle. Without it, only a registry check is possible — not independent Bitcoin verification.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">5.</span>
                  <p className="text-sm text-[hsl(var(--landing-cream)/0.8)]">Verify independently</p>
                </div>
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">No API key needed. No Umarise infrastructure required. Verify against Bitcoin using your hash + .ots proof.</p>
                <Code
                  code={`curl -X POST ${BASE}/v1-core-verify \\
  -H "Content-Type: application/json" \\
  -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                  copy={`curl -X POST ${BASE}/v1-core-verify -H "Content-Type: application/json" -d '{"hash":"sha256:PASTE_64_CHAR_HASH_HERE"}'`}
                />
                <div className="mt-2 ml-5 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono">
                    {">"} <span className="text-emerald-400">200</span>{' '}
                    {`{ "origin_id": "...", "captured_at": "...", "proof_status": "anchored" }`}
                  </p>
                  <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-2">
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
                <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-2 ml-5">Compose a self-contained ZIP for third parties. All components come from previous steps.</p>
                <Code
                  code={`# Compose an Anchor ZIP from API components
mkdir evidence && cd evidence

# 1. Your original file (never uploaded — already on your device)
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
                <span className="text-amber-400/80 font-mono">Smart polling with Retry-After:</span> When <code className="text-[hsl(var(--landing-copper))]">proof_status</code> is <code className="text-[hsl(var(--landing-copper))]">"pending"</code>, the response includes a <code className="text-[hsl(var(--landing-copper))]">Retry-After: 3600</code> header (~1 hour). Use this to schedule your next check — no guessing needed.
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
                <span className="text-amber-400/70">Coming soon:</span> Webhook callbacks — register a URL and we POST when your proof is anchored. Zero polling.
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
              <Param name="proof_status" type="string" desc={`"pending" → "anchored" after Bitcoin confirmation. When pending, response includes Retry-After: 900 header.`} />

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
              <Param name="proof_status" type="string" desc={`"pending" or "anchored". When pending, Retry-After: 900 header is included.`} />
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
              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Request</h4>
              <Param name="hash" type="string" required desc="SHA-256 hash to verify (64 hex chars, optional sha256: prefix)" />
              <Code code={`{ "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 200 (match)</h4>
              <Code code={`{
  "origin_id": "a1b2c3d4-...",
  "hash": "sha256:e3b0c44...",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored"
}`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response fields</h4>
              <Param name="origin_id" type="uuid" desc="Unique identifier for the earliest attestation of this hash." />
              <Param name="hash" type="string" desc="Echoed hash with algorithm prefix." />
              <Param name="captured_at" type="ISO 8601" desc="When this hash was first registered." />
              <Param name="proof_status" type="string" desc={`"pending" or "anchored".`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Error responses</h4>
              <Code code={`// 404 - Hash not found in registry
{ "error": { "code": "NOT_FOUND", "message": "No attestation found for this hash" } }`} />
              <Code code={`// 400 - Invalid hash format
{ "error": { "code": "INVALID_HASH_FORMAT", "message": "Expected 64 hex characters" } }`} />

              <p className="text-xs text-[hsl(var(--landing-cream)/0.35)] mt-3">
                Typical response time: &lt;200ms. Rate limit: 1,000/min per IP. No API key required.
              </p>
            </Endpoint>
          </Section>

          <Section id="proof">
            <Endpoint method="GET" path="/v1-core-proof" title="Download the OpenTimestamps (.ots) proof file." auth="public">
              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
              <Param name="origin_id" type="uuid" required desc="Origin to download proof for" />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 200</h4>
              <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] mb-1">Binary <code className="text-[hsl(var(--landing-copper))]">application/octet-stream</code>. Save as <code className="text-[hsl(var(--landing-copper))]">.ots</code> file.</p>
              <Code code={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ID" -o proof.ots`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 202 (pending)</h4>
              <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] mb-1">Proof not yet available. Bitcoin anchoring in progress.</p>
              <Code code={`{ "error": { "code": "PROOF_PENDING", "message": "Proof is pending Bitcoin confirmation" } }`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Error responses</h4>
              <Code code={`// 404 - Origin not found
{ "error": { "code": "NOT_FOUND", "message": "No attestation found for this origin_id" } }`} />

              <p className="text-xs text-[hsl(var(--landing-cream)/0.6)] mt-4">
                Verify independently at{' '}
                <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">
                  verify-anchoring.org
                </a>
                {' '}- no account required.
              </p>
              <p className="text-xs text-[hsl(var(--landing-cream)/0.35)] mt-1">
                Typical response time: &lt;200ms. Rate limit: 1,000/min per IP.
              </p>
            </Endpoint>
          </Section>

          {/* -- Errors -- */}
          <Section id="errors">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-4">Errors</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Code</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">HTTP</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Description</th>
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
                      <td className="py-2 text-[hsl(var(--landing-cream)/0.7)] text-xs">{desc}</td>
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
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Endpoint</th>
                    <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Limit</th>
                    <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs">Scope</th>
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
                      <td className="py-2 text-[hsl(var(--landing-cream)/0.6)] text-xs">{scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-3">
              Headers: <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Limit</code>, <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Remaining</code>, <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Reset</code> (Unix timestamp)
            </p>
          </Section>

          {/* -- SDKs -- */}
          <Section id="sdks">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-2">SDKs</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] mb-4">
              Thin wrappers around the REST API. Zero dependencies. Copy into your project or install from the package registry.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-2">Node.js / TypeScript</p>
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
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-2">Python</p>
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
              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)]">
                <span className="text-emerald-400/80 font-mono">v1.0.0</span> - REST API and SDKs are production-ready. Released under the <a href="https://unlicense.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Unlicense</a> (Public Domain).
              </p>
            </div>
          </Section>

          {/* -- FAQ -- */}
          <Section id="faq">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">

              {/* Q1 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"This looks simple - can't anyone build this?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  Yes. The <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> is public domain. The <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">reference verifier</a> is forkable. That is the point - anchoring is infrastructure, not a product. The specification exists so anyone can implement it. The API exists so no one has to build Merkle-batching, OTS calendar management, and Bitcoin monitoring from scratch.
                </p>
              </div>

              {/* Q2 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"We already hash our files with SHA-256. How is this different?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  SHA-256 proves <em>integrity</em> - the bytes have not changed. Anchoring proves <em>chronology</em> - these bytes existed on or before time T. A hash without external time binding is self-attested: it could be generated today and claimed to be from last year. Anchoring binds the hash to Bitcoin's public ledger, creating an independently verifiable temporal reference.
                </p>
              </div>

              {/* Q3 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"What does this add beyond raw OpenTimestamps?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  OpenTimestamps is a protocol - like HTTP is a protocol. A web application is not "HTTP." OTS defines how to commit a hash to Bitcoin. The Core API uses OTS as transport and adds everything above it: a standardized REST interface, automatic Merkle-batching, stable <code className="text-[hsl(var(--landing-copper))]">origin_id</code> references, resolve/verify/proof endpoints, idempotent registration, and the <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> - a semantic framework defining exactly what a proof does and does not establish.
                </p>
              </div>

              {/* Q4 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"There are other cryptographic timestamping services. Why this one?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  Most timestamping services (RFC 3161 TSAs, OriginStamp, etc.) require trust in the issuer - if the Certificate Authority or service disappears, verification may break. The Core API anchors to Bitcoin via OpenTimestamps: verification is trustless. The .ots proof file + original artifact + any SHA-256 calculator + the public Bitcoin blockchain = complete verification, indefinitely. No account required. No dependency on the issuing infrastructure.
                </p>
              </div>

              {/* Q5 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Is this ledger-agnostic? We use a different blockchain."</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  The <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> defines <em>ledger qualification criteria</em>, not a specific blockchain. Bitcoin is the current ledger. Any ledger that is publicly accessible, append-only, provides independently verifiable time ordering, and is not controlled by the proof issuer qualifies under the specification.
                </p>
              </div>

              {/* Q6 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Can we bulk-anchor existing files retroactively?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  Yes. The API accepts hashes, not files. Hash locally, POST each hash to <code className="text-[hsl(var(--landing-copper))]">/v1-core-origins</code>. The backend batches hashes into Merkle trees automatically. Rate limit: 100 requests/min per API key. The anchor timestamp reflects when the hash was submitted, not when the file was originally created - anchoring proves "existed no later than T." It cannot backdate.
                </p>
              </div>

              {/* Q7 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"What if the infrastructure provider disappears?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  Once anchored, the proof is self-contained. The .ots file + original artifact + <code className="text-[hsl(var(--landing-copper))]">sha256sum</code> + the public Bitcoin blockchain = complete verification. No API, no account, no issuer infrastructure required. The <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">reference verifier</a> is open source, zero-backend, and forkable. The proof survives the issuer.
                </p>
              </div>

              {/* Q8 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Can the API operator see our data?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  No. The API receives SHA-256 hashes only - never files. A SHA-256 hash is a one-way function: without the original artifact, the hash is meaningless. There is no mechanism in the infrastructure to store, receive, or reconstruct file content. The hash crosses the network boundary. The content does not.
                </p>
              </div>

              {/* Q9 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"Can anyone - including the operator - modify or delete an existing record?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  No. Database-level immutability triggers block UPDATE and DELETE operations, including for internal service roles. Row-level security blocks all client-side mutations. Bitcoin anchoring makes retroactive modification mathematically detectable. This is enforced by architecture, not policy - no administrative override exists that can alter a committed record.
                </p>
              </div>

              {/* Q10 */}
              <div className="border-b border-[hsl(var(--landing-cream)/0.06)] pb-6">
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"We already use an RFC 3161 TSA. Should we switch?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  Not necessarily. RFC 3161 TSAs rely on a trusted Certificate Authority - if the CA is compromised or discontinued, verification depends on that infrastructure. The Core API anchors to Bitcoin via OTS: trustless, no CA dependency. The <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">Anchoring Specification</a> is open: any timestamping solution meeting the ledger qualification criteria can be conformant regardless of transport. The relevant question is whether proofs remain verifiable independent of the issuer.
                </p>
              </div>

              {/* Q11 */}
              <div>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.9)] font-medium mb-2">"How does Umarise anchoring differ from C2PA?"</p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed">
                  Umarise anchoring and C2PA operate at different verification layers. An anchoring proof asserts only: the exact byte sequence (or its cryptographic hash) existed at or before time T. Time T is derived from a publicly verifiable ledger. Verification requires recomputing the hash, validating the ledger inclusion proof, and confirming ledger timestamp finality.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed mt-2">
                  Anchoring does not assert authorship, identity, ownership, originality, tool usage, editing history, or whether content is AI-generated.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed mt-2">
                  C2PA, by contrast, asserts that a specific identity signed a manifest describing provenance and production history. C2PA binds time to identity via PKI. Anchoring binds time directly to exact bytes via ledger inclusion.
                </p>
                <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] leading-relaxed mt-2">
                  Anchoring proofs MAY be embedded as C2PA assertions when both identity provenance and independently verifiable temporal existence are required.
                </p>
              </div>

            </div>

            {/* Bitcoin disclaimer */}
            <div className="mt-8 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.45)]">
                Umarise uses the Bitcoin blockchain as a public, immutable timestamp ledger - not as a currency. No wallets, no coins, no financial transactions.
              </p>
            </div>
          </Section>

          {/* -- For Partners -- */}

          <div className="text-center py-4">
            <p className="text-xs text-[hsl(var(--landing-cream)/0.35)] font-mono">
              The v1 contract is frozen. No breaking changes. Additions are backward-compatible.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-[hsl(var(--landing-cream)/0.06)] text-center">
            <p className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono">
              Core v1 · Frozen protocol · <Link to="/status" className="underline hover:text-[hsl(var(--landing-cream)/0.6)]">Status</Link> · <Link to="/legal" className="underline hover:text-[hsl(var(--landing-cream)/0.6)]">Legal</Link>
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.25)] text-xs font-mono mt-1">
              Independent verification: <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[hsl(var(--landing-cream)/0.5)]">verify-anchoring.org</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}