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

  useEffect(() => {
    setLocalDeviceId(getDeviceId());
  }, []);

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
      <DrawerContent className="pb-24">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Device Sync
          </DrawerTitle>
          <DrawerDescription>
            Koppel je Codex aan een ander apparaat
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-6 space-y-6">
          {/* Current ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Jouw Device ID</label>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-3 bg-muted rounded-md text-xs font-mono truncate">
                {deviceId || '...'}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={handleCopy}
                disabled={!deviceId}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Adopt ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Plak ID van ander apparaat
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={adoptInput}
                  onChange={(e) => setAdoptInput(e.target.value)}
                  placeholder="Plak hier..."
                  className="font-mono text-sm h-12 pr-10"
                />
                {adoptInput && (
                  <button
                    onClick={() => setAdoptInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                    aria-label="Wissen"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleAdopt}
                disabled={!adoptInput.trim()}
                className="h-12 px-6"
              >
                Koppel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Kopieer het ID van je andere apparaat en plak het hierboven
            </p>
          </div>
        </div>

        <DrawerFooter className="pb-8">
          <DrawerClose asChild>
            <Button variant="outline" size="lg">Sluiten</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
