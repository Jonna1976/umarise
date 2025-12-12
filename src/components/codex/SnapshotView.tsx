import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Clock, ChevronDown, ChevronUp, Star, Check, Link2, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Page, updatePage } from '@/lib/pageService';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TopicInput } from '@/components/capture/TopicInput';

interface SnapshotViewProps {
  page: Page;
  onClose: () => void;
  onViewHistory: () => void;
  isNewCapture?: boolean;
  onPageUpdate?: (page: Page) => void;
}

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

export function SnapshotView({ page, onClose, onViewHistory, isNewCapture, onPageUpdate }: SnapshotViewProps) {
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

  // Track changes
  useEffect(() => {
    const noteChanged = userNote !== (page.userNote || '');
    const keywordChanged = primaryKeyword !== (page.primaryKeyword || '');
    const ocrChanged = ocrText !== (page.ocrText || '');
    const sourcesChanged = JSON.stringify(sources) !== JSON.stringify(page.sources || []);
    const topicChanged = topicProjectId !== page.projectId;
    setHasChanges(noteChanged || keywordChanged || ocrChanged || sourcesChanged || topicChanged);
  }, [userNote, primaryKeyword, ocrText, sources, topicProjectId, page.userNote, page.primaryKeyword, page.ocrText, page.sources, page.projectId]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    const success = await updatePage(page.id, {
      userNote: userNote || undefined,
      primaryKeyword: primaryKeyword || undefined,
      ocrText: ocrText || undefined,
      sources: sources,
      projectId: topicProjectId,
    });
    
    setIsSaving(false);
    
    if (success) {
      toast.success('Saved');
      setHasChanges(false);
      if (onPageUpdate) {
        onPageUpdate({ ...page, userNote, primaryKeyword, ocrText, sources, projectId: topicProjectId });
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
      });
      setIsSaving(false);
      
      if (success) {
        toast.success('Changes saved');
        if (onPageUpdate) {
          onPageUpdate({ ...page, userNote, primaryKeyword, ocrText, sources, projectId: topicProjectId });
        }
      } else {
        toast.error('Failed to save changes');
        return; // Don't navigate if save failed
      }
    }
    onClose();
  };

  const addSource = () => {
    const trimmed = newSource.trim();
    if (!trimmed) return;
    
    // Basic URL validation
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

  const togglePrimaryKeyword = (keyword: string) => {
    if (primaryKeyword === keyword) {
      setPrimaryKeyword('');
    } else {
      setPrimaryKeyword(keyword);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                variant="codex"
                className="h-8"
              >
                {isSaving ? 'Saving...' : 'Save'}
                {!isSaving && <Check className="w-4 h-4 ml-1" />}
              </Button>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(page.createdAt, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        {/* Success badge for new captures */}
        {isNewCapture && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tone-hopeful/10 text-tone-hopeful text-sm font-medium">
              ✓ Added to your codex
            </span>
          </motion.div>
        )}

        {/* Topic input - only for new captures */}
        {isNewCapture && (
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

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <img
            src={page.imageUrl}
            alt="Captured page"
            className="w-full rounded-xl shadow-lg"
          />
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-serif text-xl text-foreground leading-relaxed">
            {page.summary}
          </h2>
        </motion.div>

        {/* Tone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {page.tone.map((t) => (
              <span key={t} className={`tone-chip ${getToneClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Keywords with highlight option */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Keywords <span className="normal-case opacity-60">(tap to highlight)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {page.keywords.map((keyword) => {
              const isPrimary = primaryKeyword === keyword;
              return (
                <button
                  key={keyword}
                  onClick={() => togglePrimaryKeyword(keyword)}
                  className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    isPrimary 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {isPrimary && <Star className="w-3 h-3" />}
                  {keyword}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* User Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Your context
          </p>
          <Textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="Add personal notes to help you find this later..."
            className="min-h-[80px] resize-none bg-secondary/50 border-border/50 focus:border-primary/50"
          />
        </motion.div>

        {/* Sources Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Sources {sources.length > 0 && `(${sources.length})`}
              </span>
            </div>
            {showSources ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          {showSources && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Existing sources */}
              {sources.length > 0 && (
                <div className="space-y-2">
                  {sources.map((source, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group"
                    >
                      <a 
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-primary hover:underline truncate flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        {source}
                      </a>
                      <button
                        onClick={() => removeSource(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new source */}
              <div className="flex gap-2">
                <Input
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addSource()}
                />
                <Button
                  onClick={addSource}
                  size="sm"
                  variant="outline"
                  disabled={!newSource.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground/60">
                Add URLs to articles, research papers, or other references
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* OCR Text (collapsible & editable) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowOcrText(!showOcrText)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Raw text <span className="normal-case opacity-60">(editable)</span>
            </span>
            {showOcrText ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                className="min-h-[150px] resize-y bg-codex-cream border border-border text-sm text-muted-foreground leading-relaxed font-mono"
                placeholder="OCR text..."
              />
              <p className="text-xs text-muted-foreground mt-2 opacity-60">
                Correct any OCR mistakes here
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            onClick={handleCloseWithSave}
            disabled={isSaving}
            variant="codex"
            size="lg"
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Capture another page'}
          </Button>
          
          <Button
            onClick={onViewHistory}
            variant="outline"
            size="lg"
            className="w-full"
          >
            View all pages
          </Button>
        </motion.div>
      </div>
    </div>
  );
}