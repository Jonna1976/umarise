import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-user-id",
};

const HETZNER_BASE_URL = "https://vault.umarise.com";
const TIMEOUT_MS = 60000;

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMITS: Record<string, number> = {
  '/vault/images/upload': 20,
  '/vault/images/decrypt': 30,
  '/vault/pages': 60,
  '/vault/search': 30,
  'default': 40
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getPathCategory(path: string): string {
  if (path.includes('/images/upload')) return '/vault/images/upload';
  if (path.includes('/images/decrypt')) return '/vault/images/decrypt';
  if (path.includes('/search')) return '/vault/search';
  if (path.includes('/pages')) return '/vault/pages';
  return 'default';
}

function checkRateLimit(deviceUserId: string, path: string): { allowed: boolean; remaining: number; resetAt: number } {
  const category = getPathCategory(path);
  const key = `${deviceUserId}:${category}`;
  const now = Date.now();
  const limit = RATE_LIMITS[category] || RATE_LIMITS['default'];
  const existing = rateLimitStore.get(key);
  
  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  
  existing.count++;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetAt) rateLimitStore.delete(key);
  }
}

// deno-lint-ignore no-explicit-any
async function logAudit(supabase: any, log: Record<string, unknown>) {
  try {
    await supabase.from('audit_logs').insert(log);
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

interface PageData {
  id?: string;
  pageId?: string;
  capsuleId?: string | null;
  pageOrder?: number;
  futureYouCues?: string[];
  future_you_cues?: string[];
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * Infer capsule groups for pages missing capsuleId.
 * Groups pages with identical futureYouCues created within 2 minutes.
 */
function inferCapsuleGroups(pages: PageData[]): PageData[] {
  const TWO_MINUTES_MS = 2 * 60 * 1000;
  
  // Helper to get createdAt as timestamp
  const getTimestamp = (p: PageData): number => {
    const dateStr = p.createdAt || p.created_at;
    return dateStr ? new Date(dateStr).getTime() : 0;
  };
  
  // Helper to get cues array (handles both array and JSON string formats)
  const getCues = (p: PageData): string[] => {
    const raw = p.futureYouCues || p.future_you_cues;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    // Parse JSON string if needed
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  
  // Sort by createdAt ascending
  const sorted = [...pages].sort((a, b) => getTimestamp(a) - getTimestamp(b));
  
  // Group candidates: same cues, within 2 minutes
  const capsuleMap = new Map<string, { capsuleId: string; pages: PageData[] }>();
  
  for (const page of sorted) {
    // Skip if already has a capsuleId from backend
    if (page.capsuleId) continue;
    
    const cues = getCues(page);
    // Skip pages without cues - can't group them
    if (cues.length === 0) continue;
    
    // Create a fingerprint from sorted cues
    const cueFingerprint = [...cues].sort().join('|').toLowerCase();
    const pageTime = getTimestamp(page);
    
    // Check if there's an existing group with matching cues and close timestamp
    let foundGroup = false;
    for (const [key, group] of capsuleMap) {
      if (!key.startsWith(cueFingerprint + ':')) continue;
      
      // Check if last page in group is within 2 minutes
      const lastInGroup = group.pages[group.pages.length - 1];
      const timeDiff = Math.abs(pageTime - getTimestamp(lastInGroup));
      
      if (timeDiff <= TWO_MINUTES_MS) {
        // Add to this group
        page.capsuleId = group.capsuleId;
        page.pageOrder = group.pages.length;
        group.pages.push(page);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      // Start a new potential group
      const pageId = page.id || page.pageId || crypto.randomUUID().slice(0, 8);
      const groupKey = `${cueFingerprint}:${pageTime}`;
      capsuleMap.set(groupKey, {
        capsuleId: `inferred-${pageId.toString().slice(0, 8)}`,
        pages: [page],
      });
    }
  }
  
  // Apply capsule IDs only to groups with 2+ pages
  for (const group of capsuleMap.values()) {
    if (group.pages.length >= 2) {
      group.pages.forEach((p, idx) => {
        p.capsuleId = group.capsuleId;
        p.pageOrder = idx;
      });
      console.log(`[storage-proxy] Inferred capsule ${group.capsuleId} with ${group.pages.length} pages`);
    } else {
      // Single page - clear any temporary assignment
      group.pages[0].capsuleId = null;
      group.pages[0].pageOrder = 0;
    }
  }
  
  return pages;
}

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  console.log(`[${requestId}] hetzner-storage-proxy called: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  if (Math.random() < 0.1) cleanupRateLimitStore();

  let deviceUserId = 'anonymous';
  let path = 'unknown';
  let methodUpper = 'GET';

  try {
    const { method, path: reqPath, payload, queryParams } = await req.json();
    path = reqPath || 'unknown';
    methodUpper = (method || "GET").toUpperCase();

    if (!reqPath) {
      await logAudit(supabase, {
        request_id: requestId, device_user_id: 'anonymous', service: 'storage-proxy',
        endpoint: 'unknown', method: methodUpper, status_code: 400,
        duration_ms: Date.now() - startTime, error_message: 'Missing path parameter',
      });
      return new Response(JSON.stringify({ error: "Missing path parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    deviceUserId = payload?.deviceUserId || queryParams?.deviceUserId || req.headers.get('x-device-user-id') || 'anonymous';
    console.log(`[${requestId}] Device: ${deviceUserId.slice(0, 8)}..., ${methodUpper} ${path}`);

    const rateCheck = checkRateLimit(deviceUserId, path);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'storage-proxy',
        endpoint: path, method: methodUpper, status_code: 429, duration_ms: Date.now() - startTime,
        error_message: 'Rate limit exceeded', rate_limited: true, rate_limit_remaining: 0,
      });
      return new Response(JSON.stringify({ error: "Rate limit exceeded", retryAfterSeconds: retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": retryAfter.toString() } });
    }

    const hetznerToken = Deno.env.get('HETZNER_API_TOKEN');
    if (!hetznerToken) {
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'storage-proxy',
        endpoint: path, method: methodUpper, status_code: 500, duration_ms: Date.now() - startTime,
        error_message: 'HETZNER_API_TOKEN not configured', rate_limit_remaining: rateCheck.remaining,
      });
      return new Response(JSON.stringify({ error: "Backend not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let targetUrl = `${HETZNER_BASE_URL}/api/codex${path}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      targetUrl += `?${new URLSearchParams(queryParams).toString()}`;
    }
    console.log(`[${requestId}] Proxying ${methodUpper} to: ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const fetchOptions: RequestInit = {
        method: methodUpper,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hetznerToken}`, "X-Request-ID": requestId },
        signal: controller.signal,
      };
      if (methodUpper !== "GET" && payload) {
        fetchOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        await logAudit(supabase, {
          request_id: requestId, device_user_id: deviceUserId, service: 'storage-proxy',
          endpoint: path, method: methodUpper, status_code: response.status, duration_ms: durationMs,
          error_message: errorText.slice(0, 500), rate_limit_remaining: rateCheck.remaining,
        });
        return new Response(JSON.stringify({ error: `Hetzner Storage error: ${response.status}`, details: errorText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let data = await response.json();
      
      // Apply capsule inference for GET /vault/pages responses
      if (methodUpper === 'GET' && path === '/vault/pages' && data.pages && Array.isArray(data.pages)) {
        console.log(`[${requestId}] Applying capsule inference to ${data.pages.length} pages`);
        data = { ...data, pages: inferCapsuleGroups(data.pages) };
      }
      
      console.log(`[${requestId}] Success in ${durationMs}ms`);

      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'storage-proxy',
        endpoint: path, method: methodUpper, status_code: 200, duration_ms: durationMs, rate_limit_remaining: rateCheck.remaining,
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-ID": requestId,
          "X-RateLimit-Remaining": rateCheck.remaining.toString() },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const msg = fetchError instanceof Error ? fetchError.message : "Network error";
      await logAudit(supabase, {
        request_id: requestId, device_user_id: deviceUserId, service: 'storage-proxy',
        endpoint: path, method: methodUpper, status_code: 502, duration_ms: Date.now() - startTime, error_message: msg,
      });
      return new Response(JSON.stringify({ error: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await logAudit(supabase, {
      request_id: requestId, device_user_id: deviceUserId, service: 'storage-proxy',
      endpoint: path, method: methodUpper, status_code: 500, duration_ms: Date.now() - startTime, error_message: msg,
    });
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
