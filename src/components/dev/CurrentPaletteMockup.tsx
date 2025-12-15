import { motion } from 'framer-motion';
import { BookOpen, Camera, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Current Palette Mockup - Preview of existing design
 * Forest greens, gold accents, cream tones
 */
export function CurrentPaletteMockup() {
  // Current palette colors (matching index.css)
  const currentColors = {
    // Deep ink (current dark bg)
    inkDeep: 'hsl(160, 30%, 8%)',
    // Forest deep
    forestDeep: 'hsl(160, 25%, 12%)',
    // Forest
    forest: 'hsl(165, 20%, 18%)',
    // Gold/amber accent
    gold: 'hsl(42, 70%, 50%)',
    // Cream
    cream: 'hsl(42, 35%, 90%)',
    // Teal
    teal: 'hsl(175, 35%, 35%)',
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: `linear-gradient(180deg, ${currentColors.inkDeep} 0%, ${currentColors.forestDeep} 50%, ${currentColors.forest} 100%)` 
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
            style={{ color: currentColors.gold }}
          >
            Umarise
          </h1>
          <p 
            className="text-sm"
            style={{ color: currentColors.cream, opacity: 0.7 }}
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
              background: `linear-gradient(135deg, ${currentColors.forestDeep} 0%, ${currentColors.forest} 100%)`,
              border: `1px solid ${currentColors.gold}40`
            }}
          >
            {/* Glowing portal representation */}
            <div 
              className="w-32 h-32 mx-auto rounded-full mb-6 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${currentColors.gold}30 0%, transparent 70%)`,
                border: `2px solid ${currentColors.gold}`,
                boxShadow: `0 0 40px ${currentColors.gold}40`
              }}
            >
              <Camera className="w-10 h-10" style={{ color: currentColors.gold }} />
            </div>
            
            <h2 
              className="font-serif text-xl mb-2"
              style={{ color: currentColors.cream }}
            >
              Capture your handwriting
            </h2>
            <p 
              className="text-sm"
              style={{ color: currentColors.cream, opacity: 0.6 }}
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
            { icon: BookOpen, label: 'Your Memory', desc: 'All your pages' },
            { icon: Sparkles, label: 'Patterns', desc: 'Discover themes' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ 
                background: currentColors.forestDeep,
                border: `1px solid ${currentColors.gold}30`
              }}
            >
              <Icon className="w-6 h-6 mb-2" style={{ color: currentColors.gold }} />
              <p className="font-medium text-sm" style={{ color: currentColors.cream }}>{label}</p>
              <p className="text-xs" style={{ color: currentColors.cream, opacity: 0.5 }}>{desc}</p>
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
            background: currentColors.forest,
            border: `1px solid ${currentColors.gold}40`
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-16 h-20 rounded-lg flex-shrink-0"
              style={{ background: currentColors.cream, opacity: 0.8 }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: currentColors.cream }}>
                Part of your lasting memory
              </p>
              <p className="text-xs mb-2" style={{ color: currentColors.cream, opacity: 0.6 }}>
                Janet Skeslien Charles inspireert over bibliotheken...
              </p>
              <div className="flex gap-2">
                <span 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ 
                    background: `${currentColors.gold}30`,
                    color: currentColors.gold 
                  }}
                >
                  books
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ 
                    background: `${currentColors.teal}30`,
                    color: currentColors.teal 
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
          <p className="text-xs mb-3" style={{ color: currentColors.cream, opacity: 0.5 }}>
            Current Palette (Forest + Gold)
          </p>
          <div className="flex justify-center gap-2">
            {Object.entries(currentColors).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                  style={{ background: color }}
                />
                <p className="text-[8px] mt-1" style={{ color: currentColors.cream, opacity: 0.4 }}>
                  {name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link 
            to="/warm-preview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ 
              background: 'hsl(38, 65%, 50%)',
              color: 'hsl(25, 35%, 12%)'
            }}
          >
            View Warm Palette →
          </Link>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ 
              background: currentColors.gold,
              color: currentColors.inkDeep
            }}
          >
            ← Back to app
          </Link>
        </motion.div>
      </div>
    </div>
  );
}