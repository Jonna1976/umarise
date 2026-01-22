# UMARISE TECHNICAL FACTSHEET — CTO BRIEFING

**Date:** 2026-01-22  
**Scope:** What is currently built and operational  
**Audience:** Technical due diligence  

---

## 1. CAPTURE

### How is an artifact captured?

1. User opens PWA (React/Vite) on mobile or desktop browser
2. Browser camera API captures single photo of handwritten artifact
3. Photo is converted to base64 data URL in browser

### Interface / Endpoint

```
Frontend: src/components/capture/CameraView.tsx
    ↓ base64 image
Edge Proxy: POST /functions/v1/hetzner-storage-proxy
    ↓ { method: "POST", path: "/vault/images/upload", payload: { image, deviceUserId } }
Backend: https://vault.umarise.com/api/codex/vault/images/upload
    ↓
Storage: IPFS (returns ipfs:// CID URL)
```

### Data Flow

- Image uploaded to Hetzner Germany server
- Stored in IPFS with content-addressed CID
- Metadata stored in SQLite on Hetzner volume
- No image data is stored or persisted in Lovable Cloud; images only transit Edge Functions as an in-flight proxy

---

## 2. IMMUTABILITY

### How is the original protected from modification?

**SHA-256 Origin Hash:**

```typescript
// Calculated in browser BEFORE upload (src/lib/originHash.ts)
const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
// Returns hex string: "a1b2c3d4..."
```

**Storage:**

| What | Where | Mutable? |
|------|-------|----------|
| Origin Hash (SHA-256) | Lovable Cloud `page_origin_hashes` table | ❌ No (DB trigger prevents UPDATE) |
| Origin Hash (SHA-256) | Hetzner SQLite `originHashSha256` field | ❌ No |
| Original Image | Hetzner IPFS | ❌ No (content-addressed) |

**Technical Enforcement:**

```sql
-- Trigger on page_origin_hashes table
CREATE TRIGGER prevent_origin_hash_change
BEFORE UPDATE ON page_origin_hashes
EXECUTE FUNCTION prevent_origin_hash_change();
-- Raises exception if hash is modified
```

**What is NOT implemented:**

- ❌ Blockchain anchoring
- ❌ External timestamping authority (RFC 3161)
- ❌ Digital signatures / PKI
- ❌ Third-party notarization

**Timestamp:**

- `created_at` field stored at insert time
- Server-side timestamp (Hetzner server clock)
- No cryptographic binding to external time source

---

## 3. RETRIEVAL

### How does a user find their artifact?

**Search Endpoint:**

```
Frontend: src/components/codex/SearchView.tsx
    ↓ query string
Edge Proxy: POST /functions/v1/hetzner-ai-proxy
    ↓ { path: "/ai/search", payload: { query, deviceUserId, limit } }
Backend: https://vault.umarise.com/api/codex/ai/search
    ↓
Response: { results: [{ id, score, matchType, ... }] }
```

**Ranking Hierarchy (explicit, not ML-based):**

| Priority | Source | Weight |
|----------|--------|--------|
| 1 | Date match (parsed from query) | +200 |
| 2 | Future You Cues (user-assigned labels) | +100 |
| 3 | Primary Keyword (spine label) | +100 |
| 4 | AI Bonus Words (LLM-suggested) | +80 |
| 5 | Raw OCR text | +50 |

**Current Flow / Time:**

1. User types query → autocomplete suggestions appear (~50ms local)
2. User submits → backend search (~200-400ms network)
3. Results displayed with match reason badges
4. User taps result → full artifact shown

**Retrieval Constraints:**

- Exact word matching only (no synonyms, no translations)
- FTS5 full-text search on SQLite
- Optional: vector similarity search (embeddings stored but not primary)

---

## 4. VERIFICATION

### Can a user verify "this already existed"?

**Yes, implemented.**

**UI Location:** SnapshotView → "Verify Origin" button

**Verification Flow:**

```typescript
// src/components/codex/VerifyOriginButton.tsx

1. Fetch original image from IPFS via Hetzner
2. Calculate SHA-256 hash of fetched bytes
3. Compare with stored originHashSha256
4. Display result:
   - ✓ "Verified" (hashes match)
   - ⚠ "Legacy capture" (no hash stored - pre-hashing captures)
```

**What Verification Proves:**

- The bytes currently stored are identical to the bytes at capture time
- Bit-identity only

**What Verification Does NOT Prove:**

- ❌ Who captured it
- ❌ When exactly (no external timestamp authority)
- ❌ That content wasn't staged before capture
- ❌ Authorship or ownership

**Persistence:**

- Verification status cached in localStorage per page
- Hash lookup also stored in `page_origin_hashes` table (Lovable Cloud)

---

## 5. HUMAN SURFACE

### What does the user see after capture?

**Processing View (during upload/analysis):**

```
┌────────────────────────────────────┐
│                                    │
│     [Animated thumbnail]           │
│                                    │
│   "Analyzing your artifact..."     │
│                                    │
│     Progress indicator             │
│                                    │
└────────────────────────────────────┘
```

**Completion (after ~3-5 seconds):**

```
┌────────────────────────────────────┐
│                                    │
│   [Thumbnail with gold border]     │
│                                    │
│      ✓ Origin sealed               │
│                                    │
│   [Continue to review]             │
│                                    │
└────────────────────────────────────┘
```

**Snapshot Review View:**

- Full image display
- AI-generated summary (labeled as "AI interpretation")
- Editable "Future You Cues" (user labels)
- Date picker (user can correct)
- "Verify Origin" button with status badge

**UI Text Examples:**

- "Origin sealed" — after capture
- "Verified ✓" — after hash verification
- "Legacy capture" — for items without stored hash

---

## 6. WHAT IS EXPLICITLY NOT BUILT

| Feature | Status | Reason |
|---------|--------|--------|
| User accounts / authentication | ❌ Not built | Privacy-first design; device_user_id only |
| Email or password | ❌ Not built | No PII collected |
| Cross-device sync via accounts | ❌ Not built | Manual UUID transfer only |
| Blockchain timestamping | ❌ Not built | Complexity vs. pilot scope |
| Third-party notarization | ❌ Not built | External dependency |
| Client-side encryption (E2EE) | ❌ Not built | Would prevent cloud OCR |
| Local-on-device AI | ❌ Not built | Quality tradeoff (Gemini > local models) |
| Multi-user collaboration | ❌ Not built | Single-owner model |
| Public sharing / publishing | ❌ Not built | Private by default |
| Version history / editing | ❌ Not built | Immutable original only |
| Audit logging (user-facing) | ❌ Not built | Backend logs exist, no UI |

---

## 7. TRASH ARCHITECTURE — HYBRID MODEL

### Problem

Hetzner SQLite does not reliably persist the `is_trashed` field across restarts. This caused deleted items to reappear after server maintenance.

### Solution: Hybrid Trash Sync

```
┌─────────────────────────────────────────────────────────────┐
│  TRASH OPERATION (e.g., user deletes a page)                │
│                                                             │
│  1. Frontend calls storage.moveToTrash(pageId)              │
│  2. Storage provider performs DUAL WRITE:                   │
│     a) INSERT into Lovable Cloud hetzner_trash_index        │
│     b) PATCH to Hetzner /vault/pages/{id} (best-effort)     │
│  3. On getPages(), filter out IDs in hetzner_trash_index    │
└─────────────────────────────────────────────────────────────┘
```

**Data Residency:**

| Data | Location | Purpose |
|------|----------|---------|
| Page content & metadata | Hetzner SQLite | Sovereignty |
| Original image | Hetzner IPFS | Immutable storage |
| Trash index (page_id list) | Lovable Cloud | Cross-device sync |

**Implementation:**

```typescript
// src/lib/abstractions/storage.ts (HetznerVaultStorage)

private async getTrashedPageIds(): Promise<Set<string>> {
  const { data } = await supabase
    .from('hetzner_trash_index')
    .select('page_id')
    .eq('device_user_id', deviceUserId);
  return new Set(data.map(row => row.page_id));
}

async getPages(): Promise<Page[]> {
  const trashedIds = await this.getTrashedPageIds();
  const allPages = await this.proxyRequest('GET', '/vault/pages', ...);
  return allPages.filter(p => !trashedIds.has(p.id));
}
```

**Why This Works:**

- ✓ Page content never leaves Hetzner (sovereignty maintained)
- ✓ Trash state syncs across devices instantly
- ✓ No dependency on unreliable SQLite field
- ✓ Restore operation removes from Cloud index

---

## 8. AI PROXY ROUTING — DETAILED FLOW

### Problem

Browser CORS prevents direct calls to Hetzner backend. Also, API tokens must not be exposed client-side.

### Solution: Edge Function Proxies

```
┌─────────────────────────────────────────────────────────────┐
│                    AI REQUEST FLOW                          │
│                                                             │
│  Frontend (HetznerAIProvider)                               │
│      │                                                      │
│      ▼                                                      │
│  Supabase Edge Function: hetzner-ai-proxy                   │
│      │ (adds HETZNER_API_TOKEN header)                      │
│      ▼                                                      │
│  ┌─────────────────────────────────────────────────┐        │
│  │ ROUTING LOGIC:                                  │        │
│  │                                                 │        │
│  │ /ai/search     → vault.umarise.com/api/codex/   │        │
│  │ /ai/analyze-*  → vault.umarise.com/api/vision/  │        │
│  │ /ai/generate-* → vault.umarise.com/api/vision/  │        │
│  └─────────────────────────────────────────────────┘        │
│      │                                                      │
│      ▼                                                      │
│  Hetzner Backend                                            │
│  ├── Vision Service: Gemini 2.5 Flash (OCR, analysis)       │
│  └── Codex Service: SQLite FTS5 (search)                    │
│      │                                                      │
│      ▼                                                      │
│  Response flows back through proxy to frontend              │
└─────────────────────────────────────────────────────────────┘
```

**Proxy Implementation:**

```typescript
// supabase/functions/hetzner-ai-proxy/index.ts

const SERVICE_ROUTES = {
  '/ai/search': '/api/codex/ai/search',
  '/ai/analyze-page': '/api/vision/analyze-page',
  '/ai/analyze-patterns': '/api/vision/analyze-patterns',
  // ... other routes
};

// All requests proxied to HETZNER_BASE_URL with auth header
const response = await fetch(`${HETZNER_BASE_URL}${route}`, {
  headers: { 'Authorization': `Bearer ${HETZNER_API_TOKEN}` },
  body: JSON.stringify(payload),
});
```

**Security Properties:**

| Property | Implementation |
|----------|----------------|
| Token hidden from client | ✓ HETZNER_API_TOKEN only in Edge Function |
| CORS handled at Edge layer | ✓ Client never calls Hetzner directly |
| Rate limited | ✓ Per device_user_id, per endpoint category |
| Audit logged | ✓ All requests logged to audit_logs table |
| Request timeout | ✓ 60 second timeout |

**What Flows Through Proxy:**

| Data Type | Proxied? | Notes |
|-----------|----------|-------|
| Image base64 (for OCR) | ✓ Yes | Required for Gemini analysis |
| Search queries | ✓ Yes | Text only, no images |
| Page metadata | ✓ Yes | On create/update |
| device_user_id | ✓ Yes | For RLS filtering |

**What Does NOT Flow Through Proxy:**

| Data Type | Reason |
|-----------|--------|
| Encryption keys | Stored in localStorage, never transmitted |
| PIN codes | Local gate only |
| Verification results | Calculated client-side |

---

## 9. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      USER DEVICE                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  PWA (React/Vite/TypeScript)                            ││
│  │  - Camera capture                                       ││
│  │  - SHA-256 hash calculation (WebCrypto)                 ││
│  │  - Local PIN gate (localStorage)                        ││
│  │  - device_user_id (localStorage)                        ││
│  │  - Verification logic (client-side)                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               LOVABLE CLOUD (Supabase EU)                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Edge Functions (Deno) — STATELESS PROXIES              ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ hetzner-storage-proxy                               │││
│  │  │ - Routes /vault/* to Codex Service                  │││
│  │  │ - Image upload, page CRUD                           │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ hetzner-ai-proxy                                    │││
│  │  │ - Routes /ai/search to Codex                        │││
│  │  │ - Routes /ai/analyze-* to Vision                    │││
│  │  │ - Adds HETZNER_API_TOKEN                            │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  - Rate limiting (per device_user_id, per category)     ││
│  │  - Request timeout (60s)                                ││
│  │  - No image data stored                                 ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Postgres (Supabase) — SYNC METADATA ONLY               ││
│  │  - page_origin_hashes (SHA-256 sidecar for verification)││
│  │  - hetzner_trash_index (cross-device trash sync)        ││
│  │  - audit_logs (proxy request logs, 90-day retention)    ││
│  │  - search_telemetry (proxied to Hetzner)                ││
│  │  - RLS on user-scoped tables; Edge Functions use        ││
│  │    service role but enforce device_user_id scoping      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (proxied, authenticated)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 HETZNER GERMANY (vault.umarise.com)         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Nginx Gateway (port 443)                               ││
│  │  - SSL termination                                      ││
│  │  - Route /api/codex/* → Codex (localhost:3342)          ││
│  │  - Route /api/vision/* → Vision (localhost:3341)        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Codex Service (Python, port 3342)                      ││
│  │  - REST API for pages CRUD                              ││
│  │  - SQLite metadata + FTS5 search index                  ││
│  │  - Primary storage for all page data                    ││
│  │  - origin_hash_sha256 stored per page                   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Vision Service (Python, port 3341)                     ││
│  │  - Gemini 2.5 Flash API integration                     ││
│  │  - OCR (handwriting recognition)                        ││
│  │  - Structured JSON output (summary, tone, keywords)     ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  IPFS Node (Private, Hetzner-hosted)                    ││
│  │  - Image storage (content-addressed CID)                ││
│  │  - Provider-managed at-rest encryption on volume        ││
│  │  - Content pinned only within controlled infrastructure ││
│  │  - No public IPFS swarm; data remains on DE servers     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 10. ORIGIN HASH STORAGE — DUAL WRITE

### Clarification on Hash Locations

The SHA-256 origin hash is stored in TWO locations for different purposes:

| Location | Table/Field | Frontend Model | Purpose | Authority |
|----------|-------------|----------------|---------|-----------|
| Hetzner SQLite | `origin_hash_sha256` | `originHashSha256` | Primary storage with page data | ✓ Primary |
| Lovable Cloud | `page_origin_hashes.origin_hash_sha256` | — | Sidecar for verification lookup | Backup |

**Why Dual Storage?**

1. **Hetzner = Primary:** All page data lives on Hetzner (sovereignty)
2. **Cloud Sidecar = Lookup:** Enables fast hash retrieval for verification without full page fetch
3. **Immutability Trigger:** Cloud table has DB trigger preventing modification

**Verification Flow Uses Both:**

```typescript
// src/components/codex/VerifyOriginButton.tsx

// 1. First try: get hash from page object (Hetzner data)
const hash = page.originHashSha256;

// 2. Fallback: lookup from sidecar table (Lovable Cloud)
if (!hash) {
  const { data } = await supabase
    .from('page_origin_hashes')
    .select('origin_hash_sha256')
    .eq('page_id', pageId)
    .single();
  hash = data?.origin_hash_sha256;
}
```

---

## 11. PRIVACY ASSESSMENT — FACTUAL

| Claim | Status | Evidence |
|-------|--------|----------|
| "Private by design" | ✓ Accurate | No accounts, no email, device_user_id only |
| "Zero-knowledge" | ❌ Not accurate | Server can read images (needed for OCR) |
| "Zero-access" | ✓ Partial | No human access by policy, not cryptographically enforced |
| "End-to-end encrypted" | ❌ Not accurate | No client-side encryption in v1 |
| "GDPR compliant" | ✓ Likely | Data in EU, no PII, deletion possible |
| "Data residency Germany" | ✓ Accurate | Hetzner DE, images never leave |

**Data Flow Through Lovable Cloud:**

| Data Type | Stored in Cloud? | Notes |
|-----------|------------------|-------|
| Images | ❌ No | In-flight transit only, not stored |
| OCR text | ❌ No | Proxied only, not stored |
| Origin hashes | ✓ Yes (sidecar) | For verification lookup |
| Trash index | ✓ Yes | For cross-device sync |
| Audit logs | ✓ Yes | Request metadata only |

**Honest Assessment:**

The current architecture provides **operational privacy** (policy-based access control) but not **cryptographic privacy** (zero-knowledge). The server must be trusted. Images flow through Lovable Cloud Edge Functions as a passthrough proxy but are not stored there.

---

## 12. SECURITY CONTROLS — CURRENT

| Control | Implemented |
|---------|-------------|
| HTTPS everywhere | ✓ Yes |
| Rate limiting (per device, per category) | ✓ Yes (edge function) |
| RLS on all tables | ✓ Yes |
| Input validation | ✓ Basic |
| Audit logging | ✓ Yes (90-day retention) |
| Origin hash immutability trigger | ✓ Yes |
| API token auth (backend) | ✓ Yes (HETZNER_API_TOKEN) |
| Request timeout | ✓ Yes (60 seconds) |
| User authentication | ❌ No (device-based) |
| IP-based rate limiting | ❌ No |
| Intrusion detection | ❌ No |
| Penetration tested | ❌ No |

---

## 13. KNOWN LIMITATIONS

1. **Trash sync is hybrid** — Cloud index + Hetzner data (intentional design)
2. **No offline support** — requires network for all operations
3. **Single device ownership** — manual UUID transfer for multi-device
4. **OCR quality dependent on Gemini** — handwriting recognition varies
5. **No conflict resolution** — last write wins
6. **No backup/restore UI** — backend-only
7. **Image base64 flows through proxy** — required for OCR, not stored

---

## 14. WHAT RUNS WHERE — SUMMARY

| Component | Location | Notes |
|-----------|----------|-------|
| device_user_id | localStorage | By design, ownership anchor |
| PIN code | localStorage | Local gate, not transmitted |
| Encryption keys (Private Vault) | localStorage | Local only (not implemented in v1) |
| Verification status cache | localStorage | UI optimization only |
| Demo mode flag | localStorage | Testing feature |
| Page content | Hetzner SQLite | Sovereign storage |
| Images | Hetzner IPFS | Content-addressed |
| Trash index | Lovable Cloud | Cross-device sync |
| Origin hashes (primary) | Hetzner SQLite | With page data |
| Origin hashes (sidecar) | Lovable Cloud | Verification lookup |
| Audit logs | Lovable Cloud | 90-day retention |

---

*Document generated from codebase analysis. No marketing claims, no roadmap, only current state.*  
*Last updated: 2026-01-22*
