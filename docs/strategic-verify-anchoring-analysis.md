# Strategisch Vraagstuk: De Onafhankelijke Verifier

## verify-anchoring.org — Graven wij ons eigen graf?

**Datum:** 26 februari 2026  
**Status:** Ter review door experts  
**Beslissing vereist:** Wel of niet bouwen + scope van Bitcoin-verificatie

---

## 1. Wat is het voorstel?

Een volledig onafhankelijke verificatie-website op `verify-anchoring.org` die:

- **Nul API-calls** maakt naar Umarise, anchoring.app, of itexisted.app
- **Nul backend-afhankelijkheden** heeft — één statisch HTML-bestand
- **Door iedereen geforkd en zelf gehost** kan worden
- **Blijft werken** als Umarise morgen ophoudt te bestaan

De site verifieert origin proof ZIPs: herberekent de SHA-256 hash van het originele bestand, vergelijkt die met het certificaat, en valideert optioneel de Bitcoin-tijdstempel via publieke OpenTimestamps calendar servers.

---

## 2. Het kerndilemma

### De angst (graf-argument)
> "Als iedereen onze bewijzen kan verifiëren zonder ons, waarom hebben ze ons dan nog nodig?"

### Het tegenargument (fundament-argument)
> "Als bewijzen alleen geldig zijn zolang wij bestaan, zijn het geen bewijzen."

---

## 3. Analyse: Waardeketen van Umarise

| Stap | Activiteit | Waarde | Onafhankelijk? |
|------|-----------|--------|----------------|
| 1 | **Capture** — bestand hashen, origin registreren | Creatie van bewijs | ✗ Vereist Umarise |
| 2 | **Anchoring** — hash verankeren in Bitcoin via OTS | Onvervalsbaar bewijs | ✗ Vereist OTS worker |
| 3 | **ZIP generatie** — bundel met artifact + cert + .ots | Draagbaar bewijs | ✗ Vereist Umarise app |
| 4 | **Attestatie** — derde partij bevestigt (€4,95) | Juridische kracht | ✗ Vereist Umarise + attestant |
| 5 | **Partner API** — B2B integratie voor platforms | Schaalbare integratie | ✗ Vereist Umarise Core |
| 6 | **Verificatie** — bewijs controleren | Vertrouwen | ✓ **Kan onafhankelijk** |

**Conclusie:** Verificatie is de enige stap die per definitie onafhankelijk moet zijn om geloofwaardig te zijn. Alle omzet-genererende activiteiten (1-5) vereisen Umarise.

---

## 4. Juridisch perspectief

### Zonder onafhankelijke verifier
Een advocaat of rechter die een Umarise-bewijs voorgelegd krijgt:

> "Dit bewijs is alleen verifieerbaar via het platform dat het heeft uitgegeven. Dat is circulair. Het is als een notaris die zegt: 'Mijn stempel is alleen geldig in mijn kantoor.'"

**Risico:** Bewijs wordt afgewezen als onvoldoende onafhankelijk.

### Met onafhankelijke verifier
> "Dit bewijs is verifieerbaar via een onafhankelijke tool die door iedereen gehost kan worden. De verificatie berust op de SHA-256 hashfunctie en de publieke Bitcoin-blockchain. Geen enkele partij, inclusief de uitgever, kan het bewijs manipuleren."

**Voordeel:** Bewijs krijgt dezelfde epistemische status als een notariële akte — verifieerbaar via een onafhankelijke derde partij.

### Precedenten
- **PGP/GPG**: De waarde van digitale handtekeningen is dat *iedereen* ze kan verifiëren, niet alleen de uitgever
- **SSL/TLS**: Certificaten worden verifieerd door browsers, niet door de Certificate Authority zelf
- **Kadaster**: Eigendomsbewijzen zijn verifieerbaar bij het kadaster, niet bij de makelaar

In elk geval geldt: **de partij die het bewijs creëert is nooit de partij die het verifieert.**

---

## 5. Concurrentieperspectief

### Scenario A: Wij bouwen het NIET
- Concurrent X bouwt een vergelijkbaar anchor-systeem
- Concurrent X bouwt wél een onafhankelijke verifier
- Concurrent X claimt: "Onze bewijzen zijn echt onafhankelijk verifieerbaar. Die van Umarise niet."
- **Resultaat:** Wij verliezen het vertrouwensargument

### Scenario B: Wij bouwen het WEL
- Concurrent X moet óók een onafhankelijke verifier bouwen om geloofwaardig te zijn
- Maar wij hebben first-mover advantage + een productie-klaar systeem
- De lat voor concurrentie wordt *hoger*, niet lager
- **Resultaat:** Wij definiëren de standaard

### Scenario C: Iemand forkt onze verifier
- Iemand host `verify-anchoring.org` zelf of maakt een fork
- **Dit is goed.** Elk extra verificatiepunt versterkt het vertrouwen in ons bewijssysteem
- Vergelijk: meer Bitcoin nodes = sterker netwerk, niet zwakker

---

## 6. Businessmodel-impact

### Wat we NIET weggeven
| Inkomstenbron | Impact van verifier |
|--------------|-------------------|
| Partner API (B2B) | Nul — partners betalen voor *creatie*, niet verificatie |
| Attestatie (€4,95) | Nul — attestatie is een apart product bovenop verificatie |
| anchoring.app (B2C capture) | Nul — de capture-ervaring is de waarde |
| itexisted.app (link sharing) | Nul — het delen en claimen is de waarde |

### Wat we WEL weggeven
| Item | Was het ooit een inkomstenbron? |
|------|-------------------------------|
| Hash-verificatie | Nee — altijd al gratis en publiek |
| Proof status check | Nee — publiek endpoint |

**Netto omzetimpact: €0,00**

### Wat we WINNEN
| Voordeel | Waarde |
|----------|--------|
| Juridische geloofwaardigheid | Partners durven ons in te zetten in juridische context |
| Trust-moat | Concurrenten moeten dezelfde standaard halen |
| Overlevingsgarantie voor partners | Reduceert vendor lock-in angst bij B2B sales |
| PR/marketing | "Onze bewijzen overleven ons" — krachtig verhaal |

---

## 7. De Bitcoin-vraag

### Huidige staat van de standalone verifier
De verifier doet nu:
1. ✅ ZIP openen
2. ✅ Certificate.json lezen
3. ✅ Artifact hash herberekenen (SHA-256 via Web Crypto API)
4. ✅ Hash vergelijken met certificaat
5. ✅ .ots bestand detecteren + header valideren
6. ❌ **Geen** volledige Bitcoin-verificatie — verwijst naar opentimestamps.org

### Optie A: Geen Bitcoin-verificatie (huidige staat)
**Voordelen:**
- Simpeler, minder code, minder aanvalsvlak
- Nul externe calls (ook niet naar OTS calendar servers)
- Werkt volledig offline
- De .ots kan apart geverifieerd worden via opentimestamps.org of `ots verify` CLI

**Nadelen:**
- Gebruiker moet een extra stap doen voor Bitcoin-bewijs
- Minder "wow-effect" voor niet-technische gebruikers
- De belofte "volledig onafhankelijk verifieerbaar" is technisch waar maar UX-matig incompleet

### Optie B: OTS Calendar Server verificatie toevoegen
**Wat het doet:**
- Parse het .ots binary bestand client-side
- Verifieer de Merkle-path tegen publieke OpenTimestamps calendar servers
- Toon de Bitcoin block height en timestamp

**Voordelen:**
- Volledige end-to-end verificatie in één pagina
- Geen afhankelijkheid van Umarise — OTS calendar servers zijn publieke infrastructuur
- Sterker verhaal: "Alles geverifieerd tot aan de Bitcoin blockchain, zonder ons"

**Nadelen:**
- Vereist netwerkcalls naar OTS calendar servers (niet offline-capable)
- Complexere code (OTS binary parsing is niet triviaal)
- Afhankelijkheid van OTS calendar server uptime (maar die zijn gedistribueerd)
- Meer aanvalsvlak (supply chain risk van OTS JS library)

**Technische haalbaarheid:**
- De `opentimestamps` JavaScript library bestaat maar is niet geoptimaliseerd voor browser-gebruik
- Alternatief: eigen OTS parser schrijven (complexer maar nul dependencies)
- Middenweg: .ots binary header + Merkle root valideren, voor volledige Bitcoin-check verwijzen naar calendar servers

### Optie C: Gefaseerde aanpak
1. **Nu:** Ship zonder Bitcoin-verificatie (Optie A) — de hash-verificatie is al 90% van de waarde
2. **Later:** Voeg OTS calendar server verificatie toe als de site live is en getest

### Aanbeveling
**Optie C (gefaseerd).** Ship nu met hash-verificatie. De .ots download-knop + link naar opentimestamps.org is een acceptabele tussenoplossing. Bitcoin-verificatie toevoegen als de basis solide is.

---

## 8. Risico-analyse

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Verifier wordt misbruikt voor phishing | Laag | Laag | Statische site, geen user input behalve file upload |
| Iemand claimt de verifier is "hun" product | Laag | Laag | Open source + duidelijke attributie |
| OTS calendar servers gaan offline | Laag | Medium | Fallback: .ots download + CLI instructies |
| JSZip CDN wordt gecompromitteerd | Zeer laag | Hoog | SRI integrity hash op de script tag |
| Concurrent kopieert het concept | Medium | Positief | Valideert onze aanpak, verhoogt markstandaard |

---

## 9. Implementatie-overzicht

### Wat er al gebouwd is
- `verify-anchoring/index.html` — Compleet, werkend, klaar voor deploy
- `verify-anchoring/README.md` — Documentatie + hosting-instructies

### Wat er nog moet gebeuren
1. GitHub repo aanmaken (`AnchoringTrust/verify-anchoring`)
2. GitHub Pages activeren
3. DNS configureren bij GoDaddy
4. VERIFY.txt in ZIP-generatie updaten met verify-anchoring.org URL
5. (Optioneel) OTS calendar server verificatie toevoegen

### Hosting-architectuur
```
verify-anchoring.org
    ↓ DNS (CNAME of A records)
GitHub Pages (of Cloudflare Pages / Netlify)
    ↓ Serveert
Eén statisch HTML-bestand
    ↓ Laadt
JSZip via CDN (met SRI integrity hash)
    ↓ Alles verder is
Client-side JavaScript (Web Crypto API)
```

Geen servers. Geen databases. Geen API keys. Geen onderhoud.

---

## 10. De kernvraag aan de experts

1. **Bouwen we verify-anchoring.org?**  
   Ja / Nee / Ja maar met aanpassingen

2. **Voegen we Bitcoin-verificatie toe in v1?**  
   Ja (OTS calendar servers) / Nee (alleen hash + .ots download) / Later

3. **Welke hosting?**  
   GitHub Pages (open source, forkbaar) / Cloudflare Pages / Anders

4. **Is er een risico dat wij over het hoofd zien?**

---

## Appendix: De notaris-analogie

Een traditionele notaris:
- **Creëert** een akte (= Umarise capture + anchoring)
- **Bewaart** een kopie (= Umarise registry)
- **Verifieert** op verzoek (= umarise.com/verify)

Maar het kadaster:
- **Registreert** de akte onafhankelijk (= Bitcoin blockchain)
- **Is verifieerbaar** door iedereen (= verify-anchoring.org)
- **Bestaat onafhankelijk** van de notaris (= geen Umarise-afhankelijkheid)

Umarise is de notaris. Bitcoin is het kadaster. verify-anchoring.org is de publieke toegang tot het kadaster.

**Geen notaris bouwt zijn eigen graf door het kadaster toegankelijk te maken. Hij bouwt zijn geloofwaardigheid.**
