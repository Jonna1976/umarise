# Show HN: Anchor any file to Bitcoin with one CLI command

Post op: https://news.ycombinator.com/submit
Titel: Show HN: Anchor any file to Bitcoin with one CLI command
URL: https://umarise.com/blog/proof-of-existence

---

## Body (als text post, alternatief voor URL post):

```
We built a CLI and API that anchors any file hash into Bitcoin via OpenTimestamps.

  npx @umarise/cli anchor contract.pdf

Result: contract.pdf.proof (a ZIP with certificate.json + proof.ots).

The file never leaves your machine. Only the SHA-256 hash is transmitted.
The proof is independently verifiable, no account needed.

Verify:
  npx @umarise/cli verify contract.pdf.proof
  # or drag-and-drop at verify-anchoring.org

CI/CD (one YAML line):
  - uses: AnchoringTrust/anchor-action@v1
    with: { file: dist/app.tar.gz }

SDKs:
  npm: @umarise/anchor
  PyPI: umarise-core-sdk

Open spec: anchoring-spec.org
Independent verifier: verify-anchoring.org

We use Bitcoin strictly as a timestamp server, not as currency.
The proof is math. If we disappear, verification still works via
sha256sum + ots verify + any Bitcoin node.
```

---

## Timing
Post op een werkdag, 14:00-16:00 CET (08:00-10:00 ET).
Dinsdag t/m donderdag zijn optimaal.

## Na het posten
- Reageer op vragen, wees technisch en eerlijk
- Verwijs naar de spec (anchoring-spec.org) bij protocol-vragen
- Verwijs naar verify-anchoring.org bij trust-vragen
- Nooit marketing-taal gebruiken
