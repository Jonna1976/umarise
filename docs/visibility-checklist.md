# Visibility & Developer Adoption Checklist
*Aangemaakt: 6 maart 2026*

---

## A. GitHub Visibility (vandaag)

### A1. Repository Topics
Voeg deze topics toe aan `Jonna1976/umarise` → Settings → About:
- [ ] `anchoring`
- [ ] `bitcoin`
- [ ] `bitcoin-timestamp`
- [ ] `opentimestamps`
- [ ] `proof-of-existence`
- [ ] `file-integrity`
- [ ] `digital-proof`
- [ ] `supply-chain-security`
- [ ] `ci-cd`
- [ ] `build-artifact`

### A2. GitHub Organization
- [ ] Maak GitHub Organization `umarise` (of `AnchoringTrust` als dat al bestaat)
- [ ] Voeg professionele org README toe (`.github/profile/README.md`)
- [ ] Link naar: anchoring-spec.org, verify-anchoring.org, umarise.com
- [ ] Pin de belangrijkste repos: anchor-action, python-sdk, anchoring-spec

### A3. Anchor-action repo
- [ ] Controleer of `AnchoringTrust/anchor-action` repo topics heeft
- [ ] Voeg `Used by` voorbeeld toe (anchoring-examples repo)

---

## B. Content Seeding (deze week)

### B1. dev.to Blogpost
**Titel**: "How to Anchor Any File to Bitcoin with One API Call"

**Structuur**:
1. **Hook**: "File metadata lies. Timestamps can be faked. Here's a primitive that fixes it."
2. **Problem**: Bestanden hebben geen betrouwbare herkomst
3. **Solution**: `umarise anchor report.pdf` — one line, done
4. **Code snippets**:
   - CLI: `npx @umarise/cli anchor <file>`
   - Python: `pip install umarise-core-sdk` + 5 regels
   - GitHub Action: 4 regels YAML
5. **Live demo**: Link naar verify-anchoring.org met voorbeeld .proof file
6. **CTA**: "Get your API key at umarise.com/developers"

**Tags**: `bitcoin`, `security`, `devops`, `opensource`

- [ ] Blogpost geschreven
- [ ] Gepubliceerd op dev.to
- [ ] Cross-post naar Hashnode (canonical → dev.to)
- [ ] Cross-post naar Medium (canonical → dev.to)

### B2. Show HN
**Titel**: "Show HN: One-line CI action to anchor build artifacts to Bitcoin"

**Body** (kort):
```
We built a CI primitive that creates a Bitcoin-timestamped proof 
for any file. One YAML line in your workflow:

  - uses: AnchoringTrust/anchor-action@v1
    with: { file: dist/app.tar.gz }

Result: app.tar.gz.proof appears as a build artifact.
Verify offline, no account needed: verify-anchoring.org

npm: @umarise/anchor
PyPI: umarise-core-sdk
Spec: anchoring-spec.org

We're not a blockchain startup. We use Bitcoin as a timestamp 
server via OpenTimestamps. The proof is math, not marketing.
```

- [ ] HN post voorbereid
- [ ] Gepost op een werkdag, 14:00-16:00 CET (ochtend VS)

---

## C. Community Seeding (week 2-4)

### C1. Stack Overflow
Zoek en beantwoord vragen met deze tags/keywords:
- [ ] "proof of existence"
- [ ] "file timestamp blockchain"
- [ ] "document integrity verification"
- [ ] "opentimestamps how to use"
- [ ] "bitcoin timestamp file"

Template antwoord:
> You can use OpenTimestamps for this. If you want a managed API that handles the 
> batching and proof lifecycle: `pip install umarise-core-sdk` or 
> `npx @umarise/cli anchor <file>`. [Docs](https://umarise.com/developers)

### C2. Reddit
Relevante subreddits (beantwoord, niet spam):
- [ ] r/bitcoin — threads over timestamps/notarization
- [ ] r/selfhosted — threads over document management
- [ ] r/devops — threads over artifact signing/integrity
- [ ] r/netsec — threads over supply chain security

### C3. Awesome Lists
Dien PR's in bij:
- [ ] awesome-bitcoin
- [ ] awesome-security
- [ ] awesome-devops
- [ ] awesome-github-actions

---

## D. Backlink Strategie (lopend)

### Bestaande backlinks
- [x] anchoring-spec.org → umarise.com
- [x] umarise.com.ipaddress.com → umarise.com (auto)

### Nieuwe backlinks genereren
- [ ] Wikipedia: "Proof of Existence" artikel — voeg anchoring-spec.org toe als referentie
- [ ] AlternativeTo: registreer umarise als alternatief voor "Proof of Existence" tools
- [ ] Product Hunt: launch voorbereiden (later, als er meer traction is)

---

## E. Registry Badges op Site

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
