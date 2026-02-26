# Anchoring Specification (IEC) — Version 1.0

> **Status:** Normative  
> **Version:** 1.0 (Frozen)  
> **Canonical URL:** https://anchoring-spec.org/v1.0/  
> **License:** Public Domain (Unlicense)

---

## 1. Purpose

This specification defines anchoring: an infrastructure primitive built on cryptographic commitments.

Anchoring establishes one property only:

> **The exact bytes of an artifact existed on or before time T.**

No additional claims are made.

---

## 2. Scope

Anchoring is defined as:

> The process of creating a cryptographic commitment to a byte sequence and binding that commitment to a publicly verifiable time reference.

This specification defines the verification semantics, proof structure, and ledger requirements for anchoring.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Artifact | An arbitrary byte sequence submitted for anchoring |
| Hash | The output of a cryptographic hash function applied to the artifact |
| Proof | A structured bundle containing the hash, timestamp, and ledger binding |
| Ledger | A publicly verifiable, append-only record used as time reference |
| Anchoring | The complete process from hash computation to ledger binding |

---

## 4. Verification Function

The verification function is defined as:

```
V(B, P, L) → { valid | invalid | unverifiable }
```

Where:
- **B** = artifact byte sequence
- **P** = proof bundle
- **L** = publicly verifiable ledger infrastructure

---

## 5. Output Semantics

| Output | Condition |
|--------|-----------|
| **valid** | Hash of B matches P, and P is bound to L with verified time T |
| **invalid** | Hash of B does not match P, or P contains inconsistent data |
| **unverifiable** | P cannot be validated against L (e.g., ledger unavailable, proof incomplete) |

No other outputs are permitted for a conformant implementation.

---

## 6. Proof Structure

A conformant proof bundle SHALL contain:

1. The hash of the artifact
2. The hash algorithm identifier
3. A timestamp or time reference
4. A ledger binding (e.g., OpenTimestamps proof, blockchain transaction)

A conformant proof bundle MAY contain:

- The original artifact
- Metadata (origin identifier, capture context)
- Additional attestations

---

## 7. Ledger Qualification

A qualified ledger SHALL:

1. Be publicly accessible without permission
2. Be append-only (no retroactive modification)
3. Provide independently verifiable time ordering
4. Not be controlled by the proof issuer

---

## 8. Semantic Exclusions

Anchoring explicitly does NOT establish:

- **Authorship** — who created the artifact
- **Ownership** — who has rights to the artifact
- **Originality** — whether the artifact is novel
- **Identity** — who submitted the artifact
- **Intent** — why the artifact was anchored
- **Legal enforceability** — whether the proof has legal standing
- **Truthfulness** — whether the artifact content is accurate

These exclusions are non-negotiable.

---

## 9. Independence Requirement

A conformant proof SHALL be verifiable without reliance on:

- the issuer of the proof
- any infrastructure operated by the issuer
- any account or credential system

Verification must be achievable using:

- the proof bundle
- publicly available cryptographic tools
- the public ledger

If a proof requires issuer-controlled infrastructure for verification, it is non-conformant.

---

## 10. Threat Model

The specification assumes the following threat model:

- The artifact submitter may be adversarial
- The proof issuer may become unavailable
- Network infrastructure may be unreliable
- Time sources may be manipulated (mitigated by ledger consensus)

The specification does NOT protect against:

- Pre-computation attacks (submitting a hash before creating the artifact)
- Collision attacks on the hash function (mitigated by algorithm requirements)

---

## 11. Cryptographic Requirements

- Hash algorithms MUST provide collision resistance appropriate to the security level
- SHA-256 is the reference algorithm for this version
- Algorithm agility: implementations SHOULD support algorithm migration without breaking existing proofs
- The hash algorithm identifier MUST be included in the proof bundle

---

## 12. Governance

The Anchoring Specification is a public, versioned technical specification.

IEC was initially authored and published by Umarise. The specification is open for implementation by any party without restriction.

Governance is designed to evolve independently of any single organization or implementation. Implementations may reference compliance with a specific IEC version. No implementation has normative authority over the specification.

---

## 13. Legal Scope

This specification defines technical semantics only. It makes no claims about:

- legal admissibility in any jurisdiction
- regulatory compliance
- contractual obligations

Legal interpretation of anchoring proofs is outside the scope of this specification.

---

## 14. Time Semantics

Time in anchoring refers to ledger consensus time, not wall-clock time.

- The timestamp represents the time at which the ledger confirmed the binding
- Clock skew between submission and confirmation is expected
- The specification establishes "at or before T," not "exactly at T"

---

## 15. Non-Retroactivity

A conformant proof demonstrates existence at or before time T. It does not demonstrate:

- existence before a specific earlier time
- continuous existence
- non-existence before T

---

## 16. Compliance Statements

An implementation claiming IEC conformance SHALL:

1. Implement the verification function as defined in Section 4
2. Produce only the outputs defined in Section 5
3. Respect all semantic exclusions defined in Section 8
4. Satisfy the independence requirement defined in Section 9
5. Include the disclaimer: "The specification is normative. This implementation is not."

---

## 17. Non-Conformance

An implementation is non-conformant if it:

- produces outputs not defined in Section 5
- claims to establish any property excluded in Section 8
- requires issuer-controlled infrastructure in violation of Section 9

---

## 18. Archival Considerations

Long-term verifiability depends on:

- preservation of proof bundle integrity
- continued availability of ledger validation data
- continued availability of cryptographic verification algorithms

Anchoring proofs SHOULD be stored in durable, non-proprietary formats.

---

*Canonical publication: [anchoring-spec.org/v1.0/](https://anchoring-spec.org/v1.0/)*  
*The specification is normative. Implementations are not.*
