import { useEffect, useState, useCallback } from 'react';
import { getDeviceId, setDeviceId as persistDeviceId } from '@/lib/deviceId';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceDebugProps {
  onAdopt?: () => void;
}

export function DeviceDebug({ onAdopt }: DeviceDebugProps) {
  const [localId, setLocalId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [adoptInput, setAdoptInput] = useState('');

  useEffect(() => {
    setLocalId(getDeviceId());
  }, []);

  const handleCopy = useCallback(() => {
    if (localId) {
      navigator.clipboard.writeText(localId);
      setCopied(true);
      toast.success('Device ID gekopieerd');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [localId]);

  const handleAdopt = useCallback(() => {
    const trimmedId = adoptInput.trim();
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      toast.error('Ongeldige Device ID (moet UUID formaat zijn)');
      return;
    }
    
    if (trimmedId === localId) {
      toast.info('Dit is al je huidige Device ID');
      return;
    }
    
    persistDeviceId(trimmedId);
    setLocalId(trimmedId);
    setAdoptInput('');
    toast.success('Device ID gekoppeld! Pagina herlaadt...');
    onAdopt?.();
    setTimeout(() => window.location.reload(), 500);
  }, [adoptInput, localId, onAdopt]);

  return (
    <div className="bg-black/80 text-white text-xs p-3 rounded-lg font-mono">
      <div className="font-bold mb-2 text-amber-400 flex items-center gap-2">
        <Link2 className="w-3 h-3" />
        Device Sync
      </div>
      
      {/* Current Device ID */}
      <div className="mb-3">
        <span className="text-muted-foreground">Huidige ID:</span>
        <div className="flex items-center gap-1 mt-1">
          <span className="break-all text-[10px] bg-black/50 px-1.5 py-0.5 rounded flex-1">
            {localId || 'null'}
          </span>
          <button 
            onClick={handleCopy}
            className="text-muted-foreground hover:text-white p-1"
            title="Kopieer ID"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Adopt Device ID */}
      <div className="border-t border-white/10 pt-2">
        <span className="text-muted-foreground text-[10px]">
          Plak ID van ander apparaat om te koppelen:
        </span>
        <div className="flex gap-1 mt-1">
          <Input
            value={adoptInput}
            onChange={(e) => setAdoptInput(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="h-6 text-[10px] bg-black/50 border-white/20 text-white placeholder:text-white/30"
          />
          <Button 
            size="sm" 
            onClick={handleAdopt}
            disabled={!adoptInput.trim()}
            className="h-6 px-2 text-[10px] bg-amber-600 hover:bg-amber-500 text-white border-0"
          >
            Koppel
          </Button>
        </div>
      </div>
    </div>
  );
}
