# Lovable Briefing — Umarise Complete

**Datum:** 7 februari 2026
**Van:** Umarise
**Aan:** Lovable
**Type:** Complete specificatie: App Flow + Verificatiepagina + Identity + Architectuur
**Versie:** 5.3
**Prototype:** umarise-flow1-v7.html (bijgevoegd)

---

## Inhoudsopgave

1. Kernprincipe
2. Drie-partijen model
3. Twee-fasen-bewijs
4. Flow 1: App (S0–S7) — scherm voor scherm
5. De volledige reis: 40 stappen van consument tot verificatie
6. verify.umarise.com — Verificatiepagina
7. Flow 2: B2B via API (context)
8. Passkey architectuur
9. Auto-save
10. Visuele consistentie
11. Juridisch
12. Technische acties voor Lovable
13. Verificatievragen

---

## 1. Kernprincipe

Umarise slaat geen persoonlijke data op. Niet voor opt-in, niet na opt-in. Niet nu, niet later. Dit is geen feature, het is architectuur. Als deze belofte ooit gaat wringen, halen we de identity-optie eruit. Wij zijn identity-agnostic, private by design.

---

## 2. Drie-partijen model

| Partij | Rol | Ziet het bestand? |
|--------|-----|-------------------|
| **Consument** | Maakt de foto, bezit de ZIP | Ja — het is hun bestand |
| **Derde partij** (verzekeraar, advocaat, arts) | Ontvangt de ZIP als bewijs | Ja — de consument deelt het |
| **Umarise Core** | Ontvangt uitsluitend de hash. Verankert | Nee — nooit |

Umarise ziet, verwerkt of slaat het originele bestand niet op. Alleen de hash verlaat het device. Dit geldt bij aanmaken, bij delen, en bij verifiëren.

---

## 3. Twee-fasen-bewijs

Het bewijs ontstaat in twee fasen. Dit is geen bug, het is architectuur.

**Fase 1: Instant (seconden)**
Hash + timestamp + origin_id worden geregistreerd in Core. Status: **pending**. De origin bestaat, maar is nog niet extern verankerd.

**Fase 2: Verankerd (~20–120 min, 1–2 Bitcoin blocks)**
De hash is opgenomen in een Bitcoin-transactie via OpenTimestamps. Status: **anchored**. Het bewijs is nu onafhankelijk verifieerbaar en onveranderbaar.

De ZIP die de consument op S5 opslaat bevat photo.jpg + certificate.json. De proof.ots is er nog niet — anchoring duurt 1–2 blocks. Zodra de proof verankerd is, wordt de .ots beschikbaar in Marked Origins. Vanuit Marked Origins kan de consument een **complete ZIP** opslaan — mét .ots. De consument hoeft niet te wachten op S5; de eerste ZIP is al geldig bewijs (pending status).

**Tijdsaanduiding overal consistent:** "1–2 blocks". Nooit "a few hours".

---

## 4. Flow 1: App (S0–S7) — scherm voor scherm

De consument doorloopt één reis: van een bestand dat er is naar een origin die vastligt. De rode draad is **origin**. Enkelvoud. Eén origin per keer.

### Schermoverzicht (8 schermen)

| # | Scherm | Wat de consument ziet | Rode draad |
|---|--------|-----------------------|------------|
| S0 | Welcome | "Own your origin" · ademende origin dot | belofte |
| S1 | Capture | Origin dot in capture ring. Tik opent native OS picker | — |
| S2 | Pause | "Your artifact" · foto in native oriëntatie · "✓ saved" | dit is wat je hebt |
| S3 | Mark | "Your artifact" · "hold to mark" · gouden kader tekent zichzelf (1.2s) | actie |
| S4 | Release | "Origin marked" · hash · origin_id · timestamp · PENDING | het wordt een origin |
| S5 | ZIP | "Your origin is ready" · ZIP-inhoud · share sheet · "✓ Owned" | belofte ingelost |
| S6 | Owned | "Owned." · origin dot · auto-advance naar Marked Origins | cirkel sluit |
| S7 | Marked Origins | Museum-stijl overzicht · tap origin voor detail + ZIP save + passkey toggle | thuisbasis |

S6 "Owned." is het einde van de create-flow. Auto-advance naar S7 na 2 seconden.

Marked Origins (S7) is de thuisbasis. Bevat:
- **Museum-stijl overzicht** — origins horizontaal scrollend, elk in eigen kader met datum
- **Origin detail view** — tap op origin toont status (pending/anchored) + **"Save as ZIP"** knop + **passkey toggle**
- **Passkey toggle in detail view** — "Include passkey signature" (aan/uit). Bij eerste gebruik: triggert WebAuthn setup (Face ID / fingerprint). Daarna onthouden. ZIP wordt opgeslagen mét of zonder passkey-signature, naar keuze van de consument.
- **Share hint** — "Tap an origin to view, save as ZIP, or link your passkey."

De flow is circulair: Marked Origins → capture → mark → owned → Marked Origins.

### S0: Welcome

Drie woorden: **"Own your origin"**

Een ademende origin dot eronder. Meer niet. De consument weet nog niet wat een origin is. Dat leert zij door het te doen. Binnen 30 seconden.

### S1: Capture

De origin dot staat centraal in een capture ring. Dezelfde dot als op het welkomstscherm, dezelfde positie, dezelfde ademhaling. Herkenning.

**Interactie:** tik op de dot. Het native OS-menu verschijnt:

- **Take Photo** (camera)
- **Photo Library** (bestaande foto's)

Geen custom UI. Het OS regelt de presentatie.

**V1: alleen foto's.** "Choose File" (documenten, PDF's, video's) is bewust geparkeerd. Uitbreiding voor later.

**Technisch:** `<input type="file" accept="image/*">` met `capture` attribuut, of native equivalent via Capacitor/React Native.

### S2: Pause

**"Your artifact"** verschijnt boven de foto.

De foto verschijnt in haar **native oriëntatie**. Landscape blijft landscape, portrait blijft portrait. Geen cropping, geen vervorming.

Daaronder: **"✓ saved to your device"** in italic. Bevestiging van iets dat al stil is gebeurd.

**Woordkeuze:** "artifact", niet "origin". Het is nog geen origin. Het wordt pas een origin na marking (S4). Dit onderscheid is bewust.

**Technisch:** `object-fit: contain` binnen responsief container-element. EXIF-oriëntatie respecteren.

### S3: Mark

**"Your artifact"** verschijnt boven de foto — dezelfde titel als op S2. De foto staat op dezelfde hoogte als op S2. Visuele continuïteit.

**"hold to mark"** verschijnt als hint eronder. Goud, 17px, Playfair Display, gecentreerd onder de foto.

De consument houdt de foto ingedrukt. 1.2 seconden. Het gouden kader tekent zichzelf rondom de foto als visuele feedback. Bij voltooiing: een flits van goud.

Dit is het moment waarop de origin ontstaat. De hash wordt berekend, het verzoek gaat naar Core.

**Technisch:** press-and-hold (1.2s), `stroke-dashoffset` animatie op SVG rect. Client-side SHA-256 hash via Web Crypto API. Alleen de hash verlaat het device.

### S4: Release

**"Origin marked"**

Het Umarise-zegel verschijnt. Daaronder:

- ORIGIN ID [8-karakter hex]
- Datum en tijd
- Volledige SHA-256 hash (twee regels)
- ⏳ PENDING status
- "Bitcoin anchoring takes 1–2 blocks. Your origin is registered. No action needed."

### S5: ZIP — het kernmoment

Dit is het scherm waar de belofte wordt ingelost. Drie fasen:

**Fase 1: ZIP-inhoud zichtbaar**

Klein ZIP-icoon bovenaan. Titel: **"Your origin is ready"**

Drie bestanden met subtiele SVG-iconen:

- photo.jpg · original bytes
- certificate.json · hash · origin_id · timestamp
- proof.ots · anchoring (met pulserende dot)

Anchoring-notitie (italic, 12px): "Your proof is anchoring in Bitcoin. This takes 1–2 blocks. The complete .ots will be available in your Marked Origins."

**Fase 2: Save**

Knop: **"Save your origin"** (goud, pill-shaped)

Tik opent de **native OS share sheet** (Web Share API). De consument ziet:

- Bestandsnaam: origin-[ID].zip
- Opties: Save to Files, AirDrop, WhatsApp, meer

De consument kiest een bestemming. Eén tap.

**Technisch (productie):** `navigator.share({ files: [zipBlob] })` opent het echte OS share sheet. Fallback: `<a download>` voor browsers zonder Web Share API. Het prototype simuleert dit met een iOS-achtige sheet.

**Fase 3: Owned**

Na save: knop wordt **"✓ Owned"**. Na 1.2 seconden automatisch door naar S6.

### S6: Owned

**"Owned."**

Eén woord. De belofte uit S0 ("Own your origin") is ingelost. De origin dot keert terug met dezelfde ademhaling als op S0.

Na 2 seconden: auto-advance naar Marked Origins (S7). De flow is circulair:

- Eerste keer: S0 → S1 → S2 → S3 → S4 → S5 → S6 (Owned) → S7 (Marked Origins)
- Elke volgende keer: S7 (Marked Origins) → S1 → S2 → S3 → S4 → S5 → S6 (Owned) → S7 (Marked Origins)

PWA-installatie: het OS handelt dit automatisch af via native install-banner na herhaald bezoek.

### S7: Marked Origins

Marked Origins is de thuisbasis. Na S6 (Owned) landt de consument hier. Museum-stijl: origins staan centraal, als artefacten in een collectie.

**Overzicht van alle origins:**

Horizontaal scrollend. Elk in een eigen kader met datum. Museum-sfeer: origins naar voren, interface op de achtergrond.

**Detail view (tap op origin):**

- Foto/artifact in gouden kader
- Origin ID, datum, hash
- **Status indicator:** ⏳ PENDING of ✅ ANCHORED IN BITCOIN
- **"Save as ZIP"** knop — altijd beschikbaar. Opent OS share sheet met ZIP. Bij pending: ZIP bevat photo.jpg + certificate.json. Bij anchored: ZIP bevat photo.jpg + certificate.json + proof.ots.
- **Passkey toggle:** "Include passkey signature" (aan/uit). Subtiel onder de ZIP-knop. Bij eerste gebruik: triggert WebAuthn setup (Face ID / fingerprint). Daarna onthouden. Hint: "Links this origin to your identity via Face ID / fingerprint. No names, no emails."
- Privacy-notitie: "your file stays on your device · only the proof leaves"

**De passkey-keuze per origin:** De consument beslist bij het opslaan of de ZIP een passkey-signature bevat. ZIP zonder passkey = anoniem bewijs. ZIP met passkey = bewijs + auteurschap. Beide zijn geldig. De keuze is per origin, op het moment dat het ertoe doet.

**Share hint boven de origins:**

"Tap an origin to view, save as ZIP, or link your passkey." Italic, subtiel.

Long-press op het ∪ zegel voor backup.

---

## 5. De volledige reis: 40 stappen van consument tot verificatie

### Consument maakt origin (gratis via Umarise app)

1. Opent Umarise app. Geen account, geen registratie
2. Maakt foto of kiest bestand
3. App hasht het bestand op het device (Web Crypto API, SHA-256). De app hasht wat de camera oplevert — dat is het begin
4. Alleen de hash gaat naar Origin Core
5. Origin Core maakt origin aan: hash + timestamp + origin_id — instant, status **pending**
6. Origin Core verankert de hash via OpenTimestamps in Bitcoin (achtergrond, 1–2 blocks)
7. Certificaat (hash, timestamp, origin_id) komt terug naar de app
8. App slaat certificaat op bij de foto op het device
9. Foto heeft het device nooit verlaten. Origin Core heeft de foto nooit gezien

### Consument deelt bewijs (optioneel)

De consument kan de app puur voor eigen gebruik gebruiken. Delen is een keuze, geen vereiste.

10. Consument opent de app, navigeert naar Marked Origins
11. Tikt op de origin, ziet detail view met status (pending of anchored)
12. Tikt op "Save as ZIP". Optioneel: schakelt passkey toggle in ("Include passkey signature"). Bij eerste keer: triggert WebAuthn setup (Face ID / fingerprint). App bundelt ZIP op het device. ZIP bevat: origineel bestand + certificaat (hash, origin_id, timestamp, status). Bij anchored: + .ots bewijsbestand. Als passkey is ingeschakeld: certificaat bevat ook public key + signature. Altijd ZIP, nooit een losse foto — een ZIP wordt door geen enkel platform gecomprimeerd
13. Consument verstuurt ZIP zelf — mail, portaal, AirDrop, USB, maakt niet uit
14. Umarise ziet de ZIP niet, routeert niets, weet niet dat er gedeeld wordt

### Derde verifieert — Ingang 1: Verify (bestand + certificaat)

15. Derde ontvangt ZIP
16. Pakt ZIP uit — ziet het bestand, het certificaat, en eventueel het .ots bewijsbestand
17. Gaat naar verify.umarise.com
18. Kiest "Ik heb een bestand en certificaat"
19. Sleept het bestand erin — browser hasht het bestand client-side (Web Crypto API)
20. Sleept het certificaat erin — browser leest de hash en origin_id eruit
21. Browser vergelijkt de twee hashes lokaal — match of geen match
22. Bij match: browser stuurt alleen de hash naar `/v1-core-verify`
23. Origin Core bevestigt: deze hash is verankerd in Bitcoin op [datum/tijd]
24. Derde ziet resultaat: ✅ bestand is echt, verankerd op [datum/tijd]

**Derde wil .ots ophalen (als het niet in de ZIP zat)**

De origin was nog pending bij het delen, dus .ots zat niet in de ZIP. De derde komt later terug:

24a. Derde gaat naar verify.umarise.com, voert origin_id in uit het certificaat
24b. Pagina zoekt op via de API (`/v1-core-resolve`)
24c. Als status **verankerd**: knop "Download .ots bewijsbestand" via de API (`/v1-core-proof`)
24d. Als status **pending**: "Nog niet beschikbaar. Kom later terug."

### Derde verifieert — Ingang 2: Resolve (alleen een origin_id)

25. Derde ontvangt een origin_id van de consument (via mail, chat, portaal)
26. Gaat naar verify.umarise.com
27. Kiest "Ik heb een origin_id"
28. Voert origin_id in — browser stuurt naar `/v1-core-resolve`
29. Pagina toont: hash, timestamp, Bitcoin-verankering, status
30. Derde weet nu: deze origin bestaat en is verankerd op [datum/tijd]
31. Derde vraagt de consument om het originele bestand
32. Derde hasht het ontvangen bestand client-side in de browser
33. Browser vergelijkt met de hash uit resolve — match of geen match
34. Bij match: ✅ bestand hoort bij deze origin

### Derde verifieert — Ingang 3: Proof (onafhankelijk zonder Umarise)

35. Derde gaat naar verify.umarise.com
36. Kiest "Ik wil het .ots bewijsbestand"
37. Voert origin_id of hash in — browser stuurt naar `/v1-core-proof`
38. Download het .ots bewijsbestand
39. Derde verifieert zelf: origineel bestand + .ots proof + OTS CLI + Bitcoin node
40. Verificatie volledig onafhankelijk van Umarise — geen API, geen server, geen vertrouwen nodig

**Op geen enkel moment in deze 40 stappen ziet Umarise de foto. Niet bij aanmaken, niet bij delen, niet bij verifiëren.**

---

## 6. verify.umarise.com — Verificatiepagina

### Waarom

De API is er. De endpoints zijn er. Maar een verzekeraar, advocaat, arts of gewone ontvanger opent geen terminal. Die heeft een webpagina nodig waar je bestanden insleept en een resultaat ziet: ✅ of ❌.

### Waarom deze pagina het vliegwiel laat landen

Geen verzekeraar gaat zelf zoeken naar verify.umarise.com. Geen advocaat gaat googlen "hoe verifieer ik een origin." Ze weten niet dat het bestaat.

Wat er wél gebeurt:

Een consument maakt een origin van een schadeclaim-foto. Stuurt de ZIP naar z'n verzekeraar. De verzekeraar opent de ZIP, ziet een certificaat met een origin_id en een link naar verify.umarise.com. Denkt: wat is dit? Klikt. Sleept het bestand erin. Ziet ✅. Begrijpt het in tien seconden.

De consument heeft de verzekeraar naar de pagina gebracht. Niet Umarise.

Dat is het vliegwiel:

1. **Consument maakt origin** (gratis app)
2. **Consument deelt ZIP** met verzekeraar, advocaat, arts
3. **Derde komt op verify.umarise.com** omdat het certificaat ernaar verwijst
4. **Derde ervaart de waarde** — tien seconden, wiskundig bewijs, geen account
5. **Derde denkt:** als meer klanten dit zouden doen, scheelt ons dat uren aan discussie
6. **Derde belt Umarise** — niet voor de verificatiepagina, maar voor de API. Zodat al hun klanten automatisch origins krijgen

De verificatiepagina is geen product. Het is de landingsbaan van het vliegwiel. De plek waar een derde voor het eerst ervaart wat een origin waard is. Zonder salesgesprek, zonder demo, zonder pitch.

Daarom moet deze pagina perfect zijn. Tien seconden van eerste bezoek tot resultaat. Geen frictie, geen account, geen uitleg nodig. De pagina ís de pitch.

### Twee paden naar adoptie

**Pad 1 — Kleine partner zonder CTO: de webpagina verkoopt zichzelf**

Derde ontvangt ZIP → opent verify.umarise.com → sleept bestanden erin → ziet ✅ → denkt: dit wil ik voor mijn hele organisatie. De pagina is de demo. Geen salescall nodig. Kleine partner gebruikt de webpagina direct als tool. Geen integratie, geen technische kennis, geen kosten voor verificatie.

**Pad 2 — Grote partner met CTO: de API doet het werk**

CTO ziet de webpagina, bekijkt de API-documentatie, integreert `POST /v1-core-origins` in eigen systeem. Medewerkers leggen belangrijke momenten vast binnen het systeem dat ze al gebruiken. Geen Umarise app, geen extra stappen. De API draait achter de schermen.

**De twee paden versterken elkaar:**

1. Consumenten maken origins via de gratis app
2. Consumenten delen ZIPs met derden
3. Derden landen op verify.umarise.com
4. Kleine partners gebruiken de webpagina direct als tool
5. Grote partners integreren de API in eigen systeem
6. Medewerkers van partners maken origins binnen hun eigen systeem
7. Meer origins in omloop → meer derden op de webpagina → meer partners geïnteresseerd

Dat is het complete vliegwiel. Eén webpagina bedient zowel de consument die bewijs deelt, de kleine partner die geen CTO heeft, als de grote partner die de API integreert. Allemaal landen ze op dezelfde plek.

### Per branche

- **Verzekeraar:** elke schadeclaim-discussie over "wanneer is die foto gemaakt" is voorbij. Tien seconden, wiskundig bewijs. Hoeveel uur fraudeonderzoek scheelt dat per jaar?
- **Advocaat:** cliënt komt met bewijs. Advocaat verifieert ter plekke. Geen deskundige nodig om te bevestigen dat het bestand ongewijzigd is
- **Arts:** patiënt toont foto van moedervlek van een jaar geleden. Arts verifieert: dit is echt de foto van toen, niet van gisteren
- **Notaris:** document waarvan iemand claimt dat het op datum X bestond. Tien seconden: ja of nee

In elk scenario is de privacy-belofte cruciaal. Een arts sleept een medische foto naar een webpagina — die foto mag het device niet verlaten. Dat doet die ook niet. Dat is geen feature, dat is een voorwaarde voor adoptie in deze branches.

### Waarom dit uniek is — geen concurrent heeft dit

Geen enkele partij in het proof-of-existence landschap heeft de combinatie van gratis consumer-app + verificatiepagina + API vliegwiel.

- **C2PA:** top-down adoptie via Adobe, Nikon, BBC. Geen gratis consumer-app. Geen verificatiepagina waar iedereen bestanden insleept
- **OriginStamp:** enterprise product. Klant moet naar hen toe. Geen vliegwiel van consument naar partner
- **Bernstein:** IP-kluis. Account nodig, project aanmaken, uploaden. Geen vliegwiel
- **ScoreDetect:** upload vereist. Geen privacy. Geen vliegwiel
- **OpenTimestamps:** protocol. Geen app, geen pagina, geen onboarding

Iedereen anders verkoopt aan hun klant. Bij Umarise doet de consument het. De consument ís de sales. De verificatiepagina ís de demo. Het vliegwiel draait zonder dat Umarise eraan hoeft te duwen.

Daarom moet deze pagina perfect zijn. Het is niet zomaar een verificatie-tool. Het is de plek waar het hele vliegwiel landt — en het enige wat een concurrent niet kan kopiëren zonder hun hele model om te gooien.

### Privacy-eis

Alles wat het bestand raakt draait lokaal in de browser. De foto verlaat het device van de derde niet.

| Actie | Waar het draait | Wat Umarise ontvangt |
|---|---|---|
| Bestand hashen | Lokaal in browser (Web Crypto API) | Niets |
| Certificaat uitlezen | Lokaal in browser | Niets |
| Hashes vergelijken | Lokaal in browser | Niets |
| Verankering checken | API (`/v1-core-verify`) | Alleen de hash |
| Origin opzoeken | API (`/v1-core-resolve`) | Alleen de origin_id |
| .ots downloaden | API (`/v1-core-proof`) | Alleen de origin_id of hash |

### Drie publieke API-endpoints

| Endpoint | Wat | Auth |
|---|---|---|
| `POST /v1-core-verify` | Hash verificatie — match of geen match | Geen |
| `GET /v1-core-resolve` | Opzoeken op origin_id of hash | Geen |
| `GET /v1-core-proof` | .ots bewijsbestand downloaden | Geen |

Alle drie open, gratis, geen account. Verificatie is een publiek goed.

De verificatiepagina is de visuele laag bovenop deze drie endpoints. De browser is de interface, de API doet het werk:

| Wie | Hoe | Wat erachter zit |
|---|---|---|
| Gewone derde | verify.umarise.com | Browser roept API aan |
| Developer / partner | Direct API call | Dezelfde endpoints |

Twee deuren, dezelfde API.

### UI-vereisten

**Eenvoud:**
- Geen account, geen registratie, geen cookie-banner
- Eén pagina, geen navigatie
- Drag & drop voor bestanden
- Resultaat direct zichtbaar: ✅, ⏳, of ❌

**Twee ingangen op dezelfde pagina:**
- "Ik heb een bestand en certificaat" — drag & drop zone
- "Ik heb een origin_id" — invoerveld + optionele drag & drop

**Resultaatweergave:**

Bij ✅ **Verankerd:** hash (afgekapt, kopieerfunctie), tijdstip, Bitcoin block, knop "Download .ots"

Bij ⏳ **Pending:** hash, tijdstip registratie, uitleg "Wordt verankerd in Bitcoin. Dit duurt 1–2 blocks.", suggestie "Bewaar de origin_id en kom later terug."

Bij ❌ **Geen match:** de twee hashes naast elkaar, uitleg "De bytes van dit bestand komen niet overeen met het certificaat."

Bij ❌ **Niet gevonden:** de hash, uitleg "Deze hash is niet bekend bij Origin."

**Uitleg onderaan:** wat is een origin, wat doet deze pagina, "Je bestand verlaat je device niet", link naar onafhankelijke verificatie (OTS CLI).

### Technische vereisten

- Statische webpagina (geen server-side rendering)
- Web Crypto API voor SHA-256 hashing (client-side)
- Fetch calls naar drie Core API-endpoints
- Geen cookies, geen tracking, geen analytics
- Responsive (desktop + mobiel)
- Certificaat-formaat moet afgestemd met de ZIP-functie in de app

**Samenvatting:** de derde sleept bestanden naar de pagina en ziet: echt of niet echt. Alles wat het bestand raakt draait in de browser. Umarise ziet het bestand nooit. Verificatie is gratis, voor iedereen, altijd.

---

## 7. Flow 2: B2B via API (context — niet eerste prioriteit)

### Partner maakt origin (betaald via Origin Core API)

1. Partner bepaalt welke momenten een origin waard zijn
2. Medewerker maakt foto of bestand aan in het systeem van de partner
3. Systeem hasht het bestand vóór enige verwerking. Eerst hashen, dan pas resizen of comprimeren. Verantwoordelijkheid van de partner
4. Systeem stuurt alleen de hash naar Origin Core via `POST /v1-core-origins` (API key)
5. Origin Core maakt origin aan: hash + timestamp + origin_id — instant, status **pending**
6. Origin komt terug naar het systeem van de partner
7. Partner slaat origin op bij het bestand in eigen systeem
8. Medewerker merkt niets. Geen extra stappen, geen Umarise app
9. OTS Worker verankert in Bitcoin. Status wordt **anchored**, .ots beschikbaar via `/v1-core-proof`
10. Origin Core heeft het bestand nooit gezien

### Partner deelt met derde

11. Partner deelt bestand + origin met derde via eigen systeem
12. Verificatie identiek aan stap 15–40 uit sectie 5

### Samenvatting beide flows

| Wat | Wie betaalt | Bestand gezien door Umarise |
|---|---|---|
| Origin aanmaken via app | Niemand — gratis | Nee |
| Origin aanmaken via API | Partner — betaald | Nee |
| ZIP delen | Niemand — consument doet het zelf | Nee |
| Verify via webpagina | Niemand — gratis | Nee |
| Verify via API | Niemand — gratis | Nee |
| .ots downloaden | Niemand — gratis | Nee |
| Onafhankelijk verifiëren | Niemand — gratis | Nee |

**Op geen enkel moment in deze flows ziet Umarise het bestand. Niet bij aanmaken, niet bij delen, niet bij verifiëren. Verificatie is altijd gratis. Als Umarise verdwijnt, werkt elke origin nog steeds.**

---

## 8. Passkey architectuur

### Wat is een passkey?

Het device maakt een asymmetrisch sleutelpaar (WebAuthn/FIDO2). De private key blijft op het device (Secure Enclave / TEE). De public key gaat naar Umarise. Authenticatie via biometrie: Face ID, vingerafdruk, of device PIN. Geen wachtwoord, geen e-mail, geen Magic Link.

De public key is een random string. Geen PII. Niet herleidbaar tot een persoon.

**Cross-device sync regelt het OS, niet Umarise:**
- iPhone → iPad → Mac: iCloud Keychain synct automatisch
- Android → Chrome → ander Android: Google Password Manager synct automatisch
- Cross-ecosysteem (iPhone → Android): QR-code scan. Eén extra stap.

### Twee staten

**Standaard: volledig anoniem.** App werkt op `device_user_id` (lokaal gegenereerde UUID). Geen passkey, geen koppeling. Alle data lokaal. Origins worden aangemaakt in Core maar niet gekoppeld aan een persoon.

**Na passkey opt-in.** `credentialId` + `publicKey` opgeslagen (server-side). De consument kan per origin kiezen of de ZIP een passkey-signature bevat. Linked badges verschijnen op alle origins. Cross-device toegang. Claiming: de passkey bewijst "dezelfde entiteit die deze origin maakte is hier nu" zonder dat Umarise weet wie.

**Passkey in de ZIP:** Na opt-in kan de consument per origin kiezen of de ZIP een passkey-signature bevat (via toggle "Include passkey signature" in Marked Origins detail view). Indien aan: certificate.json bevat een extra `claimed_by` veld (public key) en een cryptografische `signature` van de hash (gesignd door de private key). Derde partij kan op verify.umarise.com zien: "dit bestand is geclaimd door [public key]" en de signature verifiëren. Geen PII, wel bewijs van auteurschap. Indien uit: ZIP is volledig anoniem.

Wat Umarise na opt-in wél opslaat: public key (random bytes), origin hashes, timestamps.
Wat Umarise na opt-in niet opslaat: naam, e-mail, telefoon, locatie, bestanden, IP-adressen.

### Timing

Passkey hoort **niet** in de create-origin flow. Het is een identiteitskeuze, geen bewijs-actie.

De logische plek: **bij het opslaan van een ZIP vanuit Marked Origins.** De consument tikt op een origin, ziet de detail view, en kiest bij het opslaan of de ZIP een passkey-signature bevat ("Include passkey signature" toggle). Bij eerste gebruik triggert de toggle WebAuthn setup (Face ID / fingerprint). Daarna onthouden.

Dit is eleganter dan een aparte setup-stap: de keuze valt op het moment dat het ertoe doet. De consument beslist per origin, bij de actie zelf. Nooit verplicht, nooit blokkend, nooit in de weg.

### Wanneer wel/niet koppelen — voorbeelden voor de consument

De consument beslist per origin, op het moment van opslaan:

*Passkey toggle aan:*
- Moedervlek-foto die je over een jaar wilt terugvinden op een nieuwe telefoon
- Creatief werk waarvan je wilt bewijzen dat jij het maakte

*Passkey toggle uit:*
- Schadeclaim-foto waar het om het moment gaat, niet om jou
- Gevoelig document dat je niet aan je identiteit wilt koppelen

Bij geen actie: alles blijft anoniem. De consument verliest niets door het niet te doen.

### Bekende beperking: device recovery

Als een consument alle devices kwijtraakt én geen backup heeft, is de passkey-binding onherstelbaar. De origins blijven verankerd in Bitcoin. Maar de claim op auteurschap is weg.

Bewuste keuze. Eerlijk communiceren. Geen e-mail-recovery, dat zou PII vereisen.

---

## 9. Auto-save

### Foto

**iOS:** `PHPhotoLibrary` schrijft foto naar camera roll. Eenmalige toestemming, daarna automatisch.
**Android:** `MediaStore` API. Zelfde patroon.
**Bestaande foto's:** staan al op het device. Niets op te slaan.

### Certificaat

certificate.json schrijft naar **app sandbox** (lokale opslag). Geen toestemming nodig.

### ZIP

ZIP-opslag vereist een **user gesture**. Browser PWA-beperking: echte filesystem-save is niet mogelijk zonder interactie. Daarom de "Save your origin" knop die het OS share sheet opent via `navigator.share({ files: [zipBlob] })`. Eén tap.

### Wat de consument ziet

- S2: "✓ saved to your device" (foto)
- S5: "Save your origin" → OS share sheet → "✓ Owned" (ZIP)

---

## 10. Visuele consistentie

### Titels

Alle schermtitels: **22px Playfair Display, weight 300, kleur #C5935A (goud).**

| Scherm | Titel |
|--------|-------|
| S0 | Own your origin |
| S2 | Your artifact |
| S3 | Your artifact |
| S3 | hold to mark |
| S4 | Origin marked |
| S5 | Your origin is ready |
| S6 | Owned. |

### Onderschriften

Body tekst en subtitels: **13px EB Garamond, italic, kleur var(--cd).**
Kleine notities: **11–12px EB Garamond, italic, lagere opacity.**

### Kleurenpalet

- Goud: #C5935A (primair, accenten, titels)
- Donkergroen: #0D1A0D (achtergrond)
- Crème: #F5F0E6 (lichttekst)
- Groen-grijs: #8BAA8B (secundaire elementen)

---

## 11. Juridisch

De claim "We store no personal data" moet standhouden.

**1. Geen server-side IP logging.** IP-adressen niet loggen of alleen geanonimiseerd. IP is PII onder GDPR.

**2. Privacy policy expliciet.** Wat we opslaan: public key (credentialId + publicKey), origin hashes (SHA-256), timestamps, origin_id's. Wat we niet opslaan: namen, e-mailadressen, telefoonnummers, locatiegegevens, bestanden, foto's, IP-adressen, device fingerprints.

**3. DPA-review.** Bevestiging dat public keys niet als PII kwalificeren onder GDPR Art. 4(1).

**De claim:** "We store no names, emails, or data that identifies you. Your passkey is a cryptographic key. Your device holds the private half, we hold only the public half, which cannot identify you."

Als deze claim ooit gaat wringen: identity-optie eruit. De ZIP is compleet bewijs zonder identiteit.

---

## 12. Technische acties voor Lovable

### App

1. ~~**Magic Link flow verbergen.** Niet verwijderen, wel volledig verbergen in de UI. Vervangen door WebAuthn/passkey.~~ ✅ intern afgehandeld
2. ~~**`auth.users` tabel: `email` kolom verbergen.** Niet droppen, wel verbergen voor nieuwe gebruikers. Public key als identifier.~~ ✅ intern afgehandeld
3. **WebAuthn server-side implementeren.** `credentialId` + `publicKey` opslaan. `@simplewebauthn/server` of equivalent.
4. **`device_fingerprint_hash` niet schrijven.** De passkey vervangt deze functie.
5. **`witnesses` uitstellen.** Vereist e-mailadressen van derden. Parkeren tot architectuurbesluit.
6. **8-schermen flow implementeren.** S0–S7 volgens schermoverzicht in sectie 4. S3 toont "Your artifact" label boven de foto (zelfde als S2).
7. **Web Share API voor ZIP-save.** `navigator.share({ files: [zipFile] })` op S5 én in Marked Origins detail view. Fallback: `<a download>`.
8. **Auto-save implementeren.** Foto naar camera roll, certificaat naar app sandbox.
9. **Native OS picker.** Origin dot opent `<input type="file" accept="image/*">`. V1: alleen Take Photo en Photo Library.
10. **Foto weergave in native oriëntatie.** `object-fit: contain`, EXIF respecteren. Geen cropping.
11. **Tijdsaanduiding consistent.** Overal "1–2 blocks". Nooit "a few hours".
12. **IP-logging uitschakelen of anonimiseren.**

### Verificatiepagina

13. **verify.umarise.com bouwen.** Statische webpagina, geen server-side rendering.
14. **Client-side hashing.** Web Crypto API, SHA-256. Bestand verlaat het device niet.
15. **Drie API-integraties.** `/v1-core-verify`, `/v1-core-resolve`, `/v1-core-proof`. Alle drie zonder auth.
16. **Twee ingangen.** "Bestand + certificaat" (drag & drop) en "origin_id" (invoerveld).
17. **Resultaatweergave.** ✅ Verankerd, ⏳ Pending, ❌ Geen match, ❌ Niet gevonden.
18. **Geen cookies, geen tracking, geen analytics.**
19. **Responsive.** Desktop + mobiel.
20. **Certificaat-formaat afstemmen** met ZIP-functie in de app. Moet in één keer goed.

### Afhankelijkheid

De verificatiepagina en de app delen het certificaat-formaat. Het certificaat dat de app genereert (certificate.json in de ZIP) moet exact het formaat zijn dat de verificatiepagina leest. Dit moet in één keer goed afgestemd worden — anders werkt het vliegwiel niet.

---

## 13. Verificatievragen

Na implementatie willen wij kunnen bevestigen:

### Privacy & identiteit

- [ ] Consument zonder passkey: enige identificeerbare data in database? **Nee**
- [ ] Consument met passkey: enige opgeslagen data is `credentialId` + `publicKey`? **Ja**
- [ ] Ergens een e-mailadres, naam, telefoonnummer, of ongehashd IP-adres opgeslagen? **Nee**
- [ ] Origin Core tabellen: referentie naar `user_id` of user-identifier? **Nee**
- [ ] App functioneert volledig zonder passkey? **Ja**

### App flow

- [ ] Foto automatisch opgeslagen naar camera roll na eenmalige toestemming? **Ja**
- [ ] Certificaat automatisch opgeslagen in app sandbox? **Ja**
- [ ] ZIP-save op S5 opent native OS share sheet (Web Share API)? **Ja**
- [ ] S5 ZIP bevat photo.jpg + certificate.json (geen .ots — die is nog niet klaar)? **Ja**
- [ ] S6 "Owned." auto-advance naar Marked Origins na 2 seconden? **Ja**
- [ ] Marked Origins: tap op origin toont detail view met status (pending/anchored)? **Ja**
- [ ] Marked Origins: "Save as ZIP" knop in detail view voor alle origins? **Ja**
- [ ] Marked Origins: passkey toggle ("Include passkey signature") in detail view? **Ja**
- [ ] Marked Origins: eerste passkey toggle triggert WebAuthn setup (Face ID/fingerprint)? **Ja**
- [ ] Marked Origins: ZIP zonder passkey bevat photo.jpg + certificate.json (+ .ots als anchored)? **Ja**
- [ ] Marked Origins: ZIP met passkey bevat photo.jpg + certificate.json + passkey signature (+ .ots als anchored)? **Ja**
- [ ] Marked Origins: na passkey setup verschijnen linked badges op alle origins? **Ja**
- [ ] Marked Origins: certificate.json met passkey bevat `claimed_by` (public key) + `signature`? **Ja**
- [ ] Origin dot opent native OS-menu (Take Photo / Photo Library)? **Ja**
- [ ] Foto in native oriëntatie (geen cropping)? **Ja**
- [ ] Alle schermtitels 22px Playfair Display weight 300? **Ja**
- [ ] Bitcoin-anchoring tijdsaanduiding overal "1–2 blocks"? **Ja**

### Verificatiepagina

- [ ] Bestand wordt client-side gehasht (nooit naar server)? **Ja**
- [ ] Drie endpoints werken zonder authenticatie? **Ja**
- [ ] Resultaat ✅/⏳/❌ correct weergegeven? **Ja**
- [ ] .ots download beschikbaar voor verankerde origins? **Ja**
- [ ] Geen cookies, geen tracking? **Ja**
- [ ] Certificaat-formaat compatibel tussen app en verificatiepagina? **Ja**

---

## Versiegeschiedenis

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| 1.0 | 7 feb | Magic Link + e-mail. Ingetrokken. |
| 2.0 | 7 feb | Passkey architectuur. Auto-save. |
| 2.2 | 7 feb | Native OS picker, foto-oriëntatie, "Own your origin" (enkelvoud). |
| 3.0 | 7 feb | Flow 1 en identity samengevoegd. 10 schermen. |
| 4.0 | 7 feb | 10→9 schermen. ZIP endpoint. Share sheet. Rode draad. |
| 5.0 | 7 feb | Alles in één document. App flow + 40-stappen reis + verify.umarise.com + B2B flow + passkey + vliegwiel. |
| 5.1 | 7 feb | 9→8 schermen. S6 (Use) verwijderd. S5 "✓ Owned" → S6 "Owned." direct. Passkey + share hint naar The Wall of Origins (S7). PWA install door OS. |
| 5.2 | 7 feb | .ots eerlijk: niet in eerste ZIP, beschikbaar in Wall. Wall als thuisbasis: detail view met status (pending/anchored) + "Share complete ZIP". Passkey linkt alle origins + public key in certificate.json. Circulaire flow: Wall → capture → owned → Wall. "New origin" knop in Wall. |
| 5.3 | 7 feb | Wall of Origins → Marked Origins (museum-stijl). "New origin" en "Prove card" verwijderd. Passkey verplaatst naar per-origin toggle in detail view ("Include passkey signature" bij ZIP save). ZIP met of zonder identity. S3 toont "Your artifact" label (zelfde als S2). S2/S3 afbeelding op zelfde hoogte. Afbeelding vervangen door kindertekening. |
