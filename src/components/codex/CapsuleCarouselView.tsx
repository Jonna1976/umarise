import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CapsulePages, Page, deletePage } from '@/lib/pageService';
import { toast } from 'sonner';
import { SnapshotView } from './SnapshotView';
import { motion, AnimatePresence } from 'framer-motion';

interface CapsuleCarouselViewProps {
  capsule: CapsulePages;
  onClose: () => void;
  onSelectPage?: (page: Page) => void; // Optional - not used in new design
  onCapsuleUpdated?: () => void;
  allPages?: Page[]; // For related pages
}

export function CapsuleCarouselView({ capsule, onClose, onCapsuleUpdated, allPages }: CapsuleCarouselViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next

  const currentPage = capsule.pages[currentIndex];
  const totalPages = capsule.pages.length;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < totalPages - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalPages, onClose]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalPages - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalPages]);

  // Handle swipe gestures
  const handleDragEnd = useCallback((event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      goToPrev();
    } else if (info.offset.x < -threshold && currentIndex < totalPages - 1) {
      goToNext();
    }
  }, [currentIndex, totalPages, goToPrev, goToNext]);

  // Handle page update from SnapshotView
  const handlePageUpdate = useCallback((updatedPage: Page) => {
    // Notify parent to refresh capsule data
    onCapsuleUpdated?.();
  }, [onCapsuleUpdated]);

  // Handle close from SnapshotView - go back to history
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle "View Memory" - in capsule context, just close
  const handleViewMemory = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!currentPage) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Page navigation indicator - floating at top */}
      {totalPages > 1 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[3rem] text-center">
            {currentIndex + 1} / {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentIndex === totalPages - 1}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Main content - SnapshotView with swipe support */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage.id}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 100 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          drag={totalPages > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="min-h-screen"
        >
          <SnapshotView
            page={currentPage}
            onClose={handleClose}
            onViewHistory={handleViewMemory}
            isNewCapture={false}
            onPageUpdate={handlePageUpdate}
            allPages={allPages}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators at bottom */}
      {totalPages > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border">
          {capsule.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-codex-gold w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
