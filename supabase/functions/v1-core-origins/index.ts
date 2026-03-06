/**
 * UMARISE CORE v1: Create Origin Attestation
 * 
 * Pure hash-only endpoint. No bytes, no storage, no semantics.
 * 
 * Endpoint: POST /v1/core/origins
 * 
 * Authentication: Requires X-API-Key header with partner API key
 * 
 * Request:
 *   { "hash": "sha256:<hex>" }
 * 
 * Response (201 Created):
 *   { "origin_id": "...", "hash": "...", "hash_algo": "sha256", "captured_at": "..." }
 * 
 * Constraints:
 *   - Write-once: cannot mutate existing records
 *   - No bytes accepted
 *   - No labels accepted
 *   - No idempotency on content (same hash = new attestation)
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
  normalizeHash,
  createServiceClient,
  getIpHash,
} from '../_shared/coreHelpers.ts';

// Rate limits per tier (requests per minute)
const RATE_LIMITS: Record<string, number> = {
  standard: 100,
  premium: 1000,
  unlimited: 100000, // effectively unlimited
};

interface CoreOriginRequest {
  hash: string;
  dry_run?: boolean;
  device_signed?: boolean;
}

interface CoreOriginResponse {
  origin_id: string;
  hash: string;
  hash_algo: 'sha256';
  captured_at: string;
  proof_status: 'pending' | 'dry_run';
  proof_url: string;
  dry_run?: boolean;
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

interface PartnerKeyRecord {
  id: string;
  key_hash: string;
  partner_name: string;
  revoked_at: string | null;
  rate_limit_tier: string | null;
  credit_balance: number | null;
}

// Check if API key is a test key (um_test_ prefix)
function isTestKey(apiKey: string): boolean {
  return apiKey.startsWith('um_test_');
}

// Validate partner API key (supports both production and test keys)
async function validatePartnerApiKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  apiKey: string,
  coreApiSecret: string
): Promise<{ valid: boolean; partnerName?: string; keyPrefix?: string; rateLimitTier?: string; isTest?: boolean; creditBalance?: number | null; error?: string }> {
  // Test key: um_test_ + any 64 hex chars — always valid, always sandbox
  if (isTestKey(apiKey)) {
    if (apiKey.length < 32) {
      return { valid: false, error: 'Invalid test key format' };
    }
    return {
      valid: true,
      partnerName: 'sandbox',
      keyPrefix: apiKey.substring(0, 11),
      rateLimitTier: 'standard',
      isTest: true,
      creditBalance: null, // sandbox = unlimited
    };
  }

  if (!apiKey || apiKey.length < 32) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // Key format: um_<64 hex chars>, prefix is um_ + first 8 hex chars = 11 chars
  const keyPrefix = apiKey.substring(0, 11);
  const keyHash = await computeKeyHash(apiKey, coreApiSecret);

  const { data: keyRecords, error: lookupError } = await supabase
    .from('partner_api_keys')
    .select('id, key_hash, partner_name, revoked_at, rate_limit_tier, credit_balance')
    .eq('key_prefix', keyPrefix);

  if (lookupError) {
    console.error('[v1-core-origins] Key lookup error:', lookupError);
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
    isTest: false,
    creditBalance: matchingKey.credit_balance,
  };
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
  let apiKeyPrefix: string | undefined;
  let ipHash: string | null = null;

  try {
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    if (!coreApiSecret) {
      console.error('[v1-core-origins] CORE_API_SECRET not configured');
      return errorResponse('INTERNAL_ERROR', 'Server configuration error', 500);
    }

    supabase = createServiceClient();

    // Validate partner API key
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
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
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: status,
        response_time_ms: Date.now() - startTime,
        error_code: errorCode,
      });

      return errorResponse(errorCode, authResult.error || 'Unauthorized', status);
    }

    console.log('[v1-core-origins] Authenticated partner:', authResult.partnerName);

    // Check rate limit based on partner's tier
    const rateLimitTier = authResult.rateLimitTier || 'standard';
    const rateLimit = RATE_LIMITS[rateLimitTier] || RATE_LIMITS.standard;
    
    const rateLimitResult = await checkRateLimit(
      supabase, 
      apiKeyPrefix!, 
      '/v1/core/origins', 
      rateLimit
    );
    
    if (!rateLimitResult.allowed) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 429,
        response_time_ms: Date.now() - startTime,
        error_code: 'RATE_LIMIT_EXCEEDED',
      });
      
      return rateLimitResponse(rateLimitResult.resetInSeconds, rateLimitResult.limit);
    }

    // Parse request body
    let body: CoreOriginRequest;
    try {
      body = await req.json();
    } catch {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });
      return errorResponse('INVALID_REQUEST_BODY', 'Invalid JSON body', 400);
    }

    // Validate: hash is required
    if (!body.hash) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_REQUEST_BODY',
      });
      return errorResponse('INVALID_REQUEST_BODY', 'Missing required field: hash', 400);
    }

    // Reject any bytes/content field
    if ('content' in body || 'bytes' in body || 'data' in body || 'file' in body) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'REJECTED_FIELD',
      });
      return errorResponse('REJECTED_FIELD', 'Core does not accept bytes. Provide hash only.', 400);
    }

    // Reject any semantic labels
    if ('source_system' in body || 'metadata' in body || 'labels' in body || 'type' in body) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'REJECTED_FIELD',
      });
      return errorResponse('REJECTED_FIELD', 'Core does not accept labels. Provide hash only.', 400);
    }

    // Normalize and validate hash
    const normalized = normalizeHash(body.hash);
    if (!normalized) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 400,
        response_time_ms: Date.now() - startTime,
        error_code: 'INVALID_HASH_FORMAT',
      });
      return errorResponse(
        'INVALID_HASH_FORMAT',
        'Hash must be in format sha256:<64-hex-chars> or raw 64-char hex',
        400
      );
    }

    // === DRY RUN MODE ===
    // dry_run: true in body OR test key → simulate without writing to DB
    const isDryRun = body.dry_run === true || authResult.isTest === true;

    if (isDryRun) {
      const simulatedOriginId = crypto.randomUUID();
      const simulatedCapturedAt = new Date().toISOString();

      const dryRunResponse: CoreOriginResponse = {
        origin_id: simulatedOriginId,
        hash: normalized.hash,
        hash_algo: 'sha256',
        captured_at: simulatedCapturedAt,
        proof_status: 'dry_run',
        proof_url: `/v1-core-origins-proof?origin_id=${simulatedOriginId}`,
        dry_run: true,
      };

      console.log('[v1-core-origins] DRY RUN:', {
        hash: normalized.hash.substring(0, 20) + '...',
        partner: authResult.partnerName,
        test_key: authResult.isTest,
      });

      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 200,
        response_time_ms: Date.now() - startTime,
      });

      const dryRunResp = successResponse(dryRunResponse, 200, {
        'X-Dry-Run': 'true',
      });

      return new Response(dryRunResp.body, {
        status: 200,
        headers: addRateLimitHeaders(Object.fromEntries(dryRunResp.headers.entries()), rateLimitResult),
      });
    }

    // === CREDIT CHECK ===
    // creditBalance === null means unlimited (founding/legacy partners)
    // creditBalance === 0 means depleted
    const creditBalance = authResult.creditBalance;
    
    if (creditBalance !== null && creditBalance !== undefined && creditBalance <= 0) {
      console.log('[v1-core-origins] Insufficient credits:', {
        partner: authResult.partnerName,
        balance: creditBalance,
      });
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 402,
        response_time_ms: Date.now() - startTime,
        error_code: 'INSUFFICIENT_CREDITS',
      });
      return errorResponse(
        'INSUFFICIENT_CREDITS',
        'No credits remaining. Purchase a new bundle at your Stripe Payment Link or contact partners@umarise.com',
        402
      );
    }

    // === PRODUCTION MODE ===
    // Create the attestation (includes api_key_prefix for duplicate detection)
    const capturedAt = new Date().toISOString();
    
    // Generate short_token: 8-char uppercase alphanumeric
    const shortTokenChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for readability
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const shortToken = Array.from(randomBytes)
      .map(b => shortTokenChars[b % shortTokenChars.length])
      .join('');
    
    const { data, error: insertError } = await supabase
      .from('origin_attestations')
      .insert({
        hash: normalized.hash,
        hash_algo: normalized.algo,
        captured_at: capturedAt,
        api_key_prefix: apiKeyPrefix,
        short_token: shortToken,
        device_signed: body.device_signed === true,
      })
      .select('origin_id, hash, hash_algo, captured_at, short_token, device_signed')
      .single();

    if (insertError) {
      // Unique constraint violation = duplicate hash for this API key.
      // Return existing origin_id idempotently instead of forcing client-side hash resolve
      // (which may return an older origin from another key/partner).
      if (insertError.code === '23505') {
        const rawHex = normalized.hash.startsWith('sha256:') ? normalized.hash.slice(7) : normalized.hash;

        const { data: existing, error: existingError } = await supabase
          .from('origin_attestations')
          .select('origin_id, hash, hash_algo, captured_at')
          .eq('api_key_prefix', apiKeyPrefix)
          .in('hash', [normalized.hash, rawHex])
          .order('captured_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (existing && !existingError) {
          console.log('[v1-core-origins] Duplicate hash resolved idempotently:', {
            hash: normalized.hash.substring(0, 20) + '...',
            partner: authResult.partnerName,
            origin_id: existing.origin_id,
          });

          logRequest(supabase, {
            endpoint: '/v1/core/origins',
            method: 'POST',
            api_key_prefix: apiKeyPrefix,
            status_code: 200,
            response_time_ms: Date.now() - startTime,
          });

          const duplicateResponse: CoreOriginResponse = {
            origin_id: existing.origin_id,
            hash: existing.hash,
            hash_algo: existing.hash_algo as 'sha256',
            captured_at: existing.captured_at,
            proof_status: 'pending',
            proof_url: `/v1-core-origins-proof?origin_id=${existing.origin_id}`,
          };

          const duplicateSuccess = successResponse(duplicateResponse, 200, {
            'Location': `/v1/core/resolve?origin_id=${existing.origin_id}`,
            'Retry-After': '900',
          });

          return new Response(duplicateSuccess.body, {
            status: 200,
            headers: addRateLimitHeaders(Object.fromEntries(duplicateSuccess.headers.entries()), rateLimitResult),
          });
        }

        console.log('[v1-core-origins] Duplicate hash rejected:', {
          hash: normalized.hash.substring(0, 20) + '...',
          partner: authResult.partnerName,
        });
        logRequest(supabase, {
          endpoint: '/v1/core/origins',
          method: 'POST',
          api_key_prefix: apiKeyPrefix,
          status_code: 409,
          response_time_ms: Date.now() - startTime,
          error_code: 'DUPLICATE_HASH',
        });
        return errorResponse('DUPLICATE_HASH', 'This hash has already been attested with this API key', 409);
      }

      console.error('[v1-core-origins] Insert error:', insertError);
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
      return errorResponse('INTERNAL_ERROR', 'Failed to create attestation', 500);
    }

    const response: CoreOriginResponse = {
      origin_id: data.origin_id,
      hash: data.hash,
      hash_algo: data.hash_algo as 'sha256',
      captured_at: data.captured_at,
      proof_status: 'pending',
      proof_url: `/v1-core-origins-proof?origin_id=${data.origin_id}`,
    };

    console.log('[v1-core-origins] Created attestation:', {
      origin_id: data.origin_id,
      hash: data.hash.substring(0, 20) + '...',
      partner: authResult.partnerName,
    });

    logRequest(supabase, {
      endpoint: '/v1/core/origins',
      method: 'POST',
      api_key_prefix: apiKeyPrefix,
      status_code: 201,
      response_time_ms: Date.now() - startTime,
    });

    // TTFA: Log first_attestation_at if not yet set for this partner key
    // Also decrement credit_balance if credits are tracked
    let newCreditBalance: number | null = creditBalance;
    try {
      const { data: keyRecord } = await supabase
        .from('partner_api_keys')
        .select('first_attestation_at, credit_balance')
        .eq('key_prefix', apiKeyPrefix)
        .single();
      
      if (keyRecord) {
        const updates: Record<string, unknown> = {};
        
        if (!keyRecord.first_attestation_at) {
          updates.first_attestation_at = capturedAt;
        }
        
        // Decrement credit_balance if it's not null (null = unlimited)
        if (keyRecord.credit_balance !== null && keyRecord.credit_balance !== undefined) {
          updates.credit_balance = keyRecord.credit_balance - 1;
          newCreditBalance = keyRecord.credit_balance - 1;
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('partner_api_keys')
            .update(updates)
            .eq('key_prefix', apiKeyPrefix);
          
          if (updates.first_attestation_at) {
            console.log('[v1-core-origins] TTFA logged for partner:', authResult.partnerName);
          }
        }
      }
    } catch (ttfaErr) {
      // Non-critical: don't fail the request if TTFA/credit logging fails
      console.warn('[v1-core-origins] TTFA/credit update failed:', ttfaErr);
    }

    // Build credit headers
    const creditHeaders: Record<string, string> = {
      'Location': `/v1/core/resolve?origin_id=${data.origin_id}`,
      'Retry-After': '900',
    };
    
    if (newCreditBalance !== null && newCreditBalance !== undefined) {
      creditHeaders['X-Credits-Remaining'] = String(newCreditBalance);
      if (newCreditBalance < 50) {
        creditHeaders['X-Credits-Low'] = 'true';
      }
    }

    const successResp = successResponse(response, 201, creditHeaders);
    
    return new Response(successResp.body, {
      status: 201,
      headers: addRateLimitHeaders(Object.fromEntries(successResp.headers.entries()), rateLimitResult),
    });

  } catch (error) {
    console.error('[v1-core-origins] Unexpected error:', error);
    
    if (supabase) {
      logRequest(supabase, {
        endpoint: '/v1/core/origins',
        method: 'POST',
        api_key_prefix: apiKeyPrefix,
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_code: 'INTERNAL_ERROR',
      });
    }

    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
});
