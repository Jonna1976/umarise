# Hetzner Integration Quick Reference

## Frontend Calls Summary

The Lovable frontend makes these calls through the abstraction layer:

### Storage Calls (`getStorageProvider()`)

```typescript
// All methods called via: getStorageProvider().methodName()

// Images
uploadImage(imageDataUrl: string): Promise<string>
deleteImage(imageUrl: string): Promise<void>
getDecryptedImageUrl(encryptedUrl: string): Promise<string>
isEncryptedUrl(url: string): boolean

// Pages CRUD
createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page>
getPages(): Promise<Page[]>
getPage(id: string): Promise<Page | null>
updatePage(id: string, updates: Partial<Page>): Promise<boolean>
deletePage(id: string): Promise<boolean>

// Capsules (multi-page groups)
getCapsulePages(capsuleId: string): Promise<Page[]>

// Projects
getProjects(): Promise<Project[]>
createProject(name: string): Promise<Project | null>

// Duplicate detection
checkDuplicate(ocrText: string, excludePageId?: string): Promise<Page | null>
```

### AI Calls (`getAIProvider()`)

```typescript
// All methods called via: getAIProvider().methodName()

analyzePage(imageBase64: string): Promise<PageAnalysisResult>
analyzePatterns(pages: PageSummary[]): Promise<PatternAnalysisResult>
analyzePersonality(pages: PageSummary[], profileType: 'voice' | 'influence'): Promise<PersonalityAnalysisResult>
generateYearReflection(year: number, pages: PageSummary[]): Promise<YearReflectionResult>
generateRecommendations(personality: PersonalityAnalysisResult): Promise<Recommendation[]>
```

---

## Switching Backend

```bash
# In .env
VITE_BACKEND_PROVIDER=hetzner
VITE_HETZNER_API_URL=https://your-hetzner-api.example.com
```

The factory in `src/lib/abstractions/index.ts` automatically instantiates `HetznerVaultStorage` and `HetznerAIProvider` when this is set.

---

## Implementation Checklist

### Storage Provider (HetznerVaultStorage)
- [ ] `uploadImage` → POST /vault/images
- [ ] `deleteImage` → DELETE /vault/images  
- [ ] `getDecryptedImageUrl` → GET /vault/images/decrypt
- [ ] `isEncryptedUrl` → local check (always true for Hetzner)
- [ ] `createPage` → POST /vault/pages
- [ ] `getPages` → GET /vault/pages
- [ ] `getPage` → GET /vault/pages/:id
- [ ] `updatePage` → PATCH /vault/pages/:id
- [ ] `deletePage` → DELETE /vault/pages/:id
- [ ] `getCapsulePages` → GET /vault/pages?capsuleId=
- [ ] `getProjects` → GET /vault/projects
- [ ] `createProject` → POST /vault/projects
- [ ] `checkDuplicate` → POST /vault/pages/check-duplicate

### AI Provider (HetznerAIProvider)
- [ ] `analyzePage` → POST /ai/analyze-page
- [ ] `analyzePatterns` → POST /ai/analyze-patterns
- [ ] `analyzePersonality` → POST /ai/analyze-personality
- [ ] `generateYearReflection` → POST /ai/generate-year-reflection
- [ ] `generateRecommendations` → POST /ai/generate-recommendations

### Search (separate endpoint)
- [ ] POST /ai/search

---

## Files Reference

| File | Purpose |
|------|---------|
| `docs/hetzner-integration-contract.md` | Full API spec with request/response formats |
| `docs/hetzner-test-data.json` | Sample data for testing |
| `src/lib/abstractions/types.ts` | TypeScript interfaces |
| `src/lib/abstractions/storage.ts` | IStorageProvider interface |
| `src/lib/abstractions/ai.ts` | IAIProvider interface |
| `src/lib/abstractions/index.ts` | Factory & provider switching |
