/**
 * Early Insights Component
 * 
 * Shows immediate connections and patterns even with just 2-3 pages.
 * Designed to give users the "aha moment" as early as possible.
 */

import { motion } from 'framer-motion';
import { Zap, Link2, Sparkles, TrendingUp } from 'lucide-react';
import type { Page } from '@/lib/abstractions/types';
import { useMemo } from 'react';

interface EarlyInsightsProps {
  pages: Page[];
  latestPage?: Page;
}

interface Connection {
  keyword: string;
  count: number;
  pages: Page[];
}

interface TonePattern {
  tone: string;
  count: number;
  trend: 'stable' | 'emerging';
}

export function EarlyInsights({ pages, latestPage }: EarlyInsightsProps) {
  const insights = useMemo(() => {
    if (pages.length < 2) return null;

    // Find keyword connections (keywords that appear in multiple pages)
    const keywordMap = new Map<string, Page[]>();
    pages.forEach(page => {
      page.keywords.forEach(keyword => {
        const existing = keywordMap.get(keyword.toLowerCase()) || [];
        existing.push(page);
        keywordMap.set(keyword.toLowerCase(), existing);
      });
    });

    const connections: Connection[] = [];
    keywordMap.forEach((connectedPages, keyword) => {
      if (connectedPages.length >= 2) {
        connections.push({
          keyword,
          count: connectedPages.length,
          pages: connectedPages,
        });
      }
    });
    connections.sort((a, b) => b.count - a.count);

    // Find tone patterns
    const toneMap = new Map<string, number>();
    pages.forEach(page => {
      page.tone.forEach(t => {
        toneMap.set(t.toLowerCase(), (toneMap.get(t.toLowerCase()) || 0) + 1);
      });
    });

    const tonePatterns: TonePattern[] = [];
    toneMap.forEach((count, tone) => {
      if (count >= 2) {
        tonePatterns.push({
          tone,
          count,
          trend: count >= Math.ceil(pages.length * 0.5) ? 'stable' : 'emerging',
        });
      }
    });
    tonePatterns.sort((a, b) => b.count - a.count);

    // Check if latest page connects to existing themes
    const latestConnections: string[] = [];
    if (latestPage) {
      latestPage.keywords.forEach(kw => {
        if (keywordMap.get(kw.toLowerCase())?.length && keywordMap.get(kw.toLowerCase())!.length > 1) {
          latestConnections.push(kw);
        }
      });
    }

    return {
      connections: connections.slice(0, 3),
      tonePatterns: tonePatterns.slice(0, 2),
      latestConnections,
      totalKeywords: new Set(pages.flatMap(p => p.keywords.map(k => k.toLowerCase()))).size,
    };
  }, [pages, latestPage]);

  if (!insights || pages.length < 2) return null;

  const hasConnections = insights.connections.length > 0;
  const hasPatterns = insights.tonePatterns.length > 0;
  const hasLatestConnections = insights.latestConnections.length > 0;

  if (!hasConnections && !hasPatterns) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-codex-gold/10 border border-purple-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-foreground">Early Patterns Detected</span>
      </div>

      {/* Latest page connection highlight */}
      {hasLatestConnections && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-3 p-3 rounded-xl bg-codex-gold/10 border border-codex-gold/30"
        >
          <div className="flex items-center gap-2 text-codex-gold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>This page connects to your existing themes:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {insights.latestConnections.map(kw => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full text-xs bg-codex-gold/20 text-codex-gold font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Keyword connections */}
      {hasConnections && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link2 className="w-3 h-3" />
            <span>Recurring themes across pages:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.connections.map(conn => (
              <motion.div
                key={conn.keyword}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary"
              >
                <span className="text-sm text-foreground">{conn.keyword}</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {conn.count}×
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tone patterns */}
      {hasPatterns && (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Your writing mood:</span>
          </div>
          <div className="flex gap-2">
            {insights.tonePatterns.map(pattern => (
              <span
                key={pattern.tone}
                className={`px-2.5 py-1 rounded-full text-sm capitalize ${
                  pattern.trend === 'stable' 
                    ? 'bg-tone-focused/20 text-tone-focused' 
                    : 'bg-tone-hopeful/20 text-tone-hopeful'
                }`}
              >
                {pattern.tone}
                {pattern.trend === 'stable' && ' (consistent)'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Encouraging stat */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 pt-3 border-t border-border/50 text-center"
      >
        <span className="text-xs text-muted-foreground">
          {insights.totalKeywords} unique ideas captured • 
          {insights.connections.length > 0 && ` ${insights.connections.length} emerging threads`}
        </span>
      </motion.div>
    </motion.div>
  );
}
