import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target,
  Eye,
  FileText,
  Info,
  ChevronDown,
  ChevronUp
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
  frequency: 'high' | 'medium' | 'low';
}

interface EmotionalTrends {
  overall_direction: 'stable' | 'upward' | 'downward' | 'cyclical';
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

type ViewMode = 'text' | 'visual';

// Tone to color mapping for visualization
const toneColors: Record<string, string> = {
  focused: '#4A7C59',      // Deep green
  hopeful: '#E8B86D',      // Warm gold
  frustrated: '#C65D3B',   // Terracotta
  playful: '#7B68EE',      // Soft purple
  overwhelmed: '#8B4557',  // Dusty rose
  reflective: '#5B7C99',   // Steel blue
  curious: '#D4A574',      // Sandy brown
  determined: '#2F4858',   // Dark teal
  anxious: '#9B8AA0',      // Muted lavender
  calm: '#87A889',         // Sage green
};

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
    case 'upward': return '↗';
    case 'downward': return '↘';
    case 'cyclical': return '↻';
    default: return '→';
  }
}

function getFrequencyColor(frequency: string) {
  switch (frequency) {
    case 'high': return 'bg-codex-sepia/20 border-codex-sepia text-codex-sepia';
    case 'medium': return 'bg-secondary border-border text-foreground';
    case 'low': return 'bg-muted border-muted-foreground/30 text-muted-foreground';
    default: return 'bg-secondary border-border text-foreground';
  }
}

// The Red Thread - Central anchoring visualization
function RedThreadViz({ pages, coreThread }: { pages: Page[]; coreThread?: string }) {
  // Calculate the most recurring keywords to form the "thread"
  const keywordCounts: Record<string, number> = {};
  pages.forEach(p => p.keywords.forEach(k => {
    keywordCounts[k] = (keywordCounts[k] || 0) + 1;
  }));
  
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1]);
  
  const topThread = sortedKeywords.slice(0, 5);
  const totalPages = pages.length;
  
  // Group pages by their connection to the core thread keywords
  const threadKeywords = new Set(topThread.map(([k]) => k));
  const connectedPages = pages.filter(p => 
    p.keywords.some(k => threadKeywords.has(k))
  );
  const connectionStrength = Math.round((connectedPages.length / totalPages) * 100);

  // Calculate emotional center of gravity
  const toneCounts: Record<string, number> = {};
  pages.forEach(p => {
    const tone = p.tone[0]?.toLowerCase() || 'reflective';
    toneCounts[tone] = (toneCounts[tone] || 0) + 1;
  });
  const dominantTone = Object.entries(toneCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'reflective';

  if (pages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No pages to visualize yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* The Core Thread - Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--codex-cream)) 0%, hsl(var(--secondary)) 50%, hsl(var(--codex-cream)) 100%)',
          minHeight: '280px'
        }}
      >
        {/* Subtle radiating lines from center */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="threadGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--codex-sepia))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--codex-sepia))" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="40%" fill="url(#threadGlow)" />
          
          {/* Radiating connection lines */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x2 = 50 + Math.cos(angle) * 45;
            const y2 = 50 + Math.sin(angle) * 45;
            return (
              <motion.line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="hsl(var(--codex-sepia))"
                strokeWidth="0.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
              />
            );
          })}
        </svg>

        {/* Central anchor point */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="relative"
          >
            {/* Outer glow ring */}
            <motion.div 
              className="absolute -inset-8 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, hsl(var(--codex-sepia) / 0.1) 0%, transparent 70%)'
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            
            {/* Inner anchor circle */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-codex-sepia/20 to-codex-sepia/40 border-2 border-codex-sepia/30 flex items-center justify-center shadow-lg">
              <div className="text-center px-2">
                <p className="text-[10px] uppercase tracking-wider text-codex-sepia/70 mb-0.5">Your Thread</p>
                <p className="text-lg font-serif font-medium text-codex-sepia leading-tight">
                  {topThread[0]?.[0] || 'Emerging'}
                </p>
              </div>
            </div>

            {/* Orbiting secondary themes */}
            {topThread.slice(1, 5).map(([keyword, count], i) => {
              const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
              const radius = 80 + (i % 2) * 20;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const size = 0.7 + (count / (topThread[0]?.[1] || 1)) * 0.3;
              
              return (
                <motion.div
                  key={keyword}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px - 30px)`,
                    top: `calc(50% + ${y}px - 15px)`,
                  }}
                >
                  <div 
                    className="px-3 py-1.5 rounded-full bg-background/80 border border-codex-sepia/20 shadow-sm backdrop-blur-sm"
                    style={{ fontSize: `${size}rem` }}
                  >
                    <span className="text-foreground/80">{keyword}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/50 to-transparent">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {connectionStrength}% of your pages connect to this thread
            </span>
            <span className="text-codex-sepia font-medium">
              {totalPages} pages
            </span>
          </div>
        </div>
      </motion.div>

      {/* Core Thread Description (if AI analysis available) */}
      {coreThread && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 rounded-xl bg-gradient-to-r from-codex-cream/50 via-background to-codex-cream/50 border border-codex-sepia/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-codex-sepia/10 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4 text-codex-sepia" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-codex-sepia/60 mb-1.5">The Thread That Runs Through Everything</p>
              <p className="text-sm leading-relaxed text-foreground/90 font-serif italic">
                "{coreThread}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Safe Harbor - Your Ideas Are Here */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-xl bg-secondary/30 border border-border"
      >
        <p className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          Safe Harbor — Your ideas are collected
        </p>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xl font-serif font-bold text-foreground">{totalPages}</p>
            <p className="text-[10px] text-muted-foreground">Pages</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xl font-serif font-bold text-foreground">{sortedKeywords.length}</p>
            <p className="text-[10px] text-muted-foreground">Themes</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xl font-serif font-bold text-codex-sepia capitalize">{dominantTone}</p>
            <p className="text-[10px] text-muted-foreground">Mood</p>
          </div>
        </div>
      </motion.div>

      {/* Timeline: Your Journey */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-4 rounded-xl bg-secondary/30 border border-border"
      >
        <p className="text-xs text-muted-foreground mb-4 font-medium">Your Journey — Emotional Landscape</p>
        
        {/* The thread line with emotional colors */}
        <div className="relative">
          {/* Baseline thread */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-codex-sepia/20" />
          
          <div className="flex items-center gap-0.5 h-20 relative">
            {pages.slice(-40).map((page, i) => {
              const tone = page.tone[0]?.toLowerCase() || 'reflective';
              const color = toneColors[tone] || '#8B7355';
              const height = 20 + Math.random() * 40; // Varied heights for organic feel
              
              return (
                <motion.div
                  key={page.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${height}%`, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.015 }}
                  className="flex-1 rounded-full relative group cursor-pointer"
                  style={{ 
                    backgroundColor: color,
                    opacity: 0.6,
                    minWidth: '4px'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-background border border-border rounded-lg p-2 shadow-lg min-w-[100px]">
                      <p className="text-[10px] font-medium capitalize">{tone}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {format(page.createdAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Thread connection */}
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-codex-sepia/60 via-codex-sepia to-codex-sepia/60"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.5, duration: 1, ease: 'easeOut' }}
            style={{ transform: 'translateY(-50%)' }}
          />
        </div>
        
        <div className="flex justify-between mt-3 text-[10px] text-muted-foreground">
          <span>Beginning</span>
          <span className="text-codex-sepia">← The thread that connects →</span>
          <span>Now</span>
        </div>
      </motion.div>

      {/* Theme Clusters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-4 rounded-xl bg-secondary/30 border border-border"
      >
        <p className="text-xs text-muted-foreground mb-3 font-medium">Theme Clusters — What You Keep Returning To</p>
        
        <div className="flex flex-wrap gap-2">
          {sortedKeywords.slice(0, 15).map(([keyword, count], i) => {
            const isTopThread = i < 3;
            const maxCount = sortedKeywords[0]?.[1] || 1;
            const opacity = 0.4 + (count / maxCount) * 0.6;
            
            return (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.03 }}
                className={`px-3 py-1.5 rounded-full border transition-colors ${
                  isTopThread 
                    ? 'bg-codex-sepia/10 border-codex-sepia/30 text-codex-sepia' 
                    : 'bg-secondary border-border text-foreground/70'
                }`}
                style={{ opacity: isTopThread ? 1 : opacity }}
              >
                <span className="text-xs">{keyword}</span>
                {isTopThread && (
                  <span className="ml-1.5 text-[10px] opacity-60">•</span>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <p className="text-[10px] text-muted-foreground/60 mt-3 italic text-center">
          The highlighted themes form your core thread
        </p>
      </motion.div>

      {/* Reassurance footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center py-4"
      >
        <p className="text-xs text-muted-foreground/60 italic">
          All your ideas are safe. The thread continues.
        </p>
      </motion.div>
    </div>
  );
}

// Transparency Section - How the analysis works
function TransparencySection({ pages, aiAnalysis }: { pages: Page[]; aiAnalysis: AIPatternAnalysis | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSourceData, setShowSourceData] = useState(false);

  // Prepare the source data that was sent to the AI
  const sourceData = useMemo(() => {
    return pages.map((p, index) => ({
      index: index + 1,
      date: format(p.createdAt, 'dd MMM yyyy'),
      summary: p.summary,
      tone: p.tone.join(', '),
      keywords: p.keywords.slice(0, 5).join(', '),
      primary_keyword: p.primaryKeyword || '-'
    }));
  }, [pages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl border border-border overflow-hidden bg-secondary/20"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">How this analysis works</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              {/* Explanation */}
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-codex-sepia font-medium shrink-0">1.</span>
                  <p><strong>Data collection:</strong> We collect the summary, tone, and keywords from each of your {pages.length} pages.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-codex-sepia font-medium shrink-0">2.</span>
                  <p><strong>AI analysis:</strong> This data is sent to our AI (Gemini 2.5 Flash) which looks for patterns, recurring themes, and emotional trends.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-codex-sepia font-medium shrink-0">3.</span>
                  <p><strong>Your words only:</strong> The AI bases its analysis purely on what you wrote — no external data or assumptions.</p>
                </div>
              </div>

              {/* Accuracy note */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Quality depends on:</strong> How accurately your handwriting was read (OCR), and how well your pages were summarized. If something seems off, check your individual page summaries first.
                </p>
              </div>

              {/* Toggle source data */}
              <button
                onClick={() => setShowSourceData(!showSourceData)}
                className="w-full p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <FileText className="w-3.5 h-3.5" />
                {showSourceData ? 'Hide source data' : 'View source data sent to AI'}
                {showSourceData ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Source Data Table */}
              <AnimatePresence>
                {showSourceData && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
                      <table className="w-full text-xs">
                        <thead className="bg-secondary/50 sticky top-0">
                          <tr>
                            <th className="p-2 text-left font-medium text-muted-foreground">#</th>
                            <th className="p-2 text-left font-medium text-muted-foreground">Date</th>
                            <th className="p-2 text-left font-medium text-muted-foreground">Summary</th>
                            <th className="p-2 text-left font-medium text-muted-foreground">Tone</th>
                            <th className="p-2 text-left font-medium text-muted-foreground">Keywords</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sourceData.map((item) => (
                            <tr key={item.index} className="hover:bg-secondary/30">
                              <td className="p-2 text-muted-foreground">{item.index}</td>
                              <td className="p-2 text-muted-foreground whitespace-nowrap">{item.date}</td>
                              <td className="p-2 text-foreground/80 max-w-[180px] truncate" title={item.summary}>{item.summary}</td>
                              <td className="p-2 text-muted-foreground capitalize whitespace-nowrap">{item.tone}</td>
                              <td className="p-2 text-codex-sepia/80 max-w-[150px] truncate" title={item.keywords}>{item.keywords}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
                      This is exactly what the AI received for pattern analysis
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analysis timestamp */}
              {aiAnalysis && (
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  Last analyzed: {format(new Date(aiAnalysis.analyzed_at), 'dd MMM yyyy, HH:mm')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PatternsView({ onBack }: PatternsViewProps) {
  const { pages, isLoading: pagesLoading } = usePages();
  const [aiAnalysis, setAiAnalysis] = useState<AIPatternAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('text');

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
      toast.error('Device ID not found');
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
        setAnalysisError(error.message || 'Analysis failed');
        toast.error('Pattern analysis failed');
        return;
      }

      if (data.error) {
        setAnalysisError(data.error);
        if (data.page_count !== undefined) {
          toast.error(`You have ${data.page_count} pages — minimum 3 needed for analysis`);
        } else {
          toast.error(data.error);
        }
        return;
      }

      setAiAnalysis(data);
      toast.success('Pattern analysis complete');
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError('Something went wrong');
      toast.error('Something went wrong with the analysis');
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
            <h1 className="font-serif text-lg font-medium">Patterns</h1>
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

        {/* View mode toggle */}
        <div className="px-4 pb-3 flex justify-center">
          <div className="inline-flex rounded-full bg-secondary/50 p-1">
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${
                viewMode === 'text' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Text
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${
                viewMode === 'visual' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Visual
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground text-center">
            {viewMode === 'text' 
              ? 'AI analysis of themes, trends and core thread'
              : 'Visual representation of your codex — inspired by data humanism'
            }
          </p>
        </div>
      </div>

      {!basicPatterns || pages.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No patterns yet</p>
          <p className="text-sm text-muted-foreground/70">
            Add pages to discover patterns
          </p>
        </div>
      ) : viewMode === 'visual' ? (
        <div className="p-4">
          <RedThreadViz pages={pages} coreThread={aiAnalysis?.core_thread} />
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
                  <p className="font-medium text-sm">AI is analyzing your notes...</p>
                  <p className="text-xs text-muted-foreground">
                    Processing {basicPatterns.totalPages} pages
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
                <span className="text-sm font-medium text-destructive">Analysis unavailable</span>
              </div>
              <p className="text-xs text-muted-foreground">{analysisError}</p>
              {pages.length < 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  You need at least 3 pages for AI pattern analysis.
                </p>
              )}
            </motion.div>
          )}

          {/* Core Thread */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-gradient-to-br from-codex-sepia/10 via-codex-cream to-secondary/30 border border-codex-sepia/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-5 h-5 text-codex-sepia" />
                <h3 className="font-serif font-medium">The Core Thread</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {aiAnalysis.core_thread}
              </p>
              <p className="text-[10px] text-muted-foreground mt-3">
                Based on {aiAnalysis.page_count} pages
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
                <h3 className="font-medium text-sm">Recurring Themes</h3>
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
                <h3 className="font-medium text-sm">Emotional Trends</h3>
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
                <h3 className="font-medium text-sm">Insights</h3>
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
                <h3 className="font-medium text-sm text-muted-foreground">Observations</h3>
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

          {/* How This Works - Transparency Section */}
          <TransparencySection pages={pages} aiAnalysis={aiAnalysis} />

          {/* Divider */}
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Statistical Overview
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
              <span className="text-sm font-medium text-muted-foreground">Data Overview</span>
            </div>
            <p className="text-2xl font-serif font-bold text-foreground mb-1">
              {basicPatterns.totalPages} pages
            </p>
            <p className="text-xs text-muted-foreground">
              {basicPatterns.topKeywords.length} unique themes · {basicPatterns.topTones.length} moods
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
              <h3 className="font-medium text-sm">Top Themes</h3>
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
              <h3 className="font-medium text-sm">Mood Distribution</h3>
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
                <h3 className="font-medium text-sm">Weekly Activity</h3>
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
              Discover long-term themes spanning months or years.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
