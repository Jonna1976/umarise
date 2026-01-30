import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
        {/* Subtle radial warmth - infrastructure presence */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(25 35% 42% / 0.2) 0%, transparent 70%)'
          }}
        />
        
        {/* Minimal grid - archival structure */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(25 20% 40%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(25 20% 40%) 1px, transparent 1px)
            `,
            backgroundSize: '120px 120px'
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
              className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-16 md:mb-20"
            >
              <span className="text-landing-cream">Umarise.</span>
              <br />
              <span className="text-landing-copper">Origins.</span>
            </motion.h1>


            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <a
                href="mailto:partners@umarise.com?subject=Partner%20Inquiry"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-landing-copper/70 hover:text-landing-copper transition-colors duration-300 group"
              >
                <span className="text-sm tracking-wide">Partner Inquiry</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </a>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 md:p-8 border-t border-landing-muted/10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm"
          >
            {/* Copyright */}
            <p className="text-landing-muted/50">
              © {new Date().getFullYear()} Umarise
            </p>
            
            {/* Origin Flow link */}
            <Link
              to="/origin-flow"
              className="group flex flex-col items-center md:items-end gap-0.5"
            >
              <span className="text-landing-copper/70 hover:text-landing-copper transition-colors flex items-center gap-1.5">
                Origin Flow
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
              <span className="text-[10px] text-landing-muted/40">
                See how verifiable origin works at the API level.
              </span>
            </Link>
            
            {/* Legal links */}
            <div className="flex items-center gap-4 text-landing-muted/40">
              <Link to="/privacy" className="hover:text-landing-muted/60 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-landing-muted/60 transition-colors">Terms</Link>
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}
