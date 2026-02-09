/**
 * Certificate of Beginning — Immutable Schema
 * 
 * This schema defines the certificate.json included in the local ZIP product.
 * It contains ONLY immutable facts that never change after creation.
 * 
 * What is NOT in this schema:
 * - `status` — dynamic, fetched via /v1-core-resolve
 * - `proof.ots` — separate file in the ZIP, not a certificate field
 * 
 * What is optional:
 * - `claimed_by` — public key from passkey (only when user enables passkey toggle)
 * - `signature` — hash signed by private key (verifiable with claimed_by, no server lookup)
 * 
 * This format must be identical to what verify.umarise.com reads.
 * Once created, a certificate is never modified.
 */

export interface OriginCertificate {
  /** Schema version — always "1.0" for v1 certificates */
  version: '1.0';

  /** 8-character hex identifier (without prefix), e.g. "1916F13F" */
  origin_id: string;

  /** Full SHA-256 hash of the original artifact */
  hash: string;

  /** Hash algorithm used — always "SHA-256" for v1 */
  hash_algo: 'SHA-256';

  /** ISO 8601 timestamp of when the origin was captured */
  captured_at: string;

  /** URL for independent verification */
  verify_url: string;

  /** Whether a proof.ots file is included in this ZIP */
  proof_included: boolean;

  /** Current proof status: pending (not yet anchored), anchored (Bitcoin-verified) */
  proof_status: 'pending' | 'anchored';

  /** 
   * Public key of the passkey credential (optional).
   * Only populated when the user enables the passkey toggle.
   * Used by verifiers to check the signature without a server lookup.
   */
  claimed_by: string | null;

  /**
   * Cryptographic signature of the hash, signed by the private key
   * corresponding to `claimed_by` (optional).
   * Verifiable client-side using the public key in `claimed_by`.
   */
  signature: string | null;
}

/**
 * Create an immutable certificate for inclusion in the ZIP product.
 * 
 * @param originId - 8-char hex ID (e.g. "1916F13F")
 * @param hash - Full SHA-256 hash
 * @param capturedAt - Date of capture
 * @param claimedBy - Optional passkey public key
 * @param signature - Optional cryptographic signature
 * @param proofIncluded - Whether proof.ots is included in this ZIP
 * @param proofStatus - Current anchoring status
 */
export function createCertificate(
  originId: string,
  hash: string,
  capturedAt: Date,
  claimedBy: string | null = null,
  signature: string | null = null,
  proofIncluded: boolean = false,
  proofStatus: 'pending' | 'anchored' = 'pending',
): OriginCertificate {
  // Strip prefix if present (um- → raw hex)
  const cleanId = originId.toUpperCase().replace(/^UM-/i, '');

  return {
    version: '1.0',
    origin_id: cleanId,
    hash,
    hash_algo: 'SHA-256',
    captured_at: capturedAt.toISOString(),
    verify_url: 'https://umarise.com/verify',
    proof_included: proofIncluded,
    proof_status: proofStatus,
    claimed_by: claimedBy,
    signature,
  };
}

/**
 * Serialize a certificate to a JSON string for inclusion in the ZIP.
 * Pretty-printed for human readability.
 */
export function serializeCertificate(cert: OriginCertificate): string {
  return JSON.stringify(cert, null, 2);
}
