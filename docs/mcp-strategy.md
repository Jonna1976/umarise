# MCP Strategy — Umarise Position

> Strategische conclusie: Umarise als Origin Authority, niet als Tool Hub.

---

## Kernonderscheid

**MCP is een transport- en toolprotocol.**  
**Umarise is een autoriteitslaag.**

---

## Strategische Keuze

Umarise wordt geen tool hub.  
Umarise wordt de **origin authority**:

- **Waarheid** — origineel document is bron van bewijs
- **Eigenaarschap** — device_user_id als identiteitsanker
- **Auteursrecht** — timestamp + origin = claim
- **Herleidbaarheid** — elke afleiding wijst terug naar origin
- **Herroepbare toestemming** — gebruiker controleert toegang

> Alles buiten Umarise is afgeleid en tijdelijk.

---

## Fasering

### v1 / Pilot
**Geen MCP.** Focus op wedge: 60-second retrieval + vertrouwen.

### v1.5 — Share Origin
Introduceer consent-laag:

| Capability | Beschrijving |
|------------|--------------|
| Expliciete consent | Gebruiker kiest wat gedeeld wordt |
| Preview | Ontvanger ziet preview, niet origin |
| Scope | `origin` / `metadata` / `preview_only` |
| Expiry | Tijdelijke toegang, automatisch verlopen |
| Single point of revocation | Één knop trekt alle shares in |
| Audit trail | Gebruiker ziet wie, wanneer, wat |

### v2 — MCP Server (voorwaardelijk)
Alleen als Umarise al erkend is als origin authority:

- MCP aan de rand, niet in de kern
- Agents mogen **vragen**, nooit **nemen**
- Origin blijft altijd achter Umarise-consent

---

## Principiële Grenzen

| Regel | Rationale |
|-------|-----------|
| MCP mag **nooit** direct toegang geven tot origin binaries | Origin = waarheid, moet beschermd blijven |
| MCP mag **nooit** ownership dupliceren | Eén bron van eigenaarschap |
| MCP mag **nooit** revoke-macht ondermijnen | Gebruiker behoudt ultieme controle |

---

## Leidend Principe

> **"AI tools come and go. Originals need an authority."**

Als we MCP doen, is het als **export- en access-protocol rond Umarise** — niet als kern van de architectuur.

---

## Positionering

```
┌─────────────────────────────────────────────────────────┐
│                    EXTERNAL WORLD                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Notion  │  │ Linear  │  │ Claude  │  │ GPT     │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       │            │            │            │          │
│       └────────────┴─────┬──────┴────────────┘          │
│                          │                              │
│                    MCP REQUESTS                         │
│                          │                              │
│                          ▼                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              UMARISE CONSENT GATEWAY              │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  • Authenticate request                     │  │  │
│  │  │  • Check user consent                       │  │  │
│  │  │  • Validate scope & expiry                  │  │  │
│  │  │  • Log access (audit trail)                 │  │  │
│  │  │  • Return scoped response (never origin)    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                              │
│                          ▼                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              UMARISE ORIGIN VAULT                 │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐           │  │
│  │  │ Origins │  │ Consent │  │ Audit   │           │  │
│  │  │ (IPFS)  │  │ Registry│  │ Log     │           │  │
│  │  └─────────┘  └─────────┘  └─────────┘           │  │
│  │                                                   │  │
│  │  "Truth lives here. Everything else is derived." │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Samenvatting voor Stakeholders

| Vraag | Antwoord |
|-------|----------|
| Doen we MCP in v1? | **Nee** |
| Wordt Umarise MCP Client? | **Nooit** |
| Wordt Umarise MCP Server? | **v2, conditioneel** |
| Wat is Umarise dan? | **Origin Authority** |
| Wat is de kernwaarde? | **Consent & Revocation** |

---

*Strategie vastgelegd: Januari 2026*
