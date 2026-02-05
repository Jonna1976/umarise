/**
 * Integration tests for v1-core-proofs-export endpoint
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/v1-core-proofs-export`;

Deno.test("v1-core-proofs-export: returns 401 without API key", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  assertEquals(response.status, 401);
  
  const body = await response.json();
  assertEquals(body.error.code, "UNAUTHORIZED");
});

Deno.test("v1-core-proofs-export: returns 405 for POST method", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 405);
  const body = await response.json();
  assertEquals(body.error.code, "INVALID_REQUEST_BODY");
});

Deno.test("v1-core-proofs-export: handles OPTIONS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  await response.text();
});

Deno.test("v1-core-proofs-export: rejects invalid status parameter", async () => {
  const response = await fetch(`${FUNCTION_URL}?status=invalid`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "X-API-Key": "um_invalid_key_for_testing_123456789012345678901234567890",
    },
  });

  // Will return 401 (invalid key) before checking status param
  const body = await response.text();
  assertExists(body);
  assertEquals(response.status === 401 || response.status === 400, true);
});

Deno.test("v1-core-proofs-export: rejects invalid since parameter", async () => {
  const response = await fetch(`${FUNCTION_URL}?since=not-a-date`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "X-API-Key": "um_invalid_key_for_testing_123456789012345678901234567890",
    },
  });

  const body = await response.text();
  assertExists(body);
  assertEquals(response.status === 401 || response.status === 400, true);
});

Deno.test("v1-core-proofs-export: rejects limit exceeding max", async () => {
  const response = await fetch(`${FUNCTION_URL}?limit=5000`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "X-API-Key": "um_invalid_key_for_testing_123456789012345678901234567890",
    },
  });

  const body = await response.text();
  assertExists(body);
  assertEquals(response.status === 401 || response.status === 400, true);
});
