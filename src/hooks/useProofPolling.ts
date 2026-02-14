/**
 * useProofPolling — Background OTS proof status checker
 * 
 * When the Wall opens, checks all pending origins against core_ots_proofs table directly.
 * Updates IndexedDB and display state when proofs become anchored.
 * 
 * Strategy (V1.1, simplified):
 * - On mount: check all marks with otsStatus !== 'anchored'
 * - Fetch origin_id (UUID) from pages table for each
 * - Query core_ots_proofs directly for anchored status
 * - Update IndexedDB otsStatus accordingly
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMark, updateMark } from '@/lib/indexedDB';
import { getDeviceId } from '@/lib/deviceId';
import type { DisplayMark } from '@/hooks/useMarks';

interface ProofPollResult {
  markId: string;
  originUuid: string;
  newStatus: 'pending' | 'anchored';
  bitcoinBlockHeight: number | null;
}

/**
 * Hook that provides proof polling functionality for the Wall.
 */
export function useProofPolling() {
  /**
   * Fetch origin UUIDs for a set of mark IDs from the pages table.
   */
  const fetchOriginUuids = useCallback(async (
    markIds: string[]
  ): Promise<Map<string, string>> => {
    const deviceUserId = getDeviceId();
    if (!deviceUserId || markIds.length === 0) return new Map();

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, origin_id')
        .in('id', markIds)
        .eq('device_user_id', deviceUserId)
        .not('origin_id', 'is', null);

      if (error || !data) {
        console.warn('[useProofPolling] Failed to fetch origin UUIDs:', error);
        return new Map();
      }

      const map = new Map<string, string>();
      for (const row of data) {
        if (row.origin_id) {
          map.set(row.id, row.origin_id);
        }
      }
      console.info(`[useProofPolling] Found ${map.size} origin UUIDs for ${markIds.length} marks`);
      return map;
    } catch (e) {
      console.warn('[useProofPolling] Unexpected error:', e);
      return new Map();
    }
  }, []);

  /**
   * Poll proof status for all pending marks using direct DB query.
   * Returns an array of marks that were updated to 'anchored'.
   */
  const pollPendingProofs = useCallback(async (
    pendingMarks: DisplayMark[]
  ): Promise<ProofPollResult[]> => {
    if (pendingMarks.length === 0) return [];

    console.info(`[useProofPolling] Checking ${pendingMarks.length} pending marks...`);

    const markIds = pendingMarks.map(m => m.id);
    const uuidMap = await fetchOriginUuids(markIds);

    if (uuidMap.size === 0) {
      console.info('[useProofPolling] No origin UUIDs found for pending marks');
      return [];
    }

    // Query core_ots_proofs directly for all origin_ids at once
    const originIds = Array.from(uuidMap.values());
    const { data: proofs, error } = await supabase
      .from('core_ots_proofs')
      .select('origin_id, status, bitcoin_block_height, anchored_at')
      .in('origin_id', originIds)
      .eq('status', 'anchored');

    if (error) {
      console.warn('[useProofPolling] Failed to query core_ots_proofs:', error);
      return [];
    }

    if (!proofs || proofs.length === 0) {
      console.info('[useProofPolling] No anchored proofs found yet');
      return [];
    }

    // Build a set of anchored origin_ids for fast lookup
    const anchoredMap = new Map(
      proofs.map(p => [p.origin_id, p.bitcoin_block_height])
    );

    const results: ProofPollResult[] = [];

    // Update IndexedDB for each anchored mark
    const updates = Array.from(uuidMap.entries()).map(async ([markId, originUuid]) => {
      if (!anchoredMap.has(originUuid)) return;

      try {
        const localMark = await getMark(markId);
        if (localMark && localMark.otsStatus !== 'anchored') {
          localMark.otsStatus = 'anchored';
          await updateMark(localMark);

          const blockHeight = anchoredMap.get(originUuid) ?? null;
          results.push({
            markId,
            originUuid,
            newStatus: 'anchored',
            bitcoinBlockHeight: blockHeight,
          });

          console.info(`[useProofPolling] ✓ Updated to anchored: ${markId.substring(0, 8)}… (block ${blockHeight})`);
        }
      } catch (e) {
        console.warn(`[useProofPolling] Update failed for ${markId.substring(0, 8)}…:`, e);
      }
    });

    await Promise.all(updates);

    console.info(`[useProofPolling] ${results.length}/${uuidMap.size} proofs newly anchored`);
    return results;
  }, [fetchOriginUuids]);

  /**
   * Get the origin UUID for a specific mark from the pages table.
   */
  const getOriginUuid = useCallback(async (markId: string): Promise<string | null> => {
    const map = await fetchOriginUuids([markId]);
    return map.get(markId) ?? null;
  }, [fetchOriginUuids]);

  return {
    pollPendingProofs,
    getOriginUuid,
  };
}
