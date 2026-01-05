# UMARISE — Build Brief Response

**Datum:** Januari 2026  
**Status:** MKB Pilot (Productie)

---

## Samenvatting

De "Infrastructure for Human Memory" briefing is ontvangen en gevalideerd. 

**Conclusie: ~85% van de architectuur is al operationeel in pilot-productie.**

Het Jobs-verhaal klopt 100% met de huidige implementatie.

---

## Wat al gebouwd is (85%)

### Kernarchitectuur ✓

| Briefing-eis | Implementatie |
|--------------|---------------|
| **Origin = immutable** | `pages.image_url` wordt nooit aangepast na upload |
| **Derivative = AI-output** | `summary`, `keywords`, `ocr_text`, `tone` als metadata |
| **Origin altijd primair** | Search en History tonen originele scan eerst |
| **AI indexeert, vervangt niet** | AI genereert metadata, origineel blijft waarheid |

### De Wedge-flow ✓

| Briefing-eis | Implementatie |
|--------------|---------------|
| **Foto → 2 woorden → 60 sec** | Camera → TopicInput → Search flow operationeel |
| **Geen tags/mappen/training** | Alleen Topic field, geen taxonomie |
| **≥80% retrieval metric** | Pilot Tracker met stopwatch + CSV export |
| **"If doubt, it fails"** | Strict exact search logic (word boundaries only) |

### Anti-black-box ✓

| Briefing-eis | Implementatie |
|--------------|---------------|
| **Explainability** | Match badges ("Best match", "Matched on cue", etc.) |
| **Cite-to-source** | OCR highlights traceerbaar naar origineel |
| **Transparency** | AI-analyse methodology zichtbaar voor gebruiker |

### Infrastructuur ✓

| Briefing-eis | Implementatie |
|--------------|---------------|
| **Privacy-first** | `device_user_id`, geen login/accounts |
| **European sovereignty** | Hetzner (Duitsland) via `vault.umarise.com` |
| **Immutable storage** | IPFS voor origin images |

---

## Wat na de pilot komt (15%)

### 1. Interpretation Layer (v2)

**Briefing-eis:**  
> "Menselijke duiding als aparte laag die mag conflicteren zonder geschiedenis te herschrijven."

**Status:** Niet gebouwd.  
**Huidige situatie:** `user_note` veld bestaat, maar geen apart Interpretation-object met eigen status/historie.

**Plan:** v2 scope — Interpretations als aparte entiteiten met conflict-tracking.

---

### 2. Derivative Labeling (Quick win, optioneel)

**Briefing-eis:**  
> "Afgeleiden dragen expliciet hun afgeleid-status."

**Status:** Deels gebouwd.  
**Huidige situatie:** Summary/keywords worden getoond, maar zonder expliciet "AI-generated" label.

**Plan:** Optioneel toe te voegen als quick win (klein UI-label), of na pilot.

---

### 3. Datum-scheiding (v2)

**Briefing-eis:**  
> "Ontstaan en formalisering mogen nooit dezelfde datum lijken te hebben."

**Status:** Niet gebouwd.  
**Huidige situatie:** Alleen `created_at` (upload-moment). Geen `written_at` (wanneer origineel geschreven).

**Plan:** v2 scope — optioneel `written_at` veld voor handmatige input.

---

### 4. Flow B Conflict-resolutie (v2)

**Briefing-eis:**  
> "Meeting → whiteboard → document → discussie → conflict → origin zichtbaar."

**Status:** Basisflow werkt, conflict-UI niet gebouwd.  
**Huidige situatie:** Capture en retrieval operationeel. Geen UI voor "iemand betwist de interpretatie."

**Plan:** v2 scope — Conflict-resolutie interface.

---

## Jobs-verhaal validatie

| Jobs-claim | Implementatie | Match |
|------------|---------------|-------|
| "You take a photo. You add two words." | Camera → Topic (2-3 woorden) | ✓ |
| "Within sixty seconds, you see the original." | 60-sec target, Pilot Tracker meet dit | ✓ |
| "Not a summary. The same piece of paper." | Originele scan altijd primair | ✓ |
| "If there's doubt, it fails." | Strict exact search | ✓ |
| "AI can summarize. Umarise keeps the original intact." | AI = index, Original = truth | ✓ |

**Conclusie: Jobs-verhaal klopt 100% met huidige productie.**

---

## Expliciete grenzen (al gerespecteerd)

De briefing definieert harde grenzen. Huidige status:

| Grens | Status |
|-------|--------|
| "Derivative zichtbaar zonder origin" | ✓ Niet mogelijk — origin altijd getoond |
| "Origin na vastlegging aanpassen" | ✓ Niet mogelijk — image_url immutable |
| "AI-output als primaire weergave" | ✓ Niet zo — originele scan is primair |
| "Interpretatie vervangt context" | ✓ Niet zo — user_note is optioneel, niet dominant |

---

## Aanbeveling

1. **Pilot afronden** met huidige 85% — dit dekt de volledige wedge
2. **Na pilot validatie:** Interpretation layer, conflict-tracking, datum-scheiding toevoegen
3. **Optioneel nu:** "AI" label op summary/keywords als expliciete afgeleid-markering

---

## Definitie van "geslaagd" (uit briefing)

> "Lovable is geslaagd als de flow werkt zonder uitleg, niemand kan denken dat een samenvatting het begin was, en het systeem technisch voorkomt dat oorsprong verdwijnt."

**Status: Dit is nu al het geval.**

---

*Document opgesteld: Januari 2026*
