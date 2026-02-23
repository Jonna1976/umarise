import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-attestant-key, x-internal-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify internal secret — only authorized callers can confirm attestations
    const internalSecret = req.headers.get("x-internal-secret");
    const expectedSecret = Deno.env.get("INTERNAL_API_SECRET");

    if (!internalSecret || internalSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { attestation_id, signature, attestant_public_key, attestant_certificate } = await req.json();

    if (!attestation_id || !signature || !attestant_public_key) {
      return new Response(
        JSON.stringify({ error: "attestation_id, signature, and attestant_public_key required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch attestation
    const { data: attestation, error: fetchError } = await supabase
      .from("attestation_requests")
      .select("*")
      .eq("id", attestation_id)
      .single();

    if (fetchError || !attestation) {
      return new Response(
        JSON.stringify({ error: "Attestation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (attestation.status === "confirmed") {
      return new Response(
        JSON.stringify({ error: "Attestation already confirmed — immutable" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (attestation.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Attestation not in pending status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update to confirmed — write-once trigger protects immutability after this
    const { data: confirmed, error: updateError } = await supabase
      .from("attestation_requests")
      .update({
        status: "confirmed",
        completed_at: new Date().toISOString(),
        signature,
        attestant_public_key,
        attestant_certificate: attestant_certificate ?? null,
      })
      .eq("id", attestation_id)
      .eq("status", "pending")
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        status: "confirmed",
        attestation_id,
        confirmed_at: confirmed.completed_at,
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
