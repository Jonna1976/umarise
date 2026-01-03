# Umarise Architecture v1 — MKB Pilot (January 2026)

**Status:** ✅ Production Operational  
**Server:** 94.130.180.233 (Falkenstein, Germany)  
**Endpoint:** https://vault.umarise.com

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    PWA (React + Vite)                             │  │
│  │  • Camera capture                                                 │  │
│  │  • Timeline view                                                  │  │
│  │  • Search interface                                               │  │
│  │  • Add to homescreen                                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                      │
│            localStorage: device_user_id (UUID)                          │
│            Optional: Private Vault key (AES-256-GCM)                    │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    HETZNER SERVER (Germany)                             │
│                    94.130.180.233                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                 NGINX GATEWAY (Port 443)                          │  │
│  │  • SSL termination (Let's Encrypt)                                │  │
│  │  • Path-based routing                                             │  │
│  │  • Bearer token forwarding                                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                    │              │              │                      │
│         ┌─────────┴───┐   ┌──────┴──────┐   ┌───┴─────────┐            │
│         ▼             │   ▼             │   ▼             │            │
│  ┌─────────────┐      │   ┌─────────────┐   ┌─────────────┐            │
│  │  DataVault  │      │   │   Vision    │   │   Codex     │            │
│  │  Port 3340  │      │   │  Port 3341  │   │  Port 3342  │            │
│  │  (Docker)   │      │   │  (Python)   │   │  (Python)   │            │
│  │             │      │   │             │   │             │            │
│  │ Image Upload│      │   │ OCR + AI    │   │ Storage +   │            │
│  │ Gateway     │      │   │ (Gemini 2.5)│   │ Search      │            │
│  └──────┬──────┘      │   └─────────────┘   └──────┬──────┘            │
│         │             │                            │                    │
│         ▼             │                            ▼                    │
│  ┌─────────────┐      │                     ┌─────────────┐            │
│  │    IPFS     │      │                     │   SQLite    │            │
│  │  Port 5001  │      │                     │   + FTS5    │            │
│  │  (Docker)   │      │                     │  codex.db   │            │
│  │             │      │                     │   (57KB)    │            │
│  │ Image Store │      │                     └─────────────┘            │
│  │ ipfs://Qm...│      │                            │                    │
│  └─────────────┘      │                            ▼                    │
│                       │                     ┌─────────────┐            │
│                       │                     │   Backups   │            │
│                       │                     │ /opt/backups│            │
│                       │                     │ Daily 03:00 │            │
│                       │                     └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Capture

```
1. User         →  Take photo
2. PWA          →  Convert to base64
3. PWA          →  POST /api/vision/vault/images
                   + Bearer token
                   + deviceUserId
4. Nginx        →  Route to DataVault :3340
5. DataVault    →  Upload to IPFS
6. IPFS         →  Return ipfs://Qm...
7. DataVault    →  Return imageUrl
8. PWA          →  POST /api/vision/ai/analyze
9. Vision       →  OCR via Gemini 2.5 Flash
10. Vision      →  Return {ocrText, summary, keywords, tone}
11. PWA         →  POST /api/codex/vault/pages
12. Codex       →  INSERT into SQLite
13. Codex       →  Return {id, createdAt}
14. PWA         →  ✅ Show in timeline
```

---

## Data Flow: Search

```
1. User         →  Type query: "budget"
2. PWA          →  POST /api/codex/ai/search
                   + Bearer token
                   + {query, deviceUserId, limit}
3. Nginx        →  Route to Codex :3342
4. Codex        →  Validate token
5. Codex        →  FTS5 query on pages
                   WHERE device_user_id = ?
                   AND (ocr_text MATCH ? OR summary LIKE ?)
6. SQLite       →  Return matching rows
7. Codex        →  Format {id, summary, ocrText, matchType, score}
8. PWA          →  Display original scan + metadata
9. User         →  ✅ Found in <60 seconds
```

---

## Component Details

### Frontend (PWA)

| Feature | Status | Notes |
|---------|--------|-------|
| Camera capture | ✅ | Direct browser access |
| Timeline view | ✅ | Chronological page display |
| Search | ✅ | Full-text across OCR, summary, keywords |
| Add to homescreen | ✅ | PWA manifest |
| Offline mode | ❌ | Requires internet |

### Backend Services

| Service | Port | Type | Purpose |
|---------|------|------|---------|
| Nginx | 443 | Gateway | SSL + routing |
| DataVault | 3340 | Node.js/Docker | Image upload to IPFS |
| Vision | 3341 | Python/Flask | OCR + AI analysis |
| Codex | 3342 | Python/Flask | Storage + search |
| IPFS | 5001 | Go/Docker | Distributed image storage |

### Data Storage

| Type | Location | Purpose |
|------|----------|---------|
| Images | IPFS (ipfs://Qm...) | Original scans |
| Metadata | SQLite codex.db | OCR, summary, keywords, etc. |
| Search Index | SQLite FTS5 | Full-text search |
| Backups | /opt/backups/ | Daily 03:00 automated |

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Method: Bearer Token                                               │
│  Token:  vault_lovable_f4664ab12e634b2341331bf0e6c20c5e351e...     │
│  Scope:  All API endpoints (except /health)                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    DATA ISOLATION                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Method: device_user_id (UUID per device)                          │
│  Scope:  All queries filtered by device_user_id                    │
│  Effect: Complete data separation between devices                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    OPTIONAL: PRIVATE VAULT                          │
├─────────────────────────────────────────────────────────────────────┤
│  Method: Client-side AES-256-GCM encryption                        │
│  Key:    Stored locally in browser (user responsibility)           │
│  Effect: Images encrypted before upload (we can't read them)       │
│  Risk:   Key loss = permanent data loss                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What's NOT in v1 (Honest List)

| Feature | Status | Notes |
|---------|--------|-------|
| User accounts | ❌ | Anonymous device_user_id only |
| Login/signup | ❌ | No authentication UI |
| Sharing | ❌ | Each user completely isolated |
| Conversational AI | ❌ | AI does OCR/summary, not chat |
| Voice interface | ❌ | Not implemented |
| Offline mode | ❌ | Requires internet |
| Local AI | ❌ | All AI runs on server (Gemini) |
| Load balancing | ❌ | Single server |
| Multi-region | ❌ | Germany only |
| Mobile app | ❌ | PWA only |

---

## Pilot Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search Resolution Rate | ≥80% | Original scan in top-5 |
| Time to Find | <60 seconds | From query to found |
| Match Transparency | 100% | Visible match reason |
| Original First | 100% | Scan shown, not AI summary |

---

## Quick Reference

### API Endpoints

```bash
# Image Upload
POST https://vault.umarise.com/api/vision/vault/images
Authorization: Bearer vault_lovable_...

# AI Analysis
POST https://vault.umarise.com/api/vision/ai/analyze
Authorization: Bearer vault_lovable_...

# Search
POST https://vault.umarise.com/api/codex/ai/search
Authorization: Bearer vault_lovable_...
```

### Health Checks

```bash
curl http://localhost:3341/health  # Vision
curl http://localhost:3342/health  # Codex
curl http://localhost:3340/health  # DataVault
```

---

## Architecture Principles (v1)

1. **Original = Truth** — The scan is the source, AI is metadata
2. **Explainable Search** — Every result shows WHY it matched
3. **Data Sovereignty** — All data stays in Germany (Hetzner)
4. **Privacy by Default** — No login, anonymous device ID
5. **Simplicity** — Capture in 2 taps, find in 60 seconds

---

*This document represents the actual production state as of January 3, 2026.*
*For future vision (edge/local/offline), see architecture-v2-vision.md*
