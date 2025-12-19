import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-user-id',
};

// Production URL with valid SSL certificate
const HETZNER_BASE_URL = "https://vault.umarise.com";
const TIMEOUT_MS = 120000; // 2 minutes for AI processing

// Rate limiting configuration (per device per minute)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMITS: Record<string, number> = {
  '/ai/analyze-page': 10,      // OCR/analysis: 10 per minute
  '/ai/generate-embeddings': 20, // Embeddings: 20 per minute
  '/ai/search': 30,            // Search: 30 per minute
  'default': 15                // Default: 15 per minute
};

// In-memory rate limit tracking (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(deviceUserId: string, endpoint: string): string {
  return `${deviceUserId}:${endpoint}`;
}

function checkRateLimit(deviceUserId: string, endpoint: string): { allowed: boolean; remaining: number; resetAt: number } {
  const key = getRateLimitKey(deviceUserId, endpoint);
  const now = Date.now();
  const limit = RATE_LIMITS[endpoint] || RATE_LIMITS['default'];
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || now >= existing.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  
  existing.count++;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

// Cleanup old entries periodically (prevent memory leak)
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] hetzner-ai-proxy called: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Cleanup old rate limit entries occasionally
  if (Math.random() < 0.1) cleanupRateLimitStore();

  try {
    const { endpoint, payload } = await req.json();
    
    if (!endpoint) {
      console.log(`[${requestId}] Missing endpoint parameter`);
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract deviceUserId for rate limiting
    const deviceUserId = payload?.deviceUserId || req.headers.get('x-device-user-id') || 'anonymous';
    console.log(`[${requestId}] Device: ${deviceUserId.slice(0, 8)}..., Endpoint: ${endpoint}`);

    // Check rate limit
    const rateCheck = checkRateLimit(deviceUserId, endpoint);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      console.log(`[${requestId}] Rate limit exceeded for ${deviceUserId.slice(0, 8)}... on ${endpoint}`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          retryAfterSeconds: retryAfter,
          message: `Too many requests. Please try again in ${retryAfter} seconds.`
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateCheck.resetAt.toString()
          } 
        }
      );
    }

    // Get Hetzner API token for authentication
    const hetznerToken = Deno.env.get('HETZNER_API_TOKEN');
    if (!hetznerToken) {
      console.error(`[${requestId}] HETZNER_API_TOKEN not configured`);
      return new Response(
        JSON.stringify({ error: "Backend not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map endpoint to HTTPS path: /ai/analyze-page -> /api/vision/ai/analyze-page
    const targetUrl = `${HETZNER_BASE_URL}/api/vision${endpoint}`;
    console.log(`[${requestId}] Proxying to: ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hetznerToken}`,
          "X-Request-ID": requestId
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] Hetzner API error: ${response.status} - ${errorText}`);
        return new Response(
          JSON.stringify({ error: `Hetzner API error: ${response.status}`, details: errorText }),
          { 
            status: response.status, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "X-RateLimit-Remaining": rateCheck.remaining.toString()
            } 
          }
        );
      }

      const data = await response.json();
      console.log(`[${requestId}] Hetzner AI response received successfully`);
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
          "X-RateLimit-Reset": rateCheck.resetAt.toString()
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const msg = fetchError instanceof Error ? fetchError.message : "Network error";
      console.error(`[${requestId}] Fetch error: ${msg}`);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`[${requestId}] Error: ${msg}`);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
