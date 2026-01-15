import { motion, AnimatePresence } from 'framer-motion';
import { Page, CapsulePages, Project } from '@/lib/pageService';
import { Images } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef } from 'react';

interface BookSpineProps {
  page?: Page;
  capsule?: CapsulePages;
  onClick: () => void;
  index: number;
  projects?: Project[];
  isHighlighted?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Extract the primary cue for display - this is the spine title
// Takes max 2 words from Future You Cues (user's answer from processing)
function extractPrimaryCue(page: Page): string {
  // Priority: Future You Cues (max 2 words) > User highlights > AI Keywords
  if (page.futureYouCues && page.futureYouCues.length > 0) {
    return page.futureYouCues.slice(0, 2).join(' ');
  }
  if (page.futureYouCue) {
    return page.futureYouCue.split(/\s+/).slice(0, 2).join(' ');
  }
  if (page.highlights && page.highlights.length > 0) {
    return page.highlights[0];
  }
  if (page.primaryKeyword) {
    return page.primaryKeyword;
  }
  if (page.keywords.length > 0) {
    return page.keywords[0];
  }
  return 'Untitled';
}

// Format date compactly but readable
function formatSpineDate(date: Date): string {
  return format(date, 'd MMM');
}

function formatSpineDateLong(date: Date): string {
  return format(date, "d MMM ''yy");
}

// Get spine color based on tone - natural palette only
function getSpineColor(tones: string[]): { 
  bg: string; 
  text: string;
  border: string;
} {
  const primaryTone = tones[0]?.toLowerCase() || 'reflective';
  
  const toneMap: Record<string, { bg: string; text: string; border: string }> = {
    focused: {
      bg: 'bg-gradient-to-b from-[hsl(165,25%,18%)] via-[hsl(160,25%,14%)] to-[hsl(165,30%,10%)]',
      text: 'text-[hsl(42,35%,92%)]',
      border: 'border-[hsl(38,45%,40%)]'
    },
    hopeful: {
      bg: 'bg-gradient-to-b from-[hsl(38,40%,50%)] via-[hsl(38,35%,45%)] to-[hsl(38,30%,38%)]',
      text: 'text-[hsl(160,25%,10%)]',
      border: 'border-[hsl(38,45%,60%)]'
    },
    frustrated: {
      bg: 'bg-gradient-to-b from-[hsl(160,20%,22%)] via-[hsl(160,18%,18%)] to-[hsl(160,15%,14%)]',
      text: 'text-[hsl(42,30%,85%)]',
      border: 'border-[hsl(160,15%,30%)]'
    },
    playful: {
      bg: 'bg-gradient-to-b from-[hsl(42,40%,88%)] via-[hsl(42,35%,85%)] to-[hsl(42,30%,80%)]',
      text: 'text-[hsl(160,25%,15%)]',
      border: 'border-[hsl(38,30%,70%)]'
    },
    overwhelmed: {
      bg: 'bg-gradient-to-b from-[hsl(160,12%,28%)] via-[hsl(160,10%,24%)] to-[hsl(160,8%,20%)]',
      text: 'text-[hsl(42,25%,80%)]',
      border: 'border-[hsl(160,10%,35%)]'
    },
    reflective: {
      bg: 'bg-gradient-to-b from-[hsl(42,35%,90%)] via-[hsl(40,30%,85%)] to-[hsl(38,25%,80%)]',
      text: 'text-[hsl(160,25%,15%)]',
      border: 'border-[hsl(35,20%,75%)]'
    },
    curious: {
      bg: 'bg-gradient-to-b from-[hsl(165,22%,25%)] via-[hsl(165,20%,20%)] to-[hsl(165,18%,16%)]',
      text: 'text-[hsl(42,35%,90%)]',
      border: 'border-[hsl(38,40%,45%)]'
    },
    calm: {
      bg: 'bg-gradient-to-b from-[hsl(160,18%,30%)] via-[hsl(160,15%,25%)] to-[hsl(160,12%,20%)]',
      text: 'text-[hsl(42,35%,92%)]',
      border: 'border-[hsl(160,15%,40%)]'
    }
  };
  
  return toneMap[primaryTone] || toneMap.reflective;
}

export function BookSpine({ page, capsule, onClick, index, projects = [], isHighlighted, onDragStart, onDragEnd }: BookSpineProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spineRef = useRef<HTMLButtonElement | null>(null);
  
  const representativePage = page || capsule?.pages[0];
  if (!representativePage) return null;
  
  const primaryCue = extractPrimaryCue(representativePage);
  const dateStr = formatSpineDate(representativePage.createdAt);
  const colors = getSpineColor(representativePage.tone);
  const pageCount = capsule?.pages.length || 1;
  
  // Larger spine dimensions
  const baseWidth = 64;
  const extraWidth = Math.min(pageCount * 12, 60);
  const spineWidth = baseWidth + extraWidth;
  
  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    // Always set a plain pageId for compatibility
    e.dataTransfer.setData('text/plain', representativePage.id);
    e.dataTransfer.effectAllowed = 'move';

    // Rich payload so the trash can move whole capsules
    const pageIds = capsule?.pages?.length ? capsule.pages.map(p => p.id) : [representativePage.id];
    e.dataTransfer.setData('application/x-umarise-trash', JSON.stringify({
      kind: capsule?.pages?.length ? 'capsule' : 'page',
      pageIds,
    }));

    // Set custom drag image using the spine button only
    if (spineRef.current) {
      e.dataTransfer.setDragImage(spineRef.current, spineWidth / 2, 144);
    }

    setIsDragging(true);
    setIsHovered(false); // Hide preview on drag start
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    onDragStart?.();
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  // Hover handlers with slight delay for better UX
  // Only show on desktop (no touch devices) to avoid blocking scroll
  const handleMouseEnter = () => {
    // Don't show preview on touch devices
    if ('ontouchstart' in window) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300); // 300ms delay before showing preview
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-grab active:cursor-grabbing relative"
    >
      {/* Hover Preview Panel - positioned above, clamped to viewport */}
      <AnimatePresence>
        {isHovered && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] pointer-events-none top-4 left-1/2 -translate-x-1/2"
            style={{ width: '224px' }}
          >
            <div className="bg-background/95 backdrop-blur-md rounded-xl shadow-xl border border-border/50 p-3 w-56">
              {/* Image preview */}
              <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2">
                <img 
                  src={representativePage.imageUrl} 
                  alt="Page preview"
                  className="w-full h-full object-cover"
                />
                {pageCount > 1 && (
                  <div className="absolute top-2 right-2 bg-codex-ink/80 text-codex-cream px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <Images className="w-3 h-3" />
                    {pageCount}
                  </div>
                )}
              </div>
              
              {/* Cues */}
              {representativePage.futureYouCues && representativePage.futureYouCues.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {representativePage.futureYouCues.slice(0, 2).map((cue) => (
                    <span 
                      key={cue}
                      className="text-xs px-2 py-0.5 rounded-full bg-codex-gold/20 text-codex-gold border border-codex-gold/30"
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Summary snippet */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {representativePage.oneLineHint || representativePage.summary?.slice(0, 80) || 'No summary'}
              </p>
            </div>
            
            {/* Arrow pointing down */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-background/95 border-r border-b border-border/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={spineRef}
        initial={isHighlighted ? { opacity: 0, scale: 0.8, y: -40 } : { opacity: 0, x: 20, rotateY: -15 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: 0, 
          y: 0,
          rotateY: 0 
        }}
        transition={isHighlighted ? { 
          type: 'spring', 
          stiffness: 80, 
          damping: 12,
          delay: 0.1
        } : { 
          delay: index * 0.05, 
          type: 'spring', 
          stiffness: 100 
        }}
        whileHover={{ 
          y: -8, 
          transition: { duration: 0.4, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          relative flex-shrink-0 h-72 rounded-sm
          ${colors.bg}
          border-l-2 ${colors.border}
          overflow-hidden
          group
          ${isHighlighted ? 'ring-2 ring-codex-gold ring-offset-2 ring-offset-background' : ''}
        `}
        style={{ 
          width: spineWidth,
          boxShadow: '0 8px 32px -8px rgba(0,0,0,0.25), 0 4px 16px -4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
      {/* Idle breathing glow - golden aura */}
      <motion.div
        className="absolute -inset-1 rounded-sm pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(38 45% 50% / 0.15) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Hover intensified glow */}
      <motion.div
        className="absolute -inset-2 rounded-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(38 45% 55% / 0.3) 0%, transparent 60%)',
          filter: 'blur(12px)'
        }}
      />

      {/* Highlighted glow animation */}
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: 3,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 bg-codex-gold/30 pointer-events-none"
        />
      )}
      
      {/* Spine texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 4px,
            rgba(0,0,0,0.1) 4px,
            rgba(0,0,0,0.1) 8px
          )`
        }}
      />
      
      {/* Primary Cue - main title (vertical) */}
      <div className="absolute inset-0 flex items-center justify-center px-2 pb-14">
        <span 
          className={`
            ${colors.text} font-serif text-base font-semibold
            writing-mode-vertical
            text-center leading-tight
            transform rotate-180
            drop-shadow-sm
          `}
          style={{ 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            maxHeight: '80%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {primaryCue}
        </span>
      </div>
      
      {/* Date - at bottom, larger for readability */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 ${colors.text} opacity-80`}>
        <span className="text-xs font-semibold tracking-wide">
          {dateStr}
        </span>
      </div>
      
      {/* Page count indicator for capsules */}
      {pageCount > 1 && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 ${colors.text} opacity-50`}>
          <Images className="w-3 h-3" />
          <span className="text-[9px] font-bold">{pageCount}</span>
        </div>
      )}
      
      {/* Top edge highlight - subtle shine */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/20 to-transparent" />
      
      {/* Bottom shadow - grounding */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent" />
      
      {/* Inner glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-codex-gold/5 via-transparent to-codex-gold/10" />
      </motion.button>
    </div>
  );
}
