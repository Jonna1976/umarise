# Deployment Checklist — GitHub Pages

## Org: AnchoringTrust

---

## Repo A: anchoring-spec

**Domain:** anchoring-spec.org

### Pre-deploy
- [ ] GitHub repo created: `AnchoringTrust/anchoring-spec`
- [ ] Files pushed: `index.html`, `v1.0/index.html`, `v1.0/iec.md`, `one-page/index.html`, `appendix/why-anchoring/index.html`, `README.md`, `LICENSE`, `CNAME`, `.nojekyll`
- [ ] `CNAME` file contains: `anchoring-spec.org`
- [ ] `.nojekyll` file present (prevents Jekyll processing)

### GitHub Pages
- [ ] Settings → Pages → Source: `main` branch, `/ (root)`
- [ ] "Enforce HTTPS" enabled

### DNS (at registrar)
- [ ] A record: `@` → `185.199.108.153`
- [ ] A record: `@` → `185.199.109.153`
- [ ] A record: `@` → `185.199.110.153`
- [ ] A record: `@` → `185.199.111.153`
- [ ] CNAME record: `www` → `anchoringtrust.github.io`
- [ ] TXT record (optional, for verification)

### Post-deploy
- [ ] `https://anchoring-spec.org` loads correctly
- [ ] `https://anchoring-spec.org/v1.0/` loads v1.0 spec
- [ ] `https://anchoring-spec.org/one-page/` loads one-page reference
- [ ] SSL certificate active (green padlock)
- [ ] `<link rel="canonical">` points to `https://anchoring-spec.org`
- [ ] Cross-link to verify-anchoring.org in footer works

### Release
- [ ] Git tag: `v1.0`
- [ ] GitHub Release created with notes: "Frozen normative text — IEC v1.0"
- [ ] Release marked as "Latest"

---

## Repo B: verify-anchoring

**Domain:** verify-anchoring.org

### Pre-deploy
- [ ] GitHub repo created: `AnchoringTrust/verify-anchoring`
- [ ] Files pushed: `index.html`, `README.md`, `LICENSE`, `SECURITY.md`, `CNAME`, `.nojekyll`
- [ ] `CNAME` file contains: `verify-anchoring.org`
- [ ] `.nojekyll` file present

### GitHub Pages
- [ ] Settings → Pages → Source: `main` branch, `/ (root)`
- [ ] "Enforce HTTPS" enabled

### DNS (at registrar)
- [ ] A records: same 4 GitHub Pages IPs as above
- [ ] CNAME record: `www` → `anchoringtrust.github.io`

### Post-deploy
- [ ] `https://verify-anchoring.org` loads correctly
- [ ] SSL certificate active (green padlock) — **priority: SSL-fout is dodelijk voor een verifier**
- [ ] File upload + verification works end-to-end
- [ ] SRI integrity hash on JSZip CDN tag validates
- [ ] No external analytics/trackers loaded (verify in DevTools Network tab)
- [ ] Cross-link to anchoring-spec.org in header works
- [ ] Cross-link to umarise.com/verify in footer works

### Release
- [ ] Git tag: `v1.0`
- [ ] GitHub Release created with notes: "Reference verifier v1.0"

---

## Repo C (optional): anchoring-cli

**Purpose:** Placeholder for CLI verification path

### Setup
- [ ] GitHub repo created: `AnchoringTrust/anchoring-cli`
- [ ] README.md with CLI verification instructions:
  ```
  # Anchoring CLI Verification
  
  Verify anchoring proofs using standard command-line tools.
  
  ## Quick start
  shasum -a 256 artifact.ext
  ots verify proof.ots
  
  ## Full documentation
  Coming soon. See anchoring-spec.org for the normative specification.
  ```
- [ ] LICENSE (Unlicense)

---

## Cross-links verification

After both sites are live:

- [ ] `anchoring-spec.org` footer → links to `verify-anchoring.org` ✓
- [ ] `verify-anchoring.org` header → links to `anchoring-spec.org` ✓
- [ ] `verify-anchoring.org` footer → "Extended checks at umarise.com/verify" ✓
- [ ] `umarise.com/verify` → "Independent verification at verify-anchoring.org" ✓

---

## Immutability discipline

- [ ] `v1.0` tag is frozen — no further commits to tagged content
- [ ] Future corrections via `v1.0-errata` or `v1.1`
- [ ] Verifier may evolve, but each release is tagged
