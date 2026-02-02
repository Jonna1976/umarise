import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise Core — Public Specification
 * 
 * Minimal, normative, infrastructure-grade.
 * No SDK, no onboarding, no marketing.
 */
export default function CoreSpec() {
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
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">
            Umarise Core
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            v1 — Stable Interface
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Purpose */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Purpose</h2>
            <p className="text-landing-cream/90">
              Umarise Core provides external attestation that a cryptographic hash existed at a specific moment in time.
            </p>
            <p className="mt-4 text-landing-muted/60">
              Core accepts only hashes. No bytes, no labels, no metadata, no artifacts.
            </p>
          </section>

          {/* Normative Documents */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Normative Documents</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/origin" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Origin One-Pager
                </Link>
                <span className="text-landing-muted/50 ml-2">— why and when origin attestation is correct</span>
              </li>
              <li>
                <Link to="/spec" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Origin Record Specification
                </Link>
                <span className="text-landing-muted/50 ml-2">— normative definition of an Origin Record</span>
              </li>
            </ul>
          </section>

          {/* API Contract */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">API Contract</h2>
            
            <div className="space-y-8 font-mono text-sm">
              {/* POST /core/origins */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3">POST /core/origins</div>
                <div className="text-landing-muted/60 mb-2">Input:</div>
                <pre className="text-landing-cream/80 mb-3">{"{ hash }"}</pre>
                <div className="text-landing-muted/60 mb-2">Output:</div>
                <pre className="text-landing-cream/80">{"{ origin_id, hash, hash_algo, captured_at }"}</pre>
              </div>

              {/* GET /core/resolve */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3">GET /core/resolve</div>
                <div className="text-landing-muted/60 mb-2">Input:</div>
                <pre className="text-landing-cream/80 mb-3">origin_id OR hash</pre>
                <div className="text-landing-muted/60 mb-2">Output:</div>
                <pre className="text-landing-cream/80">{"{ origin_id, hash, hash_algo, captured_at }"}</pre>
                <pre className="text-landing-muted/50 mt-1">OR not found</pre>
              </div>

              {/* POST /core/verify */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3">POST /core/verify</div>
                <div className="text-landing-muted/60 mb-2">Input:</div>
                <pre className="text-landing-cream/80 mb-3">{"{ hash }"}</pre>
                <div className="text-landing-muted/60 mb-2">Output:</div>
                <pre className="text-landing-cream/80">{"{ match: true | false, origin_id?, captured_at? }"}</pre>
              </div>
            </div>
          </section>

          {/* Access Model */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Access Model</h2>
            <p className="text-landing-cream text-lg mb-4">
              Verification is public. Attestation is permissioned.
            </p>
            <ul className="space-y-2 text-landing-muted/70">
              <li><span className="text-landing-cream/80">GET /core/resolve</span> — public</li>
              <li><span className="text-landing-cream/80">POST /core/verify</span> — public</li>
              <li><span className="text-landing-cream/80">POST /core/origins</span> — requires API key</li>
            </ul>
          </section>

          {/* Notes */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Notes</h2>
            <ul className="space-y-2 text-landing-muted/70">
              <li>Core accepts no bytes, labels, metadata, or artifacts</li>
              <li>Verification is binary (match / no-match)</li>
              <li>Multiple attestations of the same hash are permitted</li>
              <li>Resolution returns the earliest attestation by <span className="text-landing-copper">captured_at</span></li>
            </ul>
          </section>

          {/* Stability */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Stability</h2>
            <p className="text-landing-cream/90 mb-4">
              Core v1 is <span className="text-landing-copper">STABLE — IMMUTABLE INTERFACE</span>.
            </p>
            <ul className="space-y-1 text-landing-muted/60 text-sm">
              <li>No new fields</li>
              <li>No semantic drift</li>
              <li>No convenience additions</li>
              <li>No breaking changes</li>
            </ul>
            <p className="text-landing-muted/50 mt-4 text-sm">
              Additions require a new version (/core/v2/*), not modifications to v1.
            </p>
          </section>

          {/* Key Access */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Attestation Access</h2>
            <p className="mb-4">
              API key issuance is an infrastructural action, not a product action.
            </p>
            <p className="text-landing-muted/60 mb-4 text-sm">
              Comparable to: TSA key issuance, DNS update rights, Certificate Transparency log writers.
            </p>
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
