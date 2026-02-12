# Lovable Briefing: Passkey Signature in ZIP

Datum: 11 februari 2026
Type: Architectuurwijziging (App-laag)
Impact op Core: Geen
Guardian status: Alle constraints gecontroleerd, geen schendingen

---

## Wat een anchor is

> Anchor geeft bestaansbewijs aan een artefact.

> Anchor bewijst dat een artefact bestond op een specifiek moment.

Niet bestaansrecht (oordeel), maar bestaansbewijs (feit). Het instrument oordeelt niet.

## Doel in één zin

De passkey-signature en public key toevoegen aan de ZIP, zodat het bewijs niet alleen aantoont WAT er WANNEER bestond, maar ook dat het ondertekend is door een specifiek apparaat.

---

## Wat het product nu bewijst

Twee feiten:

1. **WAT:** deze exacte bytes (bewezen door SHA-256 hash)
2. **WANNEER:** op dit moment (bewezen door OTS + Bitcoin)

Beide zijn onafhankelijk verifieerbaar zonder Umarise.

## Wat het product straks bewijst

Drie feiten:

1. **WAT:** deze exacte bytes (bewezen door SHA-256 hash)
2. **WANNEER:** op dit moment (bewezen door OTS + Bitcoin)
3. **WELK APPARAAT:** ondertekend door de houder van dit apparaat met biometrische authenticatie (bewezen door passkey-signature + public key in ZIP)

Alle drie onafhankelijk verifieerbaar zonder Umarise.

## Wat het product NIET bewijst (ook niet na deze wijziging)

| Claim | Waarom niet | Guardian |
|-------|-------------|----------|
| Wie het maakte | Signature bewijst apparaat, niet persoon | C1 |
| Dat dit het origineel is | Signature bewijst ondertekening, niet creatie | C1 |
| Dat dit de eerste versie is | Meerdere attestations van dezelfde hash zijn toegestaan | C1 |
| Dat dit auteursrechtelijk beschermd is | Umarise verleent geen auteursrecht | C1 |
| Wie de persoon achter het apparaat is | Koppeling public key → persoon is extern (eID, notaris, context) | C6 |

---

## Waarom dit ertoe doet

### Het scenario zonder signature

"Deze foto bestond op 14 februari 2026 om 16:47."

Tegenpartij: "Maar wie zegt dat jij die foto had? Iedereen had die hash kunnen indienen."

Dat klopt. De hash is een string. Iedereen met de foto kan dezelfde hash berekenen en indienen. Het bewijs toont bestaan, niet bezit.

### Het scenario met signature

"Deze foto bestond op 14 februari 2026 om 16:47 en is ondertekend door het apparaat met public key X, bevestigd met biometrische authenticatie."

Tegenpartij: "Wie is de eigenaar van dat apparaat?"

Antwoord: telefooncontract, Apple ID, of simpelweg "ik was de enige met Face ID op die telefoon."

De koppeling persoon → apparaat is context. De koppeling apparaat → hash → moment is cryptografisch bewijs.

---

## Drie-lagenmodel

| Laag | Wat het bewijst | Wie het levert | In de ZIP |
|------|----------------|----------------|-----------|
| **1. Existence** | Deze bytes bestonden op moment T | Umarise (OTS + Bitcoin) | hash + proof.ots |
| **2. Device-binding** | Ondertekend door de houder van dit apparaat | Passkey (WebAuthn) | signature + public key |
| **3. Identiteit** | Die persoon is X | Extern (eID, notaris, context) | Niet van Umarise |

Laag 1 is de primitive. Altijd aanwezig.
Laag 2 is versterking. Optioneel (passkey is optioneel).
Laag 3 is niet van ons. Nooit van ons.

---

## Wat technisch moet veranderen

### Huidige flow (passkey als authenticatie)

```
Gebruiker opent app
  → WebAuthn authenticatie (passkey)
  → Gebruiker maakt foto
  → Hash berekend (Web Crypto API, client-side)
  → Hash naar Core API (via pages INSERT → trigger)
  → Passkey credential_id opgeslagen in Supabase Auth
```

De passkey authenticateert de gebruiker bij Umarise. De signature leeft in de sessie en wordt niet bewaard in de ZIP.

### Nieuwe flow (passkey als signing van de hash)

```
Gebruiker opent app
  → WebAuthn authenticatie (passkey)
  → Gebruiker maakt foto
  → Hash berekend (Web Crypto API, client-side)
  → Hash wordt ondertekend door passkey (WebAuthn sign operation)
  → Hash naar Core API (ongewijzigd)
  → Signature + public key opgeslagen in ZIP
```

Het verschil: na het berekenen van de hash, wordt de hash ook ondertekend door de passkey. De signature en public key gaan in de ZIP. Core API verandert niet.

### Concrete wijzigingen

| Component | Wat verandert | Impact |
|-----------|--------------|--------|
| **Capture flow (S1→S2)** | Na hash-berekening: WebAuthn `navigator.credentials.get()` met de hash als challenge | Kleine toevoeging aan bestaande flow |
| **certificate.json** | Twee nieuwe velden: `device_signature` en `device_public_key` | Schema-uitbreiding, geen breaking change |
| **ZIP generator (JSZip)** | Signature + public key toevoegen aan certificate.json | Kleine wijziging |
| **VERIFY.txt** | Regel toevoegen: "Device signature included: yes/no" | Kleine wijziging |
| **/verify pagina** | Signature verificatie tonen als aanwezig in ZIP | Nieuwe functionaliteit |
| **Core API** | Geen wijziging | Nul impact |
| **Database** | Geen wijziging | Nul impact |
| **OTS chain** | Geen wijziging | Nul impact |

### certificate.json na wijziging

```json
{
  "version": "1.1",
  "anchor_id": "CD1A8B81",
  "hash": "57f16661a02e898ea8ddd1ff9bc368cab81e973f5c22a8813f3090955d7ba789",
  "hash_algo": "SHA-256",
  "captured_at": "2026-02-08T14:42:33.704Z",
  "verify_url": "https://umarise.com/verify",
  "proof_included": false,
  "proof_status": "pending",
  "device_signature": "MEUCIQD7x8c9...base64...==",
  "device_public_key": "MFkwEwYHKoZIzj0CA...base64...==",
  "claimed_by": null
}
```

Noten:
- `version` gaat van "1.0" naar "1.1" (niet-breaking, nieuwe velden zijn optioneel)
- `device_signature` is de WebAuthn signature over de hash
- `device_public_key` is de COSE/CBOR public key van de passkey
- Beide velden zijn `null` als de gebruiker geen passkey heeft
- `origin_id` in het technische veld blijft `origin_id` in de database (Route A), wordt `anchor_id` in de user-facing JSON

### WebAuthn signing (technisch detail)

```javascript
// Na hash-berekening
const hashBytes = new Uint8Array(hashBuffer);

// Gebruik de hash als challenge voor WebAuthn
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: hashBytes,
    allowCredentials: [{
      id: credentialId,
      type: 'public-key'
    }],
    userVerification: 'required'  // Forceert biometrisch
  }
});

// assertion.response.signature = de signature over de hash
// assertion.response.authenticatorData = bevat public key info
```

De gebruiker ziet: Face ID / Touch ID prompt. Dezelfde als nu. Geen extra stap. Geen extra UI. De biometrische bevestiging die al bestaat, ondertekent nu ook de hash.

---

## Wat NIET verandert

| Element | Reden |
|---------|-------|
| Core API | C10: frozen. Geen nieuwe endpoints, geen nieuwe velden |
| `origin_attestations` tabel | Core ontvangt nog steeds alleen de hash |
| OTS chain | Hash → worker → Bitcoin. Ongewijzigd |
| Privacy model | Geen PII. Public key is geen persoonsgegeven (C5) |
| Hash-only boundary | Content verlaat het apparaat niet (C2) |
| ZIP formaat | Backward compatible. Oude ZIPs zonder signature blijven geldig |

---

## Verificatie op /verify

### Nu

Gebruiker uploadt ZIP → hash wordt herberekend → vergeleken met Core API → match / no match.

### Straks

Gebruiker uploadt ZIP → hash wordt herberekend → vergeleken met Core API → match / no match.
PLUS: als `device_signature` aanwezig → signature geverifieerd tegen `device_public_key` en hash → "Signed by device: yes/no."

De /verify pagina toont dan:

```
Content verified: ✓ match
Anchored: ✓ 14 February 2026, 16:47 UTC
Device signed: ✓ signed by holder of this device
```

Of, zonder passkey:

```
Content verified: ✓ match  
Anchored: ✓ 14 February 2026, 16:47 UTC
Device signed: — not signed
```

Alle verificatie blijft client-side. De signature wordt geverifieerd met de public key die in de ZIP zit. Geen server call nodig.

---

## Guardian verificatie

| Constraint | Status | Toelichting |
|-----------|--------|-------------|
| C1: Existence, not authorship | ✅ PASS | Signature bewijst apparaat-binding, niet auteurschap |
| C2: Hash only | ✅ PASS | Alleen hash + signature. Geen content |
| C3: Two-phase verification | ✅ PASS | Ongewijzigd |
| C4: Write-once | ✅ PASS | Ongewijzigd |
| C5: No PII | ✅ PASS | Public key is geen PII. Geen naam, geen email |
| C6: Identity is binary | ✅ PASS | "Someone with biometric access to this device signed this." Niet meer |
| C7: Instrument, not claimant | ✅ PASS | Signature is een eigenschap, geen argument |
| C8: Proof survives Umarise | ✅ STERKER | Signature in ZIP is onafhankelijk verifieerbaar zonder Umarise |
| C9: Discretion | ✅ PASS | ZIP distributie blijft bij gebruiker |
| C10: Core v1 frozen | ✅ PASS | Core verandert niet |
| C11: Core independent | ✅ PASS | Signing is App-laag, niet Core |
| C12: No protocol claims | ✅ PASS | Gebruikt bestaand protocol (WebAuthn) |
| C13: Verification split | ✅ STERKER | Signature verifieerbaar zonder Umarise (public key in ZIP) |

---

## Copy-implicaties (wat we hierna mogen zeggen)

### Wat we WEL mogen zeggen

- "Ondertekend door de houder van dit apparaat"
- "Signed by the holder of this device"
- "Device-bound signature included"
- "Verifieerbaar wie het apparaat bediende"
- "Three facts: what, when, which device"

### Wat we NIET mogen zeggen

- "Bewijs van maker" / "proof of creator"
- "Bewijs van eigenaar" / "proof of owner"
- "Jouw handtekening" / "your signature"
- "Identiteitsbewijs" / "proof of identity"
- "Digitaal paspoort"

### Voorgestelde formulering (user-facing)

> Een anchor bewijst drie feiten: welke bytes, welk moment, welk apparaat. Niet wie je bent. Maar wel dat de houder van dit apparaat, met biometrische bevestiging, deze inhoud op dit moment heeft ondertekend.

---

## Wat dit in de toekomst mogelijk maakt (zonder architectuurwijziging)

Als EU eID wallets, cryptografische identiteit, of AI-system signing mainstream worden, kunnen anchors gekoppeld worden aan echte identiteiten. De public key in de ZIP is het aanknopingspunt. Umarise hoeft niets te veranderen. Laag 3 (identiteit) wordt dan extern ingevuld door de eID-infrastructuur.

Het lagenmodel is toekomstbestendig precies omdat het niet meer doet dan het bewijst.

---

## Architectuurbeslissingen

### Passkey blijft optioneel

De passkey-signature wordt automatisch gegenereerd als de gebruiker een passkey heeft. Er is geen extra opt-in, geen extra prompt, geen extra scherm.

Maar de passkey zelf blijft optioneel. Reden: de primitive is bestaan (wat + wanneer). Device-binding is een versterking, niet de primitive zelf. Als de passkey verplicht wordt, versmelt je twee lagen en creëer je twee klassen anchors: B2C (met signature) en B2B (zonder). Maar beide produceren hetzelfde Anchor Record in dezelfde Core. Die gelijkheid moet behouden blijven.

| Situatie | Feiten in ZIP | Status |
|----------|--------------|--------|
| Geen passkey | WAT + WANNEER | Geldig anchor |
| Wel passkey | WAT + WANNEER + WELK APPARAAT | Geldig anchor, sterker bewijs |

Vergelijk: een brief versus een aangetekende brief. Beide bestaan. De aangetekende heeft een extra feit. Maar je schaft de post niet af omdat niet alles aangetekend is.

De app moedigt passkey-creatie aan bij eerste gebruik. Niet bij elke anchor.

### Automatisch ondertekenen, geen extra prompt

Als de gebruiker een passkey heeft, wordt elke anchor automatisch ondertekend. De Face ID / Touch ID prompt die er al is, ondertekent nu ook de hash. Geen extra vraag "wil je ondertekenen?"

Reden: een extra prompt breekt de ritual flow en creëert een vals gevoel van keuze. De gebruiker begrijpt niet wat "wel ondertekenen" versus "niet ondertekenen" technisch betekent. De keuze zit bij de passkey, niet bij de individuele anchor.

### Linkability: transparantie, geen opt-in

Dezelfde public key verschijnt in elke ZIP van hetzelfde apparaat. Als een gebruiker drie ZIPs deelt met drie verschillende partijen, kunnen die zien dat de ZIPs van hetzelfde apparaat komen. Dat is geen PII (C5 blijft intact), maar het is een privacyeigenschap.

Oplossing: transparantie, geen opt-in.

- VERIFY.txt vermeldt: "Device signed: yes"
- Onboarding vermeldt eenmalig dat anchors met passkey apparaat-gebonden zijn
- De ZIP bevat wat hij bevat. De gebruiker bepaalt wie hem ziet (C9)

---

## Samenvatting voor Lovable

**Bouw dit:**

1. Na hash-berekening in de capture flow: laat de passkey de hash ondertekenen via WebAuthn
2. Voeg `device_signature` en `device_public_key` toe aan certificate.json (versie 1.1)
3. Velden zijn `null` als gebruiker geen passkey heeft (backward compatible)
4. Werk VERIFY.txt bij met "Device signed: yes/no"
5. Werk /verify bij om signature te tonen en verifiëren als aanwezig

**Raak dit niet aan:**

- Core API
- Database
- OTS chain
- Bestaande passkey authenticatie flow (die blijft, signing komt erbij)

**De gebruiker merkt niets extra.** De Face ID / Touch ID prompt die er al is, ondertekent nu ook de hash. Geen extra stap. Geen extra UI. Maar het bewijs in de ZIP is fundamenteel sterker.

---

## Eén zin

Van twee feiten naar drie: wat, wanneer, welk apparaat.
