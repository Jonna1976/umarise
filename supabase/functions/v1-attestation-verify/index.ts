import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Support both path parameter and query parameter
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const attestation_id = url.searchParams.get("id") || pathParts[pathParts.length - 1];

    // Don't use the function name as ID
    if (!attestation_id || attestation_id === "v1-attestation-verify") {
      return new Response(
        JSON.stringify({ error: "attestation_id required (query param ?id= or path)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: attestation, error } = await supabase
      .from("attestation_requests")
      .select("id, origin_id, status, requested_at, completed_at, attestant_name, attestant_public_key, signature, attestant_certificate")
      .eq("id", attestation_id)
      .eq("status", "confirmed")
      .single();

    if (error || !attestation) {
      return new Response(
        JSON.stringify({ error: "Confirmed attestation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch origin data for hash
    const { data: origin } = await supabase
      .from("origin_attestations")
      .select("hash, captured_at")
      .eq("origin_id", attestation.origin_id)
      .single();

    return new Response(
      JSON.stringify({
        attestation_id: attestation.id,
        origin_id: attestation.origin_id,
        hash: origin?.hash ?? null,
        bitcoin_anchored_at: origin?.captured_at ?? null,
        attested_by: attestation.attestant_name,
        attested_at: attestation.completed_at,
        requested_at: attestation.requested_at,
        signature: attestation.signature,
        attestant_public_key: attestation.attestant_public_key,
        attestant_certificate: attestation.attestant_certificate ?? null,
        verification_note: "Verify the signature using attestant_public_key against: attestation_id + origin_id + hash + attested_at",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
