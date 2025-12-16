import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown, ChevronUp, Check, Plus, Trash2, BookOpen, Camera, X, Calendar, Tag, User, FileText, Brain } from 'lucide-react';
import { Page, updatePage, confirmFutureYouCues } from '@/lib/pageService';
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
  suggestedCues?: string[]; // AI-suggested cues for new captures
  matchInfo?: SnapshotMatchInfo; // Search match info (when opened from search)
}

function getToneClass(tone: string): string {
  const toneMap: Record<string, string> = {
    focused: 'bg-codex-gold/20 text-codex-gold',
    hopeful: 'bg-codex-teal/20 text-codex-teal',
    frustrated: 'bg-codex-forest/20 text-codex-forest',
    playful: 'bg-codex-gold/20 text-codex-gold',
    overwhelmed: 'bg-codex-forest-deep/20 text-codex-forest-deep',
    reflective: 'bg-codex-sepia/20 text-codex-sepia',
  };
  return toneMap[tone.toLowerCase()] || 'bg-codex-gold/10 text-codex-gold';
}

export function SnapshotView({ page, onClose, onViewHistory, isNewCapture, onPageUpdate, isDemoMode, suggestedCues, matchInfo }: SnapshotViewProps) {
  const [showOcrText, setShowOcrText] = useState(false);
  const [showSources, setShowSources] = useState(false);
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
  const [writtenAt, setWrittenAt] = useState<Date>(page.writtenAt || page.createdAt);
  const [cuesConfirmed, setCuesConfirmed] = useState<boolean>((page.futureYouCues?.length ?? 0) > 0);
  const [isConfirmingCues, setIsConfirmingCues] = useState(false);


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
    setHasChanges(noteChanged || keywordChanged || ocrChanged || sourcesChanged || topicChanged || cuesChanged || dateChanged || userKeywordsChanged);
  }, [userNote, primaryKeyword, ocrText, sources, topicProjectId, futureYouCues, writtenAt, userKeywords, page.userNote, page.primaryKeyword, page.ocrText, page.sources, page.projectId, page.futureYouCues, page.writtenAt, page.createdAt, page.highlights]);


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
    } = {};

    const noteChanged = userNote !== (page.userNote || '');
    const keywordChanged = primaryKeyword !== (page.primaryKeyword || '');
    const ocrChanged = ocrText !== (page.ocrText || '');
    const sourcesChanged = JSON.stringify(sources) !== JSON.stringify(page.sources || []);
    const topicChanged = topicProjectId !== page.projectId;
    const cuesChanged = JSON.stringify(futureYouCues) !== JSON.stringify(page.futureYouCues || []);
    const dateChanged = writtenAt.getTime() !== (page.writtenAt || page.createdAt).getTime();
    const userKeywordsChanged = JSON.stringify(userKeywords) !== JSON.stringify(page.highlights || []);

    if (noteChanged) updates.userNote = userNote || undefined;
    if (keywordChanged) updates.primaryKeyword = primaryKeyword || undefined;
    if (ocrChanged) updates.ocrText = ocrText || undefined;
    if (sourcesChanged) updates.sources = sources;
    if (topicChanged) updates.projectId = topicProjectId;
    if (cuesChanged) updates.futureYouCues = futureYouCues.length > 0 ? futureYouCues : undefined;
    if (dateChanged) updates.writtenAt = writtenAt;
    if (userKeywordsChanged) updates.highlights = userKeywords;

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
      {/* Header - time and save */}
      <div className="sticky top-0 z-10 bg-codex-ink-deep/80 backdrop-blur-md border-b border-codex-gold/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-codex-cream/60 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(page.createdAt, { addSuffix: true })}</span>
          </div>
          
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

        {/* Topic input - only for new captures, hidden in Demo Mode */}
        {isNewCapture && !isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <TopicInput
              value={topic}
              onChange={(value, projectId) => {
                setTopic(value);
                setTopicProjectId(projectId);
              }}
              autoFocus
            />
          </motion.div>
        )}

        {/* Future You Cues - ALWAYS show question, TOP POSITION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <p className="text-sm text-codex-gold mb-3">
            Which 3 words will you type to find this later?
          </p>
          {futureYouCues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {futureYouCues.map((cue, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-full text-sm bg-codex-gold/20 text-codex-gold border border-codex-gold/30"
                >
                  {cue}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-codex-cream/40 italic">No retrieval cues set</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-codex-cream/50 uppercase tracking-wide">Written</span>
            {isDemoMode ? (
              <span className="text-sm text-codex-cream/80">
                {format(writtenAt, 'd MMMM yyyy')}
              </span>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-sm text-codex-cream/80 hover:text-codex-cream underline underline-offset-2 decoration-codex-cream/30 hover:decoration-codex-cream/60 transition-colors">
                    {format(writtenAt, 'd MMMM yyyy')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-codex-ink-deep border-codex-cream/20" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={writtenAt}
                    onSelect={(date) => date && setWrittenAt(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
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

        {/* Image with close button - positioned to right of photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex justify-center items-start gap-2"
        >
          <img
            src={page.imageUrl}
            alt="Captured page"
            className="max-w-[360px] w-full rounded-xl shadow-lg border border-codex-gold/20"
          />
          {/* Close button - right of photo */}
          <Button
            onClick={handleCloseWithSave}
            disabled={isSaving}
            variant="ghost"
            size="sm"
            className="text-codex-cream/60 hover:text-codex-cream hover:bg-codex-cream/10 h-10 w-10 p-0 rounded-full flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center"
        >
          <h2 className="font-serif text-lg text-codex-cream leading-relaxed">
            {page.summary}
          </h2>
        </motion.div>


        {/* Tone - compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {page.tone.map((t) => (
              <span key={t} className={`px-3 py-1 rounded-full text-sm capitalize ${getToneClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* AI Keywords - tappable to highlight */}
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

        {/* Your Keywords - user can add 2-3 */}
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

        {/* Your Context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">Your context</p>
          <Textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="Add personal notes to help you find this later..."
            className="min-h-[80px] resize-none bg-codex-ink-deep/50 border-codex-cream/20 text-codex-cream placeholder:text-codex-cream/30"
          />
        </motion.div>

        {/* OCR Text (collapsible & editable) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <button
            onClick={() => setShowOcrText(!showOcrText)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <span className="text-xs text-codex-cream/50 uppercase tracking-wide">
              Raw text <span className="normal-case opacity-60">(editable)</span>
            </span>
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
              <Textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="min-h-[150px] resize-y bg-codex-cream/10 border border-codex-cream/20 text-sm text-codex-cream leading-relaxed font-mono"
                placeholder="OCR text..."
              />
              <p className="text-xs text-codex-cream/40 mt-2">
                Correct any OCR mistakes here
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Sources Section - under Raw Text */}
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
    </div>
  );
}