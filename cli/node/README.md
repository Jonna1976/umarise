# @umarise/cli

Anchor files to Bitcoin. Verify proofs offline.

```bash
npm install -g @umarise/cli
```

## Usage

```bash
# Full lifecycle — one command, run twice
export UMARISE_API_KEY=um_your_key
umarise proof document.pdf

# First run:
# ✓ hash: sha256:a1b2c3...
# ✓ anchored: origin_id f47ac10b-58cc-4372-a567-0e02b2c3d479
# ⏳ proof pending — run again later

# Second run (after ~2 hours):
# ✓ hash: sha256:a1b2c3... (already anchored)
# ✓ origin_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
# ✓ anchored in Bitcoin block 935037
# ✓ no later than: 2026-03-04
# ✓ saved: document.pdf.proof
# ✓ proof valid — independent of Umarise
```

Same command, always does the right thing. No daemon. No state files.

## Commands

### `umarise proof <file>` — recommended

Full proof lifecycle in one command:
1. Hash the file locally (SHA-256)
2. Anchor the hash (or detect it's already anchored)
3. Check if Bitcoin proof is ready
4. If ready: download `.ots`, build `.proof` ZIP, verify locally

Idempotent — run it as many times as you want on the same file.

### `umarise anchor <file>` — plumbing

Hash and anchor only. Creates a `.proof` ZIP immediately (proof may still be pending).

```bash
umarise anchor document.pdf
```

### `umarise verify <file> [proof]` — plumbing

Verify a file against its `.proof` bundle. Tries offline verification first (OpenTimestamps), falls back to online.

```bash
umarise verify document.pdf
# or explicitly:
umarise verify document.pdf document.pdf.proof
```

## Output

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
| `UMARISE_API_KEY` | For `proof` and `anchor` | Partner API key (`um_...`) |

Or pass `--api-key <key>` to the command.

`verify` requires no API key — verification is a public utility.

## What this CLI does NOT do

- Store files (hash-only, bytes never leave your system)
- Manage accounts or sessions
- Interpret content or meaning
- Replace legal processes

## License

Unlicense (Public Domain)
