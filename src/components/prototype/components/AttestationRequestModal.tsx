/**
 * Attestation Request Modal — Layer 3
 * 
 * Opened from MarkDetailModal when user taps "Request attestation".
 * Shows explanation, price, confirm/cancel.
 * Confirm triggers Stripe Checkout via v1-attestation-checkout.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getActiveDeviceId } from '@/lib/deviceId';

interface AttestationRequestModalProps {
  originId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function AttestationRequestModal({ originId, onClose, onConfirm }: AttestationRequestModalProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    try {
      const deviceUserId = getActiveDeviceId();
      if (!deviceUserId) {
        toast.error('No device ID available');
        setConfirming(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/v1-attestation-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ origin_id: originId, device_user_id: deviceUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.info('Attestation already requested');
          onConfirm();
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setConfirming(false);
    }
  }, [originId, onConfirm]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.75)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[360px] mx-6 flex flex-col items-center py-10 px-8 rounded-lg"
          style={{
            background: 'hsl(var(--ritual-surface))',
            border: '1px solid rgba(197,147,90,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <p
            className="font-mono text-[13px] tracking-[3px] uppercase mb-8"
            style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}
          >
            ATTESTATION
          </p>

          <p
            className="font-garamond text-[15px] leading-[1.7] text-center mb-6"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            A certified third party will confirm that you, the holder of this passkey, set this anchor at this moment.
          </p>
          <p
            className="font-garamond text-[15px] leading-[1.7] text-center mb-8"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            You will receive an updated ZIP within 24 hours containing your anchor and the attestation certificate.
          </p>

          <p
            className="font-mono text-[20px] tracking-[2px] mb-1"
            style={{ color: 'hsl(var(--ritual-cream) / 0.8)' }}
          >
            € 4,95
          </p>
          <p
            className="font-mono text-[13px] tracking-[1px] mb-10"
            style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
          >
            One-time. No subscription. No surprises.
          </p>

          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="font-mono text-[13px] tracking-[4px] uppercase mb-5 px-8 py-3 rounded-full transition-all disabled:opacity-50"
            style={{
              color: 'hsl(var(--ritual-gold))',
              background: 'rgba(197,147,90,0.08)',
              border: '1px solid rgba(197,147,90,0.25)',
            }}
          >
            {confirming ? 'Redirecting…' : 'Confirm attestation →'}
          </button>

          <button
            onClick={onClose}
            className="font-mono text-[13px] tracking-[1px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
