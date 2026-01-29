# Infrastructure Overview

**Last updated**: January 29, 2026  
**Status**: Production

---

## Table of Contents

1. [DNS Configuration](#dns-configuration)
2. [Three-Layer Architecture](#three-layer-architecture)
3. [Email Infrastructure](#email-infrastructure)
4. [Privacy Architecture](#privacy-architecture)
5. [Security Layers](#security-layers)
6. [API Endpoints](#api-endpoints)

---

## DNS Configuration

| Domain | Record Type | Value | Provider |
|--------|-------------|-------|----------|
| `umarise.com` | A | 185.158.133.1 | Lovable |
| `www.umarise.com` | A | 185.158.133.1 | Lovable |
| `_lovable.umarise.com` | TXT | lovable_verify=... | Ownership verification |
| `umarise.lovable.app` | CNAME | Lovable CDN | Lovable (staging) |

**SSL**: Automatically provisioned via Let's Encrypt

---

## Three-Layer Architecture

### Visual Diagram

```mermaid
flowchart TB
    subgraph FRONTEND["🌐 FRONTEND LAYER — Lovable (EU)"]
        F1[React SPA]
        F2[Static Assets CDN]
        F3["IP: 185.158.133.1"]
    end

    subgraph CONTROL["⚙️ CONTROL PLANE — Lovable Cloud (EU)"]
        C1[Edge Functions]
        C2[Auth Indices]
        C3[Metadata Proxies]
        C4[Search Indices]
        WARN1["⚠️ STATELESS"]
        WARN2["⚠️ No origin content"]
    end

    subgraph DATA["🔒 DATA PLANE — Hetzner (Germany 🇩🇪)"]
        D1[Origin Scans]
        D2[SHA-256 Hashes]
        D3[IPFS Storage]
        D4[Immutable Records]
        OK1["✓ SOURCE OF TRUTH"]
        OK2["✓ Privacy-by-design"]
    end

    FRONTEND --> CONTROL
    CONTROL --> DATA

    style FRONTEND fill:#f9f9f9,stroke:#333
    style CONTROL fill:#fff3cd,stroke:#856404
    style DATA fill:#d4edda,stroke:#155724
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend<br/>(Lovable)
    participant Control as Control Plane<br/>(Edge Functions)
    participant Vault as Data Vault<br/>(Hetzner 🇩🇪)

    User->>Frontend: Capture origin
    Frontend->>Frontend: Compute SHA-256
    Frontend->>Control: POST /origins
    Control->>Vault: Store image + hash
    Vault-->>Control: origin_id
    Control-->>Frontend: Success + origin_id
    
    Note over Control: No origin bytes stored
    Note over Vault: Immutable record created
```

### Verification Flow

```mermaid
sequenceDiagram
    participant Partner as External Partner
    participant API as Public API
    participant Vault as Hetzner Vault

    Partner->>API: GET /resolve-origin?id=xxx
    API->>Vault: Fetch metadata
    Vault-->>API: hash, timestamp, status
    API-->>Partner: Origin metadata

    Partner->>API: POST /verify (content)
    API->>API: Compute SHA-256
    API->>Vault: Compare with stored hash
    Vault-->>API: match: true/false
    API-->>Partner: Verification result
```

### ASCII Fallback

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│                         Lovable (EU)                        │
│                                                             │
│  • React SPA (Vite + TypeScript)                           │
│  • Static assets via CDN                                    │
│  • IP: 185.158.133.1                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROL PLANE LAYER                      │
│                    Lovable Cloud (EU)                       │
│                                                             │
│  • Edge Functions (Deno runtime)                           │
│  • Authentication indices                                   │
│  • Metadata proxies                                        │
│  • Search indices                                          │
│                                                             │
│  ⚠️  STATELESS — No origin content stored                  │
│  ⚠️  Cannot reconstruct origin data                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA PLANE LAYER                        │
│                    Hetzner (Germany 🇩🇪)                     │
│                                                             │
│  • Origin scans (source images)                            │
│  • SHA-256 cryptographic hashes                            │
│  • IPFS content-addressed storage                          │
│  • Immutable records (write-once)                          │
│                                                             │
│  ✓ SOURCE OF TRUTH                                         │
│  ✓ Privacy-by-design at data level                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Proton Suite Infrastructure

### Overview

| Component | Provider | Location | Status |
|-----------|----------|----------|--------|
| Email Hosting | Proton Mail | 🇨🇭 Switzerland | ✅ Active |
| Calendar | Proton Calendar | 🇨🇭 Switzerland | 🔄 Evaluation |
| DNS Management | GoDaddy | Domain registrar | ✅ Active |

**Why Proton?** Zero-knowledge encryption aligns with privacy-by-design philosophy. All data is end-to-end encrypted before leaving the device.

---

### Proton Mail

#### Active Addresses

| Address | Purpose |
|---------|---------|
| `j.fassbender@umarise.com` | Primary contact |
| `partners@umarise.com` | Partner communications |

#### DNS Records

##### MX Records

| Priority | Value |
|----------|-------|
| 10 | `mail.protonmail.ch` |
| 20 | `mailsec.protonmail.ch` |

##### Authentication Records

| Type | Host | Value |
|------|------|-------|
| TXT | @ | `v=spf1 include:_spf.protonmail.ch ~all` |
| CNAME | `protonmail._domainkey` | `protonmail._domainkey.dxclj4p5cfpqtcxkuhsjd3jpmhqnhz3l.domains.proton.ch` |
| CNAME | `protonmail2._domainkey` | `protonmail2._domainkey.dxclj4p5cfpqtcxkuhsjd3jpmhqnhz3l.domains.proton.ch` |
| CNAME | `protonmail3._domainkey` | `protonmail3._domainkey.dxclj4p5cfpqtcxkuhsjd3jpmhqnhz3l.domains.proton.ch` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine` |

#### Verification Status

| Check | Status |
|-------|--------|
| Domain Verification | ✅ |
| MX Records | ✅ |
| SPF | ✅ |
| DKIM | ✅ |
| DMARC | ✅ |

---

### Proton Calendar

#### Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| End-to-end encryption | ✅ | All events encrypted before leaving device |
| CalDAV sync | ✅ | Standard protocol support |
| Event invitations | ✅ | Compatible with Google/Outlook |
| Import from Google | ✅ | Via ICS export/import |
| Web access | ✅ | calendar.proton.me |
| Mobile apps | ✅ | iOS & Android |
| Desktop app | ✅ | Windows, macOS, Linux |
| Proton Mail integration | ✅ | Native event detection in emails |

#### Limitations vs Google Calendar

| Feature | Proton Calendar | Google Calendar |
|---------|-----------------|-----------------|
| Third-party integrations | ⚠️ Limited | Extensive ecosystem |
| Shared calendars | ⚠️ Basic (link sharing) | Full-featured |
| Video conferencing | ❌ No native integration | Native Google Meet |
| Offline access | ⚠️ Limited | Good |
| API access | ⚠️ Limited | Full REST API |

#### Recommendation

Proton Calendar is suitable for Umarise's privacy-by-design philosophy if:
- Extensive team calendar sharing is not critical
- Google Meet integration is not required
- Privacy outweighs convenience trade-offs

**Current Status**: Under evaluation for adoption

---

## Privacy-by-Design Assessment

### Technology Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    UMARISE PRIVACY STACK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │   LOVABLE   │  │  SUPABASE   │  │   HETZNER   │  │ PROTON  ││
│  │  Frontend   │  │Control Plane│  │ Data Plane  │  │Comms    ││
│  │     EU      │  │     EU      │  │  🇩🇪 Germany │  │🇨🇭 Swiss ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
│        │                │                │               │      │
│        ▼                ▼                ▼               ▼      │
│   Static SPA      Stateless        Source of        Zero-      │
│   No user data    Indices only     Truth            Knowledge  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Provider Assessment Matrix

| Provider | Role | Location | GDPR | Zero-Knowledge | Data Stored | Privacy Score |
|----------|------|----------|------|----------------|-------------|---------------|
| **Lovable** | Frontend hosting | EU | ✅ | N/A (static) | None | ⭐⭐⭐⭐⭐ |
| **Supabase** | Control plane | EU | ✅ | ❌ Operational | Indices, metadata | ⭐⭐⭐⭐ |
| **Hetzner** | Data plane | 🇩🇪 Germany | ✅ | ❌ Encrypted-at-rest | Origin content | ⭐⭐⭐⭐⭐ |
| **Proton** | Communications | 🇨🇭 Switzerland | ✅ | ✅ E2E encrypted | Email, calendar | ⭐⭐⭐⭐⭐ |

### Core Invariant

> **"Compromise of Lovable/Supabase (control plane) must never yield origin content."**

### Layer Analysis

#### 1. Lovable (Frontend Layer)

| Aspect | Status | Notes |
|--------|--------|-------|
| Data storage | ✅ None | Static SPA only |
| User tracking | ✅ None | No analytics, no cookies |
| CDN location | ✅ EU | IP: 185.158.133.1 |
| SSL/TLS | ✅ Enforced | Let's Encrypt |

**Privacy Impact**: Zero — serves static assets only.

#### 2. Supabase via Lovable Cloud (Control Plane)

| Aspect | Status | Notes |
|--------|--------|-------|
| Origin content | ✅ Never stored | Stateless proxy |
| User accounts | ✅ None | Device-based isolation |
| Indices | ⚠️ Metadata only | Search indices, no content |
| Logs | ✅ Sanitized | No PII, no payloads |
| Egress | ✅ Allowlisted | Hetzner only |

**Privacy Impact**: Minimal — indices and metadata, no reconstruction capability.

#### 3. Hetzner (Data Plane)

| Aspect | Status | Notes |
|--------|--------|-------|
| Location | ✅ Germany | Strictest GDPR interpretation |
| Origin storage | ✅ Immutable | Write-once semantics |
| Encryption | ✅ At-rest | AES-256 |
| IPFS | ✅ Content-addressed | SHA-256 integrity |
| Access control | ✅ API-only | No dashboard access |

**Privacy Impact**: Primary data custodian — privacy enforced at source.

#### 4. Proton (Communications)

| Aspect | Status | Notes |
|--------|--------|-------|
| Email encryption | ✅ E2E | Zero-knowledge |
| Calendar encryption | ✅ E2E | Zero-knowledge |
| Server location | ✅ Switzerland | Privacy-friendly jurisdiction |
| Provider access | ✅ None | Cannot decrypt content |

**Privacy Impact**: Zero provider visibility — aligns with privacy-first philosophy.

### Intentional Separation

| Layer | Privacy Role | Compromise Impact |
|-------|--------------|-------------------|
| **Hetzner (Data)** | Truth storage | Would expose origins |
| **Supabase (Control)** | Stateless proxy | Degrades convenience, not truth |
| **Proton (Comms)** | Zero-knowledge | Provider cannot read content |
| **Lovable (Frontend)** | Static hosting | No data to expose |

### Design Principles

1. **Privacy sits where it MUST** — at the data layer (Hetzner)
2. **Operational flexibility where it CAN** — at the control plane
3. **Zero reconstruction capability** — control plane cannot rebuild origin content
4. **Egress allowlist** — Edge Functions only communicate with Hetzner
5. **Zero-knowledge communications** — Proton for all external comms

### Overall Privacy-by-Design Score

| Category | Score | Justification |
|----------|-------|---------------|
| Data Minimization | ⭐⭐⭐⭐⭐ | No user accounts, device-based isolation |
| Purpose Limitation | ⭐⭐⭐⭐⭐ | Origin verification only |
| Storage Limitation | ⭐⭐⭐⭐⭐ | Immutable, no retention beyond purpose |
| Integrity | ⭐⭐⭐⭐⭐ | SHA-256, write-once, triggers |
| Confidentiality | ⭐⭐⭐⭐ | Encrypted-at-rest, not E2E for origins |
| Jurisdiction | ⭐⭐⭐⭐⭐ | EU + Switzerland only |

**Overall: ⭐⭐⭐⭐⭐ (4.8/5)**

### Gap Analysis

| Gap | Severity | Mitigation | Phase |
|-----|----------|------------|-------|
| Origins not E2E encrypted | Medium | Client-side encryption | 2B |
| Supabase metadata visible | Low | Hash-based identifiers | 2A ✅ |
| No TSA timestamps | Low | Blockchain anchoring | 3 |

### Certification Readiness

| Standard | Status | Notes |
|----------|--------|-------|
| GDPR Article 25 | ✅ Ready | Privacy-by-design documented |
| ISO 27701 | ⚠️ Partial | Needs formal audit |
| SOC 2 Type II | ❌ Not started | Phase 3 |

---

## Security Layers

### 1. Device-Based Isolation

| Property | Value |
|----------|-------|
| Identifier | 128-bit UUID (`device_user_id`) |
| Storage | Browser localStorage |
| Entropy | 2^122 (cryptographically secure) |

### 2. Header Validation

All Edge Function requests require:
```
x-device-id: [36-character UUID]
```

### 3. Row-Level Security (RLS)

All database tables enforce `device_user_id` matching.

### 4. Immutability Enforcement

- Database triggers prevent modification
- SHA-256 computed client-side
- Write-once semantics on Hetzner

### 5. Email Security

| Feature | Implementation |
|---------|----------------|
| End-to-end encryption | ProtonMail |
| SPF | Authorized senders only |
| DKIM | Cryptographic signing |
| DMARC | Policy: quarantine |

---

## API Endpoints

### Public (No Authentication)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/resolve-origin` | GET | Origin metadata lookup |
| `/verify` | POST | Bit-identity verification |

### Protected (API Key)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/origins` | POST | Create new origin (write-once) |

---

## Jurisdiction Summary

| Component | Location | Provider | Data Stored |
|-----------|----------|----------|-------------|
| Frontend | EU | Lovable | None (static) |
| Control Plane | EU | Lovable Cloud | Indices, metadata |
| Data Plane | 🇩🇪 Germany | Hetzner | Origin content |
| Email | 🇨🇭 Switzerland | ProtonMail | Communications |

---

## Phase 2 Invariants

1. Control plane stores no origin payloads, encryption keys, or secrets
2. Hetzner is the sole source-of-truth for origin content
3. Verifiability never depends on Supabase availability
4. Control-plane compromise degrades convenience, not truth
5. Edge Function egress allowlisted to Hetzner only
6. Logs contain no payloads, tokens, or PII
7. Partners can operate Vault-only (without control plane)

---

## Troubleshooting

### DNS Propagation
- Use [DNSChecker.org](https://dnschecker.org) to verify
- Full propagation: up to 48-72 hours

### GoDaddy 2FA Issues
**Known Issue**: SMS delivery unreliable due to carrier filtering.  
**Solution**: Configure Authenticator App as backup.

### Email Not Receiving
1. Verify MX records propagated
2. Check ProtonMail spam folder
3. Confirm sender isn't blocked

---

## Related Documentation

- [`integration-contract.md`](./integration-contract.md) — API primitives
- [`layer-boundaries.md`](./layer-boundaries.md) — System boundaries
- [`cto-technical-factsheet.md`](./cto-technical-factsheet.md) — Due diligence baseline
- [`phase-2b-e2e-encryption-spec.md`](./phase-2b-e2e-encryption-spec.md) — End-to-End encryption specification (Phase 2B)

---

*Configuration completed: January 29, 2026*
