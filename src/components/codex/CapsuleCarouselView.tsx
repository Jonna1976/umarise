import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Star, Images } from 'lucide-react';
import { CapsulePages, Page } from '@/lib/pageService';
import { formatDistanceToNow } from 'date-fns';
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

export function CapsuleCarouselView({ capsule, onClose, onSelectPage }: CapsuleCarouselViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-codex-gold/20 text-codex-gold">
              <Images className="w-3.5 h-3.5" />
              {current + 1} / {count}
            </span>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Carousel */}
      <div className="flex-1 flex flex-col">
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
                  <button
                    onClick={() => onSelectPage(page)}
                    className="relative w-full max-w-sm aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={page.imageUrl}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with page number */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white/80 text-xs">
                        Tap to view details
                      </p>
                    </div>
                  </button>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={scrollPrev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={scrollNext}
            disabled={current === count - 1}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-4">
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

      {/* Current page info */}
      {currentPage && (
        <motion.div
          key={currentPage.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border bg-background"
        >
          {/* Primary keyword */}
          {currentPage.primaryKeyword && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-codex-sepia text-white uppercase tracking-wide">
                <Star className="w-3 h-3" />
                {currentPage.primaryKeyword}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(currentPage.createdAt, { addSuffix: true })}
              </span>
            </div>
          )}
          
          {/* Summary */}
          <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-3">
            {currentPage.summary}
          </p>
          
          {/* Tones */}
          <div className="flex flex-wrap gap-1.5">
            {currentPage.tone.map((t) => (
              <span key={t} className={`tone-chip text-[10px] ${getToneClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
