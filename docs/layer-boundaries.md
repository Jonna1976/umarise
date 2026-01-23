# Layer Boundaries — Origin Layer vs Governance Layer

> This document defines the explicit boundary between what Umarise implements and what belongs to upstream governance systems.  
> Strategic protection against scope-creep and political claims.

---

## 1. What Umarise IS

### Definition

> **Umarise is an origin record layer.**  
> A system-of-record that captures and preserves original state before transformation.

### Concrete responsibilities

| Function | Description |
|----------|-------------|
| **Record** | Capture what existed |
| **Prove** | Demonstrate it is unchanged |
| **Expose** | Make it visible to downstream systems |

### Core statement

> **Umarise registers. It does not judge.**

---

## 2. What Umarise is NOT

Umarise is explicitly **not**:

| Not This | Why |
|----------|-----|
| Governance engine | Does not enforce rules |
| Identity provider | Does not authenticate users |
| Compliance system | Does not audit behavior |
| Policy enforcer | Does not block actions |
| Truth authority | Does not determine correctness |
| Workflow controller | Does not orchestrate processes |

### Critical distinction

> **Umarise does not determine what is "true", "correct", or "permitted".**

---

## 3. Where Governance Begins

Governance emerges **above** Umarise when other systems:

- Make origin **mandatory**
- Enforce **provenance**
- Sanction **absence**
- Attribute **responsibility**

### Governance layers (not implemented by Umarise)

| Layer | Umarise Status |
|-------|----------------|
| Identity & signing | ❌ Not implemented |
| Policy enforcement | ❌ Not implemented |
| Audit & compliance | ❌ Not implemented |
| Dispute resolution | ❌ Not implemented |
| Legal attestation | ❌ Not implemented |

> **Umarise is the precondition for governance, not its executor.**

---

## 4. What Umarise Enables (Without Enforcing)

With Umarise in place, governance systems can:

| Capability | How |
|------------|-----|
| Show explicit origin for every transformation | Origin links are available |
| Detect any modification | Hash comparison reveals changes |
| Verify any claim | Bit-identity proof is cryptographic |
| Hold any system accountable | Evidence exists independently |

### The trade-off

> **Without Umarise, governance is symbolic.**  
> **With Umarise, governance becomes enforceable by others.**

---

## 5. Essential Design Choice

> **Umarise exists within the system, but does not control the system.**

This is not a paradox — this is correct infrastructure.

### Architectural metaphor

Umarise is like a **notary stamp**:
- It records that something existed at a point in time
- It does not decide whether that thing is valid, legal, or good
- It enables others to make those decisions with evidence

---

## 6. Positioning Statements

### For partners

> "Umarise doesn't govern.  
> It makes governance unavoidable."

### For technical audiences

> "The demo implements the origin record layer.  
> Governance emerges when identity, policy, and enforcement are layered on top."

### For integration discussions

> "We provide the evidence layer.  
> You provide the rules."

---

## 7. Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   GOVERNANCE LAYER                       │
│  (Identity, Policy, Compliance, Enforcement, Dispute)   │
│                    ❌ NOT UMARISE                        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ reads from / references
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 ORIGIN RECORD LAYER                      │
│         (Capture, Preserve, Resolve, Verify)            │
│                    ✅ UMARISE                            │
└─────────────────────────────────────────────────────────┘
                            │
                            │ stores in
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                          │
│              (IPFS, Hetzner, SQLite)                    │
│                    ✅ UMARISE                            │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Summary

| Aspect | Origin Layer (Umarise) | Governance Layer (Others) |
|--------|------------------------|---------------------------|
| Creates records | ✅ | ❌ |
| Preserves state | ✅ | ❌ |
| Proves integrity | ✅ | ❌ |
| Enforces policy | ❌ | ✅ |
| Authenticates users | ❌ | ✅ |
| Resolves disputes | ❌ | ✅ |
| Determines truth | ❌ | ✅ |

---

*Document version: 1.0*  
*Last updated: January 2026*
