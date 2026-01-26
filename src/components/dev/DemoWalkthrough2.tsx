import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle, X, Aperture, Camera, Hash, FileText, Search, Archive, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  LensIllustration,
  CaptureIllustration,
  SealIllustration,
  RecordIllustration,
  RetrieveIllustration,
  ArchiveIllustration,
  VerifyIllustration,
} from './walkthrough/NotaryIllustrations';

interface WalkthroughStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const steps: WalkthroughStep[] = [
  {
    icon: <Aperture className="w-4 h-4" />,
    title: "Lens",
    subtitle: "Record what exists",
    description: "Point at what you want to preserve.",
  },
  {
    icon: <Camera className="w-4 h-4" />,
    title: "Capture",
    subtitle: "Preserve original state",
    description: "One tap. Original state fixed.",
  },
  {
    icon: <Hash className="w-4 h-4" />,
    title: "Seal",
    subtitle: "Hash computed, cues assigned",
    description: "SHA-256 locks the artifact. Your cues index it.",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Record",
    subtitle: "Origin + AI index (labeled)",
    description: "AI indexes. Origin unchanged.",
  },
  {
    icon: <Search className="w-4 h-4" />,
    title: "Retrieve",
    subtitle: "Find by cue or meaning",
    description: "Search by your words or semantic match.",
  },
  {
    icon: <Archive className="w-4 h-4" />,
    title: "Archive",
    subtitle: "Every record, unchanged",
    description: "Your records. Immutable. Always.",
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    title: "Verify",
    subtitle: "Bit-identity confirmed",
    description: "Prove it existed. Prove it's unchanged.",
  },
];

const illustrations = [
  LensIllustration,
  CaptureIllustration,
  SealIllustration,
  RecordIllustration,
  RetrieveIllustration,
  ArchiveIllustration,
  VerifyIllustration,
];

export function DemoWalkthrough2() {
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
  const Illustration = illustrations[currentStep];

  return (
    <div className="min-h-screen bg-forest-deep flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0 flex items-start justify-between">
        <div>
          <h1 className="font-playfair text-xl text-cream">The Origin Path</h1>
        </div>
        <Link to="/">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-cream hover:bg-forest -mt-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      
      <div className="px-5">
        {/* Progress bar */}
        <div className="mt-4 h-1 bg-forest rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-oker to-oker/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration */}
            <div className="mb-10">
              <Illustration />
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
              {step.icon}
              <span className="uppercase tracking-wider font-mono">Step {currentStep + 1} of {steps.length}</span>
            </div>

            {/* Title */}
            <h2 className="font-playfair text-3xl text-cream mb-2">{step.title}</h2>
            <p className="text-oker text-sm font-medium mb-4 font-mono">{step.subtitle}</p>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{step.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentStep
                ? 'w-8 h-2 bg-oker'
                : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-forest/80 backdrop-blur-sm p-5 border-t border-forest">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-muted-foreground hover:text-cream hover:bg-forest"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-muted-foreground hover:text-cream hover:bg-forest disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {isLastStep ? (
            <Link to="/">
              <Button
                className="bg-oker hover:bg-oker/90 text-forest-deep font-medium px-6"
              >
                Complete
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-oker hover:bg-oker/90 text-forest-deep font-medium px-6"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
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
        <p className="text-center text-muted-foreground/40 text-xs mt-4 italic font-mono tracking-wide">
          Origin = Truth. AI = Index.
        </p>
      </div>
    </div>
  );
}
