/**
 * Umarise Integration Template — Node.js
 *
 * WHAT THIS FILE DOES:
 * Complete integration from file upload to verified proof.
 * Copy this file. Change the 3 config values. Done.
 *
 * WHAT YOU CHANGE:
 * 1. API_KEY — your Umarise API key
 * 2. saveOriginId() — how you store the origin_id in YOUR database
 * 3. onAnchorComplete() — what happens when proof is anchored (optional)
 *
 * WHAT YOU DON'T CHANGE:
 * Everything else. Hash calculation, API calls, error handling,
 * retry logic, polling — it's all handled.
 *
 * NO DEPENDENCIES. Uses only Node.js built-ins (crypto, https, fs).
 * Works with Node 18+.
 */

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");

// ═══════════════════════════════════════════════════════════════
// CONFIG — Change these three things, nothing else
// ═══════════════════════════════════════════════════════════════

let API_KEY = "um_your_api_key_here";

/**
 * Store the origin_id in YOUR system.
 * This links your record to the independent proof.
 *
 * Replace this with your actual database call, e.g.:
 *   await db.submissions.update(recordId, { origin_id: originId });
 *   await prisma.upload.update({ where: { id: recordId }, data: { originId } });
 *   await knex('submissions').where({ id: recordId }).update({ origin_id: originId });
 */
async function saveOriginId(recordId, originId) {
  // TODO: Replace with your database call
  console.log("Store origin_id " + originId + " for record " + recordId);
}

/**
 * Called when proof is fully anchored to Bitcoin (10-20 min after attestation).
 * Optional. Use this if you want to notify users or update status.
 *
 * If you don't need this, leave it empty.
 */
async function onAnchorComplete(recordId, originId) {
  // TODO: Optional — notify user, update status, download .ots proof
  console.log("Proof anchored for record " + recordId + " (origin: " + originId + ")");
}

// ═══════════════════════════════════════════════════════════════
// BELOW THIS LINE: DON'T CHANGE ANYTHING
// ═══════════════════════════════════════════════════════════════

let BASE = "https://core.umarise.com";
let MAX_RETRIES = 3;
let RETRY_DELAY_MS = 60000;
const POLL_INTERVAL_MS = 60000;
const POLL_TIMEOUT_MS = 30 * 60000;

// --- HTTP helper (zero dependencies) ---

function request(method, path, body, apiKey) {
  return new Promise(function (resolve, reject) {
    var url = new URL(path, BASE);
    var options = {
      method: method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    };
    if (apiKey) {
      options.headers["X-API-Key"] = apiKey;
    }

    var req = https.request(options, function (res) {
      var data = "";
      res.on("data", function (chunk) { data += chunk; });
      res.on("end", function () {
        try {
          var parsed = JSON.parse(data);
          if (parsed.error) {
            var err = new Error(parsed.error.code + ": " + parsed.error.message);
            err.code = parsed.error.code;
            reject(err);
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error("Invalid JSON: " + data));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", function () {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// --- Core functions ---

function hashFile(filePath) {
  var buffer = fs.readFileSync(filePath);
  var hex = crypto.createHash("sha256").update(buffer).digest("hex");
  return "sha256:" + hex;
}

function hashBytes(data) {
  var hex = crypto.createHash("sha256").update(data).digest("hex");
  return "sha256:" + hex;
}

async function attest(hash) {
  var lastError;

  for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await request("POST", "/v1-core-origins", { hash: hash }, API_KEY);
    } catch (err) {
      lastError = err;

      if (err.code === "UNAUTHORIZED" || err.code === "API_KEY_REVOKED" || err.code === "INVALID_HASH_FORMAT") {
        throw err;
      }

      if (err.code === "RATE_LIMIT_EXCEEDED") {
        console.log("Rate limited. Waiting before retry...");
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      if (attempt < MAX_RETRIES) {
        console.log("Attempt " + attempt + " failed. Retrying in " + (RETRY_DELAY_MS / 1000) + "s...");
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error("Umarise API failed after " + MAX_RETRIES + " attempts: " + lastError);
}

async function verify(hash) {
  try {
    return await request("POST", "/v1-core-verify", { hash: hash });
  } catch (err) {
    if (err.code === "NOT_FOUND") return null;
    throw err;
  }
}

async function resolve(originId) {
  return await request("GET", "/v1-core-resolve?origin_id=" + originId);
}

async function waitForAnchor(originId) {
  var start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    var record = await resolve(originId);
    if (record.proof_status === "anchored") return record;
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error("Proof not anchored after " + (POLL_TIMEOUT_MS / 60000) + " minutes");
}

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API — These are the functions you call
// ═══════════════════════════════════════════════════════════════

async function attestFile(filePath, recordId) {
  var hash = hashFile(filePath);
  var result = await attest(hash);
  await saveOriginId(recordId, result.origin_id);
  return result;
}

async function attestBuffer(data, recordId) {
  var hash = hashBytes(data);
  var result = await attest(hash);
  await saveOriginId(recordId, result.origin_id);
  return result;
}

function trackAnchor(originId, recordId) {
  waitForAnchor(originId)
    .then(function () { return onAnchorComplete(recordId, originId); })
    .catch(function (err) { console.error("Anchor tracking failed for " + originId + ":", err); });
}

async function verifyFile(filePath) {
  var hash = hashFile(filePath);
  return verify(hash);
}

async function safeAttest(filePath, recordId) {
  try {
    return await attestFile(filePath, recordId);
  } catch (err) {
    console.error("[Umarise] Attestation failed for " + recordId + ":", err.message || err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  hashFile: hashFile,
  hashBytes: hashBytes,
  attest: attest,
  verify: verify,
  resolve: resolve,
  attestFile: attestFile,
  attestBuffer: attestBuffer,
  trackAnchor: trackAnchor,
  verifyFile: verifyFile,
  safeAttest: safeAttest,
  // Exposed for testing — override in test scripts
  get API_KEY() { return API_KEY; },
  set API_KEY(v) { API_KEY = v; },
  get BASE() { return BASE; },
  set BASE(v) { BASE = v; },
  get MAX_RETRIES() { return MAX_RETRIES; },
  set MAX_RETRIES(v) { MAX_RETRIES = v; },
  get RETRY_DELAY_MS() { return RETRY_DELAY_MS; },
  set RETRY_DELAY_MS(v) { RETRY_DELAY_MS = v; },
};
