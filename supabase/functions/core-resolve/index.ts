/**
 * UMARISE CORE: Resolve Origin Attestation (legacy wrapper)
 * 
 * Retrieve immutable facts. No artifact URLs, no semantics, no labels.
 * 
 * Endpoint: GET /core/resolve?origin_id=... OR /core/resolve?hash=...
 * 
 * Authentication: Public (rate-limited)
 * 
 * Response:
 *   {
 *     "found": true,
 *     "origin": {
 *       "origin_id": "...",
 *       "hash": "sha256:...",
 *       "hash_algo": "sha256",
 *       "captured_at": "..."
 *     }
 *   }
 * 
 * Constraints:
 *   - No artifact_url
 *   - No integrity_status
 *   - No capture_type
 *   - No source_system
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

// Deprecation headers for legacy endpoint
const deprecationHeaders = {
  'X-Deprecated': 'true',
  'X-Upgrade-To': '/v1/core/resolve',
};

interface CoreOrigin {
  origin_id: string;
  hash: string;
  hash_algo: 'sha256';
  captured_at: string;
}

interface CoreResolveResponse {
  found: boolean;
  origin: CoreOrigin | null;
}

// Normalize hash for lookup
function normalizeHashForLookup(input: string): string {
  const trimmed = input.trim().toLowerCase();
  
  // If already prefixed, return as-is
  if (trimmed.startsWith('sha256:')) {
    return trimmed;
  }
  
  // If raw hex, add prefix
  if (/^[a-f0-9]{64}$/.test(trimmed)) {
    return `sha256:${trimmed}`;
  }
  
  return trimmed;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCompanionCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req);
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use GET.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const originId = url.searchParams.get('origin_id');
    const hash = url.searchParams.get('hash');

    // Require at least one parameter
    if (!originId && !hash) {
      return new Response(
        JSON.stringify({
          error: 'Missing parameter. Provide origin_id or hash.',
          usage: {
            by_id: '/core/resolve?origin_id={uuid}',
            by_hash: '/core/resolve?hash={sha256}',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client (anon key for public read)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[core-resolve] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the origin_attestations table
    let query = supabase
      .from('origin_attestations')
      .select('origin_id, hash, hash_algo, captured_at');

    if (originId) {
      query = query.eq('origin_id', originId);
    } else if (hash) {
      const normalizedHash = normalizeHashForLookup(hash);
      query = query.eq('hash', normalizedHash);
    }

    // For hash lookups, there may be multiple attestations - return the first (oldest)
    const { data, error } = await query.order('captured_at', { ascending: true }).limit(1).maybeSingle();

    if (error) {
      console.error('[core-resolve] Query error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not found
    if (!data) {
      const response: CoreResolveResponse = {
        found: false,
        origin: null,
      };

      return new Response(
        JSON.stringify(response),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Found - return minimal Core response
    const response: CoreResolveResponse = {
      found: true,
      origin: {
        origin_id: data.origin_id,
        hash: data.hash,
        hash_algo: data.hash_algo,
        captured_at: data.captured_at,
      },
    };

    console.log('[core-resolve] Resolved:', {
      method: originId ? 'by_id' : 'by_hash',
      origin_id: data.origin_id,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          ...deprecationHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        } 
      }
    );

  } catch (error) {
    console.error('[core-resolve] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
