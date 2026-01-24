# UMARISE — Phase 1 Completion Summary

**Date:** 2026-01-24  
**Status:** ✅ Phase 1 Complete  
**Scope:** Reference Implementation of Origin Record Layer

---

## Executive Statement

> Phase 1 delivers a **working reference implementation** of an origin record layer.  
> It captures, preserves, resolves, and verifies original state before transformation.

---

## What We Built

### Core Capabilities (100% Operational)

| Capability | Implementation | Status |
|------------|----------------|--------|
| **Capture** | Camera → base64 → Hetzner upload | ✅ |
| **Seal** | SHA-256 hash calculated client-side before upload | ✅ |
| **Store** | IPFS content-addressing on Hetzner DE | ✅ |
| **Resolve** | Public API (`GET /resolve-origin`) | ✅ |
| **Verify** | Client-side bit-identity verification | ✅ |
| **Search** | FTS5 with ranked scoring (user cues > AI) | ✅ |
| **Origin View** | Public evidence page (`/origin/:id`) | ✅ |
| **Proof Bundle** | JSON export with verification instructions | ✅ |

---

## Technical Architecture

### Data Flow

```
User Device (PWA)
    │
    │ HTTPS
    ▼
Lovable Cloud (Edge Functions)
    │ Stateless proxy — no data stored
    │
    │ HTTPS + Bearer Token
    ▼
Hetzner Privacy Vault (Germany)
    ├── Codex Service (SQLite FTS5)
    ├── Vision Service (Gemini 2.5 Flash)
    └── IPFS Node (content-addressed storage)
```

### Key Technical Decisions

| Decision | Implementation | Rationale |
|----------|----------------|-----------|
| **No accounts** | device_user_id (UUID) | Privacy-first, zero friction |
| **Client-side hashing** | SHA-256 before upload | Proves origin integrity |
| **Prioritized search** | User cues +100, AI +50 | Human intent > algorithm |
| **Content addressing** | IPFS CID | Immutable by construction |
| **EU sovereignty** | 100% Hetzner DE | GDPR-native infrastructure |

---

## API Primitives (Integration-Ready)

| Primitive | Endpoint | Status |
|-----------|----------|--------|
| **Create Origin** | `POST /api/codex/pages` via proxy | ✅ Implemented |
| **Resolve Origin** | `GET /resolve-origin?origin_id=...` | ✅ Implemented |
| **Verify Origin** | Client-side + `VerifyOriginButton` | ✅ Implemented |
| **Link External** | Conceptual only | 🔮 Phase 2 |

---

## Infrastructure

### Production Environment

| Component | Location | Provider |
|-----------|----------|----------|
| Frontend | `umarise.lovable.app` | Lovable Cloud |
| Edge Functions | Lovable Cloud (EU) | Supabase |
| Origin Data | `vault.umarise.com` | Hetzner DE |
| IPFS Gateway | `vault.umarise.com/ipfs/` | Hetzner DE |

### Security Measures (Confirmed)

| Measure | Status |
|---------|--------|
| Bearer Token Auth | ✅ Implemented |
| Rate Limiting (per device, per category) | ✅ Implemented |
| Audit Logging | ✅ Implemented |
| Device Isolation (RLS) | ✅ Implemented |
| HTTPS Only | ✅ Enforced |
| Request Timeout (60s) | ✅ Implemented |

---

## Documentation Set

### Public (in repository)

| Document | Purpose |
|----------|---------|
| `docs/integration-contract.md` | API primitives for external integration |
| `docs/layer-boundaries.md` | Origin layer vs governance layer boundary |
| `docs/cto-technical-factsheet.md` | Technical due diligence reference |

### Private (excluded from build)

| Document | Purpose |
|----------|---------|
| `PRIVATE-strategic-bundle.md` | Demo narrative, outreach, investor materials |

---

## What Phase 1 Proves

### Technical Claims (Verified)

1. ✅ **Origin is immutable** — SHA-256 hash prevents silent modification
2. ✅ **Search is explainable** — Every result shows match reason
3. ✅ **Human intent outranks AI** — Scoring weights are explicit
4. ✅ **Verification is independent** — Any party can check bit-identity
5. ✅ **Sovereignty is enforced** — All origin data on German servers

### Positioning Claims (Demonstrable)

1. ✅ **Reference implementation** — Working system, not pitch deck
2. ✅ **Integration-ready** — Public resolve API exists
3. ✅ **Layer boundary is explicit** — Governance is clearly out of scope

---

## What Phase 1 Does NOT Include

| Capability | Status | Phase |
|------------|--------|-------|
| User accounts / authentication | ❌ Not built | v2 |
| Cross-device sync via accounts | ❌ Not built | v2 |
| Client-side encryption (E2EE) | ❌ Not built | v2 |
| Blockchain timestamping | ❌ Not built | Enterprise |
| External TSA (RFC 3161) | ❌ Not built | Enterprise |
| Identity / signing | ❌ Not built | Governance layer |
| Policy enforcement | ❌ Not built | Governance layer |

---

## Metrics & Success Criteria

### Pilot Hypothesis

> **80% of searches retrieve the correct artifact within 60 seconds**

### Current Status

| Metric | Target | Status |
|--------|--------|--------|
| Retrieval time | < 60 seconds | ✅ Achieved (~3-5s typical) |
| Retrieval accuracy | 80%+ | 🔄 Pilot testing in progress |
| Origin verification | 100% reliable | ✅ Achieved |

---

## Phase 1 Deliverables Checklist

- [x] Capture flow (camera → upload → seal)
- [x] Origin hash calculation (SHA-256)
- [x] IPFS storage (content-addressed)
- [x] Search with ranked scoring
- [x] Origin View (public evidence page)
- [x] Proof Bundle export
- [x] Resolve API (public endpoint)
- [x] Verify Origin button
- [x] Trash architecture (hybrid sync)
- [x] Rate limiting and audit logging
- [x] Technical documentation
- [x] Layer boundaries documentation
- [x] Integration contract documentation

---

## Conclusion

> **Phase 1 is complete.**  
> The system is a working reference implementation of an origin record layer.  
> It is ready for partner validation and pilot testing.

**Next phase:** Validation with external parties using these documents as canonical reference.

---

*Document version: 1.0*  
*Last updated: 2026-01-24*
