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
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Auto-seal: when processing completes, trigger haptic and show certificate
  useEffect(() => {
    if (isProcessingComplete && !hasCompleted) {
      triggerHaptic('success');
      setHasCompleted(true);
      // Brief pause before revealing the sealed certificate
      setTimeout(() => setShowCertificate(true), 300);
    }
  }, [isProcessingComplete, hasCompleted]);

  // Reset state when a new image starts processing
  useEffect(() => {
    setHasCompleted(false);
    setShowCertificate(false);
  }, [imageUrl]);

  // Auto-dismiss after showing certificate (let it breathe, then move on)
  useEffect(() => {
    if (showCertificate && onContinue) {
      const timer = setTimeout(() => {
        const cues = suggestedCues.slice(0, 3);
        onContinue(cues);
      }, 2500); // 2.5 seconds to appreciate, then auto-continue
      return () => clearTimeout(timer);
    }
  }, [showCertificate, onContinue, suggestedCues]);

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

  // Tap anywhere to dismiss early (Ording: direct manipulation)
  const handleTapToDismiss = () => {
    if (showCertificate && onContinue) {
      triggerHaptic('light');
      const cues = suggestedCues.slice(0, 3);
      onContinue(cues);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6 cursor-pointer"
      onClick={handleTapToDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!showCertificate ? (
          // Processing state - focusing on the artifact
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center"
          >
            {/* Large artifact display - proud, prominent */}
            <motion.div 
              className="relative w-72 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-border/30"
              animate={{ 
                boxShadow: [
                  '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={imageUrl}
                alt="Your beginning"
                className="w-full h-full object-cover"
              />
              {/* Multi-page indicator */}
              {totalImages > 1 && (
                <div className="absolute top-3 right-3 bg-codex-gold text-codex-ink text-xs font-bold px-2 py-1 rounded-full">
                  {totalImages}
                </div>
              )}
            </motion.div>

            {/* Gentle processing indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-8 text-foreground/50 text-sm tracking-wide"
            >
              Marking this moment...
            </motion.p>
          </motion.div>
        ) : (
          // Sealed certificate - the ritual completion (oorkonde format)
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center w-full max-w-md px-4"
          >
            {/* The Certificate - larger oorkonde format */}
            <motion.div 
              className="w-full bg-gradient-to-b from-codex-cream/70 to-secondary/50 rounded-3xl p-6 sm:p-10 border border-codex-gold/40 shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* U stamp mark at top - larger, more prominent */}
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="w-20 h-20 rounded-full bg-codex-gold/15 border-2 border-codex-gold/60 flex items-center justify-center shadow-inner">
                  <span className="font-serif text-5xl font-semibold text-codex-gold select-none" style={{ letterSpacing: '-0.02em' }}>
                    U
                  </span>
                </div>
              </motion.div>

              {/* Beginning number - prominent */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-8"
              >
                <p className="text-codex-gold font-serif text-3xl sm:text-4xl font-medium">
                  Marked
                </p>
                <p className="text-foreground/50 text-base mt-2">
                  {formatTimestamp(capturedAt)}
                </p>
                {/* Beginning count - prominent milestone */}
                <p className="text-foreground/70 font-serif text-lg mt-4">
                  Beginning #{(currentPageCount || 0) + 1}
                </p>
              </motion.div>

              {/* Fingerprint - subtle but present */}
              {displayHash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="pt-6 border-t border-border/30 text-center"
                >
                  <p className="text-foreground/25 text-xs font-mono tracking-wider">
                    {displayHash}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Subtle tap hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-foreground/40 text-sm"
            >
              tap to continue
            </motion.p>

            {/* Multi-page progress */}
            {totalImages > 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 text-foreground/40 text-xs"
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
