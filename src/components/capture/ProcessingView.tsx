import { motion } from 'framer-motion';
import { Sparkles, Images, Check, BookOpen, Brain, Star, Compass } from 'lucide-react';

interface ProcessingViewProps {
  imageUrl: string;
  totalImages?: number;
  currentIndex?: number;
  completedCount?: number;
  currentPageCount?: number;
}

const MILESTONES = [
  { count: 1, label: 'First capture', icon: BookOpen },
  { count: 2, label: 'Threads emerge', icon: Compass },
  { count: 3, label: 'Patterns unlock', icon: Brain },
  { count: 5, label: 'Personality reveal', icon: Star },
];

export function ProcessingView({ 
  imageUrl, 
  totalImages = 1, 
  currentIndex = 0,
  completedCount = 0,
  currentPageCount = 0
}: ProcessingViewProps) {
  const isMultiple = totalImages > 1;
  
  // Calculate what milestone we're approaching
  const nextPageCount = currentPageCount + totalImages;
  const upcomingMilestone = MILESTONES.find(m => currentPageCount < m.count && nextPageCount >= m.count);
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm"
      >
        {/* Multi-page indicator with parallel processing info */}
        {isMultiple && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-4"
          >
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-codex-gold" />
              <span className="text-codex-sepia font-medium">
                Processing {totalImages} pages in parallel
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {completedCount} of {totalImages} complete
            </span>
          </motion.div>
        )}

        {/* Progress dots for multiple images - showing completion state */}
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

        {/* Image preview with overlay */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <img
            src={imageUrl}
            alt="Processing page"
            className="w-full aspect-[3/4] object-cover"
          />
          
          {/* Processing overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-codex-ink/90 via-codex-ink/40 to-transparent flex flex-col items-center justify-end p-6">
            {/* Animated icon */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-codex-gold/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-codex-gold" />
              </div>
            </motion.div>

            {/* Processing text */}
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-primary-foreground font-serif text-lg"
            >
              {isMultiple 
                ? `Reading all ${totalImages} pages…` 
                : 'Reading your page…'}
            </motion.p>
          </div>
        </div>

        {/* Subtle pulse ring */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-xl border-2 border-codex-gold/30"
          style={{ top: isMultiple ? '5rem' : 0 }}
        />
      </motion.div>

      {/* Milestone teaser */}
      {upcomingMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-codex-gold/10 border border-codex-gold/20"
        >
          <div className="w-10 h-10 rounded-full bg-codex-gold/20 flex items-center justify-center">
            <upcomingMilestone.icon className="w-5 h-5 text-codex-gold" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {upcomingMilestone.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Unlocking after this capture...
            </p>
          </div>
        </motion.div>
      )}

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-muted-foreground text-sm text-center"
      >
        {isMultiple 
          ? `Processing all pages simultaneously for faster results…`
          : 'Extracting ideas, tone, and patterns…'}
      </motion.p>

      {/* Page count context */}
      {currentPageCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-2 text-xs text-muted-foreground/60"
        >
          This will be page {currentPageCount + 1}{totalImages > 1 ? `-${currentPageCount + totalImages}` : ''} in your memory
        </motion.p>
      )}
    </div>
  );
}
