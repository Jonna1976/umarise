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
      className="relative flex items-center gap-2 pt-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Compact icon with badge */}
      <motion.div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center cursor-pointer relative
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
        
        {/* Countdown badge - positioned with overflow visible */}
        {!fullyUnlocked && remaining > 0 && (
          <div className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-codex-gold text-[10px] font-bold text-background flex items-center justify-center">
            {remaining}
          </div>
        )}
        
        {/* Unlocked checkmark */}
        {fullyUnlocked && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-[10px] text-white flex items-center justify-center"
          >
            ✓
          </motion.div>
        )}
      </motion.div>

      {/* Inline tooltip - shows next to icon */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 whitespace-nowrap"
          >
            {fullyUnlocked ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-codex-gold">✨ All unlocked</span>
                <span className="text-[10px] text-muted-foreground">Deep insights ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-medium text-foreground">{remaining} to go</p>
                  <p className="text-[10px] text-muted-foreground">
                    Next: <span className="text-foreground">{nextMilestone?.label}</span>
                  </p>
                </div>
                {/* Mini progress dots */}
                <div className="flex gap-1">
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
