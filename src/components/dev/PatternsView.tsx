import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Hash, 
  Layers,
  Sparkles,
  Brain
} from 'lucide-react';
import { Page } from '@/lib/pageService';
import { usePages } from '@/hooks/usePages';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subMonths } from 'date-fns';

interface PatternsViewProps {
  onBack: () => void;
}

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

export function PatternsView({ onBack }: PatternsViewProps) {
  const { pages, isLoading } = usePages();

  const patterns = useMemo(() => {
    if (pages.length === 0) return null;

    // Keyword frequency
    const keywordCount: Record<string, number> = {};
    pages.forEach(p => {
      p.keywords.forEach(k => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
      });
    });

    // Tone frequency
    const toneCount: Record<string, number> = {};
    pages.forEach(p => {
      p.tone.forEach(t => {
        toneCount[t] = (toneCount[t] || 0) + 1;
      });
    });

    // Weekly activity
    const now = new Date();
    const threeMonthsAgo = subMonths(now, 3);
    const weeks = eachWeekOfInterval({ start: threeMonthsAgo, end: now });
    
    const weeklyData = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekPages = pages.filter(p => 
        p.createdAt >= weekStart && p.createdAt <= weekEnd
      );
      return {
        week: format(weekStart, 'MMM d'),
        count: weekPages.length,
        tones: weekPages.flatMap(p => p.tone),
      };
    }).filter(w => w.count > 0);

    // Emerging themes (keywords that appear more in recent pages)
    const recentPages = pages.slice(0, Math.ceil(pages.length / 3));
    const olderPages = pages.slice(Math.ceil(pages.length / 3));
    
    const recentKeywords: Record<string, number> = {};
    recentPages.forEach(p => {
      p.keywords.forEach(k => {
        recentKeywords[k] = (recentKeywords[k] || 0) + 1;
      });
    });

    const olderKeywords: Record<string, number> = {};
    olderPages.forEach(p => {
      p.keywords.forEach(k => {
        olderKeywords[k] = (olderKeywords[k] || 0) + 1;
      });
    });

    const emergingThemes = Object.entries(recentKeywords)
      .filter(([k]) => (recentKeywords[k] || 0) > (olderKeywords[k] || 0))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    return {
      topKeywords: Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topTones: Object.entries(toneCount)
        .sort((a, b) => b[1] - a[1]),
      weeklyData,
      emergingThemes,
      totalPages: pages.length,
    };
  }, [pages]);

  const maxCount = patterns?.topKeywords[0]?.[1] || 1;

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
          
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-codex-sepia" />
            <h1 className="font-serif text-lg font-medium">Patterns</h1>
          </div>
          
          <div className="w-10" />
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground text-center">
            Ontdek thema's en trends in je notities
          </p>
        </div>
      </div>

      {!patterns || pages.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Nog geen patronen</p>
          <p className="text-sm text-muted-foreground/70">
            Voeg meer pagina's toe om patronen te ontdekken
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-br from-codex-cream to-secondary/50 border border-codex-sepia/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-codex-sepia" />
              <span className="text-sm font-medium">Overzicht</span>
            </div>
            <p className="text-2xl font-serif font-bold text-foreground mb-1">
              {patterns.totalPages} pagina's
            </p>
            <p className="text-xs text-muted-foreground">
              {patterns.topKeywords.length} unieke thema's · {patterns.topTones.length} stemmingen
            </p>
          </motion.div>

          {/* Keyword Cloud */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="codex-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-codex-sepia" />
              <h3 className="font-medium text-sm">Top Thema's</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {patterns.topKeywords.map(([keyword, count], index) => {
                const size = 0.75 + (count / maxCount) * 0.5;
                return (
                  <motion.span
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="px-3 py-1.5 rounded-full bg-secondary border border-border cursor-default"
                    style={{ fontSize: `${size}rem` }}
                  >
                    {keyword}
                    <span className="text-muted-foreground ml-1 text-xs">
                      {count}×
                    </span>
                  </motion.span>
                );
              })}
            </div>
          </motion.div>

          {/* Tone Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="codex-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-codex-sepia" />
              <h3 className="font-medium text-sm">Stemming Verdeling</h3>
            </div>
            <div className="space-y-3">
              {patterns.topTones.map(([tone, count]) => {
                const totalTones = patterns.topTones.reduce((acc, [, c]) => acc + c, 0);
                const percentage = Math.round((count / totalTones) * 100);
                return (
                  <div key={tone}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`tone-chip text-xs ${getToneClass(tone)}`}>
                        {tone}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-full bg-codex-sepia/60 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Weekly Activity */}
          {patterns.weeklyData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="codex-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-codex-sepia" />
                <h3 className="font-medium text-sm">Activiteit per Week</h3>
              </div>
              <div className="flex items-end gap-1 h-24">
                {patterns.weeklyData.slice(-8).map((week, index) => {
                  const maxWeekCount = Math.max(...patterns.weeklyData.map(w => w.count));
                  const height = (week.count / maxWeekCount) * 100;
                  return (
                    <motion.div
                      key={week.week}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex-1 bg-codex-sepia/40 rounded-t-sm min-h-[4px] relative group"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {week.count}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {patterns.weeklyData.slice(-8)[0]?.week}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {patterns.weeklyData.slice(-1)[0]?.week}
                </span>
              </div>
            </motion.div>
          )}

          {/* Emerging Themes */}
          {patterns.emergingThemes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="codex-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="font-medium text-sm">Opkomende Thema's</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Deze thema's komen vaker voor in je recente notities
              </p>
              <div className="flex flex-wrap gap-2">
                {patterns.emergingThemes.map((theme, index) => (
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs border border-green-200"
                  >
                    ↑ {theme}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Coming Soon: Threads */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl border border-dashed border-border bg-secondary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-sm text-muted-foreground">Threads</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Coming in v2
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ontdek langetermijn thema's die maanden of jaren overspannen.
              AI zal terugkerende ideeën en verbanden automatisch herkennen.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
