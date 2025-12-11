import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, Camera, Sparkles, Shield } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: BookOpen,
    title: "Keep writing in your own notebook",
    description: "Moleskine, cheap notebook, index cards — whatever works for you. Umarise doesn't replace your analog world.",
    accent: "Your notebook stays primary.",
  },
  {
    icon: Camera,
    title: "Capture your pages",
    description: "When something matters, take a photo. That's it. No tags, no folders, no friction.",
    accent: "One tap to preserve.",
  },
  {
    icon: Sparkles,
    title: "We build your codex",
    description: "Snapshots of what mattered in each moment. Over time: patterns across weeks, threads across years.",
    accent: "Your ideas, connected.",
  },
  {
    icon: Shield,
    title: "Private by design",
    description: "No account. No password. Everything you drop here is tied to this device only.",
    accent: "Your thoughts are yours.",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center max-w-sm"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mb-8 inline-flex"
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
                <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-4 leading-tight">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed mb-4">
              {slide.description}
            </p>

            {/* Accent text */}
            <p className="text-codex-sepia font-medium italic">
              {slide.accent}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-12">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary w-6'
                  : 'bg-border hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleNext}
          variant="codex"
          size="xl"
          className="w-full"
        >
          {isLastSlide ? 'Start capturing' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
