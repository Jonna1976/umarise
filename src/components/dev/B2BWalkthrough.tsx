import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle, X, Upload, Database, Cpu, Search, Hash, ShieldCheck, Building2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface WalkthroughStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  owner: 'partner' | 'umarise';
}

const steps: WalkthroughStep[] = [
  {
    icon: <Upload className="w-4 h-4" />,
    title: "Capture",
    subtitle: "Partner ingests data",
    description: "Your system captures artifacts. Documents, images, records.",
    owner: 'partner',
  },
  {
    icon: <Hash className="w-4 h-4" />,
    title: "Seal",
    subtitle: "Umarise computes hash",
    description: "POST /origins — SHA-256 hash computed. Origin ID returned.",
    owner: 'umarise',
  },
  {
    icon: <Database className="w-4 h-4" />,
    title: "Store",
    subtitle: "Partner retains artifact",
    description: "Your vault, your storage. Umarise holds only the hash.",
    owner: 'partner',
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    title: "Process",
    subtitle: "Partner applies AI/workflows",
    description: "Your AI indexes, transforms, enriches. Origin unchanged.",
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
    icon: <ShieldCheck className="w-4 h-4" />,
    title: "Verify",
    subtitle: "Umarise confirms bit-identity",
    description: "POST /verify — Cryptographic proof. Hash matches origin.",
    owner: 'umarise',
  },
];

// Partner step illustration (grey/muted)
function PartnerIllustration({ step }: { step: WalkthroughStep }) {
  return (
    <motion.div 
      className="w-48 h-64 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center p-6 relative overflow-hidden"
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
        <span className="text-[9px] font-mono uppercase tracking-wider">Partner</span>
      </motion.div>
      
      {/* Icon */}
      <motion.div 
        className="w-20 h-20 rounded-full bg-stone-200 border-2 border-stone-300 flex items-center justify-center mb-4"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="text-stone-500">
          {step.icon && <span className="scale-[2] inline-block">{step.icon}</span>}
        </div>
      </motion.div>
      
      {/* Action indicator */}
      <motion.div
        className="px-4 py-2 bg-stone-200 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-[10px] text-stone-600 font-mono text-center">{step.subtitle}</p>
      </motion.div>
      
      {/* Your system label */}
      <motion.p
        className="mt-4 text-[9px] text-stone-400 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Your infrastructure
      </motion.p>
    </motion.div>
  );
}

// Umarise step illustration (copper accent)
function UmariseIllustration({ step }: { step: WalkthroughStep }) {
  const isSeal = step.title === "Seal";
  
  return (
    <motion.div 
      className="w-48 h-64 rounded-2xl bg-gradient-to-b from-landing-deep via-[hsl(25,25%,12%)] to-landing-deep border border-landing-copper/30 flex flex-col items-center justify-center p-6 relative overflow-hidden"
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
        <span className="text-[9px] font-mono uppercase tracking-wider text-landing-copper">Umarise</span>
      </motion.div>
      
      {/* Icon with glow */}
      <motion.div 
        className="w-20 h-20 rounded-full bg-landing-copper/20 border-2 border-landing-copper/50 flex items-center justify-center mb-4 relative"
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
          {step.icon && <span className="scale-[2] inline-block">{step.icon}</span>}
        </div>
        
        {/* Seal checkmark */}
        {isSeal && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-landing-copper flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="text-[8px] text-landing-deep font-bold">✓</span>
          </motion.div>
        )}
      </motion.div>
      
      {/* API endpoint */}
      <motion.div
        className="px-3 py-1.5 bg-landing-copper/10 rounded border border-landing-copper/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-[9px] text-landing-copper/70 font-mono">
          {isSeal ? 'POST /origins' : 'POST /verify'}
        </p>
      </motion.div>
      
      {/* Hash preview for Seal */}
      {isSeal && (
        <motion.div
          className="mt-3 px-2 py-1 bg-landing-deep/50 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[8px] text-landing-copper/50 font-mono">SHA-256: a7f3c2e1...</p>
        </motion.div>
      )}
      
      {/* Verified badge for Verify */}
      {!isSeal && (
        <motion.div
          className="mt-3 flex items-center gap-1.5 text-landing-copper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <CheckCircle className="w-3 h-3" />
          <span className="text-[9px] font-medium">Bit-identity confirmed</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function B2BWalkthrough() {
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
    <div className="min-h-screen bg-landing-deep flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-xl text-landing-cream">Partner Integration</h1>
          <p className="text-xs text-landing-muted mt-1">Walkthrough 2.0</p>
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
            <div className="mb-8">
              {step.owner === 'partner' ? (
                <PartnerIllustration step={step} />
              ) : (
                <UmariseIllustration step={step} />
              )}
            </div>

            {/* Step indicator */}
            <div className={`flex items-center gap-2 text-xs mb-3 ${
              step.owner === 'umarise' ? 'text-landing-copper' : 'text-landing-muted'
            }`}>
              {step.icon}
              <span className="uppercase tracking-wider font-mono">Step {currentStep + 1} of {steps.length}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl text-landing-cream mb-2">{step.title}</h2>
            <p className={`text-sm font-medium mb-4 font-mono ${
              step.owner === 'umarise' ? 'text-landing-copper' : 'text-landing-muted'
            }`}>{step.subtitle}</p>
            <p className="text-landing-muted text-sm max-w-xs leading-relaxed">{step.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step flow visualization */}
      <div className="flex justify-center gap-1.5 mb-6 px-4">
        {steps.map((s, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentStep
                ? `w-8 h-2 ${s.owner === 'umarise' ? 'bg-landing-copper' : 'bg-stone-400'}`
                : `w-2 h-2 ${s.owner === 'umarise' ? 'bg-landing-copper/30' : 'bg-stone-600'} hover:opacity-80`
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-landing-deep/80 backdrop-blur-sm p-5 border-t border-landing-muted/10">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-landing-muted hover:text-landing-cream hover:bg-landing-deep"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-landing-muted hover:text-landing-cream hover:bg-landing-deep disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {isLastStep ? (
            <Link to="/">
              <Button
                className="bg-landing-copper hover:bg-landing-copper/90 text-landing-deep font-medium px-6"
              >
                Complete
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-landing-copper hover:bg-landing-copper/90 text-landing-deep font-medium px-6"
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
            className="border-landing-copper text-landing-copper hover:bg-landing-copper hover:text-landing-deep disabled:opacity-30"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-landing-muted/40 text-xs mt-4 italic font-mono tracking-wide">
          Partner stores. Umarise seals.
        </p>
      </div>
    </div>
  );
}
