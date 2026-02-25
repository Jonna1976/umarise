import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SealConfirmationProps {
  originId: string;
  hash: string;
  timestamp: Date;
  thumbnailUrl?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function SealConfirmationScreen({ 
  originId, hash, timestamp, thumbnailUrl, onComplete, onSkip 
}: SealConfirmationProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const formattedDate = timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const shortHash = hash ? `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}` : '—';

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const shareText = `✦ Certificate of Beginning ✦\n\nOrigin: ${originId}\nSealed: ${formattedDate} at ${formattedTime}\nFingerprint: ${hash.substring(0, 24)}...\n\nVerify at umarise.com`;
      if (navigator.share) {
        await navigator.share({ title: 'Certificate of Beginning', text: shareText });
        toast.success('Shared');
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(`Origin: ${originId}\nSealed: ${formattedDate} at ${formattedTime}\nFingerprint: ${hash.substring(0, 24)}...`);
        toast.success('Proof copied to clipboard');
      } catch { toast.error('Could not share'); }
    } finally { setIsSharing(false); }
  }, [originId, hash, formattedDate, formattedTime, isSharing]);

  const handleSaveCertificate = useCallback(async () => {
    if (!certificateRef.current || isSaving) return;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#050A05', allowTaint: true });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to create image')), 'image/jpeg', 0.92);
      });
      const file = new File([blob], `umarise-certificate-${originId}.jpg`, { type: 'image/jpeg' });
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
      toast.error('Could not save');
    } finally { setIsSaving(false); }
  }, [originId, isSaving]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        ref={certificateRef}
        className="w-full max-w-[320px] rounded-lg p-6 relative overflow-hidden"
        style={{ 
          background: 'hsl(var(--ritual-surface))',
          border: '1px solid hsl(var(--ritual-gold) / 0.2)',
          boxShadow: '0 0 60px hsl(var(--ritual-gold) / 0.05)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Corner marks */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />

        <div className="text-center mb-4">
          <span className="font-playfair text-3xl text-ritual-gold opacity-80">U</span>
        </div>

        <h2 className="font-playfair text-lg text-ritual-gold text-center mb-5" style={{ fontWeight: 300 }}>
          Certificate of Beginning
        </h2>

        {thumbnailUrl && (
          <div className="w-20 h-20 mx-auto mb-5 rounded overflow-hidden" style={{ border: '1px solid hsl(var(--ritual-gold) / 0.15)' }}>
            <img src={thumbnailUrl} alt="Marked artifact" className="w-full h-full object-cover opacity-80" />
          </div>
        )}

        <div className="space-y-3 text-center">
          <div>
            <p className="font-mono text-[18px] tracking-[2px] uppercase mb-1 opacity-[0.45]" style={{ color: 'hsl(var(--ritual-gold-muted))' }}>ORIGIN</p>
            <p className="font-mono text-sm tracking-wide text-ritual-cream">{originId}</p>
          </div>
          <div>
            <p className="font-mono text-[18px] tracking-[2px] uppercase mb-1 opacity-[0.45]" style={{ color: 'hsl(var(--ritual-gold-muted))' }}>SEALED</p>
            <p className="font-garamond text-sm" style={{ color: 'hsl(var(--ritual-cream) / 0.8)' }}>{formattedDate} at {formattedTime}</p>
          </div>
          <div>
            <p className="font-mono text-[18px] tracking-[2px] uppercase mb-1 opacity-[0.45]" style={{ color: 'hsl(var(--ritual-gold-muted))' }}>FINGERPRINT</p>
            <p className="font-mono text-[20px] break-all" style={{ color: 'hsl(var(--ritual-cream) / 0.5)' }}>{shortHash}</p>
          </div>
        </div>

        <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid hsl(var(--ritual-gold) / 0.1)' }}>
          <p className="font-mono text-[18px] tracking-wide" style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>⏳ Pending Bitcoin anchor</p>
        </div>

        <p className="mt-4 font-garamond italic text-[18px] text-center" style={{ color: 'hsl(var(--ritual-cream) / 0.25)' }}>
          sealed on your device · only the proof leaves
        </p>
      </motion.div>

      <motion.div className="mt-8 flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveCertificate} disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-garamond text-sm transition-all disabled:opacity-50"
            style={{ background: 'hsl(var(--ritual-gold) / 0.12)', border: '1px solid hsl(var(--ritual-gold) / 0.3)', color: 'hsl(var(--ritual-gold) / 0.9)' }}>
            <Download className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleShare} disabled={isSharing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-garamond text-sm transition-all disabled:opacity-50"
            style={{ background: 'hsl(var(--ritual-gold) / 0.05)', border: '1px solid hsl(var(--ritual-gold) / 0.15)', color: 'hsl(var(--ritual-gold) / 0.6)' }}>
            <Share2 className="w-4 h-4" />
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
        <button onClick={onComplete} className="font-garamond text-[24px] transition-opacity hover:opacity-60" style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}>
          continue to Wall
        </button>
      </motion.div>

      <motion.p
        className="absolute bottom-6 font-garamond italic text-[20px]"
        style={{ color: 'hsl(var(--ritual-cream) / 0.15)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        screenshot to keep forever
      </motion.p>
    </motion.div>
  );
}
