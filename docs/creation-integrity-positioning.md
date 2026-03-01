# Creation Integrity - Positioning for Research Governance

> **Version**: 1.1  
> **Date**: March 2026  
> **Audience**: Research integrity officers, data stewards, institutional CTOs, deans of research  
> **Status**: Canonical reference - see Canon v5.2 XII

---

## I. Definition

Creation Integrity is the verifiable property that a specific digital artifact existed in its exact byte-form at or before a specific moment in time.

It is established if and only if three conditions are met:

1. **Byte-Identity** - A cryptographic hash uniquely represents the artifact
2. **Temporal Anchoring** - The hash is committed to an immutable external ledger
3. **Independent Verifiability** - The proof can be validated without reliance on the issuing party

If any condition is absent, Creation Integrity is not established.

Creation Integrity is a protocol-level property defined by the [Anchoring Specification (IEC)](https://anchoring-spec.org/v1.0/). It is not a product feature and is not owned by any implementation.

---

## II. Boundary Conditions

Creation Integrity does not replace existing research systems. It operates beneath them.

| It is not... | Because... |
|---|---|
| A replacement for Git | Git records change history; Creation Integrity establishes temporal existence of a specific state |
| A replacement for ELNs | ELNs manage research workflow; Creation Integrity anchors discrete outputs |
| A replacement for DMPs | DMPs define policy; Creation Integrity records fact |
| Authorship proof | It establishes existence, not identity |
| Content validation | It establishes byte-identity, not truth or meaning |

Creation Integrity is a supplementary infrastructure layer.

---

## III. Institutional Principle

> Internal audit trails are supplementary.  
> External anchoring is determinative.

Internal logs - repository timestamps, ELN metadata, institutional databases - are controlled by the institution that generates them. They support process management but do not provide independent verification.

Creation Integrity requires external commitment to a ledger outside institutional control. This is what makes the proof independently verifiable.

---

## IV. Governance Relevance

### Priority Determination

Absent Creation Integrity, priority relies on:

- Journal submission timestamps
- Repository deposit dates
- Internal documentation

All are institutionally controlled.

With Creation Integrity, the artifact's hash is externally anchored. Verification requires no contact with the institution, publisher, or implementation provider.

Priority becomes mathematically verifiable.

### Artifact Existence in a Generative Context

In environments where digital artifacts can be retroactively fabricated, the evidentiary question shifts:

- Not "who created this?"
- But "did this specific byte sequence exist before it could have been fabricated?"

Creation Integrity addresses the second question only.

### Infrastructure Resilience

Institutional systems evolve:

- Repositories migrate
- Access controls change
- Infrastructure fails

Externally anchored proofs remain valid independent of these changes.

Creation Integrity is infrastructure-resilient by design.

---

## V. Governance Integration

Institutions may formalize Creation Integrity through:

| Action | Effect |
|---|---|
| Update Research Integrity Policy | Recognize Creation Integrity as recommended or required for priority-sensitive outputs |
| Integrate into Data Governance Standards | Define anchoring as part of artifact lifecycle management |
| Apply at PhD or grant initiation | Anchor proposals, protocols, datasets at first stable state |
| Integrate at repository deposit | Store proof alongside deposited artifacts |

No existing system requires replacement. Anchoring is an additional step in the artifact lifecycle.

---

## VI. Risk Clarification

### Practices That Do Not Establish Creation Integrity

| Practice | Limitation |
|---|---|
| Git timestamps | Repository-controlled; mutable through administrative actions |
| Repository deposit dates | Institution-controlled |
| Internal logs | Infrastructure-dependent |

### Verification Discipline

Long-term validity depends on:

- Recomputing the hash of the original artifact
- Validating the proof against the ledger
- Performing verification independently of the original provider

Creation Integrity is a structural property, not a service commitment.

---

## VII. Strategic Impact

Creation Integrity introduces:

- Deterministic temporal existence
- Independently verifiable priority
- Infrastructure-level resilience
- Structural reinforcement against retroactive fabrication

In generative environments, deterministic temporal anchoring provides evidentiary stability where reconstructive verification becomes probabilistic.

---

## VIII. Implementation Neutrality

Creation Integrity is defined by specification, not by vendor.

| Layer | Role |
|---|---|
| [Anchoring Specification (IEC)](https://anchoring-spec.org/v1.0/) | Normative definition of valid anchoring |
| [Independent Verifier](https://verify-anchoring.org) | Public validation of proofs |
| Implementation (e.g., Umarise Core) | System that performs anchoring according to specification |

Any implementation that satisfies the specification can produce Creation Integrity.

No implementation defines it.

---

## IX. Position

Creation Integrity is a protocol-layer for research governance.

Implementations may be commercial.
Verification must remain public and independent.

That distinction determines whether Creation Integrity functions as infrastructure rather than software.

---

*This document references Canon v5.2 XII for the formal definition.*  
*The [Anchoring Specification (IEC v1.0)](https://anchoring-spec.org/v1.0/) defines the normative standard.*
