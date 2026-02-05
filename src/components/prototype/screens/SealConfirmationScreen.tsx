/**
 * Seal Confirmation Screen
 * 
 * Post-mark: Offer to receive the certificate via email.
 * This is NOT an account creation prompt - it's "send me my proof".
 * 
 * Per briefing: Email contains PDF with thumbnail, timestamp, 
 * fingerprint, and OTS status.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SealConfirmationProps {
  originId: string;
  hash: string;
  timestamp: Date;
  thumbnailUrl?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function SealConfirmationScreen({ 
  originId, 
  hash, 
  timestamp, 
  thumbnailUrl,
  onComplete, 
  onSkip 
}: SealConfirmationProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Sign in/up with magic link - this also links identity to marks
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/prototype`,
          data: {
            originId,
            hash,
            timestamp: timestamp.toISOString(),
          }
        },
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
      toast.success('Certificate link sent');
      
      // Auto-complete after showing confirmation
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('Failed to send. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'hsl(var(--ritual-surface))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center max-w-[280px]">
          {/* Checkmark seal */}
          <div className="w-14 h-14 mx-auto mb-5">
            <svg viewBox="0 0 56 56" width="56" height="56">
              <circle 
                cx="28" 
                cy="28" 
                r="23" 
                fill="none" 
                stroke="hsl(var(--ritual-gold))" 
                strokeWidth="1" 
                opacity="0.4"
              />
              <motion.path 
                d="M18 28L25 35L38 22"
                fill="none"
                stroke="hsl(var(--ritual-gold))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </svg>
          </div>

          <h2 className="font-playfair text-2xl text-ritual-gold mb-3">
            Sent
          </h2>
          
          <p className="font-garamond text-sm mb-4" style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}>
            Check your inbox for the magic link
          </p>
          
          <p className="font-mono text-[10px] tracking-wide mb-5" style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
            {email}
          </p>

          <p className="font-garamond italic text-[11px]" style={{ color: 'hsl(var(--ritual-cream) / 0.3)' }}>
            The link includes your certificate with OTS proof
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-[280px]">
        {/* Seal icon */}
        <div className="w-14 h-14 mx-auto mb-5">
          <svg viewBox="0 0 56 56" width="56" height="56">
            <circle 
              cx="28" 
              cy="28" 
              r="23" 
              fill="none" 
              stroke="hsl(var(--ritual-gold))" 
              strokeWidth="0.5" 
              opacity="0.25"
            />
            <path 
              d="M44 16A20 20 0 1 1 39 11" 
              fill="none" 
              stroke="hsl(var(--ritual-gold))" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              opacity="0.7"
            />
            <motion.circle 
              cx="44" 
              cy="16" 
              r="2.5" 
              fill="hsl(var(--ritual-gold))"
              animate={{ opacity: [0.85, 0.4, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <text 
              x="28" 
              y="34" 
              textAnchor="middle" 
              fontFamily="'Playfair Display', Georgia, serif" 
              fontSize="22" 
              fontWeight="400" 
              fill="hsl(var(--ritual-gold))" 
              opacity="0.9"
            >
              U
            </text>
          </svg>
        </div>

        <h2 className="font-playfair text-[22px] text-ritual-gold text-center mb-2">
          Send me my proof
        </h2>
        
        <p className="font-garamond text-sm text-center mb-5" style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}>
          Receive your certificate via email
        </p>

        {/* Origin summary - subtle reminder of what was just marked */}
        <div className="text-center mb-5 py-2.5 border-y" style={{ borderColor: 'hsl(var(--ritual-gold) / 0.1)' }}>
          <p className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
            {originId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent rounded-lg
                         font-mono text-sm text-ritual-cream
                         focus:outline-none transition-colors
                         disabled:opacity-50"
              style={{ 
                border: '1px solid hsl(var(--ritual-gold) / 0.3)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 rounded-lg font-garamond text-sm
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'hsl(var(--ritual-gold) / 0.1)',
              border: '1px solid hsl(var(--ritual-gold) / 0.4)',
              color: 'hsl(var(--ritual-gold))',
            }}
          >
            {isLoading ? 'Sending...' : 'Send certificate'}
          </button>
        </form>

        <button
          onClick={onSkip}
          className="w-full mt-4 py-2 font-garamond text-xs transition-colors"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
        >
          Skip — view on Wall
        </button>

        <p className="mt-5 font-garamond italic text-[10px] text-center" style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}>
          Your email is masked in certificates
        </p>
      </div>
    </motion.div>
  );
}
