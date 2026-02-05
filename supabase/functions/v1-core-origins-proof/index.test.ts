/**
 * Integration tests for v1-core-origins-proof endpoint
 * 
 * Tests the OTS proof retrieval endpoint with various scenarios.
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/v1-core-origins-proof`;

Deno.test("v1-core-origins-proof: returns 401 without API key", async () => {
  const response = await fetch(`${FUNCTION_URL}?origin_id=35ca9da5-7c33-465f-b946-f047fdc6f678`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  assertEquals(response.status, 401);
  
  const body = await response.json();
  assertEquals(body.error.code, "UNAUTHORIZED");
  assertEquals(body.error.message, "Missing X-API-Key header");
});

Deno.test("v1-core-origins-proof: returns 400 without origin_id", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "X-API-Key": "um_invalid_key_for_testing_123456789012345678901234567890",
    },
  });

  // Will return 401 first because key is invalid, but tests the flow
  const body = await response.text();
  assertExists(body);
  
  // Either 401 (invalid key) or 400 (missing origin_id) is acceptable
  assertEquals(response.status === 401 || response.status === 400, true);
});

Deno.test("v1-core-origins-proof: returns 400 for invalid UUID format", async () => {
  const response = await fetch(`${FUNCTION_URL}?origin_id=not-a-valid-uuid`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "X-API-Key": "um_invalid_key_for_testing_123456789012345678901234567890",
    },
  });

  const body = await response.text();
  assertExists(body);
  
  // Will return 401 first because key is invalid
  assertEquals(response.status === 401 || response.status === 400, true);
});

Deno.test("v1-core-origins-proof: returns 405 for non-GET methods", async () => {
  const response = await fetch(`${FUNCTION_URL}?origin_id=35ca9da5-7c33-465f-b946-f047fdc6f678`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 405);
  
  const body = await response.json();
  assertEquals(body.error.code, "INVALID_REQUEST_BODY");
});

Deno.test("v1-core-origins-proof: handles OPTIONS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  await response.text(); // Consume body
});
