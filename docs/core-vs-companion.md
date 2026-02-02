# Umarise — Core vs Companion

## Architectural Specification

**Status:** Binding design guidance  
**Goal:** Preserve Umarise as infra-primitive while enabling product value  
**Last updated:** February 2026

---

## 1. Why This Split Exists (Non-Negotiable)

Umarise is built in two explicitly different layers:

| Layer | Description | Comparable to |
|-------|-------------|---------------|
| **Umarise Core** | Public, protocol-level origin attestation constraint | TSA / DNS / Certificate Authorities |
| **Umarise Companion** | User-facing application that uses Umarise Core | Browsers using DNS, apps using TLS |

This split is intentional and required.

> **If Core and Product are merged, Umarise stops being infrastructure and becomes "just another platform".**

---

## 2. Umarise Core — What It IS

Umarise Core exists to do exactly one thing:

> **Externally attest that a specific cryptographic hash existed at a specific moment in time.**

### Core Characteristics (All Must Hold)

- Content-agnostic
- Stateless beyond origin records
- Write-once
- Externally verifiable
- Fail-safe (proof remains valid even if Umarise disappears)

### Core Stores ONLY

```
{ hash, timestamp, origin_id }
```

Nothing else.

---

## 3. Umarise Core — What It MUST NOT Do

These are hard exclusions. If any of these appear in Core, it is no longer infrastructure.

| ❌ Core Must NOT |
|------------------|
| Accept or store bytes / files / content |
| Provide artifact URLs or retrieval |
| Run IPFS / Vault / storage |
| Compute meaning, integrity status, or semantics |
| Expose UI, badges, marks, or branding |
| Include labels like `source_system`, `capture_type` |
| Do idempotency on content |
| Optimize for UX, convenience, or explanation |

### Rule of Thumb

> **If it touches bytes, explains meaning, or helps the user — it is not Core.**

---

## 4. Umarise Core — Canonical API (Hash-Only)

### POST /core/origins

**Request:**
```json
{
  "hash": "sha256:..."
}
```

**Response:**
```json
{
  "origin_id": "...",
  "hash": "...",
  "hash_algo": "sha256",
  "captured_at": "..."
}
```

### GET /core/resolve

**Query:** `?origin_id=...` or `?hash=...`

**Response:**
```json
{
  "origin_id": "...",
  "hash": "...",
  "hash_algo": "sha256",
  "captured_at": "..."
}
```

### POST /core/verify

**Request:**
```json
{
  "hash": "sha256:..."
}
```

**Response:**
```json
{
  "match": true,
  "origin_id": "...",
  "captured_at": "..."
}
```

**That is the entire Core. Anything more belongs elsewhere.**

---

## 5. Umarise Companion (App) — What It IS

The Companion is where all product value lives.

It is allowed — encouraged even — to be:
- Opinionated
- Helpful
- Branded
- User-friendly

**The Companion uses Umarise Core, but does not define it.**

---

## 6. What Belongs in Companion

| ✅ Companion May Include |
|--------------------------|
| File / image uploads |
| Hashing on behalf of users |
| IPFS / Vault / storage |
| Artifact URLs |
| Receipts / confirmations |
| UI indicators (e.g. ᵁ mark) |
| Dashboards |
| Search & retrieval |
| Labels, tags, "two words" |
| Integrations (Notion, Drive, etc.) |

### Key Rule

> **Companion adds convenience. Core provides constraint.**

Companion must always be replaceable without breaking the validity of Core proofs.

---

## 7. How Core and Companion Relate

### Correct Relationship

```
Companion → calls Core
Core → never calls Companion
Core does not "know" Companion exists
```

### Positioning Language (Important)

- **Core:** "Umarise is a public origin-attestation constraint."
- **Companion:** "This application uses Umarise Core."

Never the other way around.

---

## 8. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT / PARTNER                       │
│                                                              │
│  Artifact (bytes)                                            │
│  ────────────────────────────────────────────────────────   │
│  • image / document / prompt                                 │
│  • stored locally or in partner vault                         │
│  • never sent to Umarise Core                                 │
│                                                              │
│  Human context (optional, local only)                         │
│  ────────────────────────────────────────────────────────   │
│  • filename                                                   │
│  • "two words"                                                │
│  • labels / UX / workflow                                    │
│                                                              │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ SHA-256 hash (computed locally or via app)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    UMARISE CORE (INFRA)                       │
│              Public Origin Attestation Constraint             │
│                                                              │
│  INPUT                                                       │
│  ────────────────────────────────────────────────────────   │
│  hash (sha256)                                                │
│                                                              │
│  CORE OPERATION                                               │
│  ────────────────────────────────────────────────────────   │
│  • bind authoritative timestamp                               │
│  • generate origin_id                                         │
│  • write-once record                                          │
│                                                              │
│  STORED (AND ONLY THIS)                                       │
│  ────────────────────────────────────────────────────────   │
│  { hash, timestamp, origin_id }                               │
│                                                              │
│  PROPERTIES                                                   │
│  ────────────────────────────────────────────────────────   │
│  • content-agnostic                                           │
│  • no custody                                                 │
│  • no interpretation                                         │
│  • binary verification (match / no-match)                    │
│                                                              │
│  APIs                                                        │
│  ────────────────────────────────────────────────────────   │
│  POST   /core/origins   (hash → origin_id + time)             │
│  GET    /core/resolve   (origin_id | hash → facts)            │
│  POST   /core/verify    (hash → match / no-match)             │
│                                                              │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ origin_id + timestamp (receipt-like facts)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                 UMARISE COMPANION (APP / UX)                  │
│                    (Lovable implementation)                   │
│                                                              │
│  OPTIONAL / PRODUCT LAYER                                     │
│  ────────────────────────────────────────────────────────   │
│  • file upload                                                │
│  • hashing on behalf of user                                  │
│  • storage (IPFS / Vault / cloud)                             │
│  • artifact URLs                                              │
│  • receipts / confirmations                                  │
│  • visual marks (ᵁ)                                           │
│  • dashboards                                                 │
│  • search & retrieval                                        │
│  • integrations (Notion, Drive, etc.)                         │
│                                                              │
│  IMPORTANT                                                    │
│  ────────────────────────────────────────────────────────   │
│  • Companion USES Core                                       │
│  • Core does NOT depend on Companion                          │
│  • Companion is replaceable                                  │
│  • Core proofs remain valid without Companion                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Website Split

| Domain | Purpose | Tone |
|--------|---------|------|
| **umarise.com** | Infra landing page, Core explanation, Protocol/API description | ISO / RFC / TSA-like |
| **/app** | Product experience, UX, flows, storage, demonstrations | Product, clarity, usability |

### umarise.com (Root)
- No uploads
- No dashboards
- No product claims

### /app (Companion)
- User value
- All product features
- All convenience

---

## 10. Implementation Status

| Component | Endpoint | Status |
|-----------|----------|--------|
| Companion Origins | `POST /companion-origins` | ✅ Deployed |
| Companion Resolve | `GET /companion-resolve` | ✅ Deployed |
| Companion Verify | `POST /companion-verify` | ✅ Deployed |
| **Core Origins** | `POST /core/origins` | 🔨 To be built |
| **Core Resolve** | `GET /core/resolve` | 🔨 To be built |
| **Core Verify** | `POST /core/verify` | 🔨 To be built |

---

## 11. Design Check (Binding Rule)

Use this as a design check for any new feature:

> **If a feature makes Umarise easier to use, it belongs in Companion.**  
> **If a feature makes Umarise harder to misuse, it belongs in Core.**

---

## 12. Final Statement

This is not a downgrade of the app. It is what allows the app to exist without compromising the Core.

**Umarise Core must remain: blind, minimal, and indifferent.**

Everything else is allowed — as long as it is clearly not Core.

---

*Document version: 1.0*  
*Classification: Binding architectural specification*
