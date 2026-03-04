# Audit: Vier-Lagen Model — Volledige Checklist
*4 maart 2026 — v1.0*

---

## Totaal Overzicht

| Laag | Naam | Max | Score | Status |
|------|------|-----|-------|--------|
| 1 | The Primitive | 31 | **30** | ✅ E5 (terminologie-adoptie) open |
| 2 | Developer Infrastructure | 15 | **15** | ✅ Compleet |
| 3 | Assurance | 8 | **5** | 🔶 SLA + uptime live, SOC2/ISO/DPA ontbreekt |
| 4 | Expertise | 5 | **2** | 🔶 Latent — docs klaar, nog geen partner-deliveries |
| **Totaal** | | **59** | **52** | **88%** |

---

## Laag 1 · The Primitive — 30/31

> Referentie: docs/audit-primitive-or-product-march-2026.md

| Sectie | Max | Score | Status |
|--------|-----|-------|--------|
| A. Core API | 6 | **6** | ✅ Compleet |
| B. Verificatie | 5 | **5** | ✅ Compleet |
| C. Onboarding | 5 | **5** | ✅ Sandbox live |
| D. Grens bewaking | 6 | **6** | ✅ Zuiver primitief |
| E. Spec en taal | 5 | **4** | E5 adoptie-bewijs volgt |
| F. Laag 3 en 4 specs | 4 | **4** | ✅ Compleet |

**Open punt:**
- [ ] E5: Verzamel eerste bewijs van terminologie-adoptie door externen

---

## Laag 2 · Developer Infrastructure — 15/15

| # | Vraag | Status | Implementatie |
|---|-------|--------|---------------|
| 1 | SDKs in 2+ talen beschikbaar? | ✅ | Python + Node.js, public domain |
| 2 | API reference met live demo? | ✅ | /api-reference, curl-voorbeelden, AI-support |
| 3 | Sandbox/test keys zonder onboarding? | ✅ | um_test_ prefix, auto-valid, unlimited |
| 4 | Reference verifier onafhankelijk? | ✅ | verify-anchoring.org, zero-backend |
| 5 | Integration templates beschikbaar? | ✅ | Python + Node test suites |
| 6 | Rate limiting per tier? | ✅ | core_rate_limits, configureerbaar per key |
| 7 | Per-key usage metrics? | ✅ | core_request_log + v1-internal-metrics |
| 8 | Credit spend awareness? | ✅ | X-Credits-Remaining, X-Credits-Low headers |
| 9 | Integration checklist? | ✅ | /api-reference checklist sectie |
| 10 | AI integration path gedocumenteerd? | ✅ | AI prompt + support chatbot |
| 11 | Quickstart < 30 minuten? | ✅ | Gevalideerd met DataVault test |
| 12 | Foutmeldingen begrijpelijk en actionable? | ✅ | Gestandaardiseerde error codes |
| 13 | npm/PyPI publicatie-klaar? | ✅ | @umarise/anchor + umarise package |
| 14 | Anchoring Specification publiek? | ✅ | anchoring-spec.org, frozen v1.0 |
| 15 | Stripe credit purchase flow? | ✅ | Payment Link → webhook → balance update |

**Score: 15/15 — Volledig operationeel voor partner onboarding.**

---

## Laag 3 · Assurance — 5/8

| # | Vraag | Status | Implementatie |
|---|-------|--------|---------------|
| 1 | Uptime commitment publiek? | ✅ | 99.9% target, /status pagina |
| 2 | Health check monitoring live? | ✅ | 5-minuten interval, sparkline |
| 3 | SLA template beschikbaar? | ✅ | docs/sla-template-v1.md |
| 4 | Incident response tijden gedefinieerd? | ✅ | Critical 30m, High 2u, Medium 8u, Low 5d |
| 5 | Compensatiemodel vastgelegd? | ✅ | Anchor-credits: 5%/15%/30% staffel |
| 6 | SOC2 Type II audit? | ❌ | Trigger: enterprise security questionnaire |
| 7 | ISO 27001 certificering? | ❌ | Trigger: enterprise procurement vereist het |
| 8 | DPA/DPIA template beschikbaar? | ❌ | Trigger: partner met EU data processing |

**Open punten:**
- [ ] SOC2 Type II — pas bij enterprise questionnaire
- [ ] ISO 27001 — pas bij enterprise procurement
- [ ] DPA/DPIA template — pas bij EU data processing partner

**Note:** Per doctrine worden deze pas geactiveerd bij specifieke partner-triggers. De score van 5/8 is correct voor de huidige fase (pre-enterprise).

---

## Laag 4 · Expertise — 2/5

| # | Vraag | Status | Implementatie |
|---|-------|--------|---------------|
| 1 | Architecture review als dienst beschikbaar? | ❌ | Latent — nog geen partner-aanvraag |
| 2 | Onboarding support gedocumenteerd? | ✅ | Partner onboarding workflow v2 |
| 3 | Integration guidance beschikbaar? | ✅ | docs/partner-onboarding-workflow-v2.md |
| 4 | Compliance whitepapers beschikbaar? | ❌ | Trigger: partner compliance-team vraagt |
| 5 | Dedicated TAM/support tier? | ❌ | Trigger: meerdere betalende partners |

**Open punten:**
- [ ] Architecture review service — triggered by partner request
- [ ] Compliance whitepapers — triggered by partner compliance team
- [ ] Dedicated TAM/support tier — triggered by multiple paying partners

**Note:** Laag 4 is per definitie latent en human-led. Een score van 2/5 is verwacht in de pre-revenue fase. De documentatie-basis is aanwezig; de dienstverlening wordt geactiveerd bij vraag.

---

## Samenvatting per fase

| Fase | Lagen | Score | Verwacht |
|------|-------|-------|----------|
| **Pre-adoption** (nu) | L1 + L2 | 45/46 (98%) | Seeding engine compleet |
| **Post-first-partner** | L3 | 5/8 (63%) | Groeit bij enterprise triggers |
| **Post-revenue** | L4 | 2/5 (40%) | Groeit bij schaal |
| **Totaal** | Alle | 52/59 (88%) | Conform doctrine |

---

## Kernconstatering

> Lagen 1 en 2 zijn het seeding engine — **98% compleet**.
> Lagen 3 en 4 zijn de revenue — **per doctrine pas geactiveerd bij partner-triggers**.
>
> De 12% "gap" is geen achterstand maar een bewuste keuze:
> SOC2, ISO, DPA en TAM worden pas gebouwd als er een betalende partner is die erom vraagt.

---

## Doctrine-consistentie check

| Beslissing | Doctrine-test | Resultaat |
|------------|---------------|-----------|
| SOC2 niet bouwen vóór vraag | Plumbing, niet workflow | ✅ Correct |
| Geen compliance dashboard | Geen SaaS feature | ✅ Correct |
| Architecture review latent | Human-led, niet automated | ✅ Correct |
| Stripe credits zonder portal | Payment Link, niet dashboard | ✅ Correct |
| SLA als document, niet als feature | Assurance, niet workflow | ✅ Correct |

---

*Document version: 1.0 · 4 maart 2026*
