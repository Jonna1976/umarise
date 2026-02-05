/**
 * Device Fingerprint Generation for Umarise v4
 * 
 * Generates a SHA-256 hash of device characteristics.
 * Used for forensic linking, NOT for authentication.
 * 
 * PRIVACY: Only the hash is stored, never the raw fingerprint data.
 * The fingerprint helps identify marks created from the same device
 * without revealing device details.
 */

import { computeSHA256 } from './originHash';

export interface DeviceFingerprintData {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  colorDepth: number;
  hardwareConcurrency: number;
  platform: string;
}

/**
 * Collect device characteristics
 */
export function collectDeviceData(): DeviceFingerprintData {
  return {
    userAgent: navigator.userAgent || '',
    screenWidth: screen.width || 0,
    screenHeight: screen.height || 0,
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    colorDepth: screen.colorDepth || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    platform: navigator.platform || '',
  };
}

/**
 * Generate a device fingerprint hash
 * 
 * @returns SHA-256 hash of concatenated device characteristics
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const data = collectDeviceData();
  
  // Concatenate all values into a single string
  const fingerprintString = [
    data.userAgent,
    data.screenWidth.toString(),
    data.screenHeight.toString(),
    data.language,
    data.timezone,
    data.colorDepth.toString(),
    data.hardwareConcurrency.toString(),
    data.platform,
  ].join('|');
  
  // Convert to bytes and hash
  const encoder = new TextEncoder();
  const bytes = encoder.encode(fingerprintString);
  
  return computeSHA256(bytes);
}

// ============= Storage =============

const FINGERPRINT_KEY = 'umarise_device_fingerprint_hash';

/**
 * Get or generate device fingerprint hash
 * Caches the result in localStorage for consistency
 */
export async function getDeviceFingerprintHash(): Promise<string> {
  try {
    // Check cache first
    const cached = localStorage.getItem(FINGERPRINT_KEY);
    if (cached && cached.length === 64) {
      return cached;
    }
    
    // Generate new fingerprint
    const hash = await generateDeviceFingerprint();
    localStorage.setItem(FINGERPRINT_KEY, hash);
    
    console.log('[Fingerprint] Generated:', hash.substring(0, 16) + '...');
    return hash;
  } catch (e) {
    console.warn('[Fingerprint] Generation failed:', e);
    // Return a placeholder hash if fingerprinting fails
    return '0'.repeat(64);
  }
}

/**
 * Clear cached fingerprint (for testing)
 */
export function clearFingerprintCache(): void {
  localStorage.removeItem(FINGERPRINT_KEY);
}
