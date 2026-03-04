# @umarise/cli

Anchor files to Bitcoin. Verify proofs offline.

```bash
npm install -g @umarise/cli
```

## Usage

```bash
# Anchor a file (creates file.proof)
export UMARISE_API_KEY=um_your_key
umarise anchor document.pdf

# Verify a file against its proof
umarise verify document.pdf
# or explicitly:
umarise verify document.pdf document.pdf.proof
```

## Output

### Anchor

```
✓ hash computed: sha256:a1b2c3...
✓ anchored: origin_id f47ac10b-58cc-4372-a567-0e02b2c3d479
✓ proof saved: document.pdf.proof
```

### Verify

```
✓ hash matches
✓ anchored in Bitcoin block 883421
✓ no later than: 2026-03-04
✓ proof valid — independent of Umarise
```

## Proof bundle

`<file>.proof` is a ZIP containing:

- `certificate.json` — origin metadata (hash, timestamp, origin_id)
- `proof.ots` — OpenTimestamps proof (when anchored)

You can verify the proof independently:

```bash
unzip document.pdf.proof
sha256sum document.pdf                    # compare with certificate.json
ots verify proof.ots                      # verify against Bitcoin
```

No Umarise server needed for verification.

## Configuration

| Variable | Required | Description |
|---|---|---|
| `UMARISE_API_KEY` | For `anchor` | Partner API key (`um_...`) |

Or pass `--api-key <key>` to the anchor command.

`verify` requires no API key — verification is a public utility.

## What this CLI does NOT do

- Store files (hash-only, bytes never leave your system)
- Manage accounts or sessions
- Interpret content or meaning
- Replace legal processes

## License

Unlicense (Public Domain)
