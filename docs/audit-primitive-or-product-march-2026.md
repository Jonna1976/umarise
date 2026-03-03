# Audit: Primitief of Product?
*3 maart 2026 — definitieve versie (v2)*

---

## Scorekaart

| Sectie | Max | Score | Status |
|--------|-----|-------|--------|
| A. Core API | 6 | **6** | ✅ Compleet |
| B. Verificatie | 5 | **5** | ✅ Compleet |
| C. Onboarding | 5 | **5** | ✅ Sandbox (dry_run + test key) live |
| D. Grens bewaking | 6 | **6** | ✅ Zuiver primitief |
| E. Spec en taal | 5 | **4** | Terminologie gepubliceerd, adoptie-bewijs volgt |
| F. Laag 3 en 4 | 4 | **4** | attestation.json + script + QTSP blueprint + L4 spec |
| **Totaal (A-E)** | **27** | **26** | |
| **Totaal (A-F)** | **31** | **30** | |

---

## Actielijst

### Blokkerend (voordat partners benaderd worden)

- [x] **Publiceer certificate.json v1.3 veldspecificatie op /technical** (A4 + E3)
- [x] **Publiceer L1-L4 assurance levels op /technical** (E2)
- [x] **Publiceer NIET op anchoring-spec.org** — implementatiedetails, geen spec (E)

### Aanbevolen (versterkt positie)

- [x] **Bouw sandbox/test-modus voor Core API** (C2) — dry_run + um_test_ keys live
- [x] **Documenteer pending-ZIP trade-off in VERIFY.txt** (B5) — inclusief unit tests
- [x] **Publiceer terminologie op /technical** (E5) — 14 canonical definities
- [ ] **Verzamel eerste bewijs van terminologie-adoptie bij early users** (E5)

### Niet-blokkerend (partner-services, later)

- [x] Documenteer attestation.json format publiek (F1) — op /technical
- [x] Maak notaris-attestatie onafhankelijk van Umarise endpoint (F2) — scripts/attest-origin.sh
- [x] Schrijf QTSP/QES integratie-blueprint (F3/F4) — docs/qtsp-integration-blueprint.md

---

## Detail per sectie

### A. Core API — 6/6 ✅

| # | Vraag | Score |
|---|-------|-------|
| 1 | Proof bundle conform IEC Section 6? | ✅ |
| 2 | Werkt zonder user login? | ✅ |
| 3 | Deterministische output? | ✅ |
| 4 | Certificate.json publiek gedocumenteerd? | ✅ |
| 5 | Versienummer + backward compatible? | ✅ |
| 6 | Fout bij ongeldige input, geen state? | ✅ |

### B. Verificatie — 5/5 ✅

| # | Vraag | Score |
|---|-------|-------|
| 1 | Verifieerbaar via OTS CLI zonder Umarise? | ✅ |
| 2 | Webverifier zonder account? | ✅ |
| 3 | Verificatie-instructie publiek? | ✅ |
| 4 | Bitcoin-anchor zichtbaar in block explorer? | ✅ |
| 5 | ZIP bevat alles voor verificatie? | ✅ (trade-off gedocumenteerd) |

### C. Onboarding — 5/5 ✅

| # | Vraag | Score |
|---|-------|-------|
| 1 | Eerste anchor in < 30 min? | ✅ |
| 2 | Sandbox of testmodus? | ✅ (um_test_ key + dry_run=true) |
| 3 | Voorbeeldcode in 2+ talen? | ✅ |
| 4 | Foutmeldingen begrijpelijk? | ✅ |
| 5 | Referentieverifier als testcase? | ✅ |

### D. Grens bewaking — 6/6 ✅

Alle zes checks geslaagd.

### E. Spec en taal — 4/5

| # | Vraag | Score |
|---|-------|-------|
| 1 | anchoring-spec.org live met versie? | ✅ |
| 2 | L1-L4 publiek gedocumenteerd? | ✅ |
| 3 | Certificate.json v1.3 gedocumenteerd? | ✅ |
| 4 | npm/Python package? | ✅ |
| 5 | Terminologie-adoptie door externen? | ❌ (gepubliceerd, bewijs volgt) |

### F. Laag 3 en 4 — 4/4 ✅

| # | Vraag | Score |
|---|-------|-------|
| 1 | attestation.json format publiek? | ✅ |
| 2 | Notaris-attestatie onafhankelijk? | ✅ (scripts/attest-origin.sh) |
| 3 | QTSP blueprint? | ✅ (docs/qtsp-integration-blueprint.md) |
| 4 | QES als open spec? | ✅ (L4 sectie in blueprint) |

---

## Changelog

| Datum | Actie | Impact |
|-------|-------|--------|
| 3 mrt 2026 | Certificate.json v1.3 + L1-L4 gepubliceerd op /technical | A4 ✅, E2 ✅, E3 ✅ |
| 3 mrt 2026 | Pending-ZIP trade-off gedocumenteerd in VERIFY.txt template | B5 ✅ |
| 3 mrt 2026 | Unit tests voor VERIFY.txt (pending vs anchored) | Kwaliteitsborging |
| 3 mrt 2026 | Sandbox: dry_run + um_test_ keys live op /v1-core-origins | C2 ✅ |
| 3 mrt 2026 | Terminologie (14 definities) gepubliceerd op /technical | E5 gedeeltelijk |
| 3 mrt 2026 | attestation.json v1.0 veldspecificatie op /technical | F1 ✅ |
| 3 mrt 2026 | scripts/attest-origin.sh: onafhankelijk attestatie-script (keygen/attest/verify) | F2 ✅ |
| 3 mrt 2026 | QTSP Integration Blueprint: XAdES/PAdES embedding protocol + L4 spec | F3 ✅, F4 ✅ |
