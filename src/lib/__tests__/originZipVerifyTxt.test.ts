import { describe, it, expect } from 'vitest';
import { buildOriginZip, OriginZipInput } from '@/lib/originZip';
import JSZip from 'jszip';

const baseInput: OriginZipInput = {
  originId: 'TEST1234',
  hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  timestamp: new Date('2026-03-03T12:00:00Z'),
  imageUrl: null,
  claimedBy: null,
  signature: null,
  deviceSignature: 'mock-sig',
  devicePublicKey: 'mock-pk',
};

async function extractVerifyTxt(input: OriginZipInput): Promise<string> {
  const blob = await buildOriginZip(input);
  const zip = await JSZip.loadAsync(blob);
  const file = zip.file('VERIFY.txt');
  if (!file) throw new Error('VERIFY.txt not found in ZIP');
  return file.async('string');
}

describe('VERIFY.txt pending vs anchored', () => {
  it('anchored ZIP does NOT contain pending proof section', async () => {
    const txt = await extractVerifyTxt({
      ...baseInput,
      otsProof: btoa('mock-ots-bytes'),
    });

    expect(txt).toContain('proof.ots         : OpenTimestamps proof (anchored to Bitcoin)');
    expect(txt).not.toContain('PENDING PROOF');
    expect(txt).not.toContain('NOT INCLUDED');
    expect(txt).not.toContain('see "Pending Proof" section');
  });

  it('pending ZIP contains explicit pending proof trade-off section', async () => {
    const txt = await extractVerifyTxt({
      ...baseInput,
      otsProof: null,
    });

    expect(txt).toContain('NOT INCLUDED');
    expect(txt).toContain('PENDING PROOF');
    expect(txt).toContain('deliberate design trade-off');
    expect(txt).toContain('v1-core-proof?origin_id=TEST1234');
    expect(txt).toContain('v1-core-resolve?origin_id=TEST1234');
    expect(txt).toContain('Download proof.ots first');
    expect(txt).not.toContain('proof.ots         : OpenTimestamps proof (anchored to Bitcoin)');
  });

  it('pending ZIP lists three retrieval options', async () => {
    const txt = await extractVerifyTxt({
      ...baseInput,
      otsProof: null,
    });

    expect(txt).toContain('Option A:');
    expect(txt).toContain('Option B:');
    expect(txt).toContain('Option C:');
  });
});
