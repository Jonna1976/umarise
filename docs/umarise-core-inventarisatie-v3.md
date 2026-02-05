# Umarise Core: Technische Inventarisatie v3

**Datum:** 5 februari 2026  
**Versie:** Na implementatie Infrastructure Plan (Fase 1 compleet) + OTS Bitcoin-anchoring bevestigd (8/8 anchored)  
**Positionering:** Verifiable Origin Registry

---

## Executive Summary

Umarise Core v1 is operationeel als production-ready verifiable origin registry. De infrastructuur is geüpgraded van een interne API naar een partner-integreerbare infrastructuur-primitief met API versioning, rate limiting, observability, geformaliseerde partner onboarding, en Bitcoin-verankerde timestamping via OpenTimestamps.

Alle 8 attestaties zijn verankerd in Bitcoin block 935037 (bevestigd 5 feb 2026). Proofs zijn downloadbaar en verifieerbaar met standaard open-source tooling (`ots verify`) — zonder Umarise-betrokkenheid. Dit verschuift de positionering van "Trusted Third Party" naar "Verifiable Third Party": klanten hoeven ons niet te geloven, ze kunnen het controleren.

**Status na test (5 feb 2026, 06:56 CET):** 8/8 attestaties anchored, 0 pending, 0 failed. Het verificatiemodel is niet langer theoretisch — het is live en demonstreerbaar.

---

## Wat is OpenTimestamps en wat doet het voor Umarise Core?

### Het probleem zonder OTS

Zonder OTS is Umarise een database die zegt: "deze hash bestond op dit tijdstip." Maar dat bewijs leeft alleen in onze database. Als een partner vraagt "hoe weet ik dat jullie dat tijdstip niet achteraf hebben aangepast?" is het eerlijke antwoord: dat kun je niet verifiëren. Je moet ons vertrouwen.

Dat is hoe de meeste timestamping-diensten werken. Het is niet fout, maar het maakt Umarise afhankelijk van vertrouwen — en vertrouwen schaalt niet.

### Wat OTS doet

OpenTimestamps (OTS) is een open-source protocol dat een cryptografisch bewijs creëert dat data bestond vóór een bepaald moment. Het werkt zo:

1. **Hashen.** Umarise berekent de SHA-256 hash van de data (dit deden we al).
2. **Indienen.** De hash wordt naar OTS calendar servers gestuurd — onafhankelijke, gratis servers die duizenden hashes van over de hele wereld verzamelen.
3. **Bundelen.** De calendar server combineert al die hashes in een Merkle tree (een cryptografische boomstructuur) en schrijft één root-hash naar een Bitcoin-transactie.
4. **Verankeren.** Die Bitcoin-transactie wordt opgenomen in een block. Vanaf dat moment is het wiskundig bewezen dat alle gebundelde hashes bestonden vóór dat block gemined werd.
5. **Proof.** Het resultaat is een `.ots` bestand: een compact cryptografisch pad van de originele hash, via de Merkle tree, naar de Bitcoin-transactie. Dit bestand is het bewijs.

### Wat de partner krijgt

Elke attestatie in Umarise Core krijgt automatisch een `.ots` proof. De partner kan dit bestand downloaden en onafhankelijk verifiëren:

```bash
# Download het bewijs
curl https://core.umarise.com/v1-core-proof/{origin_id} -o proof.ots

# Verifieer — geen Umarise-account nodig, geen API key, geen contact met ons
ots verify proof.ots

# Output:
# Success! Bitcoin block 935037 attests data existed as of 2026-02-04
```

Dit is alles. Drie commando's, nul Umarise-betrokkenheid.

### Waarom dit belangrijk is voor partners

**Onafhankelijke verificatie.** De partner hoeft Umarise niet te vertrouwen voor het tijdstip. Het bewijs is wiskundig, niet contractueel. Een CTO kan dit zelf draaien en zien dat het klopt.

**Permanentie.** De Bitcoin-blockchain is de langstlopende, meest robuuste publieke ledger die bestaat. Een proof die vandaag verankerd wordt is over 10 jaar nog steeds verifieerbaar — ongeacht of Umarise dan nog bestaat.

**Geen vendor lock-in op het bewijs.** De `.ots` bestanden zijn een open standaard. De verificatie-tool is open source. Er is geen proprietary format, geen dashboard nodig, geen Umarise-relatie vereist om het bewijs te checken.

**Geen extra kosten.** OTS is gratis. De partner betaalt alleen voor attestaties (de hash + tijdstip registratie). Het Bitcoin-bewijs is inbegrepen.

**Compliance-argument.** Voor partijen die data-integriteit moeten aantonen (juridisch, regulatoir, audit) is "verifieerbaar tegen de Bitcoin-blockchain met open-source tooling" een sterkere claim dan "onze database zegt dat het klopt."

### Wat OTS niet doet

OTS bewijst **wanneer**, niet **wat** of **wie**. Het bewijst niet dat de content authentiek is, niet dat de hasher betrouwbaar is, niet dat de data niet gemanipuleerd is vóór het hashen. Het bewijst uitsluitend: deze exacte hash bestond vóór Bitcoin block X.

De data-inname — het hashen van de juiste content — vereist vertrouwen in Umarise (of de partner hasht zelf, client-side). Dat is een inherente beperking van elk systeem waar een derde partij de data ontvangt.

### Samenvatting in één zin

OTS maakt van elke Umarise-attestatie een onafhankelijk verifieerbaar bewijs van bestaan, verankerd in de Bitcoin-blockchain, downloadbaar en controleerbaar zonder Umarise-betrokkenheid.

### Welke laag legt Umarise over OTS heen?

OTS is een protocol en een CLI-tool (command line interface — een programma dat je bedient door commando's te typen in een terminal, zonder grafische interface). Het bewijst *wanneer*. Maar dat is alles wat het doet. OTS geeft je geen ID terug, heeft geen API, geen opzoekfunctie, geen register. Je stuurt een hash, je krijgt een proof-bestand, en het beheer daarvan is jouw probleem.

Umarise Core legt hier een origin registry laag overheen:

**Adresseerbare attestaties.** Elke hash krijgt een `origin_id` — een permanent, uniek adres. Een partner kan op elk moment zeggen "geef me de attestatie met dit ID" en krijgt hash, tijdstip, én het Bitcoin-bewijs terug. OTS alleen geeft je dat niet.

**Een publieke API.** Resolve, verify, proof download — zonder auth. Iedereen met een hash of origin_id kan het opvragen. OTS vereist dat je zelf het proof-bestand bewaart en beheert.

**Geautomatiseerde anchoring.** De partner denkt niet na over OTS. Attestatie aanmaken → automatisch gestampt → automatisch geüpgraded → proof beschikbaar. De partner ziet alleen: "anchored in block 935037."

**Immutability-garanties.** Database-triggers die afdwingen dat attestaties en anchored proofs niet gewijzigd of verwijderd kunnen worden. OTS zelf garandeert niets over opslag.

**Partnerinfrastructuur.** API keys, rate limiting, request logging, metrics. De plumbing die nodig is om er een integreerbare service van te maken in plaats van een losse tool.

Zonder Umarise is OTS een CLI-tool die je zelf moet draaien, beheren, en opslaan. Met Umarise is het infrastructuur: één API call, en het bewijs wordt automatisch aangemaakt, opgeslagen, geüpgraded, en publiek opvraagbaar gemaakt.

### Hoe gebruikt Umarise Bitcoin precies?

Umarise schrijft niet naar de Bitcoin-blockchain en bezit geen Bitcoin. Wat er gebeurt:

1. **Umarise maakt een hash** van de data van een partner en slaat die op met een tijdstip en een origin_id.
2. **Die hash wordt doorgestuurd naar OTS calendar servers** — onafhankelijke servers die door anderen worden beheerd, gratis en open source.
3. **De calendar servers verzamelen duizenden hashes** van over de hele wereld (niet alleen van Umarise) en combineren ze tot één enkele waarde via een Merkle tree — een wiskundige structuur waarin je kunt bewijzen dat een individuele hash onderdeel was van de groep.
4. **De calendar server schrijft die ene gecombineerde waarde naar een Bitcoin-transactie.** Dit kost de calendar server een fractie van een cent. Umarise betaalt hier niets voor.
5. **Bitcoin miners nemen die transactie op in een block.** Dat block krijgt een nummer (bijvoorbeeld 935037) en een tijdstip. Vanaf dat moment is het wiskundig onmogelijk om te doen alsof die data niet bestond vóór dat block.
6. **Het resultaat is een `.ots` bestand** — een compact bewijs dat zegt: "volg dit wiskundige pad van de hash van de partner, via de Merkle tree, naar Bitcoin transactie X in block Y." Iedereen kan dat pad controleren.

Umarise raakt Bitcoin dus niet direct aan. We gebruiken het als een publiek, onveranderbaar logboek via het OTS-protocol. Zoals een notaris een stempel zet op een document — maar dan is de notaris de hele Bitcoin-blockchain, en kan iedereen de stempel controleren.

### Is Umarise een gedecentraliseerde oplossing?

Gedeeltelijk. Het is belangrijk om hier eerlijk over te zijn.

**Wat gedecentraliseerd is: het bewijs.** De Bitcoin-blockchain is gedecentraliseerd — niemand controleert die, niemand kan die aanpassen. Het `.ots` proof-bestand is verifieerbaar door iedereen, overal, zonder enige Umarise-betrokkenheid. Dat stuk is volledig gedecentraliseerd.

**Wat gecentraliseerd is: Umarise zelf.** Umarise ontvangt de data, berekent de hash, beheert de database, draait de API. Als Umarise offline gaat, kunnen partners geen nieuwe attestaties aanmaken en geen proofs downloaden (tenzij ze die al lokaal hebben opgeslagen).

**De juiste formulering: Umarise is een gecentraliseerde service die gedecentraliseerd bewijs levert.**

De registratie is gecentraliseerd. De verificatie is gedecentraliseerd. Dat is een sterk verhaal — sterker dan "wij zijn gedecentraliseerd" claimen terwijl we dat niet zijn. Een CTO prikt daar doorheen.

Claim het niet, leg het uit: *"Wij draaien de service. Bitcoin levert het bewijs. Die twee zijn onafhankelijk van elkaar — en dat is het punt."*

### Kan Core misbruikt worden?

Stel iemand attesteert een document met valse beschuldigingen, of een document dat een geheim bevat. Wat zijn de risico's?

**Core is architecturaal immuun voor content-gerelateerd misbruik.** Core slaat geen content op — alleen een SHA-256 hash (een string van 64 tekens). Je kunt niet van een hash terugredeneren naar het originele document. Er is geen browse-endpoint, geen zoekfunctie, geen manier om te ontdekken wát er geattesteerd is. Iemand die een lasterlijk document attesteert slaat in Core letterlijk alleen `a3f2b8c9...` op. Niemand weet wat dat is tenzij ze het originele document al hebben.

**Valse beschuldiging attesteren:** iemand kan bewijzen dat het document bestond op tijdstip T. Dat is alles. Het bewijst niet dat de inhoud waar is. Een rechter of CTO snapt dat onderscheid — "deze hash bestond" is niet "deze claim is waar."

**Geheim delen:** de hash in Core onthult niets. Het geheim is alleen zichtbaar als iemand het originele document al heeft. Core lekt geen content.

**Spam of volumemisbruik:** dat is het reëelste risico. Iemand die miljoenen nutteloze hashes attesteert kost opslagruimte en OTS calendar server capaciteit. Dit wordt afgevangen door rate limiting (100/min voor standard partners) en het feit dat attestaties een API key vereisen — de key kan gerevoked worden bij misbruik.

**Samenvattend:** Core is by design een dom register. Het weet niet wat het registreert en dat is een feature, geen bug. Het risico van misbruik zit in de interpretatie van attestaties, niet in Core zelf. En dat is een risico van elke origin registry, niet specifiek van Umarise.

### Definitie: wat is een origin registry?

"Origin registry" is geen gestandaardiseerde term — er is geen ISO-definitie of industriestandaard. Het is een term die Umarise zelf gebruikt. De metafoor is een geboorteregister: het registreert dát iets begon te bestaan, wanneer, en kent er een uniek nummer aan toe. Hieronder de acht kenmerken van een geboorteregister en hoe Core zich daartoe verhoudt.

**1. Registreert bestaan — ✅ Voldoet**

Een geboorteregister registreert dát een geboorte plaatsvond. Core registreert dát een hash bestond. Niet wat de hash voorstelt, niet of de inhoud klopt, niet wie het aanmaakte. Alleen: dit bestond.

**2. Registreert tijdstip — ✅ Voldoet**

Een geboorteakte heeft een datum en tijdstip. Core slaat `captured_at` op bij elke attestatie, en dat tijdstip wordt verankerd in de Bitcoin-blockchain via OTS. Het tijdstip is onafhankelijk verifieerbaar — niet alleen "Umarise zegt dat het 14:30 was" maar "Bitcoin block 935037 bevestigt het."

**3. Kent een uniek nummer toe — ✅ Voldoet**

Een geboorteakte heeft een aktenummer. Core kent een `origin_id` toe — een UUID die permanent, uniek, en publiek opvraagbaar is. Dit is het adres van de attestatie. Partners gebruiken dit ID om de attestatie terug te vinden, te verifiëren, en het OTS-bewijs te downloaden.

**4. Is onveranderbaar — ✅ Voldoet**

Een geboorte kun je niet ongedaan maken. Core attestaties zijn immutable: database-triggers blokkeren UPDATE en DELETE op `origin_attestations`. Anchored OTS proofs zijn eveneens immutable. Dit wordt niet afgedwongen door beleid of documentatie, maar door code die een EXCEPTION gooit bij elke poging tot wijziging.

**5. Is verifieerbaar — ✅ Voldoet**

Van een geboorteregister kun je een uittreksel opvragen. Core biedt publieke verificatie via `/v1-core-resolve` en `/v1-core-verify` — zonder API key, zonder account, zonder partnerstatus. Daarbovenop levert OTS een onafhankelijk verifieerbaar bewijs: download het `.ots` bestand, draai `ots verify`, en Bitcoin bevestigt het. Geen Umarise-betrokkenheid nodig.

**6. Is autoritatief — ❌ Niet van toepassing (en dat is niet erg)**

Een geboorteregister is de enige bron per jurisdictie. Core is niet de enige plek waar je een hash kunt registreren — dezelfde hash kan ook bij OriginStamp, Woleet, of direct via OTS geregistreerd worden. Core claimt niet "dit is de eerste keer dat deze hash ooit ergens geregistreerd is." Core claimt: "deze hash is bij ons geregistreerd op tijdstip T."

Dit is geen zwakte die opgelost moet worden. Autoriteit is geen technische eigenschap maar een sociale. DNS is niet de enige manier om namen aan IP-adressen te koppelen, maar het is de standaard omdat iedereen het gebruikt. Een geboorteregister is autoritatief omdat de wet het zegt, niet omdat het technisch onmogelijk is om ergens anders een geboorte te registreren.

Autoriteit komt van adoptie, niet van afdwinging. Als 50 publishers Umarise gebruiken als hun origin registry, dan is Core autoritatief voor die publishers — niet omdat het de enige optie is, maar omdat het de afgesproken bron is. Dat is een netwerk-effect, geen feature die je bouwt.

**7. Registreert identiteit — ❌ Bewust niet (by design)**

Een geboorteregister registreert wie — naam, ouders, geboorteplaats. Core registreert expliciet geen identiteit. Geen user_id, geen auteur, geen account, geen enkel gegeven dat een attestatie aan een persoon koppelt.

Dit is geen beperking maar een architecturale keuze. Core's privacy-garantie is dat attestaties niet te herleiden zijn tot personen. Identiteit is meaning — en meaning hoort in de App-laag of bij de partner, niet in Core. Partners die willen bijhouden wie wat attesteerde doen dat in hun eigen systeem, niet in het onze.

**8. "Origin" impliceert eerste registratie — ⚠️ Nuance nodig**

Het woord "origin" suggereert: dit is het begin, het allereerste moment. Core kan niet bewijzen dat het de eerste registratie is. Iemand kan dezelfde content een uur eerder ergens anders gehasht hebben. Core bewijst "bestond bij ons op tijdstip T", niet "bestond nergens eerder."

Dit is een inherente beperking van elk gedistribueerd systeem — geen enkele partij in deze markt (OriginStamp, Woleet, OTS) kan bewijzen dat iets niet eerder ergens anders geregistreerd is.

"Origin" klopt toch, mits correct gedefinieerd. Het hoeft niet te betekenen "de allereerste keer dat dit ooit ergens bestond." Het betekent: het geregistreerde beginpunt in dit systeem. Zoals een geboorteakte niet bewijst dat je niet bestond voor je geboorte (je bestond in de baarmoeder), maar het registreert het moment van je geregistreerde begin. De `origin_id` is het adres van dat geregistreerde beginpunt.

### Definitie

**Umarise Core is een origin registry: het register waar het geregistreerde bestaan van data begint.** De `origin_id` is het adres van dat geregistreerde beginpunt.

In één zin: een origin registry registreert dát data bestond, wanneer, en kent er een permanent, uniek, publiek verifieerbaar adres aan toe — zonder te weten of vast te leggen wat de data voorstelt of van wie het is.

### Propositie-analyse

**Wat sterk is:**

De architectuur is solide. De scheiding existence/meaning, immutability via triggers, publieke verificatie zonder auth, OTS-bewijs onafhankelijk van Umarise's voortbestaan — dat is niet iets dat de meeste concurrenten hebben. Niet omdat ze het niet kunnen bouwen, maar omdat ze de keuze niet gemaakt hebben. OriginStamp, ScoreDetect, Woleet — ze hebben allemaal identity, metadata, of dashboards in hun core verweven. Dat terugdraaien is een herschrijving.

De definitie is helder en verdedigbaar. "Het register waar het geregistreerde bestaan van data begint" claimt niet meer dan wat het doet. De acht-punten-analyse laat zien dat er eerlijk is over wat het wel en niet is.

Het verificatiemodel is concreet. 8/8 anchored op Bitcoin block 935037, demonstreerbaar in drie commando's. Niet "we gaan dit bouwen" maar "probeer het zelf."

"Origin registry" is een categorie van één — een blue ocean. Umarise definieert het speelveld en de spelregels. Niemand concurreert in deze categorie omdat die categorie niet bestond voor Umarise hem definieerde.

**Wat nog bewezen moet worden:**

Geen bewezen markt. De propositie is technisch solide, maar er is nog geen bewijs dat iemand ervoor betaalt. 8 attestaties en 3 test-keys is geen marktvalidatie. Tijd zal het leren — dat gold ook voor DNA-registratie.

De discipline-claim is onbewezen op schaal. "Wij weigeren meaning in Core te stoppen" is makkelijk als niemand je er nog om vraagt. De echte test komt als een betalende partner zegt "ik wil een user_id veld."

Geen netwerk-effect — nog niet. Autoriteit komt van adoptie. Met nul echte partners is er geen netwerk. De propositie wordt exponentieel sterker met elke partner die het gebruikt.

**Score:**

De architectuur en het verificatiemodel zijn 9/10. De marktvalidatie is 3/10. Het gemiddelde zegt niet zoveel — wat ertoe doet is dat het technische fundament er staat en dat de volgende stap niet meer bouwen is, maar verkopen. Eén betalende partner die een echte integratie draait verandert deze score meer dan welke feature dan ook.

### Pricing (gevalideerd door CTOs — feb 2026)

| Tier | Prijs/maand | Attestaties/maand | OTS Proofs | Support |
|------|------------|-------------------|------------|---------|
| Pilot | €99 | 1.000 | ✅ Inbegrepen | Email |
| Growth | €299 | 10.000 | ✅ Inbegrepen | Email + prioriteit |
| Scale | €799 | 100.000 | ✅ Inbegrepen | Dedicated |

**Founding Partner:** €199/maand, 12 maanden, alles inbegrepen. Founding partner status (referentie, early access, meedenken over roadmap). Hoog genoeg om serieus genomen te worden, laag genoeg om een creditcard-beslissing te zijn — geen boardroom-beslissing.

---

## 1. API Endpoints — Huidige Staat

### v1 Endpoints (Production)

| Endpoint | Methode | Auth | Status | Functie |
|----------|---------|------|--------|---------|
| `/v1-core-health` | GET | Geen | ✅ Live | Systeem health check |
| `/v1-core-origins` | POST | X-API-Key | ✅ Live | Attestatie creëren |
| `/v1-core-resolve` | GET | Geen | ✅ Live | Origin opzoeken (ID/hash) |
| `/v1-core-verify` | POST | Geen | ✅ Live | Hash verificatie |
| `/v1-core-proof` | GET | Geen | ✅ Live | OTS proof download (.ots bestand) |
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

### `core_ots_proofs` (Bitcoin Anchoring — Live)

```
id                   uuid        PK
origin_id            uuid        FK → origin_attestations (UNIQUE)
ots_proof            bytea       Standard .ots proof file (binair)
status               text        'pending' | 'anchored' | 'failed'
bitcoin_block_height integer     NULL until anchored
anchored_at          timestamptz NULL until anchored
upgraded_at          timestamptz When proof was upgraded
created_at           timestamptz Record creation
```

**Triggers:**
- `prevent_anchored_proof_mutation` — Cannot modify once status = 'anchored'
  - Pending → anchored: ✅ toegestaan
  - Pending → failed: ✅ toegestaan
  - Anchored → anything: ❌ geblokkeerd

**RLS:** Service role INSERT/UPDATE + public SELECT voor anchored proofs

**Automatisch gevuld door:** OTS Worker op Hetzner (zie sectie 12)

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

### Core v1 API (7 functions)

| Function | Lines | Purpose |
|----------|-------|---------|
| `v1-core-health` | ~60 | Health check, DB connectivity test |
| `v1-core-origins` | ~250 | Create attestation (API key auth) |
| `v1-core-resolve` | ~180 | Lookup by origin_id or hash |
| `v1-core-verify` | ~150 | Binary hash verification |
| `v1-core-proof` | ~120 | Download .ots proof file per origin_id |
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

### OTS Worker Secrets (op Hetzner, niet in Supabase)

| Secret | Purpose | Locatie |
|--------|---------|---------|
| `SUPABASE_URL` | Database connectie | `/opt/umarise/ots-worker/.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role access | `/opt/umarise/ots-worker/.env` |

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

## 7. Operational Metrics (Bevestigd — 5 feb 2026)

| Metric | Value |
|--------|-------|
| Total Attestations | 8 |
| OTS Proofs — Anchored | 8 |
| OTS Proofs — Pending | 0 |
| OTS Proofs — Failed | 0 |
| Bitcoin Block | 935037 |
| Active Partners | 3 |
| Total API Requests | 6 |
| Requests (24h) | 6 |

---

## 8. Documentation Assets

| Document | Location | Status |
|----------|----------|--------|
| OpenAPI 3.0 Spec | `public/openapi.yaml` | ✅ Complete (528 lines) |
| Infrastructure Plan | `docs/core-infrastructure-plan.md` | ✅ Complete |
| OTS Specification | `docs/core-ots-spec.md` | ✅ Complete (standalone) |
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

### OTS Integration ✅ CORE COMPLEET
- [x] Bitcoin anchoring via OpenTimestamps protocol
- [x] OTS Worker deployed (Hetzner, geautomatiseerd via cron)
- [x] Proof storage (`core_ots_proofs` tabel, standard .ots format)
- [x] Public proof download (`/v1-core-proof/:origin_id`)
- [x] Immutability trigger (anchored proofs zijn immutable)
- [x] Automatische stamp (elk uur) + upgrade (elke 30 min)
- [x] Failure recovery (`failed` status + retry command)
- [ ] Batch stamping via opentimestamps library (nu: individueel per hash)

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
| OTS proofs are standard .ots format (verifiable with `ots verify`) | ✅ |
| Anchored proofs are immutable (trigger-enforced) | ✅ |
| Proofs verifiable without Umarise involvement | ✅ |

---

## 11. Verificatiemodel

### Wat verifieerbaar is zonder Umarise te vertrouwen

Het tijdstip. Een `.ots` proof is een cryptografisch pad van de attestatie-hash naar een Bitcoin-transactie. Iedereen kan dit verifiëren:

```bash
curl https://core.umarise.com/v1-core-proof/{origin_id} -o proof.ots
ots verify proof.ots
# ✅ Success! Bitcoin block 935037 attests data existed as of 2026-02-04
```

### Wat vertrouwen in Umarise vereist

De data-inname. Umarise ontvangt de originele data en berekent de SHA-256 hash. De klant vertrouwt dat wij het juiste bestand hashen. Dit is inherent aan elk systeem waar de serviceprovider de data ontvangt.

**Mitigatie voor technische partners:** client-side hashing. De partner berekent de hash zelf en stuurt alleen de hash naar Core. Dan is de gehele keten verifieerbaar zonder Umarise te vertrouwen. Dit is een optie, geen vereiste.

**Correcte positionering:** "Verifiable Origin Registry" — niet "Trustless."  
**CTO-pitch:** "Je hoeft ons niet te vertrouwen voor het bewijs. Download het, verifieer het zelf. Wat je ons wél vertrouwt is dat wij de juiste data vastleggen bij inname."

---

## 12. OTS Worker — Infrastructuur

### Locatie

Hetzner server `94.130.180.233` — `/opt/umarise/ots-worker/`

### Componenten

```
/opt/umarise/ots-worker/
├── worker.js          # Hoofdscript (~300 regels, Node.js)
├── package.json       # Dependencies
├── node_modules/      # opentimestamps, @supabase/supabase-js, dotenv
└── .env               # SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
```

### Hoe het werkt

1. Worker leest ongestampte attestaties uit Supabase (`origin_attestations` LEFT JOIN `core_ots_proofs` WHERE proof IS NULL)
2. Stuurt SHA-256 hashes naar OpenTimestamps calendar servers (gratis, open source)
3. Slaat pending `.ots` proof op in `core_ots_proofs`
4. Calendar servers bundelen duizenden hashes in één Bitcoin-transactie (1-12 uur)
5. Worker pollt voor upgrade: vervangt pending proof met complete proof inclusief Bitcoin-pad
6. Status update: `pending` → `anchored` met `bitcoin_block_height` en `anchored_at`

### Automatisering (cron)

| Schedule | Commando | Functie |
|----------|----------|---------|
| `0 * * * *` | `node worker.js stamp` | Nieuwe attestaties oppakken |
| `*/30 * * * *` | `node worker.js upgrade` | Pending proofs upgraden |

### CLI referentie

```bash
node worker.js status     # Toon statistieken
node worker.js stamp      # Stamp nu
node worker.js upgrade    # Upgrade nu
node worker.js retry      # Herstart gefaalde proofs
```

### Failure handling

- Stamp mislukt → geen record in `core_ots_proofs`, wordt opgepakt bij volgende stamp run
- Upgrade mislukt → proof blijft `pending`, wordt opnieuw geprobeerd bij volgende upgrade run
- Calendar server onbereikbaar >48 uur → proof wordt `failed`, `retry` command herstampt

### Kosten

Nul. OpenTimestamps is gratis open-source infrastructuur. Worker draait op bestaande Hetzner server.

---

## 13. Next Steps (Recommended Priority)

1. **⚠️ Roteer INTERNAL_API_SECRET** — Gedeeld in chat, security risk. Nog steeds urgent.
2. **Test full attestation flow** — Acme/Summer keys via /v1-core-origins, verifieer dat OTS proof automatisch aangemaakt wordt
3. **Batch stamping implementeren** — `opentimestamps` library ondersteunt array van hashes, Merkle tree intern. Eén calendar call per batch in plaats van per hash.
4. **Partner Dashboard** — Self-service key management
5. **External monitoring** — BetterUptime/UptimeRobot configureren
6. **Eerste echte partner-integratie** — CTO uit pilot krijgt key + quickstart + proof download demo
7. **Node.js upgrade op Hetzner** — Huidige versie is 18 (deprecated door Supabase SDK). Upgrade naar Node.js 20+.

---

## Appendix A: Rate Limit Tiers

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| `standard` | 100 | per minute | Default partner tier |
| `premium` | 1,000 | per minute | High-volume partners |
| `unlimited` | 100,000 | per minute | Strategic partners |
| `public` (IP) | 1,000 | per minute | Resolve/verify/proof endpoints |

---

## Appendix B: Positioneringsverschuiving door OTS

| Aspect | Voor OTS | Na OTS |
|--------|----------|--------|
| Positionering | Trusted Third Party | Verifiable Third Party |
| Timestamp-bewijs | "Vertrouw ons" | "Controleer het zelf via Bitcoin" |
| TSA (RFC 3161) nodig | Ja | Nee (Bitcoin vervangt dit) |
| Proof houdbaarheid | Zolang Umarise bestaat | Permanent (Bitcoin-blockchain) |
| Verificatie | Via Umarise API | Via `ots verify` (onafhankelijk) |
| Data-inname vertrouwen | Vereist | Vereist (ongewijzigd) |

---

*Dit document vervangt `Technische Inventarisatie v2` als de actuele inventarisatie.*  
*Wijzigingen v2 → v3: OTS live status door hele document, verificatiemodel sectie, OTS Worker infrastructuur sectie, positioneringsverschuiving appendix, bijgewerkte metrics en endpoint-tabel.*  
*Wijzigingen v3.0 → v3.1 (5 feb): 8/8 anchored bevestigd (block 935037), OTS uitleg-sectie voor partners toegevoegd, bugfix double-encoding gedocumenteerd, metrics bijgewerkt.*
