import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise Core: System Description
 * 
 * Minimal, factual, infrastructure-grade.
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
          <span className="font-serif text-lg text-landing-cream/80">
            Umarise
          </span>
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
            v1. Stable Interface
          </p>
          <p className="text-landing-muted/40 text-xs mt-2 italic">
            The specification is normative. This implementation is not.
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Purpose */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Purpose</h2>
            <p className="text-landing-cream text-lg">
              Umarise Core records that a cryptographic hash existed at a specific moment in time.
            </p>
            <p className="mt-4 text-landing-muted/60">
              Core accepts hashes only.<br />
              No bytes. No labels. No metadata. No artifacts.
            </p>
          </section>

          {/* Data Boundary */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Data Boundary</h2>
            <p className="text-landing-cream/90 mb-4">
              An Anchor Record contains:
            </p>
            <ul className="space-y-1 text-landing-muted/70 mb-6">
              <li><span className="text-landing-copper">hash</span>: what existed</li>
              <li><span className="text-landing-copper">hash_algo</span>: how it was computed</li>
              <li><span className="text-landing-copper">timestamp</span>: when it existed</li>
              <li><span className="text-landing-copper">origin_id</span>: a stable external reference</li>
            </ul>
            <p className="text-landing-muted/60">
              Artifacts, bytes, files, and content remain with the originating party.
            </p>
          </section>

          {/* Invariants */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Invariants</h2>
            <ul className="space-y-2 text-landing-muted/70 mb-6">
              <li>Anchor Records are write-once</li>
              <li>Anchor Records are append-only</li>
              <li>Verification is binary: match or no match</li>
            </ul>
            <div className="bg-landing-muted/5 border border-landing-copper/20 rounded p-4">
              <p className="text-landing-cream/90">
                If the bytes change, the anchor no longer matches. No exceptions.
              </p>
            </div>
          </section>

          {/* Anchoring */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Anchoring</h2>
            <p className="text-landing-muted/60 mb-4">
              Anchor Records are externally anchored via OpenTimestamps, an open-source protocol that binds proofs to the Bitcoin blockchain.
            </p>
            <p className="text-landing-muted/60 mb-4">
              Bitcoin is used as a public, append-only timestamp ledger - not as a currency. No wallets, no coins, no financial transactions.
            </p>
            <p className="text-landing-muted/60">
              The resulting .ots proof file is independently verifiable without Umarise infrastructure. Verification depends on cryptography and a public ledger.
            </p>
          </section>

          {/* Resolution Semantics */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Resolution</h2>
            <ul className="space-y-2 text-landing-muted/70">
              <li>Multiple attestations of the same hash are permitted</li>
              <li>Resolution returns the earliest attestation by <span className="text-landing-copper">captured_at</span></li>
            </ul>
          </section>

          {/* Access Model */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Access Model</h2>
            <p className="text-landing-cream text-lg mb-4">
              Verification is public. Attestation is permissioned.
            </p>
            <p className="text-landing-muted/50 text-sm">
              Write access requires an API key. Read access is open.
            </p>
          </section>

          {/* Non-Responsibilities */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Non-Responsibilities</h2>
            <p className="text-landing-muted/60 mb-4">Umarise Core does not:</p>
            <ul className="space-y-1 text-landing-muted/60 text-sm">
              <li className="flex items-baseline gap-2"><span className="text-landing-muted/30">·</span>store content</li>
              <li className="flex items-baseline gap-2"><span className="text-landing-muted/30">·</span>interpret meaning</li>
              <li className="flex items-baseline gap-2"><span className="text-landing-muted/30">·</span>apply policy</li>
              <li className="flex items-baseline gap-2"><span className="text-landing-muted/30">·</span>enforce governance</li>
              <li className="flex items-baseline gap-2"><span className="text-landing-muted/30">·</span>resolve disputes</li>
              <li className="flex items-baseline gap-2"><span className="text-landing-muted/30">·</span>determine outcomes</li>
            </ul>
          </section>

          {/* Stability */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Stability</h2>
            <p className="text-landing-cream text-lg mb-4">
              Core v1 is a stable, frozen interface.
            </p>
            <ul className="space-y-1 text-landing-muted/60 text-sm mb-4">
              <li>No new fields</li>
              <li>No semantic drift</li>
              <li>No convenience additions</li>
              <li>No breaking changes</li>
            </ul>
            <p className="text-landing-muted/50 text-sm">
              Additions require a new version (/core/v2/*).
            </p>
          </section>

          {/* Related Documentation */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Documentation</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/api-reference" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  API Reference
                </Link>
                <span className="text-landing-muted/50 ml-2">- endpoints, fields, error codes</span>
              </li>
              <li>
                <Link to="/anchor" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Anchor
                </Link>
                <span className="text-landing-muted/50 ml-2">- when and why anchor attestation applies</span>
              </li>
              <li>
                <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Anchoring Specification (IEC v1.0)
                </a>
                <span className="text-landing-muted/50 ml-2">- independent specification</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="border-t border-landing-muted/10 pt-12">
            <p>
              <a
                href="mailto:partners@umarise.com"
                className="text-landing-copper/70 hover:text-landing-copper transition-colors"
              >
                partners@umarise.com
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>&copy; {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
