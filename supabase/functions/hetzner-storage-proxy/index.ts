import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HETZNER_BASE_URL = "http://94.130.180.233";
const STORAGE_PORT = 3342;
const TIMEOUT_MS = 60000; // 1 minute for storage operations

serve(async (req) => {
  console.log(`hetzner-storage-proxy called: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method, path, payload, queryParams } = await req.json();
    
    if (!path) {
      return new Response(
        JSON.stringify({ error: "Missing path parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build target URL with query params
    let targetUrl = `${HETZNER_BASE_URL}:${STORAGE_PORT}${path}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      targetUrl += `?${params.toString()}`;
    }
    
    console.log(`Proxying ${method || 'GET'} to: ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const fetchOptions: RequestInit = {
        method: method || 'GET',
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      };

      // Only add body for non-GET requests
      if (method && method !== 'GET' && payload) {
        fetchOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Hetzner Storage error: ${response.status} - ${errorText}`);
        return new Response(
          JSON.stringify({ error: `Hetzner Storage error: ${response.status}`, details: errorText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`Error: ${msg}`);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
