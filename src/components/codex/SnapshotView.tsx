import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown, ChevronUp, Check, Plus, Trash2, BookOpen, Camera, X, Calendar, Tag, User, FileText, Brain, ZoomIn, Share2 } from 'lucide-react';
import { VerifyOriginButton } from './VerifyOriginButton';
import { VaultImage } from '@/components/ui/VaultImage';
import { Page, updatePage, confirmFutureYouCues, getPages } from '@/lib/pageService';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TopicInput } from '@/components/capture/TopicInput';

import { FutureYouCuePrompt } from './FutureYouCuePrompt';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { RelatedPages } from './RelatedPages';
import { findRelatedPages, RelatedPage } from '@/lib/relatedPages';
import { findMatchedPassages, generateHighlightedSegments, TextSegment, CiteResult } from '@/lib/citeToSource';
import { SharePageModal } from './SharePageModal';

// Match info type (passed from SearchView)
export interface SnapshotMatchInfo {
  matchTypes: Array<'cue' | 'text' | 'entity' | 'meaning'>;
  matchedTerms: string[];
}

interface SnapshotViewProps {
  page: Page;
  onClose: () => void;
  onViewHistory: () => void;
  isNewCapture?: boolean;
  onPageUpdate?: (page: Page) => void;
  isDemoMode?: boolean;
  suggestedCues?: string[]; // Cues for new captures (now comes from ProcessingView)
  matchInfo?: SnapshotMatchInfo; // Search match info (when opened from search)
  onNavigateToPage?: (page: Page, matchInfo?: SnapshotMatchInfo) => void; // Navigate to related page
  allPages?: Page[]; // All pages for finding related (optional, will fetch if not provided)
  onSearchCue?: (cue: string) => void; // Navigate to search with cue as query
}

const AVAILABLE_TONES = ['grateful', 'happy', 'energetic', 'peaceful', 'excited', 'nostalgic', 'determined', 'curious', 'anxious', 'frustrated', 'hopeful', 'tender', 'restless', 'melancholic', 'playful', 'focused', 'overwhelmed', 'reflective'];

function getToneClass(tone: string): string {
  const toneMap: Record<string, string> = {
    grateful: 'bg-amber-500/20 text-amber-300',
    happy: 'bg-yellow-500/20 text-yellow-300',
    energetic: 'bg-orange-500/20 text-orange-300',
    peaceful: 'bg-emerald-500/20 text-emerald-300',
    excited: 'bg-pink-500/20 text-pink-300',
    nostalgic: 'bg-purple-500/20 text-purple-300',
    determined: 'bg-red-500/20 text-red-300',
    curious: 'bg-cyan-500/20 text-cyan-300',
    anxious: 'bg-slate-500/20 text-slate-300',
    frustrated: 'bg-rose-500/20 text-rose-300',
    hopeful: 'bg-teal-500/20 text-teal-300',
    tender: 'bg-pink-400/20 text-pink-300',
    restless: 'bg-amber-600/20 text-amber-300',
    melancholic: 'bg-indigo-500/20 text-indigo-300',
    playful: 'bg-lime-500/20 text-lime-300',
    focused: 'bg-blue-500/20 text-blue-300',
    overwhelmed: 'bg-gray-500/20 text-gray-300',
    reflective: 'bg-violet-500/20 text-violet-300',
  };
  return toneMap[tone.toLowerCase()] || 'bg-codex-gold/20 text-codex-gold';
}

export function SnapshotView({ page, onClose, onViewHistory, isNewCapture, onPageUpdate, isDemoMode, suggestedCues, matchInfo, onNavigateToPage, allPages: providedPages, onSearchCue }: SnapshotViewProps) {
  const [showOcrText, setShowOcrText] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showZoomedImage, setShowZoomedImage] = useState(false);
  const [userNote, setUserNote] = useState(page.userNote || '');
  const [primaryKeyword, setPrimaryKeyword] = useState(page.primaryKeyword || '');
  const [ocrText, setOcrText] = useState(page.ocrText || '');
  const [sources, setSources] = useState<string[]>(page.sources || []);
  const [newSource, setNewSource] = useState('');
  const [topic, setTopic] = useState('');
  const [topicProjectId, setTopicProjectId] = useState<string | undefined>(page.projectId);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [userKeywords, setUserKeywords] = useState<string[]>(page.highlights || []);
  const [newUserKeyword, setNewUserKeyword] = useState('');
  const [futureYouCues, setFutureYouCues] = useState<string[]>(page.futureYouCues || []);
  const [newCueInput, setNewCueInput] = useState('');
  const [writtenAt, setWrittenAt] = useState<Date>(page.writtenAt || page.createdAt);
  const [cuesConfirmed, setCuesConfirmed] = useState<boolean>((page.futureYouCues?.length ?? 0) > 0);
  const [isConfirmingCues, setIsConfirmingCues] = useState(false);
  const [tone, setTone] = useState<string[]>(page.tone || []);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [relatedPages, setRelatedPages] = useState<RelatedPage[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Cite-to-source: highlighted passages when opened from search (Layer A)
  const [citeResult, setCiteResult] = useState<CiteResult | null>(null);
  const [highlightedSegments, setHighlightedSegments] = useState<TextSegment[]>([]);

  // Compute highlighted passages when matchInfo is present
  useEffect(() => {
    if (matchInfo && matchInfo.matchedTerms.length > 0 && page.ocrText) {
      const result = findMatchedPassages(page.ocrText, matchInfo.matchedTerms, matchInfo.matchTypes);
      setCiteResult(result);
      
      if (result.passages.length > 0) {
        const segments = generateHighlightedSegments(page.ocrText, result.passages);
        setHighlightedSegments(segments);
        
        // Auto-expand Raw Text when there are highlights to show
        setShowOcrText(true);
        
        console.log('[CiteToSource] Found', result.passages.length, 'passages for terms:', matchInfo.matchedTerms);
      } else if (result.likelySentences && result.likelySentences.length > 0) {
        console.log('[CiteToSource] Meaning match - showing likely sentences');
      }
    } else {
      setCiteResult(null);
      setHighlightedSegments([]);
    }
  }, [matchInfo, page.ocrText]);

  // Initialize futureYouCues from suggestedCues if provided (new capture flow)
  useEffect(() => {
    if (isNewCapture && suggestedCues && suggestedCues.length > 0) {
      setFutureYouCues(suggestedCues);
    }
  }, [isNewCapture, suggestedCues]);
  useEffect(() => {
    async function loadRelatedPages() {
      // Skip for new captures
      if (isNewCapture) return;
      
      try {
        const pages = providedPages || await getPages();
        const related = findRelatedPages(page, pages, 5);
        setRelatedPages(related);
        
        // Track: related_shown (for compounding metrics)
        if (related.length > 0) {
          console.log('[RelatedPages] Showing', related.length, 'related pages for', page.id);
        }
      } catch (error) {
        console.error('[RelatedPages] Failed to load:', error);
      }
    }
    
    loadRelatedPages();
  }, [page.id, isNewCapture, providedPages]);

  // Handle navigation to related page
  const handleRelatedPageClick = async (relatedPage: Page, reasons: RelatedPage['reasons']) => {
    // Track: related_opened (for reuse metrics)
    console.log('[RelatedPages] Opened related page', relatedPage.id, 'reasons:', reasons.map(r => `${r.type}:${r.value}`));
    
    // Save pending changes before navigating
    const ok = await savePendingChanges();
    if (!ok) return;
    
    // Navigate to the related page
    if (onNavigateToPage) {
      // Pass the reason as match info so it shows why this page was opened
      const matchInfo: SnapshotMatchInfo = {
        matchTypes: reasons.map(r => r.type === 'cue' ? 'cue' : r.type === 'entity' ? 'entity' : 'text'),
        matchedTerms: reasons.map(r => r.value),
      };
      onNavigateToPage(relatedPage, matchInfo);
    }
  };

  // Track changes
  useEffect(() => {
    const noteChanged = userNote !== (page.userNote || '');
    const keywordChanged = primaryKeyword !== (page.primaryKeyword || '');
    const ocrChanged = ocrText !== (page.ocrText || '');
    const sourcesChanged = JSON.stringify(sources) !== JSON.stringify(page.sources || []);
    const topicChanged = topicProjectId !== page.projectId;
    const cuesChanged = JSON.stringify(futureYouCues) !== JSON.stringify(page.futureYouCues || []);
    const dateChanged = writtenAt.getTime() !== (page.writtenAt || page.createdAt).getTime();
    const userKeywordsChanged = JSON.stringify(userKeywords) !== JSON.stringify(page.highlights || []);
    const toneChanged = JSON.stringify(tone) !== JSON.stringify(page.tone || []);
    setHasChanges(noteChanged || keywordChanged || ocrChanged || sourcesChanged || topicChanged || cuesChanged || dateChanged || userKeywordsChanged || toneChanged);
  }, [userNote, primaryKeyword, ocrText, sources, topicProjectId, futureYouCues, writtenAt, userKeywords, tone, page.userNote, page.primaryKeyword, page.ocrText, page.sources, page.projectId, page.futureYouCues, page.writtenAt, page.createdAt, page.highlights, page.tone]);


  const buildUpdates = () => {
    const updates: {
      userNote?: string;
      primaryKeyword?: string;
      ocrText?: string;
      sources?: string[];
      projectId?: string;
      futureYouCues?: string[];
      writtenAt?: Date;
      highlights?: string[];
      tone?: string[];
    } = {};

    const noteChanged = userNote !== (page.userNote || '');
    const keywordChanged = primaryKeyword !== (page.primaryKeyword || '');
    const ocrChanged = ocrText !== (page.ocrText || '');
    const sourcesChanged = JSON.stringify(sources) !== JSON.stringify(page.sources || []);
    const topicChanged = topicProjectId !== page.projectId;
    const cuesChanged = JSON.stringify(futureYouCues) !== JSON.stringify(page.futureYouCues || []);
    const dateChanged = writtenAt.getTime() !== (page.writtenAt || page.createdAt).getTime();
    const userKeywordsChanged = JSON.stringify(userKeywords) !== JSON.stringify(page.highlights || []);
    const toneChanged = JSON.stringify(tone) !== JSON.stringify(page.tone || []);

    if (noteChanged) updates.userNote = userNote || undefined;
    if (keywordChanged) updates.primaryKeyword = primaryKeyword || undefined;
    if (ocrChanged) updates.ocrText = ocrText || undefined;
    if (sourcesChanged) updates.sources = sources;
    if (topicChanged) updates.projectId = topicProjectId;
    if (cuesChanged) updates.futureYouCues = futureYouCues.length > 0 ? futureYouCues : undefined;
    if (dateChanged) updates.writtenAt = writtenAt;
    if (userKeywordsChanged) updates.highlights = userKeywords;
    if (toneChanged) updates.tone = tone;

    return updates;
  };

  const handleSave = async () => {
    const updates = buildUpdates();
    if (Object.keys(updates).length === 0) {
      setHasChanges(false);
      return;
    }

    console.log('[SnapshotView] handleSave', {
      pageId: page.id,
      updates,
      currentHighlights: userKeywords,
      pageHighlights: page.highlights,
    });

    setIsSaving(true);
    const success = await updatePage(page.id, updates);
    setIsSaving(false);

    if (success) {
      toast.success('Saved');
      setHasChanges(false);
      if (onPageUpdate) {
        onPageUpdate({
          ...page,
          userNote,
          primaryKeyword,
          ocrText,
          sources,
          projectId: topicProjectId,
          futureYouCues,
          writtenAt,
          highlights: userKeywords,
          tone,
        });
      }
    } else {
      toast.error('Failed to save');
    }
  };

  const savePendingChanges = async (): Promise<boolean> => {
    const updates = buildUpdates();
    if (Object.keys(updates).length === 0) {
      setHasChanges(false);
      return true;
    }

    console.log('[SnapshotView] savePendingChanges', {
      pageId: page.id,
      updates,
      currentHighlights: userKeywords,
      pageHighlights: page.highlights,
    });

    setIsSaving(true);
    const success = await updatePage(page.id, updates);
    setIsSaving(false);

    if (success) {
      toast.success('Changes saved');
      setHasChanges(false);
      if (onPageUpdate) {
        onPageUpdate({
          ...page,
          userNote,
          primaryKeyword,
          ocrText,
          sources,
          projectId: topicProjectId,
          futureYouCues,
          writtenAt,
          highlights: userKeywords,
          tone,
        });
      }
      return true;
    }

    toast.error('Failed to save changes');
    return false;
  };

  // Auto-save before navigating away
  const handleCloseWithSave = async () => {
    const ok = await savePendingChanges();
    if (!ok) return;
    onClose();
  };

  const handleViewHistoryWithSave = async () => {
    const ok = await savePendingChanges();
    if (!ok) return;
    onViewHistory();
  };

  const addSource = () => {
    const trimmed = newSource.trim();
    if (!trimmed) return;
    
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    if (sources.includes(trimmed)) {
      toast.error('This source is already added');
      return;
    }
    
    setSources([...sources, trimmed]);
    setNewSource('');
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const addUserKeyword = async () => {
    const trimmed = newUserKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (userKeywords.includes(trimmed) || page.keywords.map(k => k.toLowerCase()).includes(trimmed)) {
      toast.error('Keyword already exists');
      return;
    }
    if (userKeywords.length >= 3) {
      toast.error('Maximum 3 custom keywords');
      return;
    }

    const next = [...userKeywords, trimmed];
    console.log('[SnapshotView] addUserKeyword', { pageId: page.id, trimmed, next });

    setUserKeywords(next);
    setNewUserKeyword('');

    const success = await updatePage(page.id, { highlights: next });
    if (success) {
      toast.success('Keyword saved');
      onPageUpdate?.({
        ...page,
        userNote,
        primaryKeyword,
        ocrText,
        sources,
        projectId: topicProjectId,
        futureYouCues,
        writtenAt,
        highlights: next,
      });
    } else {
      toast.error('Failed to save keyword');
    }
  };

  const removeUserKeyword = async (keyword: string) => {
    const next = userKeywords.filter(k => k !== keyword);
    console.log('[SnapshotView] removeUserKeyword', { pageId: page.id, keyword, next });

    setUserKeywords(next);

    const success = await updatePage(page.id, { highlights: next });
    if (success) {
      toast.success('Keyword removed');
      onPageUpdate?.({
        ...page,
        userNote,
        primaryKeyword,
        ocrText,
        sources,
        projectId: topicProjectId,
        futureYouCues,
        writtenAt,
        highlights: next,
      });
    } else {
      toast.error('Failed to update keywords');
    }
  };

  // Handle adding a new cue word
  const handleAddCue = async () => {
    const trimmed = newCueInput.trim().toLowerCase();
    if (!trimmed) return;
    if (futureYouCues.length >= 2) {
      toast.error('Maximum 2 words allowed');
      return;
    }
    if (futureYouCues.includes(trimmed)) {
      toast.error('Word already added');
      return;
    }

    const newCues = [...futureYouCues, trimmed].slice(0, 2);
    setFutureYouCues(newCues);
    setNewCueInput('');

    // Save immediately
    const success = await updatePage(page.id, { futureYouCues: newCues });
    if (success) {
      toast.success('Saved');
      onPageUpdate?.({
        ...page,
        futureYouCues: newCues,
      });
    } else {
      toast.error('Failed to save');
    }
  };

  // Handle removing a specific word from cues
  const handleRemoveWord = async (wordToRemove: string) => {
    // Rebuild cues: flatten all words, remove the target, then save as individual words
    const allWords = futureYouCues.flatMap(cue => cue.split(/\s+/).filter(w => w.length > 0));
    const newWords = allWords.filter(w => w.toLowerCase() !== wordToRemove.toLowerCase());
    
    setFutureYouCues(newWords);

    // Save immediately
    const success = await updatePage(page.id, { futureYouCues: newWords.length > 0 ? newWords : undefined });
    if (success) {
      toast.success('Removed');
      onPageUpdate?.({
        ...page,
        futureYouCues: newWords,
      });
    } else {
      toast.error('Failed to save');
    }
  };

  // Handle removing a cue by index (legacy)
  const handleRemoveCue = async (index: number) => {
    const newCues = futureYouCues.filter((_, i) => i !== index);
    setFutureYouCues(newCues);

    // Save immediately
    const success = await updatePage(page.id, { futureYouCues: newCues.length > 0 ? newCues : undefined });
    if (success) {
      toast.success('Removed');
      onPageUpdate?.({
        ...page,
        futureYouCues: newCues,
      });
    } else {
      toast.error('Failed to save');
    }
  };

  // Handle Future You Cue confirmation (inline in SnapshotView)
  const handleCuesConfirmed = async (cues: string[], edited: boolean) => {
    setIsConfirmingCues(true);
    
    try {
      await confirmFutureYouCues(page.id, cues, edited);
      setFutureYouCues(cues);
      setCuesConfirmed(true);
      
      if (onPageUpdate) {
        onPageUpdate({
          ...page,
          futureYouCues: cues,
          futureYouCuesSource: {
            ai_prefill_version: 'v1',
            user_edited: edited
          }
        });
      }
    } catch (error) {
      console.error('Failed to save cues:', error);
      toast.error('Failed to save cues');
    } finally {
      setIsConfirmingCues(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-forest-deep to-codex-ink-deep">
      {/* Header - time, share and save */}
      <div className="sticky top-0 z-10 bg-codex-ink-deep/80 backdrop-blur-md border-b border-codex-gold/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-codex-cream/60 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(page.createdAt, { addSuffix: true })}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Share button - always visible when not a new capture */}
            {!isNewCapture && (
              <Button
                onClick={() => setShowShareModal(true)}
                variant="ghost"
                size="sm"
                className="text-codex-cream/60 hover:text-codex-gold hover:bg-codex-gold/10 h-8"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            )}
            
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep h-8"
              >
                {isSaving ? 'Saving...' : 'Save'}
                {!isSaving && <Check className="w-4 h-4 ml-1" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">

        {/* Habit anchor - "Pen down. Snap." - only for new captures */}
        {isNewCapture && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="text-center text-sm text-codex-cream/60 mb-4 font-serif italic"
          >
            Pen down. Snap.
          </motion.p>
        )}

        {/* Future You Cue prompt - inline for new captures, before other content */}
        {isNewCapture && !isDemoMode && !cuesConfirmed && suggestedCues && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <FutureYouCuePrompt
              suggestedCues={suggestedCues}
              onConfirm={handleCuesConfirmed}
              isSubmitting={isConfirmingCues}
            />
          </motion.div>
        )}

        {/* Success badge for new captures - shown after cues confirmed or in demo mode */}
        {isNewCapture && (cuesConfirmed || isDemoMode) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="font-serif text-xl text-codex-gold tracking-wide">
              Part of your lasting memory
            </h2>
          </motion.div>
        )}

        {/* Future You Cues - ALWAYS show, TOP POSITION, EDITABLE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <p className="text-base text-codex-gold mb-1">
            In 2 words: what is this about?
          </p>
          <p className="text-sm text-codex-cream/50 mb-3">
            These words appear on the spine of this page in your memory.
          </p>
          
          {/* Display existing cues as individual words (max 2) */}
          {(() => {
            // Normalize: split all cues into individual words, take max 2
            const allWords = futureYouCues.flatMap(cue => cue.split(/\s+/).filter(w => w.length > 0)).slice(0, 2);
            const wordCount = allWords.length;
            
            return (
              <>
                {wordCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 mt-2">
                    {allWords.map((word, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 rounded-full text-base bg-codex-gold/20 text-codex-gold border border-codex-gold/30 flex items-center gap-2 group"
                      >
                        <button
                          onClick={() => onSearchCue?.(word)}
                          className="hover:underline cursor-pointer"
                          title={`Search for "${word}"`}
                        >
                          {word}
                        </button>
                        {!isDemoMode && (
                          <button
                            onClick={() => handleRemoveWord(word)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Input for adding words - only when not in demo mode and less than 2 words */}
                {!isDemoMode && wordCount < 2 && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCueInput}
                      onChange={(e) => setNewCueInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCue();
                        }
                      }}
                      placeholder={wordCount === 0 ? "e.g. funding" : "Add second word..."}
                      className="flex-1 bg-codex-ink-deep/50 border-codex-gold/30 text-codex-cream placeholder:text-codex-cream/40 h-10"
                      maxLength={30}
                    />
                    <Button
                      onClick={handleAddCue}
                      disabled={!newCueInput.trim()}
                      size="sm"
                      className="bg-codex-gold hover:bg-codex-gold/90 text-codex-ink-deep h-10 px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* Show hint when no words in demo mode */}
                {wordCount === 0 && isDemoMode && (
                  <p className="text-sm text-codex-cream/40 italic">No search words set</p>
                )}
              </>
            );
          })()}
          
          {/* Topic input - for additional project classification (hidden for pilot) */}
          {false && !isDemoMode && (
            <div className="mt-3">
              <TopicInput
                value={topic}
                onChange={(value, projectId) => {
                  setTopic(value);
                  setTopicProjectId(projectId);
                }}
                autoFocus={isNewCapture}
              />
            </div>
          )}
        </motion.div>

        {/* Match Reason Banner - shown when opened from search (FIX 1: No black box) */}
        {matchInfo && matchInfo.matchTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-codex-gold/10 border border-codex-gold/20"
          >
            <div className="flex items-center gap-2 text-codex-gold">
              {matchInfo.matchTypes[0] === 'cue' && <Tag className="w-4 h-4" />}
              {matchInfo.matchTypes[0] === 'entity' && <User className="w-4 h-4" />}
              {matchInfo.matchTypes[0] === 'text' && <FileText className="w-4 h-4" />}
              {matchInfo.matchTypes[0] === 'meaning' && <Brain className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {matchInfo.matchTypes[0] === 'cue' && `Matched on cue: ${matchInfo.matchedTerms[0] || ''}`}
                {matchInfo.matchTypes[0] === 'entity' && `Matched on name: ${matchInfo.matchedTerms[0] || ''}`}
                {matchInfo.matchTypes[0] === 'text' && `Matched on text: ${matchInfo.matchedTerms[0] || ''}`}
                {matchInfo.matchTypes[0] === 'meaning' && 'Matched by meaning'}
              </span>
            </div>
            {matchInfo.matchedTerms.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {matchInfo.matchedTerms.slice(1, 4).map((term, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-codex-gold/20 text-codex-gold/80">
                    {term}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Image - centered with zoom icon and verify button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex flex-col items-center gap-2"
        >
          <div className="relative group">
            <VaultImage
              src={page.imageUrl}
              alt="Captured page"
              className="max-w-[360px] w-full rounded-xl shadow-lg border border-codex-gold/20"
            />
            <button
              onClick={() => setShowZoomedImage(true)}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-codex-ink-deep/80 text-codex-cream/70 hover:text-codex-cream hover:bg-codex-ink-deep transition-all opacity-70 group-hover:opacity-100"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          
          {/* Verify Origin - forensic fingerprint check */}
          {!isNewCapture && (
            <VerifyOriginButton
              pageId={page.id}
              imageUrl={page.imageUrl}
              originHashSha256={page.originHashSha256 || null}
              originHashAlgo={page.originHashAlgo}
            />
          )}
        </motion.div>

        {/* Zoomed image modal */}
        {showZoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-codex-ink-deep/95 flex items-center justify-center p-4"
            onClick={() => setShowZoomedImage(false)}
          >
            <button
              onClick={() => setShowZoomedImage(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-codex-cream/10 text-codex-cream hover:bg-codex-cream/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <VaultImage
              src={page.imageUrl}
              alt="Captured page - zoomed"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}

        {/* Written date - below image, above text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-codex-cream/50 uppercase tracking-wide">Written</span>
            {isDemoMode ? (
              <span className="text-base text-codex-cream/80">
                {format(writtenAt, 'd MMMM yyyy')}
              </span>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-base text-codex-cream/80 hover:text-codex-cream underline underline-offset-2 decoration-codex-cream/30 hover:decoration-codex-cream/60 transition-colors">
                    {format(writtenAt, 'd MMMM yyyy')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 bg-codex-ink-deep border-codex-cream/20" align="start">
                  {/* Direct date input for easy year entry */}
                  <div className="mb-3">
                    <label className="text-xs text-codex-cream/60 mb-1.5 block">Type date (dd-mm-yyyy)</label>
                    <Input
                      type="text"
                      placeholder="e.g. 15-03-1988"
                      defaultValue={format(writtenAt, 'dd-MM-yyyy')}
                      className="bg-codex-ink border-codex-cream/30 text-codex-cream placeholder:text-codex-cream/40 h-9"
                      onBlur={(e) => {
                        const value = e.target.value;
                        // Try to parse various formats
                        const parts = value.split(/[-/\.]/);
                        if (parts.length === 3) {
                          const [day, month, year] = parts.map(p => parseInt(p, 10));
                          const fullYear = year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;
                          const date = new Date(fullYear, month - 1, day);
                          if (!isNaN(date.getTime()) && date <= new Date()) {
                            setWrittenAt(date);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </div>
                  <div className="border-t border-codex-cream/10 pt-3">
                    <CalendarComponent
                      mode="single"
                      selected={writtenAt}
                      onSelect={(date) => date && setWrittenAt(date)}
                      disabled={(date) => date > new Date()}
                      defaultMonth={writtenAt}
                      initialFocus
                      className={cn("p-0 pointer-events-auto")}
                      classNames={{
                        months: "flex flex-col",
                        month: "space-y-3",
                        caption: "flex justify-center pt-1 relative items-center text-codex-cream",
                        caption_label: "text-sm font-medium text-codex-cream",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-codex-cream hover:bg-codex-cream/10 rounded",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell: "text-codex-cream/50 rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-1",
                        cell: "h-9 w-9 text-center text-sm p-0 relative",
                        day: "h-9 w-9 p-0 font-normal text-codex-cream/80 hover:bg-codex-cream/10 rounded aria-selected:opacity-100",
                        day_selected: "bg-codex-gold text-codex-ink hover:bg-codex-gold hover:text-codex-ink focus:bg-codex-gold focus:text-codex-ink",
                        day_today: "bg-codex-cream/10 text-codex-cream",
                        day_outside: "text-codex-cream/30 opacity-50",
                        day_disabled: "text-codex-cream/20 opacity-50",
                        day_hidden: "invisible",
                      }}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </motion.div>

        {/* Summary - left aligned, regular text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="mb-1">
            <p className="text-xs text-codex-cream/40 uppercase tracking-wide">
              Auto-generated preview
            </p>
            <p className="text-xs text-codex-cream/40">
              for retrieval only
            </p>
          </div>
          <p className="text-base text-codex-cream/90 leading-relaxed">
            {page.summary}
          </p>
        </motion.div>


        {/* Tone - editable (hidden for pilot) */}
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">
            Tone <span className="normal-case opacity-60">(tap to change)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {tone.map((t, index) => (
              <Popover key={`${t}-${index}`}>
                <PopoverTrigger asChild>
                  <button className={`px-3 py-1 rounded-full text-sm capitalize cursor-pointer hover:ring-2 hover:ring-codex-gold/50 transition-all ${getToneClass(t)}`}>
                    {t}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-codex-ink-deep border-codex-cream/20" align="start">
                  <div className="grid grid-cols-2 gap-1">
                    {AVAILABLE_TONES.map((availableTone) => (
                      <button
                        key={availableTone}
                        onClick={() => {
                          const newTone = [...tone];
                          newTone[index] = availableTone;
                          setTone(newTone);
                        }}
                        className={`px-2 py-1.5 rounded text-sm capitalize text-left transition-colors ${
                          tone[index] === availableTone 
                            ? 'bg-codex-gold/20 text-codex-gold' 
                            : 'text-codex-cream/70 hover:bg-codex-cream/10'
                        }`}
                      >
                        {availableTone}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </motion.div>
        )}

        {/* AI Keywords - tappable to highlight (hidden for pilot) */}
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">
            Keywords <span className="normal-case opacity-60">(tap to highlight)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {page.keywords.map((keyword) => {
              const isPrimary = primaryKeyword === keyword;
              return (
                <button
                  key={keyword}
                  onClick={async () => {
                    const newPrimaryKeyword = primaryKeyword === keyword ? '' : keyword;
                    setPrimaryKeyword(newPrimaryKeyword);
                    // Auto-save primary keyword immediately
                    const success = await updatePage(page.id, { primaryKeyword: newPrimaryKeyword || undefined });
                    if (success) {
                      toast.success(newPrimaryKeyword ? `'${newPrimaryKeyword}' marked as primary` : 'Primary keyword cleared');
                      if (onPageUpdate) {
                        onPageUpdate({ ...page, primaryKeyword: newPrimaryKeyword || undefined });
                      }
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    isPrimary 
                      ? 'bg-codex-gold text-codex-ink-deep ring-2 ring-codex-gold/50' 
                      : 'bg-codex-cream/10 text-codex-cream/80 border border-codex-cream/20 hover:bg-codex-cream/20'
                  }`}
                >
                  {keyword}
                </button>
              );
            })}
          </div>
        </motion.div>
        )}

        {/* Your Keywords - user can add 2-3 (hidden for pilot) */}
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">
            Your keywords <span className="normal-case opacity-60">(add 2-3)</span>
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {userKeywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 rounded-full text-sm bg-codex-gold/20 text-codex-gold border border-codex-gold/30 flex items-center gap-1.5"
              >
                {keyword}
                <button
                  onClick={() => removeUserKeyword(keyword)}
                  className="hover:text-codex-cream transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {userKeywords.length < 3 && (
            <div className="flex gap-2">
              <Input
                value={newUserKeyword}
                onChange={(e) => setNewUserKeyword(e.target.value)}
                placeholder="Add keyword..."
                className="flex-1 text-sm bg-codex-ink-deep/50 border-codex-cream/20 text-codex-cream placeholder:text-codex-cream/30"
                onKeyDown={(e) => e.key === 'Enter' && addUserKeyword()}
              />
              <Button
                onClick={addUserKeyword}
                size="sm"
                variant="outline"
                disabled={!newUserKeyword.trim()}
                className="border-codex-gold/30 text-codex-gold hover:bg-codex-gold/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
        )}

        {/* OCR Text (collapsible & editable) - with Cite-to-Source highlights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <button
            onClick={() => setShowOcrText(!showOcrText)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm text-codex-cream/50 uppercase tracking-wide">
                Raw OCR
                {highlightedSegments.length > 0 && (
                  <span className="ml-2 normal-case text-codex-gold opacity-80">
                    (matched passages highlighted)
                  </span>
                )}
              </span>
              <span className="text-xs text-codex-cream/40 normal-case">
                May contain errors — for search only
              </span>
            </div>
            {showOcrText ? (
              <ChevronUp className="w-4 h-4 text-codex-cream/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-codex-cream/50" />
            )}
          </button>
          
          {showOcrText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Show highlighted text when opened from search (Cite-to-Source A) */}
              {highlightedSegments.length > 0 ? (
                <div className="min-h-[100px] p-4 rounded-md bg-codex-cream/10 border border-codex-cream/20 text-base text-codex-cream leading-relaxed font-mono whitespace-pre-wrap">
                  {highlightedSegments.map((segment, i) => (
                    segment.isHighlighted ? (
                      <mark
                        key={i}
                        className="bg-codex-gold/30 text-codex-gold px-0.5 rounded"
                        title={`Matched ${segment.matchType}: ${segment.matchedTerm}`}
                      >
                        {segment.text}
                      </mark>
                    ) : (
                      <span key={i}>{segment.text}</span>
                    )
                  ))}
                </div>
              ) : citeResult?.likelySentences && citeResult.likelySentences.length > 0 ? (
                /* Meaning match - show likely sentences */
                <div className="space-y-2">
                  <p className="text-xs text-codex-cream/50 italic mb-2">
                    Matched by meaning — showing likely passages:
                  </p>
                  {citeResult.likelySentences.map((sentence, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-codex-gold/10 border border-codex-gold/20 text-sm text-codex-cream/80 font-mono"
                    >
                      "{sentence}"
                    </div>
                  ))}
                  <Textarea
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    className="min-h-[100px] resize-y bg-codex-cream/10 border border-codex-cream/20 text-sm text-codex-cream leading-relaxed font-mono mt-3"
                    placeholder="Full OCR text..."
                  />
                </div>
              ) : (
                /* No match info - show editable textarea */
                <Textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="min-h-[150px] resize-y bg-codex-cream/10 border border-codex-cream/20 text-base text-codex-cream leading-relaxed font-mono"
                  placeholder="OCR text..."
                />
              )}
              
              {/* Edit button to switch to editable mode when viewing highlights */}
              {highlightedSegments.length > 0 && (
                <button
                  onClick={() => setHighlightedSegments([])}
                  className="text-xs text-codex-cream/40 hover:text-codex-cream/60 mt-2 underline"
                >
                  Edit raw text
                </button>
              )}
              
              {!highlightedSegments.length && !citeResult?.likelySentences?.length && (
                <p className="text-xs text-codex-cream/40 mt-2">
                  Correct any OCR mistakes here
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Your Context - under Raw Text (hidden for pilot) */}
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">Your notes</p>
          <Textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="Add personal notes to help you find this later..."
            className="min-h-[40px] resize-none bg-codex-ink-deep/50 border-codex-cream/20 text-codex-cream placeholder:text-codex-cream/30"
          />
        </motion.div>
        )}

        {/* Sources Section - under Raw Text (hidden for pilot) */}
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <span className="text-xs text-codex-cream/50 uppercase tracking-wide">
              Sources {sources.length > 0 && `(${sources.length})`}
            </span>
            {showSources ? (
              <ChevronUp className="w-4 h-4 text-codex-cream/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-codex-cream/50" />
            )}
          </button>
          
          {showSources && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {sources.length > 0 && (
                <div className="space-y-2">
                  {sources.map((source, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-codex-cream/5 group"
                    >
                      <a 
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-codex-gold hover:underline truncate"
                      >
                        {source}
                      </a>
                      <button
                        onClick={() => removeSource(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-sm bg-codex-ink-deep/50 border-codex-cream/20 text-codex-cream placeholder:text-codex-cream/30"
                  onKeyDown={(e) => e.key === 'Enter' && addSource()}
                />
                <Button
                  onClick={addSource}
                  size="sm"
                  variant="outline"
                  disabled={!newSource.trim()}
                  className="border-codex-gold/30 text-codex-gold hover:bg-codex-gold/20"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
        )}

        {/* Related Pages - Connection Layer (B) - hidden for pilot */}
        {false && !isNewCapture && onNavigateToPage && (
          <RelatedPages
            relatedPages={relatedPages}
            onPageClick={handleRelatedPageClick}
          />
        )}

        {/* Close button - bottom, always visible (except for new captures which have their own actions) */}
        {!isNewCapture && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-8 mb-4 flex justify-center"
          >
            <Button
              onClick={handleCloseWithSave}
              disabled={isSaving}
              variant="ghost"
              className="w-full max-w-xs bg-codex-cream/10 text-codex-cream hover:bg-codex-cream/20"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Close'}
            </Button>
          </motion.div>
        )}

        {/* Actions - only for new captures */}
        {isNewCapture && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-8"
          >
            {/* Timeline icon */}
            <button
              onClick={handleViewHistoryWithSave}
              disabled={isSaving}
              className="flex flex-col items-center gap-2 group disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-codex-gold/20 border border-codex-gold/40 flex items-center justify-center group-hover:bg-codex-gold/30 transition-colors">
                <BookOpen className="w-6 h-6 text-codex-gold" />
              </div>
              <span className="text-xs text-codex-gold font-medium">Timeline</span>
            </button>
            
            {/* Capture another icon */}
            <button
              onClick={handleCloseWithSave}
              disabled={isSaving}
              className="flex flex-col items-center gap-2 group disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-codex-cream/10 border border-codex-cream/30 flex items-center justify-center group-hover:bg-codex-cream/20 transition-colors">
                <Camera className="w-6 h-6 text-codex-cream" />
              </div>
              <span className="text-xs text-codex-cream/80 font-medium">
                {isSaving ? 'Saving...' : 'Capture'}
              </span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Share Modal */}
      <SharePageModal
        page={page}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}