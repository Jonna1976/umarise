import { useState, useEffect } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Device Sync
          </DrawerTitle>
          <DrawerDescription>
            Koppel je Codex aan een ander apparaat
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4 space-y-4">
          {/* Current ID */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Jouw Device ID</label>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs font-mono truncate">
                {deviceId || '...'}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!deviceId}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Adopt ID */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Plak ID van ander apparaat
            </label>
            <div className="flex gap-2">
              <Input
                value={adoptInput}
                onChange={(e) => setAdoptInput(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="font-mono text-xs"
              />
              <Button
                onClick={handleAdopt}
                disabled={!adoptInput.trim()}
              >
                Koppel
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Sluiten</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
