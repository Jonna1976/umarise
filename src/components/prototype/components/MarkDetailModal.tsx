/**
 * Mark Detail Modal — S7 detail view
 * 
 * Same visual language as SealedScreen:
 * V7 nail (32px), wire, golden frame, museum label.
 * Inline verify + share via ZIP upload/drop.
 * No title. No privacy whisper. No explanation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OriginMark } from './OriginMark';
import { fetchProofStatus, arrayBufferToBase64 } from '@/lib/coreApi';
import { toast } from 'sonner';
import { 
  type PasskeyCredential,
} from '@/lib/webauthn';
import { getPasskeyCredential } from '@/lib/passkeyStore';

interface MarkDetailModalProps {
  mark: {
    id: string;
    originId: string;
    hash: string;
    timestamp: Date;
    otsStatus: 'pending' | 'submitted' | 'anchored';
    imageUrl?: string;
    originUuid?: string;
  };
  onClose: () => void;
}

/** Document placeholder SVG — lines pattern */
function DocumentPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(15,26,15,0.95), rgba(20,30,30,0.95))' }}
    >
      <svg width="100" height="100" viewBox="0 0 80 80">
        <line x1="14" y1="18" x2="66" y2="18" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25"/>
        <line x1="14" y1="27" x2="58" y2="27" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.2"/>
        <line x1="14" y1="36" x2="63" y2="36" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25"/>
        <line x1="14" y1="45" x2="42" y2="45" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18"/>
        <line x1="14" y1="56" x2="60" y2="56" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.22"/>
        <line x1="14" y1="65" x2="48" y2="65" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18"/>
      </svg>
    </div>
  );
}

export function MarkDetailModal({ mark, onClose }: MarkDetailModalProps) {
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const credentialRef = useRef<PasskeyCredential | null>(getPasskeyCredential());
  const otsProofRef = useRef<string | null>(null);

  // Eagerly fetch OTS proof
  useEffect(() => {
    if (!mark.originUuid) return;
    fetchProofStatus(mark.originUuid)
      .then(result => {
        if (result.status === 'anchored' && result.otsProofBytes) {
          otsProofRef.current = arrayBufferToBase64(result.otsProofBytes);
        }
      })
      .catch(() => {});
  }, [mark.originUuid]);

  const formattedDate = mark.timestamp.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedTime = mark.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  const displayOriginId = mark.originId.toUpperCase().replace('UM-', '');
  const isAnchored = mark.otsStatus === 'anchored';
  const isImage = mark.imageUrl && !imgError;

  // ── ZIP drop/upload handlers ──
  const handleZipFile = useCallback((file: File) => {
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip') {
      toast.error('Please drop a ZIP file');
      return;
    }
    setZipFile(file);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleZipFile(file);
  }, [handleZipFile]);

  // ── Share ZIP via native share or clipboard fallback ──
  const handleShareZip = useCallback(async () => {
    if (!zipFile) return;
    const verifyUrl = `https://anchoring.app/verify?origin_id=${encodeURIComponent(mark.originId)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          files: [zipFile],
          title: `Origin ${displayOriginId.slice(0, 8)}`,
          url: verifyUrl,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy verify link
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success('Verify link copied');
    } catch {
      toast.info(verifyUrl, { duration: 8000 });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  }, [zipFile, mark.originId, displayOriginId]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto"
        style={{ background: 'hsl(var(--ritual-surface))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
          style={{ background: 'rgba(197,147,90,0.06)' }}
        >
          <X className="w-5 h-5" style={{ color: 'rgba(197,147,90,0.5)' }} />
        </button>

        {/* Content */}
        <motion.div
          className="w-full max-w-[380px] mx-4 flex flex-col items-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* V7 nail + wire */}
          <div className="flex flex-col items-center">
            <OriginMark
              size={36}
              state={isAnchored ? 'anchored' : 'pending'}
              glow={isAnchored}
              animated={!isAnchored}
              variant="dark"
            />
            <div
              className="w-px h-4"
              style={{
                background: isAnchored
                  ? 'linear-gradient(to bottom, rgba(197,147,90,0.5), rgba(197,147,90,0.15))'
                  : 'linear-gradient(to bottom, rgba(197,147,90,0.25), rgba(197,147,90,0.08))',
              }}
            />
          </div>

          {/* Photo in golden frame — show placeholder on error */}
          <div
            className="rounded-[4px] mb-6"
            style={{
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(197,147,90,0.3), rgba(180,130,70,0.15) 30%, rgba(197,147,90,0.25) 70%, rgba(210,160,80,0.2))',
              boxShadow: '0 6px 40px rgba(0,0,0,0.55), 0 0 24px rgba(197,147,90,0.1), inset 0 0 0 1px rgba(197,147,90,0.4), inset 0 0 0 2px rgba(15,26,15,0.5), inset 0 0 0 3px rgba(197,147,90,0.2)',
            }}
          >
            <div
              className="border border-[rgba(197,147,90,0.2)] bg-[rgba(12,20,12,0.95)]"
              style={{ padding: '6px' }}
            >
              <div className="w-[260px] h-[200px] overflow-hidden">
                {isImage ? (
                  <img src={mark.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <DocumentPlaceholder />
                )}
              </div>
            </div>
          </div>

          {/* Museum label */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-px mb-5" style={{ background: 'rgba(197,147,90,0.25)' }} />

            <p className="font-mono text-[20px] tracking-[4px] mb-2" style={{ color: 'rgba(197,147,90,0.75)' }}>
              {displayOriginId}
            </p>

            <p className="font-garamond text-[22px] mb-3" style={{ color: 'hsl(var(--ritual-cream) / 0.6)' }}>
              {formattedDate} · {formattedTime}
            </p>

            <p className="font-mono text-[14px] tracking-[0.5px] mb-5 max-w-[320px] break-all leading-[1.7] text-center" style={{ color: 'hsl(var(--ritual-gold-muted))', opacity: 0.5 }}>
              {mark.hash}
            </p>

            {/* Proof components */}
            <div className="flex items-center gap-5 mb-8">
              <span className="font-mono text-[13px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)' }}>certificate</span>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
              <span className="font-mono text-[13px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)' }}>hash</span>
              {isAnchored ? (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(197,147,90,0.35)' }} />
                  <span className="font-mono text-[13px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)' }}>proof.ots</span>
                </>
              ) : (
                <>
                  <motion.span
                    className="w-[3px] h-[3px] rounded-full"
                    style={{ background: 'rgba(197,147,90,0.35)' }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="font-mono text-[13px] tracking-[2px]" style={{ color: 'rgba(197,147,90,0.55)', opacity: 0.6 }}>proof.ots</span>
                </>
              )}
            </div>
          </div>

          {/* ── Inline Verify + Share zone ── */}
          <div className="w-full flex flex-col items-center">
            {!zipFile ? (
              /* Drop zone for ZIP */
              <div
                className="w-full max-w-[320px] flex flex-col items-center gap-3 py-6 px-4 rounded-lg cursor-pointer transition-all"
                style={{
                  border: `1px dashed rgba(197,147,90,${isDragging ? '0.5' : '0.2'})`,
                  background: isDragging ? 'rgba(197,147,90,0.04)' : 'transparent',
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => zipInputRef.current?.click()}
              >
                <p className="font-garamond text-[16px] text-center" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {isDragging ? 'Drop your ZIP here' : 'Drop or select your proof ZIP'}
                </p>
                <p className="font-mono text-[12px] tracking-[1px] text-center" style={{ color: 'rgba(197,147,90,0.35)' }}>
                  to verify and share
                </p>
              </div>
            ) : (
              /* ZIP loaded — verify + share actions */
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3 8L7 12L13 4" fill="none" stroke="rgba(197,147,90,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-mono text-[13px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.6)' }}>
                    {zipFile.name}
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <button
                    onClick={handleShareZip}
                    disabled={saved}
                    className="font-playfair text-[18px] px-8 py-3 rounded-full transition-all disabled:opacity-50"
                    style={{
                      fontWeight: 300,
                      background: saved ? 'hsl(var(--ritual-gold) / 0.15)' : 'hsl(var(--ritual-gold) / 0.08)',
                      border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.5' : '0.25'})`,
                      color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.85'})`,
                    }}
                  >
                    {saved ? '✓ Shared' : 'Share'}
                  </button>
                </div>

                <button
                  onClick={() => setZipFile(null)}
                  className="font-mono text-[11px] tracking-[1px] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-80"
                  style={{ color: 'rgba(245,240,232,0.3)' }}
                >
                  choose different file
                </button>
              </div>
            )}

            {/* Hidden ZIP input */}
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleZipFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Device signed — small checkmark, ghost */}
          {credentialRef.current && (
            <div className="flex items-center gap-2 mt-6">
              <svg width="14" height="14" viewBox="0 0 12 12">
                <path d="M2 6L5 9L10 3" fill="none" stroke="rgba(197,147,90,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-mono text-[12px] tracking-[1px]" style={{ color: 'rgba(197,147,90,0.3)' }}>
                device signed
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
