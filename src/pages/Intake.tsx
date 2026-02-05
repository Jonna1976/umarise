import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise: Origin Record Specification
 * A reference document, not onboarding.
 */
export default function Intake() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      {/* Header */}
      <header className="border-b border-landing-muted/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-landing-muted/50 hover:text-landing-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg text-landing-cream/80">Umarise</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-16">
          Origin Record Specification
        </h1>

        {/* Specification content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">
          
          {/* Definition */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Definition</h2>
            <p className="text-landing-cream/90">
              An Origin Record is a write-once, externally anchored attestation that specific bytes existed at a specific moment in time. The record contains a cryptographic hash of those bytes, not the bytes themselves.
            </p>
          </section>

          {/* Record Contents */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Record Contents</h2>
            <ul className="space-y-2">
              <li><span className="text-landing-copper">hash</span>: what existed</li>
              <li><span className="text-landing-copper">timestamp</span>: when it existed</li>
              <li><span className="text-landing-copper">origin_id</span>: a stable external reference</li>
              <li><span className="text-landing-copper">proof_status</span>: <code className="text-landing-muted/60">pending</code> or <code className="text-landing-muted/60">anchored</code></li>
            </ul>
            <p className="text-landing-muted/50 mt-4 text-sm">Nothing more.</p>
          </section>

          {/* Invariants */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Invariants</h2>
            <ul className="space-y-2">
              <li>Origin Records are write-once</li>
              <li>Origin Records are immutably recorded</li>
              <li>Verification is binary</li>
            </ul>
          </section>

          {/* Hashing */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Hashing</h2>
            <p className="mb-4 text-landing-cream/90">
              Umarise does not accept files. The API accepts only SHA-256 hashes — 64 hexadecimal characters. File uploads are rejected.
            </p>
            <p className="mb-4">
              Hashing always happens client-side, in the partner's own system. This is not a limitation — it is the architecture. If Umarise were to hash files on behalf of partners, partners would need to trust that Umarise hashed the correct bytes. That reintroduces the trust dependency that the system is designed to eliminate.
            </p>
            <p className="text-landing-muted/50 text-sm">
              The consequence: Umarise never sees, stores, or transports content. There is no data liability, no file-transport risk, and the entire chain from hash to Bitcoin transaction is independently verifiable.
            </p>
          </section>

          {/* Anchoring */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Anchoring</h2>
            <p className="mb-4 text-landing-cream/90">
              Origin Records are anchored externally via OpenTimestamps (OTS), an open-source protocol that creates a cryptographic path from the attestation hash to a Bitcoin transaction.
            </p>
            <p className="mb-4">The anchoring process:</p>
            <ol className="space-y-2 pl-4 list-decimal text-landing-muted/70 mb-4">
              <li>The SHA-256 hash is submitted to independent OTS calendar servers</li>
              <li>Calendar servers combine thousands of hashes into a Merkle tree</li>
              <li>The Merkle root is written to a Bitcoin transaction</li>
              <li>The resulting .ots proof file contains the complete cryptographic path from the original hash to the Bitcoin block</li>
            </ol>
            <p className="mb-4">
              Bitcoin anchoring takes approximately 1–6 hours. During this period, the Origin Record exists with <code className="text-landing-copper/70">proof_status: pending</code>. Once the Bitcoin block is confirmed, the status changes to <code className="text-landing-copper/70">anchored</code> and the .ots proof becomes available. This transition is irreversible.
            </p>
            <p className="text-landing-muted/50 text-sm">
              The proof is a standard .ots file, an open format, verifiable with open-source tooling, without Umarise involvement.
            </p>
          </section>

          {/* The Law */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">The Law</h2>
            <p className="text-landing-cream text-lg">
              If the bytes change, the origin no longer matches.
            </p>
            <p className="text-landing-cream/70 mt-2">
              There are no exceptions.
            </p>
          </section>

          {/* Non-Responsibilities */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Non-Responsibilities</h2>
            <p className="mb-4">Umarise does not:</p>
            <ul className="space-y-1 text-landing-muted/60">
              <li>store content</li>
              <li>accept files</li>
              <li>interpret meaning</li>
              <li>apply policy</li>
              <li>enforce governance</li>
              <li>resolve disputes</li>
              <li>decide outcomes</li>
            </ul>
            <p className="text-landing-muted/50 mt-4 text-sm">
              All interpretation and decision-making remain external to the origin layer.
            </p>
          </section>

          {/* Verification */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Verification</h2>
            <p className="mb-6 text-landing-cream/90">
              Verification of existence is public. No authentication, no account, and no relationship with Umarise is required.
            </p>
            
            {/* Endpoint table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Endpoint</th>
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Method</th>
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Authentication</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-verify</code></td>
                    <td className="py-2 pr-4">POST</td>
                    <td className="py-2 pr-4">Public</td>
                    <td className="py-2">Verify whether a hash has been attested</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-resolve</code></td>
                    <td className="py-2 pr-4">GET</td>
                    <td className="py-2 pr-4">Public</td>
                    <td className="py-2">Look up an Origin Record by ID or hash</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-origins-proof</code></td>
                    <td className="py-2 pr-4">GET</td>
                    <td className="py-2 pr-4">API key required</td>
                    <td className="py-2">Download the .ots proof file</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-origins</code></td>
                    <td className="py-2 pr-4">POST</td>
                    <td className="py-2 pr-4">API key required</td>
                    <td className="py-2">Create a new Origin Record</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Parameters table */}
            <p className="mb-3 text-landing-cream/90">Parameters:</p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Endpoint</th>
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Parameter</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-verify</code></td>
                    <td className="py-2 pr-4"><code>hash</code> in request body</td>
                    <td className="py-2">POST JSON</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-resolve</code></td>
                    <td className="py-2 pr-4"><code>origin_id</code> or <code>hash</code> as query param</td>
                    <td className="py-2">GET</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-origins-proof</code></td>
                    <td className="py-2 pr-4"><code>origin_id</code> as query param</td>
                    <td className="py-2">GET</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code className="text-landing-copper/80">/v1-core-origins</code></td>
                    <td className="py-2 pr-4"><code>hash</code> in request body</td>
                    <td className="py-2">POST JSON</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mb-4">The distinction is deliberate:</p>
            <p className="mb-4">
              <span className="text-landing-cream/90">Public (verify, resolve):</span> Anyone can check whether a hash was attested and when. This is the core promise — independent verifiability without trusting Umarise.
            </p>
            <p className="mb-6">
              <span className="text-landing-cream/90">Authenticated (proof, origins):</span> Creating records and downloading the full cryptographic proof require an API key. Writing is always authenticated. The .ots proof is the complete evidence chain and is provided to partners, not to anonymous requesters.
            </p>

            <p className="mb-3 text-landing-cream/90">Independent verification:</p>
            <p className="mb-4 text-landing-muted/70">
              Partners can download the .ots proof and verify it without Umarise software, servers, or involvement:
            </p>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4 font-mono text-sm text-landing-muted/70 mb-4">
              <div>ots verify proof.ots</div>
            </div>
            <p className="text-landing-muted/50 text-sm">
              The <code className="text-landing-copper/70">ots verify</code> command checks the cryptographic path from the hash to the Bitcoin blockchain. It is open-source software maintained independently of Umarise.
            </p>
          </section>

          {/* Trust Model */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Trust Model</h2>
            <div className="mb-6">
              <p className="text-landing-cream/90 mb-2">What is verifiable without trusting Umarise:</p>
              <p className="pl-4 text-landing-muted/70 mb-2">
                <span className="text-landing-cream/80">The timestamp.</span> The .ots proof provides a cryptographic path to a Bitcoin transaction. Anyone can verify this independently using open-source tooling.
              </p>
              <p className="pl-4 text-landing-muted/70">
                <span className="text-landing-cream/80">The hash.</span> Partners compute the SHA-256 hash client-side, in their own environment. Umarise receives only the resulting hash. The partner can always recompute and compare.
              </p>
            </div>
            <div className="mb-6">
              <p className="text-landing-cream/90 mb-2">What requires trusting Umarise:</p>
              <p className="pl-4 text-landing-muted/70 mb-4">
                The integrity of the register between hash submission and Bitcoin anchoring. During the <code className="text-landing-copper/70">pending</code> period, the record exists in Umarise's append-only database. Once anchored, the proof is independently verifiable and no longer depends on Umarise.
              </p>
              <p className="pl-4 text-landing-muted/50 text-sm">
                Mitigation: the bulk export endpoint allows partners to periodically download all .ots proofs as an archive. If Umarise ceases to exist, partners can verify independently using only the original file, the .ots proof, and the Bitcoin blockchain.
              </p>
            </div>
          </section>

          {/* Correct Usage Boundary */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Correct Usage Boundary</h2>
            <p className="mb-4">Umarise is appropriate only where:</p>
            <ul className="space-y-2">
              <li>a moment must not be renegotiated later</li>
              <li>internal logs or signatures are insufficient as proof</li>
              <li>external verification outweighs flexibility</li>
            </ul>
            <p className="text-landing-muted/50 mt-6 text-sm italic">
              If revision, exception handling, or discretionary override is required, Umarise is not appropriate.
            </p>
          </section>

          {/* Context */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Context</h2>
            <p className="mb-4">Every mature digital system eventually externalizes its fundamentals.</p>
            <ul className="space-y-2 text-landing-muted/60">
              <li><span className="text-landing-copper">DNS</span> externalized naming</li>
              <li><span className="text-landing-copper">Certificate authorities</span> externalized identity</li>
              <li><span className="text-landing-copper">Time-Stamping Authorities</span> externalized time ordering</li>
            </ul>
            <p className="text-landing-cream/70 mt-6">
              Origin attestation externalizes existence at the beginning.
            </p>
          </section>

          {/* Reference */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Reference</h2>
            <p className="mb-6 text-landing-cream/70">
              Umarise Core is an origin registry implementing the properties described in this document.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Contact</h2>
            <a
              href="mailto:partners@umarise.com"
              className="text-landing-copper/70 hover:text-landing-copper transition-colors"
            >
              partners@umarise.com
            </a>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
