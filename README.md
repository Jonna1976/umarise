# Umarise

**Origin attestation infrastructure.**

Umarise is a public, protocol-level origin attestation constraint. It externally attests that a specific cryptographic hash existed at a specific moment in time.

## Architecture

Umarise consists of two explicitly separated layers:

| Layer | Purpose |
|-------|---------|
| **Umarise Core** | Public origin attestation constraint (hash + timestamp + origin_id) |
| **Umarise Companion** | Application layer that uses Core (storage, UX, integrations) |

Core defines the constraint. Companion provides convenience.  
Companion depends on Core. Core does not depend on Companion.

For the full architectural specification, see [`docs/core-vs-companion.md`](./docs/core-vs-companion.md).

## Core API (v1)

| Endpoint | Access | Purpose |
|----------|--------|---------|
| `POST /v1-core-origins` | Permissioned | Register hash → receive origin record |
| `GET /v1-core-resolve` | Public | Retrieve origin facts by hash or origin_id |
| `POST /v1-core-verify` | Public | Binary verification (match / no-match) |
| `GET /v1-core-health` | Public | System status |

## Current Status

**Phase 1: Trusted Third Party (Production Ready)**

- Database-level immutability via PostgreSQL triggers
- Write-once origin records
- Public verification, permissioned attestation

Phase 2 (OpenTimestamps/Bitcoin anchoring) is on the roadmap for trustless external verification.

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/core-vs-companion.md`](./docs/core-vs-companion.md) | Core/Companion architecture contract |
| [`docs/integration-contract.md`](./docs/integration-contract.md) | API v1 specification for partners |
| [`docs/layer-boundaries.md`](./docs/layer-boundaries.md) | Origin Layer vs Governance Layer scope |
| [`docs/infrastructure-overview.md`](./docs/infrastructure-overview.md) | Architecture, DNS, security |

## Public Pages

- [umarise.com/origin](https://umarise.lovable.app/origin) — Origin mechanism overview
- [umarise.com/spec](https://umarise.lovable.app/spec) — Technical specification
- [umarise.com/core](https://umarise.lovable.app/core) — Core API reference

## Technology

Built with Vite, TypeScript, React, Tailwind CSS, and Lovable Cloud (Supabase).

## Contact

partners@umarise.com

---

© 2026 Umarise
