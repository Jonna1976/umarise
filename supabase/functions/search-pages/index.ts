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

// Common terms that should be down-ranked in text matches (demo-safe list)
const COMMON_TERMS = new Set([
  'light', 'idea', 'ideas', 'notes', 'note', 'plan', 'plans', 'page', 'pages', 
  'today', 'want', 'need', 'the', 'and', 'your', 'you', 'this', 'that',
  'uma', 'umarise', 'rise', 'rising'
]);

// Score multiplier for common terms in text matches (not cue matches)
const COMMON_TERM_TEXT_MULTIPLIER = 0.15;

// Dutch month names mapping
const DUTCH_MONTHS: { [key: string]: number } = {
  'januari': 1, 'jan': 1,
  'februari': 2, 'feb': 2,
  'maart': 3, 'mrt': 3,
  'april': 4, 'apr': 4,
  'mei': 5,
  'juni': 6, 'jun': 6,
  'juli': 7, 'jul': 7,
  'augustus': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'oktober': 10, 'okt': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12
};

// English month names mapping
const ENGLISH_MONTHS: { [key: string]: number } = {
  'january': 1, 'jan': 1,
  'february': 2, 'feb': 2,
  'march': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'may': 5,
  'june': 6, 'jun': 6,
  'july': 7, 'jul': 7,
  'august': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12
};

// Parse date query into day/month - returns null if not a date query
function parseDateQuery(query: string): { day: number; month: number } | null {
  const q = query.toLowerCase().trim();
  
  // Pattern: "1 jan", "1 januari", "15 december", etc.
  const textMonthMatch = q.match(/^(\d{1,2})\s+([a-z]+)$/);
  if (textMonthMatch) {
    const day = parseInt(textMonthMatch[1]);
    const monthName = textMonthMatch[2];
    const month = DUTCH_MONTHS[monthName] || ENGLISH_MONTHS[monthName];
    if (month && day >= 1 && day <= 31) {
      return { day, month };
    }
  }
  
  // Pattern: "jan 1", "january 15", etc.
  const textMonthFirstMatch = q.match(/^([a-z]+)\s+(\d{1,2})$/);
  if (textMonthFirstMatch) {
    const monthName = textMonthFirstMatch[1];
    const day = parseInt(textMonthFirstMatch[2]);
    const month = DUTCH_MONTHS[monthName] || ENGLISH_MONTHS[monthName];
    if (month && day >= 1 && day <= 31) {
      return { day, month };
    }
  }
  
  // Pattern: "01.01", "1.1", "15.12"
  const dotMatch = q.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (dotMatch) {
    const day = parseInt(dotMatch[1]);
    const month = parseInt(dotMatch[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }
  
  // Pattern: "01-01", "1-1", "15-12"
  const dashMatch = q.match(/^(\d{1,2})-(\d{1,2})$/);
  if (dashMatch) {
    const day = parseInt(dashMatch[1]);
    const month = parseInt(dashMatch[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }
  
  // Pattern: "01/01", "1/1", "15/12"
  const slashMatch = q.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }
  
  return null;
}

// Check if page was created on specific day/month
function pageMatchesDate(page: any, dateQuery: { day: number; month: number }): boolean {
  const createdAt = new Date(page.created_at);
  return createdAt.getDate() === dateQuery.day && (createdAt.getMonth() + 1) === dateQuery.month;
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

    // Check if this is a date query
    const dateQuery = parseDateQuery(query);
    
    // Tokenize and normalize query for text matching
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 1);
    
    // Score each page - STRICT EXACT MATCHING ONLY
    const scoredResults: SearchResult[] = [];

    for (const page of pages) {
      let score = 0;
      const matchTypes: Set<string> = new Set();
      const matchedTerms: string[] = [];

      // If date query, check date match first (HIGHEST PRIORITY)
      if (dateQuery && pageMatchesDate(page, dateQuery)) {
        score += 200; // Date matches are very strong
        matchTypes.add('date');
        const date = new Date(page.created_at);
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}`;
        if (!matchedTerms.includes(formattedDate)) matchedTerms.push(formattedDate);
      }

      // Helper: check if term exists exactly (word boundary match)
      const exactMatch = (text: string, term: string): boolean => {
        if (!text) return false;
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        return regex.test(text);
      };

      // 1. Future You Cues (STRONGEST SIGNAL) - exact match
      const cues: string[] = page.future_you_cues || [];
      for (const cue of cues) {
        for (const term of queryTerms) {
          if (exactMatch(cue, term)) {
            score += 100;
            matchTypes.add('cue');
            if (!matchedTerms.includes(cue)) matchedTerms.push(cue);
          }
        }
      }

      // 2. Named Entities (STRONG SIGNAL) - exact match
      const entities: any[] = page.named_entities || [];
      for (const entity of entities) {
        const entityValue = entity?.value || '';
        for (const term of queryTerms) {
          if (exactMatch(entityValue, term)) {
            score += 80;
            matchTypes.add('entity');
            if (!matchedTerms.includes(entityValue)) matchedTerms.push(entityValue);
          }
        }
      }

      // 3. OCR text - exact match only
      const ocrText = page.ocr_text || '';
      for (const term of queryTerms) {
        if (exactMatch(ocrText, term)) {
          score += 30;
          matchTypes.add('text');
        }
      }

      // 4. Keywords - exact match
      const keywords: string[] = page.keywords || [];
      for (const keyword of keywords) {
        for (const term of queryTerms) {
          if (exactMatch(keyword, term)) {
            score += 25;
            matchTypes.add('text');
            if (!matchedTerms.includes(keyword)) matchedTerms.push(keyword);
          }
        }
      }

      // 5. Primary keyword - exact match (boosted)
      if (page.primary_keyword) {
        for (const term of queryTerms) {
          if (exactMatch(page.primary_keyword, term)) {
            score += 40;
            matchTypes.add('text');
            if (!matchedTerms.includes(page.primary_keyword)) matchedTerms.push(page.primary_keyword);
          }
        }
      }

      // 6. Summary - exact match
      const summary = page.summary || '';
      for (const term of queryTerms) {
        if (exactMatch(summary, term)) {
          score += 15;
          matchTypes.add('text');
        }
      }

      // Only include if score > 0 (at least one exact match found)
      if (score > 0) {
        scoredResults.push({
          page_id: page.id,
          page: page,
          score,
          match_types: Array.from(matchTypes),
          matched_terms: [...new Set(matchedTerms)].slice(0, 5)
        });
      }
    }

    // If few results and semantic search is enabled, try semantic matching
    if (include_semantic && scoredResults.length < 5 && !dateQuery) {
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
                    page: page,
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
