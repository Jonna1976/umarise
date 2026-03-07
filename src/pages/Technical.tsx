import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { ChevronDown } from 'lucide-react';

/**
 * /technical — How anchoring works.
 * Stripe 2014 style: narrative, concise, expandable details.
 */

function Expandable({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-landing-muted/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-landing-cream/70 group-hover:text-landing-cream transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-landing-muted/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-6 text-sm text-landing-muted/70 leading-relaxed space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Technical() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl mb-3">
          How anchoring works
        </h1>
        <p className="text-landing-muted/60 text-[15px] leading-relaxed mb-20">
          A file hash is committed to Bitcoin via OpenTimestamps. The result is a cryptographic proof that specific bytes existed at a specific time. No file is stored. No identity is required.
        </p>

        {/* Section 1: The chain */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            From bytes to Bitcoin
          </h2>
          <ol className="space-y-6">
            {[
              ['You compute a SHA-256 hash', 'The hash is computed on your machine. Only the 64-character hex string is transmitted. The file never leaves your device.'],
              ['We record the hash', 'The hash receives a timestamp, an origin_id, and enters the registry. Status: pending.'],
              ['Hashes are batched', 'A background worker aggregates pending hashes into a Merkle tree. The root is submitted to OpenTimestamps calendar servers.'],
              ['Bitcoin confirms', 'The Merkle root is embedded in a Bitcoin transaction. Confirmation takes 1–2 blocks (10–20 minutes).'],
              ['You receive a proof', 'A .ots file is generated containing the complete cryptographic path from your hash to the Bitcoin block. Status: anchored.'],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-sm text-landing-copper/60 mt-0.5 shrink-0 w-5">
                  {i + 1}.
                </span>
                <div>
                  <p className="text-landing-cream/90 text-[15px] font-medium">{title}</p>
                  <p className="text-landing-muted/60 text-sm mt-1">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 2: The proof file */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            The proof file
          </h2>
          <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-4">
            The result is a <code className="font-mono text-sm text-landing-copper">.proof</code> ZIP containing:
          </p>
          <pre className="bg-landing-muted/5 border border-landing-muted/10 rounded p-5 text-[13px] font-mono text-landing-cream/80 leading-relaxed mb-4">{`certificate.json   # hash, origin_id, timestamps
proof.ots          # OpenTimestamps binary proof
VERIFY.txt         # human-readable verification instructions`}</pre>
          <p className="text-sm text-landing-muted/50">
            The proof is independently verifiable. No account, no API, no platform dependency. Drag it onto{' '}
            <a
              href="https://verify-anchoring.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
            >
              verify-anchoring.org
            </a>{' '}
            or run <code className="text-landing-copper">ots verify proof.ots</code>.
          </p>
        </section>

        {/* Section 3: Scope — the critical section */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            What an anchor proves
          </h2>
          <div className="border border-landing-muted/15 rounded-lg p-6 mb-4">
            <p className="text-landing-cream/90 text-[15px] leading-relaxed">
              These specific bytes existed at or before this specific time.
            </p>
          </div>
          <p className="text-sm text-landing-muted/50 leading-relaxed mb-6">
            That's it. An anchor does not prove who created the file, whether it's original, or what it means. It proves existence in time. A court, arbitrator, or evaluating party interprets the evidence.
          </p>

          <Expandable title="What the mechanism does not establish">
            <ul className="space-y-1 pl-4">
              <li>Who created the file</li>
              <li>Whether this is the first attestation of these bytes</li>
              <li>Whether the content is unique or novel</li>
              <li>Authorship, ownership, or legal status</li>
            </ul>
          </Expandable>

          <Expandable title="Comparison with related mechanisms">
            <div className="space-y-2">
              <p><span className="text-landing-copper">Anchor Record</span> — Specific bytes existed at a specific time</p>
              <p><span className="text-landing-copper">RFC 3161</span> — Hash existed at time, certified by a trusted TSA</p>
              <p><span className="text-landing-copper">Notarization</span> — Document existed at time, witnessed by a notary</p>
              <p><span className="text-landing-copper">C2PA</span> — Content lifecycle, device, and identity chain</p>
            </div>
            <p className="mt-3 text-landing-muted/50 text-xs">These mechanisms are complementary. An anchor operates at a different layer.</p>
          </Expandable>
        </section>

        {/* Section 4: Trust & Security */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            Trust model
          </h2>
          <div className="space-y-4 text-[15px] text-landing-muted/70 leading-relaxed">
            <p>
              <span className="text-landing-cream/90">Verifiable without trusting us:</span>{' '}
              the timestamp. The .ots proof contains the full cryptographic path from your hash to a Bitcoin block. Verify it with open-source tools. We are not required.
            </p>
            <p>
              <span className="text-landing-cream/90">Requires trusting us:</span>{' '}
              data intake — that the correct hash was recorded at the correct time. This trust is reduced when you compute the SHA-256 hash on your own device before transmission.
            </p>
          </div>

          <div className="mt-8">
            <Expandable title="Security properties">
              <p>An anchor resists retroactive substitution. An adversary who claims different bytes existed earlier cannot produce a valid proof, because different bytes produce a different SHA-256 hash, and no valid Bitcoin-anchored proof exists for that hash.</p>
              <p className="mt-2">A successful attack would require simultaneously: producing a SHA-256 collision, rewriting Bitcoin's blockchain, and compromising OTS calendar servers retroactively. None of these is computationally feasible.</p>
            </Expandable>
            <Expandable title="Assumptions">
              <ul className="space-y-1 pl-4">
                <li>SHA-256 remaining collision-resistant</li>
                <li>Bitcoin's blockchain remaining infeasible to rewrite</li>
                <li>OpenTimestamps operating correctly at time of anchoring</li>
              </ul>
              <p className="mt-2 text-landing-muted/50 text-xs">These assumptions are well-established and do not depend on Umarise.</p>
            </Expandable>
          </div>
        </section>

        {/* Section 5: Assurance Levels */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            Assurance levels
          </h2>
          <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-6">
            The core anchor (L1) is always free. Additional layers add identity binding.
          </p>
          <div className="space-y-px rounded-lg overflow-hidden border border-landing-muted/10">
            {[
              { level: 'L1', name: 'Anchored Existence', desc: 'Hash + timestamp. No identity.', cost: 'Free' },
              { level: 'L2', name: 'Anchored Signature', desc: 'Hash + timestamp + hardware-bound passkey.', cost: 'Free' },
              { level: 'L3', name: 'Anchored Identity', desc: 'Hash + timestamp + certified third-party attestation.', cost: '€4.95' },
              { level: 'L4', name: 'Anchored QES', desc: 'Hash + timestamp + Qualified Electronic Signature (eIDAS).', cost: 'Future' },
            ].map((l) => (
              <div key={l.level} className="flex items-baseline gap-4 px-5 py-3 bg-landing-muted/[0.03] hover:bg-landing-muted/[0.06] transition-colors">
                <span className="font-mono text-sm text-landing-copper w-6 shrink-0">{l.level}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-landing-cream/80">{l.name}</span>
                  <span className="text-landing-muted/40 mx-2">—</span>
                  <span className="text-sm text-landing-muted/60">{l.desc}</span>
                </div>
                <span className="text-xs text-landing-muted/40 shrink-0">{l.cost}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Verification */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            Verification
          </h2>
          <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-6">
            Any anchor can be verified without authentication. Three public endpoints:
          </p>
          <div className="space-y-2 font-mono text-sm">
            {[
              ['/v1-core-resolve', 'Look up an anchor by origin_id'],
              ['/v1-core-verify', 'Check if a hash exists in the registry'],
              ['/v1-core-proof', 'Retrieve the .ots proof file'],
            ].map(([endpoint, desc]) => (
              <div key={endpoint} className="flex gap-4">
                <span className="text-landing-copper shrink-0">{endpoint}</span>
                <span className="text-landing-muted/50 font-sans text-sm">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-landing-muted/40 mt-4">
            No sign-up. No credentials. No PII.
          </p>
        </section>

        {/* Details */}
        <section className="mb-20">
          <h2 className="font-serif text-xl mb-6 text-landing-cream">
            Reference
          </h2>
          <Expandable title="Data model">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-landing-muted/15">
                    <th className="text-left py-1.5 pr-3 text-landing-muted/50">Field</th>
                    <th className="text-left py-1.5 pr-3 text-landing-muted/50">Type</th>
                    <th className="text-left py-1.5 text-landing-muted/50">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['hash', 'text', 'SHA-256 hash of the submitted bytes'],
                    ['hash_algorithm', 'text', 'Always "sha256"'],
                    ['origin_id', 'text', 'Stable external reference'],
                    ['created_at', 'timestamp', 'Server time when the hash was received'],
                    ['ots_proof', 'text', 'Base64-encoded .ots file (after confirmation)'],
                    ['ots_status', 'text', '"pending" or "anchored"'],
                    ['bitcoin_block', 'integer', 'Block height (after confirmation)'],
                  ].map(([field, type, desc]) => (
                    <tr key={field} className="border-b border-landing-muted/5">
                      <td className="py-1.5 pr-3 text-landing-copper font-mono">{field}</td>
                      <td className="py-1.5 pr-3 text-landing-muted/40">{type}</td>
                      <td className="py-1.5">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-landing-muted/40 text-xs">No column for the file itself, filename, or any content metadata. The system cannot store what it does not receive.</p>
          </Expandable>

          <Expandable title="Certificate format (v1.3)">
            <p>Each proof ZIP contains <code className="text-landing-copper">certificate.json</code>. Required fields: version, hash, hash_algorithm, origin_id, short_token, captured_at, created_at. Optional: sig_algorithm, identity_binding (L2+), revocation.</p>
            <p className="mt-2">Full schema in the{' '}
              <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors">
                Anchoring Specification
              </a>.
            </p>
          </Expandable>

          <Expandable title="Attestation format (v1.0)">
            <p>When L3 attestation is confirmed, the ZIP includes <code className="text-landing-copper">attestation.json</code> with: attestation_id, origin_id, attested_by, attested_at, signature, attestant_public_key, and verify_url.</p>
            <p className="mt-2">Verify independently: extract the public key, verify the signature against attestation_id + origin_id + hash + attested_at.</p>
          </Expandable>

          <Expandable title="Terminology">
            <div className="space-y-2">
              {[
                ['Anchor', 'Cryptographic commitment of a SHA-256 hash to Bitcoin via OpenTimestamps.'],
                ['Artifact', 'The original file. Never stored — only the hash is retained.'],
                ['Evidence Kit', 'Self-contained ZIP: certificate.json + proof.ots + VERIFY.txt.'],
                ['Origin', 'A unique registration event with origin_id (UUID) and short_token (8-char hex).'],
                ['OTS', 'OpenTimestamps — open protocol for Bitcoin-anchored timestamps.'],
              ].map(([term, def]) => (
                <p key={term}>
                  <span className="text-landing-copper">{term}</span>
                  <span className="text-landing-muted/30 mx-1.5">—</span>
                  {def}
                </p>
              ))}
            </div>
          </Expandable>
        </section>

        {/* Links */}
        <section className="border-t border-landing-muted/10 pt-10 mb-10">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper hover:text-landing-cream transition-colors">Specification ↗</a>
            <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper hover:text-landing-cream transition-colors">Verifier ↗</a>
            <Link to="/developers" className="text-landing-copper hover:text-landing-cream transition-colors">Get Started →</Link>
            <Link to="/api-reference" className="text-landing-copper hover:text-landing-cream transition-colors">API Reference →</Link>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-landing-muted/35 text-xs leading-relaxed">
          This page describes the technical properties of the Anchor Record mechanism as implemented by Umarise under the{' '}
          <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-landing-muted/50 transition-colors">
            Anchoring Specification (IEC)
          </a>.
          It does not constitute legal advice. v1.3, March 2026.
        </p>
      </main>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
