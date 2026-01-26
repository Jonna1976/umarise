import { motion } from 'framer-motion';
import { Sparkles, Hash, Search, BookOpen, ShieldCheck, Camera } from 'lucide-react';

// Step 1: Lens - Record what exists
export function LensIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep via-forest to-forest-deep flex flex-col items-center justify-center p-6 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Viewfinder corners */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-oker/60 rounded-tl" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-oker/60 rounded-tr" />
      <div className="absolute bottom-20 left-6 w-8 h-8 border-b-2 border-l-2 border-oker/60 rounded-bl" />
      <div className="absolute bottom-20 right-6 w-8 h-8 border-b-2 border-r-2 border-oker/60 rounded-br" />
      
      {/* Scanning line */}
      <motion.div 
        className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-oker/50 to-transparent"
        initial={{ top: '10%' }}
        animate={{ top: ['10%', '70%', '10%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Shutter button */}
      <motion.div 
        className="absolute bottom-4 w-14 h-14 rounded-full border-[3px] border-oker flex items-center justify-center"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-oker/30"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// Step 2: Capture - Preserve original state
export function CaptureIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep via-forest to-forest-deep flex flex-col items-center justify-center p-4 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glowing portal circle */}
      <motion.div 
        className="relative w-24 h-24 rounded-full flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 30px 10px hsla(38, 70%, 50%, 0.15)',
            '0 0 50px 20px hsla(38, 70%, 50%, 0.3)',
            '0 0 30px 10px hsla(38, 70%, 50%, 0.15)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-oker/40"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <div className="w-16 h-16 rounded-full bg-oker/20 border border-oker/30 flex items-center justify-center">
          <Camera className="w-6 h-6 text-oker/60" />
        </div>
      </motion.div>
      
      {/* Status text */}
      <motion.p 
        className="mt-4 text-[10px] text-cream/70 text-center font-mono tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        PRESERVING...
      </motion.p>
    </motion.div>
  );
}

// Step 3: Seal - Hash computed, cues assigned
export function SealIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep to-forest flex flex-col items-center justify-center p-4 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hash icon with seal animation */}
      <motion.div 
        className="w-20 h-20 rounded-full bg-oker/20 border-2 border-oker/50 flex items-center justify-center relative"
        animate={{ 
          boxShadow: [
            '0 0 0 0 hsla(38, 70%, 50%, 0)',
            '0 0 20px 10px hsla(38, 70%, 50%, 0.3)',
            '0 0 0 0 hsla(38, 70%, 50%, 0)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Hash className="w-8 h-8 text-oker" />
        
        {/* Seal stamp effect */}
        <motion.div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-oker flex items-center justify-center"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <span className="text-[8px] text-forest-deep font-bold">✓</span>
        </motion.div>
      </motion.div>
      
      {/* Hash preview */}
      <motion.div
        className="mt-4 px-3 py-1.5 rounded bg-forest/50 border border-cream/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-[8px] text-cream/50 font-mono">SHA-256</p>
        <p className="text-[9px] text-oker font-mono tracking-tight">a7f3c2e1...</p>
      </motion.div>
      
      {/* Cue hint */}
      <motion.p
        className="mt-3 text-[10px] text-cream/60 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        + cues assigned
      </motion.p>
    </motion.div>
  );
}

// Step 4: Record - Origin + AI index (labeled)
export function RecordIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-cream shadow-2xl flex flex-col p-3 relative overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Origin label */}
      <motion.div 
        className="absolute top-2 right-2 px-1.5 py-0.5 bg-forest-deep/90 rounded text-[7px] text-cream font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        ORIGIN
      </motion.div>
      
      {/* Image preview */}
      <motion.div 
        className="w-full h-20 bg-muted/30 rounded-lg mb-2 overflow-hidden border-2 border-oker/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-paper to-cream" />
      </motion.div>
      
      {/* Summary lines */}
      <motion.div 
        className="w-full h-2.5 bg-forest/40 rounded mb-1.5"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      <motion.div 
        className="w-4/5 h-2.5 bg-forest/25 rounded mb-2"
        initial={{ width: 0 }}
        animate={{ width: '80%' }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      
      {/* AI index label */}
      <motion.div 
        className="flex items-center gap-1 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles className="w-2.5 h-2.5 text-forest/40" />
        <span className="text-[8px] text-forest/50 font-mono">AI-indexed</span>
      </motion.div>
      
      {/* Keywords */}
      <motion.div 
        className="flex gap-1 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {['idea', 'draft'].map((kw, i) => (
          <motion.span 
            key={kw}
            className="text-[8px] px-2 py-0.5 bg-oker/15 text-oker rounded font-medium border border-oker/20"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            {kw}
          </motion.span>
        ))}
      </motion.div>
      
      {/* Origin unchanged note */}
      <motion.div
        className="mt-auto pt-2 border-t border-forest/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-[7px] text-forest/40 font-mono">Origin unchanged.</div>
      </motion.div>
    </motion.div>
  );
}

// Step 5: Retrieve - Find by cue or meaning
export function RetrieveIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep via-forest to-forest-deep flex flex-col items-center justify-center p-4 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search icon */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Search className="w-8 h-8 text-cream/40" />
      </motion.div>
      
      {/* Search bar mockup */}
      <motion.div
        className="w-full px-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-forest/50 rounded-lg px-3 py-2 flex items-center gap-2 border border-cream/10">
          <Search className="w-3 h-3 text-cream/40" />
          <motion.div 
            className="h-0.5 bg-cream/30 rounded"
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>
      </motion.div>
      
      {/* Result preview */}
      <motion.div
        className="mt-4 w-full px-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-cream/10 rounded-lg p-2 border border-cream/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-oker/20" />
            <div className="flex-1">
              <div className="h-1.5 bg-cream/30 rounded w-3/4 mb-1" />
              <div className="h-1 bg-cream/20 rounded w-1/2" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Match indicator */}
      <motion.div
        className="mt-3 flex items-center gap-1.5 text-oker"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-[9px] font-medium">Best match</span>
      </motion.div>
    </motion.div>
  );
}

// Step 6: Archive - Every record, unchanged
export function ArchiveIllustration() {
  const spines = [
    { color: 'bg-teal/60', width: 'w-4' },
    { color: 'bg-forest/50', width: 'w-5' },
    { color: 'bg-oker/40', width: 'w-3' },
    { color: 'bg-teal/50', width: 'w-4' },
  ];

  return (
    <motion.div 
      className="w-52 h-60 rounded-2xl bg-cream shadow-2xl flex flex-col p-4 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-forest">Archive</span>
        <span className="text-[8px] text-forest/50 font-mono">immutable</span>
      </div>
      
      {/* Bookshelf */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-end gap-1 px-2 pb-1">
          {spines.map((spine, i) => (
            <motion.div 
              key={i}
              className={`${spine.width} h-28 ${spine.color} rounded-t-sm relative flex items-center justify-center shadow-sm`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 112, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/20" />
            </motion.div>
          ))}
          
          {/* New record with seal */}
          <motion.div 
            className="w-5 h-28 rounded-t-sm relative flex items-center justify-center"
            initial={{ height: 0, opacity: 0, scale: 0.8 }}
            animate={{ height: 112, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <motion.div 
              className="absolute inset-0 rounded-t-sm bg-oker/60"
              animate={{ 
                boxShadow: [
                  '0 0 0 0 hsla(38, 70%, 50%, 0)',
                  '0 0 15px 5px hsla(38, 70%, 50%, 0.4)',
                  '0 0 0 0 hsla(38, 70%, 50%, 0)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-oker/40 z-10" />
          </motion.div>
        </div>
        
        {/* Shelf base */}
        <div className="h-2 bg-gradient-to-b from-forest/30 to-forest/10 rounded-b-sm mx-1" />
      </div>
      
      {/* Record count */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-[9px] text-forest/50">5 records sealed</span>
      </motion.div>
    </motion.div>
  );
}

// Step 7: Verify - Bit-identity confirmed
export function VerifyIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep via-forest to-forest-deep flex flex-col items-center justify-center p-4 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Shield with checkmark */}
      <motion.div 
        className="w-20 h-24 relative flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <ShieldCheck className="w-16 h-16 text-oker" />
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 hsla(38, 70%, 50%, 0)',
              '0 0 30px 15px hsla(38, 70%, 50%, 0.2)',
              '0 0 0 0 hsla(38, 70%, 50%, 0)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Verified status */}
      <motion.div
        className="mt-4 px-4 py-2 rounded-lg bg-oker/20 border border-oker/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[10px] text-oker font-medium text-center">Bit-identity confirmed</p>
      </motion.div>
      
      {/* Hash match */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-[8px] text-cream/40 font-mono">SHA-256 ✓</p>
      </motion.div>
    </motion.div>
  );
}
