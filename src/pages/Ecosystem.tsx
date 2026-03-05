import PageHeader from '@/components/PageHeader';
import { ExternalLink } from 'lucide-react';

const channels = [
  {
    category: 'Package Registries',
    items: [
      {
        name: '@umarise/anchor',
        description: 'Node.js SDK — hash, attest, verify, proof',
        install: 'npm install @umarise/anchor',
        url: 'https://www.npmjs.com/package/@umarise/anchor',
        badge: 'https://img.shields.io/npm/v/@umarise/anchor?color=cb3837&style=flat-square',
      },
      {
        name: '@umarise/cli',
        description: 'Command-line tool — anchor & verify any file',
        install: 'npx @umarise/cli anchor <file>',
        url: 'https://www.npmjs.com/package/@umarise/cli',
        badge: 'https://img.shields.io/npm/v/@umarise/cli?color=cb3837&style=flat-square',
      },
      {
        name: 'umarise-core-sdk',
        description: 'Python SDK — zero dependencies, Python 3.8+',
        install: 'pip install umarise-core-sdk',
        url: 'https://pypi.org/project/umarise-core-sdk/',
        badge: 'https://img.shields.io/pypi/v/umarise-core-sdk?color=3775A9&style=flat-square',
      },
    ],
  },
  {
    category: 'CI/CD',
    items: [
      {
        name: 'AnchoringTrust/anchor-action',
        description: 'GitHub Action — 1 line YAML, .proof as build artifact',
        install: 'uses: AnchoringTrust/anchor-action@v1',
        url: 'https://github.com/marketplace/actions/umarise-anchor',
        badge: 'https://img.shields.io/badge/Marketplace-Security-2ea44f?style=flat-square',
      },
    ],
  },
  {
    category: 'Documentation',
    items: [
      {
        name: 'Developers',
        description: 'Quickstart — first proof in 30 seconds',
        url: 'https://umarise.com/developers',
      },
      {
        name: 'API Reference',
        description: 'Full endpoint documentation with sandbox',
        url: 'https://umarise.com/api-reference',
      },
      {
        name: 'Anchoring Spec',
        description: 'Open protocol specification (v1.0)',
        url: 'https://anchoring-spec.org',
      },
    ],
  },
  {
    category: 'Verification',
    items: [
      {
        name: 'verify-anchoring.org',
        description: 'Independent .proof verifier — no account, no backend',
        url: 'https://verify-anchoring.org',
      },
    ],
  },
];

const reach = [
  { channel: 'npm', audience: '45M developers', access: 'Zero — no account needed' },
  { channel: 'PyPI', audience: '15M developers', access: 'pip install + 3 lines' },
  { channel: 'GitHub Actions', audience: '100M users', access: '1 line YAML' },
  { channel: 'GitHub Marketplace', audience: '20K+ Actions listed', access: 'Category: Security' },
];

export default function Ecosystem() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))]">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Ecosystem</h1>
        <p className="text-[hsl(var(--landing-muted))] text-sm mb-16">
          Every distribution channel. Every integration point. One primitive.
        </p>

        {channels.map((group) => (
          <section key={group.category} className="mb-14">
            <h2 className="text-xs font-mono text-[hsl(var(--landing-copper))] tracking-widest uppercase mb-6">
              {group.category}
            </h2>
            <div className="space-y-4">
              {group.items.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-cream)/0.02)] hover:bg-[hsl(var(--landing-cream)/0.05)] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <img src={item.badge} alt="" className="h-4" />
                        )}
                      </div>
                      <p className="text-xs text-[hsl(var(--landing-muted))]">{item.description}</p>
                      {item.install && (
                        <code className="block mt-2 text-xs font-mono text-[hsl(var(--landing-copper))] bg-[hsl(var(--landing-deep))] px-2 py-1 rounded w-fit">
                          {item.install}
                        </code>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--landing-muted))] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-14">
          <h2 className="text-xs font-mono text-[hsl(var(--landing-copper))] tracking-widest uppercase mb-6">
            Reach
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                  <th className="text-left py-2 font-mono text-xs text-[hsl(var(--landing-muted))]">Channel</th>
                  <th className="text-left py-2 font-mono text-xs text-[hsl(var(--landing-muted))]">Potential audience</th>
                  <th className="text-left py-2 font-mono text-xs text-[hsl(var(--landing-muted))]">Barrier to entry</th>
                </tr>
              </thead>
              <tbody>
                {reach.map((row) => (
                  <tr key={row.channel} className="border-b border-[hsl(var(--landing-cream)/0.05)]">
                    <td className="py-3 font-mono text-xs">{row.channel}</td>
                    <td className="py-3 text-xs text-[hsl(var(--landing-cream)/0.85)]">{row.audience}</td>
                    <td className="py-3 text-xs text-[hsl(var(--landing-muted))]">{row.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pt-8 border-t border-[hsl(var(--landing-cream)/0.08)]">
          <p className="text-xs text-[hsl(var(--landing-muted))]">
            No account required. No vendor lock-in. Proof works without us.
          </p>
        </footer>
      </main>
    </div>
  );
}
