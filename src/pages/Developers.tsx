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
        <p className="text-[hsl(var(--landing-muted))] text-sm mb-8">
          Generate a key, install the CLI, anchor your first file. <strong className="text-[hsl(var(--landing-cream))]">Under 2 minutes.</strong>
        </p>

        {/* npm badges */}
        <div className="flex flex-wrap gap-3 mb-12">
          <a href="https://www.npmjs.com/package/@umarise/anchor" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/npm/v/@umarise/anchor?label=%40umarise%2Fanchor&color=cb3837&style=flat-square" alt="@umarise/anchor on npm" className="h-5" />
          </a>
          <a href="https://www.npmjs.com/package/@umarise/cli" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/npm/v/@umarise/cli?label=%40umarise%2Fcli&color=cb3837&style=flat-square" alt="@umarise/cli on npm" className="h-5" />
          </a>
          <a href="https://www.npmjs.com/package/@umarise/anchor" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/npm/dm/@umarise/anchor?label=SDK%20downloads&color=222&style=flat-square" alt="SDK monthly downloads" className="h-5" />
          </a>
          <a href="https://www.npmjs.com/package/@umarise/cli" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/npm/dm/@umarise/cli?label=CLI%20downloads&color=222&style=flat-square" alt="CLI monthly downloads" className="h-5" />
          </a>
          <a href="https://pypi.org/project/umarise-core-sdk/" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/pypi/v/umarise-core-sdk?label=umarise-core-sdk&color=3775A9&style=flat-square" alt="umarise-core-sdk on PyPI" className="h-5" />
          </a>
        </div>

        {/* Interactive Get Started Flow */}
        <GetStartedFlow />

        {/* Links */}
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

        {/* Footer */}
        <footer className="mt-20 pt-6 border-t border-[hsl(var(--landing-muted)/0.1)] text-[hsl(var(--landing-muted))] text-xs">
          No account. No dashboard. No vendor lock-in.
        </footer>
      </main>
    </div>
  );
}
