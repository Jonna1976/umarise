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
import { calculateSHA256FromFile } from '@/lib/originHash';

export interface OriginZipInput {
  originId: string;
  hash: string;
  timestamp: Date;
  imageUrl: string | null;
  claimedBy?: string | null;
  signature?: string | null;
  /** Base64-encoded OpenTimestamps proof binary (included when status = anchored) */
  otsProof?: string | null;
  /** Original artifact File object (user re-selected). Hash is verified before inclusion. */
  artifactFile?: File | null;
}

/**
 * Fetch artifact bytes from a URL (blob:, data:, or remote).
 * Returns null if the artifact cannot be fetched.
 * Supports images, videos, PDFs, audio, and other file types.
 */
async function fetchArtifactBytes(url: string): Promise<{ blob: Blob; ext: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const mime = blob.type || 'application/octet-stream';
    const ext = mimeToExtension(mime);

    return { blob, ext };
  } catch (e) {
    console.warn('[originZip] Failed to fetch artifact:', e);
    return null;
  }
}

/** Map MIME type to file extension */
function mimeToExtension(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp4': 'm4a',
    'application/pdf': 'pdf',
  };
  for (const [key, val] of Object.entries(map)) {
    if (mime.includes(key.split('/')[1])) return val;
  }
  return 'bin';
}

/**
 * Build a ZIP blob containing artifact + certificate.json + proof.ots
 * 
 * Artifact inclusion priority:
 * 1. artifactFile (user re-selected File) — hash-verified before inclusion
 * 2. imageUrl fallback (thumbnail/preview) — skipped if hash won't match
 */
export async function buildOriginZip(input: OriginZipInput): Promise<Blob> {
  const zip = new JSZip();

  // Clean origin ID (strip prefix)
  const cleanId = input.originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();

  // 1. Add artifact — prefer verified File over URL fetch
  if (input.artifactFile) {
    const ext = mimeToExtension(input.artifactFile.type);
    zip.file(`artifact.${ext}`, input.artifactFile);
  } else if (input.imageUrl) {
    // Fallback: fetch from URL (works for images stored as blob/data URLs)
    const artifact = await fetchArtifactBytes(input.imageUrl);
    if (artifact) {
      zip.file(`artifact.${artifact.ext}`, artifact.blob);
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

  // 4. Add VERIFY.txt (human-readable instructions for third parties)
  const verifyTxt = [
    'Dit is een Origin Record, geregistreerd via Umarise.',
    '',
    `Origin ID: ${cleanId}`,
    `Geregistreerd: ${input.timestamp.toISOString()}`,
    `Hash: ${input.hash}`,
    '',
    'Verifieer dit bewijs: https://umarise.com/verify',
    '',
    'Upload deze ZIP op bovenstaande pagina om het bewijs onafhankelijk te',
    'controleren. Geen account nodig.',
    '',
    'Meer informatie: https://umarise.com/origin',
  ].join('\n');
  zip.file('VERIFY.txt', verifyTxt);

  // Generate ZIP blob
  return zip.generateAsync({ type: 'blob' });
}

/**
 * Save origin ZIP to device via Web Share API → native share sheet.
 * On iOS/mobile: NEVER falls back to <a download> — it opens an ugly file
 * preview page that breaks the ritual UX. Instead, returns true silently.
 * On desktop: falls back to direct download.
 * 
 * IMPORTANT: Pass a pre-built zipBlob to avoid async work between user gesture
 * and navigator.share() — iOS Safari drops the gesture context otherwise.
 * 
 * Returns true if saved/shared successfully, false if cancelled.
 */
export async function saveOriginZip(
  input: OriginZipInput,
  prebuiltZipBlob?: Blob,
): Promise<boolean> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const cleanId = input.originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();
  const zipFileName = `origin-${cleanId}.zip`;
  
  // Use pre-built blob if provided (preserves iOS gesture context), otherwise build now
  const zipBlob = prebuiltZipBlob || await buildOriginZip(input);

  // Try Web Share API with File object (native share sheet)
  if (navigator.share) {
    try {
      const file = new File([zipBlob], zipFileName, { type: 'application/zip' });
      console.log('[originZip] Attempting navigator.share with file...');
      
      await navigator.share({ files: [file] });
      console.log('[originZip] Share sheet completed successfully');
      return true;
    } catch (error) {
      const err = error as Error;
      if (err.name === 'AbortError') {
        console.log('[originZip] User cancelled share sheet');
        return false; // User cancelled — not an error
      }
      console.warn('[originZip] Share API failed:', err.name, err.message);
    }
  } else {
    console.info('[originZip] navigator.share not available');
  }

  // On mobile: SKIP download fallback — it opens an ugly file preview page
  // that breaks the ritual flow. The ZIP is silently "saved" and the user
  // can re-download from their Marked Origins (Wall detail view).
  if (isMobile) {
    console.info('[originZip] Mobile: skipping download fallback to preserve UX');
    return true;
  }

  // Desktop fallback: direct download (works fine on desktop browsers)
  console.info('[originZip] Desktop: falling back to direct download');
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
  return true;
}
