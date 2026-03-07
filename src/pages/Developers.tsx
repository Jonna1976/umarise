import { useState, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import GetStartedFlow from '@/components/api-reference/GetStartedFlow';
import ArtifactPairVisual from '@/components/developers/ArtifactPairVisual';

/**
 * /developers — Developer onboarding quickstart.
 * Goal: first proof in 30–60 seconds.
 */

const links = [
  { label: 'API Reference', href: '/api-reference', internal: true },
  { label: 'Anchoring Specification', href: 'https://anchoring-spec.org', internal: false },
  { label: 'CLI on npm', href: 'https://www.npmjs.com/package/@umarise/cli', internal: false },
  { label: 'SDK on npm', href: 'https://www.npmjs.com/package/@umarise/anchor', internal: false },
  { label: 'GitHub Action', href: 'https://github.com/marketplace/actions/umarise-anchor', internal: false },
  { label: 'Example repo (fork & go)', href: 'https://github.com/AnchoringTrust/anchoring-examples', internal: false },
  { label: 'Verify a proof', href: 'https://verify-anchoring.org', internal: false },
  { label: 'How anchoring works', href: '/anchor', internal: true },
];

export default function Developers() {
  const [unlocked, setUnlocked] = useState(false);
  const handleUnlock = useCallback((v: boolean) => setUnlocked(v), []);

  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))]">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl mb-2 text-[hsl(var(--landing-cream))]">
          Get Started
        </h1>
        <div className="space-y-1 mb-8">
          <p className="text-[hsl(var(--landing-cream)/0.55)] text-sm">
            Generate a key, install the CLI, anchor a file. Bitcoin confirmation takes ~2 hours.
          </p>
          <p className="text-[hsl(var(--landing-cream)/0.55)] text-sm">
            Attach a verifiable creation proof to any artifact: build outputs, datasets, model weights, documents. One command, any file type.
          </p>
        </div>


        {/* Interactive Get Started Flow */}
        <GetStartedFlow onUnlock={handleUnlock} />

        {/* Links */}
        {/* Artifact pattern */}
        <div className={`mt-16 p-5 rounded-lg border transition-all duration-300 ${unlocked ? 'border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(220,10%,6%)]' : 'border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(220,10%,7%)] opacity-[0.35] select-none'}`}>
          <p className="font-serif text-base text-[hsl(var(--landing-cream))] mb-4">The proof travels with the artifact.</p>
          <pre className="bg-[hsl(220,10%,8%)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 text-[13px] font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed mb-3">{`artifact\nartifact.proof`}</pre>
          <p className="text-[13px] text-[hsl(var(--landing-muted))]">Store them together. Commit to git, attach to a release, or ship to a client. The <code className="text-[hsl(var(--landing-copper))]">.proof</code> file verifies independently. No API, no account, no platform dependency.</p>
        </div>

        <section className="mt-20 pt-10 border-t border-[hsl(var(--landing-muted)/0.15)]">
          <h2 className="font-serif text-xl mb-6 text-[hsl(var(--landing-cream))]">References</h2>
          <ul className="space-y-3">
            {links.map((link) =>
              link.internal ? (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--landing-copper))] hover:text-[hsl(var(--landing-cream))] transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[hsl(var(--landing-copper))] hover:text-[hsl(var(--landing-cream))] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </section>

        {/* Artifact pair visual */}
        <section className="mt-20 pt-10 border-t border-[hsl(var(--landing-muted)/0.15)]">
          <ArtifactPairVisual />
        </section>

        {/* Self-Proving Artifact visual */}
        <section className="mt-20 pt-10 border-t border-[hsl(var(--landing-muted)/0.15)]">
          <h2 className="font-serif text-xl mb-2 text-[hsl(var(--landing-cream))]">The Self-Proving Artifact</h2>
          <p className="text-[13px] text-[hsl(var(--landing-muted))] mb-6">
            The vision: proof becomes a property of the file itself.
          </p>
          <div className="rounded-lg overflow-hidden border border-[hsl(var(--landing-cream)/0.08)]">
            <iframe
              src="/docs/self-proving-artifact-visual.html"
              className="w-full border-0"
              style={{ height: '680px' }}
              title="The Self-Proving Artifact"
              loading="lazy"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
