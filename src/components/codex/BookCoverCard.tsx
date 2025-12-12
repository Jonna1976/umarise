import { motion } from 'framer-motion';
import { useState } from 'react';
import { Page, CapsulePages } from '@/lib/pageService';
import { formatDistanceToNow } from 'date-fns';
import { Images, ChevronDown } from 'lucide-react';

interface BookCoverCardProps {
  page?: Page;
  capsule?: CapsulePages;
  onClick: () => void;
  onDelete?: () => void;
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

// Get visual treatment based on primary tone
function getToneVisuals(tones: string[]): { 
  bg: string; 
  gradient: string;
  text: string;
  accent: string;
} {
  const primaryTone = tones[0]?.toLowerCase() || 'reflective';
  
  const toneMap: Record<string, { bg: string; gradient: string; text: string; accent: string }> = {
    focused: {
      bg: 'bg-slate-900',
      gradient: 'from-slate-800 via-slate-900 to-slate-950',
      text: 'text-slate-100',
      accent: 'text-blue-400'
    },
    hopeful: {
      bg: 'bg-amber-50',
      gradient: 'from-amber-100 via-orange-50 to-yellow-50',
      text: 'text-amber-900',
      accent: 'text-amber-600'
    },
    frustrated: {
      bg: 'bg-rose-950',
      gradient: 'from-rose-900 via-rose-950 to-red-950',
      text: 'text-rose-100',
      accent: 'text-rose-400'
    },
    playful: {
      bg: 'bg-violet-50',
      gradient: 'from-violet-100 via-purple-50 to-pink-50',
      text: 'text-violet-900',
      accent: 'text-violet-500'
    },
    overwhelmed: {
      bg: 'bg-gray-800',
      gradient: 'from-gray-700 via-gray-800 to-gray-900',
      text: 'text-gray-200',
      accent: 'text-gray-400'
    },
    reflective: {
      bg: 'bg-stone-100',
      gradient: 'from-stone-100 via-stone-50 to-amber-50',
      text: 'text-stone-800',
      accent: 'text-stone-500'
    },
    curious: {
      bg: 'bg-cyan-50',
      gradient: 'from-cyan-50 via-sky-50 to-blue-50',
      text: 'text-cyan-900',
      accent: 'text-cyan-600'
    },
    calm: {
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-50 via-green-50 to-teal-50',
      text: 'text-emerald-900',
      accent: 'text-emerald-600'
    }
  };
  
  return toneMap[primaryTone] || toneMap.reflective;
}

export function BookCoverCard({ page, capsule, onClick, onDelete }: BookCoverCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <button
        onClick={onClick}
        className={`
          w-full text-left rounded-2xl overflow-hidden
          bg-gradient-to-br ${visuals.gradient}
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-[1.02] active:scale-[0.99]
          min-h-[160px] relative
        `}
      >
        {/* Book spine accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${visuals.bg} opacity-60`} />
        
        {/* Main content area */}
        <div className="p-6 pl-8 flex flex-col justify-between h-full min-h-[160px]">
          {/* Title area */}
          <div>
            <h3 className={`font-serif text-2xl font-semibold leading-tight ${visuals.text} mb-2`}>
              {title}
            </h3>
            <p className={`text-sm ${visuals.accent} font-light italic leading-relaxed opacity-80`}>
              {subtitle}
            </p>
          </div>
          
          {/* Bottom area - minimal metadata */}
          <div className="flex items-end justify-between mt-4">
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
