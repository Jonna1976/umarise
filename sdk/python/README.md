# umarise-core-sdk

Anchor any file to Bitcoin with one API call. Hash-in, proof-out.

```
artifact → artifact.proof
```

Zero dependencies. Python 3.8+.

## Install

```bash
pip install umarise-core-sdk
```

## Anchor a file

```python
from umarise import UmariseCore, hash_buffer
import os

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])

with open("release.tar.gz", "rb") as f:
    file_hash = hash_buffer(f.read())

origin = core.attest(file_hash)
print(origin.origin_id)  # done
```

## Verify a file (no API key needed)

```python
from umarise import UmariseCore, hash_buffer

core = UmariseCore()

with open("release.tar.gz", "rb") as f:
    file_hash = hash_buffer(f.read())

result = core.verify(file_hash)
if result:
    print(f"Existed since {result.captured_at}")
```

Verification is public. No account, no API key, no vendor dependency.

## CLI

```bash
npx @umarise/cli anchor release.tar.gz
# → release.tar.gz.proof
```

Verify offline:
```bash
npx @umarise/cli verify release.tar.gz.proof
# Hash Match ✓ | Bitcoin Block #881234 | 2026-03-05 | VALID
```

## API

| Method | Auth | Description |
|---|---|---|
| `health()` | Public | API health check |
| `resolve(origin_id=...)` | Public | Lookup by origin ID |
| `resolve(hash=...)` | Public | Lookup by hash |
| `verify(hash)` | Public | Check if hash is anchored |
| `proof(origin_id)` | Public | Download .ots proof |
| `attest(hash)` | API Key | Create anchor |
| `hash_buffer(bytes)` | — | SHA-256 hash, no network |

## CI/CD

Use the [GitHub Action](https://github.com/AnchoringTrust/anchor-action) for automated anchoring:

```yaml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: build.tar.gz
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

Every build gets a `.proof` file. Verifiable offline, independent of Umarise.

## Links

- [Get API key](https://umarise.com/developers)
- [API Reference](https://umarise.com/api-reference)
- [Independent Verifier](https://verify-anchoring.org)
- [Anchoring Specification](https://anchoring-spec.org)

## License

Unlicense (Public Domain)
