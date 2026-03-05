import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';

/**
 * /developers — Developer onboarding quickstart.
 * Goal: first proof in 30–60 seconds.
 */

const steps = [
  {
    id: '02',
    title: 'Get your API key',
    blocks: [
      {
        label: 'Generate instantly — no account needed',
        code: 'curl -X POST https://core.umarise.com/v1-developer-key',
      },
      {
        label: 'Response',
        code: `{
  "api_key": "um_live_abc123…",
  "credits": 100
}`,
      },
    ],
    note: '100 free credits. No email. No signup. Key works immediately.',
  },
  {
    id: '02',
    title: 'Install',
    blocks: [
      { label: 'One-shot (no install)', code: 'npx @umarise/cli proof file.pdf' },
      { label: 'Global install', code: 'npm install -g @umarise/cli' },
      { label: 'SDK', code: 'npm install @umarise/anchor' },
    ],
  },
  {
    id: '03',
    title: 'Anchor a file',
    blocks: [
      { label: 'CLI', code: 'export UMARISE_API_KEY=um_live_…\numarise proof report.pdf' },
      {
        label: 'Result',
        code: `report.pdf.proof
├── certificate.json
├── proof.ots
└── VERIFY.txt`,
      },
    ],
  },
  {
    id: '04',
    title: 'Verify',
    blocks: [
      { label: 'CLI', code: 'umarise verify report.pdf report.pdf.proof' },
      {
        label: 'Output',
        code: `✓ SHA-256 hash matches
✓ Anchored in Bitcoin block 935037
✓ Timestamp: 2026-02-04 20:56:02 UTC
✓ Proof valid`,
      },
    ],
    note: 'Verification works offline. No API key required.',
  },
  {
    id: '05',
    title: 'CI/CD',
    blocks: [
      {
        label: 'GitHub Actions',
        code: `- uses: AnchoringTrust/anchor-action@v1
  env:
    UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}
  with:
    file: dist/release.tar.gz`,
      },
    ],
    note: 'The .proof file appears as a build artifact alongside your binary.',
  },
];

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
        <p className="text-[hsl(var(--landing-muted))] text-sm mb-16">
          First proof in under 60 seconds. No account required.
        </p>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step) => (
            <section key={step.id}>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-mono text-xs text-[hsl(var(--landing-copper))]">
                  {step.id}
                </span>
                <h2 className="font-serif text-xl text-[hsl(var(--landing-cream))]">
                  {step.title}
                </h2>
              </div>

              <div className="space-y-4">
                {step.blocks.map((block) => (
                  <div key={block.label}>
                    <span className="text-[hsl(var(--landing-muted))] text-xs font-mono uppercase tracking-wider mb-2 block">
                      {block.label}
                    </span>
                    <pre className="bg-[hsl(220,10%,10%)] border border-[hsl(var(--landing-muted)/0.15)] rounded-lg p-4 text-sm font-mono text-[hsl(var(--landing-cream)/0.9)] overflow-x-auto leading-relaxed">
                      {block.code}
                    </pre>
                  </div>
                ))}
              </div>

              {step.note && (
                <p className="text-[hsl(var(--landing-muted))] text-xs mt-3 italic">
                  {step.note}
                </p>
              )}
            </section>
          ))}
        </div>

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
