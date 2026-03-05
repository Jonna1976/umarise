# Deployment Checklist — CLI & GitHub Action

## Package A: `@umarise/cli` (npm)

**Source:** `cli/node/`

### Pre-publish
- [x] `package.json` version set to `1.1.0`
- [x] `package.json` name is `@umarise/cli`
- [x] `package.json` bin points to `bin/umarise.js`
- [x] `bin/umarise.js` has shebang `#!/usr/bin/env node`
- [x] `bin/umarise.js` is executable (`chmod +x`)
- [x] Dependencies: `@umarise/anchor`, `jszip`, `opentimestamps` (v0.4.9)
- [x] No devDependencies leak into production — `files` field restricts to `bin`, `src`, `README.md`, `LICENSE`
- [x] `README.md` present with usage examples
- [x] `LICENSE` present (Unlicense)
- [x] `files` field excludes test files

### Functional verification
- [x] `npm pack` — inspect tarball contents, no extra files
- [x] `npx @umarise/cli anchor <testfile>` — produces `.proof` ZIP
- [x] `.proof` ZIP contains: `certificate.json`, `proof.ots` — *code verified in anchor.js*
- [x] `certificate.json` → `spec` field = `https://anchoring-spec.org/v1.0/`
- [x] `npx @umarise/cli verify <testfile> <testfile>.proof` — hash matches
- [x] Verify with pending proof → returns "pending" (not crash)
- [x] Verify without OTS library installed → graceful fallback to online
- [x] `UMARISE_API_KEY` not set → clear error message, no stack trace

### Publish
- [x] `npm login` to `@umarise` org scope
- [x] `npm publish --access public` — v1.0.0 published 2026-03-04, v1.1.0 published 2026-03-04
- [x] Verify on npmjs.com: `https://www.npmjs.com/package/@umarise/cli`
- [x] `npx @umarise/cli --help` works from clean install

### Post-publish
- [x] Git tag: `cli-v1.0.0` — done 2026-03-04
- [x] Git tag: `cli-v1.1.0` — done 2026-03-04 (added `proof` command)
- [x] GitHub Release with notes referencing the tag — tagged on monorepo 2026-03-04
- [x] `/api-reference` install command matches published version

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
- [x] `npm publish --access public` — published 2026-03-04
- [x] Verify: `https://www.npmjs.com/package/@umarise/anchor`

### Post-publish
- [x] Git tag: `sdk-node-v1.0.0` — tagged on monorepo 2026-03-04

---

## Package C: `AnchoringTrust/anchor-action` (GitHub Action)

**Source:** `cli/github-action/`  
**Target repo:** `AnchoringTrust/anchor-action`

### Pre-publish
- [x] `action.yml` present with correct inputs/outputs
- [x] `action.yml` → `runs.using: node20`
- [x] `action.yml` → `runs.main: dist/index.js`
- [x] `src/index.js` builds with `ncc build src/index.js -o dist`
- [x] `src/index.js` uses `umarise proof` (full lifecycle) — updated 2026-03-04
- [x] `dist/index.js` committed — built and pushed 2026-03-04
- [x] `README.md` with usage example
- [x] `LICENSE` (Unlicense)

### Sync workflow
- [x] `.github/workflows/sync-github-action.yml` present and tested
- [x] `ANCHOR_ACTION_PAT` secret set in source repo (Jonna1976/umarise)
- [x] Push to `cli/github-action/` → sync fires and succeeds ✅

### Functional verification
- [x] Create test workflow in a scratch repo using the Action — verified 2026-03-04 (Jonna1976/anchor-test)
- [x] Action installs `@umarise/cli` successfully — verified 2026-03-04 (run 22684174015)
- [x] Action produces `.proof` artifact in workflow run — verified 2026-03-04
- [x] Outputs `origin-id`, `hash`, `proof-path` are set correctly
- [x] `upload-artifact: false` skips artifact upload without error

### Publish
- [x] Target repo `AnchoringTrust/anchor-action` exists (Public)
- [x] Files synced via automated workflow
- [x] Git tag: `v1` (mutable, points to latest v1.x)
- [x] Git tag: `v1.0.0` (immutable release)
- [x] GitHub Release created from `v1.0.0` tag
- [x] Published to GitHub Marketplace (category: Security)

### GitHub Marketplace
- [x] `action.yml` has `branding` section (icon: shield, color: gray-dark)
- [x] Repository is public
- [x] Marketplace Developer Agreement accepted
- [x] Release published with Marketplace checkbox ✅
- [x] Verify listing: `https://github.com/marketplace/actions/umarise-anchor` — published 2026-03-04

---

## Cross-verification

After all packages are published:

- [x] `npx @umarise/cli anchor test.pdf` → works from npm
- [x] `.proof` verifiable at `https://verify-anchoring.org` — ✅ verified 2026-03-04, Bitcoin block 935037, ledger timestamp 2026-02-04 20:56:02 UTC
- [x] `.proof` verifiable via `npx @umarise/cli verify test.pdf test.pdf.proof` — verified 2026-03-04
- [x] GitHub Action produces same `.proof` format as CLI
- [x] `/api-reference` install commands match published package names
- [x] `/api-reference` CLI section matches actual `--help` output — verified 2026-03-04

---

## Secrets inventory

| Secret | Where | Purpose | Status |
|---|---|---|---|
| `ANCHOR_ACTION_PAT` | Jonna1976/umarise | Sync workflow push access | ✅ Set 2026-03-04 |
| `VERIFY_ANCHORING_PAT` | Jonna1976/umarise | Existing verify-anchoring sync | ✅ Already in use |
| `UMARISE_API_KEY` | End-user repos | API authentication for anchor/verify | ✅ Documented |
| `NPM_TOKEN` | CI (if automated publish) | npm publish authentication | ⬜ Optional |

---

## Summary

| Category | Done | Remaining | Notes |
|---|---|---|---|
| Code completeness | 48/48 | 0 | All items verified ✅ |
| Blocking bugs | 0 | 0 | All fixed |
| Manual pre-publish | 3/3 | 0 | `chmod +x`, `npm pack`, `ncc build` — all done |
| Publish steps | 8/8 | 0 | npm publish ×2 (v1.0.0 + v1.1.0), git tags, GH release, Marketplace |
| Post-publish verification | 4/4 | 0 | All verified ✅ |

---

## Package D: `umarise-core-sdk` (PyPI)

**Source:** `sdk/python/`

### Status
- [x] `pyproject.toml` name = `umarise-core-sdk`
- [x] Zero external dependencies, Python 3.8+
- [x] Trusted Publishing via GitHub Actions (OIDC)
- [x] Workflow: `.github/workflows/publish-pypi.yml`
- [x] Environment: `pypi` (GitHub → PyPI OIDC binding)
- [x] Published: 2026-03-05 via tag `python-v1.0.5`
- [x] Live: `https://pypi.org/project/umarise-core-sdk/`
- [x] Install: `pip install umarise-core-sdk`

---

*Last updated: 2026-03-05 — all items complete including PyPI.*
