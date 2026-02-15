/**
 * Umarise Core API — Authenticated Load Test
 * 
 * Tests POST /v1-core-origins with a real Partner API key,
 * then verifies created attestations via /v1-core-resolve and /v1-core-verify.
 * 
 * Usage:
 *   k6 run --env API_KEY=um_your_partner_key scripts/load-test-authenticated.js
 *   k6 run --env API_KEY=um_key --env BASE_URL=https://core.umarise.com scripts/load-test-authenticated.js
 * 
 * Required:
 *   API_KEY  — Partner API key (um_<64 hex chars>)
 * 
 * Optional:
 *   BASE_URL — API base URL (default: Supabase functions endpoint)
 *   ANON_KEY — Supabase anon key (default: project key)
 */

import http from 'k6/http';
import { check, sleep, group, fail } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// ─── Configuration ──────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1';
const API_KEY = __ENV.API_KEY || '';
const ANON_KEY = __ENV.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcGx0bWR0aXlwYmZ6bHN6aGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODE0MzYsImV4cCI6MjA4MTA1NzQzNn0.5kweVtoI649Rf_zKYfHZu9RSUcLy_7GepCBWqRZdm6A';

// Validate API key is provided
if (!API_KEY) {
  console.error('ERROR: API_KEY is required. Run with --env API_KEY=um_your_key');
  fail('Missing API_KEY environment variable');
}

// ─── Custom Metrics ─────────────────────────────────────────────
const attestErrors = new Rate('attest_errors');
const resolveErrors = new Rate('resolve_errors');
const verifyErrors = new Rate('verify_errors');

const attestDuration = new Trend('attest_duration', true);
const resolveCreatedDuration = new Trend('resolve_created_duration', true);
const verifyCreatedDuration = new Trend('verify_created_duration', true);

const attestationsCreated = new Counter('attestations_created');
const roundTripsCompleted = new Counter('round_trips_completed');
const rateLimited = new Counter('rate_limited_429');

// ─── Load Profile ───────────────────────────────────────────────
// Conservative: attestations are real writes, respect rate limits
export const options = {
  scenarios: {
    authenticated_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 2 },   // Warm-up (gentle)
        { duration: '1m',  target: 5 },   // Ramp to moderate load
        { duration: '2m',  target: 5 },   // Sustain ~5 attestations/sec
        { duration: '1m',  target: 10 },  // Spike
        { duration: '1m',  target: 5 },   // Back to normal
        { duration: '15s', target: 0 },   // Cool down
      ],
    },
  },
  thresholds: {
    // Attestation P95 < 3s (write operation)
    'attest_duration': ['p(95)<3000'],
    // Resolve of freshly created origin < 2s
    'resolve_created_duration': ['p(95)<2000'],
    // Verify of freshly created hash < 2s
    'verify_created_duration': ['p(95)<2000'],
    // Error rates
    'attest_errors': ['rate<0.05'],
    'resolve_errors': ['rate<0.05'],
    'verify_errors': ['rate<0.05'],
  },
};

// ─── Helpers ────────────────────────────────────────────────────
function baseHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  };
}

function partnerHeaders() {
  return {
    ...baseHeaders(),
    'X-API-Key': API_KEY,
  };
}

function generateFakeHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}

// ─── Main Test Flow ─────────────────────────────────────────────
// Full round-trip: Create → Resolve → Verify
export default function () {
  const hash = generateFakeHash();
  let originId = null;

  // Step 1: Create attestation
  group('POST /v1-core-origins (authenticated)', () => {
    const res = http.post(
      `${BASE_URL}/v1-core-origins`,
      JSON.stringify({ hash: `sha256:${hash}` }),
      { headers: partnerHeaders(), tags: { endpoint: 'origins_auth' } }
    );

    attestDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimited.add(1);
      attestErrors.add(false); // Rate limiting is expected, not an error
      return;
    }

    const success = check(res, {
      'attest: status is 201': (r) => r.status === 201,
      'attest: returns origin_id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.origin_id && body.origin_id.length > 0;
        } catch { return false; }
      },
      'attest: returns correct hash': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.hash === `sha256:${hash}` || body.hash === hash;
        } catch { return false; }
      },
      'attest: hash_algo is sha256': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.hash_algo === 'sha256';
        } catch { return false; }
      },
      'attest: has captured_at': (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.captured_at;
        } catch { return false; }
      },
      'attest: proof_status is pending': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.proof_status === 'pending';
        } catch { return false; }
      },
      'attest: response time < 3s': (r) => r.timings.duration < 3000,
    });

    attestErrors.add(!success);

    if (success) {
      try {
        const body = JSON.parse(res.body);
        originId = body.origin_id;
        attestationsCreated.add(1);
      } catch { /* ignore */ }
    }
  });

  // If attestation failed or was rate limited, skip round-trip
  if (!originId) {
    sleep(1 + Math.random());
    return;
  }

  // Brief pause to allow DB propagation
  sleep(0.2);

  // Step 2: Resolve the freshly created attestation
  group('GET /v1-core-resolve (round-trip)', () => {
    // Resolve by origin_id
    const res = http.get(
      `${BASE_URL}/v1-core-resolve?origin_id=${originId}`,
      { headers: baseHeaders(), tags: { endpoint: 'resolve_roundtrip' } }
    );

    resolveCreatedDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimited.add(1);
      resolveErrors.add(false);
      return;
    }

    const success = check(res, {
      'resolve: status is 200': (r) => r.status === 200,
      'resolve: origin_id matches': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.origin_id === originId;
        } catch { return false; }
      },
      'resolve: hash matches': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.hash === `sha256:${hash}` || body.hash === hash;
        } catch { return false; }
      },
      'resolve: response time < 2s': (r) => r.timings.duration < 2000,
    });

    resolveErrors.add(!success);
  });

  // Step 3: Verify the hash
  group('POST /v1-core-verify (round-trip)', () => {
    const res = http.post(
      `${BASE_URL}/v1-core-verify`,
      JSON.stringify({ hash }),
      { headers: baseHeaders(), tags: { endpoint: 'verify_roundtrip' } }
    );

    verifyCreatedDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimited.add(1);
      verifyErrors.add(false);
      return;
    }

    const success = check(res, {
      'verify: status is 200': (r) => r.status === 200,
      'verify: returns origin data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.origin_id && !!body.hash;
        } catch { return false; }
      },
      'verify: origin_id matches': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.origin_id === originId;
        } catch { return false; }
      },
      'verify: response time < 2s': (r) => r.timings.duration < 2000,
    });

    verifyErrors.add(!success);

    if (success) {
      roundTripsCompleted.add(1);
    }
  });

  // Throttle: ~1 full round-trip per second per VU
  sleep(0.5 + Math.random());
}

// ─── Summary ────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    test: 'Umarise Core API — Authenticated Load Test',
    timestamp: new Date().toISOString(),
    config: {
      base_url: BASE_URL,
      api_key_prefix: API_KEY.substring(0, 11) + '...',
    },
    results: {
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      attestations_created: data.metrics.attestations_created?.values?.count || 0,
      round_trips_completed: data.metrics.round_trips_completed?.values?.count || 0,
      rate_limited: data.metrics.rate_limited_429?.values?.count || 0,
      attest: {
        p95_ms: data.metrics.attest_duration?.values?.['p(95)'] || 'N/A',
        error_rate: data.metrics.attest_errors?.values?.rate || 0,
      },
      resolve_roundtrip: {
        p95_ms: data.metrics.resolve_created_duration?.values?.['p(95)'] || 'N/A',
        error_rate: data.metrics.resolve_errors?.values?.rate || 0,
      },
      verify_roundtrip: {
        p95_ms: data.metrics.verify_created_duration?.values?.['p(95)'] || 'N/A',
        error_rate: data.metrics.verify_errors?.values?.rate || 0,
      },
    },
    thresholds_passed: Object.entries(data.metrics)
      .filter(([_, v]) => v.thresholds)
      .every(([_, v]) => Object.values(v.thresholds).every(t => t.ok)),
  };

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-authenticated-results.json': JSON.stringify(summary, null, 2),
  };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
