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
 * - `device_signature` — WebAuthn signature over the hash (v1.1)
 * - `device_public_key` — SPKI public key of the signing device (v1.1)
 * - `sig_algorithm` — explicit signing algorithm identifier (v1.3)
 * - `identity_binding` — assurance level and onboarding evidence reference (v1.3)
 * 
 * This format must be identical to what verify.umarise.com reads.
 * Once created, a certificate is never modified.
 * 
 * Version history:
 * - 1.0: Initial schema (hash, origin_id, claimed_by, signature)
 * - 1.1: Added device_signature + device_public_key (passkey signing of hash)
 * - 1.2: Added attestation_included (Layer 3)
 * - 1.3: Added sig_algorithm, identity_binding, meta (AES preparation)
 */

/** Identity assurance level */
export type IdentityLevel = 'L1' | 'L2' | 'L3';

/** Identity binding — links the anchor to a verified person */
export interface IdentityBinding {
  /** Assurance level: L1 = passkey only, L2 = KYC/video-ident, L3 = notarial */
  level: IdentityLevel;
  /** SHA-256 hash of onboarding evidence (KYC session, notarial act). Null for L1. */
  reference_hash_sha256: string | null;
  /** ISO 8601 timestamp of identity verification. Null for L1. */
  issued_at: string | null;
  /** Type of identity issuer */
  issuer_type: 'self' | 'kyc_provider' | 'notary' | 'other';
  /** Identifier of the issuer (DID, KvK number, internal ID). Null for L1. */
  issuer_id: string | null;
}

export interface OriginCertificate {
  /** Schema version — "1.0" legacy, "1.1" device-signed, "1.2" attestation, "1.3" AES-ready */
  version: '1.0' | '1.1' | '1.2' | '1.3';

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

  /** Public key of the passkey credential (optional) */
  claimed_by: string | null;

  /** Cryptographic signature of the hash (optional) */
  signature: string | null;

  /** WebAuthn signature over the SHA-256 hash (v1.1+) */
  device_signature: string | null;

  /** SPKI public key of the device passkey (v1.1+) */
  device_public_key: string | null;

  /** Whether an attestation.json file is included in this ZIP (v1.2+) */
  attestation_included?: boolean;

  /** Explicit signing algorithm identifier (v1.3+) */
  sig_algorithm?: string | null;

  /** Identity assurance binding (v1.3+) */
  identity_binding?: IdentityBinding;

  /** Revocation status (v1.3+) — set when association is released */
  revocation?: {
    /** Whether the association has been revoked */
    revoked: boolean;
    /** ISO 8601 timestamp of revocation */
    revoked_at: string;
    /** Reason category */
    reason: 'association_released' | 'key_compromised' | 'other';
  } | null;

  /** Certificate metadata (v1.3+) */
  meta?: {
    /** Specification version reference */
    spec_version: string;
    /** Implementation identifier */
    implementation: string;
  };
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
 * @param deviceSignature - Optional WebAuthn signature over the hash
 * @param devicePublicKey - Optional SPKI public key of signing device
 */
export function createCertificate(
  originId: string,
  hash: string,
  capturedAt: Date,
  claimedBy: string | null = null,
  signature: string | null = null,
  proofIncluded: boolean = false,
  proofStatus: 'pending' | 'anchored' = 'pending',
  deviceSignature: string | null = null,
  devicePublicKey: string | null = null,
  attestationIncluded: boolean = false,
  revocation: { revoked_at: string; reason: 'association_released' | 'key_compromised' | 'other' } | null = null,
): OriginCertificate {
  // Strip prefix if present (um- → raw hex)
  const cleanId = originId.toUpperCase().replace(/^UM-/i, '');

  const hasDeviceBinding = !!(deviceSignature || devicePublicKey);

  // Version: 1.3 always (new certificates include sig_algorithm + identity_binding)
  const version = '1.3';

  // Determine sig_algorithm from device binding presence
  const sigAlgorithm = hasDeviceBinding ? 'WebAuthn_ECDSA_P256_SHA256' : null;

  // Default identity binding: L1 (passkey-only, no external verification)
  const identityBinding: IdentityBinding = {
    level: 'L1',
    reference_hash_sha256: null,
    issued_at: null,
    issuer_type: 'self',
    issuer_id: null,
  };

  return {
    version,
    origin_id: cleanId,
    hash,
    hash_algo: 'SHA-256',
    captured_at: capturedAt.toISOString(),
    verify_url: 'https://verify-anchoring.org',
    proof_included: proofIncluded,
    proof_status: proofStatus,
    claimed_by: claimedBy,
    signature,
    device_signature: deviceSignature,
    device_public_key: devicePublicKey,
    attestation_included: attestationIncluded || undefined,
    sig_algorithm: sigAlgorithm,
    identity_binding: identityBinding,
    revocation: revocation ? { revoked: true, ...revocation } : null,
    meta: {
      spec_version: 'anchoring-spec.org/v1.3',
      implementation: 'umarise-anchor/1.3.0',
    },
  };
}

/**
 * Serialize a certificate to a JSON string for inclusion in the ZIP.
 * Pretty-printed for human readability.
 */
export function serializeCertificate(cert: OriginCertificate): string {
  return JSON.stringify(cert, null, 2);
}
