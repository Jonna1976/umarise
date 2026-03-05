import PageHeader from '@/components/PageHeader';

/**
 * /changelog — Stripe-style minimal changelog.
 * Signals active maintenance and protocol maturity.
 */

const entries = [
  {
    date: '2026-03-05',
    items: [
      'npm badges added to /developers for live download stats',
      'PageHeader simplified — single "Umarise" home link',
      'Footer consistency across /developers and /api-reference',
    ],
  },
  {
    date: '2026-03-04',
    items: [
      '@umarise/cli v1.1.4 — clean 4-line verify output, suppressed OTS noise',
      'ASCII validation for API keys to prevent ByteString errors',
      'GitHub Action v1.0.0 published on Marketplace (Security category)',
    ],
  },
  {
    date: '2026-03-03',
    items: [
      '@umarise/anchor v1.0.0 — Node.js SDK published on npm',
      '@umarise/cli v1.0.0 — first public release',
      'verify-anchoring.org live — independent .proof verification',
      'anchoring-spec.org live — open protocol specification',
    ],
  },
  {
    date: '2026-03-01',
    items: [
      '/api-reference — self-service onboarding with sandbox keys',
      '/developers — 30-second quickstart flow',
      'Stripe credit webhook — anonymous prepaid funding',
    ],
  },
  {
    date: '2026-02-27',
    items: [
      'Core API v1 — /v1/origins, /v1/verify, /v1/proof endpoints',
      'OpenTimestamps integration — Bitcoin anchoring pipeline',
      'Partner API key system with rate limiting tiers',
    ],
  },
];

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))]">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Changelog</h1>
        <p className="text-[hsl(var(--landing-muted))] text-sm mb-16">
          Protocol and tooling updates.
        </p>

        <div className="space-y-12">
          {entries.map((entry) => (
            <article key={entry.date} className="group">
              <time className="block text-xs font-mono text-[hsl(var(--landing-copper))] mb-3 tracking-wide">
                {entry.date}
              </time>
              <ul className="space-y-2 border-l border-[hsl(var(--landing-muted)/0.15)] pl-4">
                {entry.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-[hsl(var(--landing-cream)/0.9)] leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer className="mt-20 pt-6 border-t border-[hsl(var(--landing-muted)/0.1)] text-[hsl(var(--landing-muted))] text-xs">
          Updates are published as they ship. No release schedule.
        </footer>
      </main>
    </div>
  );
}
