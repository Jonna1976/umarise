import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  FlaskConical, 
  Download, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Compass,
  Brain,
  Star,
  Database,
  Loader2,
  FileText,
  Bug,
  Copy
} from 'lucide-react';
import { generateTestPages, TestPage } from '@/lib/testData';
import { Page } from '@/lib/pageService';
import { formatDistanceToNow, format } from 'date-fns';
import { injectTestData, clearTestData, getTestDataInfo } from '@/lib/testDataInjector';
import { toast } from '@/hooks/use-toast';
import OnePager from '@/components/OnePager';
import { getDeviceId, setDeviceId as persistDeviceId } from '@/lib/deviceId';
import { supabase } from '@/integrations/supabase/client';

interface TestPanelProps {
  onClose: () => void;
  onLoadTestData: () => void;
  onViewPage: (page: Page) => void;
  onPreviewEmptyKompas?: () => void;
  onPreviewEmptyPatterns?: () => void;
  onPreviewEmptyPersonality?: () => void;
  onShowOnePager?: () => void;
}

function getToneClass(tone: string): string {
  const toneMap: Record<string, string> = {
    focused: 'tone-focused',
    hopeful: 'tone-hopeful',
    frustrated: 'tone-frustrated',
    playful: 'tone-playful',
    overwhelmed: 'tone-overwhelmed',
    reflective: 'tone-reflective',
  };
  return toneMap[tone.toLowerCase()] || 'bg-muted text-muted-foreground';
}

export function TestPanel({ 
  onClose, 
  onLoadTestData, 
  onViewPage,
  onPreviewEmptyKompas,
  onPreviewEmptyPatterns,
  onPreviewEmptyPersonality,
  onShowOnePager
}: TestPanelProps) {
  const [showOnePager, setShowOnePager] = useState(false);
  const [testPages, setTestPages] = useState<TestPage[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(100);
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectProgress, setInjectProgress] = useState({ current: 0, total: 0 });
  const [isClearing, setIsClearing] = useState(false);

  // Device debug state
  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);
  const [dbDeviceId, setDbDeviceId] = useState<string | null>(null);
  const [dbPageCount, setDbPageCount] = useState<number>(0);

  useEffect(() => {
    const id = getDeviceId();
    setLocalDeviceId(id);

    const checkDb = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('device_user_id');

      if (!error && data && data.length > 0) {
        const counts = new Map<string, number>();
        for (const row of data) {
          const rowId = row.device_user_id as string | null;
          if (!rowId) continue;
          counts.set(rowId, (counts.get(rowId) ?? 0) + 1);
        }

        let topId: string | null = null;
        let topCount = 0;
        for (const [rowId, count] of counts.entries()) {
          if (count > topCount) {
            topId = rowId;
            topCount = count;
          }
        }

        setDbDeviceId(topId);
        setDbPageCount(topCount);
      }
    };

    checkDb();
  }, []);

  const deviceIdsMatch = localDeviceId === dbDeviceId;

  const handleCopyDeviceId = () => {
    if (localDeviceId) {
      navigator.clipboard.writeText(localDeviceId);
      toast({ title: "Device ID gekopieerd" });
    }
  };

  const handleAdoptDbDeviceId = () => {
    if (dbDeviceId && dbDeviceId !== localDeviceId) {
      persistDeviceId(dbDeviceId);
      setLocalDeviceId(dbDeviceId);
      toast({ title: "Device ID overgenomen", description: "Herlaad de pagina om je codex te zien." });
    }
  };

  const testDataInfo = getTestDataInfo();

  const handleGenerate = () => {
    const pages = generateTestPages(pageCount);
    setTestPages(pages);
  };

  const handleInjectToDatabase = async () => {
    setIsInjecting(true);
    setInjectProgress({ current: 0, total: testDataInfo.totalPages });
    
    try {
      const inserted = await injectTestData((current, total) => {
        setInjectProgress({ current, total });
      });
      
      toast({
        title: "Testdata geïnjecteerd",
        description: `${inserted} pagina's toegevoegd aan de database. Ga naar History om de memory loop te testen.`,
      });
      
      onLoadTestData();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon testdata niet injecteren",
        variant: "destructive"
      });
    } finally {
      setIsInjecting(false);
    }
  };

  const handleClearTestData = async () => {
    setIsClearing(true);
    try {
      const deleted = await clearTestData();
      toast({
        title: "Testdata verwijderd",
        description: `${deleted} test-pagina's verwijderd.`,
      });
      onLoadTestData();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon testdata niet verwijderen",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleLoadAll = () => {
    onLoadTestData();
  };

  const handleClear = () => {
    setTestPages([]);
  };

  const handleShuffle = () => {
    const pages = generateTestPages(pageCount);
    setTestPages(pages);
  };

  const stats = useMemo(() => {
    if (testPages.length === 0) return null;
    
    const toneCount: Record<string, number> = {};
    testPages.forEach(p => {
      p.tone.forEach(t => {
        toneCount[t] = (toneCount[t] || 0) + 1;
      });
    });
    
    return {
      total: testPages.length,
      tones: Object.entries(toneCount).sort((a, b) => b[1] - a[1]),
    };
  }, [testPages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-codex-sepia" />
              <h2 className="font-serif text-lg font-medium">Test Panel</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Debug tools voor het testen van de memory loop.
          </p>
        </div>

        {/* Device Debug Section */}
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Bug className="w-3.5 h-3.5" />
            Device ID Debug
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Local ID:</span>
              <span className="text-foreground break-all max-w-[200px] text-right">
                {localDeviceId ? `${localDeviceId.slice(0, 8)}...${localDeviceId.slice(-4)}` : 'null'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">DB Top ID:</span>
              <span className="text-foreground break-all max-w-[200px] text-right">
                {dbDeviceId ? `${dbDeviceId.slice(0, 8)}...${dbDeviceId.slice(-4)}` : 'none'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Match:</span>
              <span className={deviceIdsMatch ? 'text-green-500' : 'text-red-500'}>
                {deviceIdsMatch ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pages in DB:</span>
              <span className="text-amber-400">{dbPageCount}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCopyDeviceId} variant="outline" size="sm" className="text-xs">
              <Copy className="w-3 h-3 mr-1" />
              Copy ID
            </Button>
            {!deviceIdsMatch && dbDeviceId && (
              <Button onClick={handleAdoptDbDeviceId} variant="codex" size="sm" className="text-xs">
                Adopt DB ID
              </Button>
            )}
          </div>
        </div>

        {/* Database Injection Section - PRIMARY */}
        <div className="p-4 bg-codex-gold/10 border-b border-border">
          <h3 className="text-xs font-medium text-codex-gold uppercase tracking-wide mb-2 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            Memory Loop Test Data
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Injecteer {testDataInfo.totalPages} realistische pagina's over {testDataInfo.timeSpan} met terugkerende thema's:
          </p>
          <ul className="text-xs text-muted-foreground mb-3 space-y-0.5 pl-3">
            {testDataInfo.threads.map((thread, i) => (
              <li key={i} className="list-disc list-inside">{thread}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button 
              onClick={handleInjectToDatabase} 
              variant="codex" 
              size="sm"
              disabled={isInjecting}
            >
              {isInjecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {injectProgress.current}/{injectProgress.total}
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-1" />
                  Injecteer in Database
                </>
              )}
            </Button>
            <Button 
              onClick={handleClearTestData} 
              variant="ghost" 
              size="sm"
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Wis Testdata
            </Button>
          </div>
        </div>

        {/* Empty State Previews */}
        <div className="p-4 bg-secondary/20 border-b border-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Preview Empty States
          </h3>
          <div className="flex flex-wrap gap-2">
            {onPreviewEmptyKompas && (
              <Button 
                onClick={onPreviewEmptyKompas} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                <Compass className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                Leeg Kompas
              </Button>
            )}
            {onPreviewEmptyPatterns && (
              <Button 
                onClick={onPreviewEmptyPatterns} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                <Brain className="w-3.5 h-3.5 mr-1.5 text-codex-sepia" />
                Leeg Patterns
              </Button>
            )}
            {onPreviewEmptyPersonality && (
              <Button 
                onClick={onPreviewEmptyPersonality} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                <Star className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                Leeg Personality
              </Button>
            )}
            <Button 
              onClick={() => setShowOnePager(true)} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              One-Pager
            </Button>
          </div>
        </div>

        {/* One-Pager Modal */}
        <AnimatePresence>
          {showOnePager && <OnePager onClose={() => setShowOnePager(false)} />}
        </AnimatePresence>

        {/* Local Test Data Generator */}
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Local Test Generator
          </h3>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-1.5 border border-border">
              <span className="text-xs text-muted-foreground">Aantal:</span>
              <select
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="bg-transparent text-sm font-medium focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <Button onClick={handleGenerate} variant="outline" size="sm">
              <FlaskConical className="w-4 h-4 mr-1" />
              Genereer
            </Button>
            
            {testPages.length > 0 && (
              <>
                <Button onClick={handleShuffle} variant="outline" size="sm">
                  <Shuffle className="w-4 h-4 mr-1" />
                  Shuffle
                </Button>
                <Button onClick={handleClear} variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Wissen
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-4 bg-codex-cream/50 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{stats.total} pagina's gegenereerd</span>
              <Button onClick={handleLoadAll} variant="codex" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Laad in app
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stats.tones.map(([tone, count]) => (
                <span key={tone} className={`tone-chip text-[10px] ${getToneClass(tone)}`}>
                  {tone}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Page list */}
        <div className="flex-1 overflow-y-auto p-4">
          {testPages.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Gebruik "Injecteer in Database" om de memory loop te testen
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {testPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 1) }}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === page.id ? null : page.id)}
                    className="w-full text-left p-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={page.imageUrl}
                        alt=""
                        className="w-10 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(page.createdAt, 'dd MMM yyyy')} · {formatDistanceToNow(page.createdAt, { addSuffix: true })}
                        </p>
                        <p className="text-sm line-clamp-1">
                          {page.summary}
                        </p>
                      </div>
                      {expandedId === page.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedId === page.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-3 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Tones</p>
                            <div className="flex flex-wrap gap-1">
                              {page.tone.map(t => (
                                <span key={t} className={`tone-chip text-[10px] ${getToneClass(t)}`}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Keywords</p>
                            <div className="flex flex-wrap gap-1">
                              {page.keywords.map(k => (
                                <span key={k} className="px-2 py-0.5 rounded-full bg-secondary text-[10px]">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">OCR Text</p>
                            <p className="text-xs text-muted-foreground line-clamp-3 font-mono">
                              {page.ocrText}
                            </p>
                          </div>
                          <Button
                            onClick={() => onViewPage(page as Page)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Bekijk in Snapshot View
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
