import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
};

// Extract meaningful sentences from OCR text
function extractSentences(ocrText: string): string[] {
  if (!ocrText) return [];
  
  // Split by common sentence endings, keeping the delimiter
  const rawSentences = ocrText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 300); // Filter very short or very long
  
  // Also try splitting by newlines for bullet points or short phrases
  const lineBasedPhrases = ocrText
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 200);
  
  // Combine and deduplicate
  const all = [...rawSentences, ...lineBasedPhrases];
  const unique = [...new Set(all)];
  
  return unique;
}

// Score sentences by interest/shareability
function scoreSentence(sentence: string, keywords: string[] = []): number {
  let score = 0;
  
  // Prefer sentences that start with capital letters (proper sentences)
  if (/^[A-Z]/.test(sentence)) score += 2;
  
  // Prefer sentences with keywords
  keywords.forEach(kw => {
    if (sentence.toLowerCase().includes(kw.toLowerCase())) score += 3;
  });
  
  // Prefer medium-length sentences (not too short, not too long)
  if (sentence.length > 30 && sentence.length < 150) score += 2;
  
  // Prefer sentences with questions
  if (sentence.includes('?')) score += 2;
  
  // Prefer sentences with action words
  const actionWords = ['want', 'need', 'think', 'believe', 'feel', 'create', 'build', 'make', 'learn', 'grow'];
  actionWords.forEach(word => {
    if (sentence.toLowerCase().includes(word)) score += 1;
  });
  
  // Deprioritize sentences that look like dates or headers
  if (/^\d/.test(sentence) || sentence.length < 20) score -= 2;
  
  return score;
}

// Select best sentences for each format
function selectContent(sentences: string[], keywords: string[] = []) {
  // Score all sentences
  const scored = sentences.map(s => ({ sentence: s, score: scoreSentence(s, keywords) }));
  scored.sort((a, b) => b.score - a.score);
  
  const topSentences = scored.slice(0, 6).map(s => s.sentence);
  
  return {
    // Quote: Best single sentence, trimmed for Twitter length
    quote: topSentences[0]?.slice(0, 280) || '',
    
    // Lesson: Top 2-3 sentences combined
    lesson: topSentences.slice(0, 3).join(' ') || '',
    
    // Idea: Top 4-5 sentences for newsletter format
    idea: topSentences.slice(0, 5).join('\n\n') || '',
    
    // Caption: First sentence as personal reflection
    caption: topSentences[1] || topSentences[0] || '',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summary, ocrText, keywords, tone } = await req.json();

    if (!ocrText) {
      return new Response(
        JSON.stringify({ error: 'OCR text is required for source extraction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-share-content] Extracting real sentences from OCR text...');

    // Extract and score sentences from actual OCR text
    const sentences = extractSentences(ocrText);
    
    if (sentences.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No suitable sentences found in OCR text',
          content: {
            quote: ocrText.slice(0, 280),
            lesson: ocrText,
            idea: ocrText,
            caption: ocrText.slice(0, 150),
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = selectContent(sentences, keywords || []);
    
    // Score all sentences for display
    const scoredSentences = sentences
      .map(s => ({ text: s, score: scoreSentence(s, keywords || []) }))
      .sort((a, b) => b.score - a.score);

    console.log('[generate-share-content] Successfully extracted', sentences.length, 'sentences');

    return new Response(
      JSON.stringify({
        success: true,
        content,
        allSentences: scoredSentences, // Return all sentences for preview
        source: 'extracted',
        sentences_found: sentences.length,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-share-content] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
