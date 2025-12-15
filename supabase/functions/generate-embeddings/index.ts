import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page_id, text } = await req.json();

    if (!page_id || !text) {
      return new Response(
        JSON.stringify({ error: 'page_id and text are required' }),
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

    console.log('Generating embedding for page:', page_id);

    // Use Gemini to generate a semantic representation
    // We'll use a summarization approach to create a dense vector-like representation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { 
            role: 'system', 
            content: `You are a semantic analysis tool. Given text, extract the core semantic concepts and return them as a JSON array of 50 floating point numbers between -1 and 1. These numbers should represent the semantic "fingerprint" of the text across dimensions like: topic relevance, emotional valence, temporal reference, abstraction level, action-orientation, personal vs professional, creative vs analytical, etc.

Just return the array, nothing else. Example: [-0.2, 0.5, 0.1, ...]` 
          },
          { 
            role: 'user', 
            content: `Generate semantic embedding for: "${text.substring(0, 1000)}"` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate embedding' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in embedding response');
      return new Response(
        JSON.stringify({ error: 'No embedding generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the embedding vector
    let embedding: number[];
    try {
      // Clean up the response - it might have markdown or extra text
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '');
      }
      embedding = JSON.parse(jsonStr);
      
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid embedding format');
      }
    } catch (e) {
      console.error('Failed to parse embedding:', content);
      // Fallback: create a simple hash-based embedding
      embedding = createFallbackEmbedding(text);
    }

    // Update the page with the embedding
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('pages')
      .update({ embedding_vector: embedding })
      .eq('id', page_id);

    if (updateError) {
      console.error('Failed to update page with embedding:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save embedding' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Embedding generated and saved for page:', page_id);

    return new Response(
      JSON.stringify({ success: true, embedding_size: embedding.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback embedding using simple text features
function createFallbackEmbedding(text: string): number[] {
  const embedding: number[] = [];
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Create 50 dimensions based on various text features
  for (let i = 0; i < 50; i++) {
    let value = 0;
    
    // Different strategies for different dimensions
    if (i < 10) {
      // Character frequency based
      const char = 'abcdefghij'[i];
      value = (text.toLowerCase().split(char).length - 1) / text.length;
    } else if (i < 20) {
      // Word length distribution
      const targetLength = i - 7;
      value = words.filter(w => w.length === targetLength).length / wordCount;
    } else if (i < 30) {
      // Common word presence
      const commonWords = ['the', 'and', 'is', 'to', 'of', 'a', 'in', 'for', 'on', 'with'];
      value = words.includes(commonWords[i - 20]) ? 1 : 0;
    } else if (i < 40) {
      // Punctuation and structure
      const puncts = ['.', ',', '!', '?', ':', ';', '-', '"', "'", '\n'];
      value = (text.split(puncts[i - 30]).length - 1) / text.length * 10;
    } else {
      // Hash-based for remaining dimensions
      let hash = 0;
      for (let j = 0; j < text.length; j++) {
        hash = ((hash << 5) - hash + text.charCodeAt(j) * (i + 1)) & 0xFFFFFFFF;
      }
      value = (hash % 200 - 100) / 100;
    }
    
    // Normalize to -1 to 1 range
    embedding.push(Math.max(-1, Math.min(1, value * 2 - 1)));
  }
  
  return embedding;
}
