import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function ArtifactProof() {
  return (
    <main className="min-h-screen bg-landing-bg text-landing-cream">
      <header className="border-b border-landing-muted/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link to="/" className="font-serif text-lg text-landing-cream hover:text-landing-cream/80 transition-colors">
            Umarise
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-3 tracking-tight text-landing-cream">
          What is a <code className="font-mono text-[0.85em] bg-landing-muted/10 px-2 py-0.5 rounded text-landing-cream">.proof</code> file?
        </h1>
        <p className="text-landing-cream text-lg font-light leading-relaxed mb-12">
          A self-contained evidence bundle that proves a file existed at a specific moment, anchored in the Bitcoin blockchain.
        </p>

        {/* The pattern */}
        <div className="border border-landing-muted/15 rounded-lg bg-landing-muted/[0.05] p-6 mb-10">
          <div className="font-mono text-sm space-y-1.5">
            <div>
              <span className="text-landing-cream">release.tar.gz</span>
              <span className="ml-4 text-landing-muted text-xs">← your artifact</span>
            </div>
            <div>
              <span className="text-landing-cream">release.tar.gz</span>
              <span className="text-[hsl(142,50%,55%)]">.proof</span>
              <span className="ml-4 text-landing-muted text-xs">← the proof</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-6 mb-14 text-[15px] text-landing-cream leading-relaxed">
          <p>
            The <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> file contains a SHA-256 hash of your artifact and an OpenTimestamps proof anchored in a Bitcoin block.
          </p>
          <p>
            Verification is independent. No account, no vendor, no trust required.
          </p>
        </div>

        {/* Verify CTA */}
        <a
          href="https://verify-anchoring.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-landing-muted/20 bg-landing-muted/[0.06] text-landing-cream hover:bg-landing-muted/[0.12] hover:border-landing-muted/30 transition-all duration-200 font-mono text-sm tracking-wide"
        >
          Verify a .proof file
          <ExternalLink className="w-3.5 h-3.5 text-landing-cream" />
        </a>

        {/* Create your own */}
        <div className="mt-16 pt-10 border-t border-landing-muted/10">
          <p className="text-landing-cream text-sm mb-4">Create your own proofs</p>
          <div className="font-mono text-sm space-y-3">
            <div>
              <span className="text-landing-muted text-xs block mb-1">CLI</span>
              <code className="text-landing-cream">npx @umarise/cli anchor myfile.pdf</code>
            </div>
            <div>
              <span className="text-landing-muted text-xs block mb-1">GitHub Action</span>
              <code className="text-landing-cream">uses: AnchoringTrust/anchor-action@v1</code>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/developers"
              className="text-sm text-landing-cream hover:text-landing-cream/80 transition-colors underline underline-offset-4 decoration-landing-muted/30"
            >
              Developer documentation →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
