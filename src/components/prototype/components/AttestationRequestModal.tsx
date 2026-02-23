/**
 * Attestation Request Modal — Layer 3
 * 
 * Opened from MarkDetailModal when user taps "Request attestation".
 * Shows explanation, price, confirm/cancel.
 * Pure UI — no backend integration yet.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AttestationRequestModalProps {
  originId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function AttestationRequestModal({ originId, onClose, onConfirm }: AttestationRequestModalProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    // TODO: call attestation API when backend is ready
    await new Promise(r => setTimeout(r, 800));
    onConfirm();
    toast.success('Attestation requested');
  }, [onConfirm]);

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
          {/* Title */}
          <p
            className="font-mono text-[9px] tracking-[3px] uppercase mb-8"
            style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}
          >
            ATTESTATION
          </p>

          {/* Body */}
          <p
            className="font-garamond text-[15px] leading-[1.7] text-center mb-6"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            A certified third party will confirm that you — the holder of this passkey — set this anchor at this moment.
          </p>
          <p
            className="font-garamond text-[15px] leading-[1.7] text-center mb-8"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            You will receive an updated ZIP within 24 hours containing your anchor and the attestation certificate.
          </p>

          {/* Price block */}
          <p
            className="font-mono text-[20px] tracking-[2px] mb-1"
            style={{ color: 'hsl(var(--ritual-cream) / 0.8)' }}
          >
            € 4,95
          </p>
          <p
            className="font-mono text-[11px] tracking-[1px] mb-10"
            style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
          >
            One-time. No subscription. No surprises.
          </p>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="font-mono text-[9px] tracking-[4px] uppercase mb-5 px-8 py-3 rounded-full transition-all disabled:opacity-50"
            style={{
              color: 'hsl(var(--ritual-gold))',
              background: 'rgba(197,147,90,0.08)',
              border: '1px solid rgba(197,147,90,0.25)',
            }}
          >
            {confirming ? 'Requesting…' : 'Confirm attestation →'}
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="font-mono text-[11px] tracking-[1px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
