import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Images } from 'lucide-react';
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

      {/* Processing status with AI explanation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1 text-muted-foreground mb-8"
      >
        {!isProcessingComplete ? (
          <>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-base">~{remainingTime}s</span>
            </div>
            <span className="text-xs text-foreground/40">AI reading for backup search</span>
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
        Make it findable.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-foreground/70 mb-8 text-center max-w-xs"
      >
        What 2 words will you type to find this in 30 seconds?
      </motion.p>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-secondary/60 rounded-2xl p-6 border border-border/30">
          <p className="text-codex-gold font-serif text-xl font-bold mb-2 text-center">
            Your search words
          </p>
          <p className="text-foreground/60 text-sm mb-5 text-center">
            These are the words you'll type when you need this back.
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

          {/* Bonus word - always visible */}
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
          />

        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 space-y-3"
        >
          {/* Primary: Confirm */}
          <Button
            onClick={handleConfirmAndContinue}
            disabled={!hasInput || hasSubmitted}
            className="w-full h-12 bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep font-medium text-base disabled:opacity-40"
          >
            {hasSubmitted ? (
              'Continuing...'
            ) : isConfirmed && !isProcessingComplete ? (
              'Confirmed — saving...'
            ) : (
              'Confirm'
            )}
          </Button>

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
