import { motion } from 'framer-motion';
import { Page, CapsulePages, Project } from '@/lib/pageService';
import { Images } from 'lucide-react';
import { format } from 'date-fns';

interface BookSpineProps {
  page?: Page;
  capsule?: CapsulePages;
  onClick: () => void;
  index: number;
  projects?: Project[];
  isHighlighted?: boolean;
}

// Extract the primary cue for display
function extractPrimaryCue(page: Page): string {
  // Priority: Future You Cues > Primary Keyword > First Keyword
  if (page.futureYouCues && page.futureYouCues.length > 0) {
    return page.futureYouCues[0];
  }
  if (page.futureYouCue) {
    return page.futureYouCue;
  }
  if (page.primaryKeyword) {
    return page.primaryKeyword;
  }
  if (page.keywords.length > 0) {
    return page.keywords[0];
  }
  return 'Untitled';
}

// Format date compactly
function formatSpineDate(date: Date): string {
  return format(date, 'd MMM');
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

export function BookSpine({ page, capsule, onClick, index, projects = [], isHighlighted }: BookSpineProps) {
  const representativePage = page || capsule?.pages[0];
  if (!representativePage) return null;
  
  const primaryCue = extractPrimaryCue(representativePage);
  const dateStr = formatSpineDate(representativePage.createdAt);
  const colors = getSpineColor(representativePage.tone);
  const pageCount = capsule?.pages.length || 1;
  
  // Larger spine dimensions
  const baseWidth = 56;
  const extraWidth = Math.min(pageCount * 10, 50);
  const spineWidth = baseWidth + extraWidth;

  return (
    <motion.button
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
        y: -12, 
        scale: 1.03,
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
        transition: { duration: 0.25 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative flex-shrink-0 h-64 rounded-sm
        ${colors.bg}
        border-l-2 ${colors.border}
        shadow-lg hover:shadow-2xl
        transition-shadow duration-300
        overflow-hidden
        group
        ${isHighlighted ? 'ring-2 ring-codex-gold ring-offset-2 ring-offset-background' : ''}
      `}
      style={{ width: spineWidth }}
    >
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
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.15) 3px,
            rgba(0,0,0,0.15) 6px
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
      
      {/* Date - at bottom */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 ${colors.text} opacity-70`}>
        <span className="text-[10px] font-medium tracking-wide">
          {dateStr}
        </span>
      </div>
      
      {/* Page count indicator for capsules */}
      {pageCount > 1 && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 ${colors.text} opacity-60`}>
          <Images className="w-3 h-3" />
          <span className="text-[9px] font-bold">{pageCount}</span>
        </div>
      )}
      
      {/* Top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/15" />
      
      {/* Bottom shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-black/15" />
      
      {/* Hover glow - golden breathing effect */}
      <motion.div 
        className="absolute inset-0 bg-codex-gold/0 group-hover:bg-codex-gold/10 transition-colors duration-300 pointer-events-none"
      />
    </motion.button>
  );
}
