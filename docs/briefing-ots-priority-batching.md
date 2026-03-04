# Lovable Briefing · Priority OTS Batching
*Certified tier technische configuratie*
*Maart 2026*

---

## Wat dit is

Een configuratiewijziging — geen nieuw systeem.

Certified tier partners krijgen priority OTS batching: hun anchors worden in een vroegere Merkle-batch opgenomen dan Standard anchors, wat resulteert in een kortere wachttijd tot Bitcoin-confirmatie.

---

## Huidig gedrag (Standard)

Alle anchors gaan in de volgende beschikbare OTS batch.
Wachttijd tot Bitcoin-confirmatie: typisch 1-6 uur afhankelijk van batch timing en Bitcoin block time.

---

## Gewenst gedrag (Certified)

Certified anchors gaan in een hogere-prioriteit batch die vaker wordt ingediend bij de OTS calendar servers.

**Implementatie-opties (kies één):**

**Optie A — Aparte OTS queue per tier**
- `core_rate_limits` tabel uitbreiden met `tier` kolom (`standard` / `certified`)
- OTS worker checkt tier bij batch samenstelling
- Certified anchors gaan in batch die elke 15 min wordt ingediend (vs. elke 60 min voor Standard)

**Optie B — Priority flag per anchor**
- `core_anchors` tabel uitbreiden met `priority` boolean
- OTS worker verwerkt `priority = true` anchors eerst bij elke batchrun
- Eenvoudiger dan aparte queue

**Aanbeveling: Optie B** — minimale wijziging, zelfde worker, geen nieuwe infra.

---

## Wat er NIET verandert

- Het proof formaat is identiek — zelfde ZIP, zelfde certificate.json, zelfde .ots
- De API contract is identiek — zelfde endpoint, zelfde SDK call
- Verificatie werkt identiek — geen Umarise dependency
- Standard tier blijft werken zoals nu

---

## Hoe de tier wordt bepaald

De API key heeft een tier-attribuut in de `core_api_keys` tabel.
Bij aanroep: check `key.tier`, zet `priority` flag op anchor record.

Geen nieuwe endpoints. Geen UI. Geen portal.

---

## Acceptatiecriteria

- [ ] Certified anchor wordt binnen 15 minuten opgenomen in OTS batch
- [ ] Standard anchor gedrag is ongewijzigd
- [ ] Proof formaat is identiek voor beide tiers
- [ ] `GET /v1-core-usage` toont tier per key (als dit endpoint gebouwd wordt)
- [ ] Geen nieuwe tabellen, geen nieuwe endpoints buiten bovenstaande

---

## Doctrine check

Workflow of plumbing? **Plumbing.**
Hetzelfde primitief, snellere verwerking. Geen features, geen UI, geen semantiek.

---

*Internal briefing — do not distribute*
