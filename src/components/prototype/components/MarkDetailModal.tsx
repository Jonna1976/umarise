/**
 * Mark Detail Modal — S7 detail view
 * 
 * Per briefing sectie 4 (S7 detail view):
 * - Overlay (96% opacity dark)
 * - Photo/artifact in golden frame (same frame style as S3)
 * - "Origin marked" title
 * - Origin ID (JetBrains Mono 9px)
 * - Date (EB Garamond 13px)
 * - Hash (JetBrains Mono 9px, 0.5 opacity)
 * - Status: pulsing dot + "PENDING" or solid dot + "ANCHORED IN BITCOIN"
 * - "Save as ZIP" button (gold, pill-shaped, always available)
 * - Passkey toggle: "Include passkey signature" with on/off switch
 * - Passkey hint (only visible when toggle active)
 * - Privacy note: "your file stays on your device · only the proof leaves"
 * - Close button (✕) top-right
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface MarkDetailModalProps {
  mark: {
    id: string;
    originId: string;
    hash: string;
    timestamp: Date;
    otsStatus: 'pending' | 'submitted' | 'anchored';
    imageUrl?: string;
  };
  onClose: () => void;
}

export function MarkDetailModal({ mark, onClose }: MarkDetailModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);

  // Format date per briefing: "7 February 2026 · 20:35"
  const formattedDate = mark.timestamp.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = mark.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Clean origin ID for display
  const displayOriginId = mark.originId.toUpperCase().replace('UM-', '');

  // Truncate hash for display
  const shortHash = mark.hash 
    ? `${mark.hash.substring(0, 8)}...${mark.hash.substring(mark.hash.length - 8)}`
    : '—';

  const isAnchored = mark.otsStatus === 'anchored';

  // Handle ZIP save via Web Share API
  const handleSaveAsZip = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const certificateData = JSON.stringify({
        version: '1.0',
        origin_id: displayOriginId,
        hash: mark.hash,
        hash_algo: 'SHA-256',
        captured_at: mark.timestamp.toISOString(),
        verify_url: 'https://verify.umarise.com',
        claimed_by: passkeyEnabled ? '(passkey-public-key-placeholder)' : null,
        signature: passkeyEnabled ? '(signature-placeholder)' : null,
      }, null, 2);

      const zipFileName = `origin-${displayOriginId}.zip`;

      if (navigator.share) {
        const file = new File(
          [certificateData], 
          zipFileName, 
          { type: 'application/zip' }
        );

        const canShareFiles = navigator.canShare?.({ files: [file] });

        if (canShareFiles) {
          await navigator.share({ files: [file] });
          toast.success('Saved');
        } else {
          await navigator.share({
            title: `Origin ${displayOriginId}`,
            text: `Origin certificate for ${displayOriginId}\n\nVerify at verify.umarise.com`,
          });
        }
      } else {
        const blob = new Blob([certificateData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${displayOriginId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setIsSaving(false);
        return;
      }
      console.error('[MarkDetailModal] Save error:', error);
      toast.error('Could not save');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, displayOriginId, mark.hash, mark.timestamp, passkeyEnabled]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'hsl(var(--ritual-bg) / 0.96)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        {/* Close button (✕) top-right */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full transition-opacity hover:opacity-60"
          style={{ background: 'hsl(var(--ritual-gold) / 0.08)' }}
        >
          <X className="w-5 h-5 text-ritual-gold opacity-60" />
        </button>

        {/* Content card */}
        <motion.div
          className="w-full max-w-[340px] mx-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Photo/artifact in golden frame (same frame style as S3) */}
          {mark.imageUrl && (
            <div className="relative mb-6">
              <div 
                className="w-[250px] h-[190px] rounded-[4px] overflow-hidden"
              >
                <img 
                  src={mark.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Golden frame border */}
              <div 
                className="absolute -inset-[3px] rounded-[6px] pointer-events-none"
                style={{ 
                  border: '1.5px solid hsl(var(--ritual-gold) / 0.4)',
                  boxShadow: '0 0 12px hsl(var(--ritual-gold) / 0.08)',
                }}
              />
            </div>
          )}

          {/* "Origin marked" title */}
          <h2 
            className="font-playfair text-[22px] text-ritual-gold mb-4"
            style={{ fontWeight: 300 }}
          >
            Origin marked
          </h2>

          {/* Origin ID — JetBrains Mono 9px */}
          <p 
            className="font-mono text-[9px] tracking-[2.5px] uppercase mb-2"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            ORIGIN {displayOriginId}
          </p>

          {/* Date — EB Garamond 13px */}
          <p 
            className="font-garamond text-[13px] mb-3"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            {formattedDate} · {formattedTime}
          </p>

          {/* Separator */}
          <div 
            className="w-10 h-[1px] mb-3"
            style={{ background: 'hsl(var(--ritual-gold) / 0.2)' }}
          />

          {/* Hash — JetBrains Mono 9px, 0.5 opacity */}
          <p 
            className="font-mono text-[9px] tracking-wide mb-3"
            style={{ color: 'hsl(var(--ritual-cream) / 0.5)' }}
          >
            {shortHash}
          </p>

          {/* Status: pulsing dot + text */}
          <div className="flex items-center gap-2 mb-6">
            {isAnchored ? (
              <>
                {/* Solid dot for anchored */}
                <span 
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ background: 'hsl(var(--ritual-gold))' }}
                />
                <p 
                  className="font-mono text-[9px] tracking-[1.5px] uppercase"
                  style={{ color: 'hsl(var(--ritual-gold))' }}
                >
                  ANCHORED IN BITCOIN
                </p>
              </>
            ) : (
              <>
                {/* Pulsing dot for pending */}
                <motion.span 
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ background: 'hsl(var(--ritual-gold))' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <p 
                  className="font-mono text-[9px] tracking-[1.5px] uppercase"
                  style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
                >
                  PENDING BITCOIN ANCHOR
                </p>
              </>
            )}
          </div>

          {/* "Save as ZIP" button — gold, pill-shaped, always available */}
          <button
            onClick={handleSaveAsZip}
            disabled={isSaving}
            className="font-playfair text-[14px] px-7 py-2.5 rounded-full transition-all disabled:opacity-50 mb-4"
            style={{
              fontWeight: 300,
              background: 'hsl(var(--ritual-gold) / 0.12)',
              border: '1px solid hsl(var(--ritual-gold) / 0.35)',
              color: 'hsl(var(--ritual-gold) / 0.85)',
            }}
          >
            {isSaving ? 'Saving...' : 'Save as ZIP'}
          </button>

          {/* Passkey toggle: "Include passkey signature" */}
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setPasskeyEnabled(!passkeyEnabled)}
              className="relative w-[36px] h-[18px] rounded-full transition-all duration-300"
              style={{
                background: passkeyEnabled 
                  ? 'hsl(var(--ritual-gold) / 0.35)' 
                  : 'hsl(var(--ritual-cream) / 0.1)',
                border: `1px solid ${passkeyEnabled 
                  ? 'hsl(var(--ritual-gold) / 0.5)' 
                  : 'hsl(var(--ritual-cream) / 0.15)'}`,
              }}
            >
              <motion.div
                className="absolute top-[2px] w-[12px] h-[12px] rounded-full"
                style={{
                  background: passkeyEnabled 
                    ? 'hsl(var(--ritual-gold))' 
                    : 'hsl(var(--ritual-cream) / 0.3)',
                }}
                animate={{ left: passkeyEnabled ? 19 : 2 }}
                transition={{ duration: 0.2 }}
              />
            </button>
            <span 
              className="font-garamond text-[12px]"
              style={{ color: 'hsl(var(--ritual-cream) / 0.5)' }}
            >
              Include passkey signature
            </span>
          </div>

          {/* Passkey hint — only visible when toggle active, 10.5px italic */}
          <AnimatePresence>
            {passkeyEnabled && (
              <motion.p
                className="font-garamond italic text-[10.5px] text-center max-w-[260px] mb-3 leading-relaxed"
                style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                Links this origin to your identity via Face ID / fingerprint. No names, no emails.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Privacy note */}
          <p 
            className="font-garamond italic text-[10px] mt-3"
            style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
          >
            your file stays on your device · only the proof leaves
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
