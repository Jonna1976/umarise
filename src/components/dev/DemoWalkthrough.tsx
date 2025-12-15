import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileText, BookOpen, ArrowRight, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface WalkthroughStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  illustration: React.ReactNode;
}

const steps: WalkthroughStep[] = [
  {
    icon: <Camera className="w-4 h-4" />,
    title: "Open App",
    subtitle: "Camera opens instantly",
    description: "App opent direct in camera view — geen onboarding, geen menu.",
    illustration: (
      <div className="w-32 h-44 rounded-lg border-2 border-dashed border-oker/50 bg-forest-deep/50 flex flex-col items-center justify-end p-4">
        <div className="w-10 h-10 rounded-full border-2 border-oker bg-transparent" />
      </div>
    ),
  },
  {
    icon: <Camera className="w-4 h-4" />,
    title: "Capture",
    subtitle: "Point & tap",
    description: "Richt op handgeschreven pagina, tik om te fotograferen.",
    illustration: (
      <div className="w-32 h-44 rounded-lg bg-muted/30 flex flex-col items-center justify-start p-4 gap-2">
        <div className="w-full h-2 bg-muted/50 rounded" />
        <div className="w-full h-2 bg-muted/50 rounded" />
        <div className="w-full h-2 bg-muted/50 rounded" />
        <div className="w-3/4 h-2 bg-muted/50 rounded" />
      </div>
    ),
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Processing",
    subtitle: "< 5 seconds",
    description: "AI leest en interpreteert de handgeschreven tekst.",
    illustration: (
      <div className="w-32 h-44 rounded-lg bg-forest-deep/50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-oker border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground mt-3">Analyzing...</span>
      </div>
    ),
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Snapshot",
    subtitle: "Instant insight",
    description: "Samenvatting, tone, keywords — direct bruikbaar.",
    illustration: (
      <div className="w-32 h-44 rounded-lg bg-cream shadow-lg flex flex-col p-3 gap-2">
        <div className="w-full h-10 bg-muted/30 rounded" />
        <div className="w-full h-2 bg-forest/30 rounded" />
        <div className="w-3/4 h-2 bg-forest/20 rounded" />
        <div className="flex justify-center mt-2">
          <span className="text-[8px] px-2 py-0.5 bg-teal/20 text-teal rounded-full">focused</span>
        </div>
        <div className="flex gap-1 justify-center">
          <span className="text-[6px] px-1 py-0.5 bg-oker/20 text-oker rounded">idea</span>
          <span className="text-[6px] px-1 py-0.5 bg-oker/20 text-oker rounded">project</span>
          <span className="text-[6px] px-1 py-0.5 bg-oker/20 text-oker rounded">next</span>
        </div>
      </div>
    ),
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Timeline",
    subtitle: "Codex grows",
    description: "Elke capture voegt toe aan je persoonlijke codex.",
    illustration: (
      <div className="w-32 h-44 rounded-lg bg-cream shadow-lg flex flex-col p-3">
        <span className="text-[10px] font-medium text-forest mb-2">Your Codex</span>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-6 h-6 bg-muted/30 rounded" />
              <div className="flex-1 h-2 bg-forest/20 rounded" />
            </div>
          ))}
          <div className="flex gap-2 items-center bg-oker/10 rounded p-1 -mx-1">
            <div className="w-6 h-6 bg-oker/30 rounded" />
            <div className="flex-1 h-2 bg-oker/40 rounded" />
          </div>
        </div>
      </div>
    ),
  },
];

export function DemoWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-forest-deep flex flex-col">
      {/* Header */}
      <div className="p-4">
        <h1 className="font-playfair text-lg text-cream">Demo Walkthrough</h1>
        <p className="text-xs text-muted-foreground">60-second hero demo flow</p>
        {/* Progress bar */}
        <div className="mt-3 h-0.5 bg-forest rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-oker"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration */}
            <div className="mb-8">{step.illustration}</div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              {step.icon}
              <span>STEP {currentStep + 1} OF {steps.length}</span>
            </div>

            {/* Title */}
            <h2 className="font-playfair text-2xl text-cream mb-1">{step.title}</h2>
            <p className="text-oker text-sm mb-3">{step.subtitle}</p>
            <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentStep
                ? 'w-6 h-2 bg-oker'
                : 'w-2 h-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-forest p-4">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-muted-foreground hover:text-cream"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-muted-foreground hover:text-cream disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Link to="/">
            <Button
              variant="default"
              onClick={isLastStep ? undefined : handleNext}
              className="bg-oker hover:bg-oker/90 text-forest-deep"
            >
              {isLastStep ? (
                <>
                  Complete
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={isLastStep}
            className="border-oker text-oker hover:bg-oker hover:text-forest-deep disabled:opacity-30"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-muted-foreground/50 text-xs mt-3 italic font-serif">
          Photos for handwriting.
        </p>
      </div>
    </div>
  );
}
