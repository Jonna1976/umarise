import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Partnerships — Pricing & Access
 * Infrastructure primitive pricing model.
 * Protocol tone. No marketing.
 */

const tiers = [
  {
    name: 'Founding',
    price: '€199',
    period: '/maand',
    description: 'Early adopters. Direct API access, prioriteit bij spec-evolutie.',
    items: [
      'Onbeperkt L1 + L2 anchoring',
      '1.000 requests/min',
      'Sandbox (um_test_ + dry_run)',
      'SDK support (Node.js, Python)',
      'Founding rate — permanent',
    ],
    accent: true,
    tag: 'Beperkt beschikbaar',
  },
  {
    name: 'Standard',
    price: '€349',
    period: '/maand',
    description: 'Productie-integratie. Volledige API-toegang.',
    items: [
      'Onbeperkt L1 + L2 anchoring',
      '1.000 requests/min',
      'Sandbox + productie keys',
      'Webhook callbacks',
      'Bulk export endpoint',
    ],
    accent: false,
    tag: null,
  },
  {
    name: 'Scale',
    price: '€799',
    period: '/maand',
    description: 'Hoog volume. Custom rate limits.',
    items: [
      'Onbeperkt L1 + L2 anchoring',
      'Custom rate limits',
      'Dedicated onboarding',
      'SLA',
      'Webhook + bulk + export',
    ],
    accent: false,
    tag: null,
  },
];

const layers = [
  {
    id: 'L1/L2',
    name: 'Anchored Existence + Signature',
    price: 'Inbegrepen',
    description: 'SHA-256 hash + Bitcoin anchor + WebAuthn device-binding. Proof dat specifieke bytes bestonden op een specifiek moment.',
  },
  {
    id: 'L3',
    name: 'Anchored Identity',
    price: '€1,95',
    priceSub: 'per attestatie',
    description: 'Gecertificeerde onafhankelijke attestant bevestigt de koppeling tussen ondertekenaar en anker. Vergelijk: notariële bevestiging kost €50-200.',
  },
  {
    id: 'L4',
    name: 'Qualified Electronic Signature',
    price: 'Op aanvraag',
    description: 'QES via QTSP. Juridische gelijkwaardigheid aan handgeschreven handtekening onder eIDAS.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

export default function Partnerships() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24">

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-landing-muted/45 hover:text-landing-muted/65 transition-colors mb-16"
        >
          ↑ umarise.com
        </Link>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15] mb-6">
            <span className="text-landing-cream/90">Partnerships.</span>
          </h1>
          <p className="text-base text-landing-muted/60 leading-relaxed max-w-xl">
            Verification is free. Always. No account, no login, no permission.
            <br />
            Attestation is permissioned. API access requires a key.
          </p>
        </motion.section>

        {/* API Tiers */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-10">
            API Access
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="relative rounded-lg p-6 md:p-8 flex flex-col"
                style={{
                  background: tier.accent
                    ? 'hsl(25 35% 42% / 0.07)'
                    : 'hsl(220 8% 10% / 0.5)',
                  border: `1px solid ${tier.accent ? 'hsl(25 35% 42% / 0.25)' : 'hsl(220 8% 18% / 0.4)'}`,
                }}
              >
                {tier.tag && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-mono tracking-[2px] uppercase"
                    style={{
                      background: 'hsl(25 35% 42% / 0.15)',
                      color: 'hsl(25 35% 42% / 0.85)',
                      border: '1px solid hsl(25 35% 42% / 0.2)',
                    }}
                  >
                    {tier.tag}
                  </span>
                )}

                <h3 className="font-serif text-xl text-landing-cream/85 mb-1">{tier.name}</h3>
                <div className="mb-4">
                  <span className="font-mono text-2xl text-landing-cream/90">{tier.price}</span>
                  <span className="text-sm text-landing-muted/40">{tier.period}</span>
                </div>
                <p className="text-sm text-landing-muted/50 mb-5">{tier.description}</p>
                <ul className="flex-1 space-y-1.5 mb-6">
                  {tier.items.map((item) => (
                    <li key={item} className="text-xs text-landing-muted/45 flex items-start gap-2">
                      <span className="text-landing-copper/40 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Per-proof pricing */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-10">
            Per Proof
          </p>
          <div className="space-y-4">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="rounded-lg p-6 flex items-start gap-6"
                style={{
                  background: 'hsl(220 8% 10% / 0.4)',
                  border: '1px solid hsl(220 8% 18% / 0.35)',
                }}
              >
                <span
                  className="font-mono text-[11px] tracking-[3px] uppercase px-2 py-1 rounded shrink-0 mt-0.5"
                  style={{
                    background: 'hsl(220 8% 18% / 0.5)',
                    color: 'hsl(30 8% 55% / 0.6)',
                  }}
                >
                  {layer.id}
                </span>
                <div className="flex-1">
                  <h3 className="font-serif text-base text-landing-cream/80 mb-1">{layer.name}</h3>
                  <p className="text-sm text-landing-muted/50 leading-relaxed">{layer.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-lg text-landing-cream/80">{layer.price}</span>
                  {layer.priceSub && (
                    <span className="block text-xs text-landing-muted/35">{layer.priceSub}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-10">
            Integration
          </p>
          <div className="rounded-lg p-6 md:p-8" style={{ background: 'hsl(220 8% 10% / 0.4)', border: '1px solid hsl(220 8% 18% / 0.35)' }}>
            <p className="text-sm text-landing-muted/55 leading-relaxed mb-4">
              One API call. No SDK required. No account for verification.
            </p>
            <pre className="font-mono text-xs text-landing-muted/50 bg-landing-deep/50 rounded p-4 overflow-x-auto">
{`curl -X POST https://core.umarise.com/v1-core-origins \\
  -H "X-API-Key: um_..." \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "sha256:...", "short_token": "DOC"}'`}
            </pre>
            <p className="text-xs text-landing-muted/35 mt-3">
              Time to first attestation: &lt;20 minutes.{' '}
              <Link to="/api-reference" className="text-landing-copper/60 hover:text-landing-copper/80 transition-colors underline underline-offset-2">
                API documentation →
              </Link>
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-lg p-8 text-center"
            style={{
              background: 'hsl(25 35% 42% / 0.05)',
              border: '1px solid hsl(25 35% 42% / 0.15)',
            }}
          >
            <p className="text-base text-landing-muted/60 mb-4">
              Interested in integrating anchoring into your infrastructure?
            </p>
            <a
              href="mailto:partners@umarise.com"
              className="inline-block font-mono text-sm text-landing-copper/80 hover:text-landing-copper transition-colors underline underline-offset-4"
            >
              partners@umarise.com
            </a>
          </motion.div>
        </section>

        {/* Bottom nav */}
        <section className="border-t py-10" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-landing-muted/50">
            <Link to="/anchor" className="hover:text-landing-muted/70 transition-colors">Anchor</Link>
            <Link to="/technical" className="hover:text-landing-muted/70 transition-colors">Technical</Link>
            <Link to="/api-reference" className="hover:text-landing-muted/70 transition-colors">API</Link>
            <Link to="/partner-integration" className="hover:text-landing-muted/70 transition-colors">Integration</Link>
          </div>
        </section>

        <footer className="pb-8 text-sm text-landing-muted/30">
          <span>&copy; {new Date().getFullYear()} Umarise</span>
        </footer>
      </div>
    </div>
  );
}
