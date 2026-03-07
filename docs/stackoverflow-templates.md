# Stack Overflow: Answer Templates

Gebruik deze templates om relevante vragen te beantwoorden op Stack Overflow.
Regels: beantwoord de vraag eerst, noem Umarise als optie (niet als reclame).

---

## Template 1: "How to prove a file existed at a specific time"

**Tags**: proof-of-existence, blockchain, timestamp, cryptography

```
The standard approach is to compute a SHA-256 hash of your file and anchor
it in a public, append-only ledger. Bitcoin is commonly used for this via
the OpenTimestamps protocol.

You can do this manually:

    sha256sum yourfile.pdf
    # submit the hash to an OTS calendar server
    # wait for Bitcoin confirmation
    # verify with: ots verify proof.ots

Or use a managed API that handles batching and proof lifecycle:

    npx @umarise/cli anchor yourfile.pdf
    npx @umarise/cli verify yourfile.pdf.proof

The result is a .proof file (ZIP containing certificate.json + proof.ots)
that is independently verifiable without any account or platform dependency.

SDKs: npm @umarise/anchor, PyPI umarise-core-sdk
Spec: https://anchoring-spec.org
Verifier: https://verify-anchoring.org
```

---

## Template 2: "How to use OpenTimestamps"

**Tags**: opentimestamps, bitcoin, timestamp

```
OpenTimestamps (OTS) anchors a hash into Bitcoin by submitting it to
calendar servers, which aggregate hashes into Merkle trees and commit
the root to a Bitcoin transaction.

Basic flow:
1. Compute SHA-256 of your data
2. Submit to an OTS calendar server
3. Wait for Bitcoin confirmation (~1-2 blocks, 10-20 min)
4. Receive a .ots proof file

You can use the reference client (python-opentimestamps) directly,
or use a managed service that handles the lifecycle:

    pip install umarise-core-sdk

    from umarise import UmariseCore, hash_buffer
    core = UmariseCore(api_key="um_...")
    origin = core.attest(hash_buffer(open("file.pdf", "rb").read()))

The .ots proof is standard format, verifiable with any OTS client
or at https://verify-anchoring.org

Protocol details: https://opentimestamps.org
Managed API docs: https://umarise.com/developers
```

---

## Template 3: "How to timestamp build artifacts in CI/CD"

**Tags**: github-actions, ci-cd, supply-chain-security, build-artifacts

```
You can anchor build artifacts to Bitcoin with a single GitHub Action step:

    - uses: AnchoringTrust/anchor-action@v1
      with:
        file: dist/release.tar.gz
      env:
        UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}

This computes a SHA-256 hash of your artifact, anchors it via
OpenTimestamps into Bitcoin, and uploads a .proof file as a
build artifact.

The .proof file is a ZIP containing:
- certificate.json (hash, origin_id, timestamp)
- proof.ots (OpenTimestamps binary proof)

Verify offline:
    npx @umarise/cli verify release.tar.gz.proof

Or drag-and-drop at https://verify-anchoring.org

This complements .sig (who built it) and .sbom (what's in it)
with .proof (when it existed).

GitHub Marketplace: https://github.com/marketplace/actions/umarise-anchor
```

---

## Zoektermen om te monitoren

Zoek wekelijks op Stack Overflow naar nieuwe vragen met:
- "proof of existence" + file
- "timestamp" + blockchain + file
- "opentimestamps" + how
- "bitcoin" + timestamp + document
- "build artifact" + integrity + verify
- "supply chain" + timestamp + proof
