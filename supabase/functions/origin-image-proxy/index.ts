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
import { getCompanionCorsHeaders, companionPreflightResponse } from '../_shared/companionCors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getCompanionCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return companionPreflightResponse(req);
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

    // Look up the image URL from page_origin_hashes.
    // IMPORTANT: the public /origin/:id route currently uses a page_id.
    // So we support both:
    // - origin_id = page_origin_hashes.id
    // - origin_id = page_origin_hashes.page_id (fallback)
    let originData: { image_url: string; page_id: string } | null = null;

    const byOriginId = await supabase
      .from('page_origin_hashes')
      .select('image_url, page_id')
      .eq('id', originId)
      .maybeSingle();

    if (byOriginId.data) {
      originData = byOriginId.data;
    } else {
      const byPageId = await supabase
        .from('page_origin_hashes')
        .select('image_url, page_id')
        .eq('page_id', originId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      originData = byPageId.data;
    }

    if (!originData) {
      return new Response(JSON.stringify({ error: 'Origin not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageUrl = originData.image_url;

    // If it's IPFS, proxy the bytes via the Hetzner gateway with server-side auth
    // so public browsers can view the origin image without exposing the token.
    if (imageUrl.startsWith('ipfs://') || imageUrl.includes('/ipfs/')) {
      const hetznerApiUrl = Deno.env.get('HETZNER_API_URL') || 'https://vault.umarise.com';
      const hetznerToken = Deno.env.get('HETZNER_API_TOKEN');

      if (!hetznerToken) {
        console.error('HETZNER_API_TOKEN not configured');
        return new Response(JSON.stringify({ error: 'Storage not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const gatewayUrl = imageUrl.startsWith('ipfs://')
        ? `${hetznerApiUrl}/ipfs/${imageUrl.replace('ipfs://', '')}`
        : imageUrl;

      console.log(`Proxying image from: ${gatewayUrl}`);

      const imageResponse = await fetch(gatewayUrl, {
        headers: {
          'Authorization': `Bearer ${hetznerToken}`,
        },
      });

      if (!imageResponse.ok) {
        console.error(`Hetzner fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
        return new Response(JSON.stringify({ error: 'Failed to fetch image from vault' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const imageData = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';

      return new Response(imageData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
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
