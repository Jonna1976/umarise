/**
 * Verify Edge Function Integration Tests
 * 
 * Tests the complete bit-identity verification flow:
 * 1. Fetch original image from vault
 * 2. Convert to base64
 * 3. Call /verify endpoint
 * 4. Confirm hash match
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

// Test origin from the latest capture
const TEST_ORIGIN = {
  origin_id: "0508cdc4-49d0-4de8-8fe4-f528920f7ed0",
  expected_hash: "1f205f1eb69abefd80e166fe191ab6e4ceda4c4f1d246f32f4c7e6fca47f5d7f",
  ipfs_cid: "QmbAeh2uyLMkQjRCqbgb4rhxJvVA8bxAVcxUY1J4R5pGJa",
};

Deno.test("verify endpoint - returns 405 for GET requests", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });
  
  assertEquals(response.status, 405);
  await response.text(); // Consume body
});

Deno.test("verify endpoint - returns 400 for missing origin_id", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ content: "dGVzdA==" }),
  });
  
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Missing required field: origin_id");
});

Deno.test("verify endpoint - returns 400 for missing content", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ origin_id: TEST_ORIGIN.origin_id }),
  });
  
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Missing required field: content (base64 encoded binary)");
});

Deno.test("verify endpoint - returns 404 for unknown origin_id", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      origin_id: "00000000-0000-0000-0000-000000000000",
      content: "dGVzdA==" 
    }),
  });
  
  assertEquals(response.status, 404);
  const data = await response.json();
  assertEquals(data.error, "Origin not found");
});

Deno.test("verify endpoint - FULL BIT-IDENTITY VERIFICATION", async () => {
  // Step 1: Fetch original image from vault via proxy (uses origin_id, not cid)
  console.log("📥 Fetching original image from vault...");
  const imageResponse = await fetch(
    `${SUPABASE_URL}/functions/v1/origin-image-proxy?origin_id=${TEST_ORIGIN.origin_id}`,
    {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
      },
    }
  );
  
  assertEquals(imageResponse.status, 200, `Image proxy should return 200, got ${imageResponse.status}`);
  
  // Step 2: Get raw bytes and convert to base64
  const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
  console.log(`📊 Image size: ${imageBytes.length} bytes`);
  
  const base64Content = encodeBase64(imageBytes);
  console.log(`🔐 Base64 length: ${base64Content.length} chars`);
  
  // Step 3: Call /verify endpoint
  console.log("🔍 Calling /verify endpoint...");
  const verifyResponse = await fetch(`${SUPABASE_URL}/functions/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      origin_id: TEST_ORIGIN.origin_id,
      content: base64Content,
    }),
  });
  
  assertEquals(verifyResponse.status, 200, "Verify should return 200");
  
  const verifyData = await verifyResponse.json();
  console.log("📋 Verify response:", JSON.stringify(verifyData, null, 2));
  
  // Step 4: Validate the response
  assertExists(verifyData.match, "Response should have 'match' field");
  assertExists(verifyData.origin_hash, "Response should have 'origin_hash' field");
  assertExists(verifyData.computed_hash, "Response should have 'computed_hash' field");
  
  // THE CRITICAL ASSERTION: Hashes must match
  assertEquals(verifyData.match, true, "🚨 BIT-IDENTITY MISMATCH: stored hash ≠ computed hash");
  assertEquals(verifyData.computed_hash, TEST_ORIGIN.expected_hash, "Computed hash should match expected");
  assertEquals(verifyData.origin_hash, TEST_ORIGIN.expected_hash, "Origin hash should match expected");
  
  // U-mark validation
  assertEquals(verifyData.origin_mark, "ᵁ", "Verified origin should have U-mark");
  assertExists(verifyData.origin_mark_meaning, "U-mark meaning should be present");
  
  console.log("✅ BIT-IDENTITY VERIFIED: Hash chain intact!");
  console.log(`   Stored:   ${verifyData.origin_hash}`);
  console.log(`   Computed: ${verifyData.computed_hash}`);
  console.log(`   Match:    ${verifyData.match}`);
  console.log(`   U-mark:   ${verifyData.origin_mark}`);
});

Deno.test("verify endpoint - detects tampered content", async () => {
  // Create tampered content (just some random bytes)
  const tamperedContent = encodeBase64(new TextEncoder().encode("tampered image content"));
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      origin_id: TEST_ORIGIN.origin_id,
      content: tamperedContent,
    }),
  });
  
  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertEquals(data.match, false, "Tampered content should NOT match");
  assertEquals(data.origin_mark, null, "Tampered content should NOT have U-mark");
  
  console.log("✅ Tamper detection working: mismatched content correctly rejected");
});
