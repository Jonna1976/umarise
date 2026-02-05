/**
 * Witness Invite Component
 * 
 * Appears after mark creation to invite a witness.
 * Uses native share sheet with pre-composed text.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WitnessInviteProps {
  pageId: string;
  originId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function WitnessInvite({ pageId, originId, onComplete, onSkip }: WitnessInviteProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleInvite = async () => {
    setIsCreating(true);

    try {
      // Generate verification token
      const tokenBytes = new Uint8Array(16);
      crypto.getRandomValues(tokenBytes);
      const verificationToken = Array.from(tokenBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Create witness record with 7-day expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('witnesses')
        .insert({
          page_id: pageId,
          witness_email: '', // Will be filled on confirmation
          verification_token: verificationToken,
          token_expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // Generate share URL
      const shareUrl = `${window.location.origin}/witness/${verificationToken}`;
      
      // Pre-composed share text
      const shareText = `I've sealed a moment in time and want you as witness.

Tap to confirm you saw this:
${shareUrl}

(I'll send the image separately)`;

      // Use native share if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: 'Witness my beginning',
          text: shareText,
        });
        toast.success('Witness invite shared');
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Invite link copied to clipboard');
      }

      onComplete();
    } catch (e) {
      // Handle share cancellation gracefully
      if ((e as Error).name === 'AbortError') {
        // User cancelled share
        return;
      }
      console.error('Failed to create witness invite:', e);
      toast.error('Failed to create invite');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-md bg-ritual-surface rounded-t-2xl p-6 pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="w-12 h-1 bg-ritual-cream-20 rounded-full mx-auto mb-6" />

        <h3 className="font-playfair text-xl text-ritual-gold text-center mb-2">
          Add a witness
        </h3>
        
        <p className="font-garamond text-ritual-cream-60 text-sm text-center mb-6">
          A witness strengthens your proof by confirming they saw this moment
        </p>

        <div className="space-y-3">
          <button
            onClick={handleInvite}
            disabled={isCreating}
            className="w-full py-3 bg-ritual-gold/10 border border-ritual-gold/40 rounded-lg
                       font-garamond text-ritual-gold text-sm
                       hover:bg-ritual-gold/20 transition-all
                       disabled:opacity-50"
          >
            {isCreating ? 'Creating invite...' : 'Invite a witness'}
          </button>

          <button
            onClick={onSkip}
            disabled={isCreating}
            className="w-full py-2 font-garamond text-ritual-cream-40 text-xs
                       hover:text-ritual-cream-60 transition-colors"
          >
            Skip for now
          </button>
        </div>

        <p className="mt-4 font-garamond italic text-ritual-cream-20 text-[11px] text-center">
          Share the link, then send the image via WhatsApp or Signal
        </p>
      </motion.div>
    </motion.div>
  );
}
