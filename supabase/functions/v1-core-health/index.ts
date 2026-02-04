/**
 * UMARISE CORE v1: Health Check
 * 
 * Public endpoint for monitoring Core availability.
 * 
 * Endpoint: GET /v1/core/health (mapped from /v1-core-health)
 * 
 * Response (200 OK):
 *   { "status": "operational", "version": "v1", "timestamp": "..." }
 * 
 * Response (503 Service Unavailable):
 *   { "status": "degraded", "version": "v1", "timestamp": "..." }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const HEALTH_TIMEOUT_MS = 2000;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'Method not allowed. Use GET.' } }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
    );
  }

  const timestamp = new Date().toISOString();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[v1-core-health] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ status: 'degraded', version: 'v1', timestamp }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple connectivity check with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
      // Query to verify database connectivity
      const { error } = await supabase
        .from('origin_attestations')
        .select('origin_id')
        .limit(1);

      clearTimeout(timeoutId);

      if (error) {
        console.error('[v1-core-health] Database check failed:', error.message);
        return new Response(
          JSON.stringify({ status: 'degraded', version: 'v1', timestamp }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
        );
      }

      // All checks passed
      return new Response(
        JSON.stringify({ status: 'operational', version: 'v1', timestamp }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-API-Version': 'v1',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          } 
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[v1-core-health] Health check timeout or error:', err);
      return new Response(
        JSON.stringify({ status: 'degraded', version: 'v1', timestamp }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
      );
    }
  } catch (error) {
    console.error('[v1-core-health] Unexpected error:', error);
    return new Response(
      JSON.stringify({ status: 'degraded', version: 'v1', timestamp }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
    );
  }
});
