import { Link } from 'react-router-dom';

/**
 * Umarise Core Homepage
 * Protocol root. Not a product page, not marketing.
 * Status: Core v1 STABLE. This screen is an inscription, not a funnel.
 */
export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream flex flex-col items-center px-6 md:px-8">
      {/* Centered canvas with left-aligned content */}
      <div className="w-full max-w-2xl flex flex-col min-h-[100dvh]">
        
        {/* Inscription area - positioned at ~30-35% from top */}
        <main className="flex-1 flex flex-col justify-center" style={{ paddingBottom: '20vh' }}>
          {/* Title block */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.15] mb-10">
            <span className="text-landing-cream/90">Umarise.</span>
            <br />
            <span className="text-landing-copper">Anchors.</span>
          </h1>

          {/* Core axiom */}
          <p className="text-base text-landing-muted/90 leading-relaxed tracking-wide mb-8">
            When digital information matters,
            <br />
            prove it existed outside your system.
          </p>

          {/* Artifact block */}
          <p className="font-mono text-[13px] font-light leading-[1.7] text-landing-muted/90 my-8">
            artifact
            <br />
            artifact.proof
          </p>

          {/* Get started link */}
          <Link
            to="/developers"
            className="inline-block font-mono text-[13px] text-landing-copper/90 hover:text-landing-copper transition-colors tracking-[0.5px] mb-8"
          >
            → Get started
          </Link>

          <p className="text-base text-landing-muted/90 tracking-wide">
            Verification is public. Attestation is permissioned.
            <br />
            Independently verifiable.
          </p>

          {/* Category descriptor + spec reference */}
          <p className="text-base text-landing-muted/90 tracking-wide mt-6">
            Anchoring Infrastructure
          </p>
          <p className="text-xs text-landing-muted/90 mt-2 tracking-wide">
            Implements the{' '}
            <a
              href="https://anchoring-spec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-landing-muted transition-colors"
            >
              Anchoring Specification (IEC)
            </a>
          </p>
        </main>

        {/* Separator */}
        <div className="border-t border-landing-muted/10" />

        {/* Footer — Stripe 2014 style: grouped columns, nothing hidden */}
        <footer className="py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Protocol */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-landing-muted/40 tracking-[3px] uppercase font-mono mb-1">Protocol</p>
              <Link to="/anchor" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Anchor</Link>
              <Link to="/technical" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Technical</Link>
              <Link to="/creation-integrity" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Creation Integrity</Link>
              <Link to="/why" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Why</Link>
            </div>

            {/* Integrate */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-landing-muted/40 tracking-[3px] uppercase font-mono mb-1">Integrate</p>
              <Link to="/developers" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Get Started</Link>
              <Link to="/api-reference" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">API Reference</Link>
              <Link to="/core" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Core</Link>
              <Link to="/partner-integration" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Integration</Link>
              <Link to="/partnerships" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Partnerships</Link>
              <Link to="/sdk" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">SDK</Link>
            </div>

            {/* Verify */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-landing-muted/40 tracking-[3px] uppercase font-mono mb-1">Verify</p>
              <Link to="/verify" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Verify an anchor</Link>
              <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Independent verifier ↗</a>
              <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Specification (IEC) ↗</a>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-landing-muted/40 tracking-[3px] uppercase font-mono mb-1">Legal</p>
              <Link to="/legal" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Legal</Link>
              <Link to="/privacy" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm text-landing-muted/55 hover:text-landing-muted/80 transition-colors">Terms</Link>
            </div>
          </div>

          {/* Bottom line */}
          <div className="border-t border-landing-muted/8 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-landing-muted/35">
            <span>© {new Date().getFullYear()} Umarise</span>
            <a 
              href="mailto:partners@umarise.com" 
              className="hover:text-landing-muted/55 transition-colors"
            >
              partners@umarise.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
