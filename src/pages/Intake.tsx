import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise — Origin Record Specification
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
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Definition</h2>
            <p className="text-landing-cream/90">
              An Origin Record is a write-once, external reference to the exact bytes of a digital artifact at a specific moment in time.
            </p>
          </section>

          {/* Record Contents */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Record Contents</h2>
            <ul className="space-y-2">
              <li><span className="text-landing-copper">hash</span> — what existed</li>
              <li><span className="text-landing-copper">timestamp</span> — when it existed</li>
              <li><span className="text-landing-copper">origin_id</span> — a stable external reference</li>
            </ul>
            <p className="text-landing-muted/50 mt-4 text-sm">Nothing more.</p>
          </section>

          {/* Invariants */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Invariants</h2>
            <ul className="space-y-2">
              <li>Origin Records are write-once</li>
              <li>Origin Records are externally anchored</li>
              <li>Verification is binary</li>
            </ul>
          </section>

          {/* The Law */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">The Law</h2>
            <p className="text-landing-cream text-lg">
              If the bytes change, the origin no longer matches.
            </p>
            <p className="text-landing-cream/70 mt-2">
              There are no exceptions.
            </p>
          </section>

          {/* Non-Responsibilities */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Non-Responsibilities</h2>
            <p className="mb-4">Umarise does not:</p>
            <ul className="space-y-1 text-landing-muted/60">
              <li>store content</li>
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

          {/* Correct Usage Boundary */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Correct Usage Boundary</h2>
            <p className="mb-4">Umarise is only correct where:</p>
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
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Context</h2>
            <p className="mb-4">Every mature digital system eventually externalizes its fundamentals.</p>
            <ul className="space-y-2 text-landing-muted/60">
              <li><span className="text-landing-copper">DNS</span> externalized naming</li>
              <li><span className="text-landing-copper">Certificate authorities</span> externalized identity</li>
              <li><span className="text-landing-copper">Time services</span> externalized ordering</li>
            </ul>
            <p className="text-landing-cream/70 mt-6">
              Origin follows the same pattern.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Contact</h2>
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
