import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Camera, 
  FileText, 
  BookOpen, 
  ArrowRight, 
  Play,
  Pause,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface DemoWalkthroughProps {
  onClose: () => void;
}

const DEMO_STEPS = [
  {
    id: 'open',
    title: 'Open App',
    subtitle: 'Camera opens instantly',
    description: 'App opent direct in camera view — geen onboarding, geen menu.',
    icon: Camera,
    duration: 2000,
    visual: 'camera',
  },
  {
    id: 'capture',
    title: 'Capture',
    subtitle: 'Point & tap',
    description: 'Richt op handgeschreven pagina, tik om te fotograferen.',
    icon: Camera,
    duration: 2000,
    visual: 'capture',
  },
  {
    id: 'processing',
    title: 'Processing',
    subtitle: '< 5 seconds',
    description: 'AI leest en interpreteert de handgeschreven tekst.',
    icon: FileText,
    duration: 3000,
    visual: 'processing',
  },
  {
    id: 'snapshot',
    title: 'Snapshot',
    subtitle: 'Instant insight',
    description: 'Samenvatting, tone, keywords — direct bruikbaar.',
    icon: FileText,
    duration: 3000,
    visual: 'snapshot',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    subtitle: 'Codex grows',
    description: 'Elke capture voegt toe aan je persoonlijke codex.',
    icon: BookOpen,
    duration: 2000,
    visual: 'timeline',
  },
];

export function DemoWalkthrough({ onClose }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const step = DEMO_STEPS[currentStep];
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setHasCompleted(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setHasCompleted(false);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playThroughSteps();
    }
  };

  const playThroughSteps = async () => {
    for (let i = currentStep; i < DEMO_STEPS.length; i++) {
      if (!isPlaying && i !== currentStep) break;
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, DEMO_STEPS[i].duration));
    }
    setIsPlaying(false);
    setHasCompleted(true);
  };

  // Visual representations for each step
  const renderVisual = () => {
    switch (step.visual) {
      case 'camera':
        return (
          <motion.div 
            className="relative w-48 h-64 bg-gradient-to-b from-codex-forest to-codex-ink-deep rounded-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Camera viewfinder */}
            <div className="absolute inset-4 border-2 border-codex-gold/30 rounded-lg">
              <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-codex-gold rounded-tl" />
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-codex-gold rounded-tr" />
              <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-codex-gold rounded-bl" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-codex-gold rounded-br" />
            </div>
            {/* Scanning line */}
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-codex-gold to-transparent"
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Capture button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <motion.div 
                className="w-12 h-12 rounded-full border-4 border-codex-gold/60 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-8 h-8 rounded-full bg-codex-gold/80" />
              </motion.div>
            </div>
          </motion.div>
        );
      
      case 'capture':
        return (
          <motion.div 
            className="relative w-48 h-64 bg-gradient-to-b from-codex-forest to-codex-ink-deep rounded-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Flash effect */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
            />
            {/* Handwriting preview */}
            <div className="absolute inset-6 bg-codex-cream/10 rounded-lg p-3">
              <div className="space-y-2">
                <div className="h-1.5 bg-codex-cream/30 rounded w-full" />
                <div className="h-1.5 bg-codex-cream/25 rounded w-4/5" />
                <div className="h-1.5 bg-codex-cream/20 rounded w-full" />
                <div className="h-1.5 bg-codex-cream/25 rounded w-3/4" />
                <div className="h-1.5 bg-codex-cream/30 rounded w-5/6" />
              </div>
            </div>
          </motion.div>
        );
      
      case 'processing':
        return (
          <motion.div 
            className="relative w-48 h-64 bg-gradient-to-b from-codex-forest to-codex-ink-deep rounded-2xl overflow-hidden flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Processing spinner */}
            <motion.div
              className="w-20 h-20 rounded-full border-4 border-codex-gold/20 border-t-codex-gold"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p 
              className="absolute bottom-8 text-codex-cream/60 text-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Analyzing...
            </motion.p>
          </motion.div>
        );
      
      case 'snapshot':
        return (
          <motion.div 
            className="relative w-48 h-64 bg-codex-cream rounded-2xl overflow-hidden p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Image thumbnail */}
            <div className="w-full h-20 bg-codex-forest/20 rounded-lg mb-3" />
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-2 bg-codex-ink/60 rounded w-full mb-1.5" />
              <div className="h-2 bg-codex-ink/40 rounded w-4/5 mb-3" />
            </motion.div>
            {/* Tone badge */}
            <motion.div
              className="inline-block px-2 py-0.5 bg-codex-gold/20 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-[8px] text-codex-gold font-medium">focused</span>
            </motion.div>
            {/* Keywords */}
            <motion.div 
              className="flex gap-1 mt-2 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="px-1.5 py-0.5 bg-codex-sepia/10 rounded text-[7px] text-codex-sepia">idea</span>
              <span className="px-1.5 py-0.5 bg-codex-sepia/10 rounded text-[7px] text-codex-sepia">project</span>
              <span className="px-1.5 py-0.5 bg-codex-sepia/10 rounded text-[7px] text-codex-sepia">next</span>
            </motion.div>
          </motion.div>
        );
      
      case 'timeline':
        return (
          <motion.div 
            className="relative w-48 h-64 bg-codex-cream rounded-2xl overflow-hidden p-3"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-3">
              <span className="text-[10px] font-medium text-codex-ink">Your Codex</span>
            </div>
            {/* Timeline items */}
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 p-1.5 bg-white rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                >
                  <div className="w-8 h-10 bg-codex-forest/20 rounded" />
                  <div className="flex-1">
                    <div className="h-1.5 bg-codex-ink/40 rounded w-full mb-1" />
                    <div className="h-1 bg-codex-ink/20 rounded w-3/4" />
                  </div>
                </motion.div>
              ))}
              {/* New item highlight */}
              <motion.div
                className="flex items-center gap-2 p-1.5 bg-codex-gold/10 rounded-lg border border-codex-gold/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-8 h-10 bg-codex-gold/30 rounded" />
                <div className="flex-1">
                  <div className="h-1.5 bg-codex-gold/60 rounded w-full mb-1" />
                  <div className="h-1 bg-codex-gold/40 rounded w-3/4" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <CheckCircle2 className="w-3 h-3 text-codex-gold" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-codex-ink-deep/95 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-codex-gold/20">
        <div>
          <h2 className="font-serif text-lg text-codex-cream">Demo Walkthrough</h2>
          <p className="text-xs text-codex-cream/50">60-second hero demo flow</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-codex-cream/10 transition-colors"
        >
          <X className="w-4 h-4 text-codex-cream/70" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-codex-gold/10">
        <motion.div
          className="h-full bg-codex-gold"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {hasCompleted ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-codex-gold/20 flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle2 className="w-10 h-10 text-codex-gold" />
              </motion.div>
              <h3 className="font-serif text-2xl text-codex-cream mb-2">Demo Complete</h3>
              <p className="text-codex-cream/60 text-sm mb-6 max-w-xs">
                "This is Photos for handwriting."
              </p>
              <p className="text-codex-gold text-xs italic">
                If the product needs explanation → simplify.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Visual */}
              <div className="mb-8">
                {renderVisual()}
              </div>

              {/* Step info */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <step.icon className="w-5 h-5 text-codex-gold" />
                <span className="text-xs text-codex-cream/50 uppercase tracking-wider">
                  Step {currentStep + 1} of {DEMO_STEPS.length}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-codex-cream mb-1">{step.title}</h3>
              <p className="text-codex-gold text-sm mb-3">{step.subtitle}</p>
              <p className="text-codex-cream/60 text-sm max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 pb-4">
        {DEMO_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setCurrentStep(i);
              setHasCompleted(false);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentStep
                ? 'bg-codex-gold w-6'
                : i < currentStep || hasCompleted
                ? 'bg-codex-gold/50'
                : 'bg-codex-cream/20'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 p-4 border-t border-codex-gold/20">
        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="text-codex-cream/70 hover:text-codex-cream hover:bg-codex-cream/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={handlePrev}
          variant="ghost"
          size="sm"
          disabled={currentStep === 0}
          className="text-codex-cream/70 hover:text-codex-cream hover:bg-codex-cream/10 disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Button>

        <Button
          onClick={hasCompleted ? handleReset : handleNext}
          className="bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep px-6"
        >
          {hasCompleted ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </>
          ) : currentStep === DEMO_STEPS.length - 1 ? (
            <>
              Complete
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
        
        <Button
          onClick={handleNext}
          variant="ghost"
          size="sm"
          disabled={hasCompleted}
          className="text-codex-cream/70 hover:text-codex-cream hover:bg-codex-cream/10 disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer tagline */}
      <div className="text-center pb-6">
        <p className="text-codex-cream/30 text-xs font-serif italic">
          Photos for handwriting.
        </p>
      </div>
    </motion.div>
  );
}
