import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  FlaskConical, 
  FileText,
  Bug,
  Copy,
  Play,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Timer,
  BookOpen,
  Server,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page } from '@/lib/pageService';
import { toast } from '@/hooks/use-toast';
import OnePager from '@/components/OnePager';
import { getDeviceId, getPilotTeam, joinPilotTeam, leavePilotTeam, PILOT_TEAM_IDS, PilotTeam } from '@/lib/deviceId';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { isHetznerEnabled } from '@/lib/abstractions';
import { supabase } from '@/integrations/supabase/client';
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
  
  // Device debug state
  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);
  
  // Backend status (read-only, for verification)
  const isVaultActive = isHetznerEnabled();
  const [healthStatus, setHealthStatus] = useState<{
    checking: boolean;
    vision: 'unknown' | 'healthy' | 'error';
    codex: 'unknown' | 'healthy' | 'error';
  }>({ checking: false, vision: 'unknown', codex: 'unknown' });

  useEffect(() => {
    setLocalDeviceId(getDeviceId());
  }, []);

  const handleCopyDeviceId = () => {
    if (localDeviceId) {
      navigator.clipboard.writeText(localDeviceId);
      toast({ title: "Device ID copied" });
    }
  };

  const checkHealth = async () => {
    if (!isVaultActive) return;
    
    setHealthStatus({ checking: true, vision: 'unknown', codex: 'unknown' });
    const baseUrl = import.meta.env.VITE_HETZNER_API_URL || 'https://vault.umarise.com';

    try {
      const { data, error } = await supabase.functions.invoke('hetzner-health', {
        body: { baseUrl },
      });

      if (error) throw new Error(error.message);

      const visionOk = (data as any)?.vision?.status === 'healthy';
      const codexOk = (data as any)?.codex?.status === 'healthy';

      setHealthStatus({
        checking: false,
        vision: visionOk ? 'healthy' : 'error',
        codex: codexOk ? 'healthy' : 'error',
      });

      toast({
        title: visionOk && codexOk ? '✅ Vault OK' : '⚠️ Vault Issue',
        description: `Vision: ${visionOk ? 'OK' : 'Error'}, Codex: ${codexOk ? 'OK' : 'Error'}`,
        variant: visionOk && codexOk ? 'default' : 'destructive',
      });
    } catch (err) {
      setHealthStatus({ checking: false, vision: 'error', codex: 'error' });
      toast({
        title: '⚠️ Health Check Failed',
        description: err instanceof Error ? err.message : 'Network error',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-codex-ink/80 backdrop-blur-sm"
    >
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

        {/* Backend Status - Read-only, for internal verification */}
        <div className="p-4 border-b border-border bg-background">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Data Backend
          </h3>
          
          {/* Current Status - No toggle, just truth */}
          <div className={`p-3 rounded-lg border-2 ${
            isVaultActive 
              ? 'bg-codex-teal/10 border-codex-teal/50' 
              : 'bg-primary/10 border-primary/50'
          }`}>
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-codex-teal" />
              <div>
                <div className="font-medium text-foreground">
                  {isVaultActive ? 'Hetzner Privacy Vault' : 'Lovable Cloud'}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {isVaultActive ? 'vault.umarise.com (DE)' : 'Supabase Cloud'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Health Check - Only for Vault */}
          {isVaultActive && (
            <div className="mt-3 p-3 bg-secondary/50 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-foreground">Service Health</span>
                  {healthStatus.vision !== 'unknown' && (
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      Vision: {healthStatus.vision === 'healthy' ? '✓' : '✗'} · 
                      Codex: {healthStatus.codex === 'healthy' ? '✓' : '✗'}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={checkHealth} 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  disabled={healthStatus.checking}
                >
                  {healthStatus.checking ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </Button>
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

        {/* Hidden sections - not needed for pilot
            Copy Real Pages, Fake Demo Data, Color Palette are hidden for cleaner pilot experience.
            Alignment Tools remain visible below.
        */}

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
