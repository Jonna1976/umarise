# Email Infrastructure

**Last updated**: January 29, 2026  
**Status**: ✅ Fully Configured & Verified

---

## Overview

| Component | Provider | Location |
|-----------|----------|----------|
| Email Hosting | ProtonMail | 🇨🇭 Switzerland |
| DNS Management | GoDaddy | Domain registrar |
| Domain | umarise.com | — |

**Why ProtonMail?**  
Zero-knowledge encryption aligns with the project's privacy-by-design philosophy. No email content is accessible to the provider.

---

## Active Email Addresses

| Address | Purpose | Status |
|---------|---------|--------|
| `j.fassbender@umarise.com` | Primary contact | ✅ Active |
| `partners@umarise.com` | Partner communications | ✅ Active |

**Catch-all**: Disabled (emails to non-existent addresses are rejected)

---

## DNS Records Configuration

All records are configured in **GoDaddy DNS Manager**.

### MX Records (Mail Exchange)

| Priority | Host | Value | TTL |
|----------|------|-------|-----|
| 10 | @ | `mail.protonmail.ch` | 1 Hour |
| 20 | @ | `mailsec.protonmail.ch` | 1 Hour |

### SPF Record (Sender Policy Framework)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | `v=spf1 include:_spf.protonmail.ch ~all` | 1 Hour |

**Purpose**: Authorizes ProtonMail servers to send email on behalf of umarise.com.

### DKIM Records (DomainKeys Identified Mail)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | `protonmail._domainkey` | `protonmail._domainkey.dxclj4p5cfpqtcxkuhsjd3jpmhqnhz3l.domains.proton.ch` | 1 Hour |
| CNAME | `protonmail2._domainkey` | `protonmail2._domainkey.dxclj4p5cfpqtcxkuhsjd3jpmhqnhz3l.domains.proton.ch` | 1 Hour |
| CNAME | `protonmail3._domainkey` | `protonmail3._domainkey.dxclj4p5cfpqtcxkuhsjd3jpmhqnhz3l.domains.proton.ch` | 1 Hour |

**Purpose**: Cryptographically signs outgoing emails to prevent spoofing.

### DMARC Record (Domain-based Message Authentication)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine` | 1 Hour |

**Policy**: `quarantine` — Suspicious emails are moved to spam (not rejected).

**Optional Enhancement**: Add reporting address:
```
v=DMARC1; p=quarantine; rua=mailto:j.fassbender@umarise.com
```

### Domain Verification

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | `protonmail-verification=...` | 1 Hour |

---

## Verification Status

All records verified in ProtonMail dashboard:

| Check | Status |
|-------|--------|
| Domain Verification | ✅ Verified |
| MX Records | ✅ Propagated |
| SPF Record | ✅ Active |
| DKIM Signatures | ✅ Active |
| DMARC Policy | ✅ Active |

---

## Coexistence with Lovable Hosting

**Critical**: The website A-record must remain intact while configuring email.

| Record | Host | Value | Purpose |
|--------|------|-------|---------|
| A | @ | `185.158.133.1` | Website (Lovable) |
| A | www | `185.158.133.1` | Website (Lovable) |
| TXT | _lovable | `lovable_verify=...` | Domain ownership |

Email records (MX, SPF, DKIM, DMARC) operate independently and do not conflict with website hosting.

---

## Troubleshooting

### DNS Propagation

- Use [DNSChecker.org](https://dnschecker.org) to verify global propagation
- MX records: Check type "MX" for `umarise.com`
- DKIM: Check type "CNAME" for `protonmail._domainkey.umarise.com`
- Full propagation can take up to 48-72 hours

### GoDaddy Access Issues

**Known Issue**: 2FA SMS delivery can be unreliable due to carrier filtering.

**Solution**: Configure an Authenticator App (Google Authenticator, Authy) as backup 2FA method.

**Workaround**: If SMS fails, try:
1. Incognito/private browser mode
2. Different browser (Chrome, Firefox)
3. Account recovery flow

### Email Not Receiving

1. Verify MX records are propagated (DNSChecker)
2. Check ProtonMail spam folder
3. Confirm sender isn't blocked
4. Verify catch-all setting if using non-standard address

---

## Security Considerations

| Feature | Implementation |
|---------|----------------|
| End-to-end encryption | ProtonMail (zero-knowledge) |
| SPF | Prevents unauthorized senders |
| DKIM | Cryptographic email signing |
| DMARC | Policy enforcement + reporting |
| 2FA | Enabled on ProtonMail account |

---

## Related Documentation

- [`infrastructure-overview.md`](./infrastructure-overview.md) — System architecture
- [`layer-boundaries.md`](./layer-boundaries.md) — Privacy boundaries

---

*Configuration completed: January 29, 2026*
