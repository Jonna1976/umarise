# Frictie-analyse: Template Testing 17 feb 2026

## Alle frictie-punten uit beide test-sessies

### PYTHON TEST-SESSIE

| # | Wat ging fout | Oorzaak | Fix |
|---|---------------|---------|-----|
| P1 | `cp umarise_integration.py` → "No such file" | User stond in ~/umarise, bestanden stonden in ~/Downloads. Instructie zei niet waar bestanden stonden. | Zeg altijd expliciet: "bestanden staan in ~/Downloads na download" |
| P2 | `cp test_integration.py` → "No such file" | test_integration.py was nog niet gedownload. Instructie veronderstelde dat het al gedownload was. | Stap 1 moet zijn: download BEIDE bestanden. Niet impliciet, expliciet. |
| P3 | "API CORI KEY of wat begint met um?" | Testscript zei `um_PLAK_HIER_JE_KEY` maar legde niet uit welke key. User wist niet of het de Core API key of iets anders was. | "Je key begint met um_ — dezelfde key als bij de curl-tests" |
| P4 | SSL CERTIFICATE_VERIFY_FAILED crash | macOS Python vertrouwt standaard geen SSL-certificaten. Script crashte zonder uitleg. | Pre-flight check detecteert SSL-fout, toont exact fix-commando met Python-versie |
| P5 | Test 7 toont ✗ terwijl template correct faalt | testscript rapporteerde een verwachte fout als FAIL | `test_must_fail()` functie: verwachte fouten tonen OK |
| P6 | safe_attest test wacht 3+ minuten | Retry delay van 60s × 3 pogingen. Tester denkt dat script hangt. | `RETRY_DELAY = 3` en `MAX_RETRIES = 1` voor testen |
| P7 | test_integration.py moest twee keer aangeboden worden | Eerste keer niet gedownload, onduidelijk dat het een apart bestand was | Download-links naast elkaar, niet verspreid over tekst |

### NODE.JS TEST-SESSIE

| # | Wat ging fout | Oorzaak | Fix |
|---|---------------|---------|-----|
| N1 | "Ik wist niet dat ik eerst de 2 bestanden moest downloaden" | Instructie zei "download ook umarise-integration.js" maar het was onduidelijk dat je twee bestanden nodig hebt VOORDAT je begint | Stap 1: "Download deze twee bestanden:" met download-knoppen. Vóór alle terminal-instructies. |
| N2 | Browser slaat nieuw bestand op als `test_integration_node (1).js` | Bestand met zelfde naam al in Downloads. Browser voegt (1) toe. | Instructie: "Check met `ls ~/Downloads/test_integration*` als het niet lukt" |
| N3 | API key in comments gezet i.p.v. op code-regel | Testscript toonde de key als voorbeeld in de docstring. User veranderde die, niet de echte variabele. | API key als command-line argument — nul bestanden bewerken |
| N4 | Key bovenaan bestand geplakt → SyntaxError | User plakte key vóór regel 1. nano is foutgevoelig voor niet-developers. | API key als command-line argument |
| N5 | nano Ctrl+O of Ctrl+0? Kleine o of grote O? | Niet iedereen kent nano. Ctrl+O is niet intuïtief. | Geen nano meer nodig. Key als argument. |
| N6 | sed verving key OVERAL (ook in de check) | `sed -i '' 's/old/new/'` vervangt alle voorkomens. De pre-flight check vergeleek key met placeholder die nu ook de echte key was. | Specifiek `44s` of beter: key als argument |
| N7 | Oud bestand niet overschreven na nieuwe download | Browser gaf nieuwe versie naam `(1).js`, cp pakte het oude bestand | Altijd `rm` eerst, dan `cp` |

### GEDEELDE PATRONEN

| Patroon | Hoe vaak | Structurele fix |
|---------|----------|-----------------|
| "Bestand niet gevonden" | 4x (P1, P2, N1, N7) | Download-stap VÓÓR terminal-stap. Altijd `ls` als verificatie. |
| nano-gerelateerde fouten | 3x (N3, N4, N5) | Key als command-line argument. Nul bestanden bewerken. |
| Onduidelijk welke key | 2x (P3, N3) | "begint met um_, dezelfde als bij curl-tests, van partners@umarise.com" |
| Browser hernoemt bestand | 2x (P7, N2) | Expliciete instructie + `ls` check |
| Impliciete verwachtingen | 3x (P2, N1, N6) | Elke stap zegt wat je EERST moet doen en wat je DAARNA ziet |

---

## Lovable Briefing: /api-reference Template Downloads

### Probleem

De huidige /api-reference pagina biedt templates aan maar de download-
en installatie-flow is niet duidelijk genoeg. Tijdens testen (17 feb)
ontstonden herhaaldelijk fouten doordat:
1. Niet duidelijk was dat je TWEE bestanden moet downloaden
2. Niet duidelijk was in welke VOLGORDE je stappen uitvoert
3. Bestanden bewerken (nano) foutgevoelig is voor niet-developers
4. Verwachtingen per stap niet expliciet waren

### Gewenste situatie op /api-reference

De template-sectie op /api-reference moet deze exacte flow tonen:

```
╔═══════════════════════════════════════════════════════════════╗
║  INTEGRATION TEMPLATES                                        ║
║                                                               ║
║  Kies je taal:  [Python]  [Node.js]                          ║
╚═══════════════════════════════════════════════════════════════╝

── Python ─────────────────────────────────────────────────────

Stap 1: Download beide bestanden

  [⬇ umarise_integration.py]    [⬇ test_integration.py]

  Dit zijn twee bestanden. Download ze allebei.

Stap 2: Kopieer naar een werkmap en draai de test

  Kopieer dit blok en plak het in je Terminal:
  ┌─────────────────────────────────────────────────────────┐
  │ mkdir ~/umarise-test                                     │
  │ cp ~/Downloads/umarise_integration.py ~/umarise-test/    │
  │ cp ~/Downloads/test_integration.py ~/umarise-test/       │
  │ cd ~/umarise-test                                        │
  │ python3 test_integration.py um_JOUW_API_KEY              │  [KOPIEER]
  └─────────────────────────────────────────────────────────┘

  Vervang um_JOUW_API_KEY door je echte key.
  Je key begint met um_ — dezelfde key als bij de Quick Start curls.

  macOS: als je een SSL-fout krijgt, draai eenmalig:
  /Applications/Python\ 3.xx/Install\ Certificates.command
  (gebruik je eigen Python-versienummer, check met: python3 --version)

Stap 3: Verwacht resultaat

  Je ziet 15 tests draaien (~30 seconden).
  Elke test toont OK of FAIL.
  Aan het eind: "Alle 15 tests geslaagd. Template werkt."

  Als een test faalt: de foutmelding zegt precies wat er mis is.

── Node.js ────────────────────────────────────────────────────

Stap 1: Download beide bestanden

  [⬇ umarise-integration.js]    [⬇ test_integration_node.js]

  Dit zijn twee bestanden. Download ze allebei.

Stap 2: Kopieer naar een werkmap en draai de test

  ┌─────────────────────────────────────────────────────────┐
  │ mkdir ~/umarise-test-node                                │
  │ cp ~/Downloads/umarise-integration.js ~/umarise-test-node/ │
  │ cp ~/Downloads/test_integration_node.js ~/umarise-test-node/ │
  │ cd ~/umarise-test-node                                   │
  │ node test_integration_node.js um_JOUW_API_KEY            │  [KOPIEER]
  └─────────────────────────────────────────────────────────┘

  Vervang um_JOUW_API_KEY door je echte key.
  Vereist Node 18+. Check met: node --version

Stap 3: Verwacht resultaat

  Je ziet 15 tests draaien (~30 seconden).
  Elke test toont OK of FAIL.
  Aan het eind: "Alle 15 tests geslaagd. Template werkt."
```

### Kernprincipes

1. DOWNLOAD VÓÓR TERMINAL. Beide bestanden downloaden is altijd stap 1.
   Download-knoppen naast elkaar. Niet als tekst, maar als knoppen.

2. ÉÉN KOPIEERBLOK. Alle terminal-commando's in één blok met één
   kopieer-knop. Developer plakt het hele blok, verandert alleen de key
   in het commando. Geen bestanden bewerken.

3. VERWACHT RESULTAAT. Na elke stap staat wat je moet zien. Developer
   weet of het gelukt is zonder hulp.

4. KOPIEER-KNOP = SINGLE LINE. Net als bij Quick Start: de kopieer-knop
   kopieert commando's zonder regelafbrekingen die de terminal breken.

5. FOUTAFHANDELING INLINE. macOS SSL-fix staat op de pagina zelf, niet
   in een apart document. "Als je X ziet, doe Y."

### Wat NIET op de pagina hoeft

- Geen uitleg over wat de template intern doet (dat staat in de comments)
- Geen architectuur-uitleg (staat op /architecture)
- Geen API endpoint documentatie (staat al op /api-reference)
- Geen nano/vim instructies (key gaat als argument mee)

### Verificatie na implementatie

Test door zelf de flow te doorlopen:
1. Open /api-reference in incognito browser
2. Download beide bestanden (Python of Node.js)
3. Kopieer het terminal-blok
4. Plak in terminal, vervang key
5. Draai het script
6. Alle tests groen?

Als je op enig moment moet nadenken "wat bedoelen ze hier?" → frictie.
