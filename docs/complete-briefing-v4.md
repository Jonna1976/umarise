# Umarise — Complete Briefing v4

# De Ziel en het Lichaam

---

## 1. Waarom Umarise bestaat

Iedereen maakt dingen. Een eerste tekening. Een songtekst op een servet. Een productontwerp in een schetsboek. Een brief die nooit verstuurd wordt.

Het probleem is niet dat mensen hun creaties niet vastleggen — iedereen maakt foto's. Het probleem is dat een foto niets bewijst. Metadata is manipuleerbaar. Timestamps zijn aanpasbaar. Als het ertoe doet — als iemand jouw werk kopieert, als een fabrikant jouw ontwerp steelt, als een producer jouw tekst uitbrengt — heb je niets.

Het alternatief is WIPO, patenten, octrooien. Duizenden euro's. Maanden wachten. Juridisch spektakel. En zelfs zij gebruiken inmiddels AI om hun diensten te leveren.

**Umarise is het tegenovergestelde.** Eén foto. Eén druk. Een onveranderbaar bewijs verankerd in de Bitcoin blockchain. Gratis. Op je telefoon. In stilte.

### De diepere laag: bewijs van menselijke creatie

In een wereld waar AI alles kan genereren — teksten, beelden, muziek, ontwerpen — wordt de vraag "wie heeft dit gemaakt?" steeds urgenter. Niet alleen "wanneer bestond dit?" maar "heeft een mens dit gemaakt?"

Een foto van een kindertekening op een keukentafel. Een schets met jouw handschrift. Een brief in jouw huiskamer. De foto bevat visuele context die vrijwel onmogelijk door AI te fabriceren is. De combinatie van die fysieke context + meerdere bewijslagen (email, device, getuige, patroon over tijd) = bewijs van menselijke oorsprong.

**Umarise bewijst niet alleen dat iets bestond op een moment. Het bewijst dat een mens het maakte.**

Dat is geen niche. Dat is de standaard die de wereld nodig heeft.

| Oud denken | Nieuw denken |
|---|---|
| Bewijs wanneer je werk bestond | Bewijs dat een mens dit maakte, op dit moment |
| Bescherming tegen kopieën | Authenticiteit in een wereld van AI-content |
| Lichtgewicht alternatief voor WIPO | De standaard voor menselijke oorsprong |

---

## 2. Het model — De Ziel en het Lichaam

### De Ziel: de PWA (gratis)

De consument-app. Het ritueel. Capture → Pause → Mark → Release → Wall of Existence. Gratis voor iedereen. Geen abonnement, geen premium tier, geen advertenties.

**Waarom gratis:** elke gratis Mark is een bewijs dat de technologie werkt. Hoe meer mensen markeren, hoe sterker het netwerk, hoe makkelijker CORE te verkopen.

**Wat de consument gratis krijgt — het volledige pakket:**

- Het volledige ritueel (Capture → Mark → Release → Wall)
- Email-verificatie (identiteitskoppeling)
- OTS-verankering in Bitcoin blockchain
- Device fingerprint (anonieme bewijslaag)
- Getuige uitnodigen (sterkste bewijslaag)
- Certificaat-export met thumbnail (client-side gegenereerd)
- Bulk backup (long-press U)

**Dit is geen afgeslankte versie. Dit is alles.**

### Het Lichaam: CORE (betaald)

De API. Dezelfde technologie, ingebouwd in platforms van derden. Bedrijven betalen per hash of via abonnement.

| | PWA — de Ziel | CORE — het Lichaam |
|---|---|---|
| **Prijs** | Gratis | Betaald (per API-call of abonnement) |
| **Gebruiker** | Consument | Bedrijven, platforms, IP-bureaus |
| **Functie** | Mark + bewijs opbouwen | Dezelfde technologie, op schaal |
| **Waarde** | Persoonlijk bewijs | Bewijs als infrastructuur |
| **Human proof** | Foto met fysieke context + getuige | Platform-level authenticatie van menselijke uploads |

### Strategie: parallel, niet sequentieel

De PWA en CORE worden parallel ontwikkeld en verkocht, maar met verschillende energie:

**PWA (80% effort):** dit is de motor. Adoptie, virale groei via getuige-functie, zichtbaarheid. Elke mark bouwt het bewijs dat de technologie werkt.

**CORE (20% effort, nu al):** early adopters die de technologie begrijpen zonder dat je 100.000 gebruikers nodig hebt:
- IP-bureaus → zien de waarde direct, hoeven geen sociaal bewijs
- Notariskantoren → digitale aktes verankeren, begrijpen de technologie
- Advocatenkantoren → prior art bewijzen, concreet bruikbaar

**Later (met PWA-tractie):** de grote platforms die cijfers willen zien:
- Muziekplatforms (Spotify, SoundCloud) → authenticiteit van uploads
- Designplatforms (Behance, Dribbble) → bewijs van oorspronkelijk werk
- Marktplaatsen (Etsy, Amazon) → productontwerp bescherming
- AI-platforms → bewijs dat training data van echte mensen komt

### Het Flywheel

```
Consument markeert gratis in PWA
  → meer marks = meer bewijs dat technologie werkt
    → sterker verkoopargument voor CORE
      → CORE-inkomsten betalen voor PWA-infrastructuur
        → PWA blijft gratis
          → meer consumenten
            → getuige-functie brengt nieuwe gebruikers
              → meer marks
                → ...
```

### CORE als "bewijs van menselijke creatie" infrastructuur

De CORE-pitch verandert fundamenteel met de human proof positionering:

**Oude CORE-pitch:**
> *"Timestamp-verificatie als API voor jouw platform."*

**Nieuwe CORE-pitch:**
> *"De technologie die bewijst dat content door echte mensen is gemaakt — ingebouwd in jouw platform. Al gebruikt door honderdduizenden creatieven."*

Dit opent markten die puur timestamp-verificatie niet bereikt:
- AI-detectie platforms → Umarise als aanvullende verificatielaag
- Content platforms die "human-made" labels willen → verifieerbaar, niet zelf-geclaimd
- Uitgevers die menselijke auteurs willen verifiëren
- Onderwijs → bewijs dat studenten zelf werk hebben gemaakt

---

## 3. De 6 bewijslagen — waarom Umarise wél werkt

Dit is de kern van de propositie. Eén OTS-hash bewijst alleen dat data bestond op een moment — niet wie het maakte. Dat is niet genoeg. Maar Umarise stapelt lagen die samen een steeds sterker bewijs vormen.

### Laag 1 — OTS-hash + Bitcoin-verankering (de basis)

SHA-256 hash van de originele foto, verankerd in de Bitcoin blockchain via OpenTimestamps. Bewijst: deze exacte data bestond op dit exacte moment. Onveranderbaar, onweerlegbaar, onafhankelijk verifieerbaar.

**Zonder de andere lagen:** bewijst alleen dat *iemand* deze data had, niet *wie*.

### Laag 2 — Email-verificatie (identiteitskoppeling)

Bij de eerste Mark bevestigt de consument een emailadres. Elke hash wordt gekoppeld aan dat adres. Verandert "iemand had deze data" in "de eigenaar van dit emailadres had deze data."

**Implementatie:** éénmalige email-verificatie. Daarna is elke Mark automatisch gekoppeld. Past bij low friction — het is één stap, één keer.

**Waarom dit sowieso nodig is:** het Mark-certificaat (zie sectie 9) moet ergens naartoe. Email is de logische bestemming.

### Laag 3 — Device fingerprint (anoniem)

Bij het Mark-moment slaat de PWA een anonieme device-hash op. Geen persoonlijke data — een vingerafdruk van het apparaat (schermresolutie, taalinstelling, platform — geen IP, geen tracking).

**Bewijst:** deze mark kwam van dit specifieke device. Als iemand betwist dat jij het was, kun je aantonen dat de mark van hetzelfde device kwam dat je nu gebruikt.

**Privacy:** de fingerprint is niet herleidbaar tot een persoon, maar wél koppelbaar als de consument dat zelf wil.

### Laag 4 — Getuige-functie (de doorbraak)

Op het moment van Mark kan de consument iemand uitnodigen als digitale getuige. Die persoon ontvangt een link, bevestigt met hun email: *"ik bevestig dat ik dit heb gezien op dit moment."* Die bevestiging wordt ook gehasht en verankerd.

**Twee onafhankelijke identiteiten gekoppeld aan dezelfde timestamp.** Dat is hoe het in de echte wereld werkt — een notaris is uiteindelijk ook gewoon een getuige met autoriteit.

**Virale werking:** de getuige ziet Umarise voor het eerst → gaat zelf markeren → nodigt weer iemand uit. Dit werkt alleen als de PWA gratis is.

*(Volledige uitwerking in sectie 10)*

### Laag 5 — Patroonopbouw over tijd

Eén mark is een bewijs. Vijftig marks over twee jaar, allemaal van hetzelfde emailadres en device, vormen een patroon dat bijna onmogelijk te fabriceren is. De Wall of Existence wordt een bewijsketen.

**Bewijst:** consistent gedrag van dezelfde persoon over lange tijd. In een geschil is dit zeer overtuigend.

### Laag 6 — Fysieke context in de foto (human proof)

De foto zelf is een bewijslaag. Een kindertekening op een keukentafel met een koffiekop ernaast. Een schets met handschrift op gelinieerd papier. Een prototype op een werkbank met gereedschap. De fysieke context in de foto is vrijwel onmogelijk door AI te fabriceren — het is een impliciete handtekening van menselijke creatie.

**Dit is geen technische laag maar een menselijke.** En rechters, mediators en platforms kijken hier wél naar.

### Samenvattend: bewijskracht per laag

| Situatie | Bewijskracht |
|----------|-------------|
| Alleen OTS hash | "Iemand had deze data" — zwak |
| + email | "De eigenaar van dit adres had deze data" — redelijk |
| + device fingerprint | "Vanaf dit specifieke device" — sterker |
| + getuige | "Bevestigd door een tweede persoon" — sterk |
| + patroon van 50 marks over 2 jaar | "Consistent gedrag, zeer moeilijk te fabriceren" — zeer sterk |
| + fysieke context in foto | "Menselijke oorsprong, niet AI-gegenereerd" — zeer sterk |

**Geen enkele laag is waterdicht op zichzelf. Samen vormen ze iets dat geen WIPO-registratie beter doet — en het kost de consument niets.**

---

## 4. Waardepropositie — eerlijk per scenario

Geen valse beloftes. Per scenario: wat Umarise wél en niet doet.

### Logo-ontwerp → iemand lanceert iets gelijkends

| Wat Umarise doet | Wat Umarise niet doet |
|---|---|
| Bewijst dat jouw ontwerp op een eerder moment bestond | Bewijst niet automatisch dat jij het tekende |
| Met email + device + getuige: sterke koppeling aan jou | Vervangt geen auteursrechtregistratie |
| Bruikbaar als aanvullend bewijs in een geschil | Garandeert geen juridische uitkomst |

### Songtekst → producer brengt iets soortgelijks uit

| Wat Umarise doet | Wat Umarise niet doet |
|---|---|
| Bewijst dat de tekst bestond vóór de release van de producer | Bewijst niet dat jij de auteur bent (tenzij + getuige) |
| Timestamp is onweerlegbaar — blockchain | Vervangt geen muziekuitgeverijcontract |
| Certificaat is presenteerbaar bij een advocaat | Garandeert geen schadevergoeding |

### Product → fabrikant kopieert (STERKSTE SCENARIO)

| Wat Umarise doet | Wat Umarise niet doet |
|---|---|
| Prior art bewijs — cruciaal bij IP-geschillen | Vervangt geen patent |
| OTS-timestamp + email + device + getuige = sterk dossier | Garandeert geen bescherming zonder patent |
| In combinatie met emails en contracten: zeer overtuigend | Is geen juridisch advies |

### Idee op servet → wordt later waardevol

| Wat Umarise doet | Wat Umarise niet doet |
|---|---|
| Bewijst dat je het opschreef op dit moment | Beschermt het idee zelf niet (ideeën zijn niet beschermd) |
| Kan waardevol zijn als bewijs van conceptie | Voorkomt niet dat iemand het idee zelfstandig uitvoert |

### Bewijs van menselijke creatie (NIEUW — STERKSTE POSITIONERING)

| Wat Umarise doet | Wat Umarise niet doet |
|---|---|
| Foto met fysieke context + email + device + getuige = sterke indicatie van menselijke oorsprong | Is geen AI-detectietool |
| Patroon over tijd maakt fabricatie bijna onmogelijk | Garandeert niet dat content 100% menselijk is |
| Verifieerbaar door derden (platform, rechter, mediator) | Vervangt geen formele certificering |
| Veel sterker dan een "human-made" label zonder bewijs | Is geen juridisch bindende verklaring |

### De eerlijke pitch

> *"If it ever matters, you'll have one thing most people don't — timestamped proof, sealed in the blockchain, that your work existed at this moment. Evidence of human creation in a world of synthetic content. Build it from the first mark. Every layer makes your case stronger."*

---

## 5. Productclaims — wat je wél en niet kunt zeggen

### "Private by Design" — ✅ JA

Jullie servers zien nooit een foto of thumbnail. De architectuur maakt het onmogelijk om visuele content te lekken — die is er simpelweg niet server-side. Dit is de sterkste vorm van privacy: niet "wij beloven het niet te doen" maar "wij kúnnen het niet."

**Zeg:**
> *"Private by design — je foto's raken onze servers nooit. Niet omdat we beloven ze niet te bekijken, maar omdat ze er nooit zijn."*

### "Zero Knowledge over je Content" — ⚠️ WEES PRECIES

Jullie weten dát iemand iets heeft gemarkeerd, maar niet wát. De hash is wiskundig niet terug te herleiden naar een beeld. Maar jullie weten wél:
- Dát er een mark is gedaan
- Wanneer (timestamp)
- De Supabase Auth user ID (gekoppeld aan een emailadres)
- Hoeveel marks een user heeft
- Het IP-adres bij het POST-request (standaard HTTP)

**Zeg:** *"Zero knowledge over je content"*
**Niet zeggen:** *"Zero knowledge"* zonder context

### "Low Friction" — ✅ JA (niet "zero")

De file picker voegt een stap toe: eerst foto maken in Camera, dan selecteren in Umarise. Plus eenmalige email-verificatie. Dat is niet zero friction, maar het is minimaal.

**Zeg:** *"Minimale friction — maak een foto, selecteer hem, markeer met één druk."*
**Niet zeggen:** *"Zero friction"*

### "Proof of Human Creation" — ✅ JA (met nuance)

De combinatie van fysieke context in de foto + meerdere bewijslagen maakt het een sterke indicatie van menselijke oorsprong. Geen absolute garantie, maar veel sterker dan self-claimed labels.

**Zeg:** *"Verifieerbaar bewijs van menselijke creatie"*
**Niet zeggen:** *"Gecertificeerd menselijk"* of *"Gegarandeerd niet-AI"*

### Samenvatting claims

| Claim | Status | Eerlijke versie |
|-------|--------|-----------------|
| Private by Design | ✅ Volledig waar | Foto's raken onze servers nooit — architectureel onmogelijk |
| Zero Knowledge | ⚠️ Over content waar | Zero knowledge over je content |
| Low Friction | ✅ Waar | Minimale friction |
| Gratis | ✅ Volledig waar | De volledige PWA is gratis — geen premium tier |
| Proof of Human Creation | ✅ Met nuance | Verifieerbaar bewijs, geen absolute garantie |
| Juridisch bewijs | ❌ Te sterk | Aanvullend bewijs, geen juridische garantie |
| Vervangt WIPO/patent | ❌ Te sterk | Lichtgewicht alternatief voor eerste beschermingslaag |

---

## 6. Privacy-belofte — exacte bewoordingen

De thumbnail is een klein afgeleid beeld dat lokaal in de browser wordt opgeslagen. Dat is technisch wél een afbeelding. Alle communicatie moet hier eerlijk over zijn.

### ✅ Mag je zeggen

| Formulering | Waarom het klopt |
|-------------|-----------------|
| *"Je foto verlaat nooit je device"* | Originele foto blijft in Camera Roll, thumbnail in browser. Niets naar server. |
| *"Alleen het bewijs raakt onze servers"* | Supabase ontvangt uitsluitend hash, timestamp, origin_id en email. |
| *"Wij slaan nooit foto's op op onze servers"* | Geen pixel raakt Supabase — geen origineel, geen thumbnail. |
| *"sealed on your device · only the proof leaves"* | De tagline. Klopt volledig. |
| *"Je foto blijft van jou — wij bewaren alleen het wiskundige bewijs"* | Hash is niet terug te herleiden naar een beeld. |

### ❌ Mag je NIET zeggen

| Formulering | Waarom het niet klopt |
|-------------|----------------------|
| *"Wij slaan geen foto's op"* (zonder context) | De PWA slaat wél een thumbnail op in IndexedDB (lokaal). |
| *"Er wordt niets opgeslagen"* | Lokaal: thumbnail + hash + metadata. Server: hash + user_id + metadata. |
| *"De foto verdwijnt na het ritueel"* | De thumbnail blijft in IndexedDB. |
| *"Anoniem"* | Email-verificatie = niet anoniem. |

### Aanbevolen standaardtekst

> **Waar leeft wat?**
> Je originele foto blijft in je Camera Roll — Umarise raakt die nooit aan.
> Een kleine thumbnail wordt lokaal in je browser opgeslagen zodat je Wall of Existence visueel blijft.
> Je emailadres koppelt het bewijs aan jou — dat maakt het waardevol als het ertoe doet.
> Alleen een cryptografische vingerafdruk (hash) van je foto bereikt onze servers — wiskundig onmogelijk om terug te herleiden naar een beeld.
> Wis je je browserdata? Dan verdwijnt de thumbnail. De hash en het bewijs blijven veilig op onze servers.

### Tagline

> *"sealed on your device · only the proof leaves"* — **blijft, klopt.**

### Vervangtekst voor in bijlagen

Overal waar *"The artifact lives on your device. Full resolution. Never leaves your phone."* staat:

> *"Your photo stays in your Camera Roll. A small preview lives locally in your browser for your Wall. Only the cryptographic proof reaches our servers."*

---

## 7. Architectuur — wat leeft waar

### De Gouden Regel

> **Umarise slaat nooit de foto van de gebruiker op op eigen servers.** Niet het origineel, niet een kopie, niet een thumbnail. Alleen een cryptografische hash (bewijs) raakt Umarise-infrastructuur.

### Dataflow

```
GEBRUIKER'S DEVICE                      UMARISE BACKEND (Supabase)
───────────────────                     ──────────────────────────
Camera Roll                             
  └── originele foto (eigendom user)    

PWA (browser)                           
  ├── file picker selecteert foto       
  │   vanuit Camera Roll                
  ├── foto in werkgeheugen              
  │     ├── hash via SHA-256 ───────────→ hash (64 hex chars)
  │     ├── maak thumbnail              │  timestamp
  │     └── vrijgeven uit geheugen      │  origin_id
  │                                     │  user_id (Supabase Auth)
  │                                     │  device_fingerprint_hash
  │                                     │  .ots proof (later)
  └── IndexedDB (lokaal)                │
        ├── thumbnail (klein, ~50KB)    └── Supabase DB
        ├── hash                            (GEEN images)
        ├── timestamp                       (GEEN thumbnails)
        ├── origin_id                       (GEEN page-images bucket)
        └── .ots proof (later gesyncted)
```

### Wat leeft waar

| Data | Waar | Permanent? |
|------|------|------------|
| Originele foto | Camera Roll van user | Ja (user beheert) |
| Thumbnail | IndexedDB (browser, lokaal) | Tot browserdata gewist |
| SHA-256 hash | IndexedDB + Supabase | Ja |
| Timestamp | IndexedDB + Supabase | Ja |
| Origin ID | IndexedDB + Supabase | Ja |
| Email (via Supabase Auth) | Supabase (auth.users) | Ja |
| Device fingerprint hash | Supabase (per mark) | Ja |
| Getuige-email + bevestiging | Supabase (witnesses) | Ja (optioneel) |
| .ots proof | IndexedDB + Supabase | Ja (komt async, 1-12u) |

### Wat Supabase NIET opslaat

- Geen originele foto's
- Geen thumbnails
- Geen image blobs
- Geen `page-images` bucket
- Geen visuele content van welke aard dan ook

---

## 8. Consumer Flow — stap voor stap

### Stap 0: Eerste keer — email-verificatie

Bij de eerste opening van Umarise vraagt de app om een emailadres. **Implementatie: Supabase Auth met Magic Link** — de gebruiker voert emailadres in, ontvangt een link, klikt erop, is geverifieerd. Geen wachtwoord, geen username. Supabase Auth handelt sessie-management en tokens af.

Na bevestiging is het emailadres gekoppeld aan dit device. Dit gebeurt één keer — daarna houdt Supabase Auth de sessie actief.

**Design:** past in de Welcome-screen flow. Na "This is where it began" en de pulserende dot, een subtiel veld: *"Your email seals your identity to your marks."* Minimalistisch, geen formulier-gevoel. Één inputveld, één knop: *"Send link"*.

### Stap 1: Gebruiker maakt een foto

Met de native camera-app (iPhone Camera etc.). Foto wordt automatisch opgeslagen in Camera Roll. Dit gebeurt buiten Umarise.

### Stap 2: Gebruiker opent Umarise en selecteert de foto

Op het Capture-scherm opent "+" een native file picker (`<input type="file" accept="image/*">`). Op iOS toont dit de standaard fotokiezer.

**Waarom file picker:** de foto bestaat al in de Camera Roll voordat Umarise er iets mee doet. De user bezit de foto.

### Stap 3: Pause — contemplatie

De geselecteerde foto verschijnt op het scherm (vanuit werkgeheugen). Een stil moment. Niets anders.

**Overgang naar Mark:** na 2 seconden verschijnt onder de foto een zachte hint: *"press and hold to seal"* — EB Garamond italic, cream-20, fade-in over 1s. De gebruiker drukt op de foto en houdt vast → Mark begint. Er is geen knop — de foto zelf is het interactie-element.

### Stap 4: Mark — het ritueel

Press and hold op de foto. Tijdens het vasthouden:
1. Gouden frame tekent zichzelf (1.5s animatie)
2. PWA berekent SHA-256 hash van het volledige beeld (client-side)
3. PWA genereert een kleine thumbnail
4. PWA genereert device fingerprint hash
5. Na volledige 1.5s: gouden flits, frame settelt, verzegeld
6. Auto-advance naar Release na 1.8s

### Stap 5: Release — het zegel

Het Release-scherm toont:
- Origin ID
- Timestamp
- Hash (verkort)
- OTS status: *"anchoring in progress..."*
- *"sealed on your device · only the proof leaves"*

**Op dit moment doet de PWA:**
1. Stuurt hash + timestamp + origin_id + user_id + device_hash → Supabase (of queued als offline)
2. Slaat thumbnail + metadata op in IndexedDB
3. Geeft de originele foto vrij uit werkgeheugen
4. **Geen image data raakt de server**

### Stap 6: OTS-verankering (achtergrond)

Worker (Hetzner) pollt `origin_attestations`, maakt Merkle tree, submit naar OTS-kalender, wacht op Bitcoin-bevestiging (1-12 uur). `.ots` proof wordt opgeslagen in Supabase en gesyncted naar IndexedDB bij volgende app-opening.

### Stap 7: Terugkeer — certificaat

Consument opent de app later. De PWA synct de .ots proof. Status wordt *"anchored ✓"*. Nu kan de consument het certificaat downloaden (zie sectie 9).

---

## 9. Mark-certificaat — de backup

De .ots proof komt pas 1-12 uur na het Mark-moment. De backup gebeurt bij terugkeer.

### Flow

1. Mark → seal gemaakt, status *"anchoring in progress..."*
2. 1-12 uur later: OTS worker klaar, .ots in Supabase
3. Consument opent app → PWA synct .ots → status wordt *"anchored ✓"*
4. Bij het openen van een seal: **"download certificate"** knop verschijnt
5. Long-press U op Wall: **bulk export** van alle anchored seals

### Het certificaat — client-side gegenereerd

De PWA genereert lokaal in de browser een PDF (jsPDF). **Geen thumbnail raakt de server.** Het certificaat bevat:

```
┌─────────────────────────────────┐
│                                 │
│         [thumbnail]             │
│                                 │
│           Marked                │
│      ORIGIN 1916F13F            │
│   5 February 2026 · 14:23 UTC  │
│                                 │
│   hash: 884d5f17...553df0a3     │
│   creator: m***r@email.com      │
│                                 │
│   ✓ Anchored in Bitcoin         │
│     block #879,241              │
│                                 │
│   Witness: w***s@email.com      │
│   (if applicable)               │
│                                 │
│   .ots proof attached           │
│                                 │
└─────────────────────────────────┘
```

**Email-masking:** emailadressen in het certificaat worden gemaskeerd (eerste en laatste char + domein zichtbaar: `m***r@email.com`). De volledige adressen staan in Supabase en zijn verifieerbaar als dat nodig is in een geschil.

### Exportformaat per seal

```
umarise-1916F13F.zip
  ├── certificaat.pdf     ← visueel, met thumbnail, menselijk leesbaar
  └── proof.ots           ← technisch verificatiebestand
```

### Exportformaat bulk (long-press U)

```
umarise-backup-2026-02-05.zip
  ├── 1916F13F/
  │     ├── certificaat.pdf
  │     └── proof.ots
  ├── 7B3E09A1/
  │     ├── certificaat.pdf
  │     └── proof.ots
  └── ...
```

### Wat de consument kan zonder Umarise

- Originele foto (Camera Roll) + .ots bestand → onafhankelijk verifieerbaar
- Verificatie: hash berekenen over foto → matchen met .ots → checken tegen blockchain
- Geen server nodig. Geen account nodig. Geen Umarise nodig.

---

## 10. De Getuige-functie

De krachtigste nieuwe feature. Transformeert "iemand had deze data" naar "twee onafhankelijke personen bevestigen dit."

### Flow voor de maker

1. Na het Release-scherm (na de volledige cascade) verschijnt een subtiele optie: *"add a witness"*
2. De maker tikt → PWA genereert een getuige-link (URL met origin_id + verificatietoken)
3. De maker deelt de link **zelf** via WhatsApp, Signal, iMessage of elk ander kanaal
4. **De maker stuurt de thumbnail zelf mee** — als foto in het chatbericht, samen met de link
5. De getuige-link bevat **geen thumbnail** — alleen origin_id, datum en hash

**Waarom deze aanpak:** de thumbnail raakt nooit een Umarise-server. De maker deelt het beeld via een kanaal naar keuze. De privacy-belofte blijft 100% intact.

### Flow voor de getuige

1. Ontvangt een bericht van de maker met: een foto (thumbnail) + een link
2. Opent de link → ziet seal-data (origin_id, datum, hash) maar **geen thumbnail** (die heeft de getuige al via het chatbericht)
3. Voert eigen emailadres in
4. Bevestigt: *"Ik bevestig dat ik dit heb gezien op dit moment"*
5. Ontvangt bevestiging per email: *"Your witness is anchored"*

### Wat wordt opgeslagen

| Data | Waar |
|------|------|
| Getuige-emailadres | Supabase (gekoppeld aan origin_id) |
| Bevestigingstijdstip | Supabase |
| Hash van bevestiging | Supabase + OTS-verankering |

**Geen thumbnail op de server. Niet tijdelijk, niet via signed URL, niet op enige manier.**

### Virale loop

```
Maker markeert → deelt link + thumbnail via WhatsApp
  → getuige ziet Umarise voor het eerst
    → getuige maakt zelf een mark
      → getuige nodigt een nieuwe getuige uit
        → ...
```

**Dit werkt alleen als de PWA gratis is.**

### Design

De getuige-optie is subtiel, nooit opdringerig:
- Verschijnt op het Release-scherm, na de volledige cascade (na de whisper-tekst)
- EB Garamond italic, gold-muted: *"add a witness to strengthen your proof"*
- Tik → native share sheet opent met getuige-link + korte tekst
- Kan worden overgeslagen — het is een optie, geen vereiste
- Past bij de toon: stil, eerlijk, geen druk

---

## 11. Design System

### 11.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#050A05` | Page/app background — near-black met groene ondertoon |
| `surface` | `#0F1A0F` | Card/screen backgrounds — dark forest green |
| `surface-elevated` | `#1B2B1B` | Radial glows, elevated surfaces |
| `border-subtle` | `#222E22` | Subtiele borders |
| `gold` | `#C5935A` | Primair accent — warm antiek goud |
| `gold-glow` | `rgba(197,147,90,0.4)` | Glow/schaduw rond gouden elementen |
| `gold-muted` | `#8B7355` | Secundaire tekst, inactieve dots, labels |
| `cream` | `#F5F0E8` | Primaire tekstkleur — warm off-white |
| `cream-70` | `rgba(245,240,232,0.7)` | Body text |
| `cream-40` | `rgba(245,240,232,0.4)` | Tertiaire tekst |
| `cream-20` | `rgba(245,240,232,0.2)` | Ghost text, whisper labels |

### 11.2 Typography

| Font | Rol | Gebruik |
|------|-----|---------|
| **Playfair Display** (300–600) | Display & Headings | Welcome text, labels, "Marked", het "U" symbool, de "+" |
| **EB Garamond** (regular + italic) | Body & Prose | Beschrijvingen, data, notities, whisper text |
| **JetBrains Mono** (300–400) | Technical/Data | Hash strings, origin codes, technische labels |

**Regels:**
- Section labels: Playfair Display, 11px, weight 300, letter-spacing 4px, uppercase, gold
- Body text: EB Garamond, 15.5px, line-height 1.65, cream-70
- Hints: EB Garamond italic, 13px, gold-muted, opacity 0.6
- Hash/origin codes: JetBrains Mono, 10px, letter-spacing 2px, uppercase, gold-muted
- Dates: EB Garamond, 14px, cream-40
- Whisper notes: EB Garamond italic, 11px, cream-20

### 11.3 Animations & Motion

Langzame, bewuste animaties. Niets springt.

| Animatie | Timing | Beschrijving |
|----------|--------|-------------|
| Fade-in | 1–1.5s ease | Alle schermovergangen |
| Pulse/breathe | 3s ease-in-out infinite | Origin dot, gold dots |
| Artifact reveal | 1.2s ease, 0.3s delay | Foto in Pause (scale 0.96→1 + translateY) |
| Staggered cascade | 0.5s intervals | Release elementen verschijnen sequentieel |
| Frame draw | 1.5s cubic-bezier(0.4,0,0.2,1) | Gouden frame bij Mark |
| Screen crossfade | 0.6s | Opacity overgangen |

---

## 12. Screen Specifications

### Screen 0: Welcome (eerste keer)

- Background: radial gradient `#1B2B1B` center → `#0F1A0F` edge
- Center: "This is where it began" — Playfair Display, 22px, weight 300
- Below: pulsende gouden dot (12×12px, 3s pulse)
- **Nieuw:** na interactie → email-verificatie flow
  - *"Your email seals your identity to your marks"*
  - Minimalistisch invoerveld, geen formulier-gevoel
  - Verificatielink via email, bevestiging in-app
- Na verificatie: nooit meer getoond

### Screen 1: Capture

- Background: `#0F1A0F`
- Center: dashed circle (r82, gold stroke, dasharray 4 8, opacity 0.3)
- Inside: "+" in Playfair Display, 40px, opacity 0.5 (0.8 on hover)
- Top-right circle: breathing gold dot (8px)
- **Action:** "+" opent `<input type="file" accept="image/*">` — **native file picker, NIET camera**
- U button (top-left, 42×42px): opent Wall of Existence

### Screen 2: Pause

- Background: `#0F1A0F`
- Geselecteerde foto center-screen, 250×190px
- Foto vanuit werkgeheugen (niet opgeslagen)
- Fade-in met scale animatie (1.2s ease, 0.3s delay)
- Na 2s: hint *"press and hold to seal"* verschijnt (EB Garamond italic, cream-20, fade-in 1s)
- **Transitie naar Mark:** press-and-hold op de foto start het Mark-ritueel — de foto zelf is het interactie-element

### Screen 3: Mark (het ritueel)

- Background: `#0F1A0F`
- Foto 250×190px
- **Press and Hold:**
  1. Press → foto schaalt naar 98.5%
  2. Gouden frame (stroke 2.5px, gold glow) tekent over 1.5s
  3. Tijdens animatie: SHA-256 hash + thumbnail gegenereerd
  4. Release vroeg → frame trekt terug (0.3s)
  5. Hold 1.5s → gouden flits, frame settelt, verzegeld
  6. Auto-advance naar Release na 1.8s

**Frame resonance by type** (toekomst — nu alles "warm"):

| Type | Frame stijl |
|------|-------------|
| Drawing/Photo (warm) | Dik ornaat goud, ronde hoeken, warme glow |
| Text/Note (text) | Hairline, geen radius, minimaal |
| Voice/Sound (sound) | Pill-shaped (radius 50px), pulserende glow |
| Code (digital) | Scherpe hoeken, dashed border, blauwe tint |
| Diagram (organic) | Dik, onregelmatige padding, hand-drawn radius |
| Sketch (sketch) | Licht gekanteld (-0.5deg), ruwe randen |

### Screen 4: Release

- Card (280px, border-radius 14px, dark gradient bg met gold border)
- Staggered cascade (200–400ms intervals):
  1. U symbool (56×56px)
  2. "Marked" — Playfair Display, 36px, gold
  3. Origin code — JetBrains Mono, 10px
  4. Datum & tijd — EB Garamond, 14px
  5. Gouden lijn (50px, 1px)
  6. Hash — JetBrains Mono, 10px
  7. Whisper: *"sealed on your device · only the proof leaves"*
- **OTS status:** *"anchoring in progress..."* → later *"anchored ✓"*
- **Nieuw — Getuige prompt:** na cascade, subtiel:
  *"add a witness to strengthen your proof"* — EB Garamond italic, gold-muted

### Screen 5: Home / Return

- "When it begins, hold on." — Playfair Display, 20px, fade in 1s
- Below: "share › add to home screen" — EB Garamond italic, 13px (3s delay)

---

## 13. Wall of Existence

Persoonlijke galerij van alle verzegelde beginnen. Via U button.

### Layout
- Full-screen donkere omgeving:
  - Verticale lijntextuur (40px, near-zero opacity)
  - Radiale gouden lichtbron (parallax 15% scroll)
  - Plafondschaduw, vloerschaduw, vignet
  - Zwevende stofdeeltjes (2px gold dots, 6-14s drift)

### Content Source
- **Thumbnails uit IndexedDB** (lokaal)
- Elk artefact: thumbnail + datum
- **Als IndexedDB gewist:** frames tonen alleen origin_id + datum (seal data uit Supabase sync) — graceful degradation

### Artifact Display
- Horizontaal scrollend
- Variërende maten en offsets voor organisch museumgevoel
- Parallax focus: center → opacity 0.35→1.0, scale 0.96→1.0
- Glas highlight overlay

### Frame Resonance
Elk artefact krijgt een frame dat past bij het type (zie Screen 3).

### Maten

| Size class | Afmetingen |
|------------|-----------|
| Large landscape | 195 × 145px |
| Small square | 95 × 95px |
| Portrait | 105 × 155px |
| Landscape small | 135 × 88px |
| Medium square | 125 × 125px |
| Tiny | 78 × 52px |
| Panoramic | 210 × 85px |

Vertical offsets: -70px, -55px, 0px, 45px, 70px

### Interacties
- **Scroll:** horizontaal met parallax licht
- **Hover/Touch:** frame schaalt naar 108%
- **Tap:** opent fullscreen view (dark overlay, grotere frame, seal info, **"download certificate"** knop als anchored)
- **U button:** tap = terug naar flow, long-press (1.2s) = bulk export
- Hint "long-press ∪ to backup" verschijnt kort

### Fullscreen Artifact View
- 97% opacity dark overlay
- Thumbnail groter in gouden frame
- Seal info: origin code, datum, hash, .ots status
- **Nieuw:** "download certificate" knop (alleen als status = anchored)
- **Nieuw:** getuige-info als die er is
- Tap background of ✕ om te sluiten

---

## 14. Data Model

### IndexedDB (lokaal, op device)

```javascript
{
  id: string,                    // origin_id
  thumbnail: Blob,               // ~50-100KB JPEG
  hash: string,                  // SHA-256, 64 hex chars
  origin_id: string,             // 8 hex chars, client-generated (zie hieronder)
  timestamp: string,             // ISO 8601
  user_id: string,               // Supabase Auth user ID
  device_fingerprint_hash: string, // anoniem device hash
  ots_proof: Blob | null,        // .ots file, komt later
  ots_status: "pending" | "anchored",
  witness_email: string | null,  // getuige emailadres
  witness_confirmed: boolean,    // getuige bevestigd?
  type: "warm",                  // frame resonance (toekomst)
  size_class: string,            // voor Wall layout
  vertical_offset: number        // voor Wall positionering
}
```

### Origin ID generatie

De `origin_id` wordt **client-side** gegenereerd: 8 hexadecimale characters uit `crypto.getRandomValues()`. Uniciteit wordt gegarandeerd door de `UNIQUE` constraint op de Supabase-kolom — bij een (astronomisch onwaarschijnlijke) collision faalt de INSERT en genereert de client een nieuw ID.

```javascript
function generateOriginId() {
  const bytes = new Uint8Array(4); // 4 bytes = 8 hex chars
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  // Bijv. "1916F13F" — 4.294.967.296 mogelijkheden
}
```

### Supabase DB (backend)

**Supabase Auth** handelt authenticatie af — de `auth.users` tabel wordt automatisch beheerd door Supabase. Geen custom users-tabel nodig.

```sql
-- Marks (was: `pages` tabel in het huidige prototype — hernoemd)
origin_attestations {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash: text NOT NULL,           -- SHA-256, 64 hex chars
  origin_id: text UNIQUE NOT NULL, -- bijv. "1916F13F" (client-generated, 8 hex chars)
  user_id: uuid REFERENCES auth.users NOT NULL, -- Supabase Auth user
  device_fingerprint_hash: text, -- anoniem, per mark (kan verschillen per device)
  captured_at: timestamptz NOT NULL,
  ots_status: text DEFAULT 'pending', -- "pending" | "anchored"
  ots_proof: bytea               -- .ots file, door worker
}

-- Getuigen (nieuw) — meerdere getuigen per mark zijn toegestaan
witnesses {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id: text REFERENCES origin_attestations(origin_id) NOT NULL,
  witness_email: text NOT NULL,
  witness_confirmed_at: timestamptz | null,
  confirmation_hash: text,       -- hash van de bevestiging
  verification_token: text UNIQUE, -- voor de getuige-link
  ots_status: text DEFAULT 'pending',
  ots_proof: bytea | null
}
```

### Row Level Security (RLS) — kritiek voor privacy

```sql
-- origin_attestations: gebruiker ziet alleen eigen marks
ALTER TABLE origin_attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own marks"
  ON origin_attestations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own marks"
  ON origin_attestations FOR SELECT
  USING (auth.uid() = user_id);

-- witnesses: maker kan getuigen voor eigen marks zien
--            getuige-bevestiging via verification_token (geen auth vereist)
ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Makers can read witnesses for own marks"
  ON witnesses FOR SELECT
  USING (origin_id IN (
    SELECT origin_id FROM origin_attestations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can confirm via token"
  ON witnesses FOR UPDATE
  USING (verification_token IS NOT NULL)
  WITH CHECK (witness_confirmed_at IS NOT NULL);
```

### Migratie van huidig prototype

| Huidig | Nieuw | Actie |
|--------|-------|-------|
| `pages` tabel | `origin_attestations` | Hernoemd, velden toegevoegd |
| `pages.image_url` | — | Verwijderd |
| `page-images` bucket | — | Verwijderd |
| `bridge_page_to_core` trigger | `bridge_attestation_to_core` | Hernoemd, triggert op `origin_attestations` INSERT → stuurt hash naar OTS worker op Hetzner |

**Supabase slaat NIET op:** images, thumbnails, visuele content.

---

## 15. Technische Implementatie

### File Picker (Capture)

```html
<input type="file" accept="image/*" id="captureInput" style="display:none">
```

Programmatisch getriggerd bij tap "+". Op iOS: native fotokiezer.

### Client-Side Hashing (Mark)

```javascript
const buffer = await file.arrayBuffer();
const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
```

### Thumbnail Generatie (Mark)

```javascript
function generateThumbnail(file, maxDim = 400) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', 0.7);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### Device Fingerprint (anoniem)

```javascript
function generateDeviceHash() {
  const data = [
    screen.width, screen.height,
    navigator.language,
    navigator.platform,
    new Date().getTimezoneOffset()
  ].join('|');
  const buffer = new TextEncoder().encode(data);
  return crypto.subtle.digest('SHA-256', buffer)
    .then(h => Array.from(new Uint8Array(h))
      .map(b => b.toString(16).padStart(2, '0')).join(''));
}
```

### Certificaat Generatie (client-side, jsPDF + JSZip)

```javascript
import jsPDF from 'jspdf';
import JSZip from 'jszip';

async function generateCertificate(seal) {
  const doc = new jsPDF();
  
  // Thumbnail uit IndexedDB → als base64
  const thumbBase64 = await blobToBase64(seal.thumbnail);
  doc.addImage(thumbBase64, 'JPEG', 20, 20, 80, 60);
  
  // Seal data
  doc.setFontSize(24);
  doc.text('Marked', 105, 100, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`ORIGIN ${seal.origin_id}`, 105, 115, { align: 'center' });
  doc.text(seal.timestamp, 105, 125, { align: 'center' });
  doc.text(`hash: ${seal.hash}`, 105, 140, { align: 'center' });
  doc.text('Anchored in Bitcoin', 105, 155, { align: 'center' });
  // + getuige-info als aanwezig
  
  // Zip met certificaat + .ots
  const zip = new JSZip();
  zip.file('certificate.pdf', doc.output('arraybuffer'));
  zip.file('proof.ots', seal.ots_proof);
  
  return zip.generateAsync({ type: 'blob' });
  // Alles lokaal — niets via server
}
```

### Backend Sync

- Bij Mark: POST hash + timestamp + origin_id + user_id (Supabase Auth token) + device_hash → Supabase
- Bij app open: check voor nieuwe .ots proofs, sync naar IndexedDB
- Offline: payload wordt gequeued in IndexedDB, Service Worker synct bij internet
- **Geen image data raakt ooit de server**

---

## 16. Backend wijzigingen t.o.v. huidig prototype

### Verwijderen

1. **`page-images` storage bucket** — mag niet meer bestaan
2. **`image_url` veld** — verwijderen uit de tabel

### Hernoemen

3. **`pages` tabel → `origin_attestations`** — de tabel wordt hernoemd. Alle referenties in de codebase moeten mee. Bestaande data kan gemigreerd worden (hash, origin_id, captured_at blijven).
4. **`bridge_page_to_core` trigger → `bridge_attestation_to_core`** — de Supabase database trigger die bij INSERT op de attestation-tabel een webhook stuurt naar de OTS worker op Hetzner. Logica blijft identiek: pakt de hash, voegt toe aan de Merkle tree queue.

### Toevoegen

5. **Supabase Auth inschakelen** — Magic Link methode, geen wachtwoord
6. **`user_id` veld** (uuid, references auth.users) — in origin_attestations
7. **`device_fingerprint_hash` veld** (text) — in origin_attestations
8. **`witnesses` tabel** — nieuw, schema zie sectie 14
9. **RLS policies** — zie sectie 14, kritiek voor privacy

### Behouden

- Client-side SHA-256 hashing
- OTS worker op Hetzner (ontvangt webhook van bridge trigger)
- Merkle tree → OTS kalender → Bitcoin verankering flow

---

## 17. Frontend wijzigingen t.o.v. huidig prototype

1. **File picker** i.p.v. camera — `<input type="file" accept="image/*">`
2. **Email-verificatie** — Supabase Auth Magic Link bij eerste gebruik
3. **Thumbnail lokaal** — IndexedDB, ~400px max, JPEG 70%
4. **Device fingerprint** — anoniem, bij elke mark
5. **OTS status** — *"anchoring in progress..."* → *"anchored ✓"* op Release-scherm
6. **Getuige-prompt** — subtiel op Release-scherm, na cascade
7. **Wall uit IndexedDB** — met graceful degradation
8. **Certificaat-export** — client-side jsPDF + JSZip
9. **Bulk backup** — long-press U op Wall
10. **Offline queue** — Service Worker + Background Sync
11. **Error handling** — zie sectie 17.1

### 17.1 Error States

Alle error states gebruiken dezelfde visuele taal: EB Garamond italic, `cream-40`, subtiel. Geen rode banners, geen pop-ups. Past bij de toon.

| Situatie | Wat de gebruiker ziet | Wat de PWA doet |
|----------|----------------------|-----------------|
| **Hashing faalt** (corrupt bestand, geen image) | *"This file couldn't be sealed. Try another."* | Log error, terug naar Capture |
| **POST naar Supabase faalt** (geen internet) | Niets — de mark is gemaakt. Op Release: *"sealed · waiting to sync"* | Payload in IndexedDB queue, sync later |
| **POST naar Supabase faalt** (server error) | *"Sealed locally. We'll sync when our servers are back."* | Retry met exponential backoff (3x), dan queue |
| **Email-verificatie mislukt** | *"Check your inbox, or try again."* + retry knop | Supabase Auth retry |
| **Origin ID collision** (extreem zeldzaam) | Niets — transparant voor gebruiker | Client genereert nieuw ID, retry INSERT |
| **OTS proof niet beschikbaar na 24u** | Op seal: *"anchoring taking longer than usual"* | Worker health check, admin alert |
| **IndexedDB vol of geblokkeerd** (private browsing) | *"Your Wall needs browser storage. Open in normal mode or add to home screen."* | Detecteer bij app start, blokkeer niet de mark-flow |
| **Getuige-link verlopen** (na 7 dagen) | Getuige ziet: *"This witness link has expired. Ask [maker] for a new one."* | Token invalideren, maker kan opnieuw uitnodigen |
| **Certificaat-generatie faalt** | *"Certificate couldn't be created. Try again."* + retry | Log error, retry |

---

## 18. Wijzigingen in de bijlage-bestanden

### umarise-v6 (1).html

| Regel | Nu | Moet worden |
|-------|-----|-------------|
| 313 | `+ opens the camera directly` | `+ opens your photo library (file picker)` |
| 316 | `The artifact lives on your device. Full resolution. Never leaves your phone. Only the proof leaves — the hash, the date, the seal.` | `Your photo stays in your Camera Roll. A small preview lives locally in your browser for your Wall. Only the cryptographic proof reaches our servers.` |

### umarise-walkthrough.html

| Regel | Nu | Moet worden |
|-------|-----|-------------|
| 392 | `The "+" opens the camera directly.` | `The "+" opens your photo library via native file picker.` |
| 419 | `The artifact lives on your device. Full resolution. Never leaves your phone. Only the proof leaves — the hash, the date, the seal.` | `Your photo stays in your Camera Roll. A small preview lives locally in your browser for your Wall. Only the cryptographic proof reaches our servers.` |
| 548 | `→ camera/file picker` | `→ file picker (photo library)` |

**Toevoegen bij Screen 3 (Mark):**
```
During press-and-hold:
  1. SHA-256 hash computed (client-side)
  2. Thumbnail generated (~400px, JPEG 70%)
  3. Device fingerprint captured
  4. Neither image nor thumbnail leaves the device
```

**Toevoegen bij Screen 4 (Release):**
```
On seal complete:
  hash + timestamp + user_id + device_hash → Supabase
  thumbnail + metadata → IndexedDB (local)
  original image → released from memory
  
  OTS status: "anchoring in progress..."
  Optional: "add a witness"
```

**Toevoegen bij Screen 6 (Wall):**
```
Thumbnail source: IndexedDB (local)
If cleared: seal data only (from Supabase sync)
Download certificate: available when anchored
Bulk export: long-press U
```

### umarise-design-visuals.html

| Regel | Nu | Moet worden |
|-------|-----|-------------|
| 499 | `The artifact lives on your device. Full resolution. Never leaves your phone.` | `Your photo stays in your Camera Roll. A small preview lives locally in your browser for your Wall. Only the cryptographic proof reaches our servers.` |
| 562 | `The dashed circle with "+" opens the camera.` | `The dashed circle with "+" opens your photo library (native file picker).` |

---

## 19. PWA Requirements

- **Gratis** — volledig, geen premium tier, geen advertenties
- **Taal: Engels** — alle UI-tekst, labels, hints en whispers zijn in het Engels. Geen taalwisseling. Voorbeelden: "anchoring in progress..." (niet "verankering loopt..."), "anchored" (niet "verankerd"), "add a witness to strengthen your proof", "press and hold to seal"
- **Installeerbaar** via "Add to Home Screen"
- **Offline-first** — zie sectie 19.1
- **Email-verificatie** via Supabase Auth Magic Link bij eerste gebruik
- **Haptic feedback** bij Mark-voltooiing (Vibration API: 50ms pulse)
- **60fps animaties** — alles moet premium voelen
- **Client-side libraries:**
  - `jsPDF` — voor certificaat-generatie in de browser
  - `JSZip` — voor zip-export (per seal en bulk)
  - `idb` (of vergelijkbaar) — IndexedDB wrapper voor eenvoudigere API
  - Geen andere externe dependencies voor core flow

### 19.1 Offline-first strategie

De PWA moet bruikbaar zijn zonder internetverbinding:

| Actie | Online | Offline |
|-------|--------|---------|
| Email-verificatie | ✅ Vereist | ❌ Niet mogelijk — toon bericht: *"Connect to verify your email"* |
| Foto selecteren + Mark | ✅ Normaal | ✅ Werkt volledig lokaal |
| Hash berekenen | ✅ Client-side | ✅ Client-side |
| Thumbnail opslaan | ✅ IndexedDB | ✅ IndexedDB |
| POST naar Supabase | ✅ Direct | ⏳ Gequeued — opgeslagen in IndexedDB met `sync_status: "queued"` |
| Sync queue verwerken | — | ✅ Bij terugkeer internet: automatisch POST alle queued marks |
| OTS proof ophalen | ✅ Sync bij app open | ❌ Wacht op internet |
| Certificaat genereren | ✅ Client-side | ✅ Client-side (als .ots al gesyncted) |

**Implementatie:** Service Worker met Background Sync API. Bij een queued mark slaat de PWA de volledige payload op in IndexedDB. Zodra internet beschikbaar is, verwerkt de Service Worker de queue automatisch.

---

## 20. Samenvatting: alle kritieke wijzigingen

### Backend (Supabase)

1. **`page-images` bucket verwijderen**
2. **`image_url` veld verwijderen**
3. **`pages` tabel hernoemen naar `origin_attestations`** — velden toevoegen
4. **Supabase Auth inschakelen** — Magic Link, geen wachtwoord
5. **`user_id` + `device_fingerprint_hash` toevoegen** aan origin_attestations
6. **`witnesses` tabel toevoegen** (getuige-functie)
7. **RLS policies instellen** — gebruiker ziet alleen eigen marks
8. **`bridge_page_to_core` trigger hernoemen** → `bridge_attestation_to_core`

### Frontend (PWA)

9. **File picker** i.p.v. camera
10. **Email-verificatie** via Supabase Auth Magic Link
11. **Thumbnail lokaal** in IndexedDB
12. **Device fingerprint** bij elke mark
13. **OTS status indicator** op Release-scherm (Engels)
14. **Getuige-prompt** op Release-scherm, na cascade — deelt link via native share sheet
15. **Wall uit IndexedDB** met graceful degradation
16. **Certificaat-export** (jsPDF + JSZip, gemaskeerde emails)
17. **Bulk backup** via long-press U
18. **Offline queue** — Service Worker + Background Sync
19. **Error handling** — subtiele, consistente error states
20. **App-taal: volledig Engels**

---

## 21. Wat NIET verandert

- Het ritueel: Capture → Pause → Mark → Release → Wall
- De emotionele flow en timing
- Alle visuele design specs (kleuren, typografie, animaties, frame resonance)
- De Wall of Existence layout en atmosfeer
- Client-side SHA-256 hashing
- OTS anchoring worker flow
- De toon: stil, eerlijk, reverent

---

## 22. Key Design Principles

1. **Stilte boven lawaai.** Geen notificaties, geen badges, geen tellers.
2. **Ritueel boven efficiëntie.** De flow is bewust sequentieel.
3. **Privacy als architectuur.** Foto's raken servers nooit. Dit is geen feature — het is het fundament.
4. **Bewijs als lagen.** Elke mark bouwt bewijs op. Email, device, getuige, patroon.
5. **Menselijk bewijs.** Fysieke context in foto's + gestapelde lagen = bewijs van menselijke oorsprong.
6. **Donker en warm.** Bos-bij-nacht met kaarslichtkoud.
7. **Drie stemmen.** Playfair voor ceremonie, Garamond voor verhaal, JetBrains voor waarheid.
8. **Imperfecte schoonheid.** De Wall heeft ongelijke spacing, variërende maten.
9. **Gratis als strategie.** De Ziel is gratis. Het Lichaam verdient.
10. **Eerlijk boven ambitieus.** Geen claims die de technologie niet waarmaakt.
11. **De getuige als kracht.** Twee personen zijn sterker dan één hash.
