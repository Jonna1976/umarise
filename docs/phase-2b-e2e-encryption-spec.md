# Phase 2B: End-to-End Encryption Specification

**Status**: Draft — Pre-implementation  
**Version**: 0.1  
**Last updated**: January 29, 2026  
**Author**: Umarise Engineering  

---

## Table of Contents

1. [Objective](#objective)
2. [Threat Model](#threat-model)
3. [Core Invariants](#core-invariants)
4. [Key Model](#key-model)
5. [Cryptographic Implementation](#cryptographic-implementation)
6. [Storage Architecture](#storage-architecture)
7. [Recovery Flows](#recovery-flows)
8. [Verification Compatibility](#verification-compatibility)
9. [Migration Strategy](#migration-strategy)
10. [Acceptance Criteria](#acceptance-criteria)
11. [Known Trade-offs](#known-trade-offs)
12. [Implementation Phases](#implementation-phases)

---

## Objective

Upgrade origin confidentiality from 4/5 (encrypted-at-rest) to 5/5 (end-to-end encrypted) by ensuring that neither Hetzner nor Supabase can access origin content, even with full database/storage access.

**Target state**: Only the device holding the encryption key can decrypt origin content.

---

## Threat Model

### Adversaries

| Adversary | Capability | Goal |
|-----------|------------|------|
| **Hetzner Admin** | Full storage access | Read origin images |
| **Supabase Admin** | Full database access | Read metadata, reconstruct origins |
| **Network Attacker** | MITM on TLS (unlikely) | Intercept origin uploads |
| **XSS Attacker** | JavaScript execution in browser | Steal keys from storage |
| **Device Thief** | Physical device access | Extract keys from storage |

### What We Defend Against

| Threat | Mitigation | Phase |
|--------|------------|-------|
| Hetzner reads origin bytes | Encrypt before upload | 2B |
| Supabase reads origin bytes | Never stored there (Phase 1 ✓) | 1 |
| Supabase reads encryption keys | Keys never leave client | 2B |
| XSS steals keys from localStorage | IndexedDB + non-extractable CryptoKey | 2B |
| Device loss = data loss | Recovery key export (QR) | 2B |

### What We Do NOT Defend Against (Accepted Risks)

| Risk | Rationale |
|------|-----------|
| Malicious browser extension | Out of scope; requires user trust |
| Compromised device OS | Out of scope; requires secure hardware |
| User loses recovery key | Explicit failure posture: origins unrecoverable |
| Plaintext hash as fingerprint | Documented trade-off; verification requires it |

---

## Core Invariants

These invariants are **non-negotiable**. Any implementation that violates them is rejected.

```
INV-1: Supabase dump yields zero plaintext origin bytes.
INV-2: Hetzner dump yields zero plaintext origin bytes.
INV-3: Encryption keys never transit network in plaintext.
INV-4: Per-origin key compromise affects only that origin.
INV-5: Verification works without decryption.
INV-6: User without recovery key = origins permanently encrypted.
```

---

## Key Model

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      KEY HIERARCHY                          │
│                                                             │
│  Recovery Key (RK)                                         │
│  └── 256-bit random, generated on first capture            │
│      └── Stored: NEVER on server                           │
│      └── Backup: QR code (user responsibility)             │
│                                                             │
│  Master Key (MK)                                           │
│  └── Derived from RK via HKDF-SHA256                       │
│      └── Purpose: Encrypt per-origin keys                  │
│      └── Stored: IndexedDB as non-extractable CryptoKey    │
│                                                             │
│  Per-Origin Key (POK)                                      │
│  └── 256-bit random, generated per capture                 │
│      └── Encrypted under MK before storage                 │
│      └── Stored: IndexedDB (encrypted)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Derivation

```
Recovery Key (RK): crypto.getRandomValues(new Uint8Array(32))

Master Key (MK): HKDF-SHA256(
  ikm: RK,
  salt: "umarise-mk-v1",
  info: device_user_id,
  length: 256 bits
)

Per-Origin Key (POK): crypto.getRandomValues(new Uint8Array(32))
```

### Why NOT device_user_id as Master Key

| Problem | Impact |
|---------|--------|
| device_user_id is stored in localStorage | XSS can read it |
| device_user_id is sent to server | Network logs could contain it |
| device_user_id is 128-bit UUID | Insufficient entropy for direct use |
| device_user_id is predictable pattern | Brute-force feasible |

**Decision**: Random 256-bit Recovery Key is the root of trust.

---

## Cryptographic Implementation

### Algorithm Selection

| Component | Algorithm | Parameters |
|-----------|-----------|------------|
| Origin encryption | AES-256-GCM | 256-bit key, 96-bit IV |
| Key wrapping | AES-256-GCM | MK wraps POK |
| Key derivation | HKDF-SHA256 | RK → MK |
| Origin hashing | SHA-256 | Plaintext → hash (pre-encryption) |

### Encryption Format

```typescript
interface EncryptedOrigin {
  version: 1;                    // Schema version
  algorithm: "AES-256-GCM";      // Algorithm identifier
  iv: Uint8Array;                // 12 bytes, random per encryption
  ciphertext: Uint8Array;        // Encrypted origin bytes
  tag: Uint8Array;               // 16 bytes, GCM auth tag
  aad: {                         // Additional Authenticated Data
    origin_id: string;           // Prevents ciphertext swapping
    captured_at: string;         // ISO timestamp
    hash_sha256: string;         // Plaintext hash (for verification)
  };
}
```

### AAD (Additional Authenticated Data)

AAD is included in the GCM authentication but NOT encrypted. This ensures:

1. **Integrity**: Tampering with metadata invalidates decryption
2. **Binding**: Ciphertext cannot be swapped between origins
3. **Verification**: Hash remains accessible for verification

```typescript
const aad = JSON.stringify({
  origin_id: "fb025c0e-0dc8-4b4f-b795-43177ea2a045",
  captured_at: "2026-01-29T10:30:00Z",
  hash_sha256: "a1b2c3d4..."
});
```

### WebCrypto Implementation Notes

```typescript
// Generate non-extractable Master Key
const masterKey = await crypto.subtle.importKey(
  "raw",
  masterKeyBytes,
  { name: "AES-GCM" },
  false,  // extractable = false (critical!)
  ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
);

// Generate per-origin key (extractable for wrapping)
const originKey = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,   // extractable = true (for wrapping)
  ["encrypt", "decrypt"]
);

// Wrap per-origin key with master key
const wrappedKey = await crypto.subtle.wrapKey(
  "raw",
  originKey,
  masterKey,
  { name: "AES-GCM", iv: wrapIV }
);
```

---

## Storage Architecture

### Client-Side (IndexedDB)

```typescript
// Database: "umarise-keyring"
// Object Store: "keys"

interface KeyringEntry {
  origin_id: string;           // Primary key
  wrapped_key: ArrayBuffer;    // POK encrypted under MK
  wrap_iv: ArrayBuffer;        // IV used for wrapping
  created_at: string;          // ISO timestamp
}

// Object Store: "master"
interface MasterKeyEntry {
  id: "master";                // Singleton
  key: CryptoKey;              // Non-extractable MK
  created_at: string;
}
```

### Why IndexedDB over localStorage

| localStorage | IndexedDB + WebCrypto |
|--------------|----------------------|
| Stores strings only | Stores CryptoKey objects |
| Keys are extractable | Keys can be non-extractable |
| XSS can read all data | XSS cannot extract non-extractable keys |
| Synchronous API | Async, doesn't block UI |

### Server-Side (Optional: Encrypted Keyring Backup)

For cross-device sync (future), an encrypted keyring blob can be stored in Supabase:

```typescript
interface EncryptedKeyringBackup {
  device_user_id: string;
  encrypted_keyring: ArrayBuffer;  // Entire keyring encrypted under RK
  iv: ArrayBuffer;
  created_at: string;
  updated_at: string;
}
```

**Invariant**: Supabase stores ciphertext only. Recovery Key never leaves client.

---

## Recovery Flows

### Export (Backup)

```
User clicks "Backup Keys" →
  Generate QR containing: base64(Recovery Key) →
  Display QR + warning: "Store safely. Cannot be recovered." →
  User saves QR (screenshot, print, password manager)
```

### Import (Restore)

```
User clicks "Restore Keys" on new device →
  Scan QR / paste Recovery Key →
  Derive Master Key from Recovery Key →
  Store MK in IndexedDB (non-extractable) →
  If encrypted keyring backup exists in Supabase:
    Fetch and decrypt keyring →
    Import per-origin keys
```

### Failure Posture

| Scenario | Outcome |
|----------|---------|
| Device lost, has backup | Restore on new device via QR |
| Device lost, no backup | Origins remain encrypted forever |
| QR leaked | Attacker can decrypt all origins |
| Recovery Key forgotten | Origins remain encrypted forever |

**UI Messaging**: "Without your Recovery Key, your origins cannot be decrypted. Umarise cannot help you recover them. This is by design."

---

## Verification Compatibility

Verification continues to work WITHOUT decryption:

```
┌─────────────────────────────────────────────────────────────┐
│                    VERIFICATION FLOW                        │
│                                                             │
│  Partner: POST /verify { content: base64 }                 │
│                                                             │
│  Server:                                                   │
│    1. Compute hash = SHA-256(base64decode(content))        │
│    2. Lookup stored_hash by origin_id                      │
│    3. Return { match: hash === stored_hash }               │
│                                                             │
│  ✓ No decryption needed                                    │
│  ✓ Server never sees encryption key                        │
│  ✓ API unchanged from Phase 1                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hash-as-Fingerprint Trade-off

The plaintext SHA-256 hash is stored unencrypted. This is a known trade-off:

| Pro | Con |
|-----|-----|
| Enables verification without keys | Hash is a stable fingerprint |
| Partners don't need trust relationship | Brute-force theoretically possible |
| API remains stateless | Rainbow table for known images |

**Mitigation (Phase 3)**: Optional "private verify" mode where hash is salted with a partner-specific key.

**Current Decision**: Accept trade-off. For handwritten/photo origins, brute-force is computationally infeasible.

---

## Migration Strategy

### New Origins (Post-E2E)

All new captures automatically encrypted.

### Existing Origins (Pre-E2E)

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **Leave unencrypted** | Legacy origins remain at-rest encrypted only | ✓ Simplest |
| **Client-side migration** | Re-fetch, encrypt, re-upload | Complex, bandwidth heavy |
| **Gradual migration** | Encrypt on next view | Eventual consistency |

**Decision**: Leave existing origins unencrypted. Document as "legacy capture" in UI. New origins are E2E.

---

## Acceptance Criteria

### Functional

- [ ] New captures are encrypted before upload
- [ ] Encrypted origins display correctly to owner
- [ ] Verification works without decryption
- [ ] Recovery key export generates valid QR
- [ ] Recovery key import restores access on new device
- [ ] Legacy (unencrypted) origins continue to display

### Security

- [ ] `Supabase.dump() → grep origin_bytes` returns zero matches
- [ ] `Hetzner.dump() → decrypt without RK` fails
- [ ] XSS payload cannot extract Master Key from IndexedDB
- [ ] Network capture shows only ciphertext, never plaintext
- [ ] Ciphertext swapping between origins fails authentication

### Performance

- [ ] Encryption adds < 100ms to capture flow
- [ ] Decryption adds < 100ms to display flow
- [ ] Key derivation is imperceptible (< 50ms)

---

## Known Trade-offs

| Trade-off | Accepted | Rationale |
|-----------|----------|-----------|
| Plaintext hash stored | Yes | Required for verification without keys |
| No key recovery by Umarise | Yes | Core E2E guarantee |
| Legacy origins unencrypted | Yes | Migration complexity not worth it |
| Single-device by default | Yes | Multi-device is Phase 3 |

---

## Implementation Phases

### Phase 2B-1: Core Crypto (1-2 weeks)

1. `src/lib/crypto/keyManager.ts` — Key generation, derivation, storage
2. `src/lib/crypto/originEncryption.ts` — Encrypt/decrypt with AAD
3. Unit tests for crypto primitives

### Phase 2B-2: Capture Integration (1 week)

1. Modify capture flow: hash → encrypt → upload
2. Store wrapped per-origin key in IndexedDB
3. Update origin metadata to include encryption version

### Phase 2B-3: Display Integration (1 week)

1. Modify display flow: fetch → decrypt → render
2. Handle legacy (unencrypted) origins gracefully
3. UI indicator for E2E vs legacy

### Phase 2B-4: Recovery UX (1 week)

1. Recovery key export (QR generator)
2. Recovery key import (QR scanner)
3. "Lost key" messaging and failure posture
4. First-capture onboarding: "Backup your key"

### Phase 2B-5: Validation (1 week)

1. Red-team: "Supabase dump yields no plaintext"
2. Red-team: "Hetzner dump yields no plaintext"
3. XSS simulation: attempt key extraction
4. Cross-device restore test

---

## Red-Team Checklist

Before shipping, the following attacks must fail:

| Attack | Expected Result |
|--------|-----------------|
| Dump Supabase DB, search for origin bytes | Zero matches |
| Dump Hetzner storage, decrypt without RK | Decryption fails |
| XSS: `indexedDB.open('umarise-keyring')` | Key is non-extractable |
| Swap ciphertext between two origins | GCM auth fails |
| Replay old ciphertext after key rotation | Decryption fails |
| Brute-force hash (for known image) | Computationally infeasible |

---

## Open Questions

1. **Multi-device sync**: Store encrypted keyring in Supabase, or require manual QR transfer?
2. **Key rotation**: Should users be able to re-encrypt with new key? (Complexity vs security)
3. **Shared origins**: If two users capture same content, both have same hash. Is this a problem?
4. **Browser compatibility**: Safari IndexedDB + WebCrypto limitations?

---

## References

- [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM Spec](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [HKDF RFC 5869](https://tools.ietf.org/html/rfc5869)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

*This specification is subject to review before implementation. No code should be written until this document is approved.*
