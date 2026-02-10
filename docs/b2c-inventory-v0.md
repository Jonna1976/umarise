# B2C-Inventarisatie v0.8 — Umarise App

**Scope:** Uitsluitend de B2C-laag (Umarise App)  
**Relatie tot Core:** Automatische propagatie via database trigger  
**Datum:** 10 februari 2026  
**Status:** Formele systeemdefinitie  
**Versie:** v0.8 — gesynchroniseerd met /architecture (10 feb 2026)

---

## Δ Wijzigingen t.o.v. v0.7

| Aspect | v0.7 | v0.8 |
|--------|------|------|
| Ritual flow | 8 stappen (S0–S7) | ✅ Geconsolideerd naar 4 stappen (S0–S3) |
| Wall of Existence | Aparte naam | ✅ Hernoemd naar **Origin Registry** |
| S2 Pause + S3 Mark | Handmatige stappen | ✅ Verwijderd: auto-hash bij file selectie |
| S5 ZIP + S6 Owned | Aparte schermen | ✅ Geïntegreerd in S2 Sealed |
| Certificate export | PDF (jsPDF) | ✅ certificate.json + VERIFY.txt in ZIP |
| ZIP compositie | certificate.pdf + proof.ots | ✅ artifact + certificate.json + VERIFY.txt + proof.ots |
| Origin Registry | S7 horizontale gallery | ✅ S3: Origin Registry (3D Hall concept) |

---

## 1. Systeemdefinitie

| Vraag | Antwoord |
|-------|----------|
| **Wat is Umarise (B2C) exact als systeem?** | Een privacy-first PWA (React/TypeScript) die artifacts vastlegt via een client-side SHA-256 hash. De hash + metadata gaat naar Supabase; de thumbnail blijft lokaal in IndexedDB. Geen artifact bytes verlaten het device. Een database trigger propageert de hash naar `origin_attestations` (Core-laag) voor OTS-anchoring. |
| **Welke handeling stelt de gebruiker technisch gezien vast?** | Het bestaan van specifieke bytes (artifact) op een specifiek moment, door middel van client-side hashing. De originele bytes blijven op het device van de gebruiker — alleen de hash wordt geattesteerd. |
| **Wat is het formele output-object van die handeling?** | **Lokaal (IndexedDB):** thumbnail, hash, origin_id, timestamp, ots_proof, sync_status. **Server (Supabase):** `pages` record met hash, device_fingerprint_hash, user_id (nullable). **Core:** `origin_attestation` via trigger. **Export:** PDF-certificaat + .ots proof (client-side gegenereerd). |

---

## 2. Tech Stack

| Component | Technologie | Versie/Details |
|-----------|-------------|----------------|
| **Framework** | React + TypeScript | ^18.3.1 |
| **Build tooling** | Vite | via vite.config.ts |
| **Styling** | Tailwind CSS | met shadcn/ui componenten |
| **State management** | React Query | @tanstack/react-query ^5.83.0 |
| **Database** | Supabase (PostgreSQL) | Lovable Cloud EU |
| **Auth** | Supabase Auth | Magic Link (passwordless) |
| **Lokale opslag** | IndexedDB | Thumbnails, proofs, sync queue |
| **Hashing** | Web Crypto API | crypto.subtle.digest('SHA-256') |
| **Certificate** | JSON | certificate.json (immutable snapshot) |
| **Archivering** | JSZip | artifact + certificate.json + VERIFY.txt + .ots |
| **Email notificatie** | Resend | OTS completion alerts |
| **Hosting** | Lovable Cloud | CDN + EU edge |

---

## 3. Privacy-Architectuur

### 3.1 Kernprincipe: "Sealed on your device · only the proof leaves"

| Data | Locatie | Verlaat device? |
|------|---------|-----------------|
| Originele foto | Nooit opgeslagen | ❌ Nee |
| Thumbnail (~400px) | IndexedDB | ❌ Nee |
| SHA-256 hash | Supabase | ✅ Ja (64 hex chars) |
| Device fingerprint hash | Supabase | ✅ Ja (niet reversible) |
| Email (indien gegeven) | Supabase Auth | ✅ Ja |
| OTS proof | Supabase → IndexedDB sync | ✅ Ja (publieke blockchain data) |

### 3.2 Wat de server NIET heeft

- Geen originele foto bytes
- Geen thumbnail
- Geen raw device fingerprint (alleen hash)
- Geen manier om de hash terug te rekenen naar de foto

### 3.3 Verifieerbaarheid van privacy-claim

| Claim | Verificatie |
|-------|-------------|
| "Geen images naar server" | Network tab inspectie: POST naar `/pages` bevat geen image_url of blob |
| "Thumbnail alleen lokaal" | IndexedDB inspectie: thumbnails aanwezig; Supabase `pages.image_url` is leeg voor v4 marks |
| "Hash is one-way" | SHA-256 is cryptografisch niet-reverseerbaar (standaard eigenschap) |

---

## 4. PWA Lifecycle

### 4.1 Status

| Eigenschap | Status | Technische realiteit |
|------------|--------|---------------------|
| **Service Worker** | ✅ Geïmplementeerd | PWA service worker actief |
| **Offline capability** | ⚠️ Gedeeltelijk | Marks kunnen offline gemaakt worden, queue in IndexedDB |
| **Cache strategie** | ✅ Aanwezig | App shell cached |
| **Installability** | ✅ Volledig | manifest.json + service worker |
| **Web Share Target** | ✅ Gedefinieerd | manifest.json share_target |
| **Background Sync** | 🔄 In ontwikkeling | Queued marks synced when online |

### 4.2 Offline Gedrag

| Actie | Offline mogelijk? | Gedrag |
|-------|-------------------|--------|
| Mark maken | ✅ Ja | Thumbnail → IndexedDB, hash queued |
| Origin Registry bekijken | ✅ Ja | Thumbnails uit IndexedDB |
| ZIP downloaden | ⚠️ Deels | Alleen voor al-gesyncte marks met OTS proof |
| Email verificatie | ❌ Nee | Vereist netwerk |

---

## 5. Authenticatie

### 5.1 Model: Optional Auth, Post-Mark

| Eigenschap | Waarde |
|------------|--------|
| **Type** | Supabase Auth Magic Link (passwordless) |
| **Timing** | Na eerste mark (Release screen), niet ervoor |
| **Vereist voor marks?** | ❌ Nee — anonymous marks toegestaan |
| **Voordeel van auth** | OTS notificatie, email op certificaat, account recovery |

### 5.2 User States

| State | Kan markeren? | Krijgt OTS notificatie? | Certificaat toont |
|-------|---------------|------------------------|-------------------|
| Anonymous | ✅ | ❌ | `creator: [device only]` |
| Email ingevoerd, niet geverifieerd | ✅ | ❌ | `creator: [device only]` |
| Geverifieerd (Magic Link geklikt) | ✅ | ✅ | `creator: m***r@email.com` |

### 5.3 Claim Anonymous Marks

Wanneer een gebruiker email verifieert:

```sql
UPDATE pages 
SET user_id = auth.uid()
WHERE device_user_id = [current_device_id]
AND user_id IS NULL;
```

Alle eerder gemaakte marks op dit device worden gekoppeld aan de geverifieerde identity.

---

## 6. Data & Opslag

### 6.1 Opslaglocaties

| Data | Locatie | Persistentie |
|------|---------|--------------|
| **Thumbnail** | IndexedDB | Lokaal, device-gebonden |
| **Mark metadata** | IndexedDB + Supabase | Dual-write |
| **OTS proof** | Supabase → synced naar IndexedDB | Permanent |
| **User identity** | Supabase Auth | Permanent (indien geverifieerd) |
| **Device identifier** | localStorage (`device_user_id`) | Lokaal |
| **Device fingerprint hash** | Supabase `pages` | Permanent |
| **Witness confirmations** | Supabase `witnesses` | Permanent |

### 6.2 IndexedDB Schema

```typescript
interface LocalMark {
  id: string;                    // UUID
  thumbnail: Blob;               // ~400px JPEG, <50KB
  hash: string;                  // SHA-256 (64 hex)
  originId: string;              // um-XXXXXXXX
  timestamp: Date;
  otsProof: Blob | null;         // .ots file wanneer anchored
  otsStatus: 'pending' | 'anchored';
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  sizeClass: 'small' | 'medium' | 'large';
  syncStatus: 'queued' | 'synced' | 'failed';
  legacyImageUrl?: string;       // Voor pre-v4 migratie
  userNote?: string;
}
```

### 6.3 Supabase `pages` Schema (v4)

| Kolom | Type | Nullable | Nieuw in v4 |
|-------|------|----------|-------------|
| id | UUID | ❌ | |
| device_user_id | UUID | ❌ | |
| user_id | UUID | ✅ | ✅ |
| origin_id | UUID | ✅ | ✅ (v0.7) |
| origin_hash_sha256 | TEXT | ❌ | |
| origin_hash_algo | TEXT | ❌ | |
| device_fingerprint_hash | TEXT | ✅ | ✅ |
| image_url | TEXT | ✅ | Leeg voor v4 marks |
| created_at | TIMESTAMPTZ | ❌ | |
| is_trashed | BOOLEAN | ❌ | |

**`origin_id`:** Teruggeschreven door de `bridge_page_to_core` trigger na INSERT in `origin_attestations`. Geïndexeerd (`idx_pages_origin_id`). Gebruikt door `notify-ots-complete` voor de notificatie-lookup.

### 6.4 Witness Schema (nieuw)

```sql
CREATE TABLE witnesses (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id),
  witness_email TEXT,
  witness_confirmed_at TIMESTAMPTZ,
  confirmation_hash TEXT,
  verification_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,  -- +7 dagen
  ots_status TEXT DEFAULT 'pending',
  ots_proof BYTEA,
  created_at TIMESTAMPTZ
);
```

---

## 7. Capture Flow (Dual-Write)

### 7.1 Sequentie (verkorte 4-stappen flow)

```
S1 Capture:
  [1] User selecteert foto/bestand (file picker)
  [2] AUTO: Client berekent SHA-256 hash (Web Crypto API)
  [3] AUTO: Client genereert thumbnail (~400px, JPEG 70%, <50KB)
  [4] AUTO: Client genereert device fingerprint hash
  [5] Processing state: breathing Origin Mark animatie
  [6] DUAL-WRITE:
      ├── IndexedDB: thumbnail + metadata (syncStatus: 'queued')
      └── Supabase: hash + metadata (GEEN image data)
  [7] Supabase trigger: bridge_page_to_core → origin_attestations

S2 Sealed:
  [8] Receipt screen: "Your origin is ready"
  [9] Artifact preview + museum label + file list
  [10] ZIP download (artifact + certificate.json + VERIFY.txt)

Async (achtergrond):
  [11] OTS worker (1-12h): anchoring in Bitcoin
  [12] OTS complete → HTTP call → Edge Function → Resend notificatie
```

**Verwijderd t.o.v. v0.7:** Handmatige Pause (S2) en Mark/hold-to-mark (S3) stappen. Hashing en DB insert zijn nu volledig geautomatiseerd bij file selectie.

### 7.2 Failure Modes

| Failure point | Resultaat | Data-integriteit |
|---------------|-----------|------------------|
| Stap 2 faalt (thumbnail) | Capture stopt | ✅ Geen orphans |
| Stap 3 faalt (hash) | Capture stopt | ✅ Geen orphans |
| Stap 6a faalt (IndexedDB) | Capture stopt | ✅ Geen orphans |
| Stap 6b faalt (Supabase) | Mark in IndexedDB, queued | ✅ Retry later |
| Stap 7 trigger faalt | Page rollback, mark in IndexedDB | ⚠️ Lokaal orphan, retry |
| Stap 10 faalt (notificatie) | Mark anchored, user niet genotificeerd | ⚠️ User kan handmatig checken |

### 7.3 Orphan Blob Risico: GEËLIMINEERD

In v0.4 bestond het risico van orphan blobs op Hetzner. In v0.6 worden geen images geüpload naar de server — dit risico bestaat niet meer.

---

## 8. OTS Notificatie Systeem

### 8.1 Notificatie Chain

```
OTS Worker (Hetzner) upgrades proof to 'anchored'
  ↓
UPDATE core_ots_proofs SET status = 'anchored', bitcoin_block_height = N
  ↓
Worker HTTP POST → Edge Function: notify-ots-complete
  ↓
Lookup: pages.origin_id → pages.user_id → auth.users.email
  ↓
Resend API → Email: "Your proof is anchored ✓"
```

**Mechanisme:** Directe HTTP call vanuit de OTS Worker (Hetzner) naar de Supabase Edge Function. Er is geen database trigger of webhook — de worker roept de functie aan na een succesvolle upgrade. De call zit in een eigen try/catch; falen heeft geen impact op de proof status.

### 8.2 Notificatie Inhoud

```
Subject: Your proof is anchored ✓

Your mark [ORIGIN 1916F13F] is now permanently 
anchored in Bitcoin block #879,241.

Open Umarise to download your certificate.

[Open App]
```

### 8.3 Voorwaarden voor Notificatie

| Voorwaarde | Vereist? |
|------------|----------|
| OTS proof aanwezig | ✅ |
| user_id niet NULL | ✅ |
| User heeft email (via Supabase Auth) | ✅ |

Gevolg: Anonymous users krijgen geen notificatie maar kunnen wel handmatig hun ZIP downloaden via de Origin Registry.

---

## 9. Certificate Export

### 9.1 Generatie (Client-Side)

| Component | Technologie |
|-----------|-------------|
| Certificate | JSON (immutable snapshot) |
| Verificatie-instructies | VERIFY.txt (menselijk leesbaar) |
| Bundeling | JSZip |
| Levering | Browser download / Web Share API |

### 9.2 certificate.json Schema

```json
{
  "version": "1.0",
  "origin_id": "um-1916F13F",
  "hash": "884d5f17...553df0a3",
  "hash_algo": "SHA-256",
  "captured_at": "2026-02-07T14:25:00Z",
  "claimed_by": null,
  "signature": null,
  "proof_included": false,
  "proof_status": "pending"
}
```

**Wat er NIET in staat:** `status` (dynamisch, via API). Het certificaat bevat alleen onveranderlijke feiten.

### 9.3 Export Bundle (ZIP)

```
umarise-um-1916F13F.zip
├── photo.jpg/png      ← Origineel artifact (indien beschikbaar)
├── certificate.json   ← Immutable metadata snapshot
├── VERIFY.txt         ← Menselijk leesbare verificatie-instructies + link
└── proof.ots          ← OpenTimestamps binary (alleen bij anchored)
```

---

## 10. Device Loss Scenario

### 10.1 Wat verloren gaat

| Element | Lokatie | Bij device loss |
|---------|---------|-----------------|
| Thumbnails | IndexedDB | ❌ Verloren |
| Downloaded certificates | Device filesystem | ❌ Verloren (tenzij gebackupt) |
| device_user_id | localStorage | ❌ Verloren |

### 10.2 Wat behouden blijft (indien email geverifieerd)

| Element | Lokatie | Toegang |
|---------|---------|---------|
| Hash attestaties | Supabase | ✅ Via email login op nieuw device |
| OTS proofs | Supabase | ✅ Downloadbaar |
| Witness confirmaties | Supabase | ✅ Zichtbaar |

### 10.3 Recovery Flow

1. User installeert app op nieuw device
2. User voert email in → Magic Link
3. Marks gekoppeld aan user_id worden getoond
4. Thumbnails tonen als `[device only]` placeholder (hash + date)
5. Certificates kunnen opnieuw gegenereerd worden (zonder thumbnail)

### 10.4 Mitigatie: Backup Nudge

Na de 3e mark verschijnt eenmalig:

> "your memories live in your browser · back them up to keep them safe"

Met "back up now" link → bulk export alle certificaten.

Herhaling bij 10e mark indien niet gebackupt.

---

## 11. Witness Feature

### 11.1 Flow

```
Creator maakt mark
  ↓
Release screen: "Add a witness"
  ↓
Native share sheet: link + instructie
  ↓
Creator stuurt thumbnail apart (WhatsApp/Signal)
  ↓
Witness opent link → ziet origin_id, date, hash (GEEN thumbnail)
  ↓
Witness voert email in → "I confirm I saw this"
  ↓
Witness confirmation anchored separaat
  ↓
Creator's certificate toont witness info
```

### 11.2 Privacy

- Witness ziet GEEN thumbnail via Umarise — alleen metadata
- Creator deelt thumbnail zelf via eigen kanaal
- Umarise server heeft geen thumbnail van creator OF witness

### 11.3 Token Expiry

Witness links verlopen na 7 dagen (`token_expires_at`).

---

## 12. Origin Registry (Dual-Source)

### 12.1 Thumbnail Resolution

```
1. Check IndexedDB voor thumbnail (v4 marks)
   ↓ niet gevonden
2. Check Supabase image_url (legacy pre-v4 marks)
   ↓ niet gevonden
3. Toon origin_id + date (graceful degradation)
```

### 12.2 Mark States

| Status | Visueel | Actie beschikbaar |
|--------|---------|-------------------|
| `pending` | "anchoring..." | Geen download |
| `anchored` | ✓ checkmark | "Download certificate" |

---

## 13. Interface ↔ Core Relatie

### 13.1 Triggers

| Trigger | Wanneer | Actie |
|---------|---------|-------|
| `trigger_bridge_page_to_core` | INSERT op pages | → origin_attestations + schrijft origin_id terug naar pages |
| `trigger_bridge_page_to_core_update` | UPDATE op pages | → origin_attestations (bij hash wijziging) |

**OTS notificatie:** Geen database trigger. De OTS Worker roept `notify-ots-complete` aan via HTTP na succesvolle upgrade. Lookup: `pages.origin_id` → `pages.user_id` → `auth.users.email`.

### 13.2 Twee Schrijfpaden naar origin_attestations

| Pad | Mechanisme | Rate Limiting | Use Case |
|-----|------------|---------------|----------|
| **B2B** | `POST /v1-core-origins` | ✅ Ja | Partners, externe systemen |
| **B2C** | Trigger `bridge_page_to_core` | ❌ Nee | Umarise App gebruikers |

---

## 14. Operationele Invarianten

| Invariant | Status | Afdwinging |
|-----------|--------|------------|
| **Geen images op server (v4)** | ✅ Technisch | image_url leeg, geen upload endpoint |
| **Hash immutabel** | ✅ Technisch, getest | Trigger `trigger_prevent_attestation_update` (geverifieerd 6 feb 2026) |
| **Attestatie immutabel** | ✅ Technisch, getest | Trigger `trigger_prevent_attestation_delete` (geverifieerd 6 feb 2026) |
| **Thumbnail alleen lokaal** | ✅ Technisch | Alleen IndexedDB writes |
| **OTS proof publiek verifieerbaar** | ✅ Technisch | Bitcoin blockchain |
| **origin_id teruggeschreven naar pages** | ✅ Technisch | Bridge trigger schrijft UUID terug na INSERT |

---

## 15. Verifieerbaarheid

| Claim | Type | Verificatie |
|-------|------|-------------|
| "Geen images naar server" | **Verifieerbaar** | Network tab: geen blob in POST |
| "Thumbnail alleen in IndexedDB" | **Verifieerbaar** | DevTools → Application → IndexedDB |
| "Hash client-side berekend" | **Verifieerbaar** | `src/lib/originHash.ts` |
| "OTS notificatie bij completion" | **Verifieerbaar** | Edge Function logs + Resend dashboard |
| "Witness link verloopt na 7 dagen" | **Verifieerbaar** | `witnesses.token_expires_at` check |
| "Anonymous marks mogelijk" | **Verifieerbaar** | `pages.user_id` nullable |
| "Privacy-first architectuur" | **Verifieerbaar** | Combinatie van bovenstaande |

---

## 16. Privacy-by-Design Assessment

### 16.1 Architectuuroverzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Photo     │───▶│  SHA-256    │───▶│     IndexedDB       │ │
│  │  (input)    │    │   Hash      │    │  - thumbnail        │ │
│  └─────────────┘    └──────┬──────┘    │  - hash             │ │
│                            │           │  - ots_proof        │ │
│         TRUST BOUNDARY     │           └─────────────────────┘ │
└────────────────────────────┼───────────────────────────────────┘
                             │ hash only (64 chars)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (EU)                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   pages     │───▶│  trigger    │───▶│ origin_attestations │ │
│  │  (hash)     │    │             │    │                     │ │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘ │
└────────────────────────────────────────────────────┼───────────┘
                                                     │
                             ┌───────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BITCOIN BLOCKCHAIN                           │
│                   (OTS Merkle anchor)                           │
│                   Immutable, public                             │
└─────────────────────────────────────────────────────────────────┘
```

### 16.2 Privacy Principles Assessment

| Principe | Implementatie | Score |
|----------|---------------|-------|
| **1. Proactive not Reactive** | Architectuur ontworpen met privacy als uitgangspunt, niet als afterthought. Geen images op server is een bewuste keuze, niet een optimalisatie. | ✅ Volledig |
| **2. Privacy as Default** | Geen opt-in vereist. Thumbnails blijven lokaal zonder configuratie. Email is optioneel. Anonymous marks toegestaan. | ✅ Volledig |
| **3. Privacy Embedded in Design** | Hash-only architectuur maakt reconstructie van content onmogelijk. Niet een policy, maar een technische eigenschap. | ✅ Volledig |
| **4. Full Functionality** | Volledige bewijskracht zonder privacy-opoffering. OTS-anchoring werkt met hash alleen. Certificate bevat alle bewijslagen. | ✅ Volledig |
| **5. End-to-End Security** | Data protection over hele lifecycle: lokale opslag (IndexedDB), transport (hash only), anchoring (Bitcoin immutability). | ✅ Volledig |
| **6. Visibility and Transparency** | Open architectuur. Verificatie mogelijk via Network tab, IndexedDB inspectie, blockchain lookup. Geen hidden data flows. | ✅ Volledig |
| **7. Respect for User Privacy** | User-centric: content blijft op device, email optioneel, anonymous gebruik mogelijk, backup in eigen handen. | ✅ Volledig |

### 16.3 Data Minimization Matrix

| Data Element | Nodig voor bewijs? | Naar server? | Rationale |
|--------------|-------------------|--------------|-----------|
| Originele foto | ❌ Nee (hash volstaat) | ❌ Nee | Nooit opgeslagen, alleen gehashed |
| Thumbnail | ❌ Nee (visueel gemak) | ❌ Nee | Alleen lokaal voor UX |
| SHA-256 hash | ✅ Ja | ✅ Ja | Minimaal noodzakelijk voor attestatie |
| Timestamp | ✅ Ja | ✅ Ja | Kern van tijdsbewijs |
| Device fingerprint | ⚠️ Optioneel | ✅ Ja (hash) | Versterkt bewijs, niet reverseerbaar |
| Email | ⚠️ Optioneel | ✅ Ja (indien gegeven) | Alleen voor notificatie + identity |
| Witness email | ⚠️ Optioneel | ✅ Ja (indien gegeven) | Alleen voor confirmatie |

**Conclusie:** Alleen cryptografisch noodzakelijke data verlaat het device. Alle visuele content blijft lokaal.

### 16.4 Trust Boundaries

| Boundary | Wat passeert | Wat NIET passeert |
|----------|--------------|-------------------|
| **Device → Network** | 64-char hash, timestamp, device_fingerprint_hash | Foto bytes, thumbnail, origineel bestand |
| **Supabase → Bitcoin** | Merkle root (aggregatie van hashes) | Individuele hashes (in tree), geen metadata |
| **App → Witness** | Origin ID, date, hash | Thumbnail (creator deelt apart) |

### 16.5 Threat Model

| Threat | Mitigatie | Residueel risico |
|--------|-----------|------------------|
| **Server compromise** | Server heeft alleen hashes. Geen reconstructie mogelijk van originele content. | ✅ Laag — metadata exposure (timestamps, hashes) |
| **Database leak** | Hashes zijn publiek verifieerbaar anyway (blockchain). Geen geheime content. | ✅ Laag — email addresses indien opgeslagen |
| **Man-in-the-middle** | HTTPS transport. Hash verificatie mogelijk client-side. | ✅ Laag |
| **Device theft** | IndexedDB accessible. Mitigatie: device encryption (OS-level). | ⚠️ Medium — thumbnails lokaal zichtbaar |
| **Supabase/Anthropic subpoena** | Server heeft geen content, alleen hashes. Onmogelijk om foto te reconstrueren. | ✅ Laag |
| **OTS calendar compromise** | Bitcoin anchor is onafhankelijk van calendar. Proof blijft geldig. | ✅ Laag |

### 16.6 Control Plane vs Truth

**Kernprincipe:** Control plane compromise degrades convenience, not truth.

| Scenario | Impact op gemak | Impact op waarheid |
|----------|-----------------|-------------------|
| Supabase offline | ❌ Geen sync, geen notificaties | ✅ Lokale marks blijven geldig |
| Supabase data verloren | ❌ Wall leeg op server-side | ✅ IndexedDB + blockchain bewijzen bestaan nog |
| Resend offline | ❌ Geen email notificaties | ✅ OTS proof ongewijzigd |
| Umarise failliet | ❌ App werkt niet meer | ✅ Certificates + .ots files blijven verifieerbaar |

**Gebruiker bezit het bewijs.** Het certificaat + .ots bestand is volledig onafhankelijk verifieerbaar zonder Umarise infrastructure.

### 16.7 Vergelijking met Oude Architectuur (v0.4)

| Aspect | v0.4 (oud) | v0.6 (nieuw) | Privacy-impact |
|--------|-----------|--------------|----------------|
| Image opslag | Hetzner (server) | IndexedDB (lokaal) | **+++ Drastisch verbeterd** |
| Server heeft content | ✅ Ja (volledige foto) | ❌ Nee (alleen hash) | **+++ Drastisch verbeterd** |
| Subpoena risico | ⚠️ Server kan foto leveren | ✅ Server heeft geen foto | **+++ Geëlimineerd** |
| Data minimization | ❌ Niet | ✅ Volledig | **+++ Drastisch verbeterd** |
| Orphan blob risico | ⚠️ Ja | ✅ Geëlimineerd | **++ Verbeterd** |

### 16.8 GDPR Alignment

| GDPR Principe | Implementatie |
|---------------|---------------|
| **Lawfulness** | Consent impliciet via app gebruik. Geen data zonder user actie. |
| **Purpose limitation** | Data alleen voor timestamping en bewijs. Geen secundair gebruik. |
| **Data minimization** | Alleen hash + timestamp naar server. Minimum noodzakelijk. |
| **Accuracy** | Hash is mathematisch exact. Geen interpretatie. |
| **Storage limitation** | User controleert lokale data. Server data minimaal. |
| **Integrity & confidentiality** | Hash-only = geen content exposure. |
| **Accountability** | Architectuur verifieerbaar. Geen hidden flows. |

### 16.9 Privacy Assessment Conclusie

| Categorie | Score | Toelichting |
|-----------|-------|-------------|
| **Data minimization** | ✅ Excellent | Alleen cryptografisch noodzakelijke data naar server |
| **User control** | ✅ Excellent | Content blijft op device, user bezit bewijs |
| **Transparency** | ✅ Excellent | Volledig verifieerbaar via browser tools |
| **Security** | ✅ Goed | Hash-only elimineert content exposure risico's |
| **Resilience** | ✅ Goed | Bewijs blijft geldig onafhankelijk van Umarise |

**Overall: Privacy-by-Design compliant.**

De v0.6 architectuur realiseert de claim "sealed on your device · only the proof leaves" op technisch verifieerbare wijze. De server functioneert als een blind attestation service — het ziet hashes maar kan geen content reconstrueren.

---

## 17. Acceptatiecriterium

| Criterium | Status |
|-----------|--------|
| Privacy-claims technisch verifieerbaar | ✅ |
| Privacy-by-Design assessment compleet | ✅ |
| Trust boundaries gedefinieerd | ✅ |
| Threat model gedocumenteerd | ✅ |
| GDPR alignment beschreven | ✅ |
| Dual-write flow gedocumenteerd | ✅ |
| OTS notificatie systeem gedocumenteerd | ✅ |
| Witness feature gedocumenteerd | ✅ |
| Device loss scenario gedocumenteerd | ✅ |
| Certificate export gedocumenteerd | ✅ |
| Auth model gedocumenteerd | ✅ |
| Alle wijzigingen t.o.v. v0.4/v0.5 benoemd | ✅ |

---

**Document classification:** Formele systeemdefinitie + Privacy Assessment  
**Scope:** B2C-laag exclusief  
**Consistent met:** /architecture (10 feb 2026) — verkorte 4-stappen flow (S0–S3)  
**Supersedes:** B2C-Inventarisatie v0.4, v0.5, v0.6, v0.7  
**Geverifieerd tegen database:** 6 februari 2026
