import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Pricing - Four-layer staircase
 * Protocol tone. No marketing. Documentary.
 */

const layers = [
  {
    id: 'L1',
    name: 'Anchored Existence',
    tagline: 'A SHA-256 hash anchored via OpenTimestamps to Bitcoin. Proof that these exact bytes existed no later than a specific block.',
    includes: [
      'SHA-256 hash',
      'OpenTimestamps anchor',
      'Bitcoin block confirmation',
      'v1.3 certificate',
      'CLI and web verification',
    ],
    price: 'No cost',
    priceSub: 'No account required',
    accent: false,
  },
  {
    id: 'L2',
    name: 'Anchored Signature',
    tagline: 'L1, plus a WebAuthn device-bound signature. The anchor is cryptographically tied to a specific hardware key.',
    includes: [
      'Everything in L1',
      'WebAuthn device binding',
      'Hardware-backed signature key',
      'Signature recorded in certificate',
    ],
    price: 'No cost',
    priceSub: 'Included with every anchor',
    accent: false,
  },
  {
    id: 'L3',
    name: 'Anchored Identity',
    tagline: 'L2, plus a verified identity binding. A certified independent attestant confirms the link between signer and anchor.',
    includes: [
      'Everything in L2',
      'KYC or notary verification',
      'identity_binding in certificate',
      'Signed attestation certificate',
      'Advanced Electronic Signature level',
    ],
    price: 'EUR 4.95',
    priceSub: 'Per attestation',
    accent: true,
  },
  {
    id: 'L4',
    name: 'Anchored QES',
    tagline: 'L3, plus a Qualified Electronic Signature via QTSP. Legal equivalence to a handwritten signature under eIDAS.',
    includes: [
      'Everything in L3',
      'QES container via QTSP',
      'ETSI-conform format (XAdES/PAdES)',
      'EU-wide legal recognition',
    ],
    price: 'On request',
    priceSub: 'Requires QTSP integration',
    accent: false,
  },
];

const access = [
  {
    name: 'Individual',
    price: 'No cost',
    description: 'L1 and L2 anchoring. No account required. No limits.',
    items: ['Unlimited L1 + L2 anchors', 'Open v1.3 certificates', 'CLI + web verification', 'ZIP proof bundles'],
  },
  {
    name: 'Organization',
    price: 'EUR 30 per employee',
    description: 'Org-wide API access. One-time. No recurring fees.',
    items: ['API keys with usage quotas', 'L1 + L2 for all employees', 'Centralized audit log', 'Revocation registry'],
  },
  {
    name: 'Verified Signers',
    price: 'From EUR 4.95',
    description: 'L3 identity binding per signer. KYC or notary attestation.',
    items: ['KYC identity verification', 'Notary-backed attestation', 'identity_binding in certificate', 'Court-admissible evidence'],
  },
  {
    name: 'Regulated',
    price: 'On request',
    description: 'QES integration via qualified trust service providers.',
    items: ['SLA and dedicated onboarding', 'QES via QTSP integration', 'Custom deployment', 'Compliance documentation'],
  },
];

const faqs = [
  {
    q: 'Is this a qualified electronic signature (QES)?',
    a: 'L1 through L3 are not QES. L3 meets the practical requirements of an Advanced Electronic Signature (AES) under eIDAS. L4 provides QES through qualified trust service providers.',
  },
  {
    q: 'Is this admissible as evidence?',
    a: 'L1 through L3 provide strong technical evidence of existence, integrity, and (for L3) identity. Assessment of evidentiary weight is at the discretion of the court.',
  },
  {
    q: 'Is an account required?',
    a: 'No. Verification runs via the independent web verifier at verify-anchoring.org, via CLI, or via API. No account, no login, no permission.',
  },
  {
    q: 'What if Umarise ceases to exist?',
    a: 'Every proof remains independently verifiable against Bitcoin via the open .ots standard. The specification is public domain. The architecture does not depend on the continued existence of the issuer.',
  },
  {
    q: 'What is the difference between AES and QES?',
    a: 'AES (Advanced Electronic Signature) requires identity binding and signer control. QES (Qualified Electronic Signature) adds a qualified certificate from a QTSP and has the same legal status as a handwritten signature across all EU member states under eIDAS.',
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

export default function Pricing() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24">

        <Link
          to="/"
          className="inline-block text-sm text-landing-muted/45 hover:text-landing-muted/65 transition-colors mb-16"
        >
          umarise.com
        </Link>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15] mb-6">
            <span className="text-landing-cream/90">Four layers</span>
            <br />
            <span className="text-landing-copper">of assurance.</span>
          </h1>
          <p className="text-base text-landing-muted/60 leading-relaxed max-w-xl">
            Anchoring is free. Identity binding is permissioned.
            <br />
            Each layer adds a verifiable property to the proof.
          </p>
        </motion.section>

        {/* Four layers */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-10">
            Layers
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
                    ? 'hsl(25 35% 42% / 0.07)'
                    : 'hsl(220 8% 10% / 0.5)',
                  border: `1px solid ${layer.accent ? 'hsl(25 35% 42% / 0.2)' : 'hsl(220 8% 18% / 0.4)'}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-mono text-[11px] tracking-[3px] uppercase px-2 py-1 rounded"
                    style={{
                      background: layer.accent ? 'hsl(25 35% 42% / 0.12)' : 'hsl(220 8% 18% / 0.5)',
                      color: layer.accent ? 'hsl(25 35% 42% / 0.8)' : 'hsl(30 8% 55% / 0.6)',
                    }}
                  >
                    {layer.id}
                  </span>
                  <span className="font-serif text-lg text-landing-cream/80">{layer.name}</span>
                </div>

                <p className="text-sm text-landing-muted/55 leading-relaxed mb-5">
                  {layer.tagline}
                </p>

                <ul className="flex-1 space-y-1.5 mb-6">
                  {layer.includes.map((item) => (
                    <li key={item} className="text-xs text-landing-muted/45 flex items-start gap-2">
                      <span className="text-landing-copper/40 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="border-t pt-4" style={{ borderColor: 'hsl(220 8% 18% / 0.3)' }}>
                  <span
                    className="font-mono text-xl tracking-tight"
                    style={{ color: layer.accent ? 'hsl(25 35% 42% / 0.85)' : 'hsl(40 15% 88% / 0.7)' }}
                  >
                    {layer.price}
                  </span>
                  <span className="block text-xs text-landing-muted/35 mt-1">{layer.priceSub}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Access */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-10">
            Access
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {access.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="rounded-lg p-6 md:p-8 flex flex-col"
                style={{
                  background: 'hsl(220 8% 10% / 0.4)',
                  border: '1px solid hsl(220 8% 18% / 0.35)',
                }}
              >
                <h3 className="font-serif text-lg text-landing-cream/75 mb-1">{pkg.name}</h3>
                <span className="font-mono text-base text-landing-copper/70 mb-3">{pkg.price}</span>
                <p className="text-sm text-landing-muted/50 mb-5">{pkg.description}</p>
                <ul className="flex-1 space-y-1.5">
                  {pkg.items.map((f) => (
                    <li key={f} className="text-xs text-landing-muted/45 flex items-start gap-2">
                      <span className="text-landing-muted/30 mt-0.5">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-24">
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-10">
            Questions
          </p>
          <div className="space-y-6 max-w-2xl">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h4 className="font-serif text-base text-landing-cream/70 mb-2">{faq.q}</h4>
                <p className="text-sm text-landing-muted/50 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom */}
        <section className="border-t py-10" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-landing-muted/50">
            <Link to="/anchor" className="hover:text-landing-muted/70 transition-colors">Anchor</Link>
            <Link to="/technical" className="hover:text-landing-muted/70 transition-colors">Technical</Link>
            <Link to="/api-reference" className="hover:text-landing-muted/70 transition-colors">API</Link>
            <a href="mailto:partners@umarise.com" className="hover:text-landing-muted/70 transition-colors">
              partners@umarise.com
            </a>
          </div>
        </section>

        <footer className="pb-8 text-sm text-landing-muted/30">
          <span>© {new Date().getFullYear()} Umarise</span>
        </footer>
      </div>
    </div>
  );
}
