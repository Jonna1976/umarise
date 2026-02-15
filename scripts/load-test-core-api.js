/**
 * Umarise Core API — k6 Load Test
 * 
 * Tests: /v1-core-resolve, /v1-core-verify, /v1-core-origins, /v1-core-health
 * Target: 1000 concurrent requests/min across endpoints
 * 
 * Usage:
 *   k6 run scripts/load-test-core-api.js
 *   k6 run --env BASE_URL=https://core.umarise.com scripts/load-test-core-api.js
 *   k6 run --env API_KEY=your_partner_key scripts/load-test-core-api.js
 * 
 * Install k6:
 *   brew install k6          (macOS)
 *   choco install k6         (Windows)
 *   https://k6.io/docs/get-started/installation/
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ─── Configuration ──────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1';
const API_KEY = __ENV.API_KEY || ''; // Partner API key for /v1-core-origins
const ANON_KEY = __ENV.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcGx0bWR0aXlwYmZ6bHN6aGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODE0MzYsImV4cCI6MjA4MTA1NzQzNn0.5kweVtoI649Rf_zKYfHZu9RSUcLy_7GepCBWqRZdm6A';

// Known origin for resolve/verify tests (replace with a real one from your DB)
const TEST_ORIGIN_ID = __ENV.TEST_ORIGIN_ID || '00000000-0000-0000-0000-000000000000';
const TEST_HASH = __ENV.TEST_HASH || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // SHA-256 of empty

// ─── Custom Metrics ─────────────────────────────────────────────
const resolveErrors = new Rate('resolve_errors');
const verifyErrors = new Rate('verify_errors');
const originsErrors = new Rate('origins_errors');
const healthErrors = new Rate('health_errors');

const resolveDuration = new Trend('resolve_duration', true);
const verifyDuration = new Trend('verify_duration', true);
const originsDuration = new Trend('origins_duration', true);

const rateLimited = new Counter('rate_limited_429');

// ─── Load Profile ───────────────────────────────────────────────
// Target: ~1000 req/min = ~17 req/sec
// Distribution: 40% resolve, 30% verify, 20% origins, 10% health
export const options = {
  scenarios: {
    // Ramp up to target load
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },   // Warm-up
        { duration: '1m', target: 17 },    // Ramp to target
        { duration: '3m', target: 17 },    // Sustain 1000 req/min
        { duration: '1m', target: 34 },    // Spike to 2x
        { duration: '2m', target: 17 },    // Back to normal
        { duration: '30s', target: 0 },    // Cool down
      ],
    },
  },
  thresholds: {
    // P95 response times
    'resolve_duration': ['p(95)<2000'],    // < 2s
    'verify_duration': ['p(95)<2000'],     // < 2s
    'origins_duration': ['p(95)<3000'],    // < 3s (write operation)
    
    // Error rates
    'resolve_errors': ['rate<0.05'],       // < 5% errors
    'verify_errors': ['rate<0.05'],
    'origins_errors': ['rate<0.10'],       // Higher tolerance (needs API key)
    
    // Overall
    'http_req_duration': ['p(95)<3000'],
    'http_req_failed': ['rate<0.10'],
  },
};

// ─── Helpers ────────────────────────────────────────────────────
function headers(extra = {}) {
  return Object.assign({
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  }, extra);
}

function generateFakeHash() {
  // Generate a random 64-char hex string (SHA-256 format)
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}

// ─── Test Scenarios ─────────────────────────────────────────────
export default function () {
  const rand = Math.random();

  if (rand < 0.40) {
    testResolve();
  } else if (rand < 0.70) {
    testVerify();
  } else if (rand < 0.90) {
    testOrigins();
  } else {
    testHealth();
  }

  // ~1 req/sec per VU
  sleep(0.5 + Math.random());
}

function testResolve() {
  group('GET /v1-core-resolve', () => {
    // Test 1: Resolve by origin_id
    const res = http.get(
      `${BASE_URL}/v1-core-resolve?origin_id=${TEST_ORIGIN_ID}`,
      { headers: headers(), tags: { endpoint: 'resolve' } }
    );

    resolveDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimited.add(1);
      resolveErrors.add(false); // Rate limiting is expected, not an error
      return;
    }

    const success = check(res, {
      'resolve: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'resolve: has JSON body': (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
      'resolve: response time < 2s': (r) => r.timings.duration < 2000,
    });

    resolveErrors.add(!success);

    // Test 2: Resolve by hash (every 5th request)
    if (Math.random() < 0.2) {
      const res2 = http.get(
        `${BASE_URL}/v1-core-resolve?hash=${TEST_HASH}`,
        { headers: headers(), tags: { endpoint: 'resolve_by_hash' } }
      );
      resolveDuration.add(res2.timings.duration);
      if (res2.status === 429) rateLimited.add(1);
    }
  });
}

function testVerify() {
  group('POST /v1-core-verify', () => {
    const payload = JSON.stringify({
      hash: generateFakeHash(),
    });

    const res = http.post(
      `${BASE_URL}/v1-core-verify`,
      payload,
      { headers: headers(), tags: { endpoint: 'verify' } }
    );

    verifyDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimited.add(1);
      verifyErrors.add(false);
      return;
    }

    const success = check(res, {
      'verify: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'verify: has JSON body': (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
      'verify: response time < 2s': (r) => r.timings.duration < 2000,
    });

    verifyErrors.add(!success);
  });
}

function testOrigins() {
  group('POST /v1-core-origins', () => {
    // This endpoint requires a Partner API key
    if (!API_KEY) {
      // Without API key, test that it properly rejects
      const res = http.post(
        `${BASE_URL}/v1-core-origins`,
        JSON.stringify({ hash: generateFakeHash() }),
        { headers: headers(), tags: { endpoint: 'origins_unauth' } }
      );

      originsDuration.add(res.timings.duration);

      if (res.status === 429) {
        rateLimited.add(1);
        originsErrors.add(false);
        return;
      }

      const success = check(res, {
        'origins: rejects without API key (401/403)': (r) => r.status === 401 || r.status === 403,
      });

      originsErrors.add(!success);
      return;
    }

    // With API key: create a real attestation
    const payload = JSON.stringify({
      hash: generateFakeHash(),
    });

    const res = http.post(
      `${BASE_URL}/v1-core-origins`,
      payload,
      {
        headers: headers({ 'X-API-Key': API_KEY }),
        tags: { endpoint: 'origins_auth' },
      }
    );

    originsDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimited.add(1);
      originsErrors.add(false);
      return;
    }

    const success = check(res, {
      'origins: status is 201': (r) => r.status === 201,
      'origins: returns origin_id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.origin_id && body.origin_id.length > 0;
        } catch { return false; }
      },
      'origins: response time < 3s': (r) => r.timings.duration < 3000,
    });

    originsErrors.add(!success);
  });
}

function testHealth() {
  group('GET /v1-core-health', () => {
    const res = http.get(
      `${BASE_URL}/v1-core-health`,
      { headers: headers(), tags: { endpoint: 'health' } }
    );

    if (res.status === 429) {
      rateLimited.add(1);
      healthErrors.add(false);
      return;
    }

    const success = check(res, {
      'health: status is 200': (r) => r.status === 200,
      'health: returns operational': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'operational';
        } catch { return false; }
      },
      'health: response time < 500ms': (r) => r.timings.duration < 500,
    });

    healthErrors.add(!success);
  });
}

// ─── Summary ────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    test: 'Umarise Core API Load Test',
    timestamp: new Date().toISOString(),
    config: {
      base_url: BASE_URL,
      has_api_key: !!API_KEY,
      test_origin_id: TEST_ORIGIN_ID,
    },
    results: {
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      rate_limited: data.metrics.rate_limited_429?.values?.count || 0,
      resolve: {
        p95_ms: data.metrics.resolve_duration?.values?.['p(95)'] || 'N/A',
        error_rate: data.metrics.resolve_errors?.values?.rate || 0,
      },
      verify: {
        p95_ms: data.metrics.verify_duration?.values?.['p(95)'] || 'N/A',
        error_rate: data.metrics.verify_errors?.values?.rate || 0,
      },
      origins: {
        p95_ms: data.metrics.origins_duration?.values?.['p(95)'] || 'N/A',
        error_rate: data.metrics.origins_errors?.values?.rate || 0,
      },
    },
    thresholds_passed: Object.entries(data.metrics)
      .filter(([_, v]) => v.thresholds)
      .every(([_, v]) => Object.values(v.thresholds).every(t => t.ok)),
  };

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(summary, null, 2),
  };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
