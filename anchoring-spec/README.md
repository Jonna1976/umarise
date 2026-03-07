# anchoring-spec.org

**Anchoring Specification (IEC)**

---

## What this is

This repository contains the normative Anchoring Specification (IEC).

Anchoring is a public infrastructure primitive built on cryptographic commitments. It establishes one property only:

> **The exact bytes of an artifact existed on or before time T.**

The specification defines:

- the verification function `V(B, P, L) → { valid | invalid | unverifiable }`
- output semantics and their conditions
- proof structure requirements
- ledger qualification criteria
- semantic exclusions (authorship, ownership, originality, identity, intent, legal enforceability, truthfulness)
- the independence requirement for compliant proofs
- threat model and security assumptions
- cryptographic requirements
- time semantics
- non-retroactivity
- compliance statement requirements
- archival considerations
- governance model
- legal scope

---

## What this is not

This is not a product. This is not marketing material. This is not documentation for a specific implementation.

This is a specification.

---

## Relationship to implementations

| Domain | Role | Relationship |
|---|---|---|
| anchoring-spec.org | Normative specification | Depends on nothing |
| verify-anchoring.org | Reference verifier | Implements this spec |
| anchoring.app | Capture UI | Implements this spec |
| umarise.com | Commercial infrastructure | Implements this spec |

**The specification is normative. Implementations are not.**

If any behavior in an implementation conflicts with this specification, the specification prevails.

---

## Structure

```
/                          → Current normative version (v1.0)
/v1.0/                     → Permanent, citable v1.0
/proof-container/          → Proof Container Specification v1.0
/one-page/                 → Compact academic reference
/appendix/why-anchoring/   → Non-normative context (informative only)
```

---

## How to cite

```
Anchoring Specification (IEC), Version 1.0.
Published: February 2026.
Canonical URL: https://anchoring-spec.org/v1.0/
Repository: https://github.com/AnchoringTrust/anchoring-spec
License: Public Domain (Unlicense)
```

BibTeX:
```bibtex
@misc{iec-anchoring-v1,
  title        = {Anchoring Specification ({IEC})},
  version      = {1.0},
  year         = {2026},
  url          = {https://anchoring-spec.org/v1.0/},
  note         = {Public domain. Normative specification for cryptographic anchoring.}
}
```

---

## Versioning

IEC uses **MAJOR.MINOR** versioning.

- **MAJOR** increments indicate breaking semantic changes
- **MINOR** increments indicate clarifications without semantic change

All published versions remain permanently accessible. Versions are immutable once published.

### Immutability discipline

- v1.0 text is **frozen**. It will not be modified after publication.
- Corrections are published as errata (e.g., `v1.0-errata`) or as a new minor version (`v1.1`).
- Each version is permanently citable at its canonical URL.

---

## Governance

The Anchoring Specification is a public, versioned technical specification.

While IEC was initially authored and published by Umarise, the specification is open for implementation by any party without restriction. Governance is designed to evolve independently of any single organization or implementation.

No implementation has normative authority over the specification.

---

## Reference verifier

An independent reference verifier is available at [verify-anchoring.org](https://verify-anchoring.org).

The reference verifier makes no API calls to any implementation. It can be forked, self-hosted, and audited by any party.

---

## Hosting

Static HTML files hosted on GitHub Pages.

No build step. No framework. No backend. No CMS. No analytics.

---

## License

Public domain ([Unlicense](https://unlicense.org)). No restrictions.
