import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const DEFAULT_BASE_URL = "http://94.130.180.233";
const ALLOWED_HOSTS = new Set(["94.130.180.233"]);

type HealthStatus = {
  status: "healthy" | "error";
  error?: string;
};

function getBaseUrl(body: unknown): string {
  const baseUrl =
    typeof (body as any)?.baseUrl === "string" ? ((body as any).baseUrl as string).trim() : "";

  if (!baseUrl) return DEFAULT_BASE_URL;

  try {
    const u = new URL(baseUrl);
    if ((u.protocol !== "http:" && u.protocol !== "https:") || !ALLOWED_HOSTS.has(u.hostname)) {
      return DEFAULT_BASE_URL;
    }
    // Normalize: protocol + host only
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

async function checkService(url: string): Promise<HealthStatus> {
  try {
    const res = await fetch(url, { method: "GET" });
    if (res.ok) return { status: "healthy" };
    const text = await res.text().catch(() => "");
    return { status: "error", error: `HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}` };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "Network error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const baseUrl = getBaseUrl(body);

    const [vision, codex] = await Promise.all([
      checkService(`${baseUrl}:3341/health`),
      checkService(`${baseUrl}:3342/health`),
    ]);

    return new Response(JSON.stringify({ baseUrl, vision, codex }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
