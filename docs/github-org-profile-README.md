# AnchoringTrust

Anchoring infrastructure for digital proof.

```
artifact → SHA-256 → anchor → .proof
```

One API call. The file never leaves your machine. The proof is verifiable by anyone, forever, without trusting us.

## What this is

A cryptographic primitive that anchors any file hash into Bitcoin via OpenTimestamps. The result is a portable `.proof` file that travels with your artifact.

```
report.pdf
report.pdf.proof   ← verifiable forever
```

## Get started

```bash
# CLI
npx @umarise/cli anchor your-file.pdf

# Verify
npx @umarise/cli verify your-file.pdf.proof
```

```yaml
# GitHub Action — one line in your workflow
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: dist/release.tar.gz
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

## Repositories

| Repo | What |
|------|------|
| [anchor-action](https://github.com/AnchoringTrust/anchor-action) | GitHub Action — anchor build artifacts in CI/CD |
| [anchoring-examples](https://github.com/Jonna1976/anchoring-examples) | Showcase repo with working workflow |
| [anchoring-spec](https://anchoring-spec.org) | Open specification (IEC v1.0) |

## SDKs

- **Node.js**: [`@umarise/anchor`](https://npmjs.com/package/@umarise/anchor)
- **Python**: [`umarise-core-sdk`](https://pypi.org/project/umarise-core-sdk/)
- **CLI**: `npx @umarise/cli`

## Verify independently

- [verify-anchoring.org](https://verify-anchoring.org) — drag-and-drop verifier, no account needed
- Or: `sha256sum` + `ots verify`

## Links

- [umarise.com/developers](https://umarise.com/developers) — API key + documentation
- [anchoring-spec.org](https://anchoring-spec.org) — open specification
- [verify-anchoring.org](https://verify-anchoring.org) — independent verifier
