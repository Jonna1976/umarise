import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Calendar, Trash2, Brain, Search, X, Images, Plus, SlidersHorizontal, Star, Compass, List, Grid3X3, BookOpen, Library, Sparkles, Warehouse } from 'lucide-react';
import { Page, groupPagesByCapsule, CapsulePages, Project, getProjects } from '@/lib/pageService';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useState, useMemo, useEffect } from 'react';

import { BookCoverCard } from './BookCoverCard';
import { BookSpine } from './BookSpine';
import { VaultView } from './VaultView';
import { CodexGrowthIndicator } from './CodexGrowthIndicator';
import { EarlyInsights } from './EarlyInsights';
import { MemoryPulse } from './MemoryPulse';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import { useDemoMode } from '@/contexts/DemoModeContext';
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
  onViewYearReflection?: () => void;
  onViewOrbit?: () => void;
  onOpenSearch?: () => void;
  highlightPageId?: string;
}

type TimeFilter = 'all' | '7days' | '30days';
type KeywordFilter = 'all' | string;
type ToneFilter = 'all' | string;
type ViewMode = 'list' | 'calendar' | 'covers' | 'shelf' | 'vault';

// Union type for history items
type HistoryItem = 
  | { type: 'page'; page: Page }
  | { type: 'capsule'; capsule: CapsulePages };

// Available tones for filtering
const AVAILABLE_TONES = ['focused', 'hopeful', 'frustrated', 'playful', 'overwhelmed', 'reflective'];

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
  onViewKompas,
  onViewYearReflection,
  onViewOrbit,
  onOpenSearch,
  highlightPageId
}: HistoryViewProps) {
  const { isDemoMode } = useDemoMode();
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [keywordFilter, setKeywordFilter] = useState<KeywordFilter>('all');
  const [toneFilter, setToneFilter] = useState<ToneFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperFilter, setPaperFilter] = useState(true);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [capsuleToDelete, setCapsuleToDelete] = useState<CapsulePages | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('vault');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects on mount
  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

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

    // Apply tone filter
    if (toneFilter !== 'all') {
      pages = pages.filter(p => p.tone.some(t => t.toLowerCase() === toneFilter.toLowerCase()));
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
  }, [allPages, filter, keywordFilter, toneFilter, searchQuery]);

  // Calendar data - pages grouped by day
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const dayMap = new Map<string, Page[]>();
    
    allPages.forEach(page => {
      const dayKey = format(page.createdAt, 'yyyy-MM-dd');
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, []);
      }
      dayMap.get(dayKey)!.push(page);
    });
    
    return { days, dayMap };
  }, [allPages, calendarMonth]);

  // Tones used in current pages for smart filtering
  const usedTones = useMemo(() => {
    const tones = new Set<string>();
    allPages.forEach(p => p.tone.forEach(t => tones.add(t.toLowerCase())));
    return AVAILABLE_TONES.filter(t => tones.has(t));
  }, [allPages]);

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

  // Minimal header for shelf mode
  const isShelfMode = viewMode === 'shelf';

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal for Shelf mode */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex flex-col items-center gap-1">
            {isDemoMode ? (
              <h1 className="font-serif text-2xl font-semibold text-codex-gold">Photos for handwriting</h1>
            ) : (
              <h1 className="font-serif text-2xl font-semibold text-foreground">Lasting Memory</h1>
            )}
            {!isShelfMode && <DemoModeToggle />}
          </div>
          
          {/* Right side - Shelf mode only shows view toggles */}
          {isShelfMode ? (
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('vault')}
                className="p-1.5 rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Vault"
              >
                <Warehouse className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('shelf')}
                className="p-1.5 rounded transition-colors bg-background shadow-sm"
                title="Bookshelf"
              >
                <Library className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded transition-colors text-muted-foreground hover:text-foreground"
                title="List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          ) : isDemoMode ? (
            <div className="flex items-center">
              {onOpenSearch ? (
                <button
                  onClick={onOpenSearch}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                  title="Search"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-foreground" />
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Single Insights button - only shows at 5+ pages */}
              {allPages.length >= 5 && onViewPersonality && (
                <button
                  onClick={onViewPersonality}
                  className="px-3 py-1.5 rounded-full bg-codex-gold/20 text-codex-gold text-sm font-medium hover:bg-codex-gold/30 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Insights
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search button - hidden in shelf mode */}
        {onOpenSearch && !isShelfMode && (
          <div className="px-4 pb-3">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center gap-3 pl-4 pr-4 py-3 rounded-2xl bg-codex-gold/10 border-2 border-codex-gold/30 text-muted-foreground hover:bg-codex-gold/20 hover:text-foreground transition-all"
            >
              <Search className="w-5 h-5 text-codex-gold" />
              <span className="font-medium">Search your memory...</span>
            </button>
          </div>
        )}

        {/* View mode toggle + Time filters - hidden in demo mode and shelf mode */}
        {!isDemoMode && !isShelfMode && (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto">
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
                  {f === 'all' ? 'All' : f === '7days' ? '7 days' : '30 days'}
                </button>
              ))}
            </div>
            
            {/* View mode toggle */}
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('vault')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'vault' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vault (full overview)"
              >
                <Warehouse className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('shelf')}
                className="p-1.5 rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Bookshelf"
              >
                <Library className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('covers')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'covers' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Book covers"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'calendar' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Calendar view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters hidden for cleaner UI */}
      </div>

      {/* Active filters summary - hidden in demo mode */}
      {!isDemoMode && (searchQuery || toneFilter !== 'all' || keywordFilter !== 'all' || filter !== 'all') && (
        <div className="px-4 py-2 bg-codex-gold/5 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-codex-gold/20 text-codex-gold">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-codex-ink">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {toneFilter !== 'all' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getToneClass(toneFilter)}`}>
                {toneFilter}
                <button onClick={() => setToneFilter('all')} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {keywordFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-codex-sepia text-white">
                {keywordFilter}
                <button onClick={() => setKeywordFilter('all')} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
                {filter === '7days' ? '7 days' : '30 days'}
                <button onClick={() => setFilter('all')} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setToneFilter('all');
                setKeywordFilter('all');
                setFilter('all');
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Codex Growth Indicator - shown when few pages, hidden in demo mode */}
      {!isDemoMode && allPages.length > 0 && allPages.length < 10 && (
        <div className="mx-4 mb-4">
          <CodexGrowthIndicator pageCount={allPages.length} />
        </div>
      )}

      {/* Early Insights - connections found with just a few pages, hidden in demo mode */}
      {!isDemoMode && allPages.length >= 2 && allPages.length < 5 && (
        <div className="mx-4 mb-4">
          <EarlyInsights pages={allPages} latestPage={allPages[0]} />
        </div>
      )}


      {/* View Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'vault' ? (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <VaultView
              items={historyItems}
              projects={projects}
              onSelectPage={onSelectPage}
              onSelectCapsule={onSelectCapsule}
              highlightPageId={highlightPageId}
            />
          </motion.div>
        ) : viewMode === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-lg font-medium capitalize">
                {format(calendarMonth, 'MMMM yyyy', { locale: nl })}
              </h2>
              <button
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors rotate-180"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: (calendarData.days[0]?.getDay() || 0) === 0 ? 6 : (calendarData.days[0]?.getDay() || 1) - 1 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {calendarData.days.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayPages = calendarData.dayMap.get(dayKey) || [];
                const hasPages = dayPages.length > 0;
                const isCurrentMonth = isSameMonth(day, calendarMonth);
                const isCurrentDay = isSameDay(day, new Date());
                
                return (
                  <button
                    key={dayKey}
                    onClick={() => {
                      if (hasPages) {
                        if (dayPages.length === 1) {
                          onSelectPage(dayPages[0]);
                        } else {
                          onSelectPage(dayPages[0]);
                        }
                      }
                    }}
                    disabled={!hasPages}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      ${isCurrentDay ? 'ring-2 ring-codex-gold' : ''}
                      ${hasPages 
                        ? 'bg-codex-gold/20 hover:bg-codex-gold/40 cursor-pointer' 
                        : 'bg-secondary/30 cursor-default'
                      }
                    `}
                  >
                    <span className={`text-xs font-medium ${hasPages ? 'text-codex-gold' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </span>
                    {hasPages && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {dayPages.slice(0, 3).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-1 h-1 rounded-full bg-codex-gold"
                          />
                        ))}
                        {dayPages.length > 3 && (
                          <span className="text-[8px] text-codex-gold font-bold">+{dayPages.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Month summary */}
            <div className="mt-4 p-3 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {allPages.filter(p => isSameMonth(p.createdAt, calendarMonth)).length}
                </span> pages in {format(calendarMonth, 'MMMM', { locale: nl })}
              </p>
            </div>
          </motion.div>
        ) : viewMode === 'covers' ? (
          /* Book Covers View */
          <motion.div
            key="covers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4"
          >
            {historyItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                {searchQuery ? (
                  <p className="text-muted-foreground mb-6">No pages found for "{searchQuery}"</p>
                ) : (
                  <>
                    <p className="text-lg font-serif text-foreground mb-2">Pen down. Snap.</p>
                    <p className="text-sm text-muted-foreground mb-6">Your pages live here.</p>
                  </>
                )}
                <Button onClick={onBack} variant="codex">
                  <Camera className="w-4 h-4 mr-2" />
                  Start writing
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item, index) => (
                  <motion.div
                    key={item.type === 'page' ? item.page.id : item.capsule.capsuleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <BookCoverCard
                      page={item.type === 'page' ? item.page : undefined}
                      capsule={item.type === 'capsule' ? item.capsule : undefined}
                      onClick={() => {
                        if (item.type === 'page') {
                          onSelectPage(item.page);
                        } else if (onSelectCapsule) {
                          onSelectCapsule(item.capsule);
                        } else {
                          onSelectPage(item.capsule.pages[0]);
                        }
                      }}
                      onDelete={() => {
                        if (item.type === 'page') {
                          handleDelete(item.page);
                        } else {
                          handleDeleteCapsule(item.capsule);
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : viewMode === 'shelf' ? (
          /* Bookshelf View */
          <motion.div
            key="shelf"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-4"
          >
            {historyItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Library className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Your bookshelf is empty
                </p>
                <Button onClick={onBack} variant="codex">
                  <Camera className="w-4 h-4 mr-2" />
                  Start writing
                </Button>
              </motion.div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Memory Pulse - subtle daily reminder */}
                <MemoryPulse pages={allPages} />
                
                <div className="relative min-h-[280px] flex flex-col justify-end flex-1">
                {/* Books container - positioned at bottom */}
                <div 
                  className="flex gap-2 px-4 items-end overflow-x-auto scrollbar-hide pb-1"
                  style={{ 
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {historyItems.map((item, index) => (
                    <div 
                      key={item.type === 'page' ? item.page.id : item.capsule.capsuleId}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <BookSpine
                        page={item.type === 'page' ? item.page : undefined}
                        capsule={item.type === 'capsule' ? item.capsule : undefined}
                        onClick={() => {
                          if (item.type === 'page') {
                            onSelectPage(item.page);
                          } else if (onSelectCapsule) {
                            onSelectCapsule(item.capsule);
                          } else {
                            onSelectPage(item.capsule.pages[0]);
                          }
                        }}
                        index={index}
                        projects={projects}
                        isHighlighted={
                          highlightPageId && (
                            (item.type === 'page' && item.page.id === highlightPageId) ||
                            (item.type === 'capsule' && item.capsule.pages.some(p => p.id === highlightPageId))
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
                
                {/* Shelf - matches design system */}
                <div className="relative mt-0">
                  {/* Shelf top surface */}
                  <div className="h-3 bg-gradient-to-b from-codex-sepia/40 via-codex-sepia/30 to-codex-sepia/20 rounded-t-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]" />
                  {/* Shelf front edge */}
                  <div className="h-1.5 bg-codex-sepia/25 shadow-sm" />
                </div>
              </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4"
          >
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
            {searchQuery ? (
              <>
                <p className="text-muted-foreground mb-6">No pages found for "{searchQuery}"</p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear search
                </Button>
              </>
            ) : filter !== 'all' ? (
              <>
                <p className="text-muted-foreground mb-6">No pages in this time period</p>
                <Button onClick={onBack} variant="codex">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture your first page
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-serif text-foreground mb-2">Pen down. Snap.</p>
                <p className="text-sm text-muted-foreground mb-6">Your pages live here.</p>
                <Button onClick={onBack} variant="codex">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture your first page
                </Button>
              </>
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
          </motion.div>
        )}
      </AnimatePresence>

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
              This will permanently remove this page from your memory. This action cannot be undone.
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
              This will permanently remove all {capsuleToDelete?.pages.length || 0} pages in this capsule from your memory. This action cannot be undone.
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