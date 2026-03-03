---
title: "Verification Flows"
date: 2026-03-03
version: "2.0"
status: canonical
supersedes: docs/verification-flows.md
applies_to: itexisted.app, verify-anchoring.org, CLI scripts
iec_version: "1.0"
---

# Verification Flows

Drie verificatietracks, drie doelgroepen, één waarheid.

---

## Principe

Verificatie bewijst altijd dezelfde stelling:

> **Deze bytes bestonden no later than Bitcoin block T.**

Het verschil tussen de tracks is de route naar dat bewijs en de mate van onafhankelijkheid van Umarise-infrastructuur.

---

## Track A — In-app verificatie

**itexisted.app** (convenience verifier)

Gebruiker uploadt een proof-ZIP op de Proof Page. Doel: bevestigen dat deze ZIP bij een geregistreerd record hoort en geanchord is.

### Flow

```
ZIP openen
  ↓
certificate.json uitlezen
  ↓
origin_id → v1-core-resolve                ← registry lookup
  ↓
SHA-256 hash vergelijken                    ← record-check
  ↓
Bitcoin anchor status ophalen               ← bestaans-check
  ↓
Artifact hash-check (Triple-Gate)           ← integriteits-check
  ↓
✓ VERIFIED  of  · PENDING  of  ✗ ERROR
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Record-check | Hoort deze ZIP bij een geregistreerd record? | origin_id uit certificate → registry lookup |
| Bestaans-check | Is deze hash verankerd in Bitcoin? | core_ots_proofs status via Core API |
| Integriteits-check | Is het lokale artifact ongewijzigd? | SHA-256 van artifact vs certificate hash (Triple-Gate) |

### Wat NIET wordt gecheckt

- Eigenaarschap — dat is Laag 2 (passkey device binding), niet deze flow
- De inhoud van het bestand — content-agnostic by design

### Afhankelijkheid

**Vereist Umarise registry (online).** Als Umarise offline gaat, werkt deze flow niet. Gebruikers worden doorverwezen naar Track B of Track C voor onafhankelijke verificatie.

---

## Track B — Referentie Verifier

**verify-anchoring.org** (independent reference verifier)

100% client-side, zero-API, zero-CDN verificatie conform de Anchoring Specification (IEC v1.0, Section 9: Independence Requirement).

Twee input-modi op dezelfde pagina:

### B1: ZIP Verifier (eindgebruikers)

```
ZIP uploaden in browser
  ↓
certificate.json uitlezen
  ↓
Artifact localiseren (indien aanwezig)
  ↓
SHA-256 van artifact berekenen              ← integriteits-check
  ↓
Vergelijken met hash uit certificate.json   ← artifact-authenticiteit
  ↓
.ots proof verifiëren tegen Bitcoin         ← bestaans-check (lokale OTS library)
  ↓
Output:
  ✓ Valid — ledger-confirmed
  · Artifact mismatch — ledger confirmed
  · Ledger confirmed (geen artifact)
  ✗ Invalid
```

### B2: Hash + OTS Verifier (API-integrators)

Voor partners die de Core API direct gebruiken en een SHA-256 hash + .ots proof file hebben, maar geen ZIP.

```
SHA-256 hash plakken in invoerveld
  ↓
.ots proof file uploaden
  ↓
Hash normaliseren (sha256: prefix / raw shasum)
  ↓
.ots proof verifiëren tegen Bitcoin         ← bestaans-check (lokale OTS library)
  ↓
✓ Ledger-confirmed of ✗ Invalid
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Integriteits-check (B1) | Is dit bestand ongewijzigd? | sha256sum artifact vs certificate.json |
| Bestaans-check (B1+B2) | No later than welk moment bestond deze hash? | .ots proof vs publieke Bitcoin blockchain (lokale OTS library v0.4.9) |

### Wat NIET nodig is

- Toegang tot Umarise (geen API, geen account)
- CLI kennis of installatie
- Alleen een browser

### Afhankelijkheid

**Geen.** Werkt volledig onafhankelijk. Bitcoin block explorers worden alleen gebruikt voor OTS ledger-verificatie. De verifier kan worden geforkt, zelf gehost en geaudit door elke partij.

### Technische details

- Repo: `github.com/AnchoringTrust/verify-anchoring` (Unlicense)
- OTS library: opentimestamps v0.4.9, lokaal gebundeld (`vendor/opentimestamps.min.js`)
- JSZip: v3.10.1, lokaal gebundeld (`vendor/jszip.min.js`)
- Hash normalisatie: `normalizeHash()` — accepteert `sha256:` prefix en raw `shasum` terminal output
- Externe netwerk-calls: alleen Bitcoin block explorers

---

## Track C — CLI verificatie (offline / terminal)

Advocaat, auditor of rechter verifieert een proof-ZIP volledig offline. Doel: bewijzen dat het artifact ongewijzigd is en no later than een specifiek moment bestond.

### Tools

- `verify-anchor.sh` (bash, zero-dependency)
- `verify-anchor.py` (Python, zero-dependency)

Beschikbaar op umarise.com/reviewer-package

### Flow

```
ZIP uitpakken
  ↓
artifact.{ext} localiseren
  ↓
SHA-256 van artifact berekenen              ← integriteits-check
  ↓
Vergelijken met hash uit certificate.json   ← artifact-authenticiteit
  ↓
.ots proof verifiëren tegen Bitcoin         ← bestaans-check (ots-cli)
  ↓
✓ Artifact is intact + bestond no later than [Bitcoin block timestamp]
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Integriteits-check | Is dit bestand ongewijzigd? | sha256sum artifact vs certificate.json |
| Artifact-authenticiteit | Welke hash, origin_id, captured_at? | certificate.json in ZIP |
| Bestaans-check | No later than welk moment bestond deze hash? | .ots proof vs publieke Bitcoin blockchain |

### Wat NIET nodig is

- Toegang tot Umarise (geen API, geen account, geen internet voor hash-check)
- Internet alleen nodig voor `ots verify` (Bitcoin blockchain lookup)

### Afhankelijkheid

**Geen.** Werkt volledig onafhankelijk van Umarise-infrastructuur. Dit is het ultieme offline bewijs — juridisch bruikbaar, zelfs als Umarise en verify-anchoring.org niet meer bestaan.

---

## Vergelijking

| | Track A: In-app | Track B1: ZIP Verifier | Track B2: Hash+OTS Verifier | Track C: CLI |
|---|---|---|---|---|
| **Doelgroep** | Gebruiker zelf | Iedereen (browser) | API-integrators (browser) | Derde partij (technisch) |
| **Toegang** | itexisted.app | verify-anchoring.org | verify-anchoring.org | Terminal / command line |
| **Input** | ZIP uploaden | ZIP uploaden | SHA-256 hash + .ots file | ZIP uitpakken |
| **Hash-bron** | Registry lookup (origin_id) | Artifact bytes in ZIP | Handmatig ingevoerd | Artifact bytes in ZIP |
| **Bitcoin-check** | Via Core API | Lokale OTS library | Lokale OTS library | Via ots-cli → blockchain |
| **Artifact integriteit** | Triple-Gate (artifactCache) | SHA-256 hash-check | N.v.t. (geen artifact) | sha256sum |
| **Umarise nodig?** | Ja | Nee | Nee | Nee |
| **Bewijst** | "Record is geregistreerd en geanchord" | "Hash is verankerd no later than [datum]" | "Hash is verankerd no later than [datum]" | "Bestand is ongewijzigd en bestond no later than [datum]" |

---

## Waarom drie tracks?

De in-app flow is een **convenience check** — snel bevestigen dat je ZIP klopt bij het registry.

De referentie verifier is het **onafhankelijke browser-bewijs** — geen installatie, geen CLI-kennis nodig, zero-dependency.

De CLI scripts zijn het **ultieme offline bewijs** — juridisch bruikbaar, zero-dependency, zelfs als Umarise en verify-anchoring.org morgen niet meer bestaan.

Alle drie verifiëren dezelfde waarheid:

> **Deze bytes bestonden no later than dit moment in de Bitcoin blockchain.**

Het verschil is de route. Track A loopt via Umarise. Track B loopt via de browser. Track C loopt rechtstreeks via Bitcoin.

---

## Normatieve referentie

Alle drie tracks implementeren de verificatiefunctie gedefinieerd in:

**anchoring-spec.org** — Anchoring Specification (IEC v1.0) · Public domain · Unlicense

`V(B, P, L) → { valid | invalid | unverifiable }`

> The specification is normative. Implementations are not.

---

## Changelog

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| 1.0 | 27 feb 2026 | Twee-track model (in-app + CLI) |
| 2.0 | 3 mrt 2026 | Drie-track model. verify-anchoring.org als apart track. Correcties: itexisted.app i.p.v. anchoring.app, Triple-Gate artifact check, "no later than" terminologie, Proof Page i.p.v. gallery/MarkDetailModal. |
