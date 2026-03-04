/**
 * UMARISE CORE v1: Self-Service Developer Key
 * 
 * Generates a production API key instantly. No email, no signup, no account.
 * Rate-limited by IP to prevent abuse.
 * 
 * Endpoint: POST /v1-developer-key
 * 
 * Request Body: { "name": "My Project" } (optional)
 * 
 * Response:
 *   {
 *     "api_key": "um_xxxxxxxx...64 hex chars",
 *     "key_prefix": "um_xxxxx",
 *     "rate_limit_tier": "standard",
 *     "credits": 100,
 *     "warning": "Store this key securely. It cannot be retrieved again."
 *   }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function generateApiKey(): Promise<string> {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return `um_${encodeHex(randomBytes)}`;
}

async function computeKeyHash(apiKey: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(apiKey);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return encodeHex(new Uint8Array(signature));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!coreApiSecret || !supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Server configuration error' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple IP-based rate limit: max 3 keys per hour per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = encodeHex(new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientIp))
    ));

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check recent key generation from this IP
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabase
      .from('partner_api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('issued_by', `self-service:${ipHash.substring(0, 16)}`)
      .gte('issued_at', oneHourAgo);

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Maximum 3 keys per hour. Try again later.' } }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } }
      );
    }

    // Parse optional name
    let projectName = 'Developer';
    try {
      const body = await req.json();
      if (body?.name && typeof body.name === 'string' && body.name.trim().length > 0) {
        projectName = body.name.trim().substring(0, 100);
      }
    } catch { /* no body is fine */ }

    // Generate key
    const apiKey = await generateApiKey();
    const keyPrefix = apiKey.substring(0, 11); // "um_" + 8 hex chars
    const keyHash = await computeKeyHash(apiKey, coreApiSecret);

    // Store in database
    const { error: insertError } = await supabase
      .from('partner_api_keys')
      .insert({
        partner_name: projectName,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        issued_by: `self-service:${ipHash.substring(0, 16)}`,
        rate_limit_tier: 'standard',
        credit_balance: 100,
      });

    if (insertError) {
      console.error('[v1-developer-key] DB error:', insertError);
      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create key' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[v1-developer-key] Key created:', { key_prefix: keyPrefix, project: projectName });

    return new Response(
      JSON.stringify({
        api_key: apiKey,
        key_prefix: keyPrefix,
        rate_limit_tier: 'standard',
        credits: 100,
        warning: 'Store this key securely. It cannot be retrieved again.',
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } 
      }
    );

  } catch (error) {
    console.error('[v1-developer-key] Error:', error);
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
