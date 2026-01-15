/**
 * Origin Hash Unit Tests (Browser-Compatible)
 * 
 * SPECIFICATION: v1.0 (FROZEN)
 * See: docs/origin-hash-partner-spec.md
 * 
 * Tests the core invariant: byte-identity is provable.
 * A single modified byte MUST result in verification failure.
 * 
 * Run in browser console or import to test.
 */

import { calculateSHA256, decodeDataUrl, hashAndDecodeDataUrl } from '../originHash';

// Minimal valid 1x1 transparent PNG as base64
const VALID_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const VALID_PNG_DATA_URL = `data:image/png;base64,${VALID_PNG_BASE64}`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Run all origin hash tests
 * Returns array of test results
 */
export async function runOriginHashTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Consistent hash for identical bytes
  try {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const hash1 = await calculateSHA256(bytes);
    const hash2 = await calculateSHA256(bytes);
    
    if (hash1 !== hash2) throw new Error('Hashes differ for identical bytes');
    if (hash1.length !== 64) throw new Error('Hash should be 64 chars');
    
    results.push({ name: 'Consistent hash for identical bytes', passed: true });
  } catch (e) {
    results.push({ name: 'Consistent hash for identical bytes', passed: false, error: String(e) });
  }

  // Test 2: CRITICAL - Single byte modification MUST produce different hash
  try {
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const modified = new Uint8Array([1, 2, 3, 4, 6]); // Last byte: 5 → 6
    
    const originalHash = await calculateSHA256(original);
    const modifiedHash = await calculateSHA256(modified);
    
    if (originalHash === modifiedHash) {
      throw new Error('CRITICAL FAILURE: Modified bytes produced same hash!');
    }
    
    results.push({ name: 'CRITICAL: Modified byte produces different hash', passed: true });
  } catch (e) {
    results.push({ name: 'CRITICAL: Modified byte produces different hash', passed: false, error: String(e) });
  }

  // Test 3: Handles Uint8Array with byteOffset
  try {
    const fullBuffer = new ArrayBuffer(10);
    const fullView = new Uint8Array(fullBuffer);
    fullView.set([0, 0, 0, 1, 2, 3, 4, 5, 0, 0]);
    
    const offsetView = new Uint8Array(fullBuffer, 3, 5);
    const directBytes = new Uint8Array([1, 2, 3, 4, 5]);
    
    const offsetHash = await calculateSHA256(offsetView);
    const directHash = await calculateSHA256(directBytes);
    
    if (offsetHash !== directHash) {
      throw new Error('ByteOffset handling incorrect');
    }
    
    results.push({ name: 'Handles Uint8Array with byteOffset', passed: true });
  } catch (e) {
    results.push({ name: 'Handles Uint8Array with byteOffset', passed: false, error: String(e) });
  }

  // Test 4: Decodes data URL correctly
  try {
    const { bytes, mimeType } = decodeDataUrl(VALID_PNG_DATA_URL);
    
    if (mimeType !== 'image/png') throw new Error('Wrong MIME type');
    if (bytes.length === 0) throw new Error('Empty bytes');
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50) throw new Error('Invalid PNG header');
    
    results.push({ name: 'Decodes data URL correctly', passed: true });
  } catch (e) {
    results.push({ name: 'Decodes data URL correctly', passed: false, error: String(e) });
  }

  // Test 5: hashAndDecodeDataUrl consistency
  try {
    const result1 = await hashAndDecodeDataUrl(VALID_PNG_DATA_URL);
    const result2 = await hashAndDecodeDataUrl(VALID_PNG_DATA_URL);
    
    if (result1.hash !== result2.hash) throw new Error('Hashes differ');
    if (result1.mimeType !== 'image/png') throw new Error('Wrong MIME');
    
    results.push({ name: 'hashAndDecodeDataUrl is consistent', passed: true });
  } catch (e) {
    results.push({ name: 'hashAndDecodeDataUrl is consistent', passed: false, error: String(e) });
  }

  // Test 6: 64-char lowercase hex output
  try {
    const hash = await calculateSHA256(new Uint8Array([42]));
    
    if (hash.length !== 64) throw new Error('Not 64 chars');
    if (!/^[0-9a-f]{64}$/.test(hash)) throw new Error('Not lowercase hex');
    
    results.push({ name: 'Produces 64-char lowercase hex', passed: true });
  } catch (e) {
    results.push({ name: 'Produces 64-char lowercase hex', passed: false, error: String(e) });
  }

  // Test 7: Empty input produces known hash
  try {
    const hash = await calculateSHA256(new Uint8Array([]));
    const knownEmptyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    
    if (hash !== knownEmptyHash) throw new Error('Empty hash mismatch');
    
    results.push({ name: 'Empty input produces known hash', passed: true });
  } catch (e) {
    results.push({ name: 'Empty input produces known hash', passed: false, error: String(e) });
  }

  // Test 8: Invalid data URL throws
  try {
    let threw = false;
    try {
      decodeDataUrl('not-a-data-url');
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('Should throw on invalid URL');
    
    results.push({ name: 'Throws on invalid data URL', passed: true });
  } catch (e) {
    results.push({ name: 'Throws on invalid data URL', passed: false, error: String(e) });
  }

  return results;
}

/**
 * Log test results to console with formatting
 */
export async function runAndLogTests(): Promise<void> {
  console.log('🔐 Origin Hash Tests (v1.0 Frozen Spec)');
  console.log('━'.repeat(50));
  
  const results = await runOriginHashTests();
  
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   Error: ${result.error}`);
      failed++;
    }
  }
  
  console.log('━'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.error('⚠️ TESTS FAILED - Origin Hash primitive may be compromised');
  } else {
    console.log('✅ All tests passed - Byte identity is provable');
  }
}
