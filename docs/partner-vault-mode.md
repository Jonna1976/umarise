# Partner Vault Mode — Data Custody & Verification

> How Umarise provides origin verification without taking custody of sensitive data.

---

## The Core Question

**"Don't organizations want to keep their data inside their own systems?"**

Yes — and that's exactly what Partner Vault Mode enables.

---

## What Umarise Stores vs. What Partners Store

| Component | Location | Reconstructable? |
|-----------|----------|------------------|
| SHA-256 hash (fingerprint) | Umarise Control Plane | ❌ No — cryptographic one-way function |
| Timestamp (captured_at) | Umarise Control Plane | N/A |
| Origin ID | Umarise Control Plane | N/A |
| **Original artifact (bytes)** | **Partner's own vault** | ✅ Yes — under their control |

**Key insight:** A SHA-256 hash cannot be reversed into the original document. It's a fingerprint, not a copy.

---

## How Partner Vault Mode Works

```
1. Partner captures origin (document, image, file)
2. Partner computes SHA-256 hash locally
3. Partner sends ONLY the hash to Umarise API
4. Umarise records: hash + timestamp + origin_id
5. Partner stores artifact in their OWN vault (Proton, Nextcloud, S3, etc.)
6. Later: Partner downloads artifact, computes hash, verifies against Umarise
```

**Result:** Sensitive data never leaves the partner's infrastructure.

---

## The Notary Analogy

A notary doesn't read your contract — they only stamp that it existed on a specific date.

| Notary (Umarise) | Vault (Partner's System) |
|------------------|--------------------------|
| Records that something existed | Stores the thing itself |
| Cannot reconstruct content | Full access to content |
| Provides third-party verification | Provides internal access |

---

## Why External Verification Matters

**"Can't organizations just verify their own origins internally?"**

No — and here's why:

| Internal Origin System | External Anchor (Umarise) |
|------------------------|---------------------------|
| "We say it's original" | "Anyone can verify" |
| Self-attestation | Third-party proof |
| Liability stays internal | Verification is independent |
| No external validation | Bit-identity proof via API |

**The core principle:** A company cannot notarize its own documents. Verification value comes from independence.

---

## Two Operating Modes

### Default Mode (Umarise-Hosted)
- Hash + metadata → Supabase (Control Plane)
- Artifact → Hetzner Germany (Data Plane)
- Full custody by Umarise infrastructure

### Partner Vault Mode
- Hash + metadata → Supabase (Control Plane)  
- Artifact → Partner's vault (their choice)
- Zero artifact custody by Umarise

Partners choose based on their compliance requirements and data sovereignty needs.

---

## Addressing the "External Dependency" Concern

Umarise is not an external dependency that organizations must manage.

It's a **neutral anchor point** — similar to:
- DNS (domain name resolution)
- Certificate Authorities (TLS certificates)
- Public key registries

Organizations don't need to "own" these systems to benefit from them. They reference them.

---

## The Value Proposition

Big tech doesn't want an origin-anchor **outside** their system.

They need an origin-anchor **alongside** their system — to make claims verifiable by third parties.

**"Without owning it"** means:
- No custody responsibility
- No infrastructure management
- No vendor lock-in on artifacts
- Just API calls to record and verify

---

## API Primitives for Partner Vault Mode

```bash
# Record origin (hash only, no artifact)
POST /origins
{
  "origin_hash_sha256": "a1b2c3...",
  "captured_at": "2026-01-30T12:00:00Z",
  "metadata": { "source": "partner_system" }
}

# Verify later
POST /verify
{
  "origin_id": "uuid",
  "content_base64": "..." # Partner provides bytes for hash comparison
}
```

---

## Summary

| Question | Answer |
|----------|--------|
| Does sensitive data leave partner systems? | No — only the hash |
| Can Umarise reconstruct documents from hashes? | No — cryptographically impossible |
| Why not verify internally? | Self-attestation has no third-party value |
| Is Umarise a dependency to manage? | No — it's a neutral anchor to reference |

---

*Document version: 1.0*  
*Created: January 2026*
