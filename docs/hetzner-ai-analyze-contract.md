# Hetzner AI Analyze Page Contract

## Endpoint
`POST /api/vision/ai/analyze-page`

## Request

```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "deviceUserId": "054aba4f-0453-4e6e-80c0-bdd554d19a91"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageBase64` | string | Yes | Base64 encoded image (JPEG/PNG) with data URL prefix |
| `deviceUserId` | string | Yes | UUID identifying the device/user |

## Expected Response

```json
{
  "success": true,
  "ocrText": "The actual text extracted from the image via OCR...",
  "ocrTokens": [
    { "token": "word1", "confidence": 0.95, "bbox": [10, 20, 50, 40] },
    { "token": "word2", "confidence": 0.92, "bbox": [55, 20, 100, 40] }
  ],
  "namedEntities": [
    { "type": "person", "value": "John Doe", "confidence": 0.88 },
    { "type": "organization", "value": "Acme Corp", "confidence": 0.91 },
    { "type": "location", "value": "Amsterdam", "confidence": 0.95 }
  ],
  "summary": "A concise 1-2 sentence summary of what the page is about based on the OCR text.",
  "oneLineHint": "Brief 5-7 word hint for quick identification",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "topicLabels": ["topic1", "topic2"],
  "tone": ["reflective", "analytical"],
  "futureYouCues": [
    "Remember this insight about X",
    "Follow up on Y"
  ],
  "confidenceScore": 0.87
}
```

## Response Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | Yes | Whether analysis succeeded |
| `ocrText` | string | Yes | Full extracted text from image |
| `ocrTokens` | array | No | Individual tokens with confidence and bounding boxes |
| `namedEntities` | array | No | Extracted entities (person, organization, location, date, other) |
| `summary` | string | Yes | 1-2 sentence summary of page content |
| `oneLineHint` | string | No | Very brief (5-7 words) hint for quick ID |
| `keywords` | string[] | Yes | 3-5 relevant keywords extracted from content |
| `topicLabels` | string[] | No | High-level topic categories |
| `tone` | string[] | Yes | Emotional/stylistic tone (see allowed values below) |
| `futureYouCues` | string[] | No | AI-suggested "future you" memory triggers |
| `confidenceScore` | number | No | Overall confidence 0.0-1.0 |

## Allowed Tone Values

```
reflective, analytical, emotional, practical, creative, 
questioning, determined, grateful, frustrated, hopeful,
nostalgic, curious, urgent, peaceful, ambitious
```

## Named Entity Types

```
person, organization, location, date, other
```

## Example: Real Analysis

**Input**: Photo of handwritten journal page about a project idea

**Expected Output**:
```json
{
  "success": true,
  "ocrText": "Project idea: Build a personal knowledge vault. Store photos of notes, books, ideas. Use AI to extract meaning and connections. Privacy-first - encrypt everything locally.",
  "ocrTokens": [...],
  "namedEntities": [],
  "summary": "A project concept for building a privacy-focused personal knowledge management system using AI to analyze and connect handwritten notes and photos.",
  "oneLineHint": "Knowledge vault project concept",
  "keywords": ["knowledge vault", "AI", "privacy", "notes", "encryption"],
  "topicLabels": ["productivity", "technology", "personal development"],
  "tone": ["creative", "ambitious", "practical"],
  "futureYouCues": [
    "Explore encryption options for local storage",
    "Research AI vision APIs for OCR"
  ],
  "confidenceScore": 0.91
}
```

## ❌ WRONG: Mock/Test Data

Do NOT return hardcoded test values like:
```json
{
  "keywords": ["k1", "k2"],
  "summary": "A person is expressing their love and joy through a series of photos.",
  "tone": ["emotional tone"]
}
```

## Implementation Notes

1. **Use a vision-capable AI model** (Gemini Pro Vision, GPT-4V, etc.)
2. **OCR first**: Extract all text from the image
3. **Then analyze**: Use the OCR text + image context to generate summary, keywords, tone
4. **Be specific**: Keywords and summary should reflect actual content, not generic phrases
5. **Handle errors**: Return `{ "success": false, "error": "message" }` on failure

## Recommended AI Prompt

```
Analyze this image of a handwritten/printed page.

1. Extract ALL visible text (OCR)
2. Identify named entities (people, places, organizations, dates)
3. Generate a concise 1-2 sentence summary
4. Extract 3-5 specific keywords from the actual content
5. Determine the emotional/stylistic tone
6. Suggest 1-3 "future you" memory cues - things worth remembering

Return as JSON with fields: ocrText, namedEntities, summary, keywords, tone, futureYouCues
```
