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
  suggestedCues = [],
  originHash,
  capturedAt = new Date(),
}: ProcessingViewProps) {
  // Three ritual phases
  type RitualPhase = 'pause' | 'mark' | 'release';
  const [phase, setPhase] = useState<RitualPhase>('pause');
  const [sealProgress, setSealProgress] = useState(0); // 0-100 for circle closing animation

  // Phase 1 → 2: After pause, show the certificate
  // PAUSE = Sealing ritual — golden circle closes with building haptics
  useEffect(() => {
    if (phase === 'pause' && isProcessingComplete) {
      // Building haptics during the sealing process
      const hapticSequence = [
        { delay: 400, style: 'light' as const },
        { delay: 800, style: 'light' as const },
        { delay: 1200, style: 'medium' as const },
        { delay: 1600, style: 'medium' as const },
        { delay: 2000, style: 'heavy' as const }, // Final thud as seal closes
      ];
      
      const hapticTimers = hapticSequence.map(({ delay, style }) => 
        setTimeout(() => triggerHaptic(style), delay)
      );
      
      // Animate seal progress
      const progressInterval = setInterval(() => {
        setSealProgress(prev => Math.min(prev + 4.5, 100));
      }, 100);

      const pauseTimer = setTimeout(() => {
        clearInterval(progressInterval);
        setSealProgress(100);
        setPhase('mark');
      }, 2400); // 2.4 seconds — sealing complete
      
      return () => {
        clearTimeout(pauseTimer);
        clearInterval(progressInterval);
        hapticTimers.forEach(t => clearTimeout(t));
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
      }, 2000); // 2.0 seconds — peaceful release
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
          // PHASE 1: THE SEALING RITUAL
          // Golden circle closes around the U — building haptics create anticipation
          // The ritual is about the ACT of securing, not the content
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* The sealing circle — closes as progress builds */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <svg 
                viewBox="0 0 100 100" 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  filter: 'drop-shadow(0 0 25px rgba(200, 170, 100, 0.4))',
                  transform: 'rotate(-90deg)' // Start from top
                }}
              >
                {/* Background circle (faint) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  fill="none" 
                  stroke="hsl(var(--codex-gold))" 
                  strokeWidth="2"
                  opacity="0.15"
                />
                {/* Closing circle — progress-based */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  fill="none" 
                  stroke="hsl(var(--codex-gold))" 
                  strokeWidth="2"
                  opacity="0.8"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - sealProgress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
                />
              </svg>
              {/* The U — grows slightly as seal completes */}
              <motion.span 
                className="font-serif text-5xl text-codex-gold select-none relative z-10"
                animate={{ 
                  scale: 1 + (sealProgress / 100) * 0.1,
                  opacity: 0.6 + (sealProgress / 100) * 0.4
                }}
                style={{ fontWeight: 400 }}
              >
                U
              </motion.span>
            </div>
            {/* No text — the closing circle speaks for itself */}
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
                {/* Elegant CLOSED circle with U — fully sealed */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* The circle — fully closed, elegant stroke */}
                  <svg 
                    viewBox="0 0 100 100" 
                    className="absolute inset-0 w-full h-full"
                    style={{ filter: 'drop-shadow(0 0 25px rgba(200, 170, 100, 0.35))' }}
                  >
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="44" 
                      fill="none" 
                      stroke="hsl(var(--codex-gold))" 
                      strokeWidth="1.5"
                      opacity="0.75"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
