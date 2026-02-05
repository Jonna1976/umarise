# Umarise v4 Implementation Plan

**Status:** Planning  
**Created:** 2026-02-05  
**Reference:** docs/complete-briefing-v4.md

---

## Guiding Principle

> **Niets van de huidige functionaliteit mag verdwijnen.**

All existing components (HistoryView, SearchView, Codex features, etc.) remain in the codebase. They may be hidden from the primary Ritual UI but must remain accessible and functional.

---

## Current State Inventory

### What Exists Today

| Component | Location | Status |
|-----------|----------|--------|
| `pages` table | Supabase | Active — stores image_url, ocr_text, hash, etc. |
| `page-images` bucket | Supabase Storage | Active — stores full images server-side |
| `device_user_id` (UUID) | localStorage | Active — anonymous identity |
| Client-side SHA-256 hashing | `src/lib/originHash.ts` | ✅ Already implemented |
| Origin hash sidecar | `page_origin_hashes` table | ✅ Already implemented |
| Core bridge trigger | `bridge_page_to_core_attestation` | ✅ Already implemented |
| OTS anchoring worker | Hetzner | ✅ Already implemented |
| Demo mode | `src/contexts/DemoModeContext.tsx` | Active |
| HistoryView | `src/components/codex/HistoryView.tsx` | Preserve |
| SearchView | `src/components/codex/SearchView.tsx` | Preserve |
| VaultView | `src/components/codex/VaultView.tsx` | Preserve |
| Export functionality | `src/lib/exportService.ts` | Preserve |
| Ritual flow prototype | `src/components/prototype/` | Active |

### What Needs to Change (v4)

| Change | Type | Risk |
|--------|------|------|
| Add Supabase Auth (Magic Link) | Add | Low — additive |
| Add IndexedDB thumbnail storage | Add | Low — additive |
| Remove server-side image storage | Remove | **HIGH** — data loss risk |
| Add `witnesses` table | Add | Low |
| Rename `pages` → `origin_attestations` | Rename | Medium — many references |
| Add device fingerprint | Add | Low |
| Add certificate export (jsPDF) | Add | Low |

---

## Phase 0: Preparation (Non-Breaking)

**Goal:** Set up infrastructure without breaking anything

### 0.1 Add IndexedDB Layer
- [ ] Create `src/lib/indexedDB.ts` — wrapper for IndexedDB operations
- [ ] Schema: `{ id, thumbnail, hash, origin_id, timestamp, ots_proof, ots_status, type, size_class }`
- [ ] Write operations: `saveMark()`, `updateOtsProof()`, `getAllMarks()`, `getMark(id)`
- [ ] No changes to existing `pages` table

### 0.2 Add jsPDF + JSZip Dependencies
- [ ] Install `jspdf` and ensure `jszip` is available
- [ ] Create `src/lib/certificateService.ts` — client-side PDF generation
- [ ] Test certificate generation in isolation

### 0.3 Create Dual-Write Infrastructure
- [ ] Create abstraction that writes to BOTH Supabase AND IndexedDB
- [ ] This allows gradual migration without data loss

---

## Phase 1: Supabase Auth (Magic Link)

**Goal:** Replace anonymous `device_user_id` with authenticated `user_id`

### 1.1 Enable Supabase Auth
- [ ] Configure Supabase Auth with Magic Link (no password)
- [ ] Disable auto-confirm — users must verify email

### 1.2 Create Auth UI
- [ ] Create `src/components/auth/MagicLinkAuth.tsx`
- [ ] Design matches ritual tone: minimal, one input, one button
- [ ] Text: "Your email seals your identity to your marks"

### 1.3 Add Auth Flow to Welcome Screen
- [ ] Modify `WelcomeScreen.tsx` to include email verification step
- [ ] After verification: proceed to Capture
- [ ] Store auth session (Supabase handles this)

### 1.4 Migration Path for Existing Users
- [ ] On first login, allow user to "claim" pages by their old `device_user_id`
- [ ] Create migration edge function: `migrate-anonymous-to-auth`
- [ ] UI prompt: "We found pages from this device. Link them to your account?"

### 1.5 Update Database Schema
```sql
-- Add user_id to pages (nullable initially for migration)
ALTER TABLE pages ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add device_fingerprint_hash
ALTER TABLE pages ADD COLUMN device_fingerprint_hash TEXT;

-- Create index
CREATE INDEX idx_pages_user_id ON pages(user_id);
```

### 1.6 Update RLS Policies
```sql
-- Users can only see their own pages (via user_id)
CREATE POLICY "Users read own pages via user_id"
  ON pages FOR SELECT
  USING (auth.uid() = user_id OR device_user_id = (current_setting('request.jwt.claims', true)::json->>'device_id')::uuid);
```

### 1.7 Preserve Anonymous Access
- [ ] Existing `device_user_id` logic remains as fallback
- [ ] Users can still use the app without auth (read-only mode)
- [ ] Mark creation requires auth

---

## Phase 2: IndexedDB Thumbnails

**Goal:** Store thumbnails locally, stop sending images to server

### 2.1 Implement Thumbnail Generation
- [ ] Create `src/lib/thumbnailService.ts`
- [ ] Generate ~400px max dimension, JPEG 70%
- [ ] Store in IndexedDB as Blob

### 2.2 Update Create Page Flow
Current flow:
```
Photo → SHA-256 hash → Upload to Supabase Storage → Create page record
```

New flow (dual-write):
```
Photo → SHA-256 hash → Generate thumbnail
     ↓                        ↓
     → POST to Supabase       → Save to IndexedDB
     (hash + metadata only)   (thumbnail + metadata)
```

### 2.3 Update Wall of Existence
- [ ] Source thumbnails from IndexedDB first
- [ ] Fallback to Supabase image_url if IndexedDB empty (graceful degradation)
- [ ] Show origin_id + date if neither available

### 2.4 Implement Sync Logic
- [ ] On app open: fetch new OTS proofs from Supabase
- [ ] Update IndexedDB with `ots_status: "anchored"` and `ots_proof` blob
- [ ] Queue offline marks in IndexedDB with `sync_status: "queued"`

---

## Phase 3: Witness Feature

**Goal:** Allow users to invite witnesses to strengthen proof

### 3.1 Create Witnesses Table
```sql
CREATE TABLE witnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id TEXT REFERENCES origin_attestations(origin_id) NOT NULL,
  witness_email TEXT NOT NULL,
  witness_confirmed_at TIMESTAMPTZ,
  confirmation_hash TEXT,
  verification_token TEXT UNIQUE,
  ots_status TEXT DEFAULT 'pending',
  ots_proof BYTEA,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;

-- Makers can see witnesses for their marks
CREATE POLICY "Makers see own witnesses"
  ON witnesses FOR SELECT
  USING (origin_id IN (SELECT origin_id FROM pages WHERE user_id = auth.uid()));

-- Anyone can confirm via token (public endpoint)
CREATE POLICY "Anyone confirms via token"
  ON witnesses FOR UPDATE
  USING (verification_token IS NOT NULL);
```

### 3.2 Create Witness Invite Flow
- [ ] Add "add a witness" prompt to Release screen (post-cascade)
- [ ] Generate unique verification token
- [ ] Share via native share sheet (link only — thumbnail shared separately by user)

### 3.3 Create Witness Confirmation Page
- [ ] Route: `/witness/:token`
- [ ] Display: origin_id, date, hash (NO thumbnail)
- [ ] Input: witness email
- [ ] Button: "I confirm I saw this"
- [ ] On confirm: send confirmation email to witness

### 3.4 Update Certificate to Include Witness
- [ ] If witness confirmed: add witness email (masked) to certificate
- [ ] Add witness confirmation timestamp

---

## Phase 4: Remove Server-Side Image Storage

**⚠️ HIGH RISK — Only after Phase 2 is stable**

### 4.1 Verify Dual-Write is Working
- [ ] All new marks have thumbnails in IndexedDB
- [ ] All new marks have hash-only records in Supabase
- [ ] Wall displays correctly from IndexedDB

### 4.2 Update Storage Provider
- [ ] Modify `src/lib/abstractions/storage.ts`
- [ ] `uploadImage()` → returns hash only, no upload
- [ ] `createPage()` → no longer includes `image_url`

### 4.3 Handle Legacy Pages
- [ ] Pages with `image_url` continue to work (display from Supabase)
- [ ] No migration of existing images (they stay where they are)
- [ ] New pages have no `image_url`

### 4.4 Optional: Archive and Delete Bucket
- [ ] Create backup of `page-images` bucket
- [ ] After verification period (30 days), delete bucket
- [ ] Update storage policies

---

## Phase 5: Table Rename (Optional)

**Goal:** Rename `pages` → `origin_attestations` for clarity

### 5.1 Assess Impact
- [ ] Search codebase for all `pages` references
- [ ] Estimate effort for rename

### 5.2 Decision Point
This rename affects:
- All RLS policies
- All edge functions
- All frontend queries
- TypeScript types

**Recommendation:** Defer until after Phase 4 is stable. The benefit is semantic clarity; the cost is significant refactoring.

---

## Phase 6: Enhanced Error Handling & Offline

### 6.1 Service Worker for Offline
- [ ] Create `src/sw.ts` — service worker
- [ ] Queue failed POSTs in IndexedDB
- [ ] Sync when online (Background Sync API)

### 6.2 Error States (per briefing section 17.1)
- [ ] Hashing fails: "This file couldn't be sealed. Try another."
- [ ] POST fails (offline): "sealed · waiting to sync"
- [ ] POST fails (server): "Sealed locally. We'll sync when our servers are back."
- [ ] IndexedDB blocked: "Your Wall needs browser storage. Open in normal mode."

---

## Implementation Order

```
Phase 0 (Prep)          ←── Safe, no breaking changes
    ↓
Phase 1 (Auth)          ←── Additive, preserves anon access
    ↓
Phase 2 (IndexedDB)     ←── Dual-write period (parallel storage)
    ↓
Phase 3 (Witness)       ←── New feature, independent
    ↓
Phase 4 (Remove images) ←── Only after Phase 2 stable
    ↓
Phase 5 (Rename)        ←── Optional, defer
    ↓
Phase 6 (Offline)       ←── Polish
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Dual-write ensures both systems have data |
| Users lose IndexedDB | Backup-nudge (implemented), certificate export |
| Auth breaks existing users | Anonymous fallback preserved |
| Witness spam | Rate limit witness invites per origin |
| Legacy pages inaccessible | image_url remains functional for existing pages |

---

## Rollback Plan

Each phase can be rolled back independently:

- **Phase 1:** Disable auth requirement, revert to device_user_id only
- **Phase 2:** Continue using Supabase images (dual-write means both exist)
- **Phase 3:** Hide witness UI, table can remain
- **Phase 4:** Re-enable image uploads if needed

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 0 | 1-2 days | None |
| Phase 1 | 3-4 days | Phase 0 |
| Phase 2 | 3-4 days | Phase 0 |
| Phase 3 | 2-3 days | Phase 1 |
| Phase 4 | 1-2 days | Phase 2 stable (wait 1+ week) |
| Phase 5 | 2-3 days | Phase 4 |
| Phase 6 | 2-3 days | Phase 2 |

**Total:** ~2-3 weeks for core implementation

---

## Files to Preserve (Not Delete)

Per memory constraint, these files must remain even if hidden from Ritual UI:

- `src/components/codex/HistoryView.tsx`
- `src/components/codex/SearchView.tsx`
- `src/components/codex/VaultView.tsx`
- `src/components/codex/CapsuleCarouselView.tsx`
- `src/components/codex/InsightsSection.tsx`
- `src/components/codex/PatternsView.tsx`
- `src/components/codex/PersonalityView.tsx`
- `src/lib/exportService.ts`
- `src/lib/pageService.ts`
- All existing hooks in `src/hooks/`

---

## Success Criteria

- [ ] User can create a mark without any image data reaching Supabase
- [ ] Wall of Existence displays thumbnails from IndexedDB
- [ ] Wall gracefully degrades to hash+date when IndexedDB is cleared
- [ ] Certificate can be exported with thumbnail embedded
- [ ] Witness can confirm a mark via link
- [ ] OTS proofs sync correctly to IndexedDB
- [ ] Existing pages (with image_url) continue to display
- [ ] All existing Codex features remain functional
