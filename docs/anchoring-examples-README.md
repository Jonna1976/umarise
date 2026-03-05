# anchoring-examples

Every artifact in this repository is anchored to Bitcoin.

Verify any `.proof` file at [verify-anchoring.org](https://verify-anchoring.org).

---

## What is a `.proof` file?

A `.proof` file is a self-contained evidence bundle that proves a specific file existed at a specific moment in time — anchored in the Bitcoin blockchain.

```
release.tar.gz          ← the artifact
release.tar.gz.proof    ← the proof (certificate + OTS)
```

The proof is independently verifiable. No account, no vendor, no trust required.

## Examples

### CI/CD build artifact

```
examples/ci/
├── build-output.tar.gz
└── build-output.tar.gz.proof
```

Anchored automatically via [GitHub Action](https://github.com/AnchoringTrust/anchor-action):

```yaml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: build-output.tar.gz
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

### AI model checkpoint

```
examples/ai/
├── model-v2.1.pt
└── model-v2.1.pt.proof
```

Proves this exact model existed at this exact time. Useful for:
- Training provenance
- Audit trails
- Regulatory compliance

### Dataset snapshot

```
examples/data/
├── training-data-2026-03.parquet
└── training-data-2026-03.parquet.proof
```

Proves the dataset was not modified after anchoring.

### Open-source release

```
examples/release/
├── myapp-v1.0.0.tar.gz
├── myapp-v1.0.0.tar.gz.proof
└── SHA256SUMS
```

`.proof` sits alongside SHA256 and GPG signatures as standard release artifacts.

## How to verify

### Option 1: Online (no install)

Drop any `.proof` file at [verify-anchoring.org](https://verify-anchoring.org).

100% client-side. Nothing is uploaded.

### Option 2: CLI

```bash
npx @umarise/cli verify build-output.tar.gz.proof
# Hash Match ✓ | Bitcoin Block #881234 | 2026-03-05 | VALID
```

### Option 3: Raw OpenTimestamps

```bash
unzip build-output.tar.gz.proof
sha256sum build-output.tar.gz    # compare with certificate.json
ots verify proof.ots             # verify against Bitcoin
```

## How to anchor your own files

### CLI (one command)

```bash
npx @umarise/cli anchor myfile.pdf
# → myfile.pdf.proof
```

### GitHub Action (one line)

```yaml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: myfile.pdf
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

### SDK

**Node.js:**
```bash
npm install @umarise/anchor
```

**Python:**
```bash
pip install umarise-core-sdk
```

Get an API key at [umarise.com/developers](https://umarise.com/developers).

## Links

- [Umarise — Anchoring Infrastructure](https://umarise.com)
- [API Reference](https://umarise.com/api-reference)
- [Independent Verifier](https://verify-anchoring.org)
- [Anchoring Specification (IEC)](https://anchoring-spec.org)
- [GitHub Action](https://github.com/AnchoringTrust/anchor-action)

## License

Unlicense (Public Domain)
