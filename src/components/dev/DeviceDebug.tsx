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

    // Check pages in DB
    const checkDb = async () => {
      if (id) {
        const { count } = await supabase
          .from('pages')
          .select('*', { count: 'exact', head: true })
          .eq('device_user_id', id);
        setPageCount(count || 0);
      }

      // Also check what device_user_id exists in DB
      const { data } = await supabase
        .from('pages')
        .select('device_user_id')
        .limit(1);
      if (data && data.length > 0) {
        setDbDeviceId(data[0].device_user_id);
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
