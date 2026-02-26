# anchoring-spec.org

**Anchoring Specification (IEC)**

---

## What this is

This repository contains the normative Anchoring Specification (IEC).

It defines:

- the verification function `V(B, P, L) → { valid | invalid | unverifiable }`
- the permitted outputs and their conditions
- the semantic scope of anchoring (existence-at-or-before-T only)
- the exclusion of non-chronological claims
- the independence requirement for compliant proofs
- ledger qualification criteria

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

## Versioning

- `/v1.0/` — Current normative version
- `/` — Always points to the current version

Versions are immutable once published. Corrections are issued as new versions.

---

## Hosting

This is a single static HTML file hosted on GitHub Pages.

No build step. No framework. No backend. No CMS. No analytics.

---

## License

Public domain. No restrictions.
