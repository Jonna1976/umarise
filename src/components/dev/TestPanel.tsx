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
  Copy,
  Palette,
  Play,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateTestPages, TestPage } from '@/lib/testData';
import { Page } from '@/lib/pageService';
import { formatDistanceToNow, format } from 'date-fns';
import { injectTestData, clearTestData, resetAndInjectTestData, getTestDataInfo, copyRealPagesToDemo } from '@/lib/testDataInjector';
import { toast } from '@/hooks/use-toast';
import OnePager from '@/components/OnePager';
import { getDeviceId, setDeviceId as persistDeviceId, DEMO_DEVICE_ID } from '@/lib/deviceId';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';

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
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [showOnePager, setShowOnePager] = useState(false);
  
  const [testPages, setTestPages] = useState<TestPage[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(100);
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectProgress, setInjectProgress] = useState({ current: 0, total: 0 });
  const [isClearing, setIsClearing] = useState(false);
  
  // Double confirmation safeguard for real data protection
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [pendingDeleteAction, setPendingDeleteAction] = useState<(() => Promise<void>) | null>(null);

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
      toast({ title: "Device ID adopted", description: "Reload the page to see your memory." });
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

  // Idempotent reset + inject for reproducible demo state
  const handleResetAndInject = async () => {
    setIsInjecting(true);
    
    try {
      const { cleared, inserted } = await resetAndInjectTestData((current, total) => {
        setInjectProgress({ current, total });
      });
      
      toast({
        title: "Demo data reset",
        description: `${cleared} oude verwijderd, ${inserted} verse pagina's geïnjecteerd. Deterministische demo-staat klaar.`,
      });
      
      onLoadTestData();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Reset & inject mislukt",
        variant: "destructive"
      });
    } finally {
      setIsInjecting(false);
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

  // Safeguard: require double confirmation for any destructive action on real data
  const requireDoubleConfirmation = (action: () => Promise<void>, description: string) => {
    // Demo mode operations are always allowed without confirmation
    if (isDemoMode) {
      action();
      return;
    }
    
    // Real data operations require double confirmation
    toast({
      title: "⛔ STOP - Real Data Protected",
      description: `You tried to: ${description}. This would affect your REAL data. Enable Demo Mode first.`,
      variant: "destructive",
    });
  };

  const executeConfirmedDelete = async () => {
    if (deleteConfirmInput.toUpperCase() !== 'DELETE' || !pendingDeleteAction) return;
    
    await pendingDeleteAction();
    setShowDeleteConfirm(false);
    setDeleteConfirmInput('');
    setPendingDeleteAction(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmInput('');
    setPendingDeleteAction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-codex-ink/80 backdrop-blur-sm"
    >
      {/* Double Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-codex-ink-deep/90 flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-2 border-primary/50 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground">Bevestiging Vereist</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Je staat op het punt om <strong>ECHTE DATA</strong> te verwijderen.
                  Dit kan NIET ongedaan worden gemaakt.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Type <span className="text-primary font-bold">DELETE</span> om te bevestigen:
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-primary/30 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
                  placeholder="DELETE"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={cancelDelete}
                >
                  Annuleren
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1"
                  disabled={deleteConfirmInput.toUpperCase() !== 'DELETE'}
                  onClick={executeConfirmedDelete}
                >
                  Verwijder Data
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-medium text-foreground">Test Panel</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Debug tools voor het testen van de memory loop.
          </p>
        </div>

        {/* Demo Mode Toggle - PROMINENT */}
        <div className="p-4 border-b border-border bg-background">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Data Mode
          </h3>
          <button
            onClick={() => {
              toggleDemoMode();
              onLoadTestData();
              toast({
                title: isDemoMode ? "Switched to Your Data" : "Switched to Demo Data",
                description: isDemoMode 
                  ? "Nu zie je je echte pages" 
                  : "Nu zie je de demo pages",
              });
            }}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              isDemoMode 
                ? 'bg-primary/10 border-primary/50 text-primary' 
                : 'bg-codex-teal/10 border-codex-teal/50 text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              {isDemoMode ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {isDemoMode ? 'Demo Mode AAN' : 'Demo Mode UIT (Jonna)'}
                </div>
                <div className="text-xs opacity-70">
                  {isDemoMode 
                    ? 'Je ziet demo data' 
                    : 'Je ziet je echte data'}
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-secondary">
              Klik om te wisselen
            </span>
          </button>
          
          {/* Warning when Demo Mode is OFF */}
          {!isDemoMode && (
            <div className="mt-3 p-3 bg-codex-teal/10 border border-codex-teal/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-primary text-lg">🔒</span>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Echte Data Actief</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jonna's data is beschermd. Geen enkele destructieve actie is mogelijk zonder Demo Mode.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Device Debug Section */}
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="text-xs font-medium text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
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
              <span className={deviceIdsMatch ? 'text-codex-teal' : 'text-primary'}>
                {deviceIdsMatch ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pages in DB:</span>
              <span className="text-primary">{dbPageCount}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCopyDeviceId} variant="outline" size="sm" className="text-xs">
              <Copy className="w-3 h-3 mr-1" />
              Copy ID
            </Button>
            {!deviceIdsMatch && dbDeviceId && (
              <Button onClick={handleAdoptDbDeviceId} variant="default" size="sm" className="text-xs">
                Adopt DB ID
              </Button>
            )}
          </div>
        </div>

        {/* Copy Real Pages to Demo */}
        <div className="p-4 bg-codex-teal/10 border-b border-border">
          <h3 className="text-xs font-medium text-codex-teal uppercase tracking-wide mb-2 flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            Copy Real Pages to Demo
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Kopieer je echte {dbPageCount} pages naar demo mode. Originelen blijven veilig onder je echte device ID.
          </p>
          <div className="text-xs text-primary bg-primary/10 p-2 rounded mb-2 border border-primary/20">
            ⚠️ Wist eerst bestaande demo data, dan kopieert geselecteerde aantal.
          </div>
          <div className="flex gap-2 items-center">
            <select 
              className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground"
              id="copyLimit"
              defaultValue="all"
            >
              <option value="all">All ({dbPageCount})</option>
              {dbPageCount > 5 && <option value="5">5 pages</option>}
              {dbPageCount > 10 && <option value="10">10 pages</option>}
              {dbPageCount > 25 && <option value="25">25 pages</option>}
              {dbPageCount > 50 && <option value="50">50 pages</option>}
            </select>
            <Button 
              onClick={async () => {
                const realId = getDeviceId();
                if (!realId) {
                  toast({ title: "Geen device ID", description: "Kan echte pages niet vinden", variant: "destructive" });
                  return;
                }
                const selectEl = document.getElementById('copyLimit') as HTMLSelectElement;
                const limitValue = selectEl?.value;
                const limit = limitValue === 'all' ? undefined : parseInt(limitValue, 10);
                
                setIsInjecting(true);
                try {
                  const { copied, skipped } = await copyRealPagesToDemo(realId, (current, total) => {
                    setInjectProgress({ current, total });
                  }, limit);
                  toast({
                    title: "Pages gekopieerd naar demo",
                    description: `${copied} pages gekopieerd, ${skipped} overgeslagen. Originelen onaangetast.`,
                  });
                  onLoadTestData();
                } catch (error) {
                  toast({ title: "Fout", description: "Kopiëren mislukt", variant: "destructive" });
                } finally {
                  setIsInjecting(false);
                }
              }}
              variant="default" 
              size="sm"
              disabled={isInjecting || dbPageCount === 0}
            >
              {isInjecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {injectProgress.current}/{injectProgress.total}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy → Demo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Database Injection Section - FAKE DATA */}
        <div className={`p-4 border-b border-border ${!isDemoMode ? 'opacity-50 pointer-events-none' : 'bg-primary/5'}`}>
          <h3 className="text-xs font-medium text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            Fake Demo Data (Fallback)
            {!isDemoMode && <span className="text-xs text-muted-foreground ml-2">🔒 Demo Mode vereist</span>}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {testDataInfo.totalPages} fake pages als alternatief:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleResetAndInject} 
              variant="outline" 
              size="sm"
              disabled={isInjecting || !isDemoMode}
            >
              {isInjecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {injectProgress.current}/{injectProgress.total}
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-1" />
                  Inject Fake Data
                </>
              )}
            </Button>
            <Button 
              onClick={handleClearTestData} 
              variant="ghost" 
              size="sm"
              disabled={isClearing || !isDemoMode}
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Wis Demo
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
                <Compass className="w-3.5 h-3.5 mr-1.5 text-primary" />
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
                <Brain className="w-3.5 h-3.5 mr-1.5 text-primary" />
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
                <Star className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Leeg Personality
              </Button>
            )}
            <Button 
              onClick={() => setShowOnePager(true)} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-primary" />
              One-Pager
            </Button>
          </div>
        </div>

        {/* Color Palette Previews */}
        <div className="p-4 bg-primary/5 border-b border-border">
          <h3 className="text-xs font-medium text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Color Palette Vergelijking
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/current-preview">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-primary/30 text-foreground hover:bg-primary/10"
              >
                <Palette className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Huidig (Forest)
              </Button>
            </Link>
            <Link to="/warm-preview">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-primary/30 text-foreground hover:bg-primary/10"
              >
                <Palette className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Warm (Library)
              </Button>
            </Link>
            <Link to="/demo-walkthrough">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-codex-teal/30 text-foreground hover:bg-codex-teal/10"
              >
                <Palette className="w-3.5 h-3.5 mr-1.5 text-codex-teal" />
                Walkthrough Colors
              </Button>
            </Link>
          </div>
        </div>

        {/* Alignment Tools */}
        <div className="p-4 bg-codex-teal/10 border-b border-border">
          <h3 className="text-xs font-medium text-codex-teal uppercase tracking-wide mb-3 flex items-center gap-2">
            <Play className="w-3.5 h-3.5" />
            Alignment Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/demo-walkthrough">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-codex-teal/30 text-foreground hover:bg-codex-teal/10"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-codex-teal" />
                Demo Walkthrough
              </Button>
            </Link>
          </div>
        </div>

        {/* Modals */}
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
                className="bg-transparent text-sm font-medium focus:outline-none text-foreground"
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
          <div className="p-4 bg-secondary/30 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{stats.total} pagina's gegenereerd</span>
              <Button onClick={handleLoadAll} variant="default" size="sm">
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
                        <p className="text-sm line-clamp-1 text-foreground">
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
                                <span key={k} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-foreground">
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
