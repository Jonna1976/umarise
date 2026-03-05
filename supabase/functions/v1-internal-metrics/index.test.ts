import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_API_SECRET");

Deno.test("GET without secret returns 401", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/v1-internal-metrics`);
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error.code, "UNAUTHORIZED");
});

Deno.test("OPTIONS returns CORS headers", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/v1-internal-metrics`, {
    method: "OPTIONS",
  });
  await res.text();
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
});

Deno.test("POST returns 405", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/v1-internal-metrics`, {
    method: "POST",
    headers: { "x-internal-secret": "wrong" },
  });
  const body = await res.json();
  assertEquals(res.status, 405);
});

// Only run authenticated test if secret is available
if (INTERNAL_SECRET) {
  Deno.test("GET with valid secret returns full metrics", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/v1-internal-metrics`, {
      headers: { "x-internal-secret": INTERNAL_SECRET },
    });
    assertEquals(res.status, 200);
    const body = await res.json();

    // Verify all expected fields exist
    const expectedFields = [
      "total_attestations",
      "attestations_24h",
      "attestations_7d",
      "attestations_30d",
      "active_partners",
      "active_partners_7d",
      "proofs_anchored",
      "proofs_pending",
      "proofs_by_partner",
      "avg_response_time_ms_24h",
      "error_rate_24h",
      "requests_24h",
      "requests_by_endpoint_24h",
      "timestamp",
    ];

    for (const field of expectedFields) {
      assert(field in body, `Missing field: ${field}`);
    }

    // Type checks
    assertEquals(typeof body.total_attestations, "number");
    assertEquals(typeof body.proofs_anchored, "number");
    assertEquals(typeof body.proofs_pending, "number");
    assertEquals(typeof body.proofs_by_partner, "object");
    assertEquals(typeof body.active_partners_7d, "number");
    assertEquals(typeof body.attestations_30d, "number");
    assert(body.timestamp.length > 0);

    console.log("✅ Metrics response:", JSON.stringify(body, null, 2));
  });
}
