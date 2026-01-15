/**
 * Hook to resolve image URLs - handles IPFS URLs by converting to HTTP gateway
 */

import { useState, useEffect } from 'react';
import { resolveIpfsUrl, isIpfsUrl } from '@/lib/abstractions';

/**
 * Resolves an image URL to a displayable HTTP URL
 * Handles IPFS URLs by converting to gateway URL
 */
export function useResolvedImageUrl(url: string): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>(() => {
    if (isIpfsUrl(url)) {
      return resolveIpfsUrl(url);
    }
    return url;
  });

  useEffect(() => {
    if (isIpfsUrl(url)) {
      setResolvedUrl(resolveIpfsUrl(url));
    } else {
      setResolvedUrl(url);
    }
  }, [url]);

  return resolvedUrl;
}

/**
 * Synchronous utility to resolve an image URL
 * Use this for simple cases where a hook isn't needed
 */
export function getDisplayImageUrl(url: string): string {
  if (isIpfsUrl(url)) {
    return resolveIpfsUrl(url);
  }
  return url;
}
