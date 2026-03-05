import PageHeader from '@/components/PageHeader';

/**
 * Creation Integrity - Canonical definition page.
 * Route: /creation-integrity
 * 
 * This is an infrastructure announcement, not a product page.
 * The specification is normative. This page is not.
 */

const conditions = [
  {
    label: 'Byte Identity',
    text: 'A cryptographic hash uniquely represents a specific sequence of bytes.',
  },
  {
    label: 'Temporal Anchoring',
    text: 'The hash is committed to an independent timestamping system whose record cannot be retroactively modified without detection.',
  },
  {
    label: 'Independent Verifiability',
    text: 'The resulting proof can be validated without reliance on the issuing party.',
  },
];

const scopeItems = [
  'research data',
  'manuscripts',
  'source code',
  'notebooks',
  'design files',
  'media',
  'model weights',
  'software artifacts',
];

export default function CreationIntegrity() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-3">
            Creation Integrity
          </h1>
          <p className="text-landing-cream/50 text-sm tracking-wide mb-8">
            Canonical definition
          </p>
          <p className="text-landing-cream leading-relaxed text-lg">
            Creation Integrity is the verifiable property that a specific sequence of bytes existed at or before a specific moment in time.
          </p>
          <p className="text-landing-cream/40 text-xs mt-6 tracking-wide">
            Published 2 March 2026
          </p>
        </div>

        <div className="space-y-16 leading-relaxed">

          {/* Definition */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Definition
            </h2>
            <p className="text-landing-cream/90 mb-6">
              Creation Integrity exists when three conditions are simultaneously satisfied.
            </p>
            <div className="space-y-4">
              {conditions.map((c) => (
                <div
                  key={c.label}
                  className="border-l-2 border-landing-copper/40 pl-5 py-1"
                >
                  <span className="text-landing-copper font-medium text-sm tracking-wide uppercase">
                    {c.label}
                  </span>
                  <p className="text-landing-cream/80 mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            <p className="text-landing-cream/50 mt-6 text-sm">
              If any of these conditions are missing, Creation Integrity is not established.
            </p>
          </section>

          {/* Nature of the Property */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Nature of the Property
            </h2>
            <p className="text-landing-cream/90 mb-4">
              Creation Integrity is a protocol-level property.
            </p>
            <p className="text-landing-cream/80 mb-4">
              It arises from cryptographic proof rather than institutional authority.
              It does not belong to any product, organization, or vendor.
            </p>
            <p className="text-landing-cream/80">
              The property is defined by the{' '}
              <a
                href="https://anchoring-spec.org/v1.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
              >
                Anchoring Specification
              </a>, and any system that satisfies the specification can produce Creation Integrity.
            </p>
          </section>

          {/* Limits of the Property */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Limits of the Property
            </h2>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded px-5 py-4 mb-4">
              <p className="text-landing-cream/90 text-sm">
                Creation Integrity establishes only one fact: that specific bytes existed at or before a specific moment in time.
              </p>
            </div>
            <p className="text-landing-cream/70">
              It does not establish authorship, ownership, intent, meaning, or truthfulness.
              Those questions remain outside the scope of the protocol.
            </p>
          </section>

          {/* Why It Matters */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Why It Matters
            </h2>
            <p className="text-landing-cream/90 mb-4">
              In digital environments where artifacts can be fabricated or modified retroactively at scale, verification based on reconstruction becomes probabilistic.
            </p>
            <p className="text-landing-cream/80 mb-4">
              Logs, metadata, and repository histories can indicate when something may have been created, but these systems remain institution-controlled and open to interpretation.
            </p>
            <p className="text-landing-cream/90">
              Creation Integrity introduces deterministic proof of temporal existence by anchoring cryptographic hashes outside the systems that produced them.
            </p>
            <p className="text-landing-cream/60 mt-4 text-sm">
              Where evidentiary stability is required, externally anchored proofs provide a stable point of reference.
            </p>
          </section>

          {/* Governance Principle */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Governance Principle
            </h2>
            <p className="text-landing-cream/80 mb-4">
              Internal audit trails remain useful but are inherently institution-controlled.
            </p>
            <p className="text-landing-cream/90 mb-4">
              Creation Integrity requires the commitment of a cryptographic hash to a timestamping system that exists outside institutional control.
            </p>
            <div className="border-l-2 border-landing-copper/30 pl-5 py-2">
              <p className="text-landing-cream/90 italic">
                External anchoring therefore functions as the determinative layer of temporal proof, while internal records remain supplementary.
              </p>
            </div>
          </section>

          {/* Scope */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Scope
            </h2>
            <p className="text-landing-cream/90 mb-4">
              Creation Integrity applies to any artifact reducible to deterministic bytes, including:
            </p>
            <ul className="space-y-1 pl-4 mb-4">
              {scopeItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-landing-cream/70">
                  <span className="text-landing-copper mt-0.5">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-landing-cream/50 text-sm">
              Physical objects and non-deterministic processes fall outside this scope.
            </p>
          </section>

          {/* Verification */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Verification
            </h2>
            <p className="text-landing-cream/90 mb-4">
              Proofs must be publicly verifiable.
            </p>
            <p className="text-landing-cream/80 mb-4">
              Verification must not depend on trust in the issuing system, the implementation used to create the proof, or the party performing the verification.
            </p>
            <p className="text-landing-cream/80">
              Independent verification is available at{' '}
              <a
                href="https://verify-anchoring.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
              >
                verify-anchoring.org
              </a>
            </p>
          </section>

          {/* Implementation */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Implementation
            </h2>
            <p className="text-landing-cream/90 mb-4">
              Creation Integrity is defined by specification rather than by any single implementation.
            </p>
            <p className="text-landing-cream/80 mb-4">
              Multiple systems can produce Creation Integrity when they conform to the Anchoring Specification.
            </p>
            <p className="text-landing-cream/80">
              <a
                href="/api-reference"
                className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
              >
                Umarise Core
              </a>{' '}
              is one implementation that produces Creation Integrity in accordance with that specification, but it is not the only possible system.
            </p>
          </section>

          {/* Structural Implication */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-cream/60 uppercase mb-6">
              Structural Implication
            </h2>
            <p className="text-landing-cream/90 mb-4">
              Systems that rely exclusively on reconstructive evidence remain probabilistic.
            </p>
            <p className="text-landing-cream/90 mb-4">
              Creation Integrity introduces a deterministic proof that specific bytes existed at a particular moment in time.
            </p>
            <p className="text-landing-cream/80">
              As digital artifacts become easier to fabricate or simulate, systems that require stable evidence increasingly depend on verifiable creation proofs.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-landing-muted/10 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-landing-cream/40 text-xs">
          <span>&copy; 2026 Umarise</span>
          <div className="flex gap-6">
            <a
              href="https://anchoring-spec.org/v1.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-landing-cream transition-colors"
            >
              Anchoring Specification
            </a>
            <a
              href="https://verify-anchoring.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-landing-cream transition-colors"
            >
              Independent Verifier
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
