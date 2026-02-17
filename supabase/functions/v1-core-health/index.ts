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
 *   { "status": "degraded", "version": "v1", "timestamp": "...", "database": "unreachable" }
 */

import { corsHeaders, createAnonClient, errorResponse } from '../_shared/coreHelpers.ts';

const DB_PING_TIMEOUT_MS = 500;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse('INVALID_REQUEST_BODY', 'Method not allowed. Use GET.', 405);
  }

  const timestamp = new Date().toISOString();
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-API-Version': 'v1',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };

  try {
    const supabase = createAnonClient();

    // DB ping with 500ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DB_PING_TIMEOUT_MS);

    try {
      const { error } = await supabase
        .from('origin_attestations')
        .select('origin_id')
        .limit(1);

      clearTimeout(timeoutId);

      if (error) {
        console.error('[v1-core-health] Database check failed:', error.message);
        return new Response(
          JSON.stringify({ status: 'degraded', version: 'v1', timestamp, database: 'unreachable' }),
          { status: 503, headers }
        );
      }

      return new Response(
        JSON.stringify({ status: 'operational', version: 'v1', timestamp }),
        { status: 200, headers }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[v1-core-health] Health check timeout or error:', err);
      return new Response(
        JSON.stringify({ status: 'degraded', version: 'v1', timestamp, database: 'unreachable' }),
        { status: 503, headers }
      );
    }
  } catch (error) {
    console.error('[v1-core-health] Unexpected error:', error);
    return new Response(
      JSON.stringify({ status: 'degraded', version: 'v1', timestamp, database: 'unreachable' }),
      { status: 503, headers }
    );
  }
});
