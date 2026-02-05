# Lovable Briefing — Umarise B2C App

**Datum:** 5 februari 2026  
**Type:** Technische briefing na B2C-inventarisatie  
**Status:** Definitief (v1.1)

---

## 1. Context

Na de succesvolle B2B/Core-inventarisatie is de B2C-laag (Umarise App) formeel geïnventariseerd. Dit document beschrijft de bevindingen, de wijziging die al is doorgevoerd, en de openstaande punten.

---

## 2. Kritieke bevinding: App → Core brug ontbrak

### Wat was het probleem

De App berekende een SHA-256 hash client-side en schreef deze naar de `pages` tabel en `page_origin_hashes` sidecar. Maar er was **geen pad naar `origin_attestations`** (Core-laag). Dat betekent: geen formele attestatie, geen OTS-anchoring, geen Bitcoin-verankering. De volledige attestatie-keten was ontkoppeld voor B2C-gebruikers.

### Wat is opgelost

Een PostgreSQL trigger `bridge_page_to_core` die functie `bridge_page_to_core_attestation()` aanroept op de `pages` tabel. Bij elke INSERT met een niet-lege `origin_hash_sha256` wordt automatisch een record aangemaakt in `origin_attestations`.

```
pages INSERT (met hash) → trigger bridge_page_to_core → origin_attestations INSERT → OTS worker (cron, elk uur) → Bitcoin anchoring
```

**Belangrijk:** De trigger draait binnen dezelfde database-transactie als de page insert. Als de trigger faalt, rollbackt ook de page insert. Er kan geen page bestaan zonder bijbehorende attestatie. Dit is een verbetering van de capture-atomiciteit ten opzichte van een apart API-call.

### Duplicate hash gedrag

`ON CONFLICT DO NOTHING` is bewust verwijderd. Er is geen unique constraint op `origin_attestations.hash`. Identieke hashes genereren meerdere attestaties met verschillende timestamps (TSA-style). Dit is correct gedrag: twee captures van dezelfde bytes op verschillende momenten zijn twee aparte attestaties.

### Verificatie

| Test | Resultaat |
|------|-----------|
| Page insert met hash | ✅ Attestatie automatisch aangemaakt |
| OTS worker pikt trigger-records op | ✅ Geverifieerd — worker queryt `origin_attestations` direct |
| Bestaande immutability triggers | ✅ Ongewijzigd — `prevent_attestation_update` en `prevent_attestation_delete` blijven actief |
| Trigger failure → page rollback | ✅ Transactie-gebonden |

---

## 3. Architecturaal gevolg: twee schrijfpaden naar Core

Er bestaan nu twee paden naar `origin_attestations`:

| Pad | Gebruikt door | Rate limiting | API key validatie | Atomiciteit |
|-----|---------------|---------------|-------------------|-------------|
| `POST /v1-core-origins` (API) | B2B partners | ✅ Ja | ✅ Ja | Per request |
| Trigger `bridge_page_to_core` op `pages` | B2C App | ❌ Nee | ❌ Nee (RLS only) | Binnen DB-transactie |

### Bewust geaccepteerd risico

Het trigger-pad heeft geen rate limiting. Misbruik vereist herhaaldelijk inserten van `pages` records, wat:

- Zichtbaar is in de `pages` tabel
- Beperkt wordt door Supabase RLS (vereist valide `device_user_id`)
- Acceptabel is bij huidig volume

**Heroverwegen bij:** significante groei of geautomatiseerde inserts (bot/script scenario's).

---

## 4. RLS-configuratie `pages` tabel

### Huidige policy

```sql
USING (
  (device_user_id IS NOT NULL)
  AND (device_user_id <> ''::text)
  AND (length(device_user_id) >= 36)
)
```

### Analyse

| Risico | Status | Reden |
|--------|--------|-------|
| Lezen andermans pages | ⚠️ Theoretisch mogelijk | Als je een device_user_id kent, kun je querien |
| Muteren andermans pages | ⚠️ Theoretisch mogelijk | Zelfde device_user_id requirement |
| Enumeratie van device_user_ids | ❌ Niet mogelijk | Geen endpoint om UUIDs te listen |

### Geaccepteerd risico

- 128-bit UUID entropy (2^122 effectief) maakt raden onhaalbaar
- Geen authenticatie = geen identiteit op server (privacy-by-design)
- Trade-off: privacy boven server-side ownership validatie

**Geen actie vereist** tenzij het dreigingsmodel verandert.

---

## 5. Overige bevindingen uit inventarisatie

### 5.1 PWA-lifecycle

| Eigenschap | Status |
|------------|--------|
| Service Worker | ❌ Niet geïmplementeerd |
| Offline capability | ❌ Niet beschikbaar |
| Update-mechanisme | ❌ Niet gedefinieerd |
| Web Share Target | ✅ Gedefinieerd in manifest.json, maar vereist SW voor volledige werking |

**Geen actie vereist op dit moment.** Wordt relevant bij native extension migratie.

### 5.2 Capture-atomiciteit

De capture-flow vanuit de App is niet atomair (4 sequentiële stappen). Bekende failure mode:

- Image upload slaagt → database insert faalt → orphan blob op Hetzner
- Geen cleanup-mechanisme geïmplementeerd
- Geaccepteerd risico bij huidig volume

**Verbetering door trigger:** De stap page insert → attestatie is nu wél atomair (transactie-gebonden). Het risico van een page zonder attestatie is geëlimineerd.

### 5.3 Device loss = permanent verlies

`device_user_id` in localStorage is het enige dat een gebruiker aan hun pages koppelt. Device verlies of browser data wissen = onherstelbaar. Dit is een bewuste trade-off, geen bug. Recovery is alleen mogelijk via handmatige export van de device_user_id (dev feature).

---

## 6. Samenvatting acties

| Item | Status | Actie |
|------|--------|-------|
| App → Core brug | ✅ Opgelost | Trigger `bridge_page_to_core` live, geverifieerd |
| Twee schrijfpaden documenteren | ✅ Dit document | Opnemen in Core Inventarisatie bij volgende update |
| Rate limiting trigger-pad | ⏳ Bewaken | Heroverwegen bij groei |
| RLS versterken | ❌ Geen actie nu | Heroverwegen bij veranderend dreigingsmodel |
| Orphan blob cleanup | ❌ Geen actie nu | Handmatig opruimen indien nodig |
| Service Worker / offline | ❌ Geen actie nu | Pas bij native extension migratie |

---

**Referentiedocumenten:**
- B2C-Inventarisatie v0.3 (formele systeemdefinitie)
- Core Inventarisatie v3
- Database migratie: trigger `bridge_page_to_core` / functie `bridge_page_to_core_attestation()`
