---
title: "Milestone Briefing — 2 maart 2026"
date: 2026-03-02
status: canonical
applies_to: verify-anchoring.org, umarise.com/api-referencev2
iec_version: "1.0"
---

# Milestone Briefing — 2 maart 2026

## Wat er vandaag is bereikt

### 1. Hash + OTS Verification Box op verify-anchoring.org

**verify-anchoring.org** heeft nu twee gescheiden verificatiemodi:

| | ZIP Verification (bestaand) | Hash + OTS Verification (nieuw) |
|---|---|---|
| **Doelgroep** | Eindgebruikers met een complete proof ZIP | Developers/partners die via Core API werken |
| **Input** | Origin ZIP (artifact + certificate + .ots) | SHA-256 hash (64 hex chars) + .ots bestand |
| **Label** | Geen (standaard) | "FOR API INTEGRATORS" |
| **Output** | Volledige verificatie incl. artifact match | Hash → Bitcoin ledger verificatie |

**Waarom:** De Core API is hash-only by design (zero-storage, zero-liability). Developers die via de API werken hebben geen ZIP — alleen een hash en een `.ots` proof. Zonder deze box konden zij verify-anchoring.org niet gebruiken voor onafhankelijke verificatie.

**Architectuurkeuze:** Twee gescheiden boxes in plaats van één gecombineerde interface, zodat eindgebruikers niet per ongeluk in de developer-flow terechtkomen.

**Live:** [verify-anchoring.org](https://verify-anchoring.org)

### 2. API Reference v2 Quick Start geconsolideerd

De Quick Start op `/api-referencev2` is geüpdatet naar een 6-stappen flow:

| Stap | Actie | Endpoint |
|---|---|---|
| 0 | Health check | `GET /v1-core-health` |
| 1 | Lokaal hashen | `shasum -a 256 yourfile.pdf` |
| 2 | Anchor hash | `POST /v1-core-origins` |
| 3 | Verify | `POST /v1-core-verify` |
| 4 | Check status | `GET /v1-core-resolve` |
| 5 | Download .ots proof | `GET /v1-core-proof` |

Stap 5 verwijst nu expliciet naar de **Hash + OTS box** op verify-anchoring.org: *"Paste your 64-char hash + upload the .ots file. No ZIP needed."*

### 3. Core vs Companion architectuurverduidelijking

Het fundamentele verschil is gedocumenteerd en besproken:

| | Core API (B2B) | Companion apps (B2C) |
|---|---|---|
| **Input** | Alleen hash | Bestand + hash |
| **Bestand opgeslagen?** | Nee, nooit | Nee, alleen lokaal in browser-RAM |
| **Output** | `origin_id` + `.ots` proof | Volledige ZIP (artifact + certificate + .ots + VERIFY.txt) |
| **ZIP generatie** | Nee — Core ziet geen bytes | Ja — lokaal op device |
| **Verificatie** | verify-anchoring.org → Hash + OTS box | verify-anchoring.org → ZIP box |

**Kernprincipe:** Core ziet je bestand nooit — alleen de hash. Het *kan* geen ZIP maken met het origineel, want het heeft het origineel niet. Dat is by design (zero-storage, zero-liability). De ZIP is een Companion-feature.

### 4. Pro.pdf live getest via Core API

Een live end-to-end test is uitgevoerd via Terminal:

```
shasum -a 256 Pro.pdf
→ a3dccbd78865422db16db34fe0e47625b725a52e198f37867d0643ee3096a66e

curl -X POST .../v1-core-origins \
  -H "X-API-Key: um_..." \
  -d '{"hash":"sha256:a3dc...","short_token":"9377D98B"}'
→ 201 Created, origin_id: 352eddba-a6be-4880-83c7-a0c22de39614

curl .../v1-core-resolve?origin_id=352eddba-...
→ proof_status: "pending" (wacht op Bitcoin block)
```

Status: anchoring in progress. Verwachte voltooiing: ~2 uur na registratie.

## Technische details

- **verify-anchoring.org wijziging:** `index.html` — CSS voor dev box + HTML sectie + JavaScript logica voor hash+OTS verificatie
- **Geen nieuwe dependencies:** Gebruikt dezelfde gebundelde OpenTimestamps library (v0.4.9) als de ZIP-verificatie
- **Zero-tracking:** Geen analytics, geen trackers, geen backend — conform de independence constraint
- **API Reference update:** `src/pages/ApiReferenceV2.tsx` — stap 5 verwijst naar Hash + OTS box

## Architectuur-context

De verificatie-infrastructuur volgt nu een **dual-input model** op verify-anchoring.org:

```
verify-anchoring.org
  ├── ZIP Box (eindgebruikers)
  │   └── Upload origin ZIP → artifact hash + certificate + OTS → Bitcoin verificatie
  └── Hash + OTS Box (API integrators)
      └── Paste hash + upload .ots → Bitcoin verificatie
```

Beide paden eindigen bij dezelfde waarheid: **V(B, P, L) → {valid | invalid | unverifiable}**

---

*Milestone documentatie — 2 maart 2026.*
