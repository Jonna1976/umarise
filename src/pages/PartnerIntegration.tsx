import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Terminal, Code2, Shield, ExternalLink, Layers, Clock, FileCheck } from 'lucide-react';

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="absolute top-2 right-2 p-1.5 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors"
    >
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.4)]" />}
    </button>
  );
}

function CodeBlock({ code, copy }: { code: string; copy?: string }) {
  return (
    <div className="relative">
      <CopyBtn text={copy ?? code} />
      <pre className="bg-[hsl(220,10%,6%)] border border-[hsl(var(--landing-cream)/0.06)] rounded-lg p-4 pr-12 text-[13px] font-mono text-[hsl(var(--landing-cream)/0.85)] overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
    </div>
  );
}

function TrackBadge({ track, label }: { track: 'a' | 'b'; label: string }) {
  const style = track === 'a'
    ? 'bg-[hsl(var(--landing-copper)/0.12)] text-[hsl(var(--landing-copper))] border-[hsl(var(--landing-copper)/0.25)]'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border ${style}`}>{label}</span>;
}

export default function PartnerIntegration() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[hsl(var(--landing-deep)/0.95)] backdrop-blur-md border-b border-[hsl(var(--landing-cream)/0.06)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[hsl(var(--landing-cream)/0.6)] hover:text-[hsl(var(--landing-cream))] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            umarise.com
          </Link>
          <a href="mailto:partners@umarise.com" className="text-sm text-[hsl(var(--landing-copper))] hover:text-[hsl(var(--landing-cream))] transition-colors">
            partners@umarise.com
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">

        {/* Header */}
        <header className="mb-20">
          <p className="text-[hsl(var(--landing-copper))] font-mono text-xs uppercase tracking-[0.2em] mb-4">Integration Overview</p>
          <h1 className="font-['Playfair_Display'] text-[clamp(28px,5vw,48px)] font-light leading-[1.1] mb-6 max-w-3xl">
            Anchor any digital artifact to the Bitcoin blockchain.
            <br />
            <span className="text-[hsl(var(--landing-cream)/0.5)]">Verify independently, forever.</span>
          </h1>
          <p className="text-[hsl(var(--landing-cream)/0.6)] text-lg max-w-2xl leading-relaxed">
            Umarise provides an anchoring primitive that enables independent verification that specific bytes existed at or before a ledger-derived point in time - without post-creation reliance on any single party.
          </p>
        </header>

        {/* Two Tracks Visual */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Track A */}
            <div className="border border-[hsl(var(--landing-copper)/0.2)] rounded-xl p-8 bg-[hsl(var(--landing-copper)/0.03)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--landing-copper)/0.1)] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[hsl(var(--landing-copper))]" />
                </div>
                <TrackBadge track="a" label="Track A" />
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl font-light mb-2">Retroactive</h2>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6 leading-relaxed">
                Anchor what already exists. Turn an existing folder of files - photos, documents, badges, archives - into Bitcoin-anchored proof.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Terminal className="w-4 h-4 mt-0.5 text-[hsl(var(--landing-copper)/0.7)]" />
                  <span className="text-[hsl(var(--landing-cream)/0.7)]">CLI scripts on macOS/Linux</span>
                </div>
                <div className="flex items-start gap-3">
                  <Layers className="w-4 h-4 mt-0.5 text-[hsl(var(--landing-copper)/0.7)]" />
                  <span className="text-[hsl(var(--landing-cream)/0.7)]">Batch processing (~100 files/min)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 mt-0.5 text-[hsl(var(--landing-copper)/0.7)]" />
                  <span className="text-[hsl(var(--landing-cream)/0.7)]">Files never leave the device</span>
                </div>
              </div>
            </div>

            {/* Track B */}
            <div className="border border-emerald-500/15 rounded-xl p-8 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                </div>
                <TrackBadge track="b" label="Track B" />
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl font-light mb-2">Prospective</h2>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6 leading-relaxed">
                Anchor everything going forward. Integrate anchoring into application code so every badge, contract, or report is anchored at the moment of creation.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Code2 className="w-4 h-4 mt-0.5 text-emerald-400/70" />
                  <span className="text-[hsl(var(--landing-cream)/0.7)]">SDK (Node.js, Python) or direct API</span>
                </div>
                <div className="flex items-start gap-3">
                  <Layers className="w-4 h-4 mt-0.5 text-emerald-400/70" />
                  <span className="text-[hsl(var(--landing-cream)/0.7)]">Real-time anchoring at creation</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 mt-0.5 text-emerald-400/70" />
                  <span className="text-[hsl(var(--landing-cream)/0.7)]">Time to first attestation: &lt;20 min</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture diagram */}
        <section className="mb-20">
          <div className="border border-[hsl(var(--landing-cream)/0.06)] rounded-xl p-8 md:p-12 bg-[hsl(220,10%,6%)]">
            <div className="grid grid-cols-2 gap-8 md:gap-16 text-center font-mono text-[13px] text-[hsl(var(--landing-cream)/0.6)]">
              {/* Headers */}
              <div>
                <p className="text-[hsl(var(--landing-copper))] font-medium mb-1">Track A: Retroactive</p>
                <p className="text-[hsl(var(--landing-cream)/0.4)] text-[11px] italic">"Anchor what already exists"</p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium mb-1">Track B: Prospective</p>
                <p className="text-[hsl(var(--landing-cream)/0.4)] text-[11px] italic">"Anchor everything going forward"</p>
              </div>

              {/* Sources */}
              <div className="space-y-1">
                <p className="text-[hsl(var(--landing-cream)/0.8)]">Existing archive</p>
                <p className="text-[hsl(var(--landing-cream)/0.4)] text-[11px]">(photos, docs, badges)</p>
                <div className="flex justify-center py-2"><div className="w-px h-6 bg-[hsl(var(--landing-cream)/0.15)]" /></div>
                <p>Local SHA-256 hashing</p>
              </div>
              <div className="space-y-1">
                <p className="text-[hsl(var(--landing-cream)/0.8)]">Your application</p>
                <p className="text-[hsl(var(--landing-cream)/0.4)] text-[11px]">(badges, contracts, reports)</p>
                <div className="flex justify-center py-2"><div className="w-px h-6 bg-[hsl(var(--landing-cream)/0.15)]" /></div>
                <p>SDK/API call at creation</p>
              </div>
            </div>

            {/* Convergence */}
            <div className="flex justify-center py-3">
              <div className="flex items-end gap-0">
                <div className="w-[calc(25%-1rem)] md:w-32 h-px border-t border-dashed border-[hsl(var(--landing-cream)/0.15)]" />
                <div className="w-px h-6 bg-[hsl(var(--landing-cream)/0.15)]" />
                <div className="w-px h-6 bg-[hsl(var(--landing-cream)/0.15)] ml-1" />
                <div className="w-[calc(25%-1rem)] md:w-32 h-px border-t border-dashed border-[hsl(var(--landing-cream)/0.15)]" />
              </div>
            </div>

            <div className="text-center font-mono text-[13px] space-y-1">
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium">POST /v1-core-origins</p>
              <div className="flex justify-center py-2"><div className="w-px h-6 bg-[hsl(var(--landing-cream)/0.15)]" /></div>
              <p className="text-[hsl(var(--landing-cream)/0.6)]">Bitcoin (OTS) ~24h</p>
              <div className="flex justify-center py-2"><div className="w-px h-6 bg-[hsl(var(--landing-cream)/0.15)]" /></div>
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium">Verifiable proof</p>
            </div>
          </div>
        </section>

        {/* Track A Detail */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <TrackBadge track="a" label="Track A — Retroactive" />
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-light mb-2 text-[hsl(var(--landing-cream)/0.9)]">
            Turn an existing folder into Bitcoin-anchored proof in 3 commands
          </h3>
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-8">Computes SHA-256 hashes locally per file. Bytes never leave the device. Only the hash is transmitted.</p>

          <div className="space-y-4">
            <div>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">1. Set API key</p>
              <CodeBlock code={`export CORE_API_KEY=um_your_key`} />
            </div>
            <div>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">2. Anchor a folder</p>
              <CodeBlock code={`./anchor-dir.sh "/path/to/folder"

# Output:
# → Anchoring 51 files from: /path/to/folder
#   ✓ [1/51] IMG_0002.HEIC → d42175a6-2aae-4318-b7a1-86563f69a3ca
#   ✓ [2/51] IMG_0003.HEIC → 7fb314ee-4fca-4d8d-8e21-0dd871b55e4c
#   ...
#   Done: 51 anchored, 0 errors
#   CSV: /path/to/folder/anchored-results.csv`} />
            </div>
            <div>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">3. Check status (pending → anchored)</p>
              <CodeBlock code={`./check-status.sh "/path/to/anchored-results.csv"

# IMG_0002.HEIC → pending     (within minutes)
# IMG_0002.HEIC → anchored    (within ~24 hours)`} />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
            <p className="text-sm text-[hsl(var(--landing-cream)/0.6)]">
              <strong className="text-[hsl(var(--landing-cream)/0.8)]">Performance:</strong> ~100 files/minute (standard tier). 10,000 files in ~100 minutes. No file size limit.
            </p>
          </div>
        </section>

        {/* Track B Detail */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <TrackBadge track="b" label="Track B — Prospective" />
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-light mb-2 text-[hsl(var(--landing-cream)/0.9)]">
            Anchor every artifact at the moment of creation
          </h3>
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-8">Integrate anchoring into application code. Three lines to production.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Node.js</p>
              <CodeBlock code={`import { anchor } from '@umarise/anchor';

const result = await anchor(fileBuffer, {
  apiKey: 'um_your_key'
});
// result.origin_id
// result.captured_at
// result.proof_status`} />
            </div>
            <div>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Python</p>
              <CodeBlock code={`from umarise import UmariseCore

core = UmariseCore(api_key="um_your_key")
result = core.attest(
  hash="sha256:abc123..."
)
# result.origin_id
# result.captured_at`} />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-2">Direct API (curl)</p>
            <CodeBlock code={`HASH=$(shasum -a 256 document.pdf | cut -d' ' -f1)
curl -X POST https://core.umarise.com/v1-core-origins \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: um_your_key" \\
  -d "{\\"hash\\":\\"sha256:$HASH\\"}"}`} />
          </div>
        </section>

        {/* What you get */}
        <section className="mb-20">
          <h3 className="font-['Playfair_Display'] text-xl font-light mb-6">Per anchored artifact</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'origin_id', desc: 'Unique identifier in the registry' },
              { label: 'short_token', desc: '8-character lookup code' },
              { label: 'captured_at', desc: 'Cryptographically committed timestamp' },
              { label: 'hash', desc: 'SHA-256 fingerprint of the original file' },
              { label: '.ots proof', desc: 'Binary OpenTimestamps proof anchored in Bitcoin' },
              { label: 'proof_url', desc: 'Direct download endpoint for the proof' },
            ].map(({ label, desc }) => (
              <div key={label} className="p-4 rounded-lg border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                <code className="text-[hsl(var(--landing-copper))] text-sm font-mono">{label}</code>
                <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Verification */}
        <section className="mb-20">
          <h3 className="font-['Playfair_Display'] text-xl font-light mb-3">Independent Verification</h3>
          <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">
            Verification requires no Umarise account, API key, or infrastructure. The proof outlives the issuer.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-1">Browser</p>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs mb-3">100% client-side, zero dependencies</p>
              <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[hsl(var(--landing-copper))] text-xs hover:underline">
                verify-anchoring.org <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-1">API</p>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs mb-3">Public, no key required</p>
              <code className="text-[hsl(var(--landing-cream)/0.6)] text-[11px] font-mono">GET /v1-core-resolve?origin_id=...</code>
            </div>
            <div className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-1">CLI (offline)</p>
              <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs mb-3">Zero-dependency shell scripts</p>
              <code className="text-[hsl(var(--landing-cream)/0.6)] text-[11px] font-mono">ots verify + shasum -a 256</code>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-20">
          <h3 className="font-['Playfair_Display'] text-xl font-light mb-6">Applications by sector</h3>
          <div className="border border-[hsl(var(--landing-cream)/0.06)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--landing-cream)/0.06)]">
                  <th className="text-left p-4 text-[hsl(var(--landing-cream)/0.5)] font-mono text-xs uppercase tracking-wider">Sector</th>
                  <th className="text-left p-4 text-[hsl(var(--landing-copper)/0.7)] font-mono text-xs uppercase tracking-wider">Retroactive (Track A)</th>
                  <th className="text-left p-4 text-emerald-400/70 font-mono text-xs uppercase tracking-wider">Prospective (Track B)</th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--landing-cream)/0.7)]">
                {[
                  ['Education', 'Anchor historical diploma archive', 'Anchor each new badge at issuance'],
                  ['Legal', 'Timestamp existing contract archive', 'Anchor every signed document'],
                  ['Creative', 'Prove existing portfolio predates disputes', 'Anchor each new design at creation'],
                  ['Compliance', 'Anchor audit trail retroactively', 'Log every compliance event'],
                  ['Research', 'Timestamp existing datasets', 'Anchor each experiment result'],
                  ['AI/ML', 'Prove training data provenance', 'Anchor every AI-generated output'],
                ].map(([sector, a, b]) => (
                  <tr key={sector} className="border-b border-[hsl(var(--landing-cream)/0.04)] last:border-0">
                    <td className="p-4 font-medium text-[hsl(var(--landing-cream)/0.9)]">{sector}</td>
                    <td className="p-4">{a}</td>
                    <td className="p-4">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Security */}
        <section className="mb-20">
          <h3 className="font-['Playfair_Display'] text-xl font-light mb-6">Security properties</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'Zero storage', desc: 'Only the SHA-256 hash is transmitted and stored. Original bytes never leave the client.' },
              { icon: FileCheck, title: 'Write-once immutability', desc: 'Database triggers block UPDATE and DELETE at the PostgreSQL engine level.' },
              { icon: Shield, title: 'Hashed credentials', desc: 'API keys stored as HMAC-SHA256. IP addresses SHA-256 hashed before logging.' },
              { icon: Clock, title: 'Rate limiting', desc: 'Enforced before business logic via database function. Tiered by access level.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-[hsl(var(--landing-copper)/0.7)]" />
                  <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium">{title}</p>
                </div>
                <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Getting started */}
        <section className="mb-16">
          <div className="border border-[hsl(var(--landing-copper)/0.2)] rounded-xl p-8 bg-[hsl(var(--landing-copper)/0.03)]">
            <h3 className="font-['Playfair_Display'] text-xl font-light mb-4">Getting started</h3>
            <div className="space-y-4 text-sm text-[hsl(var(--landing-cream)/0.7)]">
              <div className="flex items-start gap-3">
                <span className="text-[hsl(var(--landing-copper))] font-mono text-xs mt-0.5">01</span>
                <span>Request an API key at <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:underline">partners@umarise.com</a></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[hsl(var(--landing-copper))] font-mono text-xs mt-0.5">02</span>
                <span>Choose a track: download the CLI scripts (retroactive) or install the SDK (prospective)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[hsl(var(--landing-copper))] font-mono text-xs mt-0.5">03</span>
                <span>Verify the first proof at <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))] hover:underline">verify-anchoring.org</a></span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer links */}
        <footer className="border-t border-[hsl(var(--landing-cream)/0.06)] pt-8 flex flex-wrap gap-6 text-xs text-[hsl(var(--landing-cream)/0.4)]">
          <Link to="/api-reference" className="hover:text-[hsl(var(--landing-cream))] transition-colors">API Reference</Link>
          <Link to="/technical" className="hover:text-[hsl(var(--landing-cream))] transition-colors">Technical Description</Link>
          <Link to="/sdk-spec" className="hover:text-[hsl(var(--landing-cream))] transition-colors">SDK Specification</Link>
          <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--landing-cream))] transition-colors">Anchoring Specification</a>
          <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--landing-cream))] transition-colors">Independent Verifier</a>
        </footer>
      </div>
    </div>
  );
}
