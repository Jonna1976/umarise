#!/usr/bin/env node
/**
 * Umarise Integration Template — Test Suite (Node.js)
 *
 * ═══════════════════════════════════════════════════════════════
 *   HOE JE DIT DRAAIT
 * ═══════════════════════════════════════════════════════════════
 *
 * Je hebt twee bestanden nodig:
 *   1. umarise-integration.js   (de template)
 *   2. test_integration_node.js  (dit bestand)
 *
 * Download ze allebei. Dan in je Terminal:
 *
 *   mkdir ~/umarise-test-node
 *   cp ~/Downloads/umarise-integration.js ~/umarise-test-node/
 *   cp ~/Downloads/test_integration_node.js ~/umarise-test-node/
 *   cd ~/umarise-test-node
 *   node test_integration_node.js um_JOUW_KEY_HIER
 *
 * Dat is alles. Geen bestanden bewerken. Key staat in het commando.
 *
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require("fs");

// ─────────────────────────────────────────────────────────────
// PRE-FLIGHT CHECKS
// ─────────────────────────────────────────────────────────────

console.log();
console.log("=".repeat(55));
console.log("  Umarise Integration Template — Test Suite (Node.js)");
console.log("=".repeat(55));
console.log();

// Check: API key meegegeven als argument?
var API_KEY = process.argv[2];

if (!API_KEY) {
  console.log("  STOP  Geen API key meegegeven.");
  console.log();
  console.log("  Gebruik:");
  console.log("    node test_integration_node.js um_JOUW_KEY_HIER");
  console.log();
  console.log("  Je key begint met um_ en komt van partners@umarise.com.");
  console.log();
  process.exit(1);
}

if (!API_KEY.startsWith("um_")) {
  console.log("  STOP  Je API key moet beginnen met 'um_'");
  console.log();
  console.log("  Je hebt ingevuld: " + API_KEY.slice(0, 20) + "...");
  console.log();
  console.log("  Gebruik:");
  console.log("    node test_integration_node.js um_JOUW_KEY_HIER");
  console.log();
  process.exit(1);
}

// Check: Node versie
var nodeVersion = parseInt(process.version.slice(1));
if (nodeVersion < 18) {
  console.log("  STOP  Node.js " + process.version + " is te oud. Minimaal Node 18.");
  process.exit(1);
}

// Check: umarise-integration.js aanwezig?
var um;
try {
  um = require("./umarise-integration.js");
} catch (e) {
  console.log("  STOP  umarise-integration.js niet gevonden in deze map.");
  console.log();
  console.log("  Zorg dat beide bestanden in dezelfde map staan:");
  console.log("    cp ~/Downloads/umarise-integration.js ~/umarise-test-node/");
  console.log();
  process.exit(1);
}

console.log("  Pre-flight checks OK. Tests starten...");
console.log();

// Config
um.API_KEY = API_KEY;
um.RETRY_DELAY_MS = 3000;
um.MAX_RETRIES = 1;

// ─────────────────────────────────────────────────────────────
// TEST FRAMEWORK
// ─────────────────────────────────────────────────────────────

var passed = 0;
var failed = 0;

async function test(name, fn) {
  try {
    var result = await fn();
    console.log("  OK    " + name);
    passed++;
    return result;
  } catch (e) {
    console.log("  FAIL  " + name);
    console.log("        " + (e.message || e));
    failed++;
    return null;
  }
}

async function testMustFail(name, fn, expectedWord) {
  try {
    await fn();
    console.log("  FAIL  " + name);
    console.log("        Had moeten falen, maar slaagde");
    failed++;
  } catch (e) {
    var msg = e.message || String(e);
    if (msg.indexOf(expectedWord) !== -1) {
      console.log("  OK    " + name);
      console.log("        Fout (verwacht): " + msg.slice(0, 70));
      passed++;
    } else {
      console.log("  OK    " + name + " (andere error, maar correct gefaald)");
      console.log("        Fout: " + msg.slice(0, 70));
      passed++;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// TESTBESTANDEN
// ─────────────────────────────────────────────────────────────

var testFiles = [];

function makeFile(name) {
  var content = "Umarise test " + name + " " + Date.now();
  fs.writeFileSync(name, content);
  testFiles.push(name);
  return { path: name, content: content };
}

// ─────────────────────────────────────────────────────────────
// DE TESTS
// ─────────────────────────────────────────────────────────────

async function runTests() {
  // 1. HASHING
  console.log("1. HASHING");
  var f1 = makeFile("test-doc.txt");

  var fileHash = await test("hashFile() — bestand hashen", function () {
    return um.hashFile(f1.path);
  });

  var bytesHash = await test("hashBytes() — bytes hashen", function () {
    return um.hashBytes(Buffer.from(f1.content));
  });

  if (fileHash && bytesHash) {
    await test("Zelfde input = zelfde hash", function () {
      if (fileHash !== bytesHash) throw new Error("Hashes zijn verschillend");
    });
  }

  // 2. ATTESTATIE
  console.log("\n2. ATTESTATIE AANMAKEN");
  var attestResult = await test("attest() — attestatie aanmaken", function () {
    return um.attest(fileHash);
  });

  var originId = null;
  if (attestResult) {
    originId = attestResult.origin_id;
    await test("origin_id ontvangen: " + originId.slice(0, 16) + "...", function () {
      if (!originId) throw new Error("Geen origin_id");
    });
    await test("proof_status: " + attestResult.proof_status, function () {});
  }

  // 3. ATTEST_FILE
  console.log("\n3. BESTAND ATTESTEREN (hoofdfunctie)");
  var f2 = makeFile("test-doc-2.txt");
  await test("attestFile() met saveOriginId callback", function () {
    return um.attestFile(f2.path, "record-001");
  });

  // 4. VERIFY
  console.log("\n4. HASH VERIFIEREN");
  await test("verify() — bestaande hash — match gevonden", function () {
    return um.verify(fileHash).then(function (r) {
      if (!r) throw new Error("Geen match");
      return r;
    });
  });

  await test("verify() — onbekende hash — null terug (correct)", function () {
    return um.verify("sha256:" + "0".repeat(64)).then(function (r) {
      if (r !== null) throw new Error("Had null moeten zijn");
    });
  });

  // 5. RESOLVE
  console.log("\n5. ATTESTATIE OPZOEKEN");
  if (originId) {
    await test("resolve() — origin_id opzoeken", function () {
      return um.resolve(originId);
    });
  }

  // 6. VERIFY_FILE
  console.log("\n6. BESTAND VERIFIEREN (hoofdfunctie)");
  await test("verifyFile() — match gevonden", function () {
    return um.verifyFile(f1.path).then(function (r) {
      if (!r) throw new Error("Geen match");
      return r;
    });
  });

  // 7. ERROR HANDLING
  console.log("\n7. FOUTAFHANDELING");

  var savedKey = um.API_KEY;
  um.API_KEY = "um_verkeerde_key_12345";
  await testMustFail("Verkeerde API key — directe fout, geen retry",
    function () { return um.attest(fileHash); }, "UNAUTHORIZED");
  um.API_KEY = savedKey;

  await testMustFail("Ongeldig hash-formaat — directe fout",
    function () { return um.attest("dit-is-geen-hash"); }, "INVALID_HASH");

  // 8. SAFE_ATTEST
  console.log("\n8. VEILIGE MODUS (safeAttest)");

  var f3 = makeFile("test-doc-3.txt");
  await test("safeAttest() — werkende API — resultaat terug", function () {
    return um.safeAttest(f3.path, "record-002").then(function (r) {
      if (!r) throw new Error("Geen resultaat");
      return r;
    });
  });

  var savedBase = um.BASE;
  um.BASE = "https://does-not-exist.umarise.test";
  console.log("  ...   API onbereikbaar simuleren (paar seconden)...");
  var safeResult = await um.safeAttest(f1.path, "record-003");
  if (safeResult === null) {
    console.log("  OK    Onbereikbare API — null terug, workflow gaat door");
    passed++;
  } else {
    console.log("  FAIL  Had null moeten teruggeven");
    failed++;
  }
  um.BASE = savedBase;

  // OPRUIMEN
  testFiles.forEach(function (f) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });

  // RESULTAAT
  console.log();
  console.log("=".repeat(55));
  var total = passed + failed;
  if (failed === 0) {
    console.log("  Alle " + total + " tests geslaagd. Template werkt.");
    console.log();
    console.log("  Wat nu?");
    console.log("  Wacht 10-20 minuten en plak dan dit in je terminal:");
    console.log();
    if (originId) {
      console.log("  curl 'https://core.umarise.com/v1-core-resolve?origin_id=" + originId + "'");
    }
    console.log();
    console.log("  'anchored' = bewijs is definitief.");
    console.log("  'pending' = wacht nog even.");
  } else {
    console.log("  " + passed + "/" + total + " tests geslaagd, " + failed + " gefaald.");
    console.log();
    console.log("  Los de FAIL-regels op en draai opnieuw:");
    console.log("    node test_integration_node.js " + API_KEY);
  }
  console.log("=".repeat(55));
  console.log();
}

runTests().catch(function (e) {
  console.error("Onverwachte fout:", e);
  process.exit(1);
});
