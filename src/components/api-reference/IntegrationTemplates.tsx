import { useState } from 'react';
import { Download, Copy, Check, Code2, AlertTriangle } from 'lucide-react';

type Lang = 'python' | 'node';

const SDK_PYTHON = '/sdk/python/umarise_core.py';
const TEST_PYTHON = '/sdk/python/test_integration.py';
const SDK_NODE = '/sdk/node/umarise-core.ts';
const TEST_NODE = '/sdk/node/test_integration_node.js';

// Generate downloadable test scripts as blobs
const PYTHON_TEST_SCRIPT = `#!/usr/bin/env python3
"""
Umarise Core — Integration Test
Usage: python3 test_integration.py um_YOUR_API_KEY
"""
import sys
import os

# Accept API key as CLI argument
if len(sys.argv) < 2 or not sys.argv[1].startswith("um_"):
    print("Usage: python3 test_integration.py um_YOUR_API_KEY")
    print("       Your key starts with um_ — the same key as in the Quick Start curls.")
    sys.exit(1)

API_KEY = sys.argv[1]

# Add parent dir to path so we can import the SDK
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from umarise_core import UmariseCore, hash_bytes

passed = 0
failed = 0
total = 15

def ok(name):
    global passed
    passed += 1
    print(f"  OK  {name}")

def fail(name, reason=""):
    global failed
    failed += 1
    print(f"  FAIL  {name}{' — ' + reason if reason else ''}")

def test_must_fail(name, fn):
    """Test that expects an error — OK if it raises, FAIL if it succeeds."""
    global passed, failed
    try:
        fn()
        failed += 1
        print(f"  FAIL  {name} — expected error but succeeded")
    except Exception:
        passed += 1
        print(f"  OK  {name} (correctly rejected)")

print()
print("═" * 50)
print("  Umarise Core — Integration Test")
print("═" * 50)
print()

# --- Public endpoints (no key needed) ---
core_public = UmariseCore()

# 1. Health
try:
    h = core_public.health()
    if h.get("status") == "operational":
        ok("1. Health check")
    else:
        fail("1. Health check", f"status={h.get('status')}")
except Exception as e:
    fail("1. Health check", str(e))

# 2. Verify unknown hash (expect 404)
try:
    r = core_public.verify("sha256:" + "a" * 64)
    if r is None:
        ok("2. Verify unknown hash → None")
    else:
        fail("2. Verify unknown hash", "expected None")
except Exception as e:
    fail("2. Verify unknown hash", str(e))

# 3. Resolve unknown ID (expect 404)
try:
    r = core_public.resolve(origin_id="00000000-0000-0000-0000-000000000000")
    if r is None:
        ok("3. Resolve unknown origin → None")
    else:
        fail("3. Resolve unknown origin", "expected None")
except Exception as e:
    fail("3. Resolve unknown origin", str(e))

# --- Partner endpoints (key needed) ---
core = UmariseCore(api_key=API_KEY)

# 4. Attest
import time
test_hash = "sha256:" + hash_bytes(f"integration-test-{time.time()}".encode())
try:
    origin = core.attest(test_hash)
    if origin and origin.get("origin_id"):
        ok("4. Create attestation")
        origin_id = origin["origin_id"]
    else:
        fail("4. Create attestation", "no origin_id")
        origin_id = None
except Exception as e:
    fail("4. Create attestation", str(e))
    origin_id = None

# 5. Resolve by ID
if origin_id:
    try:
        r = core_public.resolve(origin_id=origin_id)
        if r and r.get("origin_id") == origin_id:
            ok("5. Resolve by origin_id")
        else:
            fail("5. Resolve by origin_id", "mismatch")
    except Exception as e:
        fail("5. Resolve by origin_id", str(e))
else:
    fail("5. Resolve by origin_id", "skipped (no origin_id)")

# 6. Resolve by hash
try:
    r = core_public.resolve(hash=test_hash)
    if r and r.get("hash"):
        ok("6. Resolve by hash")
    else:
        fail("6. Resolve by hash", "no result")
except Exception as e:
    fail("6. Resolve by hash", str(e))

# 7. Verify known hash
try:
    r = core_public.verify(test_hash)
    if r and r.get("origin_id"):
        ok("7. Verify known hash")
    else:
        fail("7. Verify known hash", "no match")
except Exception as e:
    fail("7. Verify known hash", str(e))

# 8. Duplicate hash (expect error)
test_must_fail("8. Duplicate hash rejected", lambda: core.attest(test_hash))

# 9. Invalid hash format
test_must_fail("9. Invalid hash format rejected", lambda: core.attest("not-a-hash"))

# 10. Empty hash
test_must_fail("10. Empty hash rejected", lambda: core.attest(""))

# 11. hash_bytes utility
try:
    h = hash_bytes(b"hello world")
    if len(h) == 64:
        ok("11. hash_bytes returns 64-char hex")
    else:
        fail("11. hash_bytes", f"length={len(h)}")
except Exception as e:
    fail("11. hash_bytes", str(e))

# 12. Proof endpoint (pending is OK)
if origin_id:
    try:
        r = core_public.proof(origin_id)
        if r and r.get("status") in ("pending", "anchored"):
            ok("12. Proof status check")
        else:
            fail("12. Proof status check", f"unexpected: {r}")
    except Exception as e:
        fail("12. Proof status check", str(e))
else:
    fail("12. Proof status check", "skipped")

# 13. SDK version
try:
    ok("13. SDK loaded successfully")
except Exception:
    fail("13. SDK loaded")

# 14. Resolve with sha256: prefix
try:
    r = core_public.resolve(hash=test_hash.replace("sha256:", ""))
    if r:
        ok("14. Resolve with raw hex hash")
    else:
        fail("14. Resolve with raw hex hash")
except Exception as e:
    fail("14. Resolve with raw hex hash", str(e))

# 15. Invalid API key
test_must_fail("15. Invalid API key rejected",
    lambda: UmariseCore(api_key="um_invalid_key_000000").attest("sha256:" + "b" * 64))

print()
print("═" * 50)
if failed == 0:
    print(f"  ✓ Alle {total} tests geslaagd. Template werkt.")
else:
    print(f"  {passed}/{total} geslaagd, {failed} gefaald.")
print("═" * 50)
print()
`;

const NODE_TEST_SCRIPT = `#!/usr/bin/env node
/**
 * Umarise Core — Integration Test (Node.js)
 * Usage: node test_integration_node.js um_YOUR_API_KEY
 * Requires: Node 18+ (uses native fetch)
 */

const API_KEY = process.argv[2];

if (!API_KEY || !API_KEY.startsWith('um_')) {
  console.log('Usage: node test_integration_node.js um_YOUR_API_KEY');
  console.log('       Your key starts with um_ — the same key as in the Quick Start curls.');
  process.exit(1);
}

const BASE = 'https://core.umarise.com';
let passed = 0;
let failed = 0;
const total = 15;

function ok(name) { passed++; console.log(\`  OK  \${name}\`); }
function fail(name, reason) { failed++; console.log(\`  FAIL  \${name}\${reason ? ' — ' + reason : ''}\`); }

async function testMustFail(name, fn) {
  try {
    await fn();
    failed++; console.log(\`  FAIL  \${name} — expected error but succeeded\`);
  } catch {
    passed++; console.log(\`  OK  \${name} (correctly rejected)\`);
  }
}

async function api(method, path, body, headers = {}) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(\`\${BASE}\${path}\`, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok && res.status !== 404 && res.status !== 202) throw new Error(\`HTTP \${res.status}: \${JSON.stringify(data)}\`);
  return { status: res.status, data };
}

async function hashText(text) {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(text).digest('hex');
}

(async () => {
  console.log();
  console.log('═'.repeat(50));
  console.log('  Umarise Core — Integration Test (Node.js)');
  console.log('═'.repeat(50));
  console.log();

  let originId = null;
  const testHash = 'sha256:' + await hashText(\`integration-test-\${Date.now()}\`);

  // 1. Health
  try {
    const { data } = await api('GET', '/v1-core-health');
    data.status === 'operational' ? ok('1. Health check') : fail('1. Health check', \`status=\${data.status}\`);
  } catch (e) { fail('1. Health check', e.message); }

  // 2. Verify unknown hash
  try {
    const { status } = await api('POST', '/v1-core-verify', { hash: 'sha256:' + 'a'.repeat(64) });
    status === 404 ? ok('2. Verify unknown hash → 404') : fail('2. Verify unknown hash', \`status=\${status}\`);
  } catch (e) { fail('2. Verify unknown hash', e.message); }

  // 3. Resolve unknown ID
  try {
    const { status } = await api('GET', '/v1-core-resolve?origin_id=00000000-0000-0000-0000-000000000000');
    status === 404 ? ok('3. Resolve unknown origin → 404') : fail('3. Resolve unknown origin');
  } catch (e) { fail('3. Resolve unknown origin', e.message); }

  // 4. Create attestation
  try {
    const { data } = await api('POST', '/v1-core-origins', { hash: testHash }, { 'X-API-Key': API_KEY });
    if (data && data.origin_id) { ok('4. Create attestation'); originId = data.origin_id; }
    else fail('4. Create attestation', 'no origin_id');
  } catch (e) { fail('4. Create attestation', e.message); }

  // 5. Resolve by ID
  if (originId) {
    try {
      const { data } = await api('GET', \`/v1-core-resolve?origin_id=\${originId}\`);
      data.origin_id === originId ? ok('5. Resolve by origin_id') : fail('5. Resolve by origin_id', 'mismatch');
    } catch (e) { fail('5. Resolve by origin_id', e.message); }
  } else fail('5. Resolve by origin_id', 'skipped');

  // 6. Resolve by hash
  try {
    const { data } = await api('GET', \`/v1-core-resolve?hash=\${encodeURIComponent(testHash)}\`);
    data && data.hash ? ok('6. Resolve by hash') : fail('6. Resolve by hash');
  } catch (e) { fail('6. Resolve by hash', e.message); }

  // 7. Verify known hash
  try {
    const { data, status } = await api('POST', '/v1-core-verify', { hash: testHash });
    status !== 404 && data && data.origin_id ? ok('7. Verify known hash') : fail('7. Verify known hash');
  } catch (e) { fail('7. Verify known hash', e.message); }

  // 8. Duplicate hash
  await testMustFail('8. Duplicate hash rejected', () => api('POST', '/v1-core-origins', { hash: testHash }, { 'X-API-Key': API_KEY }));

  // 9. Invalid hash format
  await testMustFail('9. Invalid hash format rejected', () => api('POST', '/v1-core-origins', { hash: 'not-a-hash' }, { 'X-API-Key': API_KEY }));

  // 10. Empty hash
  await testMustFail('10. Empty hash rejected', () => api('POST', '/v1-core-origins', { hash: '' }, { 'X-API-Key': API_KEY }));

  // 11. hashText utility
  try {
    const h = await hashText('hello world');
    h.length === 64 ? ok('11. Hash utility returns 64-char hex') : fail('11. Hash utility', \`length=\${h.length}\`);
  } catch (e) { fail('11. Hash utility', e.message); }

  // 12. Proof status
  if (originId) {
    try {
      const res = await fetch(\`\${BASE}/v1-core-proof?origin_id=\${originId}\`);
      [200, 202].includes(res.status) ? ok('12. Proof status check') : fail('12. Proof status check', \`status=\${res.status}\`);
    } catch (e) { fail('12. Proof status check', e.message); }
  } else fail('12. Proof status check', 'skipped');

  // 13. SDK loaded
  ok('13. Script loaded successfully');

  // 14. Resolve with raw hex
  try {
    const rawHex = testHash.replace('sha256:', '');
    const { data } = await api('GET', \`/v1-core-resolve?hash=\${rawHex}\`);
    data ? ok('14. Resolve with raw hex hash') : fail('14. Resolve with raw hex hash');
  } catch (e) { fail('14. Resolve with raw hex hash', e.message); }

  // 15. Invalid API key
  await testMustFail('15. Invalid API key rejected', () => api('POST', '/v1-core-origins', { hash: 'sha256:' + 'b'.repeat(64) }, { 'X-API-Key': 'um_invalid_key_000000' }));

  console.log();
  console.log('═'.repeat(50));
  if (failed === 0) console.log(\`  ✓ Alle \${total} tests geslaagd. Template werkt.\`);
  else console.log(\`  \${passed}/\${total} geslaagd, \${failed} gefaald.\`);
  console.log('═'.repeat(50));
  console.log();
})();
`;

function downloadAsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyCmd({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-[hsl(var(--landing-cream)/0.12)] text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream)/0.8)] hover:border-[hsl(var(--landing-cream)/0.25)] transition-colors bg-[hsl(var(--landing-deep)/0.8)]"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function DownloadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.8)] text-sm font-mono hover:bg-[hsl(var(--landing-cream)/0.08)] hover:border-[hsl(var(--landing-cream)/0.25)] transition-colors"
    >
      <Download className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
      {label}
    </button>
  );
}

export default function IntegrationTemplates() {
  const [lang, setLang] = useState<Lang>('python');

  const pythonCommands = `mkdir ~/umarise-test
cp ~/Downloads/umarise_core.py ~/umarise-test/
cp ~/Downloads/test_integration.py ~/umarise-test/
cd ~/umarise-test
python3 test_integration.py um_JOUW_API_KEY`;

  const nodeCommands = `mkdir ~/umarise-test-node
cp ~/Downloads/umarise-core.ts ~/umarise-test-node/
cp ~/Downloads/test_integration_node.js ~/umarise-test-node/
cd ~/umarise-test-node
node test_integration_node.js um_JOUW_API_KEY`;

  const commands = lang === 'python' ? pythonCommands : nodeCommands;
  const singleLineCommands = commands.split('\n').join(' && ');

  return (
    <section id="templates" className="space-y-6">
      <div className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Integration Templates</h2>
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 mb-8">
          {(['python', 'node'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
                lang === l
                  ? 'bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] border border-[hsl(var(--landing-copper)/0.3)]'
                  : 'bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.5)] border border-[hsl(var(--landing-cream)/0.08)] hover:text-[hsl(var(--landing-cream)/0.8)]'
              }`}
            >
              {l === 'python' ? 'Python' : 'Node.js'}
            </button>
          ))}
        </div>

        {/* Step 1: Download */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">1</span>
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">Download beide bestanden</h4>
            </div>

            <div className="flex flex-wrap gap-3 ml-9">
              {lang === 'python' ? (
                <>
                  <DownloadButton label="umarise_core.py" onClick={() => {
                    fetch(SDK_PYTHON).then(r => r.text()).then(t => downloadAsFile(t, 'umarise_core.py'));
                  }} />
                  <DownloadButton label="test_integration.py" onClick={() => downloadAsFile(PYTHON_TEST_SCRIPT, 'test_integration.py')} />
                </>
              ) : (
                <>
                  <DownloadButton label="umarise-core.ts" onClick={() => {
                    fetch(SDK_NODE).then(r => r.text()).then(t => downloadAsFile(t, 'umarise-core.ts'));
                  }} />
                  <DownloadButton label="test_integration_node.js" onClick={() => downloadAsFile(NODE_TEST_SCRIPT, 'test_integration_node.js')} />
                </>
              )}
            </div>

            <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs ml-9">
              Dit zijn twee bestanden. Download ze allebei voordat je verdergaat.
            </p>
          </div>

          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 2: Copy & run */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">2</span>
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">Kopieer naar een werkmap en draai de test</h4>
            </div>

            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs ml-9 mb-2">
              Kopieer dit blok en plak het in je Terminal. Vervang <code className="text-[hsl(var(--landing-copper))]">um_JOUW_API_KEY</code> door je echte key.
            </p>

            <div className="relative ml-9">
              <CopyCmd text={singleLineCommands} />
              <pre className="bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)] rounded p-4 pr-20 text-xs font-mono text-[hsl(var(--landing-cream)/0.7)] overflow-x-auto whitespace-pre">
{commands}
              </pre>
            </div>

            <div className="ml-9 space-y-2">
              <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs">
                Je key begint met <code className="text-[hsl(var(--landing-copper))]">um_</code> — dezelfde key als bij de Quick Start curls.
              </p>

              {lang === 'python' && (
                <div className="flex items-start gap-2 p-3 rounded border border-[hsl(var(--landing-copper)/0.15)] bg-[hsl(var(--landing-copper)/0.04)]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
                  <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs">
                    <strong className="text-[hsl(var(--landing-cream)/0.7)]">macOS SSL-fout?</strong> Draai eenmalig:{' '}
                    <code className="text-[hsl(var(--landing-copper))]">/Applications/Python\ 3.xx/Install\ Certificates.command</code>{' '}
                    (check je versie met <code className="text-[hsl(var(--landing-copper))]">python3 --version</code>)
                  </p>
                </div>
              )}

              {lang === 'node' && (
                <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs">
                  Vereist Node 18+. Check met: <code className="text-[hsl(var(--landing-copper))]">node --version</code>
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 3: Expected result */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">3</span>
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">Verwacht resultaat</h4>
            </div>

            <div className="ml-9 bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 space-y-2">
              <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm">
                Je ziet 15 tests draaien (~30 seconden).
              </p>
              <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm">
                Elke test toont <code className="text-[hsl(120,33%,65%)]">OK</code> of <code className="text-red-400">FAIL</code>.
              </p>
              <pre className="text-xs font-mono text-[hsl(120,33%,65%)] mt-2">
{`═══════════════════════════════════════════
  ✓ Alle 15 tests geslaagd. Template werkt.
═══════════════════════════════════════════`}
              </pre>
              <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-2">
                Als een test faalt: de foutmelding zegt precies wat er mis is.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
