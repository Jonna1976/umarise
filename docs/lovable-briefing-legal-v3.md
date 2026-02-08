# Lovable Briefing: /legal pagina vervangen

De huidige /legal pagina bevat case law, een jurisdictietabel, en interpretaties die niet op de publieke site horen. Vervang de volledige pagina door een puur technische beschrijving van het mechanisme.

**Dit is een volledige vervanging, geen reeks edits.**

---

## Waarom vervanging

De huidige /legal pagina bevat vijf problemen:

1. Case law (Marseille, Hangzhou, BearBox) op de publieke site. Het instrument citeert geen studies over zijn eigen effectiviteit.
2. Jurisdictietabel met 14 landen. Jurisdictionele acceptatie is een juridische conclusie die per zaak varieert.
3. De zin "No known court ruling has explicitly rejected blockchain evidence." Afwezigheid van afwijzing is geen acceptatie.
4. "The exact pattern used by Umarise" bij de Hangzhou-case. Zelffelicitatie.
5. Het woord "account" komt twee keer voor. Er zijn geen accounts.

De case law en jurisdicties zijn niet onwaar, maar ze horen in interne documenten (concurrentiedoc, juridisch-IP doc), niet op umarise.com. De publieke site beschrijft eigenschappen van het mechanisme.

---

## Nieuwe paginastructuur

Zeven secties, elke sectie beschrijft een eigenschap. Geen argumentatie, geen interpretatie.

### 1. What an Origin Record Is
Twee alinea's. Database-entry die SHA-256 hash koppelt aan tijdstip. Verankerd in Bitcoin via OpenTimestamps. Bevat alleen de hash, niet het originele bestand.

### 2. Data Model
Tabel met 8 velden:

| Field | Type | Description |
|-------|------|-------------|
| hash | text | SHA-256 hash of the original bytes |
| hash_algorithm | text | Always "sha256" |
| origin_id | text | 8-character hexadecimal identifier |
| created_at | timestamp | Server time when the hash was received |
| ots_proof | text | Base64-encoded .ots file (after Bitcoin confirmation) |
| ots_status | text | "pending" or "verified" |
| bitcoin_block | integer | Block height (after confirmation) |
| user_id | uuid | Nullable. Present only if a passkey was used. |

Na de tabel: "There is no column for the original file, filename, file type, file size, or any metadata about the content. This is architectural: the system cannot store what it does not receive."

### 3. Cryptographic Chain
Vijf stappen als verticale keten:

1. **Client** - Submitting party computes SHA-256 hash locally. Only the hash is transmitted.
2. **Server** - Hash recorded with timestamp, assigned origin_id. Status: "pending".
3. **OpenTimestamps** - Hash submitted to OTS calendar servers. Aggregated into Merkle tree.
4. **Bitcoin** - Merkle root written to Bitcoin transaction. 1-2 blocks, 10-20 minutes.
5. **Proof file** - .ots file generated with complete cryptographic path. Status: "verified".

Na de keten: ".ots is a standard OpenTimestamps format. Verifiable using opentimestamps.org, the ots verify CLI tool, or any Bitcoin full node."

### 4. Scope
Twee kolommen naast elkaar:

**Established by the record:**
- These specific bytes existed at this specific time
- The hash is anchored in a Bitcoin block via OpenTimestamps
- The .ots proof file is independently verifiable
- The proof remains valid even if Umarise ceases to exist

**Not established by the record:**
- Who created the file
- Whether this is the first or only attestation of these bytes
- Whether the content is original, unique, or novel
- Authorship, ownership, or legal status of the content

Na de kolommen: "An Origin Record provides building blocks. A court, arbitrator, or evaluating party draws conclusions from those building blocks in the context of a specific dispute."

### 5. Device Binding (Optional)
Drie alinea's over passkey. WebAuthn, secure enclave, biometric gate. "Establishes that someone with biometric access to a specific device claimed the record." Niet identiteit, niet naam. Geen username, geen email, geen sign-up. Passkey is optioneel.

### 6. Trust Model
Twee blokken:

**Verifiable without trusting Umarise:**
The timestamp. The .ots proof file contains the complete cryptographic path from the submitted hash to a Bitcoin transaction. Independently verifiable using open-source tools. Umarise is not required for verification.

**Requires trusting Umarise:**
Data intake: that the correct hash was recorded at the correct time. Trust requirement is reduced when the submitting party computes SHA-256 on their own device before transmission, because in that configuration the submitting party controls the entire chain from bytes to Bitcoin.

### 7. Verification
Endpoint-tabel:

| Endpoint | Purpose |
|----------|---------|
| /v1-core-resolve | Look up an attestation by origin_id |
| /v1-core-verify | Check whether a hash exists in the registry |
| /v1-core-proof | Retrieve the .ots proof file for a hash |

"These endpoints are public. No authentication, no sign-up, and no personally identifiable information is required to verify a record."

### Footer
"This page describes the technical properties of the Origin Record mechanism. It does not constitute legal advice. The evidential value of an Origin Record depends on the jurisdiction, the nature of the dispute, and the evaluation of the adjudicating party."

---

## Stijl

Gebruik de bestaande site-stijl (Playfair Display, EB Garamond, JetBrains Mono, donkergroen/goud kleurenpalet). De HTML met volledige styling is bijgevoegd als referentie-implementatie.

---

## Wat NIET op deze pagina mag

- Geen case law (horen in interne documenten)
- Geen jurisdictietabel
- Geen "no court has rejected" of vergelijkbare claims
- Geen "validates our mechanism" of vergelijkbare zelffelicitatie
- Geen "account", "registration", of "sign up" (er zijn geen accounts)
- Geen "protects", "guarantees", "ensures", "secures"
- Geen vergelijkingen met concurrenten
- Geen em dashes

---

## Paginatitel

**Title:** "Technical Description"
**Subtitle:** "What an Origin Record is, what it contains, and what it does not establish."

De huidige titel "Legal Context" met subtitel "Case law, legislation, and evidentiary scope" vervalt.

---

## Samenvatting

| Onderdeel | Actie |
|-----------|-------|
| Case law (3 blokken) | Verwijderen |
| Jurisdictietabel (14 rijen) | Verwijderen |
| "No court has rejected" callout | Verwijderen |
| Disclaimer met "not a law firm" | Verwijderen (vervangen door footer) |
| "Correct Usage" sectie | Verwijderen (hoort op /specification of one-pager) |
| Paginatitel | "Legal Context" wordt "Technical Description" |
| Nieuwe secties | Data Model, Cryptographic Chain, Trust Model |
| Bestaande secties | Scope en Verification blijven (herschreven) |
| Device Binding | Nieuw, vervangt passkey-rij |

De bijgevoegde HTML (umarise-legal.html) is de volledige referentie-implementatie.

---

*Briefing v3, 8 feb 2026. Vervangt briefing v2.*
