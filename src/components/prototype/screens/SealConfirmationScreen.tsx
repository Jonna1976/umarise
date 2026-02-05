/**
 * Seal Confirmation Screen
 * 
 * Post-mark: Show beautiful in-app certificate (no PDF download).
 * Users can screenshot or share via native share sheet.
 * 
 * This keeps the ritual experience intact without breaking to
 * ugly iOS file previews.
 */

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';
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
  originId, 
  hash, 
  timestamp, 
  thumbnailUrl,
  onComplete, 
  onSkip 
}: SealConfirmationProps) {
  const [isSharing, setIsSharing] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Format date in ritual style
  const formattedDate = timestamp.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Truncate hash for display
  const shortHash = hash ? `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}` : '—';

  const handleShare = useCallback(async () => {
    if (!certificateRef.current || isSharing) return;
    
    setIsSharing(true);
    
    try {
      // Capture certificate as image using html2canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#050A05', // ritual surface color
        allowTaint: true,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Failed to create image')),
          'image/jpeg',
          0.92
        );
      });

      const file = new File([blob], `umarise-certificate-${originId}.jpg`, { type: 'image/jpeg' });

      // Use native share with file
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Certificate of Beginning',
        });
        toast.success('Shared');
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `umarise-certificate-${originId}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Certificate downloaded');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled - that's fine
        return;
      }
      console.error('[SealConfirmation] Share error:', error);
      
      // Fallback: copy text to clipboard
      try {
        await navigator.clipboard.writeText(
          `Origin: ${originId}\nSealed: ${formattedDate} at ${formattedTime}\nFingerprint: ${hash.substring(0, 24)}...`
        );
        toast.success('Proof copied to clipboard');
      } catch {
        toast.error('Could not share');
      }
    } finally {
      setIsSharing(false);
    }
  }, [originId, hash, formattedDate, formattedTime, isSharing]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Certificate Card - designed to be screenshot-friendly */}
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
        {/* Decorative corner marks */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" 
             style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" 
             style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" 
             style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" 
             style={{ borderColor: 'hsl(var(--ritual-gold) / 0.3)' }} />

        {/* U Seal */}
        <div className="text-center mb-4">
          <span className="font-playfair text-3xl text-ritual-gold opacity-80">U</span>
        </div>

        {/* Title */}
        <h2 className="font-playfair text-lg text-ritual-gold text-center mb-5">
          Certificate of Beginning
        </h2>

        {/* Thumbnail (if available) */}
        {thumbnailUrl && (
          <div className="w-20 h-20 mx-auto mb-5 rounded overflow-hidden"
               style={{ border: '1px solid hsl(var(--ritual-gold) / 0.15)' }}>
            <img 
              src={thumbnailUrl} 
              alt="Marked artifact" 
              className="w-full h-full object-cover opacity-80"
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
              {originId}
            </p>
          </div>

          {/* Timestamp */}
          <div>
            <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
               style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
              SEALED
            </p>
            <p className="font-garamond text-sm" style={{ color: 'hsl(var(--ritual-cream) / 0.8)' }}>
              {formattedDate} at {formattedTime}
            </p>
          </div>

          {/* Hash/Fingerprint */}
          <div>
            <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1"
               style={{ color: 'hsl(var(--ritual-gold-muted))' }}>
              FINGERPRINT
            </p>
            <p className="font-mono text-[10px] break-all" 
               style={{ color: 'hsl(var(--ritual-cream) / 0.5)' }}>
              {shortHash}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid hsl(var(--ritual-gold) / 0.1)' }}>
          <p className="font-mono text-[9px] tracking-wide"
             style={{ color: 'hsl(var(--ritual-gold) / 0.5)' }}>
            ⏳ Pending Bitcoin anchor
          </p>
        </div>

        {/* Footer */}
        <p className="mt-4 font-garamond italic text-[9px] text-center"
           style={{ color: 'hsl(var(--ritual-cream) / 0.25)' }}>
          sealed on your device · only the proof leaves
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="mt-8 flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Share button - subtle */}
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-garamond text-sm
                     transition-all disabled:opacity-50"
          style={{
            background: 'hsl(var(--ritual-gold) / 0.08)',
            border: '1px solid hsl(var(--ritual-gold) / 0.25)',
            color: 'hsl(var(--ritual-gold) / 0.8)',
          }}
        >
          <Share2 className="w-4 h-4" />
          {isSharing ? 'Sharing...' : 'Share proof'}
        </button>

        {/* Skip to Wall */}
        <button
          onClick={onComplete}
          className="font-garamond text-xs transition-opacity hover:opacity-60"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
        >
          continue to Wall
        </button>
      </motion.div>

      {/* Screenshot hint */}
      <motion.p
        className="absolute bottom-6 font-garamond italic text-[10px]"
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
