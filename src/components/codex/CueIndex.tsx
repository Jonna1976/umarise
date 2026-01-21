import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Tag, Calendar, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Page } from '@/lib/pageService';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface CuePair {
  cues: string[]; // The cue pair as assigned (e.g., ["Marco", "funding"])
  displayLabel: string; // Combined display (e.g., "Marco, funding")
  pageCount: number;
  latestDate: Date;
  pages: Page[];
}

interface CueIndexProps {
  pages: Page[];
  onClose: () => void;
  onSelectPage: (page: Page) => void;
}

/**
 * CueIndex - Alphabetical browsable list of all user-assigned cue pairs
 * Shows cue pairs with their assigned dates, linking directly to origins
 */
export function CueIndex({ pages, onClose, onSelectPage }: CueIndexProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedCue, setExpandedCue] = useState<string | null>(null);

  // Group pages by their cue pairs
  const cuePairs = useMemo(() => {
    const cueMap = new Map<string, CuePair>();

    pages.forEach((page) => {
      const cues = page.futureYouCues || [];
      if (cues.length === 0) return;

      // Create a consistent key from sorted cues
      const sortedCues = [...cues].sort();
      const key = sortedCues.join('|').toLowerCase();
      const displayLabel = cues.join(', ');

      const existing = cueMap.get(key);
      if (existing) {
        existing.pageCount++;
        existing.pages.push(page);
        if (page.createdAt > existing.latestDate) {
          existing.latestDate = page.createdAt;
        }
      } else {
        cueMap.set(key, {
          cues,
          displayLabel,
          pageCount: 1,
          latestDate: page.createdAt,
          pages: [page],
        });
      }
    });

    // Sort alphabetically by display label
    return Array.from(cueMap.values()).sort((a, b) =>
      a.displayLabel.toLowerCase().localeCompare(b.displayLabel.toLowerCase())
    );
  }, [pages]);

  // Filter cue pairs by search
  const filteredCuePairs = useMemo(() => {
    if (!searchFilter.trim()) return cuePairs;

    const term = searchFilter.toLowerCase().trim();
    return cuePairs.filter((pair) =>
      pair.displayLabel.toLowerCase().includes(term)
    );
  }, [cuePairs, searchFilter]);

  // Group by first letter for alphabet navigation
  const groupedByLetter = useMemo(() => {
    const groups = new Map<string, CuePair[]>();

    filteredCuePairs.forEach((pair) => {
      const firstChar = pair.displayLabel.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';

      const existing = groups.get(letter) || [];
      existing.push(pair);
      groups.set(letter, existing);
    });

    // Sort keys alphabetically, with '#' at the end
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((letter) => ({
      letter,
      pairs: groups.get(letter) || [],
    }));
  }, [filteredCuePairs]);

  const handleCueClick = (pair: CuePair) => {
    if (pair.pageCount === 1) {
      // Direct navigation if only one page
      onSelectPage(pair.pages[0]);
    } else {
      // Expand to show all pages
      setExpandedCue(expandedCue === pair.displayLabel ? null : pair.displayLabel);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onClose}
            className="p-3 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-medium text-foreground">Cue Index</h1>
            <p className="text-xs text-muted-foreground">
              {cuePairs.length} cue pairs across {pages.length} origins
            </p>
          </div>
        </div>

        {/* Search filter */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter cues..."
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {groupedByLetter.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchFilter ? 'No cues match your filter' : 'No cues assigned yet'}
            </p>
          </div>
        ) : (
          groupedByLetter.map(({ letter, pairs }) => (
            <div key={letter} className="border-b border-border/50 last:border-0">
              {/* Letter header */}
              <div className="sticky top-[120px] bg-muted/80 backdrop-blur-sm px-4 py-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  {letter}
                </span>
              </div>

              {/* Cue pairs */}
              <div className="divide-y divide-border/30">
                {pairs.map((pair) => (
                  <div key={pair.displayLabel}>
                    <button
                      onClick={() => handleCueClick(pair)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="font-medium text-foreground truncate">
                              {pair.displayLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(pair.latestDate, 'd MMM yyyy', { locale: nl })}
                            </span>
                            {pair.pageCount > 1 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {pair.pageCount} pages
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                            expandedCue === pair.displayLabel ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded pages list */}
                    <AnimatePresence>
                      {expandedCue === pair.displayLabel && pair.pageCount > 1 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-muted/20"
                        >
                          <div className="divide-y divide-border/20">
                            {pair.pages.map((page) => (
                              <button
                                key={page.id}
                                onClick={() => onSelectPage(page)}
                                className="w-full text-left px-8 py-2.5 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                                    <img
                                      src={page.thumbnailUri || page.imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">
                                      {page.oneLineHint || page.summary?.split('.')[0] || 'Origin'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(page.createdAt, 'd MMM yyyy', { locale: nl })}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
