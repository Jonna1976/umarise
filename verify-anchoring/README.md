# verify-anchoring.org

**Reference Verifier for the Anchoring Specification (IEC)**

---

## Purpose

This repository contains a reference implementation of verification under the Anchoring Specification (IEC).

It implements the verification function:

```
V(B, P, L) → { valid | invalid | unverifiable }
```

Where:

- **B** = artifact byte sequence
- **P** = proof bundle
- **L** = publicly verifiable ledger infrastructure

---

## Scope

This verifier establishes one property only:

> **The exact bytes of the artifact existed on or before time T.**

No additional claims are made.

Specifically, this verifier does not establish:

- authorship
- ownership
- originality
- legal status
- identity
- intent
- truthfulness

---

## Independence

This verifier:

- makes no calls to any Umarise-operated service
- requires no account
- stores no data
- depends on no backend infrastructure

It can be forked, audited, and self-hosted by any party.

Verification does not require the continued existence of the issuer of the proof.

---

## Relationship to IEC

The Anchoring Specification (IEC) is normative.

This repository provides a reference implementation.

**If any behavior in this implementation conflicts with the specification, the specification prevails.**

> The specification is normative. This implementation is not.

---

## Origin ZIP structure

```
origin-proof.zip
├── artifact.ext
├── certificate.json
├── attestation.json      (optional)
├── VERIFY.txt
└── proof.ots             (optional)
```

### certificate.json

```json
{
  "origin_id": "uuid",
  "hash": "sha256:abc123...",
  "captured_at": "2025-01-15T10:30:00Z",
  "proof_status": "anchored"
}
```

---

## Dependencies

- **JSZip 3.10.1** (loaded with Subresource Integrity protection)
- **Web Crypto API** (native browser implementation)
- **OpenTimestamps** (for Bitcoin ledger verification)

No server runtime. No API keys. No account system.

---

## Hosting

This is a single static HTML file. It can be hosted on:

- GitHub Pages
- Cloudflare Pages
- Netlify / Vercel
- Any nginx or Apache server
- Local file system

No build step. No framework. No backend.

---

## License

Public domain. No restrictions.

Fork, modify, mirror, redistribute.
