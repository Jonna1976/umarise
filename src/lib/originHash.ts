/**
 * Origin Hash - SHA-256 Cryptographic Fingerprinting
 * 
 * Generates a forensics-grade hash over the exact bytes of the original artifact.
 * This happens automatically at upload time - zero user friction.
 * 
 * Purpose: Make the human "begin moment" verifiable and audit-ready later,
 * without burdening the user with technical actions at capture.
 */

/**
 * Calculate SHA-256 hash of raw bytes (ArrayBuffer or Uint8Array)
 * Returns 64-character lowercase hex string
 */
export async function calculateSHA256(data: ArrayBuffer | Uint8Array): Promise<string> {
  // Ensure we have an ArrayBuffer for crypto.subtle.digest
  const buffer = data instanceof Uint8Array ? new Uint8Array(data).buffer : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate SHA-256 hash from a data URL (base64 image)
 * Decodes the base64 and hashes the raw bytes
 */
export async function calculateSHA256FromDataUrl(dataUrl: string): Promise<string> {
  // Extract base64 data from data URL
  const base64Match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Invalid data URL format');
  }
  
  const base64 = base64Match[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return calculateSHA256(bytes);
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
  };
}
