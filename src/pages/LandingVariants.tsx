import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useState } from 'react';

/**
 * Landing page variants voor fingerprint integratie
 * 3 elegante opties ter vergelijking
 */
export default function LandingVariants() {
  const [activeVariant, setActiveVariant] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      {/* Variant selector */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-landing-deep/80 backdrop-blur-sm border border-landing-muted/20 rounded-full px-2 py-1">
        {[1, 2, 3].map((v) => (
          <button
            key={v}
            onClick={() => setActiveVariant(v as 1 | 2 | 3)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              activeVariant === v
                ? 'bg-landing-copper/20 text-landing-copper'
                : 'text-landing-muted/60 hover:text-landing-muted'
            }`}
          >
            Variant {v}
          </button>
        ))}
      </div>

      {/* Variant label */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-center">
        <p className="text-xs text-landing-muted/50 tracking-wide">
          {activeVariant === 1 && 'Fingerprint als accent rechts'}
          {activeVariant === 2 && 'Fingerprint vervangt punt na Origins'}
          {activeVariant === 3 && 'Fingerprint als watermark achtergrond'}
        </p>
      </div>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(25 35% 42% / 0.2) 0%, transparent 70%)'
          }}
        />
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

        {/* Variant 3: Watermark */}
        {activeVariant === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Fingerprint 
              className="text-landing-copper/[0.04]" 
              size={600} 
              strokeWidth={0.5}
            />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 md:px-8">
          <div className="max-w-3xl text-center">
            
            {/* Variant 1: Accent rechts */}
            {activeVariant === 1 && (
              <motion.div
                key="v1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-16 md:mb-20">
                  <span className="text-landing-cream">Umarise.</span>
                  <br />
                  <span className="text-landing-copper inline-flex items-baseline gap-4">
                    Origins.
                    <Fingerprint 
                      className="text-landing-copper/30 translate-y-1" 
                      size={32} 
                      strokeWidth={1.5}
                    />
                  </span>
                </h1>
              </motion.div>
            )}

            {/* Variant 2: Punt vervangen */}
            {activeVariant === 2 && (
              <motion.div
                key="v2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-16 md:mb-20">
                  <span className="text-landing-cream">Umarise.</span>
                  <br />
                  <span className="text-landing-copper inline-flex items-baseline">
                    Origins
                    <Fingerprint 
                      className="text-landing-copper/60 ml-1" 
                      size={20} 
                      strokeWidth={2}
                    />
                  </span>
                </h1>
              </motion.div>
            )}

            {/* Variant 3: Watermark (headline normaal) */}
            {activeVariant === 3 && (
              <motion.div
                key="v3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-16 md:mb-20">
                  <span className="text-landing-cream">Umarise.</span>
                  <br />
                  <span className="text-landing-copper">Origins.</span>
                </h1>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-sm tracking-wide text-landing-copper/70">
                Integration Intake →
              </span>
            </motion.div>
          </div>
        </main>

        {/* Footer hint */}
        <footer className="p-6 text-center">
          <p className="text-xs text-landing-muted/40">
            Klik bovenaan om tussen varianten te wisselen
          </p>
        </footer>
      </div>
    </div>
  );
}
