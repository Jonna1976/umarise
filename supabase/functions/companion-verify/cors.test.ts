/**
 * CORS Lock Validation Tests for companion-verify
 * 
 * Verifies that:
 * 1. Allowed origins get their own origin reflected back
 * 2. Unknown origins get the default (anchoring.app) — NOT '*'
 * 3. Vary: Origin header is always present
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/companion-verify`;

const TEST_BODY = JSON.stringify({
  origin_id: "00000000-0000-0000-0000-000000000000",
  content: "dGVzdA==",
});

Deno.test("CORS: allowed origin (anchoring.app) is reflected", async () => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Origin": "https://anchoring.app",
    },
    body: TEST_BODY,
  });

  assertEquals(
    res.headers.get("access-control-allow-origin"),
    "https://anchoring.app",
    "Should reflect anchoring.app"
  );
  const vary = res.headers.get("vary") || "";
  assertEquals(
    vary.includes("Origin"),
    true,
    "Vary header must include Origin"
  );
  await res.text();
});

Deno.test("CORS: allowed origin (umarise.com) is reflected", async () => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Origin": "https://umarise.com",
    },
    body: TEST_BODY,
  });

  assertEquals(
    res.headers.get("access-control-allow-origin"),
    "https://umarise.com",
    "Should reflect umarise.com"
  );
  await res.text();
});

Deno.test("CORS: lovable.app preview domain is allowed", async () => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Origin": "https://some-preview.lovable.app",
    },
    body: TEST_BODY,
  });

  assertEquals(
    res.headers.get("access-control-allow-origin"),
    "https://some-preview.lovable.app",
    "Should reflect *.lovable.app preview domains"
  );
  await res.text();
});

Deno.test("CORS: unknown origin gets default, NOT wildcard", async () => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Origin": "https://evil-site.com",
    },
    body: TEST_BODY,
  });

  const acao = res.headers.get("access-control-allow-origin");
  
  // Must NOT be wildcard
  if (acao === "*") {
    throw new Error("CORS VULNERABILITY: wildcard '*' returned for unknown origin!");
  }
  
  // Should fallback to default allowed origin
  assertEquals(acao, "https://anchoring.app", "Unknown origin should get default (anchoring.app)");
  await res.text();
});

Deno.test("CORS: no origin header gets default", async () => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: TEST_BODY,
  });

  const acao = res.headers.get("access-control-allow-origin");
  
  if (acao === "*") {
    throw new Error("CORS VULNERABILITY: wildcard '*' returned when no Origin sent!");
  }
  
  assertEquals(acao, "https://anchoring.app", "No origin should get default");
  await res.text();
});
