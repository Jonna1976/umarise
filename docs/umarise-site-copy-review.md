# Umarise — Complete Site Copy Review

All user-facing text from umarise.com and subpages.
Generated: 2026-02-13

---

## / (Homepage)

# Umarise. Anchors.

When digital information matters,
anchor it outside your system.

Verification is public. Attestation is permissioned.
Anchored in Bitcoin. Independently verifiable.

ANCHORING INFRASTRUCTURE

Navigation: Anchor · Why · Core · Verify · Legal · Privacy · Terms

© 2026 Umarise
partners@umarise.com

---

## /anchor — Anchor One-Pager

### Anchor One-Pager
*Normative Overview*

#### Scope

This document describes anchor attestation: the immutable recording that specific digital bytes existed at a specific moment in time, without storing, interpreting, or governing those bytes.

Anchor attestation applies where internal records, timestamps, or signatures are insufficient as proof, and where a write-once, independently verifiable and externally anchored record is required.

Anchor Records are enforced as immutable at the database level. Content is never stored. Only cryptographic hashes.

#### Definition

An Anchor is an independently verifiable external reference that specific digital bytes existed at a specific moment in time.

#### Problem Statement

Digital systems routinely compute cryptographic hashes to ensure internal integrity, consistency, and traceability.

However:
- Internal records are inherently self-attested because they depend on the system that produces them
- Self-attestation is insufficient under external scrutiny
- In audits, disputes, or provenance challenges, the question is not whether a system recorded something, but whether that record can be independently verified without relying on the system that produced it

This creates a structural gap between operational correctness and verifiable validity.

#### Existing Practice

Modern systems already compute cryptographic hashes (e.g. SHA-256) for purposes including:
- Integrity verification
- Deduplication
- Content addressing
- Authentication
- Version control
- Internal auditability

These practices are correct and sufficient within the originating system.

They do not, by themselves, establish independently verifiable existence at a point in time.

#### Anchor Record

An Anchor Record is a minimal, independently verifiable and externally anchored attestation that:

Specific bytes existed at a specific moment.

The Anchor Record is derived from a cryptographic hash computed at the moment the anchor attestation is established and recorded immutably so that the record cannot be altered after creation.

Anchor attestation asserts existence of specific bytes at a specific moment, not correctness.

No assumptions are made about:
- the nature of the bytes
- their meaning
- their lifecycle
- their use

#### Record Structure (Normative)

An Anchor Record consists of:
- **hash**: identifying what existed
- **timestamp**: identifying when it existed
- **anchor_id**: a stable external reference

In the Core API, the anchor_id is referenced as origin_id. This is a technical identifier that remains unchanged for backward compatibility with existing integrations and proof artifacts.

No additional fields are defined.

#### Invariants

The following properties MUST hold:
- Anchor Records are write-once
- Anchor Records are immutably recorded
- Verification is binary (match / no match)

#### Law of Anchoring

If the bytes change, the Anchor Record no longer matches.

There are no exceptions.

#### Internal vs External Evidence

| Internal Records | Anchor Records |
|---|---|
| Self-attested | Independently verifiable |
| Context-bound | Context-independent |
| Operational | Externally anchored |
| Trust-based | Publicly verifiable |

Anchor attestation does not replace internal mechanisms; it operates orthogonally to them.

#### Non-Responsibilities (Normative)

The anchor mechanism does not:
- store content
- interpret meaning
- apply policy
- enforce governance
- resolve disputes
- determine outcomes

All interpretation, decision-making, and enforcement remain external to the anchor layer.

#### Correct Usage Boundary

Use of anchor attestation is appropriate only where:
- a specific moment must not be renegotiated later
- internal logs, timestamps, or signatures are insufficient as proof
- external, independent verification outweighs flexibility

*Where revision, exception handling, discretionary override, or semantic interpretation is required, this mechanism is not appropriate.*

#### Failure and Persistence Properties

Verification of an Anchor Record depends solely on:
- the hash
- the timestamp
- the externally anchored record

Anchor Records are enforced as immutable by database-level constraints and externally anchored via OpenTimestamps to Bitcoin. The immutable record is independent of application-layer policy.

#### Context

As systems grow, the ability to prove what existed when becomes a constraint:
- Internal timestamps are self-attested
- File metadata can be modified
- Version control requires trust in the repository

Anchor attestation provides a write-once, independently verifiable and externally anchored record.

#### Reference

Umarise Core implements an anchor infrastructure conforming to this specification.

#### Attestation Access

Verification is public. Attestation is permissioned.

partners@umarise.com

---

## /why — Why Anchor Attestation

### Why Anchor Attestation
*Context*

#### The Problem

Systems that process data cannot prove they received it unaltered.

Internal logs, timestamps, and signatures are self-attested. They prove what the system claims, not what actually existed before the system touched it.

This applies to any processing system. It becomes critical when the processing is automated. When an AI model reviews a contract, analyzes an image, or summarizes a document, no human witnesses what went in. The output is visible. The input is not independently verifiable.

When disputes arise, when audits occur, when provenance matters, internal evidence is insufficient.

#### The Shift

Regulatory frameworks increasingly require demonstrable data provenance.

The AI Act requires traceability and transparency for high-risk AI systems, including training data governance. C2PA defines content authenticity standards for media provenance. GDPR Article 5 mandates data accuracy and integrity. eIDAS 2.0 establishes qualified timestamps for legal validity.

These frameworks share a common requirement: proof of what existed, when, from an independent source.

#### The Gap

Content authenticity standards like C2PA address the lifecycle of media.

But what about the moment before? The original input? The first capture?

Anchor attestation fills this gap. It establishes the starting point: verifiable, immutable, independent of downstream processing.

#### The Provenance Gap in Automated Workflows

Automated systems transform data at scale. AI models, document processors, data pipelines. The provenance question they create is specific:

*What was the exact input before the system processed it?*

A contract reviewed by AI. A dataset ingested by a model. An image processed by an automated pipeline. In each case, the system produces output, but the original input has no independent record.

Anchor attestation provides that record. A SHA-256 hash computed at the moment of intake establishes what existed before any processing occurred. The proof is anchored externally and verifiable without trusting the processing system.

This is not a feature of the processing system. It is independent infrastructure, the same way a timestamp from a Time-Stamping Authority is independent of the system that requests it.

#### How It Works

Data enters a system. A SHA-256 hash is computed at the moment of entry. The hash is submitted to Umarise Core. Umarise anchors the hash via OpenTimestamps to Bitcoin. The resulting proof is independently verifiable, forever.

#### Interoperability

Umarise uses SHA-256, the same hash algorithm used by C2PA, Git, Bitcoin, and most content-addressable systems.

This means an anchor attestation can serve as the root of a C2PA provenance chain, or as an independent anchor for any system that computes SHA-256 hashes.

#### What Umarise Is Not

Umarise does not manage content, authenticate media, enforce governance, or replace internal logging. It is an anchor layer. It establishes what existed when, and nothing more.

#### Learn More
- Anchor One-Pager: the normative mechanism
- Technical Specification: technical details
- Core API: integration reference

#### Contact
partners@umarise.com

---

## /core — Umarise Core

### Umarise Core
*v1. Stable Interface*

#### Purpose

Umarise Core provides immutable attestation that a cryptographic hash existed at a specific moment in time.

Core accepts hashes only.
No bytes. No labels. No metadata. No artifacts.

#### Normative Documents
- Anchor One-Pager: when and why anchor attestation is correct
- Technical Specification: the normative definition of an Anchor Record

These documents define correct use and constraints.

#### API Contract (Non-Normative Summary)

**POST /v1-core-origins**
- Input: { hash }
- Output: { origin_id, hash, hash_algo, captured_at, proof_status, proof_url }
- Access: Permissioned (X-API-Key header)

**GET /v1-core-resolve**
- Input: origin_id or hash
- Output: { origin_id, hash, hash_algo, captured_at } or 404
- Access: Public

**POST /v1-core-verify**
- Input: { hash }
- Output: { origin_id, hash, hash_algo, captured_at, proof_status, proof_url } or 404
- Access: Public

**GET /v1-core-proof?origin_id={uuid}**
- Input: origin_id (query parameter)
- Output: Binary .ots file (200), pending status (202), or 404
- Access: Public
- Note: Returns the OpenTimestamps proof file for trustless, independent verification against the Bitcoin blockchain.

**GET /v1-core-health**
- Output: { status, version, timestamp }
- Access: Public

#### Access Model

Verification is public. Attestation is permissioned.

- GET /v1-core-resolve: public
- POST /v1-core-verify: public
- GET /v1-core-proof: public
- GET /v1-core-health: public
- POST /v1-core-origins: requires API key

API key issuance is an infrastructural action, not a product flow.

Write access is permissioned. Read access is public.

#### Invariants

- Anchor Records are write-once
- Anchor Records are immutably recorded
- Verification is binary (match / no-match)

Anchor Records are externally anchored via OpenTimestamps, an open-source protocol that creates verifiable proofs anchored in the Bitcoin blockchain.

The .ots proof file is independently verifiable against the Bitcoin blockchain without Umarise infrastructure. Verification depends on mathematics and a public ledger, not on this service.

**Law of Anchoring:**
If the bytes change, the anchor no longer matches.
There are no exceptions.

#### Resolution Semantics

- Multiple attestations of the same hash are permitted
- Resolution returns the earliest attestation by captured_at

This behavior is canonical.

#### Stability

Core v1 is STABLE. IMMUTABLE INTERFACE.
- No new fields
- No semantic drift
- No convenience additions
- No breaking changes

Additions require a new version (/core/v2/*).

#### Non-Responsibilities

Umarise Core does not:
- store content
- interpret meaning
- apply policy
- enforce governance
- resolve disputes
- determine outcomes

All interpretation and decision-making remain external.

#### Data Boundary

An Anchor Record contains:
- **hash**: what existed
- **hash_algo**: how it was computed
- **timestamp**: when it existed
- **origin_id**: a stable external reference

Artifacts, bytes, files, and content remain entirely with the originating party.

#### Note

Umarise Core may be used independently of any Umarise application. The proof primitive stands on its own.

Contact: partners@umarise.com

---

## /verify — Verify an Anchor

### Verify an Anchor
*Verify the anchor, check when it was recorded, download the Bitcoin proof*

#### USP Strip

**Private** — Your file stays in your browser. Only the hash is checked.

**Independent** — The Bitcoin proof is yours. Verifiable without Umarise.

**One action** — Drop the ZIP. The certificate is read and the anchor is verified.

#### How it works

**Drop**: Drop the Anchor ZIP you received. It contains the original file, a certificate with the Anchor ID and hash, and optionally a Bitcoin proof. You can also drop just the file or the certificate.json separately. Everything is read in your browser. Nothing is uploaded.

**Verify**: The file is hashed in your browser and compared with the certificate. The hash is checked against the Umarise registry to confirm when the anchor was recorded. If a passkey claim is present, the signature is displayed.

**Keep the proof**: After verification, if the anchor is confirmed in Bitcoin, a button appears in the result to download the OpenTimestamps proof file. This .ots file is yours to keep forever. You can verify it independently against the Bitcoin blockchain with any OTS verifier or full node. No Umarise needed.

#### What an Anchor proves

This file existed at the registered time. That fact is anchored in the Bitcoin blockchain and independently verifiable.

If a passkey was used, it also proves someone claimed this Anchor with their device's secure enclave. A cryptographic signature, not a name or identity.

An Anchor does not prove first creation or exclusivity. The same file could be registered elsewhere. The .ots proof survives without Umarise. The Anchor metadata does not.

---

## /legal — Technical Description

### Technical Description
*What an Anchor Record is, what it contains, and what it does not establish*

#### What an Anchor Record Is

An Anchor Record is a database entry that links a SHA-256 hash to a point in time. The hash is anchored in the Bitcoin blockchain via the OpenTimestamps protocol. The result is a cryptographic proof that specific bytes existed at a specific moment.

An Anchor Record does not contain the original file. It contains only the hash.

#### Data Model

Each Anchor Record consists of the following fields. No other data is stored.

| Field | Type | Description |
|---|---|---|
| hash | text | SHA-256 hash of the submitted bytes |
| hash_algorithm | text | Always "sha256" |
| anchor_id | text | 8-character hexadecimal identifier |
| created_at | timestamp | Server time when the hash was received |
| ots_proof | text | Base64-encoded .ots file (after Bitcoin confirmation) |
| ots_status | text | "pending" or "anchored" |
| bitcoin_block | integer | Block height (after confirmation) |
| user_id | uuid | Nullable. Present only if a passkey was used. |

There is no column for the file itself, filename, file type, file size, or any metadata about the content. This is architectural: the system cannot store what it does not receive.

#### Cryptographic Chain

The path from bytes to Bitcoin follows these steps.

1. **Client**: The submitting party computes the SHA-256 hash of the file locally. Only the hash is transmitted.
2. **Server**: The hash is recorded with a timestamp and assigned an anchor_id. Status: "pending".
3. **Batch aggregation**: A background worker collects pending hashes and aggregates them into a Merkle tree.
4. **OpenTimestamps**: The Merkle root of the batch is submitted to OTS calendar servers.
5. **Bitcoin**: The Merkle root is embedded in a Bitcoin transaction. Confirmation takes 1 to 2 blocks (10 to 20 minutes).
6. **Proof file**: An .ots file is generated containing the complete cryptographic path from the submitted hash to the Bitcoin block. Status changes to "anchored".

The .ots file is a standard OpenTimestamps format. It can be verified using opentimestamps.org, the ots verify command-line tool, or any Bitcoin full node.

#### Scope

**Established by the record:**
- These specific bytes existed at this specific time
- The hash is anchored in a Bitcoin block via OpenTimestamps
- The .ots proof file is independently verifiable
- The proof remains valid even if Umarise ceases to exist

**Not established by the record:**
- Who created the file
- Whether this is the first or only attestation of these bytes
- Whether the content is unique or novel
- Authorship, ownership, or legal status of the content

An Anchor Record provides building blocks. A court, arbitrator, or evaluating party draws conclusions from those building blocks in the context of a specific dispute.

#### Device Binding (Optional)

A passkey can optionally be associated with an Anchor Record. The passkey uses the WebAuthn standard and is bound to the device's secure enclave (TPM, Secure Enclave, or equivalent). A biometric gate (fingerprint, face recognition) is required for signing.

When present, a passkey establishes that someone with biometric access to a specific device claimed the record at the time of creation. It does not establish identity, name, or that a specific individual created the content. No username, email address, or sign-up is involved.

The passkey is optional. Anchor Records can be created without any device binding.

#### Trust Model

**Verifiable without trusting Umarise:**
The timestamp. The .ots proof file contains the complete cryptographic path from the submitted hash to a Bitcoin transaction. This can be verified independently using open-source tools. Umarise is not required for verification.

**Requires trusting Umarise:**
Data intake: that the correct hash was recorded at the correct time. This trust requirement is reduced when the submitting party computes the SHA-256 hash on their own device before transmission, because in that configuration the submitting party controls the entire chain from bytes to Bitcoin.

#### Access Model

**Verification (public):**
Any party can look up, verify, and retrieve proof files for any Anchor Record. No credentials, no registration, no relationship with Umarise required.

**Attestation (permissioned):**
Creating an Anchor Record requires authorized access. Only identified registrants can submit hashes for attestation.

This asymmetry is an integrity constraint, not a commercial restriction. An Anchor Record is irreversible. Once created, it becomes a permanent entry in the registry. Unrestricted write access would compromise the reliability of the registry itself.

The same principle applies to comparable registries. DNS allows anyone to resolve a domain, but not anyone to register one. Certificate Authorities allow anyone to verify a certificate, but not anyone to issue one. The constraint protects the record.

#### Independent Verification

A third party who receives a file and its certificate can verify the anchor independently. Two scenarios apply, depending on the anchoring status at the time the file was shared.

**Anchor confirmed at time of sharing:**
The .ots proof file is included in the ZIP. The third party has everything needed for independent verification: the file, certificate, and cryptographic proof.

**Anchor pending at time of sharing:**
The .ots proof file is not yet available. The third party has the file and certificate containing the anchor_id. Once Bitcoin anchoring is complete, the third party retrieves the .ots file via umarise.com/verify using the anchor_id from the certificate, or directly via the /v1-core-proof endpoint.

In both cases, final verification requires only the file, the .ots proof, and a Bitcoin node or standard OTS tooling. No contact with Umarise is required.

#### Verification Endpoints

Any Anchor Record can be verified through the public API without authentication.

| Endpoint | Purpose |
|---|---|
| /v1-core-resolve | Look up an attestation by anchor_id |
| /v1-core-verify | Check whether a hash exists in the registry |
| /v1-core-proof | Retrieve the .ots proof file for a hash |

These endpoints are public. No authentication, no sign-up, and no personally identifiable information is required to verify a record.

#### Disclaimer

This document describes a technical mechanism, not a legal instrument. An Anchor Record does not by itself constitute legal evidence. Whether an Anchor Record is relevant in a given context is determined by the evaluating party (court, arbitrator, auditor), not by Umarise.

---

## /privacy — Privacy Policy

### Privacy Policy
*Last updated: January 2026*

*This Privacy Policy covers all Umarise services, including the Core API and the Umarise companion application.*

#### Scope

This Privacy Policy describes:
- what data is processed by Umarise
- where that data is processed
- what is explicitly not processed

Umarise is designed to function without collecting or relying on personal data.

#### Data Processed by Umarise

Umarise processes only the minimum data required to establish and verify anchor records.

**Anchor Record Data:**

| Data element | Purpose | Storage location |
|---|---|---|
| Cryptographic hash (SHA-256) | Bit-identity verification | Germany (Hetzner) |
| Timestamp | Temporal proof | Germany (Hetzner) |
| Anchor ID | Stable external reference | Germany (Hetzner) |

Anchor records are write-once and immutable.

#### Local Device Data

Umarise does not use user accounts.

A locally stored, random identifier may be used within the browser solely to isolate data on that device.

This identifier:
- is not a personal identifier
- is not linked to an individual
- is not used for tracking
- is not recoverable by Umarise

If local browser data is cleared, this association is permanently lost.

#### Data Not Processed

Umarise does not process or store:
- personal names or individual identifiers
- email addresses
- user accounts or passwords
- tracking cookies or analytics
- behavioral or profiling data

Umarise cannot identify end users and does not attempt to do so. Partner organizations are identified solely by API key prefix for operational purposes.

#### Operational Data

Umarise processes operational data to maintain service integrity and prevent abuse.

| Data element | Purpose | Storage |
|---|---|---|
| IP address (hashed) | Rate limiting, abuse prevention | Hashed with SHA-256. Original IP is not retained. |
| API key prefix | Request attribution | First 11 characters only. Full key is hashed. |
| Request metadata | Operational monitoring | Endpoint, method, status code, response time. |
| Partner name | Partner identification | Organization name (not personal names). |

#### Data Processing Structure

Umarise processes data using a segmented infrastructure to minimize exposure.

Anchor records are stored separately from any interaction layer and are never processed together with personal data.

#### Jurisdiction

Anchor records are stored in the European Union and processed by infrastructure located in Germany (Hetzner).

Cryptographic hashes (non-personal data, 64-character strings) are submitted to independent OpenTimestamps calendar servers for Bitcoin anchoring. These servers are globally distributed and not operated by Umarise.

EU data processing is subject to GDPR and applicable data protection law.

#### Data Subject Rights

Because Umarise does not collect personal data, certain GDPR rights apply differently.

**Access**: Where applicable, anchor records can be accessed or exported from the local device context.

**Erasure**: Associations between a local device and anchor records can be removed by clearing local browser data. The cryptographic anchor record itself remains immutable by design.

**Portability**: Where applicable, anchor records can be exported in machine-readable formats.

#### Contact

For privacy-related inquiries:
partners@umarise.com

#### Final Note

Umarise does not optimize systems, interpret meaning, or govern outcomes.

It establishes origin and constrains history.

*Privacy follows from this constraint.*

---

## /terms — Terms of Service

### Terms of Service
*Last updated: January 2026*

#### Scope

These Terms of Service govern access to and use of the Umarise anchor record service.

Umarise provides an external, write-once origin reference for digital artifacts. It does not provide interpretation, governance, or outcome enforcement.

By using Umarise, you accept these terms.

#### Service Description

Umarise establishes and maintains Anchor Records.

An Anchor Record is a write-once, immutable reference to:
- the cryptographic hash of digital data
- a timestamp
- a stable anchor identifier

Verification is binary: match or no match.

Umarise does not store artifact content.

#### Invariants

The following properties are fixed and non-configurable:
- Anchor Records are immutable
- Anchor Records cannot be altered, revoked, or overridden
- Verification has no degrees or exceptions

If the bytes change, the anchor no longer matches.

#### User Responsibilities

You are responsible for:
- determining whether Umarise is appropriate for your system
- ensuring that the data underlying any submitted hash is lawful and that you have the right to register its origin
- maintaining custody of all original content

Umarise does not validate legality, ownership, or authorization of submitted data.

#### Non-Responsibilities

Umarise does not:
- interpret meaning or intent
- resolve disputes
- enforce policy or compliance
- arbitrate outcomes
- provide governance or exceptions

All consequences of anchor verification remain external to Umarise.

#### Correct Usage Boundary

Umarise is appropriate only where:
- a moment must not be renegotiated later
- external verification outweighs flexibility
- immutable evidence is acceptable even when inconvenient

*If revision, erasure, exception handling, or discretionary override is required, Umarise is not appropriate.*

#### Availability and Changes

Umarise is provided on an as-is and as-available basis.

The core behavior of the anchor record service is invariant. Operational aspects may change without notice, provided invariants are preserved.

#### Limitation of Liability

To the maximum extent permitted by law:
- Umarise is not liable for decisions, actions, or outcomes based on origin records
- Umarise is not liable for loss resulting from reliance on immutable records
- Umarise does not guarantee fitness for a particular purpose

#### Termination

Umarise may restrict or terminate access to the service if these terms are violated or if use would expose Umarise to legal or operational risk.

Termination does not alter existing Anchor Records.

#### Governing Law

These terms are governed by the laws of Germany, without regard to conflict-of-law principles.

#### Contact

For matters related to these terms:
partners@umarise.com

#### Final Statement

Umarise does not optimize systems.

It constrains history.

*Use of the service implies acceptance of that constraint.*
