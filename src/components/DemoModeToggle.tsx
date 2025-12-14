import { useDemoMode } from '@/contexts/DemoModeContext';
import { Switch } from '@/components/ui/switch';
import { Camera, Layers } from 'lucide-react';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center gap-2">
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
            <span>Full</span>
          </>
        )}
      </button>
    </div>
  );
}
