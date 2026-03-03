import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

/**
 * Creation Integrity - Protocol-level property definition.
 * Route: /creation-integrity
 * 
 * This is an infrastructure announcement, not a product page.
 * The specification is normative. This page is not.
 */

const conditions = [
  {
    label: 'Byte-Identity',
    text: 'A cryptographic hash uniquely represents the artifact.',
  },
  {
    label: 'Temporal Anchoring',
    text: 'The hash is committed to an immutable external ledger.',
  },
  {
    label: 'Independent Verifiability',
    text: 'The proof can be validated without reliance on the issuing party.',
  },
];

const nonAssertions = [
  'Authorship',
  'Ownership',
  'Intent',
  'Meaning',
  'Truthfulness',
];

const scopeIncludes = [
  'Research data',
  'Manuscripts',
  'Source code',
  'Notebooks',
  'Design files',
  'Media',
  'Model weights',
];

export default function CreationIntegrity() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-6">
            Creation Integrity
          </h1>
          <p className="text-landing-cream/90 leading-relaxed text-lg">
            Creation Integrity is the verifiable property that a specific digital artifact existed in its exact byte-form at or before a specific moment in time.
          </p>
          <p className="text-landing-muted/40 text-xs mt-4 tracking-wide">
            Published 2 March 2026
          </p>
        </div>

        <div className="space-y-16 text-landing-muted/80 leading-relaxed">

          {/* Conditions */}
          <section>
            <p className="text-landing-cream/80 mb-6">
              It is established if and only if three conditions are met:
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
                  <p className="text-landing-cream/70 mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            <p className="text-landing-muted/60 mt-6 text-sm">
              If any condition is absent, Creation Integrity is not established.
            </p>
          </section>

          {/* What It Is */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              What It Is
            </h2>
            <p className="text-landing-cream/80 mb-4">
              Creation Integrity is a protocol-level property.
            </p>
            <p className="text-landing-muted/70">
              It is not a product.{' '}
              It is not owned by any vendor.{' '}
              It is defined by the{' '}
              <a
                href="https://anchoring-spec.org/v1.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
              >
                Anchoring Specification (IEC)
              </a>.
            </p>
            <p className="text-landing-muted/60 mt-4 text-sm">
              Any system that satisfies the specification can produce Creation Integrity.
            </p>
          </section>

          {/* What It Is Not */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              What It Is Not
            </h2>
            <p className="text-landing-cream/80 mb-4">
              Creation Integrity does not assert:
            </p>
            <ul className="space-y-1 pl-4">
              {nonAssertions.map((item) => (
                <li key={item} className="flex items-start gap-3 text-landing-muted/60">
                  <span className="text-landing-copper mt-0.5">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 bg-landing-muted/5 border border-landing-muted/10 rounded px-5 py-4">
              <p className="text-landing-cream/70 text-sm">
                It establishes only one fact: that specific bytes existed at or before a specific moment in time.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Why It Matters
            </h2>
            <p className="text-landing-cream/80 mb-4">
              In environments where digital artifacts can be retroactively fabricated or modified at scale, reconstructive verification becomes probabilistic.
            </p>
            <p className="text-landing-cream/80">
              Creation Integrity provides deterministic temporal existence.
            </p>
            <p className="text-landing-muted/60 mt-4 text-sm">
              Where evidentiary stability is required, external anchoring is determinative.
            </p>
          </section>

          {/* Governance Principle */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Governance Principle
            </h2>
            <div className="border-l-2 border-landing-copper/30 pl-5 py-2 mb-4">
              <p className="text-landing-cream/80 italic">
                Internal audit trails are supplementary.
              </p>
              <p className="text-landing-cream/80 italic">
                External anchoring is determinative.
              </p>
            </div>
            <p className="text-landing-muted/70">
              Repository timestamps, internal logs, and version histories are institution-controlled. Creation Integrity requires external commitment to a ledger outside institutional control.
            </p>
          </section>

          {/* Scope */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Scope
            </h2>
            <p className="text-landing-cream/80 mb-4">
              Creation Integrity applies to any artifact reducible to deterministic bytes, including:
            </p>
            <ul className="space-y-1 pl-4 mb-4">
              {scopeIncludes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-landing-muted/70">
                  <span className="text-landing-copper mt-0.5">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-landing-muted/50 text-sm">
              It does not apply to physical objects or non-deterministic processes.
            </p>
          </section>

          {/* Verification */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Verification
            </h2>
            <p className="text-landing-cream/80 mb-4">
              Proofs must be publicly verifiable. Verification must not require trust in the issuer or implementation.
            </p>
            <p className="text-landing-muted/70">
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
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Implementation
            </h2>
            <p className="text-landing-cream/80 mb-4">
              Creation Integrity is defined by specification, not by implementation.
            </p>
            <p className="text-landing-muted/70 mb-4">
              <a
                href="/api-reference"
                className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
              >
                Umarise Core
              </a>{' '}
              is one system that produces Creation Integrity in accordance with the Anchoring Specification.
            </p>
            <p className="text-landing-muted/50 text-sm">
              It is not the only possible system.
            </p>
          </section>

          {/* Closing */}
          <section className="border-t border-landing-muted/10 pt-8">
            <p className="text-landing-cream/70 text-sm italic">
              Research integrity without Creation Integrity is architecturally incomplete in generative environments.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-landing-muted/10 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-landing-muted/40 text-xs">
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
