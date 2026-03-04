/**
 * umarise proof <file>
 * 
 * Stateless, idempotent proof lifecycle in one command.
 * 
 * Run 1 (new file):
 *   hash → anchor → resolve → pending? print "run again later"
 * 
 * Run 2 (proof ready):
 *   hash → detect existing → resolve → download .ots → write .proof ZIP → verify
 * 
 * No daemon. No state files. No background process.
 * Same command, always does the right thing.
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { UmariseCore, hashBytes, UmariseCoreError } from '@umarise/anchor';
import JSZip from 'jszip';

export async function proofCommand(filePath, opts) {
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

  // --- Ensure anchor exists (idempotent) ---
  const core = new UmariseCore({ apiKey });
  let originId;

  try {
    const origin = await core.attest(hash);
    originId = origin.origin_id;
    console.log(`✓ hash: ${hash}`);
    console.log(`✓ anchored: origin_id ${originId}`);
  } catch (err) {
    if (err instanceof UmariseCoreError && err.code === 'DUPLICATE_HASH') {
      // Already anchored — resolve existing origin_id
      const existing = await core.resolve({ hash });
      if (!existing) {
        throw new Error('Hash reported as duplicate but could not be resolved');
      }
      originId = existing.origin_id;
      console.log(`✓ hash: ${hash} (already anchored)`);
      console.log(`✓ origin_id: ${originId}`);
    } else {
      throw err;
    }
  }

  // --- Resolve proof status ---
  const proofResult = await core.proof(originId);

  if (proofResult.status === 'pending') {
    console.log(`⏳ proof pending — run again later`);
    return { originId, hash, status: 'pending' };
  }

  if (proofResult.status === 'not_found') {
    console.log(`⏳ proof not yet submitted — run again later`);
    return { originId, hash, status: 'not_found' };
  }

  // --- Proof is anchored — build .proof ZIP ---
  const certificate = {
    version: '1.0',
    origin_id: originId,
    hash,
    hash_algo: 'sha256',
    captured_at: new Date().toISOString(),
    anchored_at: proofResult.anchored_at || null,
    bitcoin_block_height: proofResult.bitcoin_block_height || null,
    proof_status: 'anchored',
    issuer: 'https://core.umarise.com',
    spec: 'https://anchoring-spec.org/v1.0/',
  };

  const zip = new JSZip();
  zip.file('certificate.json', JSON.stringify(certificate, null, 2));
  zip.file('proof.ots', proofResult.proof);

  const proofPath = `${absPath}.proof`;
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  await writeFile(proofPath, zipBuffer);

  // --- Print result ---
  if (proofResult.bitcoin_block_height) {
    console.log(`✓ anchored in Bitcoin block ${proofResult.bitcoin_block_height}`);
  }
  if (proofResult.anchored_at) {
    const date = proofResult.anchored_at.split('T')[0];
    console.log(`✓ no later than: ${date}`);
  }
  console.log(`✓ saved: ${filePath}.proof`);
  console.log(`✓ proof valid — independent of Umarise`);

  return { originId, hash, status: 'anchored', proofPath };
}
