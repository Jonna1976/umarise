import { useDemoMode } from '@/contexts/DemoModeContext';
import { Camera, Layers, Cloud, Shield, Check } from 'lucide-react';
import { isHetznerEnabled } from '@/lib/abstractions';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const isHetzner = isHetznerEnabled();

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

      {/* Backend indicator - always visible, NOT clickable */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium ${
          isHetzner
            ? 'bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/20'
            : 'bg-blue-500/10 text-blue-400/70 border border-blue-500/20'
        }`}
        title={isHetzner ? 'Connected to Hetzner Vault' : 'Connected to Lovable Cloud'}
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
            <Check className="w-2.5 h-2.5 ml-0.5" />
          </>
        )}
      </div>
    </div>
  );
}
