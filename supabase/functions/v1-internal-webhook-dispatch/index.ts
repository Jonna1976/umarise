/**
 * UMARISE CORE v1: Internal Webhook Dispatch
 * 
 * Called by the Hetzner OTS worker after upgrading proofs to "anchored".
 * Looks up the partner webhook URL for each origin and POSTs the event.
 * 
 * Endpoint: POST /v1-internal-webhook-dispatch
 * 
 * Authentication: X-Internal-Secret header
 * 
 * Request Body:
 *   { "origin_ids": ["uuid1", "uuid2", ...] }
 * 
 * For each origin_id:
 *   1. Look up origin_attestation → api_key_prefix
 *   2. Look up partner_api_keys → webhook_url, webhook_secret
 *   3. POST signed payload to webhook_url
 *   4. Log delivery in webhook_delivery_log
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function computeHmac(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return encodeHex(new Uint8Array(sig));
}

interface DispatchResult {
  origin_id: string;
  status: 'delivered' | 'failed' | 'no_webhook' | 'no_partner';
  status_code?: number;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate internal access
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = Deno.env.get('INTERNAL_API_SECRET');

    if (!expectedSecret || !internalSecret || internalSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing X-Internal-Secret' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const originIds: string[] = body.origin_ids;

    if (!Array.isArray(originIds) || originIds.length === 0) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'origin_ids must be a non-empty array' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cap at 500 per call
    if (originIds.length > 500) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_REQUEST_BODY', message: 'Maximum 500 origin_ids per call' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch all origins with their proof data in bulk
    const { data: origins, error: originsError } = await supabase
      .from('origin_attestations')
      .select('origin_id, hash, hash_algo, captured_at, api_key_prefix')
      .in('origin_id', originIds);

    if (originsError) {
      console.error('[webhook-dispatch] Origins lookup error:', originsError);
      return new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to lookup origins' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch proof data for all origins
    const { data: proofs } = await supabase
      .from('core_ots_proofs')
      .select('origin_id, bitcoin_block_height, anchored_at')
      .in('origin_id', originIds)
      .eq('status', 'anchored');

    const proofMap = new Map(
      (proofs || []).map(p => [p.origin_id, p])
    );

    // Get unique partner prefixes
    const prefixes = [...new Set(
      (origins || []).map(o => o.api_key_prefix).filter(Boolean)
    )];

    // Fetch partner webhook configs
    const { data: partners } = await supabase
      .from('partner_api_keys')
      .select('key_prefix, webhook_url, webhook_secret, partner_name')
      .in('key_prefix', prefixes)
      .is('revoked_at', null);

    const partnerMap = new Map(
      (partners || []).map(p => [p.key_prefix, p])
    );

    // Dispatch webhooks
    const results: DispatchResult[] = [];

    for (const origin of (origins || [])) {
      const { origin_id, hash, captured_at, api_key_prefix } = origin;

      if (!api_key_prefix) {
        results.push({ origin_id, status: 'no_partner' });
        continue;
      }

      const partner = partnerMap.get(api_key_prefix);
      if (!partner || !partner.webhook_url) {
        results.push({ origin_id, status: 'no_webhook' });
        continue;
      }

      const proof = proofMap.get(origin_id);

      const payload = {
        event: 'proof.anchored',
        origin_id,
        hash,
        captured_at,
        bitcoin_block_height: proof?.bitcoin_block_height ?? null,
        anchored_at: proof?.anchored_at ?? null,
        proof_url: `https://core.umarise.com/v1-core-proof?origin_id=${origin_id}`,
        timestamp: new Date().toISOString(),
      };

      const payloadStr = JSON.stringify(payload);

      // Compute HMAC signature
      const signature = partner.webhook_secret
        ? await computeHmac(payloadStr, partner.webhook_secret)
        : null;

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Umarise-Webhook/1.0',
          'X-Umarise-Event': 'proof.anchored',
        };
        if (signature) {
          headers['X-Umarise-Signature'] = `sha256=${signature}`;
        }

        const response = await fetch(partner.webhook_url, {
          method: 'POST',
          headers,
          body: payloadStr,
          signal: AbortSignal.timeout(10_000), // 10s timeout
        });

        const statusCode = response.status;
        // Consume body to prevent resource leak
        await response.text();

        const delivered = statusCode >= 200 && statusCode < 300;

        // Log delivery
        await supabase.from('webhook_delivery_log').insert({
          origin_id,
          partner_key_prefix: api_key_prefix,
          webhook_url: partner.webhook_url,
          status_code: statusCode,
          delivered_at: delivered ? new Date().toISOString() : null,
          error_message: delivered ? null : `HTTP ${statusCode}`,
        });

        results.push({
          origin_id,
          status: delivered ? 'delivered' : 'failed',
          status_code: statusCode,
        });

        console.log(`[webhook-dispatch] ${delivered ? '✓' : '✗'} ${origin_id} → ${partner.partner_name} (${statusCode})`);

      } catch (fetchError) {
        const errMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);

        await supabase.from('webhook_delivery_log').insert({
          origin_id,
          partner_key_prefix: api_key_prefix,
          webhook_url: partner.webhook_url,
          error_message: errMsg,
        });

        results.push({
          origin_id,
          status: 'failed',
          error: errMsg,
        });

        console.error(`[webhook-dispatch] ✗ ${origin_id} → ${partner.partner_name}: ${errMsg}`);
      }
    }

    const delivered = results.filter(r => r.status === 'delivered').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const noWebhook = results.filter(r => r.status === 'no_webhook').length;

    console.log(`[webhook-dispatch] Done: ${delivered} delivered, ${failed} failed, ${noWebhook} no webhook`);

    return new Response(
      JSON.stringify({
        dispatched: results.length,
        delivered,
        failed,
        no_webhook: noWebhook,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
    );

  } catch (error) {
    console.error('[webhook-dispatch] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
