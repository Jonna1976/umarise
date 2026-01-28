import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Color comparison page for landing page accent colors
 * Temporary dev page to compare variants
 */

const variants = [
  {
    name: 'Warm Gold (huidige)',
    accent: 'hsl(42, 70%, 50%)',
    accentMuted: 'hsl(42, 70%, 50% / 0.1)',
    accentBorder: 'hsl(42, 70%, 50% / 0.3)',
    accentBorderHover: 'hsl(42, 70%, 50% / 0.5)',
    description: 'Warm, menselijk, genesis-gevoel'
  },
  {
    name: 'Champagne Gold (koeler)',
    accent: 'hsl(45, 30%, 65%)',
    accentMuted: 'hsl(45, 30%, 65% / 0.1)',
    accentBorder: 'hsl(45, 30%, 65% / 0.3)',
    accentBorderHover: 'hsl(45, 30%, 65% / 0.5)',
    description: 'Koeler, technischer, platinum-achtig'
  },
  {
    name: 'Pure White',
    accent: 'hsl(0, 0%, 95%)',
    accentMuted: 'hsl(0, 0%, 95% / 0.08)',
    accentBorder: 'hsl(0, 0%, 95% / 0.2)',
    accentBorderHover: 'hsl(0, 0%, 95% / 0.4)',
    description: 'Maximaal minimalistisch, Stripe-style'
  }
];

function LandingVariant({ variant }: { variant: typeof variants[0] }) {
  return (
    <div className="flex-1 min-w-[280px] bg-[hsl(220,20%,6%)] rounded-lg overflow-hidden">
      {/* Label */}
      <div className="p-3 border-b border-white/10">
        <p className="text-white/90 text-sm font-medium">{variant.name}</p>
        <p className="text-white/50 text-xs">{variant.description}</p>
      </div>
      
      {/* Preview */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] relative">
        {/* Subtle glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full opacity-20 blur-3xl"
          style={{ background: variant.accent }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">
            <span className="text-[hsl(42,20%,92%)]">Umarise.</span>
            <br />
            <span style={{ color: variant.accent }}>Origins.</span>
          </h2>
          
          <p className="text-[hsl(42,10%,60%)] text-xs tracking-wide mb-4">
            Proof of origin. Programmatically.
          </p>
          
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-wide uppercase transition-all duration-300"
            style={{
              backgroundColor: variant.accentMuted,
              borderWidth: 1,
              borderColor: variant.accentBorder,
              color: variant.accent
            }}
          >
            <span>Partner Inquiry</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Color swatch */}
      <div className="p-3 border-t border-white/10 flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded-full border border-white/20"
          style={{ backgroundColor: variant.accent }}
        />
        <code className="text-white/60 text-xs font-mono">
          {variant.accent.replace('hsl(', '').replace(')', '')}
        </code>
      </div>
    </div>
  );
}

export default function ColorCompare() {
  return (
    <div className="min-h-screen bg-[hsl(220,15%,10%)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-white font-serif text-2xl mb-2">
            Landing Page Color Variants
          </h1>
          <p className="text-white/50 text-sm">
            Vergelijk de drie accentkleuren voor de landing page
          </p>
        </motion.div>
        
        {/* Variants grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          {variants.map((variant, i) => (
            <motion.div
              key={variant.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex-1 min-w-[280px]"
            >
              <LandingVariant variant={variant} />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a 
            href="/"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            ← Terug naar landing
          </a>
        </motion.div>
      </div>
    </div>
  );
}
