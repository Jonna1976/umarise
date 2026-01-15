import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FutureYouCuePromptProps {
  suggestedCues: string[];
  onConfirm: (cues: string[], userEdited: boolean) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

/**
 * Mandatory 3-chip Future You Cue prompt
 * Shows AI-prefilled cues that user can accept or edit
 * Must end with exactly 3 cues
 */
export function FutureYouCuePrompt({ 
  suggestedCues, 
  onConfirm,
  isLoading = false,
  isSubmitting = false
}: FutureYouCuePromptProps) {
  // 2 words - not 3!
  const [cues, setCues] = useState<string[]>(['', '']);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Initialize with AI suggestions when available
  useEffect(() => {
    if (suggestedCues.length > 0) {
      const normalized = [...suggestedCues];
      while (normalized.length < 2) normalized.push('');
      setCues(normalized.slice(0, 2));
    }
  }, [suggestedCues]);

  const handleEditCue = (index: number) => {
    setEditingIndex(index);
    setEditValue(cues[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    
    const trimmed = editValue.trim().slice(0, 30);
    if (trimmed) {
      const newCues = [...cues];
      newCues[editingIndex] = trimmed;
      setCues(newCues);
      setHasUserEdited(true);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDeleteCue = (index: number) => {
    const newCues = [...cues];
    newCues[index] = '';
    setCues(newCues);
    setHasUserEdited(true);
  };

  const handleAddCue = (value: string) => {
    const emptyIndex = cues.findIndex(c => !c);
    if (emptyIndex !== -1) {
      const newCues = [...cues];
      newCues[emptyIndex] = value.trim().slice(0, 30);
      setCues(newCues);
      setHasUserEdited(true);
    }
  };

  const filledCues = cues.filter(c => c.trim());
  const canConfirm = filledCues.length === 2; // 2 words required

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(filledCues, hasUserEdited);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-serif text-lg text-foreground mb-1">
          In 2 words: what is this about?
        </h3>
        <p className="text-xs text-muted-foreground">
          Tap om te bewerken, of accepteer de suggesties
        </p>
      </div>

      {/* Cue chips */}
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {cues.map((cue, index) => {
            const isEmpty = !cue.trim();
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <motion.div
                  key={`edit-${index}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value.slice(0, 30))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                    placeholder="Type cue..."
                    maxLength={30}
                    autoFocus
                    className="h-8 w-32 text-sm bg-background border-primary/50"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editValue.trim()}
                    className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            }

            if (isEmpty) {
              return (
                <motion.button
                  key={`empty-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleEditCue(index)}
                  className="h-8 px-4 rounded-full border-2 border-dashed border-muted-foreground/30 
                             text-muted-foreground/50 text-sm hover:border-primary/50 hover:text-primary/70
                             transition-colors"
                >
                  + voeg toe
                </motion.button>
              );
            }

            return (
              <motion.div
                key={`cue-${index}-${cue}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative"
              >
                <div
                  className="h-8 px-4 rounded-full bg-primary/20 text-primary border border-primary/30
                             flex items-center gap-2 text-sm font-medium cursor-pointer
                             hover:bg-primary/30 transition-colors"
                  onClick={() => handleEditCue(index)}
                >
                  <span>{cue}</span>
                  <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCue(index);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground
                             flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground animate-pulse">
            AI genereert suggesties...
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground">
          {filledCues.length}/2 words
        </span>
      </div>

      {/* Confirm button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm || isSubmitting}
          className="min-w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSubmitting ? (
            'Saving...'
          ) : canConfirm ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Timeline
            </>
          ) : (
            `${2 - filledCues.length} more word${2 - filledCues.length !== 1 ? 's' : ''} needed`
          )}
        </Button>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-muted-foreground/60">
        Deze cues helpen jou om dit later snel terug te vinden
      </p>
    </div>
  );
}
