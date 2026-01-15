# Umarise Origin Hash (SHA-256) — Partner Spec v1

> Infrastructure contract for integrators, auditors, enterprise, and platform partners.

---

## What It Is

At every new capture, Umarise calculates a **SHA-256 fingerprint** of the original capture bytes (pre-upload, pre-encryption). This hash is stored immutably and used later for verification.

---

## Why It Exists

Makes it verifiable whether a captured artifact has been modified since capture:

| Result | Meaning |
|--------|---------|
| **Match** | Artifact is bit-identical to what was captured |
| **Mismatch** | Artifact has been modified/corrupted/replaced |

---

## Definition of "Origin Bytes"

- The bytes that come from the capture (`imageDataUrl` → decoded bytes)
- Hashing happens **before** encryption or storage transformations
- Same bytes are hashed AND uploaded (single source of truth)

---

## Storage Model

| Field | Value |
|-------|-------|
| `origin_hash_sha256` | 64-character lowercase hex string |
| `origin_hash_algo` | `"sha256"` |
| Immutability | DB trigger blocks modifications after initial write |

In Hetzner-first setups, hash is stored in sidecar table (`page_origin_hashes`) so backend provider is not a dependency.

---

## Legacy Records

Captures from before hashing implementation:

| Field | Value |
|-------|-------|
| `hash_status` | `"legacy_no_hash"` |
| `origin_hash_sha256` | `null` |

These records remain valid as origin records but are **not cryptographically verifiable**.

---

## Export Contract

Exports provide a minimal manifest for auditing.

### manifest.json

Per entry:

```json
{
  "page_id": "uuid",
  "filename": "uuid.jpg",
  "origin_hash_sha256": "a1b2c3..." | null,
  "origin_hash_algo": "sha256" | null,
  "hash_status": "verified" | "legacy_no_hash",
  "captured_at": "2026-01-15T10:30:00.000Z"
}
```

### ZIP structure

```
/images/<page_id>.<ext>     ← Original artifacts
/manifest.json              ← Hash manifest (auditing)
/metadata.json              ← Full page metadata
/README.md                  ← Verification instructions
```

---

## Verification Procedure (Partner-Side)

```bash
# 1. Take the image file (exactly as exported)
# 2. Calculate SHA-256 on file bytes

# macOS/Linux
shasum -a 256 images/<filename>

# Windows PowerShell
Get-FileHash images/<filename> -Algorithm SHA256

# 3. Compare output with origin_hash_sha256 in manifest
# Match = verified
# Mismatch = artifact differs from origin
```

---

## API Contract (for integrators)

### Page object includes:

```typescript
{
  originHashSha256: string | null,  // 64-char hex or null
  originHashAlgo: string | null,    // "sha256" or null
}
```

### Sidecar lookup (Hetzner mode):

```sql
SELECT origin_hash_sha256, origin_hash_algo 
FROM page_origin_hashes 
WHERE page_id = ?
```

---

## Guarantees

| Guarantee | Enforcement |
|-----------|-------------|
| Hash calculated pre-encryption | Code path: `hashAndDecodeDataUrl()` before `encryptImage()` |
| Single-source bytes | Same bytes used for hash AND upload |
| Immutability | Database trigger: `prevent_origin_hash_update()` |
| No silent failures | Missing hash = explicit `legacy_no_hash` status |

---

## Limitations

- Legacy pages cannot be retroactively hashed (origin bytes no longer available in original form)
- Hash proves **bit-identity**, not **authorship** or **timestamp**
- Timestamp proof requires external anchoring (blockchain, TSA) — not in v1 scope

---

## Version

| Field | Value |
|-------|-------|
| Spec version | 1.0 |
| Date | 2026-01-15 |
| Status | Production |
| Algorithm | SHA-256 (fixed) |

---

*This document is the contract. No marketing. Just infrastructure.*
