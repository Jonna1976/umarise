/**
 * Mark Detail Modal — S7 detail view
 * 
 * Per briefing reference (v7):
 * - Overlay (96% opacity dark)
 * - Photo/artifact in golden frame
 * - "Origin marked" title
 * - Origin ID (JetBrains Mono 9px)
 * - Date (EB Garamond 13px)
 * - Hash (JetBrains Mono 9px, 0.5 opacity)
 * - Status: pulsing dot + "PENDING" or solid dot + "ANCHORED IN BITCOIN"
 * - "Save as ZIP" button (gold, pill-shaped, always available)
 * - "+ link passkey" subtle text link underneath (NOT a toggle)
 * - Privacy note: "your file stays on your device · only the proof leaves"
 * - Close button (✕) top-right
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { saveOriginZip } from '@/lib/originZip';
import { 
  registerPasskey, 
  signHash, 
  isWebAuthnSupported,
  type PasskeyCredential,
} from '@/lib/webauthn';

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
  const [saved, setSaved] = useState(false);
  const [passkeyLinked, setPasskeyLinked] = useState(false);
  const [passkeyLinking, setPasskeyLinking] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  
  // Store credential data for signing and ZIP inclusion
  const credentialRef = useRef<PasskeyCredential | null>(null);
  const signatureRef = useRef<string | null>(null);

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

  // Handle ZIP save via shared utility — includes real passkey data when linked
  const handleSaveAsZip = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // If passkey is linked but not yet signed, sign the hash now
      if (passkeyLinked && credentialRef.current && !signatureRef.current) {
        try {
          const sig = await signHash(credentialRef.current.credentialId, mark.hash);
          signatureRef.current = sig.signature;
        } catch (e) {
          console.warn('[MarkDetailModal] Hash signing skipped:', e);
        }
      }

      const success = await saveOriginZip({
        originId: mark.originId,
        hash: mark.hash,
        timestamp: mark.timestamp,
        imageUrl: mark.imageUrl ?? null,
        claimedBy: credentialRef.current?.publicKey ?? null,
        signature: signatureRef.current ?? null,
      });

      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      console.error('[MarkDetailModal] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, mark.originId, mark.hash, mark.timestamp, mark.imageUrl, passkeyLinked]);

  // Handle passkey link — real WebAuthn registration + signing
  const handlePasskeyLink = useCallback(async () => {
    if (passkeyLinked || passkeyLinking) return;
    setPasskeyError(null);
    setPasskeyLinking(true);

    try {
      // Step 1: Register a new passkey (Face ID / fingerprint / Windows Hello)
      const credential = await registerPasskey(mark.originId);
      credentialRef.current = credential;

      // Step 2: Immediately sign the origin hash with the new credential
      const sig = await signHash(credential.credentialId, mark.hash);
      signatureRef.current = sig.signature;

      setPasskeyLinked(true);
      console.info('[MarkDetailModal] Passkey linked:', {
        credentialId: credential.credentialId.substring(0, 12) + '…',
        algorithm: credential.publicKeyAlgorithm,
        signed: true,
      });
    } catch (error) {
      const err = error as Error;
      // NotAllowedError = user cancelled the biometric prompt
      if (err.name === 'NotAllowedError') {
        console.info('[MarkDetailModal] Passkey cancelled by user');
      } else {
        console.error('[MarkDetailModal] Passkey error:', err);
        setPasskeyError(
          isWebAuthnSupported()
            ? 'Passkey registration failed'
            : 'Passkeys not supported on this device'
        );
      }
    } finally {
      setPasskeyLinking(false);
    }
  }, [passkeyLinked, passkeyLinking, mark.originId, mark.hash]);

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
          {/* Photo/artifact in golden frame */}
          {mark.imageUrl && (
            <div className="relative mb-6">
              <div className="w-[250px] h-[190px] rounded-[4px] overflow-hidden">
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

          {/* Separator line */}
          <div 
            className="w-10 h-[1px] mb-3"
            style={{ background: 'hsl(var(--ritual-gold) / 0.3)' }}
          />

          {/* "Origin marked" title */}
          <h2 
            className="font-playfair text-[18px] text-ritual-gold mb-2"
            style={{ fontWeight: 400 }}
          >
            Origin marked
          </h2>

          {/* Origin ID — JetBrains Mono 9px */}
          <p 
            className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            {mark.originId.toUpperCase().replace('UM-', 'ORIGIN ')}
          </p>

          {/* Date — EB Garamond 13px */}
          <p 
            className="font-garamond text-[13px] mb-1.5"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            {formattedDate} · {formattedTime}
          </p>

          {/* Hash — JetBrains Mono 9px, 0.5 opacity */}
          <p 
            className="font-mono text-[9px] tracking-wide mb-2.5"
            style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.5 }}
          >
            {shortHash}
          </p>

          {/* Status: pulsing dot + text */}
          <div className="flex items-center gap-1.5 mb-4">
            {isAnchored ? (
              <>
                <span 
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ background: 'hsl(var(--ritual-gold))' }}
                />
                <p 
                  className="font-mono text-[9px] tracking-[1px] uppercase"
                  style={{ color: 'hsl(var(--ritual-gold))' }}
                >
                  ANCHORED IN BITCOIN
                </p>
              </>
            ) : (
              <>
                <motion.span 
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ background: 'hsl(var(--ritual-gold))' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <p 
                  className="font-mono text-[9px] tracking-[1px] uppercase"
                  style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
                >
                  PENDING · anchoring in 1–2 blocks
                </p>
              </>
            )}
          </div>

          {/* "Save as ZIP" button — gold, pill-shaped, always available */}
          <button
            onClick={handleSaveAsZip}
            disabled={isSaving}
            className="font-playfair text-[13px] px-6 py-2.5 rounded-full transition-all disabled:opacity-50 mb-2.5"
            style={{
              fontWeight: 300,
              background: saved 
                ? 'hsl(var(--ritual-gold) / 0.08)' 
                : 'hsl(var(--ritual-gold) / 0.08)',
              border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.4' : '0.2'})`,
              color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.85'})`,
            }}
          >
            {saved 
              ? (passkeyLinked ? '✓ ZIP saved (with passkey)' : '✓ ZIP saved')
              : isSaving ? 'Saving...' : 'Save as ZIP'
            }
          </button>

          {/* "+ link passkey" — subtle text link, NOT a toggle */}
          <button
            onClick={handlePasskeyLink}
            disabled={passkeyLinked || passkeyLinking}
            className="font-garamond text-[12px] tracking-[0.3px] transition-all mb-1"
            style={{ 
              color: passkeyLinked 
                ? 'hsl(var(--ritual-gold))' 
                : 'hsl(var(--ritual-gold-muted))',
              opacity: passkeyLinked ? 0.6 : 0.35,
              cursor: (passkeyLinked || passkeyLinking) ? 'default' : 'pointer',
            }}
          >
            {passkeyLinking 
              ? 'Authenticating…' 
              : passkeyLinked 
                ? '✓ passkey linked' 
                : '+ link passkey'
            }
          </button>

          {/* Passkey error message (subtle, non-intrusive) */}
          {passkeyError && (
            <p 
              className="font-mono text-[9px] tracking-wide mb-1"
              style={{ color: 'hsl(0 60% 60% / 0.6)' }}
            >
              {passkeyError}
            </p>
          )}

          {/* Privacy note */}
          <p 
            className="font-garamond italic text-[11px] mt-2.5"
            style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
          >
            your file stays on your device · only the proof leaves
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
