import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Terminal, Shield, Globe, Key, Clock, AlertTriangle } from 'lucide-react';

const BASE_URL = 'https://core.umarise.com';

function CopyBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-[hsl(220,10%,10%)] border border-[hsl(var(--landing-cream)/0.06)] rounded-md p-4 text-sm font-mono text-[hsl(var(--landing-cream)/0.8)] overflow-x-auto whitespace-pre">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.4)]" />}
      </button>
    </div>
  );
}

const TAB_LABELS = ['curl', 'Node.js', 'Python'] as const;

function CodeTabs({ examples }: { examples: { curl: string; node: string; python: string } }) {
  const [tab, setTab] = useState<number>(0);
  const code = [examples.curl, examples.node, examples.python][tab];
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              tab === i
                ? 'bg-[hsl(var(--landing-cream)/0.1)] text-[hsl(var(--landing-cream))]'
                : 'text-[hsl(var(--landing-cream)/0.35)] hover:text-[hsl(var(--landing-cream)/0.6)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <CopyBlock code={code} />
    </div>
  );
}

function Param({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-[hsl(var(--landing-cream)/0.04)] last:border-0">
      <code className="text-[hsl(var(--landing-copper))] text-sm font-mono shrink-0">{name}</code>
      <span className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono shrink-0">{type}</span>
      {required && <span className="text-amber-500/70 text-[10px] font-mono uppercase shrink-0">required</span>}
      <span className="text-[hsl(var(--landing-cream)/0.6)] text-sm">{desc}</span>
    </div>
  );
}

function Badge({ children, variant = 'public' }: { children: React.ReactNode; variant?: 'public' | 'partner' }) {
  return variant === 'public' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <Globe className="w-3 h-3" />{children}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Key className="w-3 h-3" />{children}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-400',
    POST: 'bg-blue-500/15 text-blue-400',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${colors[method] ?? 'bg-white/10 text-white/60'}`}>
      {method}
    </span>
  );
}

const endpoints = [
  { id: 'health', name: 'Health', method: 'GET', path: '/v1-core-health' },
  { id: 'origins', name: 'Attest', method: 'POST', path: '/v1-core-origins' },
  { id: 'resolve', name: 'Resolve', method: 'GET', path: '/v1-core-resolve' },
  { id: 'verify', name: 'Verify', method: 'POST', path: '/v1-core-verify' },
  { id: 'proof', name: 'Proof', method: 'GET', path: '/v1-core-proof' },
];

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.08)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-cream))] transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg text-[hsl(var(--landing-cream)/0.8)]">Umarise</span>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-10 pt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[hsl(var(--landing-muted))] text-sm uppercase tracking-[0.2em] mb-3">Core API v1</p>
            <h1 className="text-4xl font-serif text-[hsl(var(--landing-cream))] mb-3">API Reference</h1>
            <p className="text-[hsl(var(--landing-cream)/0.5)] max-w-xl">
              Complete technical reference for all Umarise Core endpoints. Base URL: <code className="text-[hsl(var(--landing-copper))]">{BASE_URL}</code>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.06)] sticky top-0 z-10 bg-[hsl(var(--landing-deep))]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex gap-4 overflow-x-auto">
          {endpoints.map((ep) => (
            <a key={ep.id} href={`#${ep.id}`} className="flex items-center gap-2 text-sm text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream))] transition-colors shrink-0">
              <MethodBadge method={ep.method} />
              <span className="font-mono text-xs">{ep.name}</span>
            </a>
          ))}
          <a href="#errors" className="flex items-center gap-2 text-sm text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream))] transition-colors shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" /><span className="font-mono text-xs">Errors</span>
          </a>
          <a href="#rate-limits" className="flex items-center gap-2 text-sm text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream))] transition-colors shrink-0">
            <Clock className="w-3.5 h-3.5" /><span className="font-mono text-xs">Rate Limits</span>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-20">

        {/* ─── 1. HEALTH ─── */}
        <section id="health">
          <SectionHeader method="GET" path="/v1-core-health" title="Health Check" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">Check API availability. Used for monitoring and status pages.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Parameters</h4>
          <p className="text-[hsl(var(--landing-cream)/0.4)] text-sm italic mb-6">None</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK</h4>
          <CopyBlock code={`{
  "status": "operational",
  "version": "v1",
  "timestamp": "2026-02-16T10:00:00.000Z"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 503 Service Unavailable</h4>
          <CopyBlock code={`{
  "status": "degraded",
  "version": "v1",
  "timestamp": "2026-02-16T10:00:00.000Z"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Examples</h4>
          <CodeTabs examples={{
            curl: `curl ${BASE_URL}/v1-core-health`,
            node: `import { UmariseCore } from './umarise-core';

const core = new UmariseCore();
const health = await core.health();
// → { status: "operational", version: "v1", timestamp: "..." }`,
            python: `from umarise_core import UmariseCore

core = UmariseCore()
health = core.health()
# → {"status": "operational", "version": "v1", "timestamp": "..."}`,
          }} />
        </section>

        {/* ─── 2. ORIGINS (ATTEST) ─── */}
        <section id="origins">
          <SectionHeader method="POST" path="/v1-core-origins" title="Create Attestation" badge={<Badge variant="partner">API Key</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">Register a new origin attestation. Creates an immutable, timestamped record for a SHA-256 hash.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Authentication</h4>
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">
            Requires <code className="text-[hsl(var(--landing-copper))]">X-API-Key</code> header with a valid partner key.
          </p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Request Body</h4>
          <div className="mb-6">
            <Param name="hash" type="string" required desc="SHA-256 hash. Accepts 'sha256:' prefix or raw 64-char hex. The API normalizes both formats." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Request Example</h4>
          <CopyBlock code={`{
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 201 Created</h4>
          <CopyBlock code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "pending"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Error Responses</h4>
          <ErrorList errors={[
            { code: 401, error: 'UNAUTHORIZED', desc: 'Missing or invalid API key' },
            { code: 401, error: 'API_KEY_REVOKED', desc: 'API key has been revoked' },
            { code: 400, error: 'INVALID_HASH_FORMAT', desc: 'Hash must be sha256: prefix + 64 hex chars, or raw 64-char hex' },
            { code: 429, error: 'RATE_LIMIT_EXCEEDED', desc: 'Too many requests' },
          ]} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Examples</h4>
          <CodeTabs examples={{
            curl: `curl -X POST ${BASE_URL}/v1-core-origins \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: um_your_key" \\
  -d '{"hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`,
            node: `import { UmariseCore } from './umarise-core';

const core = new UmariseCore({ apiKey: 'um_your_key' });
const origin = await core.attest(
  'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);
// → { origin_id: "...", hash: "sha256:...", proof_status: "pending" }`,
            python: `from umarise_core import UmariseCore

core = UmariseCore(api_key="um_your_key")
origin = core.attest(
    "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
)
# → {"origin_id": "...", "hash": "sha256:...", "proof_status": "pending"}`,
          }} />

          <Note>Once created, an attestation is immutable. It cannot be modified or deleted.</Note>
        </section>

        {/* ─── 3. RESOLVE ─── */}
        <section id="resolve">
          <SectionHeader method="GET" path="/v1-core-resolve" title="Resolve Origin" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">Look up an origin record by origin_id or hash. When resolving by hash, the earliest attestation (first-in-time) is returned.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
          <div className="mb-6">
            <Param name="origin_id" type="uuid" desc="The origin identifier. Provide either origin_id or hash." />
            <Param name="hash" type="string" desc="SHA-256 hash (with or without sha256: prefix). Returns the earliest attestation." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK</h4>
          <CopyBlock code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored",
  "bitcoin_block_height": 880123,
  "anchored_at": "2026-02-17T14:30:00.000Z"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 404 Not Found</h4>
          <CopyBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "Origin not found"
  }
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Examples</h4>
          <CodeTabs examples={{
            curl: `# By origin_id
curl "${BASE_URL}/v1-core-resolve?origin_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# By hash
curl "${BASE_URL}/v1-core-resolve?hash=sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`,
            node: `import { UmariseCore } from './umarise-core';

const core = new UmariseCore();

// By origin_id
const byId = await core.resolve({ originId: 'a1b2c3d4-...' });

// By hash
const byHash = await core.resolve({
  hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
});`,
            python: `from umarise_core import UmariseCore

core = UmariseCore()

# By origin_id
by_id = core.resolve(origin_id="a1b2c3d4-...")

# By hash
by_hash = core.resolve(
    hash="sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
)`,
          }} />

          <Note>Hash lookup always returns the earliest known attestation (first-in-time policy).</Note>
        </section>

        {/* ─── 4. VERIFY ─── */}
        <section id="verify">
          <SectionHeader method="POST" path="/v1-core-verify" title="Verify Hash" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">Check whether a hash exists in the registry. Verification is binary: match or no match. On match, the full origin record is returned.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Request Body</h4>
          <div className="mb-6">
            <Param name="hash" type="string" required desc="SHA-256 hash to verify. Accepts sha256: prefix or raw 64-char hex." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK (Match)</h4>
          <CopyBlock code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 404 Not Found</h4>
          <CopyBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "No attestation found for this hash"
  }
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Examples</h4>
          <CodeTabs examples={{
            curl: `curl -X POST ${BASE_URL}/v1-core-verify \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`,
            node: `import { UmariseCore } from './umarise-core';

const core = new UmariseCore();
const result = await core.verify(
  'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);
// result is null if no match, or the origin record`,
            python: `from umarise_core import UmariseCore

core = UmariseCore()
result = core.verify(
    "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
)
# result is None if no match, or the origin record`,
          }} />

          <Note>Verification is public and requires no authentication. Anyone with a hash can verify.</Note>
        </section>

        {/* ─── 5. PROOF ─── */}
        <section id="proof">
          <SectionHeader method="GET" path="/v1-core-proof" title="Download Proof" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">Download the OpenTimestamps (.ots) proof file for an origin. Returns raw binary data.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
          <div className="mb-6">
            <Param name="origin_id" type="uuid" required desc="The origin identifier to download the proof for." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK</h4>
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-2">
            Binary <code className="text-[hsl(var(--landing-copper))]">application/octet-stream</code> response containing the .ots file.
          </p>
          <div className="mb-6">
            <Param name="X-Bitcoin-Block-Height" type="header" desc="Bitcoin block height where the proof was anchored" />
            <Param name="X-Anchored-At" type="header" desc="ISO 8601 timestamp of anchoring" />
            <Param name="Content-Disposition" type="header" desc='attachment; filename="proof-{origin_id}.ots"' />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Response · 202 Accepted</h4>
          <CopyBlock code={`{
  "status": "pending",
  "message": "Proof not yet anchored to Bitcoin. Try again later."
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 404 Not Found</h4>
          <CopyBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "Origin not found"
  }
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Examples</h4>
          <CodeTabs examples={{
            curl: `curl "${BASE_URL}/v1-core-proof?origin_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \\
  -o proof.ots`,
            node: `import { UmariseCore } from './umarise-core';
import { writeFileSync } from 'fs';

const core = new UmariseCore();
const result = await core.proof('a1b2c3d4-e5f6-7890-abcd-ef1234567890');

if (result.proof) {
  writeFileSync('proof.ots', result.proof);
  console.log('Block height:', result.bitcoin_block_height);
}`,
            python: `from umarise_core import UmariseCore

core = UmariseCore()
result = core.proof("a1b2c3d4-e5f6-7890-abcd-ef1234567890")

if result.proof:
    with open("proof.ots", "wb") as f:
        f.write(result.proof)
    print("Block height:", result.bitcoin_block_height)`,
          }} />

          <Note>The .ots file can be independently verified using the OpenTimestamps client (ots-cli) against any Bitcoin node. No Umarise dependency required.</Note>
        </section>

        {/* ─── ERRORS ─── */}
        <section id="errors">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))] mb-2">Error Codes</h2>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">All errors follow a consistent format.</p>
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono uppercase tracking-wider mb-2">Error Response Format</h4>
          <CopyBlock code={`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retry_after_seconds": 42,
    "limit": 100,
    "window": "15m"
  }
}`} />

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">Code</th>
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">HTTP</th>
                  <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--landing-cream)/0.7)]">
                {[
                  ['UNAUTHORIZED', '401', 'Missing or invalid API key'],
                  ['API_KEY_REVOKED', '401', 'API key has been revoked'],
                  ['INVALID_HASH_FORMAT', '400', 'Hash not in sha256: prefix + 64 hex chars format'],
                  ['INVALID_REQUEST_BODY', '400', 'Malformed or missing request body'],
                  ['RATE_LIMIT_EXCEEDED', '429', 'Too many requests. Retry after retry_after_seconds'],
                  ['NOT_FOUND', '404', 'Origin or hash not found in the registry'],
                  ['INTERNAL_ERROR', '500', 'Server error'],
                ].map(([code, http, desc]) => (
                  <tr key={code} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                    <td className="py-2 pr-4 font-mono text-[hsl(var(--landing-copper))]">{code}</td>
                    <td className="py-2 pr-4 font-mono">{http}</td>
                    <td className="py-2">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── RATE LIMITS ─── */}
        <section id="rate-limits">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))] mb-2">Rate Limits</h2>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">Limits are enforced per API key (partner endpoints) or per IP hash (public endpoints).</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">Endpoint</th>
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">Scope</th>
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">Window</th>
                  <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--landing-cream)/0.7)]">
                {[
                  ['/v1-core-origins', 'Per API key', '15 min', 'Partner only'],
                  ['/v1-core-verify', 'Per IP (hashed)', '15 min', 'Public'],
                  ['/v1-core-resolve', 'Per IP (hashed)', '15 min', 'Public'],
                  ['/v1-core-proof', 'Per IP (hashed)', '15 min', 'Public'],
                  ['/v1-core-health', '—', '—', 'No rate limit'],
                ].map(([ep, scope, window, notes]) => (
                  <tr key={ep} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                    <td className="py-2 pr-4 font-mono text-[hsl(var(--landing-copper))]">{ep}</td>
                    <td className="py-2 pr-4">{scope}</td>
                    <td className="py-2 pr-4">{window}</td>
                    <td className="py-2 text-[hsl(var(--landing-cream)/0.4)]">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Note>IP addresses are never stored. Rate limiting uses SHA-256 hashed IPs for privacy-by-design.</Note>
        </section>

        {/* ─── FOOTER ─── */}
        <div className="pt-10 border-t border-[hsl(var(--landing-cream)/0.06)] text-center space-y-2">
          <p className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono">
            Core v1 · Frozen protocol · <Link to="/status" className="underline hover:text-[hsl(var(--landing-cream)/0.5)]">System Status</Link> · <Link to="/legal" className="underline hover:text-[hsl(var(--landing-cream)/0.5)]">Legal</Link>
          </p>
          <p className="text-[hsl(var(--landing-cream)/0.15)] text-xs font-mono">© Umarise</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ method, path, title, badge }: { method: string; path: string; title: string; badge: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4 border-b border-[hsl(var(--landing-cream)/0.08)]">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <MethodBadge method={method} />
        <code className="text-[hsl(var(--landing-cream)/0.9)] font-mono text-base">{path}</code>
        {badge}
      </div>
      <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))]">{title}</h2>
    </div>
  );
}

function ErrorList({ errors }: { errors: Array<{ code: number; error: string; desc: string }> }) {
  return (
    <div className="space-y-1">
      {errors.map((e) => (
        <div key={e.error} className="flex gap-3 py-1.5 text-sm">
          <span className="text-[hsl(var(--landing-cream)/0.3)] font-mono shrink-0">{e.code}</span>
          <code className="text-red-400/80 font-mono shrink-0">{e.error}</code>
          <span className="text-[hsl(var(--landing-cream)/0.5)]">{e.desc}</span>
        </div>
      ))}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex gap-3 items-start p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
      <Shield className="w-4 h-4 text-[hsl(var(--landing-copper))] shrink-0 mt-0.5" />
      <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">{children}</p>
    </div>
  );
}
