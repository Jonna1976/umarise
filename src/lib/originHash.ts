/**
 * Origin Hash - SHA-256 Cryptographic Fingerprinting
 * 
 * SPECIFICATION: v1.0 (FROZEN)
 * See: docs/origin-hash-partner-spec.md
 * 
 * Generates a forensics-grade hash over the exact bytes of the original artifact.
 * This happens automatically at upload time - zero user friction.
 * 
 * Purpose: Make the human "begin moment" verifiable and audit-ready later,
 * without burdening the user with technical actions at capture.
 * 
 * ORIGIN BYTES DEFINITION (Canonical):
 * "Origin bytes = decoded raw bytes of the captured image payload, 
 *  pre-encryption, pre-storage."
 * 
 * CRITICAL: Hash must be calculated on EXACTLY the same bytes that are stored.
 * This ensures forensic integrity - the hash matches what's in storage.
 * 
 * SCOPE BOUNDARY (v1 Complete):
 * - No timestamps beyond capture metadata
 * - No blockchain anchoring  
 * - No authorship claims
 * - No identity assertions
 * - No AI provenance semantics
 * Additional guarantees are out of scope for v1.
 */

/**
 * Calculate SHA-256 hash of raw bytes (ArrayBuffer or Uint8Array)
 * Returns 64-character lowercase hex string
 * 
 * IMPORTANT: Handles Uint8Array with byteOffset correctly to ensure
 * we only hash the actual view, not the entire underlying buffer.
 */
export async function calculateSHA256(data: ArrayBuffer | Uint8Array): Promise<string> {
  // Handle Uint8Array with potential byteOffset (critical for correctness)
  // If data is a view into a larger buffer, we must slice to get only our bytes
  let buffer: ArrayBuffer;
  if (data instanceof Uint8Array) {
    // Create a new ArrayBuffer with just our bytes (handles byteOffset correctly)
    buffer = new Uint8Array(data).buffer;
  } else {
    buffer = data;
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Decode a data URL to raw bytes and detect MIME type
 * Returns the exact bytes that should be stored AND hashed
 */
export function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  
  const mimeType = match[1];
  const base64 = match[2];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return { bytes, mimeType };
}

/**
 * Calculate SHA-256 hash from a data URL (base64 image)
 * Returns both the hash AND the decoded bytes/mimeType for upload
 * 
 * This ensures we hash EXACTLY what we upload (single source of truth)
 */
export async function hashAndDecodeDataUrl(dataUrl: string): Promise<{
  hash: string;
  bytes: Uint8Array;
  mimeType: string;
}> {
  const { bytes, mimeType } = decodeDataUrl(dataUrl);
  const hash = await calculateSHA256(bytes);
  return { hash, bytes, mimeType };
}

/**
 * Calculate SHA-256 hash from a Blob
 */
export async function calculateSHA256FromBlob(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  return calculateSHA256(arrayBuffer);
}

/**
 * Calculate SHA-256 hash from a File (for verification)
 */
export async function calculateSHA256FromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return calculateSHA256(arrayBuffer);
}

/**
 * Verify that a file matches an expected hash
 * Returns true if match, false if no match
 */
export async function verifyFileHash(file: File, expectedHash: string): Promise<boolean> {
  const actualHash = await calculateSHA256FromFile(file);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Hash verification result for export/audit purposes
 */
export interface HashVerificationResult {
  match: boolean;
  expectedHash: string;
  actualHash: string;
  fileName: string;
  verifiedAt: string;
  algorithm: 'sha256';
}

/**
 * Verify a file against an expected hash and return detailed result
 */
export async function verifyFileHashDetailed(
  file: File, 
  expectedHash: string
): Promise<HashVerificationResult> {
  const actualHash = await calculateSHA256FromFile(file);
  return {
    match: actualHash.toLowerCase() === expectedHash.toLowerCase(),
    expectedHash: expectedHash.toLowerCase(),
    actualHash: actualHash.toLowerCase(),
    fileName: file.name,
    verifiedAt: new Date().toISOString(),
    algorithm: 'sha256',
  };
}
