# Briefing: /api-reference uitbreiding — Framework-voorbeelden + Failure Modes

## Twee toevoegingen aan de Integration Templates sectie op /api-reference

---

## 1. Framework-voorbeelden (onder de Templates sectie)

Na "Stap 3: Verwacht resultaat" komt een nieuwe sectie:

### "Zo gebruik je dit in je app"

Drie tabs: Django | Flask | Express

Elk voorbeeld toont hetzelfde patroon in ~10 regels:
1. Ontvang bestand (upload)
2. Sla op in eigen systeem → record_id
3. `safe_attest(bestand, record_id)` — 1 regel
4. Optioneel: `track_anchor(origin_id, record_id)`

**Django tab:**
```python
# views.py
import umarise_integration as umarise

umarise.API_KEY = "um_jouw_key"

def upload_thesis(request):
    file = request.FILES["thesis"]
    submission = Submission.objects.create(student=request.user, file=file)
    
    # Attesteer — 1 regel
    result = umarise.safe_attest(submission.file.path, str(submission.id))
    
    if result:
        umarise.track_anchor(result["origin_id"], str(submission.id))
    
    return JsonResponse({"id": submission.id})
```

**Flask tab:**
```python
# app.py
from flask import Flask, request, jsonify
import umarise_integration as umarise

app = Flask(__name__)
umarise.API_KEY = "um_jouw_key"

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["document"]
    data = file.read()
    record_id = save_to_database(file.filename, data)
    
    # Attesteer — 1 regel
    result = umarise.attest_bytes(data, record_id)
    
    return jsonify({"record_id": record_id, "origin_id": result["origin_id"]})
```

**Express tab:**
```javascript
// routes/upload.js
const um = require("./umarise-integration.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

um.API_KEY = "um_jouw_key";

app.post("/upload", upload.single("document"), async (req, res) => {
    const recordId = await db.documents.create({ file: req.file.path });
    
    // Attesteer — 1 regel
    const result = await um.safeAttest(req.file.path, String(recordId));
    
    if (result) um.trackAnchor(result.origin_id, String(recordId));
    
    res.json({ recordId, originId: result?.origin_id });
});
```

**Onder de tabs, als tekst:**
> Elk framework volgt hetzelfde patroon: ontvang bestand → sla op →
> safe_attest() → optioneel track_anchor(). safe_attest() blokkeert
> je workflow nooit — als Umarise tijdelijk onbereikbaar is, logt het
> de fout en gaat je app gewoon door.

---

## 2. Troubleshooting (onder de Framework-voorbeelden)

### "Veelvoorkomende situaties"

Drie blokken, elk met icoon + uitklapbaar of altijd zichtbaar:

**Hash niet gevonden (NOT_FOUND)**
> Dit exacte bestand is niet geattesteerd. Veelvoorkomende oorzaken:
> - Bestand opnieuw opgeslagen (Word/PDF editor voegt metadata toe)
> - Bestand geconverteerd (.docx → .pdf)
> - Alleen inhoud gehasht i.p.v. het volledige bestand
>
> Fix: hash het originele, ongewijzigde bestand.
> Check: `sha256sum bestand.pdf` moet exact dezelfde hash geven als bij attestatie.

**Proof is pending**
> Attestatie is geregistreerd. Bitcoin-verankering loopt (10-20 minuten).
> Poll via `GET /v1-core-resolve?origin_id=...` elke 60 seconden,
> of gebruik `track_anchor()` uit de template.
> proof_status gaat van "pending" → "anchored".

**Verkeerd hash-formaat (INVALID_HASH_FORMAT)**
> Hash moet SHA-256 zijn: 64 hexadecimale karakters, optioneel met
> `sha256:` prefix. Geen MD5, geen SHA-1, geen base64.
> Fix: gebruik `hash_file()` / `hashFile()` uit de template —
> die retourneert altijd het juiste formaat.

**Verify toont een oudere attestatie**
> Verify retourneert de eerste attestatie voor een hash (first-in-time).
> Bij een veelgebruikte test-hash zie je mogelijk een eerdere captured_at.
> Dat is correct — het bewijst dat die hash al eerder bestond.
> Met een eigen, uniek bestand zie je altijd je eigen attestatie.

### Samenvattingstabel (optioneel, compact)

| Situatie | Error | Actie |
|----------|-------|-------|
| Hash niet gevonden | NOT_FOUND | Hash het originele bestand |
| Proof nog niet klaar | pending | Wacht 10-20 min, poll resolve |
| Verkeerd formaat | INVALID_HASH_FORMAT | Gebruik hash_file()/hashFile() |

---

## Wat NIET verandert

- Quick Start (al live, getest)
- API endpoint documentatie (al compleet)
- Download-knoppen en terminal-commando's (net gefixt)
- Checklist (al live)

## Volgorde op de pagina

1. Quick Start
2. Try it Live
3. API Endpoints (Health, Attest, Resolve, Verify, Proof)
4. Error Codes + Rate Limits
5. **Integration Templates** (downloads + test)
6. **Framework-voorbeelden** (Django, Flask, Express tabs) ← NIEUW
7. **Troubleshooting** (failure modes) ← NIEUW
8. Integration Checklist
