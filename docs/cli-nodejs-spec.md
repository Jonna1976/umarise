# Lovable Briefing · Node.js CLI — `umarise anchor` + `umarise verify`
*Maart 2026*

---

## Wat dit is

Een CLI wrapper voor de bestaande `@umarise/anchor` Node.js SDK.
Twee commando's. Geen nieuwe backend. Geen nieuwe endpoints.

Het maakt het primitief bruikbaar vanuit de terminal en vanuit CI/CD pipelines.

---

## Huidig gedrag

Developers kunnen anchoren via de SDK:
```js
import { anchor } from '@umarise/anchor'
await anchor({ hash: sha256(file) })
```

Maar er is geen terminal commando. Je kunt niet schrijven:
```
umarise anchor build.tar.gz
```

---

## Gewenst gedrag

**Anchoren:**
```bash
umarise anchor file.bin
```
Output:
```
✓ hash computed: sha256:a1b2c3...
✓ anchored: origin_id abc-123
✓ proof saved: file.bin.proof
```
Resultaat: `file.bin` + `file.bin.proof` naast elkaar.

**Verificatie (offline-first):**
```bash
umarise verify file.bin file.bin.proof
```
Output:
```
✓ hash matches
✓ anchored in Bitcoin block 883421
✓ no later than: 2026-03-04T11:42:00Z
✓ proof valid — independent of Umarise
```

Offline-first: verificatie gebruikt de OTS proof direct tegen Bitcoin.
Online fallback: als OTS calendar niet bereikbaar is, valt terug op `/v1-core-verify`.

---

## Wat er NIET verandert

- Geen nieuwe endpoints
- Geen nieuwe tabellen
- Geen UI
- `@umarise/anchor` SDK is de dependency — CLI is alleen een wrapper
- Proof formaat identiek: `certificate.json` + `proof.ots` in `file.bin.proof`

---

## Implementatie

**Package:** `umarise-cli` — gepubliceerd op npm
**Installatie:** `npm install -g umarise-cli`
**Configuratie:** `UMARISE_API_KEY` environment variable

**Bestandsstructuur:**
```
umarise-cli/
  bin/
    umarise.js          ← entry point
  src/
    commands/
      anchor.js         ← hash berekenen + POST /v1-core-origins + .proof schrijven
      verify.js         ← hash vergelijken + OTS verify offline + fallback online
  package.json
  README.md
```

**anchor.js flow:**
1. Lees bestand
2. Bereken SHA-256 hash (Node crypto, geen externe dependency)
3. POST naar `https://core.umarise.com/v1-core-origins` met `X-API-Key` header
4. Ontvang `origin_id` + `proof.ots`
5. Schrijf `<file>.proof` — ZIP met `certificate.json` + `proof.ots`
6. Print bevestiging

**verify.js flow:**
1. Lees bestand + `.proof` ZIP
2. Bereken SHA-256 hash → vergelijk met `certificate.json`
3. Verifieer `proof.ots` via OTS library (offline)
4. Als offline niet lukt: GET `/v1-core-verify` (online fallback)
5. Print resultaat met block height

---

## Acceptatiecriteria

- [ ] `npm install -g umarise-cli` werkt
- [ ] `umarise anchor file.bin` produceert `file.bin.proof`
- [ ] `umarise verify file.bin file.bin.proof` werkt offline zonder Umarise server
- [ ] `umarise verify` output toont block height, niet alleen timestamp
- [ ] `file.bin.proof` is een geldige ZIP met `certificate.json` + `proof.ots`
- [ ] Foutmelding als `UMARISE_API_KEY` niet is ingesteld
- [ ] README bevat installatie + gebruik in drie regels

---

## Doctrine check

Workflow of plumbing? **Plumbing.**
De CLI voegt geen semantiek toe. Het is een terminal interface op het bestaande primitief.
Geen accounts. Geen dashboard. Geen opslag bij Umarise.

---

## Volgorde

CLI eerst. GitHub Action daarna — die is een wrapper om deze CLI.

*Internal briefing — do not distribute*
