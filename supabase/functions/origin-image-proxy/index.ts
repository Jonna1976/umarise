/**
 * Origin Image Proxy
 * 
 * Public endpoint that proxies origin images from the Hetzner Privacy Vault.
 * This allows the public /origin/:id view to display images without exposing
 * the Hetzner API token to the client.
 * 
 * Usage: GET /origin-image-proxy?origin_id={uuid}
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const originId = url.searchParams.get('origin_id');

    if (!originId) {
      return new Response(JSON.stringify({ error: 'origin_id parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the image URL from page_origin_hashes
    const { data: originData, error: originError } = await supabase
      .from('page_origin_hashes')
      .select('image_url, page_id')
      .eq('id', originId)
      .single();

    if (originError || !originData) {
      return new Response(JSON.stringify({ error: 'Origin not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageUrl = originData.image_url;

    // Check if it's an IPFS URL - redirect to public gateway
    if (imageUrl.startsWith('ipfs://')) {
      const cid = imageUrl.replace('ipfs://', '');
      // Use public IPFS gateway (same as VaultImage component)
      const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
      
      console.log(`Redirecting to public IPFS gateway: ${gatewayUrl}`);
      
      // 302 redirect to the public gateway - more efficient than proxying
      return Response.redirect(gatewayUrl, 302);
    }

    // For non-IPFS URLs, redirect directly
    return Response.redirect(imageUrl, 302);

  } catch (error) {
    console.error('Origin image proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
