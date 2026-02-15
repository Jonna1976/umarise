/**
 * Origins API - Create Origin Endpoint
 * 
 * Write-once immutable origin creation.
 * 
 * Endpoint:
 *   POST /origins
 * 
 * Authentication:
 *   Requires X-API-Key header matching ORIGINS_API_KEY secret
 * 
 * Request:
 *   - content: base64 encoded binary
 *   - source_system: string (e.g., "notion", "scanner", "nextcloud")
 *   - metadata?: object (optional additional metadata)
 * 
 * Response:
 *   - origin_id: UUID
 *   - origin_hash: SHA-256 hash
 *   - captured_at: ISO-8601 timestamp
 * 
 * Guarantees:
 *   - Hash is computed before storage
 *   - Returns immutable origin reference
 *   - No UPDATE endpoint exists
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

const EXTRA_HEADERS = 'x-api-key';

interface CreateOriginRequest {
  content: string; // base64 encoded
  source_system: string;
  metadata?: Record<string, unknown>;
}

interface CreateOriginResponse {
  origin_id: string;
  origin_hash: string;
  hash_algo: 'sha256';
  captured_at: string;
  source_system: string;
}

async function calculateSHA256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return encodeHex(new Uint8Array(hashBuffer));
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCompanionCorsHeaders(req, EXTRA_HEADERS);

  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req, EXTRA_HEADERS);
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('ORIGINS_API_KEY') || Deno.env.get('HETZNER_API_TOKEN');
    
    if (!expectedApiKey) {
      console.error('[origins] No API key configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Valid X-API-Key required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateOriginRequest = await req.json();

    if (!body.content) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: content (base64 encoded binary)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body.source_system) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: source_system' }),
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

    // Calculate SHA-256 hash BEFORE storage
    const originHash = await calculateSHA256(binaryData);
    const capturedAt = new Date().toISOString();
    const originId = crypto.randomUUID();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[origins] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this hash already exists (content-addressed deduplication)
    const { data: existingHash } = await supabase
      .from('page_origin_hashes')
      .select('page_id, origin_hash_sha256, created_at')
      .eq('origin_hash_sha256', originHash)
      .maybeSingle();

    if (existingHash) {
      // Return existing origin (idempotent)
      console.log('[origins] Content already exists, returning existing origin:', existingHash.page_id);
      
      const response: CreateOriginResponse = {
        origin_id: existingHash.page_id,
        origin_hash: existingHash.origin_hash_sha256,
        hash_algo: 'sha256',
        captured_at: existingHash.created_at,
        source_system: body.source_system,
      };

      return new Response(
        JSON.stringify({
          ...response,
          _note: 'Content already exists. Returning existing origin (content-addressed).',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in Hetzner Vault via proxy
    const hetznerApiUrl = Deno.env.get('HETZNER_API_URL') || 'https://vault.umarise.com';
    const hetznerToken = Deno.env.get('HETZNER_API_TOKEN');

    if (!hetznerToken) {
      console.error('[origins] Missing HETZNER_API_TOKEN');
      return new Response(
        JSON.stringify({ error: 'Storage configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to Hetzner storage
    const formData = new FormData();
    const blobArray = new Uint8Array(binaryData.buffer as ArrayBuffer);
    const blob = new Blob([blobArray.buffer], { type: 'application/octet-stream' });
    formData.append('file', blob, `${originId}.bin`);
    formData.append('origin_id', originId);
    formData.append('origin_hash', originHash);

    const storageResponse = await fetch(`${hetznerApiUrl}/api/codex/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hetznerToken}`,
      },
      body: formData,
    });

    if (!storageResponse.ok) {
      const errorText = await storageResponse.text();
      console.error('[origins] Hetzner storage failed:', storageResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to store origin in vault' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const storageResult = await storageResponse.json();
    const imageUrl = storageResult.image_url || `ipfs://${storageResult.cid}`;

    // Record in sidecar table
    const { error: insertError } = await supabase
      .from('page_origin_hashes')
      .insert({
        page_id: originId,
        origin_hash_sha256: originHash,
        origin_hash_algo: 'sha256',
        image_url: imageUrl,
        device_user_id: body.source_system, // Use source_system as device_user_id for API origins
      });

    if (insertError) {
      console.error('[origins] Failed to record hash:', insertError);
      // Origin is stored, but hash record failed - still return success
      console.warn('[origins] Origin stored but hash record failed');
    }

    const response: CreateOriginResponse = {
      origin_id: originId,
      origin_hash: originHash,
      hash_algo: 'sha256',
      captured_at: capturedAt,
      source_system: body.source_system,
    };

    console.log('[origins] Created:', {
      origin_id: originId,
      hash: originHash.substring(0, 16) + '...',
      source_system: body.source_system,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Location': `/resolve?origin_id=${originId}`,
        } 
      }
    );

  } catch (error) {
    console.error('[origins] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
