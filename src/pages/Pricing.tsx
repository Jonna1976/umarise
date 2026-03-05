import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Partner Access — /pricing
 * Infrastructure tone. No marketing. No SaaS language.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const bundles = [
  { name: 'Starter', price: '€50', anchors: '500' },
  { name: 'Standard', price: '€500', anchors: '5.000' },
  { name: 'Volume', price: '€5.000', anchors: '50.000' },
];

const included = [
  'Een productie API-sleutel (um_live_...)',
  'Een sandbox API-sleutel (um_test_...) — gratis, onbeperkt, geen credits verbruikt',
  'Toegang tot de volledige API via umarise.com/api-reference',
  'Node.js SDK via npm install @umarise/anchor',
  'Python SDK via pip install umarise-core-sdk',
];

const notIncluded = [
  'Geen SLA (komt later)',
  'Geen implementatiehulp',
  'Geen dashboard',
  'Geen gebruikersbeheer',
];

export default function Pricing() {
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
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-4 text-landing-cream/90">
            Partner Access
          </h1>
        </motion.section>

        {/* Wat je krijgt */}
        <motion.section
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Wat je krijgt
          </p>

          <div
            className="rounded-lg p-6 md:p-8 mb-6"
            style={{
              background: 'hsl(25 35% 42% / 0.07)',
              border: '1px solid hsl(25 35% 42% / 0.2)',
            }}
          >
            <span className="font-mono text-2xl tracking-tight text-landing-copper/85">
              €240
            </span>
            <span className="text-sm text-landing-muted/50 ml-3">
              eenmalig — API-sleutel + volledige toegang
            </span>
          </div>

          <p className="text-sm text-landing-muted/55 leading-relaxed mb-6">
            Geen abonnement. Geen verlenging. Geen verborgen kosten.
            <br />
            Na betaling ontvang je binnen 24 uur:
          </p>

          <ul className="space-y-2 mb-6">
            {included.map((item) => (
              <li key={item} className="text-sm text-landing-muted/50 flex items-start gap-2.5">
                <span className="text-landing-copper/40 mt-0.5 shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-sm text-landing-muted/45 leading-relaxed">
            Integreren kost een developer één middag.
            <br />
            De documentatie is de implementatiehulp.
          </p>
        </motion.section>

        {/* Hoe credits werken */}
        <motion.section
          custom={1}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Hoe credits werken
          </p>

          <p className="text-sm text-landing-muted/55 leading-relaxed mb-8">
            Anchoring kost <span className="text-landing-cream/70 font-mono">€0,10</span> per anchor. Je koopt credits vooraf.
          </p>

          {/* Bundle table */}
          <div
            className="rounded-lg overflow-hidden mb-8"
            style={{ border: '1px solid hsl(220 8% 18% / 0.4)' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: 'hsl(220 8% 10% / 0.6)' }}>
                  <th className="text-left text-xs text-landing-muted/40 tracking-[2px] uppercase font-normal px-5 py-3">Bundel</th>
                  <th className="text-right text-xs text-landing-muted/40 tracking-[2px] uppercase font-normal px-5 py-3">Prijs</th>
                  <th className="text-right text-xs text-landing-muted/40 tracking-[2px] uppercase font-normal px-5 py-3">Anchors</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((b, i) => (
                  <tr
                    key={b.name}
                    style={{
                      background: i % 2 === 0 ? 'hsl(220 8% 10% / 0.3)' : 'hsl(220 8% 10% / 0.15)',
                      borderTop: '1px solid hsl(220 8% 18% / 0.2)',
                    }}
                  >
                    <td className="px-5 py-3 text-sm text-landing-cream/65">{b.name}</td>
                    <td className="px-5 py-3 text-sm text-landing-copper/70 font-mono text-right">{b.price}</td>
                    <td className="px-5 py-3 text-sm text-landing-muted/50 font-mono text-right">{b.anchors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-landing-muted/45 mb-6">
            Credits verlopen niet. Koop wanneer je wilt.
          </p>

          <div
            className="rounded-lg p-5"
            style={{
              background: 'hsl(220 8% 10% / 0.5)',
              border: '1px solid hsl(220 8% 18% / 0.3)',
            }}
          >
            <p className="text-xs text-landing-muted/40 tracking-wide uppercase mb-3">
              Je saldo staat altijd in de response header
            </p>
            <pre className="text-sm font-mono leading-relaxed">
              <span className="text-landing-muted/50">X-Credits-Remaining: </span>
              <span className="text-landing-cream/70">4823</span>
              {'\n'}
              <span className="text-landing-muted/50">X-Credits-Low: </span>
              <span className="text-landing-copper/70">true</span>
              <span className="text-landing-muted/35">  ← verschijnt wanneer saldo &lt; 50</span>
            </pre>
          </div>

          <p className="text-sm text-landing-muted/45 mt-5">
            Bouw <code className="font-mono text-landing-cream/55 text-xs">X-Credits-Low</code> in je eigen monitoring. Wij hoeven je niet te mailen.
          </p>
        </motion.section>

        {/* Bijkopen */}
        <motion.section
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Bijkopen
          </p>

          <p className="text-sm text-landing-muted/55 leading-relaxed mb-6">
            Één URL per bundel. Klik, betaal, credits worden automatisch bijgeschreven.
          </p>

          <p className="text-sm text-landing-muted/45 mb-8">
            Geen portal. Geen account. Geen factuur achteraf.
          </p>

          <a
            href="mailto:partners@umarise.com?subject=Bundel%20kopen"
            className="inline-flex items-center gap-2 font-mono text-sm px-5 py-2.5 rounded transition-colors"
            style={{
              background: 'hsl(25 35% 42% / 0.12)',
              border: '1px solid hsl(25 35% 42% / 0.25)',
              color: 'hsl(25 35% 42% / 0.85)',
            }}
          >
            → Bundel kopen
          </a>
        </motion.section>

        {/* Eerste stap */}
        <motion.section
          custom={3}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Eerste stap
          </p>

          <p className="text-sm text-landing-muted/55 leading-relaxed mb-4">
            Partner betaalt bij onboarding eenmalig:
          </p>

          <div
            className="rounded-lg p-6"
            style={{
              background: 'hsl(220 8% 10% / 0.5)',
              border: '1px solid hsl(220 8% 18% / 0.35)',
            }}
          >
            <p className="text-base text-landing-cream/75">
              <span className="font-mono text-landing-copper/80">€240</span> API-sleutel + eerste bundel naar keuze
            </p>
            <p className="text-sm text-landing-muted/40 mt-2">
              Daarna koop je bij wanneer je saldo laag is.
            </p>
          </div>
        </motion.section>

        {/* Wat wij niet bieden */}
        <motion.section
          custom={4}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Wat wij niet bieden
          </p>

          <ul className="space-y-2">
            {notIncluded.map((item) => (
              <li key={item} className="text-sm text-landing-muted/45 flex items-start gap-2.5">
                <span className="text-landing-muted/25 mt-0.5 shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-sm text-landing-muted/40 mt-6">
            De documentatie, de SDK, en{' '}
            <a
              href="https://verify-anchoring.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-landing-muted/55 underline underline-offset-2 hover:text-landing-muted/70 transition-colors"
            >
              verify-anchoring.org
            </a>{' '}
            zijn wat je nodig hebt.
          </p>
        </motion.section>

        {/* Sandbox */}
        <motion.section
          custom={5}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Sandbox
          </p>

          <p className="text-sm text-landing-muted/55 leading-relaxed mb-6">
            Test zonder kosten en zonder credits te verbruiken.
          </p>

          <div
            className="rounded-lg p-5 overflow-x-auto mb-5"
            style={{
              background: 'hsl(220 8% 8% / 0.7)',
              border: '1px solid hsl(220 8% 18% / 0.3)',
            }}
          >
            <pre className="text-xs font-mono text-landing-muted/50 leading-relaxed whitespace-pre">
{`curl -X POST https://core.umarise.com/v1-core-origins \\
  -H "X-API-Key: um_test_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"hash":"sha256:abc123...", "dry_run": true}'`}
            </pre>
          </div>

          <p className="text-sm text-landing-muted/45 leading-relaxed">
            <code className="font-mono text-xs text-landing-cream/50">um_test_</code> keys simuleren de volledige flow zonder database writes.
            <br />
            Geen credits. Geen limiet.
          </p>
        </motion.section>

        {/* Toegang aanvragen */}
        <motion.section
          custom={6}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-8">
            Toegang aanvragen
          </p>

          <a
            href="mailto:partners@umarise.com"
            className="font-mono text-base text-landing-copper/75 hover:text-landing-copper/90 transition-colors"
          >
            partners@umarise.com
          </a>
          <p className="text-sm text-landing-muted/45 mt-3">
            Vermeld je use case. Sleutel binnen 24 uur.
          </p>
        </motion.section>

        {/* Footer */}
        <section className="border-t py-10" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-landing-muted/45">
            <Link to="/anchor" className="hover:text-landing-muted/65 transition-colors">Anchor</Link>
            <Link to="/technical" className="hover:text-landing-muted/65 transition-colors">Technical</Link>
            <Link to="/api-reference" className="hover:text-landing-muted/65 transition-colors">API</Link>
            <a href="mailto:partners@umarise.com" className="hover:text-landing-muted/65 transition-colors">
              partners@umarise.com
            </a>
          </div>
        </section>

        <footer className="pb-8 text-sm text-landing-muted/30">
          &copy; {new Date().getFullYear()} Umarise
        </footer>
      </div>
    </div>
  );
}
