import { motion } from 'framer-motion';
import { Page, CapsulePages } from '@/lib/pageService';
import { Images } from 'lucide-react';

interface BookSpineProps {
  page?: Page;
  capsule?: CapsulePages;
  onClick: () => void;
  index: number;
}

// Extract a short title for the spine
function extractSpineTitle(page: Page): string {
  if (page.primaryKeyword) {
    return page.primaryKeyword;
  }
  if (page.keywords.length > 0) {
    return page.keywords[0];
  }
  // Take first few words of summary
  return page.summary.split(' ').slice(0, 3).join(' ');
}

// Get spine color based on tone
function getSpineColor(tones: string[]): { 
  bg: string; 
  text: string;
  border: string;
} {
  const primaryTone = tones[0]?.toLowerCase() || 'reflective';
  
  const toneMap: Record<string, { bg: string; text: string; border: string }> = {
    focused: {
      bg: 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900',
      text: 'text-slate-100',
      border: 'border-slate-600'
    },
    hopeful: {
      bg: 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600',
      text: 'text-amber-950',
      border: 'border-amber-300'
    },
    frustrated: {
      bg: 'bg-gradient-to-b from-rose-600 via-rose-700 to-rose-800',
      text: 'text-rose-100',
      border: 'border-rose-500'
    },
    playful: {
      bg: 'bg-gradient-to-b from-violet-400 via-violet-500 to-violet-600',
      text: 'text-violet-950',
      border: 'border-violet-300'
    },
    overwhelmed: {
      bg: 'bg-gradient-to-b from-gray-500 via-gray-600 to-gray-700',
      text: 'text-gray-100',
      border: 'border-gray-400'
    },
    reflective: {
      bg: 'bg-gradient-to-b from-stone-300 via-stone-400 to-stone-500',
      text: 'text-stone-900',
      border: 'border-stone-200'
    },
    curious: {
      bg: 'bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-600',
      text: 'text-cyan-950',
      border: 'border-cyan-300'
    },
    calm: {
      bg: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600',
      text: 'text-emerald-950',
      border: 'border-emerald-300'
    }
  };
  
  return toneMap[primaryTone] || toneMap.reflective;
}

export function BookSpine({ page, capsule, onClick, index }: BookSpineProps) {
  const representativePage = page || capsule?.pages[0];
  if (!representativePage) return null;
  
  const title = extractSpineTitle(representativePage);
  const colors = getSpineColor(representativePage.tone);
  const pageCount = capsule?.pages.length || 1;
  
  // Spine width varies slightly based on content/page count
  const baseWidth = 44;
  const extraWidth = Math.min(pageCount * 4, 20);
  const spineWidth = baseWidth + extraWidth;

  return (
    <motion.button
      initial={{ opacity: 0, x: 20, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative flex-shrink-0 h-48 rounded-sm
        ${colors.bg}
        border-l-2 ${colors.border}
        shadow-lg hover:shadow-xl
        transition-shadow duration-300
        overflow-hidden
        group
      `}
      style={{ width: spineWidth }}
    >
      {/* Spine texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          )`
        }}
      />
      
      {/* Title - vertical text */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <span 
          className={`
            ${colors.text} font-serif text-xs font-medium
            writing-mode-vertical
            text-center leading-tight
            line-clamp-3
            transform rotate-180
          `}
          style={{ 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            maxHeight: '90%'
          }}
        >
          {title}
        </span>
      </div>
      
      {/* Page count indicator for capsules */}
      {pageCount > 1 && (
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 ${colors.text} opacity-70`}>
          <Images className="w-2.5 h-2.5" />
          <span className="text-[8px] font-bold">{pageCount}</span>
        </div>
      )}
      
      {/* Top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
      
      {/* Bottom shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20" />
      
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
    </motion.button>
  );
}
