/**
 * Temporary one-time function to create a partner API key.
 * DELETE THIS AFTER USE.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const internalSecret = req.headers.get('x-internal-secret');
  const expectedSecret = Deno.env.get('INTERNAL_API_SECRET');
  if (!internalSecret || internalSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const coreApiSecret = Deno.env.get('CORE_API_SECRET')!;

  // Generate API key
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const apiKey = `um_${encodeHex(randomBytes)}`;
  const keyPrefix = apiKey.substring(0, 11);

  // HMAC-SHA256 hash
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(coreApiSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(apiKey));
  const keyHash = encodeHex(new Uint8Array(signature));

  // Insert
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('partner_api_keys').insert({
    partner_name: 'Cross-Partner Test B',
    key_prefix: keyPrefix,
    key_hash: keyHash,
    issued_by: 'temp-create-partner',
    rate_limit_tier: 'standard',
  }).select('id, partner_name').single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    partner_id: data.id,
    partner_name: data.partner_name,
    api_key: apiKey,
    key_prefix: keyPrefix,
    warning: 'Store this key securely. Delete temp-create-partner function now.',
  }), { status: 201, headers: { 'Content-Type': 'application/json' } });
});
