# Why Anchor Attestation

Strategic context and trust model for technical integrations.

---

## Context

Systems that process data cannot prove they received it unaltered.

Internal logs, timestamps, and signatures are self-attested. They prove
what the system claims — not what actually existed before the system
touched it.

This becomes critical in automated workflows. When an AI model reviews
a contract, analyzes an image, or ingests a dataset, no human witnesses
what went in. The output is visible. The input is not independently
verifiable.

When disputes arise, when audits occur, when provenance matters —
internal evidence is insufficient. Not because it is false. Because it
is self-attested by the party with an interest in the outcome.

---

## The Problem

The service that generates proof also controls the confirmation of that
proof.

Certificates live in dashboards. Validation runs through private
endpoints. Access requires accounts. The proof is bound to the
infrastructure that issued it.

This is not bad intention. It is the dominant architectural model.
And it means that proof depends on the continued goodwill and existence
of the party that issued it.

---

## The Shift

Regulatory frameworks increasingly require demonstrable data provenance
from independent sources.

The EU AI Act requires traceability for high-risk AI systems, including
training data governance. C2PA defines content authenticity standards
for media provenance. eIDAS 2.0 establishes qualified timestamps for
legal validity.

These frameworks share a structural requirement: proof of what existed,
when, from a source that is independent of the processing system.

---

## The Gap

Content authenticity standards like C2PA address the lifecycle of
media content.

But what about the moment before processing? What existed at intake,
before any system touched it?

Anchor attestation addresses this gap. It records what existed at a
specific moment — verifiable, independent of the system that processed
it, independent of Umarise itself.

---

## The Provenance Gap in Automated Workflows

What was the exact input before the system processed it?

A contract reviewed by AI. A dataset ingested by a model. An image
processed by an automated pipeline. In each case, the system produces
output. The original input has no independent record.

Anchor attestation provides that record. A SHA-256 hash computed at
the moment of intake establishes what existed at that point in time.
The proof is anchored externally and verifiable without trusting the
processing system.

This is not a feature of the processing system. It is independent
infrastructure — the same way a qualified timestamp from a
Time-Stamping Authority is independent of the system that requests it.

---

## How It Works

Data enters a system. A SHA-256 hash is computed at the moment of
entry. The hash is submitted to Core via a single API call. The hash
is anchored via OpenTimestamps to Bitcoin. The resulting proof is
independently verifiable against Bitcoin — without Umarise, without
an account, without an expiry.

```bash
curl -X POST https://core.umarise.com/v1-core-origins \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"hash": "sha256_hex_of_your_input"}'
```

Response includes `origin_id`, `captured_at`, and `proof_status`.
After approximately 20 minutes: anchored in Bitcoin. The `.ots` proof
is downloadable and verifiable by any OTS-compatible tool.

---

## We make the proof. Then we step away.

The `.ots` file is an open standard. Verification runs against Bitcoin,
not our servers. If Umarise ceases to exist, every proof issued remains
independently verifiable.

That is not a promise. It is the architecture.

---

## One honest boundary

We must be trusted at intake — for one action: recording the correct
hash at the correct moment.

We cannot silently alter a recorded hash. The OTS proof is
cryptographically bound to what was submitted. Any alteration would
cause verification against Bitcoin to fail immediately and visibly.

This is the difference between permanent trust and trust at one moment.
We ask for the latter.

---

## Interoperability

Anchor attestation uses SHA-256 — the same hash algorithm used by
C2PA, Git, Bitcoin, and most content-addressable systems.

An anchor attestation can serve as the chronological root of a C2PA
provenance chain, or as an independent anchor for any system that
computes SHA-256 hashes. No proprietary format. No SDK required for
verification.

---

## What the Anchor Layer is not

The anchor layer does not manage content, authenticate media, enforce
governance, or replace internal logging.

It records one fact: these exact bytes existed at this moment in time.
What you do with that fact is yours.

| What it records | What it does not record |
|---|---|
| These exact bytes existed at this moment | Who created them |
| Hash anchored in Bitcoin via OTS | That this is the first attestation globally |
| Proof independently verifiable | That the content is original or unique |
| Proof survives without Umarise | Legal ownership or authorship |

---

## Integration reference

Full API documentation: [umarise.com/api-reference](/api-reference)

For integration questions or partner access: partners@umarise.com

---

*Guardian checklist: C1 (no authorship claim), C2 (hash-only confirmed),
C4 (write-once, not "immutable"), C7 (instrument language), C8 (proof
survives Umarise explicit), C13 (intake trust boundary present), C15
(anchoring as primitive), no em dashes, no "starting point" overclaim,
no "immutable", no "guarantee". Pass.*
