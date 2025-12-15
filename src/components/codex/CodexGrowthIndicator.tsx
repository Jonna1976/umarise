/**
 * Codex Growth Indicator
 * 
 * Visual representation of "compounding value" - shows users
 * how their codex is growing and what unlocks at each milestone.
 */

import { motion } from 'framer-motion';
import { Sparkles, Brain, Star, Compass, BookOpen, TrendingUp } from 'lucide-react';

interface CodexGrowthIndicatorProps {
  pageCount: number;
  compact?: boolean;
}

const MILESTONES = [
  { count: 1, label: 'First capture', icon: BookOpen, color: 'text-codex-gold' },
  { count: 2, label: 'Threads emerge', icon: Compass, color: 'text-codex-gold' },
  { count: 3, label: 'Patterns unlock', icon: Brain, color: 'text-codex-sepia' },
  { count: 5, label: 'Personality reveal', icon: Star, color: 'text-amber-500' },
  { count: 10, label: 'Deep insights', icon: Sparkles, color: 'text-purple-500' },
];

export function CodexGrowthIndicator({ pageCount, compact = false }: CodexGrowthIndicatorProps) {
  // Find current milestone and next
  const currentMilestoneIndex = MILESTONES.findIndex(m => pageCount < m.count);
  const nextMilestone = MILESTONES[currentMilestoneIndex] || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES[currentMilestoneIndex - 1];
  
  // Calculate progress to next milestone
  const prevCount = prevMilestone?.count || 0;
  const progress = nextMilestone 
    ? Math.min(100, ((pageCount - prevCount) / (nextMilestone.count - prevCount)) * 100)
    : 100;

  // Has unlocked all milestones?
  const fullyUnlocked = pageCount >= MILESTONES[MILESTONES.length - 1].count;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          {MILESTONES.slice(0, 4).map((milestone, i) => {
            const Icon = milestone.icon;
            const unlocked = pageCount >= milestone.count;
            return (
              <motion.div
                key={milestone.count}
                initial={false}
                animate={{ 
                  scale: unlocked ? 1 : 0.8,
                  opacity: unlocked ? 1 : 0.3 
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  unlocked ? 'bg-codex-gold/20' : 'bg-muted'
                }`}
                style={{ zIndex: MILESTONES.length - i }}
              >
                <Icon className={`w-3 h-3 ${unlocked ? milestone.color : 'text-muted-foreground'}`} />
              </motion.div>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground">
          {pageCount} pages
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-codex-gold/10 to-amber-500/5 border border-codex-gold/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-codex-gold" />
          <span className="text-sm font-medium text-foreground">Lasting Memory</span>
        </div>
        <span className="text-lg font-serif font-bold text-codex-gold">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
      </div>

      {/* Progress bar */}
      {!fullyUnlocked && (
        <div className="mb-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-codex-gold to-amber-400 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {nextMilestone.count - pageCount} more to unlock: <span className="text-foreground font-medium">{nextMilestone.label}</span>
          </p>
        </div>
      )}

      {/* Milestones */}
      <div className="flex justify-between">
        {MILESTONES.map((milestone, index) => {
          const Icon = milestone.icon;
          const unlocked = pageCount >= milestone.count;
          const isNext = !unlocked && (index === 0 || pageCount >= MILESTONES[index - 1].count);
          
          return (
            <motion.div
              key={milestone.count}
              className="flex flex-col items-center gap-1"
              animate={isNext ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: isNext ? Infinity : 0 }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  unlocked 
                    ? 'bg-codex-gold/20 ring-2 ring-codex-gold/30' 
                    : isNext
                      ? 'bg-muted ring-2 ring-dashed ring-codex-gold/50'
                      : 'bg-muted/50'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 ${
                    unlocked ? milestone.color : 'text-muted-foreground/50'
                  }`} 
                />
              </div>
              <span className={`text-[10px] text-center ${
                unlocked ? 'text-foreground' : 'text-muted-foreground/50'
              }`}>
                {milestone.count}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Encouraging message */}
      {pageCount < 5 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-center text-muted-foreground mt-3 italic"
        >
          {pageCount === 0 && "Start capturing to build your memory..."}
          {pageCount === 1 && "Great start! One more page and I'll find connections..."}
          {pageCount === 2 && "Threads are forming. Keep going!"}
          {pageCount === 3 && "Patterns unlocked! 2 more for your personality profile..."}
          {pageCount === 4 && "Almost there! One more page reveals who you are..."}
        </motion.p>
      )}

      {fullyUnlocked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center text-codex-gold mt-3 font-medium"
        >
          ✨ All insights unlocked. Your codex grows wiser with each page.
        </motion.p>
      )}
    </motion.div>
  );
}
