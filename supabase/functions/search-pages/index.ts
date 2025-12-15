import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  page_id: string;
  page: any; // Full page object for client-side rendering
  score: number;
  match_types: string[];
  matched_terms: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      device_user_id, 
      query, 
      time_filter,
      include_semantic = true,
      limit = 20 
    } = await req.json();

    if (!device_user_id || !query) {
      return new Response(
        JSON.stringify({ error: 'device_user_id and query are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Searching pages for:', query);

    // Get all pages for the user
    let pagesQuery = supabase
      .from('pages')
      .select('*')
      .eq('device_user_id', device_user_id);

    // Apply time filter if provided
    if (time_filter?.after) {
      pagesQuery = pagesQuery.gte('created_at', time_filter.after);
    }
    if (time_filter?.before) {
      pagesQuery = pagesQuery.lte('created_at', time_filter.before);
    }

    const { data: pages, error } = await pagesQuery;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pages || pages.length === 0) {
      return new Response(
        JSON.stringify({ results: [], total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tokenize and normalize query
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 1);
    
    // Score each page
    const scoredResults: SearchResult[] = [];

    for (const page of pages) {
      let score = 0;
      const matchTypes: Set<string> = new Set();
      const matchedTerms: string[] = [];

      // 1. Future You Cues (STRONGEST SIGNAL)
      const cues: string[] = page.future_you_cues || [];
      for (const cue of cues) {
        const cueLower = cue?.toLowerCase() || '';
        for (const term of queryTerms) {
          if (cueLower.includes(term) || term.includes(cueLower)) {
            score += 100;
            matchTypes.add('cue');
            matchedTerms.push(cue);
          }
        }
      }

      // 2. Named Entities (STRONG SIGNAL)
      const entities: any[] = page.named_entities || [];
      for (const entity of entities) {
        const entityValue = entity?.value?.toLowerCase() || '';
        for (const term of queryTerms) {
          if (entityValue.includes(term) || term.includes(entityValue)) {
            score += 80;
            matchTypes.add('entity');
            matchedTerms.push(entity.value);
          }
        }
      }

      // 3. High-confidence OCR tokens (MEDIUM SIGNAL)
      const ocrTokens: any[] = page.ocr_tokens || [];
      const highConfTokens = ocrTokens.filter(t => (t?.confidence || 0) >= 0.8);
      const lowConfTokens = ocrTokens.filter(t => (t?.confidence || 0) < 0.8);

      for (const token of highConfTokens) {
        const tokenLower = token?.token?.toLowerCase() || '';
        for (const term of queryTerms) {
          if (tokenLower === term || (tokenLower.length > 3 && levenshteinDistance(tokenLower, term) <= 2)) {
            score += 30;
            matchTypes.add('text');
            if (!matchedTerms.includes(token.token)) matchedTerms.push(token.token);
          }
        }
      }

      // 4. Low-confidence OCR tokens (WEAK SIGNAL)
      for (const token of lowConfTokens) {
        const tokenLower = token?.token?.toLowerCase() || '';
        for (const term of queryTerms) {
          if (tokenLower === term || (tokenLower.length > 3 && levenshteinDistance(tokenLower, term) <= 1)) {
            score += 10;
            matchTypes.add('text');
          }
        }
      }

      // 5. Full text search fallback (for pages without tokens)
      if (ocrTokens.length === 0) {
        const ocrText = (page.ocr_text || '').toLowerCase();
        for (const term of queryTerms) {
          if (ocrText.includes(term)) {
            score += 20;
            matchTypes.add('text');
          }
        }
      }

      // 6. Keywords match
      const keywords: string[] = page.keywords || [];
      for (const keyword of keywords) {
        const keywordLower = keyword?.toLowerCase() || '';
        for (const term of queryTerms) {
          if (keywordLower === term || keywordLower.includes(term)) {
            score += 25;
            matchTypes.add('text');
            matchedTerms.push(keyword);
          }
        }
      }

      // 7. Primary keyword match (boosted)
      if (page.primary_keyword) {
        const primaryLower = page.primary_keyword.toLowerCase();
        for (const term of queryTerms) {
          if (primaryLower.includes(term) || term.includes(primaryLower)) {
            score += 40;
            matchTypes.add('text');
            matchedTerms.push(page.primary_keyword);
          }
        }
      }

      // 8. Summary and user note
      const summary = (page.summary || '').toLowerCase();
      const userNote = (page.user_note || '').toLowerCase();
      for (const term of queryTerms) {
        if (summary.includes(term)) score += 15;
        if (userNote.includes(term)) score += 15;
      }

      // 9. One-line hint
      const hint = (page.one_line_hint || '').toLowerCase();
      for (const term of queryTerms) {
        if (hint.includes(term)) {
          score += 20;
        }
      }

      if (score > 0) {
        scoredResults.push({
          page_id: page.id,
          page: page, // Include full page data
          score,
          match_types: Array.from(matchTypes),
          matched_terms: [...new Set(matchedTerms)].slice(0, 5)
        });
      }
    }

    // If few results and semantic search is enabled, try semantic matching
    if (include_semantic && scoredResults.length < 5) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (LOVABLE_API_KEY) {
        try {
          // Generate query embedding
          const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  content: 'Generate semantic embedding as JSON array of 50 floats between -1 and 1. Just return the array.' 
                },
                { role: 'user', content: `Embedding for: "${query}"` }
              ],
            }),
          });

          if (embeddingResponse.ok) {
            const embData = await embeddingResponse.json();
            let queryEmbedding: number[] = [];
            
            try {
              let content = embData.choices?.[0]?.message?.content || '';
              content = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
              queryEmbedding = JSON.parse(content);
            } catch (e) {
              console.log('Could not parse query embedding');
            }

            if (queryEmbedding.length > 0) {
              // Find semantic matches
              const existingIds = new Set(scoredResults.map(r => r.page_id));
              
              for (const page of pages) {
                if (existingIds.has(page.id)) continue;
                
                const pageEmbedding = page.embedding_vector;
                if (!pageEmbedding || !Array.isArray(pageEmbedding)) continue;

                const similarity = cosineSimilarity(queryEmbedding, pageEmbedding);
                
                if (similarity > 0.5) {
                  scoredResults.push({
                    page_id: page.id,
                    page: page, // Include full page data
                    score: similarity * 50,
                    match_types: ['meaning'],
                    matched_terms: []
                  });
                }
              }
            }
          }
        } catch (e) {
          console.log('Semantic search fallback error:', e);
        }
      }
    }

    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);

    // Return top results
    const topResults = scoredResults.slice(0, limit);

    console.log(`Found ${topResults.length} results for query "${query}"`);

    return new Response(
      JSON.stringify({ 
        results: topResults, 
        total: scoredResults.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-pages function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[a.length][b.length];
}

// Cosine similarity for semantic matching
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
