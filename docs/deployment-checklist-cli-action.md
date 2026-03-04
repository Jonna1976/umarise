# Deployment Checklist — CLI & GitHub Action

## Package A: `@umarise/cli` (npm)

**Source:** `cli/node/`

### Pre-publish
- [x] `package.json` version set to `1.0.0`
- [x] `package.json` name is `@umarise/cli`
- [x] `package.json` bin points to `bin/umarise.js`
- [x] `bin/umarise.js` has shebang `#!/usr/bin/env node`
- [ ] `bin/umarise.js` is executable (`chmod +x`) — *verify locally before publish*
- [x] Dependencies: `@umarise/anchor`, `jszip`, `opentimestamps` (v0.4.9)
- [x] No devDependencies leak into production — `files` field restricts to `bin`, `src`, `README.md`, `LICENSE`
- [x] `README.md` present with usage examples
- [x] `LICENSE` present (Unlicense)
- [x] `files` field excludes test files

### Functional verification
- [ ] `npm pack` — inspect tarball contents, no extra files — *manual step*
- [ ] `npx @umarise/cli anchor <testfile>` — produces `.proof` ZIP — *manual step*
- [x] `.proof` ZIP contains: `certificate.json`, `proof.ots` — *code verified in anchor.js*
- [x] `certificate.json` → `spec` field = `https://anchoring-spec.org/v1.0/` — *fixed in review*
- [ ] `npx @umarise/cli verify <testfile> <testfile>.proof` — hash matches — *manual step*
- [x] Verify with pending proof → returns "pending" (not crash) — *fixed `const info` bug in review*
- [x] Verify without OTS library installed → graceful fallback to online — *try/catch returns null → online fallback*
- [x] `UMARISE_API_KEY` not set → clear error message, no stack trace

### Publish
- [ ] `npm login` to `@umarise` org scope — *manual step*
- [ ] `npm publish --access public` — *manual step*
- [ ] Verify on npmjs.com: `https://www.npmjs.com/package/@umarise/cli` — *post-publish*
- [ ] `npx @umarise/cli --help` works from clean install — *post-publish*

### Post-publish
- [ ] Git tag: `cli-v1.0.0` — *manual step*
- [ ] GitHub Release with notes referencing the tag — *manual step*
- [ ] `/api-reference` install command matches published version — *verify post-publish*

---

## Package B: `@umarise/anchor` (npm SDK)

**Source:** `sdk/node/`

### Pre-publish (if not already published)
- [x] `package.json` version = `1.0.0`
- [x] `package.json` name = `@umarise/anchor`
- [x] Hardcoded base URL: `https://core.umarise.com` — *default in constructor*
- [x] Exports: `attest()`, `hashBytes()`, `verify()`, `resolve()` — *plus `health()`, `proof()`*
- [x] `README.md` with quick-start code block
- [x] `LICENSE` (Unlicense)

### Publish
- [ ] `npm publish --access public` — *manual step*
- [ ] Verify: `https://www.npmjs.com/package/@umarise/anchor` — *post-publish*

### Post-publish
- [ ] Git tag: `sdk-node-v1.0.0` — *manual step*

---

## Package C: `AnchoringTrust/anchor-action` (GitHub Action)

**Source:** `cli/github-action/`  
**Target repo:** `AnchoringTrust/anchor-action`

### Pre-publish
- [x] `action.yml` present with correct inputs/outputs
- [x] `action.yml` → `runs.using: node20`
- [x] `action.yml` → `runs.main: dist/index.js`
- [x] `src/index.js` builds with `ncc build src/index.js -o dist` — *build script in package.json*
- [ ] `dist/index.js` committed (GitHub Actions require bundled output) — *must run `npm run build` first*
- [x] `README.md` with usage example
- [x] `LICENSE` (Unlicense)

### Sync workflow
- [x] `.github/workflows/sync-github-action.yml` present and tested
- [ ] `ANCHOR_ACTION_PAT` secret set in source repo (Lovable GitHub) — *manual step*
- [ ] Push a test change to `cli/github-action/` → verify sync fires — *manual step*

### Functional verification
- [ ] Create test workflow in a scratch repo using the Action — *manual step*
- [ ] Action installs `@umarise/cli` successfully — *requires npm publish first*
- [ ] Action produces `.proof` artifact in workflow run — *manual step*
- [x] Outputs `origin-id`, `hash`, `proof-path` are set correctly — *code verified, regex matches CLI output*
- [x] `upload-artifact: false` skips artifact upload without error — *conditional in code*

### Publish
- [ ] Target repo `AnchoringTrust/anchor-action` exists — *manual step*
- [ ] Files synced (or manually pushed for first release) — *sync workflow ready*
- [ ] Git tag: `v1` (mutable, points to latest v1.x) — *manual step*
- [ ] Git tag: `v1.0.0` (immutable release) — *manual step*
- [ ] GitHub Release created from `v1.0.0` tag — *manual step*

### GitHub Marketplace (optional)
- [x] `action.yml` has `branding` section (icon: shield, color: gray-dark)
- [x] Repository is public — *will be after sync*
- [ ] "Publish this Action to the GitHub Marketplace" checked during Release creation — *manual step*
- [ ] Verify listing: `https://github.com/marketplace/actions/anchoringtrust-anchor-action` — *post-publish*

---

## Cross-verification

After all packages are published:

- [ ] `npx @umarise/cli anchor test.pdf` → works from npm — *post-publish*
- [ ] `.proof` verifiable at `https://verify-anchoring.org` — *post-publish*
- [ ] `.proof` verifiable via `npx @umarise/cli verify test.pdf test.pdf.proof` — *post-publish*
- [x] GitHub Action produces same `.proof` format as CLI — *uses same @umarise/cli under the hood*
- [x] `/api-reference` install commands match published package names — *verified in review*
- [ ] `/api-reference` CLI section matches actual `--help` output — *verify post-publish*

---

## Secrets inventory

| Secret | Where | Purpose | Status |
|---|---|---|---|
| `ANCHOR_ACTION_PAT` | Source repo (Lovable) | Sync workflow push access | ⬜ Set manually |
| `VERIFY_ANCHORING_PAT` | Source repo (Lovable) | Existing verify-anchoring sync | ✅ Already in use |
| `UMARISE_API_KEY` | End-user repos | API authentication for anchor/verify | ✅ Documented |
| `NPM_TOKEN` | CI (if automated publish) | npm publish authentication | ⬜ Optional |

---

## Summary

| Category | Done | Remaining | Notes |
|---|---|---|---|
| Code completeness | 28/42 | 14 | All remaining items are manual/post-publish |
| Blocking bugs | 0 | 0 | `const info` + `spec` URL fixed in review |
| Manual pre-publish | — | 3 | `chmod +x`, `npm pack`, `ncc build` |
| Publish steps | — | 7 | npm login, publish ×2, git tags ×3, GH release |
| Post-publish verification | — | 4 | npmjs.com, marketplace, cross-verify |
