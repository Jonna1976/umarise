import { useState } from 'react';
import { Terminal, Download, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { CopyBlock, CodeTabs } from './shared';

const FIRST_RUN_BASH = `#!/bin/bash
# Umarise Core — First Run
# Usage: bash first-run.sh YOUR_API_KEY
# Requires: curl, sha256sum (or shasum on macOS)

set -e

API_KEY="\${1:?Usage: bash first-run.sh YOUR_API_KEY}"
BASE="https://core.umarise.com"

echo ""
echo "═══════════════════════════════════════════"
echo "  Umarise Core — First Run"
echo "═══════════════════════════════════════════"
echo ""

# Step 1: Health check
echo "1. Checking API health..."
HEALTH=$(curl -s "$BASE/v1-core-health")
STATUS=$(echo "$HEALTH" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "operational" ]; then
  echo "   ✓ API is operational"
else
  echo "   ✗ API returned: $HEALTH"
  exit 1
fi

# Step 2: Create a test hash
echo ""
echo "2. Creating test hash..."
TEST_STRING="umarise-first-run-$(date +%s)"

if command -v sha256sum &> /dev/null; then
  HASH=$(echo -n "$TEST_STRING" | sha256sum | cut -d' ' -f1)
elif command -v shasum &> /dev/null; then
  HASH=$(echo -n "$TEST_STRING" | shasum -a 256 | cut -d' ' -f1)
else
  echo "   ✗ No sha256sum or shasum found"
  exit 1
fi

echo "   Input:  \\"$TEST_STRING\\""
echo "   SHA-256: $HASH"

# Step 3: Create attestation
echo ""
echo "3. Creating attestation..."
RESULT=$(curl -s -X POST "$BASE/v1-core-origins" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $API_KEY" \\
  -d "{\\"hash\\": \\"sha256:$HASH\\"}")

if echo "$RESULT" | grep -q '"error"'; then
  echo "   ✗ Error: $RESULT"
  exit 1
fi

ORIGIN_ID=$(echo "$RESULT" | grep -o '"origin_id":"[^"]*"' | cut -d'"' -f4)
echo "   ✓ Attestation created"
echo "   origin_id: $ORIGIN_ID"

# Step 4: Verify
echo ""
echo "4. Verifying hash..."
VERIFY=$(curl -s -X POST "$BASE/v1-core-verify" \\
  -H "Content-Type: application/json" \\
  -d "{\\"hash\\": \\"sha256:$HASH\\"}")

if echo "$VERIFY" | grep -q '"origin_id"'; then
  echo "   ✓ Hash verified — match found"
else
  echo "   ✗ Verification failed: $VERIFY"
  exit 1
fi

# Step 5: Resolve
echo ""
echo "5. Resolving by origin_id..."
RESOLVE=$(curl -s "$BASE/v1-core-resolve?origin_id=$ORIGIN_ID")

if echo "$RESOLVE" | grep -q '"origin_id"'; then
  echo "   ✓ Origin resolved successfully"
else
  echo "   ✗ Resolution failed: $RESOLVE"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  ✓ All checks passed"
echo "  Next: curl \\"$BASE/v1-core-proof?origin_id=$ORIGIN_ID\\" -o proof.ots"
echo "═══════════════════════════════════════════"`;

const FIRST_RUN_PYTHON = `#!/usr/bin/env python3
"""Umarise Core — First Run
Usage: python first-run.py YOUR_API_KEY
Requires: Python 3.8+, no external dependencies
"""

import sys, hashlib, json, time
from urllib.request import Request, urlopen

BASE = "https://core.umarise.com"

def api_get(path):
    with urlopen(Request(f"{BASE}{path}"), timeout=15) as resp:
        return json.loads(resp.read())

def api_post(path, data, api_key=None):
    body = json.dumps(data).encode()
    req = Request(f"{BASE}{path}", data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    if api_key:
        req.add_header("X-API-Key", api_key)
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def main():
    if len(sys.argv) < 2:
        print("Usage: python first-run.py YOUR_API_KEY")
        sys.exit(1)

    api_key = sys.argv[1]
    print("\\n" + "═" * 45)
    print("  Umarise Core — First Run")
    print("═" * 45 + "\\n")

    # 1. Health
    print("1. Checking API health...")
    health = api_get("/v1-core-health")
    assert health["status"] == "operational"
    print("   ✓ API is operational")

    # 2. Hash
    print("\\n2. Creating test hash...")
    test_string = f"umarise-first-run-{int(time.time())}"
    hash_hex = hashlib.sha256(test_string.encode()).hexdigest()
    print(f"   SHA-256: {hash_hex}")

    # 3. Attest
    print("\\n3. Creating attestation...")
    result = api_post("/v1-core-origins", {"hash": f"sha256:{hash_hex}"}, api_key)
    print(f"   ✓ origin_id: {result['origin_id']}")

    # 4. Verify
    print("\\n4. Verifying hash...")
    verify = api_post("/v1-core-verify", {"hash": f"sha256:{hash_hex}"})
    assert "origin_id" in verify
    print("   ✓ Hash verified")

    # 5. Resolve
    print("\\n5. Resolving...")
    resolve = api_get(f"/v1-core-resolve?origin_id={result['origin_id']}")
    assert "origin_id" in resolve
    print("   ✓ Origin resolved")

    print("\\n" + "═" * 45)
    print("  ✓ All checks passed. Integration ready.")
    print("═" * 45 + "\\n")

if __name__ == "__main__":
    main()`;

function downloadAsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function QuickStartSection() {
  const [showScripts, setShowScripts] = useState(false);

  return (
    <section id="quick-start" className="space-y-8">
      {/* Quick Start Card */}
      <div className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Quick Start</h2>
          <span className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono ml-auto">~5 min to first attestation</span>
        </div>

        <div className="space-y-3">
          {[
            { step: '1', label: 'Get API key', detail: 'partners@umarise.com' },
            { step: '2', label: 'Run first-run script', detail: 'bash first-run.sh KEY' },
            { step: '3', label: 'Install SDK', detail: 'copy umarise-core.ts' },
            { step: '4', label: 'Integrate', detail: 'one SDK call per event' },
            { step: '5', label: 'Verify', detail: 'umarise.com/verify' },
          ].map(({ step, label, detail }) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-[10px] font-mono font-bold shrink-0">{step}</span>
              <span className="text-[hsl(var(--landing-cream)/0.8)] font-medium">{label}</span>
              <ArrowRight className="w-3 h-3 text-[hsl(var(--landing-cream)/0.2)]" />
              <code className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono">{detail}</code>
            </div>
          ))}
        </div>

        <p className="text-[hsl(var(--landing-cream)/0.3)] text-xs mt-4 font-mono">
          Time to full integration: ~2–4 hours (measured during PoC)
        </p>
      </div>

      {/* First-Run Scripts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[hsl(var(--landing-cream)/0.5)]" />
            <h3 className="text-lg font-serif text-[hsl(var(--landing-cream))]">First-Run Scripts</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadAsFile(FIRST_RUN_BASH, 'first-run.sh')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream))] bg-[hsl(var(--landing-cream)/0.04)] hover:bg-[hsl(var(--landing-cream)/0.08)] transition-colors"
            >
              <Download className="w-3 h-3" /> .sh
            </button>
            <button
              onClick={() => downloadAsFile(FIRST_RUN_PYTHON, 'first-run.py')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream))] bg-[hsl(var(--landing-cream)/0.04)] hover:bg-[hsl(var(--landing-cream)/0.08)] transition-colors"
            >
              <Download className="w-3 h-3" /> .py
            </button>
          </div>
        </div>

        <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-4">
          Copy, paste, run. No dependencies. See your first attestation in 60 seconds.
        </p>

        <CodeTabs examples={{
          curl: `# One-liner: health check + attest + verify
bash first-run.sh YOUR_API_KEY

# Expected output:
# ═══════════════════════════════════════════
#   Umarise Core — First Run
# ═══════════════════════════════════════════
# 1. Checking API health...   ✓ API is operational
# 2. Creating test hash...    SHA-256: a1b2c3...
# 3. Creating attestation...  ✓ origin_id: uuid
# 4. Verifying hash...        ✓ Hash verified
# 5. Resolving...             ✓ Origin resolved
# ═══════════════════════════════════════════
#   ✓ All checks passed`,
          node: `// Or use Node.js directly:
import { UmariseCore } from './umarise-core';
import { createHash } from 'crypto';

const core = new UmariseCore({ apiKey: 'um_your_key' });

// 1. Health
const health = await core.health();
console.log('API:', health.status);

// 2. Hash + Attest
const hash = createHash('sha256').update('test-data').digest('hex');
const origin = await core.attest(\`sha256:\${hash}\`);
console.log('origin_id:', origin.origin_id);

// 3. Verify round-trip
const verified = await core.verify(\`sha256:\${hash}\`);
console.log('Verified:', verified !== null);`,
          python: `# Or use Python directly:
python first-run.py YOUR_API_KEY

# Or inline:
from umarise_core import UmariseCore, hash_bytes

core = UmariseCore(api_key="um_your_key")

# 1. Health
health = core.health()
print("API:", health.status)

# 2. Hash + Attest
import hashlib
h = hashlib.sha256(b"test-data").hexdigest()
origin = core.attest(f"sha256:{h}")
print("origin_id:", origin.origin_id)

# 3. Verify round-trip
verified = core.verify(f"sha256:{h}")
print("Verified:", verified is not None)`,
        }} />
      </div>
    </section>
  );
}
