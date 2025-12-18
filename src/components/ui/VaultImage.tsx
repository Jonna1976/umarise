/**
 * VaultImage - Decrypts and displays encrypted images from Private Vault
 * 
 * Automatically handles encrypted (.enc) vs unencrypted images.
 * Shows loading state during decryption.
 */

import { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { getStorageProvider } from '@/lib/abstractions';
import { cn } from '@/lib/utils';

interface VaultImageProps {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export function VaultImage({ src, alt = 'Page image', className, onClick }: VaultImageProps) {
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
        
        if (storage.isEncryptedUrl(src)) {
          setIsEncrypted(true);
          // Decrypt the image
          const decryptedUrl = await storage.getDecryptedImageUrl(src);
          objectUrl = decryptedUrl;
          setDisplayUrl(decryptedUrl);
        } else {
          // Regular image, use directly
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

  if (isLoading) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted/50 animate-pulse',
        className
      )}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Lock className="h-5 w-5 animate-pulse" />
          <span className="text-xs">Decrypting...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-destructive/10 border border-destructive/20',
        className
      )}>
        <div className="flex flex-col items-center gap-2 text-destructive p-4 text-center">
          <AlertCircle className="h-5 w-5" />
          <span className="text-xs">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={displayUrl || ''}
        alt={alt}
        className={className}
        onClick={onClick}
      />
      {isEncrypted && (
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5" title="Private Vault - Encrypted">
          <Lock className="h-3 w-3 text-primary" />
        </div>
      )}
    </div>
  );
}
