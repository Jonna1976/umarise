/**
 * VaultImage - Resolves and displays images from various storage backends
 * 
 * Handles:
 * - Encrypted (.enc) images from Private Vault - decrypts before display
 * - IPFS URLs (ipfs://) - resolves via gateway
 * - Regular HTTP URLs - displays directly
 */

import { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { getStorageProvider, resolveIpfsUrl, isIpfsUrl } from '@/lib/abstractions';
import { cn } from '@/lib/utils';

interface VaultImageProps {
  src: string;
  alt?: string;
  /** Styles applied to the outer wrapper (recommended: sizing, border, radius). */
  className?: string;
  /** Styles applied to the underlying <img>. */
  imgClassName?: string;
  onClick?: () => void;
}

export function VaultImage({
  src,
  alt = 'Page image',
  className,
  imgClassName,
  onClick,
}: VaultImageProps) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadImage() {
      setIsLoading(true);
      setError(null);

      try {
        const storage = getStorageProvider();

        // Check if it's an IPFS URL (not necessarily encrypted)
        if (isIpfsUrl(src)) {
          // Check if it's encrypted (has .enc extension)
          const isEncryptedIpfs = src.includes('.enc');

          if (isEncryptedIpfs) {
            setIsEncrypted(true);
            // Decrypt the image via storage provider
            const decryptedUrl = await storage.getDecryptedImageUrl(src);
            objectUrl = decryptedUrl;
            setDisplayUrl(decryptedUrl);
          } else {
            // Just resolve IPFS to HTTP gateway
            setIsEncrypted(false);
            const httpUrl = resolveIpfsUrl(src);
            setDisplayUrl(httpUrl);
          }
        } else if (storage.isEncryptedUrl(src)) {
          // Non-IPFS encrypted URL
          setIsEncrypted(true);
          const decryptedUrl = await storage.getDecryptedImageUrl(src);
          objectUrl = decryptedUrl;
          setDisplayUrl(decryptedUrl);
        } else {
          // Regular image URL, use directly
          setIsEncrypted(false);
          setDisplayUrl(src);
        }
      } catch (e) {
        console.error('Failed to load image:', e);
        setError(e instanceof Error ? e.message : 'Failed to load image');
      } finally {
        setIsLoading(false);
      }
    }

    loadImage();

    // Cleanup object URL on unmount
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  // Keep layout stable even while loading/error to prevent overlay bleed
  const wrapperClass = cn('relative overflow-hidden', className);

  if (isLoading) {
    return (
      <div className={wrapperClass} onClick={onClick}>
        <div className="flex min-h-[220px] w-full items-center justify-center bg-muted/50 animate-pulse">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5 animate-pulse" />
            <span className="text-xs">Decrypting...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={wrapperClass} onClick={onClick}>
        <div className="flex min-h-[220px] w-full items-center justify-center bg-destructive/10 border border-destructive/20">
          <div className="flex flex-col items-center gap-2 text-destructive p-4 text-center">
            <AlertCircle className="h-5 w-5" />
            <span className="text-xs">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} onClick={onClick}>
      <img
        src={displayUrl || ''}
        alt={alt}
        className={cn('block w-full h-auto', imgClassName)}
      />
      {isEncrypted && (
        <div
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5"
          title="Private Vault - Encrypted"
        >
          <Lock className="h-3 w-3 text-primary" />
        </div>
      )}
    </div>
  );
}
