# Phase 1 Completion — Origin Record Layer

> **Status**: Complete  
> **Date**: January 2026  
> **Summary**: Phase 1 proves that origin can technically exist as infrastructure.

---

## 1. What Phase 1 Delivers

### End-to-End Origin Pipeline

| Step | Implementation | Status |
|------|----------------|--------|
| **Capture** | Zen lens ritual — single artifact, no batch confusion | ✅ |
| **Seal** | Client-side SHA-256 hash + server-side `captured_at` (non-TSA) | ✅ |
| **Store** | Hetzner Privacy Vault (DE sovereignty, IPFS CID) | ✅ |
| **Resolve** | `/origin/:id` public view with immutability label | ✅ |
| **Verify** | Proof Bundle JSON + bit-identity SHA-256 check | ✅ |

### Architectural Enforcement

- **No UPDATE path** for `image_url` — immutability by construction
- **Search ranking** hardcodes user intent (+100) over AI inference (+50)
- **Origin ≠ Interpretation** — AI metadata explicitly labeled as derivative

### Partner Documentation

Limited to technical primitives only:

- `docs/integration-contract.md` — API v1 specification
- `docs/layer-boundaries.md` — Origin vs Governance scope

---

## 2. What Phase 1 Does NOT Include (By Design)

| Capability | Status | Rationale |
|------------|--------|-----------|
| RFC 3161 TSA | ❌ Phase 2 | Server timestamp sufficient for pilot; TSA = enterprise hardening |
| Zero-knowledge encryption | ❌ Phase 2 | Current model = zero-access policy; ZK = mathematical guarantee |
| External identity | ❌ Phase 2 | Device UUID sufficient; account layer = optional UX |
| Governance enforcement | ❌ Out of scope | Umarise provides evidence, not policy |

---

## 3. Proof of Concept Validation

### Working Demo

```
Capture → Seal → Store → Resolve → Verify
```

Each step is independently verifiable:

1. **Capture**: Photo taken, `captured_at` recorded
2. **Seal**: SHA-256 computed client-side before upload
3. **Store**: Image stored at Hetzner with CID reference
4. **Resolve**: Origin View displays hash, timestamp, immutability status
5. **Verify**: Proof Bundle enables external bit-identity check

### Integration Primitives (Operational)

| Primitive | Endpoint | Purpose |
|-----------|----------|---------|
| Copy Origin Link | Client-side | Shareable cryptographic deeplink |
| Download Proof Bundle | Client-side | Standalone JSON evidence |
| Resolve API | `GET /resolve-origin` | Public metadata lookup |
| Origin View | `/origin/:id` | Public evidence page |

---

## 4. Phase 2 Roadmap

### Phase 2A: Positioning & Partner Validation

**Goal**: Prove that systems cannot function without origin.

- API adoption by integration partners
- Validation metric: **Negative Dependency**
  - Success = partner removes Umarise → immediate loss of verifiable origin
- Reference implementation positioning (not consumer product)

### Phase 2B: Security Hardening

**Goal**: Enterprise-grade cryptographic guarantees.

- Zero-knowledge client-side encryption (AES-256-GCM)
- RFC 3161 external timestamping (TSA)
- Audit logging enhancements

### Phase 2C: UX & Account Layers

**Goal**: Optional convenience features.

- Cross-device account sync
- MCP server for AI tool integration
- Consent Gateway for origin sharing

---

## 5. Strategic Summary

> **Phase 1 proves that origin can technically exist.**  
> **Phase 2 proves that systems cannot exist without origin.**

### Key Distinctions

| Aspect | Phase 1 (Complete) | Phase 2 (Next) |
|--------|-------------------|----------------|
| Focus | Build | Position |
| Output | Working demo | Partner dependency |
| Timestamp | Server-side (non-TSA) | RFC 3161 TSA (optional) |
| Encryption | Zero-access policy | Zero-knowledge crypto |
| Identity | Device UUID | Optional accounts |

---

## 6. Technical Baseline

### Timestamp Precision

**Current (Phase 1)**:
- Client computes SHA-256 hash
- Server records `captured_at` on INSERT
- Database trigger prevents UPDATE on origin fields

**Future (Phase 2B)**:
- Optional RFC 3161 external timestamp
- Cryptographic non-repudiation for legal/enterprise use

### Hash Algorithm

- SHA-256 (frozen for v1)
- Stored as lowercase hex string (64 characters)
- Algorithm recorded in `origin_hash_algo` field

---

*Document version: 1.0*  
*Phase 1 completion date: January 2026*
