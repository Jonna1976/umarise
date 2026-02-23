# Lovable Briefing — Drie Attestatie Edge Functions
## Laag 3 backend — aanvulling op bestaande Core API

23 februari 2026.

---

## Context

De Core API endpoints staan en werken. Deze drie nieuwe Edge Functions zijn een aanvulling — ze raken niets aan wat al bestaat.

De `attestation_requests` en `attestants` tabellen zijn al aangemaakt in Supabase.

---

## Drie nieuwe Edge Functions — bouw en deploy

---

### Functie 1: `v1-attestation-request`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { origin_id, device_user_id } = await req.json();

    if (!origin_id || !device_user_id) return new Response(
      JSON.stringify({ error: "origin_id and device_user_id required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    const { data: origin, error: originError } = await supabase
      .from("origin_attestations")
      .select("origin_id, status, hash")
      .eq("origin_id", origin_id)
      .single();

    if (originError || !origin) return new Response(
      JSON.stringify({ error: "Origin not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    if (origin.status !== "anchored") return new Response(
      JSON.stringify({ error: "Origin not yet Bitcoin-confirmed. Attestation only available after anchoring." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    const { data: existing } = await supabase
      .from("attestation_requests")
      .select("id, status")
      .eq("origin_id", origin_id)
      .eq("device_user_id", device_user_id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existing) return new Response(
      JSON.stringify({ error: "Attestation already requested", status: existing.status }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

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
      JSON.stringify({ attestation_id: attestation.id, status: "pending", expected_by: expectedBy }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Functie 2: `v1-attestation-confirm`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-attestant-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { attestation_id, signature, attestant_public_key, attestant_certificate } = await req.json();

    if (!attestation_id || !signature || !attestant_public_key) return new Response(
      JSON.stringify({ error: "attestation_id, signature, and attestant_public_key required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    const { data: attestation, error: fetchError } = await supabase
      .from("attestation_requests")
      .select("*")
      .eq("id", attestation_id)
      .single();

    if (fetchError || !attestation) return new Response(
      JSON.stringify({ error: "Attestation not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    if (attestation.status === "confirmed") return new Response(
      JSON.stringify({ error: "Attestation already confirmed — immutable" }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    if (attestation.status !== "pending") return new Response(
      JSON.stringify({ error: "Attestation not in pending status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

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
      JSON.stringify({ status: "confirmed", attestation_id, confirmed_at: confirmed.completed_at }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Functie 3: `v1-attestation-verify`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const attestation_id = pathParts[pathParts.length - 1];

    if (!attestation_id) return new Response(
      JSON.stringify({ error: "attestation_id required in path" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    const { data: attestation, error } = await supabase
      .from("attestation_requests")
      .select("id, origin_id, status, requested_at, completed_at, attestant_name, attestant_public_key, signature, attestant_certificate")
      .eq("id", attestation_id)
      .eq("status", "confirmed")
      .single();

    if (error || !attestation) return new Response(
      JSON.stringify({ error: "Confirmed attestation not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    const { data: origin } = await supabase
      .from("origin_attestations")
      .select("hash, created_at, status")
      .eq("origin_id", attestation.origin_id)
      .single();

    return new Response(
      JSON.stringify({
        attestation_id: attestation.id,
        origin_id: attestation.origin_id,
        hash: origin?.hash ?? null,
        bitcoin_anchored_at: origin?.created_at ?? null,
        attested_by: attestation.attestant_name,
        attested_at: attestation.completed_at,
        requested_at: attestation.requested_at,
        signature: attestation.signature,
        attestant_public_key: attestation.attestant_public_key,
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
```

---

## Wat Lovable moet doen

1. Maak drie nieuwe Edge Functions aan met bovenstaande code
2. Deploy alle drie naar Supabase
3. Raak de bestaande Core API endpoints niet aan

---

## Na deploy — test commando's

```bash
# Test request
curl -X POST https://[project].supabase.co/functions/v1/v1-attestation-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [anon-key]" \
  -d '{"origin_id": "[bestaand-origin-id]", "device_user_id": "[user-id]"}'

# Test verify
curl https://[project].supabase.co/functions/v1/v1-attestation-verify/[attestation-id] \
  -H "Authorization: Bearer [anon-key]"
```

---

*Lovable briefing Laag 3 Edge Functions — 23 februari 2026.*
