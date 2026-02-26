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
import { calculateSHA256, calculateSHA256FromFile } from '@/lib/originHash';

export interface AttestationData {
  /** Attestation ID (UUID) */
  attestation_id: string;
  /** Origin ID this attestation belongs to */
  origin_id: string;
  /** Name of the certified attestant */
  attested_by: string;
  /** ISO 8601 timestamp of attestation confirmation */
  attested_at: string;
  /** Cryptographic signature by the attestant */
  signature: string;
  /** Public key of the attestant (for independent verification) */
  attestant_public_key: string;
  /** Optional certificate identifier or description */
  attestant_certificate?: string | null;
  /** Public verification URL */
  verify_url: string;
}

export interface OriginZipInput {
  originId: string;
  hash: string;
  timestamp: Date;
  imageUrl: string | null;
  claimedBy?: string | null;
  signature?: string | null;
  /** WebAuthn signature over the hash (v1.1, null if no passkey or signing failed) */
  deviceSignature?: string | null;
  /** SPKI public key of the signing device (v1.1, null if no passkey or signing failed) */
  devicePublicKey?: string | null;
  /** Base64-encoded OpenTimestamps proof binary (included when status = anchored) */
  otsProof?: string | null;
  /** Original artifact File object (user re-selected). Hash is verified before inclusion. */
  artifactFile?: File | null;
  /** Layer 3 attestation data (included when attestation is confirmed) */
  attestation?: AttestationData | null;
  /** Original filename for enriched ZIP naming (e.g. "contract.pdf") */
  originalFileName?: string | null;
}

/**
 * Build a descriptive ZIP filename for easy retrieval in Downloads.
 * Format: origin-{TOKEN}-{sanitized-name}-{YYYYMMDD}.zip
 */
export function buildZipFileName(originId: string, timestamp: Date, originalFileName?: string | null): string {
  const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim().slice(0, 8);
  const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');

  if (originalFileName) {
    // Strip extension + sanitize: only keep alphanumeric, dash, underscore
    const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
    const sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 40); // cap length
    if (sanitized) {
      return `origin-${cleanId}-${sanitized}-${dateStr}.zip`;
    }
  }

  return `origin-${cleanId}-${dateStr}.zip`;
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
  const cleanId = input.originId.toUpperCase().replace(/^(ORIGIN\s+|ANCHOR\s+|UM-)/i, '').trim();

  // 1. Add artifact — prefer verified File over URL fetch
  if (input.artifactFile) {
    // ENFORCEMENT: verify hash before including — reject silently if mismatch
    // This prevents packaging a wrong/modified file and breaking verification
    const artifactBuffer = await input.artifactFile.arrayBuffer();
    const artifactHash = await calculateSHA256(artifactBuffer);
    const expectedHash = input.hash.toLowerCase().replace(/^sha256:/, '');

    if (artifactHash === expectedHash) {
      const ext = mimeToExtension(input.artifactFile.type);
      zip.file(`artifact.${ext}`, input.artifactFile);
      console.log('[originZip] Artifact included — hash verified ✓');
    } else {
      // Hash mismatch: do NOT include the file — ZIP remains valid without it
      console.error('[originZip] ⚠ Artifact EXCLUDED — hash mismatch!', {
        expected: expectedHash,
        actual: artifactHash,
        file: input.artifactFile.name,
      });
    }
  } else if (input.imageUrl) {
    // Fallback: fetch artifact bytes from imageUrl (thumbnail/preview).
    // NOTE: This may be a compressed thumbnail — the sha256 will NOT match the
    // attested hash. The artifact is still included so anchoring.app and verifiers
    // can open the ZIP and inspect it; the certificate.json hash remains authoritative.
    const fetched = await fetchArtifactBytes(input.imageUrl);
    if (fetched) {
      zip.file(`artifact.${fetched.ext}`, fetched.blob);
      console.info('[originZip] imageUrl fallback: artifact included (may be thumbnail — hash may differ)');
    } else {
      console.warn('[originZip] imageUrl fallback: could not fetch artifact, ZIP will have no artifact');
    }
  }

  // 2. Add certificate.json (immutable schema from certificate.ts)
  const hasProof = !!input.otsProof;
  const hasAttestation = !!input.attestation;
  console.log('[originZip] Building certificate with deviceSignature:', !!input.deviceSignature, 'devicePublicKey:', !!input.devicePublicKey, 'attestation:', hasAttestation);
  const cert = createCertificate(
    cleanId,
    input.hash,
    input.timestamp,
    input.claimedBy ?? null,
    input.signature ?? null,
    hasProof,
    hasProof ? 'anchored' : 'pending',
    input.deviceSignature ?? null,
    input.devicePublicKey ?? null,
    hasAttestation,
  );
  console.log('[originZip] Certificate version:', cert.version, 'attestation_included:', cert.attestation_included);
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

  // 4. Add attestation.json (Layer 3 — when confirmed)
  if (input.attestation) {
    const attestationJson = JSON.stringify({
      schema_version: '1.0',
      attestation_id: input.attestation.attestation_id,
      origin_id: input.attestation.origin_id,
      attested_by: input.attestation.attested_by,
      attested_at: input.attestation.attested_at,
      signature: input.attestation.signature,
      attestant_public_key: input.attestation.attestant_public_key,
      attestant_certificate: input.attestation.attestant_certificate ?? null,
      verify_url: input.attestation.verify_url,
      verification_note: 'Verify the signature using attestant_public_key against: attestation_id + origin_id + hash + attested_at',
    }, null, 2);
    zip.file('attestation.json', attestationJson);
    console.log('[originZip] attestation.json included ✓');
  }

  // 5. Add VERIFY.txt (Guardian C8 + C17: independent verification instructions)
  const hasDeviceBinding = !!(input.deviceSignature && input.devicePublicKey);

  const proofOtsSection = hasProof
    ? '- proof.ots         : OpenTimestamps proof (anchored to Bitcoin)'
    : '- proof.ots         : Not yet available. Anchoring in progress.\n' +
      '                       Re-download ZIP after anchoring completes, or fetch\n' +
      `                       proof separately:\n` +
      `                       curl https://core.umarise.com/v1-core-proof?origin_id=${cleanId} -o proof.ots`;

  const attestationSection = hasAttestation
    ? '- attestation.json  : Layer 3 attestation — third-party confirmation of human action'
    : '';

  const attestationVerifySection = hasAttestation
    ? `
VERIFY ATTESTATION (Layer 3):
   The attestation.json file contains a cryptographic signature from a
   certified independent attestant confirming the human action behind this anchor.

   To verify independently:
   1. Extract attestant_public_key from attestation.json
   2. Verify the signature against: attestation_id + origin_id + hash + attested_at
   3. Or verify online: ${input.attestation!.verify_url}
`
    : '';

  const layer2Section = `
LAYER 2 — DEVICE BINDING:
   ${hasDeviceBinding
     ? 'This anchor includes a cryptographic device signature (WebAuthn/Passkey).\n   The certificate.json contains device_signature and device_public_key fields.\n\n   What this proves:\n     The anchor was created on a specific hardware device (e.g. iPhone, MacBook)\n     using a biometric confirmation (Face ID, fingerprint, or device PIN).\n\n   What this does NOT prove:\n     The identity of the person operating the device.\n     Device binding establishes hardware provenance, not personal identity.'
     : 'No device signature was recorded for this anchor.\n   Device binding is optional and depends on hardware support (WebAuthn/Passkey).'
   }
`;

  const verifyTxt = `VERIFICATION INSTRUCTIONS
=========================

This ZIP contains an independently verifiable existence proof.

Contents:
- certificate.json  : Origin metadata (origin_id, hash, captured_at, device binding)
${proofOtsSection}
${attestationSection}
- artifact.*        : The original file (if included by the owner)
- VERIFY.txt        : This file

NOTE ON ARTIFACT INCLUSION:
   The original file is included at the owner's discretion.
   For sensitive files, the owner may choose to share only the proof
   (certificate + .ots) without the original. The hash in certificate.json
   is sufficient to verify any file independently:
     sha256sum <your-file>
   Compare the output with the "hash" field in certificate.json.

   When an artifact IS included, it is hash-enforced: if the file does not
   match the hash in certificate.json, it is excluded automatically.
   A present artifact is always the exact original.

VERIFY ONLINE:
  https://verify-anchoring.org
  Upload this ZIP or the original file.

VERIFY INDEPENDENTLY (no platform needed):
  1. Verify hash integrity:
     sha256sum artifact.*
     Compare output with "hash" field in certificate.json (without sha256: prefix)

  2. Verify Bitcoin proof (requires ots-cli: https://github.com/opentimestamps/opentimestamps-client):
     ots verify proof.ots

  3. Or use the included verification scripts:
     bash verify-anchor.sh this-file.zip
     python verify-anchor.py this-file.zip

Both scripts require only standard tools (sha256sum/unzip/jq for bash,
Python 3.8+ stdlib for Python). No platform infrastructure needed.

Scripts available at: https://umarise.com/reviewer

SPECIFICATION:
  This proof conforms to the Anchoring Specification (IEC v1.0).
  Canonical reference: https://anchoring-spec.org/v1.0/
${layer2Section}${attestationVerifySection}
THREE LAYERS OF PROOF:
  Layer 1 — Existence & Time:
    SHA-256 hash + Bitcoin anchor = "these exact bytes existed at this time"

  Layer 2 — Device Identity:
    WebAuthn signature = "anchored on this specific hardware device"
    ${hasDeviceBinding ? '✓ Present in this ZIP' : '· Not recorded for this anchor'}

  Layer 3 — Third-Party Attestation:
    Certified independent attestant = "a human action was confirmed"
    ${hasAttestation ? '✓ Present in this ZIP' : '· Not requested for this anchor'}

WHAT THIS PROVES:
   The exact bytes of the artifact existed no later than the moment
   of Bitcoin ledger inclusion. Nothing more, nothing less.

WHAT THIS DOES NOT PROVE:
   Authorship, ownership, accuracy, legality, or identity.
`;
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
  const zipFileName = buildZipFileName(input.originId, input.timestamp, input.originalFileName);
  
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
