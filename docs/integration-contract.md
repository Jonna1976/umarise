# Integration Contract — Origin Record Layer API v1

> External systems: this is what you need to implement to use Umarise as an origin record layer.  
> No app knowledge required. No runtime dependency.

---

## 1. Core Principles (non-negotiable)

| Principle | Meaning |
|-----------|---------|
| **Create-only** | Origins cannot be modified after capture |
| **Content-addressed** | Origin = hash / CID |
| **Read-only after capture** | No UPDATE endpoint exists |
| **System-agnostic** | No assumptions about upstream applications |
| **Explicit failure** | Absence of origin is always detectable |

---

## 2. Canonical Data Model

```typescript
interface OriginRecord {
  origin_id: string;          // UUID
  origin_cid: string;         // IPFS CID
  origin_hash: string;        // SHA-256
  hash_algo: "sha256";
  captured_at: string;        // ISO-8601
  source_system: string;      // "notion", "nextcloud", "scanner", etc.
  capture_type: "image" | "text" | "binary";
  integrity_status: "valid" | "legacy" | "unverified";
}
```

---

## 3. API Primitives

### 3.1 Create Origin (write-once)

```
POST /origins
```

**Request:**
```json
{
  "content": "<binary | text>",
  "source_system": "notion",
  "metadata": { ... }
}
```

**Guarantees:**
- Hash is computed before storage
- Returns immutable origin reference
- No UPDATE endpoint exists

---

### 3.2 Resolve Origin

```
GET /origins/{origin_id}
GET /resolve?cid={cid}
GET /resolve?hash={sha256}
```

**Response:**
```json
{
  "origin": {
    "origin_id": "...",
    "origin_cid": "...",
    "origin_hash": "...",
    "hash_algo": "sha256",
    "captured_at": "...",
    "source_system": "...",
    "capture_type": "image",
    "integrity_status": "valid"
  },
  "artifact_url": "https://vault.umarise.com/ipfs/{cid}",
  "proof": {
    "hash": "...",
    "algo": "sha256"
  }
}
```

---

### 3.3 Verify Origin Integrity

```
POST /verify
```

**Request:**
```json
{
  "origin_id": "...",
  "content": "<binary>"
}
```

**Response:**
```json
{
  "match": true
}
```

---

### 3.4 Link External Systems (cross-system reference)

```
POST /links
```

**Purpose:** Declare derivation or citation without synchronization.

**Request:**
```json
{
  "origin_id": "...",
  "external_system": "notion",
  "external_reference": "page://abc123",
  "link_type": "derived" | "cited" | "referenced"
}
```

**Guarantees:**
- Links are append-only
- No reverse sync
- No overwrite

---

## 4. Explicit Failure Modes

| Scenario | Result |
|----------|--------|
| No origin provided | `origin: null` (explicit absence) |
| Content mismatch | `verify: false` |
| Modified artifact | New CID, old origin remains |
| System ignores Umarise | Detectable, not prevented |

> **Governance begins where these failures have consequences.**

---

## 5. Integration Promise

What partners get:

- **No lock-in** — Origins are portable
- **No runtime dependency** — Umarise can be offline
- **Evidence and reference only** — No workflow assumptions
- **Works alongside existing stacks** — Not a replacement

---

## 6. Explicit Non-Features

**Umarise is resolved and verified — never searched.**

The following capabilities are explicitly excluded from the API:

| Not Provided | Rationale |
|--------------|-----------|
| Full-text search | Search requires interpretation; Umarise records, it does not interpret |
| Semantic/fuzzy matching | Identity is deterministic, not probabilistic |
| Content indexing | Partners own their retrieval layer |
| OCR / text extraction | Content analysis belongs to upstream systems |
| AI-generated metadata | Umarise stores origin, not derived intelligence |
| Browsing / timeline views | Presentation layer is partner responsibility |

Partners call Umarise with known identifiers (`origin_id`, `hash`, `CID`). Discovery happens in their systems.

---

## 7. Retrieval Architecture

Retrieval happens at the identity layer, not the content layer. Umarise is invoked by reference, not by query.

```
┌─────────────────────────────────────────────┐
│  Partner Systems (Search / AI / Workflow)   │
│  ─────────────────────────────────────────  │
│  • Full-text search                         │
│  • Semantic matching                        │
│  • Content indexing                         │
│  • User selects result → has reference      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│        Umarise API: /resolve                │
│  ─────────────────────────────────────────  │
│  Input: origin_id | hash | CID              │
│  Output: Origin metadata + artifact URL     │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│        Umarise API: /verify (optional)      │
│  ─────────────────────────────────────────  │
│  Input: origin_id + content bytes           │
│  Output: { match: true | false }            │
└─────────────────────────────────────────────┘
```

**Integration pattern:**
1. Partner system performs search/selection in their domain
2. Partner calls `/resolve` with known identifier
3. Partner optionally calls `/verify` to confirm integrity

> You search in your systems. You verify at Umarise.

---

## 8. Rate Limits

All endpoints are rate-limited per minute window. Rate limit status is communicated via standard headers on every response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `X-API-Version` | API version (`v1`) |

### Public Endpoints (rate-limited by IP)

| Endpoint | Method | Limit |
|----------|--------|-------|
| `/v1-core-resolve` | GET | 1,000/min |
| `/v1-core-verify` | POST | 1,000/min |
| `/v1-core-proof` | GET | 1,000/min |
| `/v1-core-health` | GET | No limit |

### Partner Endpoints (rate-limited by API key)

| Endpoint | Method | Standard | Premium |
|----------|--------|----------|---------|
| `/v1-core-origins` | POST | 100/min | 1,000/min |
| `/v1-core-origins-proof` | GET | 100/min | 1,000/min |
| `/v1-core-origins-export` | GET | 60/min | 60/min |
| `/v1-core-proofs-export` | GET | 10/min | 50/min |

### Rate Limit Exceeded Response

When a rate limit is exceeded, the API returns `429 Too Many Requests`:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 45 seconds.",
    "retry_after_seconds": 45,
    "limit": 100,
    "window": "1m"
  }
}
```

The response includes a `Retry-After` header with the number of seconds to wait.

---

## 9. API Versioning

All responses include the `X-API-Version: v1` header. The current and only supported version is `v1`.

Breaking changes will be introduced under a new version prefix (e.g., `/v2-core-*`). The `v1` API is frozen and will remain available indefinitely.

---

## 10. Current Implementation Status

| Primitive | Status | Endpoint |
|-----------|--------|----------|
| Create Origin | ✅ Implemented | `POST /origins` |
| Resolve Origin | ✅ Implemented | `GET /resolve?origin_id=...` or `GET /resolve?hash=...` |
| Verify Origin | ✅ Implemented | `POST /verify` |
| Link External | Phase 2 evaluation | Not yet implemented |

---

## 9. Base URL

```
Production: https://vault.umarise.com
Edge Functions: https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1
```

---

*Contract version: 1.2*  
*Last updated: March 2026*
