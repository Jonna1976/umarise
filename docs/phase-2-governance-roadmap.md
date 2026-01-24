# UMARISE — Phase 2 Governance Roadmap

**Date:** 2026-01-24  
**Status:** Planning  
**Scope:** What comes after the Origin Record Layer

---

## Phase 1 Recap

Phase 1 delivered a **working origin record layer**:
- Capture, seal, store, resolve, verify
- 100% operational on sovereign infrastructure
- Integration-ready with public API

**Phase 1 explicitly stopped at:**
> "Umarise doesn't govern. It makes governance unavoidable."

---

## Phase 2 Vision

Phase 2 extends the system in two directions:

1. **Deeper Privacy** — Zero-knowledge architecture
2. **External Integration** — Origin as infrastructure primitive

---

## Phase 2A: Zero-Knowledge Privacy

### Goal

> Not even Umarise can read user data.  
> The device becomes the system of record.

### Capabilities

| Capability | Technical Approach | Complexity |
|------------|-------------------|------------|
| **Client-side encryption** | AES-256-GCM, keys never leave device | Medium |
| **Encrypted search** | Searchable encryption or local index | High |
| **Local-first OCR** | On-device vision models (when quality matches) | Medium |
| **Key management** | User-held keys, optional escrow | Medium |

### Architecture Change

```
PHASE 1 (current):
User Device → Edge Proxy → Hetzner (processes plaintext)

PHASE 2A (target):
User Device (encrypts) → Edge Proxy → Hetzner (stores ciphertext only)
```

### Dependencies

| Dependency | Current Status | Required For |
|------------|----------------|--------------|
| On-device OCR quality | ❌ Not sufficient | Local-first processing |
| Searchable encryption library | ❌ Not evaluated | Encrypted search |
| Key backup UX | ❌ Not designed | User key management |

### Risk

> Client-side encryption breaks cloud OCR.  
> Must wait for on-device models to match Gemini quality.

---

## Phase 2B: External Integration

### Goal

> Umarise as infrastructure primitive for other systems.  
> External AI tools request access via consent gateway.

### Capabilities

| Capability | Description | Complexity |
|------------|-------------|------------|
| **MCP Server** | Model Context Protocol for AI tool access | Medium |
| **Origin Links API** | Cross-system references (cited, derived, referenced) | Low |
| **Consent Gateway** | User approves external access per-origin | Medium |
| **Revocation** | User can revoke access grants | Low |

### MCP Architecture

```
External AI Tool (Claude, GPT, etc.)
    │
    │ MCP Request
    ▼
Umarise MCP Server
    │ Checks consent
    ▼
┌─────────────────────┐
│ User Consent Check  │
│ "Allow X to read    │
│  origin Y?"         │
└─────────────────────┘
    │ If approved
    ▼
Origin Data (read-only access)
```

### API Extensions

```typescript
// New endpoints for Phase 2B

// Cross-system linking
POST /links
{
  origin_id: string;
  external_system: "notion" | "nextcloud" | "obsidian";
  external_reference: string;
  link_type: "derived" | "cited" | "referenced";
}

// Consent management
POST /consent
{
  origin_id: string;
  grantee: string;  // MCP client ID
  scope: "read" | "verify";
  expires_at?: string;
}

DELETE /consent/{consent_id}
```

---

## Phase 2C: Account Layer (Optional)

### Goal

> Allow users to "claim" their device-based data without losing history.

### Capabilities

| Capability | Description | Complexity |
|------------|-------------|------------|
| **Account creation** | Email/passkey signup | Low |
| **Device claiming** | Link device_user_id to account | Medium |
| **Cross-device access** | Same account, multiple devices | Medium |
| **Account migration** | Move data between accounts | High |

### Design Constraint

> Accounts are optional.  
> Anonymous device-based usage remains fully supported.

### Migration Path

```
BEFORE (Phase 1):
device_user_id = "abc123" → owns all origins

AFTER (Phase 2C):
account_id = "user@email.com"
    └── claimed device_user_ids: ["abc123", "def456"]
    └── owns all origins from claimed devices
```

---

## What Remains Governance Layer (NOT Umarise)

Phase 2 still does **not** include:

| Capability | Owner | Why Not Umarise |
|------------|-------|-----------------|
| Identity verification | Governance layer | We don't authenticate identity |
| Policy enforcement | Governance layer | We don't enforce rules |
| Dispute resolution | Governance layer | We don't arbitrate |
| Legal attestation | Governance layer | We don't provide legal standing |
| Compliance auditing | Governance layer | We don't audit behavior |

### Layer Boundary (unchanged)

```
┌─────────────────────────────────────────────────────────┐
│                   GOVERNANCE LAYER                       │
│  (Identity, Policy, Compliance, Enforcement, Dispute)   │
│                    ❌ NOT UMARISE                        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 ORIGIN RECORD LAYER                      │
│         (Capture, Preserve, Resolve, Verify)            │
│                    ✅ UMARISE                            │
│                                                         │
│  Phase 2 additions:                                     │
│  - Zero-knowledge encryption                            │
│  - MCP Server for external access                       │
│  - Consent gateway                                      │
│  - Optional accounts                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Enterprise Extensions (Post-Phase 2)

For enterprise/legal-grade requirements:

| Capability | Description | Trigger |
|------------|-------------|---------|
| **RFC 3161 Timestamping** | External timestamp authority | Legal requirement |
| **Blockchain anchoring** | Public ledger proof | Enterprise demand |
| **Digital signatures** | PKI-based authorship | Identity layer exists |
| **On-premise deployment** | Customer-hosted infrastructure | Enterprise deal |
| **Audit trails** | User-facing access logs | Compliance requirement |

---

## Phase 2 Prioritization

### Recommended Order

| Priority | Phase | Rationale |
|----------|-------|-----------|
| 1 | 2B: External Integration | Enables partner integrations now |
| 2 | 2C: Account Layer | Unlocks cross-device and team features |
| 3 | 2A: Zero-Knowledge | Requires on-device AI maturity |

### Decision Triggers

| If... | Then prioritize... |
|-------|---------------------|
| NextCloud partnership moves forward | 2B (MCP Server) |
| Team pilot requests cross-device | 2C (Accounts) |
| On-device OCR reaches Gemini quality | 2A (Zero-knowledge) |
| Enterprise deal requires timestamps | Enterprise extensions |

---

## Success Criteria for Phase 2

### Phase 2B (Integration)

- [ ] MCP Server operational
- [ ] At least 1 external system integrated
- [ ] Consent gateway functional
- [ ] Origin Links API implemented

### Phase 2C (Accounts)

- [ ] Account creation flow
- [ ] Device claiming works
- [ ] Cross-device access functional
- [ ] Anonymous mode still works

### Phase 2A (Privacy)

- [ ] Client-side encryption works
- [ ] Search still functional on encrypted data
- [ ] Local OCR quality acceptable
- [ ] Key recovery UX tested

---

## Timeline Estimate

| Phase | Estimated Duration | Dependencies |
|-------|-------------------|--------------|
| 2B | 4-6 weeks | Partner interest |
| 2C | 6-8 weeks | 2B complete |
| 2A | 8-12 weeks | On-device AI quality |

---

## Conclusion

> Phase 2 extends the origin record layer without becoming a governance system.  
> Privacy deepens. Integration expands. The boundary remains explicit.

**Key principle:**

> "Umarise provides the evidence layer.  
> Others provide the rules."

---

*Document version: 1.0*  
*Last updated: 2026-01-24*
