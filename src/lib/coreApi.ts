/**
 * Core API Client — B2C Companion
 * 
 * Public endpoints for the companion app (no API key required).
 * Uses the v1 Core API for proof status checking and binary proof retrieval.
 * 
 * Endpoints used:
 *   GET /v1-core-proof?origin_id=<uuid>
 *     → 200: binary .ots (application/octet-stream) — anchored
 *     → 202: JSON { status: 'pending' } — awaiting Bitcoin
 *     → 404: no proof submitted yet
 * 
 *   GET /v1-core-resolve?origin_id=<uuid>
 *     → 200: JSON { origin_id, hash, hash_algo, captured_at }
 *     → 404: origin not found
 */

const CORE_API_BASE = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

export type ProofStatus = 'not_found' | 'pending' | 'anchored' | 'error';

export interface ProofCheckResult {
  status: ProofStatus;
  /** Binary proof data (only when status === 'anchored') */
  otsProofBytes: ArrayBuffer | null;
  /** Bitcoin block height (from response header, when anchored) */
  bitcoinBlockHeight: number | null;
  /** Anchored timestamp (from response header, when anchored) */
  anchoredAt: string | null;
}

export interface OriginMetadata {
  origin_id: string;
  short_token?: string;
  hash: string;
  hash_algo: string;
  captured_at: string;
  proof_status?: 'pending' | 'anchored';
  proof_url?: string;
  bitcoin_block_height?: number | null;
  anchored_at?: string | null;
}

/**
 * Check proof status AND retrieve binary proof in one call.
 * 
 * The /v1-core-proof endpoint doubles as a status check:
 * - 200 = anchored (body is binary .ots)
 * - 202 = pending (proof submitted, awaiting Bitcoin)
 * - 404 = not found (no proof submitted yet)
 * 
 * @param originUuid - The UUID from origin_attestations table
 */
export async function fetchProofStatus(originUuid: string): Promise<ProofCheckResult> {
  try {
    const response = await fetch(
      `${CORE_API_BASE}/v1-core-proof?origin_id=${encodeURIComponent(originUuid)}`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/octet-stream, application/json' },
      }
    );

    if (response.status === 200) {
      // Anchored — response body is binary .ots
      const otsProofBytes = await response.arrayBuffer();
      const blockHeight = response.headers.get('X-Bitcoin-Block-Height');
      const anchoredAt = response.headers.get('X-Anchored-At');

      return {
        status: 'anchored',
        otsProofBytes,
        bitcoinBlockHeight: blockHeight ? parseInt(blockHeight, 10) : null,
        anchoredAt: anchoredAt || null,
      };
    }

    if (response.status === 202) {
      // Pending — proof submitted but not yet anchored
      await response.text(); // consume body
      return {
        status: 'pending',
        otsProofBytes: null,
        bitcoinBlockHeight: null,
        anchoredAt: null,
      };
    }

    if (response.status === 404) {
      // Not found — no proof exists yet
      await response.text(); // consume body
      return {
        status: 'not_found',
        otsProofBytes: null,
        bitcoinBlockHeight: null,
        anchoredAt: null,
      };
    }

    // Unexpected status
    await response.text(); // consume body
    console.warn(`[coreApi] Unexpected proof status: ${response.status}`);
    return {
      status: 'error',
      otsProofBytes: null,
      bitcoinBlockHeight: null,
      anchoredAt: null,
    };
  } catch (error) {
    console.error('[coreApi] fetchProofStatus error:', error);
    return {
      status: 'error',
      otsProofBytes: null,
      bitcoinBlockHeight: null,
      anchoredAt: null,
    };
  }
}

/**
 * Resolve origin metadata from Core API by origin_id.
 */
export async function fetchOriginMetadata(originUuid: string): Promise<OriginMetadata | null> {
  try {
    const response = await fetch(
      `${CORE_API_BASE}/v1-core-resolve?origin_id=${encodeURIComponent(originUuid)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      await response.text();
      return null;
    }

    return await response.json() as OriginMetadata;
  } catch (error) {
    console.error('[coreApi] fetchOriginMetadata error:', error);
    return null;
  }
}

/**
 * Resolve origin metadata from Core API by hash.
 */
export async function fetchOriginByHash(hash: string): Promise<OriginMetadata | null> {
  try {
    const response = await fetch(
      `${CORE_API_BASE}/v1-core-resolve?hash=${encodeURIComponent(hash)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      await response.text();
      return null;
    }

    return await response.json() as OriginMetadata;
  } catch (error) {
    console.error('[coreApi] fetchOriginByHash error:', error);
    return null;
  }
}

/**
 * Resolve origin metadata from Core API by short token.
 */
export async function fetchOriginByToken(token: string): Promise<OriginMetadata | null> {
  try {
    const response = await fetch(
      `${CORE_API_BASE}/v1-core-resolve?token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      await response.text();
      return null;
    }

    return await response.json() as OriginMetadata;
  } catch (error) {
    console.error('[coreApi] fetchOriginByToken error:', error);
    return null;
  }
}

/**
 * Verify a hash against the Umarise Core registry.
 * 
 * POST /v1-core-verify with { hash }
 * - 200: origin found → returns origin data with proof_status
 * - 404: no matching origin
 * 
 * Note: v1-core-verify accepts ONLY hash. origin_id is rejected.
 */
export interface CoreVerifyResult {
  found: boolean;
  origin?: {
    origin_id: string;
    hash: string;
    hash_algo: string;
    captured_at: string;
    proof_status: 'pending' | 'anchored';
    proof_url: string;
  };
}

export async function verifyOriginByHash(rawHash: string): Promise<CoreVerifyResult> {
  try {
    // Normalize: ensure sha256: prefix
    const hash = rawHash.startsWith('sha256:') ? rawHash : rawHash;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `${CORE_API_BASE}/v1-core-verify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (response.status === 200) {
      const data = await response.json();
      return { found: true, origin: data };
    }

    if (response.status === 404) {
      await response.text();
      return { found: false };
    }

    await response.text();
    console.warn(`[coreApi] Unexpected verify status: ${response.status}`);
    return { found: false };
  } catch (error) {
    console.error('[coreApi] verifyOriginByHash error:', error);
    return { found: false };
  }
}


export interface AttestationCheckoutResult {
  url: string;
}

/**
 * Start Layer 3 attestation checkout.
 */
export async function startAttestationCheckout(originId: string, deviceUserId: string): Promise<AttestationCheckoutResult | null> {
  try {
    const response = await fetch(`${CORE_API_BASE}/v1-attestation-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ origin_id: originId, device_user_id: deviceUserId }),
    });

    if (!response.ok) {
      await response.text();
      return null;
    }

    const data = await response.json() as { url?: string };
    if (!data.url) return null;
    return { url: data.url };
  } catch (error) {
    console.error('[coreApi] startAttestationCheckout error:', error);
    return null;
  }
}

export async function downloadProofFile(originId: string): Promise<boolean> {
  const result = await fetchProofStatus(originId);
  
  if (result.status !== 'anchored' || !result.otsProofBytes) {
    return false;
  }

  const blob = new Blob([result.otsProofBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proof-${originId.substring(0, 8)}.ots`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}

/**
 * Convert ArrayBuffer to base64 string (for storage or ZIP inclusion).
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
