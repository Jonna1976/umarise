/**
 * umarise verify <file> [proof]
 * 
 * 1. Read file + .proof ZIP
 * 2. Compute SHA-256 hash → compare with certificate.json
 * 3. Verify proof.ots offline via OTS library (primary)
 * 4. If offline fails: fallback to /v1-core-verify (online)
 * 5. Print result with block height
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { UmariseCore, hashBytes } from '@umarise/anchor';
import JSZip from 'jszip';

/**
 * Attempt offline OTS verification using @lacrypta/typescript-opentimestamps.
 * Returns { verified, blockHeight, anchoredAt } or null if OTS lib unavailable.
 */
async function verifyOtsOffline(otsBytes, fileHash) {
  try {
    const { read, verify, verifiers } = await import('@lacrypta/typescript-opentimestamps');

    const timestamp = read(new Uint8Array(otsBytes));

    const { attestations, errors } = await verify(timestamp, verifiers);

    // attestations is Record<number, string[]> where keys are block heights
    const blockHeights = Object.keys(attestations).map(Number).filter(n => n > 0);

    if (blockHeights.length > 0) {
      const blockHeight = Math.min(...blockHeights);
      return {
        verified: true,
        blockHeight,
        anchoredAt: null, // OTS doesn't provide exact timestamp, only block height
        method: 'offline',
      };
    }

    // If there are errors but no attestations, verification failed
    const errorEntries = Object.entries(errors);
    if (errorEntries.length > 0) {
      const firstError = errorEntries[0][1][0];
      return {
        verified: false,
        error: firstError?.message || 'OTS verification failed',
        method: 'offline',
      };
    }

    // No attestations and no errors — proof may be pending
    return {
      verified: false,
      error: 'No Bitcoin attestations found (proof may be pending)',
      method: 'offline',
    };
  } catch (err) {
    // Library not available or parse error — return null to trigger fallback
    return null;
  }
}

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

  // --- Step 2: Try offline OTS verification (primary) ---
  const otsFile = zip.file('proof.ots');
  let verified = false;
  let blockHeight = null;
  let anchoredAt = null;

  if (otsFile) {
    const otsBytes = await otsFile.async('uint8array');
    const otsResult = await verifyOtsOffline(otsBytes, computedHash);

    if (otsResult && otsResult.verified) {
      verified = true;
      blockHeight = otsResult.blockHeight;
      anchoredAt = otsResult.anchoredAt;

      console.log(`✓ anchored in Bitcoin block ${blockHeight}`);

      if (anchoredAt) {
        const date = anchoredAt.split('T')[0];
        console.log(`✓ no later than: ${date}`);
      } else if (certificate.captured_at) {
        const date = certificate.captured_at.split('T')[0];
        console.log(`✓ no later than: ${date}`);
      }
    } else if (otsResult && !otsResult.verified) {
      // OTS lib available but verification failed (pending or error)
      console.log(`⏳ offline: ${otsResult.error}`);
    }
    // otsResult === null means lib unavailable → fall through to online
  }

  // --- Step 3: Online verification (fallback) ---
  if (!verified) {
    try {
      const core = new UmariseCore();
      const result = await core.verify(computedHash);

      if (result) {
        verified = true;

        if (result.proof_status === 'anchored') {
          try {
            const proofResult = await core.proof(certificate.origin_id);
            blockHeight = proofResult.bitcoin_block_height || null;
            anchoredAt = proofResult.anchored_at || null;
          } catch {
            // proof details unavailable
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
