import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Sector page: Law and Compliance
 * Protocol tone. No workflow language. No marketing.
 * Anchoring as evidence infrastructure for legal contexts.
 */

const useCases = [
  {
    label: 'Contracts and amendments',
    detail: 'Anchor each version at the moment of finalization. The hash proves which text existed at which point in time.',
  },
  {
    label: 'Litigation documents and evidence bundles',
    detail: 'Establish a verifiable chain of existence for every document submitted or received during proceedings.',
  },
  {
    label: 'Legal opinions and advices',
    detail: 'Record the exact content of an opinion at the moment it was issued. Modifications after anchoring are cryptographically visible.',
  },
  {
    label: 'Policy documents and compliance manuals',
    detail: 'Prove which version of a policy was in effect at any given date. Useful for regulatory audits and internal investigations.',
  },
  {
    label: 'Correspondence',
    detail: 'Anchor emails, letters, or notices at the moment of sending. The proof is independent of the mail server or provider.',
  },
];

const layers = [
  {
    id: 'L1',
    name: 'Existence',
    description: 'SHA-256 hash anchored in Bitcoin via OpenTimestamps. Proves these exact bytes existed no later than a specific block.',
  },
  {
    id: 'L2',
    name: 'Signature',
    description: 'L1 plus a WebAuthn device-bound signature. The anchor is tied to a specific hardware key.',
  },
  {
    id: 'L3',
    name: 'Identity',
    description: 'L2 plus verified identity binding via KYC or notary attestation. Meets the practical requirements of an Advanced Electronic Signature under eIDAS.',
  },
];

const properties = [
  {
    label: 'Independent of the issuer',
    detail: 'Verification runs against Bitcoin, not against Umarise servers. Every proof remains valid if the issuer ceases to exist.',
  },
  {
    label: 'Tamper-evident',
    detail: 'Any modification to the original file breaks the SHA-256 hash. The discrepancy is immediately and publicly visible.',
  },
  {
    label: 'Open standard',
    detail: 'The .ots proof format is an open standard. Verification requires no proprietary software, no account, no permission.',
  },
  {
    label: 'Content-agnostic',
    detail: 'The system records a hash, not content. The original file never leaves the device of the person who anchors it.',
  },
];

export default function ForLaw() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">

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
          className="mb-16"
        >
          <p className="text-xs text-landing-muted/35 tracking-[4px] uppercase mb-6">
            For law and compliance
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.2] mb-6">
            <span className="text-landing-cream/90">Tamper-evident</span>
            <br />
            <span className="text-landing-copper">chronology for legal records.</span>
          </h1>
          <p className="text-base text-landing-muted/55 leading-relaxed max-w-xl">
            Contracts, pleadings, advices, and correspondence are central in disputes.
            Internal timestamps and file system metadata are self-attested by the party
            that controls them. Anchoring provides an independent, external record of
            what existed and when.
          </p>
        </motion.section>

        {/* Separator */}
        <div className="border-t mb-16" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }} />

        {/* What anchoring records */}
        <section className="mb-16">
          <h2 className="font-serif text-xl text-landing-cream/75 mb-6">
            What anchoring records
          </h2>
          <div className="space-y-4">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <h3 className="font-serif text-base text-landing-cream/70 mb-1">{uc.label}</h3>
                <p className="text-sm text-landing-muted/50 leading-relaxed">{uc.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Separator */}
        <div className="border-t mb-16" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }} />

        {/* Assurance layers */}
        <section className="mb-16">
          <h2 className="font-serif text-xl text-landing-cream/75 mb-6">
            Assurance layers
          </h2>
          <div className="space-y-4">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-lg p-5"
                style={{
                  background: 'hsl(220 8% 10% / 0.5)',
                  border: '1px solid hsl(220 8% 18% / 0.35)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="font-mono text-[11px] tracking-[3px] uppercase px-2 py-0.5 rounded"
                    style={{
                      background: 'hsl(220 8% 18% / 0.5)',
                      color: 'hsl(30 8% 55% / 0.6)',
                    }}
                  >
                    {layer.id}
                  </span>
                  <span className="font-serif text-base text-landing-cream/75">{layer.name}</span>
                </div>
                <p className="text-sm text-landing-muted/50 leading-relaxed">{layer.description}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-landing-muted/35 mt-4">
            <Link to="/pricing" className="underline underline-offset-2 hover:text-landing-muted/50 transition-colors">
              Full layer overview
            </Link>
          </p>
        </section>

        {/* Separator */}
        <div className="border-t mb-16" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }} />

        {/* Properties */}
        <section className="mb-16">
          <h2 className="font-serif text-xl text-landing-cream/75 mb-6">
            Properties of the proof
          </h2>
          <div className="space-y-4">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <h3 className="font-serif text-base text-landing-cream/70 mb-1">{prop.label}</h3>
                <p className="text-sm text-landing-muted/50 leading-relaxed">{prop.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Separator */}
        <div className="border-t mb-16" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }} />

        {/* Integration */}
        <section className="mb-16">
          <h2 className="font-serif text-xl text-landing-cream/75 mb-6">
            Integration
          </h2>
          <p className="text-sm text-landing-muted/50 leading-relaxed mb-4">
            A single API call at the moment of document creation or finalization.
            The hash is computed locally. The API returns an origin_id and a v1.3 certificate.
            After Bitcoin confirmation (approximately 20 minutes), the .ots proof is available
            for download.
          </p>
          <div
            className="rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto"
            style={{
              background: 'hsl(220 8% 8% / 0.8)',
              border: '1px solid hsl(220 8% 18% / 0.3)',
              color: 'hsl(30 8% 55% / 0.7)',
            }}
          >
            <pre>{`curl -X POST https://core.umarise.com/v1-core-origins \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "sha256_hex_of_document"}'`}</pre>
          </div>
          <p className="text-xs text-landing-muted/35 mt-4">
            <Link to="/api-reference" className="underline underline-offset-2 hover:text-landing-muted/50 transition-colors">
              API reference
            </Link>
            {' · '}
            <Link to="/technical" className="underline underline-offset-2 hover:text-landing-muted/50 transition-colors">
              Technical description
            </Link>
          </p>
        </section>

        {/* Bottom nav */}
        <section className="border-t py-10" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-landing-muted/50">
            <Link to="/pricing" className="hover:text-landing-muted/70 transition-colors">Pricing</Link>
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
