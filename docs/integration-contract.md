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

## 6. Current Implementation Status

| Primitive | Status | Endpoint |
|-----------|--------|----------|
| Create Origin | ✅ Implemented | `POST /api/codex/pages` via proxy |
| Resolve Origin | ✅ Implemented | `GET /resolve-origin?origin_id=...` |
| Verify Origin | ✅ Implemented | Client-side + `VerifyOriginButton` |
| Link External | 🔮 Conceptual | Not yet implemented |

---

## 7. Base URL

```
Production: https://vault.umarise.com
Edge Proxy: Available on request
```

---

*Contract version: 1.0*  
*Last updated: January 2026*
