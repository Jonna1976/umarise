import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMarks } from '@/hooks/useMarks';
import { fetchOriginMetadata } from '@/lib/coreApi';
import { toast } from 'sonner';

type ItExistedState = 'capture' | 'passkey' | 'processing';

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

    const resolved = await fetchOriginMetadata(mark.originId);
    const shortToken = resolved?.short_token ?? mark.originId.slice(0, 8).toUpperCase();
    const payload = {
      originId: mark.originId,
      shortToken,
      hash: mark.hash,
      capturedAt: resolved?.captured_at ?? mark.timestamp.toISOString(),
    };

    localStorage.setItem('itexisted_last_anchor', JSON.stringify(payload));
    navigate('/itexisted/anchored', { state: payload });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'hsl(var(--itx-bg))' }}>
      <div className="w-full max-w-sm rounded-[28px] border p-8" style={{ background: 'hsl(var(--itx-surface))', borderColor: 'hsl(var(--itx-border))' }}>
        {state === 'capture' && (
          <div className="min-h-[480px] flex flex-col items-center justify-center relative">
            <button
              onClick={() => inputRef.current?.click()}
              className="w-[148px] h-[148px] rounded-full border-[1.5px] border-dashed flex items-center justify-center"
              style={{ borderColor: 'hsl(var(--itx-gold) / 0.2)' }}
            >
              <span className="font-playfair text-[40px] leading-none" style={{ color: 'hsl(var(--itx-cream) / 0.2)' }}>+</span>
            </button>
            <span className="absolute bottom-2 font-mono text-[7px] tracking-[3px] uppercase" style={{ color: 'hsl(var(--itx-gold) / 0.15)' }}>
              itexisted.app
            </span>
          </div>
        )}

        {state === 'passkey' && (
          <div className="min-h-[480px] flex flex-col items-center justify-center text-center px-4">
            <svg viewBox="0 0 48 48" width="40" height="40" className="mb-5" aria-hidden>
              <rect x="10" y="20" width="28" height="20" rx="4" fill="none" stroke="hsl(var(--itx-gold) / 0.5)" strokeWidth="1.5" />
              <path d="M16 20v-6a8 8 0 0116 0v6" fill="none" stroke="hsl(var(--itx-gold) / 0.5)" strokeWidth="1.5" />
              <circle cx="24" cy="30" r="3" fill="hsl(var(--itx-gold) / 0.6)" />
            </svg>
            <h1 className="font-playfair text-[16px] mb-2" style={{ color: 'hsl(var(--itx-cream))' }}>Confirm with Face ID</h1>
            <p className="font-garamond text-[12px] mb-7" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>to anchor this file to your device</p>
            <button
              onClick={handleAnchor}
              className="px-7 py-2.5 rounded-full font-garamond text-[14px]"
              style={{ background: 'hsl(var(--itx-gold) / 0.08)', color: 'hsl(var(--itx-gold))', border: '1px solid hsl(var(--itx-gold) / 0.3)' }}
            >
              Use Face ID
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="min-h-[480px] flex flex-col items-center justify-center gap-3">
            <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.85, 0.45, 0.85] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <svg viewBox="0 0 42 42" width="42" height="42" aria-hidden>
                <circle cx="21" cy="21" r="17" fill="none" stroke="hsl(var(--itx-gold) / 0.3)" strokeWidth="0.8" />
                <circle cx="21" cy="21" r="5" fill="hsl(var(--itx-gold))" />
              </svg>
            </motion.div>
            <p className="font-mono text-[8px] tracking-[3px] uppercase" style={{ color: 'hsl(var(--itx-muted))' }}>anchoring…</p>
            <p className="font-garamond text-[11px] text-center max-w-[180px]" style={{ color: 'hsl(var(--itx-cream) / 0.4)' }}>{fileName}</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          handlePick(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
    </main>
  );
}
