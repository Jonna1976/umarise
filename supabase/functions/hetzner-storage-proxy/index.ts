import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-user-id",
};

// Production URL with valid SSL certificate
const HETZNER_BASE_URL = "https://vault.umarise.com";
const TIMEOUT_MS = 60000; // 1 minute for storage operations

// Rate limiting configuration (per device per minute)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMITS: Record<string, number> = {
  '/vault/images/upload': 20,     // Image upload: 20 per minute
  '/vault/images/decrypt': 30,    // Decrypt: 30 per minute
  '/vault/pages': 60,             // Page CRUD: 60 per minute
  '/vault/search': 30,            // Search: 30 per minute
  'default': 40                   // Default: 40 per minute
};

// In-memory rate limit tracking (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(deviceUserId: string, path: string): string {
  // Normalize path for rate limiting (remove IDs)
  const normalizedPath = path.replace(/\/[0-9a-f-]{36}/gi, '/:id');
  return `${deviceUserId}:${normalizedPath}`;
}

function getPathCategory(path: string): string {
  if (path.includes('/images/upload')) return '/vault/images/upload';
  if (path.includes('/images/decrypt')) return '/vault/images/decrypt';
  if (path.includes('/search')) return '/vault/search';
  if (path.includes('/pages')) return '/vault/pages';
  return 'default';
}

function checkRateLimit(deviceUserId: string, path: string): { allowed: boolean; remaining: number; resetAt: number } {
  const category = getPathCategory(path);
  const key = getRateLimitKey(deviceUserId, category);
  const now = Date.now();
  const limit = RATE_LIMITS[category] || RATE_LIMITS['default'];
  
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
  console.log(`[${requestId}] hetzner-storage-proxy called: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Cleanup old rate limit entries occasionally
  if (Math.random() < 0.1) cleanupRateLimitStore();

  try {
    const { method, path, payload, queryParams } = await req.json();

    if (!path) {
      console.log(`[${requestId}] Missing path parameter`);
      return new Response(JSON.stringify({ error: "Missing path parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const methodUpper = (method || "GET").toUpperCase();

    // Extract deviceUserId for rate limiting
    const deviceUserId = payload?.deviceUserId || queryParams?.deviceUserId || req.headers.get('x-device-user-id') || 'anonymous';
    console.log(`[${requestId}] Device: ${deviceUserId.slice(0, 8)}..., ${methodUpper} ${path}`);

    // Check rate limit
    const rateCheck = checkRateLimit(deviceUserId, path);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      console.log(`[${requestId}] Rate limit exceeded for ${deviceUserId.slice(0, 8)}... on ${path}`);
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

    // Map path to HTTPS: /vault/pages -> /api/codex/vault/pages
    let targetUrl = `${HETZNER_BASE_URL}/api/codex${path}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      targetUrl += `?${params.toString()}`;
    }

    console.log(`[${requestId}] Proxying ${methodUpper} to: ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const fetchOptions: RequestInit = {
        method: methodUpper,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hetznerToken}`,
          "X-Request-ID": requestId
        },
        signal: controller.signal,
      };

      // Only add body for non-GET requests
      if (methodUpper !== "GET" && payload) {
        fetchOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] Hetzner Storage error: ${response.status} - ${errorText}`);
        return new Response(JSON.stringify({ error: `Hetzner Storage error: ${response.status}`, details: errorText }), {
          status: response.status,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": rateCheck.remaining.toString()
          },
        });
      }

      const data = await response.json();
      console.log(`[${requestId}] Hetzner Storage response received successfully`);

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
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`[${requestId}] Error: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
