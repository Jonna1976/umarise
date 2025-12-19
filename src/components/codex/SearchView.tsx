import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Calendar, Clock, Tag, User, Brain, FileText, HelpCircle, BookOpen, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Page } from '@/lib/pageService';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, getActiveDeviceId } from '@/lib/deviceId';
import { formatDistanceToNow } from 'date-fns';

export interface SearchMatchInfo {
  matchTypes: Array<'cue' | 'text' | 'entity' | 'meaning'>;
  matchedTerms: string[];
}

interface SearchResult {
  page: Page;
  score: number;
  matchTypes: Array<'cue' | 'text' | 'entity' | 'meaning'>;
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
  text: { label: 'Matched on text', icon: FileText, className: 'bg-muted text-muted-foreground border-border' },
  entity: { label: 'Matched on name', icon: User, className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  meaning: { label: 'Matched by meaning', icon: Brain, className: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
};

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
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

  // Fetch recent keywords on mount (lightweight query - only keywords field)
  useEffect(() => {
    const fetchRecentKeywords = async () => {
      const deviceUserId = getActiveDeviceId();
      if (!deviceUserId) return;

      try {
        const { data, error } = await supabase
          .from('pages')
          .select('keywords, future_you_cues')
          .eq('device_user_id', deviceUserId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          // Collect unique keywords and cues from recent pages
          const allKeywords: string[] = [];
          data.forEach((row: any) => {
            if (row.future_you_cues) allKeywords.push(...row.future_you_cues);
            if (row.keywords) allKeywords.push(...row.keywords);
          });
          // Deduplicate and take top 6
          const unique = [...new Set(allKeywords)].slice(0, 6);
          setRecentKeywords(unique);
        }
      } catch (error) {
        console.error('Failed to fetch recent keywords:', error);
      }
    };

    fetchRecentKeywords();
  }, []);

  // Track search telemetry
  const trackSearch = async (searchQuery: string, searchResults: SearchResult[], filterUsed: string | null) => {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId || searchResults.length === 0) return;

    try {
      const top5Ids = searchResults.slice(0, 5).map(r => r.page.id);
      const { data } = await supabase
        .from('search_telemetry')
        .insert({
          device_user_id: deviceUserId,
          query: searchQuery,
          result_count: searchResults.length,
          top_5_page_ids: top5Ids,
          time_filter_used: filterUsed
        } as never)
        .select('id')
        .single();
      
      if (data) {
        setCurrentSearchId((data as any).id);
        setSearchStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  };

  // Track when user selects a result
  const trackSelection = async (selectedPage: Page, rank: number) => {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId || !currentSearchId) return;

    try {
      const timeToSelect = searchStartTime ? Date.now() - searchStartTime : null;
      await supabase
        .from('search_telemetry')
        .update({
          selected_page_id: selectedPage.id,
          selected_rank: rank + 1,
          time_to_select_ms: timeToSelect
        } as never)
        .eq('id', currentSearchId);
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

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query, timeFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, timeFilter]);

  const performSearch = async (searchQuery: string, filter: 'week' | 'month' | 'all' | null) => {
    const deviceUserId = getActiveDeviceId();
    if (!deviceUserId) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      let timeFilterObj: { after?: string; before?: string } | undefined;
      if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        timeFilterObj = { after: weekAgo.toISOString() };
      } else if (filter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        timeFilterObj = { after: monthAgo.toISOString() };
      }

      const { data, error } = await supabase.functions.invoke('search-pages', {
        body: {
          device_user_id: deviceUserId,
          query: searchQuery,
          time_filter: timeFilterObj,
          include_semantic: true,
          limit: 20
        }
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
            matchedTerms: r.matched_terms || []
          }));
        setResults(mappedResults);
        trackSearch(searchQuery, mappedResults, filter);
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

  // Google/ChatGPT style: show centered search until search is performed
  const showCenteredSearch = !hasSearched;

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

      {/* CENTERED SEARCH - Google/ChatGPT style */}
      {showCenteredSearch && (
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

          {/* Centered content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md text-center space-y-8"
            >
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-serif text-foreground">
                    What are you looking for?
                  </h1>
                  <Popover>
                    <PopoverTrigger className="p-1 rounded-full hover:bg-muted/50 transition-colors opacity-30 hover:opacity-60">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 text-sm" align="center">
                      <div className="space-y-3">
                        <p className="font-medium text-foreground">Design rationale</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          Wij hebben bewust gekozen om voor een bekende Search gewoonte te kiezen die mensen al gewend zijn. Dus geen nieuwe gewoonte of UX/UI om aan te wennen. Rust is van het grootste belang.
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li><strong>Bekende interactie</strong> — Google/ChatGPT-stijl zoeken is universeel aangeleerd, geen leercurve</li>
                          <li><strong>Intent-first</strong> — Gebruiker wordt gedwongen na te denken "wat zoek ik?" voordat ze bladeren</li>
                          <li><strong>Bewijst de waarde</strong> — Elke succesvolle zoekopdracht bevestigt dat het systeem werkt</li>
                          <li><strong>Reduceert noise</strong> — Browsen door alles is nu bewuste keuze, niet default</li>
                        </ul>
                        <p className="text-xs text-muted-foreground/70 italic">
                          De flow Camera → Search → Memory dwingt het retrieval-moment af als primaire interactie.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search by cue, name, or meaning
                </p>
              </div>

              {/* Search input - prominent */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type 1-3 words..."
                  className="pl-12 pr-4 py-6 text-lg bg-muted/30 border-border rounded-xl"
                  autoFocus
                />
              </div>

              {/* Recent keywords - fast loading chips */}
              {recentKeywords.length > 0 && (
                <div className="space-y-3 pt-4">
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider">Recent</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recentKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => setQuery(keyword)}
                        className="px-3 py-1.5 rounded-full text-sm bg-muted/50 text-muted-foreground border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-foreground transition-all"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse all */}
              {onBrowseAll && (
                <button
                  onClick={onBrowseAll}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse all pages</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {!showCenteredSearch && (
        <>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() => {
                  console.log('[SearchView] Back button clicked (results view), calling onClose');
                  onClose();
                }}
                className="p-3 -ml-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your memory..."
                  className="pl-10 pr-10 bg-muted/50 border-border"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {timeFilter && (
              <div className="px-4 pb-3 flex items-center gap-2">
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
          </div>

          {/* Results */}
          <div className="p-4 space-y-3">
            {isSearching && (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            )}

            {!isSearching && hasSearched && results.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No results found</p>
                {!showFallback && (
                  <Button variant="outline" onClick={handleCantFind} className="gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Can't find it? Try time filter
                  </Button>
                )}
              </div>
            )}

            <AnimatePresence>
              {showFallback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-lg bg-muted/50 border border-border space-y-3"
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

            {!isSearching && results.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">{results.length} results</p>
                
                {/* TOP MATCH - Large and prominent */}
                {results.length > 0 && (
                  <motion.button
                    key={results[0].page.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectPage(results[0].page, 0, results[0])}
                    className="w-full text-left rounded-xl bg-card border-2 border-primary/30 hover:border-primary/60 transition-colors overflow-hidden shadow-sm"
                  >
                    {/* Large image */}
                    <div className="aspect-[16/10] w-full bg-muted relative">
                      <img
                        src={results[0].page.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {/* Best match badge */}
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        Best match
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                        {formatDistanceToNow(results[0].page.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="p-3 space-y-1.5">
                      {/* Cues */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {results[0].page.futureYouCues?.slice(0, 3).map((cue, i) => (
                          <span 
                            key={`cue-${i}`} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {cue}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {results[0].page.oneLineHint || results[0].page.summary?.split('.')[0]}
                      </p>
                    </div>
                  </motion.button>
                )}

                {/* REST - Compact 2-column grid */}
                {results.length > 1 && (
                  <div className="grid grid-cols-2 gap-2">
                    {results.slice(1).map((result, index) => (
                      <motion.button
                        key={result.page.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 1) * 0.03 }}
                        onClick={() => handleSelectPage(result.page, index + 1, result)}
                        className="text-left rounded-lg bg-card border border-border hover:border-primary/50 transition-colors overflow-hidden"
                      >
                        {/* Compact image */}
                        <div className="aspect-[4/3] w-full bg-muted relative">
                          <img
                            src={result.page.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/60 text-white text-[8px]">
                            {formatDistanceToNow(result.page.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        
                        {/* Minimal info */}
                        <div className="p-2">
                          {result.page.futureYouCues?.[0] && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                              <Tag className="w-2 h-2" />
                              {result.page.futureYouCues[0]}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
                
                {results.length > 0 && !showFallback && (
                  <div className="pt-2 text-center">
                    <Button variant="ghost" size="sm" onClick={handleCantFind} className="gap-2 text-muted-foreground text-xs">
                      <HelpCircle className="w-3 h-3" />
                      Not found? Try time filter
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
