# Strategic Positioning: DNS for Origins

> **Insight saved**: 2026-02-04

## Core Metaphor

Umarise Core wil worden wat DNS is voor domeinnamen: **het geboorteregister voor origins**.

## Wat dit betekent

| DNS | Umarise Core |
|-----|--------------|
| Registreert: "dit domein bestaat sinds X" | Registreert: "deze hash bestaat sinds X" |
| Eén authoritative bron voor domein-eigenaarschap | Eén authoritative bron voor first-in-time attestatie |
| Gedecentraliseerde resolutie, gecentraliseerde registratie | Publieke verificatie, permissioned attestatie |
| Iedereen kan opzoeken, niet iedereen kan registreren | Iedereen kan verifieren, niet iedereen kan attesteren |

## Implicaties

1. **Neutraliteit**: Core kent geen "betekenis" — alleen existence en timing
2. **Universaliteit**: Elke hash is een potentiële origin, ongeacht bron of type
3. **Permanentie**: Eenmaal geregistreerd = permanent record
4. **Publiek belang**: Verificatie is een publieke dienst, geen product-feature

## Van TTP naar Infrastructuur

**Nu (Phase 1)**: Trusted Third Party — "trust us, we don't lie"
**Straks (Phase 2)**: Infrastructure Primitive — "trust math, verify yourself"

De DNS-analogie is strategisch correct: DNS begon ook als trusted registries (ICANN, Verisign) voordat het gedecentraliseerde resolutie kreeg. De vraag is niet OF Umarise een primitive wordt, maar WANNEER en HOE.

## Trigger voor Phase 2

Implementeer OTS/Bitcoin anchoring wanneer:
- Een partner expliciet vraagt om "proof dat overleeft Umarise"
- Of: strategische beslissing om "trustless" te worden voor geloofwaardigheid
