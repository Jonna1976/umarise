/**
 * INTERNAL: Generate Partner API Key
 * 
 * Strictly internal helper for operational use only.
 * NOT exposed to partners. NOT a product feature.
 * 
 * Authentication: Requires X-Internal-Secret header matching CORE_API_SECRET
 * 
 * Request: POST (no body required)
 * 
 * Response:
 *   {
 *     "api_key": "full-key-to-give-to-partner",
 *     "key_prefix": "first8ch",
 *     "key_hash": "hmac-sha256-hash-for-database",
 *     "sql": "INSERT statement ready to execute"
 *   }
 */

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

    // Parse optional partner_name from body
    let partnerName = 'NewPartner';
    try {
      const body = await req.json();
      if (body?.partner_name) {
        partnerName = body.partner_name;
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

    console.log('[internal-generate-partner-key] Generated key for:', partnerName);

    return new Response(
      JSON.stringify({
        api_key: apiKey,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        sql: sql,
        note: 'Give api_key to partner. Execute sql in database. Never log or store api_key.',
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
