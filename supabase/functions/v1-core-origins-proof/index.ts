/**
 * UMARISE CORE v1: Retrieve OTS Proof for Origin
 * 
 * Returns the OpenTimestamps proof file for a specific attestation.
 * This enables partners to independently verify attestations against Bitcoin.
 * 
 * Endpoint: GET /v1-core-origins-proof?origin_id=<uuid>
 * 
 * Authentication: Requires X-API-Key header with partner API key
 * 
 * Responses:
 *   200: Returns proof data with base64-encoded .ots file
 *        {
 *          "origin_id": "...",
 *          "proof_status": "anchored",
 *          "bitcoin_block_height": 935037,
 *          "anchored_at": "...",
 *          "ots_proof": "<base64>"
 *        }
 *   
 *   202: Proof exists but is pending Bitcoin confirmation
 *        {
 *          "origin_id": "...",
 *          "proof_status": "pending",
 *          "message": "Bitcoin anchoring in progress. Try again later."
 *        }
 *   
 *   401: Missing or invalid API key
 *   404: Origin not found OR no proof available yet
 * 
 * Rate Limiting: Based on partner tier (standard: 100/min, premium: 1000/min)
 */

import {
  corsHeaders,
  errorResponse,
  successResponse,
  rateLimitResponse,
  checkRateLimit,
  addRateLimitHeaders,
  logRequest,
  createServiceClient,
} from '../_shared/coreHelpers.ts';

// Rate limits per tier (requests per minute)
const RATE_LIMITS: Record<string, number> = {
  standard: 100,
  premium: 1000,
  unlimited: 100000,
};

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PartnerKeyRecord {
  id: string;
  key_hash: string;
  partner_name: string;
  revoked_at: string | null;
  rate_limit_tier: string | null;
}

// Compute HMAC-SHA256 of the API key using CORE_API_SECRET
async function computeKeyHash(apiKey: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(apiKey);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate partner API key
async function validatePartnerApiKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  apiKey: string,
  coreApiSecret: string
): Promise<{ valid: boolean; partnerName?: string; keyPrefix?: string; rateLimitTier?: string; error?: string }> {
  if (!apiKey || apiKey.length < 32) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // Key format: um_<64 hex chars>, prefix is um_ + first 8 hex chars = 11 chars
  const keyPrefix = apiKey.substring(0, 11);
  const keyHash = await computeKeyHash(apiKey, coreApiSecret);

  const { data: keyRecords, error: lookupError } = await supabase
    .from('partner_api_keys')
    .select('id, key_hash, partner_name, revoked_at, rate_limit_tier')
    .eq('key_prefix', keyPrefix);

  if (lookupError) {
    console.error('[v1-core-origins-proof] Key lookup error:', lookupError);
    return { valid: false, error: 'Authentication service unavailable' };
  }

  if (!keyRecords || keyRecords.length === 0) {
    return { valid: false, error: 'Unknown API key' };
  }

  const matchingKey = (keyRecords as PartnerKeyRecord[]).find(
    (record) => record.key_hash === keyHash
  );
  
  if (!matchingKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (matchingKey.revoked_at) {
    return { valid: false, error: 'API key has been revoked' };
  }

  return { 
    valid: true, 
    partnerName: matchingKey.partner_name, 
    keyPrefix,
    rateLimitTier: matchingKey.rate_limit_tier || 'standard',
  };
}

// Convert bytea to base64
function byteaToBase64(bytea: Uint8Array | number[]): string {
  const bytes = bytea instanceof Uint8Array ? bytea : new Uint8Array(bytea);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const endpoint = '/v1/core/origins/proof';
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse('INVALID_REQUEST_BODY', 'Method not allowed. Use GET.', 405);
  }

  let supabase;
  let apiKeyPrefix: string | undefined;

  try {
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    if (!coreApiSecret) {
      console.error('[v1-core-origins-proof] CORE_API_SECRET not configured');
      return errorResponse('INTERNAL_ERROR', 'Server configuration error', 500);
    }

    supabase = createServiceClient();

    // Validate partner API key
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        status_code: 401,
        response_time_ms: Date.now() - startTime,
        error_code: 'UNAUTHORIZED',
      });
      return errorResponse('UNAUTHORIZED', 'Missing X-API-Key header', 401);
    }

    const authResult = await validatePartnerApiKey(supabase, apiKey, coreApiSecret);
    apiKeyPrefix = authResult.keyPrefix;
    
    if (!authResult.valid) {
      const errorCode = authResult.error === 'API key has been revoked' ? 'API_KEY_REVOKED' : 'UNAUTHORIZED';
      const status = errorCode === 'API_KEY_REVOKED' ? 403 : 401;

      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: status,
        response_time_ms: Date.now() - startTime,
        error_code: errorCode,
      });

      return errorResponse(errorCode, authResult.error || 'Unauthorized', status);
    }

    console.log('[v1-core-origins-proof] Authenticated partner:', authResult.partnerName);

    // Check rate limit based on partner's tier
    const rateLimitTier = authResult.rateLimitTier || 'standard';
    const rateLimit = RATE_LIMITS[rateLimitTier] || RATE_LIMITS.standard;
    
    const rateLimitResult = await checkRateLimit(
      supabase, 
      apiKeyPrefix!, 
      endpoint, 
      rateLimit
    );
    
    if (!rateLimitResult.allowed) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 429,
        response_time_ms: Date.now() - startTime,
        error_code: 'RATE_LIMIT_EXCEEDED',
      });
      
      return rateLimitResponse(rateLimitResult.resetInSeconds, rateLimitResult.limit);
    }

    // Parse origin_id from query params
    const url = new URL(req.url);
    const originId = url.searchParams.get('origin_id');

    if (!originId) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });

      return errorResponse('INVALID_REQUEST_BODY', 'Missing origin_id query parameter', 400);
    }

    // Validate UUID format
    if (!UUID_REGEX.test(originId)) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });

      return errorResponse('INVALID_REQUEST_BODY', 'origin_id must be a valid UUID', 400);
    }

    // First check if origin exists
    const { data: origin, error: originError } = await supabase
      .from('origin_attestations')
      .select('origin_id')
      .eq('origin_id', originId)
      .maybeSingle();

    if (originError) {
      console.error('[v1-core-origins-proof] Origin lookup error:', originError);
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
      return errorResponse('INTERNAL_ERROR', 'Database query failed', 500);
    }

    if (!origin) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 404,
        response_time_ms: Date.now() - startTime,
        error_code: 'NOT_FOUND',
      });

      const response = errorResponse('NOT_FOUND', 'Origin not found', 404);
      return new Response(response.body, {
        status: 404,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Look up proof in core_ots_proofs
    const { data: proof, error: proofError } = await supabase
      .from('core_ots_proofs')
      .select('origin_id, ots_proof, status, bitcoin_block_height, anchored_at')
      .eq('origin_id', originId)
      .maybeSingle();

    if (proofError) {
      console.error('[v1-core-origins-proof] Proof lookup error:', proofError);
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
      return errorResponse('INTERNAL_ERROR', 'Database query failed', 500);
    }

    // No proof row exists yet
    if (!proof) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 404,
        response_time_ms: Date.now() - startTime,
        error_code: 'NOT_FOUND',
      });

      const response = errorResponse('NOT_FOUND', 'Proof not available yet', 404);
      return new Response(response.body, {
        status: 404,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Pending status - return 202
    if (proof.status === 'pending') {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 202,
        response_time_ms: Date.now() - startTime,
      });

      const pendingResponse = {
        origin_id: originId,
        proof_status: 'pending',
        message: 'Bitcoin anchoring in progress. Try again later.',
      };

      const response = successResponse(pendingResponse, 202);
      return new Response(response.body, {
        status: 202,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Anchored - return full proof data
    if (proof.status === 'anchored') {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 200,
        response_time_ms: Date.now() - startTime,
      });

      // Convert bytea to base64
      const otsProofBase64 = byteaToBase64(proof.ots_proof);

      const anchoredResponse = {
        origin_id: originId,
        proof_status: 'anchored',
        bitcoin_block_height: proof.bitcoin_block_height,
        anchored_at: proof.anchored_at,
        ots_proof: otsProofBase64,
      };

      console.log('[v1-core-origins-proof] Returned proof:', {
        origin_id: originId,
        bitcoin_block: proof.bitcoin_block_height,
        partner: authResult.partnerName,
      });

      const response = successResponse(anchoredResponse);
      return new Response(response.body, {
        status: 200,
        headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
      });
    }

    // Failed or unknown status
    logRequest(supabase, {
      endpoint,
      method: 'GET',
      api_key_prefix: apiKeyPrefix,
      status_code: 404,
      response_time_ms: Date.now() - startTime,
      error_code: 'NOT_FOUND',
    });

    const response = errorResponse('NOT_FOUND', `Proof status: ${proof.status}`, 404);
    return new Response(response.body, {
      status: 404,
      headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
    });

  } catch (error) {
    console.error('[v1-core-origins-proof] Unexpected error:', error);
    
    if (supabase) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
    }

    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
});
