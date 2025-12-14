import { motion } from 'framer-motion';
import { Page, CapsulePages, Project } from '@/lib/pageService';
import { Images, FolderOpen } from 'lucide-react';

interface BookSpineProps {
  page?: Page;
  capsule?: CapsulePages;
  onClick: () => void;
  index: number;
  projects?: Project[];
  isHighlighted?: boolean;
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

// Get spine color based on tone - natural palette only
function getSpineColor(tones: string[]): { 
  bg: string; 
  text: string;
  border: string;
} {
  const primaryTone = tones[0]?.toLowerCase() || 'reflective';
  
  // Natural color palette: teal, forest, cream, gold, stone variations
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
  
  const title = extractSpineTitle(representativePage);
  const colors = getSpineColor(representativePage.tone);
  const pageCount = capsule?.pages.length || 1;
  
  // Find project name if page has a project
  const projectId = representativePage.projectId;
  const project = projectId ? projects.find(p => p.id === projectId) : null;
  
  // Spine width varies slightly based on content/page count
  const baseWidth = 44;
  const extraWidth = Math.min(pageCount * 4, 20);
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
      
      {/* Project label at top */}
      {project && (
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 ${colors.text} opacity-80`}>
          <FolderOpen className="w-2.5 h-2.5" />
          <span 
            className="text-[7px] font-bold uppercase tracking-wide max-w-[30px] truncate"
            title={project.name}
          >
            {project.name.slice(0, 4)}
          </span>
        </div>
      )}
      
      {/* Title - vertical text */}
      <div className={`absolute inset-0 flex items-center justify-center p-2 ${project ? 'pt-6' : ''} ${representativePage.futureYouCue ? 'pb-8' : ''}`}>
        <span 
          className={`
            ${colors.text} font-serif text-sm font-semibold
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
      
      {/* Future You Cue - tiny line at bottom */}
      {representativePage.futureYouCue && (
        <div 
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] text-center ${colors.text} opacity-60`}
          title={representativePage.futureYouCue}
        >
          <span className="text-[6px] italic truncate block px-0.5">
            {representativePage.futureYouCue.length > 20 
              ? representativePage.futureYouCue.slice(0, 20) + '…' 
              : representativePage.futureYouCue}
          </span>
        </div>
      )}
      
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
