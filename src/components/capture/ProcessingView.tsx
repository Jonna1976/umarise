import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Images, ArrowRight, Plus, BookOpen, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
}

const ESTIMATED_TIME = 15;

export function ProcessingView({ 
  imageUrl, 
  totalImages = 1, 
  currentIndex = 0,
  completedCount = 0,
  currentPageCount = 0,
  isProcessingComplete = false,
  onContinue,
  onSkipToCodex,
  suggestedCues = []
}: ProcessingViewProps) {
  const isMultiple = totalImages > 1;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cue1, setCue1] = useState('');
  const [cue2, setCue2] = useState('');
  const [cue3, setCue3] = useState('');
  const [showBonusCue, setShowBonusCue] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasPrefilledFromAI, setHasPrefilledFromAI] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Haptic feedback when processing completes
  useEffect(() => {
    if (isProcessingComplete) {
      triggerHaptic('success');
    }
  }, [isProcessingComplete]);

  // Reset state when a new image starts processing
  useEffect(() => {
    setIsConfirmed(false);
    setHasSubmitted(false);
    setCue1('');
    setCue2('');
    setCue3('');
    setShowBonusCue(false);
    setElapsedTime(0);
    setHasPrefilledFromAI(false);
  }, [imageUrl]);

  // Prefill with AI-suggested cues when processing completes
  useEffect(() => {
    if (isProcessingComplete && suggestedCues.length > 0 && !hasPrefilledFromAI) {
      // Only prefill if user hasn't typed anything yet
      if (!cue1 && !cue2 && !cue3) {
        if (suggestedCues[0]) setCue1(suggestedCues[0]);
        if (suggestedCues[1]) setCue2(suggestedCues[1]);
        if (suggestedCues[2]) {
          setCue3(suggestedCues[2]);
          setShowBonusCue(true);
        }
        setHasPrefilledFromAI(true);
      }
    }
  }, [isProcessingComplete, suggestedCues, hasPrefilledFromAI, cue1, cue2, cue3]);

  const remainingTime = Math.max(0, ESTIMATED_TIME - elapsedTime);

  const extractCues = () => {
    const cues = [cue1.trim(), cue2.trim(), cue3.trim()]
      .filter(c => c.length > 0);
    return Array.from(new Set(cues)).slice(0, 3);
  };

  const submit = () => {
    const cues = extractCues();
    if (cues.length > 0 && onContinue) {
      triggerHaptic('medium');
      onContinue(cues);
    }
  };

  // If user confirmed early, auto-continue the moment analysis completes
  useEffect(() => {
    if (hasSubmitted) return;
    if (!isConfirmed) return;
    if (!isProcessingComplete) return;

    setHasSubmitted(true);
    submit();
  }, [hasSubmitted, isConfirmed, isProcessingComplete]);

  const hasInput = cue1.trim().length > 0 || cue2.trim().length > 0;

  const handleConfirmAndContinue = () => {
    if (!hasInput || hasSubmitted) return;

    if (isProcessingComplete) {
      setHasSubmitted(true);
      submit();
      return;
    }

    // Confirm now; we'll continue automatically once analysis is ready
    setIsConfirmed(true);
    triggerHaptic('light');
  };

  const handleSkipToCodex = () => {
    if (!hasInput || hasSubmitted) return;
    const cues = extractCues();
    if (cues.length > 0 && onSkipToCodex) {
      triggerHaptic('success');
      setHasSubmitted(true);
      onSkipToCodex(cues);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmAndContinue();
    }
  };

  const handleInputChange = () => {
    if (isConfirmed) setIsConfirmed(false);
  };
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-6 pt-12">
      {/* Image thumbnail - compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-32 h-24 rounded-lg overflow-hidden shadow-lg mb-4"
      >
        <img
          src={imageUrl}
          alt="Processing"
          className="w-full h-full object-cover"
        />
        {/* Multi-page badge on thumbnail */}
        {isMultiple && (
          <div className="absolute top-1 right-1 bg-codex-gold text-codex-ink text-xs font-bold px-1.5 py-0.5 rounded-full">
            {totalImages}
          </div>
        )}
      </motion.div>

      {/* Multi-page indicator */}
      {isMultiple && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-4"
        >
          <Images className="w-4 h-4 text-codex-gold" />
          <span className="text-codex-sepia">
            {completedCount} of {totalImages} complete
          </span>
        </motion.div>
      )}

      {/* Processing status */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-muted-foreground mb-8"
      >
        {!isProcessingComplete ? (
          <>
            <Clock className="w-4 h-4" />
            <span className="text-base">~{remainingTime}s</span>
          </>
        ) : (
          <span className="text-codex-gold text-base">✓ Ready</span>
        )}
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-serif text-foreground mb-3 text-center"
      >
        A moment for yourself.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-foreground/70 mb-8 text-center"
      >
        While we read your handwriting, think about this:
      </motion.p>

      {/* Question card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-secondary/60 rounded-2xl p-6 border border-border/30">
          <p className="text-codex-gold font-serif text-2xl mb-3 text-center">
            In 2 words: what is this about?
          </p>
          <p className="text-foreground/60 text-base mb-6 text-center">
            These words will appear on the spine of this page in your memory.
          </p>

          {/* Two cue inputs side by side */}
          <div className="flex gap-3 mb-3">
            <Input
              value={cue1}
              onChange={(e) => {
                setCue1(e.target.value);
                handleInputChange();
              }}
              onKeyDown={handleKeyDown}
              placeholder="word 1"
              className="bg-background/60 border-border/40 text-base h-12 placeholder:text-foreground/40 text-center flex-1"
              autoComplete="off"
              disabled={hasSubmitted}
            />
            <Input
              value={cue2}
              onChange={(e) => {
                setCue2(e.target.value);
                handleInputChange();
              }}
              onKeyDown={handleKeyDown}
              placeholder="word 2"
              className="bg-background/60 border-border/40 text-base h-12 placeholder:text-foreground/40 text-center flex-1"
              autoComplete="off"
              disabled={hasSubmitted}
            />
          </div>

          {/* Bonus word option */}
          <AnimatePresence>
            {showBonusCue ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <Input
                  value={cue3}
                  onChange={(e) => {
                    setCue3(e.target.value);
                    handleInputChange();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="bonus word (optional)"
                  className="bg-background/60 border-border/40 text-base h-12 placeholder:text-foreground/40 text-center"
                  autoComplete="off"
                  disabled={hasSubmitted}
                  autoFocus
                />
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowBonusCue(true)}
                disabled={hasSubmitted}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-foreground/50 hover:text-foreground/70 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add bonus word</span>
              </motion.button>
            )}
          </AnimatePresence>

          <p className="text-foreground/40 text-sm mt-4 text-center">
            Optional — you can refine this after processing
          </p>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 space-y-3"
        >
          {/* Primary: Confirm & continue to snapshot */}
          <Button
            onClick={handleConfirmAndContinue}
            disabled={!hasInput || hasSubmitted}
            className="w-full h-12 bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep font-medium text-base disabled:opacity-40"
          >
            {hasSubmitted ? (
              'Continuing...'
            ) : isProcessingComplete ? (
              <>
                Confirm & continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : isConfirmed ? (
              'Confirmed — waiting for analysis...'
            ) : (
              <>
                Confirm
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Secondary: Skip to codex (for heavy writers) */}
          {isProcessingComplete && onSkipToCodex && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={handleSkipToCodex}
                disabled={!hasInput || hasSubmitted}
                variant="ghost"
                className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 text-sm disabled:opacity-40"
              >
                <Zap className="w-4 h-4 mr-2" />
                Skip to Memory
                <BookOpen className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Breathing text - always visible at bottom */}
        <motion.p
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-8 text-muted-foreground/60 text-base text-center"
        >
          Breathe. Your thoughts are being preserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
