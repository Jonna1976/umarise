/**
 * UMARISE CORE v1: Verify Origin Attestation
 * 
 * Binary verification: does this hash have an attestation?
 * 
 * Endpoint: POST /v1/core/verify
 * 
 * Authentication: Public (rate-limited by IP)
 * 
 * Request:
 *   { "hash": "sha256:<hex>" }
 * 
 * Response (200 OK - found):
 *   { "origin_id": "...", "hash": "sha256:...", "hash_algo": "sha256", "captured_at": "..." }
 * 
 * Response (404 Not Found):
 *   { "error": { "code": "NOT_FOUND", "message": "No matching origin found for hash" } }
 * 
 * Breaking change from legacy: No more { match: true/false } wrapper.
 * Success returns the origin directly. Not found returns 404.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import {
  corsHeaders,
  errorResponse,
  successResponse,
  rateLimitResponse,
  checkRateLimit,
  addRateLimitHeaders,
  logRequest,
  hashIp,
  getClientIp,
  normalizeHash,
  createServiceClient,
} from '../_shared/coreHelpers.ts';

const RATE_LIMIT = 1000; // requests per minute per IP

interface CoreVerifyRequest {
  hash: string;
}

interface CoreOrigin {
  origin_id: string;
  short_token: string;
  hash: string;
  hash_algo: 'sha256';
  captured_at: string;
  proof_status: 'pending' | 'anchored';
  proof_url: string;
  bitcoin_block_height: number | null;
  anchored_at: string | null;
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('INVALID_REQUEST_BODY', 'Method not allowed. Use POST.', 405);
  }

  let supabase;
  let ipHash: string | undefined;

  try {
    supabase = createServiceClient();
    
    // Get client IP and hash it for rate limiting
    const clientIp = getClientIp(req);
    ipHash = await hashIp(clientIp);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, ipHash, '/v1/core/verify', RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 429,
        response_time_ms: Date.now() - startTime,
        error_code: 'RATE_LIMIT_EXCEEDED',
        ip_hash: ipHash,
      });
      
      return rateLimitResponse(rateLimitResult.resetInSeconds, rateLimitResult.limit);
    }

    // Parse request body
    let body: CoreVerifyRequest;
    try {
      body = await req.json();
    } catch {
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
        ip_hash: ipHash,
      });
      return errorResponse('INVALID_REQUEST_BODY', 'Invalid JSON body', 400);
    }

    // Validate: hash is required
    if (!body.hash) {
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
        ip_hash: ipHash,
      });
      return errorResponse('INVALID_REQUEST_BODY', 'Missing required field: hash', 400);
    }

    // Reject any bytes/content field (Core verifies by hash only)
    if ('content' in body || 'bytes' in body || 'data' in body || 'origin_id' in body) {
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'REJECTED_FIELD',
        ip_hash: ipHash,
      });
      return errorResponse('REJECTED_FIELD', 'Core verifies by hash only. Do not provide bytes or origin_id.', 400);
    }

    // Normalize and validate hash
    const normalized = normalizeHash(body.hash);
    if (!normalized) {
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_HASH_FORMAT',
        ip_hash: ipHash,
      });
      return errorResponse(
        'INVALID_HASH_FORMAT',
        'Hash must be in format sha256:<64-hex-chars> or raw 64-char hex',
        400
      );
    }

    // Query the origin_attestations table
    // Use anon key for public read (RLS allows SELECT)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // Return the first (oldest) attestation for this hash
    // Search both with and without sha256: prefix for compatibility
    const rawHex = normalized.hash.startsWith('sha256:') ? normalized.hash.slice(7) : normalized.hash;
    const prefixedHash = `sha256:${rawHex}`;

    const { data, error } = await anonClient
      .from('origin_attestations')
      .select('origin_id, hash, hash_algo, captured_at, short_token')
      .or(`hash.eq.${prefixedHash},hash.eq.${rawHex}`)
      .order('captured_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // Also check proof status if origin is found
    let proofStatus: 'pending' | 'anchored' = 'pending';

    if (error) {
      console.error('[v1-core-verify] Query error:', error);
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
        ip_hash: ipHash,
      });
      return errorResponse('INTERNAL_ERROR', 'Database query failed', 500);
    }

    // Not found - return 404 (breaking change from legacy)
    if (!data) {
      console.log('[v1-core-verify] No match:', {
        hash: normalized.hash.substring(0, 20) + '...',
      });

      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 404,
        response_time_ms: Date.now() - startTime,
        error_code: 'NOT_FOUND',
        ip_hash: ipHash,
      });

      const response = errorResponse('NOT_FOUND', 'No matching origin found for hash', 404);
      return new Response(response.body, {
        status: 404,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Check OTS proof status for this origin
    const { data: proofData } = await supabase
      .from('core_ots_proofs')
      .select('status, bitcoin_block_height, anchored_at')
      .eq('origin_id', data.origin_id)
      .maybeSingle();
    
    if (proofData?.status === 'anchored') {
      proofStatus = 'anchored';
    }

    // Attestation found - return origin directly (no wrapper)
    const origin: CoreOrigin = {
      origin_id: data.origin_id,
      short_token: data.short_token,
      hash: data.hash,
      hash_algo: data.hash_algo as 'sha256',
      captured_at: data.captured_at,
      proof_status: proofStatus,
      proof_url: `https://core.umarise.com/v1-core-proof?origin_id=${data.origin_id}`,
      bitcoin_block_height: proofData?.bitcoin_block_height ?? null,
      anchored_at: proofData?.anchored_at ?? null,
    };

    logRequest(supabase, {
      endpoint: '/v1/core/verify',
      method: 'POST',
      status_code: 200,
      response_time_ms: Date.now() - startTime,
      ip_hash: ipHash,
    });

    const response = successResponse(origin);
    return new Response(response.body, {
      status: 200,
      headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
    });

  } catch (error) {
    console.error('[v1-core-verify] Unexpected error:', error);
    
    if (supabase) {
      logRequest(supabase, {
        endpoint: '/v1/core/verify',
        method: 'POST',
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
        ip_hash: ipHash,
      });
    }

    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
});
