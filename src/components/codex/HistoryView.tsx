import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Calendar, Trash2, Brain, Search, X, Images, Plus, SlidersHorizontal, Star, Compass } from 'lucide-react';
import { Page, groupPagesByCapsule, CapsulePages } from '@/lib/pageService';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useState, useMemo } from 'react';
import { InsightsSection } from './InsightsSection';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryViewProps {
  pages: Page[];
  onBack: () => void;
  onSelectPage: (page: Page) => void;
  onSelectCapsule?: (capsule: CapsulePages) => void;
  onDeletePage: (pageId: string) => void;
  onAddToCapsule?: (capsuleId: string) => void;
  onViewPatterns?: () => void;
  onViewPersonality?: () => void;
  onViewKompas?: () => void;
}

type TimeFilter = 'all' | '7days' | '30days';
type KeywordFilter = 'all' | string;

// Union type for history items
type HistoryItem = 
  | { type: 'page'; page: Page }
  | { type: 'capsule'; capsule: CapsulePages };

function getToneClass(tone: string): string {
  const toneMap: Record<string, string> = {
    focused: 'tone-focused',
    hopeful: 'tone-hopeful',
    frustrated: 'tone-frustrated',
    playful: 'tone-playful',
    overwhelmed: 'tone-overwhelmed',
    reflective: 'tone-reflective',
  };
  return toneMap[tone.toLowerCase()] || 'bg-muted text-muted-foreground';
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMM d, yyyy');
}

export function HistoryView({ 
  pages: allPages, 
  onBack, 
  onSelectPage, 
  onSelectCapsule,
  onDeletePage, 
  onAddToCapsule,
  onViewPatterns,
  onViewPersonality,
  onViewKompas
}: HistoryViewProps) {
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [keywordFilter, setKeywordFilter] = useState<KeywordFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperFilter, setPaperFilter] = useState(true);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [capsuleToDelete, setCapsuleToDelete] = useState<CapsulePages | null>(null);

  // Get unique primary keywords for filter dropdown
  const primaryKeywords = useMemo(() => {
    const keywords = allPages
      .map(p => p.primaryKeyword)
      .filter((k): k is string => !!k);
    return [...new Set(keywords)].sort();
  }, [allPages]);

  // Filter and group pages
  const historyItems = useMemo(() => {
    let pages = [...allPages];
    
    const now = new Date();
    if (filter === '7days') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      pages = pages.filter(p => p.createdAt >= cutoff);
    } else if (filter === '30days') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      pages = pages.filter(p => p.createdAt >= cutoff);
    }

    // Apply keyword filter
    if (keywordFilter !== 'all') {
      pages = pages.filter(p => p.primaryKeyword === keywordFilter);
    }

    // Apply search filter (includes OCR text for full-text search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      pages = pages.filter(p => 
        p.ocrText.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.keywords.some(k => k.toLowerCase().includes(query)) ||
        p.tone.some(t => t.toLowerCase().includes(query)) ||
        p.primaryKeyword?.toLowerCase().includes(query) ||
        p.userNote?.toLowerCase().includes(query)
      );
    }
    
    // Group by capsules
    const { standalone, capsules } = groupPagesByCapsule(pages);
    
    // Create unified list sorted by date
    const items: HistoryItem[] = [];
    
    // Add standalone pages
    for (const page of standalone) {
      items.push({ type: 'page', page });
    }
    
    // Add capsules (use first page's date for sorting)
    for (const capsule of capsules) {
      items.push({ type: 'capsule', capsule });
    }
    
    // Sort by date (newest first)
    items.sort((a, b) => {
      const dateA = a.type === 'page' ? a.page.createdAt : a.capsule.pages[0]?.createdAt || new Date(0);
      const dateB = b.type === 'page' ? b.page.createdAt : b.capsule.pages[0]?.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    return items;
  }, [allPages, filter, keywordFilter, searchQuery]);

  // For insights, flatten all pages
  const filteredPages = useMemo(() => {
    return historyItems.flatMap(item => 
      item.type === 'page' ? [item.page] : item.capsule.pages
    );
  }, [historyItems]);

  const handleDelete = (page: Page) => {
    setPageToDelete(page);
  };

  const handleDeleteCapsule = (capsule: CapsulePages) => {
    setCapsuleToDelete(capsule);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      onDeletePage(pageToDelete.id);
      setPageToDelete(null);
    }
  };

  const confirmDeleteCapsule = () => {
    if (capsuleToDelete) {
      // Delete all pages in capsule
      for (const page of capsuleToDelete.pages) {
        onDeletePage(page.id);
      }
      setCapsuleToDelete(null);
    }
  };

  const handleCapsuleClick = (capsule: CapsulePages) => {
    if (onSelectCapsule) {
      onSelectCapsule(capsule);
    } else {
      // Fallback: select first page
      onSelectPage(capsule.pages[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <h1 className="font-serif text-lg font-medium">Your Codex</h1>
          
          <div className="flex items-center gap-1">
            {onViewKompas && (
              <button
                onClick={onViewKompas}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                title={allPages.length >= 3 ? "Mijn Kompas" : `${3 - allPages.length} more pages needed`}
              >
                <Compass className="w-5 h-5 text-red-500" />
                {allPages.length < 3 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted text-muted-foreground text-[9px] font-bold flex items-center justify-center border border-background">
                    {3 - allPages.length}
                  </span>
                )}
              </button>
            )}
            {onViewPersonality && (
              <button
                onClick={onViewPersonality}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                title={allPages.length >= 5 ? "Your Personality" : `${5 - allPages.length} more pages needed`}
              >
                <Star className="w-5 h-5 text-amber-500" />
                {allPages.length < 5 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted text-muted-foreground text-[9px] font-bold flex items-center justify-center border border-background">
                    {5 - allPages.length}
                  </span>
                )}
              </button>
            )}
            {onViewPatterns ? (
              <button
                onClick={onViewPatterns}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                title={allPages.length >= 3 ? "View Patterns" : `${3 - allPages.length} more pages needed for patterns`}
              >
                <Brain className="w-5 h-5 text-codex-sepia" />
                {allPages.length < 3 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted text-muted-foreground text-[9px] font-bold flex items-center justify-center border border-background">
                    {3 - allPages.length}
                  </span>
                )}
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords, summaries..."
              className="w-full pl-9 pr-9 py-2 rounded-full bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-codex-sepia/30 focus:border-codex-sepia/50 transition-all"
              maxLength={100}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          {(['all', '7days', '30days'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {f === 'all' ? 'All' : f === '7days' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>

        {/* Primary keyword filter */}
        {primaryKeywords.length > 0 && (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
            <button
              onClick={() => setKeywordFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                keywordFilter === 'all'
                  ? 'bg-codex-sepia text-white'
                  : 'bg-codex-sepia/10 text-codex-sepia hover:bg-codex-sepia/20'
              }`}
            >
              All keywords
            </button>
            {primaryKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setKeywordFilter(kw)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                  keywordFilter === kw
                    ? 'bg-codex-sepia text-white'
                    : 'bg-codex-sepia/10 text-codex-sepia hover:bg-codex-sepia/20'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        )}
        
        {/* Paper filter toggle */}
        <div className="flex justify-end px-4 pb-2">
          <button
            onClick={() => setPaperFilter(!paperFilter)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
              paperFilter
                ? 'bg-codex-gold/20 text-codex-gold'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
            title={paperFilter ? 'Show original colors' : 'Apply paper filter'}
          >
            <SlidersHorizontal className="w-3 h-3" />
            {paperFilter ? 'Paper filter on' : 'Original'}
          </button>
        </div>
      </div>

      {/* Insights Section */}
      <InsightsSection pages={filteredPages} />

      {/* History list */}
      <div className="p-4">
        {historyItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Calendar className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No pages found for "${searchQuery}"`
                : filter !== 'all' 
                  ? 'No pages in this time period' 
                  : 'Your codex is empty'}
            </p>
            {searchQuery ? (
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear search
              </Button>
            ) : (
              <Button onClick={onBack} variant="codex">
                <Camera className="w-4 h-4 mr-2" />
                Capture your first page
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item, index) => (
              <motion.div
                key={item.type === 'page' ? item.page.id : item.capsule.capsuleId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                {item.type === 'page' ? (
                  // Single page item
                  <button
                    onClick={() => onSelectPage(item.page)}
                    className="w-full text-left codex-card rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail with paper filter */}
                      <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={item.page.imageUrl}
                          alt=""
                          className={`w-full h-full object-cover ${paperFilter ? 'page-thumbnail' : ''}`}
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Primary keyword badge + Date */}
                        <div className="flex items-center gap-2 mb-1">
                          {item.page.primaryKeyword && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-codex-sepia text-white uppercase tracking-wide">
                              {item.page.primaryKeyword}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {getDateLabel(item.page.createdAt)} · {formatDistanceToNow(item.page.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        
                        {/* Summary */}
                        <p className="text-sm text-foreground line-clamp-2 leading-relaxed mb-2">
                          {item.page.summary}
                        </p>
                        
                        {/* Tone */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.page.tone.slice(0, 2).map((t) => (
                            <span key={t} className={`tone-chip text-[10px] ${getToneClass(t)}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.page);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </button>
                ) : (
                  // Capsule item
                  <div className="codex-card rounded-xl p-4 hover:shadow-md transition-all border-l-4 border-l-codex-gold">
                    <button
                      onClick={() => handleCapsuleClick(item.capsule)}
                      className="w-full text-left"
                    >
                      <div className="flex gap-4">
                        {/* Stacked thumbnails with paper filter */}
                        <div className="relative w-16 h-20 flex-shrink-0">
                          {item.capsule.pages.slice(0, 3).map((page, i) => (
                            <div
                              key={page.id}
                              className="absolute w-14 h-18 rounded-lg overflow-hidden bg-muted border border-background"
                              style={{
                                left: i * 4,
                                top: i * 2,
                                zIndex: 3 - i,
                              }}
                            >
                              <img
                                src={page.imageUrl}
                                alt=""
                                className={`w-full h-full object-cover ${paperFilter ? 'page-thumbnail' : ''}`}
                              />
                            </div>
                          ))}
                          {/* Page count badge */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-codex-gold text-codex-ink text-xs font-bold flex items-center justify-center z-10">
                            {item.capsule.pages.length}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Capsule indicator + Date */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-codex-gold/20 text-codex-gold">
                              <Images className="w-3 h-3" />
                              {item.capsule.pages.length} pages
                            </span>
                            {item.capsule.pages[0]?.primaryKeyword && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-codex-sepia text-white uppercase tracking-wide">
                                {item.capsule.pages[0].primaryKeyword}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-1">
                            {getDateLabel(item.capsule.pages[0]?.createdAt || new Date())} · {formatDistanceToNow(item.capsule.pages[0]?.createdAt || new Date(), { addSuffix: true })}
                          </p>
                          
                          {/* Combined summary from first page */}
                          <p className="text-sm text-foreground line-clamp-2 leading-relaxed mb-2">
                            {item.capsule.pages[0]?.summary || 'Multiple pages'}
                          </p>
                          
                          {/* Tones from all pages */}
                          <div className="flex flex-wrap gap-1.5">
                            {[...new Set(item.capsule.pages.flatMap(p => p.tone))].slice(0, 3).map((t) => (
                              <span key={t} className={`tone-chip text-[10px] ${getToneClass(t)}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          {onAddToCapsule && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCapsule(item.capsule.capsuleId);
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-codex-gold/20 transition-all"
                              title="Add more pages"
                            >
                              <Plus className="w-4 h-4 text-codex-gold" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCapsule(item.capsule);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating capture button */}
      {historyItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            onClick={onBack}
            variant="capture"
            size="capture"
            className="shadow-xl"
          >
            <Camera className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Delete page confirmation dialog */}
      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this page from your codex. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete capsule confirmation dialog */}
      <AlertDialog open={!!capsuleToDelete} onOpenChange={() => setCapsuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this capsule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all {capsuleToDelete?.pages.length || 0} pages in this capsule from your codex. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCapsule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}