import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkCompanionRateLimit, rateLimitResponse } from '../_shared/companionRateLimit.ts';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

const EXTRA_HEADERS = 'x-device-id';

const AI_RATE_LIMIT = 10;

const SYSTEM_PROMPT = `You are a thoughtful writer who creates brief, poetic summaries of someone's collected thoughts and ideas.

You will receive summaries and keywords from someone's handwritten notes over time.

Create a 3-4 sentence summary that captures:
- The essence of what they've been thinking about
- The themes that run through their writing
- A sense of their unique perspective

Write in third person ("They..." or "This person...") as if introducing them to someone else.
Be warm, specific, and avoid generic phrases. Make it feel like a glimpse into their mind.

Keep it under 60 words. No bullet points, just flowing prose.`;

serve(async (req) => {
  const corsHeaders = getCompanionCorsHeaders(req, EXTRA_HEADERS);

  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req, EXTRA_HEADERS);
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
    const rl = await checkCompanionRateLimit(device_user_id, 'generate-memory-summary', AI_RATE_LIMIT);
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all pages for this device user
    const { data: pages, error: dbError } = await supabase
      .from('pages')
      .select('summary, keywords, future_you_cues, created_at, primary_keyword')
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
        JSON.stringify({ error: 'No pages found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range
    const firstDate = new Date(pages[0].created_at);
    const lastDate = new Date(pages[pages.length - 1].created_at);

    // Prepare data for AI
    const analysisData = pages.map(p => ({
      summary: p.summary,
      keywords: p.keywords?.slice(0, 5),
      cues: p.future_you_cues?.slice(0, 3),
      primary: p.primary_keyword
    }));

    console.log(`Generating summary for ${pages.length} pages...`);

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
          { role: 'user', content: `Here are ${pages.length} pages of handwritten notes. Create a brief, poetic summary:\n\n${JSON.stringify(analysisData, null, 2)}` }
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
          JSON.stringify({ error: 'AI credits depleted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI summary failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        summary,
        page_count: pages.length,
        first_page_date: firstDate.toISOString(),
        last_page_date: lastDate.toISOString(),
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-memory-summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
