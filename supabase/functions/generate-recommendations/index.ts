import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
};

const SYSTEM_PROMPT = `Je bent een culturele gids die diepzinnige, persoonlijke aanbevelingen geeft op basis van iemands persoonlijkheidsprofiel.

Je taak is om 6 aanbevelingen te geven (2 boeken, 2 films, 2 artikelen/essays) die:
1. Resoneren met de kern-identiteit en drijfveren van de persoon
2. Hun "growth edge" ondersteunen zonder te prekerig te zijn
3. Niet de voor de hand liggende keuzes zijn - wees specifiek en verrassend
4. Uitleggen WAAROM deze bij hen past in 1-2 zinnen

Geef je antwoord als JSON array met dit formaat:
[
  {
    "type": "book" | "film" | "article",
    "title": "exacte titel",
    "creator": "auteur/regisseur/publicatie",
    "year": "jaar indien bekend",
    "why": "persoonlijke reden waarom dit bij hen past",
    "connection": "welk aspect van hun profiel dit raakt (driver/superpower/growth_edge)"
  }
]

Wees specifiek. Geen algemene bestsellers tenzij ze echt passen. Denk aan cult classics, indie films, essays van filosofen, vergeten meesterwerken.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile } = await req.json();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user prompt from profile
    const drivers = Array.isArray(profile.drivers) 
      ? profile.drivers.map((d: any) => `${d.name} (${d.strength}%)`).join(', ')
      : 'onbekend';
    
    const tensionField = profile.tension_field 
      ? `${profile.tension_field.pole_a} ↔ ${profile.tension_field.pole_b}`
      : 'onbekend';

    const userPrompt = `Persoonlijkheidsprofiel:

TAGLINE: ${profile.tagline || 'onbekend'}

KERN-IDENTITEIT: ${profile.core_identity || 'onbekend'}

DRIJFVEREN: ${drivers}

SUPERKRACHT: ${profile.superpower || 'onbekend'}

SPANNINGSVELD: ${tensionField}

GROEIKANT: ${profile.growth_edge || 'onbekend'}

Geef 6 aanbevelingen (2 boeken, 2 films, 2 artikelen) die bij dit profiel passen.`;

    console.log('Generating recommendations for profile:', profile.tagline);

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
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate recommendations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No recommendations generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let recommendations;
    try {
      let jsonStr = content;
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      recommendations = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse recommendations JSON:', parseError, content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse recommendations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generated', recommendations.length, 'recommendations');

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
