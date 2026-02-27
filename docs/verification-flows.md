# Verification Flows

Drie verificatietracks, drie doelgroepen, één waarheid.

---

## 1. In-app verificatie (anchoring.app / itexisted.app)

Gebruiker uploadt een proof-ZIP in de gallery (MarkDetailModal / Proof Page).
Doel: bevestigen dat deze ZIP bij dit record hoort en geanchord is in Bitcoin.

### Flow

```
ZIP openen
  ↓
certificate.json uitlezen
  ↓
SHA-256 hash uit certificate
  ↓
Hash vergelijken met huidige mark          ← record-check
  ↓
Hash opzoeken in registry                  ← registry-check
  ↓
Bitcoin anchor status ophalen              ← bestaans-check
  ↓
✓ VERIFIED  of  · PENDING  of  ✗ ERROR
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Record-check | Hoort deze ZIP bij dit record? | Lokale mark hash vs certificate hash |
| Registry-check | Is deze hash geregistreerd in het registry? | Umarise registry (origin_attestations) |
| Bestaans-check | Is deze hash verankerd in Bitcoin? | core_ots_proofs status |

### Wat NIET wordt gecheckt

- Of het artifact in de ZIP byte-voor-byte intact is — dat is de verantwoordelijkheid van de externe flows
- De inhoud van het bestand zelf — content-agnostic by design
- Eigenaarschap — dat is Laag 2 (passkey binding), niet deze flow

### Afhankelijkheid

Vereist Umarise registry (online). Als Umarise offline gaat werkt deze flow niet.

---

## 2. Referentie Verifier (verify-anchoring.org)

Onafhankelijke, 100% client-side verificatie conform de Anchoring Specification (IEC v1.0).
Doel: bewijzen dat een hash verankerd is in Bitcoin, zonder enige afhankelijkheid van Umarise.

### Flow

```
ZIP uploaden in browser
  ↓
certificate.json uitlezen
  ↓
Artifact localiseren (indien aanwezig)
  ↓
SHA-256 van artifact berekenen             ← integriteits-check (optioneel)
  ↓
Vergelijken met hash uit certificate.json  ← artifact-authenticiteits-check
  ↓
.ots proof verifiëren tegen Bitcoin        ← bestaans-check (onafhankelijk)
  ↓
✓ Valid — ledger-confirmed
  of  Artifact mismatch — ledger confirmed
  of  Ledger confirmed (geen artifact)
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Integriteits-check | Is dit bestand ongewijzigd? | sha256sum artifact vs certificate.json |
| Bestaans-check | No later than welk moment bestond deze hash? | .ots proof vs publieke Bitcoin blockchain |

### Wat NIET nodig is

- Toegang tot Umarise — geen API, geen account, geen Umarise-infrastructuur
- Geen externe CDN — JSZip en OpenTimestamps lokaal gebundeld (vendor/)

### Afhankelijkheid

**Geen.** Werkt volledig onafhankelijk. Alleen Bitcoin blockchain lookup voor OTS-verificatie.

---

## 3. CLI verificatie (offline / terminal)

Advocaat, auditor of rechter verifieert een proof-ZIP volledig offline.
Doel: bewijzen dat het artifact ongewijzigd is en no later than een specifiek moment bestond.

### Tools

- `verify-anchor.sh` (bash, zero-dependency)
- `verify-anchor.py` (Python, zero-dependency)
- Beschikbaar op umarise.com/reviewer

### Flow

```
ZIP uitpakken
  ↓
artifact.{ext} localiseren
  ↓
SHA-256 van artifact berekenen             ← integriteits-check
  ↓
Vergelijken met hash uit certificate.json  ← artifact-authenticiteits-check
  ↓
.ots proof verifiëren tegen Bitcoin        ← bestaans-check (onafhankelijk)
  ↓
✓ Artifact is intact + bestond no later than [Bitcoin block timestamp]
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Integriteits-check | Is dit bestand ongewijzigd? | sha256sum artifact vs certificate.json |
| Artifact-authenticiteits-check | Welke hash, origin_id, captured_at? | certificate.json in ZIP |
| Bestaans-check | No later than welk moment bestond deze hash? | .ots proof vs publieke Bitcoin blockchain |

### Wat NIET nodig is

- Toegang tot Umarise — geen API, geen account, geen Umarise-infrastructuur
- Internet alleen nodig voor `ots verify` (Bitcoin blockchain lookup)

### Afhankelijkheid

**Geen.** Werkt volledig onafhankelijk van Umarise-infrastructuur.

Dit is het kernprincipe van verification independence: het bewijs overleeft Umarise als bedrijf.

---

## Vergelijking

| | In-app (anchoring.app) | Referentie Verifier (verify-anchoring.org) | CLI (terminal) |
|---|---|---|---|
| **Doelgroep** | Gebruiker zelf | Iedereen (browser) | Derde partij (technisch) |
| **Toegang** | Gallery, ZIP uploaden | Website, ZIP uploaden | Terminal / command line |
| **Hash-bron** | Lokale mark + registry | Artifact bytes in ZIP | Artifact bytes in ZIP |
| **Bitcoin-check** | Via registry (core_ots_proofs) | Lokale OTS library | Via `ots verify` CLI |
| **Umarise nodig?** | Ja (registry lookup) | Nee (zero-dependency) | Nee (zero-dependency) |
| **Bewijst** | "Deze ZIP hoort bij dit geregistreerde en geanchorde record" | "Deze hash is verankerd in Bitcoin no later than [datum]" | "Dit bestand is ongewijzigd en bestond no later than [datum]" |

---

## Waarom drie tracks?

De in-app flow is een **convenience check** — snel bevestigen dat je ZIP klopt bij dit record.

De referentie verifier is het **onafhankelijke browser-bewijs** — geen installatie, geen CLI kennis nodig.

De CLI scripts zijn het **ultieme offline bewijs** — juridisch bruikbaar, zero-dependency, zelfs als Umarise en verify-anchoring.org morgen niet meer bestaan.

Alle drie verifiëren uiteindelijk dezelfde waarheid:

**Deze bytes bestonden no later than dit moment in de Bitcoin blockchain.**

Het verschil is de route. De in-app flow loopt via Umarise. De referentie verifier loopt via de browser. De CLI loopt rechtstreeks via Bitcoin.

---

*Verification Flows documentatie — 27 februari 2026.*
