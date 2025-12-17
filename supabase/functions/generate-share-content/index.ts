import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a content strategist helping writers transform their handwritten notes into shareable digital content.

Given the raw text, summary, keywords, and tone of a handwritten page, generate 4 content formats:

1. **Quote** (max 280 characters): A punchy, memorable quote or insight that works on Twitter/X. Extract the most powerful single idea.

2. **Lesson** (3-5 sentences): A LinkedIn-style insight with context. Start with the key learning, then explain why it matters.

3. **Idea** (newsletter-ready, 100-150 words): A thoughtful exploration suitable for Substack or email. Include the insight and its implications.

4. **Caption** (Instagram-style, 2-3 sentences): An engaging, personal reflection that invites connection. End with a question or call to engage.

IMPORTANT:
- Preserve the writer's voice and authenticity
- Do not add hashtags unless naturally fitting
- Make each format feel distinct, not just shorter/longer versions
- The content should feel like it came from the writer, not AI

Return ONLY valid JSON in this exact format:
{
  "quote": "...",
  "lesson": "...",
  "idea": "...",
  "caption": "..."
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summary, ocrText, keywords, tone } = await req.json();

    if (!summary && !ocrText) {
      return new Response(
        JSON.stringify({ error: 'Either summary or ocrText is required' }),
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

    const userPrompt = `Transform this handwritten page into shareable content:

**Summary:** ${summary || 'Not available'}

**Raw Text (OCR):** ${ocrText || 'Not available'}

**Keywords:** ${keywords?.join(', ') || 'None'}

**Tone:** ${tone?.join(', ') || 'Unknown'}

Generate the 4 content formats (quote, lesson, idea, caption) as JSON.`;

    console.log('[generate-share-content] Generating content for page...');

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-share-content] AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim();

    if (!rawContent) {
      console.error('[generate-share-content] No content in response:', data);
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let content;
    try {
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
      const jsonStr = jsonMatch[1] || rawContent;
      content = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('[generate-share-content] Failed to parse JSON:', rawContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-share-content] Successfully generated content');

    return new Response(
      JSON.stringify({
        success: true,
        content: {
          quote: content.quote || '',
          lesson: content.lesson || '',
          idea: content.idea || '',
          caption: content.caption || '',
        },
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-share-content] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
