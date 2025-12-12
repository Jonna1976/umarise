import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Hash, 
  Layers,
  Sparkles,
  Brain,
  Compass,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Heart,
  Target
} from 'lucide-react';
import { Page } from '@/lib/pageService';
import { usePages } from '@/hooks/usePages';
import { format, eachWeekOfInterval, subMonths, endOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface PatternsViewProps {
  onBack: () => void;
}

interface RecurringTheme {
  name: string;
  description: string;
  frequency: 'hoog' | 'midden' | 'laag';
}

interface EmotionalTrends {
  overall_direction: 'stabiel' | 'opwaarts' | 'neerwaarts' | 'cyclisch';
  dominant_tone: string;
  description: string;
}

interface AIPatternAnalysis {
  core_thread: string;
  recurring_themes: RecurringTheme[];
  emotional_trends: EmotionalTrends;
  insights: string[];
  suggestions: string[];
  page_count: number;
  analyzed_at: string;
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

function getDirectionIcon(direction: string) {
  switch (direction) {
    case 'opwaarts': return '↗';
    case 'neerwaarts': return '↘';
    case 'cyclisch': return '↻';
    default: return '→';
  }
}

function getFrequencyColor(frequency: string) {
  switch (frequency) {
    case 'hoog': return 'bg-codex-sepia/20 border-codex-sepia text-codex-sepia';
    case 'midden': return 'bg-secondary border-border text-foreground';
    case 'laag': return 'bg-muted border-muted-foreground/30 text-muted-foreground';
    default: return 'bg-secondary border-border text-foreground';
  }
}

export function PatternsView({ onBack }: PatternsViewProps) {
  const { pages, isLoading: pagesLoading } = usePages();
  const [aiAnalysis, setAiAnalysis] = useState<AIPatternAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Basic statistics computed locally
  const basicPatterns = useMemo(() => {
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

    return {
      topKeywords: Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topTones: Object.entries(toneCount)
        .sort((a, b) => b[1] - a[1]),
      weeklyData,
      totalPages: pages.length,
    };
  }, [pages]);

  const runAIAnalysis = async () => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      toast.error('Device ID niet gevonden');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-patterns', {
        body: { device_user_id: deviceId }
      });

      if (error) {
        console.error('Analysis error:', error);
        setAnalysisError(error.message || 'Analyse mislukt');
        toast.error('Patroonanalyse mislukt');
        return;
      }

      if (data.error) {
        setAnalysisError(data.error);
        if (data.page_count !== undefined) {
          toast.error(`Je hebt ${data.page_count} pagina's - minimaal 3 nodig voor analyse`);
        } else {
          toast.error(data.error);
        }
        return;
      }

      setAiAnalysis(data);
      toast.success('Patroonanalyse voltooid');
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError('Er ging iets mis');
      toast.error('Er ging iets mis bij de analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis on mount if we have enough pages
  useEffect(() => {
    if (!pagesLoading && pages.length >= 3 && !aiAnalysis && !isAnalyzing) {
      runAIAnalysis();
    }
  }, [pagesLoading, pages.length]);

  const maxCount = basicPatterns?.topKeywords[0]?.[1] || 1;

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
            <h1 className="font-serif text-lg font-medium">Patronen</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={runAIAnalysis}
            disabled={isAnalyzing || pages.length < 3}
            className="w-10 h-10"
          >
            <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground text-center">
            AI-analyse van thema's, trends en rode draad
          </p>
        </div>
      </div>

      {!basicPatterns || pages.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Nog geen patronen</p>
          <p className="text-sm text-muted-foreground/70">
            Voeg pagina's toe om patronen te ontdekken
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* AI Analysis Loading State */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-codex-cream to-secondary/50 border border-codex-sepia/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-codex-sepia/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-codex-sepia animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI analyseert je notities...</p>
                  <p className="text-xs text-muted-foreground">
                    {basicPatterns.totalPages} pagina's worden verwerkt
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analysis Error */}
          {analysisError && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Analyse niet beschikbaar</span>
              </div>
              <p className="text-xs text-muted-foreground">{analysisError}</p>
              {pages.length < 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Je hebt minimaal 3 pagina's nodig voor AI-patroonanalyse.
                </p>
              )}
            </motion.div>
          )}

          {/* Core Thread / Rode Draad */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-gradient-to-br from-codex-sepia/10 via-codex-cream to-secondary/30 border border-codex-sepia/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-5 h-5 text-codex-sepia" />
                <h3 className="font-serif font-medium">De Rode Draad</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {aiAnalysis.core_thread}
              </p>
              <p className="text-[10px] text-muted-foreground mt-3">
                Gebaseerd op {aiAnalysis.page_count} pagina's
              </p>
            </motion.div>
          )}

          {/* Recurring Themes */}
          {aiAnalysis && aiAnalysis.recurring_themes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="codex-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-codex-sepia" />
                <h3 className="font-medium text-sm">Terugkerende Thema's</h3>
              </div>
              <div className="space-y-3">
                {aiAnalysis.recurring_themes.map((theme, index) => (
                  <motion.div
                    key={theme.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    className={`p-3 rounded-lg border ${getFrequencyColor(theme.frequency)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{theme.name}</span>
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        {theme.frequency}
                      </span>
                    </div>
                    <p className="text-xs opacity-80">{theme.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Emotional Trends */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="codex-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-codex-sepia" />
                <h3 className="font-medium text-sm">Emotionele Trends</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {getDirectionIcon(aiAnalysis.emotional_trends.overall_direction)}
                </span>
                <div>
                  <p className="text-sm font-medium capitalize">
                    {aiAnalysis.emotional_trends.overall_direction}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dominant: {aiAnalysis.emotional_trends.dominant_tone}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {aiAnalysis.emotional_trends.description}
              </p>
            </motion.div>
          )}

          {/* Insights */}
          {aiAnalysis && aiAnalysis.insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="codex-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="font-medium text-sm">Inzichten</h3>
              </div>
              <div className="space-y-2">
                {aiAnalysis.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="flex gap-2 text-sm"
                  >
                    <span className="text-amber-600 shrink-0">•</span>
                    <span className="text-foreground/90">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          {aiAnalysis && aiAnalysis.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm text-muted-foreground">Observaties</h3>
              </div>
              <div className="space-y-2">
                {aiAnalysis.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-xs text-muted-foreground italic">
                    "{suggestion}"
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider */}
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Statistische Overzichten
            </p>
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-secondary/30 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Data Overzicht</span>
            </div>
            <p className="text-2xl font-serif font-bold text-foreground mb-1">
              {basicPatterns.totalPages} pagina's
            </p>
            <p className="text-xs text-muted-foreground">
              {basicPatterns.topKeywords.length} unieke thema's · {basicPatterns.topTones.length} stemmingen
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
              <h3 className="font-medium text-sm">Top Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {basicPatterns.topKeywords.map(([keyword, count], index) => {
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
              {basicPatterns.topTones.map(([tone, count]) => {
                const totalTones = basicPatterns.topTones.reduce((acc, [, c]) => acc + c, 0);
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
          {basicPatterns.weeklyData.length > 0 && (
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
                {basicPatterns.weeklyData.slice(-8).map((week, index) => {
                  const maxWeekCount = Math.max(...basicPatterns.weeklyData.map(w => w.count));
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
                  {basicPatterns.weeklyData.slice(-8)[0]?.week}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {basicPatterns.weeklyData.slice(-1)[0]?.week}
                </span>
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
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ontdek langetermijn thema's die maanden of jaren overspannen.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
