# Umarise — Core / Implementation Architecture Split

## Design Contract (Binding)

**Status:** Approved Architecture Contract  
**Version:** 2.0  
**Applies to:** All Umarise Core API + all implementation layers  
**Goal:** Preserve Umarise Core as neutral origin attestation infrastructure while implementations deliver product value  
**Last updated:** February 27, 2026

---

## 1. Principles

### 1.1 Non-Negotiable Core Definition

Umarise Core exists to do exactly one thing:

> **Externally attest that a cryptographic hash existed no later than a specific moment in time.**

Core records only:
- `hash`
- `captured_at` (upper bound, not exact moment)
- `origin_id`

Nothing more.

### 1.2 Non-Negotiable Separation

- Implementations use Core
- Core never depends on any implementation
- Core must remain valid if all implementations disappear
- Implementations are replaceable
- Core is not UX

### 1.3 Rule of Thumb

| Condition | Belongs to |
|-----------|------------|
| If it touches bytes | Implementation |
| If it explains meaning | Implementation |
| If it helps the user | Implementation |
| If it restricts options / is write-once facts | Core |

---

## 2. Layer Responsibilities

### 2.1 Umarise Core (Infra)

**MUST:**
- Accept hash-only as input (primary mode)
- Generate `origin_id` and `short_token`
- Bind authoritative `captured_at` timestamp
- Store immutable origin records (write-once, enforced by database triggers)
- Support binary verification (match / no-match)
- Anchor hashes in Bitcoin via OpenTimestamps (Layer 1)
- Remain content-agnostic and interpretation-free

**MUST NOT:**
- Accept/store bytes or files
- Store content (no vault, no IPFS, no artifact URL)
- Return artifact URLs
- Add semantic fields (labels, types, status flags, marks)
- Implement idempotency across "same bytes" (content equality)
- Provide UX constructs (badges, marks, receipts-as-meaning)

### 2.2 Implementations (Application Layer)

Multiple implementations exist, each serving a different use case:

| Domain | Purpose | Model |
|--------|---------|-------|
| **anchoring.app** | B2C ritual capture with local gallery | Device-local, WebAuthn identity |
| **itexisted.app** | B2C utility with persistent proof URLs | Stateless, link-first sharing |
| **umarise.com** | B2B hub, documentation, partner onboarding | Infrastructure documentation |
| **Partner systems** | Third-party integrations via Core API | API key authenticated |

**All implementations MAY:**
- Accept bytes/uploads
- Compute hashes on behalf of users
- Store artifacts (local device, vault, cloud)
- Provide artifact URLs, retrieval, search, dashboards
- Maintain local labels/metadata
- Render marks and receipts for UX

**All implementations MUST:**
- Call Core to create origin records
- Treat Core output as immutable facts
- Keep all convenience features replaceable and non-authoritative
- Never imply that a UI badge alone is proof (verification is proof)
- Implement the double-upload pattern (re-hash at download) for zero-storage integrity

---

## 3. API Boundary & Routing

### 3.1 Endpoint Namespace

Core endpoints are namespaced to prevent drift:

| Namespace | Purpose | Access |
|-----------|---------|--------|
| `/v1-core-*` | Core endpoints (hash-only, no bytes) | See §6 |
| `/v1-attestation-*` | Layer 3 attestation endpoints | See §6 |
| `/companion-*` | Companion proxy endpoints (device-scoped) | Device-authenticated |

This is a hard boundary. Anything under `/v1-core-*` must obey Core rules.

---

## 4. Umarise Core API v1 (Canonical)

### 4.1 POST /v1-core-origins

**Purpose:** Create a new Origin Record from a hash.  
**Access:** Permissioned (partner API key via `X-API-Key` header)

**Request:**
```json
{
  "hash": "sha256:<hex>"
}
```

**Response (201):**
```json
{
  "origin_id": "<uuid>",
  "hash": "sha256:<hex>",
  "hash_algo": "sha256",
  "captured_at": "<RFC3339/ISO8601 UTC>",
  "proof_status": "pending",
  "proof_url": "/v1-core-origins-proof?origin_id=<uuid>"
}
```

**Constraints:**
- Write-once: cannot mutate an existing record (enforced by database triggers)
- No bytes accepted (400 REJECTED_FIELD)
- No labels accepted (400 REJECTED_FIELD)
- No artifact URLs
- Duplicate hash per partner key returns 409 DUPLICATE_HASH

### 4.2 GET /v1-core-resolve

**Query:** `?origin_id=...` OR `?hash=...` OR `?token=...`  
**Access:** Public (rate-limited)

**Purpose:** Retrieve immutable facts. Returns the earliest attestation for a given hash (first-in-time resolution).

**Response:**
```json
{
  "origin_id": "...",
  "short_token": "...",
  "hash": "sha256:<hex>",
  "hash_algo": "sha256",
  "captured_at": "...",
  "proof_status": "pending | anchored",
  "bitcoin_block_height": null | 123456,
  "anchored_at": null | "..."
}
```

**Constraints:**
- No `artifact_url`
- No `integrity_status`
- No `capture_type`
- No `source_system`

### 4.3 POST /v1-core-verify

**Purpose:** Verify whether a hash is attested (binary).  
**Access:** Public (rate-limited)

**Request:**
```json
{
  "hash": "sha256:<hex>"
}
```

**Response (found):**
```json
{
  "origin_id": "...",
  "hash": "sha256:<hex>",
  "hash_algo": "sha256",
  "captured_at": "...",
  "proof_status": "pending | anchored",
  "proof_url": "..."
}
```

**Response (404):**
Not found — no matching origin.

**Constraints:**
- Accepts ONLY `hash` (origin_id is rejected)
- No marks (e.g. ᵁ)
- No "meaning" strings
- Verification is binary

### 4.4 GET /v1-core-proof

**Purpose:** Retrieve binary .ots proof file.  
**Access:** Public

**Response protocol (3-state):**

| Status | Meaning | Body |
|--------|---------|------|
| 200 | Anchored | Binary `.ots` file (`application/octet-stream`) |
| 202 | Pending | `{ "status": "pending" }` — awaiting Bitcoin confirmation |
| 404 | Not found | Origin unknown |

Headers on 200: `X-Bitcoin-Block-Height`, `X-Anchored-At`

### 4.5 GET /v1-core-health

**Purpose:** System status check.  
**Access:** Public

---

## 5. Core Data Model (Minimal)

### 5.1 Table: `origin_attestations` (Core)

| Field | Type | Description |
|-------|------|-------------|
| `origin_id` | UUID | Primary key |
| `short_token` | VARCHAR | Human-readable short identifier |
| `hash` | VARCHAR | SHA-256 hash (with `sha256:` prefix) |
| `hash_algo` | VARCHAR | Fixed `sha256` in v1 |
| `captured_at` | TIMESTAMPTZ | Authoritative timestamp (upper bound) |
| `api_key_prefix` | VARCHAR | Partner key prefix (nullable for internal) |
| `created_at` | TIMESTAMPTZ | DB internal |

### 5.2 Table: `core_ots_proofs` (Anchoring)

| Field | Type | Description |
|-------|------|-------------|
| `origin_id` | UUID | FK → origin_attestations (one-to-one) |
| `ots_proof` | TEXT | Base64-encoded OpenTimestamps proof |
| `status` | VARCHAR | `pending` or `anchored` |
| `bitcoin_block_height` | INTEGER | Block number (when anchored) |
| `anchored_at` | TIMESTAMPTZ | Anchor timestamp (when anchored) |

### 5.3 Uniqueness Policy

Two partial unique indexes enforce duplicate detection:

| Index | Scope | Constraint |
|-------|-------|------------|
| `unique_hash_per_partner` | Partner records (`api_key_prefix IS NOT NULL`) | `(hash, api_key_prefix)` |
| `unique_hash_internal` | Internal records (`api_key_prefix IS NULL`) | `(hash)` |

This allows cross-partner attestations of the same hash while blocking duplicates from the same source.

### 5.4 Resolution Semantics (Binding)

> **If multiple Origin Records exist for the same hash, resolution returns the earliest attestation by `captured_at`.**

Enforced by the `bridge_page_to_core_attestation` trigger using `ON CONFLICT DO NOTHING`.

### 5.5 Immutability Enforcement

Write-once is enforced at database level:
- `prevent_origin_attestation_update` trigger: blocks all UPDATE
- `prevent_origin_attestation_delete` trigger: blocks all DELETE
- RLS: blocks client UPDATE/DELETE for all roles
- INSERT: blocked for anon/authenticated; only service_role can create records

---

## 6. Security & Access Control

### 6.1 Access Model

| Endpoint | Access | Authentication |
|----------|--------|----------------|
| `POST /v1-core-origins` | Permissioned | `X-API-Key` header (partner key) |
| `GET /v1-core-resolve` | Public | Rate-limited |
| `POST /v1-core-verify` | Public | Rate-limited |
| `GET /v1-core-proof` | Public | Rate-limited |
| `GET /v1-core-health` | Public | None |
| `GET /v1-core-origins-export` | Permissioned | `X-API-Key` header |
| `GET /v1-core-origins-proof` | Permissioned | `X-API-Key` header |
| `POST /v1-attestation-request` | Public | None |
| `POST /v1-attestation-checkout` | Public | Requires anchored origin |
| `POST /v1-attestation-verify` | Public | None |
| Internal endpoints | Administrative | `X-Internal-Secret` header |

### 6.2 Core is Not User-Scoped (Binding)

> **Core is not user-scoped by design.**

Core knows no user identity. Attestation ≠ ownership.  
Whoever holds the API key may attest. There is no "who", only "what + when".

This matches TSA semantics (RFC 3161), Certificate Transparency, and DNS zone updates.

---

## 7. Three-Layer Proof Model

| Layer | Purpose | Mechanism |
|-------|---------|-----------|
| **Layer 1** | Temporal proof | Bitcoin anchoring via OpenTimestamps |
| **Layer 2** | Device binding | WebAuthn/Passkey signature (optional) |
| **Layer 3** | Third-party attestation | Certified attestant signature (paid, €4.95) |

Layer 1 is automatic for all origins. Layers 2 and 3 are opt-in.

---

## 8. Three-Track Verification Architecture

Verification follows three independent tracks to ensure no single point of failure:

| Track | Environment | Dependency |
|-------|-------------|------------|
| **Track 1: In-app** | anchoring.app / itexisted.app | Requires Umarise registry |
| **Track 2: Reference Verifier** | verify-anchoring.org | 100% client-side, zero-CDN, zero-API |
| **Track 3: CLI** | Terminal (sh/py) | Zero-dependency, fully offline |

All three tracks verify the same truth: **these bytes existed no later than T.**

The reference verifier (verify-anchoring.org) implements the normative verification function V(B, P, L) as defined by the Anchoring Specification (anchoring-spec.org).

---

## 9. Implementation Integration Pattern

### 9.1 Create Flow (bytes allowed)

```
1. User provides artifact (bytes) to implementation
2. Implementation computes sha256(bytes) client-side
3. Implementation calls Core: POST /v1-core-origins { hash }
4. Implementation stores:
   - Core response {origin_id, short_token, captured_at, hash}
   - Optional local metadata (labels, context)
   - Artifact bytes remain with user (zero-storage doctrine)
5. Implementation awaits Bitcoin anchoring (~2 hours)
6. User re-uploads artifact for double-verification before ZIP download
```

### 9.2 Verify Flow

```
1. User provides artifact (bytes) to implementation
2. Implementation computes sha256(bytes)
3. Implementation calls Core: POST /v1-core-verify { hash }
4. Implementation renders result (found/not-found) with receipt-like facts
```

Core remains blind to bytes and UX.

### 9.3 Proof ZIP Bundle (Standard Format)

Every implementation MUST produce ZIP bundles containing:

| File | Purpose |
|------|---------|
| `certificate.json` | Origin metadata (origin_id, hash, captured_at, short_token) |
| `proof.ots` | Binary OpenTimestamps proof |
| `artifact.*` | Original file (re-uploaded by user) |

Filename format: `origin-{TOKEN}-{filename}-{YYYYMMDD}.zip`

---

## 10. Acceptance Tests (Infra Purity Checks)

Core is considered compliant only if **all** are true:

| Check | Requirement |
|-------|-------------|
| ✅ | Core endpoints accept no bytes (content rejected) |
| ✅ | Core responses contain no `artifact_url` |
| ✅ | Core responses contain no `source_system` |
| ✅ | Core responses contain no `capture_type` |
| ✅ | Core responses contain no `integrity_status` |
| ✅ | Core responses contain no `origin_mark` |
| ✅ | Core responses contain no "meaning" strings |
| ✅ | Core storage contains no artifact bytes |
| ✅ | Core remains usable without any implementation |
| ✅ | Verification is binary and reproducible via hash-only |
| ✅ | Bitcoin proofs are independently verifiable without Umarise |
| ✅ | Timestamp semantics are "no later than" (upper bound) |

---

## 11. Non-Goals (Explicit)

Umarise Core does **not**:

| Excluded | Rationale |
|----------|-----------|
| Store content | Core is attestation, not storage |
| Provide retrieval | Implementation responsibility |
| Provide search | Implementation responsibility |
| Interpret meaning | Core is content-agnostic |
| Apply policy | Governance layer responsibility |
| Enforce governance | Governance layer responsibility |
| Resolve disputes | External to origin layer |
| Decide outcomes | External to origin layer |
| Assert exact timestamps | Only upper bounds ("no later than") |

All of the above may exist in implementations or partner systems, but never in Core.

---

## 12. Domain Architecture

### 12.1 Infrastructure Domains (Independent)

| Domain | Purpose | Hosting |
|--------|---------|---------|
| **anchoring-spec.org** | Normative specification (IEC) | GitHub Pages (AnchoringTrust org) |
| **verify-anchoring.org** | Reference verifier V(B,P,L) | GitHub Pages (AnchoringTrust org) |

These are zero-analytics, zero-tracker, zero-backend. Released under the Unlicense (Public Domain).

### 12.2 Implementation Domains

| Domain | Purpose | Layer |
|--------|---------|-------|
| **anchoring.app** | B2C ritual capture PWA | Implementation |
| **itexisted.app** | B2C utility, persistent proof URLs | Implementation |
| **umarise.com** | B2B hub, documentation, API reference | Implementation + docs |
| **core.umarise.com** | Core API | Core |

### 12.3 Hierarchy (Binding)

```
anchoring-spec.org          ← Normative specification
  └─ verify-anchoring.org   ← Reference verifier (implements spec)
       └─ Implementations   ← anchoring.app, itexisted.app, umarise.com, partners
```

The specification is normative. Implementations are not.

---

## 13. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT / PARTNER                          │
│                                                              │
│  Artifact (bytes)                                            │
│  • image / document / prompt                                 │
│  • stored locally or in partner vault                        │
│  • never sent to Umarise Core                                │
│                                                              │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ SHA-256 hash (computed locally)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    UMARISE CORE (INFRA)                      │
│              Public Origin Attestation Constraint            │
│                                                              │
│  INPUT:    hash (sha256 only)                                │
│  OUTPUT:   { origin_id, short_token, hash, captured_at }     │
│  ANCHOR:   Bitcoin via OpenTimestamps (automatic)            │
│                                                              │
│  APIs:                                                       │
│    POST  /v1-core-origins       (hash → origin record)       │
│    GET   /v1-core-resolve       (lookup by id/hash/token)    │
│    POST  /v1-core-verify        (hash → found/not-found)     │
│    GET   /v1-core-proof         (binary .ots download)       │
│    GET   /v1-core-health        (status)                     │
│                                                              │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ origin_id + timestamp (receipt-like facts)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATIONS                            │
│                                                              │
│  anchoring.app    — B2C ritual capture + local gallery       │
│  itexisted.app    — B2C utility + persistent proof URLs      │
│  umarise.com      — B2B hub + partner documentation          │
│  Partner systems  — Third-party integrations via API          │
│                                                              │
│  RULE: Implementations USE Core. Core does NOT depend on     │
│        any implementation.                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              INDEPENDENT INFRASTRUCTURE                       │
│                                                              │
│  anchoring-spec.org   — Normative specification (IEC)        │
│  verify-anchoring.org — Reference verifier V(B,P,L)          │
│                                                              │
│  Zero analytics. Zero backend. Public domain.                │
│  Operates independently of all Umarise infrastructure.       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 14. Implementation Status

| Component | Endpoint | Status |
|-----------|----------|--------|
| **Core Origins** | `POST /v1-core-origins` | ✅ STABLE v1 (frozen) |
| **Core Resolve** | `GET /v1-core-resolve` | ✅ STABLE v1 (frozen) |
| **Core Verify** | `POST /v1-core-verify` | ✅ STABLE v1 (frozen) |
| **Core Proof** | `GET /v1-core-proof` | ✅ STABLE v1 (frozen) |
| **Core Health** | `GET /v1-core-health` | ✅ STABLE v1 (frozen) |
| **Core Table** | `origin_attestations` | ✅ STABLE v1 (frozen) |
| **OTS Proofs** | `core_ots_proofs` | ✅ Live (Bitcoin anchoring) |
| **Layer 3** | `v1-attestation-*` | ✅ Live (Stripe integrated) |
| Companion Origins | `POST /companion-origins` | ✅ Deployed |
| Companion Resolve | `GET /companion-resolve` | ✅ Deployed |
| Companion Verify | `POST /companion-verify` | ✅ Deployed |
| Specification | anchoring-spec.org | ✅ Published |
| Reference Verifier | verify-anchoring.org | ✅ Published |

---

## 15. Core API Stability Declaration

> **Umarise Core API v1 is STABLE and IMMUTABLE.**  
> **Frozen per February 24, 2026.**

The following guarantees apply:

| Guarantee | Meaning |
|-----------|---------|
| **No new fields** | Core responses will not gain additional fields |
| **No semantic drift** | Existing field meanings are frozen |
| **No convenience additions** | "Helpful" features belong in implementations |
| **No breaking changes** | v1 interface is permanent |

Additions require a new version (`/v2-core-*`), not modifications to v1.

---

## 16. Final Binding Statement

> **Umarise Core defines the constraint.**  
> **Implementations deliver convenience without contaminating the Core.**

You can use Umarise Core without our apps.  
You can verify proofs without contacting Umarise.  
The specification is normative. Implementations are not.

---

*Document version: 2.0*  
*Classification: Binding architectural specification*  
*Core API: v1 STABLE — IMMUTABLE INTERFACE — frozen February 24, 2026*
