# Umarise Core: Technische Inventarisatie v2

**Datum:** 4 februari 2026  
**Versie:** Na implementatie Infrastructure Plan + OTS Worker

---

## Executive Summary

Umarise Core v1 is operationeel als production-ready origin registry met **Bitcoin-anchoring via OpenTimestamps**. De infrastructuur is geüpgraded van een interne API naar een partner-integreerbare infrastructuur-primitief met API versioning, rate limiting, observability, geformaliseerde partner onboarding, én trustless externe verificatie.

---

## 1. API Endpoints — Huidige Staat

### v1 Endpoints (Production)

| Endpoint | Methode | Auth | Status | Functie |
|----------|---------|------|--------|---------|
| `/v1-core-health` | GET | Geen | ✅ Live | Systeem health check |
| `/v1-core-origins` | POST | X-API-Key | ✅ Live | Attestatie creëren |
| `/v1-core-resolve` | GET | Geen | ✅ Live | Origin opzoeken (ID/hash) |
| `/v1-core-verify` | POST | Geen | ✅ Live | Hash verificatie |
| `/v1-internal-metrics` | GET | X-Internal-Secret | ✅ Live | Operationele statistieken |
| `/v1-internal-partner-create` | POST | X-Internal-Secret | ✅ Live | Partner API key genereren |

### Legacy Endpoints (Deprecated)

| Endpoint | Status | Migratie |
|----------|--------|----------|
| `/core-origins` | Deprecated | → `/v1-core-origins` |
| `/core-resolve` | Deprecated | → `/v1-core-resolve` |
| `/core-verify` | Deprecated | → `/v1-core-verify` |
| `/companion-*` | Actief | App-laag, geen migratie nodig |

---

## 2. Database Schema — Core Tabellen

### `origin_attestations` (Immutable Origin Records)
```
origin_id      uuid        PK, auto-generated
hash           varchar     64-char hex (sha256)
hash_algo      varchar     'sha256' (default)
captured_at    timestamptz Attestatie moment
created_at     timestamptz Record aanmaak
```
**Triggers:** 
- `prevent_attestation_update` — RAISE EXCEPTION op UPDATE
- `prevent_attestation_delete` — RAISE EXCEPTION op DELETE

**Indexes:**
- `origin_attestations_hash_idx` op `hash`
- `origin_attestations_captured_at_idx` op `captured_at`

**RLS:** Public SELECT, Service role INSERT only

### `partner_api_keys` (Partner Credentials)
```
id               uuid        PK
partner_name     text        Partner identifier
key_prefix       text        First 11 chars (um_xxxxxxxx)
key_hash         text        HMAC-SHA256 hash (64 hex)
rate_limit_tier  text        'standard' | 'premium' | 'unlimited'
issued_at        timestamptz Key creation time
issued_by        text        Issuing endpoint/source
revoked_at       timestamptz NULL = active
```
**Triggers:**
- `prevent_api_key_delete` — Keys cannot be deleted, only revoked

**RLS:** Service role only (no public access)

### `core_rate_limits` (Request Throttling)
```
id             uuid        PK
rate_key       text        API key prefix OR ip:<hash>
endpoint       text        Endpoint path
window_start   timestamptz Minute boundary
request_count  integer     Requests in window
```
**UNIQUE constraint:** `(rate_key, endpoint, window_start)`

**RLS:** Service role only

### `core_request_log` (Observability)
```
id              uuid        PK
endpoint        text        Request endpoint
method          text        HTTP method
api_key_prefix  text        Partner identifier (nullable)
status_code     integer     Response status
response_time_ms integer    Latency
error_code      text        Error code if failed (nullable)
ip_hash         text        SHA-256 of client IP (privacy)
created_at      timestamptz Request time
```
**Indexes:**
- `idx_request_log_created` op `created_at`
- `idx_request_log_endpoint` op `(endpoint, created_at)`
- `idx_request_log_partner` op `(api_key_prefix, created_at)`

**RLS:** Service role only

### `core_ots_proofs` (Bitcoin Anchoring — Phase 2)
```
id                  uuid        PK
origin_id           uuid        FK → origin_attestations
ots_proof           bytea       OpenTimestamps proof file
status              text        'pending' | 'anchored'
bitcoin_block_height integer    NULL until anchored
anchored_at         timestamptz NULL until anchored
upgraded_at         timestamptz When proof was upgraded
created_at          timestamptz Record creation
```
**Triggers:**
- `prevent_anchored_proof_mutation` — Cannot modify once anchored

**RLS:** Service role + public read for anchored proofs

---

## 3. Database Functions

| Function | Purpose |
|----------|---------|
| `core_check_rate_limit(p_rate_key, p_endpoint, p_limit)` | UPSERT rate limit, returns `{count, allowed}` |
| `core_metrics_24h()` | Aggregates 24h request stats for metrics endpoint |
| `prevent_attestation_update()` | Trigger: blocks UPDATE on attestations |
| `prevent_attestation_delete()` | Trigger: blocks DELETE on attestations |
| `prevent_api_key_delete()` | Trigger: blocks DELETE on API keys |
| `prevent_anchored_proof_mutation()` | Trigger: blocks changes to anchored proofs |

---

## 4. Edge Functions — Complete Inventory

### Core v1 API (6 functions)
| Function | Lines | Purpose |
|----------|-------|---------|
| `v1-core-health` | ~60 | Health check, DB connectivity test |
| `v1-core-origins` | ~250 | Create attestation (API key auth) |
| `v1-core-resolve` | ~180 | Lookup by origin_id or hash |
| `v1-core-verify` | ~150 | Binary hash verification |
| `v1-internal-metrics` | ~120 | 24h/7d operational stats |
| `v1-internal-partner-create` | ~220 | Generate partner API key |

### Legacy Core (3 functions)
| Function | Status |
|----------|--------|
| `core-origins` | Deprecated (add X-Deprecated header) |
| `core-resolve` | Deprecated |
| `core-verify` | Deprecated |

### Companion/App Layer (9 functions)
| Function | Purpose |
|----------|---------|
| `companion-origins` | App attestation with Hetzner storage |
| `companion-resolve` | App origin lookup |
| `companion-verify` | App verification |
| `hetzner-ai-proxy` | OCR/analysis proxy |
| `hetzner-storage-proxy` | Image storage proxy |
| `hetzner-health` | Hetzner connectivity check |
| `analyze-page` | AI page analysis |
| `analyze-patterns` | Pattern detection |
| `analyze-personality` | Personality insights |

### Support Functions (8 functions)
| Function | Purpose |
|----------|---------|
| `generate-embeddings` | Vector embeddings |
| `generate-memory-summary` | Memory summaries |
| `generate-personality-art` | Generative art |
| `generate-recommendations` | Content recommendations |
| `generate-share-content` | Share cards |
| `generate-year-reflection` | Year-end reflections |
| `search-pages` | Full-text search |
| `origin-image-proxy` | Image serving |

### Internal/Test (4 functions)
| Function | Purpose |
|----------|---------|
| `internal-e2e-test` | End-to-end testing |
| `internal-generate-partner-key` | Legacy key generation |
| `migrate-legacy-pages` | Data migration |
| `resolve-origin` | Legacy resolution |

---

## 5. Secrets Configuration

| Secret | Purpose | Set |
|--------|---------|-----|
| `CORE_API_SECRET` | HMAC-SHA256 key hashing | ✅ |
| `INTERNAL_API_SECRET` | Internal endpoint auth | ✅ |
| `HETZNER_API_TOKEN` | Hetzner storage access | ✅ |
| `LOVABLE_API_KEY` | AI model access | ✅ |
| `SUPABASE_*` | Auto-configured | ✅ |

---

## 6. Partner Status

### Active Partners (3)
| Partner | Key Prefix | Tier | Issued |
|---------|------------|------|--------|
| Summer Corp | `um_f8b49b58` | standard | 2026-02-04 |
| Acme Corp | `um_3c16d943` | standard | 2026-02-04 |
| Acme Corp | `um_409ffde3` | standard | 2026-02-04 |

### Revoked Partners (4)
| Partner | Reason |
|---------|--------|
| DesignPartner_Pilot001 (3x) | Test keys, revoked |
| DesignPartner_Pilot002 | Test key, revoked |

---

## 7. Operational Metrics (Snapshot)

| Metric | Value |
|--------|-------|
| Total Attestations | 8 |
| Active Partners | 3 |
| OTS Anchored | 1 |
| OTS Pending | 7 |

---

## 8. Documentation Assets

| Document | Location | Status |
|----------|----------|--------|
| OpenAPI 3.0 Spec | `public/openapi.yaml` | ✅ Complete (528 lines) |
| Infrastructure Plan | `docs/core-infrastructure-plan.md` | ✅ Complete |
| CTO Overview | `docs/cto-overview.md` | ✅ Complete |
| Canon v5 | `docs/canon-v5.md` | ✅ Complete |
| Layer Boundaries | `docs/layer-boundaries.md` | ✅ Complete |
| Quickstart | `docs/core-quickstart.md` | ✅ Complete |

---

## 9. Implementation Status vs. Plan

### Fase 1: API Contract ✅ COMPLEET
- [x] 1.1 API Versiebeheer (`/v1-core-*` prefix)
- [x] 1.2 Health Endpoint
- [x] 1.3 Rate Limiting (tiered, per API key/IP)
- [x] 1.4 Request Logging (privacy-preserving)
- [x] 1.5 Structured Error Responses (JSON, codes)

### Fase 2: Developer Experience (Partial)
- [x] 2.1 OpenAPI 3.0 Spec
- [x] 2.3 Developer Quickstart (basic)
- [ ] 2.2 Sandbox Environment

### Fase 3: Partner Management (Partial)
- [x] 3.2 Partner Onboarding (`v1-internal-partner-create`)
- [ ] 3.1 Partner Dashboard (self-service)

### Fase 4: Observability ✅ COMPLEET
- [x] 4.1 Internal Metrics Endpoint
- [ ] 4.2 External Uptime Monitoring

### Phase 2: OTS Integration ✅ COMPLEET
- [x] Node.js worker op Hetzner (`/opt/umarise/ots-worker/`)
- [x] Automatische stamping (cron: elk uur)
- [x] Automatische upgrade checks (cron: elke 30 min)
- [x] Proof storage in `core_ots_proofs`
- [x] Public `/v1-core-proof` endpoint
- [x] Failed proof retry logic

---

## 10. Architectural Invariants (Verified)

| Invariant | Status |
|-----------|--------|
| Core stores only hash + timestamp + origin_id | ✅ |
| No content, bytes, or files in Core tables | ✅ |
| All attestations are write-once (immutable) | ✅ |
| No list/browse endpoint for attestations | ✅ |
| No identity linkage in Core layer | ✅ |
| Legacy endpoints return deprecation headers | ✅ |
| Rate limits enforced before business logic | ✅ |
| IP addresses hashed before storage | ✅ |
| API keys hashed with HMAC-SHA256 | ✅ |

---

## 11. OTS Worker Details

| Aspect | Waarde |
|--------|--------|
| Locatie | Hetzner (94.130.180.233) `/opt/umarise/ots-worker/` |
| Runtime | Node.js |
| Cron: Stamp | Elk uur |
| Cron: Upgrade | Elke 30 min |
| Status | ✅ Live en geautomatiseerd |

Zie [`docs/ots-worker-status.md`](./ots-worker-status.md) voor volledige documentatie.

---

## 12. Next Steps (Recommended Priority)

1. **Roteer INTERNAL_API_SECRET** — Gedeeld in chat, security risk
2. **Test full attestation flow** — Acme/Summer keys via /v1-core-origins
3. **Partner Dashboard** — Self-service key management
4. **External monitoring** — BetterUptime/UptimeRobot configureren
5. **Monitor OTS pending → anchored** — Eerste batch verwacht binnen 12 uur

---

## Appendix: Rate Limit Tiers

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| `standard` | 100 | per minute | Default partner tier |
| `premium` | 1,000 | per minute | High-volume partners |
| `unlimited` | 100,000 | per minute | Strategic partners |
| `public` (IP) | 1,000 | per minute | Resolve/verify endpoints |

---

*Dit document vervangt `docs/core-technical-inventory.md` als de actuele inventarisatie.*
