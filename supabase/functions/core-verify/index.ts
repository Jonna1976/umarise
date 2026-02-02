/**
 * UMARISE CORE: Verify Origin Attestation
 * 
 * Binary verification: does this hash have an attestation? Yes/No.
 * 
 * Endpoint: POST /core/verify
 * 
 * Authentication: Public (rate-limited)
 * 
 * Request:
 *   { "hash": "sha256:<hex>" }
 * 
 * Response (found):
 *   { "match": true, "origin_id": "...", "captured_at": "..." }
 * 
 * Response (not found):
 *   { "match": false }
 * 
 * Constraints:
 *   - No marks (e.g. ᵁ)
 *   - No "meaning" strings
 *   - Verification is binary
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CoreVerifyRequest {
  hash: string;
}

interface CoreVerifyResponseMatch {
  match: true;
  origin_id: string;
  captured_at: string;
}

interface CoreVerifyResponseNoMatch {
  match: false;
}

type CoreVerifyResponse = CoreVerifyResponseMatch | CoreVerifyResponseNoMatch;

// Normalize hash for lookup
function normalizeHashForLookup(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim().toLowerCase();
  
  // If already prefixed, validate and return
  if (trimmed.startsWith('sha256:')) {
    const hex = trimmed.slice(7);
    if (/^[a-f0-9]{64}$/.test(hex)) {
      return trimmed;
    }
    return null;
  }
  
  // If raw hex, add prefix
  if (/^[a-f0-9]{64}$/.test(trimmed)) {
    return `sha256:${trimmed}`;
  }
  
  return null;
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
    // Parse request body
    const body: CoreVerifyRequest = await req.json();

    // Validate: hash is required
    if (!body.hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject any bytes/content field (Core verifies by hash only)
    if ('content' in body || 'bytes' in body || 'data' in body || 'origin_id' in body) {
      return new Response(
        JSON.stringify({ error: 'Core verifies by hash only. Do not provide bytes or origin_id.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize and validate hash
    const normalizedHash = normalizeHashForLookup(body.hash);
    if (!normalizedHash) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid hash format. Expected sha256:<64-char-hex> or 64-char hex string.',
          example: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client (anon key for public read)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[core-verify] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the origin_attestations table
    // Return the first (oldest) attestation for this hash
    const { data, error } = await supabase
      .from('origin_attestations')
      .select('origin_id, captured_at')
      .eq('hash', normalizedHash)
      .order('captured_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[core-verify] Query error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No attestation found
    if (!data) {
      const response: CoreVerifyResponse = {
        match: false,
      };

      console.log('[core-verify] No match:', {
        hash: normalizedHash.substring(0, 20) + '...',
      });

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Attestation found - binary match
    const response: CoreVerifyResponse = {
      match: true,
      origin_id: data.origin_id,
      captured_at: data.captured_at,
    };

    console.log('[core-verify] Match:', {
      origin_id: data.origin_id,
      hash: normalizedHash.substring(0, 20) + '...',
    });

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[core-verify] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
