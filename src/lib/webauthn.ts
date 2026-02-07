/**
 * WebAuthn / Passkey Utilities
 * 
 * Provides registration (create credential) and signing (get assertion)
 * for the Umarise origin-linking flow.
 * 
 * Flow:
 * 1. User taps "+ link passkey" → registerPasskey() creates a new credential
 * 2. The credentialId + publicKey are stored in memory
 * 3. signHash() signs the origin hash with the passkey → produces a signature
 * 4. publicKey + signature are included in certificate.json inside the ZIP
 * 
 * ─── MIGRATION RISK: RP ID ───────────────────────────────────────────────
 * 
 * rp.id is set to window.location.hostname (e.g. "lovable.app" during dev).
 * WebAuthn credentials are bound to their RP ID — if the domain changes
 * (e.g. from lovable.app → umarise.com), ALL existing passkeys become
 * permanently unusable. There is no WebAuthn mechanism to migrate credentials
 * across RP IDs.
 * 
 * Mitigation options when migrating to umarise.com:
 * 1. Set rp.id to "umarise.com" from day one (requires hosting on that domain)
 * 2. Accept that dev-era passkeys are throwaway; prompt re-registration on prod
 * 3. Use the Related Origins File spec (draft, not yet widely supported)
 * 
 * For now (prototype on lovable.app), option 2 applies: passkeys created here
 * are valid only on this domain and will need re-creation on the final domain.
 * 
 * ─── ATTESTATION MODEL ──────────────────────────────────────────────────
 * 
 * attestation: 'none' is deliberate. We don't verify which device created
 * the passkey (no server-side attestation verification). This means:
 * ✓ The private key is in a secure enclave (guaranteed by WebAuthn spec)
 * ✓ The signature is cryptographically valid (verifiable with the public key)
 * ✗ We cannot prove WHICH specific device/enclave holds the key
 * 
 * This is acceptable for Umarise's model: the passkey proves "someone with
 * biometric access to this device signed this hash" — identity-linking is
 * optional and device-forensic proof is handled by Layer 3 (device fingerprint).
 */

export interface PasskeyCredential {
  credentialId: string;       // base64url-encoded credential ID
  publicKey: string;          // base64url-encoded SPKI public key
  publicKeyAlgorithm: number; // COSE algorithm identifier (-7 = ES256, -257 = RS256)
}

export interface PasskeySignature {
  signature: string;          // base64url-encoded signature
  authenticatorData: string;  // base64url-encoded authenticator data
  clientDataJSON: string;     // base64url-encoded client data JSON
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Extract the public key in SPKI format from a credential response.
 * Uses getPublicKey() which returns the SubjectPublicKeyInfo (SPKI) DER bytes.
 */
function extractPublicKey(response: AuthenticatorAttestationResponse): string | null {
  if (typeof response.getPublicKey === 'function') {
    const spkiKey = response.getPublicKey();
    if (spkiKey) {
      return arrayBufferToBase64Url(spkiKey);
    }
  }
  return null;
}

/**
 * Extract the COSE algorithm identifier from the credential response.
 */
function extractAlgorithm(response: AuthenticatorAttestationResponse): number {
  if (typeof response.getPublicKeyAlgorithm === 'function') {
    return response.getPublicKeyAlgorithm();
  }
  // Default to ES256 (most common for platform authenticators)
  return -7;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Check if WebAuthn is supported in this browser.
 */
export function isWebAuthnSupported(): boolean {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function' &&
    navigator.credentials?.create &&
    navigator.credentials?.get
  );
}

/**
 * Check if a platform authenticator (Face ID, fingerprint, Windows Hello) is available.
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Register a new passkey credential (Face ID / fingerprint / Windows Hello).
 * 
 * This creates a new key pair on the device. The private key never leaves
 * the secure enclave; only the public key is returned.
 * 
 * @param originId - The origin ID to use as user identifier context
 * @returns PasskeyCredential with credentialId and publicKey
 * @throws Error if registration fails or is cancelled
 */
export async function registerPasskey(originId: string): Promise<PasskeyCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  // Generate a random user ID (not linked to any account — per Umarise's
  // identity-agnostic posture, this is a device-local credential)
  const userId = crypto.getRandomValues(new Uint8Array(32));

  const cleanId = originId.toUpperCase().replace(/^(ORIGIN\s+|UM-)/i, '').trim();

  const createOptions: PublicKeyCredentialCreationOptions = {
    // Relying Party — the domain that owns this credential
    rp: {
      name: 'Umarise',
      id: window.location.hostname,
    },

    // User entity — displayed in the OS passkey prompt
    user: {
      id: userId,
      name: `Origin ${cleanId}`,
      displayName: `Origin ${cleanId}`,
    },

    // Challenge — random bytes (we don't verify attestation server-side,
    // so this is purely for protocol compliance)
    challenge: crypto.getRandomValues(new Uint8Array(32)),

    // Preferred algorithms: ES256 (most widely supported on mobile)
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' },  // RS256 (fallback)
    ],

    // Prefer platform authenticator (Face ID, Touch ID, Windows Hello)
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },

    // 60 second timeout
    timeout: 60000,

    // Direct attestation — we want the raw public key
    attestation: 'none',
  };

  const credential = await navigator.credentials.create({
    publicKey: createOptions,
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Credential creation returned null');
  }

  const response = credential.response as AuthenticatorAttestationResponse;
  const publicKey = extractPublicKey(response);

  if (!publicKey) {
    throw new Error('Could not extract public key from credential');
  }

  const algorithm = extractAlgorithm(response);

  return {
    credentialId: arrayBufferToBase64Url(credential.rawId),
    publicKey,
    publicKeyAlgorithm: algorithm,
  };
}

/**
 * Sign a hash using an existing passkey credential.
 * 
 * The hash is passed as the WebAuthn challenge, so the authenticator
 * signs it directly. The resulting signature can be verified using
 * the public key from registerPasskey().
 * 
 * @param credentialId - The credential ID from registerPasskey()
 * @param hash - The SHA-256 hash to sign (hex string)
 * @returns PasskeySignature with the cryptographic signature
 * @throws Error if signing fails or is cancelled
 */
export async function signHash(
  credentialId: string,
  hash: string,
): Promise<PasskeySignature> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  // Convert the hex hash to bytes for use as the challenge
  const hashBytes = new Uint8Array(
    hash.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge: hashBytes,

    // Specify which credential to use
    allowCredentials: [{
      id: base64UrlToArrayBuffer(credentialId),
      type: 'public-key',
      transports: ['internal'], // Platform authenticator
    }],

    userVerification: 'required',
    timeout: 60000,
  };

  const assertion = await navigator.credentials.get({
    publicKey: getOptions,
  }) as PublicKeyCredential;

  if (!assertion) {
    throw new Error('Assertion returned null');
  }

  const response = assertion.response as AuthenticatorAssertionResponse;

  return {
    signature: arrayBufferToBase64Url(response.signature),
    authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
    clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
  };
}
