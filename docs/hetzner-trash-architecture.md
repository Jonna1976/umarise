# HETZNER-NATIVE TRASH ARCHITECTURE

**Status:** ✅ Production (January 2026)  
**Last Verified:** 2026-01-22

---

## 🎯 SUMMARY

All trash operations are **100% Hetzner-native**. The Lovable Cloud `page_trash` table is **frozen legacy data** and is not used for any active operations.

---

## ✅ GUARANTEES

| Guarantee | Status | Implementation |
|-----------|--------|----------------|
| New trash operations → Hetzner | ✅ Enforced | `HetznerVaultStorage.moveToTrash()` |
| Trash retrieval → Hetzner | ✅ Enforced | `HetznerVaultStorage.getTrashedPages()` |
| Restore operations → Hetzner | ✅ Enforced | `HetznerVaultStorage.restoreFromTrash()` |
| Lovable Cloud page_trash → NOT USED | ✅ Frozen | Legacy audit artifact only |

---

## 🏗️ ARCHITECTURE

### Data Flow (Current)

```
User drags page to trash
        ↓
useTrash.moveToTrash()
        ↓
pageService.moveToTrash()
        ↓
getStorageProvider() → HetznerVaultStorage
        ↓
PATCH /vault/pages/:id { is_trashed: true, trashed_at: ISO }
        ↓
Hetzner Codex Service (SQLite)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useTrash.ts` | React hook for trash UI state (Hetzner-only) |
| `src/lib/pageService.ts` | Trash operations via abstraction layer |
| `src/lib/abstractions/storage.ts` | `HetznerVaultStorage.moveToTrash/restoreFromTrash/getTrashedPages` |
| `supabase/functions/hetzner-storage-proxy/index.ts` | Edge proxy (no data stored) |

---

## 🚫 LOVABLE CLOUD TRASH (DEPRECATED)

### Legacy Table: `page_trash`

```sql
-- This table is NOT USED for active operations
-- Contains only legacy data from before Hetzner migration (pre-January 2026)
-- Kept for audit purposes only

CREATE TABLE public.page_trash (
  id UUID PRIMARY KEY,
  page_id UUID NOT NULL,
  device_user_id TEXT NOT NULL,
  trashed_at TIMESTAMPTZ DEFAULT now(),
  restored_at TIMESTAMPTZ,
  backend_provider TEXT DEFAULT 'lovable'
);
```

### Why Frozen?

1. **Data Sovereignty**: All user data must reside on Hetzner (Germany)
2. **Single Source of Truth**: Prevents sync conflicts between backends
3. **Audit Trail**: Legacy data preserved for historical reference
4. **Clean Architecture**: No dual-write complexity

### Legacy Data Count

As of 2026-01-22:
- Lovable Cloud `page_trash`: **0 rows** (cleaned up)
- Hetzner trash: **Active** (all new operations)

---

## 🔧 HETZNER TRASH FIELDS

The Hetzner Codex Service uses these fields in the `pages` table:

```python
# /opt/codex-storage/app.py - SQLite schema
pages (
  id TEXT PRIMARY KEY,
  device_user_id TEXT,
  is_trashed BOOLEAN DEFAULT FALSE,  # ← Trash flag
  trashed_at TEXT,                    # ← ISO timestamp
  ...
)
```

### API Contract

**Move to Trash:**
```http
PATCH /vault/pages/:id
Content-Type: application/json
Authorization: Bearer vault_lovable_...

{
  "deviceUserId": "uuid",
  "is_trashed": true,
  "trashed_at": "2026-01-21T14:30:00.000Z"
}
```

**Restore from Trash:**
```http
PATCH /vault/pages/:id
Content-Type: application/json
Authorization: Bearer vault_lovable_...

{
  "deviceUserId": "uuid",
  "is_trashed": false,
  "trashed_at": null
}
```

**Get Trashed Pages:**
```http
GET /vault/pages?deviceUserId=uuid&is_trashed=true
Authorization: Bearer vault_lovable_...
```

---

## 🧹 CLEANUP STATUS

✅ **Completed 2026-01-22**: All legacy rows deleted from Lovable Cloud `page_trash`.

The table is now empty, confirming 100% Hetzner-native trash architecture.

---

## ✅ VERIFICATION

### Code Verification

1. `useTrash.ts` imports only from `pageService.ts` (no Supabase)
2. `pageService.ts` trash operations call `getStorageProvider()`
3. `getStorageProvider()` returns `HetznerVaultStorage` (hardcoded)
4. `HetznerVaultStorage` makes requests to Hetzner proxy only

### Runtime Verification

```bash
# Check Lovable Cloud page_trash (should not increase)
SELECT COUNT(*) FROM page_trash;

# Check Hetzner trash via curl
curl -X POST https://vault.umarise.com/api/codex/pages \
  -H "Authorization: Bearer vault_lovable_..." \
  -H "Content-Type: application/json" \
  -d '{"deviceUserId":"test","is_trashed":true}'
```

---

## 📚 RELATED DOCUMENTATION

- `docs/architecture-v1-technical.md` - Full system architecture
- `docs/hetzner-master-reference.md` - Hetzner infrastructure reference
- `docs/security-signoff-pilot-2026-01-20.md` - Security certification

---

## 📅 VERSION HISTORY

| Date | Change |
|------|--------|
| 2026-01-21 | Initial documentation of Hetzner-native trash guarantee |
| 2026-01-21 | Verified Lovable Cloud page_trash frozen (2 legacy rows) |
| 2026-01-22 | Deleted legacy rows — Lovable Cloud page_trash now 0 rows |
