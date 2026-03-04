# Deployment Checklist — CLI & GitHub Action

## Package A: `@umarise/cli` (npm)

**Source:** `cli/node/`

### Pre-publish
- [ ] `package.json` version set to `1.0.0`
- [ ] `package.json` name is `@umarise/cli`
- [ ] `package.json` bin points to `bin/umarise.js`
- [ ] `bin/umarise.js` has shebang `#!/usr/bin/env node`
- [ ] `bin/umarise.js` is executable (`chmod +x`)
- [ ] Dependencies: `@umarise/anchor`, `jszip`, `opentimestamps` (v0.4.9)
- [ ] No devDependencies leak into production
- [ ] `README.md` present with usage examples
- [ ] `LICENSE` present (Unlicense)
- [ ] `.npmignore` or `files` field excludes test files

### Functional verification
- [ ] `npm pack` — inspect tarball contents, no extra files
- [ ] `npx @umarise/cli anchor <testfile>` — produces `.proof` ZIP
- [ ] `.proof` ZIP contains: `manifest.json`, `certificate.json`, `<file>.ots`
- [ ] `certificate.json` → `spec` field = `https://anchoring-spec.org/v1.0/`
- [ ] `npx @umarise/cli verify <testfile> <testfile>.proof` — hash matches
- [ ] Verify with pending proof → returns "pending" (not crash)
- [ ] Verify without OTS library installed → graceful fallback to online
- [ ] `UMARISE_API_KEY` not set → clear error message, no stack trace

### Publish
- [ ] `npm login` to `@umarise` org scope
- [ ] `npm publish --access public`
- [ ] Verify on npmjs.com: `https://www.npmjs.com/package/@umarise/cli`
- [ ] `npx @umarise/cli --help` works from clean install

### Post-publish
- [ ] Git tag: `cli-v1.0.0`
- [ ] GitHub Release with notes referencing the tag
- [ ] `/api-reference` install command matches published version

---

## Package B: `@umarise/anchor` (npm SDK)

**Source:** `sdk/node/`

### Pre-publish (if not already published)
- [ ] `package.json` version = `1.0.0`
- [ ] `package.json` name = `@umarise/anchor`
- [ ] Hardcoded base URL: `https://core.umarise.com`
- [ ] Exports: `anchor()`, `hashBuffer()`, `verify()`, `resolve()`
- [ ] `README.md` with quick-start code block
- [ ] `LICENSE` (Unlicense)

### Publish
- [ ] `npm publish --access public`
- [ ] Verify: `https://www.npmjs.com/package/@umarise/anchor`

### Post-publish
- [ ] Git tag: `sdk-node-v1.0.0`

---

## Package C: `umarise/anchor-action` (GitHub Action)

**Source:** `cli/github-action/`  
**Target repo:** `umarise/anchor-action`

### Pre-publish
- [ ] `action.yml` present with correct inputs/outputs
- [ ] `action.yml` → `runs.using: node20`
- [ ] `action.yml` → `runs.main: dist/index.js`
- [ ] `src/index.js` builds with `ncc build src/index.js -o dist`
- [ ] `dist/index.js` committed (GitHub Actions require bundled output)
- [ ] `README.md` with usage example:
  ```yaml
  - uses: umarise/anchor-action@v1
    with:
      file: my-artifact.pdf
    env:
      UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
  ```
- [ ] `LICENSE` (Unlicense)

### Sync workflow
- [ ] `ANCHOR_ACTION_PAT` secret set in source repo (Lovable GitHub)
- [ ] `.github/workflows/sync-github-action.yml` present and tested
- [ ] Push a test change to `cli/github-action/` → verify sync fires

### Functional verification
- [ ] Create test workflow in a scratch repo using the Action
- [ ] Action installs `@umarise/cli` successfully
- [ ] Action produces `.proof` artifact in workflow run
- [ ] Outputs `origin-id`, `hash`, `proof-path` are set correctly
- [ ] `upload-artifact: false` skips artifact upload without error

### Publish
- [ ] Target repo `umarise/anchor-action` exists
- [ ] Files synced (or manually pushed for first release)
- [ ] Git tag: `v1` (mutable, points to latest v1.x)
- [ ] Git tag: `v1.0.0` (immutable release)
- [ ] GitHub Release created from `v1.0.0` tag

### GitHub Marketplace (optional)
- [ ] `action.yml` has `branding` section:
  ```yaml
  branding:
    icon: 'shield'
    color: 'gray-dark'
  ```
- [ ] Repository is public
- [ ] "Publish this Action to the GitHub Marketplace" checked during Release creation
- [ ] Verify listing: `https://github.com/marketplace/actions/anchor-action`

---

## Cross-verification

After all packages are published:

- [ ] `npx @umarise/cli anchor test.pdf` → works from npm
- [ ] `.proof` verifiable at `https://verify-anchoring.org`
- [ ] `.proof` verifiable via `npx @umarise/cli verify test.pdf test.pdf.proof`
- [ ] GitHub Action produces same `.proof` format as CLI
- [ ] `/api-reference` install commands match published package names
- [ ] `/api-reference` CLI section matches actual `--help` output

---

## Secrets inventory

| Secret | Where | Purpose |
|---|---|---|
| `ANCHOR_ACTION_PAT` | Source repo (Lovable) | Sync workflow push access |
| `VERIFY_ANCHORING_PAT` | Source repo (Lovable) | Existing verify-anchoring sync |
| `UMARISE_API_KEY` | End-user repos | API authentication for anchor/verify |
| `NPM_TOKEN` | CI (if automated publish) | npm publish authentication |
