---
title: How Umarise turns files into proof objects
published: true
description: A digital file has no intrinsic proof of its history. A .proof file changes that. Hash, anchor, verify. The proof travels with the artifact.
tags: bitcoin, cryptography, devops, security
canonical_url: https://umarise.com/blog/proof-objects
---

A digital file has no intrinsic proof of its history. You cannot prove when it existed, whether it was modified, or if someone changed it after the fact.

Umarise adds one element:

```
artifact
+ proof
```

Together, they form a proof object.

```
report.pdf
report.pdf.proof
```

## Step 1: hash the artifact

The original file stays where it is. Umarise reads only the bytes and computes:

```
SHA256(file) → sha256:a3dc...
```

This is a cryptographic fingerprint. Any change to the file changes the hash.

## Step 2: anchor the hash

The hash is anchored via:

```
OpenTimestamps → Bitcoin
```

The blockchain acts as a global clock. The proof states: this hash existed no later than time T.

## Step 3: the proof file

The result is a `.proof` file containing:

```
report.pdf.proof/
  certificate.json    ← hash, origin_id, timestamp
  proof.ots           ← OpenTimestamps binary proof
```

## Step 4: artifact becomes proof object

The original file and the proof belong together:

```
report.pdf
report.pdf.proof
```

Anyone can verify later:

```bash
npx @umarise/cli verify report.pdf.proof
# ✓ hash matches
# ✓ anchored in Bitcoin block 935037
# ✓ no later than 2026-03-04
# ✓ proof valid — independent of Umarise
```

Or with standard tools:

```bash
sha256sum report.pdf
ots verify proof.ots
```

## The portable element

The proof does not live in a server or database. It sits next to the artifact.

Copy both files to another machine, a USB drive, an archive, or a legal proceeding. The proof remains fully intact. It travels with the file.

## Why portable proof matters

Most systems store proof in their own database:

```
file → platform → proof
```

You always have to trust the platform.

Umarise inverts this:

```
file + proof
```

The proof is independent, verifiable, and transferable.

If Umarise ceases to exist, verification remains possible via hash + OpenTimestamps + Bitcoin.

## The result

A normal digital file:

```
report.pdf
```

becomes a proof object:

```
report.pdf
report.pdf.proof
```

That object contains the original file, a cryptographic proof of existence, and a publicly verifiable timestamp.

**Every digital artifact can carry its own proof.**

---

- [Specification — anchoring-spec.org](https://anchoring-spec.org)
- [Verifier — verify-anchoring.org](https://verify-anchoring.org)
- [npm — @umarise/anchor](https://npmjs.com/package/@umarise/anchor)
- [Get your API key — umarise.com/developers](https://umarise.com/developers)
