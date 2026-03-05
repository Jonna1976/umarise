# @umarise/anchor

Anchor any file to Bitcoin with one API call. Hash-in, proof-out.

```
artifact → artifact.proof
```

Zero dependencies. Node.js 18+.

## Install

```bash
npm install @umarise/anchor
```

## Anchor a file

```typescript
import { UmariseCore, hashBytes } from '@umarise/anchor';
import { readFile } from 'fs/promises';

const core = new UmariseCore({ apiKey: process.env.UMARISE_API_KEY });

const bytes = await readFile('./release.tar.gz');
const hash = await hashBytes(bytes);
const origin = await core.attest(hash);

console.log(origin.origin_id); // done
```

## Verify a file (no API key needed)

```typescript
const core = new UmariseCore();

const bytes = await readFile('./release.tar.gz');
const hash = await hashBytes(bytes);
const result = await core.verify(hash);

if (result) {
  console.log('Existed since:', result.captured_at);
}
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
| `resolve({ originId })` | Public | Lookup by origin ID |
| `resolve({ hash })` | Public | Lookup by hash |
| `verify(hash)` | Public | Check if hash is anchored |
| `proof(originId)` | Public | Download .ots proof |
| `attest(hash)` | API Key | Create anchor |

### `hashBytes(data)`

SHA-256 hash of a `Buffer` or `Uint8Array`. Bytes never leave your system.

```typescript
import { hashBytes } from '@umarise/anchor';
const hash = await hashBytes(fileBuffer);
// "sha256:a1b2c3..."
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
  }
}
```

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
