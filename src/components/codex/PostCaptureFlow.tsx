import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page, confirmFutureYouCues } from '@/lib/pageService';
import { FutureYouCuePrompt } from './FutureYouCuePrompt';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays, subWeeks } from 'date-fns';
import { nl } from 'date-fns/locale';

interface PostCaptureFlowProps {
  page: Page;
  suggestedCues: string[];
  onComplete: (updatedPage: Page) => void;
  onSkip?: () => void;
}

type DateOption = 'today' | 'yesterday' | 'last-week' | 'pick';

/**
 * Post-capture flow with mandatory Future You Cue prompt + written_at toggle
 * Per briefing section 4.1
 */
export function PostCaptureFlow({ 
  page, 
  suggestedCues, 
  onComplete,
  onSkip 
}: PostCaptureFlowProps) {
  const [step, setStep] = useState<'cues' | 'date'>('cues');
  const [confirmedCues, setConfirmedCues] = useState<string[]>([]);
  const [userEdited, setUserEdited] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(page.writtenAt || page.createdAt);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCuesConfirmed = async (cues: string[], edited: boolean) => {
    setConfirmedCues(cues);
    setUserEdited(edited);
    
    // Save cues immediately when confirmed (don't wait for date step)
    try {
      await confirmFutureYouCues(page.id, cues, edited);
      console.log('Cues saved:', cues);
    } catch (error) {
      console.error('Failed to save cues:', error);
    }
    
    setStep('date');
  };

  const handleDateSelect = (option: DateOption) => {
    const now = new Date();
    switch (option) {
      case 'today':
        setSelectedDate(now);
        break;
      case 'yesterday':
        setSelectedDate(subDays(now, 1));
        break;
      case 'last-week':
        setSelectedDate(subWeeks(now, 1));
        break;
      case 'pick':
        // For MVP, just use a week ago as placeholder
        // In full implementation, would open a date picker
        setSelectedDate(subWeeks(now, 1));
        break;
    }
    setShowDatePicker(false);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Save cues and date to database
      const success = await confirmFutureYouCues(
        page.id, 
        confirmedCues, 
        userEdited,
        selectedDate
      );
      
      if (success) {
        // Return updated page
        onComplete({
          ...page,
          futureYouCues: confirmedCues,
          futureYouCuesSource: {
            ai_prefill_version: 'v1',
            user_edited: userEdited
          },
          writtenAt: selectedDate
        });
      } else {
        // Still proceed even if save failed
        onComplete(page);
      }
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
        <AnimatePresence mode="wait">
          {step === 'cues' && (
            <motion.div
              key="cues"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FutureYouCuePrompt
                suggestedCues={suggestedCues}
                onConfirm={handleCuesConfirmed}
              />
            </motion.div>
          )}

          {step === 'date' && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Confirmed cues display */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Your retrieval cues
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {confirmedCues.map((cue, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm bg-primary/20 text-primary border border-primary/30"
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              </div>

              {/* Date section */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="font-serif text-lg text-foreground mb-1">
                    Wanneer geschreven?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Standaard: vandaag gecaptured
                  </p>
                </div>

                {/* Current selection */}
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {format(selectedDate, 'd MMMM yyyy', { locale: nl })}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                </button>

                {/* Date quick picks */}
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {[
                        { key: 'today', label: 'Vandaag' },
                        { key: 'yesterday', label: 'Gisteren' },
                        { key: 'last-week', label: 'Vorige week' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => handleDateSelect(key as DateOption)}
                          className="w-full p-2 rounded-md text-sm text-left hover:bg-muted transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Complete button */}
              <div className="pt-4">
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? 'Opslaan...' : 'Klaar'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip option (only in step 1) */}
      {step === 'cues' && onSkip && (
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
