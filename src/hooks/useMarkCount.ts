// Hook to track mark count for backup nudge logic
import { useState, useEffect, useCallback } from 'react';

const MARK_COUNT_KEY = 'umarise-mark-count';
const BACKUP_NUDGE_SHOWN_KEY = 'umarise-backup-nudge-shown';

export function useMarkCount() {
  const [markCount, setMarkCount] = useState(0);
  const [hasShownBackupNudge, setHasShownBackupNudge] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedCount = localStorage.getItem(MARK_COUNT_KEY);
    const nudgeShown = localStorage.getItem(BACKUP_NUDGE_SHOWN_KEY);
    
    if (storedCount) {
      setMarkCount(parseInt(storedCount, 10));
    }
    if (nudgeShown === 'true') {
      setHasShownBackupNudge(true);
    }
  }, []);

  // Increment mark count (called after successful mark)
  const incrementMarkCount = useCallback(() => {
    setMarkCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem(MARK_COUNT_KEY, String(newCount));
      return newCount;
    });
  }, []);

  // Mark the backup nudge as shown (one-time)
  const markBackupNudgeShown = useCallback(() => {
    setHasShownBackupNudge(true);
    localStorage.setItem(BACKUP_NUDGE_SHOWN_KEY, 'true');
  }, []);

  // Should show backup nudge: after 3rd mark, only once
  const shouldShowBackupNudge = markCount >= 3 && !hasShownBackupNudge;

  return {
    markCount,
    incrementMarkCount,
    shouldShowBackupNudge,
    markBackupNudgeShown,
  };
}
