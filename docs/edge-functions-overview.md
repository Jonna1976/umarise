# Edge Functions Overzicht — Umarise Core

**Laatste update:** 3 maart 2026  
**Totaal actief:** 32 functies  
**Deprecated:** 10 functies (AI/Companion — niet deployen)

---

## 1. Core API (8 functies)

Publieke en partner-endpoints voor het attestatie-register.

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `v1-core-health` | GET | Publiek | Beschikbaarheidscheck + DB ping |
| `v1-core-origins` | POST | Partner (X-API-Key) | Nieuwe attestatie aanmaken |
| `v1-core-resolve` | GET | Publiek | Origin opzoeken op origin_id |
| `v1-core-verify` | POST | Publiek | Hash verifiëren tegen register |
| `v1-core-proof` | GET | Publiek | OTS proof binair downloaden |
| `v1-core-origins-proof` | GET | Partner (X-API-Key) | OTS proof als JSON |
| `v1-core-origins-export` | GET | Partner (X-API-Key) | Bulk attestatie-export |
| `v1-core-proofs-export` | GET | Partner (X-API-Key) | Bulk proof-export |

## 2. Attestation (5 functies)

Betaalde attestatie-workflow (Stripe checkout → bevestiging).

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `v1-attestation-request` | POST | Publiek | Attestatie-aanvraag starten |
| `v1-attestation-checkout` | POST | Publiek | Stripe checkout sessie aanmaken |
| `v1-attestation-webhook` | POST | Stripe webhook | Betaling verwerken (idempotent) |
| `v1-attestation-confirm` | POST | Internal (X-Internal-Secret) | Attestatie officieel bevestigen |
| `v1-attestation-verify` | GET | Publiek | Attestatie-status opvragen |

## 3. Companion (4 functies)

Device-sync endpoints voor de PWA (Companion-laag).

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `companion-origins` | POST | Device (device_user_id) | Origins ophalen per device |
| `companion-resolve` | GET | Device | Origin resolven vanuit PWA |
| `companion-verify` | POST | Device | Hash verifiëren vanuit PWA |
| `companion-data` | GET/POST | Device | Page-data sync |

## 4. Internal (5 functies)

Administratieve endpoints — alleen via `X-Internal-Secret`.

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `v1-internal-metrics` | GET | Internal | 24h dashboard metrics |
| `v1-internal-partner-create` | POST | Internal | Nieuwe partner API key aanmaken |
| `v1-internal-webhook-dispatch` | POST | Internal | Webhook delivery naar partners |
| `internal-generate-partner-key` | POST | Internal | Partner key genereren (utility) |
| `internal-e2e-test` | POST | Internal | End-to-end test suite |

## 5. Infrastructure (8 functies)

Achtergrond-processen, proxies en onderhoudstaken.

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `health-check-cron` | GET | Cron | Periodieke health monitoring |
| `notify-ots-complete` | POST | Service role | OTS worker notificatie |
| `resolve-origin` | GET | Publiek | Lightweight origin resolver |
| `origin-image-proxy` | GET | Publiek | Image proxy voor origin previews |
| `search-pages` | POST | Device | Full-text zoeken in pages |
| `migrate-legacy-pages` | POST | Internal | Eenmalige migratie-utility |
| `hetzner-storage-proxy` | POST | Device | Proxy naar Hetzner object storage |
| `hetzner-health` | GET | Publiek | Hetzner VPS beschikbaarheidscheck |

## 6. Stripe (1 functie)

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `v1-stripe-credit-webhook` | POST | Stripe webhook | Credit balance bijwerken |

## 7. AI Proxy (1 functie)

| Functie | Methode | Toegang | Beschrijving |
|---|---|---|---|
| `hetzner-ai-proxy` | POST | Device | Proxy naar Hetzner AI endpoints |

---

## Deprecated (10 functies — NIET deployen)

Voormalige AI/Companion functies. Code blijft als referentie in repo.  
Zie: `docs/core-vs-companion.md`

| Functie | Reden |
|---|---|
| `analyze-page` | AI-analyse → Hetzner |
| `analyze-patterns` | AI-analyse → Hetzner |
| `analyze-personality` | AI-analyse → Hetzner |
| `generate-embeddings` | AI-analyse → Hetzner |
| `generate-memory-summary` | AI-analyse → Hetzner |
| `generate-personality-art` | AI-analyse → Hetzner |
| `generate-recommendations` | AI-analyse → Hetzner |
| `generate-share-content` | AI-analyse → Hetzner |
| `generate-year-reflection` | AI-analyse → Hetzner |
| `api-support-chat` | LOVABLE_API_KEY dependency |
