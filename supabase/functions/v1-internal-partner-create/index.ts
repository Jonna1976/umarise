/**
 * UMARISE CORE v1: Internal Partner Create
 * 
 * Creates a new partner API key for onboarding.
 * 
 * Endpoint: POST /v1/internal/partner-create
 * 
 * Authentication: Requires X-Internal-Secret header matching INTERNAL_API_SECRET
 * 
 * Request Body:
 *   {
 *     "partner_name": "Acme Corp",
 *     "rate_limit_tier": "standard" | "premium" | "unlimited" (optional, defaults to "standard")
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "partner_id": "uuid",
 *     "partner_name": "Acme Corp",
 *     "api_key": "um_xxxxxxxx...64 hex chars total",
 *     "key_prefix": "um_xxxxx",
 *     "rate_limit_tier": "standard",
 *     "warning": "Store this API key securely. It cannot be retrieved again."
 *   }
 * 
 * Security:
 *   - API key is generated as 64 random hex characters with "um_" prefix
 *   - Key is hashed using HMAC-SHA256 with CORE_API_SECRET before storage
 *   - Only the hash is stored; plaintext key is returned once and never stored
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type RateLimitTier = 'standard' | 'premium' | 'unlimited';

interface CreatePartnerRequest {
  partner_name: string;
  rate_limit_tier?: RateLimitTier;
}

interface CreatePartnerResponse {
  success: boolean;
  partner_id: string;
  partner_name: string;
  api_key: string;
  key_prefix: string;
  rate_limit_tier: RateLimitTier;
  warning: string;
}

async function generateApiKey(): Promise<string> {
  // Generate 32 random bytes = 64 hex characters
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const hexKey = encodeHex(randomBytes);
  return `um_${hexKey}`;
}

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
  return encodeHex(new Uint8Array(signature));
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed. Use POST.' } }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate internal access
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = Deno.env.get('INTERNAL_API_SECRET');
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');

    if (!expectedSecret || !coreApiSecret) {
      console.error('[v1-internal-partner-create] Required secrets not configured');
      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Server configuration error' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!internalSecret || internalSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing X-Internal-Secret' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body: CreatePartnerRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'Invalid JSON body' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate partner_name
    if (!body.partner_name || typeof body.partner_name !== 'string' || body.partner_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'partner_name is required and must be a non-empty string' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const partnerName = body.partner_name.trim();
    if (partnerName.length > 100) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'partner_name must be 100 characters or less' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate rate_limit_tier
    const validTiers: RateLimitTier[] = ['standard', 'premium', 'unlimited'];
    const rateLimitTier: RateLimitTier = body.rate_limit_tier && validTiers.includes(body.rate_limit_tier) 
      ? body.rate_limit_tier 
      : 'standard';

    // Generate API key
    const apiKey = await generateApiKey();
    const keyPrefix = apiKey.substring(0, 11); // "um_" + first 8 hex chars
    const keyHash = await computeKeyHash(apiKey, coreApiSecret);

    // Connect to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert partner record
    const { data, error } = await supabase
      .from('partner_api_keys')
      .insert({
        partner_name: partnerName,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        issued_by: 'v1-internal-partner-create',
      })
      .select('id, partner_name')
      .single();

    if (error) {
      console.error('[v1-internal-partner-create] Database error:', error);
      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create partner record' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: CreatePartnerResponse = {
      success: true,
      partner_id: data.id,
      partner_name: data.partner_name,
      api_key: apiKey,
      key_prefix: keyPrefix,
      rate_limit_tier: rateLimitTier,
      warning: 'Store this API key securely. It cannot be retrieved again.',
    };

    console.log('[v1-internal-partner-create] Partner created:', {
      partner_id: data.id,
      partner_name: partnerName,
      key_prefix: keyPrefix,
      rate_limit_tier: rateLimitTier,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-API-Version': 'v1',
        } 
      }
    );

  } catch (error) {
    console.error('[v1-internal-partner-create] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
