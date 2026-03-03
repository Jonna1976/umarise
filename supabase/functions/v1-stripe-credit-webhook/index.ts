/**
 * UMARISE: Stripe Credit Webhook
 * 
 * Handles Stripe Payment Link completions to auto-top-up partner credits.
 * 
 * Stripe Payment Link metadata must include:
 *   - partner_key_prefix: the um_ prefix of the partner's API key
 *   - credits: number of credits to add (e.g. 500, 5000, 50000)
 * 
 * Endpoint: POST /v1-stripe-credit-webhook
 * Auth: Stripe webhook signature verification
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verify Stripe webhook signature using HMAC-SHA256
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const sigPart = parts.find(p => p.startsWith('v1='));
    
    if (!timestampPart || !sigPart) return false;
    
    const timestamp = timestampPart.slice(2);
    const expectedSig = sigPart.slice(3);
    
    // Check timestamp is within 5 minutes
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (age > 300) {
      console.error('[stripe-credit-webhook] Signature too old:', age, 'seconds');
      return false;
    }
    
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedSig === expectedSig;
  } catch (err) {
    console.error('[stripe-credit-webhook] Signature verification error:', err);
    return false;
  }
}

// Bundle map: price lookups
const CREDIT_BUNDLES: Record<string, number> = {
  '500': 500,
  '5000': 5000,
  '50000': 50000,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripeWebhookSecret) {
    console.error('[stripe-credit-webhook] STRIPE_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.text();
  
  const isValid = await verifyStripeSignature(body, signature, stripeWebhookSecret);
  if (!isValid) {
    console.error('[stripe-credit-webhook] Invalid signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const event = JSON.parse(body);

  // Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    console.log('[stripe-credit-webhook] Ignoring event type:', event.type);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const session = event.data.object;
  const metadata = session.metadata || {};
  
  const partnerKeyPrefix = metadata.partner_key_prefix;
  const creditsStr = metadata.credits;

  if (!partnerKeyPrefix || !creditsStr) {
    console.error('[stripe-credit-webhook] Missing metadata:', { partnerKeyPrefix, creditsStr });
    // Return 200 so Stripe doesn't retry — this is a config error
    return new Response(JSON.stringify({ error: 'Missing metadata fields', received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const creditsToAdd = parseInt(creditsStr, 10);
  if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
    console.error('[stripe-credit-webhook] Invalid credits value:', creditsStr);
    return new Response(JSON.stringify({ error: 'Invalid credits value', received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create Supabase service client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    console.error('[stripe-credit-webhook] Missing Supabase credentials');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Look up partner
  const { data: partner, error: lookupError } = await supabase
    .from('partner_api_keys')
    .select('id, partner_name, credit_balance, revoked_at')
    .eq('key_prefix', partnerKeyPrefix)
    .single();

  if (lookupError || !partner) {
    console.error('[stripe-credit-webhook] Partner not found:', partnerKeyPrefix, lookupError);
    return new Response(JSON.stringify({ error: 'Partner not found', received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (partner.revoked_at) {
    console.error('[stripe-credit-webhook] Partner key revoked:', partnerKeyPrefix);
    return new Response(JSON.stringify({ error: 'Partner key revoked', received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Add credits: if current balance is null (unlimited), set to creditsToAdd
  // Otherwise, increment existing balance
  const currentBalance = partner.credit_balance ?? 0;
  const newBalance = currentBalance + creditsToAdd;

  const { error: updateError } = await supabase
    .from('partner_api_keys')
    .update({ credit_balance: newBalance })
    .eq('key_prefix', partnerKeyPrefix);

  if (updateError) {
    console.error('[stripe-credit-webhook] Failed to update credits:', updateError);
    return new Response(JSON.stringify({ error: 'Failed to update credits' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('[stripe-credit-webhook] Credits added:', {
    partner: partner.partner_name,
    prefix: partnerKeyPrefix,
    added: creditsToAdd,
    previous: currentBalance,
    new_balance: newBalance,
    stripe_session: session.id,
  });

  return new Response(JSON.stringify({
    received: true,
    partner: partner.partner_name,
    credits_added: creditsToAdd,
    new_balance: newBalance,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
