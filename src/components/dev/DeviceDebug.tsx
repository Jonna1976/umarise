import { useEffect, useState } from 'react';
import { getDeviceId } from '@/lib/deviceId';
import { supabase } from '@/integrations/supabase/client';

export function DeviceDebug() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [dbDeviceId, setDbDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    // Check which device_user_id has the most pages in the database
    const checkDb = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('device_user_id');

      if (!error && data && data.length > 0) {
        const counts = new Map<string, number>();
        for (const row of data) {
          const rowId = row.device_user_id as string | null;
          if (!rowId) continue;
          counts.set(rowId, (counts.get(rowId) ?? 0) + 1);
        }

        let topId: string | null = null;
        let topCount = 0;
        for (const [rowId, count] of counts.entries()) {
          if (count > topCount) {
            topId = rowId;
            topCount = count;
          }
        }

        setDbDeviceId(topId);
        setPageCount(topCount);
      }
    };

    checkDb();
  }, []);

  const match = deviceId === dbDeviceId;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50 max-w-xs">
      <div className="font-bold mb-1 text-amber-400">Debug</div>
      <div className="space-y-1">
        <div>
          <span className="text-muted-foreground">Local ID:</span>{' '}
          <span className="break-all">{deviceId || 'null'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">DB ID:</span>{' '}
          <span className="break-all">{dbDeviceId || 'none'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Match:</span>{' '}
          <span className={match ? 'text-green-400' : 'text-red-400'}>
            {match ? '✓' : '✗'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Pages:</span>{' '}
          <span className="text-amber-300">{pageCount}</span>
        </div>
      </div>
    </div>
  );
}
