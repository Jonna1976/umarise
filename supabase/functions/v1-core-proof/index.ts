/**
 * UMARISE CORE v1: Proof Retrieval
 * 
 * Retrieves OpenTimestamps proof files for anchored attestations.
 * 
 * Endpoint: GET /v1-core-proof?origin_id=<uuid>
 * 
 * Authentication: None required (public verification)
 * 
 * Responses:
 *   200: Returns .ots proof file as application/octet-stream
 *        Content-Disposition: attachment; filename="{origin_id}.ots"
 *   
 *   202: Proof exists but is pending Bitcoin confirmation
 *        {"status": "pending", "message": "Proof is awaiting Bitcoin confirmation"}
 *   
 *   400: Missing or invalid origin_id
 *   
 *   404: No proof found for origin_id
 * 
 * Rate Limiting: 1000 requests per minute per IP (public endpoint)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Expose-Headers': 'X-Bitcoin-Block-Height, X-Anchored-At, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-API-Version',
};

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return 'ip:' + encodeHex(new Uint8Array(hashBuffer));
}

// deno-lint-ignore no-explicit-any
async function checkRateLimit(
  supabase: any,
  rateKey: string,
  endpoint: string,
  limit: number
): Promise<{ allowed: boolean; count: number }> {
  const { data, error } = await supabase.rpc('core_check_rate_limit', {
    p_rate_key: rateKey,
    p_endpoint: endpoint,
    p_limit: limit,
  });

  if (error) {
    console.error('[v1-core-proof] Rate limit check error:', error);
    return { allowed: true, count: 0 };
  }

  const result = data as { allowed: boolean; count: number };
  return { allowed: result.allowed, count: result.count };
}

// deno-lint-ignore no-explicit-any
async function logRequest(
  supabase: any,
  params: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTimeMs: number;
    ipHash: string;
    errorCode?: string;
  }
) {
  try {
    await supabase.from('core_request_log').insert({
      endpoint: params.endpoint,
      method: params.method,
      status_code: params.statusCode,
      response_time_ms: params.responseTimeMs,
      ip_hash: params.ipHash,
      error_code: params.errorCode,
    });
  } catch (e) {
    console.error('[v1-core-proof] Logging error:', e);
  }
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const endpoint = '/v1-core-proof';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed. Use GET.' } }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Initialize Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get client IP for rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('cf-connecting-ip') 
    || 'unknown';
  const ipHash = await hashIp(clientIp);

  try {
    // Rate limit check (1000/min for public endpoints)
    const rateLimit = await checkRateLimit(supabase, ipHash, endpoint, 1000);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': String(Math.max(0, 1000 - rateLimit.count)),
      'X-RateLimit-Reset': String(Math.floor(Date.now() / 60000) * 60 + 60),
    };

    if (!rateLimit.allowed) {
      const retryAfter = 60 - (Date.now() % 60000) / 1000;
      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 429,
        responseTimeMs: Date.now() - startTime,
        ipHash,
        errorCode: 'RATE_LIMIT_EXCEEDED',
      });

      return new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Retry after ${Math.ceil(retryAfter)} seconds.`,
            retry_after_seconds: Math.ceil(retryAfter),
            limit: 1000,
            window: '1m',
          },
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...rateLimitHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(retryAfter)),
            'X-API-Version': 'v1',
          },
        }
      );
    }

    // Parse origin_id from query params
    const url = new URL(req.url);
    const originId = url.searchParams.get('origin_id');

    if (!originId) {
      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 400,
        responseTimeMs: Date.now() - startTime,
        ipHash,
        errorCode: 'INVALID_REQUEST_BODY',
      });

      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'Missing origin_id query parameter' } }),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
        }
      );
    }

    // Validate UUID format
    if (!UUID_REGEX.test(originId)) {
      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 400,
        responseTimeMs: Date.now() - startTime,
        ipHash,
        errorCode: 'INVALID_REQUEST_BODY',
      });

      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'origin_id must be a valid UUID' } }),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
        }
      );
    }

    // Lookup proof in core_ots_proofs
    const { data: proof, error: proofError } = await supabase
      .from('core_ots_proofs')
      .select('origin_id, ots_proof, status, bitcoin_block_height, anchored_at')
      .eq('origin_id', originId)
      .maybeSingle();

    if (proofError) {
      console.error('[v1-core-proof] Database error:', proofError);
      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 500,
        responseTimeMs: Date.now() - startTime,
        ipHash,
        errorCode: 'INTERNAL_ERROR',
      });

      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
        }
      );
    }

    // No proof row yet: check whether the origin itself exists.
    // If origin exists, this means proof generation is still pending.
    if (!proof) {
      const { data: origin, error: originError } = await supabase
        .from('origin_attestations')
        .select('origin_id')
        .eq('origin_id', originId)
        .maybeSingle();

      if (originError) {
        console.error('[v1-core-proof] Origin lookup error:', originError);
        await logRequest(supabase, {
          endpoint,
          method: 'GET',
          statusCode: 500,
          responseTimeMs: Date.now() - startTime,
          ipHash,
          errorCode: 'INTERNAL_ERROR',
        });

        return new Response(
          JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
          {
            status: 500,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
          }
        );
      }

      if (origin) {
        await logRequest(supabase, {
          endpoint,
          method: 'GET',
          statusCode: 202,
          responseTimeMs: Date.now() - startTime,
          ipHash,
        });

        return new Response(
          JSON.stringify({
            status: 'pending',
            message: 'Proof is awaiting Bitcoin confirmation',
            origin_id: originId,
          }),
          {
            status: 202,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
          }
        );
      }

      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 404,
        responseTimeMs: Date.now() - startTime,
        ipHash,
        errorCode: 'NOT_FOUND',
      });

      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'No proof found for origin_id' } }),
        {
          status: 404,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
        }
      );
    }

    // Pending status
    if (proof.status === 'pending') {
      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 202,
        responseTimeMs: Date.now() - startTime,
        ipHash,
      });

      return new Response(
        JSON.stringify({
          status: 'pending',
          message: 'Proof is awaiting Bitcoin confirmation',
          origin_id: originId,
        }),
        {
          status: 202,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
        }
      );
    }

    // Anchored - return binary proof file
    if (proof.status === 'anchored') {
      await logRequest(supabase, {
        endpoint,
        method: 'GET',
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        ipHash,
      });

      // Convert hex-encoded bytea string to Uint8Array
      // PostgreSQL returns bytea as '\x...' or '0x...' hex string
      const otsProof = proof.ots_proof as string;
      let hexString = otsProof;
      if (hexString.startsWith('\\x')) {
        hexString = hexString.slice(2);
      } else if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
      }
      const byteArray = new Uint8Array(
        hexString.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
      );

      return new Response(byteArray, {
        status: 200,
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders,
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${originId}.ots"`,
          'X-API-Version': 'v1',
          'X-Bitcoin-Block-Height': String(proof.bitcoin_block_height || ''),
          'X-Anchored-At': proof.anchored_at || '',
        },
      });
    }

    // Unknown status (shouldn't happen)
    await logRequest(supabase, {
      endpoint,
      method: 'GET',
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
      ipHash,
      errorCode: 'INTERNAL_ERROR',
    });

    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unknown proof status' } }),
      {
        status: 500,
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
      }
    );

  } catch (error) {
    console.error('[v1-core-proof] Unexpected error:', error);
    await logRequest(supabase, {
      endpoint,
      method: 'GET',
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
      ipHash,
      errorCode: 'INTERNAL_ERROR',
    });

    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
    );
  }
});
