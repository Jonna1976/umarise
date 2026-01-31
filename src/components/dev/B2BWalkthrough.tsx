import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle, X, Upload, Database, Cpu, Search, Hash, Fingerprint, Building2, Circle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface WalkthroughStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  owner: 'partner' | 'umarise' | 'intro';
}

const steps: WalkthroughStep[] = [
  {
    icon: <HelpCircle className="w-4 h-4" />,
    title: "Need verifiable origin?",
    subtitle: "",
    description: "",
    owner: 'intro',
  },
  {
    icon: <Upload className="w-4 h-4" />,
    title: "Capture",
    subtitle: "Partner creates artifact",
    description: "Your system captures an artifact that needs provable origin.",
    owner: 'partner',
  },
  {
    icon: <Hash className="w-4 h-4" />,
    title: "Seal",
    subtitle: "Umarise records origin",
    description: "Any artifact. Any format. One API call. Origin anchored.",
    owner: 'umarise',
  },
  {
    icon: <Database className="w-4 h-4" />,
    title: "Store",
    subtitle: "Partner retains artifact",
    description: "Your vault, your storage. Umarise holds only the origin hash.",
    owner: 'partner',
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    title: "Process",
    subtitle: "Partner applies AI/workflows",
    description: "Your AI transforms, enriches. The recorded origin stays unchanged.",
    owner: 'partner',
  },
  {
    icon: <Search className="w-4 h-4" />,
    title: "Retrieve",
    subtitle: "Partner searches & presents",
    description: "Your search, your UX. GET /resolve to look up origin metadata.",
    owner: 'partner',
  },
  {
    icon: <Fingerprint className="w-4 h-4" />,
    title: "Verify",
    subtitle: "Umarise confirms origin",
    description: "POST /verify — Prove the artifact matches its recorded origin.",
    owner: 'umarise',
  },
];

// Partner step illustration (grey/muted)
function PartnerIllustration({ step }: { step: WalkthroughStep }) {
  return (
    <motion.div 
      className="w-56 h-72 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Partner badge */}
      <motion.div 
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-stone-200 rounded text-stone-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Building2 className="w-3 h-3" />
        <span className="text-[10px] font-mono uppercase tracking-wider">Partner</span>
      </motion.div>
      
      {/* Icon */}
      <motion.div 
        className="w-24 h-24 rounded-full bg-stone-200 border-2 border-stone-300 flex items-center justify-center mb-4"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="text-stone-500">
          {step.icon && <span className="scale-[2.5] inline-block">{step.icon}</span>}
        </div>
      </motion.div>
      
      {/* Action indicator */}
      <motion.div
        className="px-5 py-2.5 bg-stone-200 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-stone-600 font-mono text-center">{step.subtitle}</p>
      </motion.div>
      
      {/* Your system label */}
      <motion.p
        className="mt-5 text-[10px] text-stone-400 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Your infrastructure
      </motion.p>
    </motion.div>
  );
}

// Intro slide illustration
function IntroIllustration() {
  return (
    <motion.div 
      className="w-64 h-80 rounded-2xl bg-gradient-to-b from-landing-deep via-[hsl(25,25%,12%)] to-landing-deep border border-landing-copper/20 flex flex-col items-center justify-center p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Integration time badge */}
      <motion.div 
        className="absolute top-3 right-3 px-2 py-1 bg-landing-copper/10 rounded border border-landing-copper/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-[9px] font-mono text-landing-copper/70">{'<'} 1 hour</span>
      </motion.div>
      
      {/* Question mark with glow */}
      <motion.div 
        className="w-24 h-24 rounded-full border-2 border-landing-copper/30 flex items-center justify-center mb-6"
        animate={{ 
          borderColor: [
            'hsla(25, 35%, 42%, 0.3)',
            'hsla(25, 35%, 42%, 0.6)',
            'hsla(25, 35%, 42%, 0.3)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-4xl text-landing-copper font-serif">?</span>
      </motion.div>
      
      {/* Decision: POST /origins */}
      <motion.div
        className="px-5 py-3 bg-landing-copper/10 rounded-lg border border-landing-copper/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-landing-copper font-mono text-center">POST /origins</p>
      </motion.div>
      
      {/* Arrow indicator */}
      <motion.div
        className="mt-5 text-landing-copper/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <ArrowRight className="w-5 h-5" />
      </motion.div>
    </motion.div>
  );
}

// Umarise step illustration (copper accent)
function UmariseIllustration({ step }: { step: WalkthroughStep }) {
  const isSeal = step.title === "Seal";
  
  return (
    <motion.div 
      className="w-56 h-72 rounded-2xl bg-gradient-to-b from-landing-deep via-[hsl(25,25%,12%)] to-landing-deep border border-landing-copper/30 flex flex-col items-center justify-center p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Umarise badge */}
      <motion.div 
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-landing-copper/20 rounded border border-landing-copper/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Circle className="w-2.5 h-2.5 fill-landing-copper text-landing-copper" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-landing-copper">Umarise</span>
      </motion.div>
      
      {/* Icon with glow */}
      <motion.div 
        className="w-24 h-24 rounded-full bg-landing-copper/20 border-2 border-landing-copper/50 flex items-center justify-center mb-4 relative"
        animate={{ 
          boxShadow: [
            '0 0 0 0 hsla(25, 35%, 42%, 0)',
            '0 0 30px 10px hsla(25, 35%, 42%, 0.3)',
            '0 0 0 0 hsla(25, 35%, 42%, 0)',
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="text-landing-copper">
          {step.icon && <span className="scale-[2.5] inline-block">{step.icon}</span>}
        </div>
        
        {/* Seal checkmark */}
        {isSeal && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-landing-copper flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="text-[10px] text-landing-deep font-bold">✓</span>
          </motion.div>
        )}
      </motion.div>
      
      {/* API endpoint */}
      <motion.div
        className="px-4 py-2 bg-landing-copper/10 rounded border border-landing-copper/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-landing-copper/70 font-mono">
          {isSeal ? 'POST /origins' : 'POST /verify'}
        </p>
      </motion.div>
      
      {/* Hash preview for Seal */}
      {isSeal && (
        <motion.div
          className="mt-4 px-3 py-1.5 bg-landing-deep/50 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[10px] text-landing-copper/50 font-mono">SHA-256: a7f3c2e1...</p>
        </motion.div>
      )}
      
      {/* Verified badge for Verify */}
      {!isSeal && (
        <motion.div
          className="mt-4 flex items-center gap-2 text-landing-copper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Bit-identity confirmed</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function B2BWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dragDirection, setDragDirection] = useState<number>(0);

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

  // Swipe handlers
  const handleDragEnd = (event: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      // Swiped left → next
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      // Swiped right → prev
      handlePrev();
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-landing-deep flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-xl text-landing-cream">Partner Integration</h1>
          <p className="text-xs text-landing-muted mt-1">Origin Recording Flow</p>
        </div>
        <Link to="/">
          <Button
            variant="ghost"
            size="icon"
            className="text-landing-muted hover:text-landing-cream hover:bg-landing-deep -mt-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      
      <div className="px-5">
        {/* Progress bar */}
        <div className="mt-4 h-1 bg-landing-deep rounded-full overflow-hidden border border-landing-muted/20">
          <motion.div
            className="h-full bg-gradient-to-r from-landing-copper to-landing-copper/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        
        {/* Swim lane legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-stone-300" />
            <span className="text-[10px] text-landing-muted font-mono">Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-landing-copper" />
            <span className="text-[10px] text-landing-copper font-mono">Umarise</span>
          </div>
        </div>
      </div>

      {/* Swipeable Content Area */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center px-6 py-8 cursor-grab active:cursor-grabbing touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        key={currentStep}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: dragDirection > 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dragDirection > 0 ? 50 : -50 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration */}
            <div className="mb-8 pointer-events-none">
              {step.owner === 'intro' ? (
                <IntroIllustration />
              ) : step.owner === 'partner' ? (
                <PartnerIllustration step={step} />
              ) : (
                <UmariseIllustration step={step} />
              )}
            </div>

            {/* Step indicator - hide for intro */}
            {step.owner !== 'intro' && (
              <div className={`flex items-center gap-2 text-xs mb-3 ${
                step.owner === 'umarise' ? 'text-landing-copper' : 'text-landing-muted'
              }`}>
                {step.icon}
                <span className="uppercase tracking-wider font-mono">Step {currentStep} of {steps.length - 1}</span>
              </div>
            )}

            {/* Title */}
            <h2 className={`font-serif mb-2 ${step.owner === 'intro' ? 'text-4xl text-landing-copper' : 'text-3xl text-landing-cream'}`}>
              {step.title}
            </h2>
            {step.subtitle && (
              <p className={`text-sm font-medium mb-4 font-mono ${
                step.owner === 'umarise' ? 'text-landing-copper' : 'text-landing-muted'
              }`}>{step.subtitle}</p>
            )}
            {step.description && (
              <p className="text-landing-muted text-sm max-w-xs leading-relaxed">{step.description}</p>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Swipe hint - show only on first step */}
        {isFirstStep && (
          <motion.p 
            className="text-landing-muted/40 text-xs mt-6 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Swipe to navigate</span>
            <ArrowRight className="w-3 h-3" />
          </motion.p>
        )}
      </motion.div>

      {/* Step flow visualization */}
      <div className="flex justify-center gap-1.5 mb-6 px-4">
        {steps.map((s, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentStep
                ? `w-8 h-2 ${s.owner === 'intro' ? 'bg-landing-copper/50' : s.owner === 'umarise' ? 'bg-landing-copper' : 'bg-stone-400'}`
                : `w-2 h-2 ${s.owner === 'intro' ? 'bg-landing-copper/20' : s.owner === 'umarise' ? 'bg-landing-copper/30' : 'bg-stone-600'} hover:opacity-80`
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Simplified Footer */}
      <div className="bg-landing-deep/80 backdrop-blur-sm p-5 border-t border-landing-muted/10">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-landing-muted hover:text-landing-cream hover:bg-landing-deep"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          {isLastStep ? (
            <Link to="/">
              <Button
                className="bg-landing-copper hover:bg-landing-copper/90 text-landing-deep font-medium px-8"
              >
                Complete
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-landing-copper hover:bg-landing-copper/90 text-landing-deep font-medium px-8"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        <p className="text-center text-landing-muted/40 text-xs mt-4 italic font-mono tracking-wide">
          Partner stores. Umarise records origin.
        </p>
      </div>
    </div>
  );
}
