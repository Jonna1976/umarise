import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileText, BookOpen, ArrowRight, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface WalkthroughStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const steps: WalkthroughStep[] = [
  {
    icon: <Camera className="w-4 h-4" />,
    title: "Open App",
    subtitle: "Camera opens instantly",
    description: "App opent direct in camera view — geen onboarding, geen menu.",
  },
  {
    icon: <Camera className="w-4 h-4" />,
    title: "Capture",
    subtitle: "Point & tap",
    description: "Richt op handgeschreven pagina, tik om te fotograferen.",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Processing",
    subtitle: "< 5 seconds",
    description: "AI leest en interpreteert de handgeschreven tekst.",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Snapshot",
    subtitle: "Instant insight",
    description: "Samenvatting, tone, keywords — direct bruikbaar.",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Timeline",
    subtitle: "Codex grows",
    description: "Elke capture voegt toe aan je persoonlijke codex.",
  },
];

// Step 1: Camera view with viewfinder
function CameraIllustration() {
  return (
    <motion.div 
      className="w-40 h-56 rounded-xl border-2 border-dashed border-oker/60 bg-forest/40 flex flex-col items-center justify-end p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Viewfinder corners */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-oker" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-oker" />
      <div className="absolute bottom-16 left-4 w-6 h-6 border-b-2 border-l-2 border-oker" />
      <div className="absolute bottom-16 right-4 w-6 h-6 border-b-2 border-r-2 border-oker" />
      
      {/* Shutter button */}
      <motion.div 
        className="w-14 h-14 rounded-full border-3 border-oker bg-transparent flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-oker/20"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// Step 2: Capturing with scan lines
function CaptureIllustration() {
  return (
    <motion.div 
      className="w-40 h-56 rounded-xl bg-muted/20 backdrop-blur-sm flex flex-col items-center justify-start p-5 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Handwriting lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div 
          key={i}
          className="w-full h-2.5 bg-cream/30 rounded mb-3"
          initial={{ width: 0 }}
          animate={{ width: i === 4 ? '70%' : '100%' }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        />
      ))}
      
      {/* Scanning line */}
      <motion.div 
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-oker to-transparent"
        initial={{ top: 0 }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Step 3: Processing spinner
function ProcessingIllustration() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="w-40 h-56 rounded-xl bg-forest/40 flex flex-col items-center justify-center p-6 relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Spinner ring */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--forest))"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--oker))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (progress / 100) * 251.2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-oker font-medium">{progress}%</span>
        </div>
      </div>
      
      <motion.span 
        className="text-xs text-muted-foreground mt-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analyzing...
      </motion.span>
    </motion.div>
  );
}

// Step 4: Snapshot card appearing
function SnapshotIllustration() {
  return (
    <motion.div 
      className="w-40 h-56 rounded-xl bg-cream shadow-xl flex flex-col p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Image placeholder */}
      <motion.div 
        className="w-full h-16 bg-muted/40 rounded-lg mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      
      {/* Summary lines */}
      <motion.div 
        className="w-full h-2 bg-forest/40 rounded mb-2"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />
      <motion.div 
        className="w-3/4 h-2 bg-forest/25 rounded mb-4"
        initial={{ width: 0 }}
        animate={{ width: '75%' }}
        transition={{ delay: 0.4, duration: 0.4 }}
      />
      
      {/* Tone badge */}
      <motion.div 
        className="flex justify-center mb-3"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <span className="text-[10px] px-3 py-1 bg-teal/20 text-teal rounded-full font-medium">
          focused
        </span>
      </motion.div>
      
      {/* Keywords */}
      <motion.div 
        className="flex gap-1.5 justify-center flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {['idea', 'project', 'next'].map((kw, i) => (
          <motion.span 
            key={kw}
            className="text-[8px] px-2 py-0.5 bg-oker/20 text-oker rounded font-medium"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            {kw}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Step 5: Timeline growing
function TimelineIllustration() {
  return (
    <motion.div 
      className="w-40 h-56 rounded-xl bg-cream shadow-xl flex flex-col p-4 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-[11px] font-semibold text-forest mb-3">Your Codex</span>
      
      {/* Existing items */}
      {[0, 1, 2].map((i) => (
        <motion.div 
          key={i}
          className="flex gap-2 items-center mb-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <div className="w-7 h-7 bg-muted/40 rounded flex-shrink-0" />
          <div className="flex-1 h-2 bg-forest/20 rounded" />
        </motion.div>
      ))}
      
      {/* New item appearing with glow */}
      <motion.div 
        className="flex gap-2 items-center bg-oker/15 rounded-lg p-1.5 -mx-1.5 relative"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <motion.div 
          className="absolute inset-0 rounded-lg bg-oker/20"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="w-7 h-7 bg-oker/30 rounded flex-shrink-0 relative z-10" />
        <div className="flex-1 h-2 bg-oker/40 rounded relative z-10" />
        <motion.div
          className="w-4 h-4 rounded-full border border-oker flex items-center justify-center relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <CheckCircle className="w-3 h-3 text-oker" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const illustrations = [
  CameraIllustration,
  CaptureIllustration,
  ProcessingIllustration,
  SnapshotIllustration,
  TimelineIllustration,
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
  const Illustration = illustrations[currentStep];

  return (
    <div className="min-h-screen bg-forest-deep flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0">
        <h1 className="font-playfair text-xl text-cream">Demo Walkthrough</h1>
        <p className="text-xs text-muted-foreground mt-0.5">60-second hero demo flow</p>
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
              <span className="uppercase tracking-wider">Step {currentStep + 1} of {steps.length}</span>
            </div>

            {/* Title */}
            <h2 className="font-playfair text-3xl text-cream mb-2">{step.title}</h2>
            <p className="text-oker text-sm font-medium mb-4">{step.subtitle}</p>
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
        <p className="text-center text-muted-foreground/40 text-xs mt-4 italic font-serif tracking-wide">
          Photos for handwriting.
        </p>
      </div>
    </div>
  );
}
