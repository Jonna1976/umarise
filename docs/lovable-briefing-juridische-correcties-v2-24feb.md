# Lovable Briefing — Juridische Taalcorrecties v2

24 februari 2026. Gebaseerd op volledige AI-review van Briefing 4.

---

## Context

Alle publieke documenten, pagina's en ZIP-inhoud moeten de onderstaande wijzigingen doorvoeren. Geen backend, geen API, geen database. Alleen tekst.

---

## Correctie 1 — Tijdsformulering

Vervang overal "existed at or before" door:

```
no later than Bitcoin block inclusion
```

In gebruikersgerichte copy (landingspagina, onboarding) mag de kortere versie blijven:

```
no later than [timestamp]
```

Zolang de volledige technische formulering beschikbaar is op umarise.com/legal of umarise.com/core.

---

## Correctie 2 — "Economic finality" verwijderen

Verwijder de term "economic finality" overal waar hij voorkomt. Vervang door:

```
After 6 Bitcoin block confirmations, the anchoring is considered final.
Reversing it is not technically possible under any realistic conditions.
```

---

## Correctie 3 — Trust gradient tabel publiek maken

De trust gradient tabel (welke eigenschappen onafhankelijk verifieerbaar zijn en welke Umarise-vertrouwen vereisen) moet zichtbaar zijn op umarise.com/legal.

De tabel staat al intern in de documentatie. Voeg hem toe aan de Legal pagina als eigen sectie:

```
TRUST GRADIENT

| Property | Independently verifiable? | Trust required? |
| Hash is anchored in Bitcoin | Yes (by anyone, forever) | None |
| File matches hash | Yes (recompute SHA-256) | None |
| Hash submitted at claimed time | No | Trust Umarise (Bitcoin constrains to ±2h) |
| Hash submitted by claimed party | No | Trust API key authentication |
| Records not deleted | No | Trust write-once triggers + DDL audit |
```

---

## Correctie 4 — VERIFY.txt volgorde

De volgorde in VERIFY.txt moet zijn:

1. What this proves
2. What this does not prove
3. Verification instructions

Controleer alle ZIP-versies op consistente volgorde. Pas aan waar nodig.

---

## Correctie 5 — Attestant verklaring

Vervang de huidige attestant-verklaring door:

```
Based on the cryptographic evidence presented to me via the anchoring.app
attestation interface, I confirm that an anchoring action was recorded in
the system at the stated time, associated with the stated passkey identifier
and hash. I have not independently verified the identity of the natural
person operating the device, the content of the anchored file, or the legal
significance of this action. This confirmation is limited to the technical
facts presented.
```

Deze tekst moet het centrale scherm zijn van de attestant-interface — niet als kleine letters, maar als de primaire inhoud voordat de attestant bevestigt.

---

## Correctie 6 — "Certified third party" aanpassen

Vervang overal "a certified third party" door:

```
a certified independent attestant
```

Volledig in context:

```
A certified independent attestant (notary, IP lawyer, or qualified reviewer)
confirms via a signed digital statement that a specific human performed
a specific anchoring action at a specific moment.
```

---

## Correctie 7 — Positionering ten opzichte van notariële timestamp

Verwijder elke formulering die vergelijkt met "notarial timestamp" in termen van bewijskracht.

Vervang door:

```
An anchored proof with Layer 3 attestation constitutes strong documentary
evidence of chronology. Its weight in legal proceedings is assessed by the
court on the basis of all available evidence. It does not carry the statutory
presumption of an authentic deed under Dutch law, but provides independently
verifiable chronological proof that is mathematically resistant to backdating.
```

---

## Wat niet verandert

- Alle API endpoints
- Alle database structuren
- De attestatie-flow en Stripe-integratie
- De verificatielogica
- De ZIP-structuur

---

*Lovable briefing juridische taalcorrecties v2 — 24 februari 2026.*
