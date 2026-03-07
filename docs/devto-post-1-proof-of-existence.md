---
title: How to prove a file existed at a specific time
published: true
description: Anchor any file to Bitcoin with one API call. CLI, SDK, GitHub Action. Open protocol, zero vendor lock-in.
tags: bitcoin, security, devops, opensource
canonical_url: https://umarise.com/blog/proof-of-existence
cover_image:
---

File metadata lies. Timestamps can be edited. Cloud storage providers can change records. If someone asks "prove this existed before Tuesday" -- you can't.

Unless you anchored it.

## The problem

Every file on your computer has a "created at" timestamp. It means nothing. You can change it with one terminal command. Cloud providers can overwrite it. Courts know this. Auditors know this.

What you need is a timestamp that sits outside your own system. One that nobody controls. One that is verifiable by anyone, forever.

Bitcoin's blockchain is a public, append-only ledger with a timestamp on every block. If you embed a hash of your file into a Bitcoin transaction, you have mathematical proof that the file existed before that block was mined.

This is called **proof of existence**. The cryptography is simple. A clean developer primitive for it has been missing. Here is one.

## Install

```bash
# CLI (fastest)
npx @umarise/cli anchor your-file.pdf

# Node.js
npm install @umarise/anchor

# Python
pip install umarise-core-sdk
```

## Anchor a file

The file never leaves your machine. You compute a SHA-256 hash locally and anchor it into Bitcoin via OpenTimestamps.

**Node.js:**

```javascript
import { UmariseCore } from '@umarise/anchor';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

const hash = createHash('sha256')
  .update(readFileSync('contract.pdf'))
  .digest('hex');

const core = new UmariseCore({ apiKey: 'um_...' });
const origin = await core.attest(`sha256:${hash}`);
console.log(origin.origin_id);  // → "abc4f2..."
```

**Python:**

```python
from umarise import UmariseCore, hash_buffer

with open("contract.pdf", "rb") as f:
    file_hash = hash_buffer(f.read())

core = UmariseCore(api_key="um_...")
origin = core.attest(file_hash)
print(origin.origin_id)  # → "abc4f2..."
```

## What comes back

The CLI generates a `.proof` file. It's a ZIP containing:

```
your-file.pdf.proof/
  certificate.json    ← origin_id, hash, timestamp
  proof.ots           ← OpenTimestamps binary proof
```

The proof is verifiable by anyone, without an account, without trusting the issuer, using a block explorer or the open verifier at [verify-anchoring.org](https://verify-anchoring.org).

## CLI quickstart

```bash
# Anchor
npx @umarise/cli anchor contract-draft-v3.pdf
# ✓ hash: sha256:9f3a...
# ✓ anchored: origin_id abc4f2...
# ✓ saved: contract-draft-v3.pdf.proof

# Verify (after ~2 hours, when Bitcoin confirms)
npx @umarise/cli verify contract-draft-v3.pdf.proof
# ✓ Hash Match | Bitcoin Block #939611 | 2026-03-06 | VALID
```

## CI/CD: one YAML line

Anchor every build artifact automatically:

```yaml
# .github/workflows/release.yml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: dist/release.tar.gz
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

The `.proof` file appears as a build artifact. No code changes. No vendor lock-in.

## Why this matters now

AI generates convincing content locally, without network traces, without cost. Documents, images, contracts. The question has shifted from "is this fake?" to **"can you prove when this existed?"**

Anchoring gives you a fact that sits outside your own system. The hash is in Bitcoin. The block is public. The proof is portable. It works offline. It works in court.

```
release/
  app-v2.1.0.tar.gz
  app-v2.1.0.tar.gz.proof   ← verifiable forever
```

## Open by design

- [Specification — anchoring-spec.org](https://anchoring-spec.org)
- [Verifier — verify-anchoring.org](https://verify-anchoring.org)
- [npm — @umarise/anchor](https://npmjs.com/package/@umarise/anchor)
- [PyPI — umarise-core-sdk](https://pypi.org/project/umarise-core-sdk/)
- [GitHub Action — anchor-action](https://github.com/marketplace/actions/umarise-anchor)
- [Get your API key — umarise.com/developers](https://umarise.com/developers)
