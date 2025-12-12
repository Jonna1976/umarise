import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { format } from 'date-fns';

interface PersonalitySnapshot {
  id: string;
  tagline: string;
  superpower: string;
  page_count: number;
  created_at: string;
  drivers: Array<{ name: string; strength: string }>;
}

interface PersonalityEvolutionProps {
  currentTagline?: string;
}

export function PersonalityEvolution({ currentTagline }: PersonalityEvolutionProps) {
  const [snapshots, setSnapshots] = useState<PersonalitySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchSnapshots() {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('personality_snapshots')
        .select('id, tagline, superpower, page_count, created_at, drivers')
        .eq('device_user_id', deviceId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Type cast the data since Supabase types might not be updated yet
        setSnapshots(data as unknown as PersonalitySnapshot[]);
      }
      setIsLoading(false);
    }

    fetchSnapshots();
  }, []);

  // Draw evolution visualization
  useEffect(() => {
    if (snapshots.length < 2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = 120;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#FDFBF8';
    ctx.fillRect(0, 0, width, height);

    const padding = 30;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    const centerY = height / 2;

    // Draw timeline
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.strokeStyle = 'rgba(155, 138, 106, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Calculate positions for each snapshot
    const positions = snapshots.map((snapshot, i) => {
      const x = padding + (i / (snapshots.length - 1)) * graphWidth;
      // Page count influences vertical position
      const maxPages = Math.max(...snapshots.map(s => s.page_count));
      const normalizedPages = snapshot.page_count / maxPages;
      const y = centerY - normalizedPages * (graphHeight / 2 - 10);
      return { x, y, snapshot };
    });

    // Draw flowing line connecting snapshots
    ctx.beginPath();
    positions.forEach((pos, i) => {
      if (i === 0) {
        ctx.moveTo(pos.x, pos.y);
      } else {
        const prevPos = positions[i - 1];
        const cpX = (prevPos.x + pos.x) / 2;
        ctx.quadraticCurveTo(cpX, prevPos.y, pos.x, pos.y);
      }
    });
    ctx.strokeStyle = 'rgba(155, 138, 106, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw snapshot points
    positions.forEach(({ x, y, snapshot }, i) => {
      const isLatest = i === positions.length - 1;
      
      // Circle
      ctx.beginPath();
      ctx.arc(x, y, isLatest ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isLatest ? 'rgba(155, 138, 106, 0.3)' : 'rgba(155, 138, 106, 0.15)';
      ctx.fill();
      ctx.strokeStyle = isLatest ? '#9B8A6A' : 'rgba(155, 138, 106, 0.5)';
      ctx.lineWidth = isLatest ? 2 : 1;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#9B8A6A';
      ctx.fill();

      // Page count label below
      ctx.fillStyle = '#9A9A9A';
      ctx.font = '8px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${snapshot.page_count}p`, x, centerY + 20);
    });

    // Growth indicator
    if (snapshots.length >= 2) {
      const first = snapshots[0].page_count;
      const last = snapshots[snapshots.length - 1].page_count;
      const growth = last - first;
      
      ctx.fillStyle = '#7A6B5F';
      ctx.font = '9px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+${growth} pages since first analysis`, width / 2, height - 8);
    }

  }, [snapshots]);

  if (isLoading) return null;
  if (snapshots.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border overflow-hidden bg-secondary/20"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Your Evolution</span>
          <span className="text-xs text-muted-foreground">
            ({snapshots.length} snapshots)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          {/* Evolution canvas */}
          <div className="rounded-lg overflow-hidden mb-4">
            <canvas 
              ref={canvasRef} 
              style={{ width: '100%', height: '120px' }}
              className="bg-[#FDFBF8]"
            />
          </div>

          {/* Tagline evolution list */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">How you've evolved:</p>
            {snapshots.slice(-5).reverse().map((snapshot, i) => (
              <div 
                key={snapshot.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  i === 0 ? 'bg-codex-sepia/10 border border-codex-sepia/20' : 'bg-secondary/30'
                }`}
              >
                <div className="flex-1">
                  <p className={`text-sm ${i === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    "{snapshot.tagline}"
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(snapshot.created_at), 'dd MMM yyyy')} • {snapshot.page_count} pages
                  </p>
                </div>
                {i === 0 && (
                  <span className="text-[9px] uppercase tracking-wider text-codex-sepia px-2 py-0.5 rounded-full bg-codex-sepia/10">
                    Now
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Insight */}
          {snapshots.length >= 3 && (
            <div className="mt-4 p-3 rounded-lg bg-codex-cream/30 border border-codex-sepia/10">
              <p className="text-xs text-foreground/80 italic">
                Your personality profile has been refined through {snapshots.length} analyses. 
                Each new page adds nuance to who you are.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
