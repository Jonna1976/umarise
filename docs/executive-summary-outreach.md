# UMARISE — Executive Summary

**One-liner:** Infrastructure that makes handwritten origins retrievable without losing them to AI interpretation.

---

## The Problem We Solve

In an AI-driven world, the moment of creation—sketches, whiteboard decisions, handwritten notes—disappears into systems that transform, summarize, and reinterpret. When disputes arise, the original is gone. Only interpretations remain.

**Mainstream AI (ChatGPT, Gemini, Claude):**
- Your data trains models or funds ads
- "Delete" doesn't mean deleted
- AI output replaces your input as source of truth

**Umarise is different.** We protect the beginning.

---

## What v1 Already Delivers (Operational Now)

| Capability | Technical Implementation |
|------------|-------------------------|
| **EU Sovereign Storage** | Hetzner DE infrastructure, zero-access policy (no human reads your data) |
| **Origin Immutability** | SHA-256 hash at capture, database trigger prevents any modification |
| **Explainable Search** | User keywords outrank AI inference (+100 vs +50), word-boundary matching only |
| **Anti-Black-Box** | Every result shows *why* it matched; cite-to-source links to original OCR |
| **No Account Required** | Device-based ownership via UUID, no email, no login, no tracking |
| **Retrieval < 60 seconds** | Photo → 2 words → find original, proven in pilot |

**What this means:** The original scan is the truth. AI generates metadata, never replaces content. Users always know why something was found.

---

## What v2 Promises

| Capability | Technical Approach |
|------------|-------------------|
| **Zero-Knowledge Encryption** | Client-side AES-256-GCM, keys never leave device |
| **Local-First Processing** | On-device vision models when quality matches Gemini |
| **MCP Server Architecture** | Umarise as "Origin Authority"—external AI tools request access via consent gateway |
| **Account Migration** | Optional accounts to "claim" existing device data without losing history |

**The v2 vision:** Not even Umarise can read your data. The device becomes the system of record.

---

## Why This Matters

### For AI Ethics Leaders
- **Cite-to-source is mandatory**—no "AI says so" without evidence
- **User intent > model inference**—architecturally enforced, not policy promised
- **Transparent ranking**—open scoring weights, no hidden optimization

### For EU Sovereignty Ecosystem
- **GDPR-native**—German data residency, no US cloud dependency
- **Integration-ready**—designed to complement NextCloud (files), Proton (email), as the "origins" layer
- **Proof over promise**—working pilot with MKB teams, not a pitch deck

---

## Differentiation Matrix

|  | ChatGPT | Confer (Signal) | Umarise |
|--|---------|-----------------|---------|
| **Problem** | General AI assistant | Private AI chat | Origin capture & retrieval |
| **Data location** | US servers | E2E encrypted cloud | Hetzner DE (v1) → Device (v2) |
| **Business model** | Ads (free) / subscription | Subscription | Subscription, no ads ever |
| **What's protected** | Nothing | Conversations | The beginning—before AI transforms |
| **Explainability** | None | None | Mandatory cite-to-source |

---

## Contact

**Pilot Status:** 3 MKB teams, 21-day proof cycle, 80% retrieval success target  
**Infrastructure:** 100% operational on Hetzner DE  
**Code:** Architecture documentation available on request

*"In a world where AI rewrites everything, we protect the moment where meaning is born."*

---

**Umarise** — Bewijs van het begin.
