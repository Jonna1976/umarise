/**
 * Migrate Legacy Pages from Supabase to Hetzner Vault
 * 
 * This edge function migrates pages that were created before the Hetzner
 * backend switch. It:
 * 1. Fetches pages from Supabase that have supabase.co image URLs
 * 2. Downloads each image
 * 3. Uploads image to Hetzner IPFS via /vault/images/upload
 * 4. Creates page record in Hetzner via /vault/pages with IPFS URL
 * 5. Preserves all metadata
 * 
 * Usage: POST /functions/v1/migrate-legacy-pages
 * Body: { "deviceUserId": "xxx", "dryRun": true }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hetzner vault API - correct endpoint structure for /vault/* routes
const HETZNER_API_URL = 'https://vault.umarise.com/api/codex';

interface LegacyPage {
  id: string;
  device_user_id: string;
  writer_user_id: string;
  image_url: string;
  ocr_text: string | null;
  summary: string | null;
  tone: string | null;
  keywords: string[] | null;
  future_you_cues: string[] | null;
  one_line_hint: string | null;
  topic_labels: string[] | null;
  highlights: string[] | null;
  origin_hash_sha256: string | null;
  created_at: string;
  written_at: string | null;
  capsule_id: string | null;
  page_order: number | null;
  user_note: string | null;
  primary_keyword: string | null;
  sources: string[] | null;
}

interface MigrationResult {
  pageId: string;
  status: 'migrated' | 'skipped' | 'error';
  newPageId?: string;
  newImageUrl?: string;
  error?: string;
}

// Parse arrays that might be stored as JSON strings
function parseArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deviceUserId, dryRun = false } = await req.json();

    if (!deviceUserId || deviceUserId.length < 36) {
      return new Response(
        JSON.stringify({ error: 'Valid deviceUserId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Hetzner API token
    const hetznerToken = Deno.env.get('HETZNER_API_TOKEN');
    if (!hetznerToken) {
      return new Response(
        JSON.stringify({ error: 'HETZNER_API_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all legacy pages (those with supabase.co image URLs)
    const { data: legacyPages, error: fetchError } = await supabase
      .from('pages')
      .select('*')
      .eq('device_user_id', deviceUserId)
      .eq('is_trashed', false)
      .like('image_url', '%supabase.co%');

    if (fetchError) {
      console.error('Failed to fetch legacy pages:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch legacy pages', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!legacyPages || legacyPages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No legacy pages found to migrate',
          count: 0,
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${legacyPages.length} legacy pages to migrate`);

    const results: MigrationResult[] = [];

    for (const page of legacyPages as LegacyPage[]) {
      console.log(`Processing page ${page.id}...`);

      if (dryRun) {
        results.push({
          pageId: page.id,
          status: 'skipped',
          error: 'Dry run - no changes made'
        });
        continue;
      }

      try {
        // Step 1: Download image from Supabase storage
        console.log(`Downloading image from ${page.image_url}`);
        const imageResponse = await fetch(page.image_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Convert to base64 using chunks to avoid call stack issues
        const chunkSize = 8192;
        let binaryString = '';
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64 = btoa(binaryString);
        const mimeType = imageBlob.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        // Step 2: Upload image to Hetzner IPFS via /vault/images
        console.log(`Uploading image to Hetzner IPFS...`);
        const uploadResponse = await fetch(`${HETZNER_API_URL}/vault/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hetznerToken}`,
          },
          body: JSON.stringify({
            imageDataUrl: dataUrl,
            deviceUserId: page.device_user_id,
            encrypt: false,
          }),
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        const imageUrl = uploadResult.imageUrl || uploadResult.url;
        const originHash = uploadResult.originHash;
        console.log(`Image uploaded: ${imageUrl}`);

        // Step 3: Create page in Hetzner with the IPFS image URL
        console.log(`Creating page in Hetzner...`);
        
        const pagePayload = {
          deviceUserId: page.device_user_id,
          writerUserId: page.writer_user_id || page.device_user_id,
          imageUrl: imageUrl,
          ocrText: page.ocr_text || '',
          summary: page.summary || '',
          tone: JSON.stringify(page.tone ? [page.tone] : ['reflective']),
          keywords: JSON.stringify(parseArray(page.keywords)),
          futureYouCues: JSON.stringify(parseArray(page.future_you_cues)),
          oneLineHint: page.one_line_hint || '',
          topicLabels: JSON.stringify(parseArray(page.topic_labels)),
          highlights: JSON.stringify(parseArray(page.highlights)),
          originHashSha256: originHash || page.origin_hash_sha256 || null,
          originHashAlgo: 'sha256',
          capsuleId: page.capsule_id || null,
          pageOrder: page.page_order ?? 0,
          userNote: page.user_note || null,
          primaryKeyword: page.primary_keyword || null,
          sources: JSON.stringify(parseArray(page.sources)),
          ocrTokens: JSON.stringify([]),
          namedEntities: JSON.stringify([]),
          futureYouCuesSource: JSON.stringify({ ai_prefill_version: null, user_edited: false }),
        };

        const createResponse = await fetch(`${HETZNER_API_URL}/vault/pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hetznerToken}`,
          },
          body: JSON.stringify(pagePayload),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Page creation failed: ${createResponse.status} - ${errorText}`);
        }

        const newPage = await createResponse.json();
        console.log(`Page migrated successfully: ${newPage.id}`);

        results.push({
          pageId: page.id,
          status: 'migrated',
          newPageId: newPage.id,
          newImageUrl: imageUrl,
        });

      } catch (error) {
        console.error(`Error migrating page ${page.id}:`, error);
        results.push({
          pageId: page.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Summary
    const migrated = results.filter(r => r.status === 'migrated').length;
    const errors = results.filter(r => r.status === 'error').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration complete: ${migrated} migrated, ${errors} errors, ${skipped} skipped`,
        count: legacyPages.length,
        migrated,
        errors,
        skipped,
        dryRun,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
