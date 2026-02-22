import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * anchoring.app/why — B2C
 * Museum aesthetic. 6 sections. No auth. No forms.
 */
export default function AnchoringWhy() {
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
          <span className="font-playfair text-lg text-why-cream/60">anchoring.app</span>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6">

        {/* SECTION 1 — Opening */}
        <motion.section
          className="py-20 md:py-32 text-center"
          {...fade()}
        >
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-why-cream leading-tight mb-6">
            We make the proof.
            <br />
            Then we step away.
          </h1>
          <p className="font-garamond text-lg md:text-xl text-why-gold italic">
            What you anchor is yours. Not ours to guard, access, or revoke.
          </p>
        </motion.section>

        {/* SECTION 2 — What happens when you anchor */}
        <motion.section className="py-20 md:py-24" {...fade(0.1)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-12 font-light">
            What happens when you anchor
          </h2>

          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                n: '1',
                text: 'Your file is hashed in your browser. It never leaves your device.',
              },
              {
                n: '2',
                text: 'The hash is sent to our API. We record it and anchor it to Bitcoin via OpenTimestamps.',
              },
              {
                n: '3',
                text: 'You receive a ZIP. It contains everything needed to verify the proof \u2014 without us, without an account, without a server.',
              },
            ].map((step) => (
              <div key={step.n}>
                <span className="font-playfair text-3xl text-why-gold/80 block mb-3">
                  {step.n}
                </span>
                <p className="font-garamond text-lg leading-relaxed text-why-cream/80">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 3 — What you get */}
        <motion.section className="py-20 md:py-24" {...fade(0.15)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            What you get
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              A ZIP file that is yours.
              Inside: your original file, a certificate, and an OTS proof.
            </p>
            <p>
              The OTS proof is an open standard.
              Anyone can verify it against Bitcoin.
              No account. No Umarise server. No expiry.
            </p>
            <p className="text-why-cream/90">
              If we stop existing tomorrow, your proof remains valid.
              That is not a promise. That is how it is built.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 4 — Why it is free */}
        <motion.section className="py-20 md:py-24" {...fade(0.2)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            Why it is free
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              After we issue the proof, there is nothing left for us to manage.
            </p>
            <p>
              No file stored. No account to maintain. No certificate to host.
              The marginal cost of one more anchor approaches zero.
            </p>
            <p className="text-why-cream/60">
              Free is not a strategy. It is the result of minimal dependency.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 5 — One thing we ask you to trust */}
        <motion.section className="py-20 md:py-24" {...fade(0.25)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            One thing we ask you to trust
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6 border-l-2 border-why-gold/30 pl-8">
            <p>
              We record the correct hash at the correct moment.
              That is the one action that requires trusting us.
            </p>
            <p>
              After that, the trust transfers to Bitcoin.
            </p>
            <p>
              You can verify this yourself: calculate the SHA-256 hash
              of your original file and compare it with the hash
              in your certificate. They will match, or the proof is invalid.
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-why-separator/12 w-full" />

        {/* SECTION 6 — The test */}
        <motion.section className="py-20 md:py-24" {...fade(0.3)}>
          <h2 className="text-why-cream/50 text-xs uppercase tracking-[0.2em] mb-10 font-light">
            The test we apply to every decision
          </h2>
          <div className="font-garamond text-lg md:text-xl leading-[1.8] text-why-cream/80 space-y-6">
            <p>
              Does this choice make you dependent on Umarise
              for the validity of your proof?
            </p>
            <p className="text-why-cream">
              If yes, we do not build it.
            </p>
            <p className="text-why-cream/50">
              That constraint is not marketing.
              It is a limit we place on ourselves.
            </p>
          </div>
        </motion.section>

        {/* Footer tagline */}
        <motion.section className="py-24 md:py-32 text-center" {...fade(0.35)}>
          <p className="font-playfair text-2xl md:text-3xl text-why-gold tracking-wide mb-8">
            Drop. Save. Verify. Optional.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-garamond text-lg text-why-cream/70 hover:text-why-cream transition-colors"
          >
            Anchor something
            <span className="text-why-gold">→</span>
          </Link>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-why-separator/10 py-8 text-center">
        <p className="text-[10px] text-why-cream/20 tracking-[0.25em] uppercase font-light">
          © {new Date().getFullYear()} anchoring.app
        </p>
      </footer>
    </div>
  );
}
