/**
 * Passkey Credential Store
 * 
 * Persists the WebAuthn credential ID and public key in localStorage
 * so that the capture flow can automatically sign hashes without
 * requiring the user to re-register their passkey each session.
 * 
 * The private key never leaves the device's secure enclave.
 * Only the credential ID (for lookup) and public key (for verification)
 * are stored here.
 */

import type { PasskeyCredential } from '@/lib/webauthn';

const CREDENTIAL_STORAGE_KEY = 'umarise_passkey_credential';

/**
 * Save a passkey credential to localStorage for persistent access.
 */
export function savePasskeyCredential(credential: PasskeyCredential): void {
  try {
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credential));
    console.log('[PasskeyStore] Credential saved:', credential.credentialId.substring(0, 12) + '…');
  } catch (e) {
    console.warn('[PasskeyStore] Failed to save credential:', e);
  }
}

/**
 * Retrieve the stored passkey credential, or null if none exists.
 */
export function getPasskeyCredential(): PasskeyCredential | null {
  try {
    const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PasskeyCredential;
  } catch (e) {
    console.warn('[PasskeyStore] Failed to read credential:', e);
    return null;
  }
}

/**
 * Check if a passkey credential is stored.
 */
export function hasPasskeyCredential(): boolean {
  return !!localStorage.getItem(CREDENTIAL_STORAGE_KEY);
}

/**
 * Remove the stored passkey credential.
 */
export function clearPasskeyCredential(): void {
  localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
  console.log('[PasskeyStore] Credential cleared');
}
