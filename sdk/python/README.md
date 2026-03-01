# Umarise Core SDK — Python

Single-file SDK for [Umarise Core v1](https://umarise.com/core). Zero external dependencies.

**Requirements:** Python 3.8+

## Quick Start

```python
from umarise import UmariseCore, hash_bytes

# 1. Initialize (public endpoints need no API key)
core = UmariseCore()

# 2. Check API health
health = core.health()
print(health)  # HealthResult(status='operational', version='v1')

# 3. Hash a file locally (bytes never leave your system)
with open("document.pdf", "rb") as f:
    file_hash = hash_bytes(f.read())
print(file_hash)  # sha256:a1b2c3...

# 4. Verify: does this hash have an attestation?
result = core.verify(file_hash)
if result:
    print("Attested at:", result.captured_at)
    print("Origin ID:", result.origin_id)
else:
    print("No attestation found")
```

## Partner Usage (requires API key)

```python
import os
from umarise import UmariseCore, hash_bytes

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])

# Create an attestation
with open("document.pdf", "rb") as f:
    file_hash = hash_bytes(f.read())

origin = core.attest(file_hash)
print("Created:", origin.origin_id)

# Resolve it back
resolved = core.resolve(origin_id=origin.origin_id)

# Or resolve by hash (returns earliest attestation)
by_hash = core.resolve(hash=file_hash)
```

## Full API

### `UmariseCore(api_key?, base_url?, timeout?)`

| Option     | Default                    | Description                |
|------------|----------------------------|----------------------------|
| `api_key`  | —                          | Partner API key (`um_...`) |
| `base_url` | `https://core.umarise.com` | API base URL               |
| `timeout`  | `30`                       | Request timeout (seconds)  |

### Methods

| Method                        | Auth     | Description                       |
|-------------------------------|----------|-----------------------------------|
| `health()`                    | Public   | API health check                  |
| `resolve(origin_id=...)`     | Public   | Lookup by origin ID               |
| `resolve(hash=...)`          | Public   | Lookup by hash (returns earliest) |
| `verify(hash)`                | Public   | Check if hash has attestation     |
| `proof(origin_id)`            | Public   | Download .ots proof file          |
| `attest(hash)`                | API Key  | Create new attestation            |

### `hash_bytes(data)`

Standalone utility. Hashes `bytes` using SHA-256.

```python
from umarise import hash_bytes

with open("document.pdf", "rb") as f:
    file_hash = hash_bytes(f.read())
# Returns: "sha256:a1b2c3..."
```

## Error Handling

```python
from umarise import UmariseCore, UmariseCoreError

core = UmariseCore(api_key="um_...")

try:
    core.attest(file_hash)
except UmariseCoreError as e:
    print(e.code)                # 'RATE_LIMIT_EXCEEDED'
    print(e.status_code)         # 429
    print(e.retry_after_seconds) # 42
```

Error codes: `UNAUTHORIZED`, `API_KEY_REVOKED`, `INVALID_HASH_FORMAT`, `RATE_LIMIT_EXCEEDED`, `NOT_FOUND`, `INTERNAL_ERROR`, `TIMEOUT`.

## Integration Example

### Automated Attestation (e.g., LMS upload hook)

```python
import os
from umarise import UmariseCore, hash_bytes

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])

def attest_upload(file_path: str) -> dict:
    # Step 1: Hash locally (file never leaves your system)
    with open(file_path, "rb") as f:
        file_hash = hash_bytes(f.read())

    # Step 2: Create attestation
    origin = core.attest(file_hash)

    # Step 3: Store origin_id with your record
    return {
        "origin_id": origin.origin_id,
        "hash": origin.hash,
        "attested_at": origin.captured_at,
    }

# Later: verify independently
def verify_file(file_path: str) -> bool:
    with open(file_path, "rb") as f:
        file_hash = hash_bytes(f.read())
    result = core.verify(file_hash)
    return result is not None  # True = attested
```

## What This SDK Does NOT Do

- Store files or bytes (hash-only)
- Manage identities or accounts
- Interpret content or meaning
- Provide legal validity claims

The SDK creates and verifies **existence proofs**: a specific hash existed at a specific moment. Nothing more, nothing less.

## License

MIT
