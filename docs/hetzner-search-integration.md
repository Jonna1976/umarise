# Hetzner Search Integration - Bevestigd Werkend

## Status: ✅ 100% Operationeel
Getest en bevestigd op 2026-01-03

---

## Endpoint Details

### Search Endpoint
```
POST https://vault.umarise.com/api/codex/ai/search
```

### Headers
```
Authorization: Bearer {HETZNER_API_TOKEN}
Content-Type: application/json
```

---

## Request Format

```json
{
  "query": "love",
  "deviceUserId": "device-123",
  "limit": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ | Zoekterm |
| `deviceUserId` | string | ✅ | Device identifier |
| `limit` | number | ❌ | Max results (default: 10) |

---

## Response Format

```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "id": "page-uuid-here",
      "matchType": "content",
      "ocrText": "I love this idea...",
      "score": 0.8,
      "summary": "Page summary here"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `count` | number | Number of results |
| `results[].id` | string | Page UUID |
| `results[].matchType` | string | Type of match (content, keyword, etc.) |
| `results[].ocrText` | string | Original OCR text |
| `results[].score` | number | Relevance score (0-1) |
| `results[].summary` | string | Page summary |

---

## Frontend Mapping

De `HetznerAIProvider.searchPages()` method mapt het backend response naar het frontend formaat:

| Backend | Frontend |
|---------|----------|
| `id` | `pageId` |
| `matchType` (string) | `matchTypes` (array) |
| `score` | `score` |
| - | `matchedTerms` (query als fallback) |

```typescript
// Backend response
{ id: "uuid", matchType: "content", score: 0.8 }

// Frontend format
{ pageId: "uuid", matchTypes: ["content"], score: 0.8, matchedTerms: ["love"] }
```

---

## Proxy Routing

De `hetzner-ai-proxy` Edge Function routeert requests naar de juiste service:

| Endpoint | Route | Doel |
|----------|-------|------|
| `/ai/search` | `/api/codex/ai/search` | Semantic search |
| Overige AI endpoints | `/api/vision/*` | OCR, patterns, personality |

---

## Test Resultaten

### Query: "love"
```json
{
  "success": true,
  "count": 1,
  "results": [{ "id": "...", "matchType": "content", "score": 0.8 }]
}
```

### Query: "frustration"
```json
{
  "success": true,
  "count": 1,
  "results": [{ "id": "...", "matchType": "content", "score": 0.8 }]
}
```

---

## Gerelateerde Files

| File | Purpose |
|------|---------|
| `src/lib/abstractions/ai.ts` | HetznerAIProvider met searchPages() |
| `supabase/functions/hetzner-ai-proxy/index.ts` | Proxy met service routing |
| `docs/hetzner-quick-reference.md` | API overzicht |
| `docs/hetzner-integration-contract.md` | Volledige API specificatie |

---

## Pilot Status

✅ **Capture flow**: foto → POST /api/vision/vault/images → OCR → Codex opslag  
✅ **Search flow**: POST /api/codex/ai/search → resultaten  
✅ **Data soevereiniteit**: 100% Hetzner (Duitsland)  
✅ **MKB Pilot**: Ready
