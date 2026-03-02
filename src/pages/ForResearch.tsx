import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Sector page: Research and Universities
 * Protocol tone. No workflow language. No marketing.
 * Anchoring as provenance infrastructure for research artifacts.
 */

const useCases = [
  {
    label: 'Lab notebooks and research notes',
    detail: 'Anchor observations, hypotheses, and experimental notes at the moment of recording. The hash establishes priority independent of any journal or institution.',
  },
  {
    label: 'Datasets and model checkpoints',
    detail: 'Record the exact state of a dataset or trained model at a specific point in time. Any subsequent modification is cryptographically visible.',
  },
  {
    label: 'Preprints and submitted manuscripts',
    detail: 'Anchor a manuscript before submission or public release. The proof is independent of the publisher, the preprint server, or the review process.',
  },
  {
    label: 'Code, scripts, and analysis pipelines',
    detail: 'Anchor commits, releases, or individual scripts. Establishes which version of an analysis existed at which moment.',
  },
  {
    label: 'Grant applications and project reports',
    detail: 'Record the content of a proposal or deliverable at the moment of submission. Useful for priority disputes and audit trails.',
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
    description: 'L1 plus a WebAuthn device-bound signature. The anchor is tied to a specific hardware key, establishing which device produced it.',
  },
  {
    id: 'L3',
    name: 'Identity',
    description: 'L2 plus verified identity binding. A principal investigator or PhD candidate can be formally linked to their anchors via KYC or institutional attestation.',
  },
];

const properties = [
  {
    label: 'Priority without publication',
    detail: 'An anchor establishes that specific research content existed at a specific moment. This does not require publication, peer review, or disclosure of the content itself.',
  },
  {
    label: 'Independent of institutions',
    detail: 'Verification runs against Bitcoin, not against a university, publisher, or Umarise. The proof remains valid regardless of institutional affiliation or access.',
  },
  {
    label: 'Tamper-evident',
    detail: 'Any modification to the original artifact breaks the SHA-256 hash. Data fabrication or post-hoc alteration is immediately and publicly detectable.',
  },
  {
    label: 'Content-agnostic',
    detail: 'The system records a hash, not content. Research data never leaves the device of the person who anchors it. No third party sees the original.',
  },
];

export default function ForResearch() {
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
            For research and universities
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.2] mb-6">
            <span className="text-landing-cream/90">Anchored provenance</span>
            <br />
            <span className="text-landing-copper">for research integrity.</span>
          </h1>
          <p className="text-base text-landing-muted/55 leading-relaxed max-w-xl">
            In an environment where datasets, analyses, and entire papers can be
            generated in minutes, proving that specific research content existed
            before a specific moment is increasingly difficult. Anchoring provides
            an external, verifiable record of priority and integrity.
          </p>
        </motion.section>

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

        <div className="border-t mb-16" style={{ borderColor: 'hsl(220 8% 18% / 0.25)' }} />

        {/* Integration */}
        <section className="mb-16">
          <h2 className="font-serif text-xl text-landing-cream/75 mb-6">
            Integration
          </h2>
          <p className="text-sm text-landing-muted/50 leading-relaxed mb-4">
            A single API call per artifact. The hash is computed locally on the researcher's
            device or CI server. The API returns an origin_id and a v1.3 certificate.
            After Bitcoin confirmation, the .ots proof is available for download.
          </p>
          <p className="text-sm text-landing-muted/50 leading-relaxed mb-4">
            Common integration points: git hooks (anchor every commit or release),
            electronic lab notebook exports, CI pipelines, and manual anchoring
            via the web interface.
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
  -d '{"hash": "sha256_hex_of_artifact"}'`}</pre>
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
            <Link to="/for/law" className="hover:text-landing-muted/70 transition-colors">Law and compliance</Link>
            <Link to="/pricing" className="hover:text-landing-muted/70 transition-colors">Pricing</Link>
            <Link to="/technical" className="hover:text-landing-muted/70 transition-colors">Technical</Link>
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
