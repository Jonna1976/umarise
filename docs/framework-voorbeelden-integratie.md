# Framework Examples: Umarise Integration

Every example shows one thing: how to anchor a file in your existing
upload handler. Copy the relevant example, adapt, done.

---

## Django (Python)

```python
# views.py
from umarise import UmariseCore, hash_buffer
import os

core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])

def upload_thesis(request):
    file = request.FILES["thesis"]
    data = file.read()

    # Save as usual
    submission = Submission.objects.create(student=request.user, file=file)

    # Anchor — 1 line
    origin = core.attest(hash_buffer(data))

    # Store origin_id alongside your record
    submission.origin_id = origin.origin_id
    submission.save(update_fields=["origin_id"])

    return JsonResponse({"id": str(submission.id), "origin_id": origin.origin_id})
```

---

## Flask (Python)

```python
from flask import Flask, request, jsonify
from umarise import UmariseCore, hash_buffer
import os

app = Flask(__name__)
core = UmariseCore(api_key=os.environ["UMARISE_API_KEY"])

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["document"]
    data = file.read()

    record_id = save_to_database(file.filename, data)

    # Anchor — 1 line
    origin = core.attest(hash_buffer(data))

    return jsonify({"record_id": record_id, "origin_id": origin.origin_id})
```

---

## Express (Node.js)

```javascript
const { anchor, hashBuffer } = require("@umarise/anchor");
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("document"), async (req, res) => {
    const recordId = await db.documents.create({ file: req.file.path });

    // Anchor — 1 line
    const data = fs.readFileSync(req.file.path);
    const result = await anchor(hashBuffer(data), process.env.UMARISE_API_KEY);

    res.json({ recordId, originId: result.origin_id });
});
```

---

## CI/CD (GitHub Actions)

```yaml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: dist/release.tar.gz
  env:
    UMARISE_API_KEY: ${{ secrets.UMARISE_API_KEY }}
```

---

## Install

| Language | Command |
|----------|---------|
| Python   | `pip install umarise-core-sdk` |
| Node.js  | `npm install @umarise/anchor` |
| CLI      | `npx @umarise/cli anchor <file>` |

## Pattern

Every framework follows the same pattern:

```
1. Receive file (upload, API call, ingest)
2. hash = hash_buffer(file_bytes)     ← local, no network
3. origin = core.attest(hash)         ← 1 API call
4. Store origin.origin_id with your record
```

The SDK never blocks your workflow. If the API is temporarily
unreachable, wrap in try/except and retry later.

Full reference: [umarise.com/api-reference](https://umarise.com/api-reference)
