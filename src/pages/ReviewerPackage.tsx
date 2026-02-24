import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, ExternalLink, Shield, Lock, Binary, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const fade = (i: number) => ({ delay: 0.04 + i * 0.04 });

export default function ReviewerPackage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText('https://umarise.com/reviewer');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.08)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-cream))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg text-[hsl(var(--landing-cream)/0.8)]">
            Umarise
          </span>
        </div>
        <div className="max-w-3xl mx-auto px-6 pb-10 pt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[hsl(var(--landing-muted))] text-sm uppercase tracking-[0.2em] mb-3">
              External Review Program
            </p>
            <h1 className="text-4xl font-serif text-[hsl(var(--landing-cream))] mb-3">
              Reviewer Package
            </h1>
            <p className="text-[hsl(var(--landing-cream)/0.6)]">
              Everything needed to independently evaluate Umarise Core v1.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-14">
        {/* Share URL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(0)}
          className="flex items-center gap-3 px-4 py-3 rounded border border-[hsl(var(--landing-cream)/0.08)]"
        >
          <span className="text-[hsl(var(--landing-muted))] text-sm">Share:</span>
          <code className="text-[hsl(var(--landing-copper))] text-sm flex-1 truncate font-mono">
            https://umarise.com/reviewer
          </code>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-copper))] shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Objective */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(1)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Objective</h2>
          <div className="space-y-4 text-[hsl(var(--landing-cream)/0.75)] leading-relaxed">
            <p>
              Subject the Umarise Core v1 implementation to independent, adversarial technical review 
              before broader adoption.
            </p>
            <div className="p-4 rounded border border-[hsl(var(--landing-copper)/0.2)] bg-[hsl(var(--landing-copper)/0.04)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-serif italic">
                "A primitive becomes infrastructure only after it survives an attack."
              </p>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.5)]">
              The assignment: try to break it. Not the UX, not the marketing. 
              The semantics, the verification, the API, the proof chain.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.5)]">
              Ask explicitly: <span className="text-[hsl(var(--landing-copper))]">"Where does this break?"</span>
            </p>
          </div>
        </motion.section>

        {/* Materials */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(2)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Materials</h2>
          <div className="space-y-0 rounded border border-[hsl(var(--landing-cream)/0.08)] divide-y divide-[hsl(var(--landing-cream)/0.08)]">
            <MaterialLink title="Technical Specification" description="Normative definition of an Anchor Record" href="/legal" internal />
            <MaterialLink title="Core API Reference" description="v1 stable interface, endpoints, and access model" href="/core" internal />
            <MaterialLink title="Technical Review Kit" description="Stack-level documentation with live API tester" href="/review" internal />
            <MaterialLink title="Verification Tool" description="Independent proof verification (client-side)" href="/verify" internal />
            <MaterialLink title="Anchor One-Pager" description="When and why anchor attestation is correct" href="/anchor" internal />
            <MaterialLink title="Why This Exists" description="The problem statement and category definition" href="/why" internal />
          </div>
          <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-4 font-mono">
            Shared review documents (provided with briefing): Threat Model, Data Flow Diagram, Trust Assumptions
          </p>
        </motion.section>

        {/* API Access */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(3)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">API Access</h2>
          <div className="space-y-4 text-[hsl(var(--landing-cream)/0.75)]">
            <p>Public endpoints require no authentication. Test them now:</p>
            <div className="font-mono text-sm space-y-2">
              <div className="p-3 rounded bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)]">
                <span className="text-[hsl(var(--landing-muted))]">$</span>{' '}
                <span className="text-[hsl(var(--landing-cream)/0.9)]">curl https://core.umarise.com/v1-core-health</span>
              </div>
              <div className="p-3 rounded bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)]">
                <span className="text-[hsl(var(--landing-muted))]">$</span>{' '}
                <span className="text-[hsl(var(--landing-cream)/0.9)]">curl -X POST https://core.umarise.com/v1-core-verify \</span>
                <br />
                <span className="text-[hsl(var(--landing-cream)/0.9)] pl-4">  -H "Content-Type: application/json" \</span>
                <br />
                <span className="text-[hsl(var(--landing-cream)/0.9)] pl-4">  -d '{`{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}`}'</span>
              </div>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">
              Partner API key for attestation testing: request via{' '}
              <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:text-[hsl(var(--landing-copper)/0.8)]">
                partners@umarise.com
              </a>
            </p>
          </div>
        </motion.section>

        {/* Verify Flow */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(4)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Verification Flow</h2>
          <div className="space-y-4 text-[hsl(var(--landing-cream)/0.75)]">
            <p>Two independent verification paths:</p>
            <div className="grid gap-3">
              <div className="p-4 rounded border border-[hsl(var(--landing-cream)/0.08)]">
                <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-2">
                  Path 1: Web Verification
                </p>
                <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm mb-2">
                  Upload an Anchor ZIP to{' '}
                  <a href="https://anchoring.app/verify" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--landing-copper))]">anchoring.app/verify</a>.
                  Client-side hashing (Web Crypto API), no bytes leave the device.
                </p>
              </div>
              <div className="p-4 rounded border border-[hsl(var(--landing-cream)/0.08)]">
                <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-2">
                  Path 2: CLI Verification (No Umarise Required)
                </p>
                <div className="font-mono text-sm text-[hsl(var(--landing-cream)/0.7)] space-y-1">
                  <p><span className="text-[hsl(var(--landing-muted))]">#</span> Extract ZIP, recompute hash of artifact</p>
                  <p>sha256sum artifact.jpg</p>
                  <p><span className="text-[hsl(var(--landing-muted))]">#</span> Compare with hash in certificate.json</p>
                  <p><span className="text-[hsl(var(--landing-muted))]">#</span> Verify .ots proof against Bitcoin</p>
                  <p>ots verify proof.ots</p>
                </div>
              </div>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">
              Path 2 requires zero Umarise infrastructure. Only the ZIP, the original artifact, and an OTS-compatible tool.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mt-2">
              Umarise uses the Bitcoin blockchain as a public, immutable timestamp ledger — not as a currency. No wallets, no coins, no financial transactions.
            </p>
          </div>
        </motion.section>

        {/* Standalone Verification */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(5)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Standalone Verification Script</h2>
          <div className="space-y-4 text-[hsl(var(--landing-cream)/0.75)]">
            <p>
              Zero-dependency bash script. Requires only <code className="text-[hsl(var(--landing-copper))]">sha256sum</code>, <code className="text-[hsl(var(--landing-copper))]">unzip</code>, and <code className="text-[hsl(var(--landing-copper))]">jq</code>.
            </p>
            <div className="font-mono text-xs leading-relaxed p-4 rounded bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)] overflow-x-auto">
              <pre className="text-[hsl(var(--landing-cream)/0.8)]">{`#!/bin/bash
# verify-anchor.sh — Independent Anchor ZIP verification
# Usage: ./verify-anchor.sh <anchor.zip>

set -euo pipefail

ZIP="\${1:?Usage: ./verify-anchor.sh <anchor.zip>}"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "→ Extracting ZIP..."
unzip -q "$ZIP" -d "$TMPDIR"

# Find artifact
ARTIFACT=$(find "$TMPDIR" -name 'artifact.*' | head -1)
[ -z "$ARTIFACT" ] && { echo "✗ No artifact found"; exit 1; }

# Read expected hash from certificate.json
CERT="$TMPDIR/certificate.json"
[ -f "$CERT" ] || { echo "✗ No certificate.json"; exit 1; }

EXPECTED=$(jq -r '.hash' "$CERT" | sed 's/^sha256://')
ORIGIN_ID=$(jq -r '.origin_id' "$CERT")
CAPTURED=$(jq -r '.captured_at' "$CERT")

# Compute actual hash
ACTUAL=$(sha256sum "$ARTIFACT" | cut -d' ' -f1)

echo "  Origin ID:   $ORIGIN_ID"
echo "  Captured at: $CAPTURED"
echo "  Expected:    $EXPECTED"
echo "  Computed:    $ACTUAL"
echo ""

if [ "$EXPECTED" = "$ACTUAL" ]; then
  echo "✓ Hash matches — artifact is intact"
else
  echo "✗ HASH MISMATCH — artifact modified"
  exit 1
fi

# Check for .ots proof
OTS=$(find "$TMPDIR" -name '*.ots' | head -1)
if [ -n "$OTS" ]; then
  echo "✓ OTS proof found: $(basename $OTS)"
  echo "  Verify with: ots verify $OTS"
else
  echo "⚠ No .ots proof (pending anchoring)"
  echo "  Retrieve later: GET /v1-core-proof?origin_id=$ORIGIN_ID"
fi`}</pre>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm mt-6 mb-3">
              Python alternative <span className="text-[hsl(var(--landing-cream)/0.5)] font-normal">(zero dependencies, stdlib only)</span>
            </p>
            <div className="font-mono text-xs leading-relaxed p-4 rounded bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)] overflow-x-auto">
              <pre className="text-[hsl(var(--landing-cream)/0.8)]">{`#!/usr/bin/env python3
# verify-anchor.py — Independent Anchor ZIP verification
# Usage: python verify-anchor.py <anchor.zip>

import sys, os, json, hashlib, zipfile, tempfile, shutil

def main():
    zip_path = sys.argv[1] if len(sys.argv) > 1 else sys.exit("Usage: python verify-anchor.py <anchor.zip>")
    tmpdir = tempfile.mkdtemp()
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(tmpdir)

        artifact = next((os.path.join(tmpdir, f) for f in os.listdir(tmpdir) if f.startswith("artifact.")), None)
        if not artifact: sys.exit("✗ No artifact found")

        with open(os.path.join(tmpdir, "certificate.json")) as f:
            cert = json.load(f)

        expected = cert["hash"].removeprefix("sha256:")
        sha = hashlib.sha256()
        with open(artifact, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha.update(chunk)
        actual = sha.hexdigest()

        print(f"  Origin ID:   {cert['origin_id']}")
        print(f"  Expected:    {expected}")
        print(f"  Computed:    {actual}")
        print("✓ Hash matches" if expected == actual else "✗ HASH MISMATCH")
        if expected != actual: sys.exit(1)

        ots = next((f for f in os.listdir(tmpdir) if f.endswith(".ots")), None)
        print(f"✓ OTS proof: {ots}" if ots else "⚠ No .ots proof (pending)")
    finally:
        shutil.rmtree(tmpdir)

if __name__ == "__main__":
    main()`}</pre>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mt-4">
              Both scripts use no Umarise infrastructure. They verify independently without any Umarise dependency.
            </p>
          </div>
        </motion.section>

        {/* Sample Anchor ZIP */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(6)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Sample Anchor ZIP</h2>
          <div className="space-y-4 text-[hsl(var(--landing-cream)/0.75)]">
            <p>
              An Anchor ZIP is a self-contained evidence bundle. Its canonical structure:
            </p>
            <div className="font-mono text-sm p-4 rounded bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)]">
              <pre className="text-[hsl(var(--landing-cream)/0.7)]">{`anchor-<origin_id>.zip
├── artifact.jpg          # Original file (any format)
├── certificate.json      # Origin record metadata
│   ├── origin_id         # UUID
│   ├── hash              # "sha256:<hex>"
│   ├── captured_at       # ISO 8601 timestamp
│   └── verify_url        # https://anchoring.app/verify
├── VERIFY.txt            # Human-readable instructions
└── proof.ots             # OpenTimestamps binary (if anchored)`}</pre>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">
              Request a sample ZIP via{' '}
              <a href="mailto:partners@umarise.com?subject=Sample%20Anchor%20ZIP%20request" className="text-[hsl(var(--landing-copper))] hover:text-[hsl(var(--landing-copper)/0.8)]">
                partners@umarise.com
              </a>
              , or generate one using the{' '}
              <Link to="/verify" className="text-[hsl(var(--landing-copper))] hover:text-[hsl(var(--landing-copper)/0.8)]">
                verification tool
              </Link>.
            </p>
          </div>
        </motion.section>

        {/* Five Review Layers */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(11)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Five Review Layers</h2>
          <div className="space-y-4">
            <ReviewLayer
              number={1}
              icon={<Binary className="w-4 h-4" />}
              title="Cryptographic Layer"
              question="Does the implementation prove byte-specific existence correctly under all realistic cryptographic conditions?"
              items={[
                'SHA-256 handling correctness',
                'Byte encoding and normalization',
                'Digest representation integrity',
                'OpenTimestamps proof parsing',
                'Confirmation depth logic',
                'Reorg edge cases',
              ]}
              note="No new cryptography is introduced. The review validates correct use of existing primitives."
            />
            <ReviewLayer
              number={2}
              icon={<Lock className="w-4 h-4" />}
              title="Ledger Operations"
              question="Does anchoring remain consistent under real-world ledger and infrastructure failure scenarios?"
              items={[
                'Bitcoin node synchronization',
                'Chain reorganization handling',
                'OTS batching reliability',
                'Failure recovery logic',
                'Fee volatility resilience',
              ]}
            />
            <ReviewLayer
              number={3}
              icon={<Shield className="w-4 h-4" />}
              title="Write-Once Integrity"
              question="Can an anchored record be modified, replaced, or made internally inconsistent?"
              items={[
                'Immutability enforcement (DB triggers)',
                'origin_id collision risks',
                'Race condition handling',
                'Concurrent writes',
                'Proof-state consistency',
              ]}
              note="3,624 attestations in production (652 from load test, remainder from integration testing and self-tests). 131 duplicates removed via unique constraint enforcement. Duplicate hash prevention enforced: unique constraint on (hash, api_key_id), returns 409 DUPLICATE_HASH. Cross-partner attestations of the same hash remain allowed. Records created under sustained pressure (14 req/sec, 34 max VUs), not deleted, not mutated, not overwritten. Reviewers can verify this independently."
            />
            <ReviewLayer
              number={4}
              icon={<FileText className="w-4 h-4" />}
              title="Semantic Boundary"
              question='Do public statements exceed what the primitive formally proves?'
              items={[
                '"Existed at or before" formulation',
                'Economic finality language',
                'Ledger qualification phrasing',
                'Non-goals formulation',
                'Absence of implicit legal or identity claims',
              ]}
              note="Anchoring establishes existence. It does not establish identity, authorship, ownership, originality, or legal validity."
            />
            <ReviewLayer
              number={5}
              icon={<Eye className="w-4 h-4" />}
              title="Verification Independence"
              question="Can someone without any Umarise dependency verify a proof with only the ZIP and an OTS-compatible tool?"
              items={[
                'Full verification without Umarise infrastructure',
                'Full verification without anchoring.app/verify',
                'Only ZIP + OTS tool + original artifact',
                'CLI verification path documented and working',
              ]}
              note="This is the core promise. If this layer fails, everything fails."
            />
          </div>
        </motion.section>

        {/* Load Test Evidence */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(12)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Empirical Evidence</h2>
          <p className="text-[hsl(var(--landing-cream)/0.6)] mb-6">
            k6 load test results. Not architectural claims, measured data.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-4">
                Public Endpoints
              </p>
              <div className="space-y-2 text-sm text-[hsl(var(--landing-cream)/0.6)]">
                <MetricRow label="Sustained throughput" value="~14 req/sec" />
                <MetricRow label="Peak VUs" value="34" />
                <MetricRow label="Resolve P95" value="508–531ms" />
                <MetricRow label="Verify P95" value="568–621ms" />
                <MetricRow label="Origins P95" value="317–362ms" />
                <MetricRow label="Custom checks passed" value="99.41–99.54%" />
              </div>
            </div>
            <div className="p-5 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-4">
                B2B Round-Trip (Create → Resolve → Verify)
              </p>
              <div className="space-y-2 text-sm text-[hsl(var(--landing-cream)/0.6)]">
                <MetricRow label="Max VUs" value="10" />
                <MetricRow label="Iterations" value="661" />
                <MetricRow label="Complete cycles" value="646" />
                <MetricRow label="Attestations created" value="652" />
                <MetricRow label="Attest P95" value="788ms" />
                <MetricRow label="Checks passed" value="99.73%" />
                <MetricRow label="HTTP failures" value="0%" />
              </div>
            </div>
          </div>
          <p className="text-[hsl(var(--landing-cream)/0.4)] text-sm mt-4">
            DB-persistent rate limiting active during all tests. All custom thresholds passed.
          </p>

          {/* Self-Test Results */}
          <div className="mt-8 p-5 rounded border border-[hsl(var(--landing-cream)/0.08)]">
            <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-4">
              Self-Test Results (17 Feb 2026)
            </p>
            <div className="space-y-2 text-sm text-[hsl(var(--landing-cream)/0.6)]">
              <MetricRow label="Internal tests executed" value="47" />
              <MetricRow label="Tests passed" value="47" />
              <MetricRow label="Production attestations" value="3,624" />
              <MetricRow label="Duplicates removed" value="131" />
            </div>
            <div className="mt-4 pt-4 border-t border-[hsl(var(--landing-cream)/0.06)] space-y-2 text-sm text-[hsl(var(--landing-cream)/0.6)]">
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-xs uppercase tracking-wider mb-2">Findings</p>
              <p>• Health endpoint DB check resolved: 500ms timeout, returns <code className="text-[hsl(var(--landing-copper))]">"database": "unreachable"</code> on 503.</p>
              <p>• Trigger bypass via superuser migration: documented, inherent to PostgreSQL. Write-once is application-layer enforcement, not cryptographic. OTS anchoring provides independent detection.</p>
              <p className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-xs uppercase tracking-wider mt-4 mb-2">Independent Verification</p>
              <p>• OTS proof merkle root matches Bitcoin block 937057 merkle root. Exact match via Blockstream API, zero Umarise involvement.</p>
              <p>• Cross-partner duplicate test confirmed: same-partner returns 409 DUPLICATE_HASH, cross-partner returns 201 Created.</p>
            </div>
          </div>
        </motion.section>

        {/* Security Hardening */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(7)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Infrastructure Hardening</h2>
          <div className="space-y-2">
            <HardeningRow label="CORS lock" status="All App-layer functions locked to anchoring.app, umarise.com, *.lovable.app" />
            <HardeningRow label="Core API CORS" status="Wildcard (*) for B2B partner compatibility" />
            <HardeningRow label="Rate limiting" status="DB-persistent on all endpoints. Origins: 100/window, Verify: 1,000/window, Resolve: 1,000/window. Headers in every response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset." />
            <HardeningRow label="RLS lockdown" status="7 sensitive tables: USING(false), proxy-only access" />
            <HardeningRow label="Write-once triggers" status="origin_attestations, core_ots_proofs, partner_api_keys" />
            <HardeningRow label="DDL audit" status="Schema changes logged in append-only audit table" />
            <HardeningRow label="Privacy" status="No PII, no accounts, hashed IPs, device-isolated" />
            <HardeningRow label="Security scan" status="13 findings reviewed, all Ignored/By Design" />
          </div>
        </motion.section>

        {/* Interpretation */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(8)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">Interpretation of Results</h2>
          <div className="space-y-3 text-[hsl(var(--landing-cream)/0.7)]">
            <div className="flex gap-4 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <span className="text-[hsl(var(--landing-copper))] font-mono text-sm shrink-0">→</span>
              <p>Reviewer can verify independently: primitive and tooling are clear.</p>
            </div>
            <div className="flex gap-4 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <span className="text-[hsl(var(--landing-copper))] font-mono text-sm shrink-0">→</span>
              <p>Reviewer needs explanation: friction is in documentation or UX.</p>
            </div>
          </div>
        </motion.section>

        {/* What this is NOT */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade(9)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">What This Is Not</h2>
          <ul className="space-y-1 text-[hsl(var(--landing-cream)/0.5)] text-sm">
            <li>Not a marketing audit</li>
            <li>Not a compliance certification</li>
            <li>Not a regulatory endorsement</li>
            <li>Not a security badge exercise</li>
          </ul>
          <p className="text-[hsl(var(--landing-cream)/0.6)] mt-4">
            Reviews are: independent, adversarial, minimal-scope, documented.
            The goal is failure discovery, not feature expansion.
          </p>
        </motion.section>

        {/* Contact */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={fade(10)}
          className="pt-10 border-t border-[hsl(var(--landing-cream)/0.08)] text-center space-y-2"
        >
          <p className="text-[hsl(var(--landing-muted))] text-sm">
            Umarise Core v1. Stable, Immutable Interface.
          </p>
          <p className="text-[hsl(var(--landing-cream)/0.3)] text-xs">
            Contact:{' '}
            <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper)/0.6)] hover:text-[hsl(var(--landing-copper))]">
              partners@umarise.com
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function MaterialLink({ title, description, href, internal }: {
  title: string;
  description: string;
  href: string;
  internal?: boolean;
}) {
  const content = (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-[hsl(var(--landing-cream)/0.02)] transition-colors">
      <div>
        <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium">{title}</p>
        <p className="text-[hsl(var(--landing-muted))] text-xs mt-0.5">{description}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--landing-muted))] shrink-0" />
    </div>
  );

  return internal ? (
    <Link to={href}>{content}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
  );
}

function ReviewLayer({ number, icon, title, question, items, note }: {
  number: number;
  icon: React.ReactNode;
  title: string;
  question: string;
  items: string[];
  note?: string;
}) {
  return (
    <div className="rounded border border-[hsl(var(--landing-cream)/0.08)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
        <div className="w-6 h-6 rounded bg-[hsl(var(--landing-copper)/0.12)] flex items-center justify-center text-[hsl(var(--landing-copper))]">
          {icon}
        </div>
        <span className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium">
          {number}. {title}
        </span>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-[hsl(var(--landing-copper))] text-sm italic">
          {question}
        </p>
        <ul className="space-y-1 text-[hsl(var(--landing-cream)/0.6)] text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[hsl(var(--landing-muted))]">·</span>
              {item}
            </li>
          ))}
        </ul>
        {note && (
          <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-2 pt-2 border-t border-[hsl(var(--landing-cream)/0.06)]">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[hsl(var(--landing-cream)/0.5)]">{label}</span>
      <span className="text-[hsl(var(--landing-cream)/0.9)] font-mono">{value}</span>
    </div>
  );
}

function HardeningRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex gap-3 p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] text-sm">
      <Check className="w-4 h-4 text-[hsl(var(--landing-copper))] shrink-0 mt-0.5" />
      <div>
        <span className="text-[hsl(var(--landing-cream)/0.9)]">{label}</span>
        <span className="text-[hsl(var(--landing-muted))] ml-2">{status}</span>
      </div>
    </div>
  );
}
