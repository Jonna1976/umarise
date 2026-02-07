/**
 * useProofPolling — Background OTS proof status checker
 * 
 * When the Wall opens, checks all pending origins against the Core API.
 * Updates IndexedDB and display state when proofs become anchored.
 * 
 * Strategy (V1, per briefing):
 * - On mount: check all marks with otsStatus !== 'anchored'
 * - Fetch origin_id (UUID) from pages table for each
 * - Check /v1-core-proof for each → status + binary proof
 * - Store proof in IndexedDB, update otsStatus
 * - No push notifications; manual refresh via re-opening Wall
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchProofStatus, arrayBufferToBase64 } from '@/lib/coreApi';
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
   * Returns a map of markId → originUuid.
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
      return map;
    } catch (e) {
      console.warn('[useProofPolling] Unexpected error:', e);
      return new Map();
    }
  }, []);

  /**
   * Poll proof status for all pending marks.
   * Returns an array of marks that were updated to 'anchored'.
   */
  const pollPendingProofs = useCallback(async (
    pendingMarks: DisplayMark[]
  ): Promise<ProofPollResult[]> => {
    if (pendingMarks.length === 0) return [];

    const markIds = pendingMarks.map(m => m.id);
    const uuidMap = await fetchOriginUuids(markIds);

    if (uuidMap.size === 0) {
      console.info('[useProofPolling] No origin UUIDs found for pending marks');
      return [];
    }

    const results: ProofPollResult[] = [];

    // Check each pending mark in parallel
    const checks = Array.from(uuidMap.entries()).map(async ([markId, originUuid]) => {
      try {
        const result = await fetchProofStatus(originUuid);

        if (result.status === 'anchored' && result.otsProofBytes) {
          // Update IndexedDB with the proof
          const localMark = await getMark(markId);
          if (localMark) {
            localMark.otsStatus = 'anchored';
            localMark.otsProof = new Uint8Array(result.otsProofBytes);
            await updateMark(localMark);
          }

          results.push({
            markId,
            originUuid,
            newStatus: 'anchored',
            bitcoinBlockHeight: result.bitcoinBlockHeight,
          });

          console.info(`[useProofPolling] ✓ Proof anchored: ${markId.substring(0, 8)}… (block ${result.bitcoinBlockHeight})`);
        }
      } catch (e) {
        console.warn(`[useProofPolling] Check failed for ${markId.substring(0, 8)}…:`, e);
      }
    });

    await Promise.all(checks);

    if (results.length > 0) {
      console.info(`[useProofPolling] ${results.length}/${uuidMap.size} proofs newly anchored`);
    }

    return results;
  }, [fetchOriginUuids]);

  /**
   * Get the origin UUID for a specific mark from the pages table.
   * Used by the detail view to enable proof fetching.
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
