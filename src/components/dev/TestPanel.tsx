import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  FlaskConical, 
  Trash2, 
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
import { Page } from '@/lib/pageService';
import { injectTestData, clearTestData, resetAndInjectTestData, getTestDataInfo, copyRealPagesToDemo } from '@/lib/testDataInjector';
import { toast } from '@/hooks/use-toast';
import OnePager from '@/components/OnePager';
import { getDeviceId, setDeviceId as persistDeviceId } from '@/lib/deviceId';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface TestPanelProps {
  onClose: () => void;
  onLoadTestData: () => void;
  onViewPage: (page: Page) => void;
}

export function TestPanel({ 
  onClose, 
  onLoadTestData, 
}: TestPanelProps) {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [showOnePager, setShowOnePager] = useState(false);
  
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
      toast({ title: "Device ID copied" });
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

  const handleClearTestData = async () => {
    setIsClearing(true);
    try {
      const deleted = await clearTestData();
      toast({
        title: "Test data deleted",
        description: `${deleted} test pages removed.`,
      });
      onLoadTestData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete test data",
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
        description: `${cleared} old removed, ${inserted} fresh pages injected. Deterministic demo state ready.`,
      });
      
      onLoadTestData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Reset & inject failed",
        variant: "destructive"
      });
    } finally {
      setIsInjecting(false);
    }
  };

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
            Debug tools for testing the memory loop.
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
                  ? "Now viewing your real pages" 
                  : "Now viewing demo pages",
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
                  {isDemoMode ? 'Demo Mode ON' : 'Demo Mode OFF (Jonna)'}
                </div>
                <div className="text-xs opacity-70">
                  {isDemoMode 
                    ? 'Viewing demo data' 
                    : 'Viewing your real data'}
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-secondary">
              Click to switch
            </span>
          </button>
          
          {/* Warning when Demo Mode is OFF */}
          {!isDemoMode && (
            <div className="mt-3 p-3 bg-codex-teal/10 border border-codex-teal/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-primary text-lg">🔒</span>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Real Data Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jonna's data is protected. No destructive actions possible without Demo Mode.
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
            Copy your {dbPageCount} real pages to demo mode. Originals stay safe under your real device ID.
          </p>
          <div className="text-xs text-primary bg-primary/10 p-2 rounded mb-2 border border-primary/20">
            ⚠️ Clears existing demo data first, then copies selected amount.
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
                  toast({ title: "No device ID", description: "Cannot find real pages", variant: "destructive" });
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
                    title: "Pages copied to demo",
                    description: `${copied} pages copied, ${skipped} skipped. Originals untouched.`,
                  });
                  onLoadTestData();
                } catch (error) {
                  toast({ title: "Error", description: "Copy failed", variant: "destructive" });
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
            {!isDemoMode && <span className="text-xs text-muted-foreground ml-2">🔒 Demo Mode required</span>}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {testDataInfo.totalPages} fake pages as fallback:
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
              Clear Demo
            </Button>
          </div>
        </div>

        {/* Color Palette Previews */}
        <div className="p-4 bg-primary/5 border-b border-border">
          <h3 className="text-xs font-medium text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Color Palette
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/current-preview">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-primary/30 text-foreground hover:bg-primary/10"
              >
                <Palette className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Current (Forest)
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
                Walkthrough (Calm)
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
            <Button 
              onClick={() => setShowOnePager(true)} 
              variant="outline" 
              size="sm"
              className="text-xs border-primary/30 text-foreground hover:bg-primary/10"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-primary" />
              One-Pager
            </Button>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showOnePager && <OnePager onClose={() => setShowOnePager(false)} />}
        </AnimatePresence>

        {/* Spacer to fill remaining space */}
        <div className="flex-1" />
      </motion.div>
    </motion.div>
  );
}
