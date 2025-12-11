import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Calendar, Trash2, Brain, Search, X } from 'lucide-react';
import { Page, getPages, deletePage } from '@/lib/mockData';
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
  onBack: () => void;
  onSelectPage: (page: Page) => void;
  onViewPatterns?: () => void;
}

type TimeFilter = 'all' | '7days' | '30days';

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

export function HistoryView({ onBack, onSelectPage, onViewPatterns }: HistoryViewProps) {
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pages = useMemo(() => {
    let allPages = getPages();
    
    const now = new Date();
    if (filter === '7days') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      allPages = allPages.filter(p => p.createdAt >= cutoff);
    } else if (filter === '30days') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      allPages = allPages.filter(p => p.createdAt >= cutoff);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      allPages = allPages.filter(p => 
        p.summary.toLowerCase().includes(query) ||
        p.keywords.some(k => k.toLowerCase().includes(query)) ||
        p.tone.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return allPages;
  }, [filter, refreshKey, searchQuery]);

  const handleDelete = (page: Page) => {
    setPageToDelete(page);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      deletePage(pageToDelete.id);
      setRefreshKey(k => k + 1);
      setPageToDelete(null);
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
          
          {onViewPatterns ? (
            <button
              onClick={onViewPatterns}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              title="View Patterns"
            >
              <Brain className="w-5 h-5 text-codex-sepia" />
            </button>
          ) : (
            <div className="w-10" />
          )}
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
        <div className="flex gap-2 px-4 pb-4">
          {(['all', '7days', '30days'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {f === 'all' ? 'All' : f === '7days' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <InsightsSection pages={pages} />

      {/* Page list */}
      <div className="p-4">
        {pages.length === 0 ? (
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
            {pages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <button
                  onClick={() => onSelectPage(page)}
                  className="w-full text-left codex-card rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={page.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Date */}
                      <p className="text-xs text-muted-foreground mb-1">
                        {getDateLabel(page.createdAt)} · {formatDistanceToNow(page.createdAt, { addSuffix: true })}
                      </p>
                      
                      {/* Summary */}
                      <p className="text-sm text-foreground line-clamp-2 leading-relaxed mb-2">
                        {page.summary}
                      </p>
                      
                      {/* Tone */}
                      <div className="flex flex-wrap gap-1.5">
                        {page.tone.slice(0, 2).map((t) => (
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
                        handleDelete(page);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating capture button */}
      {pages.length > 0 && (
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

      {/* Delete confirmation dialog */}
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
    </div>
  );
}
