import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * umarise.com/why — B2B
 * Museum aesthetic. 10 sections + CTA. No auth. No forms.
 * Source: docs/umarise-why-b2b-final.md
 */
export default function Why() {
  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' as const },
  });

  return (
    <div className="min-h-screen bg-why-bg text-why-cream selection:bg-why-gold/20">
      {/* Header */}
      <header className="border-b border-why-separator/10">
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-why-cream/40 hover:text-why-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-garamond">Back</span>
          </Link>
          <span className="font-playfair text-lg text-why-cream/60">Umarise</span>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6">

        {/* SECTION 1 — Context */}
        <motion.section className="py-20 md:py-28" {...fade()}>
          <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-why-cream leading-tight mb-4">
            Why Anchor Attestation
          </h1>
          <p className="font-garamond text-lg text-why-gold italic mb-12">
            Strategic context and trust model for technical integrations.
          </p>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              Systems that process data cannot prove they received it unaltered.
            </p>
            <p>
              Internal logs, timestamps, and signatures are self-attested. They prove
              what the system claims - not what actually existed before the system
              touched it.
            </p>
            <p>
              This becomes critical in automated workflows. When an AI model reviews
              a contract, analyzes an image, or ingests a dataset, no human witnesses
              what went in. The output is visible. The input is not independently
              verifiable.
            </p>
            <p className="text-why-cream/55">
              When disputes arise, when audits occur, when provenance matters -
              internal evidence is insufficient. Not because it is false. Because it
              is self-attested by the party with an interest in the outcome.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 2 — The Problem */}
        <motion.section className="py-20 md:py-24" {...fade(0.05)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The Problem
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              The service that generates proof also controls the confirmation of that
              proof.
            </p>
            <p>
              Certificates live in dashboards. Validation runs through private
              endpoints. Access requires accounts. The proof is bound to the
              infrastructure that issued it.
            </p>
            <p className="text-why-cream/55">
              This is not bad intention. It is the dominant architectural model.
              And it means that proof depends on the continued goodwill and existence
              of the party that issued it.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 3 — The Shift */}
        <motion.section className="py-20 md:py-24" {...fade(0.1)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The Shift
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              Regulatory frameworks increasingly require demonstrable data provenance
              from independent sources.
            </p>
            <p>
              The EU AI Act requires traceability for high-risk AI systems, including
              training data governance. C2PA defines content authenticity standards
              for media provenance. eIDAS 2.0 establishes qualified timestamps for
              legal validity.
            </p>
            <p className="text-why-cream/90">
              These frameworks share a structural requirement: proof of what existed,
              when, from a source that is independent of the processing system.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 4 — The Gap */}
        <motion.section className="py-20 md:py-24" {...fade(0.15)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The Gap
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              Content authenticity standards like C2PA address the lifecycle of
              media content.
            </p>
            <p>
              But what about the moment before processing? What existed at intake,
              before any system touched it?
            </p>
            <p className="text-why-cream/90">
              Anchor attestation addresses this gap. It records what existed at a
              specific moment - verifiable, independent of the system that processed
              it, independent of Umarise itself.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 5 — Automated Workflows */}
        <motion.section className="py-20 md:py-24" {...fade(0.2)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The provenance gap in automated workflows
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p className="text-why-cream">
              What was the exact input before the system processed it?
            </p>
            <p>
              A contract reviewed by AI. A dataset ingested by a model. An image
              processed by an automated pipeline. In each case, the system produces
              output. The original input has no independent record.
            </p>
            <p>
              Anchor attestation provides that record. A SHA-256 hash computed at
              the moment of intake establishes what existed at that point in time.
              The proof is anchored externally and verifiable without trusting the
              processing system.
            </p>
            <p className="text-why-cream/55">
              This is not a feature of the processing system. It is independent
              infrastructure - the same way a qualified timestamp from a
              Time-Stamping Authority is independent of the system that requests it.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 6 — How it works */}
        <motion.section className="py-20 md:py-24" {...fade(0.25)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            How it works
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6 mb-10">
            <p>
              Data enters a system. A SHA-256 hash is computed at the moment of
              entry. The hash is submitted to Core via a single API call. The hash
              is anchored via OpenTimestamps to Bitcoin — our current ledger. The architecture is ledger-agnostic by design. The resulting proof is
              independently verifiable against Bitcoin — without Umarise, without
              an account, without an expiry.
            </p>
            <p className="text-why-cream/50 text-sm mt-2">
              Umarise uses the Bitcoin blockchain as a public, immutable timestamp ledger — not as a currency. No wallets, no coins, no financial transactions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Steps */}
            <div className="space-y-6">
              {[
                'Hash the input - SHA-256, computed before processing',
                'POST to /v1-core-origins with your API key',
                'Receive origin_id and proof_status: pending',
                'After ~20 minutes: anchored in Bitcoin via OTS',
                'Download .ots proof - independently verifiable',
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="font-playfair text-xl text-why-gold/70 shrink-0 w-6 text-right">
                    {i + 1}
                  </span>
                  <p className="font-garamond text-base md:text-lg leading-relaxed text-why-cream/80">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Code */}
            <div className="space-y-4">
              <pre className="bg-why-code rounded-md p-4 text-sm font-mono text-why-cream/85 overflow-x-auto whitespace-pre leading-relaxed border border-why-separator/8">
{`curl -X POST \\
  https://core.umarise.com/v1-core-origins \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "sha256_hex_of_input"}'`}
              </pre>
              <p className="font-garamond text-sm text-why-cream/50">
                Response includes origin_id, captured_at, and proof_status.
                After approximately 20 minutes: anchored in Bitcoin. The .ots proof
                is downloadable and verifiable by any OTS-compatible tool.
              </p>
            </div>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 7 — We step away */}
        <motion.section className="py-20 md:py-24" {...fade(0.3)}>
          <h2 className="font-playfair text-2xl md:text-3xl text-why-cream mb-10 font-light">
            We make the proof. Then we step away.
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              The .ots file is an open standard.
              Verification runs against Bitcoin, not our servers.
              If Umarise ceases to exist, every proof issued remains
              independently verifiable.
            </p>
            <p className="text-why-cream/90">
              That is not a promise. It is the architecture.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 8 — One honest boundary */}
        <motion.section className="py-20 md:py-24" {...fade(0.35)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            One honest boundary
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6 border-l-2 border-why-gold/30 pl-8">
            <p>
              We must be trusted at intake - for one action: recording the correct
              hash at the correct moment.
            </p>
            <p>
              We cannot silently alter a recorded hash. The OTS proof is
              cryptographically bound to what was submitted. Any alteration would
              cause verification against Bitcoin to fail immediately and visibly.
            </p>
            <p className="text-why-cream/55">
              This is the difference between permanent trust and trust at one moment.
              We ask for the latter.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 9 — Interoperability */}
        <motion.section className="py-20 md:py-24" {...fade(0.4)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            Interoperability
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              Anchor attestation uses SHA-256 - the same hash algorithm used by
              C2PA, Git, Bitcoin, and most content-addressable systems.
            </p>
            <p>
              An anchor attestation can serve as the chronological root of a C2PA
              provenance chain, or as an independent anchor for any system that
              computes SHA-256 hashes. No proprietary format. No SDK required for
              verification.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 10 — What Anchor Layer is not */}
        <motion.section className="py-20 md:py-24" {...fade(0.45)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            What the Anchor Layer is not
          </h2>

          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6 mb-10">
            <p>
              The anchor layer does not manage content, authenticate media, enforce
              governance, or replace internal logging.
            </p>
            <p className="text-why-cream/90">
              It records one fact: these exact bytes existed at this moment in time.
              What you do with that fact is yours.
            </p>
          </div>

          {/* Table */}
          <div className="grid grid-cols-2 gap-px bg-why-separator/10 rounded-md overflow-hidden font-garamond">
            <div className="bg-why-code px-5 py-3 text-xs uppercase tracking-[0.15em] text-why-cream/50">
              What it records
            </div>
            <div className="bg-why-code px-5 py-3 text-xs uppercase tracking-[0.15em] text-why-cream/50">
              What it does not record
            </div>
            {[
              ['These exact bytes existed at this moment', 'Who created them'],
              ['Hash anchored in Bitcoin via OTS', 'That this is the first attestation globally'],
              ['Proof independently verifiable', 'That the content is original or unique'],
              ['Proof survives without Umarise', 'Legal ownership or authorship'],
            ].map(([records, not], i) => (
              <Fragment key={i}>
                <div className="bg-why-bg px-5 py-4 text-why-cream/80 text-base leading-relaxed">
                  {records}
                </div>
                <div className="bg-why-bg px-5 py-4 text-why-cream/50 text-base leading-relaxed">
                  {not}
                </div>
              </Fragment>
            ))}
          </div>
        </motion.section>

        {/* CTAs — Integration reference */}
        <motion.section className="py-20 md:py-28 text-center" {...fade(0.5)}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/api-reference"
              className="inline-flex items-center gap-2 font-garamond text-lg text-why-cream/80 hover:text-why-cream transition-colors border border-why-separator/20 px-6 py-3 rounded-md hover:border-why-separator/40"
            >
              API reference <span className="text-why-gold">→</span>
            </Link>
            <a
              href="mailto:partners@umarise.com"
              className="inline-flex items-center gap-2 font-garamond text-lg text-why-gold hover:text-why-gold/80 transition-colors border border-why-gold/25 px-6 py-3 rounded-md hover:border-why-gold/50"
            >
              partners@umarise.com
            </a>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-why-separator/10 py-8 text-center">
        <p className="text-[10px] text-why-cream/20 tracking-[0.25em] uppercase font-light">
          © {new Date().getFullYear()} Umarise
        </p>
      </footer>
    </div>
  );
}
