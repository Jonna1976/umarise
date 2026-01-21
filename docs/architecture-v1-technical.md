# Umarise v1 Pilot - Technical Architecture

**Document type:** Factual system documentation  
**Status:** Production (Pilot)  
**Last verified:** 2026-01-21

---

## System Overview

Umarise v1 is a document capture and retrieval system. Users photograph handwritten notes, the system extracts text via OCR, and provides search functionality.

### Components

| Component | Technology | Location |
|-----------|------------|----------|
| Frontend | React 18 + Vite + Tailwind | Lovable Cloud CDN |
| Proxy Layer | Deno Edge Functions | Lovable Cloud |
| Backend Services | Python (Vision, Codex) | Hetzner Germany |
| Image Storage | IPFS | Hetzner Germany |
| Metadata Storage | SQLite + FTS5 | Hetzner Germany |

### Lovable Cloud Role

Lovable Cloud (Supabase-based) is used exclusively for:
- **Edge Function hosting** (stateless proxies to Hetzner)
- **Secrets management** (API tokens)
- **Audit log storage** (operational telemetry)

No user-generated content (images, OCR text, pages) is stored in Lovable Cloud. All user data resides on Hetzner Germany.

---

## Data Flow

### Capture Flow

```
1. User takes photo in PWA
2. Frontend computes SHA-256 hash of raw bytes
3. Image + hash sent to hetzner-storage-proxy (Edge Function)
4. Proxy forwards to Hetzner DataVault service
5. DataVault stores image in IPFS, returns CID
6. Hetzner Vision service processes image:
   - OCR via Gemini 2.5 Flash
   - Extracts: ocrText, summary, futureYouCues, keywords, tone
7. Metadata stored in SQLite with device_user_id
8. Response returned to frontend
```

### Search Flow

```
1. User enters search query
2. Frontend sends query + device_user_id to hetzner-ai-proxy
3. Proxy forwards to Hetzner Codex service
4. Codex queries SQLite FTS5 index
5. Results filtered by device_user_id
6. Ranked results returned with match reasons
```

---

## Service Architecture

### Hetzner Server (vault.umarise.com)

| Service | Port | Purpose |
|---------|------|---------|
| Nginx | 443 | SSL termination, routing |
| Vision | 3341 | OCR + AI analysis |
| Codex | 3342 | Storage + search |
| DataVault | 3340 | Image upload to IPFS |
| IPFS | 5001 | Decentralized image storage |
| Encryption | 3333 | AES-256 encryption service |

All services run on localhost only. External access via Nginx reverse proxy.

### Edge Functions (Lovable Cloud)

| Function | Purpose |
|----------|---------|
| hetzner-storage-proxy | Routes storage requests to Hetzner |
| hetzner-ai-proxy | Routes AI/search requests to Hetzner |
| hetzner-health | Health check endpoint |

Edge functions are stateless pass-through proxies. No data cached or logged.

---

## Authentication

### API Authentication

- Bearer token in Authorization header
- Token stored as `HETZNER_API_TOKEN` secret in Lovable Cloud
- Single token for all Hetzner services

**Note:** A single shared token is used as a pilot-phase simplification.

### User Isolation

- No user accounts in v1
- Device identified by `device_user_id` (UUID v4)
- Generated on first launch, stored in localStorage
- All queries filtered by device_user_id server-side

---

## Data Storage

### SQLite Schema (Codex)

```sql
-- Core table
pages (
  id TEXT PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  image_url TEXT,
  ocr_text TEXT,
  summary TEXT,
  future_you_cues TEXT,  -- JSON array
  keywords TEXT,          -- JSON array
  tone TEXT,
  origin_hash_sha256 TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Full-text search
pages_fts (ocr_text, summary, future_you_cues, keywords)
```

### IPFS Storage

- Images stored as immutable content-addressed blobs
- CID (Content Identifier) stored in pages.image_url
- Format: `ipfs://Qm...` or gateway URL

**Encryption position:** Images are stored plaintext in IPFS. Encryption (AES-256) is applied at the volume level on Hetzner, not to individual IPFS blobs.

---

## Origin Hash

### Purpose

Verify image hasn't been modified since capture.

**Trust boundary:** The origin hash trust boundary is the client device at capture time.

### Implementation

```typescript
// Frontend (src/lib/originHash.ts)
1. Read image as ArrayBuffer
2. Compute SHA-256: crypto.subtle.digest('SHA-256', bytes)
3. Convert to hex string
4. Store in origin_hash_sha256 column
```

### Verification

```typescript
1. Download image from IPFS
2. Compute SHA-256 of downloaded bytes
3. Compare with stored origin_hash_sha256
4. Match = unmodified, Mismatch = tampered
```

---

## Search Implementation

### Ranking Algorithm (Codex)

```python
WEIGHTS = {
    'future_you_cue_exact': 100,
    'future_you_cue_partial': 60,
    'keyword_match': 40,
    'ocr_contains': 20,
    'summary_contains': 10
}
```

### Response Format

```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "id": "uuid",
      "matchType": "future_you_cue",
      "score": 0.85,
      "ocrText": "...",
      "summary": "..."
    }
  ]
}
```

---

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Search | 60 req/min per device |
| Upload | 10 req/min per device |
| General | 30 req/min per device |

**Rate limit key:** `device_user_id` only. IP address is not used for rate limiting.

Enforced in Edge Functions. Returns 429 when exceeded.

---

## Security Configuration

### Network

- HTTPS only (Let's Encrypt)
- Firewall: ports 22, 80, 443 only
- Services on localhost, not exposed

### Data

- AES-256 encryption at rest (volume-level)
- Device isolation via device_user_id
- No cross-device data access

### Audit Logging

All API requests are logged to the `audit_logs` table in Lovable Cloud.

```sql
audit_logs (
  id UUID PRIMARY KEY,
  request_id TEXT NOT NULL,
  device_user_id TEXT NOT NULL,
  service TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT DEFAULT 'POST',
  status_code INTEGER,
  duration_ms INTEGER,
  rate_limited BOOLEAN DEFAULT FALSE,
  rate_limit_remaining INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
)
```

Logs are append-only (no UPDATE/DELETE policies). Retention: 90 days.

---

## Health Checks

| URL | Routing | Expected Response |
|-----|---------|-------------------|
| `https://vault.umarise.com/health` | Direct via Nginx | `{"status": "ok"}` |
| `https://vault.umarise.com/api/vision/health` | Direct via Nginx → Vision service | `{"status": "ok"}` |
| `https://vault.umarise.com/api/codex/health` | Direct via Nginx → Codex service | `{"status": "ok"}` |

All health checks bypass Edge Functions and hit Hetzner backend services directly via Nginx routing.

---

## Backup

- Location: `/root/backups/`
- Schedule: Daily cron
- Contents: SQLite database, IPFS pins
- Retention: 7 days

---

## Known Limitations

1. **No offline mode** - Requires network for all operations
2. **Single device** - No sync between devices
3. **No user accounts** - Device loss = data inaccessible
4. **Rate limits** - May throttle heavy users

---

## File References

| File | Purpose |
|------|---------|
| `src/lib/abstractions/storage.ts` | Storage provider interface |
| `src/lib/abstractions/ai.ts` | AI provider interface |
| `src/lib/originHash.ts` | Hash computation |
| `supabase/functions/hetzner-storage-proxy/` | Storage proxy |
| `supabase/functions/hetzner-ai-proxy/` | AI/search proxy |

---

*This document describes the implemented system as of 2026-01-21.*
