/**
 * ArchitectureGate - Always-on PIN protection for sensitive internal routes.
 * Unlike PinGate (disabled during pilot), this gate is NEVER bypassed.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const INTERNAL_PIN = '2407';
const SESSION_KEY = 'umarise_arch_unlocked';

interface ArchitectureGateProps {
  children: React.ReactNode;
}

export function ArchitectureGate({ children }: ArchitectureGateProps) {
  const [unlocked, setUnlocked] = useState(() => 
    sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!unlocked) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    setError('');

    if (next[index] && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 3 && next[index]) {
      const entered = next.join('');
      if (entered === INTERNAL_PIN) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        triggerHaptic('success');
        setUnlocked(true);
      } else {
        triggerHaptic('error');
        setError('Geen toegang');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPin(['', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        <h1 className="font-serif text-xl mb-1 text-foreground">Internal Access</h1>
        <p className="text-muted-foreground text-sm mb-8">Dit document is niet publiek</p>

        <div className="flex gap-3 justify-center mb-4">
          {pin.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-14 h-16 text-center text-2xl font-mono bg-secondary/50 border-2 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border"
              animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-destructive text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowPin(!showPin)}
          className="flex items-center justify-center gap-2 w-full text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPin ? 'Verberg' : 'Toon'}
        </button>
      </motion.div>
    </div>
  );
}
