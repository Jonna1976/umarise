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
          <p className="text-base text-landing-muted/75 leading-relaxed tracking-wide mb-8">
            When digital information matters,
            <br />
            prove it existed outside your system.
          </p>

          {/* Protocol rule - lower contrast, separated */}
          <p className="text-base text-landing-muted/65 tracking-wide">
            Verification is public. Attestation is permissioned.
            <br />
            Independently verifiable.
          </p>

          {/* Category descriptor + spec reference */}
          <p className="text-sm text-landing-muted/55 tracking-widest uppercase mt-6">
            Anchoring Infrastructure
          </p>
          <p className="text-xs text-landing-muted/35 mt-2 tracking-wide">
            Implements the{' '}
            <a
              href="https://anchoring-spec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-landing-muted/50 transition-colors"
            >
              Anchoring Specification (IEC)
            </a>
          </p>
        </main>

        {/* Separator */}
        <div className="border-t border-landing-muted/10" />

        {/* Navigation - documentary, not menu */}
        <nav className="py-6 md:py-8 flex flex-col gap-4">
          {/* Primary documents */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-landing-muted/55">
            <Link to="/anchor" className="hover:text-landing-muted/75 transition-colors">Anchor</Link>
            <Link to="/technical" className="hover:text-landing-muted/75 transition-colors">Technical</Link>
            <Link to="/creation-integrity" className="hover:text-landing-muted/75 transition-colors whitespace-nowrap">Creation Integrity</Link>
            <Link to="/why" className="hover:text-landing-muted/75 transition-colors">Why</Link>
            <Link to="/core" className="hover:text-landing-muted/75 transition-colors">Core</Link>
            <Link to="/pricing" className="hover:text-landing-muted/75 transition-colors">Pricing</Link>
          </div>

          {/* Verification & legal */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-landing-muted/50">
            <Link to="/verify" className="hover:text-landing-muted/70 transition-colors">Verify</Link>
            <Link to="/legal" className="hover:text-landing-muted/70 transition-colors">Legal</Link>
            <Link to="/privacy" className="hover:text-landing-muted/70 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-landing-muted/70 transition-colors">Terms</Link>
          </div>
        </nav>

        {/* Footer - silent */}
        <footer className="pb-6 md:pb-8 text-sm text-landing-muted/45 flex flex-col gap-1">
          <span>© {new Date().getFullYear()} Umarise</span>
          <a 
            href="mailto:partners@umarise.com" 
            className="hover:text-landing-muted/60 transition-colors"
          >
            partners@umarise.com
          </a>
        </footer>
      </div>
    </div>
  );
}
