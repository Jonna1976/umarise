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
    // Handle hyphenated terms: "future-self" → ["future-self", "future", "self"]
    const rawTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 1);
    const queryTerms: string[] = [];
    for (const term of rawTerms) {
      queryTerms.push(term);
      if (term.includes('-')) {
        const parts: string[] = term.split('-');
        for (const part of parts) {
          if (part.length > 1 && !queryTerms.includes(part)) {
            queryTerms.push(part);
          }
        }
      }
    }
    
    // SIMPLIFIED SEARCH: ONLY user-assigned words (spine) + OCR text
    // NO AI-generated keywords, NO summary, NO named entities
    const scoredResults: SearchResult[] = [];

    for (const page of pages) {
      // Skip trashed pages
      if (page.is_trashed) continue;
      
      let score = 0;
      const matchTypes: Set<string> = new Set();
      const matchedTerms: string[] = [];

      // If date query, check date match first (HIGHEST PRIORITY)
      if (dateQuery && pageMatchesDate(page, dateQuery)) {
        score += 200;
        matchTypes.add('date');
        const date = new Date(page.created_at);
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}`;
        if (!matchedTerms.includes(formattedDate)) matchedTerms.push(formattedDate);
      }

      // Helper: check if term exists exactly (word boundary match)
      const exactMatch = (text: string, term: string): boolean => {
        if (!text) return false;
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
        return regex.test(text);
      };

      // === ORIGIN: User-assigned words (SPINE) ===
      
      // 1. Future You Cues - USER ASSIGNED (highest priority after date)
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

      // 2. Primary Keyword - USER ASSIGNED (spine label)
      if (page.primary_keyword) {
        for (const term of queryTerms) {
          if (exactMatch(page.primary_keyword, term)) {
            score += 80;
            matchTypes.add('spine');
            if (!matchedTerms.includes(page.primary_keyword)) matchedTerms.push(page.primary_keyword);
          }
        }
      }

      // === OCR text matching DISABLED for v1 pilot ===
      // Testing hypothesis: can users retrieve origins with only their own assigned words?
      // OCR still runs at capture, data is stored and available for future/fallback
      // 
      // Original code (kept for reference):
      // const ocrText = page.ocr_text || '';
      // for (const term of queryTerms) {
      //   if (exactMatch(ocrText, term)) {
      //     score += 70;
      //     matchTypes.add('text');
      //   }
      // }

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
