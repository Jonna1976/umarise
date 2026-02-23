import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
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

    const { origin_id, device_user_id } = await req.json();

    if (!origin_id || !device_user_id) {
      return new Response(
        JSON.stringify({ error: "origin_id and device_user_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify origin exists and check for OTS proof status
    const { data: origin, error: originError } = await supabase
      .from("origin_attestations")
      .select("origin_id, hash")
      .eq("origin_id", origin_id)
      .single();

    if (originError || !origin) {
      return new Response(
        JSON.stringify({ error: "Origin not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTS proof is anchored (Bitcoin-confirmed)
    const { data: proof } = await supabase
      .from("core_ots_proofs")
      .select("status")
      .eq("origin_id", origin_id)
      .single();

    if (!proof || proof.status !== "anchored") {
      return new Response(
        JSON.stringify({ error: "Origin not yet Bitcoin-confirmed. Attestation only available after anchoring." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing request
    const { data: existing } = await supabase
      .from("attestation_requests")
      .select("id, status")
      .eq("origin_id", origin_id)
      .eq("device_user_id", device_user_id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Attestation already requested", status: existing.status }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find active attestant
    const { data: attestant } = await supabase
      .from("attestants")
      .select("id, name")
      .eq("active", true)
      .limit(1)
      .single();

    const expectedBy = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: attestation, error: insertError } = await supabase
      .from("attestation_requests")
      .insert({
        origin_id,
        device_user_id,
        status: "pending",
        attestant_name: attestant?.name ?? "Umarise Certified Attestant",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        attestation_id: attestation.id,
        status: "pending",
        expected_by: expectedBy,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
