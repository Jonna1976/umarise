import { Link } from 'react-router-dom';

/**
 * Umarise Core Homepage
 * Protocol root — not a product page, not marketing.
 * Status: Core v1 STABLE — this screen is an inscription, not a funnel.
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
            <span className="text-landing-copper">Origins.</span>
          </h1>

          {/* Core axiom */}
          <p className="text-base text-landing-muted/50 leading-relaxed tracking-wide mb-8">
            Information has a beginning.
            <br />
            Umarise makes that beginning provable.
          </p>

          {/* Protocol rule - lower contrast, separated */}
          <p className="text-base text-landing-muted/35 tracking-wide">
            Verification is public. Attestation is permissioned.
            <br />
            Anchored in Bitcoin. Independently verifiable.
          </p>

          {/* Category descriptor */}
          <p className="text-sm text-landing-muted/25 tracking-widest uppercase mt-6">
            Origin Registry
          </p>
        </main>

        {/* Separator */}
        <div className="border-t border-landing-muted/10" />

        {/* Navigation - documentary, not menu */}
        <nav className="py-6 md:py-8 flex flex-col gap-3">
          {/* Primary documents */}
          <div className="flex items-center gap-6 text-base text-landing-muted/40">
            <Link to="/origin" className="hover:text-landing-muted/60 transition-colors">Origin</Link>
            <Link to="/spec" className="hover:text-landing-muted/60 transition-colors">Specification</Link>
            <Link to="/core" className="hover:text-landing-muted/60 transition-colors">Core</Link>
            <Link to="/why" className="hover:text-landing-muted/60 transition-colors">Why</Link>
          </div>

          {/* Legal documents */}
          <div className="flex items-center gap-6 text-base text-landing-muted/35">
            <Link to="/privacy" className="hover:text-landing-muted/55 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-landing-muted/55 transition-colors">Terms</Link>
          </div>
        </nav>

        {/* Footer - silent */}
        <footer className="pb-6 md:pb-8 text-sm text-landing-muted/30 flex flex-col gap-1">
          <span>© {new Date().getFullYear()} Umarise</span>
          <a 
            href="mailto:partners@umarise.com" 
            className="hover:text-landing-muted/45 transition-colors"
          >
            partners@umarise.com
          </a>
        </footer>
      </div>
    </div>
  );
}
