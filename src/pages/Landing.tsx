import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Umarise B2B Landing Page
 * Minimalist, infrastructure-grade positioning
 * Designed for umarise.com (main domain)
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream overflow-hidden relative">
      {/* Abstract background - cosmic/genesis aesthetic */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial gradient - origin point */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(42 70% 50% / 0.3) 0%, transparent 70%)'
          }}
        />
        
        {/* Subtle grid lines - infrastructure hint */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(42 70% 50%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(42 70% 50%) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-8">
          <div className="max-w-3xl text-center">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight mb-16 md:mb-20"
            >
              <span className="text-landing-cream">Umarise.</span>
              <br />
              <span className="text-landing-gold">Origins.</span>
            </motion.h1>


            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <a
                href="mailto:hello@umarise.com?subject=Partner%20Inquiry"
                className="inline-flex items-center gap-3 px-6 py-3 bg-landing-gold/10 border border-landing-gold/30 rounded-full text-landing-gold hover:bg-landing-gold/20 hover:border-landing-gold/50 transition-all duration-300 group"
              >
                <span className="text-sm tracking-wide uppercase">Partner Inquiry</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 text-landing-muted text-sm"
          >
            <p className="opacity-50">
              © {new Date().getFullYear()} Umarise
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="/app" 
                className="opacity-30 hover:opacity-60 transition-opacity text-xs"
                title="Pilot Demo"
              >
                pilot
              </a>
              <p className="opacity-50">
                Verifiable origins for the programmatic age
              </p>
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}
