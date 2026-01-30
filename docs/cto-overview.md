# Umarise: Origin Record Layer

> A system-of-record that captures and preserves original state before transformation.

---

## What Umarise Is

Umarise is an origin record layer. It records a deterministic fingerprint of any artifact—document, image, message, dataset—before processing, transformation, or AI touches it.

The record consists of three elements:
- **SHA-256 hash** — cryptographic fingerprint of the original bytes
- **captured_at** — timestamp of when the origin was recorded
- **origin_id** — unique reference for resolution and verification

This creates an immutable anchor point. Any modification to the original bytes produces a different hash. Verification is binary: match or no match.

---

## What Umarise Does

| Function | Description |
|----------|-------------|
| **Record** | Capture what existed at a specific moment |
| **Resolve** | Return metadata and artifact reference by origin_id or hash |
| **Verify** | Confirm bit-identity between stored origin and provided content |

Umarise is resolved and verified—never searched. Search happens in partner systems. Umarise provides identity and verification.

---

## What Umarise Does Not Do

| Excluded | Reason |
|----------|--------|
| Search / semantics | Interpretation creates bias; Umarise is a neutral anchor |
| Governance / policy | Enforcement is a layer above; Umarise provides evidence |
| Data enrichment | Processing transforms; Umarise preserves |
| User authentication | Identity is separate infrastructure |

These are not missing features. They are architectural boundaries that preserve neutrality.

---

## Why This Matters

Without origin, systems can operate. With origin, they can withstand scrutiny.

| Scenario | Without Origin | With Origin |
|----------|----------------|-------------|
| AI output disputed | "Prove the input was correct" | Input hash + timestamp = verifiable |
| Contract version contested | Legal discovery required | Bit-identity proof resolves in seconds |
| Authorship claimed | Assertion vs. assertion | First-recorded hash = defensible claim |

Origin shifts disputes from interpretive (legal) to deterministic (technical).

---

## Partner Vault Mode

Umarise does not require custody of sensitive data.

| Component | Location | Reconstructable? |
|-----------|----------|------------------|
| SHA-256 hash | Umarise | No (one-way) |
| Timestamp + origin_id | Umarise | N/A |
| Original bytes | Partner vault | Yes |

Partners keep their data. Umarise keeps the fingerprint. Verification works without Umarise accessing the original content.

---

## Integration Model

```
Partner System (Search/AI/Workflow)
         │
         │ resolve by origin_id or hash
         ▼
┌─────────────────────────┐
│   Umarise Origin Layer  │
│   GET /resolve          │
│   POST /verify          │
└─────────────────────────┘
```

You search in your systems. You verify at Umarise.

---

## The Discipline

The value of origin proof depends on what Umarise refuses to do:

- **No updates** — Origins are write-once. Errors remain visible.
- **No interpretation** — Umarise records; it does not judge.
- **No lock-in** — SHA-256 is a standard. Verification works without Umarise.

This self-restraint is the product. Convenience features would undermine the core invariant.

---

## Core Statement

**Umarise makes systems defensible by making origin verifiable—before transformation occurs.**

---

## Negative Dependency Test

If your system:
- Needs to edit its past → Umarise is not for you
- Needs to stand by its past → Umarise provides the proof

Recording origin is a transparency signal. Refusing to record is also a signal.

---

*Document version: 1.0*  
*Infrastructure, not product.*
