# anchoring-examples

Every artifact in this repository is anchored to Bitcoin.

Verify any `.proof` file at [verify-anchoring.org](https://verify-anchoring.org).

---

## How it works

On every push to `main`, the workflow:

1. Creates a build artifact
2. Anchors it to Bitcoin via [`anchor-action`](https://github.com/AnchoringTrust/anchor-action)
3. Uploads the `.proof` file as a build artifact

```
example-artifact.txt       ← the file
example-artifact.txt.proof ← the proof (certificate + OTS)
```

The proof is independently verifiable. No account, no vendor, no trust required.

## Try it yourself

1. Fork this repo
2. Add `UMARISE_API_KEY` to your repo secrets (Settings → Secrets → Actions)
3. Push a commit
4. Check the Actions tab — download the `.proof` artifact
5. Verify at [verify-anchoring.org](https://verify-anchoring.org)

Get an API key at [umarise.com/developers](https://umarise.com/developers).

## Verify offline

```bash
# Option 1: CLI
npx @umarise/cli verify example-artifact.txt.proof

# Option 2: Raw OpenTimestamps
unzip example-artifact.txt.proof
sha256sum example-artifact.txt    # compare with certificate.json
ots verify proof.ots              # verify against Bitcoin
```

## Links

- [Umarise — Anchoring Infrastructure](https://umarise.com)
- [GitHub Action](https://github.com/marketplace/actions/umarise-anchor)
- [CLI](https://www.npmjs.com/package/@umarise/cli)
- [Node.js SDK](https://www.npmjs.com/package/@umarise/anchor)
- [Python SDK](https://pypi.org/project/umarise-core-sdk/)
- [Independent Verifier](https://verify-anchoring.org)
- [Anchoring Specification](https://anchoring-spec.org)

## License

Unlicense (Public Domain)
