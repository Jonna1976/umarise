import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import GetStartedFlow from '@/components/api-reference/GetStartedFlow';

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
  { label: 'Verify a proof', href: 'https://verify-anchoring.org', internal: false },
  { label: 'How anchoring works', href: '/anchor', internal: true },
];

export default function Developers() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))]">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl mb-2 text-[hsl(var(--landing-cream))]">
          Get Started
        </h1>
        <p className="text-[hsl(var(--landing-cream))] text-sm mb-8">
          Generate a key, install the CLI, anchor a file. Bitcoin confirmation takes ~2 hours.
        </p>


        {/* Interactive Get Started Flow */}
        <GetStartedFlow />

        {/* Links */}
        {/* Artifact pattern */}
        <div className="mt-16 p-5 rounded-lg border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(220,10%,6%)]">
          <p className="font-serif text-base text-[hsl(var(--landing-cream))] mb-4">The proof travels with the artifact.</p>
          <pre className="bg-[hsl(220,10%,8%)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 text-[13px] font-mono text-[hsl(var(--landing-cream))] whitespace-pre leading-relaxed mb-3">{`artifact\nartifact.proof`}</pre>
          <p className="text-[13px] text-[hsl(var(--landing-muted))]">Store them together. Commit to git, attach to a release, or ship to a client. The <code className="text-[hsl(var(--landing-copper))]">.proof</code> file verifies independently. No API, no account, no platform dependency.</p>
        </div>

        <section className="mt-20 pt-10 border-t border-[hsl(var(--landing-muted)/0.15)]">
          <h2 className="font-serif text-xl mb-6 text-[hsl(var(--landing-cream))]">
            References
          </h2>
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

        {/* Closing statement */}
        <div className="mt-16 p-4 rounded border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(220,10%,6%)]">
          <p className="text-[13px] text-[hsl(var(--landing-cream))] mb-2">
            Your file + <code className="text-[hsl(var(--landing-copper))]">.proof</code> = independently verifiable evidence. The file never leaves your device.
          </p>
          <a href="https://anchoring-spec.org/v1.0/" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-cream))] transition-colors">
            Proof is self-contained. Verification works without Umarise. →
          </a>
        </div>
      </main>
    </div>
  );
}
