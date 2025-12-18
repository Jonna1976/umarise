# Hetzner Vision AI Implementation Guide

## Doel
Vervang basis OCR met een **vision-capable AI model** voor accurate handschrift-herkenning en intelligente analyse.

## Aanbevolen Modellen (in volgorde van voorkeur)

### 1. Google Gemini Pro Vision (AANBEVOLEN)
**Waarom:** Beste prijs/kwaliteit, excellent voor handschrift, native multimodal.

```python
import google.generativeai as genai
import base64

genai.configure(api_key="YOUR_GEMINI_API_KEY")

def analyze_page(image_base64: str) -> dict:
    """Analyze a page image with Gemini Pro Vision."""
    
    model = genai.GenerativeModel('gemini-1.5-flash')  # of gemini-1.5-pro
    
    # Decode base64 image
    if image_base64.startswith('data:'):
        image_base64 = image_base64.split(',')[1]
    
    image_data = base64.b64decode(image_base64)
    
    prompt = """Analyze this image of a handwritten/printed page.

TASKS:
1. Extract ALL visible text (OCR) - be very accurate with handwriting
2. Identify named entities (people, places, organizations, dates)
3. Generate a concise 1-2 sentence summary of the ACTUAL content
4. Extract 3-5 specific keywords from the actual content (NOT generic words like "image", "photo")
5. Determine the emotional/stylistic tone from: reflective, analytical, emotional, practical, creative, questioning, determined, grateful, frustrated, hopeful, nostalgic, curious, urgent, peaceful, ambitious
6. Suggest 1-2 "future you" memory cues - specific things worth remembering
7. Create a brief 5-7 word hint for quick identification

Return JSON:
{
  "success": true,
  "ocrText": "exact transcribed text...",
  "ocrTokens": [{"token": "word", "confidence": 0.95, "bbox": [x, y, w, h]}],
  "namedEntities": [{"type": "person|organization|location|date", "value": "Name", "confidence": 0.9}],
  "summary": "Specific summary of what this page is about...",
  "oneLineHint": "Brief 5-7 word description",
  "keywords": ["specific", "content", "keywords"],
  "topicLabels": ["category1", "category2"],
  "tone": ["reflective", "hopeful"],
  "futureYouCues": ["Remember this insight about X", "Follow up on Y"],
  "confidenceScore": 0.87
}

CRITICAL: 
- Summary must describe ACTUAL content, not be a template
- Keywords must be from the ACTUAL text, not generic
- If you can't read something, estimate with lower confidence"""

    response = model.generate_content([
        prompt,
        {"mime_type": "image/jpeg", "data": image_data}
    ])
    
    # Parse JSON from response
    import json
    result = json.loads(response.text)
    return result
```

### 2. OpenAI GPT-4 Vision
**Waarom:** Zeer accurate, goede context-understanding.

```python
import openai
import base64

client = openai.OpenAI(api_key="YOUR_OPENAI_API_KEY")

def analyze_page_gpt4v(image_base64: str) -> dict:
    """Analyze a page image with GPT-4 Vision."""
    
    # Ensure proper data URL format
    if not image_base64.startswith('data:'):
        image_base64 = f"data:image/jpeg;base64,{image_base64}"
    
    response = client.chat.completions.create(
        model="gpt-4o",  # or gpt-4-vision-preview
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analyze this handwritten/printed page image.

Extract ALL visible text accurately, identify entities, generate a SPECIFIC summary 
(not a template), extract ACTUAL keywords from the content, determine emotional tone,
and suggest memory cues.

Return as JSON with fields:
- ocrText: full extracted text
- namedEntities: [{type, value, confidence}]
- summary: 1-2 sentence SPECIFIC summary
- oneLineHint: 5-7 word hint
- keywords: 3-5 ACTUAL keywords from content
- topicLabels: categories
- tone: array of tones from [reflective, analytical, emotional, practical, creative, questioning, determined, grateful, frustrated, hopeful, nostalgic, curious, urgent, peaceful, ambitious]
- futureYouCues: 1-2 specific memory triggers
- confidenceScore: 0.0-1.0
- success: true"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_base64}
                    }
                ]
            }
        ],
        max_tokens=2000
    )
    
    import json
    return json.loads(response.choices[0].message.content)
```

### 3. Ollama + LLaVA (Lokaal, Geen API Kosten)
**Waarom:** Privacy-first, geen externe API calls, gratis.

```python
import requests
import base64

OLLAMA_URL = "http://localhost:11434"

def analyze_page_llava(image_base64: str) -> dict:
    """Analyze a page image with local LLaVA model."""
    
    # Remove data URL prefix if present
    if image_base64.startswith('data:'):
        image_base64 = image_base64.split(',')[1]
    
    prompt = """Analyze this handwritten page. Extract:
1. All visible text (OCR)
2. Named entities (people, places, dates)
3. A SPECIFIC 1-2 sentence summary
4. 3-5 ACTUAL keywords from the content
5. Emotional tone
6. 1-2 memory cues

Return JSON with: ocrText, namedEntities, summary, oneLineHint, keywords, topicLabels, tone, futureYouCues, confidenceScore, success"""

    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": "llava:13b",  # or llava:7b for faster
            "prompt": prompt,
            "images": [image_base64],
            "stream": False,
            "format": "json"
        }
    )
    
    import json
    result = response.json()
    return json.loads(result["response"])
```

**Ollama Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull LLaVA model
ollama pull llava:13b

# Start server
ollama serve
```

---

## API Endpoint Update

Update `/api/vision/ai/analyze-page` om het gekozen model te gebruiken:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI()

# Kies model op basis van environment variable
VISION_MODEL = os.getenv("VISION_MODEL", "gemini")  # gemini, gpt4v, llava

class AnalyzeRequest(BaseModel):
    imageBase64: str
    deviceUserId: str

@app.post("/api/vision/ai/analyze-page")
async def analyze_page(request: AnalyzeRequest):
    try:
        if VISION_MODEL == "gemini":
            result = analyze_page_gemini(request.imageBase64)
        elif VISION_MODEL == "gpt4v":
            result = analyze_page_gpt4v(request.imageBase64)
        elif VISION_MODEL == "llava":
            result = analyze_page_llava(request.imageBase64)
        else:
            raise ValueError(f"Unknown model: {VISION_MODEL}")
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

---

## Response Contract (VERPLICHT)

Alle velden in **camelCase**:

```json
{
  "success": true,
  "ocrText": "Exacte tekst uit de afbeelding...",
  "ocrTokens": [
    {"token": "woord", "confidence": 0.95, "bbox": [10, 20, 50, 40]}
  ],
  "namedEntities": [
    {"type": "person", "value": "Jan de Vries", "confidence": 0.88}
  ],
  "summary": "Een specifieke samenvatting van de inhoud, NIET een template.",
  "oneLineHint": "Project idee over kennisbank",
  "keywords": ["specifiek", "keyword", "uit", "tekst"],
  "topicLabels": ["productiviteit", "technologie"],
  "tone": ["reflective", "ambitious"],
  "futureYouCues": ["Onthoud dit inzicht over X", "Volg dit op"],
  "confidenceScore": 0.87
}
```

---

## ❌ FOUTEN DIE NIET MOGEN

```json
// FOUT: Generic/template responses
{
  "summary": "1-2 sentence summary of the actual content",
  "keywords": ["image", "camera", "photo"],
  "oneLineHint": "5-7 word hint for quick identification"
}

// FOUT: Slechte OCR zonder context
{
  "ocrText": "AL. 12. LOAS Pa e @ Ee tet Mare Lag Snapshot"
}
```

---

## Test Commando

```bash
# Test met een sample image
curl -X POST http://localhost:8000/api/vision/ai/analyze-page \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
    "deviceUserId": "test-user-123"
  }'
```

---

## Kosten Vergelijking

| Model | Kosten per 1000 images | Snelheid | Handschrift Kwaliteit |
|-------|------------------------|----------|----------------------|
| Gemini 1.5 Flash | ~$0.05 | Snel | Excellent |
| Gemini 1.5 Pro | ~$0.25 | Medium | Excellent |
| GPT-4o | ~$2.50 | Medium | Excellent |
| GPT-4o-mini | ~$0.15 | Snel | Goed |
| LLaVA (lokaal) | Gratis | Langzaam | Goed |

**Aanbeveling:** Start met **Gemini 1.5 Flash** voor de beste prijs/kwaliteit verhouding.
