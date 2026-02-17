# Verify Failure Modes

Drie situaties waarin verificatie niet doet wat de developer verwacht.
Per situatie: wat ze doen, wat ze zien, wat het betekent, wat ze moeten doen.

---

## 1. Verkeerd bestand — hash mismatch

**Wat ze doen:**
Bestand gewijzigd na attestatie (opnieuw opgeslagen, metadata veranderd,
geconverteerd) en daarna verify gedraaid.

**Wat ze zien:**
```json
{"error":{"code":"NOT_FOUND","message":"No attestation found for this hash"}}
```

**Wat het betekent:**
De hash van het huidige bestand komt niet overeen met de hash die bij
attestatie is geregistreerd. Zelfs 1 byte verschil geeft een compleet
andere hash.

**Wat ze moeten doen:**
- Hash het originele, ongewijzigde bestand
- Veelvoorkomende oorzaken:
  - Bestand opnieuw opgeslagen (Word, PDF editor voegt metadata toe)
  - Bestand geconverteerd (bijv. .docx → .pdf)
  - Bestand gedownload en opnieuw geüpload (sommige systemen wijzigen metadata)
  - Alleen de inhoud gehasht i.p.v. het volledige bestand
- Check: `sha256sum bestand.pdf` moet exact dezelfde hash geven als bij attestatie

**Suggestie voor /api-reference:**
> NOT_FOUND bij verify betekent: deze exact hash is niet geattesteerd.
> Check of je het originele, ongewijzigde bestand hasht.
> Zelfs 1 byte verschil (metadata, witruimte, encoding) geeft een andere hash.

---

## 2. Nog niet anchored — proof is pending

**Wat ze doen:**
Attestatie aangemaakt en meteen daarna proof downloaden of verify verwachten
met proof_status "anchored".

**Wat ze zien:**
```json
{"origin_id":"...","proof_status":"pending","bitcoin_block_height":null}
```

Of bij proof-download:
```json
{"status":"pending","message":"Proof not yet anchored to Bitcoin. Try again later."}
```

**Wat het betekent:**
De attestatie bestaat en is geregistreerd, maar het Bitcoin-bewijs is nog
niet definitief. Dit duurt 10-20 minuten (soms langer bij trage blocks).

**Wat ze moeten doen:**
- Wacht 10-20 minuten
- Poll via `GET /v1-core-resolve?origin_id=...` elke 60 seconden
- Of gebruik `track_anchor()` uit de template — die doet het polling voor je
- proof_status gaat van "pending" → "anchored"

**Suggestie voor /api-reference:**
> proof_status "pending" = attestatie geregistreerd, Bitcoin-verankering loopt.
> Wacht 10-20 minuten. Poll via resolve of gebruik track_anchor().
> Na "anchored" is het bewijs definitief en onafhankelijk verifieerbaar.

---

## 3. Verkeerd hash-formaat

**Wat ze doen:**
Hash zonder `sha256:` prefix, of met verkeerde lengte, of hex-encoded
in plaats van raw, of MD5 in plaats van SHA-256.

**Wat ze zien:**
```json
{"error":{"code":"INVALID_HASH_FORMAT","message":"Hash must be in format sha256:<64-hex-chars> or raw 64-char hex"}}
```

**Wat het betekent:**
De API accepteert twee formaten:
- `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (met prefix)
- `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (64 hex chars, zonder prefix)

Alles anders wordt geweigerd.

**Wat ze moeten doen:**
- Gebruik `hash_file()` of `hashFile()` uit de template — die retourneren altijd het juiste formaat
- Als je zelf hasht: output moet 64 hexadecimale karakters zijn (sha256)
- Geen MD5 (32 chars), geen SHA-1 (40 chars), geen base64
- Check: `echo -n "sha256:$(sha256sum bestand.pdf | cut -d' ' -f1)"`

**Suggestie voor /api-reference:**
> Hash moet SHA-256 zijn: 64 hexadecimale karakters, optioneel met sha256: prefix.
> Gebruik de hash_file()/hashFile() functie uit de template — die doet het goed.

---

## Samenvatting voor /api-reference

| Situatie | Error code | Betekenis | Actie |
|----------|-----------|-----------|-------|
| Hash niet gevonden | NOT_FOUND | Dit exacte bestand is niet geattesteerd | Hash het originele, ongewijzigde bestand |
| Proof nog niet klaar | pending | Bitcoin-verankering loopt (10-20 min) | Wacht en poll via resolve |
| Verkeerd formaat | INVALID_HASH_FORMAT | Geen geldig SHA-256 | Gebruik hash_file()/hashFile() uit template |

---

## Bonus: wat als verify een OUDERE attestatie toont?

**Wat ze doen:**
Verify op de test-hash (sha256 van leeg bestand) of een hash die eerder
door iemand anders is geattesteerd.

**Wat ze zien:**
Een attestatie met een `captured_at` die ouder is dan hun eigen attestatie.

**Wat het betekent:**
Verify retourneert altijd de EERSTE attestatie voor een hash (first-in-time).
Als dezelfde hash eerder is geattesteerd, zie je die eerdere attestatie.
Dit is correct — het bewijst dat die hash al eerder bestond.

**Suggestie voor /api-reference:**
> Verify retourneert de eerste attestatie voor een hash (first-in-time).
> Bij een veelgebruikte test-hash zie je mogelijk een eerdere captured_at.
> Met een eigen, uniek bestand zie je altijd je eigen attestatie.
