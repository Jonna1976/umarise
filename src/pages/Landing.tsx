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
      <div className="relative z-10 min-h-[100dvh] flex flex-col">

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
              <Link
                to="/intake"
                className="text-sm tracking-wide text-landing-copper/70 hover:text-landing-copper transition-colors duration-300"
              >
                Integration Intake →
              </Link>
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
            
            {/* Technical links */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <Link
                to="/origin-flow"
                className="text-landing-copper/70 hover:text-landing-copper transition-colors"
              >
                Origin Flow
              </Link>
              <Link
                to="/cto-overview"
                className="text-landing-copper/70 hover:text-landing-copper transition-colors"
              >
                CTO Overview
              </Link>
            </div>
            
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
