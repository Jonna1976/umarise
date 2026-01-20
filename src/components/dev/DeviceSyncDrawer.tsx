import { useState, useEffect, forwardRef } from 'react';
import { Link2, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { getDeviceId, setDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';

interface DeviceSyncDrawerProps {
  trigger: React.ReactNode;
}

// Wrapper button that forwards ref for drawer trigger
const TriggerButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
);
TriggerButton.displayName = 'TriggerButton';

export function DeviceSyncDrawer({ trigger }: DeviceSyncDrawerProps) {
  const [deviceId, setLocalDeviceId] = useState<string | null>(null);
  const [adoptInput, setAdoptInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setLocalDeviceId(getDeviceId());
  }, []);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setShowInput(false);
      setAdoptInput('');
    }
  }, [open]);

  const handleCopy = async () => {
    if (!deviceId) return;
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopied(true);
      toast.success('ID gekopieerd');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kopiëren mislukt');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAdoptInput(text.trim());
        setShowInput(true);
      } else {
        setShowInput(true);
      }
    } catch {
      // Clipboard access denied, just show input
      setShowInput(true);
    }
  };

  const handleAdopt = () => {
    const trimmed = adoptInput.trim();
    if (!trimmed) return;

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmed)) {
      toast.error('Ongeldig ID formaat');
      return;
    }

    if (trimmed === deviceId) {
      toast.info('Dit is al je huidige ID');
      return;
    }

    // Clear local trash state before switching
    localStorage.removeItem('umarise_trash');
    
    setDeviceId(trimmed);
    toast.success('ID gekoppeld - herladen...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] pb-[calc(env(safe-area-inset-bottom)+12rem)]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Device Sync
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Step 1: Paste button OR Step 2: Input field */}
          {!showInput ? (
            <Button
              onClick={handlePasteFromClipboard}
              className="w-full h-14 text-base gap-2"
              variant="outline"
            >
              <Copy className="w-5 h-5" />
              Plak ID van ander apparaat
            </Button>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Bevestig ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={adoptInput}
                    onChange={(e) => setAdoptInput(e.target.value)}
                    placeholder="Plak hier..."
                    className="font-mono text-sm h-12 pr-10"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    autoFocus
                  />
                  {adoptInput && (
                    <button
                      onClick={() => setAdoptInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                      aria-label="Wissen"
                      type="button"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleAdopt}
                  disabled={!adoptInput.trim()}
                  className="h-12 px-5"
                >
                  Koppel
                </Button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <label className="text-sm text-muted-foreground">Dit apparaat</label>
            <div className="flex gap-2 mt-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md text-[10px] font-mono truncate leading-relaxed">
                {deviceId || '...'}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={handleCopy}
                disabled={!deviceId}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-xs">{copied ? 'Gekopieerd' : 'Kopieer'}</span>
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-6">
          <DrawerClose asChild>
            <Button variant="ghost" size="sm">Sluiten</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
