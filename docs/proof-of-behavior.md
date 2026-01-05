# UMARISE — Proof of Behavior

**Datum:** Januari 2026  
**Status:** MKB Pilot (Productie)

---

## Kernstelling

> Het systeem gedraagt zich alsof oorsprong belangrijker is dan uitleg — zonder dat iemand dat hoeft te onthouden, kiezen of bewaken.

Dit document bevat de technische bewijzen.

---

## 1. Foto → 2 woorden → klaar

**Claim:** De wedge werkt zonder uitleg.

**Code-bewijs:**

| Stap | Component | Gedrag |
|------|-----------|--------|
| Foto maken | `src/components/capture/CameraView.tsx` | Camera opent direct, geen menu |
| 2 woorden invoeren | `src/components/capture/TopicInput.tsx` | Autocomplete, max 2-3 keywords |
| Opslaan + indexeren | `src/lib/pageService.ts` → `createPage()` | AI analyseert, slaat origineel op |
| Terugvinden | `src/components/codex/SearchView.tsx` | Zoek op woorden, origineel eerst |

**Resultaat:** Geen taxonomie, geen training, geen mentale modellen nodig.

---

## 2. Origineel altijd zichtbaar

**Claim:** Het origineel is altijd primair in de UI.

**Code-bewijs:**

```typescript
// src/components/codex/SearchView.tsx (CarouselResults component)
<img
  src={result.page.imageUrl}
  alt="Page scan"
  className="w-full h-full object-contain"
  draggable={false}
/>
```

- `imageUrl` wordt getoond, niet `summary`
- Summary/keywords zijn secundaire metadata onder de scan
- `HistoryView.tsx` toont `h-32` image als primair element

**Resultaat:** Gebruiker ziet altijd handschrift, nooit alleen AI-samenvatting.

---

## 3. AI kan niets overschrijven

**Claim:** AI-output is metadata, geen object. Origineel is onveranderbaar.

**Code-bewijs:**

```typescript
// src/lib/pageService.ts - updatePage()
export async function updatePage(id: string, updates: {
  userNote?: string;
  primaryKeyword?: string;
  ocrText?: string;
  sources?: string[];
  projectId?: string;
  futureYouCue?: string;
  futureYouCues?: string[];
  writtenAt?: Date;
  highlights?: string[];
  tone?: string[];
}): Promise<boolean>
```

**Wat ontbreekt:** `imageUrl` staat **niet** in de update-interface.

```typescript
// src/integrations/supabase/types.ts - pages.Row
image_url: string  // Alleen in Row, niet optioneel
```

**Resultaat:** Er bestaat geen code-pad om `image_url` te wijzigen na creatie.

---

## 4. Bij twijfel: geen resultaat

**Claim:** Het systeem faalt expliciet bij onzekerheid.

**Code-bewijs:**

```typescript
// supabase/functions/search-pages/index.ts
// Strict word-boundary matching, geen fuzzy fallback

// Score alleen bij exacte match:
if (matchTypes.length > 0) {
  results.push({
    pageId: page.id,
    page,
    score,
    matchTypes,
    matchedTerms
  });
}
```

**Wat ontbreekt:**
- Geen Levenshtein fuzzy matching in productie (functie bestaat, wordt niet gebruikt)
- Geen "bedoelde je...?" suggesties
- Geen probabilistische ranking met lage confidence

**Resultaat:** Geen resultaat = geen resultaat. Geen "misschien dit?".

---

## 5. AI = metadata, geen entiteit

**Claim:** AI heeft geen eigen object-status.

**Code-bewijs:**

```typescript
// src/integrations/supabase/types.ts - pages table
summary: string | null           // Kolom, geen FK
keywords: string[] | null        // Kolom, geen FK
tone: string | null              // Kolom, geen FK
ocr_text: string | null          // Kolom, geen FK
```

**Wat ontbreekt:**
- Geen `ai_analyses` tabel
- Geen `derivatives` tabel met eigen lifecycle
- Geen versioning van AI-output

**Resultaat:** AI-output is eigenschap van page, niet eigen entiteit met rechten.

---

## 6. Origin technisch onveranderbaar

**Claim:** Geschiedenis kan niet herschreven worden, zelfs niet per ongeluk.

**Code-bewijs:**

| Laag | Implementatie | Effect |
|------|---------------|--------|
| Storage | Hetzner IPFS via `hetzner-storage-proxy` | Content-addressed, CID = hash van content |
| Database | `image_url` geen UPDATE path | Geen code om te wijzigen |
| UI | Origineel altijd primair | Gebruiker ziet altijd bron |

```typescript
// src/lib/abstractions/storage.ts
// Upload only, geen update/replace functie voor images
```

**Resultaat:** Immutability door architectuur, niet door policy.

---

## 7. Geen taxonomie, tags, of mappen

**Claim:** Gebruikers hoeven niets te leren.

**Code-bewijs:**

```typescript
// src/components/capture/TopicInput.tsx
// Enige input: vrije tekst met autocomplete
<Input
  placeholder="Waar gaat dit over? (2-3 woorden)"
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
/>
```

**Wat ontbreekt:**
- Geen `folders` tabel
- Geen `tags` tabel  
- Geen hiërarchische navigatie
- Geen verplichte categorisering

**Resultaat:** Capture = foto + 2 woorden. Retrieval = zoeken. Klaar.

---

## Samenvatting

| Claim | Bewijs-type | Verificatie |
|-------|-------------|-------------|
| Wedge werkt zonder uitleg | Code flow | ✔ Geen onboarding componenten |
| Origineel altijd zichtbaar | UI code | ✔ `imageUrl` primair in alle views |
| AI kan niets overschrijven | Type definitions | ✔ `imageUrl` niet in update interface |
| Bij twijfel geen resultaat | Search logic | ✔ Strict matching, geen fuzzy |
| AI = metadata | Database schema | ✔ Kolommen, geen entiteiten |
| Origin onveranderbaar | Storage + code | ✔ IPFS + geen update path |
| Geen taxonomie | Component audit | ✔ Geen folder/tag systemen |

---

## Harde conclusie

Het gedrag is geen keuze die bewaakt moet worden.  
Het gedrag is een gevolg van code die geen alternatief toelaat.

**Dat is infrastructuur.**

---

*Document opgesteld: Januari 2026*  
*Code-referenties gevalideerd tegen: `main` branch*
