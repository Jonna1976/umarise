# Pilot Outreach Status

**Date**: January 29, 2026  
**Status**: Ready for CTO outreach

## Live URLs

| Page | URL | Purpose |
|------|-----|---------|
| Review Kit | `umarise.com/review` | Initial CTO evaluation |
| Docs Export | `umarise.com/docs-export` | PDF documentation |
| Technical Preview | `umarise.com/pilot` | Post-commitment onboarding |

## DNS Status

- **Domain**: umarise.com
- **A Record**: 185.158.133.1 (Lovable)
- **Propagation**: ✓ Complete (verified via DNSChecker.org)
- **SSL**: ✓ Active

## Email Template (Paul)

```
Hoi Paul,

Hopelijk alles goed met je / jullie. Sinds ons laatste gesprek over de 
private-by-design stack ben ik verder gaan denken over de onderliggende 
infrastructuurvraag en heb daar ook concreet op doorgebouwd.

Ik werk momenteel aan een infrastructuurlaag en wil dit expliciet niet laten 
reviewen als product, codebase of security setup.

Wat ik zoek is jouw CTO-analyse op stack-niveau.


Umarise

Het gaat om een system-of-record dat vastlegt wat er bestond vóórdat AI of 
workflows het transformeren.

Kun je 30 minuten tijd vrijmaken om onderstaande te bekijken? Ik leg het aan 
nog twee andere sterke denkers voor maar zoek nu validatie op infrastructuurniveau.

1. Review Kit (alles in één URL)
   https://umarise.com/review

   Bevat:
   - Origin View demo (read-only)
   - Proof Bundle (downloadbaar)
   - integration-contract.md — API primitives
   - layer-boundaries.md — wat het systeem wel en niet is

2. PDF bijlagen
   https://umarise.com/docs-export

   Geen admin UI. Geen database. Geen server-toegang.

3. Technical Preview (voor na evaluatie)
   Indien je na review een pilot wilt verkennen:
   https://umarise.com/pilot

4. Feedback (3 vragen)

   1. Als je dit leest: waar zou dit in jouw stack moeten zitten?
   2. Wat gebeurt er in jouw systemen als deze laag er níet is, maar AI en workflows wel?
   3. Is dit voor jou: irrelevant, vanzelfsprekend, of fundamenteel?

Ik ga niets verdedigen of uitleggen. Ik wil horen waar het schuurt of juist 
onmiddellijk klopt.

Jouw feedback zou enorm helpen.

Groet,
Jonna
```

## Follow-up (after positive response)

Share: `umarise.com/pilot`
- Technical Preview page
- API Quick Start (curl examples)
- Tech Lead Checklist
- 21-day timeline
