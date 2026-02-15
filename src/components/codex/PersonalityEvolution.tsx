import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronDown, ChevronUp, ArrowRight, Plus, Minus, RefreshCw } from 'lucide-react';
import { listPersonalitySnapshots } from '@/lib/companionProxy';
import { getActiveDeviceId } from '@/lib/deviceId';
import { format } from 'date-fns';

interface Driver {
  name: string;
  description: string;
  strength: string;
}

interface TensionField {
  side_a: string;
  side_b: string;
  description: string;
}

interface PersonalitySnapshot {
  id: string;
  tagline: string;
  superpower: string;
  core_identity: string;
  growth_edge: string;
  page_count: number;
  created_at: string;
  drivers: Driver[];
  tension_field: TensionField;
}

interface PersonalityEvolutionProps {
  currentTagline?: string;
}

interface SnapshotComparison {
  taglineChanged: boolean;
  superpowerChanged: boolean;
  coreIdentityChanged: boolean;
  growthEdgeChanged: boolean;
  tensionChanged: boolean;
  driversAdded: string[];
  driversRemoved: string[];
  driversKept: string[];
  strengthChanges: Array<{ name: string; from: string; to: string }>;
}

function compareSnapshots(older: PersonalitySnapshot, newer: PersonalitySnapshot): SnapshotComparison {
  const olderDriverNames = new Set(older.drivers?.map(d => d.name) || []);
  const newerDriverNames = new Set(newer.drivers?.map(d => d.name) || []);
  
  const driversAdded = [...newerDriverNames].filter(n => !olderDriverNames.has(n));
  const driversRemoved = [...olderDriverNames].filter(n => !newerDriverNames.has(n));
  const driversKept = [...newerDriverNames].filter(n => olderDriverNames.has(n));

  // Check for strength changes in kept drivers
  const strengthChanges: Array<{ name: string; from: string; to: string }> = [];
  driversKept.forEach(name => {
    const oldDriver = older.drivers?.find(d => d.name === name);
    const newDriver = newer.drivers?.find(d => d.name === name);
    if (oldDriver && newDriver && oldDriver.strength !== newDriver.strength) {
      strengthChanges.push({ name, from: oldDriver.strength, to: newDriver.strength });
    }
  });

  return {
    taglineChanged: older.tagline !== newer.tagline,
    superpowerChanged: older.superpower !== newer.superpower,
    coreIdentityChanged: older.core_identity !== newer.core_identity,
    growthEdgeChanged: older.growth_edge !== newer.growth_edge,
    tensionChanged: 
      older.tension_field?.side_a !== newer.tension_field?.side_a ||
      older.tension_field?.side_b !== newer.tension_field?.side_b,
    driversAdded,
    driversRemoved,
    driversKept,
    strengthChanges
  };
}

export function PersonalityEvolution({ currentTagline }: PersonalityEvolutionProps) {
  const [snapshots, setSnapshots] = useState<PersonalitySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPair, setSelectedPair] = useState<[number, number] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchSnapshots() {
      const deviceId = getActiveDeviceId();
      const { data, error } = await listPersonalitySnapshots(deviceId || '');
      
      // data is already filtered by device_user_id in the proxy

      if (!error && data) {
        // Parse JSON fields that come as strings
        const parsedSnapshots = data.map(snapshot => ({
          ...snapshot,
          drivers: typeof snapshot.drivers === 'string' 
            ? JSON.parse(snapshot.drivers) 
            : snapshot.drivers || [],
          tension_field: typeof snapshot.tension_field === 'string'
            ? JSON.parse(snapshot.tension_field)
            : snapshot.tension_field || {}
        })) as PersonalitySnapshot[];
        
        setSnapshots(parsedSnapshots);
        // Default to comparing last two if we have at least 2
        if (parsedSnapshots.length >= 2) {
          setSelectedPair([parsedSnapshots.length - 2, parsedSnapshots.length - 1]);
        }
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
    const height = 100;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#FDFBF8';
    ctx.fillRect(0, 0, width, height);

    const padding = 30;
    const graphWidth = width - padding * 2;
    const centerY = height / 2;

    // Draw timeline
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.strokeStyle = 'rgba(155, 138, 106, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const positions = snapshots.map((snapshot, i) => {
      const x = padding + (i / (snapshots.length - 1)) * graphWidth;
      const maxPages = Math.max(...snapshots.map(s => s.page_count));
      const normalizedPages = snapshot.page_count / maxPages;
      const y = centerY - normalizedPages * 25;
      return { x, y, snapshot, index: i };
    });

    // Draw connecting line
    ctx.beginPath();
    positions.forEach((pos, i) => {
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else {
        const prevPos = positions[i - 1];
        const cpX = (prevPos.x + pos.x) / 2;
        ctx.quadraticCurveTo(cpX, prevPos.y, pos.x, pos.y);
      }
    });
    ctx.strokeStyle = 'rgba(155, 138, 106, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw points
    positions.forEach(({ x, y, snapshot, index }) => {
      const isSelected = selectedPair && (index === selectedPair[0] || index === selectedPair[1]);
      const isLatest = index === positions.length - 1;
      
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 7 : isLatest ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(155, 107, 90, 0.25)' : 'rgba(155, 138, 106, 0.15)';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#9B6B5A' : '#9B8A6A';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#9B6B5A' : '#9B8A6A';
      ctx.fill();

      ctx.fillStyle = '#9A9A9A';
      ctx.font = '8px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${snapshot.page_count}p`, x, centerY + 22);
    });

  }, [snapshots, selectedPair]);

  const comparison = selectedPair && snapshots.length >= 2
    ? compareSnapshots(snapshots[selectedPair[0]], snapshots[selectedPair[1]])
    : null;

  const hasChanges = comparison && (
    comparison.taglineChanged ||
    comparison.superpowerChanged ||
    comparison.driversAdded.length > 0 ||
    comparison.driversRemoved.length > 0 ||
    comparison.strengthChanges.length > 0 ||
    comparison.tensionChanged
  );

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

      <AnimatePresence>
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
                style={{ width: '100%', height: '100px' }}
                className="bg-[#FDFBF8]"
              />
            </div>

            {/* Comparison toggle */}
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`w-full p-3 rounded-lg border transition-colors mb-3 flex items-center justify-center gap-2 ${
                showComparison 
                  ? 'bg-codex-sepia/10 border-codex-sepia/30 text-codex-sepia' 
                  : 'bg-secondary/30 border-border text-muted-foreground hover:border-codex-sepia/30'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showComparison ? 'Hide Comparison' : 'Compare Changes'}
              </span>
            </button>

            {/* Comparison View */}
            <AnimatePresence>
              {showComparison && selectedPair && comparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 mb-4"
                >
                  {/* Snapshot selector */}
                  <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/30">
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-muted-foreground">From</p>
                      <p className="text-xs font-medium">
                        {format(new Date(snapshots[selectedPair[0]].created_at), 'dd MMM')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {snapshots[selectedPair[0]].page_count} pages
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-muted-foreground">To</p>
                      <p className="text-xs font-medium">
                        {format(new Date(snapshots[selectedPair[1]].created_at), 'dd MMM')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {snapshots[selectedPair[1]].page_count} pages
                      </p>
                    </div>
                  </div>

                  {!hasChanges ? (
                    <div className="p-3 rounded-lg bg-secondary/20 text-center">
                      <p className="text-xs text-muted-foreground italic">
                        No significant changes detected between these snapshots
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Tagline change */}
                      {comparison.taglineChanged && (
                        <div className="p-3 rounded-lg bg-codex-sepia/5 border border-codex-sepia/20">
                          <p className="text-[10px] text-codex-sepia uppercase tracking-wider mb-2">Identity Shift</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground line-through">
                              "{snapshots[selectedPair[0]].tagline}"
                            </span>
                            <ArrowRight className="w-3 h-3 text-codex-sepia" />
                            <span className="text-xs font-medium text-foreground">
                              "{snapshots[selectedPair[1]].tagline}"
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Superpower change */}
                      {comparison.superpowerChanged && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Superpower Evolved</p>
                          <p className="text-xs text-muted-foreground mb-1">Was: "{snapshots[selectedPair[0]].superpower.slice(0, 60)}..."</p>
                          <p className="text-xs text-foreground">Now: "{snapshots[selectedPair[1]].superpower.slice(0, 60)}..."</p>
                        </div>
                      )}

                      {/* Drivers added */}
                      {comparison.driversAdded.length > 0 && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <p className="text-[10px] text-green-700 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> New Drivers Emerged
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {comparison.driversAdded.map(driver => (
                              <span key={driver} className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
                                {driver}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Drivers removed */}
                      {comparison.driversRemoved.length > 0 && (
                        <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                          <p className="text-[10px] text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Minus className="w-3 h-3" /> Drivers Faded
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {comparison.driversRemoved.map(driver => (
                              <span key={driver} className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs line-through">
                                {driver}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strength changes */}
                      {comparison.strengthChanges.length > 0 && (
                        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                          <p className="text-[10px] text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">Strength Shifts</p>
                          <div className="space-y-1">
                            {comparison.strengthChanges.map(change => (
                              <div key={change.name} className="flex items-center gap-2 text-xs">
                                <span className="text-foreground">{change.name}:</span>
                                <span className="text-muted-foreground">{change.from}</span>
                                <ArrowRight className="w-3 h-3 text-purple-500" />
                                <span className="text-purple-700 dark:text-purple-400 font-medium">{change.to}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tension field change */}
                      {comparison.tensionChanged && (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                          <p className="text-[10px] text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">Tension Field Shifted</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {snapshots[selectedPair[0]].tension_field?.side_a} ↔ {snapshots[selectedPair[0]].tension_field?.side_b}
                            </span>
                            <ArrowRight className="w-3 h-3 text-blue-500" />
                            <span className="text-foreground font-medium">
                              {snapshots[selectedPair[1]].tension_field?.side_a} ↔ {snapshots[selectedPair[1]].tension_field?.side_b}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigate between pairs */}
                  {snapshots.length > 2 && (
                    <div className="flex justify-center gap-1 pt-2">
                      {snapshots.slice(0, -1).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPair([i, i + 1])}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            selectedPair[0] === i 
                              ? 'bg-codex-sepia' 
                              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tagline history (collapsed when comparison is shown) */}
            {!showComparison && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Your identity over time:</p>
                {snapshots.slice(-4).reverse().map((snapshot, i) => (
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
            )}

            {/* Insight */}
            <div className="mt-4 p-3 rounded-lg bg-codex-cream/30 border border-codex-sepia/10">
              <p className="text-xs text-foreground/80 italic">
                {hasChanges 
                  ? `Your personality has evolved through ${snapshots.length} analyses. Each reflection reveals new facets of who you are.`
                  : `Your core identity remains consistent across ${snapshots.length} analyses, showing a stable foundation.`
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
