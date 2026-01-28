/**
 * CTO Review Kit
 * 
 * Shareable page for technical reviewers containing:
 * - Origin View demo link
 * - Proof Bundle download
 * - Embedded technical documentation
 * 
 * Route: /review
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Terminal
} from 'lucide-react';
import { ApiTester } from '@/components/codex/ApiTester';
import { Button } from '@/components/ui/button';

// Embedded documentation content
const INTEGRATION_CONTRACT = `# Integration Contract — Origin Record Layer API v1

> External systems: this is what you need to implement to use Umarise as an origin record layer.  
> No app knowledge required. No runtime dependency.

---

## 1. Core Principles (non-negotiable)

| Principle | Meaning |
|-----------|---------|
| **Create-only** | Origins cannot be modified after capture |
| **Content-addressed** | Origin = hash / CID |
| **Read-only after capture** | No UPDATE endpoint exists |
| **System-agnostic** | No assumptions about upstream applications |
| **Explicit failure** | Absence of origin is always detectable |

---

## 2. Canonical Data Model

\`\`\`typescript
interface OriginRecord {
  origin_id: string;          // UUID
  origin_cid: string;         // IPFS CID
  origin_hash: string;        // SHA-256
  hash_algo: "sha256";
  captured_at: string;        // ISO-8601
  source_system: string;      // "notion", "nextcloud", "scanner", etc.
  capture_type: "image" | "text" | "binary";
  integrity_status: "valid" | "legacy" | "unverified";
}
\`\`\`

---

## 3. API Primitives

### 3.1 Create Origin (write-once)

\`\`\`
POST /origins
\`\`\`

**Request:**
\`\`\`json
{
  "content": "<binary | text>",
  "source_system": "notion",
  "metadata": { ... }
}
\`\`\`

**Guarantees:**
- Hash is computed before storage
- Returns immutable origin reference
- No UPDATE endpoint exists

---

### 3.2 Resolve Origin

\`\`\`
GET /origins/{origin_id}
GET /resolve?cid={cid}
GET /resolve?hash={sha256}
\`\`\`

**Response:**
\`\`\`json
{
  "origin": {
    "origin_id": "...",
    "origin_cid": "...",
    "origin_hash": "...",
    "hash_algo": "sha256",
    "captured_at": "...",
    "source_system": "...",
    "capture_type": "image",
    "integrity_status": "valid"
  },
  "artifact_url": "https://vault.umarise.com/ipfs/{cid}",
  "proof": {
    "hash": "...",
    "algo": "sha256"
  }
}
\`\`\`

---

### 3.3 Verify Origin Integrity

\`\`\`
POST /verify
\`\`\`

**Request:**
\`\`\`json
{
  "origin_id": "...",
  "content": "<binary>"
}
\`\`\`

**Response:**
\`\`\`json
{
  "match": true
}
\`\`\`

---

### 3.4 Link External Systems (cross-system reference)

\`\`\`
POST /links
\`\`\`

**Purpose:** Declare derivation or citation without synchronization.

**Request:**
\`\`\`json
{
  "origin_id": "...",
  "external_system": "notion",
  "external_reference": "page://abc123",
  "link_type": "derived" | "cited" | "referenced"
}
\`\`\`

**Guarantees:**
- Links are append-only
- No reverse sync
- No overwrite

---

## 4. Explicit Failure Modes

| Scenario | Result |
|----------|--------|
| No origin provided | \`origin: null\` (explicit absence) |
| Content mismatch | \`verify: false\` |
| Modified artifact | New CID, old origin remains |
| System ignores Umarise | Detectable, not prevented |

> **Governance begins where these failures have consequences.**

---

## 5. Integration Promise

What partners get:

- **No lock-in** — Origins are portable
- **No runtime dependency** — Umarise can be offline
- **Evidence and reference only** — No workflow assumptions
- **Works alongside existing stacks** — Not a replacement

---

## 6. Current Implementation Status

| Primitive | Status | Endpoint |
|-----------|--------|----------|
| Create Origin | ✅ Implemented | \`POST /api/codex/pages\` via proxy |
| Resolve Origin | ✅ Implemented | \`GET /resolve-origin?origin_id=...\` |
| Verify Origin | ✅ Implemented | Client-side + \`VerifyOriginButton\` |
| Link External | 🔮 Conceptual | Not yet implemented |

---

*Contract version: 1.0*`;

const LAYER_BOUNDARIES = `# Layer Boundaries — Origin Layer vs Governance Layer

> This document defines the explicit boundary between what Umarise implements and what belongs to upstream governance systems.  
> Strategic protection against scope-creep and political claims.

---

## 1. What Umarise IS

### Definition

> **Umarise is an origin record layer.**  
> A system-of-record that captures and preserves original state before transformation.

### Concrete responsibilities

| Function | Description |
|----------|-------------|
| **Record** | Capture what existed |
| **Prove** | Demonstrate it is unchanged |
| **Expose** | Make it visible to downstream systems |

### Core statement

> **Umarise registers. It does not judge.**

---

## 2. What Umarise is NOT

Umarise is explicitly **not**:

| Not This | Why |
|----------|-----|
| Governance engine | Does not enforce rules |
| Identity provider | Does not authenticate users |
| Compliance system | Does not audit behavior |
| Policy enforcer | Does not block actions |
| Truth authority | Does not determine correctness |
| Workflow controller | Does not orchestrate processes |

### Critical distinction

> **Umarise does not determine what is "true", "correct", or "permitted".**

---

## 3. Where Governance Begins

Governance emerges **above** Umarise when other systems:

- Make origin **mandatory**
- Enforce **provenance**
- Sanction **absence**
- Attribute **responsibility**

### Governance layers (not implemented by Umarise)

| Layer | Umarise Status |
|-------|----------------|
| Identity & signing | ❌ Not implemented |
| Policy enforcement | ❌ Not implemented |
| Audit & compliance | ❌ Not implemented |
| Dispute resolution | ❌ Not implemented |
| Legal attestation | ❌ Not implemented |

> **Umarise is the precondition for governance, not its executor.**

---

## 4. What Umarise Enables (Without Enforcing)

With Umarise in place, governance systems can:

| Capability | How |
|------------|-----|
| Show explicit origin for every transformation | Origin links are available |
| Detect any modification | Hash comparison reveals changes |
| Verify any claim | Bit-identity proof is cryptographic |
| Hold any system accountable | Evidence exists independently |

### The trade-off

> **Without Umarise, governance is symbolic.**  
> **With Umarise, governance becomes enforceable by others.**

---

## 5. Essential Design Choice

> **Umarise exists within the system, but does not control the system.**

This is not a paradox — this is correct infrastructure.

### Architectural metaphor

Umarise is like a **notary stamp**:
- It records that something existed at a point in time
- It does not decide whether that thing is valid, legal, or good
- It enables others to make those decisions with evidence

---

## 6. Positioning Statements

### For partners

> "Umarise doesn't govern.  
> It makes governance unavoidable."

### For technical audiences

> "The demo implements the origin record layer.  
> Governance emerges when identity, policy, and enforcement are layered on top."

### For integration discussions

> "We provide the evidence layer.  
> You provide the rules."

---

## 7. Boundary Diagram

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                   GOVERNANCE LAYER                       │
│  (Identity, Policy, Compliance, Enforcement, Dispute)   │
│                    ❌ NOT UMARISE                        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ reads from / references
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 ORIGIN RECORD LAYER                      │
│         (Capture, Preserve, Resolve, Verify)            │
│                    ✅ UMARISE                            │
└─────────────────────────────────────────────────────────┘
                            │
                            │ stores in
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                          │
│              (IPFS, Hetzner, SQLite)                    │
│                    ✅ UMARISE                            │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 8. Summary

| Aspect | Origin Layer (Umarise) | Governance Layer (Others) |
|--------|------------------------|---------------------------|
| Creates records | ✅ | ❌ |
| Preserves state | ✅ | ❌ |
| Proves integrity | ✅ | ❌ |
| Enforces policy | ❌ | ✅ |
| Authenticates users | ❌ | ✅ |
| Resolves disputes | ❌ | ✅ |
| Determines truth | ❌ | ✅ |

---

*Document version: 1.0*`;

// Example proof bundle
const EXAMPLE_PROOF_BUNDLE = {
  version: "1.0",
  generated_at: new Date().toISOString(),
  origin: {
    origin_id: "example-origin-id",
    origin_hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    origin_hash_algo: "sha256",
    captured_at: "2026-01-15T10:30:00Z",
    storage_location: "hetzner-de"
  },
  verification: {
    instructions: [
      "Download the original image from the Origin View",
      "Calculate SHA-256: shasum -a 256 <image_file>",
      "Compare with origin_hash_sha256 above",
      "Match = authentic, unmodified since capture"
    ],
    powershell: "Get-FileHash -Algorithm SHA256 <image_file>",
    unix: "shasum -a 256 <image_file>"
  },
  custody: {
    custodian: "Umarise",
    jurisdiction: "Germany (EU)",
    storage_provider: "Hetzner",
    immutability: "Enforced by database triggers"
  }
};

export default function ReviewKit() {
  const [expandedDoc, setExpandedDoc] = useState<'contract' | 'boundaries' | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleDownloadProofBundle = () => {
    const blob = new Blob([JSON.stringify(EXAMPLE_PROOF_BUNDLE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'umarise-proof-bundle-example.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Origin ID for demo - use an older, less private entry
  // Options: 1bfd790e (Jan 23), 9f08732c (Jan 21), 0cc1e6d2 (Jan 21)
  const exampleOriginId = "fb025c0e-0dc8-4b4f-b795-43177ea2a045";
  const originViewUrl = `${window.location.origin}/origin/${exampleOriginId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-forest-deep to-codex-ink-deep">
      {/* Header */}
      <div className="border-b border-codex-cream/10">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-codex-cream/50 text-sm uppercase tracking-widest mb-2">
              Technical Review Kit
            </p>
            <h1 className="text-3xl font-serif text-codex-cream mb-3">
              Umarise Origin Record Layer
            </h1>
            <p className="text-codex-cream/70 text-lg">
              Stack-level documentation for technical evaluation
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Share URL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3 p-4 bg-codex-ink/50 rounded-lg border border-codex-cream/10"
        >
          <span className="text-codex-cream/50 text-sm">Share this kit:</span>
          <code className="text-codex-gold text-sm flex-1 truncate">{window.location.href}</code>
          <Button
            onClick={handleCopyUrl}
            variant="ghost"
            size="sm"
            className="text-codex-cream/60 hover:text-codex-gold shrink-0"
          >
            {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* What You're Reviewing */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-codex-cream text-xl font-medium mb-4">What You're Reviewing</h2>
          <div className="p-5 bg-codex-ink/30 rounded-lg border border-codex-cream/10">
            <p className="text-codex-cream/80 leading-relaxed">
              An <strong className="text-codex-gold">origin record layer</strong> — infrastructure that captures and preserves the original state of artifacts (notes, sketches, documents) before transformation by AI or systems.
            </p>
            <div className="mt-4 pt-4 border-t border-codex-cream/10">
              <p className="text-codex-cream/60 text-sm italic">
                "We provide the evidence layer. You provide the rules."
              </p>
            </div>
          </div>
        </motion.section>

        {/* Three Questions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-codex-cream text-xl font-medium mb-4">Three Questions</h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-4 bg-codex-ink/30 rounded-lg border border-codex-cream/10">
              <span className="text-codex-gold font-mono">1.</span>
              <p className="text-codex-cream/80">Where would this sit in your stack?</p>
            </div>
            <div className="flex gap-3 p-4 bg-codex-ink/30 rounded-lg border border-codex-cream/10">
              <span className="text-codex-gold font-mono">2.</span>
              <p className="text-codex-cream/80">What happens in your systems when this layer doesn't exist, but AI and workflows do?</p>
            </div>
            <div className="flex gap-3 p-4 bg-codex-ink/30 rounded-lg border border-codex-gold/30">
              <span className="text-codex-gold font-mono">3.</span>
              <p className="text-codex-cream">Is this for you: <strong className="text-codex-gold">irrelevant</strong>, <strong className="text-codex-gold">obvious</strong>, or <strong className="text-codex-gold">fundamental</strong>?</p>
            </div>
          </div>
        </motion.section>

        {/* Live Experience */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-codex-cream text-xl font-medium mb-4">Live Experience</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={originViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 bg-codex-ink/30 rounded-lg border border-codex-cream/10 hover:border-codex-gold/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-codex-gold/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-codex-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-codex-cream font-medium group-hover:text-codex-gold transition-colors flex items-center gap-2">
                    Origin View
                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                  </h3>
                  <p className="text-codex-cream/50 text-sm mt-1">
                    Read-only public view of an origin record with verification status
                  </p>
                </div>
              </div>
            </a>

            <button
              onClick={handleDownloadProofBundle}
              className="group p-5 bg-codex-ink/30 rounded-lg border border-codex-cream/10 hover:border-codex-gold/30 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-codex-gold/10 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-codex-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-codex-cream font-medium group-hover:text-codex-gold transition-colors">
                    Proof Bundle
                  </h3>
                  <p className="text-codex-cream/50 text-sm mt-1">
                    Downloadable JSON with hash, timestamp, and verification instructions
                  </p>
                </div>
              </div>
            </button>
          </div>
          <p className="text-codex-cream/40 text-xs mt-3 flex items-center gap-1.5">
            <span>No admin UI. No database access. No server access.</span>
          </p>
        </motion.section>

        {/* Live API Tester */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-codex-gold/10 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-codex-gold" />
            </div>
            <h2 className="text-codex-cream text-xl font-medium">Live API Tester</h2>
          </div>
          <div className="p-5 bg-codex-ink/30 rounded-lg border border-codex-gold/20">
            <ApiTester />
          </div>
        </motion.section>

        {/* API Examples */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-codex-cream text-xl font-medium mb-4">API Primitives</h2>
          <div className="space-y-4">
            {/* Create Origin */}
            <div className="p-4 bg-codex-ink/50 rounded-lg border border-codex-cream/10 font-mono text-sm overflow-x-auto">
              <div className="text-codex-cream/50 mb-2"># 1. Create Origin (write-once)</div>
              <div className="text-codex-cream">
                <span className="text-codex-gold">POST</span> /origins
              </div>
              <pre className="text-codex-cream/60 text-xs mt-2">
{`{
  "content": "<binary>",
  "source_system": "scanner"
}`}
              </pre>
              <div className="text-codex-cream/40 text-xs mt-2 italic">
                → Returns immutable origin_id + hash. No UPDATE endpoint exists.
              </div>
            </div>

            {/* Resolve Origin */}
            <div className="p-4 bg-codex-ink/50 rounded-lg border border-codex-cream/10 font-mono text-sm overflow-x-auto">
              <div className="text-codex-cream/50 mb-2"># 2. Resolve Origin (by ID or hash)</div>
              <div className="text-codex-cream space-y-1">
                <div><span className="text-codex-gold">GET</span> /resolve?origin_id=&#123;uuid&#125;</div>
                <div><span className="text-codex-gold">GET</span> /resolve?hash=&#123;sha256&#125;</div>
              </div>
              <pre className="text-codex-cream/60 text-xs mt-2">
{`{
  "found": true,
  "origin_id": "1bfd790e-...",
  "origin_hash_sha256": "44e20310c95c42d1...",
  "hash_status": "verified",
  "captured_at": "2026-01-23T12:27:14Z"
}`}
              </pre>
            </div>

            {/* Verify Origin */}
            <div className="p-4 bg-codex-ink/50 rounded-lg border border-codex-cream/10 font-mono text-sm overflow-x-auto">
              <div className="text-codex-cream/50 mb-2"># 3. Verify Origin (bit-identity check)</div>
              <div className="text-codex-cream">
                <span className="text-codex-gold">POST</span> /verify
              </div>
              <pre className="text-codex-cream/60 text-xs mt-2">
{`{
  "origin_id": "...",
  "content": "<binary>"
}`}
              </pre>
              <div className="text-codex-cream/40 text-xs mt-2">
                → Response: <code className="text-codex-gold">{"{ \"match\": true }"}</code>
              </div>
            </div>

            {/* Link External */}
            <div className="p-4 bg-codex-ink/50 rounded-lg border border-codex-cream/10 font-mono text-sm overflow-x-auto opacity-60">
              <div className="text-codex-cream/50 mb-2"># 4. Link External (cross-system reference) — conceptual</div>
              <div className="text-codex-cream">
                <span className="text-codex-gold">POST</span> /links
              </div>
              <pre className="text-codex-cream/60 text-xs mt-2">
{`{
  "origin_id": "...",
  "external_system": "notion",
  "external_reference": "page://abc123",
  "link_type": "derived"
}`}
              </pre>
              <div className="text-codex-cream/40 text-xs mt-2 italic">
                → Append-only. No sync. No overwrite.
              </div>
            </div>
          </div>
        </motion.section>

        {/* Documentation */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-codex-cream text-xl font-medium mb-4">Technical Documentation</h2>
          <div className="space-y-3">
            {/* Integration Contract */}
            <div className="bg-codex-ink/30 rounded-lg border border-codex-cream/10 overflow-hidden">
              <button
                onClick={() => setExpandedDoc(expandedDoc === 'contract' ? null : 'contract')}
                className="w-full p-4 flex items-center gap-3 hover:bg-codex-cream/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-codex-gold/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-codex-gold" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-codex-cream font-medium">integration-contract.md</h3>
                  <p className="text-codex-cream/50 text-sm">API primitives and data model</p>
                </div>
                {expandedDoc === 'contract' ? (
                  <ChevronUp className="w-5 h-5 text-codex-cream/50" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-codex-cream/50" />
                )}
              </button>
              {expandedDoc === 'contract' && (
                <div className="border-t border-codex-cream/10 p-6 max-h-96 overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none text-codex-cream/80 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {INTEGRATION_CONTRACT}
                  </div>
                </div>
              )}
            </div>

            {/* Layer Boundaries */}
            <div className="bg-codex-ink/30 rounded-lg border border-codex-cream/10 overflow-hidden">
              <button
                onClick={() => setExpandedDoc(expandedDoc === 'boundaries' ? null : 'boundaries')}
                className="w-full p-4 flex items-center gap-3 hover:bg-codex-cream/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-codex-gold/10 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-codex-gold" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-codex-cream font-medium">layer-boundaries.md</h3>
                  <p className="text-codex-cream/50 text-sm">What Umarise is and is not</p>
                </div>
                {expandedDoc === 'boundaries' ? (
                  <ChevronUp className="w-5 h-5 text-codex-cream/50" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-codex-cream/50" />
                )}
              </button>
              {expandedDoc === 'boundaries' && (
                <div className="border-t border-codex-cream/10 p-6 max-h-96 overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none text-codex-cream/80 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {LAYER_BOUNDARIES}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="pt-8 border-t border-codex-cream/10 text-center"
        >
          <p className="text-codex-cream/30 text-sm">
            Umarise Origin Record Layer — v1.0
          </p>
          <p className="text-codex-cream/20 text-xs mt-1">
            Evidence of origin, not interpretation
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
