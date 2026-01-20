# UMARISE — Privacy Model v1 Pilot

**Datum:** Januari 2026  
**Status:** MKB Pilot (Productie)

---

## Samenvatting

Dit document legt het exacte privacymodel vast voor de v1 pilot. Het onderscheid tussen **zero-access by design** (v1) en **cryptografische zero-knowledge** (v2 roadmap) is cruciaal voor eerlijke communicatie.

---

## v1: Zero-Access by Design

### Wat dit betekent

| Aspect | Implementatie |
|--------|---------------|
| **Policy-gebaseerd** | Umarise *kiest* ervoor data niet te lezen |
| **Device-isolatie** | `device_user_id` als secret key in localStorage |
| **RLS enforcement** | Supabase Row Level Security per device |
| **Data sovereignty** | Hetzner (Duitsland) voor EU data residency |
| **Geen accounts** | Geen email, login, of tracking |

### Wat technisch mogelijk is (maar niet gebeurt)

- Database admin kan theoretisch queries uitvoeren
- AI services (Gemini) zien content voor analyse
- Image storage (Hetzner IPFS) is niet client-side encrypted

### Waarom dit voldoende is voor pilot

1. **Vertrouwensmodel:** MKB-pilotklanten vertrouwen dat wij data niet lezen
2. **Focus:** Pilot test retrieval-waarde, niet cryptografische garanties
3. **Eerlijkheid:** Wij claimen geen onmogelijke garanties
4. **Roadmap:** v2 biedt cryptografische upgrade voor wie dat nodig heeft

---

## v2 Roadmap: Cryptografische Zero-Knowledge

### Wat dit betekent

| Aspect | Implementatie (v2) |
|--------|-------------------|
| **Client-side encryption** | AES-256 vóór upload |
| **Device-derived keys** | Sleutel nooit server-side |
| **Encrypted metadata** | Summary, OCR, keywords encrypted |
| **On-device AI** | Tesseract.js, lokale LLM (Phi-3/Gemma) |
| **E2E sync** | Encrypted blobs, QR-code key exchange |

### Waarom dit niet in v1

1. **AI breaks zero-knowledge:** Cloud AI (Gemini) moet content zien voor OCR/summary
2. **Scope lock:** Client-side crypto is weken werk, pilot moet nu af
3. **On-device AI niet productierijp:** Handwriting OCR vereist nog cloud models

---

## Communicatierichtlijnen

### ✅ Correct voor v1

- "Zero-access by design"
- "Data blijft op Europese servers (Duitsland)"
- "Geen accounts, geen email, geen tracking"
- "Device-gebaseerde isolatie"
- "Cryptografische encryptie staat op de v2 roadmap"

### ❌ Incorrect voor v1

- ~~"Zero-knowledge"~~ (impliceert cryptografische garantie)
- ~~"Wij kunnen uw data niet lezen"~~ (technisch onwaar)
- ~~"End-to-end encrypted"~~ (nog niet geïmplementeerd)

---

## Vergelijkingstabel

| Kenmerk | v1 (Pilot) | v2 (Roadmap) |
|---------|------------|--------------|
| **Model** | Zero-access by design | Cryptographic zero-knowledge |
| **Enforcement** | Policy + RLS | Cryptografie |
| **Image storage** | Unencrypted (Hetzner) | Client-side encrypted |
| **AI processing** | Cloud (Gemini) | On-device (Tesseract/Phi-3) |
| **Metadata** | Plaintext in DB | Encrypted in DB |
| **Multi-device sync** | Niet ondersteund | E2E encrypted |
| **Key management** | N/A (geen keys) | Device-derived keys |

---

## Risico-acceptatie

Voor de MKB pilot accepteren wij de volgende risico's:

| Risico | Mitigatie | Acceptatie |
|--------|-----------|------------|
| Database admin access | Audit logging, kleine team | ✅ Pilot scope |
| AI service ziet content | Gemini privacybeleid, Hetzner proxy | ✅ Pilot scope |
| Storage niet encrypted | Data sovereignty (EU), device isolation | ✅ Pilot scope |

---

## Conclusie

**v1 is eerlijk over haar beperkingen:**

- Wij claimen niet wat wij niet kunnen garanderen
- "Zero-access by design" is een belofte die wij kunnen waarmaken
- Cryptografische zero-knowledge is een concrete v2 deliverable, geen marketingterm

**Dit is infrastructuur-niveau integriteit.**

---

*Document opgesteld: Januari 2026*  
*Gevalideerd tegen: security-signoff-pilot-2026-01-20.md*
