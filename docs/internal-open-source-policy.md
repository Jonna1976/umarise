# Umarise — Open-Source Beleid & IP-bescherming

**Status:** Interne referentienotitie  
**Classificatie:** Vertrouwelijk — voor investorgesprekken  
**Datum:** 6 maart 2026

---

## 1. Samenvatting

Umarise volgt het **Let's Encrypt-model**: de specificatie is publiek domein, de client-tooling is open-source, maar de operationele server-infrastructuur is privé. Dit is geen toevallige keuze — het is de structurele basis van ons concurrentievoordeel.

| Laag | Status | Licentie | Reden |
|------|--------|----------|-------|
| Anchoring Specification (anchoring-spec.org) | **Publiek** | Unlicense (Public Domain) | Geloofwaardigheid; iedereen mag het protocol implementeren |
| Reference Verifier (verify-anchoring.org) | **Publiek** | Unlicense (Public Domain) | Onafhankelijke verificatie; bewijs overleeft de uitgever |
| SDK Node.js (`@umarise/anchor`) | **Publiek** | MIT | Developer-adoptie; verlaagt integratiedrempel |
| SDK Python (`umarise` op PyPI) | **Publiek** | MIT | Developer-adoptie; verlaagt integratiedrempel |
| CLI (`@umarise/cli`) | **Publiek** | Unlicense | Vertrouwen; `npx @umarise/cli verify` werkt zonder ons |
| GitHub Action | **Publiek** | Unlicense | CI/CD-adoptie; artifact gravity |
| **Core API source** (Edge Functions) | **Privé** | Niet gepubliceerd | Operationele IP — zie §3 |
| **Database schema + triggers** | **Privé** | Niet gepubliceerd | Immutability enforcement — zie §3 |
| **OTS Worker** (Hetzner) | **Privé** | Niet gepubliceerd | Bitcoin batching engine — zie §3 |
| **Key management & auth logic** | **Privé** | Niet gepubliceerd | Security-critical — zie §3 |

---

## 2. Wat is publiek en waarom

### 2.1 Anchoring Specification (anchoring-spec.org)

De specificatie definieert *wat* anchoring is: de verificatiefunctie V(B, P, L), het bewijsformaat, de ledger-kwalificatiecriteria. Het is bewust publiek domein (Unlicense) zodat:

- Iedereen het protocol mag implementeren zonder toestemming
- De standaard niet propriëtair is aan één commerciële partij
- Academische en juridische referenties mogelijk zijn
- De geloofwaardigheid van het protocol niet afhankelijk is van Umarise

**Analogie:** ACME (RFC 8555) is de open standaard voor certificate issuance. Let's Encrypt is de service die het uitvoert.

### 2.2 Reference Verifier (verify-anchoring.org)

100% client-side, zero-backend, zero-analytics. Gehost op GitHub Pages. Kan geforkt worden door iedereen. Garandeert dat bewijs verifieerbaar blijft zelfs als Umarise verdwijnt.

**Waarom open:** Dit is de kern van onze waardepropositie — "proof that doesn't need us." Als we de verifier privé houden, ondermijnt dat de hele belofte.

### 2.3 SDK's en CLI

De SDK (`@umarise/anchor`, `umarise` op PyPI) en CLI (`@umarise/cli`) zijn open-source omdat:

- Ze developer-adoptie versnellen (artifact gravity)
- Ze geen server-logica bevatten — alleen HTTP-wrappers rond de publieke API
- Een ontwikkelaar de volledige SDK-source kan lezen en exact zien wat er naar de API gaat
- Transparantie vertrouwen bouwt bij technische evaluators

**Wat de SDK's onthullen:** Alleen het *contract* (welke endpoints, welke parameters, welke responses). Exact dezelfde informatie als de API-documentatie op umarise.com/api-reference.

**Wat de SDK's NIET onthullen:** Hoe de server de hash verwerkt, hoe keys worden gevalideerd, hoe rate limiting werkt, hoe Bitcoin-anchoring wordt gebatcht, of welke database-triggers immutabiliteit afdwingen.

---

## 3. Wat is privé en waarom — het beschermde goud

### 3.1 Core API Edge Functions (46 functies, ~15.000 regels)

De `supabase/functions/` directory bevat de volledige server-side implementatie:

| Functiegroep | Aantal | Bevat |
|--------------|--------|-------|
| `v1-core-*` | 7 functies | Origins, Resolve, Verify, Proof, Health, Export, Proofs-Export |
| `v1-attestation-*` | 5 functies | Layer 3 attestatie + Stripe checkout |
| `v1-internal-*` | 4 functies | Partner management, metrics, webhooks |
| `v1-developer-key` | 1 functie | Self-service key generatie |
| `v1-stripe-*` | 1 functie | Credit webhook |
| `companion-*` | 4 functies | Device-scoped proxy endpoints |
| Overig | 15+ functies | AI-analyse, search, health-check cron, etc. |

**Specifiek beschermd IP in deze functies:**

#### A. API Key Validatie & HMAC-authenticatie

```
API key → HMAC-SHA256(key, CORE_API_SECRET) → vergelijk met opgeslagen key_hash
```

De exacte flow: prefix-extractie (11 chars), HMAC-berekening, database-lookup, revocation check, credit balance check, rate limit tier resolution. Een concurrent die de spec leest weet *dat* er API key authenticatie is, maar niet *hoe* we keys hashen, opslaan, of valideren.

#### B. Rate Limiting Architectuur

Atomaire rate limiting via een PostgreSQL stored procedure (`core_check_rate_limit`) met UPSERT-semantiek. Drie tiers (standard: 100/min, premium: 1000/min, unlimited). Fail-open design (als rate limiting faalt, laat het verzoek door voor beschikbaarheid).

#### C. Idempotency Logic

De recente duplicate-hash fix: bij een `23505` constraint violation zoekt de server het bestaande record op en retourneert het idempotent (200) in plaats van een 409 error. Dit voorkomt dat clients een race condition raken en vervolgens via resolve een *ander* partner's origin terugkrijgen. Dit is subtiele, hard-won operationele kennis.

#### D. Hash Normalisatie & Validatie

Accepteert zowel `sha256:<hex>` als ruwe 64-char hex. Normaliseert naar canoniek formaat. Valideert exact 64 hex characters. Rejecteert alles met extra velden (REJECTED_FIELD error code).

#### E. Request Logging & Privacy

IP-adressen worden gehashed met SHA-256 voordat ze worden opgeslagen (`ip:<hex>`). Geen ruwe IP's in de database. Fire-and-forget logging die de response niet vertraagt.

### 3.2 Database Schema, Triggers & RLS

De database is het hart van de immutabiliteitsgarantie:

| Mechanisme | Wat het doet |
|------------|-------------|
| `prevent_origin_attestation_update` trigger | Blokkeert elke UPDATE op origin_attestations |
| `prevent_origin_attestation_delete` trigger | Blokkeert elke DELETE op origin_attestations |
| RLS policies | Blokkeert client UPDATE/DELETE voor alle rollen |
| Partial unique indexes | `unique_hash_per_partner` + `unique_hash_internal` |
| `bridge_page_to_core_attestation` trigger | Propagatie van B2C pages naar Core attestations |
| `core_check_rate_limit` stored procedure | Atomaire rate limiting |

**Waarom dit privé moet blijven:** Iemand die de triggers kent, weet precies welke database-operaties geblokkeerd zijn — en dus ook welke *niet* geblokkeerd zijn. Security through transparency is goed voor het *protocol*, maar niet voor de operationele attack surface.

### 3.3 OTS Worker (Hetzner VPS)

De Bitcoin-anchoring engine draait als een aparte service op Hetzner. Deze:

- Batcht hashes in Merkle trees
- Submits de root naar OpenTimestamps calendars
- Pollt voor Bitcoin confirmaties
- Upgradet pending proofs naar anchored proofs
- Dispatcht webhooks naar partners bij completion

**Waarom dit het meest beschermde stuk is:** Dit is de operationele kern die €0.10 per anchor economisch haalbaar maakt. De batching-strategie (hoeveel hashes per tree, hoe vaak submitten, hoe omgaan met calendar-failures, retry-logica) is operationele IP die direct de unit economics bepaalt.

### 3.4 Partner Key Management

- `internal-generate-partner-key`: Genereert cryptografisch veilige API keys
- `v1-developer-key`: Self-service sandbox key generatie
- `partner_api_keys` tabel: key_hash, credit_balance, rate_limit_tier, webhook configuratie
- Credit deduction logica: atomaire balance check + decrement bij elke attestation

---

## 4. Hoe moeilijk is het om ons "goud" na te maken?

### 4.1 Wat MAKKELIJK na te maken is (weken)

| Component | Moeilijkheidsgraad | Waarom |
|-----------|-------------------|--------|
| Hash accepteren en opslaan | Triviaal | Elke developer kan dit |
| OpenTimestamps client aanroepen | Eenvoudig | `ots stamp` is een bestaand commando |
| SDK schrijven (HTTP wrapper) | Eenvoudig | Onze SDK is 296 regels; het contract is publiek |
| Verificatie-website bouwen | Eenvoudig | verify-anchoring.org is open-source en forkbaar |

**Conclusie:** Een competitor kan binnen een paar weken een werkende "hash → OTS → proof" pipeline bouwen. Het protocol is open — dat is bewust.

### 4.2 Wat MOEILIJK na te maken is (maanden)

| Component | Moeilijkheidsgraad | Waarom |
|-----------|-------------------|--------|
| Immutability enforcement (triggers) | Medium | Vereist diepgaande PostgreSQL kennis + security audit |
| Rate limiting met fail-open | Medium | Subtiele trade-offs tussen beschikbaarheid en bescherming |
| Idempotency bij concurrent writes | Medium | Race conditions zijn moeilijk te debuggen |
| Multi-tier API key systeem | Medium | HMAC + prefix lookup + credit balance + revocation |
| Privacy-by-architecture (IP hashing, zero-PII) | Medium | Architecturale discipline, niet een feature |

### 4.3 Wat EXTREEM moeilijk na te maken is (jaren)

| Component | Moeilijkheidsgraad | Waarom |
|-----------|-------------------|--------|
| **Historical Ledger** | Onmogelijk | Bestaande Bitcoin-verankerde attestaties kunnen niet nagebootst worden. Een concurrent begint met 0 anchors; wij hebben een groeiend register dat teruggaat tot dag één. |
| **Artifact Gravity** | Zeer moeilijk | Elke .proof ZIP verwijst naar onze origin_id's. Hoe meer proofs in omloop, hoe sterker het netwerk-effect. Een concurrent moet niet alleen de technologie kopiëren maar ook het ecosysteem van bestaande proofs. |
| **Verification Moat** | Zeer moeilijk | Als verificatie-tools (GitHub Actions, archieven, juridische systemen) onze origin_id's herkennen, wordt het ecosysteem zelf-versterkend. |
| **Specification Authority** | Zeer moeilijk | anchoring-spec.org is de eerste formele specificatie voor anchoring. "First mover" in standaardisatie is moeilijk te verdringen — zie ACME/Let's Encrypt, TCP/IP, HTTP. |
| **Operationele hardening** | Moeilijk | Edge cases, failure modes, retry-logica, monitoring — dit is opgebouwde kennis uit productie-ervaring die niet in een whitepaper staat. |
| **Trust & Track Record** | Onmogelijk te kopiëren | Vertrouwen is cumulatief. Elke maand dat de service draait zonder downtime of data-issues bouwt geloofwaardigheid op die een nieuwkomer niet heeft. |

### 4.4 Het Structurele Probleem voor Concurrenten

Een concurrent staat voor een dilemma:

1. **Als ze ook open-source / no-account doen:** Ze concurreren op prijs en developer experience, maar beginnen met 0 anchors, 0 proofs in omloop, en 0 track record. Ze moeten dezelfde operationele hardening doorlopen die ons maanden heeft gekost.

2. **Als ze een SaaS/dashboard model kiezen:** Ze ondermijnen de kernwaarde van "proof that doesn't need us." Hun proofs zijn afhankelijk van hun voortbestaan — precies het probleem dat wij oplossen.

3. **Als ze een ander anchoring-protocol gebruiken:** Ze zijn niet compatibel met de Anchoring Specification en het groeiende ecosysteem van .proof bestanden en verificatietools.

---

## 5. De Let's Encrypt Analogie (uitgewerkt)

| Aspect | Let's Encrypt | Umarise |
|--------|--------------|---------|
| **Open standaard** | ACME (RFC 8555) | Anchoring Specification (anchoring-spec.org) |
| **Open client** | Certbot, acme.sh | `@umarise/cli`, `@umarise/anchor`, `umarise` (PyPI) |
| **Open verifier** | Certificate Transparency logs | verify-anchoring.org |
| **Privé server** | Boulder (CA software) | Core API Edge Functions |
| **Privé operaties** | HSM's, signing keys, OCSP | OTS Worker, batching engine, key management |
| **Privé infra** | Datacenter, redundancy | Supabase + Hetzner configuratie |
| **Verdienmodel** | Sponsoring (nonprofit) | B2B API (€0.10/anchor) + Layer 3 attestatie (€4.95) |

**Belangrijk verschil:** Let's Encrypt heeft Boulder open-source gemaakt op GitHub. Dat is een strategische keuze, geen vereiste. De *operationele* infrastructuur (HSMs, private keys, datacenter-configuratie) is uiteraard privé. Wij kiezen ervoor om de server-code privé te houden omdat:

1. Onze code is de *implementatie*, niet het *protocol*
2. Security-sensitive logica (key validation, rate limiting) is veiliger als de exacte implementatie niet publiek is
3. De specificatie + SDK + verifier geven voldoende transparantie voor vertrouwen
4. Het publiek maken zou geen extra adoptie opleveren (developers gebruiken de SDK, niet de server-code)

---

## 6. Wat we NOOIT privé moeten maken

| Component | Waarom altijd open |
|-----------|-------------------|
| De specificatie | Geloofwaardigheid van het protocol vereist onafhankelijke implementeerbaarheid |
| De verificatiefunctie V(B, P, L) | Het bewijs moet verifieerbaar zijn zonder ons; dat is de kernbelofte |
| De SDK's | Developer-adoptie vereist transparantie over wat er naar de API gaat |
| Het .proof formaat | Proofs die alleen met onze tooling leesbaar zijn, zijn geen echte proofs |
| De CLI | Offline verificatie is een harde eis; dat kan alleen met open tooling |

**Regel:** Als het sluiten van een component de claim "proof that doesn't need us" ondermijnt, moet het open blijven.

---

## 7. Samenvatting voor Investorgesprekken

> **"De specificatie is publiek domein. De SDK is open-source. De verificatie is onafhankelijk. Maar de operationele infrastructuur — de batching engine, de key management, de immutability triggers, de rate limiting — dat is ons beschermde IP. Precies zoals Let's Encrypt: het protocol is open, de client is open, maar de Certificate Authority achter de schermen is niet iets dat je in een weekend nabootst."**

> **"Onze echte moat is niet de code. Het is de combinatie van (1) een groeiend Bitcoin-verankerd register dat niet gereproduceerd kan worden, (2) een ecosysteem van .proof bestanden die naar onze origin_id's verwijzen, en (3) de specificatie-autoriteit als eerste formele standaard voor anchoring. Code kun je kopiëren. Geschiedenis niet."**

---

*Document versie: 1.0*  
*Classificatie: Vertrouwelijk — interne referentie*  
*Auteur: Gegenereerd op basis van codebase-analyse, maart 2026*
