import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Images, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProcessingViewProps {
  imageUrl: string;
  totalImages?: number;
  currentIndex?: number;
  completedCount?: number;
  currentPageCount?: number;
  isProcessingComplete?: boolean;
  onContinue?: (cues: string[]) => void;
}

const ESTIMATED_TIME = 15;

export function ProcessingView({ 
  imageUrl, 
  totalImages = 1, 
  currentIndex = 0,
  completedCount = 0,
  currentPageCount = 0,
  isProcessingComplete = false,
  onContinue
}: ProcessingViewProps) {
  const isMultiple = totalImages > 1;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cueInput, setCueInput] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingTime = Math.max(0, ESTIMATED_TIME - elapsedTime);

  const handleContinue = () => {
    // Split input by commas or spaces, filter empty, take max 5
    const words = cueInput
      .split(/[,\s]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0)
      .slice(0, 5);
    
    if (words.length > 0 && onContinue) {
      onContinue(words);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canContinue) {
      e.preventDefault();
      handleContinue();
    }
  };

  // Can only continue when processing is done AND user has entered at least one word
  const hasInput = cueInput.trim().length > 0;
  const canContinue = isProcessingComplete && hasInput;
  
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
          <span className="text-codex-gold text-base">✓</span>
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
            What is this about?
          </p>
          <p className="text-foreground/60 text-base mb-6 text-center">
            What words would you type in 2030 to find this page again?
          </p>

          {/* Input */}
          <Input
            value={cueInput}
            onChange={(e) => setCueInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. funding pitch, Marco meeting..."
            className="bg-background/60 border-border/40 text-base h-12 placeholder:text-foreground/40 text-center"
            autoComplete="off"
          />

          <p className="text-foreground/40 text-sm mt-4 text-center">
            Optional — you can refine this after processing
          </p>
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-12 bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep font-medium text-base disabled:opacity-40"
          >
            {!isProcessingComplete ? (
              'Waiting for analysis...'
            ) : !hasInput ? (
              'Enter words to continue'
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
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
