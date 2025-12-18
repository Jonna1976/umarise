/**
 * Umarise Private Vault - Client-Side Encryption (OPT-IN)
 * 
 * AES-256-GCM encryption for images before upload.
 * Keys stay on device - zero-knowledge architecture.
 * 
 * ⚠️ WARNING: This is OPT-IN. If enabled and user loses their key, 
 * their encrypted data is PERMANENTLY UNRECOVERABLE.
 * 
 * Default: DISABLED (images stored normally on Supabase)
 * Enabled: Only when user explicitly activates Private Vault
 */

const VAULT_KEY_STORAGE = 'umarise_vault_key';
const VAULT_ENABLED_STORAGE = 'umarise_vault_enabled';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// ============= Vault Mode Control =============

/**
 * Check if Private Vault mode is enabled
 */
export function isPrivateVaultEnabled(): boolean {
  return localStorage.getItem(VAULT_ENABLED_STORAGE) === 'true';
}

/**
 * Enable Private Vault mode (requires explicit user consent)
 * Returns the vault key for backup purposes
 */
export async function enablePrivateVault(): Promise<string> {
  const key = await getVaultKey();
  const exportedKey = await exportKeyForBackup(key);
  localStorage.setItem(VAULT_ENABLED_STORAGE, 'true');
  console.log('[Vault] Private Vault mode ENABLED');
  return exportedKey;
}

/**
 * Disable Private Vault mode
 * Note: Existing encrypted images will still need the key to decrypt
 */
export function disablePrivateVault(): void {
  localStorage.setItem(VAULT_ENABLED_STORAGE, 'false');
  console.log('[Vault] Private Vault mode DISABLED');
}

// ============= Key Management =============

/**
 * Generate a new AES-256 encryption key
 */
async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable - needed for export/backup
    ['encrypt', 'decrypt']
  );
}

/**
 * Export key for backup (user-facing)
 */
async function exportKeyForBackup(key: CryptoKey): Promise<string> {
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(rawKey);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Export key to base64 for storage
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(rawKey);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Import key from base64 storage
 */
async function importKey(base64Key: string): Promise<CryptoKey> {
  const bytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    bytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create the vault encryption key
 */
export async function getVaultKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(VAULT_KEY_STORAGE);
  
  if (stored) {
    try {
      return await importKey(stored);
    } catch (e) {
      console.error('Failed to import vault key, generating new one:', e);
    }
  }
  
  // Generate new key
  const key = await generateKey();
  const exported = await exportKey(key);
  localStorage.setItem(VAULT_KEY_STORAGE, exported);
  
  console.log('[Vault] New encryption key generated and stored');
  return key;
}

/**
 * Check if vault key exists
 */
export function hasVaultKey(): boolean {
  return !!localStorage.getItem(VAULT_KEY_STORAGE);
}

/**
 * Export vault key for backup (user should save this securely)
 */
export function exportVaultKeyForBackup(): string | null {
  return localStorage.getItem(VAULT_KEY_STORAGE);
}

/**
 * Import vault key from backup
 */
export async function importVaultKeyFromBackup(base64Key: string): Promise<boolean> {
  try {
    // Validate the key by trying to import it
    await importKey(base64Key);
    localStorage.setItem(VAULT_KEY_STORAGE, base64Key);
    console.log('[Vault] Key restored from backup');
    return true;
  } catch (e) {
    console.error('Invalid vault key:', e);
    return false;
  }
}

// ============= Encryption/Decryption =============

/**
 * Encrypt data with AES-256-GCM
 * Returns: base64 encoded (IV + ciphertext)
 */
export async function encryptData(data: ArrayBuffer): Promise<string> {
  const key = await getVaultKey();
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  
  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data with AES-256-GCM
 * Input: base64 encoded (IV + ciphertext)
 */
export async function decryptData(encryptedBase64: string): Promise<ArrayBuffer> {
  const key = await getVaultKey();
  
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  // Decrypt
  return crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );
}

// ============= Image-Specific Helpers =============

/**
 * Encrypt an image from data URL
 * Returns encrypted base64 string
 */
export async function encryptImage(imageDataUrl: string): Promise<string> {
  // Convert data URL to ArrayBuffer
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  
  // Encrypt
  return encryptData(arrayBuffer);
}

/**
 * Decrypt an image to data URL
 */
export async function decryptImage(encryptedBase64: string, mimeType = 'image/jpeg'): Promise<string> {
  const decrypted = await decryptData(encryptedBase64);
  const blob = new Blob([decrypted], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Check if a URL is an encrypted vault image
 * Encrypted images are stored with a special prefix
 */
export function isEncryptedImage(url: string): boolean {
  return url.startsWith('encrypted:') || url.includes('/encrypted/');
}

/**
 * Get encryption status for display
 */
export function getVaultStatus(): {
  hasKey: boolean;
  keyCreatedAt: string | null;
} {
  const hasKey = hasVaultKey();
  // We could store creation date, but for now just check existence
  return {
    hasKey,
    keyCreatedAt: hasKey ? 'Stored on this device' : null,
  };
}
