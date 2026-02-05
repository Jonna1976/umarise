 # B2C-Inventarisatie v0 — Umarise App
 
 **Scope:** Uitsluitend de B2C-laag (Umarise App)  
 **Relatie tot Core:** Consument van Core API, geen overlap  
 **Datum:** 5 februari 2026  
 **Status:** Formele systeemdefinitie  
 **Versie:** v0.2 — aangescherpt na review (5 feb 2026)
 
 ---
 
 ## 1. Systeemdefinitie
 
 | Vraag | Antwoord |
 |-------|----------|
 | **Wat is Umarise (B2C) exact als systeem?** | Een client-side Single Page Application (React/TypeScript) die artifacts vastlegt, een SHA-256 hash genereert client-side, en die hash + artifact opslaat via Supabase + Hetzner Object Storage. |
 | **Welke handeling stelt de gebruiker technisch gezien vast?** | Het bestaan van specifieke bytes (artifact) op een specifiek moment, door middel van client-side hashing + database-insert met timestamp. |
 | **Wat is het formele output-object van die handeling?** | Een `page` record in Supabase met: `id` (UUID), `created_at` (timestamp), `origin_hash_sha256` (64-char hex), `image_url` (Hetzner public URL). Lokaal: alleen `device_user_id` in localStorage. |
 
 ---
 
 ## 2. Tech Stack
 
 | Component | Technologie | Versie/Details |
 |-----------|-------------|----------------|
 | **Framework** | React + TypeScript | ^18.3.1 |
 | **Build tooling** | Vite | via vite.config.ts |
 | **Styling** | Tailwind CSS | met shadcn/ui componenten |
 | **State management** | React Query | @tanstack/react-query ^5.83.0 |
 | **Database** | Supabase (PostgreSQL) | Lovable Cloud EU |
 | **Object Storage** | Supabase Storage → Hetzner proxy | EU-gehost |
 | **Hashing** | Web Crypto API | crypto.subtle.digest('SHA-256') |
 | **Hosting** | Lovable Cloud | CDN + EU edge |
 
 ---
 
 ## 3. PWA Lifecycle
 
 ### 3.1 Huidige status
 
 | Eigenschap | Status | Technische realiteit |
 |------------|--------|---------------------|
 | **Service Worker** | ❌ Niet geïmplementeerd | vite.config.ts bevat geen vite-plugin-pwa |
 | **Offline capability** | ❌ Niet beschikbaar | Geen service worker = geen offline cache |
 | **Cache strategie** | ❌ Geen | Browser default caching only |
 | **Update-mechanisme** | ❌ Niet gedefinieerd | Nieuwe versie = browser refresh, geen prompt |
 | **Installability** | ⚠️ Deels | manifest.json aanwezig, maar geen service worker = beperkte PWA-installatie |
 | **Web Share Target** | ✅ Gedefinieerd | manifest.json bevat share_target voor images |
 
 ### 3.2 manifest.json configuratie
 
 ```json
 {
   "start_url": "/app",
   "display": "standalone",
   "share_target": {
     "action": "/app",
     "method": "POST",
     "enctype": "multipart/form-data",
     "params": { "files": [{ "name": "media", "accept": ["image/*"] }] }
   }
 }
 ```
 
 ### 3.3 Consequenties
 
 - **Geen offline capture mogelijk** — App vereist netwerkverbinding voor elke handeling
 - **Geen background sync** — Als upload faalt, is de capture verloren
 - **Geen update-notificatie** — Gebruiker weet niet wanneer nieuwe versie beschikbaar is
 - **Web Share Target vereist service worker** — Zonder SW werkt share_target niet op alle platforms
 
 ---
 
 ## 4. Device Loss = Permanent Verlies
 
 ### 4.1 Architecturaal feit
 
 | Element | Opslag | Consequentie bij verlies |
 |---------|--------|--------------------------|
 | `device_user_id` | localStorage | **Onherstelbaar** — UUID genereert opnieuw |
 | Link user ↔ pages | Supabase `pages.device_user_id` | **Onbereikbaar** — geen pad terug zonder originele UUID |
 | Artifact bytes | Hetzner Object Storage | **Technisch bereikbaar** via directe URL, maar gebruiker kent URL niet |
 | Origin attestatie | Supabase `origin_attestations` | **Publiek verifieerbaar** via hash, maar gebruiker kent hash niet |
 
 ### 4.2 Expliciete acceptatie
 
 Dit is een **bewuste ontwerpkeuze**, niet een bug:
 
 - **Privacy-by-design**: Geen account = geen identiteit op server
 - **Zero-knowledge**: Server weet niet wie welke pages bezit
 - **Trade-off**: Privacy > recoverability
 
 ### 4.3 Recovery paden (beperkt)
 
 | Scenario | Mogelijk? | Mechanisme |
 |----------|-----------|------------|
 | Backup device_user_id exporteren | ⚠️ Handmatig | Via TestPanel > DeviceDebug (dev feature) |
 | Cross-device sync | ❌ Nee | Niet geïmplementeerd |
 | Hash-based recovery | ❌ Nee | Gebruiker kent hash niet zonder toegang tot pages |
 | URL-based recovery | ⚠️ Theoretisch | Als gebruiker image_url heeft opgeslagen elders |
 
 ---
 
 ## 5. Data & Opslag (gecorrigeerd)
 
 ### 5.1 Opslaglocaties
 
 | Data | Locatie | Persistentie | IndexedDB? |
 |------|---------|--------------|------------|
 | Artifact bytes (afbeelding) | Hetzner Object Storage (via Supabase proxy) | Permanent | ❌ Nee |
 | Page metadata (OCR, keywords, summary) | Supabase `pages` tabel | Permanent | ❌ Nee |
 | Origin hash sidecar | Supabase `page_origin_hashes` tabel | Permanent, immutable | ❌ Nee |
 | Device identifier | localStorage (`umarise_device_id`) | Lokaal, browser-gebonden | ❌ Nee |
 | UI preferences | localStorage | Lokaal | ❌ Nee |
 
 **Correctie t.o.v. v0.1:** IndexedDB wordt NIET gebruikt. Alle data gaat direct naar Supabase. Er is geen lokale cache-laag.
 
 ### 5.2 Niet opgeslagen of terughaalbaar
 
 - Geen user accounts of authenticatie credentials
 - Geen relaties tussen gebruikers
 - Geen gedeelde artifacts tussen devices
 - Geen lokale backup van pages (alles server-only)
 
 ---
 
 ## 6. Capture Atomiciteit
 
 ### 6.1 Transactiegrens
 
 De capture-handeling bestaat uit **vier sequentiële stappen** die NIET atomair zijn:
 
 ```
 [1] hashAndDecodeDataUrl() → SHA-256 hash berekenen (client-side, sync)
 [2] storage.uploadImage()  → Blob naar Hetzner (async, kan falen)
 [3] storage.createPage()   → Record naar Supabase (async, kan falen)
 [4] persistOriginHashSidecar() → Hash naar sidecar tabel (async, non-blocking)
 ```
 
 ### 6.2 Failure modes
 
 | Failure point | Resultaat | Data-integriteit |
 |---------------|-----------|------------------|
 | Stap 1 faalt (hash) | Capture stopt | ✅ Geen orphans |
 | Stap 2 faalt (upload) | Capture stopt, throw Error | ✅ Geen orphans |
 | Stap 3 faalt (createPage) | **Image op Hetzner, geen page record** | ⚠️ Orphan blob |
 | Stap 4 faalt (sidecar) | Page bestaat, hash in pages tabel, sidecar mist | ✅ Acceptable (sidecar is backup) |
 
 ### 6.3 Kritieke observatie
 
 **Stap 2→3 failure = orphan blob op Hetzner**
 
 Als image-upload slaagt maar database-insert faalt:
 - Blob bestaat op Hetzner (kost opslag)
 - Geen page record om naar te verwijzen
 - Geen cleanup-mechanisme geïmplementeerd
 - Gebruiker ziet geen capture (correcte UI-feedback)
 
 **Status:** Geaccepteerd risico. Orphan blobs zijn laag-volume en kunnen handmatig worden opgeruimd.
 
 ### 6.4 Idempotentie
 
 | Stap | Idempotent? | Reden |
 |------|-------------|-------|
 | Hash berekenen | ✅ Ja | Deterministische functie |
 | Image upload | ❌ Nee | Timestamp in filename = unieke key |
 | Page insert | ❌ Nee | Auto-generated UUID |
 | Sidecar insert | ⚠️ Deels | Duplicate key = silent ignore (code 23505) |
 
 ---
 
 ## 7. Scope-afbakening
 
 | In scope | Buiten scope |
 |----------|--------------|
 | Artifact capture (camera, upload) | Betekenisgeving aan artifacts |
 | Client-side SHA-256 hashing | Interpretatie van content |
 | Remote opslag van artifacts (Hetzner) | Voortgang, herinnering, terugkeer |
 | Supabase page records | Hergebruik of bewerking van artifacts |
 | Weergave van bestaande captures | Relaties tussen captures |
 | AI-metadata (OCR, keywords — verborgen) | Sociale features, delen, publiceren |
 
 ---
 
 ## 8. Operationele invarianten
 
 | Invariant | Status | Afdwinging |
 |-----------|--------|------------|
 | **Write-once artifacts** | ⚠️ Conventie | Geen technische blokkade; image bytes worden niet overschreven maar tabel-updates zijn mogelijk |
 | **Geen relaties tussen handelingen** | ✅ Technisch | Geen foreign keys tussen `pages` records (capsule_id is optioneel grouping, geen dependency) |
 | **Geen mutaties op Core-niveau** | ✅ Technisch afgedwongen | PostgreSQL triggers op `origin_attestations` |
 | **Geen mutaties op lokale artifacts** | ⚠️ N/A | Geen lokale opslag — artifacts zijn server-only |
 | **Origin hash immutabel** | ✅ Technisch | `page_origin_hashes` sidecar tabel is insert-only (duplicate = ignore) |
 
 ---
 
 ## 9. Interface ↔ Core-relatie
 
 ### 9.1 Huidige status
 
 | Core-functionaliteit | B2C-toegang | Implementatie |
 |---------------------|-------------|---------------|
 | Origin attestatie (create) | ⚠️ Niet direct | App schrijft naar `pages` tabel, NIET naar `origin_attestations` |
 | `GET /v1-core-resolve` | ❌ Niet gebruikt | Geen UI-integratie |
 | `POST /v1-core-verify` | ❌ Niet gebruikt | Geen UI-integratie |
 | `GET /v1-core-proof` | ❌ Niet gebruikt | Geen OTS download in App |
 
 ### 9.2 Kritieke observatie
 
 **App schrijft NIET naar Core API.** De huidige flow:
 
 1. App berekent hash client-side
 2. App schrijft hash naar `pages.origin_hash_sha256` (Companion-laag)
 3. App schrijft hash naar `page_origin_hashes` sidecar (Companion-laag)
 4. **Geen automatische attestatie naar `origin_attestations`** (Core-laag)
 
 De brug tussen Companion en Core is **niet geïmplementeerd** in de huidige B2C flow.
 
 ---
 
 ## 10. Uitsluitingen (kritisch)
 
 | Element | Aanwezig? | Uitsluiting |
 |---------|-----------|-------------|
 | **Uitleg/onboarding** | ❌ Nee | Ontwerpconventie — geen onboarding screens |
 | **Feedbackloops** | ❌ Nee | Geen progressie, ratings, of achievement |
 | **Optimalisatie** | ❌ Nee | Geen suggesties of recommendations in capture flow |
 | **Herhaalmechanismen** | ❌ Nee | Geen reminders, streaks, of push notifications |
 | **Betekenislabels** | ⚠️ Deels | AI-gegenereerde metadata bestaat maar is verborgen in UI |
 
 ---
 
 ## 11. Native Extension Migratiepad
 
 ### 11.1 PWA-afhankelijke componenten
 
 | Component | PWA-specifiek | Portable naar native? |
 |-----------|---------------|----------------------|
 | Web Share Target (manifest.json) | ✅ PWA-only | ❌ Nee — vereist iOS Share Extension |
 | localStorage voor device_id | ✅ Browser-only | ❌ Nee — vereist Keychain/SharedPreferences |
 | Web Crypto API (hashing) | ⚠️ Deels | ✅ Ja — CommonCrypto/Android Crypto equivalent |
 | Service worker (niet geïmplementeerd) | ✅ PWA-only | ❌ N/A — niet aanwezig |
 | React UI components | ❌ Nee | ⚠️ Nee — vereist SwiftUI/Kotlin UI |
 
 ### 11.2 Portable componenten
 
 | Component | Portable? | Native equivalent |
 |-----------|-----------|-------------------|
 | SHA-256 hashing logic | ✅ Ja | CommonCrypto (iOS) / java.security (Android) |
 | Supabase client calls | ✅ Ja | Supabase Swift/Kotlin SDK |
 | Business logic (pageService) | ⚠️ Deels | Concept portable, implementatie niet |
 
 ---
 
 ## 12. Verifieerbaarheid
 
 | Claim | Type | Verificatie |
 |-------|------|-------------|
 | "App genereert SHA-256 hash client-side" | **Verifieerbaar** | `src/lib/originHash.ts`, unit tests |
 | "Geen service worker geïmplementeerd" | **Verifieerbaar** | vite.config.ts inspectie |
 | "Device loss = permanent verlies" | **Verifieerbaar** | localStorage-only storage voor device_id |
 | "Capture is niet atomair" | **Verifieerbaar** | pageService.ts code flow analyse |
 | "App schrijft niet naar Core API" | **Verifieerbaar** | Geen calls naar `/v1-core-origins` in codebase |
 | "De App is een ritueel" | **Hypothese** | Ontwerpintentie, niet technisch afdwingbaar |
 | "Gebruikers voelen zich gegrond" | **Hypothese** | Niet meetbaar via architectuur |
 
 ---
 
 ## 13. Acceptatiecriterium
 
 | Criterium | Status |
 |-----------|--------|
 | Elke uitspraak herleidbaar tot systeemgedrag | ✅ |
 | Geen ervarings- of verspreidingsclaims | ✅ |
 | CORE en B2C strikt gescheiden | ✅ |
 | Leesbaar zonder context of visie-sessie | ✅ |
 | PWA-lifecycle gedocumenteerd | ✅ |
 | Device loss consequenties benoemd | ✅ |
 | Capture atomiciteit gedefinieerd | ✅ |
 | Tech stack benoemd | ✅ |
 
 ---
 
 **Document classification:** Formele systeemdefinitie  
 **Scope:** B2C-laag exclusief  
 **Geen overlap met:** Core Inventarisatie v3, App Experience Briefing (intentie-document)