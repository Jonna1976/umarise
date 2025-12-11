import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ProcessingViewProps {
  imageUrl: string;
}

export function ProcessingView({ imageUrl }: ProcessingViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm"
      >
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
              Reading your page…
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
        />
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-muted-foreground text-sm text-center"
      >
        Extracting ideas, tone, and patterns…
      </motion.p>
    </div>
  );
}
