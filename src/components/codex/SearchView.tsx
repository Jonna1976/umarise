import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Calendar, Clock, Tag, User, Brain, FileText, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Page } from '@/lib/pageService';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
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
 * Per briefing sections 6 and 9
 */
export function SearchView({ onClose, onSelectPage }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all' | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [showFirstRetrievalMessage, setShowFirstRetrievalMessage] = useState(false);
  const [hasShownFirstRetrievalMessage, setHasShownFirstRetrievalMessage] = useState(() => {
    // Check localStorage to see if we've already shown the message
    return localStorage.getItem('shown_first_retrieval_message') === 'true';
  });

  // Track search telemetry
  const trackSearch = async (searchQuery: string, searchResults: SearchResult[], filterUsed: string | null) => {
    const deviceUserId = getDeviceId();
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
    const deviceUserId = getDeviceId();
    if (!deviceUserId || !currentSearchId) return;

    try {
      const timeToSelect = searchStartTime ? Date.now() - searchStartTime : null;
      await supabase
        .from('search_telemetry')
        .update({
          selected_page_id: selectedPage.id,
          selected_rank: rank + 1, // 1-indexed
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
    
    // Show the subtle "I'm someone who doesn't lose ideas" message on first successful retrieval
    if (!hasShownFirstRetrievalMessage) {
      setShowFirstRetrievalMessage(true);
      setHasShownFirstRetrievalMessage(true);
      localStorage.setItem('shown_first_retrieval_message', 'true');
      
      // Auto-hide after 3 seconds, then navigate
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
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Build time filter
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
        // Map the results - edge function now returns full page object
        // (FIX 4) Filter out null/undefined pages to avoid crashes
        const mappedResults: SearchResult[] = (data?.results || [])
          .filter((r: any) => r.page && r.page.id) // Ensure page exists with required id field
          .map((r: any) => ({
            page: mapToPage(r.page),
            score: r.score || 0,
            matchTypes: r.match_types || [],
            matchedTerms: r.matched_terms || []
          }));
        setResults(mappedResults);
        
        // Track search for telemetry
        trackSearch(searchQuery, mappedResults, filter);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Map database row to Page type
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

  return (
    <div className="min-h-screen bg-background relative">
      {/* First retrieval success message - subtle overlay */}
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
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

        {/* Time filter pills (when active) */}
        {timeFilter && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <button
              onClick={() => setTimeFilter(null)}
              className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30 flex items-center gap-1"
            >
              {timeFilter === 'week' ? 'Afgelopen week' : timeFilter === 'month' ? 'Afgelopen maand' : 'Alles'}
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
            <p className="text-sm text-muted-foreground mt-2">Zoeken...</p>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">Geen resultaten gevonden</p>
            {!showFallback && (
              <Button
                variant="outline"
                onClick={handleCantFind}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Ik kan het niet vinden
              </Button>
            )}
          </div>
        )}

        {/* Can't find it fallback */}
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
                <span className="font-medium">Wanneer was het ongeveer?</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeFilter('week')}
                  className="gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Afgelopen week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeFilter('month')}
                  className="gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Afgelopen maand
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeFilter('all')}
                >
                  Alles tonen
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results list */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {results.length} resultaten
            </p>
            
            {results.map((result, index) => (
              <motion.button
                key={result.page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectPage(result.page, index, result)}
                className="w-full text-left p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={result.page.thumbnailUri || result.page.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Summary or hint */}
                    <p className="text-sm text-foreground line-clamp-2">
                      {result.page.oneLineHint || result.page.summary}
                    </p>

                    {/* Matched cues */}
                    {result.page.futureYouCues && result.page.futureYouCues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.page.futureYouCues.slice(0, 3).map((cue, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-full text-[10px] border ${
                              result.matchedTerms.some(t => cue.toLowerCase().includes(t.toLowerCase()))
                                ? 'bg-primary/20 text-primary border-primary/30'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {cue}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Match type badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {result.matchTypes.map((type) => {
                        const badge = matchTypeBadges[type];
                        if (!badge) return null;
                        const Icon = badge.icon;
                        return (
                          <span
                            key={type}
                            className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${badge.className}`}
                          >
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        );
                      })}
                    </div>

                    {/* Date */}
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(result.page.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}

            {/* Can't find CTA at bottom of results */}
            {!showFallback && results.length > 0 && results.length < 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCantFind}
                  className="gap-2 text-muted-foreground"
                >
                  <HelpCircle className="w-4 h-4" />
                  Niet gevonden? Probeer tijdfilter
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty state (no search yet) */}
        {!hasSearched && !query && (
          <div className="text-center py-12 space-y-2">
            <Search className="w-8 h-8 text-muted-foreground/50 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Typ 1-3 woorden om te zoeken
            </p>
            <p className="text-xs text-muted-foreground/70">
              Zoekt in cues, tekst, namen en betekenis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
