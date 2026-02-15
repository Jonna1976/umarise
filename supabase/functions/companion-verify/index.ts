/**
 * Verify Origin API - Bit-Identity Check
 * 
 * Verifies that provided content matches a stored origin hash.
 * 
 * Endpoint:
 *   POST /verify
 * 
 * Request:
 *   - origin_id: UUID of the origin to verify against
 *   - content: base64 encoded binary to verify
 * 
 * Response:
 *   - match: boolean (true if hash matches)
 *   - origin_hash: the stored hash
 *   - computed_hash: the hash of provided content
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

interface VerifyRequest {
  origin_id: string;
  content: string; // base64 encoded
}

interface VerifyResponse {
  match: boolean;
  origin_hash: string | null;
  computed_hash: string;
  origin_id: string;
  // U-mark: infrastructure signal indicating origin is captured and verifiable
  origin_mark: 'ᵁ' | null;
  origin_mark_meaning: string | null;
}

async function calculateSHA256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return encodeHex(new Uint8Array(hashBuffer));
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCompanionCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body: VerifyRequest = await req.json();

    if (!body.origin_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: origin_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body.content) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: content (base64 encoded binary)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 content
    let binaryData: Uint8Array;
    try {
      const binaryString = atob(body.content);
      binaryData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        binaryData[i] = binaryString.charCodeAt(i);
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid base64 content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate hash of provided content
    const computedHash = await calculateSHA256(binaryData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[verify] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the stored hash
    const { data: hashData, error: hashError } = await supabase
      .from('page_origin_hashes')
      .select('origin_hash_sha256')
      .eq('page_id', body.origin_id)
      .maybeSingle();

    if (hashError) {
      console.error('[verify] Query error:', hashError);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!hashData) {
      return new Response(
        JSON.stringify({ 
          error: 'Origin not found',
          origin_id: body.origin_id 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const storedHash = hashData.origin_hash_sha256;
    const match = storedHash === computedHash;

    const response: VerifyResponse = {
      match,
      origin_hash: storedHash,
      computed_hash: computedHash,
      origin_id: body.origin_id,
      // U-mark: present when origin is verified (hash exists and matches)
      origin_mark: match ? 'ᵁ' : null,
      origin_mark_meaning: match ? 'ᵁ indicates that an origin was captured and is verifiable.' : null,
    };

    console.log('[verify] Verification result:', {
      origin_id: body.origin_id,
      match,
      stored_hash_prefix: storedHash?.substring(0, 16) + '...',
      computed_hash_prefix: computedHash.substring(0, 16) + '...',
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        } 
      }
    );

  } catch (error) {
    console.error('[verify] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
