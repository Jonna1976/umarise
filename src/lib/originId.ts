/**
 * Origin ID Generation for Umarise v4
 * 
 * Generates unique 8-character hex identifiers for marks.
 * Format: um-XXXXXXXX (e.g., um-a7f3b2c1)
 * 
 * Uses crypto.getRandomValues() for cryptographic randomness.
 * Collision handling: retry up to 3 times if collision detected.
 */

const ORIGIN_ID_PREFIX = 'um-';
const ORIGIN_ID_LENGTH = 8; // 8 hex characters = 32 bits = ~4 billion unique IDs

/**
 * Generate random hex characters using crypto.getRandomValues()
 */
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  
  // Convert to hex string
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hex.substring(0, length).toLowerCase();
}

/**
 * Generate a new Origin ID
 * 
 * @returns Origin ID in format um-XXXXXXXX
 */
export function generateOriginId(): string {
  const hex = generateRandomHex(ORIGIN_ID_LENGTH);
  return `${ORIGIN_ID_PREFIX}${hex}`;
}

/**
 * Generate an Origin ID with collision checking
 * 
 * @param existingIds - Set of existing IDs to check against
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Unique Origin ID
 * @throws Error if max retries exceeded
 */
export function generateUniqueOriginId(
  existingIds: Set<string>,
  maxRetries = 3
): string {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const id = generateOriginId();
    
    if (!existingIds.has(id)) {
      return id;
    }
    
    console.warn(`[OriginID] Collision detected on attempt ${attempt + 1}, retrying...`);
  }
  
  throw new Error(`Failed to generate unique Origin ID after ${maxRetries} attempts`);
}

/**
 * Validate an Origin ID format
 */
export function isValidOriginId(id: string): boolean {
  const pattern = /^um-[a-f0-9]{8}$/;
  return pattern.test(id);
}

/**
 * Extract Origin ID from a page UUID (legacy fallback)
 * Uses first 8 characters of UUID
 */
export function deriveOriginIdFromUuid(uuid: string): string {
  const cleaned = uuid.replace(/-/g, '').substring(0, ORIGIN_ID_LENGTH);
  return `${ORIGIN_ID_PREFIX}${cleaned.toLowerCase()}`;
}

/**
 * Format Origin ID for display (uppercase)
 */
export function formatOriginIdForDisplay(originId: string): string {
  return originId.toUpperCase().replace('UM-', 'ORIGIN ');
}
