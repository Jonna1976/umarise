/**
 * Claim Anonymous Marks Component
 * 
 * Allows authenticated users to claim marks from their previous
 * anonymous device_user_id. Shows a preview before confirming.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';

interface MarkPreview {
  id: string;
  createdAt: Date;
  imageUrl: string;
  hash?: string;
}

interface ClaimAnonymousMarksProps {
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function ClaimAnonymousMarks({ userId, onComplete, onSkip }: ClaimAnonymousMarksProps) {
  const [marks, setMarks] = useState<MarkPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    loadAnonymousMarks();
  }, []);

  const loadAnonymousMarks = async () => {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, created_at, image_url, origin_hash_sha256')
        .eq('device_user_id', deviceUserId)
        .is('user_id', null) // Only unclaimed marks
        .eq('is_trashed', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setMarks((data || []).map(row => ({
        id: row.id,
        createdAt: new Date(row.created_at),
        imageUrl: row.image_url,
        hash: row.origin_hash_sha256 || undefined,
      })));
    } catch (e) {
      console.error('Failed to load anonymous marks:', e);
      toast.error('Failed to load marks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return;

    setIsClaiming(true);

    try {
      const { error } = await supabase
        .from('pages')
        .update({ user_id: userId })
        .eq('device_user_id', deviceUserId)
        .is('user_id', null);

      if (error) throw error;

      toast.success(`${marks.length} marks linked to your account`);
      onComplete();
    } catch (e) {
      console.error('Failed to claim marks:', e);
      toast.error('Failed to claim marks');
    } finally {
      setIsClaiming(false);
    }
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

  if (marks.length === 0) {
    // No anonymous marks to claim, proceed directly
    onComplete();
    return null;
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-ritual-surface px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-[320px]">
        <h2 className="font-playfair text-2xl text-ritual-gold text-center mb-2">
          Claim your marks
        </h2>
        
        <p className="font-garamond text-ritual-cream-60 text-sm text-center mb-6">
          We found {marks.length} mark{marks.length !== 1 ? 's' : ''} from this device
        </p>

        {/* Mark preview grid */}
        <div className="grid grid-cols-4 gap-2 mb-8 max-h-[200px] overflow-y-auto">
          {marks.slice(0, 12).map((mark) => (
            <div
              key={mark.id}
              className="aspect-square rounded-md overflow-hidden bg-ritual-surface-light"
            >
              <img
                src={mark.imageUrl}
                alt=""
                className="w-full h-full object-cover opacity-70"
              />
            </div>
          ))}
          {marks.length > 12 && (
            <div className="aspect-square rounded-md bg-ritual-surface-light flex items-center justify-center">
              <span className="font-mono text-ritual-gold-muted text-xs">
                +{marks.length - 12}
              </span>
            </div>
          )}
        </div>

        {/* Warning for shared devices */}
        <div className="mb-6 p-3 rounded-lg bg-ritual-gold/5 border border-ritual-gold/20">
          <p className="font-garamond text-ritual-cream-60 text-xs text-center">
            ⚠️ Only claim marks that are yours. On shared devices, marks from other people may appear here.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-3 bg-ritual-gold/10 border border-ritual-gold/40 rounded-lg
                       font-garamond text-ritual-gold text-sm
                       hover:bg-ritual-gold/20 hover:border-ritual-gold/60 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? 'Linking...' : `Link ${marks.length} marks to my account`}
          </button>

          <button
            onClick={onSkip}
            disabled={isClaiming}
            className="w-full py-2 font-garamond text-ritual-cream-40 text-xs
                       hover:text-ritual-cream-60 transition-colors
                       disabled:opacity-50"
          >
            Skip — these are not mine
          </button>
        </div>

        <p className="mt-6 font-garamond italic text-ritual-cream-20 text-[11px] text-center">
          Marks will be permanently linked to your account
        </p>
      </div>
    </motion.div>
  );
}
