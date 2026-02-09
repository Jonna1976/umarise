/**
 * Mark Detail Modal. S7 detail view
 * 
 * Per V7 design specs:
 * - Overlay (96% opacity dark)
 * - Photo/artifact in golden frame
 * - "Origin marked" title (26px Playfair)
 * - Origin ID (JetBrains Mono 13px)
 * - Date (EB Garamond 20px)
 * - Hash (JetBrains Mono 13px, 0.5 opacity)
 * - Status: circumpunct + "PENDING" or "ANCHORED IN BITCOIN"
 * - "Save as ZIP" button (gold, pill-shaped, always available)
 * - "+ link passkey" subtle text link underneath
 * - Privacy note: "your file stays on your device. only the proof leaves"
 * - Close button top-right
 * 
 * Minimum font size: 17px body, 13px mono (per V7 scaling)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OriginMark } from './OriginMark';
import { saveOriginZip } from '@/lib/originZip';
import { fetchProofStatus, arrayBufferToBase64 } from '@/lib/coreApi';
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
    /** Real UUID from origin_attestations table (for OTS proof lookup) */
    originUuid?: string;
  };
  onClose: () => void;
}

export function MarkDetailModal({ mark, onClose }: MarkDetailModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passkeyLinked, setPasskeyLinked] = useState(false);
  const [passkeyLinking, setPasskeyLinking] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [proofLoaded, setProofLoaded] = useState(false);
  const [fetchingProof, setFetchingProof] = useState(false);
  
  // Store credential data for signing and ZIP inclusion
  const credentialRef = useRef<PasskeyCredential | null>(null);
  const signatureRef = useRef<string | null>(null);
  const otsProofRef = useRef<string | null>(null);

  // Eagerly fetch OTS proof when origin has a real UUID
  useEffect(() => {
    if (!mark.originUuid) return;

    fetchProofStatus(mark.originUuid).then(result => {
      if (result.status === 'anchored' && result.otsProofBytes) {
        otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
        setProofLoaded(true);
        console.info('[MarkDetailModal] OTS proof loaded:', {
          block: result.bitcoinBlockHeight,
          anchoredAt: result.anchoredAt,
        });
      }
    });
  }, [mark.originUuid]);

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

  // Handle ZIP save — fetches proof on-demand if anchored but not yet loaded
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

      // If anchored but proof not loaded yet, fetch it now
      if (isAnchored && !otsProofRef.current && mark.originUuid) {
        setFetchingProof(true);
        try {
          const result = await fetchProofStatus(mark.originUuid);
          if (result.status === 'anchored' && result.otsProofBytes) {
            otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
            setProofLoaded(true);
          }
        } catch (e) {
          console.warn('[MarkDetailModal] Proof fetch failed, saving without .ots:', e);
        } finally {
          setFetchingProof(false);
        }
      }

      const success = await saveOriginZip({
        originId: mark.originId,
        hash: mark.hash,
        timestamp: mark.timestamp,
        imageUrl: mark.imageUrl ?? null,
        claimedBy: credentialRef.current?.publicKey ?? null,
        signature: signatureRef.current ?? null,
        otsProof: otsProofRef.current,
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
  }, [isSaving, isAnchored, mark.originId, mark.originUuid, mark.hash, mark.timestamp, mark.imageUrl, passkeyLinked]);

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
            className="font-playfair text-[26px] text-ritual-gold mb-3"
            style={{ fontWeight: 400 }}
          >
            Origin marked
          </h2>

          {/* Origin ID */}
          <p 
            className="font-mono text-[13px] tracking-[3px] uppercase mb-1.5"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            ORIGIN {displayOriginId}
          </p>

          {/* Date */}
          <p 
            className="font-garamond text-[20px] mb-2"
            style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}
          >
            {formattedDate} · {formattedTime}
          </p>

          {/* Hash */}
          <p 
            className="font-mono text-[13px] tracking-wide mb-3"
            style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.5 }}
          >
            {shortHash}
          </p>

          {/* Status: circumpunct + text */}
          <div className="flex items-center gap-2.5 mb-5">
            {isAnchored ? (
              <>
                <OriginMark size={20} state="anchored" variant="dark" />
                <p 
                   className="font-mono text-[13px] tracking-[1.5px] uppercase"
                   style={{ color: 'hsl(var(--ritual-gold))' }}
                 >
                   ANCHORED IN BITCOIN
                 </p>
               </>
             ) : (
               <>
                 <OriginMark size={20} state="pending" animated variant="dark" />
                 <p 
                   className="font-mono text-[13px] tracking-[1.5px] uppercase"
                  style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
                >
                  PENDING · ANCHORING IN 1-2 BLOCKS
                </p>
              </>
            )}
          </div>

          {/* "Save as ZIP" button */}
          <button
            onClick={handleSaveAsZip}
            disabled={isSaving || fetchingProof}
            className="font-playfair text-[17px] px-7 py-3 rounded-full transition-all disabled:opacity-50 mb-3"
            style={{
              fontWeight: 300,
              background: saved 
                ? 'hsl(var(--ritual-gold) / 0.12)' 
                : 'hsl(var(--ritual-gold) / 0.08)',
              border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.4' : '0.2'})`,
              color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.85'})`,
            }}
          >
            {saved 
              ? (proofLoaded 
                  ? '✓ ZIP saved (with proof)' 
                  : passkeyLinked 
                    ? '✓ ZIP saved (with passkey)'
                    : '✓ ZIP saved')
              : fetchingProof
                ? 'Fetching proof…'
                : isSaving 
                  ? 'Saving…' 
                  : isAnchored && !proofLoaded && mark.originUuid
                    ? 'Save as ZIP'
                    : !isAnchored
                      ? 'Save as ZIP (proof pending)'
                      : 'Save as ZIP'
            }
          </button>

          {/* "+ link passkey" */}
          <button
            onClick={handlePasskeyLink}
            disabled={passkeyLinked || passkeyLinking}
            className="font-garamond text-[17px] tracking-[0.3px] transition-all mb-1.5"
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

          {/* Passkey error message */}
          {passkeyError && (
            <p 
              className="font-mono text-[13px] tracking-wide mb-1.5"
              style={{ color: 'hsl(0 60% 60% / 0.6)' }}
            >
              {passkeyError}
            </p>
          )}

          {/* Privacy note */}
          <p 
            className="font-garamond italic text-[17px] mt-3"
            style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
          >
            your file stays on your device. only the proof leaves
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
