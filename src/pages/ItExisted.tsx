import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarks } from '@/hooks/useMarks';
import { fetchOriginByHash, fetchProofStatus } from '@/lib/coreApi';
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable, registerPasskey, signHash } from '@/lib/webauthn';
import { getPasskeyCredential, savePasskeyCredential } from '@/lib/passkeyStore';
import { calculateSHA256 } from '@/lib/originHash';
import { toast } from 'sonner';
import Circumpunct from '@/components/itexisted/Circumpunct';
import Kaartenbak from '@/components/itexisted/Kaartenbak';
import { useKaartenbak } from '@/contexts/KaartenbakContext';

type ItExistedState = 'capture' | 'anchoring';
type MarkType = 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';

function mapFileType(mimeType: string): MarkType {
  if (mimeType.startsWith('image/')) return 'warm';
  if (mimeType.startsWith('audio/')) return 'sound';
  if (mimeType.startsWith('video/')) return 'digital';
  return 'text';
}

export default function ItExisted() {
  const navigate = useNavigate();
  const { createMarkFromFile } = useMarks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ItExistedState>('capture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileName = useMemo(() => selectedFile?.name ?? '', [selectedFile]);

  const { addItems } = useKaartenbak();

  // Store Layer 2 signing result for inclusion in certificate.json
  const [layer2, setLayer2] = useState<{ deviceSignature: string; devicePublicKey: string } | null>(null);

  const handlePick = async (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);

    // Try single biometric prompt BEFORE showing anchoring screen
    let sigData: { deviceSignature: string; devicePublicKey: string } | null = null;

    try {
      if (isWebAuthnSupported() && await isPlatformAuthenticatorAvailable()) {
        // Compute hash
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        let credential = getPasskeyCredential();

        if (!credential) {
          // First time: register creates ONE biometric prompt, skip signHash
          credential = await registerPasskey(hash.substring(0, 8));
          savePasskeyCredential(credential);
          sigData = { deviceSignature: 'registered', devicePublicKey: credential.publicKey };
        } else {
          // Already registered: single sign prompt
          const sig = await signHash(credential.credentialId, hash);
          sigData = { deviceSignature: sig.signature, devicePublicKey: credential.publicKey };
        }
        console.log('[ItExisted] ✓ Passkey complete');
      }
    } catch (e) {
      console.warn('[ItExisted] Passkey skipped:', e);
    }

    setLayer2(sigData);
    setState('anchoring');
    anchorFile(file, sigData);
  };

  const anchorFile = async (file: File, sigData: { deviceSignature: string; devicePublicKey: string } | null) => {
    try {
      const mark = await createMarkFromFile(file, mapFileType(file.type), undefined, true);

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
        try {
          resolved = await fetchOriginByHash(mark.hash);
          if (resolved) break;
        } catch (e) {
          console.warn('[ItExisted] resolve poll error:', e);
        }
      }
      const shortToken = resolved?.short_token ?? mark.hash.slice(0, 8).toUpperCase();
      const payload = {
        originId: resolved?.origin_id ?? mark.originId,
        shortToken,
        hash: mark.hash,
        capturedAt: resolved?.captured_at ?? mark.timestamp.toISOString(),
        deviceSignature: sigData?.deviceSignature ?? null,
        devicePublicKey: sigData?.devicePublicKey ?? null,
      };

      localStorage.setItem('itexisted_last_anchor', JSON.stringify(payload));

      // Add to kaartenbak (ephemeral in-memory)
      addItems([{
        originId: payload.originId,
        shortToken: payload.shortToken,
        hash: payload.hash,
        capturedAt: payload.capturedAt,
        verifyUrl: `https://itexisted.app/proof/${payload.shortToken}`,
        status: 'pending',
      }]);
      
      // Use correct path based on hostname
      const isItExistedDomain = window.location.hostname === 'itexisted.app';
      const path = isItExistedDomain ? `/proof/${shortToken}` : `/itexisted/proof/${shortToken}`;
      navigate(path, { state: { file } });
    } catch (e) {
      console.error('[ItExisted] anchorFile failed:', e);
      toast.error('Something went wrong. Try again.');
      setState('capture');
      setSelectedFile(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'hsl(var(--itx-bg))', paddingTop: '8vh' }}>

      <AnimatePresence mode="wait">
        {state === 'capture' && (
          <motion.div key="capture"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-0"
            style={{ lineHeight: '2.2' }}>

            {/* Single statement */}
            <p className="font-playfair text-[37px] md:text-[52px] font-light leading-snug" style={{ color: 'hsl(var(--itx-gold))' }}>
              Anchor what
              <br />
              matters.
            </p>

            {/* Circle + plus — click AND drop */}
            <button
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handlePick(f); }}
              className="mt-10 md:mt-14 w-[172px] h-[172px] md:w-[220px] md:h-[220px] rounded-full border-[1.5px] border-dashed flex items-center justify-center transition-all hover:border-solid"
              style={{ borderColor: dragOver ? 'hsl(var(--itx-gold) / 0.6)' : 'hsl(var(--itx-gold) / 0.25)', background: dragOver ? 'hsl(var(--itx-gold) / 0.06)' : 'transparent' }}>
              <span className="font-playfair text-[48px] md:text-[56px] leading-none" style={{ color: dragOver ? 'hsl(var(--itx-cream) / 0.4)' : 'hsl(var(--itx-cream) / 0.18)' }}>+</span>
            </button>

            <span className="mt-8 font-mono text-[7px] tracking-[3px] uppercase"
              style={{ color: 'hsl(var(--itx-gold) / 0.12)' }}>
              itexisted.app
            </span>
          </motion.div>
        )}

        {state === 'anchoring' && (
          <motion.div key="anchoring"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center text-center">

            {/* Only the breathing circle — pure calm, no text */}
            <div className="w-[172px] h-[172px] md:w-[220px] md:h-[220px] rounded-full border-[1.5px] border-dashed flex items-center justify-center"
              style={{ borderColor: 'hsl(var(--itx-gold) / 0.25)' }}>
              <motion.div
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: 'hsl(var(--itx-gold) / 0.5)' }}
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Universal circumpunct + kaartenbak */}
      <Circumpunct />
      <Kaartenbak />

      <input ref={inputRef} type="file" className="hidden"
        onChange={(e) => { handlePick(e.target.files?.[0] ?? null); e.target.value = ''; }} />
    </main>
  );
}
