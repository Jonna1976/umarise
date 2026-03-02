import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Globe, Key } from 'lucide-react';

const BASE = 'https://core.umarise.com';

/* ── Primitives ── */

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

/* ── Sidebar nav ── */

const NAV = [
  { id: 'intro', label: 'Introduction' },
  { id: 'auth', label: 'Authentication' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'health', label: 'GET /health' },
  { id: 'origins', label: 'POST /origins' },
  { id: 'resolve', label: 'GET /resolve' },
  { id: 'verify', label: 'POST /verify' },
  { id: 'proof', label: 'GET /proof' },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate Limits' },
  { id: 'sdks', label: 'SDKs' },
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

/* ── Active section tracker ── */

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

/* ── Page ── */

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

          {/* ── Introduction ── */}
          <Section id="intro">
            <h1 className="text-3xl font-serif text-[hsl(var(--landing-cream))] mb-2">API Reference</h1>
            <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm max-w-lg">
              Umarise Core anchors SHA-256 hashes to Bitcoin. Immutable proof that data existed at a specific moment.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono mt-3">
              Base URL: <code className="text-[hsl(var(--landing-copper))]">{BASE}</code>
            </p>
          </Section>

          {/* ── Authentication ── */}
          <Section id="auth">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Authentication</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.7)] mb-3">
              One endpoint requires a key: <code className="text-[hsl(var(--landing-copper))]">POST /v1-core-origins</code>. All other endpoints are public.
            </p>
            <Code code={`X-API-Key: um_your_key_here`} />
            <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-3">
              Request a key: <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:underline">partners@umarise.com</a>
            </p>
          </Section>

          {/* ── Quick Start ── */}
          <Section id="quick-start">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-3">Quick Start</h2>
            <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-2">Two commands. Replace YOUR_KEY with your API key.</p>
            <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mb-4">
              Test hash: SHA-256 of an empty file. Safe to use for testing — this record already exists.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-1.5">1. Create an attestation</p>
                <Code
                  code={`curl -X POST ${BASE}/v1-core-origins \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
                  copy={`curl -X POST ${BASE}/v1-core-origins -H "Content-Type: application/json" -H "X-API-Key: YOUR_KEY" -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
                />
              </div>
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-1.5">2. Verify it</p>
                <Code
                  code={`curl -X POST ${BASE}/v1-core-verify \\
  -H "Content-Type: application/json" \\
  -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
                  copy={`curl -X POST ${BASE}/v1-core-verify -H "Content-Type: application/json" -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
                />
              </div>
            </div>
          </Section>

          {/* ── Endpoints ── */}

          <Section id="health">
            <Endpoint method="GET" path="/v1-core-health" title="Check API status." auth="public">
              <Code code={`// 200 OK
{ "status": "operational", "version": "v1", "timestamp": "..." }`} />
            </Endpoint>
          </Section>

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
              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)] mt-2">
                <code className="text-[hsl(var(--landing-copper))]">proof_status</code> changes from <code className="text-[hsl(var(--landing-copper))]">pending</code> → <code className="text-[hsl(var(--landing-copper))]">anchored</code> after 10–20 minutes.
                Poll <code className="text-[hsl(var(--landing-copper))]">GET /v1-core-resolve?origin_id=...</code> every 60 seconds until <code className="text-[hsl(var(--landing-copper))]">proof_status</code> is <code className="text-[hsl(var(--landing-copper))]">"anchored"</code>.
              </p>
            </Endpoint>
          </Section>

          <Section id="resolve">
            <Endpoint method="GET" path="/v1-core-resolve" title="Look up an origin by ID or hash. Hash lookups return the earliest attestation." auth="public">
              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Examples</h4>
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
            </Endpoint>
          </Section>

          <Section id="verify">
            <Endpoint method="POST" path="/v1-core-verify" title="Check if a hash exists in the registry. Returns the earliest attestation for this hash." auth="public">
              <Param name="hash" type="string" required desc="SHA-256 hash to verify" />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 200 (match)</h4>
              <Code code={`{
  "origin_id": "a1b2c3d4-...",
  "hash": "sha256:e3b0c44...",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored"
}`} />

              <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mt-5 mb-2">Response · 404 (no match)</h4>
              <Code code={`{ "error": { "code": "NOT_FOUND", "message": "No attestation found for this hash" } }`} />
            </Endpoint>
          </Section>

          <Section id="proof">
            <Endpoint method="GET" path="/v1-core-proof" title="Download the OpenTimestamps (.ots) proof file." auth="public">
              <Param name="origin_id" type="uuid" required desc="Origin to download proof for" />
              <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] mt-3 mb-1">Returns binary <code className="text-[hsl(var(--landing-copper))]">application/octet-stream</code>. 202 if still pending.</p>
              <Code code={`curl "${BASE}/v1-core-proof?origin_id=YOUR_ID" -o proof.ots`} />
            </Endpoint>
          </Section>

          {/* ── Errors ── */}
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

          {/* ── Rate Limits ── */}
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
                    ['/v1-core-health', 'No limit', '—'],
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

          {/* ── SDKs ── */}
          <Section id="sdks">
            <h2 className="text-lg font-serif text-[hsl(var(--landing-cream))] mb-2">SDKs</h2>
            <p className="text-sm text-[hsl(var(--landing-cream)/0.6)] mb-4">
              Thin wrappers around the REST API. Zero dependencies. Copy into your project or install from the package registry.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-2">Node.js / TypeScript</p>
                <Code code={`npm install @umarise/anchor`} />
                <Code code={`import { anchor, verify, hashBuffer } from '@umarise/anchor';

const hash = await hashBuffer(readFileSync('doc.pdf'));
await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });

// Verify (public, no key needed)
const result = await verify(hash);`} />
                <a href="https://github.com/Jonna1976/umarise-anchor" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-mono text-[hsl(var(--landing-copper))] hover:underline">
                  GitHub →
                </a>
              </div>
              <div>
                <p className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] mb-2">Python</p>
                <Code code={`pip install umarise`} />
                <Code code={`from umarise import UmariseCore, hash_buffer
import os

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])
origin = core.attest(hash_buffer(open("doc.pdf","rb").read()))

# Verify (public, no key needed)
result = UmariseCore().verify(file_hash)`} />
                <a href="https://github.com/Jonna1976/umarise-python" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-mono text-[hsl(var(--landing-copper))] hover:underline">
                  GitHub →
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-xs text-[hsl(var(--landing-cream)/0.5)]">
                <span className="text-amber-400/80 font-mono">Note:</span> REST API is production-ready. SDKs in final testing — use curl examples as fallback.
              </p>
            </div>
          </Section>

          {/* Footer */}
          <div className="pt-8 border-t border-[hsl(var(--landing-cream)/0.06)] text-center">
            <p className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono">
              Core v1 · Frozen protocol · <Link to="/status" className="underline hover:text-[hsl(var(--landing-cream)/0.6)]">Status</Link> · <Link to="/legal" className="underline hover:text-[hsl(var(--landing-cream)/0.6)]">Legal</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}