/**
 * UMARISE CORE v1: Internal Metrics
 * 
 * Operational statistics for monitoring.
 * 
 * Endpoint: GET /v1/internal/metrics
 * 
 * Authentication: Requires X-Internal-Secret header matching CORE_API_SECRET
 * 
 * Response:
 *   {
 *     "total_attestations": 12847,
 *     "attestations_24h": 342,
 *     "attestations_7d": 2103,
 *     "active_partners": 5,
 *     "avg_response_time_ms_24h": 45,
 *     "error_rate_24h": 0.002,
 *     "requests_24h": 5420,
 *     "requests_by_endpoint_24h": { ... },
 *     "timestamp": "2026-02-04T14:30:00.000Z"
 *   }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

interface MetricsResponse {
  total_attestations: number;
  attestations_24h: number;
  attestations_7d: number;
  active_partners: number;
  avg_response_time_ms_24h: number;
  error_rate_24h: number;
  requests_24h: number;
  requests_by_endpoint_24h: Record<string, number>;
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'Method not allowed. Use GET.' } }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate internal access using dedicated internal secret
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = Deno.env.get('INTERNAL_API_SECRET');

    if (!expectedSecret) {
      console.error('[v1-internal-metrics] INTERNAL_API_SECRET not configured');
      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Server configuration error' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!internalSecret || internalSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing X-Internal-Secret' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for efficiency - use RPC for request metrics to bypass 1000 row limit
    const [
      totalAttestationsResult,
      attestations24hResult,
      attestations7dResult,
      activePartnersResult,
      requestMetrics24hResult,
    ] = await Promise.all([
      // Total attestations
      supabase
        .from('origin_attestations')
        .select('*', { count: 'exact', head: true }),
      
      // Attestations in last 24h
      supabase
        .from('origin_attestations')
        .select('*', { count: 'exact', head: true })
        .gte('captured_at', twentyFourHoursAgo.toISOString()),
      
      // Attestations in last 7d
      supabase
        .from('origin_attestations')
        .select('*', { count: 'exact', head: true })
        .gte('captured_at', sevenDaysAgo.toISOString()),
      
      // Active partners (non-revoked API keys)
      supabase
        .from('partner_api_keys')
        .select('*', { count: 'exact', head: true })
        .is('revoked_at', null),
      
      // Request metrics for last 24h - using RPC to bypass 1000 row limit
      supabase.rpc('core_metrics_24h'),
    ]);

    // Extract metrics from RPC result
    const requestMetrics = requestMetrics24hResult.data || {
      total_requests: 0,
      avg_response_time_ms: 0,
      error_count: 0,
      by_endpoint: {},
    };

    const totalRequests24h = requestMetrics.total_requests || 0;
    const avgResponseTime = requestMetrics.avg_response_time_ms || 0;
    const errorCount = requestMetrics.error_count || 0;
    const errorRate = totalRequests24h > 0 
      ? Math.round((errorCount / totalRequests24h) * 10000) / 10000 
      : 0;
    const requestsByEndpoint = requestMetrics.by_endpoint || {};

    const metrics: MetricsResponse = {
      total_attestations: totalAttestationsResult.count || 0,
      attestations_24h: attestations24hResult.count || 0,
      attestations_7d: attestations7dResult.count || 0,
      active_partners: activePartnersResult.count || 0,
      avg_response_time_ms_24h: avgResponseTime,
      error_rate_24h: errorRate,
      requests_24h: totalRequests24h,
      requests_by_endpoint_24h: requestsByEndpoint,
      timestamp: now.toISOString(),
    };

    console.log('[v1-internal-metrics] Metrics generated:', {
      total_attestations: metrics.total_attestations,
      attestations_24h: metrics.attestations_24h,
      active_partners: metrics.active_partners,
    });

    return new Response(
      JSON.stringify(metrics),
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

  } catch (error) {
    console.error('[v1-internal-metrics] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
