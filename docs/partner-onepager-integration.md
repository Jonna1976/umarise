# Umarise Core — Partner Integration Overview

**Anchor any digital artifact to the Bitcoin blockchain. Verify independently, forever.**

> Umarise provides an anchoring primitive that enables your users to independently verify that specific bytes existed at or before a ledger-derived point in time - without post-creation reliance on you or Umarise.

---

## Two Integration Tracks

Umarise Core supports two complementary anchoring strategies using the same API and credentials.

```
Track A: Retroactive                    Track B: Prospective
"Anchor what already exists"            "Anchor everything going forward"

  Existing archive                        Your application
  (photos, docs, badges)                  (badges, contracts, reports)
        |                                       |
  Local SHA-256 hashing                   SDK/API call at creation
        |                                       |
  POST /v1-core-origins                   POST /v1-core-origins
        |                                       |
  Bitcoin (OTS) ~24h                      Bitcoin (OTS) ~24h
        |                                       |
  Verifiable proof                        Verifiable proof
```

---

## Track A — Retroactive Anchoring

**"Turn an existing folder into Bitcoin-anchored proof in 3 commands."**

For: archives, legacy documents, photo libraries, historical records.

### Setup (once)
```bash
export CORE_API_KEY=um_your_key
```

### Anchor a folder
```bash
./anchor-dir.sh "/path/to/folder"
```
- Computes SHA-256 hash locally per file (bytes never leave the device)
- Registers each hash via the Core API
- Outputs `anchored-results.csv` with origin_id, hash, and timestamp per file

### Check status
```bash
./check-status.sh "/path/to/anchored-results.csv"
```
Shows `pending` or `anchored` per file. Bitcoin confirmation typically within 24 hours.

### Download proofs
```bash
./download-proofs.sh "/path/to/anchored-results.csv"
```
Downloads `.ots` proof files for all anchored records.

### Performance
- ~100 files/minute (standard tier)
- 10,000 files in ~100 minutes
- No file size limit (only the hash is transmitted)

---

## Track B — Prospective Anchoring

**"Anchor every badge, contract, or report at the moment of creation."**

For: badge issuance, document signing, compliance logging, AI output verification.

### Node.js (3 lines)
```javascript
import { anchor } from '@umarise/anchor';

const result = await anchor(fileBuffer, { apiKey: 'um_your_key' });
// result.origin_id, result.captured_at, result.proof_status
```

### Python (3 lines)
```python
from umarise import UmariseCore

core = UmariseCore(api_key="um_your_key")
result = core.attest(hash="sha256:abc123...")
```

### Direct API (curl)
```bash
HASH=$(shasum -a 256 document.pdf | cut -d' ' -f1)
curl -X POST https://core.umarise.com/v1-core-origins \
  -H "Content-Type: application/json" \
  -H "X-API-Key: um_your_key" \
  -d "{\"hash\":\"sha256:$HASH\"}"
```

### Time to First Attestation
Under 20 minutes from API key to working integration.

---

## What You Get Per Anchored File

| Component | Description |
|-----------|-------------|
| `origin_id` | Unique identifier in the Umarise registry |
| `short_token` | 8-character lookup code for end users |
| `captured_at` | Cryptographically committed timestamp |
| `hash` | SHA-256 fingerprint of the original file |
| `.ots proof` | Binary OpenTimestamps proof anchored in Bitcoin |

---

## Independent Verification

Verification requires no Umarise account, API, or infrastructure.

| Method | How |
|--------|-----|
| **Browser** | [verify-anchoring.org](https://verify-anchoring.org) - drop file + .ots proof |
| **API** | `GET /v1-core-resolve?origin_id=...` (public, no key required) |
| **CLI** | `ots verify proof.ots` + `shasum -a 256 file` |

The proof outlives the platform. A third party with the original file and the .ots proof can verify against the public Bitcoin blockchain without any Umarise dependency.

---

## Security Properties

- **Zero storage** - only the SHA-256 hash is transmitted and stored; original bytes never leave the client
- **Write-once immutability** - database triggers block UPDATE and DELETE at the PostgreSQL engine level
- **Hashed API keys** - raw keys are never stored; only HMAC-SHA256 hashes are persisted
- **Hashed IP addresses** - client IPs are SHA-256 hashed before logging
- **Rate limiting** - enforced before business logic via database function

---

## Use Cases

| Sector | Retroactive (Track A) | Prospective (Track B) |
|--------|----------------------|----------------------|
| **Education** | Anchor historical diploma archive | Anchor each new badge at issuance |
| **Legal** | Timestamp existing contract archive | Anchor every signed document |
| **Creative** | Prove existing portfolio predates disputes | Anchor each new design at creation |
| **Compliance** | Anchor audit trail retroactively | Log every compliance event in real time |
| **Research** | Timestamp existing datasets | Anchor each experiment result |
| **AI/ML** | Prove training data provenance | Anchor every AI-generated output |

---

## Pricing

| Tier | Rate Limit | Use Case |
|------|-----------|----------|
| Standard | 100 req/min | Development and small-scale |
| Premium | 1,000 req/min | Production workloads |
| Scale | 100,000 req/min | Enterprise volume |

Contact: partners@umarise.com

---

## Getting Started

1. Request an API key at partners@umarise.com
2. Choose your track:
   - **Retroactive:** Download the CLI scripts and anchor your first folder
   - **Prospective:** Install the SDK and anchor your first file from code
3. Verify your first proof at [verify-anchoring.org](https://verify-anchoring.org)

**Full API documentation:** [umarise.com/api-reference](https://umarise.com/api-reference)
**Anchoring specification:** [anchoring-spec.org](https://anchoring-spec.org)
**Independent verifier:** [verify-anchoring.org](https://verify-anchoring.org)

---

*Umarise Core - Anchoring infrastructure for digital proof. March 2026.*
