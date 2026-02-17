# Briefing: Prevent duplicate hash attestation per partner

## Problem

The same partner can attest the same hash twice. Each gets a separate
origin_id. This is likely a mistake by the partner (duplicate submission).

**Found during self-testing 17 Feb 2026:**
```
Hash: sha256:5a0e2dad0c3e7fa02e7c4ae9775e43c391782ffbeca39eb2c99b2f32ca8741d2
First:  origin_id d24dc9ec-... (12:10:05)
Second: origin_id 2609e4ce-... (12:10:06)
Same API key, same hash, two records.
```

## Desired behavior

| Scenario | Result |
|----------|--------|
| Partner A attests hash X | ✅ Created |
| Partner A attests hash X again | ❌ Error: DUPLICATE_HASH |
| Partner B attests hash X | ✅ Created (different partner, allowed) |

Same hash + same partner = error.
Same hash + different partner = allowed.

## Implementation

### 1. Database: unique constraint

Add a unique constraint on `(hash, api_key_id)` in `origin_attestations`:

```sql
ALTER TABLE origin_attestations
ADD CONSTRAINT unique_hash_per_partner UNIQUE (hash, api_key_id);
```

If the table does not have an `api_key_id` column, the constraint should
be on whatever column links the attestation to the partner (e.g. `partner_id`,
`created_by`, or the API key identifier used during creation).

If no such column exists: add one. Every attestation should know which
partner created it.

**Alternative if partner tracking is not yet in the table:**
A simpler constraint on just `hash` would prevent ALL duplicates (even
cross-partner). This is more restrictive but simpler. Choose based on
current schema.

### 2. Edge Function: return clear error

In the `/v1-core-origins` Edge Function, catch the unique constraint
violation and return:

```json
{
  "error": {
    "code": "DUPLICATE_HASH",
    "message": "This hash has already been attested with this API key"
  }
}
```

HTTP status: **409 Conflict**

### 3. Error codes documentation

Add to the error codes table on `/api-reference`:

| Code | HTTP | Description |
|------|------|-------------|
| DUPLICATE_HASH | 409 | Hash already attested by this API key |

### 4. Clean up existing duplicates (optional)

After adding the constraint, there may be existing duplicates that
prevent the constraint from being applied. Query:

```sql
SELECT hash, api_key_id, COUNT(*)
FROM origin_attestations
GROUP BY hash, api_key_id
HAVING COUNT(*) > 1;
```

For each duplicate: keep the earliest (first captured_at), remove the
later ones. This is safe because verify already returns first-in-time.

**Important:** Only remove duplicates where the same partner attested
the same hash. Cross-partner duplicates are valid and must be kept.

## What NOT to change

- Verify still returns first-in-time (unchanged)
- Resolve still works by origin_id and by hash (unchanged)
- Different partners can still attest the same hash (allowed)
- Existing valid attestations are not affected

## Test after implementation

```bash
# Should succeed (new hash)
HASH=$(echo "dup-test-$(date +%s)" | shasum -a 256 | cut -d' ' -f1)
curl -X POST https://core.umarise.com/v1-core-origins \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: um_your_key' \
  -d "{\"hash\":\"sha256:$HASH\"}"
# Expected: 201 Created

# Should fail (same hash, same key)
curl -X POST https://core.umarise.com/v1-core-origins \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: um_your_key' \
  -d "{\"hash\":\"sha256:$HASH\"}"
# Expected: 409 Conflict, DUPLICATE_HASH
```
