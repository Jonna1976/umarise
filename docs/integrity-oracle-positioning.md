# Integrity Oracle — Positioning & Architecture Diagram

> **Vastgelegd**: 4 maart 2026  
> **Status**: Canonical positioning document

---

## Diagram: Integrity Oracle

**Tagline**: *Push proofs at write-time. Pull verification at dispute-time.*

### Architecture Flow

```
┌─────────────────────┐
│   BRIDGE BUILDERS   │  Platform owners · golden paths · default-on switches
└─────────┬───────────┘
          │ (enable integrations)
          ▼
┌─────────────────┐         ┌───────────────────┐         ┌─────────────────────┐
│ SYSTEMS OF      │  hash   │                   │  return  │  CUSTOMER STORAGE   │
│ RECORD          │  and    │    CORE API        │  proof   │                     │
│                 │  push   │                   │ ───────► │  Proof bundle stored │
│ CI/CD · build   │ ──────► │  anchor(hash)     │         │  next to artefact   │
│ Model registry  │         │  → origin_id +    │         │                     │
│ Logging / SIEM  │         │    .ots proof     │         │  Proof travels with │
│ DMS / eSign     │         │                   │         │  artefact           │
│ App backends    │         │  Stateless        │         └──────────┬──────────┘
│                 │         │  No user data     │                    │
│ PUSH at write-  │         │                   │                    │ artefact
│ time            │         │  anchoring-spec   │                    │ + proof
│ Invisible by    │         │  .org             │                    │
│ default         │         │  verify-anchoring │                    ▼
└─────────────────┘         │  .org             │         ┌─────────────────────┐
                            └───────────────────┘         │  PUBLIC ANCHORS     │
                                                          │                     │
                   PULL at dispute/audit time              │  Bitcoin via OTS    │
                   independent of Umarise                  │  No single          │
                            ┌───────────────────┐         │  controller         │
                            │  OPEN VERIFIER    │ ──────► │                     │
                            │  CLI/SDK · offline│         └─────────────────────┘
                            │  Checks Bitcoin   │
                            │  via OTS          │
                            │                   │
                            │  Verification     │
                            │  report for       │
                            │  audit/litigation │
                            └───────────────────┘
```

### Diagram Precision Notes

- Core API retourneert `origin_id + .ots proof`, niet een complete "proof bundle" (ZIP is client-side)
- `certificate.json` wordt client-side gegenereerd, niet door Core
- Bridge Builders enablen integraties bij Systems of Record (stippellijn-relatie)

---

## Vier USPs — Architectuurpositie

> Niet als feature, maar als architectuurpositie.

### 1. Umarise elimineert zichzelf uit de trust-keten

Niet "vertrouw ons." Maar: de trust root is Bitcoin en cryptografie. Umarise is facilitator, niet bron van waarheid. Geen enkel SaaS-, notarisatie- of blockchain-platform doet dit consequent.

### 2. Bewijs is een eigenschap van het artefact, niet van een platform

Het bewijs reist mee. Dataset gekopieerd: bewijs geldig. Model gedeployed: bewijs geldig. Contract gedeeld: bewijs geldig. Platformmigratie: bewijs geldig. Dit is structureel anders dan elk systeem waarbij het bewijs in een database van de leverancier ligt.

### 3. Verificatie werkt als Umarise niet meer bestaat

Niet als belofte. Als architectuur. Er is geen content column. Er is geen storage layer. De verifier heeft alleen het artefact, de proof bundle en Bitcoin nodig. Over 30 jaar werkt het nog.

### 4. Stateless service met write-once registry

Geen data opgeslagen. Geen accounts. Geen dashboard. Geen storage burden. Geen regulatory liability voor content. De registry is immutable op database-niveau, niet op applicatie-niveau. Dit vermindert aansprakelijkheid, kosten en aanvalsoppervlak tegelijk.

---

## Kernzin

> **"Service trust replaced by mathematical trust — proof becomes a property of the artefact itself."**

---

## Closing Quote

> *"Umarise turns 'my system says so' into 'these exact bytes were anchored at time T'."*

---

*Document version: 1.0*
