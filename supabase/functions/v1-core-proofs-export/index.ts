/**
 * UMARISE CORE v1: Bulk Export OTS Proofs
 * 
 * Returns all anchored OTS proofs for a partner as backup/insurance.
 * 
 * Endpoint: GET /v1-core-proofs-export
 * 
 * Authentication: Requires X-API-Key header with partner API key
 * 
 * Query Parameters:
 *   status: 'anchored' (default) or 'pending' - filter by proof status
 *   since: ISO 8601 timestamp - only proofs anchored after this date
 *   limit: number (default 100, max 1000) - results per page
 *   cursor: origin_id - for pagination (use next_cursor from previous response)
 * 
 * Response (200):
 *   {
 *     "export_date": "2026-02-05T14:00:00Z",
 *     "total_proofs": 142,
 *     "proofs": [...],
 *     "has_more": true,
 *     "next_cursor": "uuid-of-last-result"
 *   }
 * 
 * Rate Limiting: Based on partner tier (lower limits due to heavy queries)
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

// Rate limits per tier (lower for bulk exports)
const RATE_LIMITS: Record<string, number> = {
  standard: 10,   // 10 bulk exports per minute
  premium: 50,
  unlimited: 1000,
};

const MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 100;

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PartnerKeyRecord {
  id: string;
  key_hash: string;
  partner_name: string;
  revoked_at: string | null;
  rate_limit_tier: string | null;
}

// Compute HMAC-SHA256 of the API key
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

  const keyPrefix = apiKey.substring(0, 11);
  const keyHash = await computeKeyHash(apiKey, coreApiSecret);

  const { data: keyRecords, error: lookupError } = await supabase
    .from('partner_api_keys')
    .select('id, key_hash, partner_name, revoked_at, rate_limit_tier')
    .eq('key_prefix', keyPrefix);

  if (lookupError) {
    console.error('[v1-core-proofs-export] Key lookup error:', lookupError);
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

// Validate ISO 8601 date
function isValidISODate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

interface ProofExportItem {
  origin_id: string;
  hash: string;
  proof_status: 'pending' | 'anchored';
  bitcoin_block_height: number | null;
  anchored_at: string | null;
  ots_proof: string;
}

interface ExportResponse {
  export_date: string;
  total_proofs: number;
  proofs: ProofExportItem[];
  has_more: boolean;
  next_cursor: string | null;
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const endpoint = '/v1/core/proofs/export';
  
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
      console.error('[v1-core-proofs-export] CORE_API_SECRET not configured');
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

    console.log('[v1-core-proofs-export] Authenticated partner:', authResult.partnerName);

    // Check rate limit (lower limits for bulk exports)
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

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'anchored';
    const since = url.searchParams.get('since');
    const limitParam = url.searchParams.get('limit');
    const cursor = url.searchParams.get('cursor');

    // Validate status
    if (status !== 'anchored' && status !== 'pending') {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });
      return errorResponse('INVALID_REQUEST_BODY', 'status must be "anchored" or "pending"', 400);
    }

    // Validate since parameter
    if (since && !isValidISODate(since)) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });
      return errorResponse('INVALID_REQUEST_BODY', 'since must be a valid ISO 8601 timestamp', 400);
    }

    // Validate limit
    let limit = DEFAULT_LIMIT;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
        logRequest(supabase, {
          endpoint,
          method: 'GET',
          api_key_prefix: apiKeyPrefix,
          status_code: 400,
          response_time_ms: Date.now() - startTime,
          error_code: 'INVALID_REQUEST_BODY',
        });
        return errorResponse('INVALID_REQUEST_BODY', `limit must be between 1 and ${MAX_LIMIT}`, 400);
      }
      limit = parsedLimit;
    }

    // Validate cursor (must be valid UUID if provided)
    if (cursor && !UUID_REGEX.test(cursor)) {
      logRequest(supabase, {
        endpoint,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });
      return errorResponse('INVALID_REQUEST_BODY', 'cursor must be a valid UUID', 400);
    }

    // Build query for proofs with attestation data
    let query = supabase
      .from('core_ots_proofs')
      .select(`
        origin_id,
        ots_proof,
        status,
        bitcoin_block_height,
        anchored_at,
        origin_attestations!inner(hash)
      `)
      .eq('status', status)
      .order('anchored_at', { ascending: true, nullsFirst: false })
      .order('origin_id', { ascending: true })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Apply since filter
    if (since) {
      if (status === 'anchored') {
        query = query.gte('anchored_at', since);
      } else {
        query = query.gte('created_at', since);
      }
    }

    // Apply cursor for pagination
    if (cursor) {
      query = query.gt('origin_id', cursor);
    }

    const { data: proofs, error: queryError } = await query;

    if (queryError) {
      console.error('[v1-core-proofs-export] Query error:', queryError);
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

    // Check if there are more results
    const hasMore = proofs && proofs.length > limit;
    const resultProofs = hasMore ? proofs.slice(0, limit) : (proofs || []);

    // Transform proofs to export format
    const exportProofs: ProofExportItem[] = resultProofs.map((proof: any) => ({
      origin_id: proof.origin_id,
      hash: proof.origin_attestations?.hash || '',
      proof_status: proof.status as 'pending' | 'anchored',
      bitcoin_block_height: proof.bitcoin_block_height,
      anchored_at: proof.anchored_at,
      ots_proof: byteaToBase64(proof.ots_proof),
    }));

    // Get next cursor
    const nextCursor = hasMore && resultProofs.length > 0 
      ? resultProofs[resultProofs.length - 1].origin_id 
      : null;

    const exportResponse: ExportResponse = {
      export_date: new Date().toISOString(),
      total_proofs: exportProofs.length,
      proofs: exportProofs,
      has_more: hasMore,
      next_cursor: nextCursor,
    };

    console.log('[v1-core-proofs-export] Export completed:', {
      partner: authResult.partnerName,
      status,
      count: exportProofs.length,
      hasMore,
    });

    logRequest(supabase, {
      endpoint,
      method: 'GET',
      api_key_prefix: apiKeyPrefix,
      status_code: 200,
      response_time_ms: Date.now() - startTime,
    });

    const response = successResponse(exportResponse);
    return new Response(response.body, {
      status: 200,
      headers: addRateLimitHeaders(Object.fromEntries(response.headers.entries()), rateLimitResult),
    });

  } catch (error) {
    console.error('[v1-core-proofs-export] Unexpected error:', error);
    
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
