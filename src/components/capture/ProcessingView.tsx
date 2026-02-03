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
  onSkipToCodex?: (cues: string[]) => void;
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
  onSkipToCodex,
  suggestedCues = [],
  originHash,
  capturedAt = new Date(),
}: ProcessingViewProps) {
  // Three ritual phases
  type RitualPhase = 'pause' | 'mark' | 'release';
  const [phase, setPhase] = useState<RitualPhase>('pause');

  // Phase 1 → 2: After pause, show the certificate
  useEffect(() => {
    if (phase === 'pause' && isProcessingComplete) {
      // The pause: let the moment breathe
      const pauseTimer = setTimeout(() => {
        triggerHaptic('success');
        setPhase('mark');
      }, 1800); // 1.8 seconds of stillness
      return () => clearTimeout(pauseTimer);
    }
  }, [phase, isProcessingComplete]);

  // Phase 2 → 3: After certificate shown, begin release
  useEffect(() => {
    if (phase === 'mark') {
      const releaseTimer = setTimeout(() => {
        setPhase('release');
      }, 2800); // 2.8 seconds to witness the certificate
      return () => clearTimeout(releaseTimer);
    }
  }, [phase]);

  // Phase 3: Fade out and complete
  useEffect(() => {
    if (phase === 'release' && onContinue) {
      const completeTimer = setTimeout(() => {
        const cues = suggestedCues.slice(0, 3);
        onContinue(cues);
      }, 800); // 0.8 second fade
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

        {phase === 'mark' && (
          // PHASE 2: THE CERTIFICATE
          // The moment is marked
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center w-full max-w-md px-4"
          >
            {/* The Certificate - oorkonde format */}
            <motion.div 
              className="w-full bg-gradient-to-b from-codex-cream/8 to-codex-cream/3 rounded-3xl p-8 sm:p-12 border border-codex-gold/30 shadow-2xl"
              style={{
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px -10px rgba(200, 170, 100, 0.15)',
              }}
            >
              {/* U stamp mark at top */}
              <motion.div 
                className="flex justify-center mb-10"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="w-24 h-24 rounded-full bg-codex-gold/10 border-2 border-codex-gold/50 flex items-center justify-center">
                  <span 
                    className="font-serif text-6xl font-semibold text-codex-gold select-none"
                    style={{ letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(200, 170, 100, 0.3)' }}
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
                <p className="text-codex-gold font-serif text-4xl sm:text-5xl font-medium tracking-wide">
                  Marked
                </p>
                
                {/* Beginning count - the milestone */}
                <p className="text-codex-cream/70 font-serif text-xl mt-6">
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
            </motion.div>

            {/* Multi-page indicator (if applicable) */}
            {totalImages > 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
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
