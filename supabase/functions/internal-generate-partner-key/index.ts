/**
 * INTERNAL: Generate Partner API Key
 * 
 * Strictly internal helper for operational use only.
 * NOT exposed to partners. NOT a product feature.
 * 
 * Authentication: Requires X-Internal-Secret header matching CORE_API_SECRET
 * 
 * Request: POST { "partner_name": "PartnerName", "auto_register": true }
 * 
 * Response:
 *   {
 *     "api_key": "full-key-to-give-to-partner",
 *     "key_prefix": "first8ch",
 *     "key_hash": "hmac-sha256-hash-for-database",
 *     "registered": true/false,
 *     "sql": "INSERT statement (if not auto_register)"
 *   }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Generate cryptographically secure random key (48 chars: prefix + 40 random)
function generateSecureKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Compute HMAC-SHA256 of the API key using CORE_API_SECRET
async function computeKeyHash(apiKey: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(apiKey);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate internal access via CORE_API_SECRET
    const internalSecret = req.headers.get('x-internal-secret');
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!coreApiSecret) {
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!internalSecret || internalSecret !== coreApiSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let partnerName = 'NewPartner';
    let autoRegister = false;
    try {
      const body = await req.json();
      if (body?.partner_name) {
        partnerName = body.partner_name;
      }
      if (body?.auto_register === true) {
        autoRegister = true;
      }
    } catch {
      // No body or invalid JSON is fine
    }

    // Generate key
    const apiKey = generateSecureKey();
    const keyPrefix = apiKey.substring(0, 8);
    const keyHash = await computeKeyHash(apiKey, coreApiSecret);

    // Generate ready-to-use SQL
    const sql = `INSERT INTO partner_api_keys (partner_name, key_prefix, key_hash, issued_by)
VALUES ('${partnerName}', '${keyPrefix}', '${keyHash}', 'partners@umarise.com');`;

    let registered = false;

    // Auto-register if requested and Supabase credentials are available
    if (autoRegister && supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: insertError } = await supabase
        .from('partner_api_keys')
        .insert({
          partner_name: partnerName,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          issued_by: 'partners@umarise.com',
        });

      if (insertError) {
        console.error('[internal-generate-partner-key] DB insert error:', insertError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to register key in database',
            details: insertError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      registered = true;
      console.log('[internal-generate-partner-key] Auto-registered key for:', partnerName);
    } else {
      console.log('[internal-generate-partner-key] Generated key for:', partnerName, '(not auto-registered)');
    }

    return new Response(
      JSON.stringify({
        api_key: apiKey,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        registered: registered,
        sql: registered ? null : sql,
        note: registered 
          ? 'Key registered in database. Give api_key to partner. Never log or store api_key.'
          : 'Execute sql in database, then give api_key to partner. Never log or store api_key.',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[internal-generate-partner-key] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});