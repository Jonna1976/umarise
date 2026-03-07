---
title: Anchor your build artifacts to Bitcoin in one YAML line
published: true
description: Every release deserves a proof. Add one GitHub Action step and get a Bitcoin-timestamped .proof file as a build artifact.
tags: github, devops, security, cicd
canonical_url: https://umarise.com/blog/anchor-build-artifacts
cover_image:
---

Your release pipeline produces binaries, containers, and packages. But can you prove *when* they were built? And by whom?

A `.proof` file next to every artifact changes that.

## The setup

Add one step to any GitHub Actions workflow:

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: make build

      - name: Anchor artifact
        uses: AnchoringTrust/anchor-action@v1
        with:
          file: dist/app-${{ github.ref_name }}.tar.gz
        env:
          UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

That's it. Push a tag, the action runs, and `app-v2.1.0.tar.gz.proof` appears as a build artifact.

## What happens under the hood

1. The action computes a SHA-256 hash of your file
2. The hash is sent to the Umarise Core API (the file stays on the runner)
3. The API anchors the hash into Bitcoin via OpenTimestamps
4. A `.proof` ZIP is uploaded as a GitHub Actions artifact

The proof contains a `certificate.json` (origin_id, hash, timestamp) and a `proof.ots` (OpenTimestamps binary).

## Verify

Anyone can verify. No account needed:

```bash
# CLI
npx @umarise/cli verify app-v2.1.0.tar.gz.proof
# ✓ Hash Match | Bitcoin Block #939611 | 2026-03-06 | VALID

# Or drag-and-drop at verify-anchoring.org
```

## The artifact pattern

The proof travels with the artifact. Store them together:

```
releases/
  app-v2.1.0.tar.gz
  app-v2.1.0.tar.gz.proof    ← Bitcoin-timestamped

  app-v2.0.0.tar.gz
  app-v2.0.0.tar.gz.proof    ← verifiable forever
```

Commit to git, attach to a GitHub release, or ship to a client. The proof works offline. No API, no account, no platform dependency.

## Why this matters for supply chain security

Software supply chain attacks are increasing. SBOMs document *what's* in a build. Code signing proves *who* built it. Anchoring proves **when** it existed.

These are complementary. A `.proof` file next to a `.sbom` and a `.sig` creates a complete audit trail: **what, who, and when**.

## Get started

1. Get an API key at [umarise.com/developers](https://umarise.com/developers)
2. Add `UMARISE_API_KEY` to your repo secrets
3. Add the action step to your workflow
4. Push. Done.

---

- [GitHub Marketplace — Umarise Anchor Action](https://github.com/marketplace/actions/umarise-anchor)
- [Verifier — verify-anchoring.org](https://verify-anchoring.org)
- [Specification — anchoring-spec.org](https://anchoring-spec.org)
- [Get your API key](https://umarise.com/developers)
