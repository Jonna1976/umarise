# Layer Boundaries — Origin Layer vs Governance Layer

> This document defines the explicit boundary between what Umarise implements and what belongs to upstream governance systems.  
> Strategic protection against scope-creep and political claims.

---

## 1. What Umarise IS

### Core Positioning

> **Umarise is de origin-layer voor elk systeem dat data verwerkt.**  
> **Umarise zelf verwerkt geen data — het legt alleen vast wat er ontstond.**

### Definition

> **Umarise is an origin record layer.**  
> A system-of-record that captures and preserves original state before transformation.

### Vastleggen vs. Opslaan

| | **Vastleggen** (Umarise) | **Opslaan** (Proton/Nextcloud/etc.) |
|---|---|---|
| **What** | Proof that something existed | Preserving the data itself |
| **Mutable** | No (hash is immutable) | Yes (file can be modified) |
| **Purpose** | Verification after the fact | Access and management |
| **Analogy** | Notary recording a deed | Vault where you store the deed |

> **Key distinction:** Storage = preserving bytes. Recording = proving which bytes existed.

### Storage-Agnostic

Umarise works with any storage or communication system:
- Any vault (Proton, Nextcloud, Solid, Dropbox, S3...)
- Any communication system (email, chat, CRM...)
- Any workflow system (AI agents, automation, ERP...)

> **Vault independence:** Umarise's verification is independent of vault security.  
> If the vault is compromised → Umarise verification **fails** → you know tampering occurred.  
> If the vault is secure → Umarise verification **passes** → you have proof it's unchanged.

### Concrete responsibilities

| Function | Description |
|----------|-------------|
| **Record** | Capture what existed |
| **Prove** | Demonstrate it is unchanged |
| **Expose** | Make it visible to downstream systems |

### Core statement

> **Umarise registers. It does not judge.**

---

## 2. Why Origin Matters

### The Asymmetry

Without origin, AI and data systems can **operate**.  
With origin, they can **withstand scrutiny**.

This is not philosophical — it is architectural. Origin is the reference point that makes verification possible.

### Concrete Scenarios

| Scenario | Without Origin | With Origin |
|----------|----------------|-------------|
| **AI output is disputed** | "The AI made it up" — no way to check | Compare output against recorded input → bit-identity proof |
| **Document has been modified** | "He said, she said" — discovery process begins | Hash comparison reveals exact change → dispute resolved in seconds |
| **Contract terms are contested** | Expensive arbitration, uncertain outcome | Original version is cryptographically verifiable |
| **Employee claims unfair treatment** | HR has no defensible record | Origin of communication is immutable |
| **Partner claims data was altered** | Relationship damage, legal exposure | Third-party verification via Umarise API |

### Business Consequences

| Aspect | Cost Without Origin | Benefit With Origin |
|--------|---------------------|---------------------|
| **Legal exposure** | €10K–€500K+ per dispute (discovery, arbitration) | Disputes are trivially resolvable |
| **Time to resolution** | Weeks to months | Seconds (API call) |
| **Burden of proof** | On the defender | Shared — evidence exists |
| **Reputation risk** | "They can't prove anything" | "We have the original" |
| **Negotiation dynamics** | Favors party with more resources | Levels the playing field |

### The Core Maxim

> **Origin is the precondition for accountability.**

Data systems can process, transform, and derive without origin.  
But they cannot prove what they started with.  
And without proof, responsibility is impossible.

---

## 3. What Umarise is NOT

Umarise is explicitly **not**:

| Not This | Why |
|----------|-----|
| Governance engine | Does not enforce rules |
| Identity provider | Does not authenticate users |
| Compliance system | Does not audit behavior |
| Policy enforcer | Does not block actions |
| Truth authority | Does not determine correctness |
| Workflow controller | Does not orchestrate processes |

### Critical distinction

> **Umarise does not determine what is "true", "correct", or "permitted".**

---

## 4. Where Governance Begins

Governance emerges **above** Umarise when other systems:

- Make origin **mandatory**
- Enforce **provenance**
- Sanction **absence**
- Attribute **responsibility**

### Governance layers (not implemented by Umarise)

| Layer | Umarise Status |
|-------|----------------|
| Identity & signing | ❌ Not implemented |
| Policy enforcement | ❌ Not implemented |
| Audit & compliance | ❌ Not implemented |
| Dispute resolution | ❌ Not implemented |
| Legal attestation | ❌ Not implemented |

> **Umarise is the precondition for governance, not its executor.**

---

## 5. What Umarise Enables (Without Enforcing)

With Umarise in place, governance systems can:

| Capability | How |
|------------|-----|
| Show explicit origin for every transformation | Origin links are available |
| Detect any modification | Hash comparison reveals changes |
| Verify any claim | Bit-identity proof is cryptographic |
| Hold any system accountable | Evidence exists independently |

### The trade-off

> **Without Umarise, governance is symbolic.**  
> **With Umarise, governance becomes enforceable by others.**

---

## 6. Essential Design Choice

> **Umarise exists within the system, but does not control the system.**

This is not a paradox — this is correct infrastructure.

### Architectural metaphor

Umarise is like a **notary stamp**:
- It records that something existed at a point in time
- It does not decide whether that thing is valid, legal, or good
- It enables others to make those decisions with evidence

---

## 7. Positioning Statements

### For partners

> "Umarise doesn't govern.  
> It makes governance unavoidable."

### For technical audiences

> "The demo implements the origin record layer.  
> Governance emerges when identity, policy, and enforcement are layered on top."

### For integration discussions

> "We provide the evidence layer.  
> You provide the rules."

---

## 8. Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   GOVERNANCE LAYER                       │
│  (Identity, Policy, Compliance, Enforcement, Dispute)   │
│                    ❌ NOT UMARISE                        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ reads from / references
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 ORIGIN RECORD LAYER                      │
│         (Capture, Preserve, Resolve, Verify)            │
│                    ✅ UMARISE                            │
└─────────────────────────────────────────────────────────┘
                            │
                            │ stores in
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                          │
│              (IPFS, Hetzner, SQLite)                    │
│                    ✅ UMARISE                            │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Summary

| Aspect | Origin Layer (Umarise) | Governance Layer (Others) |
|--------|------------------------|---------------------------|
| Creates records | ✅ | ❌ |
| Preserves state | ✅ | ❌ |
| Proves integrity | ✅ | ❌ |
| Enforces policy | ❌ | ✅ |
| Authenticates users | ❌ | ✅ |
| Resolves disputes | ❌ | ✅ |
| Determines truth | ❌ | ✅ |

---

## 10. Architectural Decisions

### 9.1 Technical Proof vs. Legal Claim

Umarise provides **technical bit-identity proof**, not legal proof.

| Aspect | Technical Proof (Umarise) | Legal Proof (Governance Layer) |
|--------|---------------------------|-------------------------------|
| What it proves | Bytes are identical to origin | Intent, ownership, liability |
| Burden of proof | Claimant must explain mismatch | Depends on jurisdiction |
| Dispute prevention | High — trivial to verify | Requires legal process |

**Value proposition:** Technical proof prevents disputes *before* they escalate to legal matters. When parties see the hash matches, there's no argument. Legal standing emerges when courts/arbiters accept technical verification — that's governance layer, not Umarise.

**Practical strength:** An individual, employee, or company with cryptographic verification fundamentally changes negotiation dynamics. The other party cannot claim "that's not what was sent" when bit-identity is provable.

---

### 9.2 Hash Sequence: E2E Does Not Overwrite

End-to-End encryption (Phase 2B) encrypts *after* hashing:

```
Original bytes → SHA-256 hash → Record hash → Encrypt bytes → Store encrypted
```

| Component | Layer | Mutable |
|-----------|-------|---------|
| SHA-256 hash | Origin Layer | No (immutable) |
| Encrypted artifact | Storage Layer | No (content-addressed) |
| Decryption key | User-controlled | Yes (rotatable) |

**Key insight:** The hash represents the *unencrypted* origin. Verification can occur without decryption — compare hash only. Encryption and hashing coexist independently.

---

### 9.3 Dispute Prevention vs. Big Tech Litigation Budgets

Big tech companies budget for litigation as cost of doing business. Umarise changes the calculus:

| Without Origin Proof | With Origin Proof |
|---------------------|-------------------|
| "He said, she said" | Cryptographic evidence |
| Discovery process required | Instant verification |
| Expensive, time-consuming | Trivial to prove |
| Favors party with more resources | Levels the playing field |

**The shift:** When verification is trivial, disputes become irrational. Why argue about what was sent when anyone can check in seconds? This changes negotiation dynamics fundamentally — even against well-funded opponents.

---

### 9.4 Notary ≠ Vault: Compromise Detection

The notary analogy is the most powerful metaphor for explaining Umarise:

| Notary (Umarise) | Vault (Proton/Nextcloud/etc.) |
|------------------|-------------------------------|
| Records that something existed | Stores the thing itself |
| Cannot be "un-recorded" | Can be modified, deleted |
| Detects if vault is compromised | Has no external verification |

**Vault-Independent Verification Flow:**

```
1. Proton gets hacked
2. Attacker modifies file in Proton
3. User downloads file from Proton
4. User verifies against Umarise origin hash
5. Result: MISMATCH → "This is not the original"
```

The hash is not stored in Proton. It's stored in Umarise/Hetzner. An attacker can compromise the vault but cannot alter the origin hash.

#### Can Umarise/Hetzner Be Hacked?

Yes — no system is absolutely unhackable. But the architecture provides defense-in-depth:

| Attack Vector | Protection |
|---------------|------------|
| Hetzner storage compromised | Hash lives in Supabase → mismatch detected |
| Supabase hash-database compromised | Artifact on Hetzner remains original → mismatch detected |
| Both compromised simultaneously | Audit logs + database triggers (write-once) → changes blocked/logged |

**The core defense:**
- Attacker must compromise TWO independent systems simultaneously
- AND bypass write-once database triggers
- AND remove audit trail
- → Practically infeasible without insider access

**Honest nuance:** Umarise provides *technical* guarantees, not *absolute* guarantees. Defense-in-depth makes manipulation detectable, not impossible. For legal-grade certainty, governance layer additions (TSA, PKI) can be implemented later.

---

### 9.5 API Independence: Before, Not Inside

Umarise sits *before* every data processing system, not inside:

```
┌─────────────────────────────────────────────────────┐
│              DATA PROCESSING SYSTEMS                 │
│  (Notion, Nextcloud, CRM, AI Agents, Workflows)     │
└─────────────────────────────────────────────────────┘
                         │
                         │ reads from
                         ▼
┌─────────────────────────────────────────────────────┐
│               UMARISE ORIGIN LAYER                   │
│           (API: /origins, /resolve, /verify)        │
└─────────────────────────────────────────────────────┘
```

**MCP Positioning:** Umarise is not a protocol — it's infrastructure that can be *exposed via* an MCP (Model Context Protocol) server. AI agents can call the Umarise API to verify origins before processing data. This makes Umarise compatible with the emerging agent ecosystem.

---

### 9.6 Storage Nuance: Recording vs. Storing

**Valid question:** "You say you don't store, but origins are on Hetzner?"

**Nuance:** Umarise stores origin *artifacts* (the bytes), but the core value is *recording* (the hash).

| Function | Location | Purpose |
|----------|----------|---------|
| Hash (origin record) | Supabase | Verification |
| Artifact (bytes) | Hetzner | Optional retrieval |

**Partner Vault Mode:**
Partners can use their own vault (Proton, Nextcloud, S3). Umarise only needs to record the hash. If their vault is later compromised, Umarise verification will detect the mismatch.

```
Partner Flow:
1. Partner captures origin
2. Umarise records hash (via API)
3. Partner stores artifact in their own vault
4. Later: Partner verifies against Umarise hash
```

---

### 9.7 Proton vs. Umarise: Complementary, Not Competing

| Proton | Umarise |
|--------|---------|
| Vault (storage) | Notary (recording) |
| Preserves bytes | Proves bytes existed |
| Security = access control | Security = immutable verification |
| Exists independently | Adds verification layer |

**Key differentiator:** Proton is a vault. Umarise is a notary with an API. They are complementary — Umarise can verify origins stored in Proton, Nextcloud, or any other vault.

---

### 9.8 Infrastructure, Not Platform

Umarise is explicitly **not** a social platform, not a Mastodon alternative, not decentralized-by-ideology.

| Platform (Mastodon, Bluesky) | Infrastructure (Umarise) |
|------------------------------|--------------------------|
| Users interact on the platform | Systems call the API |
| Network effects matter | Integration depth matters |
| Decentralization is the product | Agnosticism is the product |

**Positioning:** Umarise works with centralized systems (Notion, Salesforce) and decentralized systems (Solid, IPFS) equally. The origin layer is agnostic about what runs above it.

**Design principle:** Enable both centralization and decentralization. Exclude nothing. Let users and organizations choose their tools — Umarise provides the verification layer beneath.

---

*Document version: 1.1*  
*Last updated: January 2026*
