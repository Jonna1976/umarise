# UMARISE CORE — The Canon

## Internal Architecture & Strategy Document

**Version:** 4.0 — 4 February 2026  
**Classification:** Internal

This document defines what Umarise Core is, what it does, what it refuses to do, and why that refusal is the product.

---

## I. DEFINITION

Umarise Core levert een externe, onveranderlijke attestatie dat een specifiek artefact op een specifiek moment is vastgelegd — zonder inhoud, betekenis of mutatie.

That is the complete functional description. What Umarise Core records per attestation:

| Field | Description |
|-------|-------------|
| SHA-256 hash | Cryptographic fingerprint of the artifact, computed locally. The artifact never leaves the origin device. |
| Timestamp | Moment of attestation, externally anchored. |
| Origin ID | Unique, immutable identifier for this attestation. |

Three fields. No content. No metadata beyond what is listed. No file names, descriptions, categories, or tags. The data model is complete.

---

## II. THE CORE FORMULA

Without external attestation, every claim about origin is self-attestation. Self-attestation fails the moment an external party says: "I don't accept this."

This is not a philosophical position. It is a known fact in established domains:

1. **Forensics** — evidence requires chain of custody through independent parties
2. **Compliance** — audits require externally verifiable records, not self-reported data
3. **Archiving** — long-term preservation requires attestation independent of the creating system
4. **Supply-chain audits** — provenance claims require external verification at each link
5. **Legal proceedings** — courts distinguish between self-serving records and independent evidence

Every platform that records when something was created is performing self-attestation. Figma says a design was created at 14:32. GitHub says a commit was pushed at 09:17. These are their own records, in their own databases, under their own control. Self-attestation works until it is challenged.

Umarise Core is the external witness. Independent. Neutral. Verifiable.

---

## III. THE AI GOVERNANCE CASE

The self-attestation problem described above applies to all platforms. But in one domain it is not merely a weakness — it is a structural impossibility: autonomous AI systems.

**Autonomous AI systems cannot veridically attest to their own beginnings. This is not a bug. It is a structural limit of agentic design.**

### Why internal AI logs fail

Traditional logging assumed deterministic control, bounded execution, and human-authored logic. Autonomous AI agents break every one of these assumptions:

| Failure mode | Consequence |
|--------------|-------------|
| Hallucination | LLMs generate plausible narratives, not factual histories. When queried about prior actions, they reconstruct what would make sense, not what occurred. |
| Prompt injection | External inputs reprogram agent behavior undetectably. Logs can be rewritten, events suppressed, false execution paths fabricated — without forensic trace. |
| Event ordering breakdown | Parallel subtasks, asynchronous tool calls, heterogeneous clocks, and self-modifying execution paths make causal ordering unrecoverable from internal state. |
| Post-hoc narrative construction | Models retroactively smooth incoherent execution paths for coherence. The system reports a clean story, not the messy truth. |
| Manipulable logging | Logging decisions remain under agent control. Logging itself becomes a manipulable behavior rather than an objective record. |

The result: in autonomous AI systems, internal records are not merely weak evidence of first occurrence. They are structurally inadmissible. The system that generated the record is the same system that can hallucinate, be injected, or reconstruct the record.

### Regulatory convergence

This is not a theoretical concern. Regulatory frameworks across six jurisdictions are converging on the same conclusion:

| Framework | Jurisdiction | Position on internal logs |
|-----------|--------------|---------------------------|
| EU AI Act (2026) | EU | Insufficient for high-risk systems. Third-party audits required. |
| NIST AI RMF (2024) | US | External validation prioritized over self-reports. |
| US VET AI Act (proposed) | US | Self-reports inadmissible. Independent evaluation required. |
| UK AI Safety Regs (2025) | UK | Internal logs require third-party audit for frontier models. |
| China AI Law (2026) | China | State-approved provenance chains. Self-attestation banned for critical AI. |
| GIAS (2026) | Global | Unverifiable self-logs disqualified as audit evidence. |

Six jurisdictions, six frameworks, one conclusion: internal AI narratives lack evidentiary weight for origin, intent, or temporal priority.

### What this means for Umarise Core

The AI governance case transforms Umarise Core from an optional infrastructure improvement to a compliance requirement. External attestation of first occurrence is not a feature that platforms may choose to adopt. It is a capability that regulators are beginning to mandate.

This does not change what Umarise Core is. The data model is identical: hash + timestamp + origin_id. The discipline of refusal is identical: no content, no interpretation, no governance. What changes is the demand structure. The market is no longer driven solely by voluntary adoption. It is driven by regulatory necessity.

---

## IV. WHAT UMARISE CORE IS AND IS NOT

### What Umarise Core is

A minimal, external, immutable attestation layer on top of which others can build meaning, governance, and applications — or not.

### What Umarise Core is not

- **Not a product.** Infrastructure. No end-user interface, no dashboard, no consumer features.
- **Not a SaaS.** No subscription, no tiered plan. Platforms pay for API access to a primitive.
- **Not a meaning layer.** No interpretation, no classification, no semantics. The hash is material-agnostic.
- **Not an ownership register.** Existence is attested, not rights.

---

## V. THE DISCIPLINE OF REFUSAL

Umarise Core's value is defined by what it structurally refuses to do. Every refused capability increases trustworthiness.

| Umarise Core does not… | Because… |
|------------------------|----------|
| Store content | A witness that holds your data is a liability. The artifact never leaves the origin device. |
| Interpret meaning | A neutral witness cannot have an opinion on what it witnesses. |
| Recognize intention | Intention is subjective and unverifiable. The system registers an act, not a mental state. |
| Classify artifact type | Classification implies domain knowledge. Domain knowledge implies opinion. |
| Assign ownership | Ownership is a legal conclusion. Umarise registers existence, not rights. |
| Allow mutation | Write-once, append-only, immutable. Attestations cannot be modified or deleted. |
| Provide governance | Governance is the integrator's responsibility. Umarise is the witness, not the judge. |
| Create vendor lock-in | SHA-256 is locally reproducible. If Umarise disappears, attestations remain verifiable. |

The discipline of self-restraint is not a limitation. It is the design. The less Umarise Core does, the more it can be trusted.

---

## VI. COMPETITIVE LANDSCAPE

Several platforms offer cryptographic timestamping. They occupy the technical layer: hash + blockchain + certificate. The market is proven and commoditizing. None addresses the external attestation primitive.

### Known players

| Platform | What they do | Category |
|----------|--------------|----------|
| ScoreDetect | Blockchain timestamps for IP protection. SaaS, $10+/mo. | Defensive IP |
| Copyright Delta | White-label timestamps for music industry. | Defensive IP |
| TimeBinder | Blockchain proof of file existence. Legal focus. | Defensive IP |
| Digital Timestamps | $2.50/file. OpenTimestamps framework. | Defensive IP |
| Web Commodore | Digital notary. Browser-based fingerprinting. | Defensive IP |
| C2PA | Adobe/Microsoft. Media provenance chain. | Authenticity |
| OpenTimestamps | Open-source Bitcoin timestamping. | Technical primitive |

### Category distinction

| Dimension | Existing players | Umarise Core |
|-----------|------------------|--------------|
| Core question | Who created this first? | Did this exist at this moment? |
| Data model | File + hash + certificate + metadata | Hash + timestamp + origin_id |
| Attestation model | Self-attestation or platform-bound | External, independent witness |
| Content storage | Often yes | Never. Hash only. |
| Interpretation | Often implicit | None. |
| AI governance applicability | Not designed for it | Native fit. Minimal, external, immutable. |
| Mutability | Varies | Write-once, immutable |
| User pays | Yes | Never. Integrator pays. |
| Lock-in | Platform-dependent | SHA-256 locally reproducible |

These players are not competitors. They sell protection products to end users. Umarise Core provides attestation infrastructure to platforms and — increasingly — to AI governance frameworks that require external anchoring of first occurrence.

---

## VII. DEFENSIBILITY

The technology is not the moat. SHA-256 and timestamping are commodity operations.

Speed and price are not the moat. That is a race to the bottom in a commoditized layer.

**Neutrality is the moat.** An external witness is valuable only if trusted to be neutral. Every feature Umarise Core declines increases its credibility. A competitor that adds features leaves the category.

A competitor that does more than Umarise Core is not a better Umarise Core. It is a different thing entirely.

There is a second defensibility layer: **regulatory positioning**. As AI governance frameworks mandate external attestation, the primitive that is already adopted, already minimal, and already neutral has a structural advantage. Regulators prefer existing, proven infrastructure over new entrants. First mover in a compliance-driven primitive is significantly more defensible than first mover in an optional SaaS feature.

There is a third defensibility layer in the consumer app (the reference implementation). The app introduces ritual friction: delay, weight, one artifact at a time. A competitor cannot disrupt this by making it faster — speed destroys the value. But this is a consumer argument, separate from Core.

---

## VIII. PROTOCOL ANALOGIES

| Primitive | What it does | Parallel to Umarise Core |
|-----------|--------------|--------------------------|
| DNS | Maps names to addresses. Interprets nothing. | Maps artifacts to moments. Interprets nothing. |
| Certificate Authorities | Certifies identity without understanding content. | Certifies existence without understanding meaning. |
| TSA (RFC 3161) | Provides trusted time to signing operations. | Provides trusted attestation to creation events. |
| NTP | Distributes authoritative time. No opinion on use. | Distributes authoritative attestation. No opinion on use. |

Where the analogy holds: All derive value from neutrality, minimalism, and refusal to exceed their function. Trusted because constrained.

### Where the analogy broke — past tense

In Canon v3, this section stated: "Umarise Core is not yet technically necessary. Nothing breaks without it." That assessment requires revision.

In the domain of autonomous AI governance, external attestation of first occurrence is becoming technically necessary. Regulatory frameworks are mandating it. AI systems that cannot provide externally anchored provenance will fail compliance requirements. The analogy with CAs is becoming precise: just as HTTPS without a CA certificate is rejected by browsers, AI systems without external attestation may be rejected by regulators.

For AI governance specifically, external attestation is transitioning from optional to mandatory. The analogy with DNS and CAs is no longer aspirational. It is converging.

For other domains (creative tools, life infrastructure, brand attestation), the analogy remains aspirational. Adoption in those markets is voluntary, not compliance-driven.

---

## IX. ARCHITECTURE

### Two layers

| Umarise (Consumer App) | Umarise Core (Protocol) |
|------------------------|-------------------------|
| Reference implementation | Infrastructure primitive |
| Consumer-facing experience | Developer-facing API |
| Free. Always. Non-negotiable. | Revenue via API calls and enterprise licenses |
| Builds cultural awareness | Builds technical and regulatory adoption |
| The soul | The body |

The consumer app is the reference implementation. It demonstrates the primitive and builds cultural awareness. It is free because charging would reduce adoption. It is not the business.

Umarise Core is the business. The API that platforms call, the infrastructure that institutions integrate, the external witness that AI governance frameworks require.

### Data flow

1. The integrating platform (or consumer app) computes the SHA-256 hash locally. The artifact never leaves the device.
2. The hash is transmitted to Umarise Core with the attestation request.
3. Umarise Core records: hash + timestamp + origin_id. Write-once. Immutable.
4. Umarise Core returns the attestation proof.
5. The integrator presents the attestation in whatever form fits their product or compliance requirement.

At no point does Umarise Core see, store, or process the original artifact. It receives only the hash. This is an architectural requirement for neutrality.

### Governance structure

Umarise Core should be governed by a foundation (stichting). The protocol is public infrastructure and must not be acquirable. The commercial entity — Umarise Inc — operates the reference implementation, developer tools, brand, and partnerships. The protocol specification belongs to the foundation.

---

## X. REVENUE MODEL

**The marker never pays. That is doctrine.**

Revenue is generated through Umarise Core across two market types: voluntary adoption and compliance-driven adoption.

### Market type A: Voluntary adoption

Platforms and institutions that choose to integrate external attestation because it strengthens their product, builds trust, or differentiates their offering.

#### Channel 1: Creative Tool Integration

Figma, Procreate, Notion, GitHub, Ableton, Adobe. External attestation of creation origin at moment of creation.

- **Revenue:** $0.10–0.25 per API call, or $5K–50K/month enterprise license.
- **Value:** Independent proof of origin. Not self-attestation. Meaningful in disputes.

#### Channel 2: Life Infrastructure

Hospitals, municipalities, schools, chambers of commerce. External attestation of institutional records.

- **Revenue:** €10K–100K/year per institution, or €1–5 per attestation.
- **Value:** Externally anchored proof. Resistant to internal tampering and disputes.

#### Channel 3: Brand First-Use

Automotive, electronics, luxury, real estate. External attestation of first-use moments.

- **Revenue:** €50K–500K per campaign, or €0.50–2 per attestation.
- **Value:** Independent proof of first use. Owned by customer, attested by neutral party.

### Market type B: Compliance-driven adoption

#### Channel 4: AI Governance & Compliance

AI platforms, autonomous agent frameworks, enterprise AI deployments. External attestation of first occurrence as required by regulatory frameworks (EU AI Act, NIST AI RMF, UK AI Safety Regulations, and emerging equivalents).

- **Revenue:** Per-attestation API fee ($0.01–0.10 at high volume) or enterprise license (€50K–500K/year for high-throughput AI platforms).
- **Value:** Regulatory compliance. External anchoring of AI event provenance. Admissible evidence of first occurrence in audits and disputes.

Channel 4 is structurally different from Channels 1–3. Channels 1–3 are driven by choice: platforms adopt because it improves their product. Channel 4 is driven by mandate: platforms adopt because regulators require external attestation for autonomous AI systems.

Compliance-driven markets are larger, more predictable, and stickier than optional markets. Channel 4 changes the revenue model from "will they pay?" to "they must pay — who will they pay?"

### Revenue projection

| Channel | Conservative (year 2–3) | At scale |
|---------|-------------------------|----------|
| Creative Tools (10 platforms) | €600K | €6M |
| Life Infra (50 institutions) | €1M | €10M |
| Brand First-Use (10 brands) | €1M | €5M |
| AI Governance (20 AI platforms) | €2M | €50M+ |
| **Total** | **€4.6M** | **€71M+** |

The AI governance channel has the highest ceiling because it operates at machine scale (millions of attestations per day) rather than human scale (discrete, conscious marking events). Volume is orders of magnitude higher, price per attestation is lower, total revenue is larger.

---

## XI. WHAT REMAINS OPEN

Canon v3 stated a single open question: will external parties recognize this attestation layer as something worth trusting and paying for?

That question has partially closed. In the AI governance domain, the answer is converging toward yes — not because of Umarise specifically, but because regulators are independently concluding that internal AI logs are structurally inadmissible and external attestation is required. The demand is emerging regardless of whether Umarise exists.

The remaining open questions are execution, not concept:

1. **First integration partner:** which platform or institution validates the hypothesis first?
2. **Regulatory positioning:** how does Umarise Core become a recognized attestation provider under EU AI Act, NIST, and equivalent frameworks?
3. API specification and developer documentation.
4. Foundation (stichting) legal structure and governance model.
5. Anchoring mechanism: own infrastructure, blockchain, or hybrid?
6. Pricing validation: per-call, enterprise, or hybrid?
7. Security model: key management, tamper resistance, audit trail.
8. Scale architecture for AI governance volumes (millions of attestations/day).
9. Legal standing of external attestation across jurisdictions.

The conceptual question — is external attestation necessary? — is answered. By five domains of established practice and by six regulatory frameworks converging on the same conclusion.

The execution questions — who integrates first, at what price, under what governance — remain.

The primitive is defined. The need is proven. What remains is building.

---

## XII. WHAT IS LOCKED

1. Umarise Core is an external attestation primitive, not a product.
2. Data model: hash + timestamp + origin_id. Nothing else.
3. No content storage. The artifact never touches Umarise infrastructure.
4. No interpretation. No semantics. No classification.
5. No ownership claims. Existence is attested, not rights.
6. No intention recognition. Physical act, not mental state.
7. Write-once, append-only, immutable.
8. SHA-256 locally reproducible. No vendor lock-in.
9. The marker never pays. Revenue from integrating platforms and compliance-driven adoption.
10. Protocol governance via foundation (stichting), not commercial entity.
11. The consumer app is free. Reference implementation, not the business.
12. The discipline of refusal is the product.
13. AI governance is a primary market, not an afterthought.

---

Umarise Core levert een externe, onveranderlijke attestatie dat een specifiek artefact op een specifiek moment is vastgelegd — zonder inhoud, betekenis of mutatie. De zelfbeperking is het product. De neutraliteit is de waarde. De noodzaak wordt bevestigd door vijf gevestigde domeinen en zes reguleringsframeworks. Wat rest is bouwen.

**End of Canon v4.0**
