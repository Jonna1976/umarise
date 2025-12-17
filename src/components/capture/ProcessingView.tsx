import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Images, Check, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProcessingViewProps {
  imageUrl: string;
  totalImages?: number;
  currentIndex?: number;
  completedCount?: number;
  currentPageCount?: number;
  onPreCue?: (cue: string) => void;
}

// Average processing time in seconds (for estimation)
const ESTIMATED_TIME = 15;

export function ProcessingView({ 
  imageUrl, 
  totalImages = 1, 
  currentIndex = 0,
  completedCount = 0,
  currentPageCount = 0,
  onPreCue
}: ProcessingViewProps) {
  const isMultiple = totalImages > 1;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [preCue, setPreCue] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show input after 2 seconds delay for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Pass pre-cue to parent when it changes
  useEffect(() => {
    if (preCue && onPreCue) {
      onPreCue(preCue);
    }
  }, [preCue, onPreCue]);

  const remainingTime = Math.max(0, ESTIMATED_TIME - elapsedTime);
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm"
      >
        {/* Multi-page indicator */}
        {isMultiple && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-4"
          >
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-codex-gold" />
              <span className="text-codex-sepia font-medium">
                Processing {totalImages} pages
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {completedCount} of {totalImages} complete
            </span>
          </motion.div>
        )}

        {/* Progress dots for multiple images */}
        {isMultiple && (
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: totalImages }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors flex items-center justify-center ${
                  i < completedCount
                    ? 'bg-codex-gold'
                    : 'bg-muted animate-pulse'
                }`}
                animate={i < completedCount ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {i < completedCount && (
                  <Check className="w-1.5 h-1.5 text-codex-ink" />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Image preview - smaller to make room for reflection */}
        <div className="relative rounded-xl overflow-hidden shadow-xl">
          <img
            src={imageUrl}
            alt="Processing page"
            className="w-full aspect-[4/3] object-cover"
          />
          
          {/* Processing overlay with timer */}
          <div className="absolute inset-0 bg-gradient-to-t from-codex-ink/95 via-codex-ink/60 to-codex-ink/30 flex flex-col items-center justify-end p-4">
            {/* Rotating sparkle */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="mb-2"
            >
              <div className="w-10 h-10 rounded-full bg-codex-gold/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-codex-gold" />
              </div>
            </motion.div>

            {/* Time indicator */}
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {remainingTime > 0 
                  ? `~${remainingTime}s remaining` 
                  : 'Almost done...'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mindful reflection section */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="mt-8 w-full max-w-sm text-center"
          >
            {/* Mindful prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <p className="text-xl font-serif text-foreground mb-3">
                A moment for yourself.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                While we read your handwriting, think about this:
              </p>
            </motion.div>

            {/* The question */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-secondary/50 rounded-2xl p-6 border border-border/50"
            >
              <p className="text-codex-gold font-serif text-xl mb-2">
                What is this about?
              </p>
              <p className="text-muted-foreground text-sm mb-5">
                What words would you type in 2030 to find this page again?
              </p>

              <Input
                value={preCue}
                onChange={(e) => setPreCue(e.target.value)}
                placeholder="e.g. funding pitch, Marco meeting, wedding plans..."
                className="bg-background/50 border-border/30 text-center text-base placeholder:text-muted-foreground/50"
                autoComplete="off"
              />
              
              <p className="text-muted-foreground/60 text-xs mt-4">
                Optional — you can refine this after processing
              </p>
            </motion.div>

            {/* Subtle breathing reminder */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ delay: 1, duration: 3, repeat: Infinity }}
              className="mt-6 text-muted-foreground/50 text-sm"
            >
              Breathe. Your thoughts are being preserved.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
