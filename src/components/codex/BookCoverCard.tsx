import { motion } from 'framer-motion';
import { useState } from 'react';
import { Page, CapsulePages } from '@/lib/pageService';
import { formatDistanceToNow } from 'date-fns';
import { Images, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverCardProps {
  page?: Page;
  capsule?: CapsulePages;
  onClick: () => void;
  onDelete?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

// Extract the most compelling title from OCR text or summary
function extractTitle(page: Page): string {
  // Priority 1: Primary keyword as thematic anchor
  if (page.primaryKeyword) {
    return page.primaryKeyword;
  }
  
  // Priority 2: First sentence that's a question (most engaging)
  const sentences = page.ocrText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const question = sentences.find(s => s.includes('?'));
  if (question) {
    return question.trim().slice(0, 60) + (question.length > 60 ? '...' : '');
  }
  
  // Priority 3: First impactful short sentence from OCR
  const shortSentence = sentences.find(s => s.trim().length > 15 && s.trim().length < 50);
  if (shortSentence) {
    return shortSentence.trim();
  }
  
  // Priority 4: First keyword as title
  if (page.keywords.length > 0) {
    return page.keywords[0];
  }
  
  // Priority 5: Truncated summary
  const summaryWords = page.summary.split(' ').slice(0, 5).join(' ');
  return summaryWords + '...';
}

// Extract a subtitle/hook from the content
function extractSubtitle(page: Page): string {
  // Take a fragment from the summary that's different from the title
  const words = page.summary.split(' ');
  if (words.length > 8) {
    return words.slice(0, 8).join(' ') + '...';
  }
  return page.summary;
}

// Get visual treatment based on primary tone - natural palette only
function getToneVisuals(tones: string[]): { 
  bg: string; 
  gradient: string;
  text: string;
  accent: string;
} {
  const primaryTone = tones[0]?.toLowerCase() || 'reflective';
  
  // Natural color palette: teal, forest, cream, gold, stone variations
  const toneMap: Record<string, { bg: string; gradient: string; text: string; accent: string }> = {
    focused: {
      bg: 'bg-[hsl(165,25%,14%)]',
      gradient: 'from-[hsl(165,25%,18%)] via-[hsl(160,25%,14%)] to-[hsl(165,30%,10%)]',
      text: 'text-[hsl(42,35%,92%)]',
      accent: 'text-[hsl(38,45%,55%)]'
    },
    hopeful: {
      bg: 'bg-[hsl(42,40%,92%)]',
      gradient: 'from-[hsl(42,45%,94%)] via-[hsl(40,40%,90%)] to-[hsl(38,35%,88%)]',
      text: 'text-[hsl(160,25%,15%)]',
      accent: 'text-[hsl(38,45%,40%)]'
    },
    frustrated: {
      bg: 'bg-[hsl(160,18%,16%)]',
      gradient: 'from-[hsl(160,20%,20%)] via-[hsl(160,18%,16%)] to-[hsl(160,15%,12%)]',
      text: 'text-[hsl(42,30%,88%)]',
      accent: 'text-[hsl(38,35%,50%)]'
    },
    playful: {
      bg: 'bg-[hsl(42,35%,90%)]',
      gradient: 'from-[hsl(42,40%,94%)] via-[hsl(40,35%,90%)] to-[hsl(38,30%,86%)]',
      text: 'text-[hsl(160,25%,15%)]',
      accent: 'text-[hsl(38,40%,45%)]'
    },
    overwhelmed: {
      bg: 'bg-[hsl(160,10%,22%)]',
      gradient: 'from-[hsl(160,12%,26%)] via-[hsl(160,10%,22%)] to-[hsl(160,8%,18%)]',
      text: 'text-[hsl(42,25%,82%)]',
      accent: 'text-[hsl(38,30%,50%)]'
    },
    reflective: {
      bg: 'bg-[hsl(42,35%,94%)]',
      gradient: 'from-[hsl(42,40%,96%)] via-[hsl(40,35%,93%)] to-[hsl(38,30%,90%)]',
      text: 'text-[hsl(160,25%,15%)]',
      accent: 'text-[hsl(38,40%,40%)]'
    },
    curious: {
      bg: 'bg-[hsl(165,20%,18%)]',
      gradient: 'from-[hsl(165,22%,22%)] via-[hsl(165,20%,18%)] to-[hsl(165,18%,14%)]',
      text: 'text-[hsl(42,35%,92%)]',
      accent: 'text-[hsl(38,45%,55%)]'
    },
    calm: {
      bg: 'bg-[hsl(160,15%,24%)]',
      gradient: 'from-[hsl(160,18%,28%)] via-[hsl(160,15%,24%)] to-[hsl(160,12%,20%)]',
      text: 'text-[hsl(42,35%,92%)]',
      accent: 'text-[hsl(38,40%,50%)]'
    }
  };
  
  return toneMap[primaryTone] || toneMap.reflective;
}

export function BookCoverCard({ 
  page, 
  capsule, 
  onClick, 
  onDelete,
  isSelectable = false,
  isSelected = false,
  onToggleSelect
}: BookCoverCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get the representative page (first page for capsules)
  const representativePage = page || capsule?.pages[0];
  if (!representativePage) return null;
  
  const title = extractTitle(representativePage);
  const subtitle = extractSubtitle(representativePage);
  const visuals = getToneVisuals(representativePage.tone);
  const pageCount = capsule?.pages.length || 1;
  const allTones = capsule 
    ? [...new Set(capsule.pages.flatMap(p => p.tone))]
    : representativePage.tone;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group relative", isSelected && "ring-2 ring-codex-gold rounded-2xl")}
    >
      {/* Selection checkbox */}
      {isSelectable && (
        <button
          onClick={handleCheckboxClick}
          className={cn(
            "absolute left-2 top-2 z-10 w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
            isSelected 
              ? "bg-codex-gold border-codex-gold text-codex-ink-deep" 
              : "bg-background/90 border-muted-foreground/40 hover:border-codex-gold/70"
          )}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </button>
      )}
      
      <button
        onClick={onClick}
        className={`
          w-full text-left rounded-2xl overflow-hidden
          bg-gradient-to-br ${visuals.gradient}
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-[1.02] active:scale-[0.99]
          min-h-[140px] relative
        `}
      >
        {/* Book spine accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${visuals.bg} opacity-60`} />
        
        {/* Main content area - with thumbnail */}
        <div className="flex">
          {/* Text content */}
          <div className="flex-1 p-5 pl-6 flex flex-col justify-between min-h-[140px]">
            {/* Title area */}
            <div>
              <h3 className={`font-serif text-xl font-semibold leading-tight ${visuals.text} mb-1.5`}>
                {title}
              </h3>
              <p className={`text-sm ${visuals.accent} font-light italic leading-relaxed opacity-80 line-clamp-2`}>
                {subtitle}
              </p>
              
              {/* Future You Cues - most important */}
              {representativePage.futureYouCues && representativePage.futureYouCues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {representativePage.futureYouCues.slice(0, 3).map((cue) => (
                    <span 
                      key={cue}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        'bg-background/15 border border-border/30',
                        visuals.text
                      )}
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Bottom area - minimal metadata */}
            <div className="flex items-end justify-between mt-3">
              <div className={`text-xs ${visuals.accent} opacity-60`}>
                {formatDistanceToNow(representativePage.createdAt, { addSuffix: true })}
              </div>
              
              {pageCount > 1 && (
                <div className={`flex items-center gap-1 text-xs ${visuals.accent} opacity-70`}>
                  <Images className="w-3.5 h-3.5" />
                  <span>{pageCount}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Thumbnail - original page preview */}
          <div className="w-24 flex-shrink-0 relative overflow-hidden">
            <img 
              src={representativePage.imageUrl} 
              alt="Page preview"
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
            />
            {/* Fade overlay to blend with card */}
            <div className={`absolute inset-0 bg-gradient-to-r ${visuals.gradient} opacity-60`} />
          </div>
        </div>
        
        {/* Subtle page texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </button>
      
      {/* Expandable details on hover/tap */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        className="overflow-hidden"
      >
        <div className="pt-3 px-4 pb-4 space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {representativePage.summary}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allTones.slice(0, 3).map(tone => (
              <span 
                key={tone}
                className="text-xs text-muted-foreground/70 italic"
              >
                {tone}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Expand toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className={`
          w-full flex items-center justify-center py-1.5
          text-muted-foreground/50 hover:text-muted-foreground
          transition-colors
        `}
      >
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </motion.div>
  );
}
