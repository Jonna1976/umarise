# Phase 2 Roadmap — Positioning & External Validation

> **Status:** In Progress  
> **Start:** January 2026  
> **Goal:** Prove systems cannot function without origin

---

## Strategic Summary

> Phase 1 proved origin can technically exist.  
> Phase 2 proves systems cannot exist without origin.

**Validation Metric:** Negative Dependency  
**Success:** Partner removes Umarise → immediate, demonstrable loss of verifiable origin

---

## Phase 2A: Positioning & Partner Validation

**Timeline:** Q1 2026  
**Focus:** API adoption, not app usage

### Objectives

| Objective | Success Criteria |
|-----------|------------------|
| Position as infrastructure | Partners call API, not use app |
| Prove negative dependency | Removal = loss of origin |
| Validate retrieval hypothesis | 80% found in <60 seconds |
| First integration partner | 1 system calling create/resolve/verify |

### Checklist

- [ ] **Partner Outreach**
  - [ ] Identify 3-5 integration candidates (NextCloud, Proton, MKB SaaS)
  - [ ] Send integration-contract.md as technical proposal
  - [ ] Schedule 5-minute demo calls (not product demos)
  - [ ] Use Partner Question Set from phase-1-completion.md

- [x] **API Hardening**
  - [x] Document rate limits in integration-contract.md (v1.2)
  - [x] Add API versioning header (`X-API-Version: v1` on all responses)
  - [x] Create API key provisioning for partners (v1-internal-partner-create)
  - [x] Monitor resolve-origin usage via core_request_log

- [ ] **Pilot Execution**
  - [ ] Recruit 3 MKB teams (3-50 employees)
  - [ ] 21-day pilot with daily capture goal
  - [ ] Measure Search Resolution Rate (SRR)
  - [ ] Collect "Would you lose this?" testimonials

- [ ] **Reference Implementation**
  - [ ] Publish demo video showing Capture → Verify flow
  - [x] Create minimal integration example (curl commands on /api-reference)
  - [x] Document proof bundle verification script (scripts/verify-anchor.sh + .py)

### Deliverables

| Deliverable | Format | Audience |
|-------------|--------|----------|
| Integration guide | Markdown | Technical partners |
| Demo video (5 min) | Video | All stakeholders |
| Pilot results report | Internal doc | Investors |
| Partner testimonial | Quote | Marketing |

---

## Phase 2B: Security Hardening

**Timeline:** Q2 2026  
**Focus:** Enterprise-grade cryptographic guarantees

### Objectives

| Objective | Success Criteria |
|-----------|------------------|
| Zero-knowledge encryption | Client-side AES-256-GCM |
| External timestamping | RFC 3161 TSA integration |
| Audit compliance | SOC 2 readiness checklist |

### Checklist

- [ ] **Zero-Knowledge Architecture**
  - [ ] Design client-side encryption flow
  - [ ] Key derivation from device_user_id + passphrase
  - [ ] Encrypt before upload (OCR on encrypted = Phase 3)
  - [ ] Update cto-technical-factsheet.md with ZK claims

- [ ] **RFC 3161 Timestamping**
  - [ ] Select TSA provider (FreeTSA, DigiStamp, or self-hosted)
  - [ ] Integrate timestamp request on capture
  - [ ] Store TSA response in origin_manifest
  - [ ] Update Proof Bundle with TSA certificate

- [ ] **Security Audit**
  - [ ] Penetration testing (external vendor)
  - [ ] RLS policy review
  - [ ] Rate limiting hardening
  - [ ] IP-based abuse detection

### Deliverables

| Deliverable | Format | Audience |
|-------------|--------|----------|
| Security whitepaper | PDF | Enterprise prospects |
| TSA integration docs | Markdown | Technical |
| Pen test report | Internal | Board/investors |

---

## Phase 2C: UX & Account Layers

**Timeline:** Q3 2026  
**Focus:** Optional convenience features

### Objectives

| Objective | Success Criteria |
|-----------|------------------|
| Cross-device sync | Account-based origin claiming |
| MCP server | AI tools can query origins |
| Consent Gateway | Revocable origin sharing |

### Checklist

- [ ] **Account System**
  - [ ] Optional email/password auth
  - [ ] "Claim origins" flow (link device_user_id to account)
  - [ ] Cross-device library sync
  - [ ] Preserve anonymous option

- [ ] **MCP Server**
  - [ ] Implement Model Context Protocol endpoint
  - [ ] AI tools can request origin context
  - [ ] Consent-gated access (user approves per request)
  - [ ] Audit log for MCP queries

- [ ] **Consent Gateway**
  - [ ] Temporary shareable links (expiring)
  - [ ] Revocation UI
  - [ ] Access log per origin
  - [ ] "Share Origin" vs "Share Interpretation" distinction

### Deliverables

| Deliverable | Format | Audience |
|-------------|--------|----------|
| Account migration guide | In-app | Users |
| MCP integration docs | Markdown | AI tool developers |
| Consent UX mockups | Figma | Internal |

---

## Success Metrics

### Phase 2A (Validation)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Integration partners | ≥1 | API calls logged |
| Pilot teams | 3 | Active users |
| Search Resolution Rate | ≥80% | Found in <60s |
| Negative Dependency | Proven | Partner attestation |

### Phase 2B (Security)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Zero-knowledge coverage | 100% | All new captures encrypted |
| TSA adoption | Optional | Available on request |
| Pen test issues | 0 critical | External report |

### Phase 2C (UX)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Account adoption | 30% | Opted-in users |
| MCP integrations | ≥2 | Active AI tools |
| Origin shares | Tracked | Consent log |

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| Partners don't see value | Lead with "what you lose without this" |
| ZK breaks OCR workflow | Phase 3: on-device OCR or trusted enclave |
| TSA adds latency | Make TSA optional, async background |
| Account system adds friction | Keep anonymous as default |

---

## Timeline Overview

```
2026 Q1 ──────────────────────────────────────────────────────
        │ Phase 2A: Positioning & Partner Validation
        │ - Partner outreach
        │ - MKB pilot (21 days)
        │ - API hardening
        │
2026 Q2 ──────────────────────────────────────────────────────
        │ Phase 2B: Security Hardening
        │ - Zero-knowledge encryption
        │ - RFC 3161 TSA
        │ - Penetration testing
        │
2026 Q3 ──────────────────────────────────────────────────────
        │ Phase 2C: UX & Account Layers
        │ - Optional accounts
        │ - MCP server
        │ - Consent Gateway
        │
2026 Q4 ──────────────────────────────────────────────────────
        │ Phase 3: Scale & Enterprise
        │ - Enterprise pilots
        │ - On-premise deployment option
        │ - Revenue model validation
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Phase 1 complete | All primitives operational |
| 2026-01 | TSA deferred to 2B | Server timestamp sufficient for pilot |
| 2026-01 | App = reference only | Value in API, not consumer product |

---

## Phase 2A — Architecture Validation: Control Plane vs Data Plane

**Scope:** Positioning & validation  
**Doel:** Aantonen dat control-plane compromise geen origin-compromise veroorzaakt  
**Kernzin:**  
> *"Phase 1: Hetzner stores truth. Phase 2: Supabase leak ≠ truth leak."*

---

### Phase 1 — "Origin can exist"

*(Huidige realiteit — bewezen in Phase 1)*  
*(Supabase / Lovable Cloud = control plane + proxy; Hetzner = data plane)*

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENT APPS                          │
│  (Lovable UI, partner UI, employee tools, capture clients, browser)  │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS (authenticated)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              LOVABLE CLOUD / SUPABASE EDGE FUNCTIONS                 │
│   - origin-image-proxy (fetch/serve)                                 │
│   - resolve-origin (lookup by origin_id/hash/cid)                    │
│   - auth/session handling                                            │
│   - rate limiting / routing                                          │
└─────────────────────────────────────────────────────────────────────┘
          │                                  │
          │ metadata / indices (RLS)          │ origin fetch / store
          ▼                                  ▼
┌────────────────────────────────────────┐   ┌───────────────────────────────┐
│            SUPABASE DATABASE           │   │          HETZNER VAULT          │
│ (control-plane data)                  │   │ (data-plane, EU)                │
│ - indices (resolve pointers)          │   │ - origin storage (IPFS/kubo)     │
│ - audit-ish logs / revocation index   │   │ - OCR / services                │
│ - cross-device sync metadata          │   │ - resolve & verify primitives    │
│ - device_user_id access (RLS)         │   │ - nginx routes /ipfs/{cid}       │
└────────────────────────────────────────┘   └───────────────────────────────┘
                                                │
                                                │ local gateway
                                                ▼
                                           ┌──────────┐
                                           │ IPFS Kubo │
                                           │ 8082 gw   │
                                           └──────────┘
```

**Phase 1 invariant (bewezen):**

- Origin content leeft uitsluitend op Hetzner.
- Supabase / Lovable Cloud routeert en indexeert, maar bezit geen waarheid.
- Dit bewijst: origin kan bestaan als aparte infrastructuurlaag.

---

### Phase 2 — "No control-plane compromise can undermine it"

*(Doelbeeld Phase 2A — validatie door blootstelling aan externe stacks)*  
*(Aanname: Supabase/Edge is hostile of gelekt)*

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USERS / PARTNER SYSTEMS                      │
│  (partner backend integrations calling primitives directly)           │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          │  (prefer) direct-to-Vault for data-plane
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        HETZNER VAULT (DATA PLANE)                    │
│  - Origin bits (IPFS)                                                │
│  - Verify (hash/cid integrity)                                       │
│  - Optional: signed responses / attestations                          │
│  - Strict auth + allowlists + rate limits                             │
└─────────────────────────────────────────────────────────────────────┘
                          ▲
                          │
                          │ resolve pointers (optional convenience only)
                          │
┌─────────────────────────────────────────────────────────────────────┐
│               CONTROL PLANE (SUPABASE / LOVABLE CLOUD)                │
│  - Can be compromised WITHOUT yielding origin bits                    │
│  - Stores only: minimal indices / routing hints                       │
│  - Revocation markers (no payload authority)                          │
│  - Logs: redacted, no payloads, no secrets                            │
│  - Egress allowlist: only Hetzner                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Phase 2 Invariants (MUST — non-negotiable)

- Control plane stores **NO origin payloads**
- Control plane stores **NO encryption keys**
- Control plane stores **NO secrets**
- Vault (Hetzner) is the sole source-of-truth for origin bits
- Verifiability never depends on Supabase
- Control-plane compromise degrades convenience, not truth
- Control-plane egress is allowlisted to Hetzner only
- Logs contain NO payloads, NO tokens, NO PII
- Partners can operate Vault-only using:
  - fetch by CID
  - verify via hash/CID  
  *(Negative Dependency Test)*

---

### Failure Posture (Phase 2 Target)

If the control plane fails or leaks, partners can still:

1. Fetch origin from Hetzner (by CID)
2. Verify integrity independently (hash / CID)
3. Detect missing or revoked pointers (explicit failure)
4. Continue operation with loss of convenience, not loss of truth

---

### Red-Team Validation (Phase 2A)

```
┌─────────────────────────────────────────────────────┐
│  RED-TEAM VALIDATION                                │
│  Q: Given a full Supabase database dump + edge logs │
│     — what origin content can be reconstructed?    │
│                                                     │
│  A: NONE. Only routing hints and hashed identifiers │
└─────────────────────────────────────────────────────┘
```

**Acceptance criterion:**  
A compromised control plane yields zero recoverable origin content.

---

### Positioning Consequence

- **Phase 1** proved origin can exist
- **Phase 2** proves systems cannot afford to lose it
- Supabase / Lovable Cloud remains:
  - useful
  - replaceable
  - **never authoritative**

---

## Internal Anchor

> "We're not adding features.  
> We're proving the layer is indispensable."

**Phase 2 One-Liner:**
> *"Phase 1: origin exists. Phase 2: control-plane breach ≠ origin breach."*

---

*Phase 2 Roadmap — Last updated: January 2026*
