/**
 * Mark Detail Modal
 * 
 * Fullscreen view of a single mark showing:
 * - Large thumbnail/image
 * - Origin ID, hash, timestamp
 * - OTS anchoring status (pending/anchored)
 * - Download certificate button (when anchored)
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Bitcoin, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

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
  const certificateRef = useRef<HTMLDivElement>(null);

  // Format date
  const formattedDate = mark.timestamp.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = mark.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Truncate hash for display
  const shortHash = mark.hash 
    ? `${mark.hash.substring(0, 12)}...${mark.hash.substring(mark.hash.length - 8)}`
    : '—';

  // OTS status display
  const getOtsStatusDisplay = () => {
    switch (mark.otsStatus) {
      case 'anchored':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          text: 'Anchored on Bitcoin',
          color: 'hsl(var(--ritual-gold))',
          canDownload: true,
        };
      case 'submitted':
        return {
          icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
          text: 'Awaiting confirmation...',
          color: 'hsl(var(--ritual-gold) / 0.6)',
          canDownload: false,
        };
      default:
        return {
          icon: <Bitcoin className="w-3.5 h-3.5" />,
          text: 'Pending anchor',
          color: 'hsl(var(--ritual-gold) / 0.4)',
          canDownload: false,
        };
    }
  };

  const otsStatus = getOtsStatusDisplay();

  // Download certificate as image
  const handleDownloadCertificate = useCallback(async () => {
    if (!certificateRef.current || isSaving) return;
    
    setIsSaving(true);
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#050A05',
        allowTaint: true,
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Failed to create image')),
          'image/jpeg',
          0.92
        );
      });

      const file = new File([blob], `umarise-proof-${mark.originId}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        toast.success('Saved');
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast('Long-press image to save', { duration: 3000 });
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('[MarkDetailModal] Save error:', error);
      toast.error('Could not save');
    } finally {
      setIsSaving(false);
    }
  }, [mark.originId, isSaving]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'hsl(var(--ritual-surface) / 0.95)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full transition-opacity hover:opacity-60"
          style={{ background: 'hsl(var(--ritual-gold) / 0.1)' }}
        >
          <X className="w-5 h-5 text-ritual-gold opacity-70" />
        </button>

        {/* Content */}
        <motion.div
          ref={certificateRef}
          className="w-full max-w-[340px] mx-4 rounded-lg p-6 relative overflow-hidden"
          style={{ 
            background: 'hsl(var(--ritual-surface))',
            border: '1px solid hsl(var(--ritual-gold) / 0.15)',
            boxShadow: '0 0 80px hsl(var(--ritual-gold) / 0.08)',
          }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" 
               style={{ borderColor: 'hsl(var(--ritual-gold) / 0.25)' }} />
          <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" 
               style={{ borderColor: 'hsl(var(--ritual-gold) / 0.25)' }} />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" 
               style={{ borderColor: 'hsl(var(--ritual-gold) / 0.25)' }} />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" 
               style={{ borderColor: 'hsl(var(--ritual-gold) / 0.25)' }} />

          {/* U Seal */}
          <div className="text-center mb-3">
            <span className="font-playfair text-2xl text-ritual-gold opacity-70">U</span>
          </div>

          {/* Thumbnail */}
          {mark.imageUrl && (
            <div 
              className="w-full aspect-[4/3] mx-auto mb-5 rounded overflow-hidden"
              style={{ border: '1px solid hsl(var(--ritual-gold) / 0.12)' }}
            >
              <img 
                src={mark.imageUrl} 
                alt="Marked artifact" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Certificate Data */}
          <div className="space-y-3 text-center">
            {/* Origin ID */}
            <div>
              <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
                 style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
                ORIGIN
              </p>
              <p className="font-mono text-sm tracking-wide text-ritual-cream">
                {mark.originId.toUpperCase().replace('UM-', '')}
              </p>
            </div>

            {/* Timestamp */}
            <div>
              <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
                 style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
                SEALED
              </p>
              <p className="font-garamond text-sm" style={{ color: 'hsl(var(--ritual-cream) / 0.75)' }}>
                {formattedDate} · {formattedTime}
              </p>
            </div>

            {/* Hash */}
            <div>
              <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
                 style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
                FINGERPRINT
              </p>
              <p className="font-mono text-[10px]" 
                 style={{ color: 'hsl(var(--ritual-cream) / 0.45)' }}>
                {shortHash}
              </p>
            </div>
          </div>

          {/* OTS Status */}
          <div 
            className="mt-5 pt-4 flex items-center justify-center gap-2"
            style={{ borderTop: '1px solid hsl(var(--ritual-gold) / 0.1)' }}
          >
            <span style={{ color: otsStatus.color }}>{otsStatus.icon}</span>
            <p className="font-mono text-[10px] tracking-wide" style={{ color: otsStatus.color }}>
              {otsStatus.text}
            </p>
          </div>

          {/* Download button (when anchored) */}
          {otsStatus.canDownload && (
            <motion.div 
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleDownloadCertificate}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-garamond text-sm
                           transition-all disabled:opacity-50"
                style={{
                  background: 'hsl(var(--ritual-gold) / 0.15)',
                  border: '1px solid hsl(var(--ritual-gold) / 0.35)',
                  color: 'hsl(var(--ritual-gold))',
                }}
              >
                <Download className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Download proof'}
              </button>
            </motion.div>
          )}

          {/* Footer whisper */}
          <p className="mt-4 font-garamond italic text-[9px] text-center"
             style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}>
            sealed on your device · verified on Bitcoin
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
