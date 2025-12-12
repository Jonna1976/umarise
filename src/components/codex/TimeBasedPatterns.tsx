import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Clock,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Page } from '@/lib/pageService';
import { format, subDays, subWeeks, isAfter, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';

interface TimeBasedPatternsProps {
  pages: Page[];
}

interface TimePeriodAnalysis {
  periodLabel: string;
  periodDescription: string;
  pageCount: number;
  topKeywords: { keyword: string; count: number }[];
  dominantTone: string;
  toneCount: number;
  comparedToPrevious: 'more' | 'less' | 'same';
  previousPeriodCount: number;
}

interface KeywordTrend {
  keyword: string;
  currentCount: number;
  previousCount: number;
  trend: 'rising' | 'falling' | 'stable' | 'new';
  percentage: number;
}

export function TimeBasedPatterns({ pages }: TimeBasedPatternsProps) {
  // Analyze different time periods
  const analysis = useMemo(() => {
    const now = new Date();
    
    // Define periods
    const periods = [
      { 
        label: 'Afgelopen week', 
        description: 'De laatste 7 dagen',
        start: subDays(now, 7), 
        previousStart: subDays(now, 14),
        previousEnd: subDays(now, 7)
      },
      { 
        label: 'Afgelopen 2 weken', 
        description: 'De laatste 14 dagen',
        start: subDays(now, 14), 
        previousStart: subDays(now, 28),
        previousEnd: subDays(now, 14)
      },
      { 
        label: 'Afgelopen maand', 
        description: 'De laatste 30 dagen',
        start: subDays(now, 30), 
        previousStart: subDays(now, 60),
        previousEnd: subDays(now, 30)
      },
    ];

    const periodAnalyses: TimePeriodAnalysis[] = periods.map(period => {
      // Current period pages
      const periodPages = pages.filter(p => isAfter(p.createdAt, period.start));
      
      // Previous period pages (for comparison)
      const previousPages = pages.filter(p => 
        isAfter(p.createdAt, period.previousStart) && 
        !isAfter(p.createdAt, period.previousEnd)
      );

      // Count keywords
      const keywordCounts: Record<string, number> = {};
      periodPages.forEach(p => {
        p.keywords.forEach(k => {
          keywordCounts[k] = (keywordCounts[k] || 0) + 1;
        });
      });

      const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([keyword, count]) => ({ keyword, count }));

      // Count tones
      const toneCounts: Record<string, number> = {};
      periodPages.forEach(p => {
        const tone = p.tone[0]?.toLowerCase() || 'reflective';
        toneCounts[tone] = (toneCounts[tone] || 0) + 1;
      });

      const sortedTones = Object.entries(toneCounts).sort((a, b) => b[1] - a[1]);
      const dominantTone = sortedTones[0]?.[0] || 'geen';
      const toneCount = sortedTones[0]?.[1] || 0;

      // Compare to previous
      let comparedToPrevious: 'more' | 'less' | 'same' = 'same';
      if (periodPages.length > previousPages.length * 1.2) {
        comparedToPrevious = 'more';
      } else if (periodPages.length < previousPages.length * 0.8) {
        comparedToPrevious = 'less';
      }

      return {
        periodLabel: period.label,
        periodDescription: period.description,
        pageCount: periodPages.length,
        topKeywords,
        dominantTone,
        toneCount,
        comparedToPrevious,
        previousPeriodCount: previousPages.length,
      };
    });

    // Find the most active/relevant period (with at least some data)
    const activePeriod = periodAnalyses.find(p => p.pageCount >= 2) || periodAnalyses[0];

    // Calculate keyword trends (last 2 weeks vs previous 2 weeks)
    const recentPages = pages.filter(p => isAfter(p.createdAt, subDays(now, 14)));
    const olderPages = pages.filter(p => 
      isAfter(p.createdAt, subDays(now, 28)) && 
      !isAfter(p.createdAt, subDays(now, 14))
    );

    const recentKeywords: Record<string, number> = {};
    recentPages.forEach(p => p.keywords.forEach(k => {
      recentKeywords[k] = (recentKeywords[k] || 0) + 1;
    }));

    const olderKeywords: Record<string, number> = {};
    olderPages.forEach(p => p.keywords.forEach(k => {
      olderKeywords[k] = (olderKeywords[k] || 0) + 1;
    }));

    const allKeywords = new Set([...Object.keys(recentKeywords), ...Object.keys(olderKeywords)]);
    const keywordTrends: KeywordTrend[] = [];

    allKeywords.forEach(keyword => {
      const current = recentKeywords[keyword] || 0;
      const previous = olderKeywords[keyword] || 0;

      if (current === 0 && previous === 0) return;

      let trend: 'rising' | 'falling' | 'stable' | 'new';
      let percentage = 0;

      if (previous === 0 && current > 0) {
        trend = 'new';
        percentage = 100;
      } else if (current > previous * 1.3) {
        trend = 'rising';
        percentage = Math.round(((current - previous) / previous) * 100);
      } else if (current < previous * 0.7) {
        trend = 'falling';
        percentage = Math.round(((previous - current) / previous) * 100);
      } else {
        trend = 'stable';
        percentage = 0;
      }

      if (current > 0 || previous > 1) {
        keywordTrends.push({
          keyword,
          currentCount: current,
          previousCount: previous,
          trend,
          percentage,
        });
      }
    });

    // Sort by relevance (new and rising first, then by count)
    keywordTrends.sort((a, b) => {
      const trendOrder = { new: 0, rising: 1, stable: 2, falling: 3 };
      if (trendOrder[a.trend] !== trendOrder[b.trend]) {
        return trendOrder[a.trend] - trendOrder[b.trend];
      }
      return b.currentCount - a.currentCount;
    });

    // Calculate writing streak
    const sortedPages = [...pages].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    let streakDays = 0;
    if (sortedPages.length > 0) {
      const daysSinceLastPage = differenceInDays(now, sortedPages[0].createdAt);
      if (daysSinceLastPage <= 1) {
        streakDays = 1;
        for (let i = 1; i < sortedPages.length; i++) {
          const daysBetween = differenceInDays(
            sortedPages[i - 1].createdAt, 
            sortedPages[i].createdAt
          );
          if (daysBetween <= 1) {
            streakDays++;
          } else {
            break;
          }
        }
      }
    }

    return {
      periods: periodAnalyses,
      activePeriod,
      keywordTrends: keywordTrends.slice(0, 8),
      streakDays,
      totalPages: pages.length,
    };
  }, [pages]);

  if (pages.length < 2) {
    return null;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
      case 'new':
        return <ArrowUp className="w-3 h-3 text-green-600" />;
      case 'falling':
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'new':
        return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'falling':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main insight card */}
      {analysis.activePeriod && analysis.activePeriod.pageCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-gradient-to-br from-codex-sepia/10 via-codex-cream to-secondary/30 border border-codex-sepia/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-codex-sepia" />
            <span className="text-xs text-codex-sepia font-medium uppercase tracking-wide">
              {analysis.activePeriod.periodLabel}
            </span>
          </div>
          
          <h3 className="font-serif text-lg font-medium mb-2">
            {analysis.activePeriod.topKeywords.length > 0 ? (
              <>
                Je schreef vooral over{' '}
                <span className="text-codex-sepia">
                  {analysis.activePeriod.topKeywords.slice(0, 2).map(k => k.keyword).join(' en ')}
                </span>
              </>
            ) : (
              'Begin met schrijven om patronen te ontdekken'
            )}
          </h3>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {analysis.activePeriod.topKeywords.map((kw, i) => (
              <span 
                key={kw.keyword}
                className={`px-2.5 py-1 rounded-full text-xs border ${
                  i === 0 
                    ? 'bg-codex-sepia/20 border-codex-sepia text-codex-sepia font-medium' 
                    : 'bg-secondary border-border text-foreground/70'
                }`}
              >
                {kw.keyword}
                <span className="ml-1 opacity-60">×{kw.count}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-codex-sepia/10 text-xs text-muted-foreground">
            <span>{analysis.activePeriod.pageCount} pages</span>
            <span>•</span>
            <span className="capitalize">
              Mood: <span className="text-foreground">{analysis.activePeriod.dominantTone}</span>
            </span>
            {analysis.activePeriod.comparedToPrevious !== 'same' && (
              <>
                <span>•</span>
                <span className={analysis.activePeriod.comparedToPrevious === 'more' ? 'text-green-600' : 'text-amber-600'}>
                  {analysis.activePeriod.comparedToPrevious === 'more' ? '↑' : '↓'} vs vorige periode
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Keyword Trends */}
      {analysis.keywordTrends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="codex-card rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-codex-sepia" />
            <h3 className="font-medium text-sm">Keyword Trends</h3>
            <span className="text-[10px] text-muted-foreground">(laatste 2 weken vs daarvoor)</span>
          </div>
          
          <div className="space-y-2">
            {analysis.keywordTrends.map((kw, i) => (
              <motion.div
                key={kw.keyword}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className={`flex items-center justify-between p-2 rounded-lg border ${getTrendColor(kw.trend)}`}
              >
                <div className="flex items-center gap-2">
                  {getTrendIcon(kw.trend)}
                  <span className="text-sm font-medium">{kw.keyword}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="opacity-70">
                    {kw.previousCount} → {kw.currentCount}
                  </span>
                  {kw.trend === 'new' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 text-[10px] font-medium">
                      NIEUW
                    </span>
                  )}
                  {kw.trend === 'rising' && kw.percentage > 0 && (
                    <span className="text-green-600">+{kw.percentage}%</span>
                  )}
                  {kw.trend === 'falling' && kw.percentage > 0 && (
                    <span className="text-red-500">-{kw.percentage}%</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Period comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="codex-card rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-codex-sepia" />
          <h3 className="font-medium text-sm">Periode Overzicht</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {analysis.periods.map((period, i) => (
            <motion.div
              key={period.periodLabel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className={`p-3 rounded-lg text-center border ${
                period === analysis.activePeriod 
                  ? 'bg-codex-sepia/10 border-codex-sepia/30' 
                  : 'bg-secondary/30 border-border'
              }`}
            >
              <p className="text-lg font-bold text-foreground">{period.pageCount}</p>
              <p className="text-[10px] text-muted-foreground">{period.periodLabel.replace('Afgelopen ', '')}</p>
              {period.pageCount > 0 && period.topKeywords[0] && (
                <p className="text-[9px] text-codex-sepia mt-1 truncate">
                  {period.topKeywords[0].keyword}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Writing streak */}
      {analysis.streakDays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-codex-cream to-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-sm">
                🔥 {analysis.streakDays} {analysis.streakDays === 1 ? 'dag' : 'dagen'} streak!
              </p>
              <p className="text-xs text-muted-foreground">
                Je schrijft regelmatig — blijf doorgaan
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
