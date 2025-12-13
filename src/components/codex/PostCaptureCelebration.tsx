/**
 * Post-Capture Celebration
 * 
 * A brief, delightful animation shown after a successful capture
 * to reinforce the "compounding value" feeling.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, TrendingUp, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PostCaptureCelebrationProps {
  isVisible: boolean;
  pageNumber: number;
  connectionsFound?: number;
  onComplete: () => void;
}

export function PostCaptureCelebration({ 
  isVisible, 
  pageNumber, 
  connectionsFound = 0,
  onComplete 
}: PostCaptureCelebrationProps) {
  const [phase, setPhase] = useState<'success' | 'insight' | 'done'>('success');

  useEffect(() => {
    if (!isVisible) {
      setPhase('success');
      return;
    }

    // Phase transitions
    const timer1 = setTimeout(() => setPhase('insight'), 800);
    const timer2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getMessage = () => {
    if (pageNumber === 1) return "Your codex begins!";
    if (pageNumber === 2) return "Threads are forming...";
    if (pageNumber === 3) return "Patterns unlocked!";
    if (pageNumber === 5) return "Personality revealed!";
    if (connectionsFound > 0) return `Found ${connectionsFound} connection${connectionsFound > 1 ? 's' : ''}!`;
    return `Page ${pageNumber} added`;
  };

  const getIcon = () => {
    if (pageNumber <= 2) return <Sparkles className="w-6 h-6" />;
    if (connectionsFound > 0) return <Link2 className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: phase === 'success' ? [0.5, 1.1, 1] : 1,
            opacity: 1,
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Success icon */}
          <motion.div
            animate={{
              scale: phase === 'success' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 rounded-full bg-codex-gold/20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-codex-gold"
            >
              {phase === 'success' ? (
                <Check className="w-8 h-8" />
              ) : (
                getIcon()
              )}
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-lg font-serif text-foreground">
              {getMessage()}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mt-1"
            >
              {pageNumber < 5 
                ? `${5 - pageNumber} more until personality insights`
                : "Your codex grows wiser"
              }
            </motion.p>
          </motion.div>

          {/* Particle effect */}
          {phase === 'success' && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    x: 0, 
                    y: 0,
                    scale: 1,
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: Math.cos(i * 60 * Math.PI / 180) * 80,
                    y: Math.sin(i * 60 * Math.PI / 180) * 80,
                    scale: 0.5,
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute w-2 h-2 rounded-full bg-codex-gold"
                />
              ))}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
