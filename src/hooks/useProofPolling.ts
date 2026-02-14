/**
 * useProofPolling — Background OTS proof status checker
 * 
 * When the Wall opens, checks all pending origins against core_ots_proofs.
 * 
 * Strategy (V1.2 — anon-compatible):
 * - Uses hash from IndexedDB → origin_attestations (public) → origin_id
 * - Then checks core_ots_proofs (public for anchored) for status
 * - No dependency on pages table (blocked for anon role)
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMark, updateMark } from '@/lib/indexedDB';
import type { DisplayMark } from '@/hooks/useMarks';

interface ProofPollResult {
  markId: string;
  originUuid: string;
  newStatus: 'pending' | 'anchored';
  bitcoinBlockHeight: number | null;
}

export function useProofPolling() {
  /**
   * Resolve origin UUIDs by looking up hashes in origin_attestations (public table).
   * Returns a map of markId → originUuid.
   */
  const resolveOriginsByHash = useCallback(async (
    marks: DisplayMark[]
  ): Promise<Map<string, string>> => {
    if (marks.length === 0) return new Map();

    // Deduplicate hashes
    const uniqueHashes = [...new Set(marks.map(m => m.hash).filter(Boolean))];
    if (uniqueHashes.length === 0) return new Map();

    try {
      const { data, error } = await supabase
        .from('origin_attestations')
        .select('origin_id, hash')
        .in('hash', uniqueHashes);

      if (error || !data) {
        console.warn('[useProofPolling] Failed to resolve origins by hash:', error);
        return new Map();
      }

      // Build hash → origin_id lookup (first-in-time, but any match works for status check)
      const hashToOrigin = new Map<string, string>();
      for (const row of data) {
        if (!hashToOrigin.has(row.hash)) {
          hashToOrigin.set(row.hash, row.origin_id);
        }
      }

      // Map markId → originUuid via hash
      const result = new Map<string, string>();
      for (const mark of marks) {
        const originId = hashToOrigin.get(mark.hash);
        if (originId) {
          result.set(mark.id, originId);
        }
      }

      console.log(`[useProofPolling] Resolved ${result.size} origin UUIDs from ${uniqueHashes.length} unique hashes`);
      return result;
    } catch (e) {
      console.warn('[useProofPolling] Unexpected error resolving origins:', e);
      return new Map();
    }
  }, []);

  /**
   * Poll proof status for all pending marks.
   */
  const pollPendingProofs = useCallback(async (
    pendingMarks: DisplayMark[]
  ): Promise<ProofPollResult[]> => {
    if (pendingMarks.length === 0) return [];

    console.log(`[useProofPolling] Checking ${pendingMarks.length} pending marks...`);

    const uuidMap = await resolveOriginsByHash(pendingMarks);

    if (uuidMap.size === 0) {
      console.log('[useProofPolling] No origin UUIDs resolved for pending marks');
      return [];
    }

    // Query core_ots_proofs directly (public SELECT for anchored status)
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
      console.log('[useProofPolling] No anchored proofs found yet');
      return [];
    }

    // Build anchored lookup
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

          console.log(`[useProofPolling] ✓ Updated to anchored: ${markId.substring(0, 8)}… (block ${blockHeight})`);
        }
      } catch (e) {
        console.warn(`[useProofPolling] Update failed for ${markId.substring(0, 8)}…:`, e);
      }
    });

    await Promise.all(updates);
    console.log(`[useProofPolling] ${results.length}/${uuidMap.size} proofs newly anchored`);
    return results;
  }, [resolveOriginsByHash]);

  /**
   * Get the origin UUID for a specific mark by hash lookup.
   */
  const getOriginUuid = useCallback(async (markId: string): Promise<string | null> => {
    const localMark = await getMark(markId);
    if (!localMark?.hash) return null;

    const { data, error } = await supabase
      .from('origin_attestations')
      .select('origin_id')
      .eq('hash', localMark.hash)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.origin_id;
  }, []);

  return {
    pollPendingProofs,
    getOriginUuid,
  };
}
