/**
 * umarise anchor <file>
 * 
 * 1. Read file
 * 2. Compute SHA-256 hash (Node crypto)
 * 3. POST to /v1-core-origins with X-API-Key
 * 4. Download proof.ots via /v1-core-proof
 * 5. Write <file>.proof ZIP (certificate.json + proof.ots)
 * 6. Print confirmation
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { UmariseCore, hashBytes } from '@umarise/anchor';
import JSZip from 'jszip';

export async function anchorCommand(filePath, opts) {
  // --- Resolve API key ---
  const apiKey = opts.apiKey || process.env.UMARISE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No API key found.\n' +
      'Set UMARISE_API_KEY environment variable or pass --api-key <key>.\n' +
      'Get your key at https://umarise.com/developers'
    );
  }

  // --- Resolve file ---
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // --- Hash ---
  const fileBytes = await readFile(absPath);
  const hash = await hashBytes(fileBytes);
  console.log(`✓ hash computed: ${hash}`);

  // --- Anchor ---
  const core = new UmariseCore({ apiKey });
  const origin = await core.attest(hash);
  console.log(`✓ anchored: origin_id ${origin.origin_id}`);

  // --- Build proof bundle ---
  const certificate = {
    version: '1.0',
    origin_id: origin.origin_id,
    hash: origin.hash,
    hash_algo: origin.hash_algo,
    captured_at: origin.captured_at,
    proof_status: origin.proof_status || 'pending',
    issuer: 'https://core.umarise.com',
    spec: 'https://spec.umarise.com',
  };

  const zip = new JSZip();
  zip.file('certificate.json', JSON.stringify(certificate, null, 2));

  // Try to fetch proof.ots (may be pending)
  try {
    const proofResult = await core.proof(origin.origin_id);
    if (proofResult.proof) {
      zip.file('proof.ots', proofResult.proof);
    }
  } catch {
    // proof not yet available — that's fine, certificate is enough for now
  }

  // --- Write .proof file ---
  const proofPath = `${absPath}.proof`;
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  await writeFile(proofPath, zipBuffer);
  console.log(`✓ proof saved: ${filePath}.proof`);

  return { origin_id: origin.origin_id, hash, proofPath };
}
