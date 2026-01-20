# Umarise Platform Comparison

## Overview

Two parallel Lovable projects exist with complementary strengths:

| Project | Focus | Status |
|---------|-------|--------|
| **Umarise Codex** (this project) | Handwriting capture + AI analysis | MVP active |
| **Umarise Platform** (separate) | Enterprise security infrastructure | Infrastructure ready |

---

## Umarise Codex (This Project)

### Core Features
- ✅ Zero-friction handwriting capture (camera → clean page)
- ✅ AI-powered OCR via Gemini (Lovable AI Gateway)
- ✅ Automatic summary, tone, and keyword extraction
- ✅ Personality profile generation (Voice + Influence)
- ✅ Pattern detection and thread analysis
- ✅ Multi-photo capsules with ordering
- ✅ Bookshelf visualization (book cover UX)
- ✅ Year reflection reports

### Architecture
- **Auth**: Anonymous device-based (UUID)
- **Database**: 3 core tables (pages, personality_snapshots, projects)
- **AI**: Lovable AI Gateway → Gemini 2.5 Flash
- **Storage**: Supabase Storage (page-images bucket)
- **Abstraction**: IStorageProvider + IAIProvider (Hetzner-ready)

### Data Model
```
pages: id, device_user_id, image_url, ocr_text, summary, tone[], 
       keywords[], primary_keyword, user_note, sources[], 
       capsule_id, page_order, project_id, created_at

personality_snapshots: id, device_user_id, tagline, core_identity,
                       superpower, growth_edge, drivers[], 
                       tension_field, page_count, profile_type

projects: id, device_user_id, name, created_at
```

---

## Umarise Platform (Separate Project)

### Core Features
- ✅ AES-256 client-side encryption
- ✅ Zero-access by design (v1) — cryptographic zero-knowledge encryption on v2 roadmap
- ✅ Full audit logging
- ✅ Capsule versioning
- ✅ Granular access control (private/shared/public)
- ✅ 7-layer UIF Protocol for semantic analysis
- ✅ Dutch language NLP (local, no AI)
- ✅ Whitelist-based authentication
- ⏸️ No AI integration (Gemini/OpenAI)
- ⏸️ Media storage not accessible

### Architecture
- **Auth**: Email/password with whitelist
- **Database**: 25+ tables with comprehensive schema
- **AI**: None configured (local NLP only)
- **Storage**: Supabase Storage (not working)
- **Security**: Enterprise-grade, GDPR-compliant

### Key Tables
```
capsules          - Core content with visibility levels
capsule_versions  - Full version history
journals          - Journal structure
journal_entries   - Individual entries
daily_rises       - Daily reflections
rise_capsules     - Media capsules (audio/video/text)
encryption_keys   - Client-side encryption keys
audit_log         - Complete audit trail
user_profiles     - User data
community_patterns - AI pattern sharing (inactive)
user_interactions  - Behavioral tracking
vault_backups     - Backup system
```

---

## Feature Matrix

| Feature | Codex | Platform |
|---------|-------|----------|
| AI OCR | ✅ Gemini | ❌ None |
| AI Summary/Tone | ✅ | ❌ |
| AI Personality | ✅ | ❌ |
| AI Patterns | ✅ | ⏸️ Local NLP |
| Client Encryption | ❌ | ✅ AES-256 |
| Audit Logging | ❌ | ✅ Full |
| Versioning | ❌ | ✅ |
| Access Control | Basic RLS | ✅ Granular |
| Anonymous Auth | ✅ Device UUID | ❌ |
| Email Auth | ❌ | ✅ Whitelist |
| Handwriting Capture | ✅ Optimized | ❌ |
| Media Transcription | ❌ | ⏸️ Ready |

---

## Integration Strategy

### Option 1: Keep Separate (Recommended for MVP)
- Finish memory loop in Codex
- Use Platform as Hetzner migration target
- Port AI pipeline to Platform when ready

### Option 2: Merge to Codex
Port from Platform:
- Encryption keys table + AES-256 logic
- Audit logging system
- Capsule versioning
- Requires significant refactoring

### Option 3: Merge to Platform
Port from Codex:
- AI abstraction layer (IAIProvider)
- Lovable AI Gateway integration
- Handwriting capture UX
- Personality/patterns analysis

---

## Abstraction Layer Compatibility

This project's abstraction layer is designed for backend portability:

```typescript
// src/lib/abstractions/storage.ts
interface IStorageProvider {
  uploadImage(dataUrl: string): Promise<string>
  deleteImage(imageUrl: string): Promise<boolean>
  createPage(page: Omit<Page, 'id'>): Promise<Page>
  getPages(deviceUserId: string): Promise<Page[]>
  // ...
}

// src/lib/abstractions/ai.ts
interface IAIProvider {
  analyzePage(imageBase64: string): Promise<PageAnalysisResult>
  analyzePatterns(pages: Page[]): Promise<PatternAnalysisResult>
  analyzePersonality(pages: Page[]): Promise<PersonalityAnalysisResult>
  // ...
}
```

Platform's UIF Protocol could implement IAIProvider interface.

---

## Estimated Value

| Project | Investment | Core Value |
|---------|------------|------------|
| Codex | ~€15-20K | AI pipeline, capture UX, memory loop |
| Platform | ~€40-60K | Enterprise security, 25+ table schema |
| **Combined** | ~€60-80K | Full privacy-first AI knowledge system |

---

## Next Steps

1. **Immediate**: Complete Codex memory loop testing
2. **Short-term**: Validate memory loop with real users
3. **Medium-term**: Evaluate Platform as Hetzner migration path
4. **Long-term**: Consider unified architecture for enterprise offering
