import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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

  // Haptic feedback when processing completes
  useEffect(() => {
    if (isProcessingComplete && !hasCompleted) {
      triggerHaptic('success');
      setHasCompleted(true);
    }
  }, [isProcessingComplete, hasCompleted]);

  // Reset state when a new image starts processing
  useEffect(() => {
    setHasCompleted(false);
  }, [imageUrl]);

  const handleDone = () => {
    triggerHaptic('medium');
    // Pass AI-suggested cues silently (user never sees them)
    const cues = suggestedCues.slice(0, 3);
    if (onContinue) {
      onContinue(cues);
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Certificate of Beginning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Certificate Card */}
        <div className="bg-secondary/40 rounded-2xl p-8 border border-border/20">
          {/* Thumbnail */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div 
              className="relative w-32 h-24 rounded-lg overflow-hidden shadow-lg"
              animate={isProcessingComplete ? {
                boxShadow: [
                  '0 0 0 0 rgba(212, 175, 55, 0)',
                  '0 0 0 4px rgba(212, 175, 55, 0.5)',
                  '0 0 0 4px rgba(212, 175, 55, 0.3)',
                ]
              } : {}}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={isProcessingComplete ? { 
                border: '2px solid hsl(var(--codex-gold))',
              } : {
                border: '2px solid hsl(var(--border))',
              }}
            >
              <img
                src={imageUrl}
                alt="Origin"
                className="w-full h-full object-cover"
              />
              {/* Multi-page indicator */}
              {totalImages > 1 && (
                <div className="absolute top-1 right-1 bg-codex-gold text-codex-ink text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalImages}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-border/30 mb-6" />

          {/* Origin Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            {isProcessingComplete ? (
              <>
                <p className="text-codex-gold font-serif text-xl font-medium mb-2">
                  Origin marked
                </p>
                <p className="text-foreground/60 text-sm mb-4">
                  {formatTimestamp(capturedAt)}
                </p>
              </>
            ) : (
              <>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-foreground/60 font-serif text-xl mb-2"
                >
                  Marking...
                </motion.p>
                <p className="text-foreground/40 text-sm mb-4">
                  This moment is being acknowledged
                </p>
              </>
            )}

            {/* Fingerprint */}
            {isProcessingComplete && displayHash && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="border-t border-border/30 pt-4 mt-2" />
                <p className="text-foreground/40 text-xs font-mono tracking-wide">
                  {displayHash}
                </p>
                <p className="text-foreground/30 text-[10px] mt-1">
                  fingerprint
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Done Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isProcessingComplete ? 1 : 0.3 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Button
            onClick={handleDone}
            disabled={!isProcessingComplete}
            className="w-full h-12 bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep font-medium text-base disabled:opacity-30"
          >
            Done
          </Button>
        </motion.div>

        {/* Multi-page progress */}
        {totalImages > 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-foreground/40 text-xs mt-4"
          >
            {completedCount} of {totalImages} marked
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
