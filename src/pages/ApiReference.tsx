import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Clock, Zap, ListChecks, PlayCircle, FileCode2 } from 'lucide-react';
import { CopyBlock, CodeTabs, Param, Badge, MethodBadge, SectionHeader, ErrorList, Note } from '@/components/api-reference/shared';
import QuickStartSection from '@/components/api-reference/QuickStartSection';
import IntegrationChecklist from '@/components/api-reference/IntegrationChecklist';
import SupportChatWidget from '@/components/api-reference/SupportChatWidget';
import LiveDemoFlow from '@/components/api-reference/LiveDemoFlow';
import IntegrationTemplates from '@/components/api-reference/IntegrationTemplates';

const BASE_URL = 'https://core.umarise.com';

const endpoints = [
  { id: 'quick-start', name: 'Quick Start', icon: Zap },
  { id: 'live-demo', name: 'Try it Live', icon: PlayCircle },
  { id: 'health', name: 'Health', method: 'GET' },
  { id: 'origins', name: 'Attest', method: 'POST' },
  { id: 'resolve', name: 'Resolve', method: 'GET' },
  { id: 'verify', name: 'Verify', method: 'POST' },
  { id: 'proof', name: 'Proof', method: 'GET' },
  { id: 'templates', name: 'Templates', icon: FileCode2 },
  { id: 'frameworks', name: 'Frameworks', icon: FileCode2 },
  { id: 'troubleshooting', name: 'Troubleshoot', icon: AlertTriangle },
  { id: 'checklist', name: 'Checklist', icon: ListChecks },
  { id: 'errors', name: 'Errors', icon: AlertTriangle },
  { id: 'rate-limits', name: 'Rate Limits', icon: Clock },
];

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.08)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-cream))] transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Terug</span>
          </Link>
          <span className="font-serif text-lg text-[hsl(var(--landing-cream)/0.9)]">Umarise</span>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-10 pt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[hsl(var(--landing-muted))] text-sm uppercase tracking-[0.2em] mb-3">Core API v1</p>
            <h1 className="text-4xl font-serif text-[hsl(var(--landing-cream))] mb-3">API Reference</h1>
            <p className="text-[hsl(var(--landing-cream)/0.7)] max-w-xl">
              Alles wat je nodig hebt om te integreren met Umarise Core. Base URL: <code className="text-[hsl(var(--landing-copper))]">{BASE_URL}</code>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.06)] sticky top-0 z-10 bg-[hsl(var(--landing-deep))]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex gap-4 overflow-x-auto">
          {endpoints.map((ep) => (
            <a key={ep.id} href={`#${ep.id}`} className="flex items-center gap-2 text-sm text-[hsl(var(--landing-cream)/0.7)] hover:text-[hsl(var(--landing-cream))] transition-colors shrink-0">
              {'method' in ep && ep.method ? <MethodBadge method={ep.method} /> : ep.icon && <ep.icon className="w-3.5 h-3.5" />}
              <span className="font-mono text-xs">{ep.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-20">

        {/* ─── QUICK START ─── */}
        <QuickStartSection />

        {/* ─── LIVE DEMO ─── */}
        <LiveDemoFlow />

        {/* ─── 1. HEALTH ─── */}
        <section id="health">
          <SectionHeader method="GET" path="/v1-core-health" title="Health Check" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-6">Controleer of de API bereikbaar is. Gebruik voor monitoring en statuspagina's.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Parameters</h4>
          <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm italic mb-6">Geen</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK</h4>
          <CopyBlock code={`{
  "status": "operational",
  "version": "v1",
  "timestamp": "2026-02-16T10:00:00.000Z"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 503 Service Unavailable</h4>
          <CopyBlock code={`{
  "status": "degraded",
  "version": "v1",
  "timestamp": "2026-02-16T10:00:00.000Z",
  "database": "unreachable"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Voorbeelden</h4>
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
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-6">Registreer een nieuwe origin-attestatie. Maakt een onwijzigbaar, getimestampt record aan voor een SHA-256 hash.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Authenticatie</h4>
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-6">
            Vereist <code className="text-[hsl(var(--landing-copper))]">X-API-Key</code> header met een geldige partner key.
          </p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Request Body</h4>
          <div className="mb-6">
            <Param name="hash" type="string" required desc="SHA-256 hash. Accepteert 'sha256:' prefix of raw 64-karakter hex. De API normaliseert beide formaten." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Request voorbeeld</h4>
          <CopyBlock code={`{
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 201 Created</h4>
          <CopyBlock code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "pending"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Foutmeldingen</h4>
          <ErrorList errors={[
            { code: 401, error: 'UNAUTHORIZED', desc: 'Ontbrekende of ongeldige API key' },
            { code: 401, error: 'API_KEY_REVOKED', desc: 'API key is ingetrokken' },
            { code: 400, error: 'INVALID_HASH_FORMAT', desc: 'Hash moet sha256: prefix + 64 hex karakters zijn, of raw 64-karakter hex' },
            { code: 409, error: 'DUPLICATE_HASH', desc: 'Deze hash is al geattesteerd met deze API key' },
            { code: 429, error: 'RATE_LIMIT_EXCEEDED', desc: 'Te veel requests' },
          ]} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Voorbeelden</h4>
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

          <Note>Eenmaal aangemaakt is een attestatie onwijzigbaar. Het kan niet worden aangepast of verwijderd.</Note>
        </section>

        {/* ─── 3. RESOLVE ─── */}
        <section id="resolve">
          <SectionHeader method="GET" path="/v1-core-resolve" title="Resolve Origin" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-6">Zoek een origin record op via origin_id of hash. Bij hash-lookup wordt de vroegste attestatie (first-in-time) teruggegeven.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
          <div className="mb-6">
            <Param name="origin_id" type="uuid" desc="De origin identifier. Geef origin_id of hash mee." />
            <Param name="hash" type="string" desc="SHA-256 hash (met of zonder sha256: prefix). Retourneert de vroegste attestatie." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK</h4>
          <CopyBlock code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored",
  "proof_url": "https://core.umarise.com/v1-core-proof?origin_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "bitcoin_block_height": 880123,
  "anchored_at": "2026-02-17T14:30:00.000Z"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 404 Not Found</h4>
          <CopyBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "Origin not found"
  }
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Voorbeelden</h4>
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

          <Note>Hash-lookup retourneert altijd de vroegst bekende attestatie (first-in-time principe).</Note>
        </section>

        {/* ─── 4. VERIFY ─── */}
        <section id="verify">
          <SectionHeader method="POST" path="/v1-core-verify" title="Verify Hash" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-6">Controleer of een hash bestaat in de registry. Verificatie is binair: match of geen match. Bij een match wordt het volledige origin record teruggegeven.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Request Body</h4>
          <div className="mb-6">
            <Param name="hash" type="string" required desc="SHA-256 hash om te verifiëren. Accepteert sha256: prefix of raw 64-karakter hex." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK (Match)</h4>
          <CopyBlock code={`{
  "origin_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-16T10:00:00.000Z",
  "proof_status": "anchored"
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 404 Not Found</h4>
          <CopyBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "No attestation found for this hash"
  }
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Voorbeelden</h4>
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

          <Note>Verificatie is publiek en vereist geen authenticatie. Iedereen met een hash kan verifiëren.</Note>
        </section>

        {/* ─── 5. PROOF ─── */}
        <section id="proof">
          <SectionHeader method="GET" path="/v1-core-proof" title="Download Proof" badge={<Badge variant="public">Public</Badge>} />
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-6">Download het OpenTimestamps (.ots) proof-bestand voor een origin. Retourneert ruwe binaire data.</p>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Query Parameters</h4>
          <div className="mb-6">
            <Param name="origin_id" type="uuid" required desc="De origin identifier waarvoor het proof gedownload wordt." />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Response · 200 OK</h4>
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-2">
            Binaire <code className="text-[hsl(var(--landing-copper))]">application/octet-stream</code> response met het .ots bestand.
          </p>
          <div className="mb-6">
            <Param name="X-Bitcoin-Block-Height" type="header" desc="Bitcoin block height waar het proof is verankerd" />
            <Param name="X-Anchored-At" type="header" desc="ISO 8601 timestamp van verankering" />
            <Param name="Content-Disposition" type="header" desc='attachment; filename="proof-{origin_id}.ots"' />
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Response · 202 Accepted</h4>
          <CopyBlock code={`{
  "status": "pending",
  "message": "Proof not yet anchored to Bitcoin. Try again later."
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Response · 404 Not Found</h4>
          <CopyBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "Origin not found"
  }
}`} />

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Voorbeelden</h4>
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

          <Note>Het .ots bestand kan onafhankelijk worden geverifieerd met de OpenTimestamps client (ots-cli) tegen elke Bitcoin node. Geen Umarise-afhankelijkheid vereist.</Note>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mt-6 mb-2">Polling voor Anchor Status</h4>
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-4">
            Na attestatie is <code className="text-[hsl(var(--landing-copper))]">proof_status</code> <code className="text-[hsl(var(--landing-copper))]">"pending"</code>. Poll <code className="text-[hsl(var(--landing-copper))]">GET /v1-core-resolve</code> elke 60 seconden tot de status verandert naar <code className="text-[hsl(var(--landing-copper))]">"anchored"</code>. Gemiddelde ankertijd: 10–20 minuten.
          </p>
          <CopyBlock code={`# Poll until anchored (typically 10-20 min)
while true; do
  STATUS=$(curl -s "$BASE/v1-core-resolve?origin_id=$ORIGIN_ID" | grep -o '"proof_status":"[^"]*"' | cut -d'"' -f4)
  [ "$STATUS" = "anchored" ] && echo "Anchored!" && break
  echo "Status: $STATUS — retrying in 60s..."
  sleep 60
done`} />
        </section>

        {/* ─── ERRORS ─── */}
        <section id="errors">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))] mb-2">Error Codes</h2>
            <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm">Alle fouten volgen een consistent formaat.</p>
          </div>

          <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-2">Error Response Formaat</h4>
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
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">Code</th>
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">HTTP</th>
                  <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">Beschrijving</th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--landing-cream)/0.85)]">
                {[
                  ['UNAUTHORIZED', '401', 'Ontbrekende of ongeldige API key'],
                  ['API_KEY_REVOKED', '401', 'API key is ingetrokken'],
                  ['INVALID_HASH_FORMAT', '400', 'Hash niet in sha256: prefix + 64 hex karakters formaat'],
                  ['INVALID_REQUEST_BODY', '400', 'Onjuist of ontbrekend request body'],
                  ['DUPLICATE_HASH', '409', 'Deze hash is al geattesteerd met deze API key'],
                  ['RATE_LIMIT_EXCEEDED', '429', 'Te veel requests. Retry na retry_after_seconds'],
                  ['NOT_FOUND', '404', 'Origin of hash niet gevonden in de registry'],
                  ['INTERNAL_ERROR', '500', 'Serverfout'],
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
            <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm">Limieten gelden per API key (partner endpoints) of per IP-hash (publieke endpoints).</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">Endpoint</th>
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">Scope</th>
                  <th className="text-left py-2 pr-4 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">Window</th>
                  <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.6)] font-mono text-xs uppercase">Opmerkingen</th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--landing-cream)/0.85)]">
                {[
                  ['/v1-core-origins', 'Per API key', '100/min', 'Alleen partners'],
                  ['/v1-core-verify', 'Per IP (gehasht)', '1.000/min', 'Publiek'],
                  ['/v1-core-resolve', 'Per IP (gehasht)', '1.000/min', 'Publiek'],
                  ['/v1-core-proof', 'Per IP (gehasht)', '1.000/min', 'Publiek'],
                  ['/v1-core-health', '—', '—', 'Geen rate limit'],
                ].map(([ep, scope, window, notes]) => (
                  <tr key={ep} className="border-b border-[hsl(var(--landing-cream)/0.04)]">
                    <td className="py-2 pr-4 font-mono text-[hsl(var(--landing-copper))]">{ep}</td>
                    <td className="py-2 pr-4">{scope}</td>
                    <td className="py-2 pr-4">{window}</td>
                    <td className="py-2 text-[hsl(var(--landing-cream)/0.6)]">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Note>IP-adressen worden nooit opgeslagen. Rate limiting gebruikt SHA-256 gehashte IP's voor privacy-by-design.</Note>

          <div className="mt-6 p-4 rounded-lg bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)]">
            <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm font-medium mb-2">Rate limit headers</p>
            <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm">
              Elke response bevat rate limit headers: <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Limit</code>, <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Remaining</code>, <code className="text-[hsl(var(--landing-copper))]">X-RateLimit-Reset</code> (Unix timestamp).
            </p>
          </div>
        </section>

        {/* ─── INTEGRATION TEMPLATES ─── */}
        <IntegrationTemplates />

        {/* ─── INTEGRATION CHECKLIST ─── */}
        <IntegrationChecklist />

        {/* ─── FOOTER ─── */}
        <div className="pt-10 border-t border-[hsl(var(--landing-cream)/0.06)] text-center space-y-2">
          <p className="text-[hsl(var(--landing-cream)/0.45)] text-xs font-mono">
            Core v1 · Frozen protocol · <Link to="/status" className="underline hover:text-[hsl(var(--landing-cream)/0.7)]">System Status</Link> · <Link to="/legal" className="underline hover:text-[hsl(var(--landing-cream)/0.7)]">Legal</Link>
          </p>
          <p className="text-[hsl(var(--landing-cream)/0.25)] text-xs font-mono">© Umarise</p>
        </div>
      </div>

      <SupportChatWidget />
    </div>
  );
}
