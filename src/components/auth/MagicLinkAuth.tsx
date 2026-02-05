/**
 * Magic Link Authentication Component
 * 
 * Ritual-styled email authentication for Umarise v4.
 * "Your email seals your identity to your marks"
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MagicLinkAuthProps {
  onSuccess: () => void;
  onSkip?: () => void;
}

export function MagicLinkAuth({ onSuccess, onSkip }: MagicLinkAuthProps) {
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center max-w-[280px]">
          {/* Envelope icon */}
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-12 h-12 text-ritual-gold opacity-70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </div>

          <h2 className="font-playfair text-2xl text-ritual-gold mb-3">
            Check your email
          </h2>
          
          <p className="font-garamond text-ritual-cream-60 text-sm mb-6">
            We sent a magic link to
          </p>
          
          <p className="font-mono text-ritual-gold-muted text-xs tracking-wide mb-8">
            {email}
          </p>

          <p className="font-garamond italic text-ritual-cream-40 text-xs">
            Click the link to seal your identity to your marks
          </p>

          <button
            onClick={() => setIsSent(false)}
            className="mt-8 font-garamond text-ritual-gold-muted text-xs underline underline-offset-2 hover:text-ritual-gold transition-colors"
          >
            Use a different email
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-[280px]">
        {/* U symbol */}
        <div className="w-14 h-14 mx-auto mb-6">
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

        <h2 className="font-playfair text-2xl text-ritual-gold text-center mb-2">
          Seal your identity
        </h2>
        
        <p className="font-garamond text-ritual-cream-60 text-sm text-center mb-8">
          Your email connects your marks to you
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent border border-ritual-gold/30 rounded-lg
                         font-mono text-sm text-ritual-cream placeholder:text-ritual-cream-40
                         focus:outline-none focus:border-ritual-gold/60 transition-colors
                         disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 bg-ritual-gold/10 border border-ritual-gold/40 rounded-lg
                       font-garamond text-ritual-gold text-sm
                       hover:bg-ritual-gold/20 hover:border-ritual-gold/60 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full mt-4 py-2 font-garamond text-ritual-cream-40 text-xs
                       hover:text-ritual-cream-60 transition-colors"
          >
            Skip for now
          </button>
        )}

        <p className="mt-8 font-garamond italic text-ritual-cream-20 text-[11px] text-center">
          Your email is masked in certificates (m***r@email.com)
        </p>
      </div>
    </motion.div>
  );
}
