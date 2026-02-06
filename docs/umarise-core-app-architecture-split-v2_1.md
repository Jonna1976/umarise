# Umarise — Core / App Architecture Split

**Status:** Actueel  
**Versie:** 2.1  
**Van toepassing op:** Umarise Core API + Umarise App (B2C PWA)  
**Bronnen:** Core Technische Inventarisatie v3.2 (6 feb 2026) + B2C-Inventarisatie v0.7 (6 feb 2026)  
**Gevalideerd:** 6 februari 2026 — triggers, bridge, OTS-notificatieketen geverifieerd tegen database  
**Vervangt:** Architecture Split v1.0 (2 feb 2026) en v2.0 (6 feb 2026)

---

## Terminologie

Het vorige document gebruikte "Companion" als naam voor de B2C-laag. In dit document heet die laag **App** — het is de PWA voor consumenten. Core is de B2B infrastructuurlaag. De App is de consumentenervaring die op Core draait.

---

## 1. Wat Core is

Umarise Core is een origin registry. Per attestatie legt het vast:

- Een SHA-256 hash (`hash`)
- Een tijdstip (`captured_at`)
- Een uniek adres (`origin_id`)
- Een Bitcoin-verankerd bewijs (`core_ots_proofs`)

Core slaat geen content op. Core weet niet wat de hash voorstelt.

Elke attestatie wordt automatisch verankerd in de Bitcoin-blockchain via OpenTimestamps. Het resultaat is een `.ots` proof dat onafhankelijk verifieerbaar is zonder Umarise-betrokkenheid.

---

## 2. Wat de App is

De Umarise App is een privacy-first PWA (React/TypeScript) waarmee consumenten artifacts vastleggen. De App:

- Berekent de SHA-256 hash client-side via Web Crypto API
- Slaat de thumbnail alleen lokaal op (IndexedDB)
- Stuurt alleen de hash naar Supabase
- Propageert de hash via een database trigger naar `origin_attestations` (Core)
- Genereert certificaten client-side (jsPDF + JSZip)

De originele foto bytes verlaten het device niet. De server heeft geen content.

---

## 3. Afhankelijkheidsrichting

De App gebruikt Core. Core heeft geen functionele afhankelijkheid van de App.

Dit is de technische realiteit:

- De App schrijft naar `pages` (Supabase). Een trigger (`bridge_page_to_core`) propageert de hash naar `origin_attestations`.
- Core endpoints (`/v1-core-*`) hebben geen referentie naar `pages`, `device_user_id`, thumbnails, of enig App-concept.
- Als de App verdwijnt, blijft Core functioneel via de B2B API.
- Als Core verdwijnt, heeft de App geen attestatielaag.

**Uitzondering:** de OTS Worker (Hetzner) roept na een succesvolle upgrade de App Edge Function `notify-ots-complete` aan via HTTP. Dit is een zachte Core → App koppeling. De call zit in een eigen try/catch — Core-functionaliteit (attestatie, proof, anchoring) is niet afhankelijk van het slagen van deze call. Zie sectie 8 voor details.

---

## 4. Twee schrijfpaden naar Core

Er zijn twee manieren waarop een attestatie in `origin_attestations` terechtkomt:

| Pad | Mechanisme | Auth | Rate Limiting | Gebruik |
|-----|------------|------|---------------|---------|
| **B2B** | `POST /v1-core-origins` | X-API-Key | Ja (per key/tier) | Partners, externe systemen |
| **B2C** | Trigger `bridge_page_to_core` | Supabase RLS | Nee | App-gebruikers via `pages` INSERT |

Beide paden resulteren in hetzelfde: een record in `origin_attestations` dat vervolgens door de OTS Worker wordt opgepakt voor Bitcoin-anchoring.

Het B2B-pad is de publieke API. Het B2C-pad is een interne trigger. Core maakt geen onderscheid in de attestatie zelf — het resultaat is identiek.

---

## 5. API-grens

### Core endpoints (B2B — productie)

| Endpoint | Methode | Auth | Functie |
|----------|---------|------|---------|
| `/v1-core-origins` | POST | X-API-Key | Attestatie aanmaken |
| `/v1-core-resolve` | GET | Geen | Opzoeken op origin_id of hash |
| `/v1-core-verify` | POST | Geen | Hash verificatie (match / no match) |
| `/v1-core-proof` | GET | Geen | OTS proof downloaden (.ots) |
| `/v1-core-health` | GET | Geen | Health check |

### Core endpoints (intern)

| Endpoint | Methode | Auth | Functie |
|----------|---------|------|---------|
| `/v1-internal-metrics` | GET | X-Internal-Secret | Operationele statistieken |
| `/v1-internal-partner-create` | POST | X-Internal-Secret | Partner API key genereren |

### App endpoints (B2C — Supabase Edge Functions)

| Functie | Doel |
|---------|------|
| `companion-origins` | App attestatie met Hetzner storage (legacy) |
| `companion-resolve` | App origin lookup |
| `companion-verify` | App verificatie |
| `hetzner-ai-proxy` | OCR/analyse proxy |
| `hetzner-storage-proxy` | Image storage proxy (legacy, v0.4) |
| `hetzner-health` | Hetzner connectivity check |
| `analyze-page` | AI pagina-analyse |
| `analyze-patterns` | Patroondetectie |
| `analyze-personality` | Persoonlijkheidsinzichten |
| `notify-ots-complete` | OTS-ankeringnotificatie via Resend |

### Support functions (App)

| Functie | Doel |
|---------|------|
| `generate-embeddings` | Vector embeddings |
| `generate-memory-summary` | Geheugensamenvatting |
| `generate-personality-art` | Generatieve kunst |
| `generate-recommendations` | Contentaanbevelingen |
| `generate-share-content` | Deelkaarten |
| `generate-year-reflection` | Jaarreflecties |
| `search-pages` | Full-text zoeken |
| `origin-image-proxy` | Image serving (legacy) |

### Grensregel

Alles onder `/v1-core-*` gehoorzaamt aan Core-regels: geen content, geen bytes, geen labels, geen UX-velden. Alles daarbuiten is App-domein.

---

## 6. Datamodel — wie bezit wat

### Core-tabellen

| Tabel | Eigenaar | Geschreven door |
|-------|----------|-----------------|
| `origin_attestations` | Core | B2B API + B2C trigger |
| `core_ots_proofs` | Core | OTS Worker |
| `partner_api_keys` | Core | `/v1-internal-partner-create` |
| `core_rate_limits` | Core | Core endpoints |
| `core_request_log` | Core | Core endpoints |

### App-tabellen

| Tabel | Eigenaar | Geschreven door |
|-------|----------|-----------------|
| `pages` | App | App client (Supabase INSERT) |
| `witnesses` | App | Witness confirmation flow |

### Relatie

`pages` → trigger `bridge_page_to_core` → `origin_attestations` → schrijft `origin_id` terug naar `pages`

De trigger kopieert `origin_hash_sha256` uit `pages` naar `hash` in `origin_attestations`, genereert een `origin_id`, en schrijft die terug naar `pages.origin_id`. Er is geen FK van Core naar `pages`. Core weet niet dat `pages` bestaat.

**Index:** `idx_pages_origin_id` op `pages.origin_id` voor de notificatie-lookup.

---

## 7. Wat waar hoort

### Hoort in Core (en staat in Core)

- Hash-opslag (`origin_attestations`)
- Bitcoin-anchoring (`core_ots_proofs` + OTS Worker)
- Publieke verificatie (`/v1-core-resolve`, `/v1-core-verify`)
- Proof download (`/v1-core-proof`)
- Partner key management (`partner_api_keys`)
- Rate limiting (`core_rate_limits`)
- Request logging (`core_request_log`)
- Immutability triggers (UPDATE/DELETE blocking)

### Hoort in de App (en staat in de App)

- Content-inname (foto selectie, client-side hashing)
- Thumbnail-opslag (IndexedDB, lokaal)
- Gebruikersidentiteit (Supabase Auth, Magic Link)
- Device fingerprinting
- Certificaat-generatie (jsPDF, client-side)
- OTS-notificaties (Resend email)
- Witness feature (`witnesses` tabel + token flow)
- Wall of Existence (dual-source thumbnail resolution)
- AI-analyse (OCR, patronen, persoonlijkheid)
- Zoeken en browsen

### Wat niet meer bestaat (was in v1.0 Architecture Split benoemd)

| Concept uit v1.0 | Werkelijke status |
|-------------------|-------------------|
| Vault/IPFS opslag | Niet geïmplementeerd. Thumbnails zijn lokaal (IndexedDB), geen server-side content storage in v0.7 |
| Artifact URLs in App | Legacy (`image_url` in `pages`). In v0.7 leeg voor nieuwe marks. Hetzner storage is legacy v0.4 |
| "Lovable /app implementation" | De App draait op Lovable Cloud, maar de architectuur is onafhankelijk van Lovable |
| Idempotency keys | Niet geïmplementeerd. Meerdere attestaties van dezelfde hash zijn toegestaan |

---

## 8. OTS-keten (doorsnijdt beide lagen)

De OTS-flow begint in Core maar raakt de App bij notificatie:

```
B2B: POST /v1-core-origins ──┐
                              ├──→ origin_attestations
B2C: pages INSERT → trigger ─┘           │
                                          ▼
                                   OTS Worker (cron, Hetzner)
                                          │
                                   stamp → pending in core_ots_proofs
                                   upgrade → anchored in core_ots_proofs
                                          │
                                          ├──→ /v1-core-proof (B2B download)
                                          │
                                          └──→ HTTP POST notify-ots-complete
                                                        │
                                               origin_id → pages.origin_id
                                                        → pages.user_id
                                                        → auth.users.email
                                                        → Resend email
```

### Notificatie-mechanisme (geverifieerd 6 feb 2026)

Er is **geen database trigger** en **geen Supabase webhook** voor de OTS-notificatie. Het mechanisme is:

1. OTS Worker (Hetzner) doet een succesvolle upgrade naar `anchored` in `core_ots_proofs`
2. Worker roept `notify-ots-complete` Edge Function aan via HTTP POST met `{ origin_id, bitcoin_block_height, anchored_at }`
3. Edge Function lookup: `pages.origin_id` → `pages.user_id` → `auth.users.email`
4. Resend email naar gebruiker (indien geverifieerd account)

De HTTP call zit in een eigen try/catch in de worker. Falen heeft geen impact op de proof status.

### Afhandeling per scenario (getest 6 feb 2026)

| Scenario | Respons | Status |
|----------|---------|--------|
| B2B attestatie (geen `pages` record) | "No page found" | ✅ Getest |
| Anonymous mark (`user_id` = NULL) | "Anonymous mark - no notification" | ✅ Getest |
| Geverifieerde gebruiker | Email via Resend | ⏳ Werkt bij eerste echte gebruiker |

### Voormalige discrepanties (opgelost)

De B2C-inventarisatie v0.6 beschreef de OTS-notificatieketen als:

> `UPDATE origin_attestations SET ots_proof = [blob]` → trigger `on_ots_complete`

Dit was incorrect op drie punten, alle drie bevestigd door database-verificatie op 6 feb 2026:

1. `origin_attestations` heeft geen `ots_proof` kolom — die staat op `core_ots_proofs`
2. `origin_attestations` blokkeert alle UPDATEs via `trigger_prevent_attestation_update`
3. Er bestaat geen database trigger `on_ots_complete` — het mechanisme is een HTTP call vanuit de worker

De B2C-inventarisatie moet op deze punten gecorrigeerd worden (zie sectie 11).

---

## 9. Privacy-grens

| Data | Waar het leeft | Core ziet het? | Server ziet het? |
|------|----------------|----------------|------------------|
| Originele foto | Nooit opgeslagen | Nee | Nee |
| Thumbnail | IndexedDB (device) | Nee | Nee |
| SHA-256 hash | Supabase + Core | Ja | Ja |
| Timestamp | Core | Ja | Ja |
| Device fingerprint hash | `pages` | Nee | Ja (niet reverseerbaar) |
| Email | Supabase Auth | Nee | Ja (indien gegeven) |
| OTS proof | `core_ots_proofs` + IndexedDB (synced) | Ja | Ja |
| Witness email | `witnesses` | Nee | Ja (indien gegeven) |

Core ziet uitsluitend hashes, timestamps, en proofs. Alles wat een gebruiker identificeert (email, device, thumbnails) leeft in de App-laag of op het device.

---

## 10. Acceptatietests

De architecturale scheiding is valide als alle onderstaande condities waar zijn:

### Core-condities

| Test | Status |
|------|--------|
| Core endpoints accepteren geen bytes of content | ✅ |
| Core responses bevatten geen artifact URLs, labels, marks, of UX-velden | ✅ |
| Core tabellen bevatten geen content bytes | ✅ |
| Core is bruikbaar zonder de App | ✅ (B2B API functioneert onafhankelijk) |
| Core heeft geen FK of referentie naar `pages` of `witnesses` | ✅ |
| Verificatie via `/v1-core-verify` is binair | ✅ |
| OTS proofs zijn standaard .ots format, verifieerbaar zonder Umarise | ✅ |

### App-condities

| Test | Status |
|------|--------|
| App stuurt geen image bytes naar de server (v0.7) | ✅ |
| App berekent hashes client-side | ✅ |
| Thumbnails leven alleen in IndexedDB | ✅ |
| App behandelt Core-output als immutable feiten | ✅ (triggers blokkeren mutatie) |
| App genereert certificaten client-side | ✅ |

### Scheiding-condities

| Test | Status |
|------|--------|
| App → Core via trigger (B2C) of API (indien nodig) | ✅ |
| Core → App: geen directe dependency | ⚠️ Zie toelichting |
| OTS notificatie is App-functionaliteit, niet Core | ✅ |
| Witness feature is volledig App-domein | ✅ |

**Toelichting Core → App:** De OTS Worker roept `notify-ots-complete` aan via HTTP na een succesvolle upgrade. Dit is een best-effort call in een eigen try/catch. Core functioneert volledig als de App verdwijnt — de call faalt silently. Dit is gedocumenteerd in sectie 8.

---

## 11. Discrepanties tussen B2B en B2C inventarisaties

De volgende punten waren inconsistent tussen de twee broninventarisaties. Ze zijn op 6 februari 2026 geverifieerd tegen de daadwerkelijke database.

| # | Discrepantie | Status | Resolutie |
|---|-------------|--------|-----------|
| 1 | OTS trigger locatie: B2C zegt `on_ots_complete` op `origin_attestations` | ✅ Opgelost | Geen database trigger. OTS Worker roept `notify-ots-complete` aan via HTTP |
| 2 | `ots_proof` kolom: B2C plaatst op `origin_attestations` | ✅ Opgelost | Staat op `core_ots_proofs` — bevestigd door database schema check |
| 3 | `bitcoin_block_height`: B2C plaatst op `origin_attestations` | ✅ Opgelost | Staat op `core_ots_proofs` — bevestigd door database schema check |
| 4 | `bridge_page_to_core`: niet in B2B inventarisatie | ✅ Geverifieerd | Trigger bestaat en is gekoppeld als AFTER INSERT + AFTER UPDATE op `pages` |
| 5 | `on_ots_complete`: B2C beschrijft als database trigger | ✅ Opgelost | Bestaat niet als trigger. Notificatie gaat via HTTP call vanuit OTS Worker |
| 6 | `origin_id` format: B2B UUID vs B2C `um-XXXXXXXX` | ✅ Opgelost | `pages.origin_id` is UUID, teruggeschreven door bridge trigger. `um-XXXXXXXX` is een display format in de App |
| 7 | `pages.origin_id` kolom: bestond niet in B2C schema | ✅ Opgelost | Kolom toegevoegd op 6 feb 2026. Backfill: 13 pages gekoppeld. Index aangemaakt |
| 8 | `notify-ots-complete`: niet in B2B Edge Function inventarisatie | ℹ️ Correct | Is een App Edge Function, hoort niet in B2B inventarisatie. Wel in Architecture Split |

### Correcties toegepast in B2C-inventarisatie v0.7

| Sectie | Wat er staat | Wat er moet staan |
|--------|-------------|-------------------|
| 6.3 Schema `pages` | Geen `origin_id` kolom | `origin_id UUID NULLABLE` — teruggeschreven door bridge trigger |
| 8.1 Trigger Chain | `UPDATE origin_attestations SET ots_proof` → `on_ots_complete` | OTS Worker → HTTP POST naar `notify-ots-complete` Edge Function |
| 9.2 Certificate | `origin_attestations.bitcoin_block_height` | `core_ots_proofs.bitcoin_block_height` |
| 13.1 Triggers | `on_ots_complete` als trigger op `origin_attestations` | Geen database trigger — HTTP call vanuit OTS Worker |

---

## 12. Wijzigingen t.o.v. v1.0 en v2.0

| Aspect | v1.0 (2 feb 2026) | v2.0 (6 feb 2026) | v2.1 (6 feb 2026) |
|--------|--------------------|--------------------|---------------------|
| Terminologie | "Companion" | "App" (B2C PWA) | — |
| Endpoint-paden | `/core/*` | `/v1-core-*` (productie) | — |
| OTS/Bitcoin-anchoring | Niet benoemd | Volledig beschreven | Notificatie-mechanisme gecorrigeerd |
| OTS notificatie | Niet benoemd | "trigger on_ots_complete" | HTTP call vanuit OTS Worker (geen trigger) |
| `pages.origin_id` | Niet benoemd | Niet aanwezig | ✅ Kolom toegevoegd, bridge trigger schrijft terug |
| Triggers gekoppeld | Niet benoemd | Aangenomen | ✅ Geverifieerd en getest |
| Discrepanties | N.v.t. | 8 open punten | 7 opgelost, 1 informatief |
| Notificatie lookup | N.v.t. | `hash` → `pages` (fragiel) | `origin_id` → `pages` (uniek) |
| Datamodel | 1 Core-tabel | 5 Core, 2 App | `pages.origin_id` toegevoegd |

---

*Dit document beschrijft de architecturale scheiding zoals die op 6 februari 2026 bestaat. Alle beweringen zijn geverifieerd tegen de database op 6 februari 2026.*
