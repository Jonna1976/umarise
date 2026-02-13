# Lovable Briefing: PWA Satisfying Redesign + Design Reference Fixes

## Doel

Twee soorten wijzigingen:
1. **Satisfying-niveau verhogen** — het sealed-moment moet voelen als "kijk wat je hebt," niet als "actie voltooid"
2. **Zes concrete fixes** op de design reference

Dit is een UX- en copy-briefing. De capture flow (hash, passkey, API calls) verandert niet.

---

## DEEL 1: SATISFYING REDESIGN

### Het probleem

De PWA scoort goed op Obvious (de + is universeel), Easy (foto → passkey → klaar), en Attractive (museum aesthetic, V7, goud). Het zwakste punt is **Satisfying**: het sealed screen zegt "Your anchor is ready." Dat is een bevestigingsscherm. Het zegt: je actie is gelukt. Het toont niet: kijk wat je nu hebt.

Het verschil:
- Bevestiging: "Het is gelukt" → gebruiker denkt "oké, volgende"
- Beloning: "Kijk wat er nu bestaat" → gebruiker denkt "dit is van mij"

### Drie veranderingen

---

### 1.1 Sealed screen: V7 is de spijker

V7 is niet decoratief. Het is structureel. Het is de spijker in de muur waar het schilderij aan hangt. Het houdt het bewijs op zijn plek.

**Huidig:**
```
[V7 met glow]
"Your anchor is ready"
[foto in frame]
ANCHOR 1916F13F
4 February 2026 · 20:35
[hash]
─────
certificate.json
proof.ots ●
[Download]
```

**Nieuw:**
```
[V7 — 36px, glow, centered]          ← de spijker
  |                                    ← gouden lijn (1px, 16px)
[foto in golden museum frame, 220px]  ← het schilderij hangt eraan

─────  (gold divider)

1916F13F
4 February 2026 · 20:35
884d5f17553df0a3884d5f17553df0a3

certificate · hash · proof.ots

[Save]
```

**Wat verandert en waarom:**

**V7 bovenaan, 36px, met glow.** Dit is het eerste wat je ziet. De spijker. Het ankerpunt. Met een subtiele gouden lijn (1px breed, 16px lang, gradient van goud naar transparant) die V7 verbindt met het frame eronder. De foto hangt aan V7.

**Anchored state:** Solid V7, volle glow, solid wire. Het hangt.
**Pending state:** Dashed V7 (stroke-dasharray 3 3), pulsend (opacity 0.3→0.7, 2.5s), ghost wire. Het wordt opgehangen.

**Geen titel.** Niet "Your anchor is ready," niet "Anchored," niets. V7 + foto + label zegt alles.

**Alles zichtbaar.** Hash volledig op één regel (JetBrains Mono 11px, 30% opacity). Proof components als één regel: `certificate · hash · proof.ots` (JetBrains Mono 10px, ghost, punten ertussen). Geen file-iconen, geen hints, geen uitleg. Wie het kent herkent het. Wie het niet kent ziet codes die bij het plaatje horen.

**Nul woorden uitleg.** Geen "your file stays on your device." Geen "only the hash leaves." Geen privacy whispers. Als het interface dat moet zeggen, is het interface fout.

**Pending feedback:** Bij pending state pulst de dot naast proof.ots mee met V7. Zodra Bitcoin bevestigt: alles wordt solid. Geen tekst als "pending" of "waiting."

**Save.** Niet Download (te technisch). Niet Keep (te emotioneel). Save is universeel. Save is wat je doet met iets dat je wilt bewaren.
- States: "Save" → "Saving..." → "✓" → auto-advance Wall (0.8s)
- Mobiel: triggert native Share Sheet met ZIP
- Desktop: download ZIP direct

---

### 1.2 De eerste anchor is anders

**Huidige situatie:** Eerste en vijfde anchor hebben exact hetzelfde sealed screen.

**Nieuw: na de allereerste anchor, vóór auto-advance naar Wall:**
- Na "✓ Saved" → 0.8s delay
- V7 verschijnt linksboven (24px) met een fade-in (0.6s)
- Dit is het moment dat de interface verandert: je hebt nu iets. De navigatie naar je Wall verschijnt omdat er iets in staat.
- Daarna auto-advance naar Wall (nog 0.8s)

Dit gebeurt alleen bij de eerste anchor. Alle volgende anchors gaan direct naar Wall na "✓ Saved".

**Waarom:** De eerste keer is speciaal. Niet door confetti of animatie, maar door een structurele verandering: de app verandert omdat jij iets hebt gedaan. V7 verschijnt. Je hebt nu een Wall.

---

### 1.3 Wall als satisfying loop

**De Wall is al goed.** Horizontale scroll, golden frames, atmospheric layers. De satisfying loop zit in: hoe meer je anchort, hoe meer je ziet. Eén tegel erbij per anchor.

**Eén toevoeging: nieuwste anchor krijgt 1.2s spotlight.**
- Bij auto-advance van sealed naar Wall: scroll direct naar het nieuwste artifact
- Dat artifact heeft 1.2s lang een subtiele extra glow op het frame: `box-shadow: 0 0 20px rgba(197,147,90,0.15)` die over 1.2s naar 0 fadet
- Daarna: normaal Wall-gedrag

**Waarom:** Je ziet je nieuwe anchor landen in de collectie. Het is er. Het hoort erbij.

---

## DEEL 2: ZES FIXES

### 2.1 Umarise nergens zichtbaar in de PWA

De PWA is anchoring.app. Umarise is infrastructuur, onzichtbaar.

**Manifest wijzigen:**
```json
{
  "name": "Anchoring",
  "short_name": "Anchor",
  "description": "Anchor what matters.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#050A05",
  "theme_color": "#050A05"
}
```

**Elders in de PWA:**
- Zoek en verwijder alle vermeldingen van "Umarise" in UI-tekst, meta tags, page titles
- `<title>` wordt "Anchoring" of gewoon leeg
- Geen "Powered by Umarise", geen footer, geen credits
- De enige plek waar een gebruiker "Umarise" tegenkomt is als een derde partij verifieert op umarise.com/verify — dat is bewust en correct

**Uitzondering:** De certificate.json in de ZIP mag een verify_url bevatten die naar umarise.com/verify wijst. Dat is infrastructuur, niet branding.

---

### 2.2 origin_id is het enige veld

Het database-veld en API-veld is `origin_id`. De frontend toont dit als het anchor-nummer zonder prefix.

**Sealed screen:** Toon `1916F13F` (geen "ANCHOR" prefix, geen "ORIGIN" prefix)
**Detail modal:** Toon `1916F13F` (idem)
**certificate.json:** Bevat `origin_id` (niet `anchor_id`)

De consument hoeft niet te weten dat het technisch origin_id heet. Het is gewoon het nummer.

---

### 2.3 File input: V2 scope, overweeg V1

De design reference specificeert:
```
accepts: image/*, application/pdf, audio/*, video/*, text/*
```

Dit is **V2 scope.** V1 is photos only.

**Advies:** Overweeg om V1 al met deze bredere input te lanceren. De backend (Core API) accepteert al elke hash — de beperking "photos only" is puur een App-keuze. Het uitbreiden naar PDF, audio, video, en tekst kost minimale frontend-effort (file input accept-attribuut + eventueel aangepaste preview-thumbnails per type) en vergroot de waarde aanzienlijk.

**Als V1 bij photos blijft:** Zet `accept="image/*"` en voeg een opmerking toe in de code: `// V2: expand to application/pdf, audio/*, video/*, text/*`

**Als V1 al breder wordt:** Houd de huidige accept-string. Voeg per filetype een passende artifact-frame toe in de Wall (de design reference heeft al frame types voor text, sound, digital).

---

### 2.4 Circumpunct vervangen door V7 status indicator

De circumpunct (ring + dot) wordt overal vervangen door V7 (hexagon + square hole) als status indicator.

**Drie V7 states (used as anchor point on sealed/detail, as status on Wall):**

**Anchored (bevestigd in Bitcoin):**
```svg
<!-- 36px — sealed screen nail -->
<svg viewBox="0 0 48 48" width="36" height="36"
  style="filter: drop-shadow(0 0 10px rgba(197,147,90,0.35));">
  <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="#C5935A"/>
  <rect x="17" y="17" width="14" height="14" rx="1.8" fill="#0F1A0F"/>
</svg>

<!-- 20px — Wall status under artifact -->
<svg viewBox="0 0 20 20" width="20" height="20">
  <polygon points="10,1.5 18,5.5 18,14.5 10,18.5 2,14.5 2,5.5"
    fill="#C5935A"/>
  <rect x="6.5" y="6.5" width="7" height="7" rx="0.9"
    fill="#0F1A0F"/>
</svg>
```
Solid gold hexagon. Glow on sealed/detail: `drop-shadow(0 0 10px rgba(197,147,90,0.35))`.
No glow on Wall (20px variant).

**Pending (wacht op Bitcoin-confirmatie):**
```svg
<!-- 36px — sealed screen nail, pulsing -->
<svg viewBox="0 0 48 48" width="36" height="36">
  <polygon points="24,4 42,14 42,34 24,44 6,34 6,14"
    fill="none" stroke="rgba(197,147,90,0.4)" stroke-width="1.2"
    stroke-dasharray="3 3"/>
  <rect x="17" y="17" width="14" height="14" rx="1.8"
    fill="rgba(197,147,90,0.15)"/>
</svg>

<!-- 20px — Wall status, pulsing -->
<svg viewBox="0 0 20 20" width="20" height="20">
  <polygon points="10,1.5 18,5.5 18,14.5 10,18.5 2,14.5 2,5.5"
    fill="none" stroke="rgba(197,147,90,0.3)" stroke-width="0.8"
    stroke-dasharray="2 2"/>
  <rect x="6.5" y="6.5" width="7" height="7" rx="0.9"
    fill="rgba(197,147,90,0.25)"/>
</svg>
```
Dashed outline, ghost fill. Pulsing: opacity [0.3 → 0.7 → 0.3], 2.5s infinite.

**Ghost (placeholder / empty state):**
```svg
<svg viewBox="0 0 20 20" width="20" height="20">
  <polygon points="10,1.5 18,5.5 18,14.5 10,18.5 2,14.5 2,5.5"
    fill="none" stroke="rgba(197,147,90,0.1)" stroke-width="0.6"/>
</svg>
```

**Waar te vervangen:**
- Sealed screen: 36px, bovenaan als anchor point (nail), anchored of pending
- Detail modal: 32px, bovenaan als anchor point (nail), anchored of pending
- Wall: 20px, onder elk artifact, anchored of pending
- Overal waar nu een circumpunct staat

**Wat NIET verandert:**
- V7 nav button linksboven (24px, altijd solid, tappable)
- V7 op first-visit capture screen (42px, centered, decorative)
- V7 processing state (64px, breathing)

---

### 2.5 Verificatie-flow en umarise.com/verify

**Huidige situatie:** "Upload and share" in detail modal vraagt de gebruiker om de ZIP opnieuw te selecteren van het device. Dat is een extra stap.

**Probleem:** De gebruiker heeft de ZIP al gedownload. Opnieuw selecteren voelt als frictie.

**Oplossing — twee verbeteringen:**

**A. Direct share via native Share Sheet (geen re-upload):**
Na het eerste "Save" (sealed screen) wordt de ZIP tijdelijk in memory gehouden (of in een temp cache). De "Share" button in de detail modal deelt direct vanuit die cache, zonder dat de gebruiker de ZIP opnieuw hoeft te selecteren.

Als de gebruiker de app sluit en later terugkomt, is de cache leeg. Dan valt de flow terug op: "Select your ZIP to share." Dat is acceptabel — het is de edge case, niet de hoofdflow.

**B. Verify link in certificate.json:**
De certificate.json bevat al origin_id, hash, en timestamp. Voeg een veld toe:

```json
{
  "origin_id": "1916F13F",
  "hash": "sha256:884d5f17...",
  "captured_at": "2026-02-04T20:35:12Z",
  "verify_url": "https://umarise.com/verify"
}
```

De ontvanger van de ZIP ziet de verify_url en weet waar te verifiëren. Dit is het enige moment dat "umarise.com" zichtbaar is — en dat is correct. Het is infrastructuur. Zoals een SSL-certificaat verwijst naar de CA.

**Over verificatie door derden:**
De primaire use case voor verificatie is een derde partij die de ZIP ontvangt en wil checken. Die derde partij gaat naar umarise.com/verify, dropt de ZIP, en ziet het resultaat. Dit is het enige contact met Umarise. Dat is precies goed:
- De consument gebruikt anchoring.app (geen Umarise)
- De verifier gebruikt umarise.com/verify (Umarise als infrastructuur)
- Hetzelfde patroon als: je verstuurt een e-mail (Gmail), de ontvanger verifieert de DKIM-signature (via DNS)

---

### 2.6 Manifest background_color

**Huidig:** `"background_color": "#0a0a0a"` — bijna puur zwart.
**Design tokens:** "Pure black (#000) is explicitly forbidden."

**Wordt:**
```json
"background_color": "#050A05",
"theme_color": "#050A05"
```

Consistent met `--ritual-bg`.

---

## DEEL 3: DESIGN REFERENCE UPDATE (nieuw)

De design reference HTML moet op de volgende punten worden bijgewerkt:

### Circumpunct sectie

**Verwijderen:** De hele "Circumpunct (⊙) — Status Indicator" sectie onder Symbols.

**Vervangen door:** "V7 Status Variants" sectie met de drie states (anchored, pending, ghost) zoals beschreven in 2.4.

### Sealed screen mockup

**Vervangen** volgens de nieuwe layout uit 1.1:
- V7 (36px, glow) bovenaan als anchor point
- Gouden wire (1px, 16px) naar golden frame
- Foto 220×220 in golden museum frame
- Gold divider
- Origin ID (geen prefix)
- Datum
- Hash (volledig, één regel, 30% opacity)
- Proof components (certificate · hash · proof.ots, één regel, ghost)
- Save button
- Geen titel, geen whisper, geen uitleg

### Wall mockup

**Vervangen** circumpunct onder artifacts door V7 status indicators (20px).

### Detail modal mockup

**Vervangen** circumpunct naast status tekst door V7 status indicator (20px).

### Hint tekst op Wall

**Huidig:** "long-press ⊙ to backup"
**Wordt:** "long-press to backup" (zonder symbool-referentie)

### Flow Diagram

Update het ASCII flow diagram zodat het de nieuwe sealed screen layout reflecteert (geen titel, foto centraal).

### Manifest sectie

Update met de nieuwe manifest-waarden (geen Umarise, correcte achtergrondkleur).

### File input notitie

Voeg toe: "(V2 scope — V1 may launch with image/* only)"

---

## SAMENVATTING

| Wat | Waar | Actie |
|-----|------|-------|
| Sealed screen: V7 als spijker | S2 | V7 36px bovenaan, wire naar golden frame, geen titel, alles zichtbaar |
| Nul uitleg | S2, S7 | Geen whisper tekst, geen privacy uitleg, geen "pending" tekst |
| Eerste anchor speciaal | S2 → Wall transitie | V7 nav fade-in na eerste save |
| Wall spotlight | S3 | Nieuwste anchor 1.2s glow bij auto-advance |
| Umarise verwijderen | Manifest, titles, alle UI | "Anchoring" overal |
| origin_id als enige veld | Sealed, detail, certificate | Nummer zonder prefix |
| File input scope | Capture | Markeer als V2, overweeg V1 uitbreiding |
| Circumpunct → V7 | Overal | 36px nail (sealed/detail), 20px status (Wall) |
| Verify flow | Detail modal, certificate.json | Direct share + verify_url in certificate |
| Background color | Manifest | #050A05 |

**Wat NIET verandert:**
- Capture flow (hash, passkey, API)
- V7 nav button gedrag
- Wall horizontale scroll en atmospheric layers
- Golden frame types
- Backend/API calls
- Two-state capture screen (first visit vs returning)
