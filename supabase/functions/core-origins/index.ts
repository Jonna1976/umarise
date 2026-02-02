/**
 * UMARISE CORE: Create Origin Attestation
 * 
 * Pure hash-only endpoint. No bytes, no storage, no semantics.
 * 
 * Endpoint: POST /core/origins
 * 
 * Authentication: Requires X-API-Key header with partner API key
 * - Keys are validated via HMAC-SHA256 against partner_api_keys table
 * - Revoked keys are rejected
 * 
 * Request:
 *   { "hash": "sha256:<hex>" }
 * 
 * Response:
 *   { "origin_id": "...", "hash": "...", "hash_algo": "sha256", "captured_at": "..." }
 * 
 * Constraints:
 *   - Write-once: cannot mutate existing records
 *   - No bytes accepted
 *   - No labels accepted
 *   - No artifact URLs
 *   - No idempotency on content (same hash = new attestation)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CoreOriginRequest {
  hash: string; // Format: "sha256:<hex>" or just "<hex>"
}

interface CoreOriginResponse {
  origin_id: string;
  hash: string;
  hash_algo: 'sha256';
  captured_at: string;
}

// Validate and normalize hash format
function normalizeHash(input: string): { hash: string; algo: 'sha256' } | null {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim().toLowerCase();
  
  // Handle "sha256:<hex>" format
  if (trimmed.startsWith('sha256:')) {
    const hex = trimmed.slice(7);
    if (/^[a-f0-9]{64}$/.test(hex)) {
      return { hash: `sha256:${hex}`, algo: 'sha256' };
    }
    return null;
  }
  
  // Handle raw hex format (64 chars = SHA-256)
  if (/^[a-f0-9]{64}$/.test(trimmed)) {
    return { hash: `sha256:${trimmed}`, algo: 'sha256' };
  }
  
  return null;
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

// Validate partner API key against partner_api_keys table
async function validatePartnerApiKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  apiKey: string,
  coreApiSecret: string
): Promise<{ valid: boolean; partnerName?: string; error?: string }> {
  if (!apiKey || apiKey.length < 32) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // Extract prefix (first 8 chars) for lookup
  const keyPrefix = apiKey.substring(0, 8);
  
  // Compute HMAC-SHA256 hash of the full key
  const keyHash = await computeKeyHash(apiKey, coreApiSecret);

  // Look up by prefix first, then verify hash
  const { data: keyRecords, error: lookupError } = await supabase
    .from('partner_api_keys')
    .select('id, key_hash, partner_name, revoked_at')
    .eq('key_prefix', keyPrefix);

  if (lookupError) {
    console.error('[core-origins] Key lookup error:', lookupError);
    return { valid: false, error: 'Authentication service unavailable' };
  }

  if (!keyRecords || keyRecords.length === 0) {
    return { valid: false, error: 'Unknown API key' };
  }

  // Find matching key hash
  const matchingKey = keyRecords.find((record: { key_hash: string }) => record.key_hash === keyHash);
  
  if (!matchingKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check if revoked
  if (matchingKey.revoked_at) {
    return { valid: false, error: 'API key has been revoked' };
  }

  return { valid: true, partnerName: matchingKey.partner_name as string };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get required secrets
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!coreApiSecret) {
      console.error('[core-origins] CORE_API_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('[core-origins] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role (required for partner_api_keys access)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate partner API key via HMAC-SHA256
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing X-API-Key header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = await validatePartnerApiKey(supabase, apiKey, coreApiSecret);
    
    if (!authResult.valid) {
      console.log('[core-origins] Auth failed:', authResult.error);
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[core-origins] Authenticated partner:', authResult.partnerName);

    // Parse request body
    const body: CoreOriginRequest = await req.json();

    // Validate: hash is required
    if (!body.hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject any bytes/content field (Core does not accept bytes)
    if ('content' in body || 'bytes' in body || 'data' in body || 'file' in body) {
      return new Response(
        JSON.stringify({ error: 'Core does not accept bytes. Provide hash only.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject any semantic labels (Core does not accept labels)
    if ('source_system' in body || 'metadata' in body || 'labels' in body || 'type' in body) {
      return new Response(
        JSON.stringify({ error: 'Core does not accept labels. Provide hash only.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize and validate hash
    const normalized = normalizeHash(body.hash);
    if (!normalized) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid hash format. Expected sha256:<64-char-hex> or 64-char hex string.',
          example: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the attestation (no idempotency on content - each call = new attestation)
    const capturedAt = new Date().toISOString();
    
    const { data, error: insertError } = await supabase
      .from('origin_attestations')
      .insert({
        hash: normalized.hash,
        hash_algo: normalized.algo,
        captured_at: capturedAt,
      })
      .select('origin_id, hash, hash_algo, captured_at')
      .single();

    if (insertError) {
      console.error('[core-origins] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create attestation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: CoreOriginResponse = {
      origin_id: data.origin_id,
      hash: data.hash,
      hash_algo: data.hash_algo,
      captured_at: data.captured_at,
    };

    console.log('[core-origins] Created attestation:', {
      origin_id: data.origin_id,
      hash: data.hash.substring(0, 20) + '...',
      partner: authResult.partnerName,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Location': `/core/resolve?origin_id=${data.origin_id}`,
        } 
      }
    );

  } catch (error) {
    console.error('[core-origins] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
