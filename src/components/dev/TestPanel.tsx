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
  ToggleRight,
  Server,
  Cloud,
  Smartphone,
  Timer,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page } from '@/lib/pageService';
import { injectTestData, clearTestData, resetAndInjectTestData, getTestDataInfo, copyRealPagesToDemo } from '@/lib/testDataInjector';
import { toast } from '@/hooks/use-toast';
import OnePager from '@/components/OnePager';
import { getDeviceId, setDeviceId as persistDeviceId, getPilotTeam, joinPilotTeam, leavePilotTeam, PILOT_TEAM_IDS, PilotTeam } from '@/lib/deviceId';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { isHetznerEnabled, setHetznerEnabled, getCurrentProvider } from '@/lib/abstractions';
import { WidgetMockup } from './WidgetMockup';
import { PilotGuide } from './PilotGuide';

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
  const [showWidgetMockup, setShowWidgetMockup] = useState(false);
  const [showPilotGuide, setShowPilotGuide] = useState(false);
  
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectProgress, setInjectProgress] = useState({ current: 0, total: 0 });
  const [isClearing, setIsClearing] = useState(false);
  
  // Hetzner health check state
  const [hetznerHealth, setHetznerHealth] = useState<{
    vision: 'checking' | 'healthy' | 'error';
    codex: 'checking' | 'healthy' | 'error';
    visionError?: string;
    codexError?: string;
  } | null>(null);
  
  const checkHetznerHealth = async () => {
    setHetznerHealth({ vision: 'checking', codex: 'checking' });

    const baseUrl = import.meta.env.VITE_HETZNER_API_URL || 'http://94.130.180.233';

    try {
      const { data, error } = await supabase.functions.invoke('hetzner-health', {
        body: { baseUrl },
      });

      if (error) {
        throw new Error(error.message);
      }

      const visionResult = (data as any)?.vision as { status: 'healthy' | 'error'; error?: string } | undefined;
      const codexResult = (data as any)?.codex as { status: 'healthy' | 'error'; error?: string } | undefined;

      const next = {
        vision: visionResult?.status ?? 'error',
        codex: codexResult?.status ?? 'error',
        visionError: visionResult?.error,
        codexError: codexResult?.error,
      } as const;

      setHetznerHealth(next);

      if (next.vision === 'healthy' && next.codex === 'healthy') {
        toast({ title: '✅ Hetzner Health Check', description: 'All services healthy!' });
      } else {
        toast({
          title: '⚠️ Hetzner Health Check',
          description: `Vision: ${next.vision}, Codex: ${next.codex}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setHetznerHealth({ vision: 'error', codex: 'error', visionError: msg, codexError: msg });
      toast({
        title: '⚠️ Hetzner Health Check',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  
  // Double confirmation safeguard for real data protection
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [pendingDeleteAction, setPendingDeleteAction] = useState<(() => Promise<void>) | null>(null);

  // Device debug state
  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);
  
  // Known device IDs with their data
  const KNOWN_DEVICE_IDS = {
    // The "9 origins" dataset (January 2026 - SHA-256 Hash, Origin Witness, etc.)
    ORIGINS_9: 'ae3ff163-0750-45b4-8683-6f95267c7e1a',
    // The full dataset (53 pages from December 2025)
    FULL_ARCHIVE: '054aba4f-0453-4e6e-80c0-bdd554d19a91',
  } as const;
  
  // Default to the 9 origins dataset
  const PREFERRED_DEVICE_ID = KNOWN_DEVICE_IDS.ORIGINS_9;

  useEffect(() => {
    setLocalDeviceId(getDeviceId());
  }, []);

  const isOnPreferredDevice = localDeviceId === PREFERRED_DEVICE_ID;

  const handleCopyDeviceId = () => {
    if (localDeviceId) {
      navigator.clipboard.writeText(localDeviceId);
      toast({ title: "Device ID copied" });
    }
  };

  const handleAdoptDeviceId = (deviceId: string, label: string) => {
    if (localDeviceId !== deviceId) {
      // Clear trash state for clean switch
      const trashKeys = Object.keys(localStorage).filter(k => k.startsWith('umarise_trash_'));
      trashKeys.forEach(k => localStorage.removeItem(k));
      
      persistDeviceId(deviceId);
      setLocalDeviceId(deviceId);
      toast({ title: `Switched to ${label}`, description: "Refreshing..." });
      setTimeout(() => window.location.reload(), 500);
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
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
      >
        {/* Header - Fixed */}
        <div className="p-4 border-b border-border bg-background shrink-0">
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
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

        {/* Dev Features Toggle - PROMINENT */}
        <div className="p-4 border-b border-border bg-background">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Feature Mode
          </h3>
          <button
            onClick={() => {
              toggleDemoMode();
              onLoadTestData();
              toast({
                title: isDemoMode ? "Dev Features ON" : "Wedge Mode",
                description: isDemoMode 
                  ? "All features visible (Patterns, Personality, etc.)" 
                  : "Focused on core: Capture → Search → Proof",
              });
            }}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              isDemoMode 
                ? 'bg-codex-teal/10 border-codex-teal/50 text-codex-teal' 
                : 'bg-primary/10 border-primary/50 text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              {isDemoMode ? (
                <ToggleLeft className="w-6 h-6" />
              ) : (
                <ToggleRight className="w-6 h-6" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {isDemoMode ? 'Wedge Mode (focused)' : 'Dev Features ON'}
                </div>
                <div className="text-xs opacity-70">
                  {isDemoMode 
                    ? 'Capture → Search → Proof' 
                    : 'All features visible'}
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-secondary">
              {isDemoMode ? 'Enable dev' : 'Focus mode'}
            </span>
          </button>
          
          {/* Info when in Wedge Mode */}
          {isDemoMode && (
            <div className="mt-3 p-3 bg-codex-teal/10 border border-codex-teal/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-codex-teal text-lg">🎯</span>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Wedge Mode Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only core features: Capture, Search, Proof. No Patterns, Personality, Insights.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backend Provider Toggle */}
        <div className="p-4 border-b border-border bg-background">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Backend Provider
          </h3>
          <button
            onClick={() => {
              const newState = !isHetznerEnabled();
              setHetznerEnabled(newState);
              toast({
                title: newState ? "🔒 Hetzner Privacy Vault" : "☁️ Lovable Cloud",
                description: newState
                  ? "Now using Vault backend (session-only; auto-resets later)"
                  : "Now using Cloud backend",
              });
              // Reload to reinitialize providers
              setTimeout(() => window.location.reload(), 500);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              isHetznerEnabled()
                ? 'bg-codex-teal/10 border-codex-teal/50 text-codex-teal'
                : 'bg-primary/10 border-primary/50 text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              {isHetznerEnabled() ? (
                <Server className="w-6 h-6" />
              ) : (
                <Cloud className="w-6 h-6" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {isHetznerEnabled() ? 'Hetzner Privacy Vault' : 'Lovable Cloud'}
                </div>
                <div className="text-xs opacity-70">
                  {isHetznerEnabled()
                    ? 'Encrypted storage + local AI'
                    : 'Cloud (standard)'}
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-secondary">
              Click to switch
            </span>
          </button>
          
          {/* Hetzner status indicator */}
          {isHetznerEnabled() && (
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-codex-teal/10 border border-codex-teal/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-codex-teal text-lg">🔐</span>
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Privacy Vault Active</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All data encrypted. Local AI processing. Zero cloud dependency.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Health Check */}
              <div className="p-3 bg-secondary/50 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Service Health</span>
                  <Button 
                    onClick={checkHetznerHealth} 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs"
                    disabled={hetznerHealth?.vision === 'checking'}
                  >
                    {hetznerHealth?.vision === 'checking' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Check'
                    )}
                  </Button>
                </div>
                
                {hetznerHealth && (
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vision (3341):</span>
                      <span className={hetznerHealth.vision === 'healthy' ? 'text-codex-teal' : hetznerHealth.vision === 'checking' ? 'text-muted-foreground' : 'text-primary'}>
                        {hetznerHealth.vision === 'healthy' ? '✓ Healthy' : hetznerHealth.vision === 'checking' ? '...' : `✗ ${hetznerHealth.visionError || 'Error'}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Codex (3342):</span>
                      <span className={hetznerHealth.codex === 'healthy' ? 'text-codex-teal' : hetznerHealth.codex === 'checking' ? 'text-muted-foreground' : 'text-primary'}>
                        {hetznerHealth.codex === 'healthy' ? '✓ Healthy' : hetznerHealth.codex === 'checking' ? '...' : `✗ ${hetznerHealth.codexError || 'Error'}`}
                      </span>
                    </div>
                  </div>
                )}
                
                {!hetznerHealth && (
                  <p className="text-xs text-muted-foreground">Click 'Check' to verify connectivity</p>
                )}
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
          </div>
          
          {/* Device ID Switcher */}
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Switch to a known dataset:</p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => handleAdoptDeviceId(KNOWN_DEVICE_IDS.ORIGINS_9, '9 Origins')} 
                variant={localDeviceId === KNOWN_DEVICE_IDS.ORIGINS_9 ? 'default' : 'outline'}
                size="sm" 
                className="text-xs justify-start"
                disabled={localDeviceId === KNOWN_DEVICE_IDS.ORIGINS_9}
              >
                {localDeviceId === KNOWN_DEVICE_IDS.ORIGINS_9 ? '✓ ' : ''}9 Origins (Jan 2026)
              </Button>
              <Button 
                onClick={() => handleAdoptDeviceId(KNOWN_DEVICE_IDS.FULL_ARCHIVE, 'Full Archive')} 
                variant={localDeviceId === KNOWN_DEVICE_IDS.FULL_ARCHIVE ? 'default' : 'outline'}
                size="sm" 
                className="text-xs justify-start"
                disabled={localDeviceId === KNOWN_DEVICE_IDS.FULL_ARCHIVE}
              >
                {localDeviceId === KNOWN_DEVICE_IDS.FULL_ARCHIVE ? '✓ ' : ''}Full Archive (53 pages)
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCopyDeviceId} variant="outline" size="sm" className="text-xs">
              <Copy className="w-3 h-3 mr-1" />
              Copy ID
            </Button>
          </div>
        </div>

        {/* Pilot Tracker Link */}
        <div className="p-4 border-b border-border bg-codex-teal/5">
          <h3 className="text-xs font-medium text-codex-teal uppercase tracking-wide mb-3 flex items-center gap-2">
            <Timer className="w-3.5 h-3.5" />
            MKB Pilot Tools
          </h3>
          
          {/* Join Pilot Team */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              Join een pilot team om data te delen met teamleden:
            </p>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as PilotTeam[]).map((team) => {
                const isActive = getPilotTeam() === team;
                return (
                  <button
                    key={team}
                    onClick={() => {
                      if (isActive) {
                        leavePilotTeam();
                        toast({ 
                          title: `Team ${team} verlaten`, 
                          description: 'Je hebt nu een persoonlijke device ID' 
                        });
                      } else {
                        joinPilotTeam(team);
                        toast({ 
                          title: `Team ${team} gejoined!`, 
                          description: 'Alle teamleden delen nu dezelfde data' 
                        });
                      }
                      // Reload to apply new device ID
                      setTimeout(() => window.location.reload(), 500);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-codex-teal text-white border-codex-teal'
                        : 'bg-secondary/50 text-foreground border-border hover:border-codex-teal/50'
                    }`}
                  >
                    Team {team}
                    {isActive && ' ✓'}
                  </button>
                );
              })}
            </div>
            {getPilotTeam() && (
              <div className="mt-2 p-2 bg-codex-teal/10 rounded text-xs">
                <span className="text-codex-teal font-medium">Actief: Team {getPilotTeam()}</span>
                <span className="text-muted-foreground ml-2">
                  (ID: {PILOT_TEAM_IDS[getPilotTeam()!].slice(0, 12)}...)
                </span>
              </div>
            )}
          </div>
          
          {/* Pilot Guide Button */}
          <button
            onClick={() => setShowPilotGuide(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all mb-3"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium text-foreground">Pilot Handleiding</div>
                <div className="text-xs text-muted-foreground">Capture, Search & 60s Test instructies</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
              Lees
            </span>
          </button>
          
          {/* Pilot Tracker Link */}
          <Link 
            to="/pilot-tracker" 
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-lg border-2 border-codex-teal/30 bg-codex-teal/10 hover:bg-codex-teal/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-codex-teal" />
              <div>
                <div className="font-medium text-foreground">Pilot Tracker</div>
                <div className="text-xs text-muted-foreground">30 retrieval tests met stopwatch</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-codex-teal/20 text-codex-teal">
              Open →
            </span>
          </Link>
        </div>

        {/* Copy Real Pages to Demo */}
        <div className="p-4 bg-codex-teal/10 border-b border-border">
          <h3 className="text-xs font-medium text-codex-teal uppercase tracking-wide mb-2 flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            Copy Real Pages to Demo
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Copy your real pages to demo mode. Originals stay safe under your real device ID.
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
              <option value="all">All pages</option>
              <option value="5">5 pages</option>
              <option value="10">10 pages</option>
              <option value="25">25 pages</option>
              <option value="50">50 pages</option>
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
              disabled={isInjecting}
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
            <Button 
              onClick={() => setShowWidgetMockup(true)} 
              variant="outline" 
              size="sm"
              className="text-xs border-primary/30 text-foreground hover:bg-primary/10"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Widget Mockup
            </Button>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showOnePager && <OnePager onClose={() => setShowOnePager(false)} />}
          {showPilotGuide && <PilotGuide onClose={() => setShowPilotGuide(false)} />}
          {showWidgetMockup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-background overflow-auto"
            >
              <div className="sticky top-4 right-4 z-10 flex justify-end p-4">
                <Button 
                  onClick={() => setShowWidgetMockup(false)}
                  variant="outline"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Sluiten
                </Button>
              </div>
              <WidgetMockup />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer to fill remaining space */}
        <div className="flex-1" />
        </div>{/* End Scrollable Content */}
      </motion.div>
    </motion.div>
  );
}
