# Security Architecture — Umarise Core

**Version:** 1.0  
**Date:** 24 February 2026  
**Audience:** External Review Program (cryptography, infrastructure, backend security, tech-legal)

---

## 1. Threat Model Summary

Umarise Core is an origin registry: it stores `(hash, origin_id, captured_at)` triples and anchors them in Bitcoin via OpenTimestamps. The security goal is **write-once immutability** — once a record exists, no actor below superuser can modify or delete it.

**In scope:** Data integrity, access control, API authentication, anchoring pipeline.  
**Out of scope:** Content interpretation, identity/ownership, companion app layer.

---

## 2. Record Immutability (origin_attestations)

### 2.1 Database Triggers (Defence Layer 1)

Two `BEFORE` triggers fire unconditionally on `origin_attestations`:

| Trigger | Event | Action |
|---------|-------|--------|
| `prevent_attestation_update` | UPDATE | `RAISE EXCEPTION 'origin records are immutable'` |
| `prevent_attestation_delete` | DELETE | `RAISE EXCEPTION 'origin records cannot be deleted'` |

These block mutation at the PostgreSQL engine level, including calls made with `service_role` credentials.

### 2.2 Row Level Security (Defence Layer 2)

| Policy | Operation | Rule | Effect |
|--------|-----------|------|--------|
| `Public can read attestations` | SELECT | `USING (true)` | Anyone can verify |
| `Only service role can insert` | INSERT | `WITH CHECK (false)` | Client INSERT blocked; service_role bypasses RLS |
| *(no UPDATE policy)* | UPDATE | — | Denied by default (no permissive policy) |
| *(no DELETE policy)* | DELETE | — | Denied by default (no permissive policy) |

### 2.3 Unique Constraints (Defence Layer 3)

Two partial unique indexes prevent duplicate attestations:

| Index | Condition | Purpose |
|-------|-----------|---------|
| `unique_hash_per_partner` | `(hash, api_key_prefix) WHERE api_key_prefix IS NOT NULL` | One attestation per hash per partner |
| `unique_hash_internal` | `(hash) WHERE api_key_prefix IS NULL` | One internal attestation per hash |

Duplicate attempts return `409 DUPLICATE_HASH`.

### 2.4 Net Result

An attacker **without superuser access** cannot:
- UPDATE any field on an existing record (trigger + no RLS policy)
- DELETE any record (trigger + no RLS policy)
- INSERT via client SDK (RLS `WITH CHECK (false)`)
- INSERT a duplicate hash for the same partner (unique index)

**Remaining vectors requiring superuser:**
- `ALTER TABLE ... DISABLE TRIGGER` — disables trigger protection
- `TRUNCATE` — bypasses row-level triggers entirely
- Direct migration access — can drop constraints

---

## 3. Proof Immutability (core_ots_proofs)

### 3.1 Database Trigger

| Trigger | Event | Action |
|---------|-------|--------|
| `prevent_anchored_proof_mutation` | UPDATE | Blocks changes when `OLD.status = 'anchored'` |

**Known gap:** No trigger prevents DELETE on `core_ots_proofs`. Mitigation: RLS restricts access to service_role only; no client pathway exists.

### 3.2 Row Level Security

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | Anchored proofs only (`status = 'anchored'`) |
| Service role | ALL | RLS bypassed |

### 3.3 Status Transitions

Valid: `pending → anchored` (one-way, enforced by trigger).  
Invalid: `anchored → pending`, `anchored → *` (blocked by trigger).

**Recommendation:** Add a DELETE trigger on `core_ots_proofs` matching the pattern used for `origin_attestations`.

---

## 4. API Key Security (partner_api_keys)

### 4.1 Key Storage

- Raw keys are **never stored**. Only `HMAC-SHA256(key, CORE_API_SECRET)` is persisted.
- The `key_prefix` (first 11 characters, format `um_xxxxxxxx`) is stored for identification.
- Keys cannot be reconstructed from the hash.

### 4.2 Key Lifecycle

| Trigger | Event | Action |
|---------|-------|--------|
| `prevent_api_key_delete` | DELETE | `RAISE EXCEPTION` — keys can only be revoked, never deleted |

Revocation sets `revoked_at` timestamp. Revoked keys are rejected at the rate limiter before reaching business logic.

### 4.3 Row Level Security

All operations blocked for client roles. Service_role only.

---

## 5. Rate Limiting

### 5.1 Implementation

Rate limits are enforced via the `core_check_rate_limit()` database function using UPSERT on `core_rate_limits`. This runs **before** business logic in every authenticated endpoint.

### 5.2 Tiers

| Tier | Limit | Window |
|------|-------|--------|
| `standard` | 100 req | per minute |
| `premium` | 1,000 req | per minute |
| `unlimited` | 100,000 req | per minute |
| Public (IP-based) | 1,000 req | per minute |

### 5.3 Privacy

Client IP addresses are SHA-256 hashed before storage in `core_request_log`. Raw IPs are never persisted.

---

## 6. Request Logging & Observability

### 6.1 core_request_log

Every API request is logged with: endpoint, method, status code, response time, error code, hashed IP, and partner key prefix. Service_role access only.

### 6.2 DDL Audit (core_ddl_audit)

An event trigger (`log_ddl_changes`) captures schema modifications (CREATE, ALTER, DROP) with:
- `object_type`, `object_name`, `object_identity`
- `command_tag`, `raw_command` (truncated to 1000 chars)
- `executed_by`, `executed_at`

**Known limitation:** `raw_command` is truncated at 1000 characters. A sufficiently long padding prefix could push destructive SQL beyond the capture window.

**Recommendation:** Increase truncation limit to 4000+ characters.

---

## 7. Architectural Invariants

These are **structural constraints**, not policy promises. They are testable:

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 1 | Records are write-once (immutable) | DB triggers block UPDATE/DELETE |
| 2 | No content stored in Core | Schema: only hash + timestamp + origin_id |
| 3 | No identity linkage in Core | No user_id, email, or PII columns |
| 4 | No list/browse endpoint | API design: resolve by ID or hash only |
| 5 | IP addresses hashed before storage | Edge function logic + SHA-256 |
| 6 | API keys hashed with HMAC-SHA256 | Key creation flow; raw key returned once |
| 7 | Rate limits enforced before logic | `core_check_rate_limit()` called first |
| 8 | Anchored proofs are immutable | DB trigger on status transition |
| 9 | Verification is platform-independent | .ots proof + SHA-256 + Bitcoin = no Umarise needed |

---

## 8. Verification Independence

The security model is designed so that **proof outlives the platform**:

1. **Artifact** — original file bytes
2. **certificate.json** — contains `hash`, `origin_id`, `captured_at`
3. **.ots proof** — binary OpenTimestamps proof anchored in Bitcoin

A third party with these three components can independently verify:
- File integrity: `sha256sum artifact == certificate.hash`
- Existence proof: `ots verify proof.ots` against the public Bitcoin blockchain

**No Umarise infrastructure, API, or account required.**

---

## 9. Known Risks & Mitigations

| Risk | Severity | Status | Mitigation |
|------|----------|--------|------------|
| Superuser can disable triggers | High | Accepted | DDL audit logs schema changes; operational access control |
| TRUNCATE bypasses row triggers | High | Accepted | No client pathway; monitor DDL audit |
| No DELETE trigger on `core_ots_proofs` | Medium | Open | Recommend adding trigger |
| DDL audit truncates at 1000 chars | Low | Open | Recommend increasing to 4000+ |
| OTS worker race condition (dual instances) | Medium | Open | Recommend `SELECT FOR UPDATE SKIP LOCKED` or `processing` status |
| `opentimestamps` npm package unmaintained | Low | Accepted | Pin version; monitor for vulnerabilities |

---

## 10. How to Verify These Claims

For each invariant, the External Review Program provides:

1. **Database inspection** — Query triggers, policies, and indexes directly
2. **API testing** — Attempt forbidden operations via public endpoints
3. **Verification scripts** — `verify-anchor.sh` and `verify-anchor.py` (zero-dependency)
4. **Sample ZIP** — Complete proof bundle for independent analysis

All materials available at [umarise.com/reviewer](https://umarise.com/reviewer).

---

*Security Architecture v1.0 — Umarise External Review Program, February 2026.*
