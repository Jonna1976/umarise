# Umarise Core — Phase 2: OpenTimestamps Integration

**Status:** Roadmap — Not Yet Implemented  
**Trigger:** Partner demand for independent verification OR strategic decision for attestations to survive Umarise  
**Complexity:** Low (weeks, not months)  
**Priority:** Phase 2 (after ritual validation, before scale)

---

## Executive Summary

This specification defines the integration of OpenTimestamps (OTS) into Umarise Core to provide trustless, blockchain-anchored attestations that can be verified independently of Umarise infrastructure.

### Phase Transition

| Phase | Trust Model | Verification Dependency | Survives Umarise? |
|-------|-------------|------------------------|-------------------|
| **1 (Current)** | Trusted Third Party | Requires Umarise database | No |
| **2 (With OTS)** | Trustless Infrastructure | Bitcoin blockchain | Yes |

---

## Problem Statement

Phase 1 provides:
- Write-once attestation with database-level immutability
- Public verification endpoints
- Privacy-by-design (no content storage)

Phase 1 does NOT provide:
- Verification independent of Umarise infrastructure
- Proofs that survive Umarise's closure
- Trustless anchoring (no need to trust Umarise)

For Umarise to function as a true infrastructure primitive (comparable to DNS, CA, TSA), attestations must be verifiable without depending on Umarise's continued operation.

---

## Solution: OpenTimestamps

OpenTimestamps (OTS) is a free, open-source protocol that anchors cryptographic hashes to the Bitcoin blockchain. It provides:

- **Trustless verification**: Anyone can verify a timestamp against the Bitcoin blockchain
- **Free operation**: No per-attestation cost (only Bitcoin transaction fees for batch anchoring)
- **Decentralized**: No single point of failure
- **Standardized**: Well-documented protocol with existing tooling

### How OTS Works

1. Submit hash to OTS calendar servers
2. Calendar servers aggregate hashes into Merkle trees
3. Merkle root is embedded in a Bitcoin transaction (~2 hours)
4. OTS returns a `.ots` proof file containing the Merkle path
5. Anyone can verify the proof against the Bitcoin blockchain

---

## Integration Architecture

### Workflow

```
User hash → Umarise DB (instant) → Batch Queue → Merkle Tree → OTS → Bitcoin
                ↑                                                      ↓
          Immediate response                                    Proof available
          (origin_id, captured_at)                              (~2-4 hours)
```

### Two-Phase Response

**Immediate (Phase 1 behavior preserved):**
```json
{
  "origin_id": "abc123",
  "hash": "sha256:...",
  "captured_at": "2026-02-04T12:00:00Z",
  "anchoring_status": "pending"
}
```

**After Bitcoin confirmation (~2-4 hours):**
```json
{
  "origin_id": "abc123",
  "hash": "sha256:...",
  "captured_at": "2026-02-04T12:00:00Z",
  "anchoring_status": "confirmed",
  "bitcoin_block": 900000,
  "ots_proof": "base64-encoded-.ots-file"
}
```

### Database Changes

```sql
-- Add OTS anchoring fields to origin_attestations
ALTER TABLE origin_attestations ADD COLUMN ots_proof BYTEA;
ALTER TABLE origin_attestations ADD COLUMN ots_status TEXT DEFAULT 'pending';
ALTER TABLE origin_attestations ADD COLUMN bitcoin_block INTEGER;
ALTER TABLE origin_attestations ADD COLUMN bitcoin_txid TEXT;
ALTER TABLE origin_attestations ADD COLUMN anchored_at TIMESTAMPTZ;

-- Create batch tracking table
CREATE TABLE ots_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merkle_root TEXT NOT NULL,
  attestation_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  bitcoin_block INTEGER,
  bitcoin_txid TEXT,
  ots_proof BYTEA
);

-- Link attestations to batches
ALTER TABLE origin_attestations ADD COLUMN batch_id UUID REFERENCES ots_batches(id);
```

### Batch Processing

To minimize Bitcoin transaction costs and optimize throughput:

1. **Aggregation window**: Collect attestations for N minutes (configurable, default: 60)
2. **Build Merkle tree**: Combine all attestation hashes
3. **Submit root**: Send Merkle root to OTS calendar servers
4. **Wait for confirmation**: Bitcoin block inclusion (~2-4 hours)
5. **Distribute proofs**: Generate individual `.ots` proofs for each attestation

### API Changes

**GET /core/resolve** — Add optional OTS proof:
```json
{
  "origin_id": "abc123",
  "hash": "sha256:...",
  "captured_at": "2026-02-04T12:00:00Z",
  "ots": {
    "status": "confirmed",
    "bitcoin_block": 900000,
    "proof": "base64-encoded-.ots-file"
  }
}
```

**New endpoint: GET /core/proof/{origin_id}**
- Returns standalone `.ots` file for independent verification
- Can be verified with standard OTS tools without Umarise

---

## Verification Independence

### With Umarise Online

Standard flow via `/core/resolve` and `/core/verify`.

### With Umarise Offline (or non-existent)

1. Partner has original bytes
2. Partner has `.ots` proof file (downloaded earlier or from backup)
3. Partner computes SHA-256 of original bytes
4. Partner verifies `.ots` proof against Bitcoin blockchain using standard OTS tools

```bash
# Standard OTS verification (no Umarise dependency)
ots verify document.pdf.ots
```

**Result**: Proof survives Umarise. Verification is trustless.

---

## Implementation Phases

### Phase 2A: Basic Integration (1-2 weeks)

- [ ] Add OTS fields to database schema
- [ ] Implement batch aggregation (cron job or scheduled function)
- [ ] Integrate OTS library (opentimestamps-client)
- [ ] Submit batches to public OTS calendar servers
- [ ] Store proofs upon Bitcoin confirmation
- [ ] Update `/core/resolve` to include OTS status

### Phase 2B: Proof Distribution (1 week)

- [ ] New endpoint: `GET /core/proof/{origin_id}`
- [ ] Generate individual Merkle proofs from batch proof
- [ ] Document independent verification workflow

### Phase 2C: Monitoring & Reliability (1 week)

- [ ] Dashboard for batch status
- [ ] Alerting for failed submissions
- [ ] Retry logic for calendar server failures
- [ ] Multiple calendar server redundancy

---

## Trade-offs

### Latency

| Phase | Attestation | Verification |
|-------|-------------|--------------|
| 1 (current) | Instant | Instant |
| 2 (with OTS) | Instant | Instant (DB) or ~2-4h (blockchain) |

**Note**: Database attestation remains instant. OTS anchoring is additive, not blocking.

### Complexity

- Additional infrastructure: batch processing, proof storage
- External dependency: OTS calendar servers (mitigated by redundancy)
- Bitcoin dependency: ~10 min block time, ~6 confirmations for finality

### Cost

- OTS is free (calendar servers are public)
- Bitcoin transaction fees: ~$1-5 per batch (not per attestation)
- With 1-hour batching: ~$24-120/day for unlimited attestations

---

## When to Implement

### Trigger Conditions (any of these):

1. **Partner demand**: "We need verification independent of your infrastructure"
2. **Strategic decision**: "We want attestations to survive us"
3. **Scale signal**: First paying enterprise partner
4. **Regulatory requirement**: External anchoring becomes compliance requirement

### NOT a trigger:

- Technical curiosity
- Feature completeness desire
- Competitive pressure from non-verified claims

---

## Positioning After OTS

With OTS integration, Umarise becomes:

> A permissioned attestation layer with trustless blockchain anchoring.  
> Write access is gated. Read access is public. Verification is independent.

This positions Umarise as:
- **Not just a database** (proofs survive infrastructure)
- **Not just OTS** (permissioned access, resolution semantics, API abstraction)
- **Infrastructure primitive** (neutral, trustless, indifferent)

---

## References

- [OpenTimestamps.org](https://opentimestamps.org/)
- [OTS Protocol Specification](https://github.com/opentimestamps/opentimestamps-client/blob/master/doc/git-integration.md)
- [Bitcoin Timestamping Explained](https://petertodd.org/2016/opentimestamps-announcement)
- [OriginStamp](https://originstamp.com/) — Commercial implementation of similar approach

---

## Conclusion

OTS integration is technically straightforward and strategically correct for Phase 2. It transforms Umarise from a trusted third party into a trustless infrastructure primitive.

**However**: This is a Phase 2 concern. Phase 1 priority is ritual validation — does the App help people consciously mark beginnings? Database-level immutability is sufficient for that validation.

Build OTS when it matters. Not before.

---

*Document version: 1.0*  
*Status: Roadmap specification*  
*Implementation: Pending trigger condition*
