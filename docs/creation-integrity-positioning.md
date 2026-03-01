# Creation Integrity — Positioning for Research Governance

> **Version**: 1.0  
> **Date**: March 2026  
> **Audience**: Research integrity officers, data stewards, institutional CTO's, deans of research  
> **Status**: Canonical reference — refers to Canon v5.1 §XII

---

## I. WHAT CREATION INTEGRITY IS

Creation Integrity is the verifiable property that a specific digital artifact existed in its exact form at or before a specific moment in time.

It is established when three conditions are met simultaneously:

1. **Byte-identity** — A cryptographic hash uniquely identifies the artifact
2. **Temporal anchoring** — The hash is committed to an immutable, external ledger
3. **Independent verifiability** — The proof can be validated without the issuing party

If any condition is absent, Creation Integrity is not established.

This is a protocol-level property, not a product feature. It is defined by the [Anchoring Specification (IEC)](https://anchoring-spec.org/v1.0/), an open, public domain standard.

---

## II. WHAT IT IS NOT

| Creation Integrity is not… | Because… |
|---------------------------|----------|
| A replacement for Git | Git tracks version history. CIL establishes temporal existence of a specific state. |
| A replacement for Electronic Lab Notebooks | ELNs manage research process. CIL anchors specific artifacts produced by that process. |
| A replacement for Data Management Plans | DMPs define intent and policy. CIL records fact. |
| Authorship proof | It records that bytes existed. It does not record who produced them. |
| Content authentication | It establishes byte-identity, not truthfulness or meaning. |

**It is a supplementary infrastructure layer beneath existing systems.**

An institution that adopts Creation Integrity does not replace its current tooling. It adds a verifiable anchoring layer underneath.

---

## III. THE INSTITUTIONAL PRINCIPLE

> Internal audit trails are supplementary.  
> External anchoring is determinative.

Internal logs — Git timestamps, repository deposit dates, internal databases — are controlled by the institution that produces them. They are useful for process management. They are insufficient for independent verification.

Creation Integrity requires external commitment: a hash anchored in a ledger that the institution does not control. This is what makes the proof independently verifiable.

---

## IV. WHAT THIS SOLVES

### Priority disputes

Without Creation Integrity, priority is established through:
- Journal submission timestamps (controlled by publishers)
- Repository deposit dates (controlled by institutions)
- Email timestamps (trivially fabricated)

With Creation Integrity, priority becomes deterministic: the artifact's hash is committed to the Bitcoin blockchain via the OpenTimestamps protocol. The timestamp is mathematically verifiable by any party, without contacting the institution, the publisher, or the anchoring provider.

### Artifact authenticity

In a generative era, the question shifts from *"who created this?"* to *"did this specific version exist before it could have been fabricated?"*

Creation Integrity answers the second question. It does not answer the first. That boundary is permanent.

### Governance resilience

Policies based on internal logs are vulnerable to:
- System migrations that lose metadata
- Administrative changes that alter access controls
- Infrastructure failures that compromise audit trails

Externally anchored proofs survive all of these. The proof artifact (a `.ots` file) is a portable, self-contained mathematical commitment that remains valid regardless of institutional infrastructure changes.

---

## V. GOVERNANCE INTEGRATION

An institution can formalize Creation Integrity through:

| Action | Scope |
|--------|-------|
| Adapt Research Integrity Policy | Add Creation Integrity as a recommended or required practice for priority-sensitive outputs |
| Define as technical standard in data governance | Include anchoring in institutional data management frameworks |
| Require at PhD project initiation | Anchor initial research proposals, data collection protocols, and experimental designs |
| Integrate in institutional repository workflow | Anchor artifacts at deposit time, store proof alongside the artifact |

This requires no fundamental restructuring of research processes. Only an additional anchoring step.

---

## VI. RISK MANAGEMENT

### What not to rely on

| Practice | Risk |
|----------|------|
| Git timestamps | Controlled by the repository owner. Rewritable via force-push or repository migration. |
| Repository deposit dates | Controlled by the institution. Subject to administrative changes. |
| Internal log files | Controlled by infrastructure. Subject to system failures and migrations. |

### Verification discipline

| Action | Frequency |
|--------|-----------|
| Verify proof after 12 months | Confirms long-term validity of the anchoring |
| Check reproducibility | Re-hash the original artifact, compare against stored hash |
| Validate independently of original provider | Use [verify-anchoring.org](https://verify-anchoring.org) or any OTS-compatible verifier |

Long-term validity is a structural property, not a service commitment.

---

## VII. STRATEGIC IMPACT

With Creation Integrity:

- Evidence becomes **deterministic** instead of probabilistic
- Priority disputes become **resolvable** through mathematical verification
- Governance becomes **future-proof** — proofs survive institutional changes
- Artifact authenticity becomes **structurally reinforced** against generative fabrication

In a generative era, this is not optimization. It is stabilization.

---

## VIII. IMPLEMENTATION LANDSCAPE

Creation Integrity is a property. It can be produced by any system that satisfies the three conditions (§I).

| Layer | Example | Role |
|-------|---------|------|
| Normative specification | [Anchoring Specification (IEC)](https://anchoring-spec.org/v1.0/) | Defines valid anchoring |
| Reference verifier | [verify-anchoring.org](https://verify-anchoring.org) | Independent, zero-API verification |
| Infrastructure | [Umarise Core](https://umarise.com/api-reference) | One implementation that produces Creation Integrity |

The specification is normative. Implementations are not.

An institution may use Umarise, build its own implementation, or use any future system that satisfies IEC. The property is independent of the provider.

---

## IX. POSITIONING

Creation Integrity is not a tool.

It is a protocol-layer for research governance.

The implementation may be commercial. The verification must remain public and independent. That distinction determines whether it becomes infrastructure — or merely software.

---

*This document references [Canon v5.1 §XII](./canon-v5.md) for the formal definition of Creation Integrity.*  
*The [Anchoring Specification (IEC v1.0)](https://anchoring-spec.org/v1.0/) is the normative standard.*  
*The specification is normative. This document is not.*
