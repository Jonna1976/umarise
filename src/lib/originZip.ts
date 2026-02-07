/**
 * Origin ZIP Builder
 * 
 * Generates the local ZIP product — the tangible outcome of the ritual.
 * Contains: photo.jpg + certificate.json
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
 * Build a ZIP blob containing photo + certificate.json
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
  const cert = createCertificate(
    cleanId,
    input.hash,
    input.timestamp,
    input.claimedBy ?? null,
    input.signature ?? null,
  );
  zip.file('certificate.json', serializeCertificate(cert));

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
      // Fall through to download fallback
    }
  }

  // Fallback: direct download (desktop browsers)
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
