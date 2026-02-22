import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * umarise.com/why — B2B
 * Museum aesthetic. 8 sections. No auth. No forms.
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
          <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-why-cream leading-tight mb-10">
            Systems cannot prove unaltered intake
          </h1>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              Every automated system records what it produces.
              Few record what they received - independently,
              before processing began.
            </p>
            <p>
              When a dispute arises, the question is not
              what the system generated.
              The question is what went in.
            </p>
            <p className="text-why-cream/55">
              Platform logs are internal.
              Internal logs are controlled by the platform.
              A controlled log is a weak witness.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 2 — The Provenance Gap */}
        <motion.section className="py-20 md:py-24" {...fade(0.05)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The gap C2PA does not fill
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              C2PA records who created something, with which device,
              through which edits.
            </p>
            <p>
              It does not record what existed at a specific moment
              before the workflow touched it.
            </p>
            <p>
              Metadata is embedded in the file.
              Embedded metadata is stripped on upload,
              compression, and format conversion.
            </p>
            <p className="text-why-cream/90">
              An external anchor is independent of the file.
              It cannot be stripped. It cannot be lost with the file.
              It records one thing: these bytes existed at this moment.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 3 — Automated Workflows */}
        <motion.section className="py-20 md:py-24" {...fade(0.1)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The provenance gap in automated workflows
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p className="text-why-cream">
              What was the exact input before AI processing began?
              <br />
              What did the file contain before your pipeline transformed it?
              <br />
              What existed before the model saw it?
            </p>
            <p>
              These questions matter for AI Act compliance,
              for audit trails, for dispute resolution.
            </p>
            <p>
              An anchor placed before processing creates
              an independent record of the input state -
              verifiable without the platform that processed it.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 4 — How it works */}
        <motion.section className="py-20 md:py-24" {...fade(0.15)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            How it works
          </h2>
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
              <pre className="bg-why-code rounded-md p-4 text-sm font-mono text-why-cream/85 overflow-x-auto whitespace-pre leading-relaxed border border-why-separator/8">
{`{
  "origin_id": "fb025c0e-...",
  "hash": "sha256:a1b2...",
  "proof_status": "pending",
  "captured_at": "2026-02-22T..."
}`}
              </pre>
            </div>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 5 — We step away */}
        <motion.section className="py-20 md:py-24" {...fade(0.2)}>
          <h2 className="font-playfair text-2xl md:text-3xl text-why-cream mb-10 font-light">
            We make the proof. Then we step away.
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              The .ots file is an open standard.
              Verification runs against Bitcoin, not our servers.
            </p>
            <p>
              If Umarise ceases to exist tomorrow,
              every proof issued remains independently verifiable.
            </p>
            <p className="text-why-cream/90">
              That is not a promise. That is the architecture.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 6 — One honest boundary */}
        <motion.section className="py-20 md:py-24" {...fade(0.25)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            One honest boundary
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6 border-l-2 border-why-gold/30 pl-8">
            <p>
              We must be trusted at intake - for one action:
              recording the correct hash at the correct moment.
            </p>
            <p>
              We cannot silently alter a recorded hash.
              The OTS proof is cryptographically bound to what was submitted.
              Any alteration would cause verification against Bitcoin to fail
              immediately and visibly.
            </p>
            <p>
              This is the difference between fully trustless
              and trust-minimized.
            </p>
            <p className="text-why-cream/55">
              We ask trust for one moment. After that moment,
              trust transfers to Bitcoin.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 7 — Interoperability */}
        <motion.section className="py-20 md:py-24" {...fade(0.3)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            SHA-256 is the standard
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              The hash is raw SHA-256 hex - no prefix required on input,
              sha256: prefix returned in response.
            </p>
            <p>
              Compatible with any system that can compute SHA-256.
              No SDK required. No proprietary format.
              The .ots proof format is open and verifiable
              by any OTS-compatible tool.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 8 — What Anchor Layer is not */}
        <motion.section className="py-20 md:py-24" {...fade(0.35)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            What Anchor Layer is not
          </h2>

          {/* Table */}
          <div className="grid grid-cols-2 gap-px bg-why-separator/10 rounded-md overflow-hidden mb-10 font-garamond">
            <div className="bg-why-code px-5 py-3 text-xs uppercase tracking-[0.15em] text-why-cream/50">
              What it proves
            </div>
            <div className="bg-why-code px-5 py-3 text-xs uppercase tracking-[0.15em] text-why-cream/50">
              What it does not prove
            </div>
            {[
              ['These exact bytes existed at this moment', 'Who created them'],
              ['Hash anchored in Bitcoin via OTS', 'That this is the first or only attestation'],
              ['.ots proof independently verifiable', 'That the content is original or unique'],
              ['Proof survives without Umarise', 'Legal ownership or authorship'],
            ].map(([proves, not], i) => (
              <Fragment key={i}>
                <div className="bg-why-bg px-5 py-4 text-why-cream/80 text-base leading-relaxed">
                  {proves}
                </div>
                <div className="bg-why-bg px-5 py-4 text-why-cream/50 text-base leading-relaxed">
                  {not}
                </div>
              </Fragment>
            ))}
          </div>

          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/70 space-y-4">
            <p>
              Anchor Layer is a chronological primitive.
              It records existence at a moment in time.
              Nothing more. That precision is intentional.
            </p>
          </div>
        </motion.section>

        {/* CTAs */}
        <motion.section className="py-20 md:py-28 flex flex-col sm:flex-row items-center justify-center gap-6" {...fade(0.4)}>
          <Link
            to="/api-reference"
            className="inline-flex items-center gap-2 font-garamond text-lg text-why-cream/80 hover:text-why-cream transition-colors border border-why-separator/20 px-6 py-3 rounded-md hover:border-why-separator/40"
          >
            API reference <span className="text-why-gold">→</span>
          </Link>
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 font-garamond text-lg text-why-gold hover:text-why-gold/80 transition-colors border border-why-gold/25 px-6 py-3 rounded-md hover:border-why-gold/50"
          >
            Request access <span>→</span>
          </Link>
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
