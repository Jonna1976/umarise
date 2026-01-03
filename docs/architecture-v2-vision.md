# Umarise Architecture v2 — Vision Roadmap

**Status:** 🔮 Future Vision (Phase 2-3)  
**Target:** Privacy-Maximized Edge Computing  
**Philosophy:** Your data never leaves your device unless you choose

---

## Vision Statement

> "Software disappears. Your handwriting stays yours."

v2 transforms Umarise from a cloud-first PWA into a **privacy operating system** where AI runs locally, data syncs on your terms, and the cloud becomes optional infrastructure rather than required dependency.

---

## Architecture Evolution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              v1 → v2 TRANSITION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   v1 (NOW)                           v2 (VISION)                            │
│   ════════                           ══════════                             │
│   Cloud-first                   →    Device-first                           │
│   Server AI (Gemini)            →    Local AI (on-device models)            │
│   Online required               →    Offline-first, sync optional           │
│   IPFS storage                  →    Local encrypted + optional sync        │
│   Single device                 →    Multi-device with E2E encryption       │
│   Anonymous ID                  →    Optional identity + portable data      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER DEVICE                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         UI LAYER                                      │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │  │
│  │  │   Web (PWA)     │  │  Mobile Native  │  │  Voice UI       │        │  │
│  │  │   ✅ v1         │  │  🔮 v2          │  │  🔮 v3          │        │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    CONVERSATIONAL AI LAYER                            │  │
│  │  • Intent parsing (voice/text commands)                    🔮 v2-v3   │  │
│  │  • Context management (cross-session memory)               🔮 v2      │  │
│  │  • Natural language search ("find that budget note")       🔮 v2      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    LOCAL AI ENGINE                                    │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │  │
│  │  │  On-Device OCR  │  │  Local LLM      │  │  Edge Embeddings│        │  │
│  │  │  (no cloud)     │  │  (Phi-3, Gemma) │  │  (semantic idx) │        │  │
│  │  │  🔮 v2          │  │  🔮 v2-v3       │  │  🔮 v2          │        │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    ENCRYPTED LOCAL STORAGE                            │  │
│  │  • SQLite + FTS5 (local database)                          🔮 v2      │  │
│  │  • AES-256-GCM encryption at rest                          ✅ v1 opt  │  │
│  │  • IndexedDB for images                                    🔮 v2      │  │
│  │  • Offline-first with sync queue                           🔮 v2      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │   SYNC DECISION POINT   │
                        │   (User Controls)       │
                        └────────────┬────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   NO SYNC           │  │   SELECTIVE SYNC    │  │   FULL SYNC         │
│   (Air-gapped)      │  │   (Choose what)     │  │   (All devices)     │
│                     │  │                     │  │                     │
│ • 100% local        │  │ • Sync by project   │  │ • E2E encrypted     │
│ • Zero cloud        │  │ • Sync by date      │  │ • Multi-device      │
│ • Export only       │  │ • Manual trigger    │  │ • Real-time         │
│                     │  │                     │  │                     │
│ 🔮 v2               │  │ 🔮 v2               │  │ 🔮 v2-v3            │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTIONAL CLOUD BACKEND                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    SELF-HOSTED OPTIONS                                │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │  │
│  │  │  Hetzner Vault  │  │  NextCloud      │  │  Home Server    │        │  │
│  │  │  ✅ v1          │  │  🔮 v2          │  │  🔮 v2          │        │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    MANAGED CLOUD OPTIONS                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │  │
│  │  │  Lovable Cloud  │  │  Proton Drive   │  │  Customer Cloud │        │  │
│  │  │  ✅ v1          │  │  🔮 v2          │  │  🔮 v2          │        │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Roadmap

### Phase 2a: Local-First Foundation (Q2-Q3 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Offline Capture** | Take photos without internet, queue for later | 🔴 Critical |
| **Local SQLite** | Move database to device, sync on demand | 🔴 Critical |
| **IndexedDB Images** | Store images locally before/instead of cloud | 🔴 Critical |
| **Sync Queue** | Background sync when online | 🟡 High |
| **Conflict Resolution** | Handle offline edits across devices | 🟡 High |

### Phase 2b: On-Device AI (Q3-Q4 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Local OCR** | Tesseract.js or similar in-browser OCR | 🔴 Critical |
| **Edge Embeddings** | Generate semantic vectors locally | 🟡 High |
| **Small LLM** | Phi-3 or Gemma for summarization | 🟢 Medium |
| **Hybrid AI** | Local first, cloud fallback for quality | 🟡 High |

### Phase 2c: Multi-Device Sync (Q4 2026 - Q1 2027)

| Feature | Description | Priority |
|---------|-------------|----------|
| **E2E Encryption** | Zero-knowledge sync between devices | 🔴 Critical |
| **Identity Layer** | Optional account for device linking | 🟡 High |
| **Selective Sync** | Choose what syncs where | 🟢 Medium |
| **Sharing** | Share specific pages/projects with others | 🟢 Medium |

### Phase 3: Voice & Conversational (2027+)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Voice Capture** | "Hey Umarise, capture this thought" | 🟢 Future |
| **Natural Search** | "Find my notes about the budget meeting" | 🟢 Future |
| **Context Memory** | Remember conversation context across sessions | 🟢 Future |
| **Proactive Insights** | "You wrote about this 3 months ago..." | 🟢 Future |

---

## Technical Requirements

### On-Device AI Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL AI REQUIREMENTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OCR Engine:                                                    │
│  ├─ Tesseract.js (WASM) - works today                          │
│  ├─ Apple Vision API (iOS native)                              │
│  └─ Google ML Kit (Android native)                             │
│                                                                 │
│  Local LLM:                                                     │
│  ├─ Phi-3-mini (3.8B params, fits in 4GB RAM)                  │
│  ├─ Gemma-2B (Google's small model)                            │
│  ├─ Llama 3.2 1B/3B (Meta's efficient models)                  │
│  └─ WebLLM / Transformers.js for browser                       │
│                                                                 │
│  Embeddings:                                                    │
│  ├─ all-MiniLM-L6-v2 (22M params, fast)                        │
│  ├─ BGE-small (33M params, quality)                            │
│  └─ Run via Transformers.js in browser                         │
│                                                                 │
│  Storage:                                                       │
│  ├─ SQLite via sql.js (WASM)                                   │
│  ├─ IndexedDB for blobs                                        │
│  └─ Origin Private File System (OPFS) for performance          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sync Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    E2E ENCRYPTED SYNC                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Device A                    Cloud                    Device B  │
│  ────────                    ─────                    ────────  │
│                                                                 │
│  [Page] ─── Encrypt ───→ [Encrypted Blob] ←── Decrypt ─── [Page]│
│        (local key)       (zero-knowledge)      (local key)      │
│                                                                 │
│  Key Exchange:                                                  │
│  ├─ Device generates keypair on first setup                    │
│  ├─ Public keys shared via QR code / secure channel            │
│  ├─ Symmetric session keys derived per sync                    │
│  └─ Cloud never sees plaintext or keys                         │
│                                                                 │
│  Conflict Resolution:                                           │
│  ├─ Last-write-wins for simple fields                          │
│  ├─ CRDT for collaborative edits (future)                      │
│  └─ Manual merge UI for conflicts                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Privacy Levels

Users choose their privacy level:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRIVACY SPECTRUM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LEVEL 1: Convenient (v1 default)                                           │
│  ─────────────────────────────────                                          │
│  • Cloud storage (encrypted at rest)                                        │
│  • Server-side AI (Gemini)                                                  │
│  • Automatic backup                                                         │
│  • Single device simplicity                                                 │
│                                                                             │
│  LEVEL 2: Private (v1 Private Vault)                                        │
│  ──────────────────────────────────                                         │
│  • Client-side encryption before upload                                     │
│  • Server-side AI (sees encrypted data)                                     │
│  • User manages encryption key                                              │
│  • Key loss = data loss                                                     │
│                                                                             │
│  LEVEL 3: Local-First (v2 target)                                           │
│  ────────────────────────────────                                           │
│  • All data stays on device by default                                      │
│  • Local AI (no cloud processing)                                           │
│  • Optional encrypted sync                                                  │
│  • Cloud is backup, not primary                                             │
│                                                                             │
│  LEVEL 4: Air-Gapped (v2 paranoid mode)                                     │
│  ─────────────────────────────────────                                      │
│  • Zero network access                                                      │
│  • 100% local processing                                                    │
│  • Export via USB/file only                                                 │
│  • For maximum security environments                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Vision: European Office Suite

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EUROPEAN SOVEREIGNTY STACK                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Umarise   │  │  NextCloud  │  │   Proton    │  │  Element    │        │
│  │  (Origins)  │  │   (Files)   │  │   (Email)   │  │   (Chat)    │        │
│  │             │  │             │  │             │  │             │        │
│  │ Handwritten │  │  Documents  │  │   Secure    │  │   Secure    │        │
│  │ knowledge   │  │  storage    │  │   comms     │  │   comms     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │               │
│         └────────────────┴────────────────┴────────────────┘               │
│                                   │                                        │
│                    ┌──────────────┴──────────────┐                         │
│                    │    UNIFIED SEARCH LAYER     │                         │
│                    │  "Find across all origins"  │                         │
│                    └──────────────┬──────────────┘                         │
│                                   │                                        │
│                    ┌──────────────┴──────────────┐                         │
│                    │   HETZNER INFRASTRUCTURE    │                         │
│                    │      (German servers)       │                         │
│                    │      (GDPR compliant)       │                         │
│                    └─────────────────────────────┘                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria for v2

| Metric | v1 (Now) | v2 (Target) |
|--------|----------|-------------|
| Offline capture | ❌ No | ✅ Full |
| Local AI | ❌ No | ✅ OCR + Summary |
| Data location | Cloud-first | Device-first |
| Sync requirement | Always | Optional |
| Multi-device | ❌ No | ✅ E2E encrypted |
| Privacy level | 2 (with Vault) | 4 (air-gapped option) |

---

## Migration Path

```
v1 Users → v2 Upgrade
═══════════════════════

1. AUTOMATIC
   • App update includes local storage capability
   • Existing cloud data remains accessible
   • New captures go local-first

2. USER CHOICE
   • "Download all data to device" option
   • "Keep cloud backup" toggle
   • "Enable local AI" toggle

3. GRADUAL TRANSITION
   • Hybrid mode: local + cloud sync
   • Users can switch privacy levels anytime
   • No data loss during transition
```

---

## What v2 Does NOT Include

To maintain focus and avoid scope creep:

| Explicitly Out of Scope | Reason |
|------------------------|--------|
| Social features | Umarise is personal, not social |
| Real-time collaboration | v2 is about privacy, not collaboration |
| AI content generation | We preserve, we don't create |
| Cloud-only features | Everything must work offline |
| Subscription gatekeeping | Privacy is not a premium feature |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented in v1 |
| 🔮 | Vision for v2/v3 |
| 🔴 | Critical priority |
| 🟡 | High priority |
| 🟢 | Medium/Future priority |

---

*This document represents the aspirational vision for Umarise's privacy-maximized future.*  
*Implementation timelines are estimates and depend on pilot validation of v1.*  
*Core principle: v2 only happens after v1 proves the wedge works.*
