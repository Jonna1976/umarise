import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Calendar, Clock, Tag, User, Brain, FileText, HelpCircle, Library } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Page } from '@/lib/pageService';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getActiveDeviceId } from '@/lib/deviceId';
import { formatDistanceToNow } from 'date-fns';
import { getDisplayImageUrl } from '@/hooks/useResolvedImageUrl';
import { getStorageProvider, isHetznerEnabled } from '@/lib/abstractions';

export interface SearchMatchInfo {
  matchTypes: Array<'cue' | 'text' | 'entity' | 'meaning' | 'spine' | 'date'>;
  matchedTerms: string[];
}

interface SearchResult {
  page: Page;
  score: number;
  matchTypes: Array<'cue' | 'text' | 'entity' | 'meaning' | 'spine' | 'date'>;
  matchedTerms: string[];
}

interface SearchViewProps {
  onClose: () => void;
  onSelectPage: (page: Page, matchInfo?: SearchMatchInfo) => void;
  onBrowseAll?: () => void; // Navigate to full Memory/History view
  initialQuery?: string; // Pre-fill search with this query
}

// Match type badges with icons
const matchTypeBadges: Record<string, { label: string; icon: React.ComponentType<any>; className: string }> = {
  cue: { label: 'Matched on cue', icon: Tag, className: 'bg-primary/20 text-primary border-primary/30' },
  spine: { label: 'Matched on spine', icon: Tag, className: 'bg-primary/20 text-primary border-primary/30' },
  text: { label: 'Matched on text', icon: FileText, className: 'bg-muted text-muted-foreground border-border' },
  entity: { label: 'Matched on name', icon: User, className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  meaning: { label: 'Matched by meaning', icon: Brain, className: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
  date: { label: 'Matched on date', icon: Calendar, className: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
};

// Carousel component for search results
function CarouselResults({ 
  results, 
  onSelectPage, 
  showFallback, 
  onCantFind 
}: { 
  results: SearchResult[];
  onSelectPage: (page: Page, index: number, result: SearchResult) => void;
  showFallback: boolean;
  onCantFind: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeResult = results[activeIndex];

  const goNext = () => setActiveIndex(i => Math.min(i + 1, results.length - 1));
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Swipe handler
  const handleDragEnd = (event: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      goNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      goPrev();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Result counter with navigation */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button 
          onClick={goPrev}
          disabled={activeIndex === 0}
          className="p-2 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-medium">Search Results</p>
          <span className="text-lg text-foreground font-semibold">
            {activeIndex + 1} / {results.length}
          </span>
        </div>
        <button 
          onClick={goNext}
          disabled={activeIndex === results.length - 1}
          className="p-2 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed rotate-180"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main carousel area */}
      <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Active result with swipe */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeResult.page.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full max-w-sm cursor-grab active:cursor-grabbing"
          >
            <button
              onClick={() => onSelectPage(activeResult.page, activeIndex, activeResult)}
              className="w-full text-left"
            >
              {/* Main image - prominent but not full screen */}
              <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-card">
                <div className="aspect-[3/4] w-full bg-muted relative overflow-hidden">
                  <img
                    src={getDisplayImageUrl(activeResult.page.imageUrl)}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                  {activeIndex === 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
                      Best match
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                    {formatDistanceToNow(activeResult.page.createdAt, { addSuffix: true })}
                  </span>
                </div>
                
                {/* Tags & match info - subtle */}
                <div className="p-3 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeResult.page.futureYouCues?.slice(0, 2).map((cue, i) => (
                      <span 
                        key={`cue-${i}`} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {cue}
                      </span>
                    ))}
                    {activeResult.matchTypes.slice(0, 1).map((type) => {
                      const badge = matchTypeBadges[type];
                      if (!badge) return null;
                      const Icon = badge.icon;
                      return (
                        <span
                          key={type}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${badge.className}`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {activeResult.page.oneLineHint || activeResult.page.summary?.split('.')[0]}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail strip at bottom */}
      <div className="py-3 px-2">
        <div className="flex gap-1.5 overflow-x-auto justify-center">
          {results.map((result, index) => (
            <button
              key={result.page.id}
              onClick={() => setActiveIndex(index)}
              className={`w-12 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                index === activeIndex 
                  ? 'border-primary opacity-100 scale-105' 
                  : 'border-transparent opacity-40 hover:opacity-70'
              }`}
            >
              <img
                src={getDisplayImageUrl(result.page.thumbnailUri || result.page.imageUrl)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Not found helper */}
      {!showFallback && (
        <div className="text-center pb-2">
          <Button variant="ghost" size="sm" onClick={onCantFind} className="gap-2 text-muted-foreground text-xs">
            <HelpCircle className="w-3 h-3" />
            Not found?
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Search view with explainability badges and "Can't find it" fallback
 * Google/ChatGPT style: centered search when no query
 */
export function SearchView({ onClose, onSelectPage, onBrowseAll, initialQuery }: SearchViewProps) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all' | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [showFirstRetrievalMessage, setShowFirstRetrievalMessage] = useState(false);
  const [hasShownFirstRetrievalMessage, setHasShownFirstRetrievalMessage] = useState(() => {
    return localStorage.getItem('shown_first_retrieval_message') === 'true';
  });
  
  // All unique cues from user's pages (for autocomplete)
  const [allCues, setAllCues] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Levenshtein distance for fuzzy matching (typo tolerance)
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  // Fuzzy match: checks prefix, contains, and typo tolerance
  const fuzzyMatch = (cue: string, query: string): { match: boolean; score: number } => {
    const cueLower = cue.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match (best)
    if (cueLower === queryLower) {
      return { match: true, score: 110 };
    }

    // Exact prefix match (very good)
    if (cueLower.startsWith(queryLower)) {
      return { match: true, score: 100 };
    }

    // Query is a number prefix (for dates like "20" -> "2026", "202" -> "2026")
    if (/^\d+$/.test(queryLower) && cueLower.startsWith(queryLower)) {
      return { match: true, score: 95 };
    }

    // Contains anywhere
    if (cueLower.includes(queryLower)) {
      return { match: true, score: 80 };
    }

    // Levenshtein distance for typo tolerance
    // Be more generous: allow 1 error per 3 chars, minimum 2 errors for words 5+ chars
    const minErrors = queryLower.length >= 5 ? 2 : 1;
    const maxDistance = Math.max(minErrors, Math.floor(queryLower.length / 3) + 1);
    
    // Check the whole cue as one word first (for single-word cues)
    const directDistance = levenshteinDistance(cueLower, queryLower);
    if (directDistance <= maxDistance) {
      return { match: true, score: 70 - directDistance * 5 };
    }
    
    // Check if any word in the cue is close to the query
    const cueWords = cueLower.split(/[\s\-_]+/);
    for (const word of cueWords) {
      const distance = levenshteinDistance(word, queryLower);
      if (distance <= maxDistance) {
        return { match: true, score: 60 - distance * 5 };
      }
      // Also check if word starts similarly (for partial typing)
      if (queryLower.length >= 2 && word.startsWith(queryLower.slice(0, 2)) && distance <= maxDistance + 1) {
        return { match: true, score: 50 - distance * 5 };
      }
    }

    // Check if query is a prefix of any number in the cue (for dates like "20" -> "2026")
    const numbersInCue = cueLower.match(/\d+/g) || [];
    for (const num of numbersInCue) {
      if (num.startsWith(queryLower)) {
        return { match: true, score: 70 };
      }
    }

    return { match: false, score: 0 };
  };

  // Fetch all unique cues on mount (for autocomplete)
  // ONLY user cues and AI keywords - NO years (they're not searchable by the search logic)
  useEffect(() => {
    const fetchAllCues = async () => {
      const deviceUserId = getActiveDeviceId();
      if (!deviceUserId) return;

      try {
        const { data, error } = await supabase
          .from('pages')
          .select('future_you_cues, primary_keyword, keywords')
          .eq('device_user_id', deviceUserId)
          .eq('is_trashed', false);

        if (!error && data) {
          // Collect only cues that are actually searchable
          const cueSet = new Set<string>();
          
          data.forEach((row: any) => {
            // User-assigned cues (highest priority)
            if (row.future_you_cues) {
              row.future_you_cues.forEach((c: string) => cueSet.add(c.toLowerCase()));
            }
            if (row.primary_keyword) {
              cueSet.add(row.primary_keyword.toLowerCase());
            }
            // AI keywords / bonus words (for broader autocomplete)
            if (row.keywords && Array.isArray(row.keywords)) {
              row.keywords.forEach((k: string) => cueSet.add(k.toLowerCase()));
            }
          });
          
          // Sort alphabetically
          setAllCues(Array.from(cueSet).sort());
        }
      } catch (error) {
        console.error('Failed to fetch cues:', error);
      }
    };

    fetchAllCues();
  }, []);

  // Track search telemetry via Hetzner proxy
  const trackSearch = async (searchQuery: string, searchResults: SearchResult[], filterUsed: string | null) => {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId || searchResults.length === 0) return;

    try {
      const top5Ids = searchResults.slice(0, 5).map(r => r.page.id);
      
      // Call Hetzner storage proxy for telemetry
      const response = await supabase.functions.invoke('hetzner-storage-proxy', {
        body: {
          method: 'POST',
          path: '/telemetry/search',
          payload: {
            deviceUserId,
            query: searchQuery,
            resultCount: searchResults.length,
            top5PageIds: top5Ids,
            timeFilterUsed: filterUsed
          }
        }
      });
      
      if (response.data?.id) {
        setCurrentSearchId(response.data.id);
        setSearchStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  };

  // Track when user selects a result via Hetzner proxy
  const trackSelection = async (selectedPage: Page, rank: number) => {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId || !currentSearchId) return;

    try {
      const timeToSelect = searchStartTime ? Date.now() - searchStartTime : null;
      
      await supabase.functions.invoke('hetzner-storage-proxy', {
        body: {
          method: 'PATCH',
          path: '/telemetry/search',
          payload: {
            telemetryId: currentSearchId,
            selectedPageId: selectedPage.id,
            selectedRank: rank + 1,
            timeToSelectMs: timeToSelect
          }
        }
      });
    } catch (error) {
      console.error('Failed to track selection:', error);
    }
  };

  // Handle page selection with telemetry + first retrieval message
  const handleSelectPage = (page: Page, index: number, result: SearchResult) => {
    trackSelection(page, index);
    
    const matchInfo: SearchMatchInfo = {
      matchTypes: result.matchTypes,
      matchedTerms: result.matchedTerms,
    };
    
    if (!hasShownFirstRetrievalMessage) {
      setShowFirstRetrievalMessage(true);
      setHasShownFirstRetrievalMessage(true);
      localStorage.setItem('shown_first_retrieval_message', 'true');
      
      setTimeout(() => {
        setShowFirstRetrievalMessage(false);
        onSelectPage(page, matchInfo);
      }, 2500);
    } else {
      onSelectPage(page, matchInfo);
    }
  };

  // NO AUTO-SEARCH: Google-style - only search on Enter or suggestion click
  // Removed the debounced auto-search to prevent "0 results" while typing

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const tokenizeQuery = (q: string) => {
    const raw = q
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const expanded = raw.flatMap((t) => (t.includes('-') ? [t, ...t.split('-')] : [t]));

    // Deduplicate + ignore 1-char tokens (keeps strict matching useful)
    return [...new Set(expanded)].filter((t) => t.length > 1);
  };

  const includesWholeWord = (haystack: string | null | undefined, needle: string) => {
    if (!haystack || !needle) return false;
    const re = new RegExp(`\\b${escapeRegExp(needle)}\\b`, 'iu');
    return re.test(haystack);
  };

  const scorePageKeywordFirst = (page: Page, terms: string[]): SearchResult | null => {
    const matchTypes = new Set<SearchResult['matchTypes'][number]>();
    const matchedTerms = new Set<string>();
    let score = 0;

    // User-assigned handles (all equal weight: +100)
    const primary = page.primaryKeyword || '';
    const cues = page.futureYouCues || [];
    const keywords = page.keywords || []; // Bonus words from AI analysis
    const ocr = page.ocrText || '';

    for (const term of terms) {
      let termMatched = false;

      // Spine (primary cue) — user-assigned (+100)
      if (includesWholeWord(primary, term)) {
        score += 100;
        matchTypes.add('spine');
        matchedTerms.add(term);
        termMatched = true;
      }

      // Future You Cues — user-assigned (+100, equal to spine)
      if (cues.some((c) => includesWholeWord(c, term))) {
        score += 100;
        matchTypes.add('cue');
        matchedTerms.add(term);
        termMatched = true;
      }

      // Keywords / bonus words — AI-suggested retrieval hints (+80)
      // NOTE: Disabled for v1 pilot - testing cues-only retrieval
      // if (keywords.some((k) => includesWholeWord(k, term))) {
      //   score += 80;
      //   matchTypes.add('cue');
      //   matchedTerms.add(term);
      //   termMatched = true;
      // }

      // OCR text — raw handwritten content
      // NOTE: Disabled for v1 pilot - testing cues-only retrieval
      // OCR still runs at capture, data available for future/fallback
      // if (includesWholeWord(ocr, term)) {
      //   score += 50;
      //   matchTypes.add('text');
      //   matchedTerms.add(term);
      //   termMatched = true;
      // }

      if (!termMatched) continue;
    }

    if (score <= 0) return null;

    const order: SearchResult['matchTypes'] = ['spine', 'cue', 'text', 'entity', 'meaning', 'date'];
    const orderedTypes = order.filter((t) => matchTypes.has(t)) as SearchResult['matchTypes'];

    return {
      page,
      score,
      matchTypes: orderedTypes,
      matchedTerms: [...matchedTerms],
    };
  };

  const performSearch = async (searchQuery: string, filter: 'week' | 'month' | 'all' | null) => {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      let timeFilterObj: { after?: Date; before?: Date } | undefined;
      if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        timeFilterObj = { after: weekAgo };
      } else if (filter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        timeFilterObj = { after: monthAgo };
      }

      // Use the correct backend based on configuration
      if (isHetznerEnabled()) {
        // Hetzner: keyword-first local lexical search (spine/cues) then OCR
        console.log('[Search] Using Hetzner backend (keyword-first local search)');
        const storageProvider = getStorageProvider();

        const terms = tokenizeQuery(searchQuery);
        if (terms.length === 0) {
          setResults([]);
          return;
        }

        const pages = await storageProvider.getPages();
        const filteredPages = pages.filter((p) => {
          if (timeFilterObj?.after && p.createdAt < timeFilterObj.after) return false;
          if (timeFilterObj?.before && p.createdAt > timeFilterObj.before) return false;
          return true;
        });

        const scored = filteredPages
          .map((p) => scorePageKeywordFirst(p as unknown as Page, terms))
          .filter((r): r is SearchResult => r !== null)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.page.createdAt.getTime() - a.page.createdAt.getTime();
          })
          .slice(0, 20);

        setResults(scored);
        trackSearch(searchQuery, scored, filter);
      } else {
        // Lovable Cloud: Use Supabase edge function
        console.log('[Search] Using Lovable Cloud backend');
        const { data, error } = await supabase.functions.invoke('search-pages', {
          body: {
            device_user_id: deviceUserId,
            query: searchQuery,
            time_filter: timeFilterObj
              ? {
                  after: timeFilterObj.after?.toISOString(),
                  before: timeFilterObj.before?.toISOString(),
                }
              : undefined,
            include_semantic: true,
            limit: 20,
          },
        });

        if (error) {
          console.error('Search error:', error);
          setResults([]);
        } else {
          const mappedResults: SearchResult[] = (data?.results || [])
            .filter((r: any) => r.page && r.page.id)
            .map((r: any) => ({
              page: mapToPage(r.page),
              score: r.score || 0,
              matchTypes: r.match_types || [],
              matchedTerms: r.matched_terms || [],
            }));
          setResults(mappedResults);
          trackSearch(searchQuery, mappedResults, filter);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const mapToPage = (row: any): Page => ({
    id: row.id,
    deviceUserId: row.device_user_id,
    writerUserId: row.writer_user_id,
    imageUrl: row.image_url,
    thumbnailUri: row.thumbnail_uri,
    ocrText: row.ocr_text || '',
    ocrTokens: row.ocr_tokens || [],
    namedEntities: row.named_entities || [],
    summary: row.summary || '',
    oneLineHint: row.one_line_hint,
    tone: row.tone ? (Array.isArray(row.tone) ? row.tone : [row.tone]) : [],
    keywords: row.keywords || [],
    topicLabels: row.topic_labels || [],
    primaryKeyword: row.primary_keyword,
    userNote: row.user_note,
    sources: row.sources || [],
    highlights: row.highlights || [],
    confidenceScore: row.confidence_score,
    capsuleId: row.capsule_id,
    pageOrder: row.page_order,
    projectId: row.project_id,
    futureYouCue: row.future_you_cue,
    futureYouCues: row.future_you_cues || [],
    futureYouCuesSource: row.future_you_cues_source || { ai_prefill_version: null, user_edited: false },
    embeddingVector: row.embedding_vector,
    sessionId: row.session_id,
    captureBatchId: row.capture_batch_id,
    sourceContainerId: row.source_container_id,
    writtenAt: row.written_at ? new Date(row.written_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    isTrashed: row.is_trashed === true,
    trashedAt: row.trashed_at ? new Date(row.trashed_at) : undefined,
  });

  const handleCantFind = () => {
    setShowFallback(true);
  };

  const handleTimeFilter = (filter: 'week' | 'month' | 'all') => {
    setTimeFilter(filter);
    setShowFallback(false);
    if (query.trim()) {
      performSearch(query, filter);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setShowFallback(false);
    setTimeFilter(null);
  };


  // Check if we have results to show inline
  const hasResults = hasSearched && results.length > 0;
  const hasNoResults = hasSearched && !isSearching && results.length === 0;

  return (
    <div className="min-h-screen bg-background relative">
      {/* First retrieval success message */}
      <AnimatePresence>
        {showFirstRetrievalMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="text-center px-8 py-6"
            >
              <p className="text-xl font-serif text-foreground/90 italic">
                "I'm someone who doesn't lose ideas."
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'linear' }}
                className="h-0.5 bg-primary/30 mt-4 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SINGLE CENTERED LAYOUT - everything inline */}
      <div className="min-h-screen flex flex-col">
        {/* Back button - larger clickable area */}
        <div className="p-4 relative z-20">
          <button
            onClick={() => {
              console.log('[SearchView] Back button clicked, calling onClose');
              onClose();
            }}
            className="p-3 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Centered content - always shows title, suggestions inline */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
          <div className="w-full max-w-md text-center space-y-6">
            {/* Title - clean, no info icon */}
            <div className="space-y-2">
              <h1 className="text-2xl font-serif text-foreground">
                Which beginning are you looking for?
              </h1>
              <p className="text-sm text-muted-foreground">
                Search by cue, name, date or meaning
              </p>
            </div>

            {/* Search input with clear button */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                  // Reset search state when typing (allows suggestions to show again)
                  if (hasSearched) {
                    setHasSearched(false);
                    setResults([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    setShowSuggestions(false);
                    performSearch(query, timeFilter);
                  }
                }}
                onFocus={() => setShowSuggestions(query.length > 0 && !hasSearched)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Type 1-3 words..."
                className="pl-12 pr-10 py-6 text-lg bg-muted/30 border-border rounded-xl"
                autoFocus
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted z-10"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Inline suggestions - appears below search input, NOT as overlay */}
            {/* Google-stijl: toon suggesties ALLEEN tijdens typen, niet nadat gezocht is */}
            <AnimatePresence>
              {showSuggestions && query.trim().length > 0 && !hasSearched && !isSearching && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {/* Fuzzy-matched suggestions with typo tolerance */}
                    {(() => {
                      const term = query.toLowerCase().trim();
                      if (term.length === 0) return null;
                      
                      // Score all cues using fuzzy matching
                      const scoredMatches = allCues
                        .map(cue => ({
                          cue,
                          ...fuzzyMatch(cue, term)
                        }))
                        .filter(m => m.match)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 6);
                      
                      // Google-style: als er geen matches zijn, toon niets (geen "no results" tijdens typen)
                      if (scoredMatches.length === 0) {
                        return null;
                      }
                      
                      return scoredMatches.map(({ cue, score }) => (
                        <button
                          key={cue}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-2"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setQuery(cue);
                            setShowSuggestions(false);
                            // Trigger search when selecting a suggestion
                            setTimeout(() => performSearch(cue, timeFilter), 0);
                          }}
                        >
                          <Tag className="w-3.5 h-3.5 text-primary" />
                          <span className="text-foreground">
                            {/* Highlight matching part */}
                            {cue.toLowerCase().indexOf(term) === 0 ? (
                              <>
                                <span className="font-medium">{cue.slice(0, term.length)}</span>
                                <span className="text-muted-foreground">{cue.slice(term.length)}</span>
                              </>
                            ) : (
                              cue
                            )}
                          </span>
                          {/* Show fuzzy match indicator for typo corrections */}
                          {score < 80 && (
                            <span className="text-xs text-muted-foreground/60 ml-auto">
                              ~
                            </span>
                          )}
                        </button>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Time filter indicator */}
            {timeFilter && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Filter:</span>
                <button
                  onClick={() => setTimeFilter(null)}
                  className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30 flex items-center gap-1"
                >
                  {timeFilter === 'week' ? 'Last week' : timeFilter === 'month' ? 'Last month' : 'All'}
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Loading state */}
            {isSearching && (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            )}

            {/* No results + fallback options */}
            {hasNoResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-muted-foreground">No results found</p>
                {!showFallback && (
                  <Button variant="outline" onClick={handleCantFind} className="gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Can't find it? Try time filter
                  </Button>
                )}
                
                <AnimatePresence>
                  {showFallback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-lg bg-muted/50 border border-border space-y-3 text-left"
                    >
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">When was it approximately?</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTimeFilter('week')} className="gap-1">
                          <Clock className="w-3 h-3" />
                          Last week
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTimeFilter('month')} className="gap-1">
                          <Clock className="w-3 h-3" />
                          Last month
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTimeFilter('all')}>
                          Show all
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Browse all beginnings - ALWAYS visible */}
            {onBrowseAll && (
              <button
                onClick={onBrowseAll}
                className="inline-flex items-center gap-2.5 text-base text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              >
                <Library className="w-5 h-5" />
                <span>Browse all beginnings</span>
              </button>
            )}
          </div>

          {/* Inline results carousel - appears below search when results exist */}
          <AnimatePresence>
            {hasResults && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md mt-6"
              >
                <CarouselResults 
                  results={results} 
                  onSelectPage={handleSelectPage}
                  showFallback={showFallback}
                  onCantFind={handleCantFind}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
