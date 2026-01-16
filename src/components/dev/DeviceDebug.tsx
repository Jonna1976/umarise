import { useEffect, useState, useCallback } from 'react';
import { getDeviceId, setDeviceId as persistDeviceId } from '@/lib/deviceId';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceDebugProps {
  onAdopt?: () => void;
}

export function DeviceDebug({ onAdopt }: DeviceDebugProps) {
  const [localId, setLocalId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Known good device ID with 53 pages
  const KNOWN_GOOD_ID = '054aba4f-0453-4e6e-80c0-bdd554d19a91';

  useEffect(() => {
    setLocalId(getDeviceId());
  }, []);

  const match = localId === KNOWN_GOOD_ID;

  const handleCopy = useCallback(() => {
    if (localId) {
      navigator.clipboard.writeText(localId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [localId]);

  const handleAdopt = useCallback(() => {
    persistDeviceId(KNOWN_GOOD_ID);
    setLocalId(KNOWN_GOOD_ID);
    toast.success('Device ID adopted! Refreshing...');
    onAdopt?.();
    // Force page reload to pick up new device ID
    setTimeout(() => window.location.reload(), 500);
  }, [onAdopt]);

  return (
    <div className="bg-black/80 text-white text-xs p-3 rounded-lg font-mono max-w-xs">
      <div className="font-bold mb-2 text-amber-400">Device ID Debug</div>
      <div className="space-y-2">
        <div>
          <span className="text-muted-foreground">Local ID:</span>{' '}
          <span className="break-all text-[10px]">{localId || 'null'}</span>
          <button 
            onClick={handleCopy}
            className="ml-1 text-muted-foreground hover:text-white"
          >
            {copied ? <Check className="w-3 h-3 inline" /> : <Copy className="w-3 h-3 inline" />}
          </button>
        </div>
        <div>
          <span className="text-muted-foreground">Expected:</span>{' '}
          <span className="break-all text-[10px]">{KNOWN_GOOD_ID}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Match:</span>{' '}
          <span className={match ? 'text-green-400' : 'text-red-400'}>
            {match ? '✓ OK' : '✗ Mismatch'}
          </span>
        </div>
        {!match && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAdopt}
            className="w-full mt-2 text-xs h-7 bg-amber-600 hover:bg-amber-500 text-white border-0"
          >
            Adopt Known ID (53 pages)
          </Button>
        )}
      </div>
    </div>
  );
}
