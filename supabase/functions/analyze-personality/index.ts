import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a personality analyst who reads between the lines of personal notes to reveal someone's unique character traits and driving forces.

You will receive summaries, tones, and keywords from someone's handwritten notes over time.

Analyze this data to create a personality profile. Focus on:
- What makes this person unique
- What drives them at their core
- Their strengths and potential superpowers
- The creative tensions that fuel their growth

Be specific, insightful, and affirming. Use second person ("you") to speak directly to the person.

Respond ONLY with valid JSON in this exact format:
{
  "tagline": "A short, memorable 3-5 word identity label (e.g., 'The Visionary Builder', 'A Quiet Revolutionary')",
  "core_identity": "2-3 sentences describing who they fundamentally are based on their writing patterns",
  "drivers": [
    { "name": "Driver name", "description": "How this manifests in their notes", "strength": "high/medium/emerging" }
  ],
  "tension_field": {
    "side_a": "One pole (2-3 words)",
    "side_b": "Opposite pole (2-3 words)", 
    "description": "How this creative tension shows up and fuels their growth"
  },
  "superpower": "Their unique ability or gift that emerges from the patterns (1-2 sentences)",
  "growth_edge": "An observation about where they might be stretching or growing (1-2 sentences, phrased as observation not advice)"
}

Guidelines:
- Be specific to THEIR patterns, not generic
- Use language that feels like recognition, not prescription
- The tagline should feel like a badge of honor
- Drivers should have 3-5 items
- The tension field should highlight productive opposites, not problems`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { device_user_id } = await req.json();

    if (!device_user_id) {
      return new Response(
        JSON.stringify({ error: 'device_user_id is required' }),
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all pages for this device user
    const { data: pages, error: dbError } = await supabase
      .from('pages')
      .select('summary, tone, keywords, created_at, primary_keyword, user_note')
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

    if (pages.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Need at least 5 pages for personality analysis', page_count: pages.length }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing personality for ${pages.length} pages...`);

    // Prepare data for AI analysis
    const analysisData = pages.map((p, index) => ({
      index: index + 1,
      date: p.created_at,
      summary: p.summary,
      tone: p.tone,
      keywords: p.keywords,
      primary_keyword: p.primary_keyword,
      user_note: p.user_note
    }));

    const userPrompt = `Here are ${pages.length} pages of handwritten notes in chronological order. Analyze these to create a personality profile that reveals who this person truly is.

${JSON.stringify(analysisData, null, 2)}`;

    console.log('Calling Lovable AI for personality analysis...');

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
    let profileResult;
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

      profileResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw_response: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Personality analysis complete, saving snapshot...');

    // Save personality snapshot for evolution tracking
    const { error: snapshotError } = await supabase
      .from('personality_snapshots')
      .insert({
        device_user_id: device_user_id,
        core_identity: profileResult.core_identity,
        tagline: profileResult.tagline,
        drivers: profileResult.drivers,
        tension_field: profileResult.tension_field,
        superpower: profileResult.superpower,
        growth_edge: profileResult.growth_edge,
        page_count: pages.length
      });

    if (snapshotError) {
      console.error('Failed to save personality snapshot:', snapshotError);
      // Don't fail the request, just log the error
    } else {
      console.log('Personality snapshot saved successfully');
    }

    return new Response(
      JSON.stringify({
        ...profileResult,
        page_count: pages.length,
        analyzed_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-personality function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});