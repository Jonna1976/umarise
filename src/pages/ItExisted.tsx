import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarks } from '@/hooks/useMarks';
import { fetchOriginByHash } from '@/lib/coreApi';
import { toast } from 'sonner';

type ItExistedState = 'capture' | 'processing';
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
    setState('processing');
    // Anchor immediately — no fake passkey step
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

    // Bridge trigger runs synchronously in the same transaction as pages INSERT,
    // but edge function cold starts may cause initial 404. Poll with backoff.
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

  // handleAnchor removed — anchoring now happens directly in handlePick

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
