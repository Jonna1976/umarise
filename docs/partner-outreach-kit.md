# Partner Outreach Kit — Origin Record Layer

> Intern document. Niet publiceren.

---

## Kernzin (onthouden)

**"Wij helpen jullie klanten om te bewijzen wat er was vóórdat AI het veranderde."**

---

## Elevator Pitch (30 seconden)

"Elke keer dat AI, een editor of een workflow iets transformeert, verdwijnt het origineel stilzwijgend. Wij leggen dat origineel vast vóórdat de transformatie plaatsvindt — zodat jullie klanten kunnen aantonen wat er was, wanneer het bestond, en dat het niet is herschreven."

---

## 5-Minuten Demo Structuur

### Minuut 0–1: Framing
> "This is not a product demo. This is a reference implementation of an origin record layer."

Kernboodschap:
- "Everything above this layer can change. Nothing below it can be overwritten."

### Minuut 1–2: Capture
> "This is raw input — before any system touches it."

Laat zien: capture moment, geen AI, directe vastlegging.

### Minuut 2–3: Seal & Store
> "The moment it's captured, it's sealed."

Laat zien: SHA-256 hash, IPFS CID, geen update-pad.
- "If the content changes, the identity changes. Silent overwrite is technically impossible."

### Minuut 3–4: Resolve & Verify
> "Any system can now resolve this origin."

Laat zien: Origin View, hash verificatie, proof bundle.
- "This is how origin survives transformation."

### Minuut 4–5: Boundary
> "Umarise stops here. We don't enforce policy. We don't decide truth. We don't govern."

Afsluiting:
- "But without this layer, governance is symbolic. With it, governance becomes enforceable."
- "Now the only real question is: **where would this live in your stack?**"

*Stop. Laat stilte werken.*

---

## Vragenset voor Eerste Gesprek

### Startvraag (altijd)
> "Where in your stack is origin currently defined?"

Let op: vaagheid, stilte, "dat zit overal" — dat zijn signalen.

### Verdiepingsvragen (kies één)

| Context | Vraag |
|---------|-------|
| Technisch | "Before content is transformed — where is the last immutable reference today?" |
| AI / Data | "If an AI output is challenged, how do you prove what it was derived from?" |
| Compliance | "Which part of your stack is the system-of-record for 'what existed at time T'?" |

### Boundary-check
> "If that reference were wrong or manipulated, how would you detect it?"

### Afsluitende vraag
> "Should that responsibility live inside an application — or below all applications?"

---

## Outreach Template (Email)

**Onderwerp:** Origin record layer — waar zit die in jullie stack?

---

[Naam],

Elke keer dat AI of een workflow iets transformeert, verdwijnt het origineel stilzwijgend. Bij dispute, audit of compliance is het bewijs weg.

Wij bouwen de infrastructuurlaag die dat oplost: een origin record layer die vóór transformatie integreert en bewijs van oorsprong vastlegt.

Geen product lock-in. Geen governance-aannames. Puur: *dit bestond, toen, en is aantoonbaar niet herschreven.*

Zou je 20 minuten hebben om te kijken waar dit in jullie stack zou passen?

[Naam]

---

## Wat Níét Doen

- ❌ Uitleggen waarom Umarise nodig is
- ❌ Argumenteren of overtuigen
- ❌ Voorbeelden blijven geven

✅ Als het klopt, verplaatsen zij Umarise vanzelf in hun hoofd.

---

## Interne Ankerzin

> "We're not selling a solution. We're revealing a missing layer."

---

## Success Metric (Fase 2)

**Partner kan Umarise verwijderen en onmiddellijk demonstreren dat verifiable origin verloren gaat.**

---

*Document versie: Januari 2026*
