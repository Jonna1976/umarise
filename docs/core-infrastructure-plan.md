# Umarise Core: Van API naar Production-Ready Origin Registry

## Context voor Lovable

Umarise Core is een origin registry — het geboorteregister van digitale artefacten. Het attesteert dat een hash op een bepaald tijdstip bestond. Geen content, geen eigenaar, geen betekenis. Alleen: "dit bestond hier en nu."

Core heeft nu drie werkende endpoints, een schoon schema, en volledige scheiding van de App-laag. De opdracht is: maak Core integreerbaar en vertrouwbaar voor externe partijen zodat het infrastructuur wordt in plaats van een API.

**Belangrijk: Niets aan de bestaande Core-logica veranderen. Geen kolommen toevoegen aan origin_attestations. Geen hashing-logica wijzigen. De kern is correct — we bouwen er omheen.**

---

## Privacy & Publieke Verificatie — Hoe het werkt

**"Publiek verifieerbaar" betekent NIET "publiek browsbaar."**

Dit onderscheid is cruciaal en moet door iedereen — CTOs, partners, gebruikers — correct begrepen worden.

**Wat iedereen kan:** Als je een hash hebt, kun je via `/v1/core/resolve` of `/v1/core/verify` controleren of die hash geattesteerd is en wanneer. Je krijgt terug: "deze hash bestond op tijdstip T" of HTTP 404.

**Wat niemand kan:**
- Er is geen endpoint om alle attestaties op te vragen. Geen lijst, geen feed, geen zoekfunctie.
- Er is geen manier om van een hash terug te komen bij de originele content. SHA-256 is een one-way functie — van content naar hash kan, van hash naar content is wiskundig onmogelijk.
- Er is geen manier om attestaties te koppelen aan een persoon, device, of account. Core slaat geen identiteit op.

**In de praktijk:** je kunt alleen verifiëren als je al weet wat je zoekt. Het register is publiek verifieerbaar maar niet publiek browsbaar. Zoals een notaris die bevestigt "ja, dit document is op die datum geregistreerd" — maar alleen als je het document zelf meebrengt.

**Dit is by design en mag niet veranderen.** Voeg nooit een list/search endpoint toe voor attestaties. Voeg nooit identifiers toe die attestaties aan personen koppelen. Core's privacy-garantie is architecturaal, niet contractueel.

---

## Fase 1: API Contract Formaliseren

### 1.1 API Versiebeheer

**Wat:** Alle Core endpoints verplaatsen naar een `/v1/` prefix.

**Huidige endpoints:**
```
POST /core/origins
GET  /core/resolve
POST /core/verify
POST /internal-generate-partner-key
```

**Nieuwe endpoints:**
```
POST /v1/core/origins
GET  /v1/core/resolve
POST /v1/core/verify
POST /v1/internal/generate-partner-key
```

**Vereisten:**
- Oude endpoints blijven tijdelijk werken door dezelfde logica aan te roepen als de /v1/ equivalenten (GEEN 301 redirects — die breken POST requests bij de meeste HTTP clients)
- Oude endpoints voegen response header `X-Deprecated: true` en `X-Upgrade-To: /v1/core/...` toe
- Response header `X-API-Version: v1` toevoegen aan alle nieuwe /v1/ Core responses
- De App-laag moet geüpdatet worden om de nieuwe /v1/ endpoints te gebruiken
- Oude endpoints kunnen na 90 dagen verwijderd worden zodra alle bekende consumers zijn gemigreerd

**Waarom:** Zonder versiebeheer breekt elke toekomstige wijziging bestaande integraties. Dit moet eerst omdat alles wat hierna komt op de `/v1/` structuur bouwt.

---

### 1.2 Health Endpoint

**Wat:** Een publiek endpoint dat de status van Core rapporteert.

**Endpoint:**
```
GET /v1/core/health
```

**Response (200 OK):**
```json
{
  "status": "operational",
  "version": "v1",
  "timestamp": "2026-02-04T14:30:00.000Z"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "degraded",
  "version": "v1",
  "timestamp": "2026-02-04T14:30:00.000Z"
}
```

**Vereisten:**
- Endpoint doet een simpele query op de database (bijv. `SELECT 1`) om connectiviteit te bevestigen
- Geen authenticatie vereist
- Response moet binnen 2 seconden komen, anders 503
- Geen gevoelige informatie in de response (geen database details, geen server info)

---

### 1.3 Rate Limiting

**Wat:** Bescherming tegen misbruik en overbelasting, per API key.

**Implementatie:**

Maak een nieuwe tabel `core_rate_limits`:
```sql
CREATE TABLE core_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE(rate_key, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_lookup 
  ON core_rate_limits(rate_key, endpoint, window_start);
```

**`rate_key` uitleg:** Voor geauthenticeerde endpoints (origins) is rate_key de `api_key_prefix`. Voor publieke endpoints (resolve/verify) is rate_key de SHA-256 hash van het IP-adres (prefix `ip:`). Voorbeeld: `ip:a1b2c3...`.

**`window_start` uitleg:** Altijd bepaald als `date_trunc('minute', now())`. Elke minuut start een nieuw window.

**Counting logica (UPSERT):**
```sql
INSERT INTO core_rate_limits (rate_key, endpoint, window_start, request_count)
VALUES ($1, $2, date_trunc('minute', now()), 1)
ON CONFLICT (rate_key, endpoint, window_start)
DO UPDATE SET request_count = core_rate_limits.request_count + 1
RETURNING request_count;
```
Als `request_count` > limiet → reject met 429. Anders → doorgaan met request.

**Limieten:**
| Endpoint | Limiet | Window |
|----------|--------|--------|
| POST /v1/core/origins | 100 requests | per minuut per API key |
| GET /v1/core/resolve | 1000 requests | per minuut (globaal per IP) |
| POST /v1/core/verify | 1000 requests | per minuut (globaal per IP) |

**Response bij overschrijding (429 Too Many Requests):**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 42 seconds.",
    "retry_after_seconds": 42,
    "limit": 100,
    "window": "1m"
  }
}
```
Let op: dit volgt het standaard error format uit sectie 1.5, met extra velden specifiek voor rate limiting.

**Vereisten:**
- Response header `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` op alle Core responses
- Rate limit check moet aan het begin van elke request, vóór business logic
- Publieke endpoints (resolve/verify): `rate_key` = `ip:` + SHA-256 hash van IP-adres
- Private endpoint (origins): `rate_key` = `api_key_prefix` uit de gevalideerde API key
- Rate limit tabel mag wél geUPDATE en geDELETE worden (geen immutability triggers nodig)
- Oude rate limit records opschonen: verwijder records ouder dan 24 uur (kan via Supabase cron of bij elke request)

---

### 1.4 Request Logging

**Wat:** Elke Core API call loggen voor monitoring en debugging.

**Maak tabel `core_request_log`:**
```sql
CREATE TABLE core_request_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  method text NOT NULL,
  api_key_prefix text,
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL,
  error_message text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_log_created ON core_request_log(created_at);
CREATE INDEX idx_request_log_endpoint ON core_request_log(endpoint, created_at);
CREATE INDEX idx_request_log_partner ON core_request_log(api_key_prefix, created_at);
```

**Vereisten:**
- Log ELKE request naar Core endpoints, zowel succesvolle als gefaalde
- IP-adres hashen met SHA-256 voordat het opgeslagen wordt (privacy)
- Logging mag NOOIT de hash uit de request loggen (dat is het artefact — privacy-gevoelig)
- Logging is fire-and-forget: als logging faalt, mag de request zelf niet falen
- Response time meten vanaf binnenkomst tot response
- Oude logs opschonen: verwijder records ouder dan 90 dagen (Supabase cron)
- Rate limit tabel en request log tabel krijgen GEEN immutability triggers (dit is operationele data, geen attestatie data)

---

### 1.5 Structured Error Responses

**Wat:** Consistente error format voor alle Core endpoints.

**Standaard error response:**
```json
{
  "error": {
    "code": "INVALID_HASH_FORMAT",
    "message": "Hash must be in format sha256:<64-hex-chars> or raw 64-char hex"
  }
}
```

**Error codes:**
| Code | HTTP Status | Wanneer |
|------|-------------|---------|
| `INVALID_HASH_FORMAT` | 400 | Hash voldoet niet aan formaat |
| `INVALID_REQUEST_BODY` | 400 | JSON parsing faalt of verplichte velden missen |
| `REJECTED_FIELD` | 400 | Verboden veld meegestuurd (content, bytes, metadata, etc.) |
| `UNAUTHORIZED` | 401 | Ontbrekende of ongeldige API key |
| `API_KEY_REVOKED` | 403 | API key is ingetrokken |
| `NOT_FOUND` | 404 | Origin niet gevonden (voor resolve/verify wanneer hash niet bestaat) |
| `RATE_LIMIT_EXCEEDED` | 429 | Limiet overschreden |
| `INTERNAL_ERROR` | 500 | Onverwachte serverfout |

**Vereisten:**
- ALLE Core endpoints gebruiken dit format, geen uitzonderingen
- Bestaande error responses (RAISE EXCEPTION van triggers) moeten opgevangen en vertaald worden naar dit format
- De `message` is altijd in het Engels en developer-friendly
- Bij 500 errors: NOOIT interne details lekken (geen stack traces, geen database errors)

**Specifiek voor resolve en verify bij geen resultaat:**
- GET /v1/core/resolve retourneert **404** met `{"error": {"code": "NOT_FOUND", "message": "No origin found for given identifier"}}` als de hash of origin_id niet bestaat. NIET 200 met `{"found": false}`.
- POST /v1/core/verify retourneert **404** met `{"error": {"code": "NOT_FOUND", "message": "No matching origin found for hash"}}` als de hash niet bestaat. NIET 200 met `{"match": false}`.
- Bij succes retourneren resolve en verify gewoon het origin object (200). Geen `{"found": true}` wrapper nodig.

**Succesvolle responses:**
```
GET /v1/core/resolve?hash=sha256:abc... → 200:
{"origin_id": "uuid", "hash": "sha256:abc...", "hash_algo": "sha256", "captured_at": "..."}

POST /v1/core/verify → 200:
{"origin_id": "uuid", "hash": "sha256:abc...", "hash_algo": "sha256", "captured_at": "..."}
```
Dit is een breaking change ten opzichte van het huidige gedrag. De App-laag moet geüpdatet worden om 404 te verwachten in plaats van `{"found": false}` / `{"match": false}`.

---

## Fase 2: Developer Experience

### 2.1 OpenAPI 3.0 Specificatie

**Wat:** Een machine-readable API spec die de volledige Core API beschrijft.

**Maak bestand:** `public/openapi.yaml` (of serveer als endpoint)

**De spec moet bevatten:**
- Alle `/v1/core/*` endpoints met exacte request/response schemas
- Authenticatie schema (API key via `X-API-Key` header)
- Alle error responses per endpoint
- Rate limit headers beschrijving
- Voorbeelden per endpoint (request + response)

**Optioneel maar sterk aanbevolen:**
- Serveer de spec op `GET /v1/core/openapi.json`
- Dit maakt het mogelijk voor partners om automatisch client libraries te genereren

**Vereisten:**
- De spec moet 100% overeenkomen met de werkelijke API — geen afwijkingen
- Gebruik OpenAPI 3.0.3 formaat
- Valideer de spec met een OpenAPI validator voordat deze live gaat

---

### 2.2 Sandbox Omgeving

**Wat:** Een aparte omgeving waar developers kunnen testen zonder productiedata te raken.

**Aanpak:**
- Maak een tweede Supabase project aan voor sandbox
- Identiek schema als productie (origin_attestations, partner_api_keys, plus de nieuwe tabellen)
- Identieke edge functions
- Eigen set API keys met prefix `sandbox_`

**Sandbox-specifiek gedrag:**
- Attestaties in sandbox worden na 30 dagen automatisch verwijderd (dit is de enige functionele afwijking van productie)
- Sandbox API base URL: apart subdomein of pad, bijv. `sandbox.umarise.com/v1/core/` of `api.umarise.com/v1/sandbox/core/`

**Vereisten:**
- Sandbox moet EXACT dezelfde validatie, rate limits, en error responses hebben als productie
- Sandbox API keys mogen NOOIT werken op productie en vice versa
- Sandbox data is volledig gescheiden van productie — geen gedeelde database
- Documenteer duidelijk het verschil tussen sandbox en productie

---

### 2.3 Developer Quickstart Pagina

**Wat:** Een enkele pagina die een developer in 5 minuten van nul naar werkende integratie brengt.

**Structuur van de pagina:**

```
# Umarise Core — Quickstart

## Wat is Core?
Origin registry voor digitale artefacten. Attesteert dat een hash op een tijdstip bestond.
Drie operaties: attest, resolve, verify.

## 1. Krijg een API Key
[Contact/aanvraag flow]

## 2. Attesteer een origin
```bash
curl -X POST https://api.umarise.com/v1/core/origins \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'
```

## 3. Resolve een origin
```bash
curl https://api.umarise.com/v1/core/resolve?hash=sha256:e3b0c44...
```

## 4. Verify een hash
```bash
curl -X POST https://api.umarise.com/v1/core/verify \
  -H "Content-Type: application/json" \
  -d '{"hash": "sha256:e3b0c44..."}'
```

## Klaar.
Je eerste origin is geattesteerd, opvraagbaar, en verifieerbaar.
```

**Vereisten:**
- Maximaal 1 pagina, geen scrollen door eindeloze docs
- Werkende code voorbeelden in curl, JavaScript (fetch), en Python (requests)
- Link naar volledige OpenAPI spec voor details
- Link naar sandbox met test API key

---

## Fase 3: Partner Management

### 3.1 Partner Dashboard (Minimaal)

**Wat:** Een eenvoudige pagina waar partners hun API key status en gebruiksstatistieken kunnen zien.

**Vereisten:**
- Authenticatie via magic link naar het email-adres uit `partner_api_keys.contact_email` (geen apart auth-systeem, geen wachtwoorden)
- Implementeer met Supabase Auth magic link flow, maar in een aparte auth context — NIET gekoppeld aan App users
- Na login: toon alleen data gekoppeld aan de partner_api_keys records met hetzelfde contact_email
- Toon: API key prefix (nooit de volledige key), status (actief/ingetrokken), uitgiftedatum
- Toon: aantal attestaties per dag/week/maand (uit core_request_log, gefilterd op api_key_prefix)
- Toon: huidige rate limit gebruik en tier
- Mogelijkheid om een nieuwe key aan te vragen (oude wordt ingetrokken)
- Geen complexe UI nodig — functioneel en helder is voldoende

**Belangrijk:** Dit is een CORE pagina, geen App pagina. Eigen route, eigen auth, eigen UI. Geen App-styling of App-componenten hergebruiken.

---

### 3.2 Partner Onboarding Flow

**Wat:** Het proces waarmee een nieuwe partner een API key krijgt.

**Huidige staat:** `POST /internal-generate-partner-key` met `X-Internal-Secret`.

**Verbetering:**
- Voeg velden toe aan `partner_api_keys` tabel:

```sql
ALTER TABLE partner_api_keys 
  ADD COLUMN contact_email text,
  ADD COLUMN use_case text,
  ADD COLUMN rate_limit_tier text NOT NULL DEFAULT 'standard',
  ADD COLUMN last_used_at timestamptz;
```

- `rate_limit_tier` waarden: `standard` (100/min), `premium` (1000/min), `unlimited`
- `last_used_at` wordt bij elke request geüpdatet (voor monitoring inactieve keys)

**Vereisten:**
- De nieuwe kolommen zijn nullable behalve `rate_limit_tier` (backward compatible)
- Rate limiting uit Fase 1 leest de tier van de partner en past de juiste limiet toe
- `last_used_at` update mag niet de request vertragen (async/fire-and-forget)

---

## Fase 4: Observability

### 4.1 Core Metrics Endpoint

**Wat:** Een intern endpoint dat operationele statistieken retourneert.

**Endpoint:**
```
GET /v1/internal/metrics
Auth: X-Internal-Secret
```

**Response:**
```json
{
  "total_attestations": 12847,
  "attestations_24h": 342,
  "attestations_7d": 2103,
  "active_partners": 5,
  "avg_response_time_ms_24h": 45,
  "error_rate_24h": 0.002,
  "timestamp": "2026-02-04T14:30:00.000Z"
}
```

**Vereisten:**
- Alleen toegankelijk met internal secret (niet publiek)
- Queries op core_request_log en origin_attestations
- Moet performant zijn — gebruik COUNT met index, geen full table scans
- Dit endpoint is voor jullie eigen monitoring, niet voor partners

---

### 4.2 Uptime Monitoring

**Wat:** Externe monitoring die alert als Core down is.

**Aanpak:**
- Gebruik een externe service (bijv. BetterUptime, UptimeRobot, of vergelijkbaar) die elke minuut `GET /v1/core/health` pingt
- Alert via email/Slack als health endpoint faalt
- Publieke status page (optioneel maar sterk aanbevolen voor partner vertrouwen)

**Vereisten:**
- Dit is configuratie, geen code — maar het moet opgezet worden
- Health endpoint uit Fase 1 moet live zijn voordat dit werkt

---

## Implementatievolgorde

Dit is de exacte volgorde waarin gebouwd moet worden. Elke stap bouwt voort op de vorige.

```
Week 1:
├── 1.1 API Versiebeheer (/v1/ prefix + deprecation headers op oude endpoints)
├── 1.2 Health endpoint
└── 1.5 Structured error responses

Week 2:
├── 1.3 Rate limiting (tabel + middleware + headers)
├── 1.4 Request logging (tabel + fire-and-forget logging)
└── 3.2 Partner onboarding (extra kolommen + tier-based limits)

Week 3:
├── 2.1 OpenAPI spec
├── 2.3 Developer quickstart pagina
└── 4.1 Metrics endpoint

Week 4:
├── 2.2 Sandbox omgeving
├── 3.1 Partner dashboard
└── 4.2 Uptime monitoring setup
```

**Na deze 4 weken + OTS heb je:**
- Een geformaliseerd API contract met versiebeheer
- Bescherming tegen misbruik (rate limits)
- Volledige observability (logging, metrics, uptime)
- Developer-klare documentatie en sandbox
- Partner management basis
- Trustless verificatie via Bitcoin (proofs overleven Umarise)
- Alles wat een CTO nodig heeft om "ja" te zeggen tegen integratie

**Wat je bewust NIET bouwt in deze 4 weken:**
- Multi-region redundancy (wanneer uptime SLA het vereist)
- Open protocol specificatie (wanneer adoptie het rechtvaardigt)
- Pricing/billing systeem (pas relevant bij betalende partners)
- Geen wijzigingen aan het bestaande origin_attestations schema
- Geen wijzigingen aan de bestaande hashing of attestation logica

**Wat je PARALLEL bouwt (aparte track, niet afhankelijk van bovenstaande fasen):**
- OTS/Bitcoin integratie — zie sectie hieronder

---

## Parallelle Track: OTS/Bitcoin Integratie

**Waarom parallel en niet later:** OTS verandert niets aan het API-oppervlak, het schema, of de bestaande endpoints. Het voegt een bewijs-laag toe náást elke attestatie. Het is puur additief. En het verschil in een CTO-gesprek tussen "we zijn trustless" en "we plannen trustless te worden" is het verschil tussen ja en misschien.

**Wat OTS toevoegt:** Elke attestation-hash wordt opgenomen in een Merkle tree. De Merkle root wordt periodiek verankerd in een Bitcoin-transactie. Hierdoor kan iedereen — zonder Umarise te vertrouwen of zelfs te contacteren — bewijzen dat een hash bestond op of vóór het moment van het Bitcoin-blok.

**Wat dit verandert aan de positionering:** Van "trusted third party" naar "trustless origin registry." Proofs overleven Umarise. Verificatie is onafhankelijk.

**Scope van de integratie:**

1. **Nieuwe tabel `core_ots_proofs`:**
```sql
CREATE TABLE core_ots_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id uuid NOT NULL REFERENCES origin_attestations(origin_id),
  ots_proof bytea,
  merkle_root text,
  bitcoin_tx_id text,
  bitcoin_block_height integer,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  anchored_at timestamptz
);

CREATE INDEX idx_ots_proofs_origin ON core_ots_proofs(origin_id);
CREATE INDEX idx_ots_proofs_status ON core_ots_proofs(status);
```

- `status` waarden: `pending` (in Merkle tree, wacht op Bitcoin bevestiging), `anchored` (bevestigd in Bitcoin block), `failed`
- Deze tabel krijgt WEL immutability triggers op UPDATE/DELETE zodra status = `anchored` (een verankerd bewijs mag nooit gewijzigd worden)

2. **Batching mechanisme:**
- Verzamel attestation-hashes over een configureerbaar interval (bijv. elke 1 uur of elke 100 attestaties, wat eerder komt)
- Bouw een Merkle tree van de verzamelde hashes
- Dien de Merkle root in bij OpenTimestamps
- Sla het OTS-proof op per attestatie zodra Bitcoin-bevestiging binnen is (kan 1-2 uur duren)

3. **API uitbreiding (additive, breekt niets):**

Voeg een optioneel veld toe aan de resolve/verify response:
```json
{
  "origin_id": "uuid",
  "hash": "sha256:...",
  "hash_algo": "sha256",
  "captured_at": "...",
  "ots_proof": {
    "status": "anchored",
    "bitcoin_tx_id": "abc123...",
    "bitcoin_block_height": 880421,
    "anchored_at": "2026-02-04T16:00:00.000Z",
    "proof_url": "/v1/core/proofs/{origin_id}"
  }
}
```

- Als er nog geen proof is (pending of niet beschikbaar): `"ots_proof": null`
- Nieuwe endpoint: `GET /v1/core/proofs/{origin_id}` — retourneert het volledige OTS-proof bestand (binary) dat onafhankelijk geverifieerd kan worden

4. **Onafhankelijke verificatie:**
- Het OTS-proof bestand kan door iedereen geverifieerd worden met de standaard OpenTimestamps client (`ots verify`) zonder contact met Umarise
- Documenteer dit expliciet in de developer docs: "Download het proof, verify het zelf, je hebt ons niet nodig"

**Vereisten:**
- OTS integratie mag NOOIT de bestaande attest/resolve/verify flow vertragen of blokkeren
- Als OTS-service niet bereikbaar is, worden attestaties gewoon opgeslagen zonder proof (graceful degradation)
- Batching en anchoring draaien als achtergrondproces, niet in de request-flow
- De `ots_proof` is optioneel in responses — bestaande consumers die dit veld niet verwachten mogen niet breken

**Afhankelijkheid:** De OTS-spec die jullie al geschreven hebben (`docs/phase-2-ots-integration-spec.md`) bevat de volledige technische details. Bovenstaande is de samenvatting voor implementatie.

---

## Kwaliteitschecks

Na elke fase, verifieer:

**Na Fase 1:**
- [ ] Alle oude endpoints werken nog maar retourneren `X-Deprecated: true` header
- [ ] Alle /v1/ endpoints werken en retourneren `X-API-Version: v1` header
- [ ] Health endpoint retourneert 200 als database bereikbaar is
- [ ] Rate limiting blokkeert bij overschrijding met correcte 429 response
- [ ] Alle errors volgen het standaard error format
- [ ] Request log tabel vult zich bij elke API call
- [ ] Geen enkele hash wordt gelogd in request_log

**Na Fase 2:**
- [ ] OpenAPI spec valideert zonder fouten
- [ ] Quickstart code voorbeelden werken copy-paste
- [ ] Sandbox is bereikbaar en gescheiden van productie

**Na Fase 3:**
- [ ] Partner kan eigen statistieken inzien
- [ ] Rate limit tier wordt correct toegepast per partner
- [ ] last_used_at wordt bijgewerkt zonder request te vertragen

**Na Fase 4:**
- [ ] Metrics endpoint retourneert correcte cijfers
- [ ] Uptime monitoring alert werkt (test door health endpoint tijdelijk te breken)

**Na OTS integratie:**
- [ ] Attestaties worden gebatched en Merkle tree wordt correct opgebouwd
- [ ] Merkle root wordt succesvol naar OpenTimestamps gestuurd
- [ ] Na Bitcoin-bevestiging wordt status `anchored` en proof opgeslagen
- [ ] `GET /v1/core/proofs/{origin_id}` retourneert downloadbaar proof bestand
- [ ] Proof is verifieerbaar met standaard `ots verify` client zonder Umarise
- [ ] Resolve/verify responses tonen `ots_proof` veld wanneer beschikbaar
- [ ] Als OTS-service down is, werkt attest/resolve/verify gewoon door (graceful degradation)
- [ ] Bestaande consumers zonder OTS-kennis breken niet op het extra veld

---

## Wat NIET veranderen

Deze lijst is even belangrijk als wat wél gebouwd moet worden:

1. **origin_attestations tabel schema** — Niet aanraken. Geen kolommen toevoegen. Geen kolommen wijzigen.
2. **Immutability triggers** — Niet aanpassen. prevent_origin_attestation_update en prevent_origin_attestation_delete blijven exact zoals ze zijn.
3. **Hashing logica** — Client-side SHA-256 op raw bytes. Niet verplaatsen naar server. Niet uitbreiden met metadata.
4. **RLS policies op origin_attestations** — SELECT public, INSERT service role only. Niet verruimen.
5. **API key authenticatie mechanisme** — HMAC-SHA256 met CORE_API_SECRET. Niet vervangen.
6. **Duplicate hash gedrag** — Twee keer dezelfde hash = twee attestaties. Resolve retourneert oudste. Dit is by design.
7. **Core's onwetendheid over de App** — Core kent geen device_user_id, page_id, labels, of App-concepten. Houd dit zo.

---

## App-laag aanpassingen (vereist)

De volgende wijzigingen in de App-laag zijn nodig om compatible te blijven met de geüpgrade Core:

1. **Endpoints updaten:** Alle App-code die Core aanroept moet wijzen naar `/v1/core/...` in plaats van `/core/...`
2. **Resolve response handling:** App verwacht nu `{"found": true/false, ...}`. Na upgrade retourneert Core 200 met origin object bij succes, of 404 bij niet gevonden. App moet HTTP status code checken in plaats van `found` veld.
3. **Verify response handling:** Zelfde als resolve — App verwacht `{"match": true/false}`, moet HTTP status code gaan checken.
4. **Error handling:** Alle Core errors volgen nu het format `{"error": {"code": "...", "message": "..."}}`. App moet dit format parsen.

**Timing:** Deze App-aanpassingen moeten in Week 1 mee, tegelijk met de /v1/ endpoints en structured error responses.

---

*Document versie: 1.0*
*Doel: Lovable implementatie-instructies*
*Scope: Umarise Core infrastructure upgrade*
*Uitgangspunt: Bestaande Core-logica is correct en wordt niet gewijzigd*
