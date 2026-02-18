/**
 * UMARISE CORE v1: Export Attestation Records
 *
 * Returns all attestation records for the authenticated partner.
 * Scoped to the partner's api_key_prefix — each partner sees only their own records.
 *
 * Endpoint: GET /v1-core-origins-export
 *
 * Authentication: X-API-Key (partner API key)
 *
 * Query parameters:
 *   since:  ISO 8601 timestamp — only records captured after this time (optional)
 *   limit:  integer 1–1000 (optional, default 1000)
 *   offset: integer ≥0 (optional, default 0)
 *
 * Response (200 OK):
 * {
 *   "data": [
 *     {
 *       "origin_id": "uuid",
 *       "hash": "sha256:...",
 *       "captured_at": "2026-02-17T10:30:00.000Z",
 *       "created_at": "2026-02-17T10:30:00.000Z",
 *       "proof_status": "anchored",
 *       "proof_url": "https://core.umarise.com/v1-core-proof?origin_id=..."
 *     }
 *   ],
 *   "pagination": {
 *     "total": 3297,
 *     "limit": 1000,
 *     "offset": 0,
 *     "has_more": true
 *   },
 *   "export_date": "2026-02-18T09:00:00.000Z"
 * }
 *
 * Rate Limiting: 60 requests/minute (per partner key)
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

const ENDPOINT = '/v1/core/origins/export';
const RATE_LIMIT = 60; // per minute, per partner key
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 1000;

const PROOF_BASE_URL = 'https://core.umarise.com/v1-core-proof';

interface PartnerKeyRecord {
  key_hash: string;
  partner_name: string;
  revoked_at: string | null;
  rate_limit_tier: string | null;
}

// Compute HMAC-SHA256 of the API key using the shared CORE_API_SECRET
async function computeKeyHash(apiKey: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(apiKey));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AuthResult {
  valid: boolean;
  partnerName?: string;
  keyPrefix?: string;
  error?: string;
}

// Validate partner API key and return partner identity
async function validatePartnerApiKey(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  apiKey: string,
  coreApiSecret: string,
): Promise<AuthResult> {
  if (!apiKey || apiKey.length < 32) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const keyPrefix = apiKey.substring(0, 11);
  const keyHash = await computeKeyHash(apiKey, coreApiSecret);

  const { data: keyRecords, error: lookupError } = await supabase
    .from('partner_api_keys')
    .select('key_hash, partner_name, revoked_at, rate_limit_tier')
    .eq('key_prefix', keyPrefix);

  if (lookupError) {
    console.error('[v1-core-origins-export] Key lookup error:', lookupError);
    return { valid: false, error: 'Authentication service unavailable' };
  }

  if (!keyRecords || keyRecords.length === 0) {
    return { valid: false, error: 'Unknown API key' };
  }

  const match = (keyRecords as PartnerKeyRecord[]).find((r) => r.key_hash === keyHash);

  if (!match) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (match.revoked_at) {
    return { valid: false, error: 'API key has been revoked' };
  }

  return { valid: true, partnerName: match.partner_name, keyPrefix };
}

// Validate an ISO 8601 date string
function isValidISODate(s: string): boolean {
  return !isNaN(new Date(s).getTime());
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return errorResponse('INVALID_REQUEST_BODY', 'Method not allowed. Use GET.', 405);
  }

  let supabase;
  let apiKeyPrefix: string | undefined;

  try {
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    if (!coreApiSecret) {
      console.error('[v1-core-origins-export] CORE_API_SECRET not configured');
      return errorResponse('INTERNAL_ERROR', 'Server configuration error', 500);
    }

    supabase = createServiceClient();

    // ── Authentication ────────────────────────────────────────────────────────
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      logRequest(supabase, {
        endpoint: ENDPOINT,
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
      const isRevoked = authResult.error === 'API key has been revoked';
      const errorCode = isRevoked ? 'API_KEY_REVOKED' : 'UNAUTHORIZED';
      const status = isRevoked ? 403 : 401;

      logRequest(supabase, {
        endpoint: ENDPOINT,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: status,
        response_time_ms: Date.now() - startTime,
        error_code: errorCode,
      });

      return errorResponse(errorCode, authResult.error || 'Unauthorized', status);
    }

    console.log('[v1-core-origins-export] Authenticated partner:', authResult.partnerName);

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const rateLimitResult = await checkRateLimit(supabase, apiKeyPrefix!, ENDPOINT, RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      logRequest(supabase, {
        endpoint: ENDPOINT,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 429,
        response_time_ms: Date.now() - startTime,
        error_code: 'RATE_LIMIT_EXCEEDED',
      });
      return rateLimitResponse(rateLimitResult.resetInSeconds, rateLimitResult.limit);
    }

    // ── Parse & validate query parameters ────────────────────────────────────
    const url = new URL(req.url);

    const since = url.searchParams.get('since');
    if (since && !isValidISODate(since)) {
      return errorResponse(
        'INVALID_REQUEST_BODY',
        'since must be a valid ISO 8601 timestamp (e.g. 2026-02-01T00:00:00Z)',
        400,
      );
    }

    const limitParam = url.searchParams.get('limit');
    let limit = DEFAULT_LIMIT;
    if (limitParam !== null) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
        return errorResponse(
          'INVALID_REQUEST_BODY',
          `limit must be an integer between 1 and ${MAX_LIMIT}`,
          400,
        );
      }
      limit = parsed;
    }

    const offsetParam = url.searchParams.get('offset');
    let offset = 0;
    if (offsetParam !== null) {
      const parsed = parseInt(offsetParam, 10);
      if (isNaN(parsed) || parsed < 0) {
        return errorResponse('INVALID_REQUEST_BODY', 'offset must be a non-negative integer', 400);
      }
      offset = parsed;
    }

    // ── Query origin_attestations scoped to this partner ─────────────────────
    // We use api_key_prefix to scope results. Only records created via this
    // partner's key are returned — enforced at query level (not RLS, since
    // the service role is used for reads).

    // First: total count for pagination metadata
    let countQuery = supabase
      .from('origin_attestations')
      .select('origin_id', { count: 'exact', head: true })
      .eq('api_key_prefix', apiKeyPrefix!);

    if (since) {
      countQuery = countQuery.gte('captured_at', since);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('[v1-core-origins-export] Count error:', countError);
      logRequest(supabase, {
        endpoint: ENDPOINT,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
      return errorResponse('INTERNAL_ERROR', 'Database query failed', 500);
    }

    // Second: paginated data query
    let dataQuery = supabase
      .from('origin_attestations')
      .select('origin_id, hash, hash_algo, captured_at, created_at')
      .eq('api_key_prefix', apiKeyPrefix!)
      .order('captured_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (since) {
      dataQuery = dataQuery.gte('captured_at', since);
    }

    const { data: attestations, error: dataError } = await dataQuery;

    if (dataError) {
      console.error('[v1-core-origins-export] Data error:', dataError);
      logRequest(supabase, {
        endpoint: ENDPOINT,
        method: 'GET',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
      return errorResponse('INTERNAL_ERROR', 'Database query failed', 500);
    }

    // ── Enrich with proof status (batch lookup) ───────────────────────────────
    const originIds: string[] = (attestations || []).map((a: { origin_id: string }) => a.origin_id);

    let proofStatusMap: Record<string, string> = {};

    if (originIds.length > 0) {
      const { data: proofRows } = await supabase
        .from('core_ots_proofs')
        .select('origin_id, status')
        .in('origin_id', originIds);

      if (proofRows) {
        for (const row of proofRows) {
          proofStatusMap[row.origin_id] = row.status;
        }
      }
    }

    // ── Build response ────────────────────────────────────────────────────────
    const total = totalCount ?? 0;
    const hasMore = offset + limit < total;

    const data = (attestations || []).map((a: {
      origin_id: string;
      hash: string;
      captured_at: string;
      created_at: string;
    }) => ({
      origin_id: a.origin_id,
      hash: a.hash,
      captured_at: a.captured_at,
      created_at: a.created_at,
      proof_status: (proofStatusMap[a.origin_id] as 'pending' | 'anchored') || 'pending',
      proof_url: `${PROOF_BASE_URL}?origin_id=${a.origin_id}`,
    }));

    const responseBody = {
      data,
      pagination: {
        total,
        limit,
        offset,
        has_more: hasMore,
      },
      export_date: new Date().toISOString(),
    };

    console.log('[v1-core-origins-export] Export completed:', {
      partner: authResult.partnerName,
      total,
      returned: data.length,
      offset,
      hasMore,
    });

    logRequest(supabase, {
      endpoint: ENDPOINT,
      method: 'GET',
      api_key_prefix: apiKeyPrefix,
      status_code: 200,
      response_time_ms: Date.now() - startTime,
    });

    const response = successResponse(responseBody);
    return new Response(response.body, {
      status: 200,
      headers: addRateLimitHeaders(
        Object.fromEntries(response.headers.entries()),
        rateLimitResult,
      ),
    });
  } catch (error) {
    console.error('[v1-core-origins-export] Unexpected error:', error);

    if (supabase) {
      logRequest(supabase, {
        endpoint: ENDPOINT,
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
