# QTSP Integration Blueprint — Anchoring + Qualified Electronic Signatures

*Version 1.0 — 3 March 2026*

---

## 1. Purpose

This document describes how a Qualified Trust Service Provider (QTSP) can integrate Umarise anchoring proofs into XAdES and PAdES signature containers, creating a combined assurance level that spans both temporal existence (L1–L2) and qualified identity binding (L3–L4).

The goal: a single artifact that proves **what existed when** (anchoring) and **who signed it** (QES), independently verifiable through separate trust chains.

---

## 2. Scope

| In scope | Out of scope |
|----------|--------------|
| Embedding .ots proofs in XAdES/PAdES containers | QTSP certification process |
| Protocol for combining L1/L2 anchoring with L3/L4 signatures | Key management at the QTSP |
| Verification path for combined proofs | Commercial terms |
| attestation.json interoperability | eIDAS conformity assessment |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Artifact (bytes)                │
│                                                  │
│  SHA-256 ──┬──► Umarise Anchor (L1/L2)          │
│            │    └─ .ots proof → Bitcoin ledger   │
│            │                                     │
│            └──► QTSP Signature (L3/L4)           │
│                 └─ QES → eIDAS trust chain       │
│                                                  │
│  Combined Evidence Kit:                          │
│  ├── artifact.{ext}                              │
│  ├── certificate.json (v1.3)                     │
│  ├── proof.ots                                   │
│  ├── attestation.json (QTSP-signed)              │
│  ├── signature.xades / signature.pades           │
│  └── VERIFY.txt                                  │
└─────────────────────────────────────────────────┘
```

The two trust chains are **independent**: the .ots proof verifies against the Bitcoin ledger without the QTSP, and the QES verifies against the eIDAS trust list without Umarise.

---

## 4. Assurance Levels

| Level | Method | Establishes | Dependency |
|-------|--------|-------------|------------|
| L1 | Anchoring (passkey-only) | Temporal existence | None (Bitcoin ledger) |
| L2 | Anchoring + KYC/video-ident | Temporal existence + verified identity | KYC provider |
| L3 | Anchoring + notarial attestation | Temporal existence + legal attestation | Attestant |
| L4 | Anchoring + QES (eIDAS Art. 25.2) | Temporal existence + qualified signature | QTSP |

L4 is the only level where legal equivalence to a handwritten signature applies (eIDAS Art. 25.2).

---

## 5. XAdES Integration Protocol

### 5.1 Container Structure

The QTSP generates a XAdES-B-LT or XAdES-B-LTA envelope. The Umarise .ots proof is embedded as an unsigned property.

```xml
<xades:QualifyingProperties>
  <xades:SignedProperties>
    <xades:SignedSignatureProperties>
      <xades:SigningTime>2026-03-03T12:00:00Z</xades:SigningTime>
      <xades:SigningCertificateV2>
        <!-- QTSP certificate chain -->
      </xades:SigningCertificateV2>
    </xades:SignedSignatureProperties>
    <xades:SignedDataObjectProperties>
      <xades:DataObjectFormat ObjectReference="#artifact">
        <xades:MimeType>application/octet-stream</xades:MimeType>
      </xades:DataObjectFormat>
    </xades:SignedDataObjectProperties>
  </xades:SignedProperties>

  <xades:UnsignedProperties>
    <xades:UnsignedSignatureProperties>
      <!-- Umarise anchoring proof -->
      <xades:ArchiveTimeStamp>
        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <xades:EncapsulatedTimeStamp Encoding="http://uri.etsi.org/01903/v1.3.2#DER">
          <!-- Base64-encoded .ots proof bytes -->
        </xades:EncapsulatedTimeStamp>
      </xades:ArchiveTimeStamp>

      <!-- Umarise certificate reference -->
      <AnchoringReference xmlns="https://anchoring-spec.org/v1.0/xades">
        <OriginId>1916F13F</OriginId>
        <HashAlgorithm>SHA-256</HashAlgorithm>
        <HashValue>abc123...def</HashValue>
        <SpecificationVersion>anchoring-spec.org/v1.3</SpecificationVersion>
        <VerifyURL>https://verify-anchoring.org</VerifyURL>
      </AnchoringReference>
    </xades:UnsignedSignatureProperties>
  </xades:UnsignedProperties>
</xades:QualifyingProperties>
```

### 5.2 Binding Invariants

1. The `HashValue` in `AnchoringReference` MUST equal the SHA-256 hash of the signed artifact
2. The `OriginId` MUST match the `origin_id` in the accompanying `certificate.json`
3. The .ots proof MUST be independently verifiable via `ots verify` without QTSP infrastructure
4. The QES MUST be independently verifiable via the eIDAS trust list without Umarise infrastructure

### 5.3 Verification Procedure

A verifier performs two independent checks:

```
Check 1 (Anchoring):
  Input:  artifact bytes + .ots proof
  Method: ots verify proof.ots
  Output: valid | invalid | unverifiable
  Trust:  Bitcoin ledger (no QTSP needed)

Check 2 (QES):
  Input:  XAdES envelope + QTSP certificate
  Method: Standard XAdES validation (ETSI EN 319 132)
  Output: valid | invalid
  Trust:  eIDAS trust list (no Umarise needed)

Combined result:
  Both valid → L4 (temporal existence + qualified identity)
  Only Check 1 valid → L1/L2 (temporal existence only)
  Only Check 2 valid → QES without temporal anchoring
```

---

## 6. PAdES Integration Protocol

### 6.1 Container Structure

For PDF artifacts, the QTSP creates a PAdES-B-LT or PAdES-B-LTA signature. The .ots proof is embedded as a Document Security Store (DSS) entry or as a PDF embedded file.

```
PDF structure:
├── /Root
│   ├── /AcroForm
│   │   └── /SigField (QTSP signature)
│   ├── /DSS
│   │   ├── /OCSPs [...]
│   │   ├── /CRLs [...]
│   │   └── /Certs [...]
│   └── /Names
│       └── /EmbeddedFiles
│           ├── proof.ots          (binary OTS proof)
│           ├── certificate.json   (Umarise certificate v1.3)
│           └── attestation.json   (if L3 attestation present)
```

### 6.2 Binding Invariants

1. The SHA-256 hash of the PDF content stream (excluding signature dictionary) MUST match the hash in `certificate.json`
2. The embedded `proof.ots` MUST correspond to the same hash
3. The PAdES signature covers the entire PDF including embedded files
4. Embedded files are accessible without specialized tools (standard PDF readers)

### 6.3 Verification Procedure

```
Check 1 (Anchoring):
  Extract proof.ots from PDF embedded files
  Extract certificate.json from PDF embedded files
  Compute SHA-256 of original content
  Run: ots verify proof.ots
  Compare hash with certificate.json.hash

Check 2 (QES):
  Validate PAdES signature per ETSI EN 319 142
  Verify certificate chain against eIDAS trust list

Combined result: same matrix as XAdES (Section 5.3)
```

---

## 7. attestation.json for QTSP

When a QTSP acts as the attestant, the `attestation.json` follows the published v1.0 format with QTSP-specific fields:

```json
{
  "attestation_version": "1.0",
  "attestation_id": "uuid-v4",
  "origin_id": "1916F13F",
  "hash": "sha256-of-artifact",
  "hash_algo": "SHA-256",
  "attested_at": "2026-03-03T12:00:00Z",
  "attestant": {
    "name": "Example QTSP B.V.",
    "type": "qtsp",
    "public_key_pem": "-----BEGIN PUBLIC KEY-----\n...",
    "certificate_url": "https://example-qtsp.eu/cert/abc123",
    "eidas_trust_list_entry": "https://eidas.ec.europa.eu/efda/tl-browser/#/..."
  },
  "signature": "base64-ecdsa-signature",
  "signature_input": "attestation_id|origin_id|hash|attested_at",
  "spec_reference": "anchoring-spec.org/v1.0"
}
```

The `eidas_trust_list_entry` field allows automated verification of the QTSP's qualification status.

---

## 8. Implementation Checklist for QTSPs

### Prerequisites

- [ ] QTSP has valid eIDAS qualification for creating QES
- [ ] QTSP can generate ECDSA P-256 or RSA-2048+ signatures
- [ ] QTSP has access to Umarise Core API (or receives .ots proofs out-of-band)

### Integration Steps

| Step | Action | Artifact |
|------|--------|----------|
| 1 | Receive artifact + certificate.json from client | Input |
| 2 | Verify hash: `SHA-256(artifact) == certificate.json.hash` | Validation |
| 3 | Retrieve .ots proof via `/v1-core-origins-proof/{origin_id}` or from Evidence Kit | proof.ots |
| 4 | Generate attestation.json with QTSP keys (`scripts/attest-origin.sh` or equivalent) | attestation.json |
| 5a | **XAdES path**: Embed .ots + AnchoringReference in UnsignedProperties | XAdES envelope |
| 5b | **PAdES path**: Embed proof.ots + certificate.json as PDF embedded files | Signed PDF |
| 6 | Sign the container with QES | L4 artifact |
| 7 | Return signed container + attestation.json to client | Evidence Kit (L4) |

### Verification Test

```bash
# Step 1: Verify anchoring independently
ots verify proof.ots

# Step 2: Verify QES independently (example with OpenSSL)
openssl cms -verify -in signature.p7s -inform DER \
  -CAfile eidas-trust-chain.pem -content artifact.bin

# Step 3: Verify attestation independently
./scripts/attest-origin.sh verify attestation.json
```

---

## 9. Security Considerations

| Concern | Mitigation |
|---------|------------|
| QTSP signs a different hash than anchored | Verifier checks SHA-256(artifact) against both certificate.json and QES |
| .ots proof tampered in XAdES envelope | .ots is in UnsignedProperties (by design); verifier re-derives from artifact hash |
| QTSP becomes unavailable | QES verifiable via cached CRL/OCSP; anchoring verifiable via Bitcoin ledger |
| Umarise becomes unavailable | .ots proof + Bitcoin ledger sufficient for temporal verification |
| Hash algorithm migration | certificate.json.hash_algo field enables future algorithm agility |

---

## 10. Open Questions (for QTSP discussion)

1. **ArchiveTimeStamp vs custom element**: Should the .ots proof use the standard `<xades:ArchiveTimeStamp>` element or a custom namespace? The standard element may cause validation warnings in tools expecting RFC 3161 timestamps.

2. **PAdES incremental save**: How to handle the hash binding when the PDF is incrementally saved after embedding? Recommendation: anchor the pre-signature content stream.

3. **Long-term archival (LTA)**: Should the QTSP add validation data for the .ots proof itself, or is Bitcoin ledger permanence sufficient?

---

## References

- [Anchoring Specification (IEC) v1.0](https://anchoring-spec.org/v1.0/)
- [eIDAS Regulation (EU) No 910/2014, Art. 25–28](https://eur-lex.europa.eu/eli/reg/2014/910/oj)
- [ETSI EN 319 132 — XAdES](https://www.etsi.org/deliver/etsi_en/319100_319199/31913201/)
- [ETSI EN 319 142 — PAdES](https://www.etsi.org/deliver/etsi_en/319100_319199/31914201/)
- [attestation.json v1.0 Field Specification](/technical)
- [scripts/attest-origin.sh — Independent attestation tool](../scripts/attest-origin.sh)

---

*This blueprint is informative, not normative. The Anchoring Specification (IEC) remains the sole normative reference for anchoring semantics.*
