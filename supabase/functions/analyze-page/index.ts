import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Controlled vocabulary for topic labels (50-200 range)
const TOPIC_LABELS = [
  'business', 'strategy', 'pitch', 'roadmap', 'pricing', 'product',
  'meeting', 'brainstorm', 'research', 'notes', 'ideas', 'project',
  'personal', 'journal', 'reflection', 'goals', 'plans', 'tasks',
  'creative', 'writing', 'story', 'poem', 'sketch', 'design',
  'learning', 'study', 'lecture', 'book', 'course', 'reading',
  'travel', 'trip', 'adventure', 'memory', 'event', 'celebration',
  'health', 'fitness', 'wellness', 'food', 'recipe', 'diet',
  'finance', 'budget', 'investment', 'savings', 'expense', 'income',
  'relationship', 'family', 'friend', 'love', 'gratitude', 'letter',
  'work', 'career', 'job', 'interview', 'resume', 'networking'
];

// Generic terms to avoid in cues
const GENERIC_TERMS = [
  'idea', 'ideas', 'notes', 'note', 'thoughts', 'thought', 'plan', 'plans',
  'thing', 'things', 'stuff', 'misc', 'random', 'general', 'various',
  'important', 'remember', 'todo', 'list'
];

const SYSTEM_PROMPT = `You are an AI that analyzes handwritten notes for a personal codex/memory system. Your role is to:

1. **OCR with confidence**: Read and transcribe handwritten text. For each word, estimate confidence (0.0-1.0).
2. **Named entities**: Extract people, organizations, locations, dates, and deliverables (pitch, proposal, wedding, visa, etc.)
3. **Highlights**: Detect underlined, circled, boxed, or starred text (writer's emphasis)
4. **Summary**: 1-2 sentence summary of the core idea
5. **One-line hint**: A single retrieval hint phrase (never displayed as truth, just for search)
6. **Tone**: Single emotional tone (focused, frustrated, hopeful, playful, overwhelmed, reflective, curious, determined, anxious, calm)
7. **Keywords**: 3-5 essential, lowercase tokens
8. **Topic labels**: 1-3 labels from controlled vocabulary: ${TOPIC_LABELS.slice(0, 30).join(', ')}, etc.
9. **Suggested cues**: EXACTLY 3 retrieval words/phrases that the user would type to find this page later

**CRITICAL for suggested_cues:**
- Each cue should be 1-3 words, max 30 characters
- At least 1 cue MUST be a person/organization name OR a deliverable word (pitch, proposal, wedding, visa, roadmap)
- AVOID generic terms: ${GENERIC_TERMS.join(', ')}
- Think: "What would I type to find this specific page?"
- Examples of GOOD cues: ["sarah proposal", "Q4 budget", "wedding venue"]
- Examples of BAD cues: ["important idea", "notes", "thoughts"]

You must respond ONLY with valid JSON in this exact format:
{
  "ocr_text": "the full transcribed text",
  "ocr_tokens": [
    {"token": "word", "confidence": 0.95, "bbox": {"x": 10, "y": 20, "width": 50, "height": 15}}
  ],
  "named_entities": [
    {"type": "person|organization|location|date|deliverable|other", "value": "entity text", "confidence": 0.9, "span": {"start": 0, "end": 10}}
  ],
  "highlights": ["underlined or emphasized text"],
  "summary": "1-2 sentence summary",
  "one_line_hint": "brief retrieval hint",
  "tone": "single tone label",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "topic_labels": ["label1", "label2"],
  "suggested_cues": ["cue1", "cue2", "cue3"]
}

Be accurate with OCR. If text is unclear, make your best interpretation with lower confidence.
The bbox field is optional but helps with highlighting matches later.`;


serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, image_url } = await req.json();

    if (!image_base64 && !image_url) {
      return new Response(
        JSON.stringify({ error: 'Either image_base64 or image_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the image content for Gemini vision
    let imageContent;
    if (image_base64) {
      // Detect mime type from base64 header or default to jpeg
      let mimeType = 'image/jpeg';
      if (image_base64.startsWith('/9j/')) mimeType = 'image/jpeg';
      else if (image_base64.startsWith('iVBOR')) mimeType = 'image/png';
      else if (image_base64.startsWith('R0lGOD')) mimeType = 'image/gif';
      else if (image_base64.startsWith('UklGR')) mimeType = 'image/webp';

      imageContent = {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${image_base64}`
        }
      };
    } else {
      imageContent = {
        type: "image_url",
        image_url: {
          url: image_url
        }
      };
    }

    console.log('Calling Lovable AI for enhanced page analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this handwritten page. Return OCR with confidence scores, named entities, highlights, summary, tone, keywords, topic labels, and exactly 3 suggested retrieval cues. Respond in JSON format only.' },
              imageContent
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted, please add credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing JSON...');

    // Parse the JSON response - handle potential markdown code blocks
    let analysisResult;
    try {
      let jsonStr = content.trim();
      
      // Strip markdown code block markers more robustly
      // Handle ```json, ```JSON, ``` with newlines, etc.
      jsonStr = jsonStr.replace(/^```(?:json|JSON)?\s*/i, '');
      jsonStr = jsonStr.replace(/\s*```\s*$/i, '');
      jsonStr = jsonStr.trim();

      // Try to parse directly first
      try {
        analysisResult = JSON.parse(jsonStr);
      } catch (firstParseError) {
        // If direct parse fails, try to find JSON object in the string
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw firstParseError;
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw_response: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and normalize response
    const {
      ocr_text = '',
      ocr_tokens = [],
      named_entities = [],
      highlights = [],
      summary = '',
      one_line_hint = '',
      tone = 'reflective',
      keywords = [],
      topic_labels = [],
      suggested_cues = []
    } = analysisResult;

  // Ensure we have exactly 3 cues
  let finalCues = suggested_cues.slice(0, 3);
  while (finalCues.length < 3) {
    // Fallback: use named entities or keywords
    if (named_entities.length > 0 && finalCues.length < 3) {
      const entity = named_entities.find((e: { value: string }) => !finalCues.includes(e.value));
      if (entity) finalCues.push(entity.value.substring(0, 30));
    } else if (keywords.length > 0 && finalCues.length < 3) {
      const keyword = keywords.find((k: string) => !finalCues.includes(k) && !GENERIC_TERMS.includes(k.toLowerCase()));
      if (keyword) finalCues.push(keyword);
    } else {
      // Last resort: use first unique words from OCR
      const words = ocr_text.split(/\s+/).filter((w: string) => w.length > 3 && !GENERIC_TERMS.includes(w.toLowerCase()));
      const word = words.find((w: string) => !finalCues.includes(w));
      if (word) finalCues.push(word.substring(0, 30));
      else break;
    }
  }

    // Validate OCR tokens format
    const validatedTokens = Array.isArray(ocr_tokens) 
      ? ocr_tokens.map(t => ({
          token: String(t.token || ''),
          confidence: typeof t.confidence === 'number' ? t.confidence : 0.8,
          bbox: t.bbox || undefined
        }))
      : [];

    // Validate named entities format
    const validatedEntities = Array.isArray(named_entities)
      ? named_entities.map(e => ({
          type: ['person', 'organization', 'location', 'date', 'deliverable', 'other'].includes(e.type) 
            ? e.type 
            : 'other',
          value: String(e.value || ''),
          confidence: typeof e.confidence === 'number' ? e.confidence : 0.8,
          span: e.span || undefined
        }))
      : [];

    console.log('Enhanced page analysis complete:', { 
      ocr_length: ocr_text.length,
      token_count: validatedTokens.length,
      entity_count: validatedEntities.length,
      highlight_count: highlights.length,
      summary_length: summary.length, 
      tone, 
      keywords_count: keywords.length,
      topic_labels_count: topic_labels.length,
      cues: finalCues
    });

    return new Response(
      JSON.stringify({
        ocr_text,
        ocr_tokens: validatedTokens,
        named_entities: validatedEntities,
        highlights: Array.isArray(highlights) ? highlights : [],
        summary,
        one_line_hint,
        tone,
        keywords,
        topic_labels: Array.isArray(topic_labels) ? topic_labels : [],
        suggested_cues: finalCues,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-page function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
