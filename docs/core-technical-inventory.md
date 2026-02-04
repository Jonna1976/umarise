# Umarise Core — Technische Inventaris

> **Status**: 100% compleet  
> **Datum**: 2026-02-04  
> **Scope**: Core Layer alleen (geen App-semantiek)

---

## 1. DATABASE

### 1.1 Tabellen

#### `origin_attestations`
| Kolom | Type | Constraints |
|-------|------|-------------|
| `origin_id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `hash` | TEXT | NOT NULL |
| `hash_algo` | TEXT | DEFAULT 'sha256' |
| `captured_at` | TIMESTAMPTZ | DEFAULT now() |
| `created_at` | TIMESTAMPTZ | DEFAULT now() |

#### `partner_api_keys`
| Kolom | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | PRIMARY KEY |
| `partner_name` | TEXT | NOT NULL |
| `key_prefix` | TEXT | NOT NULL (eerste 8 chars) |
| `key_hash` | TEXT | NOT NULL (HMAC-SHA256) |
| `issued_at` | TIMESTAMPTZ | DEFAULT now() |
| `issued_by` | TEXT | NULLABLE |
| `revoked_at` | TIMESTAMPTZ | NULLABLE |

### 1.2 Triggers (Immutability)

```sql
-- Blokkeert alle UPDATEs
CREATE TRIGGER prevent_origin_attestation_update
BEFORE UPDATE ON origin_attestations
FOR EACH ROW EXECUTE FUNCTION prevent_update();

-- Blokkeert alle DELETEs
CREATE TRIGGER prevent_origin_attestation_delete
BEFORE DELETE ON origin_attestations
FOR EACH ROW EXECUTE FUNCTION prevent_delete();
```

**Logica**: `RAISE EXCEPTION 'Origin attestations are immutable'`

### 1.3 Row Level Security (RLS)

| Tabel | Policy | Toegang |
|-------|--------|---------|
| `origin_attestations` | SELECT | Publiek (anon) |
| `origin_attestations` | INSERT | Alleen service_role |
| `partner_api_keys` | ALL | Alleen service_role |

### 1.4 Indexes

| Tabel | Index | Kolom(men) |
|-------|-------|------------|
| `origin_attestations` | `idx_origin_attestations_hash` | `hash` |
| `origin_attestations` | (implicit) | `captured_at` (voor ORDER BY) |

---

## 2. API

### 2.1 Endpoints

| Endpoint | Methode | Auth | Beschrijving |
|----------|---------|------|--------------|
| `/core/origins` | POST | X-API-Key (HMAC) | Creëer attestatie |
| `/core/resolve` | GET | Publiek | Ophalen op origin_id of hash |
| `/core/verify` | POST | Publiek | Binaire verificatie (match/no match) |

### 2.2 Request/Response Structuren

#### POST /core/origins
```json
// Request
{ "hash": "sha256:<64-char-hex>" }

// Response (201 Created)
{
  "origin_id": "uuid",
  "hash": "sha256:...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-04T12:00:00Z"
}
```

**Validatie**:
- Rejecteert `content`, `bytes`, `data`, `file` → "Core does not accept bytes"
- Rejecteert `source_system`, `metadata`, `labels`, `type` → "Core does not accept labels"
- Valideert hash format: 64-char hex of `sha256:<64-char-hex>`

#### GET /core/resolve
```
?origin_id={uuid}  OF  ?hash={sha256}

// Response (200 OK)
{
  "found": true,
  "origin": {
    "origin_id": "...",
    "hash": "sha256:...",
    "hash_algo": "sha256",
    "captured_at": "..."
  }
}

// Response (404 Not Found)
{ "found": false, "origin": null }
```

#### POST /core/verify
```json
// Request
{ "hash": "sha256:<64-char-hex>" }

// Response (match)
{
  "match": true,
  "origin_id": "...",
  "captured_at": "..."
}

// Response (no match)
{ "match": false }
```

### 2.3 Authenticatie

| Endpoint | Mechanisme |
|----------|------------|
| `/core/origins` | `X-API-Key` header → HMAC-SHA256 validatie tegen `partner_api_keys` |
| `/core/resolve` | Geen (publiek) |
| `/core/verify` | Geen (publiek) |

**HMAC Flow**:
1. Extract `key_prefix` (eerste 8 chars)
2. Lookup in `partner_api_keys`
3. Bereken HMAC-SHA256 van volledige key met `CORE_API_SECRET`
4. Vergelijk met opgeslagen `key_hash`
5. Check `revoked_at IS NULL`

### 2.4 Duplicate Hash Gedrag

**Geen idempotency op content**: Elke POST met dezelfde hash = **nieuwe attestatie** met eigen `origin_id`.

**Resolution logica**: Bij meerdere attestaties voor dezelfde hash retourneert `/core/resolve` en `/core/verify` altijd de **oudste** (first-in-time):

```sql
ORDER BY captured_at ASC LIMIT 1
```

### 2.5 Rate Limits

**Niet geïmplementeerd** — gap voor productie.

---

## 3. HASHING

### 3.1 Locatie

**Client-side** in `src/lib/originHash.ts`

### 3.2 Algoritme

```typescript
async function sha256(arrayBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  // Returns 64-char lowercase hex string
}
```

### 3.3 Wat wordt gehasht

**Alleen ruwe bytes** van het artifact (afbeelding, document).

**Geen metadata** — geen filename, geen timestamp, geen user info in de hash.

---

## 4. STORAGE

### 4.1 Wat wordt waar opgeslagen

| Data | Locatie | Layer |
|------|---------|-------|
| Origin attestaties (hash + timestamp) | Supabase | Core |
| Partner API keys | Supabase | Core |
| Originele artifacts (afbeeldingen) | Hetzner IPFS | App |
| Page metadata, OCR, labels | Supabase `pages` tabel | App |

### 4.2 Core is Content-Blind

Core ontvangt **nooit** bytes. Het ontvangt alleen:
- 64-character hex strings (SHA-256 hashes)
- Timestamps (server-generated)

De originele content blijft bij de client of in App-layer storage.

---

## 5. APP-CORE KOPPELING

### 5.1 Architecturale Scheiding

| Aspect | Core | App |
|--------|------|-----|
| **Endpoints** | `/core/origins`, `/core/resolve`, `/core/verify` | `/resolve-origin`, `analyze-*`, etc. |
| **Data** | Alleen hash + timestamp | Labels, OCR, keywords, thumbnails |
| **Authenticatie** | Partner API keys | Device UUIDs |
| **Semantiek** | Geen (content-blind) | Vol (AI-analyse, categorisatie) |

### 5.2 Kan Core los aangesproken worden?

**Ja** — Core endpoints zijn volledig onafhankelijk:
- Geen imports van App-code
- Geen referenties naar `pages` tabel
- Geen device_user_id concepten
- Eigen authenticatie (partner keys vs device UUIDs)

### 5.3 Hardcoded App-aannames in Core?

**Geen** — Core is schoon:
- Geen `pages` tabel referenties
- Geen `device_user_id` 
- Geen Hetzner storage calls
- Geen AI/OCR processing

---

## 6. WAT BESTAAT NIET

### 6.1 Logging/Monitoring

| Item | Status |
|------|--------|
| Structured logging | ❌ Alleen console.log |
| Metrics/dashboards | ❌ Niet aanwezig |
| Health endpoint | ❌ Niet aanwezig |
| Error alerting | ❌ Niet aanwezig |

### 6.2 API Documentatie

| Item | Status |
|------|--------|
| OpenAPI/Swagger spec | ❌ Niet aanwezig |
| Publieke API docs | ❌ Niet aanwezig |
| Postman collection | ❌ Niet aanwezig |

### 6.3 Sandbox/Test Omgeving

| Item | Status |
|------|--------|
| Aparte test database | ❌ Niet aanwezig |
| Sandbox API keys | ❌ Niet aanwezig |
| Test mode flag | ❌ Niet aanwezig |

### 6.4 Versiebeheer

| Item | Status |
|------|--------|
| API versioning (`/v1/`) | ❌ Niet aanwezig |
| Backward compatibility guarantees | ❌ Niet geformaliseerd |
| Deprecation policy | ❌ Niet aanwezig |

### 6.5 Rate Limiting

| Item | Status |
|------|--------|
| Per-key rate limits | ❌ Niet aanwezig |
| Global rate limits | ❌ Niet aanwezig |
| Rate limit headers | ❌ Niet aanwezig |

---

## 7. INTERNE TOOLING

### 7.1 Partner Key Generatie

**Endpoint**: `/internal-generate-partner-key`  
**Auth**: `X-Internal-Secret` header  
**Functie**: Genereert nieuwe partner API keys en slaat HMAC hash op

---

## 8. SAMENVATTING

### Wat WEL bestaat ✅

- Minimale, content-blinde attestatie database
- Immutability via DB triggers
- HMAC-geauthenticeerde partner API
- Publieke verificatie endpoints
- First-in-time resolution logica
- Client-side SHA-256 hashing
- Schone App/Core scheiding

### Wat NIET bestaat ❌

- Rate limiting
- API versioning
- Health endpoints
- Structured logging
- OpenAPI documentatie
- Sandbox omgeving

---

*Dit document is de single source of truth voor Core's technische staat.*
