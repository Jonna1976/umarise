# UMARISE — The Canon

## Version 5.0 — 4 February 2026

This document defines what Umarise is, what it does, and what it refuses to do.

---

## I. WHAT UMARISE IS

Umarise helps people recognize a beginning before it disappears.

That is the complete functional description.

The world moves fast. Ideas get overwritten. Moments pass unacknowledged. By the time something matters, the beginning is already gone — buried under edits, versions, and transformations.

Umarise exists for the moment before that happens. Not to archive. Not to prove. Not to optimize. Just to recognize: *this is where it started*.

---

## II. TWO LAYERS

| Layer | What it is | What it does |
|-------|------------|--------------|
| **Umarise (App)** | Ritual software | Helps people consciously mark a beginning |
| **Umarise Core** | Backend guarantee | Ensures what is marked cannot be undone |

The App is the human experience.  
Core is the technical foundation.

The App could exist without Core (it would just be a gesture).  
Core could exist without the App (it would just be a database).  
Together, they create something neither can be alone: **a recognized beginning that holds**.

---

## III. THE APP — Ritual Software

### What it is

A privacy-first experience that transforms "saving" into "recognizing."

Most software tries to be fast, efficient, invisible. Umarise does the opposite. It introduces deliberate friction — a 1.5-second press to seal, a pause before marking, a moment of acknowledgment before release.

This is not a bug. This is the product.

### What it does

1. **Capture** — User selects or photographs an artifact
2. **Pause** — A moment of stillness before commitment
3. **Mark** — A deliberate action (press and hold) to seal the beginning
4. **Release** — Certificate of completion, then gone

The user does not "save" the beginning. They *witness* it, *seal* it, and *let it go*.

### What it refuses to do

| The App does not… | Because… |
|-------------------|----------|
| Create an archive | Archives invite revisiting. Beginnings should be released, not curated. |
| Encourage retention | The value is in the marking, not in coming back. |
| Explain why a beginning matters | Meaning is the user's domain, not ours. |
| Rank or judge beginnings | All beginnings are equal. A sketch and a contract carry the same weight. |
| Optimize the experience | Speed destroys the ritual. Friction is the feature. |

### Design principles

- **Privacy-first**: Artifacts are hashed locally. The file never leaves the device.
- **Friction-by-design**: Deliberate delay creates psychological weight.
- **Closure over retention**: Success is when the user lets go.

---

## IV. CORE — The Technical Foundation

### What it is

A write-once, append-only record that ensures what is marked cannot be undone.

### What it stores

| Field | Description |
|-------|-------------|
| `origin_id` | Unique identifier for this attestation |
| `hash` | SHA-256 fingerprint of the artifact (computed locally, artifact never transmitted) |
| `hash_algo` | Algorithm used (sha256) |
| `captured_at` | Timestamp of attestation |

Four fields. No content. No metadata beyond what is listed.

### What it guarantees

1. **Immutability**: Database triggers prevent updates and deletes. Once written, a record cannot be modified.
2. **Privacy**: Only the hash is stored. The artifact never touches Umarise infrastructure.
3. **Verification**: Anyone can check if a hash was attested at a given time.

### What it does NOT guarantee (today)

1. **External independence**: Core runs on our infrastructure (Hetzner). A superuser could theoretically disable triggers. This is better than most systems, but it is not trustless.
2. **Legal standing**: Attestations have not been tested in court. They are technical records, not legal certificates.
3. **Survival without us**: If Umarise disappears, verification depends on our database surviving.

These limitations are honest. They are also on the roadmap.

### API structure

| Endpoint | Access | Function |
|----------|--------|----------|
| `POST /core-origins` | Partner API key required | Create attestation |
| `GET /core-resolve` | Public | Retrieve first attestation for a hash |
| `POST /core-verify` | Public | Verify bit-identity |

**Verification is public** — anyone can check.  
**Attestation is permissioned** — only authorized parties can create.

---

## V. THE CATEGORY WE OCCUPY

Umarise is not provenance. It is not proof-of-existence. It is recognition of beginning.

| System | What it records | Category |
|--------|-----------------|----------|
| **C2PA** | Who created this, with what tools, through what edits | Provenance chain |
| **OpenTimestamps** | This hash existed before this moment | Proof-of-existence |
| **Umarise** | Someone consciously decided this is a beginning | Recognition of origin |

C2PA tracks transformations. OTS proves existence. Umarise marks intention.

The difference matters:
- OTS has no intentionality. A hash is anchored, but no one decided it mattered.
- C2PA has no minimalism. It records everything — tools, edits, signatures.
- Umarise has both: the minimal fact (hash + time) combined with the human act (someone chose to mark this).

This category is unoccupied.

---

## VI. THE DISCIPLINE OF REFUSAL

Umarise's value is defined by what it refuses to do.

| Umarise does not… | Because… |
|-------------------|----------|
| Store content | A witness that holds your data is a liability. |
| Interpret meaning | A neutral witness cannot have opinions. |
| Classify artifact type | Classification implies judgment. |
| Assign ownership | Ownership is a legal conclusion. We record existence, not rights. |
| Allow mutation | Write-once is the architecture, not the policy. |
| Provide governance | Governance is the user's domain. We are the foundation, not the judge. |

The discipline of self-restraint is not a limitation. It is the design.

---

## VII. PRIVACY ARCHITECTURE

| Principle | Implementation |
|-----------|----------------|
| **Data minimization** | Only hash + timestamp + origin_id. No content, no metadata. |
| **Client-side hashing** | SHA-256 computed in browser. Artifact never transmitted. |
| **Provider separation** | Hetzner (data) ≠ Supabase (control) ≠ Lovable (frontend) |
| **No user accounts** | 128-bit UUID in localStorage. Zero-auth privacy. |
| **EU-only storage** | Hetzner Frankfurt. No US data transfer. |
| **Immutability by code** | Database triggers, not policy documents. |

This is privacy-by-design, not privacy-by-promise.

---

## VIII. WHAT WE HAVE BUILT

### Delivered (Phase 1)

| Component | Status |
|-----------|--------|
| Ritual App (prototype) | Working — capture, pause, mark, release flow |
| Wall of Existence | Working — horizontal gallery with frame resonance |
| Database-level immutability | Working — triggers prevent update/delete |
| Client-side hashing | Working — SHA-256 before transmission |
| Privacy architecture | Working — provider separation, EU-only |
| Core API structure | Working — origins, resolve, verify endpoints |
| Partner API key system | Working — permissioned attestation |

### Roadmap (Phase 2)

| Component | Purpose |
|-----------|---------|
| External anchoring (TSA/OTS) | Independence from our infrastructure |
| eIDAS qualification | Legal standing in EU |
| Native iOS Share Extension | "Mark as Beginning" from any app |

Phase 2 is direction, not promise. We will pursue it when Phase 1 is validated.

---

## IX. WHO THIS IS FOR

### The App is for

People who want to consciously acknowledge a beginning before it disappears.

Not archivists. Not lawyers. Not compliance officers.  
Just people who recognize that some moments deserve to be marked — and then released.

### Core is for

Today: the App.  
Tomorrow: partners who want to build on the same foundation.

We are not pursuing enterprise sales. We are not competing with OTS or C2PA. If partners emerge who want what we offer — recognition of beginning, not provenance or proof-of-existence — we will serve them.

But the first customer is ourselves. The App uses Core. That is enough for now.

---

## X. WHAT REMAINS

The conceptual work is done. What remains is validation:

1. **Does the ritual resonate?** — Do users feel something when they mark a beginning?
2. **Is deliberate friction valuable?** — Does the 1.5-second seal create meaning, or frustration?
3. **Is "recognition of origin" a category?** — Does anyone else want what we offer?

These questions are answered by building and testing, not by writing more documents.

---

## XI. WHAT IS LOCKED

1. The App is ritual software. Friction is the feature.
2. Core is the foundation. Immutability is the architecture.
3. Privacy-by-design. Artifacts never leave the device.
4. The discipline of refusal. Less is more.
5. Recognition, not proof. Intention, not just existence.
6. Phase 1 is honest about what it is. Phase 2 is direction, not promise.

---

## XII. CREATION INTEGRITY

### 1. Definition

**Creation Integrity** is the verifiable property that a specific digital artifact existed in its exact byte-form at or before a specific moment in time.

Creation Integrity is a protocol-level property.

It is not a product.
It is not a feature.
It is not an implementation.

Creation Integrity is established if and only if the following conditions are simultaneously satisfied:

1. **Byte-Identity** - A cryptographic hash uniquely represents the exact byte sequence of the artifact.
2. **Temporal Anchoring** - The hash is committed to an immutable, external ledger with a determinable timestamp.
3. **Independent Verifiability** - The proof of commitment can be validated without reliance on the issuing party.

If any condition is absent, Creation Integrity is not established.

### 2. Ontological Status

Creation Integrity is a property of an artifact.

It is not a property of:

- a system
- an organization
- a ledger
- an identity

A system may produce Creation Integrity.
It cannot constitute Creation Integrity.

The property is defined by the Anchoring Specification (IEC), not by any specific implementation.

### 3. What Creation Integrity Is Not

Creation Integrity does not assert:

- Authorship
- Ownership
- Intent
- Meaning
- Truthfulness
- Legal entitlement

It establishes only byte-level existence at or before a specific time.

The distinction between existence and attribution is permanent.

### 4. Invariants

The following invariants apply without exception:

1. **Binary** - Creation Integrity either exists or does not exist for a given artifact.
2. **Immutable** - Once established, Creation Integrity cannot be altered or revoked.
3. **Non-Expiring** - Creation Integrity does not decay or expire as long as the underlying ledger remains verifiable.
4. **Independent** - Verification must not require trust in the issuing party or implementation.
5. **Minimal** - Creation Integrity records only: cryptographic hash, temporal commitment, ledger reference.
6. **Externally Determinative** - Internal audit trails are supplementary. External anchoring is determinative.

### 5. Relation to Anchoring

| Concept | Definition |
|---------|------------|
| **Anchoring** | The act of committing a cryptographic hash to an immutable external ledger |
| **Creation Integrity** | The resulting verifiable property of the artifact |
| **Anchoring Specification (IEC)** | The normative criteria that define valid anchoring |
| **Implementation** | A system that performs anchoring according to the specification |

Anchoring is the mechanism.
Creation Integrity is the property produced.

Valid anchoring produces Creation Integrity.
Invalid anchoring does not.

No implementation has authority over the definition of the property.

### 6. Scope

Creation Integrity applies exclusively to digital artifacts reducible to deterministic byte sequences, including but not limited to:

- Research data
- Manuscripts
- Source code
- Notebooks
- Design files
- Contracts
- Media files
- Model weights
- Generated outputs

It does not apply to:

- Physical objects
- Verbal statements
- Non-deterministic processes
- Artifacts without stable byte representation

### 7. Structural Necessity

In environments where digital artifacts can be retroactively fabricated, modified, or simulated at scale, reconstructive verification becomes probabilistic.

Creation Integrity provides deterministic temporal existence.

Where evidentiary stability is required, deterministic temporal anchoring constitutes a structural requirement.

Creation Integrity is the minimal primitive required to establish temporal existence in digital systems.

---

## XIII. IMPLEMENTATION BOUNDARY

Implementations may vary.

The property does not.

Any system that satisfies the invariants and adheres to the Anchoring Specification may produce Creation Integrity.

No system may redefine it.

---

## XIV. FINAL PRINCIPLE

Creation Integrity establishes only one fact:

> That specific bytes existed at or before a specific moment in time.

Nothing more is implied.

Nothing less is required.

**End of Canon v5.2**
