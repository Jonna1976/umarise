import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarks } from '@/hooks/useMarks';
import { fetchOriginByHash } from '@/lib/coreApi';
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable, registerPasskey, signHash } from '@/lib/webauthn';
import { getPasskeyCredential, savePasskeyCredential } from '@/lib/passkeyStore';
import { calculateSHA256 } from '@/lib/originHash';
import { toast } from 'sonner';

type ItExistedState = 'capture' | 'signing' | 'processing';
type MarkType = 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';

function mapFileType(mimeType: string): MarkType {
  if (mimeType.startsWith('image/')) return 'warm';
  if (mimeType.startsWith('audio/')) return 'sound';
  if (mimeType.startsWith('video/')) return 'digital';
  return 'text';
}

/** V7 Hexagonal nail — the anchor point */
function V7Nail({ pending = false, size = 36 }: { pending?: boolean; size?: number }) {
  if (pending) {
    return (
      <motion.svg viewBox="0 0 48 48" width={size} height={size}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        <polygon points="24,4 42,14 42,34 24,44 6,34 6,14"
          fill="none" stroke="hsl(32 55% 55% / 0.4)" strokeWidth="1.2"
          strokeDasharray="3 3" />
        <rect x="17" y="17" width="14" height="14" rx="1.8"
          fill="hsl(32 55% 55% / 0.15)" />
      </motion.svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}
      style={{ filter: 'drop-shadow(0 0 10px hsl(32 55% 55% / 0.35))' }}>
      <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="hsl(32 55% 55%)" />
      <rect x="17" y="17" width="14" height="14" rx="1.8" fill="hsl(120 27% 8%)" />
    </svg>
  );
}

/** Face ID / biometric icon */
function BiometricIcon({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
      {/* Face ID-style corners */}
      <path d="M14 6H8a2 2 0 00-2 2v6" stroke="hsl(var(--itx-gold))" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 6h6a2 2 0 012 2v6" stroke="hsl(var(--itx-gold))" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 42H8a2 2 0 01-2-2v-6" stroke="hsl(var(--itx-gold))" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 42h6a2 2 0 002-2v-6" stroke="hsl(var(--itx-gold))" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="18" cy="19" r="1.5" fill="hsl(var(--itx-gold) / 0.6)" />
      <circle cx="30" cy="19" r="1.5" fill="hsl(var(--itx-gold) / 0.6)" />
      {/* Nose */}
      <path d="M24 22v4" stroke="hsl(var(--itx-gold) / 0.4)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Mouth */}
      <path d="M19 31c1.5 2 8.5 2 10 0" stroke="hsl(var(--itx-gold) / 0.5)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ItExisted() {
  const navigate = useNavigate();
  const { createMarkFromFile } = useMarks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ItExistedState>('capture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signingStatus, setSigningStatus] = useState<'waiting' | 'prompting' | 'signed' | 'skipped'>('waiting');

  const fileName = useMemo(() => selectedFile?.name ?? '', [selectedFile]);

  const handlePick = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setState('signing');
    setSigningStatus('waiting');
    // Small delay before prompting biometric (feels intentional)
    setTimeout(() => promptPasskey(file), 600);
  };

  const promptPasskey = async (file: File) => {
    setSigningStatus('prompting');

    // Check WebAuthn support
    if (!isWebAuthnSupported()) {
      console.log('[ItExisted] WebAuthn not supported, skipping passkey');
      setSigningStatus('skipped');
      // Proceed to anchoring after brief pause
      setTimeout(() => startAnchoring(file), 800);
      return;
    }

    const hasPlatform = await isPlatformAuthenticatorAvailable();
    if (!hasPlatform) {
      console.log('[ItExisted] No platform authenticator, skipping passkey');
      setSigningStatus('skipped');
      setTimeout(() => startAnchoring(file), 800);
      return;
    }

    try {
      // Compute hash first for signing
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      let credential = getPasskeyCredential();

      if (!credential) {
        // First time — register new passkey (triggers Face ID / fingerprint)
        credential = await registerPasskey(hash.substring(0, 8));
        savePasskeyCredential(credential);
      }

      // Sign the hash (triggers biometric prompt)
      const sig = await signHash(credential.credentialId, hash);
      console.log('[ItExisted] ✓ Hash signed, sig length:', sig.signature.length);
      setSigningStatus('signed');

      // Brief celebration before anchoring
      setTimeout(() => startAnchoring(file), 1000);
    } catch (e) {
      console.warn('[ItExisted] Passkey signing cancelled or failed:', e);
      setSigningStatus('skipped');
      // Still proceed — passkey is optional enhancement
      setTimeout(() => startAnchoring(file), 800);
    }
  };

  const startAnchoring = (file: File) => {
    setState('processing');
    anchorFile(file);
  };

  const anchorFile = async (file: File) => {
    const mark = await createMarkFromFile(file, mapFileType(file.type));

    if (!mark) {
      toast.error('Anchoring failed. Try again.');
      setState('capture');
      setSelectedFile(null);
      return;
    }

    // Poll for origin resolution with backoff
    let resolved = null;
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 500 : 1500));
      resolved = await fetchOriginByHash(mark.hash);
      if (resolved) break;
    }
    const shortToken = resolved?.short_token ?? mark.hash.slice(0, 8).toUpperCase();
    const payload = {
      originId: resolved?.origin_id ?? mark.originId,
      shortToken,
      hash: mark.hash,
      capturedAt: resolved?.captured_at ?? mark.timestamp.toISOString(),
    };

    localStorage.setItem('itexisted_last_anchor', JSON.stringify(payload));
    navigate('/itexisted/anchored', { state: payload });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'hsl(var(--itx-bg))' }}>

      <AnimatePresence mode="wait">
        {state === 'capture' && (
          <motion.div key="capture"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-0"
            style={{ lineHeight: '2.2' }}>

            {/* Branding copy */}
            <p className="font-playfair text-[20px] font-light" style={{ color: 'hsl(var(--itx-cream))' }}>
              It existed.
            </p>
            <p className="font-playfair text-[20px] font-light" style={{ color: 'hsl(var(--itx-cream))' }}>
              Now it's provable.
            </p>
            <p className="font-playfair text-[20px] font-light" style={{ color: 'hsl(var(--itx-cream) / 0.5)' }}>
              Your file stays yours.
            </p>
            <p className="font-playfair text-[20px] font-light" style={{ color: 'hsl(var(--itx-gold))' }}>
              Anchor what matters.
            </p>

            {/* Circle + plus */}
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-10 w-[150px] h-[150px] rounded-full border-[1.5px] border-dashed flex items-center justify-center transition-all hover:border-solid"
              style={{ borderColor: 'hsl(var(--itx-gold) / 0.25)' }}>
              <span className="font-playfair text-[42px] leading-none" style={{ color: 'hsl(var(--itx-cream) / 0.18)' }}>+</span>
            </button>

            <span className="mt-8 font-mono text-[7px] tracking-[3px] uppercase"
              style={{ color: 'hsl(var(--itx-gold) / 0.12)' }}>
              itexisted.app
            </span>
          </motion.div>
        )}

        {state === 'signing' && (
          <motion.div key="signing"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5">

            {/* Biometric icon with pulse */}
            <motion.div
              animate={signingStatus === 'prompting' ? {
                scale: [1, 1.06, 1],
                opacity: [0.7, 1, 0.7],
              } : signingStatus === 'signed' ? { scale: 1, opacity: 1 } : { opacity: 0.5 }}
              transition={signingStatus === 'prompting' ? {
                duration: 1.8, repeat: Infinity, ease: 'easeInOut'
              } : { duration: 0.3 }}>
              <BiometricIcon size={56} />
            </motion.div>

            {/* Status text */}
            <div className="flex flex-col items-center gap-1">
              {signingStatus === 'waiting' && (
                <p className="font-mono text-[9px] tracking-[2px] uppercase"
                  style={{ color: 'hsl(var(--itx-gold-muted))' }}>
                  preparing…
                </p>
              )}
              {signingStatus === 'prompting' && (
                <>
                  <p className="font-playfair text-[18px] font-light"
                    style={{ color: 'hsl(var(--itx-cream))' }}>
                    Sign with biometrics
                  </p>
                  <p className="font-garamond text-[13px] italic mt-1"
                    style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>
                    Use Face ID, fingerprint, or device PIN
                  </p>
                </>
              )}
              {signingStatus === 'signed' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-1">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="hsl(var(--itx-gold))" strokeWidth="1.2" />
                    <path d="M8 12l3 3 5-6" stroke="hsl(var(--itx-gold))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="font-mono text-[9px] tracking-[2px] uppercase"
                    style={{ color: 'hsl(var(--itx-gold))' }}>
                    signed
                  </p>
                </motion.div>
              )}
              {signingStatus === 'skipped' && (
                <p className="font-mono text-[9px] tracking-[2px] uppercase"
                  style={{ color: 'hsl(var(--itx-cream) / 0.3)' }}>
                  continuing without signature…
                </p>
              )}
            </div>

            {/* File name */}
            <p className="font-garamond italic text-[11px] text-center max-w-[200px]"
              style={{ color: 'hsl(var(--itx-cream) / 0.2)' }}>{fileName}</p>
          </motion.div>
        )}

        {state === 'processing' && (
          <motion.div key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.4, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <V7Nail pending size={40} />
            </motion.div>
            <p className="font-mono text-[8px] tracking-[3px] uppercase"
              style={{ color: 'hsl(var(--itx-gold-muted))' }}>anchoring…</p>
            <p className="font-garamond italic text-[12px] text-center max-w-[200px]"
              style={{ color: 'hsl(var(--itx-cream) / 0.3)' }}>{fileName}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={inputRef} type="file" className="hidden"
        onChange={(e) => { handlePick(e.target.files?.[0] ?? null); e.target.value = ''; }} />
    </main>
  );
}
