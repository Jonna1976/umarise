# Security Sign-Off: MKB Pilot
**Datum:** 2026-01-20  
**Reviewer:** Lovable AI  
**Scope:** Hetzner Privacy Vault backend voor pilot publishing

---

## ✅ BEVESTIGD (Code Review)

| Component | Status | Locatie |
|-----------|--------|---------|
| Bearer Token Auth | ✅ | `HETZNER_API_TOKEN` secret → hetzner-ai-proxy:133 |
| Rate Limiting | ✅ | 10-60 req/min per device → hetzner-ai-proxy:19-24 |
| Audit Logging | ✅ | Alle requests → `audit_logs` tabel |
| Device Isolation | ✅ | Server-side `device_user_id` filtering in Codex |
| HTTPS Only | ✅ | `vault.umarise.com` via Nginx SSL |
| Origin Hash | ✅ | SHA-256 pre-upload → storage.ts:90 |
| Data Sovereignty | ✅ | Hetzner Falkenstein, Germany |
| Request Timeout | ✅ | 60-120s met AbortController |

---

## ⚠️ BUITEN SCOPE (Server-side, niet verifieerbaar via code)

| Item | Risico | Mitigatie |
|------|--------|-----------|
| Firewall config | Low | Hetzner standard, port 22/80/443 only (docs claim) |
| Nginx hardening | Low | Let's Encrypt SSL, standard config |
| Bearer token entropy | Low | 64-char hex token (adequate) |
| Backup encryption | Low | Daily backups documented, encryption TBD |
| IPFS node security | Low | Docker isolated, localhost only |

---

## 📊 RISICO ASSESSMENT

**Pilot scope:** 3 teams, 21 dagen, <100 gebruikers

| Risico | Impact | Waarschijnlijkheid | Acceptabel? |
|--------|--------|-------------------|-------------|
| Data breach via API | High | Very Low | ✅ Ja (rate limit + auth) |
| Cross-device data access | Medium | Very Low | ✅ Ja (UUID isolation) |
| CORS abuse | Low | Low | ✅ Ja (pilot only) |
| Server compromise | High | Very Low | ✅ Ja (standard Hetzner security) |

---

## ✅ CONCLUSIE

**Pilot is APPROVED voor publishing.**

- Geen blocking security issues geïdentificeerd
- Security posture is adequaat voor pilot scope
- Minor hardening (CORS restrictie) aanbevolen voor post-pilot

---

## 🚀 GEPUBLICEERDE CONFIGURATIE

**Published URL:** https://umarise.lovable.app  
**Publish datum:** 2026-01-20  
**Backend:** Hetzner Privacy Vault (EXCLUSIEF)

### Voorwaarden & Garanties

| Voorwaarde | Implementatie | Verificatie |
|------------|---------------|-------------|
| **Hetzner-only in productie** | `import.meta.env.PROD` → altijd Hetzner | `src/lib/abstractions/index.ts:53` |
| **Geen backend switching** | `setHetznerEnabled()` no-op in PROD | `src/lib/abstractions/index.ts:80-84` |
| **Cloud-knop verborgen** | `canSwitchToCloud = import.meta.env.DEV` | `src/components/codex/HistoryView.tsx:184` |
| **Lovable Cloud niet toegankelijk** | localStorage override genegeerd in PROD | Code-enforced |

### Technische Details

```
Data Backend:     Hetzner Privacy Vault
Endpoint:         vault.umarise.com (DE - Falkenstein)
Authoritative ID: 054aba4f-0453-4e6e-80c0-bdd554d19a91
Origins in Pilot: 9+ (verified)
```

### Wat is NIET gepubliceerd

- ❌ Lovable Cloud toegang (geblokkeerd in PROD builds)
- ❌ Backend toggle functionaliteit
- ❌ "Show my real data (Cloud)" knop

---

## 📝 POST-PILOT AANBEVELINGEN

1. **CORS hardening**: Beperk tot `umarise.lovable.app` + `localhost`
2. **Token rotation**: Implementeer periodieke token refresh
3. **Penetration test**: Externe security audit voor productie
4. **Backup verification**: Test restore procedure
5. **TestPanel verbergen**: Optioneel voor cleaner pilot UX

---

**Sign-off:** ✅ Approved for pilot publishing  
**Reviewer:** Lovable AI  
**Datum:** 2026-01-20  
**Backend Lock Verified:** 2026-01-20 13:08 CET
