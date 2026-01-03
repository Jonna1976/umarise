# Executive Summary — Umarise Architecture v1 → v2

> Concise executive synthesis for stakeholders (product, engineering, security, and pilot sponsors). This is an interpretive summary with implications.

---

## What v1 proves (January 2026, MKB Pilot)

Umarise v1 is a production-operational, cloud-first capture-and-recall system that validates a very specific wedge:

> **People can reliably recover handwritten or scanned knowledge in under 60 seconds, without accounts, using explainable AI search.**

### Key proof points:

- End-to-end flow (capture → OCR → index → search) works reliably in production.
- Search is transparent and trust-preserving: originals are always shown first.
- Privacy posture is strong by default (anonymous device isolation, German hosting).
- System complexity is deliberately constrained: one server, clear service boundaries.

**This is not a prototype—it is a lean but complete system.**

---

## v1 Architecture — What Matters Most

### 1. Clear Separation of Concerns (Strong Design Choice)

| Service | Responsibility |
|---------|----------------|
| **DataVault** | Immutable image ingestion → IPFS |
| **Vision** | AI as metadata generator, not truth source |
| **Codex** | Deterministic storage + FTS5 search |
| **PWA** | Thin client, minimal state, fast iteration |

This separation will survive the v2 transition with minimal refactoring.

### 2. Privacy Model Is Coherent (Not Cosmetic)

- No accounts, no emails, no identities.
- `device_user_id` enforces isolation everywhere.
- Optional client-side encryption is honest about its risks (key loss = data loss).

This positions Umarise credibly against "privacy-theater" competitors.

### 3. Search Philosophy Is the Real Product

The most important architectural principle is not technical:

> **Original = Truth, AI = Index**

This is rare, defensible, and scales into v2 (local AI) cleanly.

---

## Known v1 Constraints (and Why They're Acceptable)

| Constraint | Reality Check |
|------------|---------------|
| Single server | Acceptable for pilot; reduces operational entropy |
| Cloud-only AI | Fine for proving value; avoids premature WASM pain |
| No offline mode | Explicitly acknowledged; sets up v2 urgency |
| No accounts | Feature, not bug, at this stage |

**v1 is correctly incomplete by design.**

---

## v2 Vision — Strategic Assessment

### What v2 Actually Is

v2 is not "more features". It is a **role reversal**:

- Cloud becomes optional infrastructure
- Device becomes system of record
- AI becomes local, not authoritative
- Sync becomes a user decision, not a requirement

**This is closer to a personal knowledge OS than an app.**

### Architectural Coherence of v2

The v2 roadmap is internally consistent:

- SQLite + FTS5 locally mirrors Codex
- IndexedDB / OPFS mirrors IPFS role
- Local embeddings replace server FTS as recall improves
- Sync is layered after local correctness

**Crucially: nothing in v1 blocks v2.**

---

## Risk Assessment (Important)

### Technical Risks

| Risk | Notes |
|------|-------|
| Browser-based local AI performance | Mitigation: hybrid local-first, cloud-fallback (already planned) |
| Key management UX | Risk of user error grows with E2E + multi-device |
| Conflict resolution | CRDT deferral is wise; manual merge UI will be essential early |

### Product Risks

- v2 scope creep (voice, chat, insights too early)
- Over-optimizing for "paranoid mode" before mainstream users adopt v1

Your document explicitly guards against both—this is good.

---

## What This Architecture Enables (Strategically)

If executed as written, Umarise becomes:

1. **A sovereign memory layer** (handwritten + scanned knowledge)
2. **A neutral node** in a European privacy stack
3. **A product that competes on trust and recall**, not generative novelty

Very few systems can credibly claim this trajectory.

---

## Bottom Line

| Aspect | Assessment |
|--------|------------|
| v1 | Correctly minimal, operational, and honest |
| v2 | Ambitious but architecturally grounded |
| Migration path | Realistic and reversible |
| Philosophy | Consistent across versions |

> **If the pilot confirms user pull, this architecture is strong enough to scale without betraying its principles—which is rare.**

---

## Suggested Next Steps

- [ ] One-page investor/partner brief
- [ ] v2 technical spike plan (what to prototype first)
- [ ] Threat model review (especially for sync + keys)

---

*Summary generated: January 2026*
