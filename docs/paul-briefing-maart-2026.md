# Umarise · Paul Briefing
*Maart 2026 · Vertrouwelijk*

---

## 1. Server capaciteit — waarom dit geen bottleneck is

**De vraag:** Als je volume gaat draaien op anchoring, hoe staat het met server capaciteit?

**Het antwoord:** De architectuur is ontworpen zodat dit geen bottleneck wordt.

**Waarom:**

De Core API is stateless. Hij slaat geen bestanden op. Hij verwerkt alleen hashes — een SHA-256 hash is 32 bytes. Een server die 10.000 HTTP requests per seconde aankan, kan 10.000 anchors per seconde verwerken. Dat is meer dan alle huidige blockchain timestamping diensten samen verwerken.

Het sleutelprincipe is Merkle batching via OpenTimestamps. Elke Bitcoin transactie kost geld en tijd. Maar één Bitcoin transactie kan een Merkle tree bevatten van duizenden hashes. Dat betekent: 100.000 anchors per uur gaan in één Bitcoin transactie. De kosten en verwerkingstijd schalen niet mee met volume.

**Huidige setup:**
- Core API: Supabase Edge Functions — horizontaal schaalbaar, geen configuratie nodig
- OTS Worker: Hetzner Node.js server — draait elk uur, verwerkt alle pending anchors in één batch
- Bitcoin transacties: via OpenTimestamps calendar servers — geen eigen Bitcoin node nodig

**Schaalbaarheid in cijfers:**
- Huidige capaciteit: miljoenen anchors per dag op huidige infrastructuur
- Bottleneck bij extreme schaal: OTS calendar servers — oplosbaar door eigen calendar te draaien
- Kosten per anchor bij schaal: fracties van een eurocent

**Conclusie:** Server capaciteit is geen architectureel risico. Het is een operationele configuratie die op aanvraag schaalt.

---

## 2. SOC 1 eerst, dan SOC 2

**Paul's advies:** Minimaal SOC 2 Type I, liefst SOC 2 Type II.

**Onze aanvulling:** SOC 1 eerst als eerste stap, dan SOC 2 Type I, dan SOC 2 Type II.

**Wat is SOC 1:**
SOC 1 (SSAE 18) gaat over interne controls die relevant zijn voor de financiële rapportage van klanten. Relevant als klanten Umarise gebruiken in processen die raken aan audit trails, financiële documenten, of compliance rapportage. Smallere scope dan SOC 2, sneller te realiseren.

**Wat is SOC 2:**
SOC 2 gaat over de vijf Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Confidentiality en Privacy. Type I is een snapshot op één moment. Type II is bewijs over 6-12 maanden.

**De volgorde:**

| Fase | Wat | Wanneer | Wat het geeft |
|------|-----|---------|---------------|
| Nu | SOC 2 readiness assessment | Direct | Weten wat ontbreekt |
| Fase 1 | SOC 1 Type I | 3-4 maanden | Eerste auditeerbaar bewijs |
| Fase 2 | SOC 2 Type I | 6-9 maanden | Enterprise drempel gepasseerd |
| Fase 3 | SOC 2 Type II | 12-18 maanden | Volwassen enterprise leverancier |

**Wat de architectuur al heeft:**
- Geen klantdata opgeslagen — minimale privacy scope
- Write-once registry — tamper-evident by design
- Onafhankelijke verificatie — geen single point of failure
- Stateless service — kleine attack surface

**Wat nog ontbreekt voor SOC 2:**
- Incident response plan gedocumenteerd
- Change management proces formeel vastgelegd
- Access controls gedocumenteerd (wie heeft toegang tot wat)
- Monitoring en alerting aantoonbaar over tijd
- Vulnerability management proces

**Conclusie:** De architectuur werkt in ons voordeel bij een audit. De organisatorische controls zijn het werk. Paul's Philips netwerk kan helpen de juiste auditor te vinden.

---

## 3. SOC 2 Readiness — huidige status mapped tegen Trust Service Criteria

**Security (CC6 — Logical and Physical Access)**

| Control | Status | Actie |
|---------|--------|-------|
| API key authenticatie | ✅ Live | |
| Write-once database triggers | ✅ Live | |
| Supabase RLS policies | ✅ Live | |
| Toegangscontroles gedocumenteerd | ❌ Ontbreekt | Documenteren |
| MFA voor productietoegang | ❌ Ontbreekt | Instellen |

**Availability (A1)**

| Control | Status | Actie |
|---------|--------|-------|
| Health endpoint `/v1-core-health` | ✅ Live | |
| Uptime monitoring | ❌ Ontbreekt | Instellen |
| SLA gedocumenteerd | ❌ Ontbreekt | Definiëren |

**Processing Integrity (PI1)**

| Control | Status | Actie |
|---------|--------|-------|
| Write-once anchors | ✅ By design | |
| Bitcoin anchor als extern bewijs | ✅ By design | |
| Error handling en retry logic OTS worker | ✅ Live | |
| Audit log van alle anchor requests | ❌ Ontbreekt | Toevoegen |

**Confidentiality (C1)**

| Control | Status | Actie |
|---------|--------|-------|
| Geen klantdata opgeslagen | ✅ By design | |
| Hash-only verwerking | ✅ By design | |
| Data classification policy | ❌ Ontbreekt | Documenteren |

**Privacy (P1-P8)**

| Control | Status | Actie |
|---------|--------|-------|
| Geen PII verwerkt | ✅ By design | |
| Privacy policy | ❌ Ontbreekt | Opstellen |

**Conclusie:** De technische controls zijn grotendeels aanwezig. De documentatie en organisatorische controls zijn het werk voor fase 1.

---

## 4. Notaris positie — aanvullen, niet vervangen

**Paul's vraag:** Je vervangt hiermee de notaris?

**Het antwoord:** Nee. We vullen aan. En dat is commercieel interessanter.

**Wat een notaris doet:**
- Identiteit verifiëren van de persoon
- Juridische autoriteit verlenen aan een document
- Getuige zijn van een handeling
- Opslaan in een officieel register

**Wat Umarise doet:**
- Bewijzen dat specifieke bytes bestonden op een specifiek moment
- Dat bewijs onweerlegbaar maken via Bitcoin
- Dat bewijs portable maken — los van Umarise, los van elke vendor

**Wat de combinatie doet:**
Een notaris die Umarise gebruikt kan zeggen: "Ik heb geverifieerd wie deze persoon is, en deze exacte bytes bestonden aantoonbaar op dit moment, bewezen door Bitcoin." Dat is sterker dan elk van beide apart.

**De commerciële positie:**
Notarissen worden een Laag 3 partner, geen concurrent. Ze voegen identiteitsverificatie toe bovenop het mathematische tijdsbewijs. Voor juridische contexts is de combinatie wat telt.

**De Marseille precedent:**
Op 20 maart 2025 accepteerde de Tribunal judiciaire de Marseille een blockchain timestamp als beslissend bewijs in een auteursrechtgeschil. Niet als ondersteunend materiaal — als beslissende factor. Dat is de juridische basis waarop we bouwen.

---

## 5. Ethereum vergelijking — waarom Bitcoin via OpenTimestamps

**Paul's vraag:** Ethereum doet ook zoiets?

**Het antwoord:** Ethereum kan dit. Maar Bitcoin is de betere keuze voor timestamping. Dit is waarom.

**Bitcoin vs Ethereum voor tijdsbewijs:**

| Eigenschap | Bitcoin | Ethereum |
|-----------|---------|----------|
| Doel | Value transfer + tijdsbewijs | Programmeerbaar platform |
| Hashrate / security | Hoogste ter wereld | Lager (Proof of Stake) |
| Immutabiliteit | Maximaal — nooit gewijzigd | Chain is eens gewijzigd (DAO hack 2016) |
| Complexiteit | Minimaal | Smart contracts, gas, tokens |
| Kosten | Via Merkle batching: fracties van eurocent | Gas fees variabel en soms hoog |
| Juridische acceptatie | Groeiend precedent | Minder getest in rechtbanken |
| OpenTimestamps | Officieel ondersteund | Niet officieel ondersteund |

**De kern:**
Bitcoin is het meest conservatieve, meest beproefde publieke grootboek ter wereld. Voor tijdsbewijs wil je precies dat. Geen smart contracts, geen eigen token, geen governance risico. Alleen: deze hash bestond no later than Bitcoin block height H.

**OpenTimestamps specifiek:**
OpenTimestamps is een open protocol gebouwd door Peter Todd, een van de vroegste Bitcoin Core contributors. Het is battle-tested, juridisch geaccepteerd, en ondersteund door de drie grootste Bitcoin calendar servers. Het is de standaard voor Bitcoin timestamping.

---

## 6. Wat Paul kan doen — concrete volgende stappen

**Waar Paul het meeste waarde toevoegt:**

1. **SOC 2 auditor selectie** — Paul's Philips netwerk kent de juiste gecertificeerde auditors voor enterprise software. Een warme introductie is sneller en goedkoper dan zelf zoeken.

2. **Enterprise security review template** — Grote corporates hebben standaard vragenlijsten voor nieuwe leveranciers (CAIQ, SIG, of eigen formats). Paul weet welke Philips gebruikte. Dat is de checklist voor onze voorbereiding.

3. **Eerste enterprise referentie** — Een naam uit Paul's netwerk die bereid is als early adopter te fungeren is meer waard dan welke marketing dan ook. Niet als betalende klant — als referentie voor de SOC 2 audit en voor volgende gesprekken.

4. **Organisatie advies** — Welke functies zijn nodig voor enterprise vertrouwen? CISO, security engineer, compliance officer? Paul weet wat Philips verwachtte van leveranciers in deze categorie.

**Wat wij nu leveren aan Paul:**
Dit document. Plus een technisch overzicht van de architectuur voor zijn eigen beoordeling. Plus een concrete vraag: wie in zijn netwerk zou als eerste SOC 2 auditor gesprek kunnen doen?

---

*Vertrouwelijk · Umarise · Maart 2026*

---

## 7. Wat er vandaag live is gegaan — 4 maart 2026

**Deployment status: 38/44 items afgerond.**

| Component | Status | Locatie |
|---|---|---|
| Core API | ✅ Live | core.umarise.com |
| `@umarise/anchor` Node.js SDK | ✅ npm | npmjs.com/@umarise/anchor |
| `@umarise/cli` v1.0.0 | ✅ npm | npmjs.com/@umarise/cli |
| GitHub Action `anchor-action` | ✅ Marketplace | github.com/AnchoringTrust/anchor-action |
| `verify-anchoring.org` | ✅ Live | verify-anchoring.org |
| `/api-reference` documentatie | ✅ Live | umarise.com/api-reference |

**De stack is vandaag voor het eerst end-to-end gedraaid:**

```
npm install -g @umarise/cli
umarise anchor pro.pdf
→ ✓ hash computed: sha256:a3dc...
→ ✓ anchored: origin_id 3cb5...
→ ✓ proof saved: pro.pdf.proof

umarise verify pro.pdf
→ ✓ hash matches
→ ✓ anchored in Bitcoin
→ ✓ proof valid — independent of Umarise
```

**Wat dit bewijst voor de moat-vraag:**

De CLI en GitHub Action zijn open source. Iedereen kan de broncode zien. Maar wat ze zien is een dunne wrapper van 10 regels die `@umarise/cli` aanroept. Het echte primitief is:

- De Core API achter `core.umarise.com` — niet in de publieke repo
- De partner key infrastructure — server-side
- Het Bitcoin anchoring netwerk via OpenTimestamps — niet repliceerbaar zonder de infrastructuur

Open source maakt adoptie makkelijk. Zonder de API key is het een lege huls. Precies zoals het hoort voor een infrastructure primitive.

**Resterende 6 items** zijn post-publish verificatie — git tags, GitHub releases, end-to-end verificatie via verify-anchoring.org. Geen blockers voor gebruik.

---

## 8. De architectuurbevestiging die de moat verklaart

De vraag die Paul stelde over computing power heeft een architectureel antwoord dat ook de moat verklaart:

**Waarom dit niet te repliceren is door een concurrent die de CLI fork:**

1. De CLI is een lege huls zonder de Core API
2. De Core API vereist de OTS worker op Hetzner
3. De OTS worker vereist de write-once registry in Supabase
4. De registry vereist de atomic bridge trigger
5. Het Bitcoin anchoring vereist de calendar server verbindingen

Dat is vijf lagen die samen de primitive vormen. Een fork van de CLI geeft je niets zonder alle vijf.

**De echte moat is niet de technologie. Het is de embeddedness.**

Als duizenden pipelines `umarise/anchor-action@v1` bevatten, en duizenden developers `@umarise/cli` gebruiken, en het `.proof` formaat de standaard wordt — dan is de switching cost niet technisch maar structureel. Precies zoals niemand van Let's Encrypt switcht niet omdat het technisch moeilijk is maar omdat het overal al zit.

*Vertrouwelijk · Umarise · Maart 2026*

---

## 9. De cirkel is compleet — Bitcoin block 935037

Op 4 maart 2026 werd de eerste onafhankelijke verificatie buiten Umarise infrastructuur bevestigd.

**Resultaat op verify-anchoring.org:**

```
VALID — LEDGER-CONFIRMED
Bitcoin block 935037
```

**De volledige chain:**

```
bestand
→ hash (SHA-256)
→ anchor via @umarise/cli
→ proof.ots opgeslagen naast bestand
→ Bitcoin block 935037
→ verify-anchoring.org — zonder Umarise
→ LEDGER-CONFIRMED
```

Dit is het bewijs dat de architectuurbelofte klopt:

Niet "valid according to Umarise."
Valid op het publieke Bitcoin grootboek.
Verifieerbaar door iedereen.
Onafhankelijk van Umarise.
Voor altijd.

*Vertrouwelijk · Umarise · Maart 2026*
