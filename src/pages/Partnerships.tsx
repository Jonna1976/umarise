import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Partnerships — Infrastructure Primitive Access
 * Simple: one-time key fee + prepaid anchor bundles.
 * No subscriptions. No SaaS.
 */

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
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">

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
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-6">
            Partnerships.
          </h1>
          <p className="text-base text-landing-muted/60 leading-relaxed">
            Verification is free. Always. No account, no login, no permission.
            <br />
            Attestation is permissioned. API access requires a key.
          </p>
        </motion.section>

        {/* API Key */}
        <motion.section
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-6">
            API Key
          </p>
          <div
            className="rounded-lg p-6 md:p-8"
            style={{
              background: 'hsl(25 35% 42% / 0.07)',
              border: '1px solid hsl(25 35% 42% / 0.25)',
            }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif text-xl text-landing-cream/85">One-time access</h2>
              <span className="font-mono text-2xl text-landing-cream/90">€240</span>
            </div>
            <ul className="space-y-2 text-sm text-landing-muted/55">
              <li className="flex items-start gap-2">
                <span className="text-landing-copper/50 mt-0.5">·</span>
                Permanent API key — no expiration, no renewal
              </li>
              <li className="flex items-start gap-2">
                <span className="text-landing-copper/50 mt-0.5">·</span>
                Full sandbox access (um_test_ prefix + dry_run mode)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-landing-copper/50 mt-0.5">·</span>
                SDK support — Node.js and Python
              </li>
              <li className="flex items-start gap-2">
                <span className="text-landing-copper/50 mt-0.5">·</span>
                All public endpoints remain free, no key needed
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Anchor Bundles */}
        <section className="mb-16">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-6">
            Anchor Bundles
          </p>
          <p className="text-sm text-landing-muted/50 mb-8 leading-relaxed">
            Prepaid. No subscription. Buy a bundle, use it at your pace. When it runs out, buy another.
          </p>
          <div className="space-y-3">
            {[
              { count: '500', price: '€50', per: '€0,10 / anchor' },
              { count: '5.000', price: '€500', per: '€0,10 / anchor' },
              { count: '50.000', price: '€5.000', per: '€0,10 / anchor' },
            ].map((bundle, i) => (
              <motion.div
                key={bundle.count}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="rounded-lg p-5 flex items-center justify-between"
                style={{
                  background: 'hsl(220 8% 10% / 0.4)',
                  border: '1px solid hsl(220 8% 18% / 0.35)',
                }}
              >
                <div>
                  <span className="font-mono text-lg text-landing-cream/85">{bundle.count}</span>
                  <span className="text-sm text-landing-muted/40 ml-2">anchors</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg text-landing-cream/85">{bundle.price}</span>
                  <span className="block text-xs text-landing-muted/35">{bundle.per}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-landing-muted/30 mt-4">
            Linear pricing. No tiers, no staffel, no surprises.
          </p>
        </section>

        {/* What's included */}
        <section className="mb-16">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-6">
            Every Anchor Includes
          </p>
          <div className="space-y-3">
            {[
              { id: 'L1', name: 'SHA-256 hash registration', desc: 'Immutable origin record with origin_id and captured_at timestamp.' },
              { id: 'L2', name: 'Bitcoin anchoring via OpenTimestamps', desc: 'Independently verifiable proof on the Bitcoin blockchain. ~1 hour confirmation.' },
            ].map((layer, i) => (
              <motion.div
                key={layer.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="rounded-lg p-5 flex items-start gap-4"
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
                <div>
                  <h3 className="text-sm text-landing-cream/80 mb-0.5">{layer.name}</h3>
                  <p className="text-xs text-landing-muted/45 leading-relaxed">{layer.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* L3 */}
        <section className="mb-16">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-6">
            Optional
          </p>
          <div
            className="rounded-lg p-5 flex items-start gap-4"
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
              L3
            </span>
            <div className="flex-1">
              <h3 className="text-sm text-landing-cream/80 mb-0.5">Anchored Identity</h3>
              <p className="text-xs text-landing-muted/45 leading-relaxed">
                Certified independent attestant confirms the binding between signer and anchor. Comparable notarial confirmation costs €50-200.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-lg text-landing-cream/80">€1,95</span>
              <span className="block text-xs text-landing-muted/35">per attestation</span>
            </div>
          </div>
        </section>

        {/* Integration */}
        <section className="mb-16">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-6">
            Integration
          </p>
          <div className="rounded-lg p-6 md:p-8" style={{ background: 'hsl(220 8% 10% / 0.4)', border: '1px solid hsl(220 8% 18% / 0.35)' }}>
            <pre className="font-mono text-xs text-landing-muted/50 bg-landing-deep/50 rounded p-4 overflow-x-auto">
{`curl -X POST https://core.umarise.com/v1-core-origins \\
  -H "X-API-Key: um_..." \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "sha256:...", "short_token": "DOC"}'`}
            </pre>
            <p className="text-xs text-landing-muted/35 mt-3">
              One call. No SDK required. Time to first attestation: &lt;20 minutes.{' '}
              <Link to="/api-reference" className="text-landing-copper/60 hover:text-landing-copper/80 transition-colors underline underline-offset-2">
                API documentation →
              </Link>
            </p>
          </div>
        </section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div
            className="rounded-lg p-8 text-center"
            style={{
              background: 'hsl(25 35% 42% / 0.05)',
              border: '1px solid hsl(25 35% 42% / 0.15)',
            }}
          >
            <p className="text-sm text-landing-muted/55 mb-4">
              Request an API key or ask about integration.
            </p>
            <a
              href="mailto:partners@umarise.com"
              className="inline-block font-mono text-sm text-landing-copper/80 hover:text-landing-copper transition-colors underline underline-offset-4"
            >
              partners@umarise.com
            </a>
          </div>
        </motion.section>

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
