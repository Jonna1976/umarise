import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Production URL with valid SSL certificate
const HETZNER_BASE_URL = "https://vault.umarise.com";
const TIMEOUT_MS = 60000; // 1 minute for storage operations

function normalizePath(path: string) {
  // Treat trailing slashes as equivalent ("/vault/projects/" -> "/vault/projects")
  return path.replace(/\/+$/, "");
}

serve(async (req) => {
  console.log(`hetzner-storage-proxy called: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method, path, payload, queryParams } = await req.json();

    if (!path) {
      return new Response(JSON.stringify({ error: "Missing path parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const methodUpper = (method || "GET").toUpperCase();
    const normalizedPath = normalizePath(path);

    // Map path to HTTPS: /vault/pages -> /api/codex/vault/pages
    let targetUrl = `${HETZNER_BASE_URL}/api/codex${path}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      targetUrl += `?${params.toString()}`;
    }

    console.log(`Proxying ${methodUpper} to: ${targetUrl} (path=${normalizedPath})`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const fetchOptions: RequestInit = {
        method: methodUpper,
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      };

      // Only add body for non-GET requests
      if (methodUpper !== "GET" && payload) {
        fetchOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Some endpoints are optional on the Hetzner backend (e.g. projects).
        // Returning a 404 from the proxy can surface as a hard runtime error in the web client,
        // even though the UI can safely operate with an empty list.
        if (methodUpper === "GET" && response.status === 404 && normalizedPath === "/vault/projects") {
          console.warn("Hetzner Storage: /vault/projects not found. Returning empty list.");
          return new Response(JSON.stringify({ success: true, count: 0, projects: [] }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorText = await response.text();
        console.error(`Hetzner Storage error: ${response.status} - ${errorText}`);
        return new Response(JSON.stringify({ error: `Hetzner Storage error: ${response.status}`, details: errorText }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      console.log("Hetzner Storage response received successfully");

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const msg = fetchError instanceof Error ? fetchError.message : "Network error";
      console.error(`Fetch error: ${msg}`);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`Error: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
