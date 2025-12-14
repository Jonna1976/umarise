import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown, ChevronUp, Check, Plus, Trash2, BookOpen, Camera, X } from 'lucide-react';
import { Page, updatePage, getPages } from '@/lib/pageService';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TopicInput } from '@/components/capture/TopicInput';
import { EarlyInsights } from './EarlyInsights';

interface SnapshotViewProps {
  page: Page;
  onClose: () => void;
  onViewHistory: () => void;
  isNewCapture?: boolean;
  onPageUpdate?: (page: Page) => void;
  isDemoMode?: boolean;
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

export function SnapshotView({ page, onClose, onViewHistory, isNewCapture, onPageUpdate, isDemoMode }: SnapshotViewProps) {
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
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [userKeywords, setUserKeywords] = useState<string[]>([]);
  const [newUserKeyword, setNewUserKeyword] = useState('');
  const [futureYouCue, setFutureYouCue] = useState(page.futureYouCue || '');

  // Fetch all pages for insights display
  useEffect(() => {
    if (isNewCapture) {
      getPages().then(setAllPages);
    }
  }, [isNewCapture]);

  // Track changes
  useEffect(() => {
    const noteChanged = userNote !== (page.userNote || '');
    const keywordChanged = primaryKeyword !== (page.primaryKeyword || '');
    const ocrChanged = ocrText !== (page.ocrText || '');
    const sourcesChanged = JSON.stringify(sources) !== JSON.stringify(page.sources || []);
    const topicChanged = topicProjectId !== page.projectId;
    const cueChanged = futureYouCue !== (page.futureYouCue || '');
    setHasChanges(noteChanged || keywordChanged || ocrChanged || sourcesChanged || topicChanged || cueChanged);
  }, [userNote, primaryKeyword, ocrText, sources, topicProjectId, futureYouCue, page.userNote, page.primaryKeyword, page.ocrText, page.sources, page.projectId, page.futureYouCue]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    const success = await updatePage(page.id, {
      userNote: userNote || undefined,
      primaryKeyword: primaryKeyword || undefined,
      ocrText: ocrText || undefined,
      sources: sources,
      projectId: topicProjectId,
      futureYouCue: futureYouCue || undefined,
    });
    
    setIsSaving(false);
    
    if (success) {
      toast.success('Saved');
      setHasChanges(false);
      if (onPageUpdate) {
        onPageUpdate({ ...page, userNote, primaryKeyword, ocrText, sources, projectId: topicProjectId, futureYouCue });
      }
    } else {
      toast.error('Failed to save');
    }
  };

  // Auto-save before navigating away
  const handleCloseWithSave = async () => {
    if (hasChanges) {
      setIsSaving(true);
      const success = await updatePage(page.id, {
        userNote: userNote || undefined,
        primaryKeyword: primaryKeyword || undefined,
        ocrText: ocrText || undefined,
        sources: sources,
        projectId: topicProjectId,
        futureYouCue: futureYouCue || undefined,
      });
      setIsSaving(false);
      
      if (success) {
        toast.success('Changes saved');
        if (onPageUpdate) {
          onPageUpdate({ ...page, userNote, primaryKeyword, ocrText, sources, projectId: topicProjectId, futureYouCue });
        }
      } else {
        toast.error('Failed to save changes');
        return;
      }
    }
    onClose();
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

  const addUserKeyword = () => {
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
    setUserKeywords([...userKeywords, trimmed]);
    setNewUserKeyword('');
  };

  const removeUserKeyword = (keyword: string) => {
    setUserKeywords(userKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-forest-deep to-codex-ink-deep">
      {/* Header - walkthrough style */}
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
        {/* Success badge for new captures - simplified, no page count */}
        {isNewCapture && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-codex-gold/20 text-codex-gold text-sm font-medium border border-codex-gold/30">
              Added to your codex
            </span>
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

        {/* Image - centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex justify-center"
        >
          <img
            src={page.imageUrl}
            alt="Captured page"
            className="max-w-[400px] w-full rounded-xl shadow-lg border border-codex-gold/20"
          />
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

        {/* Future You Cue - only visible in Full Mode */}
        {!isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6"
          >
            <p className="text-xs text-codex-cream/50 uppercase tracking-wide mb-2">
              Future You cue <span className="normal-case opacity-60">(optional)</span>
            </p>
            <Input
              value={futureYouCue}
              onChange={(e) => setFutureYouCue(e.target.value.slice(0, 60))}
              placeholder="Why does this matter?"
              maxLength={60}
              className="bg-codex-ink-deep/50 border-codex-cream/20 text-codex-cream placeholder:text-codex-cream/30"
            />
            <p className="text-[10px] text-codex-cream/40 mt-1 text-right">
              {futureYouCue.length}/60 — Keep it short — for future retrieval.
            </p>
          </motion.div>
        )}

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
                  onClick={() => {
                    if (primaryKeyword === keyword) {
                      setPrimaryKeyword('');
                    } else {
                      setPrimaryKeyword(keyword);
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

        {/* Early insights - at the bottom, brand colors */}
        {isNewCapture && allPages.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <EarlyInsights pages={allPages} latestPage={page} />
          </motion.div>
        )}

        {/* Actions - Icon buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-8"
        >
          {isNewCapture ? (
            <>
              {/* Timeline icon */}
              <button
                onClick={onViewHistory}
                className="flex flex-col items-center gap-2 group"
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
            </>
          ) : (
            <button
              onClick={handleCloseWithSave}
              disabled={isSaving}
              className="flex flex-col items-center gap-2 group disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-codex-cream/10 border border-codex-cream/30 flex items-center justify-center group-hover:bg-codex-cream/20 transition-colors">
                <X className="w-6 h-6 text-codex-cream" />
              </div>
              <span className="text-xs text-codex-cream/80 font-medium">Close</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}