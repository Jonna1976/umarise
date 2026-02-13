import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


/**
 * Terms of Service for Umarise
 * Aligned with canonical briefing - technical, minimal, infrastructure-grade
 */
export default function Terms() {
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
        <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">Terms of Service</h1>
        <p className="text-landing-muted/50 text-sm mb-16">Last updated: January 2026</p>

        <div className="space-y-12 text-landing-muted/80 leading-relaxed">
          
          {/* Scope */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Scope</h2>
            <p className="mb-4">
              These Terms of Service govern access to and use of the Umarise anchor record service.
            </p>
            <p className="mb-4">
              Umarise provides an external, write-once origin reference for digital artifacts.
              It does not provide interpretation, governance, or outcome enforcement.
            </p>
            <p className="text-landing-cream/70">By using Umarise, you accept these terms.</p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Service Description</h2>
            <p className="mb-4">Umarise establishes and maintains Anchor Records.</p>
            <p className="mb-4">An Anchor Record is a write-once, immutable reference to:</p>
            <ul className="space-y-1 mb-4">
              <li>• the cryptographic hash of digital data</li>
              <li>• a timestamp</li>
              <li>• a stable anchor identifier</li>
            </ul>
            <p className="mb-4">Verification is binary: match or no match.</p>
            <p className="text-landing-muted/50 text-sm">Umarise does not store artifact content.</p>
          </section>

          {/* Invariants */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Invariants</h2>
            <p className="mb-4">The following properties are fixed and non-configurable:</p>
            <ul className="space-y-1 mb-6">
              <li>• Anchor Records are immutable</li>
              <li>• Anchor Records cannot be altered, revoked, or overridden</li>
              <li>• Verification has no degrees or exceptions</li>
            </ul>
            <p className="text-landing-cream text-lg">
              If the bytes change, the anchor no longer matches.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">User Responsibilities</h2>
            <p className="mb-4">You are responsible for:</p>
            <ul className="space-y-1 mb-4">
              <li>• determining whether Umarise is appropriate for your system</li>
              <li>• ensuring that the data underlying any submitted hash is lawful and that you have the right to register its origin</li>
              <li>• maintaining custody of all original content</li>
            </ul>
            <p className="text-landing-muted/50 text-sm">
              Umarise does not validate legality, ownership, or authorization of submitted data.
            </p>
          </section>

          {/* Non-Responsibilities */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Non-Responsibilities</h2>
            <p className="mb-4">Umarise does not:</p>
            <ul className="space-y-1 mb-4">
              <li>• interpret meaning or intent</li>
              <li>• resolve disputes</li>
              <li>• enforce policy or compliance</li>
              <li>• arbitrate outcomes</li>
              <li>• provide governance or exceptions</li>
            </ul>
            <p className="text-landing-muted/50 text-sm">
              All consequences of anchor verification remain external to Umarise.
            </p>
          </section>

          {/* Correct Usage Boundary */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Correct Usage Boundary</h2>
            <p className="mb-4">Umarise is appropriate only where:</p>
            <ul className="space-y-1 mb-6">
              <li>• a moment must not be renegotiated later</li>
              <li>• external verification outweighs flexibility</li>
              <li>• immutable evidence is acceptable even when inconvenient</li>
            </ul>
            <p className="text-landing-muted/50 text-sm italic">
              If revision, erasure, exception handling, or discretionary override is required, Umarise is not appropriate.
            </p>
          </section>

          {/* Availability and Changes */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Availability and Changes</h2>
            <p className="mb-4">Umarise is provided on an as-is and as-available basis.</p>
            <p>
              The core behavior of the anchor record service is invariant.
              Operational aspects may change without notice, provided invariants are preserved.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by law:</p>
            <ul className="space-y-1">
              <li>• Umarise is not liable for decisions, actions, or outcomes based on origin records</li>
              <li>• Umarise is not liable for loss resulting from reliance on immutable records</li>
              <li>• Umarise does not guarantee fitness for a particular purpose</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Termination</h2>
            <p className="mb-4">
              Umarise may restrict or terminate access to the service if these terms are violated or if use would expose Umarise to legal or operational risk.
            </p>
            <p className="text-landing-muted/50 text-sm">
              Termination does not alter existing Anchor Records.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Governing Law</h2>
            <p>
              These terms are governed by the laws of Germany, without regard to conflict-of-law principles.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Contact</h2>
            <p className="mb-2">For matters related to these terms:</p>
            <a
              href="mailto:partners@umarise.com"
              className="text-landing-copper/70 hover:text-landing-copper transition-colors"
            >
              partners@umarise.com
            </a>
          </section>

          {/* Final Statement */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Final Statement</h2>
            <p className="text-landing-cream/90 mb-2">
              Umarise does not optimize systems.
            </p>
            <p className="text-landing-cream/90 mb-4">
              It constrains history.
            </p>
            <p className="text-landing-muted/50 text-sm italic">
              Use of the service implies acceptance of that constraint.
            </p>
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
