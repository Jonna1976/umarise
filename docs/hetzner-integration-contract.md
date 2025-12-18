# Umarise Hetzner Backend Integration Contract

> **Purpose**: This document defines the complete API contract between the Lovable frontend and Hetzner backend services. Use this to implement compatible endpoints.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOVABLE FRONTEND (React)                     │
│                                                                  │
│  src/lib/abstractions/index.ts                                  │
│  ├── getStorageProvider() → IStorageProvider                    │
│  └── getAIProvider() → IAIProvider                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ VITE_BACKEND_PROVIDER=hetzner
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HETZNER BACKEND SERVICES                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Vault API    │  │ Vision API   │  │ AI API       │          │
│  │ :3334        │  │ :3340        │  │ :3337        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ IPFS         │  │ Encryption   │  │ Ollama       │          │
│  │ :5001        │  │ :3333        │  │ :11434       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

Frontend switches backend via environment variable:

```env
# .env for Hetzner backend
VITE_BACKEND_PROVIDER=hetzner
VITE_HETZNER_API_URL=https://api.umarise.hetzner.example
VITE_HETZNER_VAULT_ENDPOINT=https://vault.umarise.hetzner.example
VITE_HETZNER_AI_ENDPOINT=https://ai.umarise.hetzner.example
VITE_HETZNER_IPFS_GATEWAY=https://ipfs.umarise.hetzner.example
```

---

## 1. Storage Provider Interface (IStorageProvider)

### 1.1 Upload Image

**Endpoint**: `POST /vault/images`

**Request**:
```json
{
  "imageDataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "encrypt": true
}
```

**Response** (Success - 201):
```json
{
  "imageUrl": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "encrypted": true,
  "thumbnailUrl": "ipfs://QmThumbnailHash123..."
}
```

**Notes**:
- If `encrypt: true`, image is AES-256-GCM encrypted before IPFS storage
- Encryption key is derived from device-specific key stored in Vault
- Return IPFS CID as URL, frontend will use IPFS gateway to fetch

---

### 1.2 Delete Image

**Endpoint**: `DELETE /vault/images`

**Request**:
```json
{
  "imageUrl": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "unpinned": true
}
```

---

### 1.3 Get Decrypted Image

**Endpoint**: `GET /vault/images/decrypt`

**Query Params**: `?url=ipfs://Qm...&deviceUserId=550e8400-...`

**Response** (Success - 200):
```json
{
  "decryptedDataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

---

### 1.4 Create Page

**Endpoint**: `POST /vault/pages`

**Request**:
```json
{
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "writerUserId": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "thumbnailUri": "ipfs://QmThumbnailHash...",
  "ocrText": "Meeting notes from yesterday...",
  "ocrTokens": [
    { "token": "Meeting", "confidence": 0.95, "bbox": { "x": 10, "y": 20, "width": 80, "height": 25 } },
    { "token": "notes", "confidence": 0.92, "bbox": { "x": 95, "y": 20, "width": 50, "height": 25 } }
  ],
  "namedEntities": [
    { "type": "person", "value": "Marco", "confidence": 0.88, "span": { "start": 45, "end": 50 } },
    { "type": "date", "value": "yesterday", "confidence": 0.95, "span": { "start": 18, "end": 27 } }
  ],
  "summary": "Notes from a meeting discussing project funding timeline and next steps with Marco.",
  "oneLineHint": "Funding meeting with Marco",
  "tone": ["focused", "optimistic"],
  "keywords": ["funding", "timeline", "Marco", "project"],
  "topicLabels": ["Business", "Meetings"],
  "primaryKeyword": "funding",
  "futureYouCues": ["Marco meeting", "funding timeline", "project next steps"],
  "futureYouCuesSource": {
    "ai_prefill_version": "gemini-2.5-flash",
    "user_edited": false
  },
  "highlights": ["Need to follow up with Marco by Friday"],
  "confidenceScore": 0.91,
  "capsuleId": null,
  "pageOrder": null,
  "projectId": null,
  "sessionId": "session-uuid-here",
  "captureBatchId": "batch-uuid-here",
  "writtenAt": "2025-12-15T10:30:00Z"
}
```

**Response** (Success - 201):
```json
{
  "id": "page-uuid-here",
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "writerUserId": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "ocrText": "Meeting notes from yesterday...",
  "summary": "Notes from a meeting discussing project funding timeline...",
  "tone": ["focused", "optimistic"],
  "keywords": ["funding", "timeline", "Marco", "project"],
  "futureYouCues": ["Marco meeting", "funding timeline", "project next steps"],
  "createdAt": "2025-12-18T14:30:00Z",
  "updatedAt": "2025-12-18T14:30:00Z"
}
```

---

### 1.5 Get All Pages

**Endpoint**: `GET /vault/pages`

**Query Params**: `?deviceUserId=550e8400-...`

**Response** (Success - 200):
```json
{
  "pages": [
    {
      "id": "page-uuid-1",
      "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
      "writerUserId": "550e8400-e29b-41d4-a716-446655440000",
      "imageUrl": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      "thumbnailUri": "ipfs://QmThumb...",
      "ocrText": "Meeting notes from yesterday...",
      "ocrTokens": [],
      "namedEntities": [],
      "summary": "Notes from a meeting...",
      "oneLineHint": "Funding meeting with Marco",
      "tone": ["focused", "optimistic"],
      "keywords": ["funding", "timeline", "Marco"],
      "topicLabels": ["Business"],
      "primaryKeyword": "funding",
      "futureYouCues": ["Marco meeting", "funding timeline", "project next steps"],
      "futureYouCuesSource": { "ai_prefill_version": "gemini-2.5-flash", "user_edited": false },
      "highlights": ["Need to follow up with Marco by Friday"],
      "confidenceScore": 0.91,
      "capsuleId": null,
      "pageOrder": null,
      "projectId": null,
      "createdAt": "2025-12-18T14:30:00Z",
      "updatedAt": "2025-12-18T14:30:00Z"
    }
  ],
  "total": 1
}
```

---

### 1.6 Get Single Page

**Endpoint**: `GET /vault/pages/:id`

**Query Params**: `?deviceUserId=550e8400-...`

**Response**: Same as single page object above

---

### 1.7 Update Page

**Endpoint**: `PATCH /vault/pages/:id`

**Request**:
```json
{
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updates": {
    "summary": "Updated summary text",
    "futureYouCues": ["new cue 1", "new cue 2", "new cue 3"],
    "futureYouCuesSource": {
      "ai_prefill_version": "gemini-2.5-flash",
      "user_edited": true
    },
    "userNote": "My personal note about this page"
  }
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "updatedAt": "2025-12-18T15:00:00Z"
}
```

---

### 1.8 Delete Page

**Endpoint**: `DELETE /vault/pages/:id`

**Request**:
```json
{
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "imageDeleted": true
}
```

---

### 1.9 Check Duplicate

**Endpoint**: `POST /vault/pages/check-duplicate`

**Request**:
```json
{
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "ocrText": "Meeting notes from yesterday...",
  "excludePageId": "page-uuid-to-exclude"
}
```

**Response** (No duplicate - 200):
```json
{
  "duplicate": null
}
```

**Response** (Duplicate found - 200):
```json
{
  "duplicate": {
    "id": "existing-page-uuid",
    "summary": "Existing page summary...",
    "createdAt": "2025-12-10T10:00:00Z"
  }
}
```

---

### 1.10 Get Projects

**Endpoint**: `GET /vault/projects`

**Query Params**: `?deviceUserId=550e8400-...`

**Response** (Success - 200):
```json
{
  "projects": [
    {
      "id": "project-uuid",
      "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Funding Round",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

### 1.11 Create Project

**Endpoint**: `POST /vault/projects`

**Request**:
```json
{
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Project Name"
}
```

**Response** (Success - 201):
```json
{
  "id": "new-project-uuid",
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Project Name",
  "createdAt": "2025-12-18T14:00:00Z"
}
```

---

## 2. AI Provider Interface (IAIProvider)

### 2.1 Analyze Page (OCR + Metadata Extraction)

**Endpoint**: `POST /ai/analyze-page`

**Request**:
```json
{
  "imageBase64": "/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

**Response** (Success - 200):
```json
{
  "ocr_text": "Meeting with Marco yesterday about the funding timeline. We discussed the next steps for the project and agreed to follow up by Friday. Key points:\n- Series A target: Q2 2025\n- Lead investor meetings scheduled\n- Due diligence prep needed",
  "ocr_tokens": [
    { "token": "Meeting", "confidence": 0.95 },
    { "token": "with", "confidence": 0.98 },
    { "token": "Marco", "confidence": 0.87 },
    { "token": "yesterday", "confidence": 0.92 }
  ],
  "named_entities": [
    { "type": "person", "value": "Marco", "confidence": 0.88, "span": { "start": 13, "end": 18 } },
    { "type": "date", "value": "yesterday", "confidence": 0.95, "span": { "start": 19, "end": 28 } },
    { "type": "date", "value": "Q2 2025", "confidence": 0.90, "span": { "start": 156, "end": 163 } },
    { "type": "deliverable", "value": "Due diligence prep", "confidence": 0.85, "span": { "start": 210, "end": 228 } }
  ],
  "summary": "Meeting notes discussing Series A funding timeline with Marco. Key decisions: target Q2 2025 for raise, schedule lead investor meetings, prepare due diligence materials. Follow-up deadline: Friday.",
  "one_line_hint": "Series A planning with Marco",
  "tone": "focused, optimistic",
  "keywords": ["funding", "Series A", "Marco", "investor", "due diligence", "Q2 2025"],
  "topic_labels": ["Business", "Fundraising"],
  "highlights": [
    "Series A target: Q2 2025",
    "Follow up by Friday",
    "Due diligence prep needed"
  ],
  "suggested_cues": ["Marco funding", "Series A timeline", "investor prep"]
}
```

**Implementation Notes**:
- Use local OCR (Tesseract or similar) for handwriting recognition
- Use Ollama with local LLM for metadata extraction
- `suggested_cues` are AI-generated retrieval hints (exactly 3)
- `tone` is comma-separated string of 1-2 emotion labels
- Confidence scores should be 0.0-1.0

---

### 2.2 Analyze Patterns

**Endpoint**: `POST /ai/analyze-patterns`

**Request**:
```json
{
  "pages": [
    {
      "summary": "Meeting notes discussing Series A funding...",
      "tone": "focused, optimistic",
      "keywords": ["funding", "Series A", "Marco"],
      "createdAt": "2025-12-18T14:30:00Z"
    },
    {
      "summary": "Reflections on the creative process...",
      "tone": "contemplative, inspired",
      "keywords": ["creativity", "writing", "flow"],
      "createdAt": "2025-12-17T10:00:00Z"
    }
  ]
}
```

**Response** (Success - 200):
```json
{
  "patterns": [
    {
      "theme": "Business & Strategy",
      "keywords": ["funding", "Series A", "investor", "timeline"],
      "frequency": 5
    },
    {
      "theme": "Creative Process",
      "keywords": ["creativity", "writing", "flow", "ideas"],
      "frequency": 3
    }
  ],
  "insights": [
    "Your writing shows a balance between strategic planning and creative exploration.",
    "Funding-related content appears most frequently in morning captures.",
    "Creative themes tend to emerge during evening writing sessions."
  ]
}
```

---

### 2.3 Analyze Personality

**Endpoint**: `POST /ai/analyze-personality`

**Request**:
```json
{
  "pages": [
    {
      "summary": "Meeting notes discussing Series A funding...",
      "tone": "focused, optimistic",
      "keywords": ["funding", "Series A", "Marco"],
      "createdAt": "2025-12-18T14:30:00Z"
    }
  ],
  "profileType": "voice"
}
```

**Response** (Success - 200):
```json
{
  "tagline": "The Strategic Dreamer",
  "core_identity": "You blend analytical thinking with creative vision, approaching challenges with both pragmatism and imagination.",
  "superpower": "Translating abstract ideas into actionable plans while maintaining the emotional core of your vision.",
  "growth_edge": "Balancing urgency with patience—learning when to push forward and when to let ideas mature.",
  "drivers": [
    { "name": "Impact", "strength": 0.85 },
    { "name": "Creativity", "strength": 0.78 },
    { "name": "Connection", "strength": 0.72 },
    { "name": "Growth", "strength": 0.68 },
    { "name": "Autonomy", "strength": 0.65 }
  ],
  "tension_field": {
    "pole1": "Structure",
    "pole2": "Flow",
    "position": 0.4
  }
}
```

**Notes**:
- `profileType` is either `"voice"` (writer's own content) or `"influence"` (content about external sources)
- `drivers` array should have 5 items with `strength` values 0.0-1.0
- `tension_field.position` is 0.0-1.0 (0 = fully pole1, 1 = fully pole2)

---

### 2.4 Generate Year Reflection

**Endpoint**: `POST /ai/generate-year-reflection`

**Request**:
```json
{
  "year": 2025,
  "pages": [
    {
      "summary": "Meeting notes discussing Series A funding...",
      "tone": "focused, optimistic",
      "keywords": ["funding", "Series A"],
      "createdAt": "2025-03-18T14:30:00Z"
    }
  ]
}
```

**Response** (Success - 200):
```json
{
  "year_theme": "The Year of Building",
  "core_insight": "2025 marked a shift from exploration to execution, with funding and strategic planning dominating your written thoughts.",
  "monthly_data": [
    { "month": 1, "dominant_tone": "hopeful", "highlight": "New year intentions", "page_count": 5 },
    { "month": 2, "dominant_tone": "focused", "highlight": "Project kickoff", "page_count": 8 },
    { "month": 3, "dominant_tone": "optimistic", "highlight": "Funding discussions", "page_count": 12 }
  ],
  "emotional_timeline": [
    { "month": 1, "tone": "hopeful", "intensity": 0.7 },
    { "month": 2, "tone": "focused", "intensity": 0.8 },
    { "month": 3, "tone": "optimistic", "intensity": 0.85 }
  ],
  "highlights": [
    "Started Series A preparation in March",
    "Most productive writing month: March (12 pages)",
    "Dominant theme: Business strategy and growth"
  ],
  "growth_observation": "Your writing evolved from broad ideation to focused execution throughout the year.",
  "top_keywords": ["funding", "project", "growth", "strategy", "team"]
}
```

---

### 2.5 Generate Recommendations

**Endpoint**: `POST /ai/generate-recommendations`

**Request**:
```json
{
  "personality": {
    "tagline": "The Strategic Dreamer",
    "core_identity": "You blend analytical thinking with creative vision...",
    "superpower": "Translating abstract ideas into actionable plans...",
    "growth_edge": "Balancing urgency with patience...",
    "drivers": [
      { "name": "Impact", "strength": 0.85 },
      { "name": "Creativity", "strength": 0.78 }
    ],
    "tension_field": { "pole1": "Structure", "pole2": "Flow", "position": 0.4 }
  }
}
```

**Response** (Success - 200):
```json
{
  "recommendations": [
    {
      "type": "book",
      "title": "The Artist's Way",
      "reason": "Aligns with your creative drive while providing the structure you seek."
    },
    {
      "type": "film",
      "title": "Jiro Dreams of Sushi",
      "reason": "Explores the balance between craft and vision that resonates with your tension field."
    },
    {
      "type": "article",
      "title": "The Importance of Strategic Patience",
      "reason": "Directly addresses your growth edge around balancing urgency with patience."
    }
  ]
}
```

---

## 3. Search Endpoint

### 3.1 Search Pages

**Endpoint**: `POST /ai/search`

**Request**:
```json
{
  "deviceUserId": "550e8400-e29b-41d4-a716-446655440000",
  "query": "Marco funding",
  "timeFilter": {
    "after": "2025-01-01T00:00:00Z",
    "before": "2025-12-31T23:59:59Z"
  },
  "limit": 10,
  "includeSemantic": true
}
```

**Response** (Success - 200):
```json
{
  "results": [
    {
      "page": {
        "id": "page-uuid-1",
        "summary": "Meeting notes discussing Series A funding with Marco...",
        "futureYouCues": ["Marco meeting", "funding timeline", "project next steps"],
        "ocrText": "Meeting with Marco yesterday about funding...",
        "namedEntities": [{ "type": "person", "value": "Marco", "confidence": 0.88 }],
        "createdAt": "2025-12-18T14:30:00Z"
      },
      "score": 0.95,
      "matchTypes": ["cue", "entity", "text"],
      "matchedTerms": ["Marco", "funding"]
    }
  ],
  "total": 1
}
```

**Match Types** (for explainability badges):
- `cue`: Matched on Future You Cue
- `text`: Matched on OCR text
- `entity`: Matched on named entity
- `meaning`: Matched via semantic/embedding similarity

**Ranking Priority** (highest to lowest):
1. Future You Cue matches (strongest boost)
2. Named entity matches
3. High-confidence OCR token matches
4. Semantic/embedding matches

---

## 4. Error Response Format

All endpoints should return errors in this format:

```json
{
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to upload image to IPFS",
    "details": "Connection timeout after 30s"
  }
}
```

**Error Codes**:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UPLOAD_FAILED` | 500 | Image upload failed |
| `FETCH_FAILED` | 500 | Failed to retrieve data |
| `DELETE_FAILED` | 500 | Delete operation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Invalid or missing deviceUserId |
| `ANALYSIS_FAILED` | 500 | AI analysis failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVICE_UNAVAILABLE` | 503 | Backend service down |

---

## 5. Authentication

All requests must include `deviceUserId` (UUID format) for authorization:
- In request body for POST/PATCH/DELETE
- In query params for GET

The Vault service maintains a mapping of `deviceUserId` → encryption keys.

**Security Model**:
- No user accounts in V1
- `deviceUserId` is generated client-side and stored in localStorage
- Data isolation enforced by `deviceUserId` filtering
- Encryption keys derived per-device and stored in Vault

---

## 6. CORS Configuration

Backend must allow:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 7. Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "services": {
    "vault": "up",
    "ipfs": "up",
    "ai": "up",
    "ollama": "up"
  },
  "version": "1.0.0"
}
```
