---
title: "Milestone Briefing — 4 maart 2026"
date: 2026-03-04
status: canonical
applies_to: "@umarise/cli, @umarise/anchor, AnchoringTrust/anchor-action, verify-anchoring.org"
iec_version: "1.0"
---

# Milestone Briefing — 4 maart 2026

## De cirkel is compleet

Vandaag is het volledige pad van de Anchoring Specification — van bytes tot Bitcoin-block tot onafhankelijke verificatie — end-to-end bewezen via drie nieuwe publieke primitieven:

```
bytes → SHA-256 → anchor(hash) → .ots proof → Bitcoin block → V(B,P,L) → VALID
```

### Bewezen flow (live getest, 4 maart 2026)

| Stap | Actie | Resultaat |
|---|---|---|
| 1 | **Input**: willekeurig bestand (`test3.txt`) | — |
| 2 | **Hash**: lokaal berekend, bytes nooit verstuurd | `sha256:1d10e0d...` |
| 3 | **Anchor**: `POST /v1-core-origins` | `origin_id: 349d6734-...` |
| 4 | **Proof**: `GET /v1-core-proof` | binary `.ots` (3.7 KB) |
| 5 | **Bitcoin**: block 935037 | ledger timestamp 2026-02-04 20:56:02 UTC |
| 6 | **Onafhankelijke verificatie**: verify-anchoring.org | **VALID — LEDGER-CONFIRMED** |

Geen Umarise-infrastructuur nodig voor stap 6. Dat is de kern van IEC Section 9 (Independence Requirement).

**"Saven" hoeft niet in de cirkel** — de `.ots` proof *is* het eindproduct. Waar je het opslaat (Desktop, Git, S3) is een gebruikerskeuze, geen architectuurstap. De ZIP-met-artifact is een Companion-feature, niet Core.

---

## Wat er vandaag is gepubliceerd

### 1. `@umarise/cli` — npm package (v1.0.0)

**Live op npm:** [npmjs.com/package/@umarise/cli](https://www.npmjs.com/package/@umarise/cli)

```bash
npm install -g @umarise/cli
export UMARISE_API_KEY=um_live_...

umarise anchor document.pdf    # → document.pdf.proof
umarise verify document.pdf document.pdf.proof
```

| Eigenschap | Waarde |
|---|---|
| Binary | `umarise` |
| Commando's | `anchor <file>`, `verify <file> <file>.proof` |
| Verificatie | Offline-first (lokale OTS library v0.4.9), fallback naar API |
| Output | `.proof` ZIP (certificate.json + proof.ots + VERIFY.txt) |
| Licentie | Unlicense (public domain) |
| Afhankelijkheden | `@umarise/anchor`, `jszip`, `opentimestamps` |

**Wat dit uniek maakt:** De CLI is stateless — geen account, geen login, geen dashboard. Eén environment variable (`UMARISE_API_KEY`), twee commando's. Verificatie werkt lokaal tegen de Bitcoin blockchain zonder API-calls. Geen enkele concurrent biedt dit: de meeste anchoring-diensten vereisen een account, dashboard, en hun eigen verificatie-infrastructuur.

### 2. `@umarise/anchor` — Node.js SDK (v1.0.0)

**Live op npm:** [npmjs.com/package/@umarise/anchor](https://www.npmjs.com/package/@umarise/anchor)

```typescript
import { UmariseCore } from '@umarise/anchor';

const client = new UmariseCore({ apiKey: 'um_live_...' });
const result = await client.attest('sha256:...');
// → { origin_id, hash, captured_at, proof_status }
```

| Eigenschap | Waarde |
|---|---|
| API | Class-based: `attest()`, `verify()`, `resolve()`, `proof()`, `health()` |
| Base URL | `https://core.umarise.com` |
| Licentie | Unlicense |

### 3. `AnchoringTrust/anchor-action` — GitHub Action (v1.0.0)

**Live op GitHub Marketplace:** [github.com/marketplace/actions/umarise-anchor](https://github.com/marketplace/actions/umarise-anchor)

```yaml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: build/output.pdf
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

| Eigenschap | Waarde |
|---|---|
| Categorie | Security |
| Runtime | Node 20 |
| Output | `.proof` artifact in workflow run |
| Outputs | `origin-id`, `hash`, `proof-path` |

**Wat dit uniek maakt:** Eén regel YAML in een bestaande CI/CD pipeline. Geen extra infrastructure, geen vendor lock-in. Het `.proof` bestand wordt een build artifact naast je binary — net als een `.sig` of `.sbom`. Geen enkele anchoring-dienst biedt dit als one-line CI/CD integratie.

---

## Waarom dit een milestone is

### De MVI-strategie is compleet

De drie pijlers van de Minimal Viable Infrastructure zijn nu alle drie live:

| Pijler | Status | URL |
|---|---|---|
| One API | ✅ Live | `core.umarise.com` |
| One CLI | ✅ Published | `@umarise/cli` op npm |
| One CI/CD | ✅ Marketplace | `AnchoringTrust/anchor-action` |

### Structureel onderscheid van concurrenten

| Eigenschap | Umarise | Typische concurrent |
|---|---|---|
| Account vereist voor verificatie | Nee | Ja |
| Dashboard nodig | Nee | Ja |
| Proof overleeft de provider | Ja (.ots + Bitcoin) | Nee (vendor database) |
| Offline verificatie mogelijk | Ja (CLI, verify-anchoring.org, OS-tools) | Nee |
| CI/CD integratie | Eén regel YAML | SDK + configuratie + account |
| Bestand gezien door server | Nooit (hash-only) | Meestal ja |

**Kernprincipe:** Concurrenten verkopen anchoring als een *dienst* met vendor lock-in. Umarise levert het als een *primitief* — het bewijs is compleet zonder ons. Dat is een structureel voordeel dat SaaS-concurrenten niet kunnen kopiëren zonder hun eigen businessmodel te ondermijnen.

### Vier-track verificatie volledig operationeel

| Track | Methode | Status |
|---|---|---|
| A1 | In-app (itexisted.app/verify) | ✅ Live |
| A2 | B2B API (`POST /v1-core-verify`) | ✅ Live |
| B1 | ZIP Verifier (verify-anchoring.org) | ✅ Live |
| B2 | Hash + OTS Verifier (verify-anchoring.org) | ✅ Live — vandaag bewezen |
| C | CLI / OS-tools (`sha256sum` + `ots verify`) | ✅ Live |

---

## Technische details

- **SDK base URL**: `https://core.umarise.com` (hardcoded default)
- **CLI bundling**: `ncc build` voor GitHub Action, `npm pack` voor CLI
- **OTS library**: opentimestamps v0.4.9 (gebundeld in CLI + verify-anchoring.org)
- **Sync workflow**: `.github/workflows/sync-github-action.yml` synchroniseert monorepo → `AnchoringTrust/anchor-action`
- **Bitcoin confirmatie**: ~2 uur na registratie (OTS batcht per uur, Bitcoin block time variabel)

## Deployment status

| Categorie | Done | Remaining |
|---|---|---|
| Code completeness | 39/44 | 5 post-publish verificaties |
| npm packages | 2/2 | — |
| GitHub Marketplace | 1/1 | — |
| Cross-verificatie | ✅ | verify-anchoring.org bewezen (block 935037) |

Volledige checklist: [`docs/deployment-checklist-cli-action.md`](./deployment-checklist-cli-action.md)

---

*Milestone documentatie — 4 maart 2026.*
