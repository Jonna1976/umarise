import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Compass,
  Calendar,
  GitBranch,
  X,
  ChevronRight
} from 'lucide-react';
import { Page } from '@/lib/pageService';
import { format, differenceInDays, differenceInMonths } from 'date-fns';
import { nl } from 'date-fns/locale';
import { triggerHaptic } from '@/lib/haptics';

interface KompasViewProps {
  pages: Page[];
  onBack: () => void;
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

// Fullscreen thread visualization
function FullscreenVisualization({ 
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
        setDimensions({ 
          width: window.innerWidth, 
          height: window.innerHeight 
        });
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

    const threadPositions: { thread: Thread; x: number; y: number; radius: number }[] = [];

    const animate = () => {
      timeRef.current += 0.006;
      const t = timeRef.current;

      // Clear canvas with subtle gradient
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(dimensions.width, dimensions.height) * 0.7
      );
      gradient.addColorStop(0, 'hsla(40, 33%, 96%, 1)');
      gradient.addColorStop(0.5, 'hsla(40, 33%, 94%, 1)');
      gradient.addColorStop(1, 'hsla(38, 30%, 90%, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw ambient flowing lines (background atmosphere)
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsl(24, 60%, ${35 + i * 3}%)`;
        ctx.lineWidth = 0.8;
        
        const startY = 80 + i * (dimensions.height / 10);
        ctx.moveTo(0, startY + Math.sin(t + i) * 30);
        
        for (let x = 0; x <= dimensions.width; x += 4) {
          const wave = Math.sin((x / 100) + t + i * 0.4) * 20;
          ctx.lineTo(x, startY + wave + Math.sin(t * 0.4 + x / 120) * 15);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Draw constellation-like background dots
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 0.5 + t * 0.1) + 1) * dimensions.width * 0.5;
        const y = (Math.cos(i * 0.7 + t * 0.08) + 1) * dimensions.height * 0.5;
        ctx.beginPath();
        ctx.fillStyle = 'hsl(24, 60%, 45%)';
        ctx.arc(x, y, 1 + Math.sin(t + i) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Calculate positions for threads
      const maxRadius = Math.min(centerX, centerY) - 80;
      threadPositions.length = 0;

      threads.forEach((thread, i) => {
        const isHero = heroThread && thread.keyword === heroThread.keyword;
        const angle = (i / threads.length) * Math.PI * 2 - Math.PI / 2;
        
        let x, y, baseRadius;
        
        if (isHero) {
          x = centerX;
          y = centerY;
          baseRadius = 60 + thread.totalOccurrences * 2.5;
        } else {
          const distFromCenter = maxRadius * 0.45 + (1 - (thread.totalOccurrences / 20)) * maxRadius * 0.4;
          x = centerX + Math.cos(angle) * distFromCenter;
          y = centerY + Math.sin(angle) * distFromCenter;
          baseRadius = 20 + thread.totalOccurrences * 1.5;
        }

        const breathe = Math.sin(t * 1.2 + i) * 3;
        const radius = Math.min(baseRadius + breathe, 70);

        threadPositions.push({ thread, x, y, radius });
      });

      // Draw connections (the "red threads")
      if (heroThread) {
        const heroPos = threadPositions.find(tp => tp.thread.keyword === heroThread.keyword);
        if (heroPos) {
          threadPositions.forEach((tp, i) => {
            if (tp.thread.keyword === heroThread.keyword) return;

            const connection = tp.thread.relatedKeywords.some(
              rk => heroThread.keyword.toLowerCase().includes(rk.toLowerCase()) ||
                    rk.toLowerCase().includes(heroThread.keyword.toLowerCase())
            ) || heroThread.relatedKeywords.includes(tp.thread.keyword);

            const strengthOpacity = tp.thread.strength === 'strong' ? 0.6 : 
                                   tp.thread.strength === 'growing' ? 0.35 : 0.15;

            // Draw flowing thread line
            ctx.beginPath();
            ctx.strokeStyle = `hsla(0, 65%, 50%, ${connection ? strengthOpacity + 0.25 : strengthOpacity})`;
            ctx.lineWidth = connection ? 2.5 : 1.5;

            const midX = (heroPos.x + tp.x) / 2;
            const midY = (heroPos.y + tp.y) / 2;
            const perpX = -(tp.y - heroPos.y) * 0.25;
            const perpY = (tp.x - heroPos.x) * 0.25;
            const wave = Math.sin(t + i) * 8;

            ctx.moveTo(heroPos.x, heroPos.y);
            ctx.quadraticCurveTo(
              midX + perpX + wave, 
              midY + perpY + wave, 
              tp.x, 
              tp.y
            );
            ctx.stroke();

            // Timeline markers along thread
            if (tp.thread.strength !== 'emerging') {
              const nodes = tp.thread.uniqueMonths;
              for (let n = 1; n <= Math.min(nodes, 5); n++) {
                const progress = n / (nodes + 1);
                const nodeX = (1-progress)*(1-progress)*heroPos.x + 
                              2*(1-progress)*progress*(midX + perpX) + 
                              progress*progress*tp.x;
                const nodeY = (1-progress)*(1-progress)*heroPos.y + 
                              2*(1-progress)*progress*(midY + perpY) + 
                              progress*progress*tp.y;
                
                ctx.beginPath();
                ctx.fillStyle = `hsla(0, 65%, 50%, ${strengthOpacity * 1.5})`;
                ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
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
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
          glow.addColorStop(0, isHero ? 'hsla(0, 70%, 50%, 0.35)' : 'hsla(24, 60%, 50%, 0.25)');
          glow.addColorStop(1, 'hsla(0, 70%, 50%, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        const nodeColor = isHero 
          ? `hsla(0, 70%, 50%, ${0.85 + Math.sin(t * 2) * 0.1})` 
          : thread.strength === 'strong' 
            ? 'hsla(0, 60%, 55%, 0.75)'
            : thread.strength === 'growing'
              ? 'hsla(38, 65%, 50%, 0.75)'
              : 'hsla(30, 30%, 60%, 0.55)';
        
        ctx.fillStyle = nodeColor;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring pattern
        if (isHero || thread.strength === 'strong') {
          ctx.strokeStyle = 'hsla(40, 40%, 98%, 0.5)';
          ctx.lineWidth = 1.2;
          for (let ring = 1; ring <= 3; ring++) {
            ctx.beginPath();
            ctx.arc(x, y, radius * (0.25 + ring * 0.2), 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Orbiting dots around hero
        if (isHero) {
          const dotCount = Math.min(thread.totalOccurrences, 16);
          for (let d = 0; d < dotCount; d++) {
            const dotAngle = (d / dotCount) * Math.PI * 2 + t * 0.25;
            const dotDist = radius + 18 + Math.sin(t * 2 + d) * 4;
            const dotX = x + Math.cos(dotAngle) * dotDist;
            const dotY = y + Math.sin(dotAngle) * dotDist;
            
            ctx.beginPath();
            ctx.fillStyle = 'hsla(0, 70%, 55%, 0.65)';
            ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Thread keyword label
        ctx.fillStyle = isHero 
          ? 'hsl(40, 40%, 98%)' 
          : isHovered 
            ? 'hsl(30, 10%, 20%)' 
            : 'hsl(30, 10%, 30%)';
        ctx.font = isHero 
          ? 'bold 15px Inter, sans-serif' 
          : '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = thread.keyword;
        if (label.length > 14 && !isHero) {
          label = label.substring(0, 12) + '…';
        }
        ctx.fillText(label, x, y);

        // Age label
        if (isHero || isHovered) {
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = isHero ? 'hsla(40, 40%, 98%, 0.8)' : 'hsl(30, 10%, 45%)';
          ctx.fillText(thread.ageLabel, x, y + radius + 16);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 80;

    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const isHero = heroThread && thread.keyword === heroThread.keyword;
      const angle = (i / threads.length) * Math.PI * 2 - Math.PI / 2;
      
      let tx, ty, radius;
      if (isHero) {
        tx = centerX;
        ty = centerY;
        radius = 60 + thread.totalOccurrences * 2.5;
      } else {
        const distFromCenter = maxRadius * 0.45 + (1 - (thread.totalOccurrences / 20)) * maxRadius * 0.4;
        tx = centerX + Math.cos(angle) * distFromCenter;
        ty = centerY + Math.sin(angle) * distFromCenter;
        radius = 20 + thread.totalOccurrences * 1.5;
      }

      const dist = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);
      if (dist < radius) {
        if (hoveredThread?.keyword !== thread.keyword) {
          triggerHaptic('selection');
        }
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
      triggerHaptic('medium');
      onThreadClick(hoveredThread);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredThread(null)}
        onClick={handleClick}
      />
    </div>
  );
}

function ThreadDetail({ thread, onClose }: { thread: Thread; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl rounded-t-3xl max-h-[70vh] overflow-auto"
    >
      <div className="p-6 pt-4">
        {/* Handle */}
        <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">{thread.keyword}</h2>
              <p className="text-sm text-muted-foreground">{thread.ageLabel} in je codex</p>
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
        <div className="grid grid-cols-3 gap-3 mb-5">
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
            <p className="text-[10px] text-muted-foreground">sterkte</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-5">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-red-400 to-red-300" />
            
            <div className="space-y-2 pl-10">
              {thread.monthlyOccurrences.slice(0, 5).map((mo, i) => (
                <motion.div
                  key={mo.month}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
                  
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {format(mo.date, 'MMMM yyyy', { locale: nl })}
                      </span>
                      <span className="text-xs text-red-600 font-medium">
                        {mo.count}×
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {thread.relatedKeywords.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Gerelateerd</h3>
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
      </div>
    </motion.div>
  );
}

export function KompasView({ pages, onBack }: KompasViewProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const threads = useMemo(() => {
    // DEV MODE: Lowered from 3 to 2 pages minimum
    if (pages.length < 2) return [];

    const now = new Date();
    
    const pagesByMonth: Record<string, Page[]> = {};
    pages.forEach(page => {
      const monthKey = format(page.createdAt, 'yyyy-MM');
      if (!pagesByMonth[monthKey]) {
        pagesByMonth[monthKey] = [];
      }
      pagesByMonth[monthKey].push(page);
    });

    const keywordsByMonth: Record<string, Record<string, number>> = {};
    Object.entries(pagesByMonth).forEach(([month, monthPages]) => {
      keywordsByMonth[month] = {};
      monthPages.forEach(page => {
        page.keywords.forEach(kw => {
          keywordsByMonth[month][kw] = (keywordsByMonth[month][kw] || 0) + 1;
        });
      });
    });

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

    const threadCandidates: Thread[] = [];

    Object.entries(keywordMonthCounts).forEach(([keyword, months]) => {
      const uniqueMonths = months.size;
      const totalOccurrences = keywordTotalCounts[keyword];
      const firstSeen = keywordFirstSeen[keyword];
      const ageInDays = differenceInDays(now, firstSeen);
      
      // DEV MODE: Lowered thresholds for testing
      // Original: uniqueMonths >= 2 || (uniqueMonths === 1 && totalOccurrences >= 4 && ageInDays > 14)
      // Now: totalOccurrences >= 2 (any keyword appearing 2+ times becomes a thread)
      if (totalOccurrences >= 2) {
        let ageLabel = '';
        if (ageInDays < 1) {
          ageLabel = 'Vandaag';
        } else if (ageInDays < 7) {
          ageLabel = `${ageInDays} dagen`;
        } else if (ageInDays < 30) {
          ageLabel = `${Math.floor(ageInDays / 7)} weken`;
        } else {
          const monthsAge = differenceInMonths(now, firstSeen);
          ageLabel = monthsAge === 1 ? '1 maand' : `${monthsAge} maanden`;
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

        const monthlyOccurrences = Array.from(months)
          .sort()
          .map(monthKey => ({
            month: monthKey,
            count: keywordsByMonth[monthKey]?.[keyword] || 0,
            date: new Date(monthKey + '-01'),
          }));

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

        const sampleSummaries = keywordPages[keyword]
          .slice(0, 5)
          .map(p => p.summary)
          .filter(s => s && s.length > 20);

        threadCandidates.push({
          keyword,
          firstSeen,
          lastSeen: keywordLastSeen[keyword],
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

    return threadCandidates.slice(0, 12);
  }, [pages]);

  const heroThread = threads.find(t => t.strength === 'strong') || threads[0] || null;

  // DEV MODE: Lowered from 3 to 2 pages minimum
  if (pages.length < 2 || threads.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            
            <h1 className="font-serif text-lg font-medium flex items-center gap-2">
              <Compass className="w-5 h-5 text-red-500" />
              Mijn Kompas
            </h1>
            
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Compass className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="font-serif text-xl font-medium mb-2">Ontdek je rode draden</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {pages.length < 2 
                ? `Voeg nog ${2 - pages.length} pagina's toe om je thema's te ontdekken`
                : 'Voeg pages toe met gedeelde keywords om threads te zien'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fullscreen visualization */}
      <FullscreenVisualization 
        threads={threads}
        heroThread={heroThread}
        onThreadClick={setSelectedThread}
      />

      {/* Floating header */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              onBack();
            }}
            className="pointer-events-auto w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="pointer-events-auto px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-500" />
            <span className="font-serif text-sm font-medium">Mijn Kompas</span>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Hero info overlay */}
      {heroThread && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 left-0 right-0 z-10 pointer-events-none"
        >
          <div className="text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-600 font-medium">
                {heroThread.keyword} — {heroThread.ageLabel}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="fixed bottom-6 left-0 right-0 z-10 pointer-events-none"
      >
        <div className="flex justify-center gap-6 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Sterk
          </span>
          <span className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Groeiend
          </span>
          <span className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
            Opkomend
          </span>
        </div>
      </motion.div>

      {/* Thread detail sheet */}
      <AnimatePresence>
        {selectedThread && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setSelectedThread(null)}
            />
            <ThreadDetail 
              thread={selectedThread} 
              onClose={() => setSelectedThread(null)} 
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
