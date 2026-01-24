# UMARISE — Strategic Documents Bundle (PRIVATE)

> **⚠️ CONFIDENTIAL — DO NOT PUBLISH**  
> This document consolidates all strategic positioning, outreach, and investor materials.  
> Keep locally, share selectively in conversations.

---

## Document Index

1. [Demo Narrative (5-min script)](#1-demo-narrative)
2. [Executive Summary (Outreach)](#2-executive-summary)
3. [Investor One-Pager](#3-investor-one-pager)
4. [Outreach Strategy](#4-outreach-strategy)
5. [Outreach: Frank Karlitschek (NextCloud)](#5-outreach-karlitschek)
6. [Outreach: Austin Kleon](#6-outreach-kleon)

---

# 1. Demo Narrative

> 5 minutes. No pitch. No features.  
> Show where origin lives in a stack.

---

## Purpose

This is not a product demo.  
This is a reference implementation of an origin record layer.

We're not showing features.  
We're showing where origin lives — before interpretation, before optimization, before AI.

---

## The Demo (5 minutes)

### Minute 0–1 — Framing

**Say:**

> "This is not a product demo.  
> This is a reference implementation of an origin record layer."

> "We're not showing you features.  
> We're showing you where origin lives in a stack — before interpretation, before optimization, before AI."

**Core statement:**

> "Everything above this layer can change.  
> Nothing below it can be overwritten."

---

### Minute 1–2 — Capture

**Show:**
- Capture moment (camera → image)
- No AI processing visible yet
- Direct registration

**Say:**

> "This is raw input — before any system touches it."

> "At this moment, nothing is interpreted.  
> We only register that something existed."

---

### Minute 2–3 — Seal & Store

**Show:**
- Hash calculation (SHA-256)
- IPFS CID generation
- Storage confirmation ("Origin sealed")

**Say:**

> "The moment it's captured, it's sealed."

> "This is not versioning.  
> This is immutability by construction."

**Critical point:**

> "If the content changes, the identity changes.  
> Silent overwrite is technically impossible."

---

### Minute 3–4 — Resolve & Verify

**Show:**
- Origin View (`/origin/:id`)
- Hash verification (green checkmark)
- Proof Bundle download

**Say:**

> "Any system can now resolve this origin.  
> Not because it trusts us — but because it can verify the bits itself."

**Key statement:**

> "This is how origin survives transformation."

---

### Minute 4–5 — Boundary

**Say explicitly:**

> "Umarise stops here."

> "We don't enforce policy.  
> We don't decide truth.  
> We don't govern."

**Then:**

> "But without this layer, governance is symbolic.  
> With it, governance becomes enforceable."

**Close with:**

> "Now the only real question is:  
> where would this live in your stack?"

**Then stop.**  
Do not continue talking. Let silence work.

---

## Positioning Questions

Use maximum 3 questions per conversation.

### A. Opening Question (always use this)

> "Where in your stack is origin currently defined?"

**Listen for:**
- Vagueness
- Silence
- "It's everywhere"
- "It's implicit"

These are signals, not problems.

---

### B. Deepening Questions (choose one)

**Option 1 — Technical / Infrastructure:**

> "Before content is transformed, optimized, or interpreted —  
> where is the last immutable reference today?"

**Option 2 — AI / Data:**

> "If an AI output is challenged, how do you prove what it was derived from?"

**Option 3 — Compliance / Governance:**

> "Which part of your stack is the system-of-record for 'what existed at time T'?"

---

### C. Boundary Check (very powerful)

> "If that reference were wrong or manipulated,  
> how would you detect it?"

Do not solve. Do not help.  
Let it land.

---

### D. Closing Question

> "Should that responsibility live inside an application —  
> or below all applications?"

That is the entire conversation.

---

## What NOT To Do

| Don't | Why |
|-------|-----|
| Explain why Umarise is needed | They should discover it |
| Argue | Creates resistance |
| Convince | Signals weakness |
| Keep giving examples | Dilutes the point |

**If it fits, they will move Umarise into their mental model themselves.**

---

## Internal Anchor

> "We're not selling a solution.  
> We're revealing a missing layer."

---

---

# 2. Executive Summary

**One-liner:** Infrastructure that makes handwritten origins retrievable without losing them to AI interpretation.

---

## The Problem We Solve

In an AI-driven world, the moment of creation—sketches, whiteboard decisions, handwritten notes—disappears into systems that transform, summarize, and reinterpret. When disputes arise, the original is gone. Only interpretations remain.

**Mainstream AI (ChatGPT, Gemini, Claude):**
- Your data trains models or funds ads
- "Delete" doesn't mean deleted
- AI output replaces your input as source of truth

**Umarise is different.** We protect the beginning.

---

## What v1 Already Delivers (Operational Now)

| Capability | Technical Implementation |
|------------|-------------------------|
| **EU Sovereign Storage** | Hetzner DE infrastructure, zero-access policy (no human reads your data) |
| **Origin Immutability** | SHA-256 hash at capture, database trigger prevents any modification |
| **Explainable Search** | User keywords outrank AI inference (+100 vs +50), word-boundary matching only |
| **Anti-Black-Box** | Every result shows *why* it matched; cite-to-source links to original OCR |
| **No Account Required** | Device-based ownership via UUID, no email, no login, no tracking |
| **Retrieval < 60 seconds** | Photo → 2 words → find original, proven in pilot |

**What this means:** The original scan is the truth. AI generates metadata, never replaces content. Users always know why something was found.

---

## What v2 Promises

| Capability | Technical Approach |
|------------|-------------------|
| **Zero-Knowledge Encryption** | Client-side AES-256-GCM, keys never leave device |
| **Local-First Processing** | On-device vision models when quality matches Gemini |
| **MCP Server Architecture** | Umarise as "Origin Authority"—external AI tools request access via consent gateway |
| **Account Migration** | Optional accounts to "claim" existing device data without losing history |

**The v2 vision:** Not even Umarise can read your data. The device becomes the system of record.

---

## Why This Matters

### For AI Ethics Leaders
- **Cite-to-source is mandatory**—no "AI says so" without evidence
- **User intent > model inference**—architecturally enforced, not policy promised
- **Transparent ranking**—open scoring weights, no hidden optimization

### For EU Sovereignty Ecosystem
- **GDPR-native**—German data residency, no US cloud dependency
- **Integration-ready**—designed to complement NextCloud (files), Proton (email), as the "origins" layer
- **Proof over promise**—working pilot with MKB teams, not a pitch deck

---

## Differentiation Matrix

|  | ChatGPT | Confer (Signal) | Umarise |
|--|---------|-----------------|---------|
| **Problem** | General AI assistant | Private AI chat | Origin capture & retrieval |
| **Data location** | US servers | E2E encrypted cloud | Hetzner DE (v1) → Device (v2) |
| **Business model** | Ads (free) / subscription | Subscription | Subscription, no ads ever |
| **What's protected** | Nothing | Conversations | The beginning—before AI transforms |
| **Explainability** | None | None | Mandatory cite-to-source |

---

## Contact

**Status:** Product operational, pilots in preparation  
**Infrastructure:** 100% operational on Hetzner DE  
**Code:** Architecture documentation available on request

*"In a world where AI rewrites everything, we protect the moment where meaning is born."*

---

---

# 3. Investor One-Pager

**Tagline:** Infrastructure that proves ideas existed before AI rewrote them.

---

## The Problem

In an AI-first world, the original moment of creation disappears.

- Whiteboards get "cleaned up" into documents
- Handwritten notes become AI summaries
- Sketches turn into polished presentations

When disputes arise about "who thought of this first" — the original is gone.  
Only interpretations remain.

**This is not a productivity problem. This is an evidence problem.**

---

## What Umarise Does

**Photo → 2 words → Retrieve in 60 seconds**

1. User photographs handwritten note/sketch
2. Adds 2 keywords ("future you" cues)
3. System seals the origin with cryptographic hash
4. Later: search by cue → see original proof

**No accounts. No folders. No training.**

---

## Technical Differentiators

| Feature | How It Works | Why It Matters |
|---------|--------------|----------------|
| **Origin Immutability** | SHA-256 hash at capture, IPFS content-addressing, no UPDATE path in code | Cannot be altered — even by us |
| **Anti-Black-Box Search** | User cues rank +100, AI inference ranks +50 | Human intent always outranks algorithm |
| **Cite-to-Source** | Every AI insight links to highlighted OCR passage | No "AI says so" without evidence |
| **EU Sovereignty** | 100% Hetzner Germany, zero US cloud dependency | GDPR-native, not GDPR-compliant |
| **Zero Human Access** | No accounts, device-based UUID, RLS isolation | No human access by design; data processed only to preserve origin — no training, no secondary use |

---

## What Makes This Hard to Copy

Competitors can copy features. They cannot copy philosophy.

To replicate Umarise, you must:
1. Redesign your entire codebase so AI *never* replaces origin
2. Accept that your AI cannot "improve" user content
3. Build every future feature through this constraint

**This is not a sprint. This is a worldview encoded in code.**

---

## Market Position

| Category | Incumbents | Umarise |
|----------|------------|---------|
| **What they protect** | Documents (the result) | Origins (the beginning) |
| **Truth source** | AI-processed text | Original scan |
| **Search philosophy** | "What's similar?" | "What exactly was this?" |
| **Data model** | Cloud-first | Sovereignty-first |

**We are not a note-taking app. We are evidence infrastructure.**

---

## Traction & Status

| Metric | Status |
|--------|--------|
| **Product** | 100% operational on Hetzner Germany |
| **Core hypothesis** | 80% retrieval within 60 seconds (pilot testing) |
| **Architecture** | Frozen for pilot; security sign-off complete |
| **Target** | MKB teams (<50 employees) losing agreements on paper/whiteboards |

---

## Business Model

**Subscription SaaS** (no ads, no data monetization — ever)

| Tier | Price | Value |
|------|-------|-------|
| **Individual** | €5/month | Unlimited captures, search, verification |
| **Team** | €12/user/month | Shared device pools, audit logs |
| **Enterprise** | Custom | On-premise deployment, SLA, integrations |

**Future revenue:** Paid verification events for third-party proof requests.

---

## Strategic Partnerships (Target)

| Partner Type | Example | Integration Value |
|--------------|---------|-------------------|
| **EU Privacy Stack** | Proton, NextCloud | "Origin layer" for sovereign office suite |
| **Analog Brands** | Moleskine, LEUCHTTURM1917 | Digital extension of physical products |
| **Legal/IP** | Patent firms, notaries | Proof-of-first-idea infrastructure |

---

## The Ask

**Seed round: €500K–1M**

Use of funds:
- Complete MKB pilot (3 months)
- Hire 2 engineers (search optimization, mobile PWA)
- First 3 enterprise pilots

---

## Team

*[To be completed with founder backgrounds]*

---

## Contact

**Website:** umarise.lovable.app  
**Status:** Pilot-ready, actively recruiting test teams

---

> *"In a world where AI rewrites everything, we protect the moment where meaning is born."*

**UMARISE** — Bewijs van het begin.

---

---

# 4. Outreach Strategy

## Prioriteit Volgorde

### 1. 🥇 Frank Karlitschek (NextCloud) — EERST

**Waarom eerst:**
- Strategische waarde > bereik
- Partnership kan Umarise integreren in EU sovereignty ecosystem
- Dezelfde infrastructuur (Hetzner), dezelfde filosofie
- Één beslisser, directe actie mogelijk

**Actie:** LinkedIn connectie + email binnen 48 uur

**Success metric:** 15-min call gepland

---

### 2. 🥈 Austin Kleon — NA PILOT RESULTATEN

**Waarom tweede:**
- Enorm bereik (500K+ target users)
- Maar: hij deelt alleen tools die hij *echt gebruikt*
- Wacht tot pilot 80% retrieval bewijst → dan is het een verhaal, niet een pitch

**Actie:** Email na pilot afsluiting (dag 22)

**Success metric:** Hij probeert het + noemt het in newsletter

---

### 3. 🥉 EU AI Office / Gaia-X — LATER (Q2)

**Waarom later:**
- Bureaucratisch, lange cycli
- Hebben "success cases" nodig, niet pilots
- Wacht tot NextCloud partnership OF 3+ paying customers

**Actie:** Executive summary indienen bij relevante calls/tenders

**Success metric:** Opgenomen in EU sovereignty showcase

---

### 4. Meredith Whittaker (Signal) — OPPORTUNISTISCH

**Waarom niet prioriteit:**
- Confer is net gelanceerd, focus ligt daar
- Complementair maar geen directe synergie nu
- Beter: wacht tot Confer stabiliseert, dan "origins for Signal users" pitch

**Actie:** Volgen op Mastodon/X, reageren op relevante posts

**Success metric:** Op radar komen, geen harde ask

---

### 5. Timnit Gebru (DAIR) — VALIDATIE, GEEN PARTNERSHIP

**Waarom apart:**
- Academisch/advocacy focus
- Waarde = validatie van anti-black-box claims
- Geen commerciële samenwerking

**Actie:** Tag in relevante discussies over explainable AI

**Success metric:** Retweet of mention

---

## Outreach Kalender

| Week | Actie | Target |
|------|-------|--------|
| **Week 1** | LinkedIn + Email | Karlitschek |
| **Week 3** | Follow-up indien geen respons | Karlitschek |
| **Week 4** | Pilot afgerond → Email | Kleon |
| **Week 6** | Met resultaten → EU channels | Gaia-X / AI Office |
| **Ongoing** | Social presence | Whittaker, Gebru |

---

## Kernboodschap Per Doelgroep

| Doelgroep | Hook |
|-----------|------|
| **Sovereignty (Karlitschek)** | "De origins layer die je mist" |
| **Creatives (Kleon)** | "Protect the napkin sketch" |
| **Ethics (Gebru)** | "Cite-to-source is mandatory, not optional" |
| **EU Institutions** | "German infrastructure, explainable AI, working pilot" |

---

---

# 5. Outreach: Karlitschek

**Subject:** The missing layer in your European Office Suite

---

Frank,

You're building the European alternative to Microsoft 365. Files, calendar, mail, video—it's coming together.

But there's a gap: **the beginning**.

Before something becomes a file, it's a whiteboard sketch, a handwritten note, a napkin idea. That moment disappears into a folder and is never found again. Or worse—it's uploaded to US cloud AI that rewrites it into something "better."

**We built the origins layer.**

Umarise captures handwritten artifacts, makes them searchable in under 60 seconds, and guarantees the original is never modified. No OCR replacement—the scan stays the truth. Every search result explains *why* it matched.

**Technical facts:**
- Running on Hetzner DE (same sovereignty philosophy)
- SHA-256 origin hash at capture, immutable by database trigger
- Zero-access policy—no human reads user data
- User keywords outrank AI inference (explainable by design)
- No account required—device-based ownership

**V2 roadmap:** Zero-knowledge encryption (client-side AES-256), local-on-device processing.

The product is operational. Infrastructure runs on Hetzner DE. We're preparing pilots with Dutch SME teams.

NextCloud has files. Proton has email. **Umarise has origins.**

Interested in a 15-minute call to explore where this fits?

—

[Name]  
Umarise  
*Bewijs van het begin*

---

## Notes for sending

- **LinkedIn:** https://www.linkedin.com/in/frankkarlitschek/
- **Mastodon:** @frank@mastodon.xyz
- **Email:** Likely via NextCloud contact or conference connection
- **Best hook:** His "European Digital Sovereignty" talks at FOSDEM/conferences
- **Tone:** Technical peer, not sales pitch

---

---

# 6. Outreach: Austin Kleon

**Subject:** Protecting the napkin sketch

---

Austin,

You've written about the gap between your analog desk and your digital desk. The notebook where ideas begin, and the screen where they become "content."

That gap is where things get lost.

Not the finished work—that survives. But the beginning: the first sketch, the crossed-out line, the margin note that made the whole thing click. When AI summarizes, optimizes, and "improves" our work, that origin disappears.

**We built something to protect it.**

Umarise captures handwritten pages—notebooks, napkins, whiteboards—and makes them findable in under 60 seconds. Two words, and you're back at the original.

The key: **the original stays the original.** No OCR replacement. No AI rewriting. The scan is the truth. AI only helps you find it—and every search result shows exactly *why* it matched.

Our internal mantra: *"This was me. Before optimization."*

I think you'd get it. And I think your readers might too.

Would you be open to trying it? No strings—just curious if it resonates with how you work.

—

[Name]  
Umarise  
*Bewijs van het begin*

---

## Notes for sending

- **Website:** austinkleon.com (contact form)
- **Newsletter:** Very active, often shares tools he uses
- **Twitter/X:** @austinkleon (400K+ followers)
- **Best hook:** His "analog vs digital desk" philosophy, skepticism of AI-ification
- **Tone:** Fellow creative, not pitch. He responds to genuine, short messages.
- **Timing:** He often writes on Fridays (newsletter day)
- **Potential:** If he uses it and mentions it → direct access to 500K+ target users

---

*Bundle compiled: 2026-01-24*  
*Status: PRIVATE — do not include in public build*
