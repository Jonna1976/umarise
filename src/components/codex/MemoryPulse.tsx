import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '@/lib/pageService';

interface MemoryPulseProps {
  pages: Page[];
  onSelectPage?: (page: Page) => void;
}

/**
 * Memory Pulse - A subtle daily reminder from your writing
 * Shows one meaningful fragment from recent pages
 */
export function MemoryPulse({ pages, onSelectPage }: MemoryPulseProps) {
  const [pulse, setPulse] = useState<string | null>(null);
  const [sourceDate, setSourceDate] = useState<Date | null>(null);
  const [sourcePage, setSourcePage] = useState<Page | null>(null);

  useEffect(() => {
    if (pages.length === 0) {
      setPulse(null);
      setSourcePage(null);
      return;
    }

    // Get a meaningful fragment from recent pages
    const fragment = selectPulseFragment(pages);
    if (fragment) {
      setPulse(fragment.text);
      setSourceDate(fragment.date);
      setSourcePage(fragment.page);
    }
  }, [pages]);

  if (!pulse) return null;

  const handleClick = () => {
    if (sourcePage && onSelectPage) {
      onSelectPage(sourcePage);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="px-6 py-4"
      >
        <div className="text-center space-y-2">
          <motion.p
            className={`text-base font-serif text-foreground/80 italic leading-relaxed ${
              onSelectPage ? 'cursor-pointer hover:text-primary transition-colors' : ''
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onClick={handleClick}
            title={onSelectPage ? 'Click to view this page' : undefined}
          >
            "{pulse}"
          </motion.p>
          {sourceDate && (
            <motion.p
              className={`text-xs text-muted-foreground/50 ${
                onSelectPage ? 'cursor-pointer hover:text-muted-foreground transition-colors' : ''
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              onClick={handleClick}
            >
              — {formatRelativeDate(sourceDate)}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface PulseFragment {
  text: string;
  date: Date;
  page: Page;
}

function selectPulseFragment(pages: Page[]): PulseFragment | null {
  // Prioritize: highlights > one_line_hint > first sentence of summary
  const candidates: PulseFragment[] = [];

  // Sort by recency
  const sortedPages = [...pages].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Take from recent 10 pages
  const recentPages = sortedPages.slice(0, 10);

  for (const page of recentPages) {
    // Highlights are best - user-marked important
    if (page.highlights && page.highlights.length > 0) {
      for (const highlight of page.highlights) {
        if (highlight && highlight.length > 10 && highlight.length < 150) {
          candidates.push({ text: cleanFragment(highlight), date: page.createdAt, page });
        }
      }
    }

    // One-line hints are good
    if (page.oneLineHint && page.oneLineHint.length > 10 && page.oneLineHint.length < 150) {
      candidates.push({ text: cleanFragment(page.oneLineHint), date: page.createdAt, page });
    }

    // Summary first sentence
    if (page.summary) {
      const firstSentence = extractFirstSentence(page.summary);
      if (firstSentence && firstSentence.length > 15 && firstSentence.length < 150) {
        candidates.push({ text: cleanFragment(firstSentence), date: page.createdAt, page });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Use a daily seed so the same pulse shows throughout the day
  const today = new Date().toDateString();
  const dailySeed = hashCode(today);
  const index = Math.abs(dailySeed) % candidates.length;

  return candidates[index];
}

function extractFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.split('\n')[0].trim();
}

function cleanFragment(text: string): string {
  // Remove quotes if already present
  let cleaned = text.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
