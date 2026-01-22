# UMARISE — IP Valuation for Due Diligence

**Document type:** Technical Asset Inventory  
**Status:** Production (Pilot)  
**Last verified:** 2026-01-22

---

## Executive Summary

This document provides a technical inventory of Umarise's realized Intellectual Property, mapping each asset to specific code files for verification. Total replacement cost is estimated at **€190K–305K**, with strategic market value of **€400K–900K** due to first-mover positioning in the "Origin Immutability" category.

---

## Asset Inventory

### 1. PWA Capture Infrastructure

**Replacement Cost:** €40K–60K

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| Zero-friction camera | Direct camera access, no menu | `src/components/capture/CameraView.tsx` |
| Topic input with autocomplete | Max 2-3 keywords, guided UX | `src/components/capture/TopicInput.tsx` |
| Processing ritual | "Origin sealed" animation | `src/components/codex/ProcessingView.tsx` |
| PWA manifest | Installable, offline-capable shell | `public/manifest.json` |
| Haptic feedback | Native-feel interactions | `src/lib/haptics.ts` |

**IP Value:** Complete capture-to-storage flow validated on iOS hardware. Zero-friction design eliminates onboarding.

---

### 2. Hetzner/IPFS/SQLite Backend

**Replacement Cost:** €50K–80K

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| Storage abstraction | Multi-provider interface | `src/lib/abstractions/storage.ts` |
| Hetzner Vault integration | IPFS + SQLite on German servers | `src/lib/abstractions/storage.ts:623-1251` |
| Content-addressed storage | IPFS CID as immutable reference | `supabase/functions/hetzner-storage-proxy/index.ts` |
| Device-based isolation | UUID v4 per device, RLS enforcement | `src/lib/deviceId.ts` |

**IP Value:** EU-sovereign data residency with cryptographic content addressing. No US cloud dependency.

---

### 3. Edge Function Proxy Layer

**Replacement Cost:** €20K–35K

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| Storage proxy | Stateless pass-through to Hetzner | `supabase/functions/hetzner-storage-proxy/index.ts` |
| AI proxy | Routes OCR/search to Hetzner | `supabase/functions/hetzner-ai-proxy/index.ts` |
| Health check | Endpoint monitoring | `supabase/functions/hetzner-health/index.ts` |
| Rate limiting | Per-device throttling | `supabase/functions/hetzner-storage-proxy/index.ts:22-56` |
| Audit logging | Append-only request logs | `supabase/functions/hetzner-storage-proxy/index.ts:58-70` |

**IP Value:** Browser CORS bypass without data persistence. Stateless design ensures no PII in proxy layer.

---

### 4. AI Pipeline (Gemini OCR)

**Replacement Cost:** €30K–50K

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| AI abstraction layer | Provider-agnostic interface | `src/lib/abstractions/ai.ts` |
| Type definitions | Structured response contracts | `src/lib/abstractions/types.ts` |
| Page analysis | OCR + summary + keywords + tone | `supabase/functions/analyze-page/index.ts` |
| Pattern detection | Temporal aggregation | `supabase/functions/analyze-patterns/index.ts` |
| Embedding generation | Future semantic search | `supabase/functions/generate-embeddings/index.ts` |

**IP Value:** Structured JSON extraction from handwriting. Domain-specific prompts for knowledge capture.

---

### 5. Origin Immutability Layer ⭐

**Replacement Cost:** €25K–40K  
**Strategic Value:** Core differentiating IP

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| SHA-256 hash calculation | Client-side before upload | `src/lib/originHash.ts:36-50` |
| Data URL decoding | Extract raw bytes from capture | `src/lib/originHash.ts:56-71` |
| Hash verification | Compare stored vs. computed | `src/lib/originHash.ts:92-112` |
| Sidecar storage | Dual-write for redundancy | `src/lib/pageService.ts:13-90` |
| No UPDATE path | `image_url` excluded from updates | `src/lib/pageService.ts:394-494` |

**Proof of Immutability:**

```typescript
// src/lib/pageService.ts - updatePage()
// image_url is ABSENT from the update interface
export async function updatePage(id: string, updates: {
  userNote?: string;
  primaryKeyword?: string;
  ocrText?: string;
  // ... NO imageUrl
}): Promise<boolean>
```

**IP Value:** Architectural constraint that makes origin modification impossible. Not a policy—code literally cannot alter the original.

---

### 6. Anti-Black-Box Search ⭐

**Replacement Cost:** €10K–15K  
**Strategic Value:** Core differentiating IP

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| Ranking hierarchy | User intent > AI inference | `supabase/functions/search-pages/index.ts` |
| Match badges | Explainable result reasons | `src/components/codex/SearchView.tsx` |
| Cite-to-source | Link insights to OCR passages | `src/lib/citeToSource.ts` |
| Exact matching | No fuzzy/synonym fallback | `supabase/functions/search-pages/index.ts` |

**Ranking Weights (Hardcoded):**

| Match Type | Score | Rationale |
|------------|-------|-----------|
| Future You Cue (exact) | +100 | User's explicit retrieval intent |
| Spine label | +100 | User's classification |
| Date match | +200 | Temporal precision |
| AI bonus words | +80 | AI-suggested, lower trust |
| Raw OCR | +50 | Unprocessed text, lowest rank |

**IP Value:** Retrieval logic that provably prioritizes human intent over algorithmic inference. Competitors cannot claim "explainable AI" without similar architectural constraints.

---

### 7. Hybrid Trash Sync

**Replacement Cost:** €15K–25K

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| Hetzner trash operations | PATCH with redundant fields | `src/lib/abstractions/storage.ts:1100-1200` |
| Supabase index mirror | Cross-device sync | `hetzner_trash_index` table |
| Restore flow | Dual-write consistency | `src/lib/abstractions/storage.ts` |

**IP Value:** Cross-device synchronization without centralized accounts. Device-based ownership with eventual consistency.

---

### 8. Verification & Export

**Replacement Cost:** €10K–15K

| Feature | Implementation | Code Reference |
|---------|----------------|----------------|
| Origin verification UI | Hash comparison display | `src/components/codex/VerifyOriginButton.tsx` |
| Export service | ZIP with manifest | `src/lib/exportService.ts` |
| Image compression | Optimized storage | `src/lib/imageCompression.ts` |

**IP Value:** User-facing proof of data integrity. Export format includes verification data for external audit.

---

## Total Asset Valuation

### Replacement Cost Method

| Category | Low | High |
|----------|-----|------|
| PWA Capture | €40K | €60K |
| Backend Infrastructure | €50K | €80K |
| Edge Functions | €20K | €35K |
| AI Pipeline | €30K | €50K |
| Origin Immutability | €25K | €40K |
| Anti-Black-Box Search | €10K | €15K |
| Hybrid Sync | €15K | €25K |
| Verification/Export | €10K | €15K |
| **Total** | **€200K** | **€320K** |

### Strategic Value Multiplier

The technical assets warrant a **2-3x multiplier** due to:

1. **Category Creation** — First implementation of "Origin Immutability" as infrastructure
2. **Timing** — EU AI Act and GDPR enforcement creating demand for sovereign solutions
3. **Production-Ready** — Not a prototype; validated on real hardware with pilot users
4. **Architectural Moat** — Constraints are in code, not policy; competitors must rebuild from scratch

**Strategic Value Range:** €400K–900K

---

## Verification Checklist

For technical due diligence, verify these claims:

| Claim | Verification Method |
|-------|---------------------|
| No UPDATE path for images | Search codebase for `image_url` in update functions |
| Ranking hierarchy | Check `search-pages/index.ts` for weight constants |
| SHA-256 before upload | Trace `calculateSHA256` call in capture flow |
| EU data residency | Verify Hetzner endpoints in proxy functions |
| Device isolation | Check RLS policies and `device_user_id` filtering |

---

## Code Quality Indicators

| Metric | Value |
|--------|-------|
| TypeScript coverage | 100% |
| Component count | 80+ React components |
| Edge functions | 12 deployed |
| Documentation | 25+ markdown files |
| Test coverage | Unit tests for origin hash |

---

## Appendix: File Structure

```
src/
├── lib/
│   ├── abstractions/      # Provider interfaces
│   │   ├── storage.ts     # Storage abstraction (1251 lines)
│   │   ├── ai.ts          # AI abstraction
│   │   └── types.ts       # Type definitions
│   ├── originHash.ts      # SHA-256 implementation
│   ├── pageService.ts     # Page CRUD operations
│   └── citeToSource.ts    # Citation linking
├── components/
│   ├── capture/           # Camera + input flow
│   └── codex/             # Search + display views
└── hooks/                 # React hooks

supabase/functions/
├── hetzner-storage-proxy/ # Storage routing
├── hetzner-ai-proxy/      # AI/search routing
├── analyze-page/          # OCR + analysis
└── search-pages/          # Retrieval logic

docs/
├── architecture-v1-technical.md
├── cto-technical-factsheet.md
├── proof-of-behavior.md
└── origin-hash-verification.md
```

---

*Document prepared for technical due diligence. All code references verified against `main` branch as of 2026-01-22.*
