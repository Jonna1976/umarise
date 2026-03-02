# Umarise Core SDK — Node.js / TypeScript

Single-file SDK for [Umarise Core v1](https://umarise.com/core). Zero external dependencies.

**Requirements:** Node.js 18+ (uses native `fetch` and `crypto.subtle`)

## Quick Start

```typescript
import { UmariseCore, hashBytes } from '@umarise/anchor';
import { readFile } from 'fs/promises';

// 1. Initialize (public endpoints need no API key)
const core = new UmariseCore();

// 2. Check API health
const health = await core.health();
console.log(health); // { status: 'operational', version: 'v1' }

// 3. Hash a file locally (bytes never leave your system)
const fileBytes = await readFile('./document.pdf');
const hash = await hashBytes(fileBytes);
console.log(hash); // sha256:a1b2c3...

// 4. Verify: does this hash have an attestation?
const result = await core.verify(hash);
if (result) {
  console.log('Attested at:', result.captured_at);
  console.log('Origin ID:', result.origin_id);
} else {
  console.log('No attestation found');
}
```

## Partner Usage (requires API key)

```typescript
const core = new UmariseCore({
  apiKey: 'um_your_partner_key_here',
});

// Create an attestation
const hash = await hashBytes(fileBytes);
const origin = await core.attest(hash);
console.log('Created:', origin.origin_id);
// { origin_id: "...", hash: "sha256:...", hash_algo: "sha256",
//   captured_at: "...", proof_status: "pending" }

// Resolve it back
const resolved = await core.resolve({ originId: origin.origin_id });

// Or resolve by hash (returns earliest attestation)
const byHash = await core.resolve({ hash });
```

## Full API

### `new UmariseCore(config?)`

| Option    | Default                       | Description                  |
|-----------|-------------------------------|------------------------------|
| `apiKey`  | —                             | Partner API key (`um_...`)   |
| `baseUrl` | `https://core.umarise.com`    | API base URL                 |
| `timeout` | `30000`                       | Request timeout (ms)         |

### Methods

| Method                | Auth     | Description                              |
|-----------------------|----------|------------------------------------------|
| `health()`            | Public   | API health check                         |
| `resolve({ originId })` | Public | Lookup by origin ID                     |
| `resolve({ hash })`  | Public   | Lookup by hash (returns earliest)        |
| `verify(hash)`        | Public   | Check if hash has attestation            |
| `proof(originId)`     | Public   | Download .ots proof file                 |
| `attest(hash)`        | API Key  | Create new attestation                   |

### `hashBytes(data)`

Standalone utility. Hashes a `Buffer` or `Uint8Array` using SHA-256.

```typescript
import { hashBytes } from '@umarise/anchor';
const hash = await hashBytes(fileBuffer);
// Returns: "sha256:a1b2c3..."
```

## Error Handling

```typescript
import { UmariseCoreError } from '@umarise/anchor';

try {
  await core.attest(hash);
} catch (err) {
  if (err instanceof UmariseCoreError) {
    console.log(err.code);       // 'RATE_LIMIT_EXCEEDED'
    console.log(err.statusCode); // 429
    console.log(err.retryAfterSeconds); // 42
  }
}
```

Error codes: `UNAUTHORIZED`, `API_KEY_REVOKED`, `INVALID_HASH_FORMAT`, `RATE_LIMIT_EXCEEDED`, `NOT_FOUND`, `INTERNAL_ERROR`, `TIMEOUT`.

## Integration Example

### Automated Attestation (e.g., LMS upload hook)

```typescript
import { UmariseCore, hashBytes } from '@umarise/anchor';
import { readFile } from 'fs/promises';

const core = new UmariseCore({ apiKey: process.env.UMARISE_API_KEY });

async function attestUpload(filePath: string) {
  // Step 1: Hash locally (file never leaves your system)
  const bytes = await readFile(filePath);
  const hash = await hashBytes(bytes);

  // Step 2: Create attestation
  const origin = await core.attest(hash);

  // Step 3: Store origin_id with your record
  return {
    originId: origin.origin_id,
    hash: origin.hash,
    attestedAt: origin.captured_at,
  };
}

// Later: verify independently
async function verifyFile(filePath: string) {
  const bytes = await readFile(filePath);
  const hash = await hashBytes(bytes);
  const result = await core.verify(hash);
  return result !== null; // true = attested, false = unknown
}
```

## What This SDK Does NOT Do

- Store files or bytes (hash-only)
- Manage identities or accounts
- Interpret content or meaning
- Provide legal validity claims

The SDK creates and verifies **existence proofs**: a specific hash existed at a specific moment. Nothing more, nothing less.

## License

Unlicense (Public Domain)
