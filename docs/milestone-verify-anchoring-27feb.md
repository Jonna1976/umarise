---
title: "Milestone Briefing — verify-anchoring.org: No-CDN OTS Verification"
date: 2026-02-27
status: canonical
applies_to: verify-anchoring.org
iec_version: "1.0"
---

# Milestone Briefing — 27 februari 2026

## Wat er vandaag is bereikt

**verify-anchoring.org** — de onafhankelijke Reference Verifier voor de Anchoring Specification (IEC v1.0) — draait nu **volledig zonder externe CDN-afhankelijkheden**.

## Wat er is veranderd

1. **Lokale OpenTimestamps bundel**: De `opentimestamps.min.js` library (v0.4.9) is gebundeld als `vendor/opentimestamps.min.js` in de GitHub Pages repo (`AnchoringTrust/verify-anchoring`). Geen externe CDN-calls meer naar unpkg of jsdelivr.

2. **Lokale JSZip bundel**: `jszip.min.js` (v3.10.1) is gebundeld als `vendor/jszip.min.js`. De multi-CDN fallback-logica is verwijderd. Geen externe script-tags meer.

3. **index.html geüpdatet**: Beide script-tags verwijzen nu naar lokale `vendor/` bestanden. De `ensureJSZipLoaded()` fallback-functie is vereenvoudigd tot een lokale check.

4. **Live getest en bevestigd**: Een bestaande origin ZIP is succesvol geverifieerd op verify-anchoring.org met Bitcoin ledger-confirmatie (block 938455). De resilience-logica voor legacy ZIPs (thumbnail hash mismatch) werkt correct — de verifier gaat door met OTS-verificatie en toont "Artifact mismatch — ledger-confirmed".

## Architectuur-context

De verificatie-infrastructuur volgt een **dual-track model**:

| | verify-anchoring.org | umarise.com/verify |
|---|---|---|
| **Rol** | Normative Reference Verifier | Convenience/Extended Verifier |
| **Backend** | Geen (100% client-side) | Umarise Core API |
| **Externe dependencies** | **Zero** (sinds vandaag) | Supabase, Core API |
| **Bitcoin verificatie** | Lokale OTS library | Via API |
| **Registry lookup** | Nee | Ja |

## Waarom dit een milestone is

- **IEC Section 9 (Independence Requirement)**: Verificatie is nu volledig mogelijk zonder enige verbinding met de issuer (Umarise) én zonder enige externe CDN. Het bewijs overleeft de uitgever.
- **Drie-lagen hiërarchie compleet**: (1) anchoring-spec.org (Specificatie) → (2) verify-anchoring.org (Reference Verifier) → (3) anchoring.app / umarise.com / itexisted.app (Implementaties). Alle drie live, alle drie onafhankelijk.
- **Zero supply-chain risk**: Geen CDN-afhankelijkheden meer. De verifier is offline-capable (behalve Bitcoin ledger-calls voor OTS-verificatie).
- **Vergelijking met 1 februari**: Een maand geleden bestond de specificatie nog niet als formeel document, was er geen onafhankelijke verifier, en was Bitcoin-verificatie afhankelijk van externe CDNs. Nu is het volledige pad — van bytes tot Bitcoin-block — autonoom verifieerbaar.

## Technische details

- **Repo**: `github.com/AnchoringTrust/verify-anchoring` (GitHub Pages, Unlicense)
- **DNS**: verify-anchoring.org via GoDaddy (4x A-record + CNAME → anchoringtrust.github.io)
- **Verificatiefunctie**: `V(B, P, L) → {valid | invalid | unverifiable}` (IEC Section 5)
- **OTS library**: opentimestamps v0.4.9, lokaal gebundeld (`vendor/opentimestamps.min.js`)
- **JSZip**: v3.10.1, lokaal gebundeld (`vendor/jszip.min.js`)
- **Externe netwerk-calls**: Alleen Bitcoin block explorers (voor OTS ledger-verificatie)

## Testmatrix

| Test | Platform | Verwacht resultaat |
|---|---|---|
| A. Nieuwe ZIP | Desktop Chrome | Valid + ledger-confirmed (of pending) |
| B. ZIP download | iOS Safari | ZIP opent correct |
| C. ZIP share | iOS Safari | Corruptie-detectie (magic bytes check) |
| D. Legacy ZIP | Desktop | "Artifact mismatch — ledger confirmed" |
