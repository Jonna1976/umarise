/**
 * Resolve Origin API - Public Endpoint
 * 
 * Alias for /resolve-origin that follows the Integration Contract spec.
 * 
 * Endpoints:
 *   GET /resolve?origin_id={uuid}
 *   GET /resolve?hash={sha256}
 *   GET /resolve?cid={cid}  (future)
 * 
 * Returns origin metadata for external systems to link and verify.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';
import { checkPublicRateLimit, publicRateLimitResponse } from '../_shared/publicRateLimit.ts';

interface OriginResponse {
  found: boolean;
  origin: {
    origin_id: string;
    origin_hash: string | null;
    hash_algo: 'sha256' | null;
    captured_at: string | null;
    source_system: string;
    capture_type: 'image' | 'text' | 'binary';
    integrity_status: 'valid' | 'legacy' | 'unverified';
  } | null;
  artifact_url: string | null;
  proof: {
    hash: string | null;
    algo: 'sha256' | null;
  } | null;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCompanionCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req);
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use GET.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limit: 60 req/min per IP
  const rl = await checkPublicRateLimit(req, 'companion-resolve', 60);
  if (!rl.allowed) {
    return publicRateLimitResponse(corsHeaders, rl.resetInSeconds);
  }

  try {
    const url = new URL(req.url);
    const originId = url.searchParams.get('origin_id');
    const hash = url.searchParams.get('hash');
    const cid = url.searchParams.get('cid');

    // Require at least one parameter
    if (!originId && !hash && !cid) {
      return new Response(
        JSON.stringify({
          error: 'Missing parameter. Provide origin_id, hash, or cid.',
          usage: {
            by_id: '/resolve?origin_id={uuid}',
            by_hash: '/resolve?hash={sha256}',
            by_cid: '/resolve?cid={ipfs_cid}',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CID lookup not yet implemented
    if (cid && !originId && !hash) {
      return new Response(
        JSON.stringify({
          error: 'CID lookup not yet implemented. Use origin_id or hash.',
        }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[resolve] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the page_origin_hashes table
    let query = supabase
      .from('page_origin_hashes')
      .select('page_id, origin_hash_sha256, origin_hash_algo, created_at, image_url');

    if (originId) {
      query = query.eq('page_id', originId);
    } else if (hash) {
      query = query.eq('origin_hash_sha256', hash.toLowerCase());
    }

    const { data: hashData, error: hashError } = await query.maybeSingle();

    if (hashError) {
      console.error('[resolve] Query error:', hashError);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not found
    if (!hashData) {
      const response: OriginResponse = {
        found: false,
        origin: null,
        artifact_url: null,
        proof: null,
      };

      return new Response(
        JSON.stringify(response),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get additional metadata from pages table
    const { data: pageData } = await supabase
      .from('pages')
      .select('id, image_url, created_at')
      .eq('id', hashData.page_id)
      .maybeSingle();

    const hasHash = !!hashData.origin_hash_sha256;
    const hetznerApiUrl = Deno.env.get('HETZNER_API_URL') || 'https://vault.umarise.com';
    
    // Resolve artifact URL
    let artifactUrl: string | null = pageData?.image_url || hashData.image_url || null;
    if (artifactUrl?.startsWith('ipfs://')) {
      const cidFromUrl = artifactUrl.replace('ipfs://', '');
      artifactUrl = `${hetznerApiUrl}/ipfs/${cidFromUrl}`;
    }

    const response: OriginResponse = {
      found: true,
      origin: {
        origin_id: hashData.page_id,
        origin_hash: hashData.origin_hash_sha256,
        hash_algo: hasHash ? 'sha256' : null,
        captured_at: pageData?.created_at || hashData.created_at,
        source_system: 'umarise',
        capture_type: 'image',
        integrity_status: hasHash ? 'valid' : 'legacy',
      },
      artifact_url: artifactUrl,
      proof: hasHash ? {
        hash: hashData.origin_hash_sha256,
        algo: 'sha256',
      } : null,
    };

    console.log('[resolve] Resolved:', {
      method: originId ? 'by_id' : 'by_hash',
      origin_id: hashData.page_id,
      integrity_status: response.origin?.integrity_status,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        } 
      }
    );

  } catch (error) {
    console.error('[resolve] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
