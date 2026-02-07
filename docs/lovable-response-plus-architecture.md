# Deel 1 — Reactie aan Lovable op hun technische analyse

**Datum:** 7 februari 2026
**Van:** Umarise
**Betreft:** Feedback op Lovable's technische analyse v5.3

---

Goede analyse. Helder opgesplitst. Hieronder vier punten die we willen meegeven voordat jullie starten.

## 1. Certificate.json — status hoort er niet in

Jullie voorstel bevat `"status": "pending"`. Dit is een probleem.

Een certificaat is een snapshot van onveranderlijke feiten op het moment van aanmaak. De status verandert later van pending naar anchored. Als status in het certificaat zit, moet het certificaat herschreven worden na anchoring — en dan is het geen betrouwbaar bewijs meer.

**Ons voorstel:**

```json
{
  "version": "1.0",
  "origin_id": "1916F13F",
  "hash": "884d5f17a2c3b4e6f1d2a3b4c5d6e7f8a1b2c3d4e5f6a7b8c9d0e1f2553df0a3",
  "hash_algo": "SHA-256",
  "captured_at": "2026-02-07T14:25:00Z",
  "verify_url": "https://verify.umarise.com",
  "claimed_by": null,
  "signature": null
}
```

Wat hier **niet** in staat:

- **`status`** — de status is dynamisch en wordt opgehaald via de API (`/v1-core-resolve`). Het certificaat bevat alleen feiten die niet veranderen.
- **`proof.ots`** — is een apart bestand in de ZIP, geen veld in het certificaat.

Wat hier **optioneel** in staat:

- **`claimed_by`** — de public key van de passkey. Alleen gevuld als de consument de passkey toggle inschakelt bij het opslaan van de ZIP.
- **`signature`** — cryptografische signature van de hash, gesigned door de private key. Verifieerbaar met de public key in `claimed_by`. Geen server-lookup nodig.

Dit formaat moet identiek zijn aan wat verify.umarise.com leest. Eén keer goed, voor altijd goed.

## 2. Passkey is niet volledig geparkeerd

Jullie zetten "WebAuthn/Passkey server-side" bij geparkeerd. De server-side implementatie is inderdaad later. Maar de **UI-kant moet nu gebouwd worden**.

De briefing beschrijft een fundamentele verandering: passkey is niet langer een eenmalige setup ("Prove card" bovenaan de Wall). Het is nu een **per-origin toggle** in de detail view:

- Consument tikt op een origin in Marked Origins
- Detail view toont de origin + "Save as ZIP" knop
- Daaronder: toggle "Include passkey signature" (aan/uit)
- Hint: "Links this origin to your identity via Face ID / fingerprint. No names, no emails."

**Wat nu gebouwd moet worden (UI):**
- De toggle in de detail view
- De hint-tekst
- De visuele feedback (toggle aan → hint actief)
- De ZIP-knop tekst past zich aan: "✓ ZIP saved" vs "✓ ZIP saved with passkey"

**Wat later komt (backend):**
- WebAuthn ceremony (server-side challenge/response)
- `credentialId` + `publicKey` opslag
- Daadwerkelijke signature generatie

De UI moet er nu staan, al is het als placeholder. De interactie is onderdeel van het design, niet van de backend.

## 3. Marked Origins is meer dan een hernoem

Jullie schrijven: "S7 Marked Origins — needs horizontal scroll gallery + detail view. Refactor."

Dit onderschat de scope. Het is niet "Wall of Existence met een andere naam". De hele structuur is veranderd:

**Verwijderd:**
- Prove card (passkey setup bovenaan)
- "New origin" knop

**Nieuw:**
- Museum-stijl: origins staan centraal, als artefacten in een collectie
- Detail view bevat nu ZIP save + passkey toggle (was alleen "Share complete ZIP")
- Share hint is gewijzigd naar: "Tap an origin to view, save as ZIP, or link your passkey."

De detail view in Marked Origins is nu het hart van de app na de create-flow. Daar zit de ZIP-opslag, de passkey-keuze, de status. Dit is nieuw interactiedesign, geen naamswijziging.

## 4. Achtergrondkleur: prototype is bindend

`#050A05` voor body, `#0F1A0F` voor schermen. Het prototype (umarise-flow1-v7.html) is de visuele waarheid.

---

## Voorgestelde volgorde (aangepast)

We zijn het eens met jullie volgorde, met één aanpassing:

1. **Certificate.json formaat** vastleggen — zonder `status` (zie boven)
2. **S0–S4 updates** naar v7 design spec
3. **S5 ZIP scherm** bouwen (nieuw)
4. **S6 Owned scherm** bouwen (nieuw)
5. **S7 Marked Origins** bouwen — inclusief detail view met ZIP save + passkey toggle UI
6. **Flow circulair maken** (S7 → S1 → … → S7)

Start met stap 1 (5 minuten besluit, bevestig het formaat hierboven) en dan S0–S4.

---
---

# Deel 2 — Wat de briefing betekent voor de Core/App split

## De vraag

De briefing (v5.3) beschrijft wat de consument ziet en doet. Maar wat betekent dat voor de scheiding tussen de PWA (App-laag) en de Core API? Waar lopen de grenzen, en wat mag de browser wel en niet doen?

## Het korte antwoord

**Core verandert niet.** Alle wijzigingen in v5.3 (Marked Origins, passkey toggle, kindertekening, S3 label) zijn App-laag. Core blijft exact wat het is: hash → anchor → verify.

## De grens, stap voor stap

### Wat de browser/PWA doet (App-laag)

| Actie | Waar | Raakt Core? |
|-------|------|-------------|
| Foto maken of kiezen | Device (camera / photo library) | Nee |
| SHA-256 hash berekenen | Client-side (Web Crypto API) | Nee |
| Hash naar Supabase sturen | Supabase `pages` INSERT | Indirect — trigger `bridge_page_to_core` propageert naar `origin_attestations` |
| Thumbnail opslaan | IndexedDB (lokaal) | Nee |
| ZIP genereren | Client-side (JSZip) | Nee |
| Certificate.json vullen | Client-side | Nee |
| Share sheet openen | Web Share API | Nee |
| Passkey WebAuthn ceremony | Client-side + Supabase Auth | Nee — Core weet niet dat passkeys bestaan |
| Signature genereren | Client-side (private key op device) | Nee |
| `claimed_by` + `signature` in certificate.json | Client-side | Nee |
| OTS status checken | PWA pull → `/v1-core-resolve` | Ja — leest van Core |
| proof.ots ophalen | `/v1-core-proof` | Ja — leest van Core |
| Alle 8 schermen (S0–S7) | Browser UI | Nee |

### Wat Core doet

| Actie | Endpoint | App betrokken? |
|-------|----------|----------------|
| Origin aanmaken | Trigger vanuit `pages` INSERT (B2C) of `POST /v1-core-origins` (B2B) | App schrijft naar `pages`, trigger doet de rest |
| Anchoring in Bitcoin | OTS Worker (Hetzner, achtergrond) | Nee |
| Status opzoeken | `GET /v1-core-resolve` | App leest dit |
| Hash verifiëren | `POST /v1-core-verify` | verify.umarise.com leest dit |
| Proof downloaden | `GET /v1-core-proof` | App leest dit |

### Wat er NIET over de grens gaat

| Dit gaat niet naar Core | Waarom |
|-------------------------|--------|
| De foto (bytes) | Nooit. Alleen de hash. |
| De thumbnail | Lokaal in IndexedDB. |
| De passkey public key | Staat in Supabase Auth, niet in Core. Core is identity-agnostic. |
| De signature | Staat in certificate.json op het device. Core weet er niet van. |
| Schermnamen, labels, UI-tekst | App-domein. Core heeft geen UX-velden. |
| Marked Origins / Wall concepten | App-domein. Core kent alleen `origin_attestations`. |

## De cruciale inzicht: passkey raakt Core niet

Dit is het belangrijkste architectuurpunt van v5.3.

De passkey-toggle ("Include passkey signature") is **volledig App-laag**:

1. De WebAuthn ceremony draait tussen de browser en Supabase Auth
2. De private key blijft op het device (Secure Enclave / TEE)
3. De public key gaat naar Supabase Auth (niet naar Core)
4. Bij het opslaan van een ZIP met passkey:
   - De App haalt de private key op via biometrie
   - De App signed de hash met de private key (client-side)
   - De App schrijft `claimed_by` (public key) + `signature` in certificate.json
   - De ZIP bevat het certificaat met deze velden
5. Bij verificatie op verify.umarise.com:
   - De derde opent het certificaat
   - De pagina verifieert de signature lokaal met de public key uit `claimed_by`
   - **Geen server-lookup nodig.** De public key zit in het certificaat zelf.

**Core hoeft nooit te weten dat passkeys bestaan.** De signature is self-contained in het certificaat. Dit is bewust: het houdt Core zuiver als trust primitive.

## Diagram: wat de browser doet per scherm

```
S0 Welcome       → Niets (pure UI)
S1 Capture        → Device: camera/photo library
S2 Pause          → Lokaal: foto tonen, "✓ saved"
S3 Mark           → Client-side: SHA-256 hash berekenen
                    Supabase: INSERT in `pages` (hash + timestamp)
                    → Trigger: `bridge_page_to_core` → `origin_attestations`
                    ← Core: origin_id terug naar `pages`
S4 Release        → UI: origin_id, hash, timestamp, PENDING status
S5 ZIP            → Client-side: ZIP genereren (photo + certificate.json)
                    Web Share API: OS share sheet
S6 Owned          → Pure UI → auto-advance
S7 Marked Origins → PWA pull: `/v1-core-resolve` voor status per origin
                    Als anchored: `/v1-core-proof` voor .ots
                    Client-side: ZIP regeneren met .ots erbij
                    Client-side: passkey toggle → signature in certificate
```

## Wat dit betekent voor implementatie

### De App (Lovable / Claude Code) moet:

1. **Client-side hashing** — Web Crypto API, SHA-256. Dit is al deels gebouwd.
2. **Supabase `pages` INSERT** — hash + timestamp. Trigger doet de rest. Dit is al gebouwd.
3. **ZIP generatie** — JSZip, client-side. photo.jpg + certificate.json. Moet gebouwd worden.
4. **OTS status polling** — bij app-open: check pending origins via `/v1-core-resolve`. Als anchored: ophalen proof.ots via `/v1-core-proof`. Moet gebouwd worden.
5. **Passkey UI** — toggle + feedback. Nu als UI-placeholder, later echte WebAuthn.
6. **Certificate.json** — formaat vastleggen (zie deel 1). Moet nu goed.

### Core hoeft niets te doen voor v5.3

Alle Core endpoints bestaan al:
- `origin_attestations` + trigger: ✅
- `/v1-core-resolve`: ✅
- `/v1-core-verify`: ✅
- `/v1-core-proof`: ✅
- OTS Worker: ✅

De enige Core-actie is **bevestigen dat het certificate.json formaat past bij wat `/v1-core-resolve` teruggeeft**. Dat is een formaat-afstemming, geen code-wijziging.

## Samenvatting: de split blijft schoon

| Laag | Verandert door v5.3? | Wat verandert? |
|------|---------------------|----------------|
| **Core** | **Nee** | Niets. Hash → anchor → verify. Ongewijzigd. |
| **App UI** | **Ja** | 8 schermen, Marked Origins, detail view, passkey toggle |
| **App logica** | **Ja** | ZIP generatie, OTS polling, certificate.json formaat |
| **Supabase Auth** | **Later** | WebAuthn passkey opslag (niet in eerste implementatie) |

De architectuursplit is precies zoals bedoeld: Core is het vertrouwensprimitief, de App is de consumentenervaring. v5.3 verandert de ervaring, niet het primitief.
