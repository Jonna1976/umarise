# Briefing: umarise.com — Volledige site review, update en uitbreiding

**Voor:** Lovable (Executor)  
**Van:** Umarise  
**Datum:** 5 februari 2026  
**Scope:** Alle pagina's: homepage, /origin, /spec, /core, /privacy, /terms, /why (nieuw) + site-brede keuzes  
**Status:** Klaar voor implementatie na akkoord Umarise  
**Versie:** v2 — bijgewerkt na B2C-inventarisatie (5 feb 2026)

⚠️ **Dit document leest samen met het Addendum Marktcontext v2.** Beide documenten zijn nodig voor implementatie. Dit document bevat correcties en uitbreidingen voor bestaande pagina's. Het addendum voegt de /why pagina toe, een toevoeging aan /origin, een interoperability note op /spec, en interne marktcontext.

⚠️ **Sinds v1 van deze briefing is de B2C-inventarisatie afgerond.** Dit heeft geleid tot de implementatie van een database trigger (`bridge_page_to_core`) die B2C-captures automatisch propageert naar `origin_attestations`. De consequenties voor de site-briefing zijn verwerkt in deze v2 — zie met name sectie 1 (positionering), sectie 9 (/core), en sectie 10 (/privacy).

---

## Context

OTS (OpenTimestamps) is live. Alle attestaties zijn verankerd in Bitcoin block 935037, onafhankelijk verifieerbaar met open-source tooling. De homepage moet dit reflecteren — niet door meer te claimen, maar door preciezer te zijn over wat Umarise nu aantoonbaar doet.

De toon is: infrastructuur die voor zichzelf spreekt. Niet commercieel, niet verkoopgericht. Professioneel, precies, en transparant.

---

## 1. Huidige homepage tekst — factcheck

### Headline
```
Umarise. Origins.
```
**Status:** ✅ Correct. Blijft staan.  
**Toelichting:** "Origins" is de productnaam en plant de categorie. Geen wijziging nodig.

### Tagline
```
Information has a beginning.
Umarise makes that beginning provable.
```
**Status:** ✅ Correct na OTS. Blijft staan.  
**Toelichting:** Vóór OTS was "provable" een gewaagde claim — het bewijs leefde alleen in Umarise's eigen database. Na OTS is het feitelijk: elke attestatie krijgt een `.ots` proof die onafhankelijk verifieerbaar is tegen de Bitcoin-blockchain, zonder Umarise-betrokkenheid. "Provable" is nu wiskundig waar, niet alleen contractueel.

### Positionering
```
Verification is public. Attestation is permissioned.
```
**Status:** ✅ Correct. Blijft staan.  
**Toelichting:** Twee gedocumenteerde feiten in één zin.
- "Verification is public": de endpoints `/v1-core-resolve`, `/v1-core-verify`, en `/v1-core-proof` vereisen geen API key, geen account, geen partnerstatus. Iedereen kan verifiëren.
- "Attestation is permissioned": attestaties aanmaken via de publieke API (`/v1-core-origins`) vereist een API key. Geen key zonder goedkeuring en betaling.

**Context na B2C-inventarisatie:** Er bestaat een tweede schrijfpad naar `origin_attestations` — een database trigger (`bridge_page_to_core`) die B2C-captures automatisch propageert. Dit pad is intern (binnen Supabase, niet via de publieke API) en onzichtbaar voor partners of bezoekers. De homepage-claim "Attestation is permissioned" is correct voor het publieke API-pad en hoeft niet aangepast te worden. Lovable moet weten dat dit tweede pad bestaat om verwarring bij toekomstig onderhoud te voorkomen. Zie: B2C-Inventarisatie v0.4, sectie 9.3.

Dit is architectuur uitgedrukt in taal. Precies goed.

### Footer
```
Origin    Specification    Core
Privacy   Terms
© 2026 Umarise
partners@umarise.com
```
**Status:** ✅ Geen wijziging nodig.

---

## 2. Wat toegevoegd kan worden

Na OTS is er ruimte voor twee kleine toevoegingen die het verificatiemodel benoemen en de categorie planten — zonder technisch jargon, zonder marketing.

### Toevoeging 1 — Eén extra regel onder de positionering

Huidige structuur:
```
Information has a beginning.
Umarise makes that beginning provable.

Verification is public. Attestation is permissioned.
```

Wordt:
```
Information has a beginning.
Umarise makes that beginning provable.

Verification is public. Attestation is permissioned.
Proof is independently verifiable — anchored in Bitcoin.
```

**Waarom deze volgorde:** De zin leidt met wat de partner krijgt (onafhankelijke verifieerbaarheid) en eindigt met het mechanisme (Bitcoin). Een technische beslisser leest door en herkent de kracht. Een niet-technische beslisser stopt na "independently verifiable" en heeft al de juiste boodschap — zonder crypto-associatie als eerste indruk.

**Factcheck:** ✅
- "independently verifiable" — gedocumenteerd: `ots verify` werkt zonder Umarise-account, API key, of enige betrokkenheid van Umarise (Inventarisatie v3, sectie 11 + "Wat de partner krijgt").
- "anchored in Bitcoin" — gedocumenteerd: OTS proofs zijn verankerd in de Bitcoin-blockchain via Merkle tree naar een Bitcoin-transactie (Inventarisatie v3, sectie OTS).

### Toevoeging 2 — "Origin Registry" op de homepage

De term "origin registry" is door Umarise gedefinieerd (Inventarisatie v3, sectie "Definitie: wat is een origin registry?"). De categorie moet zichtbaar zijn op de site — niet als headline, niet als slogan, maar als classificatie. Eén keer, subtiel.

**Optie: als ondertitel of descriptor bij de headline**

```
Umarise. Origins.
A verifiable origin registry.
```

Of als korte descriptor elders op de pagina (bijv. onder de tagline, in een kleiner formaat):

```
Verifiable Origin Registry
```

**Wat het doet:** Het definieert de categorie zonder het uit te leggen. Een CTO die dit leest weet genoeg om door te klikken naar de Specification-pagina. Een partner die het niet kent wordt nieuwsgierig. De term wordt geïntroduceerd, niet verkocht.

**Wat het niet doet:** Het claimt niet dat Umarise de enige origin registry is, of de standaard, of de eerste. Het zegt alleen: dit is wat het is.

**Factcheck:** ✅
- "Verifiable" — het bewijs is onafhankelijk verifieerbaar via OTS, gedocumenteerd.
- "Origin Registry" — eigen definitie, gedocumenteerd in de inventarisatie als: "het register waar het geregistreerde bestaan van data begint."

**Belangrijk voor Lovable:** De exacte plaatsing (subtitle, descriptor, footer-element) is een designkeuze. De tekst is vastgesteld. "Origin Registry" mag maximaal één keer voorkomen op de homepage.

---

## 3. Wat NIET op de homepage mag

Deze punten zijn getoetst aan de Technische Inventarisatie v3 en mogen niet op de website verschijnen:

| Niet doen | Reden |
|-----------|-------|
| Autoriteits- of standaardclaims ("the standard for", "the infrastructure for", "the DNS for") | Umarise wil de infrastructuur-primitief voor origins worden. Dat is de ambitie. Maar autoriteit komt van adoptie, niet van technologie (Inventarisatie v3: "Autoriteit komt van adoptie, niet van afdwinging"). Met nul betalende partners is elke standaardclaim voorbarig. De architectuur en de naam doen het positioneringswerk al — de claim volgt wanneer partners het bevestigen. |
| "Decentralized" | De registratie is gecentraliseerd. Alleen het bewijs is gedecentraliseerd. De inventarisatie waarschuwt expliciet: "Een CTO prikt daar doorheen." |
| "Trustless" | De data-inname vereist vertrouwen in Umarise (tenzij client-side hashing). "Verifiable" is het juiste woord. |
| "First" / "Only" / "Unique" | Core kan niet bewijzen dat het de eerste registratie is van een hash. Andere diensten (OriginStamp, Woleet, OTS direct) kunnen dezelfde hash registreren. |
| Concurrentievergelijkingen | Geen namen van concurrenten op de site. Laat de architectuur spreken. |
| Prijzen op de homepage | Pricing is onderdeel van het partnertraject, niet van de publieke site. |
| Technische details (SHA-256, Merkle tree, block numbers) | De homepage is voor positionering, niet voor specificatie. Technische details horen op de Specification-pagina. |
| "Legal proof" / "Juridisch bewijs" | De juridische status van een OTS proof hangt af van context en jurisdictie. Core levert verifieerbaar bewijs, geen juridisch bewijs. |
| GDPR-claims | GDPR-classificatie vereist juridische beoordeling. Core slaat gehashte IP-adressen op — dat is mogelijk persoonsdata onder GDPR. |
| Marktclaims ("growing market", "explosive growth") | Geen brondata beschikbaar. |

---

## 4. Toon en stijl

**Wat het is:** Infrastructuur. Niet een product dat verkocht wordt, maar een register dat bestaat.

**Referentiekader:** Denk aan hoe Stripe, Cloudflare of Let's Encrypt zich presenteren. Geen verkooppraat. Korte zinnen. Feiten. De technologie is het argument.

**Wat het niet is:**
- Geen startup-landingspagina met hero images en CTAs
- Geen "Join the revolution" of "Be the first"
- Geen testimonials (er zijn nog geen publieke partners)
- Geen urgentie-framing ("limited spots", "founding tier closing soon")

**Taalregels:**
- Engels op de site (consistent met huidige tekst)
- Korte, declaratieve zinnen
- Geen vraagtekens op de homepage
- Geen uitroeptekens
- Geen emoji
- Geen superlatieven

---

## 5. Samenvatting voor Lovable

| Onderdeel | Actie |
|-----------|-------|
| Headline "Umarise. Origins." | Geen wijziging |
| Categorie-descriptor | Toevoegen: "Verifiable Origin Registry" — één keer, subtiel, plaatsing is designkeuze |
| Tagline (2 regels) | Geen wijziging |
| Positionering | Toevoegen: "Proof is independently verifiable — anchored in Bitcoin." als derde regel |
| Footer | Geen wijziging |
| Design/layout | Geen structurele wijziging — de huidige minimalistische opzet past bij de toon |
| Nieuwe pagina's | Zie Addendum Marktcontext v2 — /why pagina + navigatie-update |

---

## 6. Waarom de huidige tekst al sterk is

Ter context voor Lovable — de homepage bevat vijf claims in drie zinnen. Alle vijf zijn nu feitelijk gedekt:

| Claim | Bewijs |
|-------|--------|
| Information has a beginning | Axiomatisch waar |
| Umarise makes that beginning provable | OTS proofs verankerd in Bitcoin, onafhankelijk verifieerbaar. 8/8 anchored, block 935037. |
| Verification is public | Resolve, verify, proof endpoints vereisen geen auth |
| Attestation is permissioned | Attestatie-endpoint vereist API key |
| Proof is independently verifiable | `ots verify` werkt zonder Umarise-betrokkenheid |
| Anchored in Bitcoin | OTS proofs verankerd via Merkle tree in Bitcoin-transacties |
| Verifiable Origin Registry | Eigen categorie-definitie, gedocumenteerd in Inventarisatie v3. "Verifiable" gedekt door OTS. |

Nul woorden op die homepage zijn marketing. Het is architectuur.

---

## 7. Pagina: /origin — Review en correcties

### Status

De /origin one-pager is architecturaal 90% correct. Alle technische claims over hashing, anchoring, immutability, write-once records, en onafhankelijke verificatie zijn gedekt door de Technische Inventarisatie v3.

Drie zinnen moeten worden aangepast.

### Correctie 1 — "evidentiary validity" en "Evidentiary" in tabel

**Huidige tekst (Problem Statement):**
```
This creates a structural gap between operational correctness and evidentiary validity.
```

**Huidige tekst (tabel Internal vs External Evidence):**
```
Internal Records → Operational
Origin Records → Evidentiary
```

**Probleem:** "Evidentiary" impliceert juridische bewijskracht. De Technische Inventarisatie v3 zegt expliciet dat de juridische status van een OTS proof afhangt van context en jurisdictie. Core levert verifieerbaar bewijs, niet juridisch bewijs. "Evidentiary" opent een deur naar juridische discussies die Umarise niet wil en niet kan voeren.

**Wordt:**
```
This creates a structural gap between operational correctness and verifiable validity.
```

**Tabel wordt:**
```
Internal Records → Operational
Origin Records → Verifiable
```

**Toelichting:** "Verifiable" is consistent met de positionering "Verifiable Third Party" en "Verifiable Origin Registry" door alle documenten heen. Het is even sterk en 100% gedekt.

### Correctie 2 — "Umarise is defined as"

**Huidige tekst (Reference):**
```
Umarise is defined as an origin-attestation constraint implementing the properties described in this document.
```

**Probleem:** "Is defined as" klinkt als een externe standaard of formele definitie door een derde partij. Dit is een zelfdefinitie. Een CTO die standaardentaal herkent zal vragen: gedefinieerd door wie?

**Wordt:**
```
Umarise Core is an origin registry implementing the properties described in this document.
```

**Toelichting:** "Implements" is een feitelijke beschrijving. "Origin registry" is consistent met de categorie-definitie in de Inventarisatie v3 en de homepage-toevoeging.

### Correctie 3 — Geen correctie, maar bewuste keuze documenteren

**Betreft: het DNS/CA/TSA-rijtje in de Context-sectie:**
```
DNS externalized naming
Certificate Authorities externalized identity
Time-Stamping Authorities externalized time ordering
Origin attestation externalizes existence at the beginning
```

**Oordeel:** Dit is de sterkste positioneringszin op de hele site. Het plaatst origin attestation in een rijtje met gevestigde infrastructuurstandaarden.

Architecturaal klopt het: Core doet voor existence wat DNS doet voor naming — het externaliseert een fundamentele eigenschap zodat die onafhankelijk verifieerbaar wordt.

Het impliceert wél een status die er nog niet is. DNS, CAs en TSAs zijn geadopteerde standaarden met miljoenen gebruikers. Core heeft nul betalende partners.

**Besluit: laten staan.** De zin positioneert de *categorie* (origin attestation), niet het *bedrijf* (Umarise). Het zegt "origin attestation externalizes existence" — niet "Umarise is the standard for existence." Dat is precies de grens tussen ambitie tonen en iets claimen wat niet waar is. De architectuur verdient deze context.

**Niet wijzigen, niet uitbreiden, niet versterken.** Het rijtje spreekt voor zichzelf.

### Aanvullende noot: "Normative"

Het woord "Normative" wordt gebruikt in titels en secties (RFC/standaardentaal). Het document is geen RFC en geen externe standaard — het is een interne specificatie. Dit is geen fout, maar een bewuste toonkeuze. Een CTO herkent dit als standaardentaal en dat is waarschijnlijk de bedoeling: het signaleert dat Umarise denkt in termen van protocollen, niet van producten. Geen wijziging nodig, maar Lovable moet dit niet omzetten naar marketingtaal.

### Samenvatting /origin wijzigingen voor Lovable

| Wat | Actie |
|-----|-------|
| "evidentiary validity" | Vervang door "verifiable validity" |
| "Evidentiary" in vergelijkingstabel | Vervang door "Verifiable" |
| "Umarise is defined as an origin-attestation constraint..." | Vervang door "Umarise Core is an origin registry implementing..." |
| DNS/CA/TSA context-rijtje | Geen wijziging — bewust laten staan |
| "Normative" in titels | Geen wijziging — bewuste toonkeuze |
| Overige inhoud | Geen wijzigingen — architecturaal correct |

---

## 8. Pagina: /spec — Review, correcties en uitbreiding (Optie A)

### Status

De /spec pagina is feitelijk correct maar doet minder dan de titel belooft. "Specification" impliceert technische details — maar de huidige inhoud is een compactere versie van /origin, zonder nieuwe informatie. Een CTO die doorklikt verwacht te leren *hoe* het werkt, niet alleen *wat* het doet.

De huidige tekst wordt op vijf punten gecorrigeerd en uitgebreid met drie nieuwe secties: Anchoring, Verification, en Trust Model. Alle toevoegingen zijn 1-op-1 gedekt door de Technische Inventarisatie v3.

### Correctie 1 — "reference to the exact bytes"

**Huidige tekst (Definition):**
```
An Origin Record is a write-once, external reference to the exact bytes
of a digital artifact at a specific moment in time.
```

**Probleem:** Core ontvangt niet altijd de bytes. Bij client-side hashing ontvangt Core uitsluitend de hash. En ook bij server-side verwerking slaat Core geen bytes op — alleen de SHA-256 hash. "Reference to the exact bytes" is technisch correct (de hash refereert aan de bytes), maar een CTO kan lezen: "jullie zien de bytes." Dat is niet altijd waar.

**Wordt:**
```
An Origin Record is a write-once, externally anchored attestation that
specific bytes existed at a specific moment in time. The record contains
a cryptographic hash of those bytes — not the bytes themselves.
```

**Factcheck:** ✅
- "write-once" — database-triggers blokkeren UPDATE en DELETE (Inventarisatie v3, sectie 2)
- "externally anchored" — OTS proofs verankerd in Bitcoin (Inventarisatie v3, sectie OTS)
- "cryptographic hash of those bytes — not the bytes themselves" — Core slaat SHA-256 hashes op, geen content (Inventarisatie v3, security checklist: "No content, bytes, or files in Core tables ✅")

### Correctie 2 — "Umarise is only correct where"

**Huidige tekst:**
```
Umarise is only correct where:
```

**Probleem:** "Correct" impliceert dat het systeem fouten maakt buiten die scope. De /origin pagina gebruikt "appropriate." Dat is het juiste woord.

**Wordt:**
```
Umarise is appropriate only where:
```

### Correctie 3 — "Time services externalized ordering"

**Huidige tekst:**
```
Time services externalized ordering
```

**Probleem:** Inconsistent met /origin, waar staat: "Time-Stamping Authorities externalized time ordering." Op een specification-pagina moet de terminologie consistent zijn met de rest van de site.

**Wordt:**
```
Time-Stamping Authorities externalized time ordering
```

### Correctie 4 — "Origin follows the same pattern."

**Huidige tekst:**
```
Origin follows the same pattern.
```

**Probleem:** Vager dan de /origin versie. Op een spec-pagina wil je de precieze formulering.

**Wordt:**
```
Origin attestation externalizes existence at the beginning.
```

**Factcheck:** ✅ — Identiek aan /origin, gedekt door Inventarisatie v3 definitie.

### Correctie 5 — Reference-zin

**Huidige tekst:**
Geen reference-zin op /spec (alleen op /origin).

**Toevoegen (onderaan, vóór Contact):**
```
Umarise Core is an origin registry implementing the properties
described in this document.
```

**Toelichting:** Consistent met de gecorrigeerde versie op /origin. Plaatst "origin registry" ook op de spec-pagina, één keer.

### Toevoeging 1 — Anchoring (nieuwe sectie)

Plaatsing: na "Invariants", vóór "The Law".

```
Anchoring

Origin Records are anchored externally via OpenTimestamps (OTS),
an open-source protocol that creates a cryptographic path from the
attestation hash to a Bitcoin transaction.

The anchoring process:

1. The SHA-256 hash is submitted to independent OTS calendar servers
2. Calendar servers combine thousands of hashes into a Merkle tree
3. The Merkle root is written to a Bitcoin transaction
4. The resulting .ots proof file contains the complete cryptographic
   path from the original hash to the Bitcoin block

The proof is a standard .ots file — an open format, verifiable with
open-source tooling, without Umarise involvement.
```

**Factcheck per zin:**
- "OpenTimestamps (OTS), an open-source protocol" — ✅ (Inventarisatie v3, sectie "Wat is OpenTimestamps")
- "cryptographic path from the attestation hash to a Bitcoin transaction" — ✅ (Inventarisatie v3: "een compact cryptografisch pad van de originele hash, via de Merkle tree, naar de Bitcoin-transactie")
- "SHA-256 hash is submitted to independent OTS calendar servers" — ✅ (Inventarisatie v3: "De hash wordt naar OTS calendar servers gestuurd — onafhankelijke, gratis servers")
- "combine thousands of hashes into a Merkle tree" — ✅ (Inventarisatie v3: "De calendar servers verzamelen duizenden hashes... en combineren ze tot één enkele waarde via een Merkle tree")
- "Merkle root is written to a Bitcoin transaction" — ✅ (Inventarisatie v3: "De calendar server schrijft die ene gecombineerde waarde naar een Bitcoin-transactie")
- ".ots proof file contains the complete cryptographic path" — ✅ (Inventarisatie v3: "een compact cryptografisch pad van de originele hash, via de Merkle tree, naar de Bitcoin-transactie")
- "open format, verifiable with open-source tooling, without Umarise involvement" — ✅ (Inventarisatie v3: "De `.ots` bestanden zijn een open standaard. De verificatie-tool is open source... geen Umarise-relatie vereist")

### Toevoeging 2 — Verification (nieuwe sectie)

Plaatsing: na "Non-Responsibilities", vóór "Correct Usage Boundary".

```
Verification

Verification does not require authentication, an account,
or a relationship with Umarise.

Public endpoints:

  /v1-core-resolve    Look up an Origin Record by ID or hash
  /v1-core-verify     Verify whether a hash has been attested
  /v1-core-proof      Download the .ots proof file

Independent verification:

  curl https://core.umarise.com/v1-core-proof/{origin_id} -o proof.ots
  ots verify proof.ots

The ots verify command checks the cryptographic path from the hash
to the Bitcoin blockchain. It requires no Umarise software, account,
or API key.
```

**Factcheck per element:**
- Drie publieke endpoints, alle drie GET/POST zonder auth — ✅ (Inventarisatie v3, sectie 1: resolve GET Geen, verify POST Geen, proof GET Geen)
- Endpoint namen exact: `/v1-core-resolve`, `/v1-core-verify`, `/v1-core-proof` — ✅ (Inventarisatie v3, sectie 1)
- cURL commando exact: `curl https://core.umarise.com/v1-core-proof/{origin_id} -o proof.ots` — ✅ (Inventarisatie v3, sectie 11 + "Wat de partner krijgt")
- `ots verify proof.ots` — ✅ (Inventarisatie v3, sectie 11)
- "no Umarise software, account, or API key" — ✅ (Inventarisatie v3: "geen Umarise-account nodig, geen API key, geen contact met ons")

**Let op: alleen publieke endpoints tonen.** De interne endpoints (`/v1-internal-metrics`, `/v1-internal-partner-create`) en de attestatie-endpoint (`/v1-core-origins` — vereist API key) worden niet op de spec-pagina getoond. Reden: de spec beschrijft verificatie, niet operatie. Partners die attestaties willen aanmaken krijgen die informatie via de onboarding (Template B: quickstart).

### Toevoeging 3 — Trust Model (nieuwe sectie)

Plaatsing: na "Verification", vóór "Correct Usage Boundary".

```
Trust Model

What is verifiable without trusting Umarise:

  The timestamp. The .ots proof provides a cryptographic path
  to a Bitcoin transaction. Anyone can verify this independently.

What requires trusting Umarise:

  The data intake. Umarise receives data and computes the SHA-256
  hash. The partner trusts that the correct data was hashed.

  Mitigation: partners can compute the hash client-side and submit
  only the hash. In that case, the entire chain is verifiable
  without trusting Umarise.
```

**Factcheck per element:**
- Timestamp verifieerbaar zonder trust — ✅ (Inventarisatie v3, sectie 11: "Wat verifieerbaar is zonder Umarise te vertrouwen: Het tijdstip.")
- Data-inname vereist trust — ✅ (Inventarisatie v3, sectie 11: "Umarise ontvangt de originele data en berekent de SHA-256 hash. De klant vertrouwt dat wij het juiste bestand hashen.")
- Client-side hashing als mitigatie — ✅ (Inventarisatie v3, sectie 11: "De partner berekent de hash zelf en stuurt alleen de hash naar Core. Dan is de gehele keten verifieerbaar zonder Umarise te vertrouwen.")

### Wat NIET op /spec mag

| Niet doen | Reden |
|-----------|-------|
| Database schema of kolomnamen tonen | Interne architectuur, niet voor publieke spec |
| Interne endpoints (`/v1-internal-*`) | Beveiligd, niet publiek |
| Attestatie-endpoint (`/v1-core-origins`) | Vereist API key — hoort bij partner onboarding, niet bij publieke spec |
| Rate limits of tierstructuur | Commerciële informatie, niet voor spec |
| Block numbers of specifieke timestamps | Veranderen over tijd, horen niet in een spec |
| Server-infrastructuur (Hetzner, Supabase) | Operationele details, niet voor publieke spec |
| Prijzen | Niet op de publieke site |

### Samenvatting /spec wijzigingen voor Lovable

| Wat | Actie |
|-----|-------|
| Definition | Herschrijf: "externally anchored attestation... cryptographic hash — not the bytes themselves" |
| "Umarise is only correct where" | Vervang door "Umarise is appropriate only where" |
| "Time services externalized ordering" | Vervang door "Time-Stamping Authorities externalized time ordering" |
| "Origin follows the same pattern" | Vervang door "Origin attestation externalizes existence at the beginning" |
| Reference-zin | Toevoegen: "Umarise Core is an origin registry implementing..." |
| Nieuwe sectie: Anchoring | Toevoegen na Invariants — OTS protocol, Merkle tree, Bitcoin, .ots format |
| Nieuwe sectie: Verification | Toevoegen na Non-Responsibilities — publieke endpoints + `ots verify` voorbeeld |
| Nieuwe sectie: Trust Model | Toevoegen na Verification — wat verifieerbaar is vs wat trust vereist + client-side hashing mitigatie |
| Overige inhoud | Geen wijzigingen |

---

## 9. Pagina: /core — Review, correcties en uitbreiding

### Status

De /core pagina bevat de juiste structuur en het juiste denken, maar heeft drie kritieke fouten en twee ongedocumenteerde claims die vóór publicatie opgelost moeten worden.

### 🔴 Correctie 1 — Endpoint paden zijn fout

**Huidige tekst:**
```
POST /core/origins
GET /core/resolve
POST /core/verify
```

**Feit:** De live endpoints zijn `/v1-core-origins`, `/v1-core-resolve`, `/v1-core-verify`. De paden zonder `v1-` prefix zijn deprecated en retourneren deprecation headers.

**Bron:** Inventarisatie v3, sectie 1 — v1 Endpoints (Production) + Legacy Endpoints (Deprecated)

**Wordt:**
```
POST /v1-core-origins
GET  /v1-core-resolve
POST /v1-core-verify
```

**Ernst:** Kritiek. Een CTO die deze paden aanroept krijgt deprecation headers of onverwacht gedrag. Foutieve paden op een specification-pagina ondermijnt geloofwaardigheid direct.

### 🔴 Correctie 2 — `/v1-core-proof` ontbreekt

**Feit:** Het proof download endpoint bestaat, is live, en is publiek:

```
GET /v1-core-proof/{origin_id}
Output: .ots proof file (binary)
Access: Public (geen auth)
```

**Bron:** Inventarisatie v3, sectie 1: `/v1-core-proof` | GET | Geen | ✅ Live | OTS proof download (.ots bestand)

**Actie:** Toevoegen aan de API Contract sectie:

```
GET /v1-core-proof/{origin_id}
Output: .ots proof file
Access: Public

The .ots file is a standard OpenTimestamps proof — verifiable
with open-source tooling, without Umarise involvement.
```

Dit endpoint maakt het verschil tussen "we zeggen dat het verankerd is" en "download het bewijs en controleer het zelf." Het is het ontbrekende puzzelstuk op deze pagina.

### 🔴 Correctie 3 — Anchoring-mechanisme ontbreekt

**Huidige tekst:** De pagina zegt "Origin Records are externally anchored" zonder uit te leggen hoe.

**Actie:** Twee opties:

**Optie A (minimaal):** Eén zin toevoegen bij Invariants:
```
Origin Records are externally anchored via OpenTimestamps,
an open-source protocol that creates verifiable proofs
anchored in the Bitcoin blockchain.
```

**Optie B (verwijzing):** Verwijzen naar /spec waar het anchoring-mechanisme nu volledig beschreven staat:
```
Origin Records are externally anchored.
See the Origin Record Specification for anchoring details.
```

**Aanbeveling:** Optie A. De /core pagina is het API-contract — een CTO die hier leest wil weten hoe de anchoring werkt, niet doorgestuurd worden. Eén zin is genoeg, de details staan op /spec.

**Factcheck Optie A:** ✅
- "OpenTimestamps" — gedocumenteerd (Inventarisatie v3, complete OTS-sectie)
- "open-source protocol" — gedocumenteerd (Inventarisatie v3: "een open-source protocol")
- "verifiable proofs anchored in the Bitcoin blockchain" — gedocumenteerd (Inventarisatie v3, sectie 11 + OTS-sectie)

### ⚠️ Punt 4 — "Resolution returns the earliest attestation by captured_at"

**Huidige tekst:**
```
Multiple attestations of the same hash are permitted
Resolution returns the earliest attestation by captured_at
This behavior is canonical.
```

**Oordeel:** "Multiple attestations permitted" klopt — er is geen UNIQUE constraint op `hash` in het database schema (Inventarisatie v3, sectie 2). "Returns the earliest by captured_at" staat nergens in de Inventarisatie v3. De resolve-functie wordt beschreven als "Lookup by origin_id or hash" — zonder ordening.

**Dit kan feitelijk kloppen in de code, maar ik kan het niet verifiëren vanuit de brondocumenten.**

**Actie voor Lovable en Umarise:** Verifieer dit tegen de resolve-implementatie (~180 regels). Als het klopt: documenteer het in de inventarisatie en laat het staan. Als het niet klopt of onzeker is: verwijder de claim of herformuleer naar wat verifieerbaar is.

### ⚠️ Punt 5 — "v1 — Stable Interface" / "IMMUTABLE INTERFACE"

**Huidige tekst:**
```
Core v1 is STABLE — IMMUTABLE INTERFACE.
No new fields
No semantic drift
No convenience additions
No breaking changes
Additions require a new version (/core/v2/*).
```

**Oordeel:** API versioning is gedocumenteerd als onderdeel van Fase 1 (Inventarisatie v3, sectie 9). De `/v1-core-*` prefix impliceert versiestabiliteit. Maar het woord "IMMUTABLE INTERFACE" als formeel commitment staat nergens in de Inventarisatie v3.

Dit is een sterke en verstandige belofte — het is precies wat een CTO wil horen. Maar het is een belofte op de publieke site die niet door een intern document gedekt wordt.

**Actie voor Lovable en Umarise:** Als dit jullie commitment is, documenteer het in de inventarisatie (of een apart intern document) zodat het formeel vastligt. Dan is de claim op de site gedekt. Tot die tijd is het een intentie, geen gedocumenteerd feit.

### Correctie 6 — TSA/DNS/CT vergelijking

**Huidige tekst:**
```
API key issuance is an infrastructural action, not a product flow.
Comparable to: TSA key issuance, DNS update rights,
Certificate Transparency log writers.
```

**Oordeel:** Zelfde type positionering als het DNS/CA/TSA-rijtje op /origin en /spec. Het positioneert de categorie, niet het bedrijf. "Not a product flow" is een architecturaal statement dat consistent is met de toon van alle documenten.

**Actie:** Laten staan. Consistent met eerdere beslissingen.

### Correctie 7 — `hash_algo` inconsistentie

**Huidige tekst:** API Contract toont `{ origin_id, hash, hash_algo, captured_at }` als output, maar het Record Contents-blok bovenaan de pagina toont alleen:
```
hash — what existed
timestamp — when it existed
origin_id — a stable external reference
Nothing more.
```

**Feit:** `hash_algo` is wel een veld in het database schema (Inventarisatie v3: `hash_algo varchar 'sha256'`).

**Probleem:** "Nothing more." gevolgd door een API-output die wél `hash_algo` bevat is een inconsistentie op dezelfde pagina.

**Twee opties:**

**Optie A:** Voeg `hash_algo` toe aan Record Contents:
```
hash — what existed
hash_algo — how it was computed
timestamp — when it existed
origin_id — a stable external reference
```

**Optie B:** Houd Record Contents abstract (drie velden) en toon `hash_algo` alleen in de API Contract als implementatiedetail. Verwijder dan "Nothing more." want dat klopt niet met de API-output.

**Aanbeveling:** Optie A. `hash_algo` is een relevant veld — het vertelt de partner welk hash-algoritme is gebruikt. Op een API-contractpagina hoort dit in de record-definitie.

### Samenvatting /core wijzigingen voor Lovable

**Context na B2C-inventarisatie:** De /core pagina beschrijft het publieke API-pad voor attestaties (`POST /v1-core-origins` met API key). Sinds de B2C-inventarisatie bestaat er een tweede schrijfpad: een database trigger die B2C-captures automatisch propageert naar `origin_attestations`. Dit trigger-pad hoeft niet op de /core pagina — het is intern en onzichtbaar voor partners. Maar Lovable moet weten dat de /core pagina het API-pad beschrijft, niet het volledige attestatie-landschap. Wijzigingen aan `origin_attestations` moeten altijd getoetst worden aan beide paden. Zie: B2C-Inventarisatie v0.4, sectie 9.

| Wat | Actie | Status |
|-----|-------|--------|
| Endpoint paden `/core/*` | Vervang door `/v1-core-*` overal | 🔴 Kritiek — fout |
| `/v1-core-proof` endpoint | Toevoegen aan API Contract | 🔴 Kritiek — ontbreekt |
| Anchoring-mechanisme | Toevoegen: OTS + Bitcoin in één zin bij Invariants | 🔴 Kritiek — ontbreekt |
| "Earliest by captured_at" | ⚠️ Lovable en Umarise moeten verifiëren tegen code | Ongedocumenteerd |
| "IMMUTABLE INTERFACE" | ⚠️ Lovable en Umarise moeten formeel vastleggen in intern document | Ongedocumenteerd |
| TSA/DNS/CT vergelijking | Laten staan | ✅ Consistent |
| `hash_algo` in Record Contents | Toevoegen + "Nothing more." verwijderen | Inconsistentie oplossen |

---

## 10. Pagina: /privacy — Review en correcties

### Status

De privacy policy bevat drie feitelijke fouten en vier punten die verduidelijking nodig hebben. De ernstigste fouten betreffen IP-adresverwerking en opslaglocatie — beide hebben juridische consequenties.

### 🔴 Correctie 1 — "IP address logs" staat onder "Data Not Processed"

**Huidige tekst (Data Not Processed):**
```
Umarise does not process or store:
• IP address logs
```

**Feit:** De Inventarisatie v3 zegt het tegenovergestelde:

- `core_request_log` bevat het veld `ip_hash text — SHA-256 of client IP (privacy)` (Inventarisatie v3, sectie `core_request_log`)
- De security checklist bevestigt: "IP addresses hashed before storage ✅" (Inventarisatie v3, sectie 10)
- `core_rate_limits` bevat `rate_key: API key prefix OR ip:<hash>` (Inventarisatie v3, sectie `core_rate_limits`)

IP-adressen worden gehasht vóór opslag. Ze worden niet in plaintext bewaard. Maar ze worden wél verwerkt — hashing is verwerking onder GDPR. Gehashte IP-adressen kunnen onder bepaalde omstandigheden als persoonsdata worden beschouwd.

**Ernst:** 🔴 Kritiek. Een privacy policy die zegt "wij verwerken geen IP-adressen" terwijl je gehashte IP-adressen opslaat is een directe tegenspraak. Dit is een geloofwaardigheidsprobleem voor elke CTO die de code inspecteert, én een juridisch risico.

**Actie:** Verwijder "IP address logs" uit de "Data Not Processed" lijst en voeg een nieuw blok toe onder "Data Processed by Umarise":

```
Operational Data

Data element          Purpose                    Storage
IP address (hashed)   Rate limiting, abuse        Hashed with SHA-256
                      prevention                  before storage.
                                                  Original IP is not
                                                  retained.
API key prefix        Request attribution         First 11 characters
                                                  only. Full key is
                                                  hashed with
                                                  HMAC-SHA256.
Request metadata      Operational monitoring      Endpoint, method,
                                                  status code,
                                                  response time.
```

**Bron:** Inventarisatie v3, secties `core_request_log`, `core_rate_limits`, `partner_api_keys`, security checklist (sectie 10)

### 🔴 Correctie 2 — "names or personal identifiers" staat onder "Data Not Processed"

**Huidige tekst (Data Not Processed):**
```
Umarise does not process or store:
• names or personal identifiers
```

**Feit:** `partner_api_keys` bevat `partner_name text — Partner identifier` (Inventarisatie v3, sectie `partner_api_keys`). In de huidige data: "Summer Corp", "Acme Corp" (Inventarisatie v3, sectie 6).

Dit zijn bedrijfsnamen, geen persoonsnamen. Maar de blanke claim "names" worden niet verwerkt is feitelijk onjuist.

**Actie:** Herformuleer:

```
Umarise does not process or store:
• personal names or individual identifiers
```

En voeg `partner_name` (bedrijfsnaam) toe aan het Operational Data blok hierboven.

**Bron:** Inventarisatie v3, sectie `partner_api_keys` + sectie 6 (Partner Status)

### 🔴 Correctie 3 — Opslaglocatie "Germany (Hetzner)"

**Huidige tekst:**
```
Origin records are stored exclusively in Germany (Hetzner)
and are subject to GDPR and German data protection law.
```

En:
```
All data processing occurs within the European Union.
```

**Feit:** De architectuur is gesplitst:

- **OTS Worker:** draait op Hetzner server `94.130.180.233` — Duitsland ✅ (Inventarisatie v3, sectie 12)
- **Database (Supabase):** `origin_attestations`, `core_ots_proofs`, `partner_api_keys`, `core_request_log` — de Inventarisatie v3 specificeert niet waar de Supabase-instance gehost is. De worker verbindt met Supabase via `SUPABASE_URL` in `.env`
- **OTS calendar servers:** onafhankelijke, wereldwijd gedistribueerde servers (Inventarisatie v3: "onafhankelijke servers die door anderen worden beheerd"). Hashes (64 tekens, geen persoonsdata) worden naar deze servers gestuurd. Er is geen garantie dat deze servers in de EU staan.

**Ernst:** 🔴 Kritiek. "Exclusively in Germany (Hetzner)" voor origin records is alleen waar als Supabase in Duitsland draait. "All data processing occurs within the European Union" is alleen waar als zowel Supabase als OTS calendar servers in de EU staan.

**Actie voor Lovable en Umarise:**

1. Verifieer waar de Supabase-instance gehost is (regio controleren in Supabase dashboard)
2. Als Supabase in de EU draait: specificeer dat in de inventarisatie en update de privacy policy met de juiste formulering
3. Als Supabase buiten de EU draait: de privacy policy moet onmiddellijk gecorrigeerd worden
4. OTS calendar servers: voeg een zin toe die benoemt dat hashes (niet-persoonsdata) naar externe calendar servers worden gestuurd die niet uitsluitend in de EU staan

Voorgestelde herformulering (na verificatie Supabase-locatie):

```
Jurisdiction

Origin records are stored in [Supabase-locatie verifiëren]
and processed by the OTS Worker in Germany (Hetzner).

Cryptographic hashes (non-personal data, 64-character strings)
are submitted to independent OpenTimestamps calendar servers
for Bitcoin anchoring. These servers are globally distributed
and not operated by Umarise.

[Supabase-locatie] data processing is subject to GDPR
and applicable EU data protection law.
```

### ⚠️ Punt 4 — "tracking cookies or analytics" onder "Data Not Processed"

**Huidige tekst:**
```
Umarise does not process or store:
• tracking cookies or analytics
```

**Oordeel:** De Inventarisatie v3 zegt niets over cookies of analytics. Dit kan kloppen, maar het is niet verifieerbaar vanuit de brondocumenten.

**Actie voor Lovable en Umarise:** Verifieer tegen de site-implementatie (check of er analytics scripts, tracking pixels, of cookies op umarise.com staan). Als het klopt: laten staan. Als er wél analytics draait: verwijderen uit de lijst.

### ⚠️ Punt 5 — "Umarise cannot identify users and does not attempt to do so"

**Huidige tekst:**
```
Umarise cannot identify users and does not attempt to do so.
```

**Oordeel:** Voor eindgebruikers: correct — Core heeft geen user accounts, geen identity linkage (Inventarisatie v3, security checklist: "No identity linkage in Core layer ✅").

Maar voor partners: `partner_name` is opgeslagen, `api_key_prefix` wordt per request gelogd in `core_request_log`. Umarise kan identificeren welke partner welk request maakte.

De privacy policy maakt geen onderscheid tussen eindgebruikers en partners.

**Actie:** Herformuleer:

```
Umarise cannot identify end users and does not attempt to do so.
Partner organizations are identified solely by API key prefix
for operational purposes.
```

### ⚠️ Punt 6 — "Local Device Data" sectie

**Huidige tekst beschrijft:** een browser-gebaseerde lokale identifier die op het apparaat wordt opgeslagen.

**Oordeel:** Dit verwijst naar de B2C App-laag, niet naar de Core API. De Core API wordt door partners via API keys aangesproken, niet via browsers met lokale identifiers.

**Besluit na B2C-inventarisatie:** De privacy policy geldt voor het hele platform (Core API + B2C App). De B2C-Inventarisatie v0.4 documenteert dat de App `device_user_id` in localStorage opslaat, images uploadt naar Hetzner Object Storage, en page records schrijft naar Supabase. De "Local Device Data" sectie is relevant en hoort in de privacy policy.

**Actie:** Voeg een scope-verduidelijking toe bovenaan de privacy policy:

```
This Privacy Policy covers all Umarise services, including
the Core API and the Umarise companion application.
```

De "Local Device Data" sectie blijft staan.

### Samenvatting /privacy wijzigingen voor Lovable

| Wat | Actie | Status |
|-----|-------|--------|
| "IP address logs" onder Data Not Processed | Verwijderen + Operational Data blok toevoegen met gehashte IP, API key prefix, request metadata | 🔴 Kritiek — feitelijk fout |
| "names or personal identifiers" | Herformuleren naar "personal names or individual identifiers" + partner_name toevoegen aan Operational Data | 🔴 Kritiek — feitelijk fout |
| Opslaglocatie "Germany (Hetzner)" | Lovable en Umarise: Supabase-locatie verifiëren + OTS calendar servers benoemen | 🔴 Kritiek — onverifieerbaar |
| "All data processing occurs within the EU" | Herformuleren na Supabase-locatie verificatie + OTS calendar servers benoemen | 🔴 Kritiek — onverifieerbaar |
| "tracking cookies or analytics" | Lovable en Umarise: verifiëren tegen site-implementatie | ⚠️ Onverifieerbaar |
| "cannot identify users" | Herformuleren: onderscheid eindgebruikers vs partners | ⚠️ Onvolledig |
| Local Device Data sectie | Scope-verduidelijking toevoegen: "Core API and companion application." Sectie blijft staan. | ✅ Besloten na B2C-inventarisatie |

---

## 11. Pagina: /terms — Review en correcties

### Status

De Terms of Service zijn grotendeels correct en goed gestructureerd. Vier punten vereisen aandacht — geen juridische fouten, maar inconsistenties en formuleringstijl.

### ⚠️ Correctie 1 — "artifacts submitted for origin recording"

**Huidige tekst (User Responsibilities):**
```
ensuring that artifacts submitted for origin recording are lawful
```

En (Service Description):
```
the cryptographic hash of a digital artifact
```

**Probleem:** Core ontvangt geen artifacts — het ontvangt hashes. De /core pagina zegt correct: "Core accepts hashes only. No bytes. No labels. No metadata. No artifacts." De Terms gebruiken "artifacts submitted" wat impliceert dat content wordt ingeleverd. Bij client-side hashing wordt zelfs geen data ingeleverd, alleen een hash.

**Wordt (User Responsibilities):**
```
ensuring that data submitted for origin recording is lawful
and that you have the right to submit it
```

**Wordt (Service Description):**
```
the cryptographic hash of digital data
```

**Toelichting:** "Data" is accurater dan "artifact" — het dekt zowel de situatie waarin Umarise de data ontvangt en hasht, als de situatie waarin de partner alleen een hash stuurt. "Artifact" impliceert een volledig bestand of object.

### ⚠️ Correctie 2 — "ensuring that artifacts submitted for origin recording are lawful"

**Aanvullend probleem bij dezelfde zin:** Als Core alleen hashes ontvangt, hoe kan een hash "lawful" of "unlawful" zijn? Een SHA-256 hash is 64 tekens — dat is geen content.

De verantwoordelijkheid voor lawful content ligt bij de partner, maar de formulering moet dat reflecteren.

**Wordt:**
```
ensuring that the data underlying any submitted hash is lawful
and that you have the right to register its origin
```

### ℹ️ Punt 3 — "Umarise is only suitable where" — inconsistentie

**Huidige tekst:**
```
Umarise is only suitable where:
```

**Feit:** /origin en /spec gebruiken "appropriate only where." /core wordt gecorrigeerd naar "appropriate only where." Terms gebruikt "suitable."

**Actie:** Vervang door "appropriate" voor consistentie over alle pagina's:

```
Umarise is appropriate only where:
```

### ⚠️ Punt 4 — "The core behavior of the origin record service is invariant"

**Huidige tekst (Availability and Changes):**
```
The core behavior of the origin record service is invariant.
Operational aspects may change without notice, provided
invariants are preserved.
```

**Oordeel:** Zelfde kwestie als "IMMUTABLE INTERFACE" op /core. Op een Terms pagina is dit sterker dan op een spec-pagina — het is potentieel juridisch bindend. Als een partner later klaagt dat een invariant is gewijzigd, verwijst hij naar deze zin.

Dit is een verstandige belofte en consistent met de architectuur. Maar het moet intern gedocumenteerd en gedragen worden.

**Actie voor Lovable en Umarise:** Zelfde als bij /core: als dit jullie commitment is, documenteer het formeel. De Terms zijn de plek waar dit het meeste gewicht heeft — zorg dat het intern gedekt is.

### Samenvatting /terms wijzigingen voor Lovable

| Wat | Actie | Status |
|-----|-------|--------|
| "artifacts submitted" (User Responsibilities) | Herformuleren naar "data underlying any submitted hash is lawful" | ⚠️ Misleidend |
| "digital artifact" (Service Description) | Vervang door "digital data" | ⚠️ Inconsistent met /core |
| "only suitable where" | Vervang door "appropriate only where" | ℹ️ Consistentie |
| "core behavior is invariant" | Lovable en Umarise: formeel vastleggen in intern document | ⚠️ Ongedocumenteerd commitment |

---

## 12. Bewuste keuze: geen "Over Ons" of bedrijfsinformatie op de site

### Besluit

Geen About-pagina, geen teamnamen, geen vestigingsadres op de site. Dit is een bewuste keuze, geen omissie.

### Waarom

De positionering is "het bewijs spreekt voor zichzelf." Umarise verkoopt niet op basis van wie het is, maar op basis van wat verifieerbaar is. Een CTO die `ots verify` draait heeft geen About-pagina nodig. Het protocol is het bewijs, niet het team.

Een founding-stage bedrijf met een About-pagina met twee namen verliest autoriteit in plaats van het te winnen. De huidige site communiceert: "wij zijn infrastructuur." Een About-pagina communiceert: "wij zijn een startup." Dat is een downgrade.

### Wat er wél staat (en voldoende is)

| Element | Aanwezig | Functie |
|---------|----------|---------|
| `partners@umarise.com` | ✅ | Contactpunt |
| `© 2026 Umarise` | ✅ | Entiteit |
| Privacy Policy met jurisdictie | ✅ (na correcties) | EU/Duitsland |
| Terms met governing law (Germany) | ✅ | Rechtskeuze |

Een partner die wil weten wie Umarise is mailt `partners@umarise.com` en krijgt het intake-formulier. Dat is precies hoe het onboarding document het beschrijft.

### Instructie voor Lovable

- **Geen** About-pagina toevoegen
- **Geen** teamnamen, foto's, of oprichtersverhaal
- **Geen** "Founded in..." of "Based in..." op de site
- **Geen** investeerders, adviseurs, of partnerships benoemen

### Wanneer dit verandert

Zodra er betalende partners zijn en Umarise naar buiten treedt (pers, conferenties, referenties), verwacht de buitenwereld ergens een entiteit te kunnen verifiëren — KvK-nummer, vestigingsland, rechtsvorm. Dat hoeft niet op de homepage, maar hoort uiteindelijk in de Terms of in de Privacy Policy.

**Let op:** de Terms zeggen nu "governed by the laws of Germany." Dit impliceert een Duitse entiteit. Als Umarise niet in Duitsland gevestigd is, moet deze zin gecorrigeerd worden. Dit is een actie voor Umarise, niet voor Lovable.

### Samenvatting

| Wat | Actie |
|-----|-------|
| About-pagina | Niet toevoegen |
| Bedrijfsinformatie op site | Niet toevoegen |
| KvK/entiteit in Terms of Privacy | Toevoegen wanneer de markt erom vraagt — niet eerder |
| "Governed by the laws of Germany" | Umarise: verifiëren dat dit klopt met de werkelijke vestiging |

---

## 13. Master-samenvattingstabel: alle wijzigingen per pagina

Overzicht van alle acties uit deze briefing én het addendum, per pagina.

### Homepage

| Bron | Actie | Type |
|------|-------|------|
| Briefing | "Proof is independently verifiable — anchored in Bitcoin." toevoegen als 3e regel | Toevoeging |
| Briefing | "Verifiable Origin Registry" als categorie-descriptor, één keer | Toevoeging |
| Addendum | "Why" toevoegen aan navigatie (rechts van Core) | Toevoeging |
| Briefing | Geen prijzen, geen "decentralized", geen standaardclaims | Restrictie |

### /origin

| Bron | Actie | Type |
|------|-------|------|
| Briefing | "evidentiary validity" → "verifiable validity" | Correctie |
| Briefing | "Evidentiary" in tabel → "Verifiable" | Correctie |
| Briefing | "Umarise is defined as..." → "Umarise Core is an origin registry implementing..." | Correctie |
| Addendum | "The externalization of trust" paragraaf toevoegen vóór DNS/CA/TSA-rijtje | Toevoeging |

### /spec

| Bron | Actie | Type |
|------|-------|------|
| Briefing | Definition herschrijven ("externally anchored attestation... not the bytes themselves") | Correctie |
| Briefing | "only correct where" → "appropriate only where" | Correctie |
| Briefing | "Time services externalized ordering" → "Time-Stamping Authorities externalized time ordering" | Correctie |
| Briefing | "Origin follows the same pattern." → "Origin attestation externalizes existence at the beginning." | Correctie |
| Briefing | Reference-zin toevoegen onderaan | Toevoeging |
| Briefing | Nieuwe sectie: Anchoring (OTS, Merkle tree, Bitcoin, .ots) | Toevoeging |
| Briefing | Nieuwe sectie: Verification (publieke endpoints + ots verify) | Toevoeging |
| Briefing | Nieuwe sectie: Trust Model (wat verifieerbaar vs wat trust vereist) | Toevoeging |
| Addendum | Interoperability note in Anchoring-sectie (C2PA SHA-256) | Toevoeging |

### /core

| Bron | Actie | Type |
|------|-------|------|
| Briefing | Endpoint paden `/core/*` → `/v1-core-*` | 🔴 Correctie — fout |
| Briefing | `/v1-core-proof` endpoint toevoegen | 🔴 Correctie — ontbreekt |
| Briefing | Anchoring-mechanisme toevoegen (OTS + Bitcoin, één zin) | 🔴 Correctie — ontbreekt |
| Briefing | `hash_algo` toevoegen aan Record Contents + "Nothing more." verwijderen | Correctie |
| Briefing | "Earliest by captured_at" — verifiëren tegen code | ⚠️ Umarise + Lovable |
| Briefing | "IMMUTABLE INTERFACE" — formeel vastleggen in intern document | ⚠️ Umarise |

### /privacy

| Bron | Actie | Type |
|------|-------|------|
| Briefing | "IP address logs" uit "Data Not Processed" → Operational Data blok toevoegen | 🔴 Correctie — fout |
| Briefing | "names or personal identifiers" herformuleren + partner_name toevoegen | 🔴 Correctie — fout |
| Briefing | Opslaglocatie verifiëren (Supabase-regio) | 🔴 Umarise + Lovable |
| Briefing | "All data processing occurs within the EU" herformuleren na verificatie | 🔴 Correctie |
| Briefing | "cannot identify users" herformuleren (onderscheid eindgebruikers/partners) | Correctie |
| Briefing | Local Device Data sectie: scope-verduidelijking toevoegen, sectie blijft staan | ✅ Besloten na B2C-inventarisatie |

### /terms

| Bron | Actie | Type |
|------|-------|------|
| Briefing | "artifacts submitted" → "data underlying any submitted hash" | Correctie |
| Briefing | "digital artifact" → "digital data" | Correctie |
| Briefing | "only suitable where" → "appropriate only where" | Correctie |
| Briefing | "core behavior is invariant" — formeel vastleggen | ⚠️ Umarise |

### /why (nieuw)

| Bron | Actie | Type |
|------|-------|------|
| Addendum | Nieuwe pagina — volledige tekst in addendum deel 2 | Nieuw |

### Site-breed

| Bron | Actie | Type |
|------|-------|------|
| Briefing | Geen About-pagina, geen teamnamen, geen bedrijfsinfo | Restrictie |
| Briefing | "Governed by the laws of Germany" — verifiëren | ⚠️ Umarise |

---

*Briefing document — niet publiceren*  
*Bronnen: Technische Inventarisatie v3, Partner Onboarding Workflow v2.1, B2C-Inventarisatie v0.4, Lovable Briefing B2C v1.1*  
*Scope: Homepage + /origin + /spec + /core + /privacy + /terms + /why (addendum) + site-brede keuzes*  
*Leest samen met: Addendum Marktcontext v2*
