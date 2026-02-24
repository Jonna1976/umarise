# Verification Flows

Twee verificatieflows, twee doelgroepen, één waarheid.

---

## 1. In-app verificatie (anchoring.app)

Gebruiker uploadt een proof-ZIP in de gallery (MarkDetailModal).
Doel: bevestigen dat deze ZIP bij dit record hoort en geanchord is.

### Flow

```
ZIP openen
  ↓
certificate.json uitlezen
  ↓
SHA-256 hash uit certificate
  ↓
Hash vergelijken met huidige mark          ← eigenaarschap-check
  ↓
Hash opzoeken in registry                  ← bestaans-check
  ↓
Bitcoin anchor status                      ← tijdsbewijs-check
  ↓
✓ VERIFIED  of  ! PENDING  of  ✗ ERROR
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Hash match | Hoort deze ZIP bij dit record? | Lokale mark hash vs certificate hash |
| Registry lookup | Bestaat deze hash in het registry? | Umarise registry (origin_attestations) |
| Bitcoin anchor | Is dit verankerd in de blockchain? | core_ots_proofs status |

### Wat NIET wordt gecheckt

- Of het artifact in de ZIP byte-voor-byte intact is (dat is de verantwoordelijkheid van de externe flow)
- De inhoud van het bestand zelf (content-agnostic by design)

### Afhankelijkheid

Vereist Umarise registry (online). Als Umarise offline gaat, werkt deze flow niet.

---

## 2. Externe verificatie (reviewer / derde partij)

Advocaat, auditor of rechter ontvangt een proof-ZIP en verifieert onafhankelijk.
Doel: bewijzen dat het artifact ongewijzigd is en op een specifiek moment bestond.

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
Vergelijken met hash uit certificate.json  ← artifact-authenticiteit
  ↓
.ots proof verifiëren tegen Bitcoin        ← tijdsbewijs-check (onafhankelijk)
  ↓
✓ Artifact is intact + bestond op [datum]
```

### Wat wordt bewezen

| Stap | Vraag | Bron |
|------|-------|------|
| Artifact hash | Is dit bestand ongewijzigd? | sha256sum artifact vs certificate.json |
| Certificate | Welke hash, origin_id, captured_at? | certificate.json in ZIP |
| Bitcoin anchor | Wanneer bestond deze hash? | .ots proof vs publieke Bitcoin blockchain |

### Wat NIET nodig is

- Toegang tot Umarise (geen API, geen account, geen internet voor hash-check)
- Internet alleen nodig voor `ots verify` (Bitcoin blockchain lookup)

### Afhankelijkheid

**Geen.** Werkt volledig onafhankelijk van Umarise-infrastructuur.
Dit is het kernprincipe van verification independence.

---

## Vergelijking

| | In-app (anchoring.app) | Extern (reviewer) |
|---|---|---|
| **Doelgroep** | Gebruiker zelf | Derde partij |
| **Toegang** | Gallery → drop ZIP | Terminal / command line |
| **Hash-bron** | Lokale mark + registry | Artifact bytes in ZIP |
| **Bitcoin-check** | Via registry (core_ots_proofs) | Via .ots bestand + blockchain |
| **Umarise nodig?** | Ja (registry lookup) | Nee (zero-dependency) |
| **Bewijst** | "Dit record is geregistreerd en geanchord" | "Dit bestand is ongewijzigd en bestond op [datum]" |

---

## Waarom twee flows?

De in-app flow is een **convenience check** — snel bevestigen dat je ZIP klopt.

De externe flow is het **juridische bewijs** — onafhankelijk verifieerbaar,
zelfs als Umarise morgen niet meer bestaat.

Beide flows verifiëren uiteindelijk dezelfde waarheid:
**deze bytes bestonden op dit moment.**

Het verschil is de route ernaartoe.
