# Umarise Core — Quickstart

Origin registry for digital artifacts. Attests that a hash existed at a specific point in time.

Three operations: **attest**, **resolve**, **verify**.

---

## 1. Get an API Key

Contact [partners@umarise.com](mailto:partners@umarise.com) with:
- Your organization name
- Use case (what will you attest?)
- Expected volume

---

## 2. Attest an Origin

Hash your content locally, then attest the hash:

### curl

```bash
# Hash your file locally (Core never sees your content)
HASH=$(sha256sum myfile.pdf | awk '{print "sha256:"$1}')

# Attest the hash
curl -X POST https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-origins \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d "{\"hash\": \"$HASH\"}"
```

### JavaScript

```javascript
async function attestOrigin(content, apiKey) {
  // Hash locally using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const response = await fetch(
    'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-origins',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ hash: `sha256:${hash}` })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

// Usage
const origin = await attestOrigin('Hello, World!', 'YOUR_API_KEY');
console.log('Origin ID:', origin.origin_id);
console.log('Captured at:', origin.captured_at);
```

### Python

```python
import hashlib
import requests

def attest_origin(content: bytes, api_key: str) -> dict:
    """Hash content locally and attest the hash."""
    # Hash locally
    hash_hex = hashlib.sha256(content).hexdigest()
    
    response = requests.post(
        'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-origins',
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        },
        json={'hash': f'sha256:{hash_hex}'}
    )
    
    response.raise_for_status()
    return response.json()

# Usage
with open('myfile.pdf', 'rb') as f:
    origin = attest_origin(f.read(), 'YOUR_API_KEY')

print(f"Origin ID: {origin['origin_id']}")
print(f"Captured at: {origin['captured_at']}")
```

**Response (201 Created):**

```json
{
  "origin_id": "550e8400-e29b-41d4-a716-446655440000",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash_algo": "sha256",
  "captured_at": "2026-02-04T14:30:00.000Z"
}
```

---

## 3. Resolve an Origin

Lookup by origin ID or hash (no authentication required):

### curl

```bash
# By origin_id
curl "https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-resolve?origin_id=550e8400-e29b-41d4-a716-446655440000"

# By hash
curl "https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-resolve?hash=sha256:e3b0c44..."
```

### JavaScript

```javascript
async function resolveOrigin(originId) {
  const response = await fetch(
    `https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-resolve?origin_id=${originId}`
  );

  if (response.status === 404) {
    return null; // Not found
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}
```

### Python

```python
def resolve_origin(origin_id: str) -> dict | None:
    """Lookup an origin by ID."""
    response = requests.get(
        'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-resolve',
        params={'origin_id': origin_id}
    )
    
    if response.status_code == 404:
        return None
    
    response.raise_for_status()
    return response.json()
```

---

## 4. Verify a Hash

Check if content has been attested (no authentication required):

### curl

```bash
# Hash your file and verify
HASH=$(sha256sum myfile.pdf | awk '{print "sha256:"$1}')

curl -X POST https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-verify \
  -H "Content-Type: application/json" \
  -d "{\"hash\": \"$HASH\"}"
```

### JavaScript

```javascript
async function verifyContent(content) {
  // Hash locally
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const response = await fetch(
    'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: `sha256:${hash}` })
    }
  );

  if (response.status === 404) {
    return { verified: false };
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const origin = await response.json();
  return { verified: true, origin };
}

// Usage
const result = await verifyContent('Hello, World!');
if (result.verified) {
  console.log('Content attested at:', result.origin.captured_at);
} else {
  console.log('Content has not been attested');
}
```

### Python

```python
def verify_content(content: bytes) -> dict:
    """Hash content and verify if it has been attested."""
    hash_hex = hashlib.sha256(content).hexdigest()
    
    response = requests.post(
        'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/v1-core-verify',
        headers={'Content-Type': 'application/json'},
        json={'hash': f'sha256:{hash_hex}'}
    )
    
    if response.status_code == 404:
        return {'verified': False}
    
    response.raise_for_status()
    return {'verified': True, 'origin': response.json()}

# Usage
with open('myfile.pdf', 'rb') as f:
    result = verify_content(f.read())

if result['verified']:
    print(f"Attested at: {result['origin']['captured_at']}")
else:
    print("Not attested")
```

---

## Done.

Your first origin is attested, resolvable, and verifiable.

### Next Steps

- [OpenAPI Specification](/openapi.yaml) — Full API reference
- [Origin Specification](/origin) — Technical architecture
- [partners@umarise.com](mailto:partners@umarise.com) — Questions & API key requests

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No matching origin found for hash"
  }
}
```

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_HASH_FORMAT` | 400 | Hash not in valid format |
| `INVALID_REQUEST_BODY` | 400 | JSON parsing failed or missing fields |
| `REJECTED_FIELD` | 400 | Sent bytes/content instead of hash |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `API_KEY_REVOKED` | 403 | API key was revoked |
| `NOT_FOUND` | 404 | Origin not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /v1-core-origins | 100–100,000 | per minute (tier-based) |
| GET /v1-core-resolve | 1,000 | per minute per IP |
| POST /v1-core-verify | 1,000 | per minute per IP |

Rate limit headers in every response:
- `X-RateLimit-Limit` — Maximum requests
- `X-RateLimit-Remaining` — Remaining in window
- `X-RateLimit-Reset` — Unix timestamp when window resets
