// ⚠️ DEPRECATED · March 2026
// This function is part of the Companion/Codex AI layer (itexisted.app).
// Retained as reference code. Not deployed. See: docs/core-vs-companion.md
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkCompanionRateLimit, rateLimitResponse } from '../_shared/companionRateLimit.ts';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

const AI_RATE_LIMIT = 10;

const SYSTEM_PROMPT = `Je bent een AI die persoonlijke notities analyseert om patronen, thema's en een rode draad te ontdekken.

Je krijgt een verzameling samenvattingen, tonen en keywords van handgeschreven pagina's over tijd.

Analyseer deze data en geef terug:

1. **Rode Draad** (core_thread): De belangrijkste onderliggende thema of vraag die door alles heen loopt. Dit is het centrale verhaal of de drijfveer achter de notities. Max 2-3 zinnen.

2. **Terugkerende Thema's** (recurring_themes): 3-5 thema's die steeds terugkomen, met een korte beschrijving van hoe ze zich manifesteren.

3. **Emotionele Trends** (emotional_trends): Hoe de emotionele toon evolueert over tijd. Zijn er patronen? Wordt het positiever/negatiever? Is er cyclisch gedrag?

4. **Inzichten** (insights): 2-3 specifieke observaties of inzichten die niet direct zichtbaar zijn maar wel belangrijk.

5. **Suggesties** (suggestions): 1-2 suggesties gebaseerd op de patronen (geen coaching, puur observatie).

Antwoord ALLEEN met valide JSON in dit exacte formaat:
{
  "core_thread": "beschrijving van de rode draad",
  "recurring_themes": [
    { "name": "thema naam", "description": "korte beschrijving", "frequency": "hoog/midden/laag" }
  ],
  "emotional_trends": {
    "overall_direction": "stabiel/opwaarts/neerwaarts/cyclisch",
    "dominant_tone": "meest voorkomende toon",
    "description": "beschrijving van emotionele patronen"
  },
  "insights": [
    "inzicht 1",
    "inzicht 2"
  ],
  "suggestions": [
    "suggestie 1"
  ]
}`;

serve(async (req) => {
  const corsHeaders = getCompanionCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req);
  }

  try {
    const { device_user_id } = await req.json();

    if (!device_user_id) {
      return new Response(
        JSON.stringify({ error: 'device_user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit
    const rl = await checkCompanionRateLimit(device_user_id, 'analyze-patterns', AI_RATE_LIMIT);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetInSeconds);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all pages for this device user
    const { data: pages, error: dbError } = await supabase
      .from('pages')
      .select('summary, tone, keywords, created_at, primary_keyword')
      .eq('device_user_id', device_user_id)
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pages || pages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No pages found for analysis' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pages.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Need at least 3 pages for pattern analysis', page_count: pages.length }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing patterns for ${pages.length} pages...`);

    // Prepare data for AI analysis
    const analysisData = pages.map((p, index) => ({
      index: index + 1,
      date: p.created_at,
      summary: p.summary,
      tone: p.tone,
      keywords: p.keywords,
      primary_keyword: p.primary_keyword
    }));

    const userPrompt = `Hier zijn ${pages.length} pagina's van handgeschreven notities in chronologische volgorde. Analyseer deze voor patronen en rode draad.

${JSON.stringify(analysisData, null, 2)}`;

    console.log('Calling Lovable AI for pattern analysis...');

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

    // Parse the JSON response
    let analysisResult;
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw_response: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pattern analysis complete');

    return new Response(
      JSON.stringify({
        ...analysisResult,
        page_count: pages.length,
        analyzed_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-patterns function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
