import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Page } from '@/lib/pageService';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface SnapshotViewProps {
  page: Page;
  onClose: () => void;
  onViewHistory: () => void;
  isNewCapture?: boolean;
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

export function SnapshotView({ page, onClose, onViewHistory, isNewCapture }: SnapshotViewProps) {
  const [showOcrText, setShowOcrText] = useState(false);

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
          
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(page.createdAt, { addSuffix: true })}</span>
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

        {/* Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {page.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>

        {/* OCR Text (collapsible) */}
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
              Raw text
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
              className="p-4 rounded-lg bg-codex-cream border border-border text-sm text-muted-foreground leading-relaxed font-mono"
            >
              {page.ocrText}
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
            onClick={onClose}
            variant="codex"
            size="lg"
            className="w-full"
          >
            Capture another page
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
