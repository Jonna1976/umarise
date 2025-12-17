import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (preCue && onPreCue) {
      onPreCue(preCue);
    }
  }, [preCue, onPreCue]);

  const remainingTime = Math.max(0, ESTIMATED_TIME - elapsedTime);
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-6 pt-12">
      {/* Image thumbnail - compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-32 h-24 rounded-lg overflow-hidden shadow-lg mb-8"
      >
        <img
          src={imageUrl}
          alt="Processing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-codex-ink/40 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-codex-gold" />
          </motion.div>
        </div>
      </motion.div>

      {/* Multi-page indicator */}
      {isMultiple && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-6"
        >
          <Images className="w-4 h-4 text-codex-gold" />
          <span className="text-codex-sepia">
            {completedCount} of {totalImages} complete
          </span>
        </motion.div>
      )}

      {/* Timer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-muted-foreground mb-10"
      >
        <Clock className="w-4 h-4" />
        <span className="text-base">
          {remainingTime > 0 ? `~${remainingTime}s` : 'Almost done...'}
        </span>
      </motion.div>

      {/* Main reflection content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-serif text-foreground mb-3">
          A moment for yourself.
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          While we read your handwriting, think about this:
        </p>

        {/* Question card */}
        <div className="bg-secondary/60 rounded-2xl p-8 border border-border/30">
          <p className="text-codex-gold font-serif text-2xl mb-3">
            What is this about?
          </p>
          <p className="text-muted-foreground text-base mb-6">
            What words would you type in 2030 to find this page again?
          </p>

          <Input
            value={preCue}
            onChange={(e) => setPreCue(e.target.value)}
            placeholder="e.g. funding pitch, Marco meeting..."
            className="bg-background/60 border-border/40 text-center text-lg h-12 placeholder:text-muted-foreground/40"
            autoComplete="off"
          />
          
          <p className="text-muted-foreground/50 text-sm mt-5">
            Optional — you can refine this after processing
          </p>
        </div>

        {/* Breathing text */}
        <motion.p
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-8 text-muted-foreground/60 text-base"
        >
          Breathe. Your thoughts are being preserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
