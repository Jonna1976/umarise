# Proof Container Specification — Version 1.0

> **Status:** Normative  
> **Version:** 1.0  
> **Canonical URL:** https://anchoring-spec.org/proof-container/  
> **Parent specification:** [Anchoring Specification (IEC) v1.0](https://anchoring-spec.org/v1.0/)  
> **License:** Public Domain (Unlicense)

The key words MUST, SHOULD, and MAY in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## 1. Purpose

This specification defines the Proof Container: a portable, self-contained evidence bundle that packages an anchoring proof with its associated metadata into a single archive.

A conformant Proof Container enables any party to verify the existence claim independently, without reliance on the proof issuer or any issuer-controlled infrastructure.

---

## 2. Scope

This specification defines:

- the archive format and structure
- required and optional files
- file naming conventions
- the certificate schema
- verification semantics for the container
- the relationship to the Anchoring Specification (IEC)

This specification does NOT define:

- the anchoring process itself (defined by IEC)
- ledger binding mechanisms (defined by IEC Section 7)
- identity, authorship, or ownership semantics (excluded by IEC Section 8)

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Proof Container | A ZIP archive conforming to this specification |
| Certificate | A JSON document containing immutable metadata about the anchor |
| Artifact | The original byte sequence that was anchored |
| Proof file | A binary ledger binding (e.g., OpenTimestamps `.ots` file) |
| Attestation | An optional third-party cryptographic confirmation |

---

## 4. Archive Format

A Proof Container MUST be a valid ZIP archive (ISO/IEC 21320-1:2015 or PKWARE APPNOTE.TXT compliant).

A Proof Container SHOULD use DEFLATE compression.

The file extension SHOULD be `.proof` or `.zip`. Implementations MUST accept both extensions.

---

## 5. Container Structure

A conformant Proof Container MUST contain:

| File | Required | Description |
|------|----------|-------------|
| `certificate.json` | MUST | Immutable anchor metadata (see Section 6) |
| `VERIFY.txt` | MUST | Human-readable verification instructions |

A conformant Proof Container MAY contain:

| File | Optional | Description |
|------|----------|-------------|
| `proof.ots` | MAY | Binary ledger binding (OpenTimestamps proof) |
| `artifact.{ext}` | MAY | The original artifact |
| `attestation.json` | MAY | Third-party attestation (see Section 9) |

No other files are permitted at the root level of the archive.

### 5.1 File count

A conformant Proof Container contains between 2 (minimum: certificate + VERIFY.txt) and 5 (maximum: all files) entries.

### 5.2 Artifact naming

When present, the artifact MUST be named `artifact.{ext}` where `{ext}` corresponds to the file's media type. Implementations SHOULD use standard extensions (e.g., `jpg`, `png`, `pdf`, `mp4`).

Only one artifact file is permitted per container.

---

## 6. Certificate Schema

The `certificate.json` file MUST be a valid JSON document containing the following required fields:

```json
{
  "version": "1.3",
  "origin_id": "1916F13F",
  "hash": "a1b2c3d4e5f6...",
  "hash_algo": "SHA-256",
  "captured_at": "2026-03-06T14:30:00.000Z",
  "verify_url": "https://verify-anchoring.org",
  "proof_included": true,
  "proof_status": "anchored"
}
```

### 6.1 Required fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Certificate schema version (e.g., `"1.3"`) |
| `origin_id` | string | Stable external reference identifier |
| `hash` | string | Hexadecimal hash of the artifact |
| `hash_algo` | string | Hash algorithm identifier (e.g., `"SHA-256"`) |
| `captured_at` | string | ISO 8601 timestamp of anchor creation |
| `verify_url` | string | URL of an independent reference verifier |
| `proof_included` | boolean | Whether `proof.ots` is present in this container |
| `proof_status` | string | `"pending"` or `"anchored"` |

### 6.2 Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `claimed_by` | string \| null | Public key of the claiming credential |
| `signature` | string \| null | Cryptographic signature of the hash |
| `device_signature` | string \| null | WebAuthn signature over the hash |
| `device_public_key` | string \| null | SPKI public key of the signing device |
| `sig_algorithm` | string \| null | Signing algorithm identifier |
| `attestation_included` | boolean | Whether `attestation.json` is present |
| `identity_binding` | object \| null | Identity assurance level (see Section 8) |
| `revocation` | object \| null | Revocation status |
| `meta` | object | Implementation metadata |

### 6.3 Immutability

A certificate MUST NOT be modified after creation. If any field requires change, a new container with a new certificate MUST be generated.

---

## 7. Artifact Integrity

### 7.1 Inclusion rule

When an artifact is included in the container, its hash MUST match the `hash` field in `certificate.json` using the algorithm specified in `hash_algo`.

If the hash does not match, the artifact MUST NOT be included. An implementation MUST reject artifact inclusion on mismatch rather than including an unverified artifact.

### 7.2 Verification rule

A verifier receiving a container with an artifact MUST:

1. Compute the hash of `artifact.{ext}` using the algorithm in `certificate.json → hash_algo`
2. Compare the result with `certificate.json → hash`
3. Report `valid` only if the hashes match exactly

### 7.3 Absence of artifact

A container without an artifact is valid. The certificate and proof file are sufficient for independent verification when the verifier possesses the original artifact separately.

---

## 8. Identity Binding

The optional `identity_binding` field in the certificate supports three assurance levels:

| Level | Description | Evidence |
|-------|-------------|----------|
| `L1` | Device binding only | Passkey/WebAuthn signature |
| `L2` | Identity verified | KYC or video identification |
| `L3` | Notarial attestation | Notarial act or equivalent |

Identity binding is NOT part of the anchoring claim. It is supplementary metadata. The existence proof remains valid regardless of identity binding status.

---

## 9. Attestation

The optional `attestation.json` file contains a third-party cryptographic confirmation.

### 9.1 Required fields

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | string | Attestation schema version |
| `attestation_id` | string | Unique attestation identifier |
| `origin_id` | string | Reference to the anchored origin |
| `attested_by` | string | Name of the attestant |
| `attested_at` | string | ISO 8601 timestamp of attestation |
| `signature` | string | Cryptographic signature by the attestant |
| `attestant_public_key` | string | Public key for signature verification |
| `verify_url` | string | URL for attestation verification |

### 9.2 Independence

An attestation is independently verifiable using only the `attestant_public_key` and the signed data fields. No issuer infrastructure is required.

---

## 10. VERIFY.txt

The `VERIFY.txt` file MUST contain:

1. A list of files in the container
2. Instructions for hash verification using standard tools
3. Instructions for ledger proof verification
4. A reference to an independent verifier
5. A statement of what the proof does and does not establish

The `VERIFY.txt` file SHOULD be sufficient for a technically competent person to verify the proof without any external documentation.

---

## 11. Container Naming

Container filenames SHOULD follow the pattern:

```
origin-{TOKEN}-{name}-{YYYYMMDD}.proof
```

Where:

- `{TOKEN}` is the short origin identifier (uppercase)
- `{name}` is a sanitized version of the original filename (lowercase, alphanumeric)
- `{YYYYMMDD}` is the capture date

Example: `origin-1916F13F-quarterly-report-20260306.proof`

Implementations MUST NOT rely on the filename for verification. All verification data is contained within the archive.

---

## 12. Verification of a Proof Container

Verification of a Proof Container follows the IEC verification function V(B, P, L) with the following mapping:

| IEC parameter | Container source |
|---------------|-----------------|
| B (artifact bytes) | `artifact.{ext}` or externally provided |
| P (proof bundle) | `certificate.json` + `proof.ots` |
| L (ledger) | Bitcoin blockchain (via OpenTimestamps) |

A conformant verifier MUST:

1. Parse the ZIP archive
2. Extract and validate `certificate.json`
3. If `artifact.{ext}` is present: verify its hash against `certificate.json → hash`
4. If `proof.ots` is present: verify the ledger binding independently
5. Return `valid`, `invalid`, or `unverifiable` as defined by IEC Section 5

---

## 13. Backward Compatibility

### 13.1 Certificate versions

Implementations MUST accept certificate versions `1.0` through `1.3`. Fields introduced in later versions are optional when reading earlier versions.

### 13.2 File extension

Implementations MUST treat `.proof` and `.zip` extensions identically. The archive format is the same regardless of extension.

---

## 14. Security Considerations

- The container does not provide confidentiality. Contents are not encrypted by default.
- Implementations MAY support encryption as an extension, but encrypted containers are outside the scope of this specification.
- The integrity of the container depends on the integrity of its constituent files. A corrupted ZIP archive renders the proof unverifiable, not invalid.

---

## 15. Relationship to IEC

This specification is a companion to the Anchoring Specification (IEC). It defines a container format for IEC-conformant proofs.

The Anchoring Specification (IEC) is normative for anchoring semantics. This specification is normative for the container format only.

If any behavior in this specification conflicts with the Anchoring Specification, the Anchoring Specification prevails.

---

## 16. Compliance

An implementation claiming conformance to this specification MUST:

1. Produce containers containing at minimum `certificate.json` and `VERIFY.txt`
2. Enforce hash verification before artifact inclusion (Section 7.1)
3. Accept both `.proof` and `.zip` extensions
4. Include the disclaimer: "The specification is normative. This implementation is not."

---

*Canonical publication: [anchoring-spec.org/proof-container/](https://anchoring-spec.org/proof-container/)*  
*The specification is normative. Implementations are not.*
