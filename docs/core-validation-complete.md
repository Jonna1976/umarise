# Umarise Core — Validation Complete

> Status: 🟢 VALIDATED  
> Date: 2026-02-02  
> Validated by: Infrastructure Executor (Lovable)

---

## 1. Validation Scope

Full end-to-end simulation of external partner flow, executed **before** first real partner onboarding.

This validates:
- Permissioned attestation model
- HMAC-SHA256 key authentication
- Write-once immutability
- Public verification paths
- Key revocation mechanism

---

## 2. Test Execution

### Simulated Partners
| Partner Name | Key Prefix | Status |
|--------------|------------|--------|
| DesignPartner_Pilot001 | `SLIZjnQT` | Revoked |
| DesignPartner_Pilot002 | `j6f91BQj` | Revoked |

### Test Steps (6/6 Passed)

| Step | Endpoint | Expected | Result |
|------|----------|----------|--------|
| 1. Generate API Key | internal | 48-char key + HMAC hash | ✅ |
| 2. Register in DB | `partner_api_keys` | Row inserted | ✅ |
| 3. Create Attestation | `POST /core-origins` | 201 + `origin_id` | ✅ |
| 4. Resolve Attestation | `GET /core-resolve` | `found: true` | ✅ |
| 5. Verify Attestation | `POST /core-verify` | `match: true` | ✅ |
| 6. Revoke Key | `partner_api_keys.revoked_at` | Key invalidated | ✅ |

### Sample Attestation Created
```json
{
  "origin_id": "55899538-9c56-44bb-a5b4-8a1a44f30559",
  "hash": "sha256:1dfe3da7d142d5360524466778fe55c08144e196332bdf311ab97da144b7a8f5",
  "hash_algo": "sha256",
  "captured_at": "2026-02-02T14:10:13.734+00:00"
}
```

---

## 3. Database State Post-Validation

| Metric | Count |
|--------|-------|
| Total attestations | 6 |
| Active partner keys | 0 |
| Revoked partner keys | 4 |

All test keys revoked. System clean for production.

---

## 4. Immutability Enforcement

Database triggers verified active:

| Trigger | Table | Action | Status |
|---------|-------|--------|--------|
| `prevent_origin_attestation_update` | `origin_attestations` | Block UPDATE | ✅ Active |
| `prevent_origin_attestation_delete` | `origin_attestations` | Block DELETE | ✅ Active |
| `prevent_api_key_deletion` | `partner_api_keys` | Block DELETE | ✅ Active |

---

## 5. Operational Status

### Public Endpoints (No Auth Required)
| Endpoint | Method | Status |
|----------|--------|--------|
| `/core-resolve` | GET | 🟢 Operational |
| `/core-verify` | POST | 🟢 Operational |

### Permissioned Endpoint
| Endpoint | Method | Status |
|----------|--------|--------|
| `/core-origins` | POST | 🟢 Ready (requires partner key) |

### Internal Tooling (Issuer-Only)
| Tool | Purpose | Status |
|------|---------|--------|
| `internal-generate-partner-key` | Key generation + registration | 🟢 Operational |
| `internal-e2e-test` | Infrastructure validation | 🟢 Available |

---

## 6. Post-Validation State

Core enters **maintenance silence**:

- ❌ No further Core changes
- ❌ No additional features
- ❌ No optimizations
- ❌ No repeated tests

Core remains dormant until first real external partner requests attestation access.

---

## 7. Role Clarity

| Role | Responsibility |
|------|----------------|
| **Authority (Umarise)** | Decides who may attest (JA/NEE) |
| **Executor (Lovable)** | Technical execution: key gen, DB, revocation |
| **Partner (External)** | Uses Core via issued API key |

---

## 8. Governing Principle

> Verification is public. Attestation is permissioned.

This is standard for evidence infrastructure (TSA, DNS, Certificate Transparency).

---

*Validation record — do not modify*  
*Infrastructure Executor: Lovable*  
*Authority: Umarise*
