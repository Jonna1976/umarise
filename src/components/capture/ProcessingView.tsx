import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface ProcessingViewProps {
  imageUrl: string;
  totalImages?: number;
  currentIndex?: number;
  completedCount?: number;
  currentPageCount?: number;
  isProcessingComplete?: boolean;
  onContinue?: (cues: string[]) => void;
  onViewBeginnings?: () => void; // Navigate to beginnings/history
  suggestedCues?: string[];
  originHash?: string;
  capturedAt?: Date;
}

/**
 * ProcessingView implements the ritual of marking a beginning.
 * 
 * Three phases (per doctrine):
 * 1. PAUSE    → Conscious recognition before marking
 * 2. MARK     → Certificate appears with gravity
 * 3. RELEASE  → Fades away without action required
 * 
 * The value is entirely in the act. Nothing afterward adds value.
 */
export function ProcessingView({ 
  imageUrl, 
  totalImages = 1, 
  currentIndex = 0,
  completedCount = 0,
  currentPageCount = 0,
  isProcessingComplete = false,
  onContinue,
  onViewBeginnings,
  suggestedCues = [],
  originHash,
  capturedAt = new Date(),
}: ProcessingViewProps) {
  // Three ritual phases
  type RitualPhase = 'pause' | 'mark' | 'release';
  const [phase, setPhase] = useState<RitualPhase>('pause');

  // Phase 1 → 2: After pause, show the certificate
  // PAUSE = Simple recognition moment with text + pulsing dot
  useEffect(() => {
    if (phase === 'pause' && isProcessingComplete) {
      // Simple haptic at the end of pause
      const hapticTimer = setTimeout(() => triggerHaptic('medium'), 2000);

      const pauseTimer = setTimeout(() => {
        setPhase('mark');
      }, 2400); // 2.4 seconds — pause complete
      
      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(hapticTimer);
      };
    }
  }, [phase, isProcessingComplete]);

  // Phase 2 → 3: After certificate shown, begin release
  // MARK = Witness moment — the certificate appears
  useEffect(() => {
    if (phase === 'mark') {
      const releaseTimer = setTimeout(() => {
        // Heavy haptic — something is being set down, not celebrated
        triggerHaptic('heavy');
        setPhase('release');
      }, 4600); // 4.6 seconds — full witness of the mark
      return () => clearTimeout(releaseTimer);
    }
  }, [phase]);

  // Phase 3: Fade out and complete
  // RELEASE = Letting go — the ritual completes itself
  useEffect(() => {
    if (phase === 'release' && onContinue) {
      const completeTimer = setTimeout(() => {
        const cues = suggestedCues.slice(0, 3);
        onContinue(cues);
      }, 5000); // 5.0 seconds — longer release to see the history icon
      return () => clearTimeout(completeTimer);
    }
  }, [phase, onContinue, suggestedCues]);

  // Reset when new image starts
  useEffect(() => {
    setPhase('pause');
  }, [imageUrl]);

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format hash for display (first 8 + last 8 chars)
  const formatHash = (hash: string | undefined) => {
    if (!hash || hash.length < 16) return null;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const displayHash = formatHash(originHash);

  return (
    <motion.div 
      className="min-h-screen bg-codex-ink-deep flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'release' ? 0 : 1 }}
      transition={{ duration: phase === 'release' ? 0.8 : 0.3 }}
    >
      <AnimatePresence mode="wait">
        {phase === 'pause' && (
          // PHASE 1: PAUSE — Only text + pulsing dot, no U animation
          // Simple recognition moment before the mark
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* The recognition statement */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-serif text-2xl sm:text-3xl text-codex-cream/80 leading-relaxed mb-8"
            >
              This is where it began
            </motion.p>

            {/* Pulsating dot below text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-codex-gold"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  boxShadow: '0 0 20px 8px rgba(200, 170, 100, 0.3)',
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {(phase === 'mark' || phase === 'release') && (
          // PHASE 2 & 3: THE CERTIFICATE + RELEASE
          // Mark: instant reveal — certificate appears out of nothing
          // Release: sinks down with gravity, felt not explained
          <motion.div
            key="certificate"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ 
              opacity: phase === 'release' ? 0 : 1, 
              y: phase === 'release' ? 60 : 0, // Deeper sink — more gravity, more felt
              scale: phase === 'release' ? 0.94 : 1 
            }}
            transition={{ 
              duration: phase === 'release' ? 2.0 : 0.15, // Instant reveal (0.15s), slow release
              ease: phase === 'release' ? [0.4, 0, 0.2, 1] : 'easeOut'
            }}
            className="flex flex-col items-center w-full max-w-lg px-4"
          >
            {/* The Certificate - oorkonde format with decorative frame */}
            <motion.div 
              className="w-full bg-gradient-to-b from-codex-cream/8 to-codex-cream/3 rounded-3xl p-10 sm:p-14 border border-codex-gold/30 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              style={{
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.7), 0 0 60px -15px rgba(200, 170, 100, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
              }}
            >
              {/* U stamp mark — elegant circle with serif U, like the reference */}
              <motion.div 
                className="flex justify-center mb-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                {/* Elegant OPEN circle with U — like the reference with gap + accent dot */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* The circle — open with gap and accent dot */}
                  <svg 
                    viewBox="0 0 100 100" 
                    className="absolute inset-0 w-full h-full"
                    style={{ filter: 'drop-shadow(0 0 25px rgba(200, 170, 100, 0.35))' }}
                  >
                    {/* Open arc - starting from right, going almost full circle */}
                    <path
                      d="M 94 50 A 44 44 0 1 1 82 18"
                      fill="none"
                      stroke="hsl(var(--codex-gold))"
                      strokeWidth="1.5"
                      opacity="0.75"
                      strokeLinecap="round"
                    />
                    {/* Accent dot at the end of the arc */}
                    <circle
                      cx="82"
                      cy="18"
                      r="3"
                      fill="hsl(var(--codex-gold))"
                      opacity="0.9"
                    />
                  </svg>
                  {/* The U — elegant serif, centered */}
                  <span 
                    className="font-serif text-5xl text-codex-gold select-none relative z-10"
                    style={{ 
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                    }}
                  >
                    U
                  </span>
                </div>
              </motion.div>

              {/* The proclamation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <p className="text-codex-gold font-serif text-5xl sm:text-6xl font-medium tracking-wide">
                  Marked
                </p>
                
                {/* Beginning count - the milestone */}
                <p className="text-codex-cream/70 font-serif text-2xl mt-8">
                  Beginning #{(currentPageCount || 0) + 1}
                </p>
                
                {/* Timestamp */}
                <p className="text-codex-cream/40 text-sm mt-3">
                  {formatTimestamp(capturedAt)}
                </p>
              </motion.div>

              {/* Fingerprint - cryptographic proof reference */}
              {displayHash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-10 pt-6 border-t border-codex-gold/20 text-center"
                >
                  <p className="text-codex-cream/20 text-xs font-mono tracking-widest">
                    {displayHash}
                  </p>
                </motion.div>
              )}

              {/* Seal imprint — appears during release, not readable, just felt */}
              {phase === 'release' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.15, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div 
                    className="w-32 h-32 rounded-full border-4 border-codex-gold/30"
                    style={{
                      background: 'radial-gradient(circle, transparent 40%, rgba(200, 170, 100, 0.1) 100%)',
                    }}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Multi-page indicator (if applicable) */}
            {totalImages > 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'release' ? 0 : 0.5 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-codex-cream/40 text-sm"
              >
                {completedCount} of {totalImages} marked
              </motion.p>
            )}

            {/* History icon to view beginnings — appears during release, more prominent */}
            {phase === 'release' && onViewBeginnings && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                onClick={onViewBeginnings}
                className="mt-8 p-3 rounded-full hover:opacity-100 transition-opacity bg-codex-gold/10"
                aria-label="View all beginnings"
              >
                <svg 
                  viewBox="0 0 48 48" 
                  className="w-10 h-10"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(200, 170, 100, 0.3))' }}
                >
                  {/* Open circle with gap */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="hsl(var(--codex-gold))"
                    strokeWidth="1.5"
                    strokeDasharray="120 8"
                    strokeDashoffset="-10"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                  {/* Accent dot */}
                  <circle
                    cx="40"
                    cy="12"
                    r="2.5"
                    fill="hsl(var(--codex-gold))"
                    opacity="0.9"
                  />
                  <text 
                    x="24" 
                    y="30" 
                    textAnchor="middle" 
                    fill="hsl(var(--codex-gold))"
                    fontFamily="Playfair Display, Georgia, serif"
                    fontSize="16"
                    opacity="0.8"
                  >
                    U
                  </text>
                </svg>
                <span className="sr-only">View all beginnings</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
