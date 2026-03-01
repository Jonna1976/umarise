# @umarise/anchor — SDK Specification

**Version:** 1.0.0  
**Status:** Draft for partner onboarding  
**Date:** 2026-03-01  
**Audience:** B2B partners, technical integrators, Oscar (sales)

---

## Wat het is

Een npm package die de Umarise Core v1 REST API wrapt in drie functies.  
Geen magie. Geen abstractie. Alleen minder boilerplate.

```
npm install @umarise/anchor
```

---

## API Surface

### `anchor(hash, options?) → Promise<AnchorResult>`

Registreer een hash in het Umarise-register.

```typescript
import { anchor } from '@umarise/anchor';

const result = await anchor('sha256:a7f3b2c1e4d5...', {
  apiKey: 'um_live_...',
});

// result:
// {
//   originId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
//   hash: "sha256:a7f3b2c1e4d5...",
//   capturedAt: "2026-03-01T14:30:00Z",
//   proofStatus: "pending"
// }
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hash` | `string` | ✅ | SHA-256 hash. Accepteert `sha256:hex` of raw 64-char hex. |
| `options.apiKey` | `string` | ✅ | Partner API key (`um_live_...` of `um_test_...`). |
| `options.baseUrl` | `string` | — | Override API endpoint. Default: `https://core.umarise.com` |
| `options.timeout` | `number` | — | Timeout in ms. Default: `12000` |

**Returns:** `AnchorResult`

```typescript
interface AnchorResult {
  originId: string;       // UUID — permanent identifier
  hash: string;           // Normalized sha256:hex
  capturedAt: string;     // ISO 8601 timestamp
  proofStatus: 'pending'; // Always 'pending' at creation
}
```

**Errors:**

| Code | HTTP | Meaning |
|------|------|---------|
| `DUPLICATE_HASH` | 409 | Hash already registered |
| `INVALID_HASH` | 400 | Not a valid SHA-256 hash |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `RATE_LIMITED` | 429 | Too many requests. `retryAfter` field included. |

---

### `verify(hash, options?) → Promise<VerifyResult | null>`

Controleer of een hash bestaat in het register. **Geen API key nodig.**

```typescript
import { verify } from '@umarise/anchor';

const result = await verify('sha256:a7f3b2c1e4d5...');

if (result) {
  console.log(`Existed since ${result.capturedAt}`);
  console.log(`Proof: ${result.proofStatus}`); // 'pending' | 'anchored'
} else {
  console.log('Not found in registry');
}
```

**Returns:** `VerifyResult | null`

```typescript
interface VerifyResult {
  originId: string;
  hash: string;
  capturedAt: string;
  proofStatus: 'pending' | 'anchored';
  proofUrl: string;       // URL to download .ots proof
}
```

`null` = hash niet gevonden in het register.

---

### `proof(originId, options?) → Promise<ProofResult>`

Download de OpenTimestamps proof voor een origin. **Geen API key nodig.**

```typescript
import { proof } from '@umarise/anchor';

const result = await proof('f47ac10b-58cc-4372-a567-0e02b2c3d479');

switch (result.status) {
  case 'anchored':
    fs.writeFileSync('proof.ots', result.data);
    console.log(`Bitcoin block: ${result.bitcoinBlockHeight}`);
    break;
  case 'pending':
    console.log('Proof submitted, awaiting Bitcoin confirmation');
    break;
  case 'not_found':
    console.log('No proof exists for this origin');
    break;
}
```

**Returns:** `ProofResult`

```typescript
interface ProofResult {
  originId: string;
  status: 'anchored' | 'pending' | 'not_found';
  data: Uint8Array | null;           // Binary .ots (only when anchored)
  bitcoinBlockHeight: number | null; // Block number (only when anchored)
  anchoredAt: string | null;         // ISO 8601 (only when anchored)
}
```

---

## Helper: `hashBuffer(buffer) → string`

Utility om een bestand te hashen. Geen Core API call.

```typescript
import { anchor, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

const hash = hashBuffer(readFileSync('contract.pdf'));
const result = await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });
console.log(`Origin: ${result.originId}`);
```

---

## Wat de SDK NIET doet

- **Geen bestanden opslaan.** Umarise ontvangt alleen hashes, nooit bestanden.
- **Geen identiteit.** Geen user accounts, geen sessies.
- **Geen interpretatie.** De SDK zegt niet wát iets is, alleen dát het bestond.
- **Geen retry logic.** Bij een fout krijg je een error. Jij beslist wat je ermee doet.
- **Geen caching.** Elke call gaat naar de Core API.

---

## Technische details

| Property | Value |
|----------|-------|
| Runtime | Node.js 18+, Bun, Deno, browsers (ESM) |
| Dependencies | 0 (zero) |
| Bundle size | < 4 KB gzipped |
| Protocol | HTTPS → Umarise Core v1 REST API |
| Auth | `X-API-Key` header (alleen voor `anchor()`) |
| Format | ESM + CJS dual export |

---

## Endpoint mapping

| SDK functie | HTTP method | Core API endpoint |
|-------------|-------------|-------------------|
| `anchor()` | `POST` | `/v1-core-origins` |
| `verify()` | `POST` | `/v1-core-verify` |
| `proof()` | `GET` | `/v1-core-proof?origin_id=` |
| `hashBuffer()` | — | Lokaal (Web Crypto / Node crypto) |

---

## Error handling

```typescript
import { AnchorError } from '@umarise/anchor';

try {
  await anchor(hash, { apiKey });
} catch (e) {
  if (e instanceof AnchorError) {
    console.log(e.code);        // 'DUPLICATE_HASH' | 'UNAUTHORIZED' | ...
    console.log(e.statusCode);  // 409 | 401 | ...
    console.log(e.retryAfter);  // seconds (only for RATE_LIMITED)
  }
}
```

---

## Wat Oscar kan zeggen

> "Integratie kost één middag. Vier regels code.  
> Jullie bestanden blijven bij jullie. Wij ontvangen alleen de hash.  
> Na integratie kan iedereen — jullie klanten, een rechter, een auditor —  
> onafhankelijk verifiëren dat het bestand bestond op dat moment.  
> Zonder ons te vertrouwen. De Bitcoin-blockchain is het bewijs."

---

## Prijsmodel

*Nog niet definitief. Beslissing volgt.*

`verify()` en `proof()` zijn altijd gratis en ongelimiteerd.  
Verificatie is een publiek goed.

`anchor()` vereist een API key. Volume en tarieven volgen.

---

## Tijdlijn

| Stap | Status |
|------|--------|
| Core API v1 | ✅ Live, bevroren |
| API Reference (umarise.com/api-reference) | ✅ Live — Quick Start, templates, troubleshooting, 15 tests |
| Partner onboarding docs | ✅ Vervalt — API reference dekt dit volledig |
| SDK spec (dit document) | ✅ Klaar |
| npm package `@umarise/anchor` | 🔲 ~2 dagen werk — enige echte gap |
| PyPI package `umarise` | 🔲 ~1 dag werk — enige echte gap |

De API reference op umarise.com/api-reference is de partner onboarding. Compleet: curl voorbeelden, Node.js en Python templates, AI-integratie prompt, Try it Live, 15 geautomatiseerde tests. Een aparte onboarding doc is overbodig.

