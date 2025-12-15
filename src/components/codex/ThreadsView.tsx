import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Calendar,
  ChevronRight,
  X,
  Compass
} from 'lucide-react';
import { Page } from '@/lib/pageService';
import { format, differenceInDays, differenceInMonths } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ThreadsViewProps {
  pages: Page[];
}

interface Thread {
  keyword: string;
  firstSeen: Date;
  lastSeen: Date;
  ageInDays: number;
  ageLabel: string;
  totalOccurrences: number;
  uniqueMonths: number;
  monthlyOccurrences: { month: string; count: number; date: Date }[];
  strength: 'strong' | 'growing' | 'emerging';
  relatedKeywords: string[];
  sampleSummaries: string[];
}

interface ThreadDetailProps {
  thread: Thread;
  onClose: () => void;
}

// Abstract thread visualization using canvas
function ThreadVisualization({ 
  threads, 
  heroThread,
  onThreadClick 
}: { 
  threads: Thread[];
  heroThread: Thread | null;
  onThreadClick: (thread: Thread) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredThread, setHoveredThread] = useState<Thread | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: 400 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || threads.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Thread positions for interaction
    const threadPositions: { thread: Thread; x: number; y: number; radius: number }[] = [];

    const animate = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw ambient flowing lines (background atmosphere)
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsl(24, 60%, ${35 + i * 5}%)`;
        ctx.lineWidth = 0.5;
        
        const startY = 50 + i * 70;
        ctx.moveTo(0, startY + Math.sin(t + i) * 20);
        
        for (let x = 0; x <= dimensions.width; x += 5) {
          const wave = Math.sin((x / 80) + t + i * 0.5) * 15;
          ctx.lineTo(x, startY + wave + Math.sin(t * 0.5 + x / 100) * 10);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Calculate positions for threads around center
      const maxRadius = Math.min(centerX, centerY) - 60;
      threadPositions.length = 0;

      threads.forEach((thread, i) => {
        const isHero = heroThread && thread.keyword === heroThread.keyword;
        const angle = (i / threads.length) * Math.PI * 2 - Math.PI / 2;
        
        // Position: hero in center, others orbit around
        let x, y, baseRadius;
        
        if (isHero) {
          x = centerX;
          y = centerY;
          baseRadius = 45 + thread.totalOccurrences * 2;
        } else {
          const distFromCenter = maxRadius * 0.5 + (1 - (thread.totalOccurrences / 20)) * maxRadius * 0.35;
          x = centerX + Math.cos(angle) * distFromCenter;
          y = centerY + Math.sin(angle) * distFromCenter;
          baseRadius = 15 + thread.totalOccurrences * 1.5;
        }

        // Subtle breathing animation
        const breathe = Math.sin(t * 1.5 + i) * 2;
        const radius = Math.min(baseRadius + breathe, 60);

        threadPositions.push({ thread, x, y, radius });
      });

      // Draw connections from hero to other threads (the "red threads")
      if (heroThread) {
        const heroPos = threadPositions.find(tp => tp.thread.keyword === heroThread.keyword);
        if (heroPos) {
          threadPositions.forEach((tp, i) => {
            if (tp.thread.keyword === heroThread.keyword) return;

            // Check if this thread shares keywords with hero
            const connection = tp.thread.relatedKeywords.some(
              rk => heroThread.keyword.toLowerCase().includes(rk.toLowerCase()) ||
                    rk.toLowerCase().includes(heroThread.keyword.toLowerCase())
            ) || heroThread.relatedKeywords.includes(tp.thread.keyword);

            const strengthOpacity = tp.thread.strength === 'strong' ? 0.5 : 
                                   tp.thread.strength === 'growing' ? 0.3 : 0.15;

            // Draw curved connection line
            ctx.beginPath();
            ctx.strokeStyle = `hsla(0, 65%, 50%, ${connection ? strengthOpacity + 0.2 : strengthOpacity})`;
            ctx.lineWidth = connection ? 2 : 1;

            // Control point for curve
            const midX = (heroPos.x + tp.x) / 2;
            const midY = (heroPos.y + tp.y) / 2;
            const perpX = -(tp.y - heroPos.y) * 0.2;
            const perpY = (tp.x - heroPos.x) * 0.2;
            const wave = Math.sin(t + i) * 5;

            ctx.moveTo(heroPos.x, heroPos.y);
            ctx.quadraticCurveTo(
              midX + perpX + wave, 
              midY + perpY + wave, 
              tp.x, 
              tp.y
            );
            ctx.stroke();

            // Draw small nodes along the thread line (like timeline markers)
            if (tp.thread.strength !== 'emerging') {
              const nodes = tp.thread.uniqueMonths;
              for (let n = 1; n <= Math.min(nodes, 4); n++) {
                const progress = n / (nodes + 1);
                const bezierT = progress;
                const nodeX = (1-bezierT)*(1-bezierT)*heroPos.x + 
                              2*(1-bezierT)*bezierT*(midX + perpX) + 
                              bezierT*bezierT*tp.x;
                const nodeY = (1-bezierT)*(1-bezierT)*heroPos.y + 
                              2*(1-bezierT)*bezierT*(midY + perpY) + 
                              bezierT*bezierT*tp.y;
                
                ctx.beginPath();
                ctx.fillStyle = `hsla(0, 65%, 50%, ${strengthOpacity * 1.5})`;
                ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        }
      }

      // Draw thread nodes
      threadPositions.forEach((tp, i) => {
        const { thread, x, y, radius } = tp;
        const isHero = heroThread && thread.keyword === heroThread.keyword;
        const isHovered = hoveredThread?.keyword === thread.keyword;

        // Glow effect
        if (isHero || isHovered) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
          gradient.addColorStop(0, isHero ? 'hsla(0, 70%, 50%, 0.3)' : 'hsla(24, 60%, 50%, 0.2)');
          gradient.addColorStop(1, 'hsla(0, 70%, 50%, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        const nodeColor = isHero 
          ? `hsla(0, 70%, 50%, ${0.8 + Math.sin(t * 2) * 0.1})` 
          : thread.strength === 'strong' 
            ? 'hsla(0, 60%, 55%, 0.7)'
            : thread.strength === 'growing'
              ? 'hsla(38, 65%, 50%, 0.7)'
              : 'hsla(30, 30%, 60%, 0.5)';
        
        ctx.fillStyle = nodeColor;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring pattern (data-humanisme style)
        if (isHero || thread.strength === 'strong') {
          ctx.strokeStyle = 'hsla(40, 40%, 98%, 0.4)';
          ctx.lineWidth = 1;
          for (let ring = 1; ring <= 3; ring++) {
            ctx.beginPath();
            ctx.arc(x, y, radius * (0.3 + ring * 0.2), 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Small decorative dots around hero (representing occurrences)
        if (isHero) {
          const dotCount = Math.min(thread.totalOccurrences, 12);
          for (let d = 0; d < dotCount; d++) {
            const dotAngle = (d / dotCount) * Math.PI * 2 + t * 0.3;
            const dotDist = radius + 12 + Math.sin(t * 2 + d) * 3;
            const dotX = x + Math.cos(dotAngle) * dotDist;
            const dotY = y + Math.sin(dotAngle) * dotDist;
            
            ctx.beginPath();
            ctx.fillStyle = 'hsla(0, 70%, 55%, 0.6)';
            ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Thread keyword label
        ctx.fillStyle = isHero 
          ? 'hsl(40, 40%, 98%)' 
          : isHovered 
            ? 'hsl(30, 10%, 25%)' 
            : 'hsl(30, 10%, 35%)';
        ctx.font = isHero 
          ? 'bold 13px Inter, sans-serif' 
          : '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Truncate long keywords
        let label = thread.keyword;
        if (label.length > 12 && !isHero) {
          label = label.substring(0, 10) + '…';
        }
        ctx.fillText(label, x, y);

        // Age indicator below
        if (isHero || isHovered) {
          ctx.font = '9px Inter, sans-serif';
          ctx.fillStyle = isHero ? 'hsla(40, 40%, 98%, 0.7)' : 'hsl(30, 10%, 50%)';
          ctx.fillText(thread.ageLabel, x, y + radius + 14);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, threads, heroThread, hoveredThread]);

  // Handle mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if hovering over a thread
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const isHero = heroThread && thread.keyword === heroThread.keyword;
      const angle = (i / threads.length) * Math.PI * 2 - Math.PI / 2;
      
      let tx, ty, radius;
      if (isHero) {
        tx = centerX;
        ty = centerY;
        radius = 45 + thread.totalOccurrences * 2;
      } else {
        const distFromCenter = maxRadius * 0.5 + (1 - (thread.totalOccurrences / 20)) * maxRadius * 0.35;
        tx = centerX + Math.cos(angle) * distFromCenter;
        ty = centerY + Math.sin(angle) * distFromCenter;
        radius = 15 + thread.totalOccurrences * 1.5;
      }

      const dist = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);
      if (dist < radius) {
        setHoveredThread(thread);
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredThread(null);
    canvas.style.cursor = 'default';
  };

  const handleClick = () => {
    if (hoveredThread) {
      onThreadClick(hoveredThread);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredThread(null)}
        onClick={handleClick}
      />
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/30" />
    </div>
  );
}

function ThreadDetail({ thread, onClose }: ThreadDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
    >
      <div className="max-w-lg mx-auto p-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">{thread.keyword}</h2>
              <p className="text-xs text-muted-foreground">{thread.ageLabel} in your memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <p className="text-2xl font-bold text-foreground">{thread.totalOccurrences}</p>
            <p className="text-[10px] text-muted-foreground">keer genoemd</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <p className="text-2xl font-bold text-foreground">{thread.uniqueMonths}</p>
            <p className="text-[10px] text-muted-foreground">maanden actief</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-center">
            <p className="text-2xl font-bold text-red-600 capitalize">{thread.strength}</p>
            <p className="text-[10px] text-muted-foreground">thread sterkte</p>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            Timeline
          </h3>
          <div className="relative">
            {/* The red thread line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-red-400 to-red-300" />
            
            <div className="space-y-3 pl-10">
              {thread.monthlyOccurrences.map((mo, i) => (
                <motion.div
                  key={mo.month}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  {/* Node on the thread */}
                  <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
                  
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {format(mo.date, 'MMMM yyyy', { locale: nl })}
                      </span>
                      <span className="text-xs text-red-600 font-medium">
                        {mo.count}× genoemd
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Related keywords */}
        {thread.relatedKeywords.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Gerelateerde thema's</h3>
            <div className="flex flex-wrap gap-2">
              {thread.relatedKeywords.map(kw => (
                <span 
                  key={kw}
                  className="px-3 py-1 rounded-full text-xs bg-secondary border border-border"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sample context */}
        {thread.sampleSummaries.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Context fragmenten</h3>
            <div className="space-y-2">
              {thread.sampleSummaries.slice(0, 3).map((summary, i) => (
                <p key={i} className="text-xs text-muted-foreground italic p-3 rounded-lg bg-secondary/20">
                  "{summary}"
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ThreadsView({ pages }: ThreadsViewProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const threads = useMemo(() => {
    // DEV MODE: Lowered from 3 to 2 pages minimum
    if (pages.length < 2) return [];

    const now = new Date();
    
    // Group pages by month
    const pagesByMonth: Record<string, Page[]> = {};
    pages.forEach(page => {
      const monthKey = format(page.createdAt, 'yyyy-MM');
      if (!pagesByMonth[monthKey]) {
        pagesByMonth[monthKey] = [];
      }
      pagesByMonth[monthKey].push(page);
    });

    // Count keywords per month
    const keywordsByMonth: Record<string, Record<string, number>> = {};
    Object.entries(pagesByMonth).forEach(([month, monthPages]) => {
      keywordsByMonth[month] = {};
      monthPages.forEach(page => {
        page.keywords.forEach(kw => {
          keywordsByMonth[month][kw] = (keywordsByMonth[month][kw] || 0) + 1;
        });
      });
    });

    // Find keywords that appear across multiple months
    const keywordMonthCounts: Record<string, Set<string>> = {};
    const keywordTotalCounts: Record<string, number> = {};
    const keywordFirstSeen: Record<string, Date> = {};
    const keywordLastSeen: Record<string, Date> = {};
    const keywordPages: Record<string, Page[]> = {};

    pages.forEach(page => {
      page.keywords.forEach(kw => {
        const monthKey = format(page.createdAt, 'yyyy-MM');
        
        if (!keywordMonthCounts[kw]) {
          keywordMonthCounts[kw] = new Set();
          keywordTotalCounts[kw] = 0;
          keywordFirstSeen[kw] = page.createdAt;
          keywordLastSeen[kw] = page.createdAt;
          keywordPages[kw] = [];
        }
        
        keywordMonthCounts[kw].add(monthKey);
        keywordTotalCounts[kw]++;
        keywordPages[kw].push(page);
        
        if (page.createdAt < keywordFirstSeen[kw]) {
          keywordFirstSeen[kw] = page.createdAt;
        }
        if (page.createdAt > keywordLastSeen[kw]) {
          keywordLastSeen[kw] = page.createdAt;
        }
      });
    });

    // Build threads from keywords that span multiple months
    const threadCandidates: Thread[] = [];

    Object.entries(keywordMonthCounts).forEach(([keyword, months]) => {
      const uniqueMonths = months.size;
      const totalOccurrences = keywordTotalCounts[keyword];
      const firstSeen = keywordFirstSeen[keyword];
      const lastSeen = keywordLastSeen[keyword];
      const ageInDays = differenceInDays(now, firstSeen);
      
      // DEV MODE: Lowered thresholds for testing
      // Original: uniqueMonths >= 2 || (uniqueMonths === 1 && totalOccurrences >= 4 && ageInDays > 14)
      // Now: totalOccurrences >= 2 (any keyword appearing 2+ times becomes a thread)
      if (totalOccurrences >= 2) {
        // Calculate age label
        let ageLabel = '';
        if (ageInDays < 1) {
          ageLabel = 'Vandaag';
        } else if (ageInDays < 7) {
          ageLabel = `${ageInDays} dagen`;
        } else if (ageInDays < 30) {
          ageLabel = `${Math.floor(ageInDays / 7)} weken`;
        } else {
          const months = differenceInMonths(now, firstSeen);
          ageLabel = months === 1 ? '1 maand' : `${months} maanden`;
        }

        // DEV MODE: Lowered strength thresholds
        let strength: 'strong' | 'growing' | 'emerging';
        if (totalOccurrences >= 5) {
          strength = 'strong';
        } else if (totalOccurrences >= 3) {
          strength = 'growing';
        } else {
          strength = 'emerging';
        }

        // Build monthly occurrences for timeline
        const monthlyOccurrences = Array.from(months)
          .sort()
          .map(monthKey => ({
            month: monthKey,
            count: keywordsByMonth[monthKey]?.[keyword] || 0,
            date: new Date(monthKey + '-01'),
          }));

        // Find related keywords (co-occur frequently)
        const relatedCounts: Record<string, number> = {};
        keywordPages[keyword].forEach(page => {
          page.keywords.forEach(otherKw => {
            if (otherKw !== keyword) {
              relatedCounts[otherKw] = (relatedCounts[otherKw] || 0) + 1;
            }
          });
        });
        const relatedKeywords = Object.entries(relatedCounts)
          .filter(([_, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([kw]) => kw);

        // Get sample summaries
        const sampleSummaries = keywordPages[keyword]
          .slice(0, 5)
          .map(p => p.summary)
          .filter(s => s && s.length > 20);

        threadCandidates.push({
          keyword,
          firstSeen,
          lastSeen,
          ageInDays,
          ageLabel,
          totalOccurrences,
          uniqueMonths,
          monthlyOccurrences,
          strength,
          relatedKeywords,
          sampleSummaries,
        });
      }
    });

    // Sort by strength, then by unique months, then by total occurrences
    threadCandidates.sort((a, b) => {
      const strengthOrder = { strong: 0, growing: 1, emerging: 2 };
      if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
        return strengthOrder[a.strength] - strengthOrder[b.strength];
      }
      if (a.uniqueMonths !== b.uniqueMonths) {
        return b.uniqueMonths - a.uniqueMonths;
      }
      return b.totalOccurrences - a.totalOccurrences;
    });

    return threadCandidates.slice(0, 10);
  }, [pages]);

  const heroThread = threads.find(t => t.strength === 'strong') || threads[0] || null;

  // DEV MODE: Lowered from 3 to 2 pages minimum
  if (pages.length < 2) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-muted-foreground">
          <Compass className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Ontdek je rode draden</p>
          <p className="text-xs opacity-60 mt-1">Voeg meer pages toe om langetermijn thema's te zien</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-muted-foreground">
          <Compass className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Nog geen rode draden</p>
          <p className="text-xs opacity-60 mt-1">Threads verschijnen als thema's over maanden terugkomen</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Hero section with motivational copy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4 pt-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-600 font-medium">Je Rode Draden</span>
          </div>
          
          {heroThread && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                {heroThread.keyword}
              </h2>
              <p className="text-sm text-muted-foreground">
                loopt al {heroThread.ageLabel} door je schrijven
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Main visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <ThreadVisualization 
            threads={threads}
            heroThread={heroThread}
            onThreadClick={setSelectedThread}
          />
        </motion.div>

        {/* Legend and emotional message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4 space-y-4"
        >
          {/* Legend */}
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Sterk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Groeiend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
              Opkomend
            </span>
          </div>

          {/* Emotional anchor message */}
          <div className="text-center py-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground italic">
              Je raakt de weg niet kwijt. Deze thema's vormen je kompas.
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              Klik op een thread om de timeline te bekijken
            </p>
          </div>
        </motion.div>
      </div>

      {/* Thread detail modal */}
      <AnimatePresence>
        {selectedThread && (
          <ThreadDetail 
            thread={selectedThread} 
            onClose={() => setSelectedThread(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
