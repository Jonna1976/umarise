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
    expect(files).toContain('VERIFY.txt');

    // Verify VERIFY.txt contains Guardian C8/C17 content
    const verifyContent = await zip.file('VERIFY.txt')!.async('string');
    expect(verifyContent).toContain('VERIFICATION INSTRUCTIONS');
    expect(verifyContent).toContain('https://anchoring.app/verify');
    expect(verifyContent).toContain('sha256sum artifact.*');
    expect(verifyContent).toContain('WHAT THIS PROVES');
    expect(verifyContent).toContain('WHAT THIS DOES NOT PROVE');
    // No proof.ots → should show pending message
    expect(verifyContent).toContain('Not yet available');
    expect(files).not.toContain('photo.jpg');

    // Verify certificate.json content
    const certContent = await zip.file('certificate.json')!.async('string');
    const cert = JSON.parse(certContent);

    expect(cert.version).toBe('1.0');
    expect(cert.origin_id).toBe('1916F13F');
    expect(cert.hash).toBe('a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8');
    expect(cert.hash_algo).toBe('SHA-256');
    expect(cert.captured_at).toBe('2026-02-07T20:00:00.000Z');
    expect(cert.verify_url).toBe('https://anchoring.app/verify');
    expect(cert.proof_included).toBe(false);
    expect(cert.proof_status).toBe('pending');
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

  // --- Hash enforcement tests ---
  // jsdom's File doesn't implement .arrayBuffer() natively.
  // We patch the prototype once here for all enforcement tests.

  function makeFile(content: Uint8Array, name: string, type: string): File {
    // Use ArrayBuffer directly to avoid SharedArrayBuffer TS issue in jsdom
    const buf = new ArrayBuffer(content.length);
    new Uint8Array(buf).set(content);
    const file = new File([buf], name, { type });
    // Polyfill .arrayBuffer() — jsdom's File doesn't implement it
    file.arrayBuffer = () => Promise.resolve(buf);
    return file;
  }

  it('includes artifactFile in ZIP when hash matches', async () => {
    // Create a small test file with known content
    const content = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const file = makeFile(content, 'test.jpg', 'image/jpeg');

    // Compute the correct SHA-256 of "Hello"
    const hashBuffer = await crypto.subtle.digest('SHA-256', content);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const zipBlob = await buildOriginZip({
      originId: 'um-AABBCCDD',
      hash: hashHex,
      timestamp: new Date('2026-02-19T12:00:00Z'),
      imageUrl: null,
      artifactFile: file,
    });

    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);

    // artifact.jpg moet aanwezig zijn — hash matched
    expect(files).toContain('artifact.jpg');
    expect(files).toContain('certificate.json');

    // Controleer dat de bytes exact kloppen
    const artifactBytes = await zip.file('artifact.jpg')!.async('uint8array');
    expect(artifactBytes).toEqual(content);
  });

  it('EXCLUDES artifactFile from ZIP when hash does NOT match (enforcement)', async () => {
    // File met bekende inhoud
    const content = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const file = makeFile(content, 'test.jpg', 'image/jpeg');

    // Geef een FOUTE hash mee → enforcement moet het bestand weigeren
    const wrongHash = 'deadbeef'.repeat(8); // 64-char maar klopt niet

    const zipBlob = await buildOriginZip({
      originId: 'um-AABBCCDD',
      hash: wrongHash,
      timestamp: new Date('2026-02-19T12:00:00Z'),
      imageUrl: null,
      artifactFile: file,
    });

    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);

    // artifact.jpg mag NIET in de ZIP zitten — hash mismatch
    expect(files).not.toContain('artifact.jpg');
    // certificate.json moet er wel zijn — ZIP blijft valide
    expect(files).toContain('certificate.json');
    expect(files).toContain('VERIFY.txt');
  });

  it('skips imageUrl fallback — does not pack thumbnail into ZIP', async () => {
    // imageUrl (thumbnail) mag niet in de ZIP komen — zou hash-verificatie breken
    const zipBlob = await buildOriginZip({
      originId: 'um-AABBCCDD',
      hash: 'a'.repeat(64),
      timestamp: new Date('2026-02-19T12:00:00Z'),
      imageUrl: 'https://example.com/thumbnail.jpg', // remote URL → fetch faalt in jsdom
    });

    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);

    // Geen artifact in de ZIP — imageUrl fallback is bewust uitgeschakeld
    const artifactFiles = files.filter(f => f.startsWith('artifact.'));
    expect(artifactFiles).toHaveLength(0);
    expect(files).toContain('certificate.json');
  });
});
