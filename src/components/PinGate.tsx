/**
 * PinGate - Per-device PIN protection with vault unlock animation
 * 
 * Users set their own 4-digit PIN on first visit.
 * The PIN is stored locally and required to unlock the app each session.
 * Creates a "personal vault" feeling without complex auth.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const PIN_STORAGE_KEY = 'umarise_vault_pin';
const SESSION_UNLOCKED_KEY = 'umarise_session_unlocked';

interface PinGateProps {
  children: React.ReactNode;
}

export function PinGate({ children }: PinGateProps) {
  // Public routes that bypass PinGate (e.g., Origin Links for external verification)
  // Check synchronously before any state to avoid flicker
  const isPublicRoute = (): boolean => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      // /origin/:id routes are public for external systems to verify origins
      if (path.startsWith('/origin/')) return true;
    }
    return false;
  };

  // Skip PIN gate entirely for public routes - return children immediately
  if (isPublicRoute()) {
    return <>{children}</>;
  }

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
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
      setHasPin(true); // Also set hasPin to exit loading state
      return;
    }

    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const pinExists = !!storedPin;
    setHasPin(pinExists);
    
    if (!pinExists) {
      setIsSettingPin(true);
    }
    
    // Auto-focus first input after initial load
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
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
            setError('PIN doesn\'t match');
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

  const triggerUnlock = () => {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
    triggerHaptic('success');
    setShowUnlockAnimation(true);
    
    // Wait for animation to complete before showing app
    setTimeout(() => {
      setIsUnlocked(true);
    }, 1800);
  };

  const savePin = (newPin: string) => {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    triggerUnlock();
  };

  const verifyPin = (enteredPin: string) => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    
    if (enteredPin === storedPin) {
      triggerUnlock();
    } else {
      triggerHaptic('error');
      setError('Incorrect PIN');
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

  // Unlock animation
  if (showUnlockAnimation) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
        {/* Radial glow background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 2, 3] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-64 h-64 rounded-full bg-gradient-radial from-codex-gold/40 via-codex-gold/10 to-transparent" />
        </motion.div>

        {/* Sparkle particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: 0,
              y: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              x: Math.cos((i / 8) * Math.PI * 2) * 120,
              y: Math.sin((i / 8) * Math.PI * 2) * 120
            }}
            transition={{ 
              duration: 1,
              delay: 0.3,
              ease: "easeOut"
            }}
            className="absolute"
          >
            <Sparkles className="w-4 h-4 text-codex-gold" />
          </motion.div>
        ))}

        {/* Lock to Unlock transition */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10"
        >
          {/* Lock icon fading out */}
          <motion.div
            initial={{ opacity: 1, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, scale: 0.8, rotate: -15 }}
            transition={{ duration: 0.4, ease: "easeIn" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-codex-gold/20 flex items-center justify-center">
              <Lock className="w-12 h-12 text-codex-gold" />
            </div>
          </motion.div>

          {/* Unlock icon appearing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(180, 150, 80, 0)",
                  "0 0 0 20px rgba(180, 150, 80, 0.3)",
                  "0 0 0 40px rgba(180, 150, 80, 0)"
                ]
              }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-24 h-24 rounded-full bg-codex-gold/20 flex items-center justify-center"
            >
              <Unlock className="w-12 h-12 text-codex-gold" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 text-center z-10"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-serif text-2xl text-foreground mb-2"
          >
            Welcome back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-muted-foreground text-sm"
          >
            Your vault is open
          </motion.p>
        </motion.div>

        {/* Fade out overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="absolute inset-0 bg-background z-20"
        />
      </div>
    );
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
          {isSettingPin ? 'Create your vault PIN' : 'Unlock your vault'}
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          {isSettingPin 
            ? 'Choose a 4-digit PIN to protect your origins'
            : 'Enter your PIN to access'
          }
        </p>

        {/* PIN Input */}
        <div className="space-y-6">
          {isSettingPin ? (
            <>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground text-center block">
                  New PIN
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
                      Confirm PIN
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
          {showPin ? 'Hide PIN' : 'Show PIN'}
        </button>

        {/* Reset PIN option (only when verifying) */}
        {!isSettingPin && (
          <button
            onClick={resetPin}
            className="block w-full mt-4 text-muted-foreground text-xs hover:text-foreground transition-colors text-center"
          >
            Forgot PIN? Set a new one
          </button>
        )}

        {/* Privacy note */}
        <p className="text-muted-foreground/60 text-xs text-center mt-8">
          Your PIN stays local to this device
        </p>
      </motion.div>
    </div>
  );
}