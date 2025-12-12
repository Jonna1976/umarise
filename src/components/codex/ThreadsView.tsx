import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { Page } from '@/lib/pageService';
import { format, differenceInDays, differenceInMonths, subMonths, isAfter, startOfMonth } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ThreadsViewProps {
  pages: Page[];
}

interface Thread {
  keyword: string;
  firstSeen: Date;
  lastSeen: Date;
  ageInDays: number;
  ageLabel: string;
  totalOccurrences: number;
  uniqueMonths: number;
  monthlyOccurrences: { month: string; count: number; date: Date }[];
  strength: 'strong' | 'growing' | 'emerging';
  relatedKeywords: string[];
  sampleSummaries: string[];
}

interface ThreadDetailProps {
  thread: Thread;
  onClose: () => void;
}

function ThreadDetail({ thread, onClose }: ThreadDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
    >
      <div className="max-w-lg mx-auto p-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">{thread.keyword}</h2>
              <p className="text-xs text-muted-foreground">{thread.ageLabel} in je codex</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <p className="text-2xl font-bold text-foreground">{thread.totalOccurrences}</p>
            <p className="text-[10px] text-muted-foreground">keer genoemd</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <p className="text-2xl font-bold text-foreground">{thread.uniqueMonths}</p>
            <p className="text-[10px] text-muted-foreground">maanden actief</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-center">
            <p className="text-2xl font-bold text-red-600 capitalize">{thread.strength}</p>
            <p className="text-[10px] text-muted-foreground">thread sterkte</p>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            Timeline
          </h3>
          <div className="relative">
            {/* The red thread line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-red-400 to-red-300" />
            
            <div className="space-y-3 pl-10">
              {thread.monthlyOccurrences.map((mo, i) => (
                <motion.div
                  key={mo.month}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  {/* Node on the thread */}
                  <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
                  
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {format(mo.date, 'MMMM yyyy', { locale: nl })}
                      </span>
                      <span className="text-xs text-red-600 font-medium">
                        {mo.count}× genoemd
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Related keywords */}
        {thread.relatedKeywords.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Gerelateerde themas</h3>
            <div className="flex flex-wrap gap-2">
              {thread.relatedKeywords.map(kw => (
                <span 
                  key={kw}
                  className="px-3 py-1 rounded-full text-xs bg-secondary border border-border"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sample context */}
        {thread.sampleSummaries.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Context fragmenten</h3>
            <div className="space-y-2">
              {thread.sampleSummaries.slice(0, 3).map((summary, i) => (
                <p key={i} className="text-xs text-muted-foreground italic p-3 rounded-lg bg-secondary/20">
                  "{summary}"
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ThreadsView({ pages }: ThreadsViewProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const threads = useMemo(() => {
    if (pages.length < 3) return [];

    const now = new Date();
    
    // Group pages by month
    const pagesByMonth: Record<string, Page[]> = {};
    pages.forEach(page => {
      const monthKey = format(page.createdAt, 'yyyy-MM');
      if (!pagesByMonth[monthKey]) {
        pagesByMonth[monthKey] = [];
      }
      pagesByMonth[monthKey].push(page);
    });

    // Count keywords per month
    const keywordsByMonth: Record<string, Record<string, number>> = {};
    Object.entries(pagesByMonth).forEach(([month, monthPages]) => {
      keywordsByMonth[month] = {};
      monthPages.forEach(page => {
        page.keywords.forEach(kw => {
          keywordsByMonth[month][kw] = (keywordsByMonth[month][kw] || 0) + 1;
        });
      });
    });

    // Find keywords that appear across multiple months
    const keywordMonthCounts: Record<string, Set<string>> = {};
    const keywordTotalCounts: Record<string, number> = {};
    const keywordFirstSeen: Record<string, Date> = {};
    const keywordLastSeen: Record<string, Date> = {};
    const keywordPages: Record<string, Page[]> = {};

    pages.forEach(page => {
      page.keywords.forEach(kw => {
        const monthKey = format(page.createdAt, 'yyyy-MM');
        
        if (!keywordMonthCounts[kw]) {
          keywordMonthCounts[kw] = new Set();
          keywordTotalCounts[kw] = 0;
          keywordFirstSeen[kw] = page.createdAt;
          keywordLastSeen[kw] = page.createdAt;
          keywordPages[kw] = [];
        }
        
        keywordMonthCounts[kw].add(monthKey);
        keywordTotalCounts[kw]++;
        keywordPages[kw].push(page);
        
        if (page.createdAt < keywordFirstSeen[kw]) {
          keywordFirstSeen[kw] = page.createdAt;
        }
        if (page.createdAt > keywordLastSeen[kw]) {
          keywordLastSeen[kw] = page.createdAt;
        }
      });
    });

    // Build threads from keywords that span multiple months
    const threadCandidates: Thread[] = [];

    Object.entries(keywordMonthCounts).forEach(([keyword, months]) => {
      const uniqueMonths = months.size;
      const totalOccurrences = keywordTotalCounts[keyword];
      const firstSeen = keywordFirstSeen[keyword];
      const lastSeen = keywordLastSeen[keyword];
      const ageInDays = differenceInDays(now, firstSeen);
      
      // Only include keywords that appear across at least 2 months or have significant recurrence
      if (uniqueMonths >= 2 || (uniqueMonths === 1 && totalOccurrences >= 4 && ageInDays > 14)) {
        // Calculate age label
        let ageLabel = '';
        if (ageInDays < 14) {
          ageLabel = 'Nieuw';
        } else if (ageInDays < 30) {
          ageLabel = `${Math.floor(ageInDays / 7)} weken`;
        } else {
          const months = differenceInMonths(now, firstSeen);
          ageLabel = months === 1 ? '1 maand' : `${months} maanden`;
        }

        // Determine strength
        let strength: 'strong' | 'growing' | 'emerging';
        if (uniqueMonths >= 3 && totalOccurrences >= 5) {
          strength = 'strong';
        } else if (uniqueMonths >= 2 || totalOccurrences >= 4) {
          strength = 'growing';
        } else {
          strength = 'emerging';
        }

        // Build monthly occurrences for timeline
        const monthlyOccurrences = Array.from(months)
          .sort()
          .map(monthKey => ({
            month: monthKey,
            count: keywordsByMonth[monthKey]?.[keyword] || 0,
            date: new Date(monthKey + '-01'),
          }));

        // Find related keywords (co-occur frequently)
        const relatedCounts: Record<string, number> = {};
        keywordPages[keyword].forEach(page => {
          page.keywords.forEach(otherKw => {
            if (otherKw !== keyword) {
              relatedCounts[otherKw] = (relatedCounts[otherKw] || 0) + 1;
            }
          });
        });
        const relatedKeywords = Object.entries(relatedCounts)
          .filter(([_, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([kw]) => kw);

        // Get sample summaries
        const sampleSummaries = keywordPages[keyword]
          .slice(0, 5)
          .map(p => p.summary)
          .filter(s => s && s.length > 20);

        threadCandidates.push({
          keyword,
          firstSeen,
          lastSeen,
          ageInDays,
          ageLabel,
          totalOccurrences,
          uniqueMonths,
          monthlyOccurrences,
          strength,
          relatedKeywords,
          sampleSummaries,
        });
      }
    });

    // Sort by strength, then by unique months, then by total occurrences
    threadCandidates.sort((a, b) => {
      const strengthOrder = { strong: 0, growing: 1, emerging: 2 };
      if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
        return strengthOrder[a.strength] - strengthOrder[b.strength];
      }
      if (a.uniqueMonths !== b.uniqueMonths) {
        return b.uniqueMonths - a.uniqueMonths;
      }
      return b.totalOccurrences - a.totalOccurrences;
    });

    return threadCandidates.slice(0, 10);
  }, [pages]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-400';
      case 'growing':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-secondary border-border text-muted-foreground';
    }
  };

  if (pages.length < 3) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-muted-foreground">
          <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Voeg meer pages toe om threads te ontdekken</p>
          <p className="text-xs opacity-60">Threads worden zichtbaar na meerdere weken schrijven</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-muted-foreground">
          <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nog geen langetermijn threads gedetecteerd</p>
          <p className="text-xs opacity-60">Threads verschijnen als themas over meerdere maanden terugkomen</p>
        </div>
      </div>
    );
  }

  const strongThreads = threads.filter(t => t.strength === 'strong');
  const growingThreads = threads.filter(t => t.strength === 'growing');
  const emergingThreads = threads.filter(t => t.strength === 'emerging');

  return (
    <>
      <div className="space-y-4">
        {/* Hero thread */}
        {strongThreads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 via-codex-cream to-secondary/30 border border-red-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600 font-medium uppercase tracking-wide">
                De Rode Draad
              </span>
            </div>
            
            <h3 className="font-serif text-xl font-bold mb-2 text-foreground">
              {strongThreads[0].keyword}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              Dit thema komt al {strongThreads[0].ageLabel} terug in je schrijven, 
              verspreid over {strongThreads[0].uniqueMonths} maanden.
            </p>

            <button
              onClick={() => setSelectedThread(strongThreads[0])}
              className="flex items-center gap-1 text-xs text-red-600 font-medium hover:underline"
            >
              Bekijk timeline
              <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* All threads list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="codex-card rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-codex-sepia" />
            <h3 className="font-medium text-sm">Alle Threads</h3>
            <span className="text-xs text-muted-foreground">({threads.length} gevonden)</span>
          </div>

          <div className="space-y-2">
            {threads.map((thread, i) => (
              <motion.button
                key={thread.keyword}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                onClick={() => setSelectedThread(thread)}
                className={`w-full p-3 rounded-lg border text-left transition-colors hover:bg-secondary/50 ${getStrengthColor(thread.strength)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{thread.keyword}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-70">{thread.ageLabel}</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] opacity-70">
                  <span>{thread.totalOccurrences}× genoemd</span>
                  <span>•</span>
                  <span>{thread.uniqueMonths} {thread.uniqueMonths === 1 ? 'maand' : 'maanden'}</span>
                  <span>•</span>
                  <span className="capitalize">{thread.strength}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Thread strength legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 text-[10px] text-muted-foreground"
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Strong
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Growing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Emerging
          </span>
        </motion.div>

        {/* Info footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-2"
        >
          <p className="text-[10px] text-muted-foreground/60 italic">
            Threads zijn themas die over meerdere maanden in je schrijven terugkomen
          </p>
        </motion.div>
      </div>

      {/* Thread detail modal */}
      <AnimatePresence>
        {selectedThread && (
          <ThreadDetail 
            thread={selectedThread} 
            onClose={() => setSelectedThread(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
