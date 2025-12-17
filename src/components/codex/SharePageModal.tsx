import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Mail, Instagram, Loader2, Sparkles, ChevronDown, ChevronUp, Search, MessageCircle, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Page } from '@/lib/pageService';

interface ShareContent {
  quote: string;
  lesson: string;
  idea: string;
  caption: string;
}

interface ScoredSentence {
  text: string;
  score: number;
}

interface SharePageModalProps {
  page: Page;
  isOpen: boolean;
  onClose: () => void;
}

type ContentFormat = 'quote' | 'lesson' | 'idea' | 'caption';

const FORMAT_CONFIG: Record<ContentFormat, { 
  label: string; 
  icon: React.ReactNode; 
  platform: string;
  description: string;
}> = {
  quote: { 
    label: 'Quote', 
    icon: <Pin className="w-4 h-4" />, 
    platform: 'Pinterest',
    description: 'Inspiring quote'
  },
  lesson: { 
    label: 'Message', 
    icon: <MessageCircle className="w-4 h-4" />, 
    platform: 'WhatsApp',
    description: 'Personal share'
  },
  idea: { 
    label: 'Idea', 
    icon: <Mail className="w-4 h-4" />, 
    platform: 'Newsletter',
    description: '100-150 words'
  },
  caption: { 
    label: 'Caption', 
    icon: <Instagram className="w-4 h-4" />, 
    platform: 'Instagram',
    description: '2-3 sentences'
  },
};

export function SharePageModal({ page, isOpen, onClose }: SharePageModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<ShareContent | null>(null);
  const [editedContent, setEditedContent] = useState<ShareContent | null>(null);
  const [allSentences, setAllSentences] = useState<ScoredSentence[]>([]);
  const [showAllSentences, setShowAllSentences] = useState(false);
  const [sentenceSearch, setSentenceSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('quote');
  const [copiedFormat, setCopiedFormat] = useState<ContentFormat | null>(null);

  // Filter sentences by search term
  const filteredSentences = allSentences.filter(s => 
    s.text.toLowerCase().includes(sentenceSearch.toLowerCase())
  );

  // Highlight keywords in text
  const highlightKeywords = (text: string) => {
    const keywords = page.keywords || [];
    if (keywords.length === 0) return text;
    
    // Create regex pattern for all keywords (case insensitive)
    const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(pattern);
    
    return parts.map((part, i) => {
      const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return <span key={i} className="bg-codex-gold/30 text-codex-gold px-0.5 rounded">{part}</span>;
      }
      return part;
    });
  };

  const generateContent = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-share-content', {
        body: {
          summary: page.summary,
          ocrText: page.ocrText,
          keywords: page.keywords,
          tone: page.tone,
        }
      });

      if (error) {
        console.error('[SharePageModal] Error:', error);
        toast.error('Failed to extract content');
        return;
      }

      if (data?.success && data?.content) {
        setContent(data.content);
        setEditedContent(data.content);
        setAllSentences(data.allSentences || []);
        console.log('[SharePageModal] Content extracted successfully, found', data.allSentences?.length || 0, 'sentences');
      } else {
        toast.error(data?.error || 'Failed to extract content');
      }
    } catch (err) {
      console.error('[SharePageModal] Exception:', err);
      toast.error('Failed to extract content');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSentence = (sentence: string) => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      [selectedFormat]: sentence,
    });
    toast.success('Sentence selected');
  };

  const handleCopy = async (format: ContentFormat) => {
    const text = editedContent?.[format];
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      toast.success(`${FORMAT_CONFIG[format].label} copied!`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async (format: ContentFormat) => {
    const text = editedContent?.[format];
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({
          text,
          title: 'Shared from Umarise',
        });
        console.log('[SharePageModal] Shared via Web Share API:', format);
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          handleCopy(format);
        }
      }
    } else {
      handleCopy(format);
    }
  };

  const handleContentEdit = (format: ContentFormat, value: string) => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      [format]: value,
    });
  };

  const currentContent = editedContent?.[selectedFormat] || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-codex-ink-deep/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-gradient-to-b from-codex-forest-deep to-codex-ink-deep rounded-2xl border border-codex-gold/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-codex-gold/10">
              <div>
                <h2 className="text-lg font-serif text-codex-cream">Share this page</h2>
                <p className="text-xs text-codex-cream/50 mt-0.5 italic">
                  With every written word you choose to influence yourself and others.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-codex-cream/60 hover:text-codex-cream"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              {!content ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-codex-gold/40 mx-auto mb-4" />
                  <p className="text-codex-cream/70 mb-4">
                    Generate content formats from your handwritten page
                  </p>
                  <Button
                    onClick={generateContent}
                    disabled={isGenerating}
                    className="bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Format tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {(Object.keys(FORMAT_CONFIG) as ContentFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                          selectedFormat === format
                            ? 'bg-codex-gold/20 text-codex-gold border border-codex-gold/30'
                            : 'bg-codex-ink-deep/50 text-codex-cream/60 hover:text-codex-cream border border-transparent'
                        }`}
                      >
                        {FORMAT_CONFIG[format].icon}
                        <span>{FORMAT_CONFIG[format].label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected format content */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-codex-cream/50">
                        {FORMAT_CONFIG[selectedFormat].platform} • {FORMAT_CONFIG[selectedFormat].description}
                      </span>
                      <span className="text-xs text-codex-cream/40">
                        {currentContent.length} chars
                      </span>
                    </div>
                    
                    <Textarea
                      value={currentContent}
                      onChange={(e) => handleContentEdit(selectedFormat, e.target.value)}
                      className="min-h-[120px] bg-codex-ink-deep/50 border-codex-gold/20 text-codex-cream resize-none"
                      placeholder="Select a sentence or edit here..."
                    />

                    {/* All sentences preview */}
                    {allSentences.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setShowAllSentences(!showAllSentences)}
                          className="flex items-center gap-2 text-xs text-codex-cream/50 hover:text-codex-cream transition-colors"
                        >
                          {showAllSentences ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {allSentences.length} sentences found in your text
                        </button>
                        
                        <AnimatePresence>
                          {showAllSentences && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              {/* Search input */}
                              <div className="mt-2 mb-2 relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-codex-cream/40" />
                                <Input
                                  value={sentenceSearch}
                                  onChange={(e) => setSentenceSearch(e.target.value)}
                                  placeholder="Search sentences..."
                                  className="pl-7 h-8 text-xs bg-codex-ink-deep/50 border-codex-gold/20 text-codex-cream placeholder:text-codex-cream/30"
                                />
                              </div>

                              <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                                {filteredSentences.length === 0 ? (
                                  <p className="text-xs text-codex-cream/40 py-2 text-center">
                                    No sentences match "{sentenceSearch}"
                                  </p>
                                ) : (
                                  filteredSentences.map((s, i) => (
                                    <button
                                      key={i}
                                      onClick={() => selectSentence(s.text)}
                                      className="w-full text-left p-2 rounded-lg text-sm text-codex-cream/70 hover:text-codex-cream hover:bg-codex-gold/10 transition-colors border border-transparent hover:border-codex-gold/20"
                                    >
                                      <span className="line-clamp-2">{highlightKeywords(s.text)}</span>
                                      <span className="text-xs text-codex-cream/30 ml-2">
                                        ({s.text.length} chars)
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(selectedFormat)}
                        variant="outline"
                        className="flex-1 border-codex-gold/30 text-codex-cream hover:bg-codex-gold/10"
                      >
                        {copiedFormat === selectedFormat ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleShare(selectedFormat)}
                        className="flex-1 bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    {/* Direct platform links */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          const url = `https://wa.me/?text=${encodeURIComponent(currentContent)}`;
                          window.open(url, '_blank');
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-codex-gold/20 text-codex-cream/70 hover:bg-codex-gold/10 hover:text-codex-cream"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={() => {
                          const url = `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(currentContent)}`;
                          window.open(url, '_blank', 'width=600,height=600');
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-codex-gold/20 text-codex-cream/70 hover:bg-codex-gold/10 hover:text-codex-cream"
                      >
                        <Pin className="w-4 h-4 mr-2" />
                        Pinterest
                      </Button>
                    </div>
                  </div>

                  {/* Regenerate */}
                  <div className="mt-4 pt-4 border-t border-codex-gold/10">
                    <Button
                      onClick={generateContent}
                      disabled={isGenerating}
                      variant="ghost"
                      size="sm"
                      className="text-codex-cream/50 hover:text-codex-cream"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Regenerate all
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
