import { useState } from 'react';
import { motion } from 'framer-motion';
import { Page, confirmFutureYouCues } from '@/lib/pageService';
import { FutureYouCuePrompt } from './FutureYouCuePrompt';
import { Check } from 'lucide-react';

interface PostCaptureFlowProps {
  page: Page;
  suggestedCues: string[];
  onComplete: (updatedPage: Page) => void;
  onSkip?: () => void;
}

/**
 * Post-capture flow with Future You Cue prompt only
 * Date editing moved to SnapshotView per user feedback
 */
export function PostCaptureFlow({ 
  page, 
  suggestedCues, 
  onComplete,
  onSkip 
}: PostCaptureFlowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCuesConfirmed = async (cues: string[], edited: boolean) => {
    setIsSubmitting(true);
    
    try {
      await confirmFutureYouCues(page.id, cues, edited);
      console.log('Cues saved:', cues);
      
      // Complete flow and go to SnapshotView
      onComplete({
        ...page,
        futureYouCues: cues,
        futureYouCuesSource: {
          ai_prefill_version: 'v1',
          user_edited: edited
        }
      });
    } catch (error) {
      console.error('Failed to save cues:', error);
      onComplete(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex flex-col">
      {/* Header with thumbnail */}
      <div className="p-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <img
            src={page.thumbnailUri || page.imageUrl}
            alt="Captured page"
            className="w-24 h-32 object-cover rounded-lg shadow-lg border border-border/50"
          />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <FutureYouCuePrompt
            suggestedCues={suggestedCues}
            onConfirm={handleCuesConfirmed}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </div>

      {/* Skip option */}
      {onSkip && (
        <div className="p-4 text-center">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Later invullen
          </button>
        </div>
      )}
    </div>
  );
}
