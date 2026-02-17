/**
 * UMARISE CORE v1: Resolve Origin Attestation
 * 
 * Retrieve immutable facts. No artifact URLs, no semantics, no labels.
 * 
 * Endpoint: GET /v1/core/resolve?origin_id=... OR ?hash=...
 * 
 * Authentication: Public (rate-limited by IP)
 * 
 * Response (200 OK):
 *   { "origin_id": "...", "hash": "sha256:...", "hash_algo": "sha256", "captured_at": "...",
 *     "proof_status": "pending|anchored|none", "proof_url": "...|null",
 *     "bitcoin_block_height": ...|null, "anchored_at": "...|null" }
 * 
 * Response (404 Not Found):
 *   { "error": { "code": "NOT_FOUND", "message": "No origin found for given identifier" } }
 * 
 * Breaking change from legacy: No more { found: true/false } wrapper.
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

interface CoreOrigin {
  origin_id: string;
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

  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse('INVALID_REQUEST_BODY', 'Method not allowed. Use GET.', 405);
  }

  let supabase;
  let ipHash: string | undefined;

  try {
    supabase = createServiceClient();
    
    // Get client IP and hash it for rate limiting
    const clientIp = getClientIp(req);
    ipHash = await hashIp(clientIp);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, ipHash, '/v1/core/resolve', RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
      // Log rate-limited request
      logRequest(supabase, {
        endpoint: '/v1/core/resolve',
        method: 'GET',
        status_code: 429,
        response_time_ms: Date.now() - startTime,
        error_code: 'RATE_LIMIT_EXCEEDED',
        ip_hash: ipHash,
      });
      
      return rateLimitResponse(rateLimitResult.resetInSeconds, rateLimitResult.limit);
    }

    const url = new URL(req.url);
    const originId = url.searchParams.get('origin_id');
    const hashParam = url.searchParams.get('hash');

    // Require at least one parameter
    if (!originId && !hashParam) {
      logRequest(supabase, {
        endpoint: '/v1/core/resolve',
        method: 'GET',
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
        ip_hash: ipHash,
      });

      const response = errorResponse(
        'INVALID_REQUEST_BODY',
        'Missing parameter. Provide origin_id or hash.',
        400
      );
      return new Response(response.body, {
        status: 400,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Validate hash format if provided
    if (hashParam) {
      const normalized = normalizeHash(hashParam);
      if (!normalized) {
        logRequest(supabase, {
          endpoint: '/v1/core/resolve',
          method: 'GET',
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
    }

    // Query the origin_attestations table
    // Use anon key for public read (RLS allows SELECT)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    let query = anonClient
      .from('origin_attestations')
      .select('origin_id, hash, hash_algo, captured_at');

    if (originId) {
      query = query.eq('origin_id', originId);
    } else if (hashParam) {
      const normalized = normalizeHash(hashParam)!;
      query = query.eq('hash', normalized.hash);
    }

    // For hash lookups, there may be multiple attestations - return the first (oldest)
    const { data, error } = await query.order('captured_at', { ascending: true }).limit(1).maybeSingle();

    if (error) {
      console.error('[v1-core-resolve] Query error:', error);
      logRequest(supabase, {
        endpoint: '/v1/core/resolve',
        method: 'GET',
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
        ip_hash: ipHash,
      });
      return errorResponse('INTERNAL_ERROR', 'Database query failed', 500);
    }

    // Not found - return 404 (breaking change from legacy)
    if (!data) {
      logRequest(supabase, {
        endpoint: '/v1/core/resolve',
        method: 'GET',
        status_code: 404,
        response_time_ms: Date.now() - startTime,
        error_code: 'NOT_FOUND',
        ip_hash: ipHash,
      });

      const response = errorResponse('NOT_FOUND', 'No origin found for given identifier', 404);
      return new Response(response.body, {
        status: 404,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Look up proof status from core_ots_proofs
    const { data: proofData } = await supabase
      .from('core_ots_proofs')
      .select('status, bitcoin_block_height, anchored_at')
      .eq('origin_id', data.origin_id)
      .maybeSingle();

    const proofStatus: 'pending' | 'anchored' = proofData?.status === 'anchored' ? 'anchored' : 'pending';

    const proofBaseUrl = 'https://core.umarise.com';

    // Found - return Core response with proof status (consistent with verify)
    const origin: CoreOrigin = {
      origin_id: data.origin_id,
      hash: data.hash,
      hash_algo: data.hash_algo as 'sha256',
      captured_at: data.captured_at,
      proof_status: proofStatus,
      proof_url: `${proofBaseUrl}/functions/v1/v1-core-proof?origin_id=${data.origin_id}`,
      bitcoin_block_height: proofData?.bitcoin_block_height ?? null,
      anchored_at: proofData?.anchored_at ?? null,
    };

    console.log('[v1-core-resolve] Resolved:', {
      method: originId ? 'by_id' : 'by_hash',
      origin_id: data.origin_id,
    });

    logRequest(supabase, {
      endpoint: '/v1/core/resolve',
      method: 'GET',
      status_code: 200,
      response_time_ms: Date.now() - startTime,
      ip_hash: ipHash,
    });

    const response = successResponse(origin, 200, { 'Cache-Control': 'public, max-age=3600' });
    return new Response(response.body, {
      status: 200,
      headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
    });

  } catch (error) {
    console.error('[v1-core-resolve] Unexpected error:', error);
    
    if (supabase) {
      logRequest(supabase, {
        endpoint: '/v1/core/resolve',
        method: 'GET',
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
        ip_hash: ipHash,
      });
    }

    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
});
