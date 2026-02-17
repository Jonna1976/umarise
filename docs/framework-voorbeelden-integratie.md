# Framework-voorbeelden: Umarise integratie

Elk voorbeeld toont één ding: hoe je `attest_bytes()` of `attestBuffer()`
aanroept in je bestaande upload handler. Kopieer het relevante voorbeeld,
pas het aan, klaar.

---

## Django (Python)

```python
# views.py
import umarise_integration as umarise

umarise.API_KEY = "um_jouw_key"

def upload_thesis(request):
    file = request.FILES["thesis"]
    
    # Sla het bestand op zoals je normaal doet
    submission = Submission.objects.create(
        student=request.user,
        file=file,
    )
    
    # Attesteer — 1 regel
    result = umarise.safe_attest(submission.file.path, str(submission.id))
    
    # Optioneel: wacht op Bitcoin-verankering in achtergrond
    if result:
        umarise.track_anchor(result["origin_id"], str(submission.id))
    
    return JsonResponse({"id": submission.id, "origin_id": result["origin_id"] if result else None})
```

**Wat je aanpast in `umarise_integration.py`:**
```python
def save_origin_id(record_id, origin_id):
    Submission.objects.filter(id=record_id).update(origin_id=origin_id)
```

---

## Flask (Python)

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
    
    # Sla op in je eigen systeem
    record_id = save_to_database(file.filename, data)
    
    # Attesteer — 1 regel
    result = umarise.attest_bytes(data, record_id)
    
    return jsonify({"record_id": record_id, "origin_id": result["origin_id"]})
```

---

## Express (Node.js)

```javascript
// routes/upload.js
const um = require("./umarise-integration.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

um.API_KEY = "um_jouw_key";

app.post("/upload", upload.single("document"), async (req, res) => {
    // Sla op in je eigen systeem
    const recordId = await db.documents.create({ file: req.file.path });
    
    // Attesteer — 1 regel
    const result = await um.safeAttest(req.file.path, String(recordId));
    
    // Optioneel: wacht op Bitcoin-verankering in achtergrond
    if (result) {
        um.trackAnchor(result.origin_id, String(recordId));
    }
    
    res.json({ recordId, originId: result?.origin_id });
});
```

**Wat je aanpast in `umarise-integration.js`:**
```javascript
async function saveOriginId(recordId, originId) {
    await db.documents.update(recordId, { origin_id: originId });
}
```

---

## Patroon

Elk framework volgt hetzelfde patroon:

```
1. Ontvang bestand (upload, API call, ingest)
2. Sla op in je eigen systeem → je hebt een record_id
3. umarise.safe_attest(bestand, record_id)  ← 1 regel
4. Optioneel: umarise.track_anchor(origin_id, record_id)
```

`safe_attest` blokkeert je workflow nooit. Als Umarise tijdelijk
onbereikbaar is, logt het de fout en gaat je app gewoon door.
