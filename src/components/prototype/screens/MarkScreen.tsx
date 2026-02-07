import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArtifactDisplay } from '../components/ArtifactDisplay';

interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
}

interface MarkScreenProps {
  artifact: Artifact;
  onComplete: () => void;
}

/**
 * Screen 3: Mark
 * "Your artifact" title + "hold to mark" instruction.
 * Press and hold. A golden frame draws itself.
 * Release early → retract. Hold 1.5s → seal complete.
 */
export function MarkScreen({ artifact, onComplete }: MarkScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isSealed, setIsSealed] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const SEAL_DURATION = 1200; // 1.2 seconds per briefing

  // Frame dimensions for stroke calculation
  const frameWidth = 258;
  const frameHeight = 198;
  const frameRadius = 8;
  const perimeter = 2 * (frameWidth - 2 * frameRadius) + 2 * (frameHeight - 2 * frameRadius) + 2 * Math.PI * frameRadius;

  const animateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min(elapsed / SEAL_DURATION, 1);
    setProgress(newProgress);

    if (newProgress < 1) {
      animationRef.current = requestAnimationFrame(animateProgress);
    }
  }, []);

  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isSealed) return;
    e.preventDefault();
    
    setIsPressed(true);
    startTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animateProgress);

    timerRef.current = setTimeout(() => {
      // Seal complete
      setIsSealed(true);
      setShowFlash(true);
      setIsPressed(false);
      
      // Flash animation complete
      setTimeout(() => setShowFlash(false), 1000);
      
      // Auto-advance after 1.8s
      setTimeout(onComplete, 1800);
    }, SEAL_DURATION);
  }, [isSealed, onComplete, animateProgress]);

  const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isSealed) return;
    e.preventDefault();
    
    setIsPressed(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Retract animation
    setProgress(0);
  }, [isSealed]);

  const strokeDashoffset = perimeter * (1 - progress);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{ background: 'hsl(var(--ritual-bg))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title — per briefing sectie 10: 22px Playfair 300, #C5935A */}
      <motion.h1
        className="font-playfair text-[22px] text-ritual-gold mb-6 pointer-events-none"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        Your artifact
      </motion.h1>

      <div className="relative flex items-center justify-center">
        {/* Artifact with press interaction */}
        <motion.div
          className="relative w-[250px] h-[190px] rounded-[4px] overflow-hidden cursor-pointer select-none"
          animate={{
            scale: isPressed ? 0.985 : isSealed ? 0.98 : 1,
            y: isSealed ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <ArtifactDisplay type={artifact.type} imageUrl={artifact.imageUrl || undefined} />
        </motion.div>

        {/* Golden frame SVG overlay */}
        <svg
          className="absolute -top-[6px] -left-[6px] pointer-events-none"
          width={frameWidth + 4}
          height={frameHeight + 4}
          viewBox={`0 0 ${frameWidth + 4} ${frameHeight + 4}`}
        >
          <rect
            x="2"
            y="2"
            width={frameWidth}
            height={frameHeight}
            rx={frameRadius}
            ry={frameRadius}
            fill="none"
            stroke="hsl(var(--ritual-gold))"
            strokeWidth={isSealed ? 2 : 2.5}
            strokeDasharray={perimeter}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: isSealed 
                ? 'drop-shadow(0 0 3px hsl(32 55% 55% / 0.2))'
                : 'drop-shadow(0 0 8px hsl(var(--ritual-gold-glow)))',
              transition: isPressed 
                ? 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'stroke-dashoffset 0.3s ease-in',
            }}
          />
        </svg>

        {/* Flash effect on seal */}
        {showFlash && (
          <motion.div
            className="absolute -top-[6px] -left-[6px] w-[calc(100%+12px)] h-[calc(100%+12px)] rounded-[8px] pointer-events-none"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              boxShadow: '0 0 30px hsl(var(--ritual-gold-glow)), inset 0 0 30px hsl(var(--ritual-gold-glow))',
            }}
          />
        )}
      </div>

      {/* Instruction — per briefing: "hold to mark", 17px Playfair, goud */}
      {!isSealed && (
        <motion.p
          className="mt-6 font-playfair text-[17px] text-ritual-gold"
          style={{ fontWeight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isPressed ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          hold to mark
        </motion.p>
      )}
    </motion.div>
  );
}
