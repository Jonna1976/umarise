/**
 * VerifyOriginButton - Hash Verification UI
 * 
 * Allows users to verify the SHA-256 fingerprint of their captured artifact.
 * Downloads the stored image and compares its hash against the recorded origin hash.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { calculateSHA256FromBlob, HashVerificationResult } from '@/lib/originHash';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VerifyOriginButtonProps {
  imageUrl: string;
  originHashSha256: string | null;
  originHashAlgo?: 'sha256' | null;
}

type VerificationState = 'idle' | 'verifying' | 'verified' | 'mismatch' | 'no-hash';

export function VerifyOriginButton({ imageUrl, originHashSha256, originHashAlgo }: VerifyOriginButtonProps) {
  const [state, setState] = useState<VerificationState>('idle');
  const [result, setResult] = useState<HashVerificationResult | null>(null);

  const handleVerify = async () => {
    // No hash stored - this is a pre-migration capture
    if (!originHashSha256) {
      setState('no-hash');
      toast.info('This capture predates hash verification', {
        description: 'Origin hashes are only available for new captures.',
      });
      return;
    }

    setState('verifying');

    try {
      // Fetch the stored image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      
      // Calculate hash of the fetched image
      const actualHash = await calculateSHA256FromBlob(blob);
      
      const verificationResult: HashVerificationResult = {
        match: actualHash.toLowerCase() === originHashSha256.toLowerCase(),
        expectedHash: originHashSha256.toLowerCase(),
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
      case 'no-hash':
        return (
          <>
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400">No hash</span>
          </>
        );
      default:
        return (
          <>
            <Fingerprint className="w-3 h-3" />
            <span>Verify origin</span>
          </>
        );
    }
  };

  const isClickable = state === 'idle' || state === 'no-hash';

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVerify}
        disabled={state === 'verifying'}
        className="h-7 px-2 text-xs gap-1.5 text-codex-cream/60 hover:text-codex-cream hover:bg-codex-cream/10"
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
