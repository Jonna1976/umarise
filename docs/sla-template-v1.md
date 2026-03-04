# Service Level Agreement — Umarise Core API
*Template v1.0 · March 2026*

---

## 1. Scope

This SLA applies to the **Umarise Core API** (`/v1-core-origins`, `/v1-core-verify`, `/v1-core-resolve`, `/v1-core-proof`) accessed via a valid production API key (`um_live_*`).

Sandbox keys (`um_test_*`) and dry-run requests are **excluded** from this SLA.

---

## 2. Uptime commitment

| Metric | Target |
|--------|--------|
| Monthly uptime | **99.9%** |
| Maximum unplanned downtime per month | 43 minutes |
| Measurement method | Automated health checks every 5 minutes |
| Status page | Public, real-time: [/status](https://umarise.lovable.app/status) |

**Uptime** is defined as the percentage of 5-minute intervals in a calendar month during which the Core API returns HTTP 200 on the health endpoint.

**Excluded from downtime calculation:**
- Scheduled maintenance (announced ≥72 hours in advance)
- Force majeure events
- Issues caused by the partner's infrastructure or network

---

## 3. Incident response times

| Severity | Definition | Response time | Update frequency |
|----------|-----------|--------------|-----------------|
| **Critical** | Core API fully unavailable (status: `down`) | ≤ 30 minutes | Every 30 minutes |
| **High** | Core API degraded (elevated error rate or latency >2s) | ≤ 2 hours | Every 2 hours |
| **Medium** | Non-critical issue (e.g., delayed OTS proof upgrades) | ≤ 8 business hours | Daily |
| **Low** | Documentation error, cosmetic issue | ≤ 5 business days | On resolution |

**Communication channel:** Email to the partner's designated technical contact. Critical incidents are also reflected on the public status page.

---

## 4. Credit compensation

If monthly uptime falls below 99.9%, the partner receives anchor credits as compensation, applied automatically to their credit balance.

| Monthly uptime | Credit compensation |
|---------------|-------------------|
| 99.0% – 99.9% | **5%** of that month's anchor usage |
| 95.0% – 99.0% | **15%** of that month's anchor usage |
| < 95.0% | **30%** of that month's anchor usage |

**Terms:**
- Compensation is issued as prepaid anchor credits, not monetary refund
- Credits are applied within 10 business days after the end of the affected month
- Partner must request compensation within 30 days, citing affected dates
- Maximum compensation per month: 30% of that month's usage
- Compensation does not apply to sandbox/test traffic

---

## 5. Data durability

| Guarantee | Detail |
|-----------|--------|
| Origin registry | Immutable. No DELETE, no UPDATE. Records persist indefinitely. |
| Bitcoin anchoring | Submitted to OpenTimestamps within the same calendar day of origin creation |
| Proof availability | `.ots` proofs available via API and downloadable as ZIP |
| Proof independence | All proofs are verifiable without Umarise infrastructure (OTS CLI, Bitcoin block explorer) |

---

## 6. Maintenance windows

- **Scheduled maintenance:** Announced ≥72 hours in advance via email to partner contacts
- **Preferred window:** Sundays 02:00–06:00 CET
- **Zero-downtime deployments:** Standard practice. Maintenance windows are reserved for infrastructure changes only.

---

## 7. Support

| Channel | Availability |
|---------|-------------|
| Email (partners@umarise.com) | Business hours CET (Mon–Fri, 09:00–18:00) |
| Critical incident escalation | 24/7 via email with "CRITICAL" subject prefix |

---

## 8. Exclusions

This SLA does **not** cover:
- Sandbox/test API keys (`um_test_*`)
- Layer 3 attestation services (notary attestations have separate terms)
- Third-party services (Bitcoin network, OpenTimestamps calendar servers)
- Partner-side infrastructure, network, or integration issues
- Abuse or usage exceeding agreed rate limits

---

## 9. Term and review

- This SLA takes effect on the date of API key issuance
- Reviewed annually or upon mutual agreement
- Umarise reserves the right to **improve** SLA terms with 30 days notice
- Downgrade of SLA terms requires mutual written agreement

---

## 10. Definitions

| Term | Definition |
|------|-----------|
| **Anchor** | A single origin registration: hash + timestamp + Bitcoin anchor |
| **Origin** | The immutable registry entry created by a successful anchor |
| **Proof** | The `.ots` file that enables independent Bitcoin-level verification |
| **Uptime** | Percentage of 5-minute health check intervals returning operational status |
| **Credit** | One prepaid anchor unit (€0.10 at standard rate) |

---

*This is a template. Final terms are agreed per partner contract.*

*Umarise · partners@umarise.com*
