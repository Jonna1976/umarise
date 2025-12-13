import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageData {
  id: string;
  summary: string;
  tone: string;
  keywords: string[];
  created_at: string;
  ocr_text: string;
}

interface MonthData {
  month: string;
  monthName: string;
  pageCount: number;
  dominantTone: string;
  topKeywords: string[];
  toneBreakdown: Record<string, number>;
}

const SYSTEM_PROMPT = `Je bent een reflectieve schrijfcoach die terugkijkt op iemands jaar op basis van hun handgeschreven notities.

Je taak is om een warm, persoonlijk jaarreflectie-rapport te schrijven dat:
1. Het ONTDEKTE JAARTHEMA identificeert - de rode draad die door alle notities loopt (1-3 woorden)
2. Een KERN-INZICHT geeft - wat dit jaar voor deze persoon betekende (2-3 zinnen)
3. HOOGTEPUNTEN noemt - 3-5 momenten/thema's die opvielen
4. Een GROEI-OBSERVATIE deelt - hoe de persoon is geëvolueerd (1-2 zinnen)

Schrijf in de tweede persoon ("je", "jouw"). Wees warm maar niet overdreven. Baseer alles op de data - verzin niets.

Geef je antwoord als JSON:
{
  "discoveredTheme": "1-3 woorden",
  "themeExplanation": "Korte uitleg waarom dit het thema is",
  "coreInsight": "2-3 zinnen over wat dit jaar betekende",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "growthObservation": "1-2 zinnen over persoonlijke groei",
  "emotionalJourney": "Korte beschrijving van de emotionele reis door het jaar"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { device_user_id, year } = await req.json();

    if (!device_user_id) {
      return new Response(
        JSON.stringify({ error: 'device_user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetYear = year || new Date().getFullYear();
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all pages for this year
    const { data: pages, error: fetchError } = await supabase
      .from('pages')
      .select('id, summary, tone, keywords, created_at, ocr_text')
      .eq('device_user_id', device_user_id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching pages:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pages || pages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No pages found for this year',
          pageCount: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pages.length} pages for year ${targetYear}`);

    // Calculate monthly breakdown
    const monthlyData: MonthData[] = [];
    const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
                        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    
    for (let month = 0; month < 12; month++) {
      const monthPages = pages.filter((p: PageData) => {
        const pageMonth = new Date(p.created_at).getMonth();
        return pageMonth === month;
      });

      if (monthPages.length === 0) {
        monthlyData.push({
          month: String(month + 1).padStart(2, '0'),
          monthName: monthNames[month],
          pageCount: 0,
          dominantTone: '',
          topKeywords: [],
          toneBreakdown: {}
        });
        continue;
      }

      // Count tones
      const toneCount: Record<string, number> = {};
      monthPages.forEach((p: PageData) => {
        if (p.tone) {
          toneCount[p.tone] = (toneCount[p.tone] || 0) + 1;
        }
      });

      // Get dominant tone
      const dominantTone = Object.entries(toneCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

      // Count keywords
      const keywordCount: Record<string, number> = {};
      monthPages.forEach((p: PageData) => {
        (p.keywords || []).forEach((kw: string) => {
          keywordCount[kw] = (keywordCount[kw] || 0) + 1;
        });
      });

      const topKeywords = Object.entries(keywordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([kw]) => kw);

      monthlyData.push({
        month: String(month + 1).padStart(2, '0'),
        monthName: monthNames[month],
        pageCount: monthPages.length,
        dominantTone,
        topKeywords,
        toneBreakdown: toneCount
      });
    }

    // Calculate overall tone distribution for emotional timeline
    const overallToneCount: Record<string, number> = {};
    pages.forEach((p: PageData) => {
      if (p.tone) {
        overallToneCount[p.tone] = (overallToneCount[p.tone] || 0) + 1;
      }
    });

    // Calculate all keywords for the year
    const yearKeywordCount: Record<string, number> = {};
    pages.forEach((p: PageData) => {
      (p.keywords || []).forEach((kw: string) => {
        yearKeywordCount[kw] = (yearKeywordCount[kw] || 0) + 1;
      });
    });

    const topYearKeywords = Object.entries(yearKeywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([kw, count]) => ({ keyword: kw, count }));

    // Build prompt for AI analysis
    const summariesText = pages
      .map((p: PageData) => `[${new Date(p.created_at).toLocaleDateString('nl-NL')}] ${p.summary}`)
      .join('\n');

    const keywordsText = topYearKeywords.map(k => `${k.keyword} (${k.count}x)`).join(', ');
    const tonesText = Object.entries(overallToneCount)
      .sort(([, a], [, b]) => b - a)
      .map(([tone, count]) => `${tone} (${count}x)`)
      .join(', ');

    const userPrompt = `Analyseer dit jaar (${targetYear}) op basis van ${pages.length} handgeschreven notities:

SAMENVATTINGEN (chronologisch):
${summariesText}

MEEST VOORKOMENDE KEYWORDS: ${keywordsText}

TOON-VERDELING: ${tonesText}

Genereer een jaarreflectie-rapport.`;

    // Call AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating year reflection with AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate reflection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No reflection generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response
    let aiAnalysis;
    try {
      let jsonStr = content;
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      aiAnalysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse reflection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Year reflection generated successfully');

    // Build emotional timeline data
    const emotionalTimeline = monthlyData.map(m => ({
      month: m.monthName,
      pageCount: m.pageCount,
      dominantTone: m.dominantTone,
      intensity: m.pageCount > 0 ? Math.min(m.pageCount / 5, 1) : 0 // Normalize to 0-1
    }));

    return new Response(
      JSON.stringify({
        year: targetYear,
        pageCount: pages.length,
        monthlyData,
        topKeywords: topYearKeywords,
        toneDistribution: overallToneCount,
        emotionalTimeline,
        aiAnalysis,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-year-reflection:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
