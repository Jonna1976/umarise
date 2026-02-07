/**
 * OTS Proof Fetcher
 * 
 * Retrieves OpenTimestamps proof data for anchored origins.
 * 
 * For B2C (companion app), proofs are fetched directly from the
 * core_ots_proofs table (RLS allows public SELECT for anchored proofs).
 * 
 * For B2B (partner API), proofs are fetched via the authenticated
 * /v1-core-origins-proof endpoint (not used here).
 */

import { supabase } from '@/integrations/supabase/client';

export interface OtsProofResult {
  /** Base64-encoded OTS proof binary */
  otsProof: string;
  /** Bitcoin block height where the proof was anchored */
  bitcoinBlockHeight: number | null;
  /** ISO timestamp of when the proof was anchored */
  anchoredAt: string | null;
}

/**
 * Fetch the OTS proof for an anchored origin.
 * 
 * Uses the public RLS policy on core_ots_proofs (allows SELECT where status = 'anchored').
 * Returns null if no proof is available or the origin is still pending.
 * 
 * @param originUuid - The UUID of the origin attestation (NOT the hex display ID)
 */
export async function fetchOtsProof(originUuid: string): Promise<OtsProofResult | null> {
  try {
    const { data, error } = await supabase
      .from('core_ots_proofs')
      .select('ots_proof, bitcoin_block_height, anchored_at, status')
      .eq('origin_id', originUuid)
      .eq('status', 'anchored')
      .maybeSingle();

    if (error) {
      console.warn('[fetchOtsProof] Query error:', error.message);
      return null;
    }

    if (!data || !data.ots_proof) {
      return null;
    }

    // ots_proof comes as a hex string from Supabase's bytea encoding
    // Convert to base64 for ZIP inclusion
    const otsProofBase64 = byteaHexToBase64(data.ots_proof as string);

    return {
      otsProof: otsProofBase64,
      bitcoinBlockHeight: data.bitcoin_block_height,
      anchoredAt: data.anchored_at,
    };
  } catch (e) {
    console.warn('[fetchOtsProof] Unexpected error:', e);
    return null;
  }
}

/**
 * Convert Supabase bytea hex representation (\\x...) to base64.
 * Supabase returns bytea as a hex-escaped string: "\\x0123abcd..."
 */
function byteaHexToBase64(hexString: string): string {
  // Strip the \\x prefix if present
  const hex = hexString.startsWith('\\x') 
    ? hexString.slice(2) 
    : hexString;

  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
