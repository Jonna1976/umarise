import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileText, BookOpen, ArrowRight, ArrowLeft, RotateCcw, CheckCircle, Sparkles, Images } from 'lucide-react';
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
    description: "App opens directly to camera view — no onboarding, no menu.",
  },
  {
    icon: <Camera className="w-4 h-4" />,
    title: "Capture",
    subtitle: "Point & tap",
    description: "Point at your handwritten page, tap to photograph.",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Processing",
    subtitle: "< 5 seconds",
    description: "AI reads and interprets your handwritten text.",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Snapshot",
    subtitle: "Instant insight",
    description: "Summary, tone, keywords — immediately usable.",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Timeline",
    subtitle: "Memory grows",
    description: "Each capture adds to your personal memory.",
  },
];

// Step 1: Camera view - matches CameraView.tsx portal design
function CameraIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep via-forest to-forest-deep flex flex-col items-center justify-center p-6 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Viewfinder corners - matches real camera overlay */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-oker/60 rounded-tl" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-oker/60 rounded-tr" />
      <div className="absolute bottom-20 left-6 w-8 h-8 border-b-2 border-l-2 border-oker/60 rounded-bl" />
      <div className="absolute bottom-20 right-6 w-8 h-8 border-b-2 border-r-2 border-oker/60 rounded-br" />
      
      {/* Scanning line - matches real camera */}
      <motion.div 
        className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-oker/50 to-transparent"
        initial={{ top: '10%' }}
        animate={{ top: ['10%', '70%', '10%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Shutter button - matches real camera */}
      <motion.div 
        className="absolute bottom-4 w-14 h-14 rounded-full border-[3px] border-oker flex items-center justify-center"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-oker/30"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// Step 2: Capturing - matches portal with typewriter text
function CaptureIllustration() {
  const text = "Handwriting, turned into memory.";
  
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep via-forest to-forest-deep flex flex-col items-center justify-center p-4 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glowing portal circle - matches real upload portal */}
      <motion.div 
        className="relative w-24 h-24 rounded-full flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 30px 10px hsla(38, 70%, 50%, 0.15)',
            '0 0 50px 20px hsla(38, 70%, 50%, 0.3)',
            '0 0 30px 10px hsla(38, 70%, 50%, 0.15)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Inner breathing ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-oker/40"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        
        {/* Core glow */}
        <div className="w-16 h-16 rounded-full bg-oker/20 border border-oker/30" />
      </motion.div>
      
      {/* Typewriter text below portal */}
      <motion.p 
        className="mt-4 text-[10px] text-cream/70 italic text-center font-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {text.split("").slice(0, 20).map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
          >
            {char}
          </motion.span>
        ))}...
      </motion.p>
      
      {/* Orbiting file orbs - matches real multi-upload */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-oker"
          style={{
            boxShadow: '0 0 10px 3px hsla(38, 75%, 55%, 0.5)',
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            x: [40 * Math.cos(i * 2.1), 0],
            y: [40 * Math.sin(i * 2.1), 0],
            scale: [1, 0],
          }}
          transition={{ 
            delay: i * 0.3,
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </motion.div>
  );
}

// Step 3: Processing - matches ProcessingView.tsx exactly
function ProcessingIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-gradient-to-b from-forest-deep to-forest flex flex-col items-center justify-center p-4 relative overflow-hidden border border-forest"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image preview mockup */}
      <div className="w-28 h-36 rounded-xl bg-cream/10 relative overflow-hidden mb-3">
        {/* Gradient overlay - matches ProcessingView */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/40 to-transparent flex flex-col items-center justify-end p-3">
          {/* Rotating sparkle icon - matches ProcessingView */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="mb-2"
          >
            <div className="w-8 h-8 rounded-full bg-oker/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-oker" />
            </div>
          </motion.div>
        </div>
        
        {/* Pulse ring - matches ProcessingView */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl border-2 border-oker/30"
        />
      </div>
      
      {/* Processing text - matches ProcessingView */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-cream font-serif text-sm"
      >
        Reading your page…
      </motion.p>
      
      {/* Milestone teaser - matches ProcessingView */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-oker/10 border border-oker/20"
      >
        <div className="w-5 h-5 rounded-full bg-oker/20 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-oker" />
        </div>
        <span className="text-[9px] text-cream/70">Patterns unlock...</span>
      </motion.div>
    </motion.div>
  );
}

// Step 4: Snapshot - matches SnapshotView styling
function SnapshotIllustration() {
  return (
    <motion.div 
      className="w-44 h-60 rounded-2xl bg-cream shadow-2xl flex flex-col p-3 relative overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Image preview with paper filter look */}
      <motion.div 
        className="w-full h-20 bg-muted/30 rounded-lg mb-2 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-paper to-cream" />
      </motion.div>
      
      {/* Summary lines - typewriter style */}
      <motion.div 
        className="w-full h-2.5 bg-forest/40 rounded mb-1.5"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      <motion.div 
        className="w-4/5 h-2.5 bg-forest/25 rounded mb-3"
        initial={{ width: 0 }}
        animate={{ width: '80%' }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      
      {/* Tone badge - matches real tone styling */}
      <motion.div 
        className="flex justify-center mb-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <span className="text-[10px] px-3 py-1 bg-teal/20 text-teal rounded-full font-medium border border-teal/30">
          focused
        </span>
      </motion.div>
      
      {/* Keywords - matches real keyword chips */}
      <motion.div 
        className="flex gap-1 justify-center flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {['idea', 'project', 'next'].map((kw, i) => (
          <motion.span 
            key={kw}
            className="text-[8px] px-2 py-0.5 bg-oker/15 text-oker rounded font-medium border border-oker/20"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            {kw}
          </motion.span>
        ))}
      </motion.div>
      
      {/* User note hint */}
      <motion.div
        className="mt-auto pt-2 border-t border-forest/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-[8px] text-forest/50 italic">+ Add note...</div>
      </motion.div>
    </motion.div>
  );
}

// Step 5: Timeline - bookshelf style with book spines
function TimelineIllustration() {
  const spines = [
    { color: 'bg-teal/60', width: 'w-4', label: 'idea' },
    { color: 'bg-forest/50', width: 'w-5', label: 'plan' },
    { color: 'bg-oker/40', width: 'w-3', label: 'note' },
    { color: 'bg-teal/50', width: 'w-4', label: 'draft' },
  ];

  return (
    <motion.div 
      className="w-52 h-60 rounded-2xl bg-cream shadow-2xl flex flex-col p-4 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-forest">Your Memory</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-forest/20" />
        </div>
      </div>
      
      {/* Bookshelf */}
      <div className="flex-1 flex flex-col justify-end">
        {/* Shelf with books */}
        <div className="flex items-end gap-1 px-2 pb-1">
          {spines.map((spine, i) => (
            <motion.div 
              key={i}
              className={`${spine.width} h-28 ${spine.color} rounded-t-sm relative flex items-center justify-center shadow-sm`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 112, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              {/* Vertical text on spine */}
              <span 
                className="text-[7px] text-cream/80 font-medium absolute"
                style={{ 
                  writingMode: 'vertical-rl', 
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)'
                }}
              >
                {spine.label}
              </span>
              {/* Spine accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/20" />
            </motion.div>
          ))}
          
          {/* New book appearing with glow */}
          <motion.div 
            className="w-5 h-28 rounded-t-sm relative flex items-center justify-center"
            initial={{ height: 0, opacity: 0, scale: 0.8 }}
            animate={{ height: 112, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-t-sm bg-oker/60"
              animate={{ 
                boxShadow: [
                  '0 0 0 0 hsla(38, 70%, 50%, 0)',
                  '0 0 15px 5px hsla(38, 70%, 50%, 0.4)',
                  '0 0 0 0 hsla(38, 70%, 50%, 0)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span 
              className="text-[7px] text-forest-deep font-bold absolute z-10"
              style={{ 
                writingMode: 'vertical-rl', 
                textOrientation: 'mixed',
                transform: 'rotate(180deg)'
              }}
            >
              new
            </span>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-oker/40 z-10" />
          </motion.div>
        </div>
        
        {/* Shelf base */}
        <div className="h-2 bg-gradient-to-b from-forest/30 to-forest/10 rounded-b-sm mx-1" />
      </div>
      
      {/* Page count */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-[9px] text-forest/50">5 pages in your memory</span>
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
