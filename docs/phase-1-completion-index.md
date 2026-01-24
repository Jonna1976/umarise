# Phase 1 Completion Index — Umarise Origin Record Layer

> **Status:** Phase 1 Complete  
> **Date:** January 2026  
> **Next:** Phase 2 — Positioning & External Validation

---

## 1. What Was Built

### Core Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| **Capture Flow** | ✅ Complete | `src/components/capture/` |
| **Origin Sealing** | ✅ Complete | `src/lib/originHash.ts` |
| **IPFS Storage** | ✅ Complete | Hetzner-hosted private nodes |
| **Resolve API** | ✅ Complete | `supabase/functions/resolve-origin/` |
| **Origin View** | ✅ Complete | `src/pages/OriginView.tsx` |
| **Proof Bundle Export** | ✅ Complete | `src/components/codex/OriginProofActions.tsx` |

### Technical Primitives

```
Capture → SHA-256 Hash → IPFS CID → Immutable Storage
                ↓
        No UPDATE path exists
                ↓
    Resolve via hash OR origin_id
                ↓
      External verification possible
```

### API Endpoints (Production)

| Primitive | Endpoint | Status |
|-----------|----------|--------|
| Create Origin | `POST /api/codex/pages` | ✅ Implemented |
| Resolve Origin | `GET /resolve-origin?origin_id=...` | ✅ Implemented |
| Verify Origin | Client-side + `VerifyOriginButton` | ✅ Implemented |
| Link External | — | 🔮 v2 Roadmap |

---

## 2. Partner-Facing Documentation

Two documents remain in repository for external partners:

### [Integration Contract](./integration-contract.md)
- API v1 primitives and data model
- `OriginRecord` canonical structure
- Create / Resolve / Verify / Link operations
- Implementation status matrix

### [Layer Boundaries](./layer-boundaries.md)
- Defines scope: Origin Record Layer vs. Governance Layer
- What Umarise IS and IS NOT
- Boundary diagram
- "Umarise registers. It does not judge."

---

## 3. Demo Narrative (5 Minutes)

### Purpose
Show **where** origin lives in a stack — not what Umarise can do.

---

### Minute 0–1 — Framing

> "This is not a product demo.  
> This is a reference implementation of an origin record layer."

> "We're not showing you features.  
> We're showing you where origin lives in a stack — before interpretation, before optimization, before AI."

**Core statement:**

> "Everything above this layer can change.  
> Nothing below it can be overwritten."

---

### Minute 1–2 — Capture

> "This is raw input — before any system touches it."

Show:
- Capture moment (image/text)
- No AI, no processing
- Direct registration

Say:

> "At this moment, nothing is interpreted.  
> We only register that something existed."

---

### Minute 2–3 — Seal & Store

> "The moment it's captured, it's sealed."

Show:
- Hash calculation
- IPFS CID
- Storage without update path

Say:

> "This is not versioning.  
> This is immutability by construction."

> "If the content changes, the identity changes.  
> Silent overwrite is technically impossible."

---

### Minute 3–4 — Resolve & Verify

Show:
- Origin View (`/origin/:id`)
- Verify origin / hash check
- Proof bundle download

Say:

> "Any system can now resolve this origin.  
> Not because it trusts us — but because it can verify the bits itself."

**Critical statement:**

> "This is how origin survives transformation."

---

### Minute 4–5 — Boundary

> "Umarise stops here."

Say explicitly:
- "We don't enforce policy."
- "We don't decide truth."
- "We don't govern."

Then:

> "But without this layer, governance is symbolic.  
> With it, governance becomes enforceable."

Close with:

> "Now the only real question is:  
> **Where would this live in your stack?**"

👉 Then stop. Let silence work.

---

## 4. Partner Question Set

### A. Opening Question (always start here)

> "Where in your stack is origin currently defined?"

Listen for: vagueness, silence, "that's everywhere", "that's implicit"

---

### B. Deepening Questions (choose one)

**Technical / Infra:**
> "Before content is transformed, optimized, or interpreted — where is the last immutable reference today?"

**AI / Data:**
> "If an AI output is challenged, how do you prove what it was derived from?"

**Compliance / Governance:**
> "Which part of your stack is the system-of-record for 'what existed at time T'?"

---

### C. Boundary Check

> "If that reference were wrong or manipulated, how would you detect it?"

Don't solve. Don't help. Let it land.

---

### D. Closing Question

> "Should that responsibility live inside an application — or below all applications?"

---

## 5. Phase 2 Definition

**Phase 2 = Positioning + External Validation**

Umarise as infrastructure layer, not as product.

### Concrete Actions

| Action | Description |
|--------|-------------|
| **Positioning** | Frame Umarise as origin record layer that integrates *before* AI/document/workflow systems (API-first). App exists solely as reference implementation. |
| **Validation** | Prove existing systems (B2B2C) can and want to integrate Umarise: pilots with 1–2 integration partners calling create/resolve/verify without UI dependency. |
| **Adoption Criterion** | Not "do people use the app?" but: **Can an external stack demonstrably not perform transformation without detectable origin?** |
| **Narrative** | Umarise ≠ governance, ≠ compliance tool, ≠ AI product — but precondition infrastructure on which governance and accountability become possible. |

### Summary

> Phase 1 proved it works.  
> Phase 2 proves it wants to be built in.

The app remains, but solely as proof and reference layer.  
Value creation and strategic leverage sit in the API and positioning as indispensable origin infrastructure.

---

## 6. Internal Anchor

> "We're not selling a solution.  
> We're revealing a missing layer."

---

*Phase 1 Complete — January 2026*
