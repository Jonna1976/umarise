import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';
import { checkCompanionRateLimit, rateLimitResponse } from '../_shared/companionRateLimit.ts';

const EXTRA_HEADERS = 'x-device-user-id';

const HETZNER_BASE_URL = "https://vault.umarise.com";
const TIMEOUT_MS = 120000;

// Service routing - determines which API path to use
const SERVICE_ROUTES: Record<string, string> = {
  '/ai/search': '/api/codex',      // Search is on codex service
  'default': '/api/vision',         // Everything else on vision service
};

const RATE_LIMITS: Record<string, number> = {
  '/ai/analyze-page': 10,
  '/ai/generate-embeddings': 20,
  '/ai/search': 30,
  'default': 15
};

// deno-lint-ignore no-explicit-any
async function logAudit(supabase: any, log: Record<string, unknown>) {
  try {
    await supabase.from('audit_logs').insert(log);
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  const corsHeaders = getCompanionCorsHeaders(req, EXTRA_HEADERS);
  console.log(`[${requestId}] hetzner-ai-proxy called: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return companionPreflightResponse(req, EXTRA_HEADERS);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let deviceUserId = 'anonymous';
  let endpoint = 'unknown';

  try {
    const { endpoint: reqEndpoint, payload } = await req.json();
    endpoint = reqEndpoint || 'unknown';
    
    if (!reqEndpoint) {
      await logAudit(supabase, {
        request_id: requestId, device_user_id: 'anonymous', service: 'ai-proxy',
        endpoint: 'unknown', method: 'POST', status_code: 400,
        duration_ms: Date.now() - startTime, error_message: 'Missing endpoint parameter',
      });
      return new Response(JSON.stringify({ error: "Missing endpoint parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    deviceUserId = payload?.deviceUserId || req.headers.get('x-device-user-id') || 'anonymous';
    console.log(`[${requestId}] Device: ${deviceUserId.slice(0, 8)}..., Endpoint: ${endpoint}`);

    const rateCheck = checkRateLimit(deviceUserId, endpoint);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'ai-proxy',
        endpoint, method: 'POST', status_code: 429, duration_ms: Date.now() - startTime,
        error_message: 'Rate limit exceeded', rate_limited: true, rate_limit_remaining: 0,
      });
      return new Response(JSON.stringify({ error: "Rate limit exceeded", retryAfterSeconds: retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": retryAfter.toString() } });
    }

    const hetznerToken = Deno.env.get('HETZNER_API_TOKEN');
    if (!hetznerToken) {
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'ai-proxy',
        endpoint, method: 'POST', status_code: 500, duration_ms: Date.now() - startTime,
        error_message: 'HETZNER_API_TOKEN not configured', rate_limit_remaining: rateCheck.remaining,
      });
      return new Response(JSON.stringify({ error: "Backend not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Determine the correct service route
    const serviceBase = SERVICE_ROUTES[endpoint] || SERVICE_ROUTES['default'];
    const targetUrl = `${HETZNER_BASE_URL}${serviceBase}${endpoint}`;
    console.log(`[${requestId}] Proxying to: ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hetznerToken}`, "X-Request-ID": requestId },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        await logAudit(supabase, {
          request_id: requestId, device_user_id: deviceUserId, service: 'ai-proxy',
          endpoint, method: 'POST', status_code: response.status, duration_ms: durationMs,
          error_message: errorText.slice(0, 500), rate_limit_remaining: rateCheck.remaining,
        });
        return new Response(JSON.stringify({ error: `Hetzner API error: ${response.status}`, details: errorText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      console.log(`[${requestId}] Success in ${durationMs}ms`);
      
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'ai-proxy',
        endpoint, method: 'POST', status_code: 200, duration_ms: durationMs, rate_limit_remaining: rateCheck.remaining,
      });
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-ID": requestId,
          "X-RateLimit-Remaining": rateCheck.remaining.toString() },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const msg = fetchError instanceof Error ? fetchError.message : "Network error";
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'ai-proxy',
        endpoint, method: 'POST', status_code: 502, duration_ms: Date.now() - startTime, error_message: msg,
      });
      return new Response(JSON.stringify({ error: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await logAudit(supabase, {
      request_id: requestId, device_user_id: deviceUserId, service: 'ai-proxy',
      endpoint, method: 'POST', status_code: 500, duration_ms: Date.now() - startTime, error_message: msg,
    });
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
