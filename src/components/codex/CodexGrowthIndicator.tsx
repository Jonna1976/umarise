/**
 * Codex Growth Indicator
 * 
 * Minimal icon with tooltip showing progress to next milestone.
 * Compact by default - shows countdown badge with explanation on hover.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Star, Compass, BookOpen } from 'lucide-react';

interface CodexGrowthIndicatorProps {
  pageCount: number;
}

const MILESTONES = [
  { count: 1, label: 'First capture', icon: BookOpen, color: 'text-codex-gold' },
  { count: 2, label: 'Threads emerge', icon: Compass, color: 'text-codex-gold' },
  { count: 3, label: 'Patterns unlock', icon: Brain, color: 'text-codex-sepia' },
  { count: 5, label: 'Personality reveal', icon: Star, color: 'text-amber-500' },
  { count: 10, label: 'Deep insights', icon: Sparkles, color: 'text-purple-500' },
];

export function CodexGrowthIndicator({ pageCount }: CodexGrowthIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Find next milestone
  const nextMilestoneIndex = MILESTONES.findIndex(m => pageCount < m.count);
  const nextMilestone = MILESTONES[nextMilestoneIndex];
  const fullyUnlocked = pageCount >= MILESTONES[MILESTONES.length - 1].count;
  
  // Calculate remaining
  const remaining = nextMilestone ? nextMilestone.count - pageCount : 0;
  
  // Get appropriate icon
  const CurrentIcon = fullyUnlocked 
    ? Sparkles 
    : (nextMilestone?.icon || Sparkles);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Compact icon with badge */}
      <motion.div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
          ${fullyUnlocked 
            ? 'bg-codex-gold/20 ring-1 ring-codex-gold/30' 
            : 'bg-muted/50 ring-1 ring-border/50'
          }
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <CurrentIcon 
          className={`w-4 h-4 ${fullyUnlocked ? 'text-codex-gold' : 'text-muted-foreground'}`} 
        />
        
        {/* Countdown badge */}
        {!fullyUnlocked && remaining > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-codex-gold text-[9px] font-bold text-background flex items-center justify-center">
            {remaining}
          </div>
        )}
        
        {/* Unlocked checkmark */}
        {fullyUnlocked && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-[9px] text-white flex items-center justify-center"
          >
            ✓
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[180px] text-center">
              {fullyUnlocked ? (
                <>
                  <p className="text-xs font-medium text-codex-gold mb-1">✨ All unlocked</p>
                  <p className="text-[10px] text-muted-foreground">
                    Deep insights ready
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-foreground mb-1">
                    {remaining} to go
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Next: <span className="text-foreground">{nextMilestone?.label}</span>
                  </p>
                </>
              )}
              
              {/* Mini progress dots */}
              <div className="flex justify-center gap-1.5 mt-2">
                {MILESTONES.map((m) => (
                  <div
                    key={m.count}
                    className={`w-1.5 h-1.5 rounded-full ${
                      pageCount >= m.count ? 'bg-codex-gold' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
