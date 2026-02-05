# Umarise v4 Implementation Plan

**Status:** Phase 0-3 Implemented  
**Created:** 2026-02-05  
**Reference:** docs/complete-briefing-v4.md  
**Language:** English (all UI strings must be English)

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
| BackupNudge component | `src/components/prototype/components/BackupNudge.tsx` | ✅ Created |
| useMarkCount hook | `src/hooks/useMarkCount.ts` | ✅ Created |

### What Needs to Change (v4)

| Change | Type | Risk |
|--------|------|------|
| Add Supabase Auth (Magic Link) | Add | Low — additive |
| Add IndexedDB thumbnail storage | Add | Low — additive |
| Remove server-side image storage | Remove | **HIGH** — data loss risk |
| Add `witnesses` table | Add | Low |
| Add device fingerprint generation | Add | Low |
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
- [ ] **Email masking:** Display email as `m***r@email.com` format in certificate
- [ ] Test certificate generation in isolation

### 0.3 Create Dual-Write Infrastructure
- [ ] Create abstraction that writes to BOTH Supabase AND IndexedDB
- [ ] This allows gradual migration without data loss

### 0.4 Device Fingerprint Generation
- [ ] Create `src/lib/deviceFingerprint.ts`
- [ ] Collect: `navigator.userAgent`, `screen.width`, `screen.height`, `navigator.language`, `timezone`
- [ ] Generate SHA-256 hash of concatenated values
- [ ] Store as `device_fingerprint_hash` — never the raw fingerprint

### 0.5 Origin ID Generation
- [ ] Create `src/lib/originId.ts`
- [ ] Use `crypto.getRandomValues()` to generate 8 hex characters
- [ ] Format: `um-XXXXXXXX` (e.g., `um-a7f3b2c1`)
- [ ] Collision handling: retry up to 3 times if collision detected

### 0.6 Integrate Backup Nudge
- [ ] Wire `incrementMarkCount()` into the mark creation flow (ReleaseScreen or mark service)
- [ ] Configure nudge to appear after 3rd mark, repeat hint at 10th mark
- [ ] One-time per threshold (localStorage flags)

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
- [ ] **Confirmation screen:** Show preview of marks to be claimed before confirming
- [ ] UI prompt: "We found X marks from this device. Link them to your account?"
- [ ] Handle shared device case: user sees the marks and explicitly confirms

### 1.5 Update Database Schema
```sql
-- Add user_id to pages (nullable initially for migration)
ALTER TABLE pages ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add device_fingerprint_hash (for forensic linking, not auth)
ALTER TABLE pages ADD COLUMN device_fingerprint_hash TEXT;

-- Create index
CREATE INDEX idx_pages_user_id ON pages(user_id);
```

### 1.6 Update RLS Policies
```sql
-- SECURE: Users can only see their own pages via authenticated user_id
-- No fallback to device_user_id in RLS — that's handled by migration only
CREATE POLICY "Users read own pages via user_id"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

-- Legacy access: device_user_id check remains for non-authenticated reads
-- This is the EXISTING policy — keep it for backward compatibility during migration
-- Once migration complete, this policy can be deprecated
```

**Note:** The original plan had an insecure JWT claim check. Removed. Device-based access
is only for legacy pages before auth migration, not as a parallel auth path.

### 1.7 Preserve Anonymous Access (Read-Only)
- [ ] Existing `device_user_id` logic remains as fallback for viewing legacy marks
- [ ] Mark creation requires auth (email verified)
- [ ] Server-side validation: no JWT claim manipulation possible

---

## Phase 2: IndexedDB Thumbnails

**Goal:** Store thumbnails locally, stop sending images to server

### 2.1 Implement Thumbnail Generation
- [ ] Create `src/lib/thumbnailService.ts`
- [ ] Generate ~400px max dimension, JPEG 70%
- [ ] Target size: <50KB per thumbnail
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

### 2.3 Update Wall of Existence (Dual-Source)
- [ ] **Primary:** Source thumbnails from IndexedDB
- [ ] **Fallback:** Check Supabase `image_url` for legacy pages (pre-v4)
- [ ] **Final fallback:** Show origin_id + date if neither available
- [ ] UI must handle mixed sources gracefully — no visual difference to user

### 2.4 Implement Sync Logic
- [ ] On app open: fetch new OTS proofs from Supabase
- [ ] Update IndexedDB with `ots_status: "anchored"` and `ots_proof` blob
- [ ] Queue offline marks in IndexedDB with `sync_status: "queued"`

---

## Phase 3: Witness Feature

**Goal:** Allow users to invite witnesses to strengthen proof

### 3.1 Create Witnesses Table
```sql
-- Note: References pages.id, not origin_attestations (that rename is optional/later)
CREATE TABLE witnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) NOT NULL,
  witness_email TEXT NOT NULL,
  witness_confirmed_at TIMESTAMPTZ,
  confirmation_hash TEXT,
  verification_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  ots_status TEXT DEFAULT 'pending',
  ots_proof BYTEA,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;

-- Makers can see witnesses for their marks (via user_id on pages)
CREATE POLICY "Makers see own witnesses"
  ON witnesses FOR SELECT
  USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));

-- Public can confirm via valid, non-expired token
CREATE POLICY "Anyone confirms via token"
  ON witnesses FOR UPDATE
  USING (
    verification_token IS NOT NULL 
    AND token_expires_at > now()
  );
```

### 3.2 Create Witness Invite Flow
- [ ] Add "add a witness" prompt to Release screen (post-cascade)
- [ ] Generate unique verification token (UUID)
- [ ] Token expires after 7 days (`token_expires_at`)
- [ ] Share via native share sheet with pre-composed text:
  ```
  I've sealed a moment in time and want you as witness.
  Tap to confirm you saw this: [link]
  (I'll send the image separately)
  ```
- [ ] User shares thumbnail separately via WhatsApp/Signal (not in link)

### 3.3 Create Witness Confirmation Page
- [ ] Route: `/witness/:token`
- [ ] Check token validity and expiry
- [ ] Display: origin_id, date, hash (NO thumbnail — privacy)
- [ ] Input: witness email
- [ ] Button: "I confirm I saw this"
- [ ] On confirm: 
  - Set `witness_confirmed_at`
  - Generate `confirmation_hash` (SHA-256 of email + timestamp)
  - Send confirmation email to witness

### 3.4 Update Certificate to Include Witness
- [ ] If witness confirmed: add witness section to certificate
- [ ] Email displayed as masked: `j***n@example.com`
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

### 4.3 Handle Legacy Pages (Dual-Source in Wall)
- [ ] Pages with `image_url` continue to work (display from Supabase)
- [ ] Wall component checks:
  1. IndexedDB for thumbnail (new marks)
  2. Supabase `image_url` (legacy marks)
  3. Hash + date fallback (both empty)
- [ ] No migration of existing images — they stay in `page-images` bucket
- [ ] New pages have no `image_url` field populated

### 4.4 Optional: Archive and Delete Bucket
- [ ] Create backup of `page-images` bucket
- [ ] After verification period (30 days), delete bucket
- [ ] Update storage policies

---

## Phase 5: Table Rename (Optional — Deferred)

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

**Recommendation:** Defer indefinitely. The benefit is semantic clarity; the cost is significant refactoring. The `origin_attestations` table already exists for Core layer — no need to rename `pages`.

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
Phase 5 (Rename)        ←── DEFERRED — not needed
    ↓
Phase 6 (Offline)       ←── Polish
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Dual-write ensures both systems have data |
| Users lose IndexedDB | Backup-nudge (Phase 0.6), certificate export |
| Auth breaks existing users | Anonymous fallback preserved for legacy viewing |
| Witness spam | Rate limit witness invites per origin |
| Legacy pages inaccessible | Dual-source Wall (Phase 4.3) |
| Witness token abuse | 7-day expiry (Phase 3.1) |
| Shared device claims wrong pages | Confirmation preview screen (Phase 1.4) |

---

## Rollback Plan

Each phase can be rolled back independently:

- **Phase 0:** No rollback needed (purely additive)
- **Phase 1:** Disable auth requirement, revert to device_user_id only
- **Phase 2:** Continue using Supabase images (dual-write means both exist)
- **Phase 3:** Hide witness UI, table can remain
- **Phase 4:** Re-enable image uploads if needed

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 0 | 2-3 days | None |
| Phase 1 | 3-4 days | Phase 0 |
| Phase 2 | 3-4 days | Phase 0 |
| Phase 3 | 2-3 days | Phase 1 |
| Phase 4 | 1-2 days | Phase 2 stable (wait 1+ week) |
| Phase 5 | DEFERRED | — |
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
- [ ] Wall gracefully falls back to Supabase image_url for legacy pages
- [ ] Wall shows hash+date when IndexedDB is cleared (no crash)
- [ ] Certificate can be exported with thumbnail embedded
- [ ] Certificate shows masked email (`m***r@example.com`)
- [ ] Witness can confirm a mark via link (within 7 days)
- [ ] Expired witness tokens are rejected
- [ ] OTS proofs sync correctly to IndexedDB
- [ ] Existing pages (with image_url) continue to display
- [ ] All existing Codex features remain functional
- [ ] Backup nudge appears after 3rd mark, hint at 10th
- [ ] All UI strings are in English
