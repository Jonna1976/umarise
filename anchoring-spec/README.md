# anchoring-spec.org

**Anchoring Specification (IEC)**

---

## What this is

This repository contains the normative Anchoring Specification (IEC).

It defines:

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
/one-page/                 → Compact academic reference
/appendix/why-anchoring/   → Non-normative context (informative only)
```

---

## Versioning

IEC uses **MAJOR.MINOR** versioning.

- **MAJOR** increments indicate breaking semantic changes
- **MINOR** increments indicate clarifications without semantic change

All published versions remain permanently accessible. Versions are immutable once published.

---

## Governance

The Anchoring Specification is a public, versioned technical specification.

It is not proprietary to any single implementation or commercial entity.

Implementations may reference compliance with a specific IEC version.

No implementation has normative authority over the specification.

---

## Hosting

Static HTML files hosted on GitHub Pages.

No build step. No framework. No backend. No CMS. No analytics.

---

## License

Public domain. No restrictions.
