# Visibility & Developer Adoption Checklist
*Aangemaakt: 6 maart 2026 — Bijgewerkt: 7 maart 2026*

---

## A. GitHub Visibility ✅ VOLTOOID

### A1. Repository Topics ✅
Topics toegevoegd aan `Jonna1976/umarise`:
- [x] `anchoring`
- [x] `bitcoin`
- [x] `bitcoin-timestamp`
- [x] `opentimestamps`
- [x] `proof-of-existence`
- [x] `file-integrity`
- [x] `digital-proof`
- [x] `supply-chain-security`
- [x] `ci-cd`
- [x] `build-artifact`

### A2. GitHub Organization ✅
- [x] `AnchoringTrust` organization actief
- [x] Anchor-action repo gepubliceerd op GitHub Marketplace (Security categorie)
- [x] anchoring-examples repo beschikbaar als fork & go voorbeeld

### A3. Anchor-action repo ✅
- [x] `AnchoringTrust/anchor-action` live op Marketplace
- [x] anchoring-examples repo toont "Used by" voorbeeld

---

## B. Content Seeding ✅ VOLTOOID

### B1. dev.to Blogpost ✅
- [x] Blogpost geschreven (docs/devto-post-1-proof-of-existence.md)
- [x] Blogpost 2: Anchor Build Artifacts (docs/devto-post-2-anchor-build-artifacts.md)
- [x] Blogpost 3: Proof Objects (docs/devto-post-3-proof-objects.md)
- [x] Blogpost 4: AI Provenance (docs/devto-post-4-ai-provenance.md)
- [x] Gepubliceerd op dev.to
- [ ] Cross-post naar Hashnode (canonical → dev.to)
- [ ] Cross-post naar Medium (canonical → dev.to)

### B2. Show HN ✅
- [x] HN post voorbereid (docs/show-hn-post.md)
- [ ] Gepost op een werkdag, 14:00-16:00 CET (ochtend VS) — **timing: dinsdag t/m donderdag**

---

## C. Community Seeding 🔲 GEPARKEERD

*Status: voorbereid, nog niet uitgevoerd. Uitvoeren wanneer A+B traction laten zien.*

### C1. Stack Overflow
**Zoek-URLs (bewaar voor later):**
- https://stackoverflow.com/search?q=%22proof+of+existence%22+file
- https://stackoverflow.com/search?q=opentimestamps
- https://stackoverflow.com/search?q=bitcoin+timestamp+file
- https://stackoverflow.com/search?q=%22file+integrity%22+blockchain+verify

**Aanpak:**
1. Zoek een relevante vraag → klik "Add Answer" → pas template aan uit `docs/stackoverflow-templates.md`
2. Als er geen goede vragen zijn → self-answered question:
   - Titel: `How to cryptographically prove a file existed at a specific time?`
   - Tags: `cryptography`, `bitcoin`, `timestamp`, `opentimestamps`
   - Vink aan: "Answer your own question"
   - Plak Template 1 uit `docs/stackoverflow-templates.md`

**Templates:** zie `docs/stackoverflow-templates.md` (3 templates, klaar voor gebruik)

- [ ] Bestaande vraag beantwoord óf self-answered question gepost
- [ ] Template 2 (OpenTimestamps how-to) geplaatst
- [ ] Template 3 (CI/CD build artifacts) geplaatst

### C2. Reddit
**Zoek-URLs (bewaar voor later):**
- https://www.reddit.com/r/Bitcoin/search/?q=timestamp&sort=new
- https://www.reddit.com/r/devops/search/?q=artifact+signing&sort=new
- https://www.reddit.com/r/netsec/search/?q=supply+chain+security&sort=new
- https://www.reddit.com/r/selfhosted/search/?q=document+notarization&sort=new

**Template comment:**
> You can anchor any file hash into Bitcoin via OpenTimestamps. There's a CLI for it: `npx @umarise/cli anchor yourfile.pdf`. The proof is independently verifiable at verify-anchoring.org. Open spec at anchoring-spec.org.

- [ ] r/bitcoin — relevante thread beantwoord
- [ ] r/devops — relevante thread beantwoord
- [ ] r/netsec — relevante thread beantwoord
- [ ] r/selfhosted — relevante thread beantwoord

### C3. Awesome Lists PR's
**Exacte stappen per repo:**

**awesome-bitcoin** (https://github.com/igorbarinov/awesome-bitcoin):
- Fork → edit README.md → "Utilities"/"Tools" sectie
- Voeg toe: `- [Umarise Anchor](https://github.com/AnchoringTrust/anchor-action) - Anchor any file to Bitcoin via OpenTimestamps. CLI, Node.js SDK, Python SDK, GitHub Action.`
- Open PR

**awesome-actions** (https://github.com/sdras/awesome-actions):
- Fork → edit README.md → "Security" sectie
- Voeg toe: `- [Umarise Anchor Action](https://github.com/marketplace/actions/umarise-anchor) - Bitcoin-timestamp any build artifact with one YAML line.`
- Open PR

**awesome-security** (https://github.com/sbilly/awesome-security):
- Fork → edit README.md → "Other"/"Tools" sectie
- Voeg toe: `- [Umarise](https://umarise.com) - Anchoring infrastructure for digital proof. Anchor file hashes to Bitcoin via OpenTimestamps.`
- Open PR

- [ ] awesome-bitcoin PR ingediend
- [ ] awesome-actions PR ingediend
- [ ] awesome-security PR ingediend

---

## D. Backlink Strategie 🔲 GEPARKEERD

*Status: voorbereid, nog niet uitgevoerd. Uitvoeren na C.*

### Bestaande backlinks
- [x] anchoring-spec.org → umarise.com
- [x] umarise.com.ipaddress.com → umarise.com (auto)

### D1. Wikipedia
- Ga naar https://en.wikipedia.org/wiki/Proof_of_existence
- Klik "Edit" → scroll naar "External links" / "See also"
- Voeg toe: `* [Anchoring Specification](https://anchoring-spec.org) - Open specification for cryptographic anchoring (IEC v1.0)`
- Edit summary: `Added link to open anchoring specification`
- [ ] Wikipedia edit ingediend

### D2. AlternativeTo
- Ga naar https://alternativeto.net/manage/add-application/
- Name: `Umarise`
- URL: `https://umarise.com`
- Description: `Anchoring infrastructure for digital proof. Anchor any file hash to Bitcoin via OpenTimestamps. CLI, SDKs, GitHub Action.`
- Tags: `proof-of-existence`, `bitcoin`, `timestamp`, `file-integrity`
- [ ] AlternativeTo listing aangemaakt

### D3. Show HN (herhaling van B2)
- Post op https://news.ycombinator.com/submit
- Title: `Show HN: Anchor any file to Bitcoin with one CLI command`
- URL: `https://umarise.com/blog/proof-of-existence`
- Timing: dinsdag t/m donderdag, 14:00-16:00 CET
- Na het posten: eerste comment met tekst uit `docs/show-hn-post.md`
- [ ] HN post live

---

## E. Registry Badges op Site 🔲 GEPARKEERD

*Status: voorbereid, uitvoeren wanneer npm/PyPI packages traction hebben.*

### Op /developers pagina:
- [ ] npm badge: `[![npm](https://img.shields.io/npm/v/@umarise/anchor)](https://npmjs.com/package/@umarise/anchor)`
- [ ] PyPI badge: `[![PyPI](https://img.shields.io/pypi/v/umarise-core-sdk)](https://pypi.org/project/umarise-core-sdk/)`
- [ ] GitHub Action badge: `[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Anchor%20Action-blue)](https://github.com/marketplace/actions/umarise-anchor)`

---

## Metrics om te volgen (wekelijks)
| Metric | Tool | Doel week 4 |
|--------|------|-------------|
| npm downloads/week | npmjs.com | 500+ |
| PyPI downloads/week | pypistats.org | 100+ |
| GitHub stars | GitHub | 10+ |
| Google impressions | Search Console | 500+ |
| dev.to views | dev.to dashboard | 1000+ |
| HN upvotes | news.ycombinator.com | 20+ |
| API keys generated | internal metrics | 5+ |
