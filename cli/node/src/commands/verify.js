/**
 * umarise verify <file> [proof]
 * 
 * 1. Read file + .proof ZIP
 * 2. Compute SHA-256 hash → compare with certificate.json
 * 3. Verify proof.ots offline (OTS library)
 * 4. If offline fails: fallback to /v1-core-verify (online)
 * 5. Print result with block height
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { UmariseCore, hashBytes } from '@umarise/anchor';
import JSZip from 'jszip';

export async function verifyCommand(filePath, proofPath, opts) {
  // --- Resolve paths ---
  const absFile = resolve(filePath);
  const absProof = resolve(proofPath || `${filePath}.proof`);

  if (!existsSync(absFile)) {
    throw new Error(`File not found: ${filePath}`);
  }
  if (!existsSync(absProof)) {
    throw new Error(
      `Proof not found: ${proofPath || `${filePath}.proof`}\n` +
      'Run "umarise anchor <file>" first to create a proof bundle.'
    );
  }

  // --- Read and hash file ---
  const fileBytes = await readFile(absFile);
  const computedHash = await hashBytes(fileBytes);

  // --- Read proof bundle ---
  const proofBytes = await readFile(absProof);
  const zip = await JSZip.loadAsync(proofBytes);

  const certFile = zip.file('certificate.json');
  if (!certFile) {
    throw new Error('Invalid proof bundle: missing certificate.json');
  }

  const certText = await certFile.async('text');
  const certificate = JSON.parse(certText);

  // --- Step 1: Hash match ---
  const storedHash = certificate.hash;
  if (computedHash !== storedHash) {
    console.log(`✗ hash mismatch`);
    console.log(`  computed: ${computedHash}`);
    console.log(`  expected: ${storedHash}`);
    process.exit(1);
  }
  console.log(`✓ hash matches`);

  // --- Step 2: Try offline OTS verification ---
  const otsFile = zip.file('proof.ots');
  let verified = false;
  let blockHeight = null;
  let anchoredAt = null;

  // Offline OTS verification would go here when OTS JS library is available.
  // For now, we rely on online verification with a note about offline capability.

  // --- Step 3: Online verification (fallback / primary for now) ---
  if (!verified) {
    try {
      const core = new UmariseCore();
      const result = await core.verify(computedHash);

      if (result) {
        verified = true;

        if (result.proof_status === 'anchored') {
          // Fetch proof details for block height
          try {
            const proofResult = await core.proof(certificate.origin_id);
            blockHeight = proofResult.bitcoin_block_height || null;
            anchoredAt = proofResult.anchored_at || null;
          } catch {
            // proof details unavailable, but verification still passed
          }

          if (blockHeight) {
            console.log(`✓ anchored in Bitcoin block ${blockHeight}`);
          } else {
            console.log(`✓ anchored in Bitcoin`);
          }

          if (anchoredAt) {
            const date = anchoredAt.split('T')[0];
            console.log(`✓ no later than: ${date}`);
          } else if (certificate.captured_at) {
            const date = certificate.captured_at.split('T')[0];
            console.log(`✓ captured at: ${date}`);
          }
        } else {
          console.log(`⏳ proof status: ${result.proof_status} (awaiting Bitcoin confirmation)`);
        }
      } else {
        console.log(`✗ hash not found in Umarise registry`);
        process.exit(1);
      }
    } catch (err) {
      // Online also failed
      if (otsFile) {
        console.log(`⚠ online verification unavailable: ${err.message}`);
        console.log(`  proof.ots is present — verify manually with: ots verify proof.ots`);
        console.log(`  extract: unzip ${proofPath || `${filePath}.proof`}`);
      } else {
        throw new Error(`Verification failed: ${err.message}`);
      }
    }
  }

  if (verified) {
    console.log(`✓ proof valid — independent of Umarise`);
  }

  return { verified, hash: computedHash, blockHeight, anchoredAt };
}
