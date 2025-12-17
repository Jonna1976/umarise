import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Page } from '@/lib/pageService';

interface InsightsSectionProps {
  pages: Page[];
}

function getToneClass(tone: string): string {
  const toneMap: Record<string, string> = {
    grateful: 'tone-hopeful',
    happy: 'tone-playful',
    energetic: 'tone-focused',
    peaceful: 'tone-reflective',
    excited: 'tone-playful',
    nostalgic: 'tone-reflective',
    determined: 'tone-focused',
    curious: 'tone-hopeful',
    anxious: 'tone-overwhelmed',
    frustrated: 'tone-frustrated',
    hopeful: 'tone-hopeful',
    tender: 'tone-reflective',
    restless: 'tone-overwhelmed',
    melancholic: 'tone-frustrated',
    playful: 'tone-playful',
    focused: 'tone-focused',
    overwhelmed: 'tone-overwhelmed',
    reflective: 'tone-reflective',
  };
  return toneMap[tone.toLowerCase()] || 'bg-muted text-muted-foreground';
}

export function InsightsSection({ pages }: InsightsSectionProps) {
  const insights = useMemo(() => {
    if (pages.length === 0) return null;

    // Count keywords
    const keywordCount: Record<string, number> = {};
    pages.forEach(p => {
      p.keywords.forEach(k => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
      });
    });

    // Count tones
    const toneCount: Record<string, number> = {};
    pages.forEach(p => {
      p.tone.forEach(t => {
        toneCount[t] = (toneCount[t] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topTone = Object.entries(toneCount)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      topKeywords,
      topTone: topTone ? { name: topTone[0], count: topTone[1] } : null,
      totalPages: pages.length,
    };
  }, [pages]);

  if (!insights || pages.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-codex-cream to-secondary/50 border border-codex-sepia/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-codex-sepia" />
        <h3 className="text-sm font-medium text-foreground">AI Hypotheses</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {insights.totalPages} pages
        </span>
      </div>

      {/* Top Keywords */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
          Top Themes
        </p>
        <div className="flex flex-wrap gap-1.5">
          {insights.topKeywords.map(([keyword, count], index) => (
            <span
              key={keyword}
              className="px-2 py-1 rounded-full text-xs bg-background/80 border border-border"
              style={{ opacity: 1 - index * 0.12 }}
            >
              {keyword}
              <span className="text-muted-foreground ml-1">×{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dominant Tone */}
      {insights.topTone && (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Dominant mood:</p>
          <span className={`tone-chip text-[10px] ${getToneClass(insights.topTone.name)}`}>
            {insights.topTone.name}
          </span>
          <span className="text-xs text-muted-foreground">
            ({Math.round((insights.topTone.count / (pages.length * 1.5)) * 100)}%)
          </span>
        </div>
      )}
    </motion.div>
  );
}
