# Laag 3 — Attestatie
## Architectuur, API, Partnermodel, Verdienmodel

23 februari 2026.

---

## Waarom Laag 3

Chronologie zonder mens is infrastructuur zonder eigenaar.

Laag 1 bewijst wanneer. Laag 2 bewijst wie. Maar wie is nog niet juridisch bindend — een apparaat is geen mens in juridische zin.

Laag 3 sluit de cirkel: een gecertificeerde derde bevestigt dat deze mens op dit moment deze handeling heeft verricht. Niet de inhoud. Niet de waarheid. Alleen: de koppeling tussen mens en moment is bevestigd door iemand met gezag.

Dat is het verschil tussen een anchor en een juridisch wapen.

---

## AInchoring — en waarom de menselijke klik alles is

AI kan alles anchoren. Miljarden hashes per dag in Bitcoin. Technisch niets wat dat tegenhoudt.

Maar een anchor zonder menselijke attestatie is juridisch gewichtloos. Geen rechtbank, geen notaris, geen serieuze partij accepteert dat als bewijs van menselijke intentie. Zonder de klik is het ruis.

**AInchoring** — AI die massaal anchort zonder menselijke klik — is zinloos zodra Laag 3 de standaard wordt. Niet omdat we AI blokkeren. Niet omdat we een detectietool bouwen. Maar omdat de menselijke klik de enige munt is die telt in het systeem.

Je hoeft AI niet te stoppen. Je hoeft het niet te detecteren. Je bouwt een systeem waar verantwoordelijkheid de scheidslijn is tussen echt en gesimuleerd.

De menselijke klik is de handtekening van een mens in een wereld vol machines.

*"In een wereld waar AI alles kan anchoren, is de menselijke klik het enige wat telt."*

---

## Architectuur

**De handeling voor de gebruiker:**

1. Anchor via Laag 1 + Laag 2 — timestamp en passkey. Bewijs staat vast.
2. Optioneel in gallery detail-view: knop `Request attestation` — alleen zichtbaar na Bitcoin-bevestiging.
3. Prijs wordt getoond. Volledig transparant. Geen kleine lettertjes.
4. Gebruiker bevestigt. Geen keuze wie — anchoring.app regelt het binnen 24 uur.
5. Attestant ontvangt anchor-referentie, bevestigt de handeling, stuurt gesigneerde verklaring terug.
6. Gebruiker ontvangt uitgebreide ZIP: anchor + attestatie. Twee lagen. Onweerlegbaar.

**Wat de attestant ziet:**
Hash, timestamp, passkey-bewijs. Geen bestandsinhoud. Nooit. Het bestand verlaat het apparaat van de gebruiker nooit.

**Wat de attestant bevestigt:**
"Ik bevestig dat de houder van deze passkey op dit moment deze anchor heeft gezet." Niet meer. Niet minder.

---

## Attestatie API

Open standaard. Elke gecertificeerde derde kan integreren. Dertig minuten implementatie.

**Endpoints — vijf minuten integratie:**

`POST /attestation/request`
Umarise stuurt anchor-referentie naar attestant. Bevat: hash, timestamp, passkey-bewijs.

`POST /attestation/confirm`
Attestant stuurt gesigneerde verklaring terug. Bevat: attestant-ID, timestamp, digitale handtekening.

`GET /attestation/verify/{id}`
Publieke verificatie. Geen account. Geen toestemming.

**Wat de attestant doet — twee minuten:**
Ontvangt anchor-referentie. Verifieert passkey-binding. Klikt bevestigen. Stuurt gesigneerde verklaring terug. Geen inhoudelijke beoordeling. Geen juridisch advies. Alleen: ik bevestig dat deze handeling heeft plaatsgevonden.

**Technisch fundament:**
Attestant signeert met eigen private key. Verificatie via publieke key. Onafhankelijk van Umarise. Als Umarise verdwijnt blijft de attestatie verifieerbaar.

---

## Partnermodel

Umarise bouwt de infrastructuur. De attestant levert het gezag. Geen lock-in op één partij.

**Wie kan attesteren:**

Notarissen — rechtstreeks of via platforms als Fidacta.
Juridisch adviseurs — IP-experts, contractspecialisten.
Gecertificeerde reviewers — door Umarise gecertificeerd na audit.
eIDAS-gekwalificeerde diensten — voor maximale juridische bewijskracht in Europa.
Overheidsinstanties — toekomst.

**Hoe een partner wordt gecertificeerd:**
Technische integratie via de Attestatie API. Identiteitsverificatie van de attestant zelf.

**Wat een partner verdient:**
Vaste prijs per attestatie. Volledig transparant voor de gebruiker voordat hij aanvraagt. Umarise vraagt een klein percentage. Geen verborgen kosten.

**Geen platform:**
Umarise is geen marktplaats. Één of twee gecertificeerde partners. Niet tien opties. De infrastructuur is van Umarise. De attestatie is van de partner. Die grens blijft absoluut.

---

## Verdienmodel

Gratis: Laag 1 + Laag 2. Anchor en passkey. Altijd.

Betaald: Laag 3 attestatie. Gebruiker betaalt de attestant. Umarise vraagt platform-percentage.

**Indicatieve prijslaag:**

Eenvoudige attestatie door gecertificeerde reviewer: €2-5 per anchor.
Juridisch adviseur: €15-50 per anchor.
Notariële attestatie: €50-100 per anchor — maar dan volledig digitaal, direct, en met publiek verifieerbaar bewijs. Versus €50-200 voor een traditionele notariële timestamp zonder onafhankelijke verificatie.

De waarde: voor dezelfde prijs als een traditionele notariële timestamp krijgt de gebruiker een anchor die Bitcoin overleeft, publiek verifieerbaar is, en onafhankelijk van elke derde partij blijft bestaan.

---

## Eerste stap

Één pilot-attestant. Één notaris of juridisch adviseur die de API integreert en de eerste tien attestaties uitvoert.

Oscar heeft toegang tot het netwerk. Fidacta werkt al met zes notariskantoren. Dat is de snelste route naar een eerste werkende Laag 3 integratie.

**Actie:** Oscar vragen wie de eerste attestant kan zijn. Niet de grootste — de meest gemotiveerde.

---

## Guardian check

Umarise attesteert niet zelf. Wij leveren de infrastructuur en het platform. De attestant levert het gezag. Die scheiding is absoluut en niet onderhandelbaar.

Umarise overschrijdt het semantisch plafond niet — ook niet in Laag 3. Wij bewijzen chronologie. De attestant bewijst de menselijke koppeling. Dat zijn twee verschillende lagen met twee verschillende verantwoordelijkheden.

---

*Laag 3 briefing — 23 februari 2026.*
*Volgende stap: pilot-attestant via Oscar.*
