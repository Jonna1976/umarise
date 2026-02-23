import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.3.0?target=deno";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  // Alleen succesvolle betalingen verwerken
  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.CheckoutSession;
  const sessionId = session.id;

  // Idempotency check: controleer of deze Stripe sessie al verwerkt is
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: processed } = await supabase
    .from("attestation_requests")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (processed) {
    return new Response("Already processed", { status: 200 });
  }

  const { origin_id, device_user_id } = session.metadata!;

  if (!origin_id || !device_user_id) {
    return new Response("Missing metadata", { status: 400 });
  }

  try {
    // Controleer of er al een aanvraag is (idempotent)
    const { data: existing } = await supabase
      .from("attestation_requests")
      .select("id")
      .eq("origin_id", origin_id)
      .eq("device_user_id", device_user_id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existing) {
      return new Response("Already exists", { status: 200 });
    }

    // Haal actieve attestant op
    const { data: attestant } = await supabase
      .from("attestants")
      .select("id, name")
      .eq("active", true)
      .limit(1)
      .single();

    // Maak attestatie-aanvraag aan
    const { error } = await supabase
      .from("attestation_requests")
      .insert({
        origin_id,
        device_user_id,
        status: "pending",
        attestant_name: attestant?.name ?? "Umarise Certified Attestant",
        stripe_session_id: sessionId,
      });

    if (error) throw error;

    return new Response("OK", { status: 200 });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});
