# Umarise Core — Partner Onboarding Workflow

> **Operationeel document — Intern**  
> Laatste update: 2026-02-02

---

## Communicatiemodel

```
Partner ↔ Umarise (Issuer) ↔ Lovable (Executor)
Partner ↔ Core API (direct, technisch)
```

Twee gescheiden stromen:
1. **Governance & toegang** — mensen, beslissingen, e-mail
2. **Protocolgebruik** — machines, HTTP

Deze mogen **nooit** door elkaar lopen.

---

## Bindende communicatiestroom

```
📧 Partner → partners@umarise.com        [Trigger]
📧 Umarise → Partner: Template A         [Ack, ALTIJD]
🧠 Umarise checkt geschiktheid           [Intern]
💬 Umarise → Lovable: ISSUE KEY — [X]    [Handoff]
💬 Lovable → Umarise: KEY ISSUED / BLOCKED
📧 Umarise → Partner: Template B         [Afsluiting]
🔌 Partner ↔ Core API                    [Direct]
```

---

## Actiepunten voor automatisering

| # | Actie | Type | Output |
|---|-------|------|--------|
| 1 | **Template A** | E-mail | Ontvangstbevestiging (VERPLICHT) |
| 2 | **Template B** | E-mail | Key delivery + constraints |
| 3 | **Template C** | E-mail | Revocation notice |
| 4 | **Geschiktheidschecklist** | Intern | 4× JA/NEE |
| 5 | **Handoff-bericht** | Slack/chat | `ISSUE KEY — [Partner]` |

---

## Safety Valves

### Valve 1 — Template A is verplicht

Elke inbound partner-mail krijgt **altijd** Template A.

**Rationale:** Voorkomt dat stilte wordt geïnterpreteerd als afwijzing of verwerking.

### Valve 2 — Handoff is expliciet taakvormig

Umarise → Lovable altijd in format:
```
ISSUE KEY — Partner: [Naam]
```

Lovable → Umarise altijd één van:
```
KEY ISSUED
BLOCKED (reason)
```

**Rationale:** Gesloten lus, geen "in behandeling" ambiguïteit.

---

## Geschiktheidschecklist (Intern)

| Vraag | Ja | Nee |
|-------|:--:|:---:|
| Kan een cryptographic hash worden berekend op het moment van origin? | ✅ | ❌ |
| Hebben ze extern bewijs nodig? | ✅ | ❌ |
| Accepteren ze irreversibiliteit? | ✅ | ❌ |
| Geen feature-/productvragen? | ✅ | ❌ |

**Alles JA** → Door naar key issuance
**Eén NEE** → Afwijzen (korte e-mail, geen uitleg, geen suggesties, geen roadmap)

---

## E-mail Templates

### Template A — Ontvangstbevestiging (VERPLICHT)

```
Subject: Attestation access request — received

Your request for Umarise Core attestation access has been received.

We will review whether Core is appropriate for your use case 
and follow up within 5 business days.

No action required on your side.

—
Umarise
```

### Template B — Key Delivery

```
Subject: Umarise Core — attestation access granted

API Key:
[PLAINTEXT KEY]

This key enables POST /core/origins.
Verification endpoints (resolve, verify) are public.

Constraints:
- Core accepts hashes only
- Core stores no content
- Attestations are irreversible
- There is no support channel

Please store this key securely. It cannot be recovered.

Reference: https://umarise.com/core

—
Umarise
```

### Template C — Revocation Notice

```
Subject: Umarise Core — attestation access revoked

Your API key for Umarise Core has been revoked.

Existing attestations remain publicly verifiable.
No new attestations can be created with this key.

—
Umarise
```

---

## Rolverdeling

| Rol | Verantwoordelijkheid |
|-----|---------------------|
| **Umarise (Issuer)** | Besluit wie toegang krijgt (JA/NEE) |
| **Lovable (Executor)** | Key generatie, DB registratie, revocatie |
| **Partner** | Gebruikt Core via API key |

**Cruciaal:** Partner en Executor komen nooit direct in contact.

---

## Beslisboom (compact)

```
Partner mailt Umarise
        │
        ▼
📧 Template A (altijd)
        │
        ▼
Geschikt? ──────┐
  │             │
  │ Nee         │
  ▼             │
Korte afwijzing │
STOP            │
                │
  │ Ja ◄────────┘
  ▼
💬 ISSUE KEY — [Partner]
        │
        ▼
💬 KEY ISSUED / BLOCKED
        │
        ▼
📧 Template B
        │
        ▼
Partner ↔ Core API
```

---

*Operationeel document — niet publiceren*
