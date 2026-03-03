# Audit: Primitief of Product?
*3 maart 2026 — definitieve versie*

---

## Scorekaart

| Sectie | Max | Score | Status |
|--------|-----|-------|--------|
| A. Core API | 6 | **5 → 6** | ✅ Compleet na publicatie certificate.json v1.3 |
| B. Verificatie | 5 | **4 → 5** | ✅ Pending-ZIP trade-off gedocumenteerd in VERIFY.txt |
| C. Onboarding | 5 | **4** | Sandbox ontbreekt |
| D. Grens bewaking | 6 | **6** | ✓ Zuiver primitief |
| E. Spec en taal | 5 | **2 → 4** | ✅ L1-L4 + certificate.json gepubliceerd op /technical |
| F. Laag 3 en 4 | 4 | **0** | Partner-services, niet-blokkerend |
| **Totaal (A-E)** | **27** | **25** | |

---

## Actielijst

### Blokkerend (voordat partners benaderd worden)

- [x] **Publiceer certificate.json v1.3 veldspecificatie op /technical** (A4 + E3)
- [x] **Publiceer L1-L4 assurance levels op /technical** (E2)
- [x] **Publiceer NIET op anchoring-spec.org** — implementatiedetails, geen spec (E)

### Aanbevolen (versterkt positie)

- [ ] **Bouw sandbox/test-modus voor Core API** (C2)
- [x] **Documenteer pending-ZIP trade-off in VERIFY.txt** (B5) — inclusief unit tests
- [ ] **Verzamel eerste bewijs van terminologie-adoptie bij early users** (E5)

### Niet-blokkerend (partner-services, later)

- [ ] Documenteer attestation.json format publiek (F1)
- [ ] Maak notaris-attestatie onafhankelijk van Umarise endpoint (F2)
- [ ] Schrijf QTSP/QES integratie-blueprint (F3/F4)

---

## Detail per sectie

### A. Core API — 6/6 ✅

| # | Vraag | Score |
|---|-------|-------|
| 1 | Proof bundle conform IEC Section 6? | ✅ |
| 2 | Werkt zonder user login? | ✅ |
| 3 | Deterministische output? | ✅ |
| 4 | Certificate.json publiek gedocumenteerd? | ✅ (gepubliceerd op /technical, 3 maart 2026) |
| 5 | Versienummer + backward compatible? | ✅ |
| 6 | Fout bij ongeldige input, geen state? | ✅ |

### B. Verificatie — 5/5 ✅

| # | Vraag | Score |
|---|-------|-------|
| 1 | Verifieerbaar via OTS CLI zonder Umarise? | ✅ |
| 2 | Webverifier zonder account? | ✅ |
| 3 | Verificatie-instructie publiek? | ✅ |
| 4 | Bitcoin-anchor zichtbaar in block explorer? | ✅ |
| 5 | ZIP bevat alles voor verificatie? | ✅ (trade-off expliciet gedocumenteerd in VERIFY.txt met 3 ophaalopties) |

### C. Onboarding — 4/5

| # | Vraag | Score |
|---|-------|-------|
| 1 | Eerste anchor in < 30 min? | ✅ |
| 2 | Sandbox of testmodus? | ❌ |
| 3 | Voorbeeldcode in 2+ talen? | ✅ |
| 4 | Foutmeldingen begrijpelijk? | ✅ |
| 5 | Referentieverifier als testcase? | ✅ |

### D. Grens bewaking — 6/6 ✅

Alle zes checks geslaagd. Geen documentenlijst, geen verstuur-functie, geen statusdashboard, geen notificaties, geen project-structuur, geen "hier werk je de hele dag"-UI.

### E. Spec en taal — 4/5

| # | Vraag | Score |
|---|-------|-------|
| 1 | anchoring-spec.org live met versie? | ✅ |
| 2 | L1-L4 publiek gedocumenteerd? | ✅ (gepubliceerd op /technical, 3 maart 2026) |
| 3 | Certificate.json v1.3 gedocumenteerd? | ✅ (gepubliceerd op /technical, 3 maart 2026) |
| 4 | npm/Python package? | ✅ |
| 5 | Terminologie-adoptie door externen? | ❌ (nog geen bewijs) |

### F. Laag 3 en 4 — 0/4 (niet-blokkerend)

Partner-services. Geen onderdeel van het primitief. Wordt later opgepakt.

---

## Changelog

| Datum | Actie | Impact |
|-------|-------|--------|
| 3 mrt 2026 | Certificate.json v1.3 + L1-L4 gepubliceerd op /technical | A4 ✅, E2 ✅, E3 ✅ |
| 3 mrt 2026 | Pending-ZIP trade-off gedocumenteerd in VERIFY.txt template | B5 ✅ |
| 3 mrt 2026 | Unit tests voor VERIFY.txt (pending vs anchored) | Kwaliteitsborging |
