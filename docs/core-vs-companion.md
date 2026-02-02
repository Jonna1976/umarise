# Umarise — Core/Companion Architecture Split

## Design Contract (Binding)

**Status:** Approved Architecture Contract  
**Version:** 1.0  
**Applies to:** All Umarise API + Lovable /app implementation  
**Goal:** Preserve Umarise Core as TSA/DNS-level infra while allowing Companion to deliver product value  
**Last updated:** February 2026

---

## 1. Principles

### 1.1 Non-Negotiable Core Definition

Umarise Core exists to do exactly one thing:

> **Externally attest that a cryptographic hash existed at a specific moment in time.**

Core records only:
- `hash`
- `timestamp`
- `origin_id`

Nothing more.

### 1.2 Non-Negotiable Separation

- Companion uses Core
- Core never depends on Companion
- Core must remain valid if Companion disappears
- Companion is replaceable
- Core is not UX

### 1.3 Rule of Thumb

| Condition | Belongs to |
|-----------|------------|
| If it touches bytes | Companion |
| If it explains meaning | Companion |
| If it helps the user | Companion |
| If it restricts options / is write-once facts | Core |

---

## 2. Layer Responsibilities

### 2.1 Umarise Core (Infra)

**MUST:**
- Accept hash-only as input (primary mode)
- Generate `origin_id`
- Bind authoritative `captured_at` timestamp
- Store immutable origin records (write-once)
- Support binary verification (match / no-match)
- Remain content-agnostic and interpretation-free

**MUST NOT:**
- Accept/store bytes or files
- Store content (no vault, no IPFS, no artifact URL)
- Return artifact URLs
- Add semantic fields (labels, types, status flags, marks)
- Implement idempotency across "same bytes" (content equality)
- Provide UX constructs (badges, marks, receipts-as-meaning)

### 2.2 Umarise Companion (App/Product, Lovable)

**MAY:**
- Accept bytes/uploads
- Compute hashes on behalf of users
- Store artifacts (Vault/IPFS/cloud)
- Provide artifact URLs, retrieval, search, dashboards
- Maintain local labels/metadata ("two words", source_system, capture_type)
- Render marks (e.g. ᵁ) and receipts for UX

**MUST:**
- Call Core to create origin records
- Treat Core output as immutable facts
- Keep all convenience features replaceable and non-authoritative
- Never imply that a UI badge alone is proof (verification is proof)

---

## 3. API Boundary & Routing

### 3.1 Endpoint Namespace

Core endpoints MUST be namespaced separately to prevent drift:

| Namespace | Purpose |
|-----------|---------|
| `/core/*` | Core endpoints (hash-only, no bytes) |
| `/companion-*` | Companion endpoints (bytes, storage, UX) |

This is a hard boundary. Anything under `/core/*` must obey Core rules.

---

## 4. Umarise Core API (Canonical)

### 4.1 POST /core/origins

**Purpose:** Create a new Origin Record from a hash.

**Request:**
```json
{
  "hash": "sha256:<hex>"
}
```

**Response:**
```json
{
  "origin_id": "<uuid>",
  "hash": "sha256:<hex>",
  "hash_algo": "sha256",
  "captured_at": "<RFC3339/ISO8601 UTC>"
}
```

**Constraints:**
- Write-once: cannot mutate an existing record
- No bytes accepted
- No labels accepted
- No artifact URLs

**Idempotency (strict Core stance):**
- Core SHOULD NOT collapse distinct "moments" into one record
- If idempotency is required for operational reasons, it MUST be implemented only on request idempotency keys, not on content equality

### 4.2 GET /core/resolve

**Query:** `?origin_id=...` OR `?hash=...`

**Purpose:** Retrieve immutable facts.

**Response:**
```json
{
  "found": true,
  "origin": {
    "origin_id": "...",
    "hash": "sha256:<hex>",
    "hash_algo": "sha256",
    "captured_at": "..."
  }
}
```

**Constraints:**
- No `artifact_url`
- No `integrity_status`
- No `capture_type`
- No `source_system`

### 4.3 POST /core/verify

**Purpose:** Verify whether a hash is attested (binary).

**Request:**
```json
{
  "hash": "sha256:<hex>"
}
```

**Response (found):**
```json
{
  "match": true,
  "origin_id": "...",
  "captured_at": "..."
}
```

**Response (not found):**
```json
{
  "match": false
}
```

**Constraints:**
- No marks (e.g. ᵁ)
- No "meaning" strings
- Verification is binary

---

## 5. Core Data Model (Minimal)

### 5.1 Table: `origin_attestations` (Core)

| Field | Type | Description |
|-------|------|-------------|
| `origin_id` | UUID | Primary key |
| `hash` | VARCHAR | SHA-256 hash (with prefix) |
| `hash_algo` | VARCHAR | Fixed `sha256` in v1 |
| `captured_at` | TIMESTAMPTZ | Authoritative timestamp |
| `created_at` | TIMESTAMPTZ | DB internal (optional) |

### 5.2 Uniqueness Policy (Moment vs Content)

Core is a timestamped attestation mechanism.

**Preferred:** Allow multiple attestations of the same hash (different moments).  
This matches TSA semantics.

If product requires a "single attestation per hash" shortcut:
- Implement it in Companion as a convenience cache
- Not as Core truth

If you decide Core uniqueness on hash, document it explicitly as a v1 constraint and accept the semantic cost.

### 5.3 Resolution Semantics (Binding)

> **If multiple Origin Records exist for the same hash, resolution returns the earliest attestation by `captured_at`.**

This is the canonical behavior. The first external attestation is the relevant origin.

---

## 6. Security & Access Control

### 6.1 Core Endpoint Access

| Endpoint | Access |
|----------|--------|
| `POST /core/origins` | Authenticated (partner API key) |
| `GET /core/resolve` | Public or rate-limited public |
| `POST /core/verify` | Public or rate-limited public |

Core MUST resist abuse via rate limiting and request validation.

### 6.2 Core is Not User-Scoped (Binding)

> **Core is not user-scoped by design.**

Core knows no user identity. Attestation ≠ ownership.  
Whoever holds the API key may attest. There is no "who", only "what + when".

This matches TSA semantics (RFC 3161), Certificate Transparency, and DNS zone updates.

### 6.3 Companion Access

Companion can remain as it is (auth + storage), independent of Core.

---

## 7. Companion Integration Pattern

### 7.1 Companion Create Flow (bytes allowed)

```
1. User uploads artifact (bytes) to Companion
2. Companion computes sha256(bytes) locally
3. Companion calls Core: POST /core/origins { hash }
4. Companion stores:
   - artifact bytes (Vault/IPFS/whatever)
   - Core response {origin_id, captured_at, hash}
   - optional local metadata (labels, source_system, "two words")
5. Companion may display UI status "Umarised" only if origin_id exists
```

### 7.2 Companion Verify Flow

```
1. User provides artifact (bytes) to Companion
2. Companion computes sha256(bytes)
3. Companion calls Core: POST /core/verify { hash }
4. Companion renders result (match/no-match) and can show receipt-like facts
```

Core remains blind to bytes and UX.

---

## 8. Migration Plan (No Regressions)

| Step | Action |
|------|--------|
| 1 | Introduce Core endpoints under `/core/*` |
| 2 | Add `origin_attestations` table |
| 3 | Update Companion create flow to: compute hash locally → call Core → keep existing storage and UI unchanged |
| 4 | Keep existing `/companion-origins`, `/companion-resolve`, `/companion-verify` as Companion endpoints |
| 5 | Optionally deprecate old endpoints later (not required for split) |

---

## 9. Acceptance Tests (Infra Purity Checks)

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
| ✅ | Core remains usable without `/app` |
| ✅ | Verification is binary and reproducible via hash-only |

---

## 10. Non-Goals (Explicit)

Umarise Core does **not**:

| Excluded | Rationale |
|----------|-----------|
| Store content | Core is attestation, not storage |
| Provide retrieval | Partner/Companion responsibility |
| Provide search | Partner/Companion responsibility |
| Interpret meaning | Core is content-agnostic |
| Apply policy | Governance layer responsibility |
| Enforce governance | Governance layer responsibility |
| Resolve disputes | External to origin layer |
| Decide outcomes | External to origin layer |

All of the above may exist in Companion or partner systems, but never in Core.

---

## 11. Positioning (Public vs Product)

| Domain | Purpose | Tone |
|--------|---------|------|
| **umarise.com** | Describes Umarise Core | Protocol/infra (ISO/RFC/TSA-like) |
| **/app** (Lovable) | Delivers Companion product experience | Product, clarity, usability |

Public language must not collapse the two.

---

## 12. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT / PARTNER                       │
│                                                              │
│  Artifact (bytes)                                            │
│  ────────────────────────────────────────────────────────   │
│  • image / document / prompt                                 │
│  • stored locally or in partner vault                        │
│  • never sent to Umarise Core                                │
│                                                              │
│  Human context (optional, local only)                        │
│  ────────────────────────────────────────────────────────   │
│  • filename, "two words", labels / UX / workflow             │
│                                                              │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ SHA-256 hash (computed locally or via Companion)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    UMARISE CORE (INFRA)                      │
│              Public Origin Attestation Constraint            │
│                                                              │
│  INPUT:    hash (sha256 only)                                │
│  OUTPUT:   { origin_id, hash, hash_algo, captured_at }       │
│                                                              │
│  STORED:   { hash, timestamp, origin_id }                    │
│                                                              │
│  APIs:                                                       │
│    POST  /core/origins  (hash → origin_id + time)            │
│    GET   /core/resolve  (origin_id | hash → facts)           │
│    POST  /core/verify   (hash → match / no-match)            │
│                                                              │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ origin_id + timestamp (receipt-like facts)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                 UMARISE COMPANION (APP / UX)                 │
│                    (Lovable implementation)                  │
│                                                              │
│  • file upload, hashing on behalf of user                    │
│  • storage (IPFS / Vault / cloud)                            │
│  • artifact URLs, receipts, visual marks (ᵁ)                 │
│  • dashboards, search, integrations                          │
│                                                              │
│  RULE: Companion USES Core. Core does NOT depend on it.      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. Implementation Status

| Component | Endpoint | Status |
|-----------|----------|--------|
| Companion Origins | `POST /companion-origins` | ✅ Deployed |
| Companion Resolve | `GET /companion-resolve` | ✅ Deployed |
| Companion Verify | `POST /companion-verify` | ✅ Deployed |
| **Core Origins** | `POST /core/origins` | ✅ **STABLE v1** |
| **Core Resolve** | `GET /core/resolve` | ✅ **STABLE v1** |
| **Core Verify** | `POST /core/verify` | ✅ **STABLE v1** |
| **Core Table** | `origin_attestations` | ✅ **STABLE v1** |

---

## 14. Core API Stability Declaration

> **Umarise Core API v1 is STABLE and IMMUTABLE.**

The following guarantees apply:

| Guarantee | Meaning |
|-----------|---------|
| **No new fields** | Core responses will not gain additional fields |
| **No semantic drift** | Existing field meanings are frozen |
| **No convenience additions** | "Helpful" features belong in Companion |
| **No breaking changes** | v1 interface is permanent |

Additions require a new version (`/core/v2/*`), not modifications to v1.

---

## 15. Final Binding Statement

> **Umarise Core defines the constraint.**  
> **The Companion delivers convenience without contaminating the Core.**

You can use Umarise Core without our app.

---

*Document version: 1.1*  
*Classification: Binding architectural specification*  
*Core API: v1 STABLE — IMMUTABLE INTERFACE*
