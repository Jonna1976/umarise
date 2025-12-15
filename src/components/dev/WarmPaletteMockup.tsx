import { motion } from 'framer-motion';
import { BookOpen, Camera, Sparkles, Clock } from 'lucide-react';

/**
 * Warm Palette Mockup - Preview only
 * Inspired by "Le Bibliotecarie di Notre-Dame" book cover
 * Warm wood browns, amber, ochre, cream tones
 */
export function WarmPaletteMockup() {
  // Warm palette colors (inline for mockup only)
  const warmColors = {
    // Deep warm brown (like aged wood/bookshelves)
    inkDeep: 'hsl(25, 35%, 12%)',
    // Medium warm brown
    wood: 'hsl(28, 30%, 20%)',
    // Warm amber/gold (like window light)
    amber: 'hsl(38, 65%, 50%)',
    // Soft cream (like book pages)
    cream: 'hsl(40, 35%, 90%)',
    // Rich ochre (like the dress)
    ochre: 'hsl(35, 55%, 45%)',
    // Sepia tone
    sepia: 'hsl(30, 40%, 30%)',
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: `linear-gradient(180deg, ${warmColors.inkDeep} 0%, ${warmColors.wood} 50%, ${warmColors.sepia} 100%)` 
      }}
    >
      {/* Header */}
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 
            className="font-serif text-3xl tracking-wide mb-2"
            style={{ color: warmColors.amber }}
          >
            Umarise
          </h1>
          <p 
            className="text-sm"
            style={{ color: warmColors.cream, opacity: 0.7 }}
          >
            Your lasting memory
          </p>
        </motion.div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div 
            className="rounded-2xl p-8 text-center"
            style={{ 
              background: `linear-gradient(135deg, ${warmColors.wood} 0%, ${warmColors.sepia} 100%)`,
              border: `1px solid ${warmColors.amber}40`
            }}
          >
            {/* Glowing portal representation */}
            <div 
              className="w-32 h-32 mx-auto rounded-full mb-6 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${warmColors.amber}30 0%, transparent 70%)`,
                border: `2px solid ${warmColors.amber}`,
                boxShadow: `0 0 40px ${warmColors.amber}40`
              }}
            >
              <Camera className="w-10 h-10" style={{ color: warmColors.amber }} />
            </div>
            
            <h2 
              className="font-serif text-xl mb-2"
              style={{ color: warmColors.cream }}
            >
              Capture your handwriting
            </h2>
            <p 
              className="text-sm"
              style={{ color: warmColors.cream, opacity: 0.6 }}
            >
              Transform notes into lasting memories
            </p>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {[
            { icon: BookOpen, label: 'Your Codex', desc: 'All your pages' },
            { icon: Sparkles, label: 'Patterns', desc: 'Discover themes' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ 
                background: warmColors.wood,
                border: `1px solid ${warmColors.amber}30`
              }}
            >
              <Icon className="w-6 h-6 mb-2" style={{ color: warmColors.amber }} />
              <p className="font-medium text-sm" style={{ color: warmColors.cream }}>{label}</p>
              <p className="text-xs" style={{ color: warmColors.cream, opacity: 0.5 }}>{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Sample snapshot card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-4 mb-8"
          style={{ 
            background: warmColors.sepia,
            border: `1px solid ${warmColors.amber}40`
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-16 h-20 rounded-lg flex-shrink-0"
              style={{ background: warmColors.cream, opacity: 0.8 }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: warmColors.cream }}>
                Part of your lasting memory
              </p>
              <p className="text-xs mb-2" style={{ color: warmColors.cream, opacity: 0.6 }}>
                Janet Skeslien Charles inspireert over bibliotheken...
              </p>
              <div className="flex gap-2">
                <span 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ 
                    background: `${warmColors.amber}30`,
                    color: warmColors.amber 
                  }}
                >
                  books
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ 
                    background: `${warmColors.amber}30`,
                    color: warmColors.amber 
                  }}
                >
                  inspiration
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Color palette reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xs mb-3" style={{ color: warmColors.cream, opacity: 0.5 }}>
            Warm Palette Preview
          </p>
          <div className="flex justify-center gap-2">
            {Object.entries(warmColors).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                  style={{ background: color }}
                />
                <p className="text-[8px] mt-1" style={{ color: warmColors.cream, opacity: 0.4 }}>
                  {name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ 
              background: warmColors.amber,
              color: warmColors.inkDeep
            }}
          >
            ← Back to current design
          </a>
        </motion.div>
      </div>
    </div>
  );
}