/**
 * PinGate - Per-device PIN protection
 * 
 * Users set their own 4-digit PIN on first visit.
 * The PIN is stored locally and required to unlock the app each session.
 * Creates a "personal vault" feeling without complex auth.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/lib/haptics';

const PIN_STORAGE_KEY = 'umarise_vault_pin';
const SESSION_UNLOCKED_KEY = 'umarise_session_unlocked';

interface PinGateProps {
  children: React.ReactNode;
}

export function PinGate({ children }: PinGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null); // null = loading
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already unlocked this session or if PIN exists
  useEffect(() => {
    const sessionUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY);
    if (sessionUnlocked === 'true') {
      setIsUnlocked(true);
      return;
    }

    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    setHasPin(!!storedPin);
    
    if (!storedPin) {
      setIsSettingPin(true);
    }
  }, []);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    
    const newValue = value.slice(-1); // Take only last digit
    const currentPin = isConfirm ? [...confirmPin] : [...pin];
    currentPin[index] = newValue;
    
    if (isConfirm) {
      setConfirmPin(currentPin);
    } else {
      setPin(currentPin);
    }
    
    setError('');
    
    // Auto-focus next input
    if (newValue && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }
    
    // Check if complete
    if (index === 3 && newValue) {
      const fullPin = currentPin.join('');
      
      if (isSettingPin) {
        if (!isConfirm) {
          // Move to confirm step
          setTimeout(() => {
            confirmInputRefs.current[0]?.focus();
          }, 100);
        } else {
          // Verify confirmation matches
          const originalPin = pin.join('');
          if (fullPin === originalPin) {
            savePin(fullPin);
          } else {
            triggerHaptic('error');
            setError('PIN komt niet overeen');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setConfirmPin(['', '', '', '']);
            setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
          }
        }
      } else {
        // Verify PIN
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmInputRefs : inputRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const savePin = (newPin: string) => {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
    triggerHaptic('success');
    setIsUnlocked(true);
  };

  const verifyPin = (enteredPin: string) => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    
    if (enteredPin === storedPin) {
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
      triggerHaptic('success');
      setIsUnlocked(true);
    } else {
      triggerHaptic('error');
      setError('Onjuiste PIN');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const resetPin = () => {
    setIsSettingPin(true);
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setError('');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  // Loading state
  if (hasPin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          <Lock className="w-8 h-8 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  // Unlocked - show app
  if (isUnlocked) {
    return <>{children}</>;
  }

  // PIN entry/setup UI
  const PinInput = ({ 
    values, 
    refs, 
    isConfirm = false 
  }: { 
    values: string[]; 
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    isConfirm?: boolean;
  }) => (
    <div className="flex gap-3 justify-center">
      {values.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type={showPin ? 'text' : 'password'}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          className={`
            w-14 h-16 text-center text-2xl font-mono
            bg-secondary/50 border-2 rounded-xl
            focus:outline-none focus:border-codex-gold focus:ring-2 focus:ring-codex-gold/20
            transition-all duration-200
            ${digit ? 'border-codex-gold/50' : 'border-border'}
          `}
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Vault Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-codex-gold/10 flex items-center justify-center">
            <Lock className="w-10 h-10 text-codex-gold" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="font-serif text-2xl text-center mb-2 text-foreground">
          {isSettingPin ? 'Maak je kluis-PIN' : 'Ontgrendel je kluis'}
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          {isSettingPin 
            ? 'Kies een 4-cijferige PIN om je herinneringen te beschermen'
            : 'Voer je PIN in om toegang te krijgen'
          }
        </p>

        {/* PIN Input */}
        <div className="space-y-6">
          {isSettingPin ? (
            <>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground text-center block">
                  Nieuwe PIN
                </label>
                <PinInput values={pin} refs={inputRefs} />
              </div>

              <AnimatePresence>
                {pin.every(d => d) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs text-muted-foreground text-center block">
                      Bevestig PIN
                    </label>
                    <PinInput values={confirmPin} refs={confirmInputRefs} isConfirm />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <PinInput values={pin} refs={inputRefs} />
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 mt-4 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show/Hide PIN toggle */}
        <button
          onClick={() => setShowPin(!showPin)}
          className="flex items-center justify-center gap-2 w-full mt-6 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPin ? 'Verberg PIN' : 'Toon PIN'}
        </button>

        {/* Reset PIN option (only when verifying) */}
        {!isSettingPin && (
          <button
            onClick={resetPin}
            className="block w-full mt-4 text-muted-foreground text-xs hover:text-foreground transition-colors text-center"
          >
            PIN vergeten? Stel een nieuwe in
          </button>
        )}

        {/* Privacy note */}
        <p className="text-muted-foreground/60 text-xs text-center mt-8">
          Je PIN blijft lokaal op dit apparaat
        </p>
      </motion.div>
    </div>
  );
}