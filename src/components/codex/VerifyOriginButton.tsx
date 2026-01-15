/**
 * VerifyOriginButton - Hash Verification UI
 * 
 * Allows users to verify the SHA-256 fingerprint of their captured artifact.
 * Downloads the stored image and compares its hash against the recorded origin hash.
 * 
 * Supports lazy lookup from sidecar table if hash is not provided directly.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Check, X, Loader2, Clock } from 'lucide-react';
import { calculateSHA256FromBlob, HashVerificationResult } from '@/lib/originHash';
import { getDisplayImageUrl } from '@/hooks/useResolvedImageUrl';
import { lookupOriginHash } from '@/lib/pageService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VerifyOriginButtonProps {
  pageId: string;
  imageUrl: string;
  originHashSha256: string | null;
  originHashAlgo?: 'sha256' | null;
}

type VerificationState = 'idle' | 'loading-hash' | 'verifying' | 'verified' | 'mismatch' | 'legacy';

export function VerifyOriginButton({ pageId, imageUrl, originHashSha256, originHashAlgo }: VerifyOriginButtonProps) {
  const [state, setState] = useState<VerificationState>('idle');
  const [result, setResult] = useState<HashVerificationResult | null>(null);
  const [resolvedHash, setResolvedHash] = useState<string | null>(originHashSha256);
  const [hashChecked, setHashChecked] = useState(false);

  // Lazy lookup hash from sidecar if not provided
  useEffect(() => {
    if (originHashSha256) {
      setResolvedHash(originHashSha256);
      setHashChecked(true);
      return;
    }

    // Only lookup once
    if (hashChecked) return;

    const lookupHash = async () => {
      setState('loading-hash');
      const sidecarResult = await lookupOriginHash(pageId);
      if (sidecarResult) {
        setResolvedHash(sidecarResult.hash);
        console.log('[VerifyOrigin] Hash resolved from sidecar:', sidecarResult.hash.substring(0, 16) + '...');
      } else {
        console.log('[VerifyOrigin] No hash found for page:', pageId);
      }
      setHashChecked(true);
      setState('idle');
    };

    lookupHash();
  }, [pageId, originHashSha256, hashChecked]);

  const handleVerify = async () => {
    // Check if hash lookup is still pending
    if (!hashChecked) {
      return;
    }

    // No hash available after lookup
    if (!resolvedHash) {
      setState('legacy');
      return;
    }

    setState('verifying');

    try {
      // Resolve IPFS URLs to HTTP gateway URLs
      const resolvedUrl = getDisplayImageUrl(imageUrl);
      
      // Fetch the stored image
      const response = await fetch(resolvedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      
      // Calculate hash of the fetched image
      const actualHash = await calculateSHA256FromBlob(blob);
      
      const verificationResult: HashVerificationResult = {
        match: actualHash.toLowerCase() === resolvedHash.toLowerCase(),
        expectedHash: resolvedHash.toLowerCase(),
        actualHash: actualHash.toLowerCase(),
        fileName: imageUrl.split('/').pop() || 'image',
        verifiedAt: new Date().toISOString(),
        algorithm: 'sha256',
      };
      
      setResult(verificationResult);
      
      if (verificationResult.match) {
        setState('verified');
        toast.success('Origin verified', {
          description: 'The image matches its recorded fingerprint.',
        });
      } else {
        setState('mismatch');
        toast.error('Hash mismatch detected', {
          description: 'The stored image differs from the recorded origin.',
        });
        console.error('[VerifyOrigin] MISMATCH', verificationResult);
      }
    } catch (error) {
      setState('idle');
      toast.error('Verification failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('[VerifyOrigin] Error:', error);
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'loading-hash':
        return (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Loading...</span>
          </>
        );
      case 'verifying':
        return (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Verifying...</span>
          </>
        );
      case 'verified':
        return (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Verified</span>
          </>
        );
      case 'mismatch':
        return (
          <>
            <X className="w-3 h-3 text-red-400" />
            <span className="text-red-400">Mismatch</span>
          </>
        );
      case 'legacy':
        return (
          <>
            <Clock className="w-3 h-3 text-codex-cream/40" />
            <span className="text-codex-cream/40">Legacy capture</span>
          </>
        );
      default:
        // Show different idle state based on hash availability
        if (hashChecked && !resolvedHash) {
          return (
            <>
              <Clock className="w-3 h-3 text-codex-cream/40" />
              <span className="text-codex-cream/40">Legacy capture</span>
            </>
          );
        }
        return (
          <>
            <Fingerprint className="w-3 h-3" />
            <span>Verify origin</span>
          </>
        );
    }
  };

  const isClickable = state === 'idle' && hashChecked && resolvedHash;

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVerify}
        disabled={!isClickable}
        className="h-7 px-2 text-xs gap-1.5 text-codex-cream/60 hover:text-codex-cream hover:bg-codex-cream/10 disabled:opacity-50"
      >
        {getButtonContent()}
      </Button>
      
      <AnimatePresence>
        {result && state === 'verified' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="text-[10px] font-mono text-codex-cream/40 break-all leading-tight">
              SHA-256: {result.actualHash.slice(0, 16)}...
            </div>
          </motion.div>
        )}
        
        {result && state === 'mismatch' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="text-[10px] font-mono text-red-400/70 break-all leading-tight space-y-0.5">
              <div>Expected: {result.expectedHash.slice(0, 12)}...</div>
              <div>Actual: {result.actualHash.slice(0, 12)}...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
