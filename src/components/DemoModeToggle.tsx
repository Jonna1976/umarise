import { useDemoMode } from '@/contexts/DemoModeContext';
import { Camera, Layers, Cloud, Shield } from 'lucide-react';
import { getCurrentProvider, isHetznerEnabled, setHetznerEnabled } from '@/lib/abstractions';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const isHetzner = isHetznerEnabled();

  const toggleBackend = () => {
    setHetznerEnabled(!isHetzner);
    // Force page reload to reinitialize providers
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Demo/Jonna mode toggle */}
      <button
        onClick={toggleDemoMode}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isDemoMode
            ? 'bg-codex-gold/20 text-codex-gold border border-codex-gold/30'
            : 'bg-secondary text-muted-foreground border border-transparent hover:bg-secondary/80'
        }`}
        title={isDemoMode ? 'Switch to Full Mode' : 'Switch to Demo Mode'}
      >
        {isDemoMode ? (
          <>
            <Camera className="w-3.5 h-3.5" />
            <span>Demo</span>
          </>
        ) : (
          <>
            <Layers className="w-3.5 h-3.5" />
            <span>Jonna</span>
          </>
        )}
      </button>

      {/* Backend toggle - only visible in demo mode */}
      {isDemoMode && (
        <button
          onClick={toggleBackend}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all ${
            isHetzner
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}
          title={isHetzner ? 'Switch to Lovable Cloud' : 'Switch to Hetzner Vault'}
        >
          {isHetzner ? (
            <>
              <Shield className="w-3 h-3" />
              <span>Vault</span>
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3" />
              <span>Cloud</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
