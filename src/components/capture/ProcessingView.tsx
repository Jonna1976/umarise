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

  // Phase 1 → 2: After pause, show the certificate
  // PAUSE = Recognition moment — "I am marking this"
  useEffect(() => {
    if (phase === 'pause' && isProcessingComplete) {
      const pauseTimer = setTimeout(() => {
        triggerHaptic('success');
        setPhase('mark');
      }, 2400); // 2.4 seconds — recognition before witness
      return () => clearTimeout(pauseTimer);
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
          // PHASE 1: THE PAUSE
          // Conscious recognition before marking — no artifact shown
          // The ritual is about the ACT, not the content
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* The recognition statement — pure, no artifact */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-serif text-3xl sm:text-4xl text-codex-cream/90 leading-relaxed"
            >
              This is where it began.
            </motion.p>

            {/* Breathing indicator - subtle, not demanding */}
            <motion.div
              className="mt-12 w-2 h-2 rounded-full bg-codex-gold/40"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}

        {(phase === 'mark' || phase === 'release') && (
          // PHASE 2 & 3: THE CERTIFICATE + RELEASE
          // Mark shows the certificate, Release lets it settle and disappear
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: phase === 'release' ? 0 : 1, 
              y: phase === 'release' ? 40 : 0, // Sinks down — gravity, being set down
              scale: phase === 'release' ? 0.97 : 1 
            }}
            transition={{ 
              duration: phase === 'release' ? 1.8 : 0.7, 
              ease: phase === 'release' ? [0.4, 0, 0.2, 1] : [0.34, 1.56, 0.64, 1] 
            }}
            className="flex flex-col items-center w-full max-w-lg px-4"
          >
            {/* The Certificate - oorkonde format with decorative frame */}
            <motion.div 
              className="w-full bg-gradient-to-b from-codex-cream/10 to-codex-cream/4 rounded-3xl p-10 sm:p-14 border-2 border-codex-gold/40 shadow-2xl relative"
              style={{
                boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.6), 0 0 50px -10px rgba(200, 170, 100, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* U stamp mark at top */}
              <motion.div 
                className="flex justify-center mb-10"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="w-28 h-28 rounded-full bg-codex-gold/10 border-2 border-codex-gold/50 flex items-center justify-center ring-4 ring-codex-gold/10 ring-offset-4 ring-offset-transparent">
                  <span 
                    className="font-serif text-7xl font-semibold text-codex-gold select-none"
                    style={{ letterSpacing: '-0.02em', textShadow: '0 2px 25px rgba(200, 170, 100, 0.4)' }}
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
