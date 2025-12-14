import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Star, Images, FileText, Sparkles, BookMarked, Loader2, Trash2 } from 'lucide-react';
import { CapsulePages, Page, markCapsuleAsInfluence, deletePage } from '@/lib/pageService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi 
} from '@/components/ui/carousel';

interface CapsuleCarouselViewProps {
  capsule: CapsulePages;
  onClose: () => void;
  onSelectPage: (page: Page) => void;
  onCapsuleUpdated?: () => void;
  onPageDeleted?: (pageId: string) => void;
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

// Generate combined summary from all pages
function generateCapsuleSummary(pages: Page[]): string {
  const allKeywords = new Set<string>();
  pages.forEach(p => p.keywords.forEach(k => allKeywords.add(k)));
  
  // Take first 2 sentences from first page summary
  const firstSummary = pages[0]?.summary || '';
  
  return `${pages.length} pages covering: ${Array.from(allKeywords).slice(0, 6).join(', ')}. ${firstSummary}`;
}

export function CapsuleCarouselView({ capsule, onClose, onSelectPage, onCapsuleUpdated, onPageDeleted }: CapsuleCarouselViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if capsule is marked as influence (any page has sources)
  const isInfluence = capsule.pages.some(p => p.sources && p.sources.length > 0);

  const handleToggleInfluence = async () => {
    setIsUpdating(true);
    try {
      const success = await markCapsuleAsInfluence(capsule.capsuleId, !isInfluence);
      if (success) {
        toast.success(isInfluence 
          ? 'Capsule verwijderd als externe bron' 
          : 'Capsule gemarkeerd als externe bron'
        );
        onCapsuleUpdated?.();
      } else {
        toast.error('Kon capsule niet bijwerken');
      }
    } catch (error) {
      toast.error('Er ging iets mis');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePage = async (page: Page) => {
    setIsDeleting(true);
    try {
      const success = await deletePage(page.id);
      if (success) {
        toast.success('Pagina verwijderd');
        onPageDeleted?.(page.id);
        // If this was the last page, close the carousel
        if (capsule.pages.length <= 1) {
          onClose();
        }
      } else {
        toast.error('Kon pagina niet verwijderen');
      }
    } catch (error) {
      toast.error('Er ging iets mis');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const currentPage = capsule.pages[current];
  const capsuleSummary = generateCapsuleSummary(capsule.pages);

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-ink to-codex-forest flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-codex-ink/80 backdrop-blur-md border-b border-codex-gold/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleInfluence}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isInfluence 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookMarked className="w-3.5 h-3.5" />
              )}
              {isInfluence ? 'Externe bron' : 'Markeer als bron'}
            </button>
            <button
              onClick={() => setShowOverview(!showOverview)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showOverview 
                  ? 'bg-codex-gold text-codex-ink' 
                  : 'bg-codex-gold/20 text-codex-gold hover:bg-codex-gold/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Overview
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
              <Images className="w-3.5 h-3.5" />
              {current + 1} / {count}
            </span>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Capsule Overview */}
      <AnimatePresence>
        {showOverview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-codex-gold/5"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-codex-gold" />
                <h3 className="text-sm font-medium text-foreground">Capsule Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {capsuleSummary}
              </p>
              
              {/* All keywords from all pages */}
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(capsule.pages.flatMap(p => p.keywords))).slice(0, 12).map((keyword) => (
                  <span key={keyword} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel with integrated navigation */}
      <div className="flex-1 flex flex-col relative">
        <Carousel 
          className="flex-1 w-full"
          setApi={setApi}
          opts={{
            align: 'center',
            loop: false,
          }}
        >
          <CarouselContent className="h-full">
            {capsule.pages.map((page, index) => (
              <CarouselItem key={page.id} className="h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full flex flex-col items-center justify-center p-4"
                >
                  {/* Image with integrated nav arrows */}
                  <div className="relative w-full max-w-sm">
                    <button
                      onClick={() => onSelectPage(page)}
                      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={page.imageUrl}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover page-thumbnail"
                      />
                    </button>
                    
                    {/* Navigation arrows - tight to image */}
                    {current > 0 && (
                      <button
                        onClick={scrollPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-md"
                      >
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                      </button>
                    )}
                    {current < count - 1 && (
                      <button
                        onClick={scrollNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-md"
                      >
                        <ChevronRight className="w-4 h-4 text-foreground" />
                      </button>
                    )}
                  </div>
                  
                  {/* Page details shown immediately below image */}
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm mt-4 p-3 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {page.primaryKeyword && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-codex-sepia text-white uppercase tracking-wide">
                            <Star className="w-3 h-3" />
                            {page.primaryKeyword}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          Page {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectPage(page)}
                          className="text-[10px] text-codex-gold hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Details
                        </button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="text-[10px] text-destructive/70 hover:text-destructive flex items-center gap-1"
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Pagina verwijderen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deze actie kan niet ongedaan worden gemaakt. De pagina wordt permanent verwijderd uit deze capsule.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuleren</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePage(page)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Verwijderen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2 mb-2">
                      {page.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {page.tone.map((t) => (
                        <span key={t} className={`tone-chip text-[9px] ${getToneClass(t)}`}>
                          {t}
                        </span>
                      ))}
                      {page.keywords.slice(0, 3).map((k) => (
                        <span key={k} className="px-1.5 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">
                          {k}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-3">
          {capsule.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current 
                  ? 'bg-codex-gold w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
