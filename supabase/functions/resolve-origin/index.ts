/**
 * Resolve Origin API Endpoint
 * 
 * Public API for external systems to resolve origin metadata
 * 
 * Endpoints:
 *   GET /resolve-origin?origin_id={id}
 *   GET /resolve-origin?hash={sha256}
 * 
 * Returns origin metadata without exposing internal implementation
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

/**
 * Origin metadata response
 */
interface OriginMetadata {
  found: boolean;
  origin_id: string | null;
  origin_hash_sha256: string | null;
  origin_hash_algo: 'sha256' | null;
  hash_status: 'verified' | 'legacy_no_hash' | 'not_found';
  captured_at: string | null;
  labels: {
    future_you_cues: string[];
    keywords: string[];
  } | null;
  origin_link_url: string | null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
            by_id: '/resolve-origin?origin_id={uuid}',
            by_hash: '/resolve-origin?hash={sha256}',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[resolve-origin] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the page_origin_hashes table (sidecar)
    let query = supabase
      .from('page_origin_hashes')
      .select('page_id, origin_hash_sha256, origin_hash_algo, created_at');

    if (originId) {
      query = query.eq('page_id', originId);
    } else if (hash) {
      query = query.eq('origin_hash_sha256', hash.toLowerCase());
    }

    const { data: hashData, error: hashError } = await query.maybeSingle();

    if (hashError) {
      console.error('[resolve-origin] Query error:', hashError);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not found in sidecar, return not found
    if (!hashData) {
      const response: OriginMetadata = {
        found: false,
        origin_id: null,
        origin_hash_sha256: null,
        origin_hash_algo: null,
        hash_status: 'not_found',
        captured_at: null,
        labels: null,
        origin_link_url: null,
      };

      return new Response(
        JSON.stringify(response),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Found in sidecar - now try to get additional metadata from pages table
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .select('id, future_you_cues, keywords, created_at')
      .eq('id', hashData.page_id)
      .maybeSingle();

    const hasHash = !!hashData.origin_hash_sha256;
    const baseUrl = 'https://umarise.lovable.app';
    
    const response: OriginMetadata = {
      found: true,
      origin_id: hashData.page_id,
      origin_hash_sha256: hashData.origin_hash_sha256,
      origin_hash_algo: hasHash ? 'sha256' : null,
      hash_status: hasHash ? 'verified' : 'legacy_no_hash',
      captured_at: pageData?.created_at || hashData.created_at,
      labels: pageData ? {
        future_you_cues: pageData.future_you_cues || [],
        keywords: pageData.keywords || [],
      } : null,
      origin_link_url: `${baseUrl}/origin/${hashData.page_id}${hasHash ? `?verify=${hashData.origin_hash_sha256}` : ''}`,
    };

    // Log successful resolution for audit
    console.log('[resolve-origin] Resolved:', {
      method: originId ? 'by_id' : 'by_hash',
      origin_id: hashData.page_id,
      hash_status: response.hash_status,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        } 
      }
    );

  } catch (error) {
    console.error('[resolve-origin] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
