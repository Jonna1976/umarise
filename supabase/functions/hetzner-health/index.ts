import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Use HTTPS on port 443
const DEFAULT_BASE_URL = "https://94.130.180.233";
const TIMEOUT_MS = 8000; // 8 second timeout

type HealthStatus = {
  status: "healthy" | "error";
  error?: string;
};

async function checkService(url: string): Promise<HealthStatus> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`Checking: ${url}`);
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      console.log(`✅ ${url} is healthy`);
      return { status: "healthy" };
    }
    const text = await res.text().catch(() => "");
    console.log(`❌ ${url} returned HTTP ${res.status}`);
    return { status: "error", error: `HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}` };
  } catch (e) {
    clearTimeout(timeoutId);
    const msg = e instanceof Error ? e.message : "Network error";
    console.log(`❌ ${url} failed: ${msg}`);
    return { status: "error", error: msg };
  }
}

serve(async (req) => {
  console.log(`hetzner-health called: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const baseUrl = (body as any)?.baseUrl || DEFAULT_BASE_URL;
    
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Checking Vision and Vault via HTTPS...`);

    const [vision, vault] = await Promise.all([
      checkService(`${baseUrl}/api/vision/health`),
      checkService(`${baseUrl}/api/codex/health`),
    ]);

    console.log(`Results - Vision: ${vision.status}, Vault: ${vault.status}`);

    return new Response(JSON.stringify({ baseUrl, vision, vault }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`Error: ${msg}`);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
