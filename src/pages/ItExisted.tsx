import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarks } from '@/hooks/useMarks';
import { fetchOriginByHash } from '@/lib/coreApi';
import { toast } from 'sonner';

type ItExistedState = 'capture' | 'passkey' | 'processing';
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

export default function ItExisted() {
  const navigate = useNavigate();
  const { createMarkFromFile } = useMarks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ItExistedState>('capture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileName = useMemo(() => selectedFile?.name ?? '', [selectedFile]);

  const handlePick = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setState('passkey');
  };

  const handleAnchor = async () => {
    if (!selectedFile) return;
    setState('processing');
    const mark = await createMarkFromFile(selectedFile, mapFileType(selectedFile.type));

    if (!mark) {
      toast.error('Anchoring failed. Try again.');
      setState('capture');
      setSelectedFile(null);
      return;
    }

    let resolved = null;
    for (let i = 0; i < 5; i++) {
      resolved = await fetchOriginByHash(mark.hash);
      if (resolved) break;
      await new Promise(r => setTimeout(r, 1000));
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
            <p className="font-garamond italic text-[16px]" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>
              Your file stays yours.
            </p>
            <p className="font-playfair text-[20px] font-light" style={{ color: 'hsl(var(--itx-gold))' }}>
              Anchor what matters.
            </p>

            {/* Circle + plus — proportional to text block */}
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

        {state === 'passkey' && (
          <motion.div key="passkey"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center">
            <svg viewBox="0 0 48 48" width="36" height="36" className="mb-5" aria-hidden>
              <rect x="10" y="20" width="28" height="20" rx="4" fill="none"
                stroke="hsl(var(--itx-gold) / 0.4)" strokeWidth="1.2" />
              <path d="M16 20v-6a8 8 0 0116 0v6" fill="none"
                stroke="hsl(var(--itx-gold) / 0.4)" strokeWidth="1.2" />
              <circle cx="24" cy="30" r="2.5" fill="hsl(var(--itx-gold) / 0.5)" />
            </svg>
            <h1 className="font-playfair text-[17px] font-light mb-1"
              style={{ color: 'hsl(var(--itx-cream))' }}>Confirm with Face ID</h1>
            <p className="font-garamond text-[13px] mb-8"
              style={{ color: 'hsl(var(--itx-cream) / 0.35)' }}>to anchor this file to your device</p>
            <button onClick={handleAnchor}
              className="px-8 py-2.5 rounded-full font-playfair text-[17px] font-light"
              style={{
                background: 'hsl(var(--itx-gold) / 0.08)',
                color: 'hsl(var(--itx-gold) / 0.8)',
                border: '1px solid hsl(var(--itx-gold) / 0.3)',
              }}>
              Use Face ID
            </button>
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
