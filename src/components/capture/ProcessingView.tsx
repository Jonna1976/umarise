import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Images, Clock, Plus, X, ArrowRight } from 'lucide-react';
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
  const [cues, setCues] = useState<string[]>([]);
  const [newCue, setNewCue] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingTime = Math.max(0, ESTIMATED_TIME - elapsedTime);
  
  const addCue = () => {
    const trimmed = newCue.trim();
    if (trimmed && cues.length < 5 && !cues.includes(trimmed)) {
      setCues([...cues, trimmed]);
      setNewCue('');
    }
  };

  const removeCue = (index: number) => {
    setCues(cues.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCue();
    }
  };

  const handleContinue = () => {
    if (cues.length > 0 && onContinue) {
      onContinue(cues);
    }
  };

  const canContinue = isProcessingComplete && cues.length > 0;
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-6 pt-12">
      {/* Image thumbnail - compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-32 h-24 rounded-lg overflow-hidden shadow-lg mb-6"
      >
        <img
          src={imageUrl}
          alt="Processing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-codex-ink/40 flex items-center justify-center">
          {!isProcessingComplete ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-codex-gold" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-codex-gold flex items-center justify-center"
            >
              <span className="text-codex-ink text-sm">✓</span>
            </motion.div>
          )}
        </div>
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
            <span className="text-base">
              {remainingTime > 0 ? `Reading your handwriting... ~${remainingTime}s` : 'Almost done...'}
            </span>
          </>
        ) : (
          <span className="text-codex-gold text-base">Page analyzed ✓</span>
        )}
      </motion.div>

      {/* Main question content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Question card */}
        <div className="bg-secondary/60 rounded-2xl p-6 border border-border/30">
          <p className="text-codex-gold font-serif text-xl mb-2 text-center">
            Which words will you type to find this later?
          </p>
          <p className="text-foreground/60 text-sm mb-5 text-center">
            Add 1-3 retrieval cues — this becomes your book spine title
          </p>

          {/* Cue chips */}
          {cues.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {cues.map((cue, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1.5 rounded-full text-sm bg-codex-gold/20 text-codex-gold border border-codex-gold/30 flex items-center gap-2"
                >
                  {cue}
                  <button
                    onClick={() => removeCue(index)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={newCue}
              onChange={(e) => setNewCue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add retrieval cue..."
              className="bg-background/60 border-border/40 text-base h-11 placeholder:text-foreground/40 flex-1"
              autoComplete="off"
              disabled={cues.length >= 5}
            />
            <Button
              onClick={addCue}
              disabled={!newCue.trim() || cues.length >= 5}
              size="icon"
              className="h-11 w-11 bg-codex-gold/20 hover:bg-codex-gold/30 text-codex-gold border border-codex-gold/30"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: canContinue ? 1 : 0.4 }}
          className="mt-6"
        >
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-12 bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep font-medium text-base"
          >
            {!isProcessingComplete ? (
              'Waiting for analysis...'
            ) : cues.length === 0 ? (
              'Add at least one cue to continue'
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Breathing text - always visible */}
        <motion.p
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 text-muted-foreground/60 text-sm text-center"
        >
          Breathe. Your thoughts are being preserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
