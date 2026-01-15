# Origin Hash Verification

> **Cryptographic Anchoring for Handwritten Knowledge**

## Executive Summary

Umarise implements **SHA-256 cryptographic fingerprinting** at the moment of capture. Every uploaded artifact (photo of handwritten notes, whiteboards, sketches) automatically receives an immutable digital fingerprint that can later be used to prove the artifact has not been altered since the "begin moment."

**Key differentiator:** This happens transparently at capture time—zero user friction, zero extra steps. The human is focused on their creative moment; infrastructure silently preserves its integrity.

---

## How It Works

### 1. Single-Source Bytes Principle

```
User captures photo
        ↓
    Raw bytes extracted (before any encryption/compression)
        ↓
    SHA-256 hash calculated over EXACT bytes
        ↓
    Same bytes uploaded to storage
        ↓
    Hash stored immutably (cannot be changed after creation)
```

**Critical guarantee:** The hash is calculated on the *exact same bytes* that are stored. This ensures forensic integrity—what you verify is exactly what was captured.

### 2. Immutable Storage

- Origin hash is stored in a dedicated sidecar table (`page_origin_hashes`)
- Database trigger prevents any modification after initial write
- Algorithm identifier stored alongside hash (`sha256`) for future-proofing

### 3. Encryption Compatibility

For users with **Private Vault** (client-side AES-256-GCM encryption):
- Hash is calculated on **pre-encryption bytes** (the original artifact)
- Encrypted data is what gets stored
- Verification compares decrypted output against original hash

This preserves both privacy AND verifiability.

---

## Verification Flow

### In-App Verification

1. User opens any captured page
2. Clicks "Verify origin" button
3. System fetches the stored image
4. Calculates SHA-256 hash of current image bytes
5. Compares against stored origin hash
6. Displays: ✅ **Verified** or ❌ **Mismatch**

### Export Verification

Every export includes verification data:

**JSON Export:**
```json
{
  "pages": [
    {
      "id": "abc123",
      "origin_hash_sha256": "a1b2c3d4e5f6...",
      "origin_hash_algo": "sha256",
      "hash_status": "verified",
      "captured_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

**ZIP Export:**
```
/images/abc123.jpg          ← Original artifact
/manifest.json              ← Hash manifest
/metadata.json              ← Full page data
/README.md                  ← Verification instructions
```

**Manifest entry:**
```json
{
  "page_id": "abc123",
  "filename": "abc123.jpg",
  "origin_hash_sha256": "a1b2c3d4e5f6...",
  "origin_hash_algo": "sha256",
  "hash_status": "verified",
  "captured_at": "2026-01-15T10:30:00Z"
}
```

### Command-Line Verification (Universal)

```bash
# macOS/Linux
shasum -a 256 images/abc123.jpg

# Windows PowerShell
Get-FileHash images/abc123.jpg -Algorithm SHA256

# Compare output with origin_hash_sha256 in manifest
```

---

## Legacy Pages

Pages captured before origin hash implementation:
- Display: **"Legacy capture (predates hash verification)"**
- Export: `hash_status: "legacy_no_hash"`
- No verification available—but original artifact preserved

This maintains backwards compatibility while clearly distinguishing verified from unverified origins.

---

## Why This Matters

### For Enterprise / Legal / Compliance

| Use Case | Value |
|----------|-------|
| **eDiscovery** | Prove document authenticity in legal proceedings |
| **Audit trails** | Demonstrate chain of custody for handwritten records |
| **IP protection** | Timestamp proof of original ideas/inventions |
| **Regulatory compliance** | Meet data integrity requirements (FDA, GDPR, SOX) |

### For Investors

| Signal | Evidence |
|--------|----------|
| **Technical depth** | Not just OCR—forensic-grade infrastructure |
| **Moat** | Hard to replicate; requires architecture-first thinking |
| **Enterprise-ready** | Addresses CTO/CISO concerns proactively |
| **Differentiation** | Competitors capture text; Umarise captures proof |

### For Partners (e.g., Moleskine, TFMJ)

- **Trust signal:** User data is portable AND verifiable
- **Premium feature:** "Your notebook entries are cryptographically anchored"
- **Integration potential:** Partner apps can verify Umarise exports

---

## Technical Specifications

| Property | Value |
|----------|-------|
| Algorithm | SHA-256 (256-bit) |
| Output | 64-character lowercase hex string |
| Timing | Calculated at upload, before storage |
| Storage | Immutable (database trigger enforced) |
| Compatibility | Works with Private Vault encryption |
| Export format | JSON + ZIP with manifest |
| Verification | In-app button + command-line |

---

## Architecture Proof Points

1. **`src/lib/originHash.ts`** — Core hash calculation functions
2. **`src/lib/abstractions/storage.ts`** — Single-source bytes principle
3. **`supabase/migrations/*`** — Immutability trigger
4. **`src/components/codex/VerifyOriginButton.tsx`** — User-facing verification
5. **`src/lib/exportService.ts`** — Export with hash metadata

---

## Summary

> **"The origin is not explained—it is anchored."**

Umarise doesn't just store photos of handwritten notes. It creates cryptographic proof that the artifact you see today is byte-for-byte identical to what was captured at the moment of creation.

This transforms handwritten knowledge from "I think I wrote this" to "I can prove I wrote this, and it hasn't changed."

---

*Document version: 2026-01-15*
*Status: Production-ready (v1)*
