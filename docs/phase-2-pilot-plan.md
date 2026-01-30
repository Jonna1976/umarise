# Phase 2 Pilot Plan — Commerciële Validatie

> **Doel:** 3 MKB teams, 21 dagen, bewijs van integratiewaarde  
> **Aanpak:** Waarde-eerst, geen sales-pitch  
> **Startdatum:** Februari 2026

---

## 🎯 Validatie-doelen

| Doel | Succes-criterium | Status |
|------|------------------|--------|
| **Eerste betalende klant** | €1+ betaald voor pilot toegang | ⏳ |
| **Partner API-integratie** | Externe partij roept `/resolve` of `/verify` aan | ⏳ |
| **Due diligence sign-off** | CTO/tech-lead bevestigt architectuur-kwaliteit | ⏳ |

---

## 📋 Pilot Selectie-criteria

### Ideaal MKB Profiel

| Criterium | Waarom |
|-----------|--------|
| **Digitale content-creatie** | Dagelijkse origin-momenten |
| **Compliance-druk** | Intrinsieke motivatie voor bewijs |
| **Technische capaciteit** | Kunnen API evalueren |
| **< 50 medewerkers** | Korte beslislijnen |

### Geschikte Sectoren

1. **Creatieve bureaus** — Bewijs van origineel werk
2. **Adviesbureaus** — Vastleggen van deliverables
3. **Tech startups** — IP-bescherming, investor-ready
4. **Bouwbedrijven** — Opleverdocumentatie

---

## 🚀 Pilot Aanpak (Geen Sales)

### Week 0: Uitnodiging

**Boodschap (geen pitch):**

> "We bouwen infrastructuur voor origin-registratie.  
> We zoeken 3 teams die willen testen of dit waarde toevoegt aan hun workflow.  
> Geen verplichtingen. Alleen feedback."

**Concreet aanbod:**
- 21 dagen volledige toegang
- Directe Slack/WhatsApp support
- Wekelijkse 15-min check-in (optioneel)
- Exit-interview na afloop

### Week 1-2: Onboarding + Eerste Captures

| Dag | Activiteit |
|-----|------------|
| 1 | Account setup + eerste capture |
| 2-3 | 5+ origins vastleggen |
| 7 | Check-in: "Wat mis je?" |
| 14 | Check-in: "Wat zou je missen als dit weg was?" |

### Week 3: Integratie-test + Evaluatie

| Activiteit | Doel |
|------------|------|
| API walkthrough | Partner roept `/resolve-origin` aan |
| Verify demo | Externe verificatie van hun origin |
| Exit interview | Validatie-data verzamelen |

---

## 📊 Meetbare Uitkomsten

### Kwantitatief

| Metric | Target |
|--------|--------|
| Origins per team | ≥20 |
| Retrieval <60s | ≥80% |
| API-aanroepen extern | ≥1 per team |
| NPS score | ≥40 |

### Kwalitatief (Exit Interview)

1. "Wat zou je missen als Umarise morgen verdwijnt?"
2. "Waar in je workflow past dit het beste?"
3. "Zou je hiervoor betalen? Zo ja, hoeveel?"
4. "Wie in je netwerk zou dit ook kunnen gebruiken?"

---

## 💰 Pilot Pricing (Waarde-validatie)

### Optie A: Gratis met Commitment

- €0 voor 21 dagen
- Vereist: 3x check-in calls + exit interview
- Doel: Maximale feedback

### Optie B: Betaalde Pilot (Validatie)

- €49 eenmalig voor 21 dagen
- Inclusief: Priority support + API toegang
- Doel: Bewijs van betalingsbereidheid

**Aanbeveling:** Start met Optie A voor eerste 2 teams, Optie B voor team 3.

---

## 📅 Timeline

```
Week 0  │ Uitnodiging versturen (3 kandidaten)
        │
Week 1  │ Team 1 start
        │ Team 2 start
        │
Week 2  │ Team 3 start
        │ Check-in calls
        │
Week 3  │ API integratie-tests
        │ Exit interviews beginnen
        │
Week 4  │ Alle exit interviews af
        │ Pilot rapport + beslissing
```

---

## 📝 Outreach Template (Problem-First)

### Cold Outreach (LinkedIn/Email)

**Onderwerp:** Kun je bewijzen wat de input was?

**Body:**

> Hoi [naam],
>
> Korte vraag: als een klant morgen zegt dat jouw AI-output fout was — 
> kun je dan bewijzen wat de originele input was?
>
> Ik bouw een infrastructuurlaag die precies dat mogelijk maakt.
> Geen product, geen platform — alleen: capture, hash, verify.
>
> Ik zoek 3 technische leads die dit willen evalueren.
> Geen sales, alleen feedback.
>
> Eén URL: umarise.com/review
>
> Als dit irrelevant is: negeer gerust.
> Als dit resoneert: 15 minuten?
>
> [naam]

### Follow-up (na interesse)

> Dit is wat je krijgt:
>
> - Review Kit (read-only demo + proof bundle)
> - API docs voor integratie-evaluatie
> - Direct contact voor technische vragen
>
> Wanneer past een korte call?

---

## ✅ Pilot Checklist

### Pre-launch

- [ ] 3 kandidaat-teams geïdentificeerd
- [ ] Outreach verstuurd
- [ ] Onboarding flow getest
- [ ] Support kanaal opgezet (Slack/WhatsApp)

### During Pilot

- [ ] Week 1 check-ins gepland
- [ ] Week 2 check-ins gepland
- [ ] API docs gedeeld met tech-leads
- [ ] Issues/feedback gelogd

### Post-pilot

- [ ] Exit interviews afgenomen
- [ ] NPS scores verzameld
- [ ] Pilot rapport geschreven
- [ ] Go/no-go beslissing Phase 2B

---

## 🎯 Succes-definitie

**Phase 2 is geslaagd als:**

1. ≥1 team zegt: "Ik zou betalen voor dit"
2. ≥1 team roept de API aan vanuit eigen systeem
3. ≥1 tech-lead bevestigt: "Dit is solide gebouwd"

**Bonus:**
- Team refereert ander team
- Spontane use-case ontdekt

---

## 🔌 API-First Onboarding (Tech-Leads)

### Quick Start (15 minuten)

**Stap 1: Eerste origin resolven**

```bash
# Resolve een bestaande origin
curl "https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/resolve-origin?origin_id=YOUR_ORIGIN_ID"
```

**Response:**
```json
{
  "found": true,
  "origin_id": "fb025c0e-0dc8-4b4f-b795-43177ea2a045",
  "origin_hash_sha256": "1f205f1eb69abefd...",
  "hash_status": "verified",
  "origin_mark": "ᵁ",
  "captured_at": "2026-01-28T14:32:00Z",
  "origin_link_url": "https://umarise.lovable.app/origin/..."
}
```

**Stap 2: Origin verifiëren**

```bash
# Verify bit-identity van origin content
curl -X POST "https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "origin_id": "YOUR_ORIGIN_ID",
    "content": "BASE64_ENCODED_IMAGE"
  }'
```

**Response:**
```json
{
  "verified": true,
  "origin_id": "fb025c0e-...",
  "submitted_hash": "1f205f1eb69abefd...",
  "stored_hash": "1f205f1eb69abefd...",
  "match": true
}
```

### API Endpoints Overzicht

| Endpoint | Method | Auth | Doel |
|----------|--------|------|------|
| `/resolve-origin` | GET | Public | Origin metadata opvragen |
| `/verify` | POST | Public | Bit-identity verificatie |
| `/origins` | POST | API Key | Nieuwe origin registreren |

### Integratie Scenario's

**Scenario A: Verificatie in eigen systeem**

```typescript
// TypeScript voorbeeld
async function verifyOrigin(originId: string, imageBlob: Blob): Promise<boolean> {
  const base64 = await blobToBase64(imageBlob);
  
  const response = await fetch(
    `https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/verify`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_id: originId,
        content: base64
      })
    }
  );
  
  const result = await response.json();
  return result.verified && result.match;
}
```

**Scenario B: Origin metadata embedden**

```typescript
// Resolve origin en toon in eigen UI
async function getOriginMetadata(originId: string) {
  const response = await fetch(
    `https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1/resolve-origin?origin_id=${originId}`
  );
  
  const data = await response.json();
  
  if (data.found) {
    return {
      capturedAt: data.captured_at,
      hash: data.origin_hash_sha256,
      verifyUrl: data.origin_link_url,
      isVerified: data.hash_status === 'verified'
    };
  }
  
  return null;
}
```

**Scenario C: Origin link in documenten**

```markdown
Dit document is gebaseerd op origin: [ᵁ Verify](https://umarise.lovable.app/origin/fb025c0e-...?verify=1f205f1eb69abefd...)
```

### Tech-Lead Checklist

**Week 1: Exploratie**
- [ ] Resolve 3 origins via API
- [ ] Bekijk response structuur
- [ ] Identificeer integratie-punt in eigen stack

**Week 2: Prototype**
- [ ] Bouw eenvoudige verify-call
- [ ] Test met echte origin uit pilot
- [ ] Documenteer use-case

**Week 3: Evaluatie**
- [ ] Demo aan team
- [ ] Feedback op API design
- [ ] Bespreek productie-requirements

### Technische Vragen voor Exit Interview

1. "Was de API documentatie voldoende?"
2. "Welke endpoints miste je?"
3. "Hoe zou je dit in productie deployen?"
4. "Welke SLA zou je verwachten?"
5. "Zijn er security-concerns?"

---

## 📎 Resources

- [Integration Contract](./integration-contract.md) — API docs voor partners
- [CTO Technical Factsheet](./cto-technical-factsheet.md) — Due diligence baseline
- [Layer Boundaries](./layer-boundaries.md) — Scope definitie

---

*Phase 2 Plan — Februari 2026*
