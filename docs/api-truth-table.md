# Umarise Core v1 — API Truth Table

> Canonical reference. Source of truth: edge function implementations.
> Last verified: 2026-02-08

## Public Base URL

```
https://core.umarise.com
```

Maps to: `https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1`

---

## Access Model

| Rule | Description |
|------|-------------|
| **Verification is public** | Anyone can verify, resolve, and download proofs without authentication |
| **Attestation is permissioned** | Creating origin records and retrieving partner proof data requires an API key |

---

## Endpoints

### 1. POST /v1-core-origins

**Purpose:** Create an origin attestation (write-once, immutable)

| Property | Value |
|----------|-------|
| **Access** | Permissioned — requires `X-API-Key` header |
| **Rate Limit** | Per partner tier: standard 100/min, premium 1000/min |
| **Input** | `{ "hash": "<sha256-hex-or-prefixed>" }` |
| **Rejected fields** | `content`, `bytes`, `data`, `file`, `source_system`, `metadata`, `labels`, `type` |
| **Hash format** | Raw 64-char hex OR `sha256:<64-hex>` (normalized to `sha256:` prefix) |
| **Status code** | `201 Created` |

**Response:**
```json
{
  "origin_id": "fb025c0e-0dc8-4b4f-b795-43177ea2a045",
  "hash": "sha256:a1b2c3d4e5f6...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-08T14:22:00Z",
  "proof_status": "pending",
  "proof_url": "/v1-core-origins-proof?origin_id=fb025c0e-..."
}
```

**Response headers:**
- `Location: /v1/core/resolve?origin_id={uuid}`
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- `X-API-Version: v1`

**Error codes:** `INVALID_HASH_FORMAT`, `INVALID_REQUEST_BODY`, `REJECTED_FIELD`, `UNAUTHORIZED`, `API_KEY_REVOKED`, `RATE_LIMIT_EXCEEDED`

---

### 2. GET /v1-core-resolve

**Purpose:** Resolve an origin attestation by ID or hash (earliest-first)

| Property | Value |
|----------|-------|
| **Access** | Public — no authentication |
| **Rate Limit** | 1000/min per IP (SHA-256 hashed) |
| **Query params** | `origin_id={uuid}` OR `hash={sha256}` (at least one required) |
| **Resolution** | Returns the **oldest** attestation (`ORDER BY captured_at ASC`) |
| **Status code** | `200 OK` or `404 Not Found` |

**Response (200):**
```json
{
  "origin_id": "fb025c0e-...",
  "hash": "sha256:a1b2c3d4e5f6...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-08T14:22:00Z"
}
```

> ⚠️ **No `proof_status` or `proof_url` in resolve response.** This endpoint returns only the immutable attestation facts.

**Response headers:**
- `Cache-Control: public, max-age=3600`

**Error (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No origin found for given identifier"
  }
}
```

---

### 3. POST /v1-core-verify

**Purpose:** Binary verification — does this hash have an attestation?

| Property | Value |
|----------|-------|
| **Access** | Public — no authentication |
| **Rate Limit** | 1000/min per IP (SHA-256 hashed) |
| **Input** | `{ "hash": "<sha256-hex-or-prefixed>" }` |
| **Rejected fields** | `content`, `bytes`, `data`, `origin_id` |
| **Resolution** | Returns the **oldest** attestation (`ORDER BY captured_at ASC`) |
| **Status code** | `200 OK` or `404 Not Found` |

**Response (200):**
```json
{
  "origin_id": "fb025c0e-...",
  "hash": "sha256:a1b2c3d4e5f6...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-08T14:22:00Z",
  "proof_status": "anchored",
  "proof_url": "/v1-core-origins-proof?origin_id=fb025c0e-..."
}
```

> `proof_status` is dynamically resolved by checking `core_ots_proofs` table. Values: `"pending"` | `"anchored"`.

**Error (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No matching origin found for hash"
  }
}
```

---

### 4. GET /v1-core-proof

**Purpose:** Download raw OTS proof file (public, trustless verification)

| Property | Value |
|----------|-------|
| **Access** | Public — no authentication |
| **Rate Limit** | 1000/min per IP (SHA-256 hashed) |
| **Query param** | `origin_id={uuid}` (required, validated as UUID v4) |
| **Status codes** | `200`, `202`, `400`, `404` |

**Response (200 — anchored):**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="{origin_id}.ots"`
- Custom headers: `X-Bitcoin-Block-Height`, `X-Anchored-At`
- Body: raw binary .ots file

**Response (202 — pending):**
```json
{
  "status": "pending",
  "message": "Proof is awaiting Bitcoin confirmation",
  "origin_id": "fb025c0e-..."
}
```

**Response (404):** No proof found for origin_id

---

### 5. GET /v1-core-origins-proof

**Purpose:** Retrieve proof data as JSON (partner endpoint)

| Property | Value |
|----------|-------|
| **Access** | Permissioned — requires `X-API-Key` header |
| **Rate Limit** | Per partner tier: standard 100/min, premium 1000/min |
| **Query param** | `origin_id={uuid}` (required, validated as UUID v4) |
| **Status codes** | `200`, `202`, `401`, `404` |

**Response (200 — anchored):**
```json
{
  "origin_id": "fb025c0e-...",
  "proof_status": "anchored",
  "bitcoin_block_height": 935037,
  "anchored_at": "2026-02-05T14:00:00Z",
  "ots_proof": "<base64-encoded .ots file>"
}
```

**Response (202 — pending):**
```json
{
  "origin_id": "fb025c0e-...",
  "proof_status": "pending",
  "message": "Bitcoin anchoring in progress. Try again later."
}
```

---

### 6. GET /v1-core-proofs-export

**Purpose:** Bulk export all proofs for a partner (backup/insurance)

| Property | Value |
|----------|-------|
| **Access** | Permissioned — requires `X-API-Key` header |
| **Rate Limit** | Per partner tier (lower limits due to heavy queries) |
| **Query params** | `status` (default: anchored), `since` (ISO 8601), `limit` (default: 100, max: 1000), `cursor` (origin_id for pagination) |

**Response (200):**
```json
{
  "export_date": "2026-02-05T14:00:00Z",
  "total_proofs": 142,
  "proofs": [...],
  "has_more": true,
  "next_cursor": "uuid-of-last-result"
}
```

---

### 7. GET /v1-core-health

**Purpose:** Public health check for monitoring

| Property | Value |
|----------|-------|
| **Access** | Public — no authentication |
| **Rate Limit** | None |
| **Status codes** | `200 OK`, `503 Service Unavailable` |
| **Timeout** | 2000ms database connectivity check |

**Response (200):**
```json
{
  "status": "operational",
  "version": "v1",
  "timestamp": "2026-02-08T14:22:00Z"
}
```

**Response (503):**
```json
{
  "status": "degraded",
  "version": "v1",
  "timestamp": "2026-02-08T14:22:00Z"
}
```

---

## Access Summary

| Endpoint | Method | Auth | Rate Limit |
|----------|--------|------|------------|
| `/v1-core-origins` | POST | X-API-Key | Tiered (100-100k/min) |
| `/v1-core-resolve` | GET | Public | 1000/min per IP |
| `/v1-core-verify` | POST | Public | 1000/min per IP |
| `/v1-core-proof` | GET | Public | 1000/min per IP |
| `/v1-core-origins-proof` | GET | X-API-Key | Tiered (100-100k/min) |
| `/v1-core-proofs-export` | GET | X-API-Key | Tiered (lower) |
| `/v1-core-health` | GET | Public | None |

---

## Proof Delivery: Dual Access

| Channel | Endpoint | Auth | Format |
|---------|----------|------|--------|
| **Public** | `/v1-core-proof` | None | Raw binary `.ots` (application/octet-stream) |
| **Partner** | `/v1-core-origins-proof` | X-API-Key | Base64-encoded in JSON |
| **Partner Bulk** | `/v1-core-proofs-export` | X-API-Key | Base64-encoded in JSON (paginated) |

---

## Response Field Matrix

| Field | origins | resolve | verify | proof | origins-proof |
|-------|---------|---------|--------|-------|---------------|
| `origin_id` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `hash` | ✅ | ✅ | ✅ | — | — |
| `hash_algo` | ✅ | ✅ | ✅ | — | — |
| `captured_at` | ✅ | ✅ | ✅ | — | — |
| `proof_status` | ✅ (always "pending") | ❌ | ✅ (dynamic) | ✅ (implicit via HTTP status) | ✅ |
| `proof_url` | ✅ | ❌ | ✅ | — | — |
| `bitcoin_block_height` | — | — | — | ✅ (header) | ✅ |
| `anchored_at` | — | — | — | ✅ (header) | ✅ |
| `ots_proof` | — | — | — | ✅ (binary body) | ✅ (base64) |

---

## Hash Normalization

All endpoints normalize hashes consistently (via `coreHelpers.normalizeHash`):

- Input `a1b2c3...` (raw 64-char hex) → stored as `sha256:a1b2c3...`
- Input `sha256:a1b2c3...` → stored as `sha256:a1b2c3...`
- Invalid format → `INVALID_HASH_FORMAT` error

Verify endpoint searches both formats (`sha256:` prefixed AND raw hex) for backward compatibility.

---

## Standard Response Headers

All endpoints include:
- `X-API-Version: v1`
- `Access-Control-Allow-Origin: *`
- Rate-limited endpoints add: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Error Format

All errors follow a consistent structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

Rate limit errors add: `retry_after_seconds`, `limit`, `window`.

---

## Invariants

1. Origin Records are **write-once** (enforced by DB triggers)
2. Origin Records are **immutable** (UPDATE/DELETE blocked by triggers)
3. Verification is **binary** (match / no match)
4. Resolution returns the **earliest** attestation (first-in-time)
5. Core accepts **hashes only** — never bytes, files, or content
6. Anchored proofs are **immutable** (mutation blocked by trigger)
7. API key records **cannot be deleted** (only revoked)

---

## Database Tables

| Table | Purpose | Immutability |
|-------|---------|-------------|
| `origin_attestations` | Origin records | Write-once (triggers block UPDATE/DELETE) |
| `core_ots_proofs` | OTS proof files | Anchored proofs immutable |
| `partner_api_keys` | API key management | No delete (revoke only) |
| `core_rate_limits` | Window-based rate counters | Mutable (operational) |
| `core_request_log` | Request telemetry | Append-only |
| `core_ddl_audit` | Schema change audit trail | Append-only (trigger-protected) |

---

## UI Documentation Pages

| Route | Purpose | Must match |
|-------|---------|-----------|
| `/review` | Technical Review Kit for CTOs | All 5 public endpoints |
| `/core` | Public API specification | All 5 public endpoints |
| `/legal` | Technical specification (normative) | Data model, trust model, access model |

---

*This document is derived from the actual edge function source code, not from UI or documentation pages.*
