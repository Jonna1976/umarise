import { describe, it, expect, vi } from 'vitest';
import { buildOriginZip } from '@/lib/originZip';
import JSZip from 'jszip';

describe('buildOriginZip', () => {
  it('generates a ZIP with certificate.json when no image is provided', async () => {
    const zipBlob = await buildOriginZip({
      originId: 'um-1916F13F',
      hash: 'a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8',
      timestamp: new Date('2026-02-07T20:00:00Z'),
      imageUrl: null,
    });

    expect(zipBlob).toBeInstanceOf(Blob);
    expect(zipBlob.size).toBeGreaterThan(0);

    // Unpack and verify contents
    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);

    expect(files).toContain('certificate.json');
    expect(files).not.toContain('photo.jpg');

    // Verify certificate.json content
    const certContent = await zip.file('certificate.json')!.async('string');
    const cert = JSON.parse(certContent);

    expect(cert.version).toBe('1.0');
    expect(cert.origin_id).toBe('1916F13F');
    expect(cert.hash).toBe('a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8');
    expect(cert.hash_algo).toBe('SHA-256');
    expect(cert.captured_at).toBe('2026-02-07T20:00:00.000Z');
    expect(cert.verify_url).toBe('https://verify.umarise.com');
    expect(cert.claimed_by).toBeNull();
    expect(cert.signature).toBeNull();
  });

  // NOTE: Image-in-ZIP test requires real browser environment (blob URL + fetch).
  // jsdom's fetch doesn't return proper Blobs for data URLs.
  // Verified manually in browser: photo.jpg is correctly included in ZIP.
  it.skip('includes photo in ZIP when imageUrl is provided (requires browser)', async () => {
    // This test passes in a real browser but jsdom lacks proper Blob support for fetch
  });

  it('includes proof.ots when OTS proof is provided', async () => {
    // Create a small fake OTS proof (just some bytes, base64-encoded)
    const fakeOtsBytes = new Uint8Array([0x00, 0x4f, 0x54, 0x53, 0x01, 0x02, 0x03]);
    let binary = '';
    for (let i = 0; i < fakeOtsBytes.length; i++) {
      binary += String.fromCharCode(fakeOtsBytes[i]);
    }
    const fakeOtsBase64 = btoa(binary);

    const zipBlob = await buildOriginZip({
      originId: 'um-AABB1122',
      hash: 'deadbeef'.repeat(8),
      timestamp: new Date('2026-02-07T12:00:00Z'),
      imageUrl: null,
      otsProof: fakeOtsBase64,
    });

    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);

    expect(files).toContain('certificate.json');
    expect(files).toContain('proof.ots');

    // Verify proof.ots content matches original bytes
    const otsContent = await zip.file('proof.ots')!.async('uint8array');
    expect(otsContent).toEqual(fakeOtsBytes);
  });

  it('omits proof.ots when not provided', async () => {
    const zipBlob = await buildOriginZip({
      originId: 'um-CCDD0011',
      hash: 'abcd1234'.repeat(8),
      timestamp: new Date('2026-02-07T12:00:00Z'),
      imageUrl: null,
      otsProof: null,
    });

    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);

    expect(files).toContain('certificate.json');
    expect(files).not.toContain('proof.ots');
  });

  it('includes passkey fields when provided', async () => {
    const zipBlob = await buildOriginZip({
      originId: 'um-11223344',
      hash: 'cafebabe'.repeat(8),
      timestamp: new Date('2026-02-01T12:00:00Z'),
      imageUrl: null,
      claimedBy: 'test-public-key-base64',
      signature: 'test-signature-base64',
    });

    const zip = await JSZip.loadAsync(zipBlob);
    const certContent = await zip.file('certificate.json')!.async('string');
    const cert = JSON.parse(certContent);

    expect(cert.claimed_by).toBe('test-public-key-base64');
    expect(cert.signature).toBe('test-signature-base64');
  });

  it('strips various origin ID prefixes correctly', async () => {
    const cases = [
      { input: 'ORIGIN 1916F13F', expected: '1916F13F' },
      { input: 'um-AABBCCDD', expected: 'AABBCCDD' },
      { input: 'UM-eeff0011', expected: 'EEFF0011' },
      { input: '99887766', expected: '99887766' },
    ];

    for (const { input, expected } of cases) {
      const zipBlob = await buildOriginZip({
        originId: input,
        hash: '0'.repeat(64),
        timestamp: new Date(),
        imageUrl: null,
      });

      const zip = await JSZip.loadAsync(zipBlob);
      const certContent = await zip.file('certificate.json')!.async('string');
      const cert = JSON.parse(certContent);
      expect(cert.origin_id).toBe(expected);
    }
  });
});
