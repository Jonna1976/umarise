# umarise-core-sdk

Minimal SDK for the Umarise Core v1 Anchoring API.
Zero external dependencies. Python 3.8+.

## Install

```
pip install umarise-core-sdk
```

## Usage

```python
from umarise import UmariseCore, hash_buffer
import os

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])

with open("document.pdf", "rb") as f:
    file_hash = hash_buffer(f.read())

origin = core.attest(file_hash)
print(f"Origin: {origin.origin_id}")
```

## Verify (no API key needed)

```python
from umarise import UmariseCore, hash_buffer

core = UmariseCore()

with open("document.pdf", "rb") as f:
    file_hash = hash_buffer(f.read())

result = core.verify(file_hash)
if result:
    print(f"Existed since {result.captured_at}")
```

## API

| Method | Auth | Description |
|--------|------|-------------|
| `health()` | Public | API health check |
| `resolve(origin_id=...)` | Public | Lookup by origin ID |
| `resolve(hash=...)` | Public | Lookup by hash |
| `verify(hash)` | Public | Check if hash has attestation |
| `proof(origin_id)` | Public | Download .ots proof file |
| `attest(hash)` | API Key | Create new attestation |
| `hash_buffer(bytes)` | — | SHA-256 hash, no network |

Full reference: https://umarise.com/api-reference

## License

Unlicense — Public Domain
