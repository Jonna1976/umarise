# Partner Onboarding Workflow v2

**Umarise Core — Operationeel Schema**  
**Datum:** 5 februari 2026  
**Status:** Intern document — niet publiceren

---

## Communicatiemodel

```
Partner ↔ Umarise (Issuer) ↔ Lovable (Executor)
Partner ↔ Core API (direct, technisch)
```

Twee gescheiden stromen: **Governance & toegang** (mensen, beslissingen, e-mail) en **Protocolgebruik** (machines, HTTP). Deze mogen nooit door elkaar lopen.

⚠️ **Partner en Executor komen NOOIT direct in contact.**

---

## Onboarding Flow

```
1. Partner → partners@umarise.com                    [Trigger]
   ↓
2. Umarise → Partner: Template A                     [Ack, ALTIJD]
   ↓
3. Umarise → Partner: Intake Formulier               [Kennismaking]
   ↓
4. Partner → Umarise: Ingevuld formulier             [Due diligence]
   ↓
5. Intake Review + Geschiktheidscheck (4× JA/NEE)    [Intern]
   ↓
   NEE → Template D: Afwijzing (kort, geen uitleg)   [STOP]
   JA  → Doorgaan
   ↓
6. Umarise → Partner: Tier + pricing bevestiging     [Template E]
   ↓
7. Partner → Umarise: Akkoord + betaling             [Commitment]
   ↓
8. Umarise → Lovable: ISSUE KEY — [Partner]          [Handoff]
   ↓
9. Lovable → Umarise: KEY ISSUED / BLOCKED           [Response]
   ↓
10. Umarise → Partner: Template B                    [Key delivery]
    ↓
11. Partner ↔ Core API                               [Direct]
```

---

## Stap 3: Intake Formulier

Dit formulier wordt meegestuurd met Template A of als vervolg na de ontvangstbevestiging. Het doel: weten wie er aan de deur klopt voordat we toegang verlenen.

### Bedrijfsinformatie

| Veld | Antwoord |
|------|----------|
| Bedrijfsnaam | |
| Vestigingsland | |
| Opgericht sinds | |
| KvK/registratienummer (of equivalent) | |
| Website | |
| Aantal werknemers | |
| Korte omschrijving kernactiviteit | |

### Technische Context

| Veld | Antwoord |
|------|----------|
| Is er een CTO of technisch verantwoordelijke? | Ja / Nee |
| Naam + rol technisch contactpersoon | |
| Ervaring met API-integraties? | Geen / Basis / Gevorderd |
| Welke programmeertaal/stack? | |
| Hashing: doen jullie zelf client-side hashing of verwachten jullie dat Umarise dit doet? | Client-side / Umarise / Weet niet |
| Verwacht volume attestaties per maand | |
| Is er een bestaand systeem waarin Core geïntegreerd wordt? | Ja (welk?) / Nee (nieuwbouw) |

### Use Case

| Veld | Antwoord |
|------|----------|
| Waarvoor willen jullie origin registratie gebruiken? | |
| Welk type data wordt geattesteerd? (documenten, afbeeldingen, AI-output, anders) | |
| Waarom is bewijs van bestaan belangrijk voor jullie? | |
| Zijn er compliance/juridische vereisten die een rol spelen? | Ja (welke?) / Nee |
| Verwachten jullie dat attestaties als juridisch bewijs gebruikt worden? | Ja / Nee / Mogelijk |

### Juridisch & Commercieel

| Veld | Antwoord |
|------|----------|
| Zijn er bestaande IP-claims op timestamping, hashing, of vergelijkbare technologie binnen jullie organisatie? | Ja (toelichting) / Nee |
| Is er een concurrentiebeding of exclusiviteitsclausule met een andere origin/timestamping provider? | Ja (toelichting) / Nee |
| Zijn er lopende juridische geschillen die gerelateerd zijn aan data-integriteit of content-authenticiteit? | Ja (toelichting) / Nee |
| Akkoord met Umarise Core Terms of Service? (wordt meegestuurd) | Ja / Nee |

---

## Stap 5: Geschiktheidscheck

Vier vragen, 4× JA = door. 1× NEE = stop.

| # | Vraag | JA | NEE |
|---|-------|----|----|
| 1 | Kan een cryptographic hash worden berekend op het moment van origin? | ☐ | ☐ |
| 2 | Hebben ze extern bewijs nodig? | ☐ | ☐ |
| 3 | Accepteren ze irreversibiliteit? | ☐ | ☐ |
| 4 | Geen feature-/productvragen? | ☐ | ☐ |

**Aanvullende interne check (na intake formulier):**

| # | Vraag | OK | FLAG |
|---|-------|----|------|
| 5 | Geen IP-claims op vergelijkbare technologie? | ☐ | ☐ |
| 6 | Geen concurrentiebeding met andere provider? | ☐ | ☐ |
| 7 | Geen lopende juridische geschillen rond data-integriteit? | ☐ | ☐ |
| 8 | Bedrijf bestaat en is verifieerbaar (KvK/website)? | ☐ | ☐ |

**4× JA + 4× OK** → Door naar key issuance  
**1× NEE of 1× FLAG** → Afwijzing (Template D, geen uitleg, geen suggesties, geen roadmap)

---

## Stap 6: Tier & Pricing Bevestiging

Na goedkeuring, vóór key issuance:

| Tier | Prijs/maand | Attestaties/maand | OTS Proofs | Support |
|------|------------|-------------------|------------|---------|
| Founding Partner | €199 | Alles inbegrepen | ✅ | Email + prioriteit |
| Pilot | €99 | 1.000 | ✅ | Email |
| Growth | €299 | 10.000 | ✅ | Email + prioriteit |
| Scale | €799 | 100.000 | ✅ | Dedicated |

Founding Partner: 12 maanden commitment, referentierecht, early access, meedenken over roadmap.

---

## Safety Valves

**Valve 1 — Template A is verplicht**  
Elke inbound partner-mail krijgt altijd Template A (ontvangstbevestiging).

**Valve 2 — Intake vóór geschiktheidscheck**  
Geen geschiktheidsbeoordeling zonder ingevuld intake formulier. Voorkomt aannames.

**Valve 3 — Betaling vóór key issuance**  
Geen API key zonder bevestigde tier en eerste betaling. Voorkomt gratis proefgebruik dat nooit converteert.

**Valve 4 — Handoff is expliciet taakvormig**  
Format: `ISSUE KEY — Partner: [Naam]`  
Response: `KEY ISSUED` of `BLOCKED (reason)`

---

## Rolverdeling

| Rol | Verantwoordelijkheid |
|-----|---------------------|
| Umarise | Intake, besluit (JA/NEE), templates versturen, pricing |
| Lovable | Key generatie, DB registratie, revocatie |
| Partner | Intake formulier invullen, betaling, Core API gebruiken |

---

## E-mail Templates

| # | Template | Type | Trigger | Output |
|---|----------|------|---------|--------|
| A | Ontvangstbevestiging | E-mail | Elke inbound partner-mail | Ack + intake formulier bijlage |
| B | Key delivery | E-mail | Na KEY ISSUED | API key + quickstart + constraints |
| C | Revocation notice | E-mail | Bij key revocatie | Notificatie + reden |
| D | Afwijzing | E-mail | Bij NEE in geschiktheidscheck | Kort, geen uitleg, geen roadmap |
| E | Tier bevestiging | E-mail | Na goedkeuring geschiktheidscheck | Pricing + tier + betaalinstructies |

---

## Green Flags — Waarom Founding Partner €199/maand waard is

Gebruik deze argumenten in het gesprek met potentiële founding partners. Alle punten zijn feitelijk gedekt door de Technische Inventarisatie v3 en dit onboarding document.

### 1. Onbeperkte attestaties — geen teller, geen verrassingen

Pilot heeft een cap van 1.000/maand, Growth 10.000, Scale 100.000. Founding Partner: alles inbegrepen. Geen volume-plafond, geen overage-kosten, geen rekenmachine nodig.

### 2. Onafhankelijk verifieerbaar bewijs — zonder Umarise te hoeven vertrouwen

Elke attestatie krijgt automatisch een `.ots` proof, verankerd in de Bitcoin-blockchain. De partner kan dit zelf verifiëren met standaard open-source tooling (`ots verify`) — zonder Umarise-account, zonder API key, zonder contact met ons. Het bewijs is wiskundig, niet contractueel.

### 3. Geen vendor lock-in op het bewijs

De `.ots` bestanden zijn een open standaard (OpenTimestamps). De verificatie-tool is open source. Er is geen proprietary format, geen dashboard nodig, geen Umarise-relatie vereist om het bewijs te checken. Als Umarise morgen stopt, blijven de proofs verifieerbaar.

### 4. Permanentie — het bewijs overleeft alles

Een proof die vandaag verankerd wordt in de Bitcoin-blockchain is over 10 jaar nog steeds verifieerbaar — ongeacht of Umarise dan nog bestaat. De partner bouwt een bewijsarchief op dat niet afhankelijk is van de levensduur van een leverancier.

### 5. Compliance-waarde

Voor partijen die data-integriteit moeten aantonen (juridisch, regulatoir, audit) is "verifieerbaar tegen de Bitcoin-blockchain met open-source tooling" een sterkere positie dan "onze database zegt dat het klopt." OTS verschuift de positionering van Trusted Third Party naar Verifiable Third Party.

### 6. Client-side hashing als optie

Technische partners kunnen zelf de SHA-256 hash berekenen en alleen de hash naar Core sturen. Dan is de gehele keten verifieerbaar zonder Umarise te vertrouwen voor de data-inname. Dit is een optie, geen vereiste — maar het maakt het verhaal naar een CTO sluitend.

### 7. Roadmap-invloed

Founding partners denken mee over de roadmap.

### 8. Referentierecht

De partner mag publiekelijk communiceren dat ze founding partner zijn van Umarise Core.

### 9. Early access

Nieuwe endpoints, proof-types en integraties — founding partners zien en testen het eerst.

### 10. Priority support

Founding Partners krijgen email + prioriteit.

### 11. €2.388 per jaar voor volledige attestatie-infrastructuur

€199 × 12 maanden = €2.388 totaal. Dat is: onbeperkte attestaties, Bitcoin-verankerde proofs, priority support, roadmap-invloed, referentierecht, early access, en een volledig verifieerbaar bewijsarchief.

---

## Red Flags — Wanneer niet onboarden

Ongeacht de geschiktheidscheck, niet onboarden als:

- Partner wil Core gebruiken om claims te maken over content die ze niet bezitten
- Partner verwacht dat attestatie eigendom of auteursrecht bewijst (dat doet Core niet)
- Partner wil feature-requests als voorwaarde voor onboarding
- Partner heeft IP-claims die kunnen conflicteren met het OTS-protocol of open standaarden
- Partner is een directe concurrent die het protocol wil reverse-engineeren
- Partner kan niet uitleggen waarvoor ze origin registratie nodig hebben
- Partner verwacht SLA-garanties die Umarise in deze fase niet kan bieden

Bij twijfel: niet doen. Eén verkeerde partner kost meer tijd dan tien goede partners opleveren.

---

*Operationeel document — niet publiceren*  
*Umarise Core — 2026*  
*v2.0 — Toegevoegd: intake formulier, juridische check, pricing stap, red flags, valve 2 en 3*  
*v2.1 — Toegevoegd: Green Flags sectie (founding partner argumentatie, 100% feitelijk gedekt door Technische Inventarisatie v3)*
