# Bulk Anchoring Workflow — Map → Bitcoin

**Van een map met bestanden naar cryptografisch bewijs op de Bitcoin-blockchain.**

> Dit document beschrijft de volledige end-to-end workflow voor het verankeren van een map met bestanden (foto's, video's, documenten, badges) via de Umarise Core API. Elke stap is gedocumenteerd met exacte commando's.

---

## Overzicht

```
Lokale map          →  SHA-256 hashing  →  Core API  →  Bitcoin (OTS)
(foto's/badges)        (op jouw device)     (registry)   (~24 uur)
```

**Kernprincipe:** Originele bestanden verlaten je device nooit. Alleen de SHA-256 hash wordt naar de API gestuurd. Zero-storage, zero-liability.

---

## Vereisten

| Wat | Waarom |
|-----|--------|
| macOS/Linux terminal | Scripts draaien in bash |
| `curl` | API-communicatie (standaard geïnstalleerd) |
| `shasum` | SHA-256 hashing (standaard op macOS) |
| Umarise API key | Begint met `um_` — aanvragen via partners@umarise.com |

---

## Stap 1: API Key instellen

```bash
export CORE_API_KEY=um_JOUW_API_KEY_HIER
```

Controleer:
```bash
echo $CORE_API_KEY
# Moet beginnen met um_ zonder aanhalingstekens
```

---

## Stap 2: Map verankeren

Gebruik het `anchor-dir.sh` script om alle bestanden in een map te verankeren:

```bash
./scripts/anchor-dir.sh "/pad/naar/jouw/map"
```

**Voorbeeld:**
```bash
./scripts/anchor-dir.sh "/Users/Jonna/Desktop/fotos"
```

**Wat gebeurt er per bestand:**
1. SHA-256 hash wordt lokaal berekend
2. Hash wordt naar `POST /v1-core-origins` gestuurd
3. API retourneert een uniek `origin_id` en `captured_at` tijdstempel
4. Resultaat wordt opgeslagen in `anchored-results.csv`

**Verwachte output:**
```
→ Anchoring 51 files from: /Users/Jonna/Desktop/fotos
  ✓ [1/51] IMG_0002.HEIC → d42175a6-2aae-4318-b7a1-86563f69a3ca
  ✓ [2/51] IMG_0003.HEIC → 7fb314ee-4fca-4d8d-8e21-0dd871b55e4c
  ...
  Done: 51 anchored, 0 errors
  CSV: /Users/Jonna/Desktop/fotos/anchored-results.csv
```

**Snelheid:** ~100 bestanden per minuut (standard tier). 10.000 bestanden ≈ 100 minuten.

---

## Stap 3: Wachten op Bitcoin-verankering

Alle verankerde bestanden starten met `proof_status: pending`. De Bitcoin-ankers worden automatisch door de OTS-worker verwerkt (doorgaans binnen 24 uur). **Pas wanneer de status `anchored` is, zijn de .ots bewijsbestanden beschikbaar voor download en onafhankelijke verificatie.**

Controleer de status van alle bestanden in één keer:

```bash
./scripts/check-status.sh "/pad/naar/anchored-results.csv"
```

**Verwachte output (direct na anchoring):**
```
→ Checking status from: anchored-results.csv
IMG_0002.HEIC → pending
IMG_0003.HEIC → pending
...
```

**Na ~24 uur:**
```
IMG_0002.HEIC → anchored
IMG_0003.HEIC → anchored
...
```

---

## Stap 4: Proof downloaden

Zodra de status `anchored` is, kun je het `.ots` bewijsbestand downloaden:

**Per bestand:**
```bash
curl "https://core.umarise.com/v1-core-proof?origin_id=d42175a6-2aae-4318-b7a1-86563f69a3ca" \
  -H "X-API-Key: $CORE_API_KEY" \
  --output proof-IMG_0002.ots
```

**Bulk download (alle anchored proofs):**
```bash
./scripts/download-proofs.sh "/pad/naar/anchored-results.csv"
```

---

## Stap 5: Onafhankelijk verifiëren

> **Voorwaarde:** Verificatie tegen de Bitcoin-blockchain is pas mogelijk nadat de status `anchored` is (zie Stap 3). Zonder het `.ots` bewijsbestand kan alleen de hash-integriteit worden gecontroleerd, niet het tijdstempel.

De kracht van dit systeem: verificatie vereist **geen Umarise-account of -infrastructuur**.

### Optie A: Via verify-anchoring.org (browser)
1. Ga naar [verify-anchoring.org](https://verify-anchoring.org)
2. Kies **"Hash + OTS Verification"**
3. Plak de SHA-256 hash uit je CSV
4. Drop het `.ots` bestand
5. De verificatie draait 100% lokaal in je browser tegen de Bitcoin-blockchain

### Optie B: Via de resolve API
```bash
curl "https://core.umarise.com/v1-core-resolve?origin_id=JOUW_ORIGIN_ID"
```

### Optie C: Via CLI (offline)
```bash
ots verify proof-IMG_0002.ots
shasum -a 256 IMG_0002.HEIC
# Vergelijk de hash met die in je CSV
```

---

## Wat je hebt na afloop

Per verankerd bestand beschik je over:

| Component | Beschrijving |
|-----------|-------------|
| **Origineel bestand** | Op jouw device (nooit geüpload) |
| **SHA-256 hash** | Unieke vingerafdruk van het bestand |
| **origin_id** | UUID in de Umarise registry |
| **captured_at** | Cryptografisch vastgelegd tijdstempel |
| **short_token** | 8-karakter lookup code |
| **.ots proof** | Binair OpenTimestamps bewijs verankerd in Bitcoin |
| **CSV overzicht** | Alle resultaten in `anchored-results.csv` |

---

## Wat dit bewijst

✅ **Het bestand bestond op datum X** — onweerlegbaar, verankerd in Bitcoin  
✅ **Het bestand is niet gewijzigd** — elke byte-wijziging geeft een andere hash  
✅ **Verificatie is onafhankelijk** — geen Umarise-account of -server nodig  
✅ **Privacy gewaarborgd** — alleen de hash verlaat je device, nooit het bestand  

---

## Waarom dit interessant is voor bedrijven

| Use case | Voorbeeld |
|----------|-----------|
| **Digitale badges & certificaten** | Verifieer dat een badge op datum X is uitgegeven |
| **Creatief werk** | Bewijs dat een ontwerp bestond vóór publicatie |
| **Juridische documenten** | Tijdstempel op contracten, notulen, aktes |
| **Compliance & audit** | Aantoonbaar bewijs van documentversies |
| **Foto/video bewijs** | Onweerlegbaar bestaan van beeldmateriaal |
| **Onderzoeksdata** | Bewijs van dataset-integriteit op een specifiek moment |

**Integratie-inspanning:** 1-2 uur voor een developer. Geen SDK vereist — alleen `curl` en `sha256`.

---

## Referentie: Scripts

| Script | Functie |
|--------|---------|
| `anchor-dir.sh` | Verankert alle bestanden in een map |
| `check-status.sh` | Controleert de Bitcoin-anker status |
| `download-proofs.sh` | Download alle .ots bewijsbestanden |

---

*Bulk Anchoring Workflow v1.0 — Umarise, maart 2026*
