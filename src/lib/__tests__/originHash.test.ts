/**
 * Origin Hash Unit Tests (Vitest)
 * 
 * SPECIFICATION: v1.0 (FROZEN)
 * See: docs/origin-hash-partner-spec.md
 * 
 * Tests the core invariant: byte-identity is provable.
 * A single modified byte MUST result in verification failure.
 */

import { describe, it, expect } from 'vitest';
import { calculateSHA256, decodeDataUrl, hashAndDecodeDataUrl } from '../originHash';

// Minimal valid 1x1 transparent PNG as base64
const VALID_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const VALID_PNG_DATA_URL = `data:image/png;base64,${VALID_PNG_BASE64}`;

describe('Origin Hash - Core Primitives', () => {
  describe('calculateSHA256', () => {
    it('produces consistent hash for identical bytes', async () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);
      const hash1 = await calculateSHA256(bytes);
      const hash2 = await calculateSHA256(bytes);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('CRITICAL: single byte modification produces different hash', async () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]);
      const modified = new Uint8Array([1, 2, 3, 4, 6]); // Last byte: 5 → 6
      
      const originalHash = await calculateSHA256(original);
      const modifiedHash = await calculateSHA256(modified);
      
      expect(originalHash).not.toBe(modifiedHash);
    });

    it('handles Uint8Array with byteOffset correctly', async () => {
      const fullBuffer = new ArrayBuffer(10);
      const fullView = new Uint8Array(fullBuffer);
      fullView.set([0, 0, 0, 1, 2, 3, 4, 5, 0, 0]);
      
      const offsetView = new Uint8Array(fullBuffer, 3, 5);
      const directBytes = new Uint8Array([1, 2, 3, 4, 5]);
      
      const offsetHash = await calculateSHA256(offsetView);
      const directHash = await calculateSHA256(directBytes);
      
      expect(offsetHash).toBe(directHash);
    });

    it('produces 64-char lowercase hex output', async () => {
      const hash = await calculateSHA256(new Uint8Array([42]));
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('empty input produces known SHA-256 hash', async () => {
      const hash = await calculateSHA256(new Uint8Array([]));
      const knownEmptyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      
      expect(hash).toBe(knownEmptyHash);
    });
  });

  describe('decodeDataUrl', () => {
    it('correctly decodes valid PNG data URL', () => {
      const { bytes, mimeType } = decodeDataUrl(VALID_PNG_DATA_URL);
      
      expect(mimeType).toBe('image/png');
      expect(bytes.length).toBeGreaterThan(0);
      // PNG magic bytes: 0x89 0x50 0x4E 0x47
      expect(bytes[0]).toBe(0x89);
      expect(bytes[1]).toBe(0x50);
      expect(bytes[2]).toBe(0x4E);
      expect(bytes[3]).toBe(0x47);
    });

    it('throws on invalid data URL format', () => {
      expect(() => decodeDataUrl('not-a-data-url')).toThrow('Invalid data URL format');
      expect(() => decodeDataUrl('data:image/png')).toThrow('Invalid data URL format');
      expect(() => decodeDataUrl('https://example.com/image.png')).toThrow('Invalid data URL format');
    });

    it('correctly extracts MIME type', () => {
      const jpegUrl = 'data:image/jpeg;base64,/9j/4AAQ';
      const { mimeType } = decodeDataUrl(jpegUrl);
      expect(mimeType).toBe('image/jpeg');
    });
  });

  describe('hashAndDecodeDataUrl', () => {
    it('returns consistent hash for same data URL', async () => {
      const result1 = await hashAndDecodeDataUrl(VALID_PNG_DATA_URL);
      const result2 = await hashAndDecodeDataUrl(VALID_PNG_DATA_URL);
      
      expect(result1.hash).toBe(result2.hash);
      expect(result1.mimeType).toBe('image/png');
      expect(result1.bytes.length).toBe(result2.bytes.length);
    });

    it('hash matches direct byte hash', async () => {
      const { hash, bytes } = await hashAndDecodeDataUrl(VALID_PNG_DATA_URL);
      const directHash = await calculateSHA256(bytes);
      
      expect(hash).toBe(directHash);
    });
  });
});

describe('Origin Hash - Verification Chain', () => {
  it('INVARIANT: hash(bytes) at capture === hash(bytes) at verify', async () => {
    // Simulate capture flow
    const capturedDataUrl = VALID_PNG_DATA_URL;
    const { hash: captureHash, bytes: capturedBytes } = await hashAndDecodeDataUrl(capturedDataUrl);
    
    // Simulate storage (bytes unchanged)
    const storedBytes = new Uint8Array(capturedBytes);
    
    // Simulate verification (re-hash stored bytes)
    const verifyHash = await calculateSHA256(storedBytes);
    
    expect(captureHash).toBe(verifyHash);
  });

  it('INVARIANT: any modification breaks verification', async () => {
    const { hash: originalHash, bytes } = await hashAndDecodeDataUrl(VALID_PNG_DATA_URL);
    
    // Tamper with one byte
    const tamperedBytes = new Uint8Array(bytes);
    tamperedBytes[10] = (tamperedBytes[10] + 1) % 256;
    
    const tamperedHash = await calculateSHA256(tamperedBytes);
    
    expect(originalHash).not.toBe(tamperedHash);
  });
});
