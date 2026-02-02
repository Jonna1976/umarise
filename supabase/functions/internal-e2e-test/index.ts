/**
 * INTERNAL: End-to-End Test for Core Infrastructure
 * 
 * Tests the complete partner flow:
 * 1. Generate partner API key
 * 2. Register in database
 * 3. Create attestation via /core-origins
 * 4. Resolve attestation via /core-resolve
 * 5. Verify attestation via /core-verify
 * 
 * Authentication: Requires X-Internal-Secret header matching CORE_API_SECRET
 * 
 * Request: POST { "test_partner_name": "TestPartner" }
 * 
 * Response: Full test results with pass/fail status
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Generate cryptographically secure random key (48 chars)
function generateSecureKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Compute HMAC-SHA256 of the API key
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

// Generate a test SHA-256 hash
async function generateTestHash(): Promise<string> {
  const testData = `e2e-test-${Date.now()}-${Math.random()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(testData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface TestResult {
  step: string;
  passed: boolean;
  details: string;
  data?: unknown;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const results: TestResult[] = [];
  let allPassed = true;

  try {
    // Validate internal access
    const internalSecret = req.headers.get('x-internal-secret');
    const coreApiSecret = Deno.env.get('CORE_API_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!coreApiSecret || !supabaseUrl || !supabaseKey) {
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

    // Parse test partner name
    let testPartnerName = 'E2E_TestPartner';
    try {
      const body = await req.json();
      if (body?.test_partner_name) {
        testPartnerName = body.test_partner_name;
      }
    } catch {
      // Default name is fine
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // === STEP 1: Generate Partner API Key ===
    console.log('[e2e-test] Step 1: Generate partner API key');
    const apiKey = generateSecureKey();
    const keyPrefix = apiKey.substring(0, 8);
    const keyHash = await computeKeyHash(apiKey, coreApiSecret);

    results.push({
      step: '1. Generate API Key',
      passed: true,
      details: `Generated 48-char key with prefix: ${keyPrefix}`,
      data: { key_prefix: keyPrefix, key_length: apiKey.length }
    });

    // === STEP 2: Register in Database ===
    console.log('[e2e-test] Step 2: Register key in database');
    const { error: insertError } = await supabase
      .from('partner_api_keys')
      .insert({
        partner_name: testPartnerName,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        issued_by: 'e2e-test@umarise.internal',
      });

    if (insertError) {
      results.push({
        step: '2. Register Key',
        passed: false,
        details: `Failed: ${insertError.message}`,
      });
      allPassed = false;
    } else {
      results.push({
        step: '2. Register Key',
        passed: true,
        details: `Registered ${testPartnerName} in partner_api_keys`,
      });
    }

    // === STEP 3: Create Attestation via /core-origins ===
    console.log('[e2e-test] Step 3: Create attestation');
    const testHash = await generateTestHash();
    
    const originsResponse = await fetch(`${supabaseUrl}/functions/v1/core-origins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ hash: testHash }),
    });

    const originsData = await originsResponse.json();

    if (originsResponse.status === 201 && originsData.origin_id) {
      results.push({
        step: '3. Create Attestation (POST /core-origins)',
        passed: true,
        details: `Created origin_id: ${originsData.origin_id}`,
        data: { origin_id: originsData.origin_id, hash: originsData.hash }
      });
    } else {
      results.push({
        step: '3. Create Attestation (POST /core-origins)',
        passed: false,
        details: `Failed with status ${originsResponse.status}: ${JSON.stringify(originsData)}`,
      });
      allPassed = false;
    }

    // === STEP 4: Resolve Attestation ===
    console.log('[e2e-test] Step 4: Resolve attestation');
    if (originsData.origin_id) {
      const resolveResponse = await fetch(
        `${supabaseUrl}/functions/v1/core-resolve?origin_id=${originsData.origin_id}`,
        { method: 'GET' }
      );

      const resolveData = await resolveResponse.json();

      if (resolveResponse.ok && resolveData.found && resolveData.origin) {
        results.push({
          step: '4. Resolve Attestation (GET /core-resolve)',
          passed: true,
          details: `Resolved origin with captured_at: ${resolveData.origin.captured_at}`,
          data: resolveData.origin
        });
      } else {
        results.push({
          step: '4. Resolve Attestation (GET /core-resolve)',
          passed: false,
          details: `Failed: ${JSON.stringify(resolveData)}`,
        });
        allPassed = false;
      }
    } else {
      results.push({
        step: '4. Resolve Attestation (GET /core-resolve)',
        passed: false,
        details: 'Skipped - no origin_id from step 3',
      });
      allPassed = false;
    }

    // === STEP 5: Verify Attestation ===
    console.log('[e2e-test] Step 5: Verify attestation');
    if (originsData.origin_id) {
      // Note: core-verify only accepts hash, not origin_id (by design)
      const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/core-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: `sha256:${testHash}` }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.match === true) {
        results.push({
          step: '5. Verify Attestation (POST /core-verify)',
          passed: true,
          details: 'Hash verification returned match: true',
          data: verifyData
        });
      } else {
        results.push({
          step: '5. Verify Attestation (POST /core-verify)',
          passed: false,
          details: `Failed: ${JSON.stringify(verifyData)}`,
        });
        allPassed = false;
      }
    } else {
      results.push({
        step: '5. Verify Attestation (POST /core-verify)',
        passed: false,
        details: 'Skipped - no origin_id from step 3',
      });
      allPassed = false;
    }

    // === CLEANUP: Revoke test key ===
    console.log('[e2e-test] Cleanup: Revoke test key');
    const { error: revokeError } = await supabase
      .from('partner_api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('key_prefix', keyPrefix);

    if (revokeError) {
      results.push({
        step: 'Cleanup: Revoke Test Key',
        passed: false,
        details: `Failed to revoke: ${revokeError.message}`,
      });
    } else {
      results.push({
        step: 'Cleanup: Revoke Test Key',
        passed: true,
        details: `Test key ${keyPrefix} revoked`,
      });
    }

    // === SUMMARY ===
    const summary = {
      test_partner: testPartnerName,
      all_passed: allPassed,
      total_steps: results.length,
      passed_steps: results.filter(r => r.passed).length,
      failed_steps: results.filter(r => !r.passed).length,
      results: results,
    };

    console.log('[e2e-test] Complete:', allPassed ? 'ALL PASSED' : 'SOME FAILED');

    return new Response(
      JSON.stringify(summary, null, 2),
      { 
        status: allPassed ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[e2e-test] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        results: results,
        exception: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
