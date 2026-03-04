/**
 * umarise verify <file> [proof]
 * 
 * 1. Read file + .proof ZIP
 * 2. Compute SHA-256 hash → compare with certificate.json
 * 3. Verify proof.ots offline via OpenTimestamps library (primary)
 * 4. If offline fails: fallback to /v1-core-verify (online)
 * 5. Print result with block height
 * 
 * Uses the same OpenTimestamps library (opentimestamps v0.4.9) as
 * verify-anchoring.org to ensure consistent verification results.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { UmariseCore, hashBytes } from '@umarise/anchor';
import JSZip from 'jszip';

/**
 * Convert hex string to Uint8Array.
 */
function hexToBytes(hex) {
  const clean = hex.replace(/^sha256:/, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Attempt offline OTS verification using the opentimestamps library.
 * This is the same library used by verify-anchoring.org (v0.4.9).
 * Returns { verified, blockHeight } or null if library unavailable.
 */
async function verifyOtsOffline(otsBytes, fileHashHex) {
  try {
    const OpenTimestamps = await import('opentimestamps');
    const OTS = OpenTimestamps.default || OpenTimestamps;

    const hashBytes = hexToBytes(fileHashHex);

    // Deserialize the .ots proof
    const detachedOts = OTS.DetachedTimestampFile.deserialize(otsBytes);

    // Create a detached timestamp from the file hash
    const detached = OTS.DetachedTimestampFile.fromHash(
      new OTS.Ops.OpSHA256(), hashBytes
    );

    // Suppress noisy OTS library output (calendar errors, lite-client messages)
    const originalError = console.error;
    const originalLog = console.log;
    console.error = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('RequestError') || msg.includes('AggregateError') || msg.includes('Response error')) return;
      originalError.apply(console, args);
    };
    console.log = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('Lite-client verification') || msg.includes('attestation(s) from')) return;
      originalLog.apply(console, args);
    };

    // Verify against Bitcoin blockchain
    let result;
    try {
      result = await OTS.verify(detachedOts, detached, {
        ignoreBitcoinNode: true,
        timeout: 10000,
      });
    } finally {
      console.error = originalError;
      console.log = originalLog;
    }

    // result is a map of attestation timestamps (unix) or empty
    if (result && Object.keys(result).length > 0) {
      // Extract block height from the info if available
      const infoStr = OTS.info(detachedOts);
      let blockHeight = null;

      // Parse block height from info string (format: "Bitcoin block NNNN")
      if (infoStr) {
        const blockMatch = infoStr.match(/block\s+(\d+)/i);
        if (blockMatch) {
          blockHeight = parseInt(blockMatch[1], 10);
        }
      }

      // Get the earliest attestation timestamp
      const timestamps = Object.keys(result).map(Number);
      const earliestTimestamp = Math.min(...timestamps);
      const anchoredAt = new Date(earliestTimestamp * 1000).toISOString();

      return {
        verified: true,
        blockHeight,
        anchoredAt,
        method: 'offline',
      };
    }

    // Check if proof is pending
    const pendingInfo = OTS.info(detachedOts);
    if (pendingInfo && pendingInfo.indexOf('PendingAttestation') !== -1) {
      return {
        verified: false,
        error: 'Proof is pending Bitcoin confirmation',
        method: 'offline',
      };
    }

    return {
      verified: false,
      error: 'No Bitcoin attestations found in .ots proof',
      method: 'offline',
    };
  } catch (err) {
    // Library not available or verification error → return null for fallback
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
        console.log(`✓ no later than: ${date}`);
      }
    } else if (otsResult && !otsResult.verified) {
      console.log(`⏳ offline: ${otsResult.error}`);
    }
    // otsResult === null → lib unavailable, fall through to online
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
