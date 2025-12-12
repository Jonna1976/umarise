import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI that analyzes handwritten notes. Your role is to:
1. Read and transcribe the handwritten text accurately (OCR)
2. Generate a concise 1-3 sentence summary capturing the main ideas
3. Identify the emotional tone (one of: focused, frustrated, hopeful, playful, overwhelmed, reflective, curious, determined, anxious, calm)
4. Extract 3-10 keywords that capture key themes

You must respond ONLY with valid JSON in this exact format:
{
  "ocr_text": "the full transcribed text from the handwriting",
  "summary": "1-3 sentence summary of the main ideas",
  "tone": "single tone label",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Be accurate with the OCR. If text is unclear, make your best interpretation.
The summary should be human-readable and capture what the person was thinking about.
Keywords should be simple, lowercase tokens useful for future pattern matching.`;

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

    console.log('Calling Lovable AI for page analysis...');

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
              { type: 'text', text: 'Please analyze this handwritten page and provide the OCR text, summary, tone, and keywords in JSON format.' },
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
      // Remove potential markdown code block wrapper
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

    // Validate required fields
    const { ocr_text, summary, tone, keywords } = analysisResult;
    
    const hasOcrField = typeof ocr_text === 'string';
    const hasSummary = typeof summary === 'string' && summary.trim().length > 0;
    const hasTone = typeof tone === 'string' && tone.trim().length > 0;
    const hasKeywords = Array.isArray(keywords) && keywords.length > 0;

    if (!hasSummary || !hasTone || !hasKeywords || !hasOcrField) {
      console.error('Missing or invalid required fields in AI response:', analysisResult);
      return new Response(
        JSON.stringify({ error: 'Incomplete AI response', partial_result: analysisResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Page analysis complete:', { 
      ocr_length: ocr_text.length, 
      summary_length: summary.length, 
      tone, 
      keywords_count: keywords.length 
    });

    return new Response(
      JSON.stringify({
        ocr_text,
        summary,
        tone,
        keywords,
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
