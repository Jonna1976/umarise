import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise: Origin One-Pager
 * Normative Overview
 * 
 * A formal description of the origin attestation mechanism.
 * Not marketing, not onboarding. A reference document.
 */
export default function Origin() {
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
            Origin One-Pager
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            Normative Overview
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Scope */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Scope</h2>
            <p className="text-landing-cream/90">
              This document describes a mechanism for immutable attestation of the existence of digital bytes at a specific moment in time, without storing, interpreting, or governing those bytes.
            </p>
            <p className="mt-4">
              The mechanism applies where internal records, timestamps, or signatures are insufficient as proof, and where a write-once record with public verification is required.
            </p>
            <p className="mt-4 text-landing-cream/70">
              Attestations are enforced as immutable through database-level constraints. Content is never stored. Only cryptographic hashes.
            </p>
          </section>

          {/* Problem Statement */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Problem Statement</h2>
            <p className="mb-4">
              Digital systems routinely compute cryptographic hashes to ensure internal integrity, consistency, and traceability.
            </p>
            <p className="mb-4">However:</p>
            <ul className="space-y-2 pl-4">
              <li>Internally generated evidence constitutes self-attestation</li>
              <li>Self-attestation is insufficient under external scrutiny</li>
              <li>In audits, disputes, or provenance challenges, the question is not whether a system recorded something, but whether that record can be independently verified without relying on the system's explanations</li>
            </ul>
            <p className="mt-4 text-landing-cream/70">
              This creates a structural gap between operational correctness and verifiable validity.
            </p>
          </section>

          {/* Existing Practice */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Existing Practice</h2>
            <p className="mb-4">
              Modern systems already compute cryptographic hashes (e.g. SHA-256) for purposes including:
            </p>
            <ul className="space-y-1 pl-4 text-landing-muted/60">
              <li>Integrity verification</li>
              <li>Deduplication</li>
              <li>Content addressing</li>
              <li>Authentication</li>
              <li>Version control</li>
              <li>Internal auditability</li>
            </ul>
            <p className="mt-4">
              These practices are correct and sufficient within the originating system.
            </p>
            <p className="mt-2 text-landing-cream/70">
            They do not, by themselves, establish independently verifiable existence at a point in time.
            </p>
          </section>

          {/* Origin Attestation */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Origin Attestation</h2>
            <p className="text-landing-cream/90 mb-4">
              An Origin Record provides a minimal, immutable attestation that:
            </p>
            <p className="text-landing-cream mb-4 pl-4">
              Specific bytes existed at a specific moment.
            </p>
            <p className="mb-4">
              The attestation is derived from a cryptographic hash computed at the moment of origin and recorded immutably so that the record cannot be altered after creation.
            </p>
            <p className="text-landing-copper mb-4">
              Origin attestation asserts existence, not correctness.
            </p>
            <p className="mb-2">No assumptions are made about:</p>
            <ul className="space-y-1 pl-4 text-landing-muted/60">
              <li>the nature of the bytes</li>
              <li>their meaning</li>
              <li>their lifecycle</li>
              <li>their use</li>
            </ul>
          </section>

          {/* Record Structure */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Record Structure (Normative)</h2>
            <p className="mb-4">An Origin Record consists of:</p>
            <ul className="space-y-2 pl-4">
              <li><span className="text-landing-copper">hash</span>: identifying what existed</li>
              <li><span className="text-landing-copper">timestamp</span>: identifying when it existed</li>
              <li><span className="text-landing-copper">origin_id</span>: a stable external reference</li>
            </ul>
            <p className="mt-4 text-landing-muted/50 text-sm">No additional fields are defined.</p>
          </section>

          {/* Invariants */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Invariants</h2>
            <p className="mb-4">The following properties MUST hold:</p>
            <ul className="space-y-2 pl-4">
              <li>Origin Records are write-once</li>
              <li>Origin Records are immutably recorded</li>
              <li>Verification is binary (match / no match)</li>
            </ul>
          </section>

          {/* Law of Origin */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Law of Origin</h2>
            <p className="text-landing-cream text-lg">
              If the bytes change, the origin no longer matches.
            </p>
            <p className="text-landing-cream/70 mt-2">
              There are no exceptions.
            </p>
          </section>

          {/* Internal vs External Evidence */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Internal vs External Evidence</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Internal Records</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Origin Records</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Self-attested</td>
                    <td className="py-2">Independently recorded</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Context-bound</td>
                    <td className="py-2">Context-independent</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Operational</td>
                    <td className="py-2">Verifiable</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Trust-based</td>
                    <td className="py-2">Verifiable</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-landing-muted/50">
              Origin attestation does not replace internal mechanisms; it operates orthogonally to them.
            </p>
          </section>

          {/* Non-Responsibilities */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Non-Responsibilities (Normative)</h2>
            <p className="mb-4">The origin mechanism does not:</p>
            <ul className="space-y-1 pl-4 text-landing-muted/60">
              <li>store content</li>
              <li>interpret meaning</li>
              <li>apply policy</li>
              <li>enforce governance</li>
              <li>resolve disputes</li>
              <li>determine outcomes</li>
            </ul>
            <p className="mt-4 text-landing-muted/50 text-sm">
              All interpretation, decision-making, and enforcement remain external to the origin layer.
            </p>
          </section>

          {/* Correct Usage Boundary */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Correct Usage Boundary</h2>
            <p className="mb-4">Use of origin attestation is appropriate only where:</p>
            <ul className="space-y-2 pl-4">
              <li>a moment must not be renegotiated later</li>
              <li>internal logs, timestamps, or signatures are insufficient as proof</li>
              <li>external, independent verification outweighs flexibility</li>
            </ul>
            <p className="mt-6 text-landing-muted/50 text-sm italic">
              Where revision, exception handling, discretionary override, or semantic interpretation is required, this mechanism is not appropriate.
            </p>
          </section>

          {/* Failure and Persistence Properties */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Failure and Persistence Properties</h2>
            <p className="mb-4">Verification of an Origin Record depends solely on:</p>
            <ul className="space-y-1 pl-4 text-landing-muted/70">
              <li>the hash</li>
              <li>the timestamp</li>
              <li>the immutable record</li>
            </ul>
            <p className="mt-4 text-landing-cream/70">
              Origin Records are enforced as immutable by database-level constraints and externally anchored via OpenTimestamps to Bitcoin.
            </p>
          </section>

          {/* Context */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Context</h2>
            <p className="mb-4">As systems grow, the ability to prove what existed when becomes a constraint:</p>
            <ul className="space-y-2 text-landing-muted/60">
              <li>Internal timestamps are self-attested</li>
              <li>File metadata can be modified</li>
              <li>Version control requires trust in the repository</li>
            </ul>
            <p className="text-landing-cream/90 mt-6">
              Origin attestation provides a write-once record with public verification.
            </p>
          </section>

          {/* Reference */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Reference</h2>
            <p className="mb-6">
              Umarise Core is an origin registry implementing the properties described in this document.
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
