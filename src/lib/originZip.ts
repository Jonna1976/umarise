/**
 * Origin ZIP Builder
 * 
 * Generates the local ZIP product — the tangible outcome of the ritual.
 * Contains up to 3 files:
 *   1. photo.jpg    — the original artifact (if available)
 *   2. certificate.json — immutable metadata (always present)
 *   3. proof.ots    — OpenTimestamps proof binary (when anchored)
 * 
 * Uses Web Share API to trigger the native OS share sheet (no browser download bar).
 * Falls back to direct download when Web Share is unavailable.
 */

import JSZip from 'jszip';
import { createCertificate, serializeCertificate } from '@/lib/certificate';

export interface OriginZipInput {
  originId: string;
  hash: string;
  timestamp: Date;
  imageUrl: string | null;
  claimedBy?: string | null;
  signature?: string | null;
  /** Base64-encoded OpenTimestamps proof binary (included when status = anchored) */
  otsProof?: string | null;
}

/**
 * Fetch image bytes from a URL (blob:, data:, or remote).
 * Returns null if the image cannot be fetched.
 */
async function fetchImageBytes(url: string): Promise<{ blob: Blob; ext: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const mime = blob.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : 'jpg';

    return { blob, ext };
  } catch (e) {
    console.warn('[originZip] Failed to fetch image:', e);
    return null;
  }
}

/**
 * Build a ZIP blob containing photo + certificate.json + proof.ots
 */
export async function buildOriginZip(input: OriginZipInput): Promise<Blob> {
  const zip = new JSZip();

  // Clean origin ID (strip prefix)
  const cleanId = input.originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();

  // 1. Add photo (if available)
  if (input.imageUrl) {
    const image = await fetchImageBytes(input.imageUrl);
    if (image) {
      zip.file(`photo.${image.ext}`, image.blob);
    }
  }

  // 2. Add certificate.json (immutable schema from certificate.ts)
  const hasProof = !!input.otsProof;
  const cert = createCertificate(
    cleanId,
    input.hash,
    input.timestamp,
    input.claimedBy ?? null,
    input.signature ?? null,
    hasProof,
    hasProof ? 'anchored' : 'pending',
  );
  zip.file('certificate.json', serializeCertificate(cert));

  // 3. Add proof.ots (OpenTimestamps binary, when anchored)
  if (input.otsProof) {
    try {
      const binaryString = atob(input.otsProof);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      zip.file('proof.ots', bytes);
    } catch (e) {
      console.warn('[originZip] Failed to decode OTS proof:', e);
    }
  }

  // Generate ZIP blob
  return zip.generateAsync({ type: 'blob' });
}

/**
 * Save origin ZIP to device via Web Share API → native share sheet.
 * Falls back to direct download on desktop / unsupported browsers.
 * 
 * Returns true if saved/shared successfully, false if cancelled.
 */
export async function saveOriginZip(input: OriginZipInput): Promise<boolean> {
  const cleanId = input.originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();
  const zipBlob = await buildOriginZip(input);
  const zipFileName = `origin-${cleanId}.zip`;

  // Try Web Share API with File object (native share sheet)
  if (navigator.share) {
    try {
      const file = new File([zipBlob], zipFileName, { type: 'application/zip' });
      const canShareFiles = navigator.canShare?.({ files: [file] });

      if (canShareFiles) {
        await navigator.share({ files: [file] });
        return true;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return false; // User cancelled — not an error
      }
      console.warn('[originZip] Share API failed, trying fallback:', error);
    }
  }

  // Detect mobile/iOS — avoid ugly in-browser ZIP preview
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // On mobile: open blob URL in new tab → triggers iOS "Save to Files" sheet
    // This avoids the in-browser file preview that breaks the ritual flow
    try {
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Don't revoke immediately — give browser time to process
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.warn('[originZip] Mobile download fallback failed:', e);
    }
    // Always return true on mobile — the ZIP is generated and the ritual should advance.
    // The user can re-download from the Wall detail view if needed.
    return true;
  }

  // Desktop fallback: direct download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
