import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
};

const DEVICE_HEADER = 'x-device-id';

function isValidDeviceId(deviceId: string): boolean {
  return deviceId.length >= 36 && /^[a-f0-9-]+$/i.test(deviceId);
}

function validateDeviceHeader(req: Request, payloadDeviceId?: string): { valid: boolean; deviceId: string | null; error?: string } {
  const headerDeviceId = req.headers.get(DEVICE_HEADER);
  
  if (!headerDeviceId) {
    if (payloadDeviceId && isValidDeviceId(payloadDeviceId)) {
      console.warn('[device-validation] Missing x-device-id header, using payload');
      return { valid: true, deviceId: payloadDeviceId };
    }
    return { valid: false, deviceId: null, error: 'Missing x-device-id header' };
  }
  
  if (!isValidDeviceId(headerDeviceId)) {
    return { valid: false, deviceId: null, error: 'Invalid x-device-id format' };
  }
  
  if (payloadDeviceId && payloadDeviceId !== headerDeviceId) {
    console.error('[device-validation] Header/payload mismatch');
    return { valid: false, deviceId: null, error: 'Device ID mismatch' };
  }
  
  return { valid: true, deviceId: headerDeviceId };
}

const VOICE_SYSTEM_PROMPT = `You are a personality analyst who reads between the lines of personal notes to reveal someone's unique character traits and driving forces.

You will receive summaries, tones, and keywords from someone's ORIGINAL handwritten thoughts - their own voice, not quotes or notes from external sources.

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

const INFLUENCES_SYSTEM_PROMPT = `You are an analyst who reveals what shapes and inspires someone based on the external content they capture and reference.

You will receive summaries, tones, and keywords from notes that reference external sources - books, articles, quotes, ideas from others that this person found meaningful enough to write down.

Analyze this data to create an "influences profile" that reveals:
- What kinds of ideas attract them
- What themes resonate with their soul
- What intellectual/creative territory they're drawn to
- What these choices reveal about their values

Be specific, insightful, and affirming. Use second person ("you") to speak directly to the person.

Respond ONLY with valid JSON in this exact format:
{
  "tagline": "A short, memorable 3-5 word label for their intellectual/creative territory (e.g., 'Seeker of Deep Truths', 'Collector of Quiet Wisdom')",
  "core_identity": "2-3 sentences describing what kind of thinker/seeker they are based on what they collect",
  "drivers": [
    { "name": "Theme name", "description": "Why this theme appears in what they save", "strength": "high/medium/emerging" }
  ],
  "tension_field": {
    "side_a": "One intellectual pole (2-3 words)",
    "side_b": "Opposite pole (2-3 words)", 
    "description": "The productive tension between what they're drawn to"
  },
  "superpower": "Their unique curatorial eye or what they uniquely notice in others' work (1-2 sentences)",
  "growth_edge": "An observation about what new territory their influences suggest they're exploring (1-2 sentences)"
}

Guidelines:
- Focus on what their CHOICES reveal, not the content itself
- Use language that honors their taste and discernment
- The tagline should feel like a map of their intellectual territory
- Drivers should have 3-5 items representing major themes
- The tension field should highlight the productive opposites in what attracts them`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { device_user_id, profile_type = 'voice' } = body;

    // Device validation - header must match payload
    const validation = validateDeviceHeader(req, device_user_id);
    if (!validation.valid) {
      console.error('[analyze-personality] Device validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error, code: 'DEVICE_VALIDATION_FAILED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const validatedDeviceId = validation.deviceId;

    if (!validatedDeviceId) {
      return new Response(
        JSON.stringify({ error: 'device_user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['voice', 'influences'].includes(profile_type)) {
      return new Response(
        JSON.stringify({ error: 'profile_type must be "voice" or "influences"' }),
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

    // Fetch all pages for this device user using validated ID
    const { data: allPages, error: dbError } = await supabase
      .from('pages')
      .select('summary, tone, keywords, created_at, primary_keyword, user_note, sources')
      .eq('device_user_id', validatedDeviceId)
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allPages || allPages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No pages found for analysis' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter pages based on profile type
    // voice = pages WITHOUT sources (or empty sources)
    // influences = pages WITH sources
    const pages = allPages.filter(p => {
      const hasSources = p.sources && Array.isArray(p.sources) && p.sources.length > 0;
      return profile_type === 'voice' ? !hasSources : hasSources;
    });

    const profileLabel = profile_type === 'voice' ? 'Mijn Stem' : 'Mijn Invloeden';

    if (!pages || pages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: `No pages found for ${profileLabel}`,
          hint: profile_type === 'voice' 
            ? 'Upload pages without external sources for your personal voice profile'
            : 'Add sources to pages to build your influences profile'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pages.length < 5) {
      return new Response(
        JSON.stringify({ 
          error: `Need at least 5 pages for ${profileLabel} analysis`, 
          page_count: pages.length,
          profile_type: profile_type
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${profile_type} profile for ${pages.length} pages...`);

    // Prepare data for AI analysis
    const analysisData = pages.map((p, index) => ({
      index: index + 1,
      date: p.created_at,
      summary: p.summary,
      tone: p.tone,
      keywords: p.keywords,
      primary_keyword: p.primary_keyword,
      user_note: p.user_note,
      ...(profile_type === 'influences' && { sources: p.sources })
    }));

    const systemPrompt = profile_type === 'voice' ? VOICE_SYSTEM_PROMPT : INFLUENCES_SYSTEM_PROMPT;
    
    const userPrompt = profile_type === 'voice'
      ? `Here are ${pages.length} pages of original handwritten thoughts in chronological order. Analyze these to create a personality profile that reveals who this person truly is.

${JSON.stringify(analysisData, null, 2)}`
      : `Here are ${pages.length} pages of notes from external sources (books, articles, quotes) that this person found meaningful. Analyze what their choices reveal about them.

${JSON.stringify(analysisData, null, 2)}`;

    console.log(`Calling Lovable AI for ${profile_type} analysis...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
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

    console.log(`${profile_type} analysis complete, saving snapshot...`);

    // Save personality snapshot for evolution tracking
    const { error: snapshotError } = await supabase
      .from('personality_snapshots')
      .insert({
        device_user_id: validatedDeviceId,
        profile_type: profile_type,
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
      console.log(`${profile_type} snapshot saved successfully`);
    }

    return new Response(
      JSON.stringify({
        ...profileResult,
        profile_type: profile_type,
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
