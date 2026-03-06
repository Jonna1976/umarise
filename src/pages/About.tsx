import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * About Umarise
 * Minimal protocol-identity page: jurisdiction, mission, contact.
 */
export default function About() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-landing-deep/95 backdrop-blur-md border-b border-landing-muted/10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-landing-muted/75 hover:text-landing-cream transition-colors text-sm">
            <ArrowUp className="w-4 h-4" />
            Umarise
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-12">
          About
        </h1>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="font-mono text-xs text-landing-muted/50 tracking-[3px] uppercase mb-4">What Umarise is</h2>
          <p className="text-base text-landing-muted/90 leading-relaxed">
            Umarise builds anchoring infrastructure. We provide a single primitive: cryptographic proof that a digital artifact existed at a specific point in time, anchored to the Bitcoin blockchain.
          </p>
          <p className="text-base text-landing-muted/90 leading-relaxed mt-4">
            No accounts. No data storage. No opinions about what you anchor or why. The proof file is the deliverable. It verifies independently of Umarise.
          </p>
        </section>

        {/* Jurisdiction */}
        <section className="mb-12">
          <h2 className="font-mono text-xs text-landing-muted/50 tracking-[3px] uppercase mb-4">Jurisdiction</h2>
          <p className="text-base text-landing-muted/90 leading-relaxed">
            Umarise is based in the Netherlands, operating under Dutch and EU law.
          </p>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="font-mono text-xs text-landing-muted/50 tracking-[3px] uppercase mb-4">Architecture</h2>
          <ul className="space-y-3 text-base text-landing-muted/90 leading-relaxed">
            <li><span className="text-landing-copper font-mono text-sm">core.umarise.com</span> — API layer</li>
            <li><span className="text-landing-copper font-mono text-sm">umarise.com</span> — Documentation</li>
            <li><span className="text-landing-copper font-mono text-sm">verify-anchoring.org</span> — Independent verification</li>
            <li><span className="text-landing-copper font-mono text-sm">anchoring-spec.org</span> — Open specification (IEC)</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="font-mono text-xs text-landing-muted/50 tracking-[3px] uppercase mb-4">Contact</h2>
          <p className="text-base text-landing-muted/90 leading-relaxed">
            For integration and partnership inquiries:{' '}
            <a href="mailto:partners@umarise.com" className="text-landing-copper hover:text-landing-cream transition-colors">
              partners@umarise.com
            </a>
          </p>
        </section>

        {/* Separator + back */}
        <div className="border-t border-landing-muted/10 pt-8">
          <Link to="/" className="font-mono text-[13px] text-landing-copper/90 hover:text-landing-copper transition-colors tracking-[0.5px]">
            ← Back
          </Link>
        </div>
      </main>
    </div>
  );
}
