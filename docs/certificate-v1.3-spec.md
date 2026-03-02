# Certificate.json v1.3 — Specification

**Status:** Active  
**Date:** 2026-03-02  
**Backwards compatible with:** v1.0, v1.1, v1.2

---

## Overview

The `certificate.json` file is the immutable metadata record included in every Anchor ZIP. Version 1.3 adds three fields to prepare for Advanced Electronic Signature (AES) compliance and identity escalation:

1. **`sig_algorithm`** — Makes the signing algorithm explicit
2. **`identity_binding`** — Links the anchor to a verified identity at a defined assurance level
3. **`meta`** — Specification and implementation references

All new fields are additive. Existing parsers and verifiers that read v1.0–v1.2 certificates will ignore unknown fields. No breaking changes.

---

## Version History

| Version | Changes |
|---------|---------|
| 1.0 | Initial schema: hash, origin_id, claimed_by, signature |
| 1.1 | Added device_signature + device_public_key (WebAuthn/Passkey) |
| 1.2 | Added attestation_included (Layer 3) |
| **1.3** | **Added sig_algorithm, identity_binding, meta** |

---

## Full Schema

| Field | Type | Required | Since | Description |
|-------|------|----------|-------|-------------|
| `version` | string | Yes | 1.0 | Schema version (`"1.3"`) |
| `origin_id` | string | Yes | 1.0 | 8-character hex identifier |
| `hash` | string | Yes | 1.0 | Full SHA-256 hash of the artifact |
| `hash_algo` | string | Yes | 1.0 | Always `"SHA-256"` |
| `captured_at` | string | Yes | 1.0 | ISO 8601 timestamp |
| `verify_url` | string | Yes | 1.0 | Independent verification URL |
| `proof_included` | boolean | Yes | 1.0 | Whether proof.ots is in this ZIP |
| `proof_status` | string | Yes | 1.0 | `"pending"` or `"anchored"` |
| `claimed_by` | string\|null | Yes | 1.0 | Passkey public key |
| `signature` | string\|null | Yes | 1.0 | Cryptographic signature of hash |
| `device_signature` | string\|null | Yes | 1.1 | WebAuthn signature over hash |
| `device_public_key` | string\|null | Yes | 1.1 | SPKI public key of signing device |
| `attestation_included` | boolean | No | 1.2 | Whether attestation.json is present |
| `sig_algorithm` | string\|null | No | **1.3** | Signing algorithm identifier |
| `identity_binding` | object | No | **1.3** | Identity assurance binding |
| `meta` | object | No | **1.3** | Specification and implementation info |

---

## New Fields (v1.3)

### `sig_algorithm`

Explicit identifier of the signing algorithm used for `device_signature`.

**Values:**
- `"WebAuthn_ECDSA_P256_SHA256"` — Standard WebAuthn with P-256 curve
- `null` — No device signature present

This field makes the cryptographic method auditable without requiring parsers to infer it from the key format.

### `identity_binding`

Links the anchor to a verified identity at a defined assurance level. Inspired by eIDAS assurance levels.

```json
{
  "level": "L1",
  "reference_hash_sha256": null,
  "issued_at": null,
  "issuer_type": "self",
  "issuer_id": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `level` | `"L1"` \| `"L2"` \| `"L3"` | Assurance level |
| `reference_hash_sha256` | string\|null | SHA-256 of onboarding evidence |
| `issued_at` | string\|null | ISO 8601 timestamp of verification |
| `issuer_type` | string | `"self"`, `"kyc_provider"`, `"notary"`, `"other"` |
| `issuer_id` | string\|null | Identifier of the issuer |

**Assurance Levels:**

| Level | Binding | Evidence | AES Alignment |
|-------|---------|----------|---------------|
| **L1** | Passkey + device | None (self-asserted) | Insufficient for AES |
| **L2** | KYC / video-ident | Hash of KYC session record | Supports Art. 26 eIDAS (a)(b) |
| **L3** | Notarial verification | Hash of notarial act | Full AES candidate |

**Important:** The `reference_hash_sha256` field contains only the hash of the evidence, never the evidence itself. The original KYC record or notarial act remains with the issuer. This maintains the zero-storage principle.

### `meta`

Specification and implementation references for audit trails.

```json
{
  "spec_version": "anchoring-spec.org/v1.3",
  "implementation": "umarise-anchor/1.3.0"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `spec_version` | string | Reference to the governing specification |
| `implementation` | string | Software that generated this certificate |

---

## Example: L1 Certificate (default)

```json
{
  "version": "1.3",
  "origin_id": "1916F13F",
  "hash": "a7f3b2c1e4d5a7f3b2c1e4d5a7f3b2c1e4d5a7f3b2c1e4d5a7f3b2c1e4d5a7f3",
  "hash_algo": "SHA-256",
  "captured_at": "2026-03-02T14:30:00.000Z",
  "verify_url": "https://verify-anchoring.org",
  "proof_included": true,
  "proof_status": "anchored",
  "claimed_by": null,
  "signature": null,
  "device_signature": "MEUCIQD...",
  "device_public_key": "MFkwEwYHKoZIzj0...",
  "sig_algorithm": "WebAuthn_ECDSA_P256_SHA256",
  "identity_binding": {
    "level": "L1",
    "reference_hash_sha256": null,
    "issued_at": null,
    "issuer_type": "self",
    "issuer_id": null
  },
  "meta": {
    "spec_version": "anchoring-spec.org/v1.3",
    "implementation": "umarise-anchor/1.3.0"
  }
}
```

## Example: L3 Certificate (notarial, future)

```json
{
  "version": "1.3",
  "origin_id": "AABB1122",
  "hash": "d3b07384d113edec49eaa6238ad5ff00d3b07384d113edec49eaa6238ad5ff00",
  "hash_algo": "SHA-256",
  "captured_at": "2026-06-15T09:00:00.000Z",
  "verify_url": "https://verify-anchoring.org",
  "proof_included": true,
  "proof_status": "anchored",
  "claimed_by": "MFkwEwYH...",
  "signature": "MEUCIQD...",
  "device_signature": "MEUCIQD...",
  "device_public_key": "MFkwEwYHKoZIzj0...",
  "attestation_included": true,
  "sig_algorithm": "WebAuthn_ECDSA_P256_SHA256",
  "identity_binding": {
    "level": "L3",
    "reference_hash_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "issued_at": "2026-06-14T16:00:00.000Z",
    "issuer_type": "notary",
    "issuer_id": "fidacta:notaris-amsterdam-001"
  },
  "meta": {
    "spec_version": "anchoring-spec.org/v1.3",
    "implementation": "umarise-anchor/1.3.0"
  }
}
```

---

## Backwards Compatibility

- **v1.0/v1.1/v1.2 parsers** ignore unknown fields → no breaking change
- **v1.3 parsers** should treat `sig_algorithm`, `identity_binding`, and `meta` as optional
- **verify-anchoring.org** currently ignores these fields; will be updated to display them when present
- **verify-anchor.sh/py** read only `hash` and `origin_id` → unaffected

## Governance

The specification is normative. This implementation is not.  
Canonical reference: [anchoring-spec.org/v1.0/](https://anchoring-spec.org/v1.0/)
