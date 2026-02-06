/**
 * useClaimAnonymousMarks Hook
 * 
 * Automatically detects when a user has authenticated and checks
 * for anonymous marks from their device that can be claimed.
 * 
 * Per v4 strategy: marks created before email verification remain
 * associated with device_user_id. This hook links them to user_id
 * once the user verifies their email.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';

interface ClaimableMarks {
  count: number;
  previews: Array<{
    id: string;
    imageUrl: string;
    createdAt: Date;
  }>;
}

export function useClaimAnonymousMarks() {
  const [claimableMarks, setClaimableMarks] = useState<ClaimableMarks | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  /**
   * Check for anonymous marks that can be claimed
   */
  const checkForClaimableMarks = useCallback(async (userId: string) => {
    const deviceUserId = getDeviceId();
    if (!deviceUserId) return null;

    setIsChecking(true);

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, created_at, image_url')
        .eq('device_user_id', deviceUserId)
        .is('user_id', null) // Only unclaimed marks
        .eq('is_trashed', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[useClaimAnonymousMarks] Check failed:', error);
        return null;
      }

      if (!data || data.length === 0) {
        setClaimableMarks(null);
        return null;
      }

      const result: ClaimableMarks = {
        count: data.length,
        previews: data.slice(0, 6).map(row => ({
          id: row.id,
          imageUrl: row.image_url,
          createdAt: new Date(row.created_at),
        })),
      };

      setClaimableMarks(result);
      return result;
    } catch (e) {
      console.error('[useClaimAnonymousMarks] Check error:', e);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Claim all anonymous marks for the given user
   */
  const claimMarks = useCallback(async (userId: string): Promise<number> => {
    const deviceUserId = getDeviceId();
    if (!deviceUserId || isClaiming) return 0;

    setIsClaiming(true);

    try {
      // Count first
      const { count } = await supabase
        .from('pages')
        .select('*', { count: 'exact', head: true })
        .eq('device_user_id', deviceUserId)
        .is('user_id', null)
        .eq('is_trashed', false);

      // Update all unclaimed marks
      const { error } = await supabase
        .from('pages')
        .update({ user_id: userId } as any)
        .eq('device_user_id', deviceUserId)
        .is('user_id', null);

      if (error) {
        console.error('[useClaimAnonymousMarks] Claim failed:', error);
        return 0;
      }

      setHasClaimed(true);
      setClaimableMarks(null);
      
      console.log(`[useClaimAnonymousMarks] Claimed ${count || 0} marks for user ${userId.substring(0, 8)}...`);
      return count || 0;
    } catch (e) {
      console.error('[useClaimAnonymousMarks] Claim error:', e);
      return 0;
    } finally {
      setIsClaiming(false);
    }
  }, [isClaiming]);

  /**
   * Dismiss the claim prompt without claiming
   */
  const dismiss = useCallback(() => {
    setClaimableMarks(null);
  }, []);

  return {
    claimableMarks,
    isChecking,
    isClaiming,
    hasClaimed,
    checkForClaimableMarks,
    claimMarks,
    dismiss,
  };
}
