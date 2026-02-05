# Lovable Brief: OTS Proof Endpoint + Bulk Export

## Context

Partners die Umarise gebruiken moeten het OpenTimestamps-bewijs (.ots proof) kunnen ophalen. Dit bewijs maakt hun attestatie onafhankelijk verifieerbaar — ook als Umarise niet meer bestaat.

De data is er al: `core_ots_proofs` tabel bevat alles. We moeten alleen endpoints openzetten.

**Ontwerpprincipe:** de dagelijkse partnerflow blijft één handeling (hash → POST → origin_id opslaan). Het .ots-bewijs is geen tweede stap — het leeft bij Umarise en is altijd ophaalbaar. Partners kunnen periodiek een bulk-export doen als verzekering.

---

## Wat er moet gebeuren

### 1. Nieuw endpoint: `GET /v1-core-origins/{origin_id}/proof`

**Doel:** Partner kan het .ots proof ophalen voor één specifieke attestatie.

**Flow:**

1. Partner stuurt `GET /v1-core-origins/{origin_id}/proof` met API key
2. Zoek origin op via `origin_id`
3. Check `core_ots_proofs` voor deze origin

**Responses:**

| Situatie | HTTP | Response |
|----------|------|----------|
| Geen geldige API key | `401` | `{ "error": "Unauthorized" }` |
| Origin niet gevonden | `404` | `{ "error": "Origin not found" }` |
| Geen proof rij | `404` | `{ "error": "Proof not available yet" }` |
| `status = 'pending'` | `202` | `{ "origin_id": "xxx", "proof_status": "pending", "message": "Bitcoin anchoring in progress. Try again later." }` |
| `status = 'anchored'` | `200` | Volledige response (zie onder) |

**Response bij `anchored` (HTTP 200):**

```json
{
  "origin_id": "xxx",
  "proof_status": "anchored",
  "bitcoin_block_height": 935037,
  "anchored_at": "2026-01-15T14:32:00Z",
  "ots_proof": "<base64-encoded .ots file>"
}
```

---

### 2. Nieuw endpoint: `GET /v1-core-proofs/export`

**Doel:** Partner downloadt al hun .ots-bewijzen in één keer als backup-archief. Dit is de "verzekering" — periodiek te draaien (maandelijks, per kwartaal, wanneer ze willen).

**Parameters:**

| Parameter | Type | Verplicht | Beschrijving |
|-----------|------|-----------|--------------|
| `status` | string | Nee | Filter op `anchored` of `pending`. Default: `anchored` (je wilt alleen voltooide bewijzen exporteren) |
| `since` | ISO 8601 timestamp | Nee | Alleen proofs na deze datum (voor incrementele backups) |
| `format` | string | Nee | `json` (default) of `zip` |

**Response bij `format=json` (HTTP 200):**

```json
{
  "export_date": "2026-02-05T14:00:00Z",
  "total_proofs": 142,
  "proofs": [
    {
      "origin_id": "xxx",
      "hash": "abc123...",
      "proof_status": "anchored",
      "bitcoin_block_height": 935037,
      "anchored_at": "2026-01-15T14:32:00Z",
      "ots_proof": "<base64-encoded .ots file>"
    }
  ]
}
```

**Response bij `format=zip` (HTTP 200):**

Binary ZIP-bestand met daarin per attestatie een .ots-bestand, genaamd `{origin_id}.ots`. Plus een `manifest.json` met de metadata (origin_id, hash, block height, anchored_at) voor elk bestand.

**Paginatie** (voor partners met veel attestaties):

- `limit` (default 100, max 1000)
- `cursor` (origin_id van laatste resultaat voor volgende pagina)
- Response bevat `has_more: true/false` en `next_cursor`

---

### 3. Voeg `proof_status` toe aan bestaande responses

**POST /v1-core-origins response (uitbreiden):**

```json
{
  "origin_id": "xxx",
  "hash": "abc123...",
  "timestamp": "2026-02-05T12:00:00Z",
  "proof_status": "pending",
  "proof_url": "/v1-core-origins/xxx/proof"
}
```

**POST /v1-core-verify response (uitbreiden):**

```json
{
  "match": true,
  "origin_id": "xxx",
  "timestamp": "2026-02-05T12:00:00Z",
  "proof_status": "anchored",
  "proof_url": "/v1-core-origins/xxx/proof"
}
```

---

## Technische details

**Stack:** Supabase Edge Function (Deno/TypeScript)

**Query voor enkel proof:**

```sql
SELECT
  p.status,
  p.bitcoin_block_height,
  p.anchored_at,
  p.proof_data              -- pas kolomnaam aan naar jullie schema
FROM core_ots_proofs p
JOIN core_origins o ON o.id = p.origin_id
WHERE o.origin_id = :origin_id;
```

**Query voor bulk export:**

```sql
SELECT
  o.origin_id,
  o.hash,
  p.status,
  p.bitcoin_block_height,
  p.anchored_at,
  p.proof_data
FROM core_ots_proofs p
JOIN core_origins o ON o.id = p.origin_id
WHERE p.status = :status
  AND (:since IS NULL OR p.anchored_at > :since)
ORDER BY p.anchored_at ASC
LIMIT :limit;
```

**Let op:**

- Check altijd `status` — een rij in `core_ots_proofs` betekent NIET dat anchoring compleet is
- De `prevent_anchored_proof_mutation` trigger beschermt anchored records al
- .ots proof is binair — retourneer als base64 in JSON, of als raw bytes in ZIP
- Authenticatie: zelfde API key validatie als bestaande endpoints
- RLS: partner mag alleen eigen proofs zien (als multi-tenant) of alle proofs (als no-identity)

---

## Wat er NIET verandert

- De `core_ots_proofs` tabel
- De immutability trigger
- De anchoring flow
- De dagelijkse partnerflow (hash → POST → origin_id opslaan, klaar)

---

## Acceptatiecriteria

1. `GET /v1-core-origins/{origin_id}/proof` retourneert correct voor pending, anchored, en niet-bestaande proofs
2. `GET /v1-core-proofs/export` retourneert alle anchored proofs met paginatie
3. `GET /v1-core-proofs/export?since=...` werkt voor incrementele backups
4. `GET /v1-core-proofs/export?format=zip` retourneert geldig ZIP met .ots-bestanden + manifest
5. `POST /v1-core-origins` response bevat `proof_status` en `proof_url`
6. `POST /v1-core-verify` response bevat `proof_status` en `proof_url`
7. API key validatie werkt op alle nieuwe endpoints
8. Base64-encoded .ots proof is bruikbaar met standaard `ots verify` CLI

---

## Prioriteit en volgorde

**Fase 1 (must-have):**
- Enkel proof endpoint (`GET /v1-core-origins/{origin_id}/proof`)
- `proof_status` in POST en verify responses

**Fase 2 (kort erna):**
- Bulk export endpoint met JSON + `since` parameter

**Fase 3 (nice-to-have):**
- ZIP-export met manifest
- Paginatie

---

## Waarom dit nodig is

Zonder dit kunnen partners niet onafhankelijk verifiëren als Umarise wegvalt. De claim "het bewijs overleeft Umarise" klopt dan niet. Dit maakt die claim waar.
