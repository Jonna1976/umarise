import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.3.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { origin_id, device_user_id } = await req.json();

    if (!origin_id || !device_user_id) return new Response(
      JSON.stringify({ error: "origin_id and device_user_id required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: origin } = await supabase
      .from("origin_attestations")
      .select("origin_id, hash")
      .eq("origin_id", origin_id)
      .single();

    if (!origin) return new Response(
      JSON.stringify({ error: "Origin not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    // Controleer Bitcoin-bevestiging via core_ots_proofs
    const { data: proof } = await supabase
      .from("core_ots_proofs")
      .select("status")
      .eq("origin_id", origin_id)
      .single();

    if (!proof || proof.status !== "anchored") return new Response(
      JSON.stringify({ error: "Origin not yet Bitcoin-confirmed. Attestation only available after anchoring." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    // Controleer of er al een pending of confirmed attestatie bestaat
    const { data: existingAttestation } = await supabase
      .from("attestation_requests")
      .select("id, status")
      .eq("origin_id", origin_id)
      .eq("device_user_id", device_user_id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existingAttestation) return new Response(
      JSON.stringify({ error: "Attestation already requested or confirmed", status: existingAttestation.status }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    // Maak Stripe Checkout sessie aan
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Attestation",
              description: "A certified third party confirms your anchor. You receive an updated ZIP within 24 hours.",
            },
            unit_amount: 495, // €4,95 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        description: `Attestation for anchor ${origin_id}`,
      },
      success_url: `https://itexisted.app/?attestation=requested&origin_id=${origin_id}`,
      cancel_url: `https://itexisted.app/`,
      metadata: {
        origin_id,
        device_user_id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
