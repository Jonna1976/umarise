import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Pricing — Four-layer staircase
 * L1 free, L2 free, L3 €4.95, L4 custom
 * Matches landing design system (landing-deep / landing-copper / landing-cream)
 */

const layers = [
  {
    id: 'L1',
    name: 'Anchored Existence',
    tagline: 'Proof that your file existed at a specific moment.',
    includes: [
      'SHA-256 hash',
      'OpenTimestamps',
      'Bitcoin anchor',
      'v1.3 certificate',
      'CLI + web verifier',
    ],
    audience: 'Individuals, developers, small teams.',
    price: '€0',
    priceSub: 'Free forever',
    accent: false,
  },
  {
    id: 'L2',
    name: 'Anchored Signature',
    tagline: 'The same proof, bound to a device-based passkey.',
    includes: [
      'Everything in L1',
      'WebAuthn device binding',
      'Hardware-backed signature',
      'Internal auditability',
    ],
    audience: 'Teams that want accountability and auditability.',
    price: '€0',
    priceSub: 'Included with every anchor',
    accent: false,
  },
  {
    id: 'L3',
    name: 'Anchored Identity',
    tagline: 'Anchored signature plus verified identity.',
    includes: [
      'Everything in L2',
      'KYC or notary verification',
      'identity_binding in certificate',
      'Attestation certificate',
      'Advanced Electronic Signature level',
    ],
    audience: 'Legal, IP, research integrity, serious B2B contracts.',
    price: '€4.95',
    priceSub: 'Per attestation. One-time.',
    accent: true,
  },
  {
    id: 'L4',
    name: 'Anchored QES',
    tagline: 'Full EU pen-equivalent status via qualified electronic signature.',
    includes: [
      'Everything in L3',
      'QES container from QTSP partner',
      'ETSI-conform format (XAdES/PAdES)',
      'Legal equivalence to handwritten signature',
    ],
    audience: 'Real estate, notarial, regulated sectors.',
    price: 'Custom',
    priceSub: 'Coming with partners',
    accent: false,
  },
];

const packages = [
  {
    name: 'Individual',
    price: '€0 / month',
    description: 'Unlimited anchors for personal use. Layer 1 + 2 included.',
    pitch: 'Perfect for individuals, researchers and builders who want cryptographic proof without friction.',
    features: ['Unlimited L1 + L2 anchors', 'Open v1.3 certificates', 'CLI + web verification', 'ZIP proof bundles'],
  },
  {
    name: 'Team',
    price: '€30 per employee',
    description: 'Org-wide anchoring infrastructure. One-time. No subscription.',
    pitch: 'Treat anchoring like DNS or backup: cheap, boring, always on.',
    features: ['Org-wide API keys', 'L1 + L2 for all employees', 'Centralized audit log', 'Revocation dashboard', 'Priority support'],
  },
  {
    name: 'Verified Signers',
    price: 'From €4.95',
    description: 'Upgrade signers to Anchored Identity (L3) with verified identity.',
    pitch: 'When you need more than "this account signed" — prove who signed.',
    features: ['KYC identity upgrade', 'Notary-backed attestation', 'identity_binding in certificate', 'Court-ready evidence'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For regulated workflows requiring QES or custom SLAs.',
    pitch: 'From anchored AES to full QES without rebuilding your stack.',
    features: ['Annual SLA + support', 'QES add-on via QTSP partners', 'Private deployment options', 'Dedicated onboarding'],
  },
];

const faqs = [
  {
    q: 'Is this a qualified electronic signature (QES)?',
    a: 'No. Layers 1–3 are not QES. Layer 3 meets the practical requirements of an Advanced Electronic Signature (AES) under eIDAS. Layer 4 can provide QES through qualified trust service provider partners.',
  },
  {
    q: 'Can I use this as evidence in court?',
    a: 'Yes. Layers 1–3 provide strong technical and (for L3) legally reinforced evidence of existence, integrity, and identity. Final assessment is always at the discretion of the court.',
  },
  {
    q: 'Do I need a dashboard or account?',
    a: 'No. Everything is verifiable via API, CLI, or the independent web verifier at verify-anchoring.org. No account required for verification.',
  },
  {
    q: 'What happens if Umarise ceases to exist?',
    a: 'Every proof remains independently verifiable against Bitcoin via the open .ots standard. The specification is public domain. Your proofs survive us.',
  },
  {
    q: 'What is the difference between AES and QES?',
    a: 'AES (Advanced Electronic Signature) requires identity binding and signer control. QES (Qualified Electronic Signature) adds a qualified certificate from a QTSP and has the same legal status as a handwritten signature across all EU member states.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function Pricing() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24">

        {/* Back link */}
        <Link
          to="/"
          className="inline-block text-sm text-landing-muted/50 hover:text-landing-muted/70 transition-colors mb-16"
        >
          ← umarise.com
        </Link>

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15] mb-6">
            <span className="text-landing-cream/90">Cryptographic anchoring</span>
            <br />
            <span className="text-landing-copper">for every level of assurance.</span>
          </h1>
          <p className="text-lg text-landing-muted/70 leading-relaxed max-w-2xl mb-8">
            Hash-in, proof-out. Free for individuals. Scalable and verifiable for organizations,
            with optional identity and legal assurance on top.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/anchor"
              className="inline-flex items-center px-6 py-3 text-sm tracking-widest uppercase rounded-full border transition-all"
              style={{
                borderColor: 'hsl(25 35% 42% / 0.35)',
                color: 'hsl(25 35% 42%)',
                background: 'hsl(25 35% 42% / 0.06)',
              }}
            >
              Start anchoring for free
            </Link>
            <a
              href="mailto:partners@umarise.com"
              className="inline-flex items-center px-6 py-3 text-sm tracking-widest uppercase text-landing-muted/55 hover:text-landing-muted/75 transition-colors"
            >
              Talk to us about legal assurance →
            </a>
          </div>
        </motion.section>

        {/* ── Four layers — visual staircase ── */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/40 tracking-[4px] uppercase mb-10">
            Four layers of assurance
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="relative rounded-lg p-6 md:p-8 flex flex-col"
                style={{
                  background: layer.accent
                    ? 'hsl(25 35% 42% / 0.08)'
                    : 'hsl(220 8% 10% / 0.6)',
                  border: `1px solid ${layer.accent ? 'hsl(25 35% 42% / 0.25)' : 'hsl(220 8% 18% / 0.5)'}`,
                }}
              >
                {/* Layer badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-mono text-[11px] tracking-[3px] uppercase px-2 py-1 rounded"
                    style={{
                      background: layer.accent ? 'hsl(25 35% 42% / 0.15)' : 'hsl(220 8% 18% / 0.6)',
                      color: layer.accent ? 'hsl(25 35% 42%)' : 'hsl(30 8% 55% / 0.7)',
                    }}
                  >
                    {layer.id}
                  </span>
                  <span className="font-serif text-lg text-landing-cream/85">{layer.name}</span>
                </div>

                {/* Tagline */}
                <p className="text-sm text-landing-muted/65 leading-relaxed mb-5">
                  {layer.tagline}
                </p>

                {/* Includes */}
                <ul className="flex-1 space-y-1.5 mb-6">
                  {layer.includes.map((item) => (
                    <li key={item} className="text-xs text-landing-muted/50 flex items-start gap-2">
                      <span className="text-landing-copper/50 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="border-t pt-4" style={{ borderColor: 'hsl(220 8% 18% / 0.4)' }}>
                  <span
                    className="font-mono text-2xl tracking-tight"
                    style={{ color: layer.accent ? 'hsl(25 35% 42%)' : 'hsl(40 15% 88% / 0.8)' }}
                  >
                    {layer.price}
                  </span>
                  <span className="block text-xs text-landing-muted/40 mt-1">{layer.priceSub}</span>
                </div>

                {/* Audience */}
                <p className="text-[11px] text-landing-muted/35 mt-3 italic">
                  {layer.audience}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Packages ── */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/40 tracking-[4px] uppercase mb-10">
            Packages
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="rounded-lg p-6 md:p-8 flex flex-col"
                style={{
                  background: 'hsl(220 8% 10% / 0.5)',
                  border: '1px solid hsl(220 8% 18% / 0.4)',
                }}
              >
                <h3 className="font-serif text-xl text-landing-cream/85 mb-1">{pkg.name}</h3>
                <span className="font-mono text-lg text-landing-copper/80 mb-3">{pkg.price}</span>
                <p className="text-sm text-landing-muted/60 mb-2">{pkg.description}</p>
                <p className="text-xs text-landing-muted/45 italic mb-5">{pkg.pitch}</p>
                <ul className="flex-1 space-y-1.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="text-xs text-landing-muted/50 flex items-start gap-2">
                      <span className="text-landing-copper/40 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/40 tracking-[4px] uppercase mb-10">
            Frequently asked
          </p>
          <div className="space-y-6 max-w-2xl">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h4 className="font-serif text-base text-landing-cream/80 mb-2">{faq.q}</h4>
                <p className="text-sm text-landing-muted/55 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="border-t py-12" style={{ borderColor: 'hsl(220 8% 18% / 0.3)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-serif text-2xl text-landing-cream/85 mb-1">Ready to anchor?</p>
              <p className="text-sm text-landing-muted/50">Start free. Upgrade when you need legal assurance.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/anchor"
                className="inline-flex items-center px-6 py-3 text-sm tracking-widest uppercase rounded-full border transition-all"
                style={{
                  borderColor: 'hsl(25 35% 42% / 0.35)',
                  color: 'hsl(25 35% 42%)',
                  background: 'hsl(25 35% 42% / 0.06)',
                }}
              >
                Start for free
              </Link>
              <a
                href="mailto:partners@umarise.com"
                className="inline-flex items-center px-6 py-3 text-sm tracking-widest uppercase text-landing-muted/55 hover:text-landing-muted/75 transition-colors"
              >
                Contact sales →
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 pb-8 text-sm text-landing-muted/35 flex flex-col gap-1">
          <span>© {new Date().getFullYear()} Umarise</span>
          <Link to="/" className="hover:text-landing-muted/50 transition-colors">umarise.com</Link>
        </footer>
      </div>
    </div>
  );
}
