import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Page } from '@/lib/pageService';
import { Input } from '@/components/ui/input';

interface VocabularySectionProps {
  pages: Page[];
}

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

// Common words to filter out (stopwords)
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
  'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their', 'mine', 'yours',
  'hers', 'ours', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once', 'if',
  'about', 'after', 'before', 'between', 'into', 'through', 'during', 'above',
  'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'as', 'until', 'while', 'any', 'because', 'even', 'get', 'got',
  'like', 'one', 'two', 'make', 'made', 'think', 'know', 'see', 'come', 'go',
  'went', 'take', 'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'seem',
  'feel', 'try', 'leave', 'call', 'good', 'new', 'first', 'last', 'long', 'great',
  'little', 'own', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
  'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able', 'de',
  'het', 'een', 'en', 'van', 'in', 'is', 'dat', 'op', 'te', 'zijn', 'voor',
  'met', 'als', 'maar', 'om', 'ook', 'aan', 'er', 'dan', 'dit', 'die', 'naar',
  'bij', 'nog', 'wel', 'uit', 'kan', 'niet', 'meer', 'over', 'zou', 'door',
  'hun', 'ze', 'worden', 'heeft', 'moet', 'al', 'veel', 'was', 'wordt', 'wat',
  'heb', 'mijn', 'je', 'ik', 'wij', 'jij', 'hij', 'zij', 'ons', 'hebben',
]);

// Minimum word length to include
const MIN_WORD_LENGTH = 3;

export function VocabularySection({ pages }: VocabularySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract and count unique words from all OCR text
  const vocabulary = useMemo(() => {
    const wordCounts: Record<string, number> = {};
    let totalWords = 0;

    pages.forEach(page => {
      if (!page.ocrText) return;
      
      // Extract words: letters only, lowercase
      const words = page.ocrText
        .toLowerCase()
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length >= MIN_WORD_LENGTH && 
          !STOPWORDS.has(word)
        );
      
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        totalWords++;
      });
    });

    // Convert to sorted array
    const sortedWords: WordFrequency[] = Object.entries(wordCounts)
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? (count / totalWords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      words: sortedWords,
      totalUniqueWords: sortedWords.length,
      totalWords,
    };
  }, [pages]);

  // Filter words based on search
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return vocabulary.words.slice(0, 50);
    
    const query = searchQuery.toLowerCase();
    return vocabulary.words
      .filter(w => w.word.includes(query))
      .slice(0, 50);
  }, [vocabulary.words, searchQuery]);

  const maxCount = vocabulary.words[0]?.count || 1;

  if (pages.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border overflow-hidden bg-secondary/20"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-codex-sepia" />
          <span className="font-medium text-sm">My Vocabulary</span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {vocabulary.totalUniqueWords} unique words
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Description */}
              <p className="text-xs text-muted-foreground">
                Words you use most frequently in your handwritten notes. This reflects your natural vocabulary and thinking patterns.
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your vocabulary..."
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Word cloud / list */}
              {filteredWords.length > 0 ? (
                <div className="space-y-4">
                  {/* Top words as visual bars */}
                  <div className="space-y-2">
                    {filteredWords.slice(0, 15).map((item, index) => (
                      <motion.div
                        key={item.word}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-24 text-sm font-medium text-foreground truncate">
                          {item.word}
                        </span>
                        <div className="flex-1 h-5 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / maxCount) * 100}%` }}
                            transition={{ delay: 0.2 + index * 0.02, duration: 0.4 }}
                            className="h-full bg-gradient-to-r from-codex-sepia/60 to-codex-sepia/40 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {item.count}×
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional words as chips */}
                  {filteredWords.length > 15 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">More words:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {filteredWords.slice(15, 50).map((item, index) => (
                          <motion.span
                            key={item.word}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.01 }}
                            className="px-2 py-0.5 text-xs rounded-full bg-secondary border border-border text-muted-foreground"
                            style={{
                              opacity: 0.5 + (item.count / maxCount) * 0.5
                            }}
                          >
                            {item.word}
                            <span className="ml-1 opacity-60">{item.count}</span>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? 'No words found matching your search' : 'No vocabulary data yet'}
                </p>
              )}

              {/* Stats footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Based on {pages.length} pages</span>
                <span>{vocabulary.totalWords.toLocaleString()} total words analyzed</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
