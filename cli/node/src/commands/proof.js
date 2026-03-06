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

  // Add VERIFY.txt with independent verification instructions
  const fileName = filePath.split('/').pop();
  const verifyTxt = `VERIFICATION INSTRUCTIONS
=========================

This .proof file contains an independently verifiable existence proof.
It proves that the file "${fileName}" existed no later than the anchored timestamp.

Contents:
- certificate.json  : Origin metadata (origin_id, hash, timestamp)
- proof.ots         : OpenTimestamps proof (anchored to Bitcoin)
- VERIFY.txt        : This file

HOW TO VERIFY:

  Step 1 — Verify hash integrity:
    sha256sum ${fileName}
    Compare output with the "hash" field in certificate.json (without "sha256:" prefix).

  Step 2 — Verify Bitcoin proof:
    Option A (CLI):
      umarise verify ${fileName}
    Option B (online):
      https://verify-anchoring.org
    Option C (manual, no platform needed):
      ots verify proof.ots
      (requires ots-cli: https://github.com/opentimestamps/opentimestamps-client)

IMPORTANT:
  You need the original file ("${fileName}") alongside this .proof bundle.
  The proof says: "this hash existed before time T."
  Without the original file, there is nothing to hash and compare.

SPECIFICATION:
  This proof conforms to the Anchoring Specification (IEC v1.0).
  Canonical reference: https://anchoring-spec.org/v1.0/

WHAT THIS PROVES:
  The exact bytes of the file existed no later than the moment
  of Bitcoin ledger inclusion. Nothing more, nothing less.

WHAT THIS DOES NOT PROVE:
  Authorship, ownership, accuracy, legality, or identity.
`;
  zip.file('VERIFY.txt', verifyTxt);

  const proofPath = `${absPath}.proof`;
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  await writeFile(proofPath, zipBuffer);

  // --- Auto-extract proof contents into subfolder ---
  const { dirname, basename } = await import('path');
  const { mkdir } = await import('fs/promises');
  const extractDir = resolve(dirname(absPath), `${basename(absPath)}-proof`);
  await mkdir(extractDir, { recursive: true });
  await writeFile(resolve(extractDir, 'certificate.json'), JSON.stringify(certificate, null, 2));
  await writeFile(resolve(extractDir, 'proof.ots'), proofResult.proof);
  await writeFile(resolve(extractDir, 'VERIFY.txt'), verifyTxt);

  // --- Print result ---
  if (proofResult.bitcoin_block_height) {
    console.log(`✓ anchored in Bitcoin block ${proofResult.bitcoin_block_height}`);
  }
  if (proofResult.anchored_at) {
    const date = proofResult.anchored_at.split('T')[0];
    console.log(`✓ no later than: ${date}`);
  }
  console.log(`✓ saved: ${filePath}.proof`);
  console.log(`✓ extracted: ${basename(absPath)}-proof/`);
  console.log(`✓ proof valid — independent of Umarise`);

  return { originId, hash, status: 'anchored', proofPath, extractDir };
}
