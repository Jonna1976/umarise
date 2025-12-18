# Hetzner Vision AI Implementation Guide

## Doel
Vervang basis OCR met een **vision-capable AI model** voor accurate handschrift-herkenning en intelligente analyse.

---

## 🎯 KRITIEKE REGELS VOOR futureYouCues (Spine Words)

Dit zijn de woorden die op de "rug" van de pagina verschijnen in de memory view. **Deze regels MOETEN exact gevolgd worden:**

### Regel 1: Formaat
- **EXACT 2-3 woorden** (in UI tonen we max 2)
- **Max 30 karakters per cue**
- Lowercase of Title Case

### Regel 2: Inhoud Prioriteit
Minstens 1 cue MOET een van deze zijn:
1. **Persoonsnaam** (bijv. "Sarah", "Jan de Vries")
2. **Organisatienaam** (bijv. "Tesla", "UvA")
3. **Deliverable woord** (bijv. "pitch", "proposal", "wedding", "visa", "roadmap", "budget")

### Regel 3: VERBODEN Generieke Termen
Deze woorden mogen NOOIT als cue gebruikt worden:
```
idea, ideas, notes, note, thoughts, thought, plan, plans,
thing, things, stuff, misc, random, general, various,
important, remember, todo, list, image, camera, photo
```

### Regel 4: Denkwijze
Vraag jezelf: **"Wat zou de gebruiker typen om deze specifieke pagina later te vinden?"**

### Voorbeelden

✅ **GOED:**
```json
"futureYouCues": ["sarah proposal", "Q4 budget"]
"futureYouCues": ["wedding venue", "Amsterdam"]
"futureYouCues": ["startup pitch", "funding"]
"futureYouCues": ["mom birthday", "cadeau"]
```

❌ **FOUT:**
```json
"futureYouCues": ["important idea", "notes"]
"futureYouCues": ["Remember this", "Follow up"]
"futureYouCues": ["image", "photo"]
"futureYouCues": ["thoughts", "misc"]
```

### Regel 5: Fallback Logica
Als de AI geen goede cues kan genereren, gebruik deze volgorde:
1. Named entities (personen, organisaties)
2. Keywords (geen generieke)
3. Eerste unieke woorden uit OCR tekst (> 3 karakters)

---

## Controlled Vocabulary voor Topic Labels

Gebruik alleen labels uit deze lijst:
```
business, strategy, pitch, roadmap, pricing, product,
meeting, brainstorm, research, notes, ideas, project,
personal, journal, reflection, goals, plans, tasks,
creative, writing, story, poem, sketch, design,
learning, study, lecture, book, course, reading,
travel, trip, adventure, memory, event, celebration,
health, fitness, wellness, food, recipe, diet,
finance, budget, investment, savings, expense, income,
relationship, family, friend, love, gratitude, letter,
work, career, job, interview, resume, networking
```

---

## Allowed Tone Values

Kies EXACT 1 tone uit:
```
grateful, happy, energetic, peaceful, excited, nostalgic,
determined, curious, anxious, frustrated, hopeful, tender,
restless, melancholic, playful, focused, overwhelmed, reflective
```

---

## Named Entity Types

```
person, organization, location, date, deliverable, other
```

**Deliverable** = pitch, proposal, wedding, visa, roadmap, contract, etc.

---

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
    
    prompt = """You are an AI that analyzes handwritten notes for a personal codex/memory system.

TASKS:
1. **OCR**: Read and transcribe ALL handwritten text accurately as a single string
2. **Named entities**: Extract people, organizations, locations, dates, and deliverables (pitch, proposal, wedding, visa, etc.)
3. **Highlights**: Detect underlined, circled, boxed, or starred text (writer's emphasis)
4. **Summary**: 1-2 sentence summary of the ACTUAL core idea (NOT a template!)
5. **One-line hint**: A single retrieval hint phrase (5-7 words)
6. **Tone**: Single emotional tone from: grateful, happy, energetic, peaceful, excited, nostalgic, determined, curious, anxious, frustrated, hopeful, tender, restless, melancholic, playful, focused, overwhelmed, reflective
7. **Keywords**: 3-5 essential, lowercase tokens from the ACTUAL content
8. **Topic labels**: 1-3 labels from: business, strategy, pitch, roadmap, pricing, product, meeting, brainstorm, research, notes, ideas, project, personal, journal, reflection, goals, plans, tasks, creative, writing, story, poem, sketch, design, learning, study, lecture, book, course, reading, travel, trip, adventure, memory, event, celebration, health, fitness, wellness, food, recipe, diet, finance, budget, investment, savings, expense, income, relationship, family, friend, love, gratitude, letter, work, career, job, interview, resume, networking
9. **futureYouCues**: EXACTLY 2 retrieval words/phrases for the page spine

**CRITICAL RULES FOR futureYouCues:**
- Each cue: 1-3 words, max 30 characters
- At least 1 cue MUST be a person/organization name OR a deliverable word (pitch, proposal, wedding, visa, roadmap, budget)
- NEVER use generic terms: idea, ideas, notes, note, thoughts, thought, plan, plans, thing, things, stuff, misc, random, general, various, important, remember, todo, list, image, camera, photo
- Think: "What would I type to find this specific page?"
- GOOD examples: ["sarah proposal", "Q4 budget"], ["wedding venue", "Amsterdam"], ["startup pitch", "funding"]
- BAD examples: ["important idea", "notes"], ["Remember this", "Follow up"], ["image", "photo"]

Return this exact JSON format (no markdown, no code blocks):
{
  "success": true,
  "ocrText": "exact transcribed text...",
  "ocrTokens": [{"token": "word", "confidence": 0.95, "bbox": [x, y, w, h]}],
  "namedEntities": [{"type": "person|organization|location|date|deliverable", "value": "Name", "confidence": 0.9}],
  "highlights": ["underlined or emphasized text"],
  "summary": "Specific 1-2 sentence summary of the ACTUAL content",
  "oneLineHint": "Brief 5-7 word description",
  "keywords": ["specific", "content", "keywords"],
  "topicLabels": ["category1", "category2"],
  "tone": ["reflective"],
  "futureYouCues": ["person_or_deliverable", "specific_topic"],
  "confidenceScore": 0.87
}"""

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
