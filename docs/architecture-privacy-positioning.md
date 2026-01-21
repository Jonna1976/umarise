# Umarise Privacy Architecture
## Positioning in the AI Landscape — January 2026

> **Thesis**: In een wereld waar ChatGPT advertenties toevoegt en Signal's oprichter privé-AI bouwt, 
> levert Umarise nu al wat anderen beloven: sovereignty zonder concessies aan kwaliteit.

---

## De Markt Vandaag

| Speler | Model | Data Locatie | Privacy Claim | Realiteit |
|--------|-------|--------------|---------------|-----------|
| **ChatGPT** | Advertentie-gedreven | US servers | "Ads beïnvloeden antwoorden niet" | Rechters kunnen alle logs opvragen |
| **Confer** (Signal) | €35/maand | E2E encrypted cloud | Zero-knowledge | Nog niet onafhankelijk geverifieerd |
| **Perplexity** | Advertentie-gedreven | US servers | Geen privacy focus | Verkoopt zoekintentie |
| **Umarise v1** | Sovereign cloud | 🇪🇺 Hetzner DE | Zero-access by design | Operationeel, bewezen in pilot |

---

## V1 Pilot: Wat We Nu Al Bieden

### 1. Hybrid Architecture: Lovable Frontend + Hetzner Backend

```
┌─────────────────────────────────────────────────────────┐
│                   LOVABLE FRONTEND                       │
│                (React + Vite + Tailwind)                │
│         Hosted on Lovable Cloud (CDN delivery)          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│              LOVABLE CLOUD EDGE FUNCTIONS               │
│                   (Proxy Layer Only)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ hetzner-ai  │  │  hetzner-   │  │  hetzner-   │     │
│  │   -proxy    │  │  storage-   │  │   health    │     │
│  │             │  │   proxy     │  │             │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│              (No data stored - pass-through only)       │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTPS (Bearer Token)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    HETZNER GERMANY                       │
│                   (EU Data Residency)                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Single HTTPS Ingress                │    │
│  │                   (Port 443)                     │    │
│  │  ┌─────────────┐    ┌─────────────┐            │    │
│  │  │   Vision    │    │   Codex     │            │    │
│  │  │   Service   │    │   Service   │            │    │
│  │  │ (localhost) │    │ (localhost) │            │    │
│  │  └──────┬──────┘    └──────┬──────┘            │    │
│  │         │                  │                    │    │
│  │         └────────┬─────────┘                    │    │
│  │                  ▼                              │    │
│  │         ┌─────────────┐                         │    │
│  │         │  Encrypted  │                         │    │
│  │         │   Storage   │                         │    │
│  │         │  (AES-256)  │                         │    │
│  │         └─────────────┘                         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Waarom deze hybrid architectuur:**
- **Lovable Frontend**: Snelle iteration, React ecosystem, geen DevOps overhead
- **Edge Function Proxies**: Browser CORS vereist server-side proxy voor Hetzner calls
- **Hetzner Backend**: Alle data opslag, alle AI processing, EU sovereignty

**Wat dit betekent voor privacy:**
- Edge functions zijn **stateless proxies** - geen data caching, geen content logging
- Alle persoonlijke data gaat direct door naar Hetzner (encrypted in transit)
- Lovable Cloud ziet alleen traffic volume, niet de inhoud
- Geen data verlaat Europese bodem (Hetzner DE)
- Alle services draaien localhost-only (niet extern bereikbaar)
- Single ingress = één plek voor rate limiting, auth, audit

### 2. Zero-Access by Design (Niet Zero-Knowledge, Beter Uitlegbaar)

| Aspect | Zero-Knowledge (Confer claim) | Zero-Access (Umarise v1) |
|--------|-------------------------------|--------------------------|
| Encryptie | Client-side, server kan niet lezen | Server-side AES-256 at rest |
| AI Processing | Moet op client OF met trusted execution | Gemini 2.5 Flash in perimeter (model-agnostic by design) |
| Verificatie | Vereist crypto-audit | Policy + architecture audit |
| OCR Kwaliteit | Beperkt door client hardware | Character-perfect (cloud GPU) |
| **Trade-off** | Maximale crypto garantie | Maximale OCR + uitlegbare privacy |

**Onze positie**: We kiezen bewust voor zero-access (policy-enforced) omdat:
1. Handschrift-OCR vereist Gemini-niveau kwaliteit
2. On-device vision models zijn nog niet goed genoeg
3. Hetzner DE + contractuele garanties = voldoende voor MKB pilot
4. Upgrade naar zero-knowledge in v2 zonder architectuur-breuk

**Expliciete verduidelijking**: In v1 kan Umarise technisch toegang afdwingen via policy, maar heeft geen operationele of commerciële incentive om dat te doen. Any server-side access would require an explicit breach of documented operational procedure, is audit-logged, and is contractually prohibited outside security incident response.

### 3. Origin Immutability (Cryptografisch Bewezen)

```sql
-- Database trigger: origin hash is IMMUTABLE once set
CREATE TRIGGER prevent_origin_hash_change
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE FUNCTION prevent_origin_hash_update();
-- Raises exception: 'origin_hash_sha256 is immutable once set'
```

**Wat dit bewijst:**
- SHA-256 fingerprint berekend over exacte artifact bytes bij upload
- Hash opgeslagen in database, trigger voorkomt wijziging
- Verificatie: download image → hash → vergelijk met stored hash
- **Resultaat**: Wiskundige garantie dat origineel niet is aangepast

### 4. Anti-Black-Box Search (Explainability by Default)

```typescript
// Search ranking - user intent ALWAYS wins over AI inference
const RANKING_WEIGHTS = {
  spine: 100,      // User-assigned primary keyword
  cues: 100,       // User-assigned Future You Cues  
  keywords: 80,    // AI-suggested bonus words
  ocr: 50,         // Raw handwritten text (AI-extracted)
};
```

**Vijf Anti-Black-Box Regels (Architecturally Enforced):**

1. **Single Source of Truth** — Originele scan is dominant, AI herschrijft nooit
2. **Explainability by Default** — Elk zoekresultaat toont WAAROM het matchte
3. **User Intent > Model Inference** — Jouw woorden ranken boven AI-"meaning"
4. **Cite-to-Source** — Elk AI-inzicht linkt naar highlighted passage in OCR
5. **Revocable & Editable** — Toggle AI uit, edit summaries, audit trail bewaard

### 5. Device-Based Privacy (No Accounts, No Tracking)

```
┌──────────────────────────────────────────────────────┐
│                    USER DEVICE                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  device_user_id: "054aba4f-0453-4e6e-..."     │  │
│  │  (Generated once, stored in IndexedDB)         │  │
│  │                                                │  │
│  │  - No email                                    │  │
│  │  - No password                                 │  │
│  │  - No phone number                             │  │
│  │  - No tracking cookies                         │  │
│  │  - No analytics beyond search telemetry        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
         │
         │ UUID = ownership proof
         ▼
┌──────────────────────────────────────────────────────┐
│                 HETZNER VAULT                         │
│  RLS Policy: WHERE device_user_id = request.id       │
│  (Only YOUR device can access YOUR origins)          │
└──────────────────────────────────────────────────────┘
```

**Waarom dit werkt:**
- UUID is 128-bit random → astronomisch onraadbaar
- RLS policies op database niveau (niet alleen app-level)
- Geen centrale user database = geen breach target
- v2: "Claim" flow om device_user_id aan account te koppelen

**Belangrijk onderscheid:**
- **Ownership ≠ Identity** — Device UUID bewijst bezit van origins, niet wie je bent
- **Identity is opt-in** — Accounts komen pas in v2, altijd vrijwillig
- **Authority = Origin Hash + Consent Logs** — Niet afhankelijk van identiteit

---

## V2 Vision: Wat Komt

### 1. Zero-Knowledge Encryption (Client-Side AES-256-GCM)

```
v1 (nu):     Device → HTTPS → Hetzner → Store (encrypted at rest)
v2 (gepland): Device → Encrypt → HTTPS → Hetzner → Store (encrypted blob)
                ↑
                Key stays on device (never transmitted)
```

**Impact**: Zelfs met volledige server access kan niemand originelen lezen.

### 2. Local-First Processing (When Models Are Ready)

| Capability | v1 (Cloud) | v2 (Local) | Trigger |
|------------|------------|------------|---------|
| OCR | Gemini 2.5 Flash | On-device vision model | Wanneer kwaliteit ≥95% Gemini |
| Search | Server-side | Local FTS5 + sync | Standaard |
| Embeddings | Server-side | Local ONNX model | Performance test |

**Filosofie**: Device wordt system of record. Cloud wordt optional sync.

**Vendor Independence**: Model abstraction layer ensures no architectural dependency on a single vendor; Gemini is a quality benchmark, not a hard dependency.

### 3. MCP Server: Origin Authority

```
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL AI TOOLS                        │
│         (Claude, GPT, Gemini, Future Agents)            │
│                         │                                │
│                         │ MCP Protocol                   │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │            UMARISE CONSENT GATEWAY              │    │
│  │                                                 │    │
│  │  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │   Consent   │  │   Origin Verification   │  │    │
│  │  │    Check    │→ │   (Hash + Timestamp)    │  │    │
│  │  └─────────────┘  └─────────────────────────┘  │    │
│  │         │                    │                 │    │
│  │         ▼                    ▼                 │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │  Temporary, Revocable, Scoped Access    │  │    │
│  │  │  (Read-only, time-limited, audit-logged)│  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Kernprincipe**: "AI tools komen en gaan. Originals hebben een authority nodig."

Umarise is NOOIT een MCP Client (die tools aanroept). 
Umarise IS een MCP Server (die access verleent onder voorwaarden).

### 4. Account Adoption (Claim Your Origins)

```
v1: device_user_id = "054aba4f-..." (anonymous)
                │
                │ User chooses to claim
                ▼
v2: user_account_id = "user@email.com"
    └── linked_devices: ["054aba4f-...", "other-device-id"]
```

**Geen migratie**: Bestaande origins blijven exact waar ze zijn. 
Account is een optionele laag voor multi-device sync.

---

## Waarom Dit Delen?

### Het Moment Is Nu

1. **OpenAI kiest advertenties** → Markt zoekt alternatieven
2. **Signal-oprichter bouwt privé-AI** → Privacy-AI is mainstream topic
3. **EU AI Act enforcement** → Sovereignty wordt compliance-eis
4. **Sequoia hedget** → Zelfs insiders twijfelen aan winner-takes-all

### Umarise Positie

| Claim | Bewijs |
|-------|--------|
| "Wij doen niet aan advertenties" | Business model = subscription, niet data |
| "Jouw origins blijven van jou" | Device-based ownership, RLS policies |
| "AI kan origineel niet vervangen" | Immutability trigger, hash verification |
| "Je ziet WAAROM het matcht" | Explainability badges, cite-to-source |
| "Data verlaat EU niet" | Hetzner DE, single ingress architecture |

### Wie Zou Dit Moeten Weten?

**AI Ethics/Privacy Thought Leaders:**
- Timnit Gebru (DAIR Institute)
- Meredith Whittaker (Signal President)
- Max Tegmark (Future of Life Institute)

**European Tech Sovereignty:**
- Gaia-X stakeholders
- NextCloud/Proton ecosystem
- EU AI Office

**Enterprise Security:**
- CISOs die shadow knowledge probleem herkennen
- CTOs die on-premise AI evalueren

---

## Appendix A: Frozen Lovable Cloud Data (January 2026)

> **⚠️ DATA FROZEN**: As of January 2026, the Lovable Cloud (Supabase) backend is permanently frozen.
> All active data operations now exclusively use the Hetzner Privacy Vault.

### What Remains in Lovable Cloud

| Table | Records | Last Activity | Status |
|-------|---------|---------------|--------|
| `pages` | 65 | 2026-01-03 | 🔒 Frozen (test data) |
| `audit_logs` | 1,390 | Historical | 🔒 Read-only |
| `origin_hashes` | 22 | Historical | 🔒 Read-only |
| `personality_snapshots` | 34 | Historical | 🔒 Read-only |
| `projects` | 16 | Historical | 🔒 Read-only |
| `search_telemetry` | 109 | Historical | 🔒 Read-only |
| `page_trash` | 33 | Historical | 🔒 Read-only |

### Device IDs in Frozen Data

| Device ID | Pages | Description |
|-----------|-------|-------------|
| `054aba4f-0453-4e6e-80c0-bdd554d19a91` | 53 | Original pilot testing (pre-Hetzner) |
| `ae3ff163-0750-45b4-8683-6f95267c7e1a` | 8 | Secondary test device |
| `demo0000-0000-0000-0000-000000000001` | 4 | Demo mode placeholder |

### Technical Enforcement

```typescript
// src/lib/abstractions/index.ts
export function isHetznerEnabled(): boolean {
  // ALWAYS Hetzner - no exceptions, no overrides, no switching
  // This is a hard architectural decision, not a configuration option
  return true;
}
```

**Why Frozen (Not Deleted):**
- Audit trail preservation
- Historical reference for development
- No user data at risk (all test data)
- Deletion would provide no security benefit

---

## Appendix B: Security Sign-Off Status

Pilot security sign-off completed: `docs/security-signoff-pilot-2026-01-20.md`

| Component | Status | Notes |
|-----------|--------|-------|
| Single HTTPS ingress | ✅ | Nginx 443 only |
| Bearer token auth | ✅ | HETZNER_API_TOKEN |
| Rate limiting | ✅ | In-memory store |
| RLS policies | ✅ | device_user_id validation |
| Origin hash immutability | ✅ | Database trigger |
| Audit logging | ✅ | 90-day retention |
| Production lock | ✅ | Published app = Hetzner only |
| Lovable Cloud frozen | ✅ | No writes since Jan 2026 |

---

## Threat Model Scope

**Out of scope:** Compromised end-user devices, malicious browsers, or physical coercion.

---

*Document version: 2026-01-21*
*Status: Ready for external sharing*
