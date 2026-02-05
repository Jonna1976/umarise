/**
 * Witness Confirmation Page
 * 
 * Public route: /witness/:token
 * Allows witnesses to confirm they saw a mark.
 * 
 * NO thumbnail shown (privacy) - only origin_id, date, hash
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WitnessData {
  id: string;
  originId: string;
  createdAt: Date;
  hash: string;
  tokenExpired: boolean;
  alreadyConfirmed: boolean;
}

export default function WitnessConfirmation() {
  const { token } = useParams<{ token: string }>();
  const [witnessData, setWitnessData] = useState<WitnessData | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadWitnessData(token);
    }
  }, [token]);

  const loadWitnessData = async (verificationToken: string) => {
    try {
      // Use type assertion for witnesses table (not yet in generated types)
      const { data, error } = await (supabase as any)
        .from('witnesses')
        .select(`
          id,
          page_id,
          verification_token,
          token_expires_at,
          witness_confirmed_at,
          pages!inner (
            id,
            created_at,
            origin_hash_sha256
          )
        `)
        .eq('verification_token', verificationToken)
        .single();

      if (error || !data) {
        setError('This witness link is invalid or has been used.');
        return;
      }

      const page = data.pages;
      const tokenExpired = new Date(data.token_expires_at) < new Date();
      const alreadyConfirmed = !!data.witness_confirmed_at;

      setWitnessData({
        id: data.id,
        originId: `um-${page.id.substring(0, 8)}`,
        createdAt: new Date(page.created_at),
        hash: page.origin_hash_sha256 || '',
        tokenExpired,
        alreadyConfirmed,
      });

      if (alreadyConfirmed) {
        setIsConfirmed(true);
      }
    } catch (e) {
      console.error('Failed to load witness data:', e);
      setError('Failed to load witness information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!witnessData || !email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsConfirming(true);

    try {
      // Generate confirmation hash
      const encoder = new TextEncoder();
      const data = encoder.encode(`${email}|${Date.now()}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const confirmationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Use type assertion for witnesses table (not yet in generated types)
      const { error } = await (supabase as any)
        .from('witnesses')
        .update({
          witness_email: email,
          witness_confirmed_at: new Date().toISOString(),
          confirmation_hash: confirmationHash,
        })
        .eq('id', witnessData.id)
        .gt('token_expires_at', new Date().toISOString());

      if (error) {
        throw error;
      }

      setIsConfirmed(true);
      toast.success('Witness confirmation recorded');
    } catch (e) {
      console.error('Failed to confirm:', e);
      toast.error('Failed to confirm. The link may have expired.');
    } finally {
      setIsConfirming(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHash = (hash: string) => {
    if (!hash) return '—';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ritual-surface">
        <motion.div
          className="w-8 h-8 border-2 border-ritual-gold/30 border-t-ritual-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6">
        <div className="text-center max-w-[280px]">
          <h2 className="font-playfair text-2xl text-ritual-gold mb-4">
            Link unavailable
          </h2>
          <p className="font-garamond text-ritual-cream-60 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (witnessData?.tokenExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6">
        <div className="text-center max-w-[280px]">
          <h2 className="font-playfair text-2xl text-ritual-gold mb-4">
            Link expired
          </h2>
          <p className="font-garamond text-ritual-cream-60 text-sm">
            This witness link has expired. Links are valid for 7 days.
          </p>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center max-w-[280px]">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-12 h-12 text-ritual-gold opacity-70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="font-playfair text-2xl text-ritual-gold mb-3">
            Witnessed
          </h2>
          
          <p className="font-garamond text-ritual-cream-60 text-sm mb-6">
            Your confirmation has been recorded as additional proof
          </p>

          <div className="text-center">
            <p className="font-mono text-ritual-gold-muted text-[10px] tracking-[2px] uppercase mb-2">
              {witnessData?.originId}
            </p>
            <p className="font-garamond text-ritual-cream-40 text-sm">
              {witnessData && formatDate(witnessData.createdAt)}
            </p>
          </div>

          <p className="mt-8 font-garamond italic text-ritual-cream-20 text-[11px]">
            The maker will be notified of your confirmation
          </p>
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
          Witness this beginning
        </h2>
        
        <p className="font-garamond text-ritual-cream-60 text-sm text-center mb-8">
          Someone wants you to confirm you saw this moment
        </p>

        {/* Mark details (NO thumbnail for privacy) */}
        <div className="mb-8 p-4 rounded-lg bg-ritual-surface-light border border-ritual-gold/10">
          <div className="text-center space-y-3">
            <div>
              <p className="font-mono text-ritual-gold-muted text-[10px] tracking-[2px] uppercase">
                origin
              </p>
              <p className="font-mono text-ritual-gold text-sm tracking-wide">
                {witnessData?.originId.toUpperCase()}
              </p>
            </div>
            
            <div>
              <p className="font-mono text-ritual-gold-muted text-[10px] tracking-[2px] uppercase">
                sealed
              </p>
              <p className="font-garamond text-ritual-cream-60 text-sm">
                {witnessData && formatDate(witnessData.createdAt)}
              </p>
            </div>
            
            <div>
              <p className="font-mono text-ritual-gold-muted text-[10px] tracking-[2px] uppercase">
                fingerprint
              </p>
              <p className="font-mono text-ritual-cream-40 text-[10px]">
                {witnessData && formatHash(witnessData.hash)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              autoComplete="email"
              disabled={isConfirming}
              className="w-full px-4 py-3 bg-transparent border border-ritual-gold/30 rounded-lg
                         font-mono text-sm text-ritual-cream placeholder:text-ritual-cream-40
                         focus:outline-none focus:border-ritual-gold/60 transition-colors
                         disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isConfirming || !email}
            className="w-full py-3 bg-ritual-gold/10 border border-ritual-gold/40 rounded-lg
                       font-garamond text-ritual-gold text-sm
                       hover:bg-ritual-gold/20 hover:border-ritual-gold/60 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? 'Confirming...' : 'I confirm I saw this'}
          </button>
        </form>

        <p className="mt-6 font-garamond italic text-ritual-cream-20 text-[11px] text-center">
          Your email will be masked in certificates (m***r@email.com)
        </p>
      </div>
    </motion.div>
  );
}
