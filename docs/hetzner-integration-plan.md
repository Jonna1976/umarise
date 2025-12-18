# Lovable ↔ Hetzner Integratie Plan

## Huidige Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD (Nu)                       │
├─────────────────────────────────────────────────────────────┤
│  React Frontend                                             │
│       ↓                                                     │
│  Abstraction Layer (src/lib/abstractions/)                  │
│       ↓                                                     │
│  SupabaseVaultStorage + SupabaseAIProvider                  │
│       ↓                                                     │
│  Supabase (Database + Storage + Edge Functions)             │
│       ↓                                                     │
│  Lovable AI Gateway (gemini-2.5-flash)                      │
└─────────────────────────────────────────────────────────────┘
```

## Toekomstige Architectuur (met Hetzner)

```
┌─────────────────────────────────────────────────────────────┐
│                 LOVABLE FRONTEND (Blijft)                   │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (zelfde code)                               │
│       ↓                                                     │
│  Abstraction Layer (zelfde interfaces)                      │
│       ↓                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ VITE_BACKEND_   │    │ VITE_BACKEND_   │                │
│  │ PROVIDER=cloud  │    │ PROVIDER=hetzner│                │
│  └────────┬────────┘    └────────┬────────┘                │
│           ↓                      ↓                          │
│  Supabase Backend         Hetzner Backend                   │
│  (huidige demo)           (sovereignty mode)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Hetzner Backend Bouwen (Standalone)

**Jij bouwt in Claude/lokaal:**

### Service 1: Vision API (Port 3340)
```
POST /vision/analyze
- Input: base64 image
- Output: OCR text, summary, keywords, tone, cues
- Tech: Ollama + lokale vision model
```

### Service 2: Vault API (Port 3334)
```
POST   /vault/images          → Upload encrypted image
GET    /vault/images/:id      → Download + decrypt
DELETE /vault/images/:id      → Verwijder image

POST   /vault/pages           → Create page
GET    /vault/pages           → List pages (by device_user_id)
GET    /vault/pages/:id       → Get single page
PATCH  /vault/pages/:id       → Update page
DELETE /vault/pages/:id       → Delete page

GET    /vault/projects        → List projects
POST   /vault/projects        → Create project
```

### Service 3: Search API (Port 3342)
```
POST /search
- Input: query, device_user_id, filters
- Output: ranked results met match reasons
- Tech: Lokale embeddings + vector search
```

---

## Fase 2: Provider Classes Implementeren (Lovable)

**Ik bouw in Lovable:**

```typescript
// src/lib/abstractions/hetzner/storage.ts
export class HetznerVaultStorage implements IStorageProvider {
  private baseUrl = import.meta.env.VITE_HETZNER_API_URL;
  
  async uploadImage(imageDataUrl: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/vault/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl })
    });
    const { url } = await response.json();
    return url;
  }
  
  // ... alle andere IStorageProvider methods
}

// src/lib/abstractions/hetzner/ai.ts
export class HetznerAIProvider implements IAIProvider {
  private baseUrl = import.meta.env.VITE_HETZNER_API_URL;
  
  async analyzePage(imageBase64: string): Promise<PageAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    return response.json();
  }
  
  // ... alle andere IAIProvider methods
}
```

---

## Fase 3: Factory Aanpassen

```typescript
// src/lib/abstractions/index.ts
export function getStorageProvider(): IStorageProvider {
  const provider = import.meta.env.VITE_BACKEND_PROVIDER;
  
  if (provider === 'hetzner') {
    return new HetznerVaultStorage();
  }
  return new SupabaseVaultStorage(); // default
}

export function getAIProvider(): IAIProvider {
  const provider = import.meta.env.VITE_BACKEND_PROVIDER;
  
  if (provider === 'hetzner') {
    return new HetznerAIProvider();
  }
  return new SupabaseAIProvider(); // default
}
```

---

## Fase 4: Integratie & Test

### Env vars voor Hetzner mode:
```bash
VITE_BACKEND_PROVIDER=hetzner
VITE_HETZNER_API_URL=https://your-hetzner-server.com
```

### Test flow:
1. Start Hetzner services lokaal
2. Zet env vars
3. Open Lovable preview
4. Capture → Should hit Hetzner endpoints
5. Verify data in Hetzner storage

---

## Timeline

| Week | Wie | Wat |
|------|-----|-----|
| Nu | Jij + Claude | Vision API bouwen (OCR + analysis) |
| Nu | Jij + Claude | Vault API bouwen (storage + CRUD) |
| Later | Jij + Claude | Search API bouwen (embeddings) |
| Later | Lovable | Provider classes implementeren |
| Later | Samen | Integration test |

---

## Voordelen van deze aanpak

✅ **Geen code-duplicatie** - Zelfde frontend, andere backend  
✅ **Geen breaking changes** - Lovable demo blijft werken  
✅ **Testbaar in isolatie** - Hetzner services apart testbaar  
✅ **Env var switch** - Geen deployment nodig om te wisselen  
✅ **Sovereignty optie** - Enterprise klanten kiezen Hetzner  

---

## Belangrijke Bestanden

| Bestand | Doel |
|---------|------|
| `docs/hetzner-integration-contract.md` | Volledige API spec |
| `docs/hetzner-test-data.json` | Test data voor development |
| `docs/hetzner-quick-reference.md` | Snelle implementatie checklist |
| `src/lib/abstractions/types.ts` | TypeScript interfaces |
| `src/lib/abstractions/storage.ts` | IStorageProvider interface |
| `src/lib/abstractions/ai.ts` | IAIProvider interface |

---

## Communicatie Flow (Visueel)

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER CAPTURE FLOW                         │
└──────────────────────────────────────────────────────────────────┘

User tikt foto → CameraView.tsx
                      ↓
              ProcessingView.tsx
                      ↓
              getAIProvider().analyzePage(base64)
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
   [cloud mode]               [hetzner mode]
        ↓                           ↓
 Edge Function:              HTTP Call:
 analyze-page                POST /vision/analyze
        ↓                           ↓
 Lovable AI Gateway          Ollama lokaal
        ↓                           ↓
   Gemini 2.5               Lokale LLM
        ↓                           ↓
        └─────────────┬─────────────┘
                      ↓
              PageAnalysisResult
                      ↓
              getStorageProvider().createPage()
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
   [cloud mode]               [hetzner mode]
        ↓                           ↓
 Supabase insert             POST /vault/pages
        ↓                           ↓
        └─────────────┬─────────────┘
                      ↓
              SnapshotView.tsx (page saved!)
```

---

## API Endpoints Samenvatting

### Hetzner moet implementeren:

| Endpoint | Method | Doel |
|----------|--------|------|
| `/health` | GET | Health check |
| `/vision/analyze` | POST | OCR + AI analysis |
| `/vault/images` | POST | Upload image |
| `/vault/images/:id` | GET | Download image |
| `/vault/images/:id` | DELETE | Delete image |
| `/vault/pages` | GET | List all pages |
| `/vault/pages` | POST | Create page |
| `/vault/pages/:id` | GET | Get single page |
| `/vault/pages/:id` | PATCH | Update page |
| `/vault/pages/:id` | DELETE | Delete page |
| `/vault/pages/check-duplicate` | POST | Duplicate check |
| `/vault/projects` | GET | List projects |
| `/vault/projects` | POST | Create project |
| `/ai/analyze-patterns` | POST | Pattern analysis |
| `/ai/analyze-personality` | POST | Personality profile |
| `/ai/generate-year-reflection` | POST | Year reflection |
| `/ai/generate-recommendations` | POST | Recommendations |
| `/ai/search` | POST | Semantic search |

Zie `docs/hetzner-integration-contract.md` voor volledige request/response formats.
