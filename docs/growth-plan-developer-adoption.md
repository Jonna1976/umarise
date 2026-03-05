# Developer Adoption & SEO Growth Plan
*Opgesteld: 5 maart 2026*

## Status
- [x] Custom domein umarise.com gekoppeld
- [x] Google Search Console geverifieerd (DNS)
- [x] Sitemap ingediend (https://umarise.com/sitemap.xml)
- [ ] Eerste indexering afwachten (2-7 dagen)

---

## Fase 1 — npm/PyPI vindbaarheid (direct)
- [ ] `sdk/node/package.json` → keywords toevoegen: proof of existence, bitcoin timestamp, opentimestamps, file integrity, anchoring, digital proof, sha256, immutable record
- [ ] `sdk/python/pyproject.toml` → keywords/classifiers toevoegen (let op: ultra-compatible metadata, geen license-expression)
- [ ] Beide READMEs verbeteren: install → anchor → verify in 30 seconden

## Fase 2 — Content & backlinks (week 1-2)
- [ ] dev.to blogpost: "How to anchor files to Bitcoin with one API call"
- [ ] Structuur: probleem → oplossing → code snippet → live demo link
- [ ] Cross-post naar Hashnode en Medium (canonical naar dev.to)

## Fase 3 — GitHub visibility (week 2-4)
- [ ] GitHub repo topics toevoegen: anchoring, bitcoin, opentimestamps, proof-of-existence, digital-proof, file-integrity
- [ ] GitHub Organization opzetten (umarise)
- [ ] Professionele org README met links naar SDKs, spec, verifier

## Fase 4 — Community seeding (maand 1-3)
- [ ] Stack Overflow: beantwoord vragen over "proof of existence", "file timestamp", "document integrity"
- [ ] Reddit: r/crypto, r/bitcoin, r/selfhosted — relevante threads
- [ ] Dependency chain: zoek open-source projecten die timestamps/integrity nodig hebben → PR of mention

---

## Metrics om te volgen
- npm weekly downloads (https://www.npmjs.com/package/umarise)
- PyPI downloads (https://pypi.org/project/umarise/)
- Google Search Console: impressions, clicks, indexed pages
- GitHub stars + forks
