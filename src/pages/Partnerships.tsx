import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Partnerships — public-facing contact page
 * Replaces pricing until pricing is finalized.
 * Protocol tone. No marketing.
 */
export default function Partnerships() {
  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream flex flex-col items-center px-6 md:px-8">
      <div className="w-full max-w-2xl flex flex-col min-h-[100dvh]">

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-landing-muted/45 hover:text-landing-muted/65 transition-colors mt-16 mb-20"
        >
          ↑ umarise.com
        </Link>

        <main className="flex-1 flex flex-col justify-center" style={{ paddingBottom: '25vh' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-8">
              <span className="text-landing-cream/90">Partnerships.</span>
            </h1>

            <p className="text-base text-landing-muted/60 leading-relaxed mb-2">
              Verification is free. Always.
            </p>
            <p className="text-base text-landing-muted/50 leading-relaxed mb-10">
              Attestation and API access pricing is being finalized.
            </p>

            <p className="text-base text-landing-muted/55 leading-relaxed">
              Interested?{' '}
              <a
                href="mailto:partners@umarise.com"
                className="text-landing-copper/80 hover:text-landing-copper transition-colors underline underline-offset-2"
              >
                partners@umarise.com
              </a>
            </p>
          </motion.div>
        </main>

        <footer className="border-t border-landing-muted/10 py-8 text-sm text-landing-muted/35">
          <span>&copy; {new Date().getFullYear()} Umarise</span>
        </footer>
      </div>
    </div>
  );
}
