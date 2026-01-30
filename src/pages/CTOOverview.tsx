import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * CTO Overview — Technical reference document
 * Not marketing. Not sales. Pure architecture for senior engineers.
 * Designed for self-evaluation at their own pace.
 */
export default function CTOOverview() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      {/* Header */}
      <header className="border-b border-landing-muted/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Title block */}
        <div className="mb-12 md:mb-16">
          <p className="text-landing-copper/70 text-sm tracking-wide mb-2">Umarise Origin Record Layer</p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-landing-cream mb-6">
            CTO Overview
          </h1>
          <p className="text-landing-muted/70 text-lg max-w-2xl">
            A system-of-record that captures and preserves a verifiable beginning (hash + timestamp + origin ID) before any transformation occurs.
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">
          
          {/* What Umarise Is */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">What Umarise Is</h2>
            <p className="mb-4">
              Umarise records a deterministic fingerprint of any artifact—document, image, message, dataset—prior to processing, editing, or AI transformation.
            </p>
            <p className="mb-4">Each origin record consists of exactly three elements:</p>
            <ul className="space-y-2 ml-4">
              <li><span className="text-landing-copper">SHA-256 hash</span> — a cryptographic fingerprint of the original bytes</li>
              <li><span className="text-landing-copper">captured_at</span> — the timestamp of when the origin was recorded</li>
              <li><span className="text-landing-copper">origin_id</span> — a stable reference for later resolution and verification</li>
            </ul>
            <p className="mt-4">
              This creates an immutable anchor point. Any change to the bytes produces a different hash. Verification is binary: match or no match.
            </p>
            <p className="mt-4 text-landing-cream/90 italic">
              Umarise does not interpret content. It preserves identity.
            </p>
          </section>

          {/* What Umarise Does */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">What Umarise Does</h2>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/10">
                    <th className="text-left py-3 px-4 text-landing-copper font-medium">Function</th>
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Record</td>
                    <td className="py-3 px-4">Capture what existed at a specific moment</td>
                  </tr>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Resolve</td>
                    <td className="py-3 px-4">Return origin metadata by origin_id, hash, or CID</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-landing-cream">Verify</td>
                    <td className="py-3 px-4">Confirm bit-identity between origin and provided content</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-landing-muted/60">
              <span className="text-landing-copper">Important:</span> Umarise is resolved and verified — never searched. 
              Search, discovery, and semantics belong to partner systems. Umarise provides identity and proof.
            </p>
          </section>

          {/* What Umarise Does Not Do */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">What Umarise Does Not Do</h2>
            <p className="mb-4">These are explicit architectural boundaries:</p>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/10">
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Excluded</th>
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Search / semantics</td>
                    <td className="py-3 px-4">Interpretation introduces bias; Umarise remains neutral</td>
                  </tr>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Governance / policy</td>
                    <td className="py-3 px-4">Enforcement lives above the origin layer</td>
                  </tr>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Data enrichment</td>
                    <td className="py-3 px-4">Processing transforms; Umarise preserves</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-landing-cream">User authentication</td>
                    <td className="py-3 px-4">Identity is separate infrastructure</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-landing-muted/60 italic">
              These are not missing features. They are deliberate constraints that preserve trust.
            </p>
          </section>

          {/* Why This Matters */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Why This Matters</h2>
            <p className="text-lg mb-6">
              <span className="text-landing-muted/60">Without origin, systems can operate.</span><br />
              <span className="text-landing-cream">With origin, systems can withstand scrutiny.</span>
            </p>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/10">
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Scenario</th>
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Without Origin</th>
                    <th className="text-left py-3 px-4 text-landing-copper font-medium">With Origin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">AI output disputed</td>
                    <td className="py-3 px-4">Assertions and logs</td>
                    <td className="py-3 px-4 text-landing-copper/80">Input hash + timestamp</td>
                  </tr>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Contract version contested</td>
                    <td className="py-3 px-4">Legal discovery</td>
                    <td className="py-3 px-4 text-landing-copper/80">Bit-identity proof</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-landing-cream">Authorship claimed</td>
                    <td className="py-3 px-4">Competing narratives</td>
                    <td className="py-3 px-4 text-landing-copper/80">First-recorded hash</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-landing-muted/60">
              Origin shifts disputes from interpretive (legal) to deterministic (technical).
            </p>
          </section>

          {/* Partner Vault Mode */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Partner Vault Mode</h2>
            <p className="mb-4">Umarise does not require custody of sensitive data.</p>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/10">
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Component</th>
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-landing-muted/60 font-medium">Reconstructable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">SHA-256 hash</td>
                    <td className="py-3 px-4">Umarise</td>
                    <td className="py-3 px-4 text-landing-copper/80">No (one-way)</td>
                  </tr>
                  <tr className="border-b border-landing-muted/5">
                    <td className="py-3 px-4 text-landing-cream">Timestamp + origin_id</td>
                    <td className="py-3 px-4">Umarise</td>
                    <td className="py-3 px-4">N/A</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-landing-cream">Original bytes</td>
                    <td className="py-3 px-4">Partner vault</td>
                    <td className="py-3 px-4 text-landing-copper/80">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Partners retain full custody. Umarise stores only the fingerprint and time anchor. 
              Verification works without Umarise ever accessing the original content.
            </p>
            <p className="mt-2 text-landing-cream/90 italic">
              Umarise is the stamp, not the vault.
            </p>
          </section>

          {/* Integration Model */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Integration Model</h2>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg p-4 font-mono text-sm">
              <pre className="text-landing-muted/70 whitespace-pre-wrap">{`Partner System (Search / AI / Workflow)
            │
            │ resolve by origin_id or hash
            ▼
┌─────────────────────────┐
│   Umarise Origin Layer  │
│   GET /resolve          │
│   POST /verify          │
└─────────────────────────┘`}</pre>
            </div>
            <p className="mt-4 text-landing-cream/90">
              You search in your systems. You verify at Umarise.
            </p>
          </section>

          {/* The Discipline */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">The Discipline (The Real Moat)</h2>
            <p className="mb-4">The value of origin proof depends on what Umarise refuses to do:</p>
            <ul className="space-y-2 ml-4">
              <li><span className="text-landing-copper">No updates</span> — origin records are write-once; errors remain visible</li>
              <li><span className="text-landing-copper">No interpretation</span> — Umarise records; it does not judge</li>
              <li><span className="text-landing-copper">No lock-in</span> — SHA-256 is a standard; verification works independently</li>
            </ul>
            <p className="mt-4 text-landing-cream/90 italic">
              This self-restraint is the product. Convenience features would undermine the invariant.
            </p>
          </section>

          {/* Negative Dependency Test */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Negative Dependency Test</h2>
            <p className="mb-4">If your system:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li><span className="text-landing-muted/60">Needs to edit its past</span> → Umarise is not for you</li>
              <li><span className="text-landing-cream">Needs to stand by its past</span> → Umarise provides the proof</li>
            </ul>
            <p className="text-sm text-landing-muted/60">
              Recording origin is a transparency signal. Refusing to record is also a signal.
            </p>
          </section>

          {/* Core Statement */}
          <section className="border-t border-landing-muted/10 pt-8">
            <p className="text-lg text-landing-cream mb-2">
              Umarise makes systems defensible by making origin verifiable — before transformation occurs.
            </p>
            <p className="text-landing-copper/80 italic">
              Infrastructure, not product.
            </p>
          </section>

          {/* Footer */}
          <section className="border-t border-landing-muted/10 pt-8 text-sm text-landing-muted/50">
            <p className="mb-2">Document version: 1.0</p>
            <p>
              Questions or suggestions:{' '}
              <a 
                href="mailto:partners@umarise.com?subject=CTO%20Overview%20Inquiry" 
                className="text-landing-copper/70 hover:text-landing-copper transition-colors"
              >
                partners@umarise.com
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Page footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
