/**
 * Umarise Core SDK — Node.js / TypeScript
 * 
 * Single-file SDK for Umarise Core v1 API.
 * Zero external dependencies. Uses native fetch (Node 18+) or globalThis.fetch.
 * 
 * Usage:
 *   import { UmariseCore } from './umarise-core';
 *   const core = new UmariseCore({ apiKey: 'um_...' });
 *   const origin = await core.attest('sha256:abc123...');
 * 
 * @version 1.0.0
 * @license MIT
 */

// ─── Types ──────────────────────────────────────────────────────

export interface UmariseCoreConfig {
  /** Partner API key (um_<64 hex chars>). Required for attest(). */
  apiKey?: string;
  /** Base URL for the Core API. Default: https://core.umarise.com */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number;
}

export interface OriginRecord {
  origin_id: string;
  hash: string;
  hash_algo: 'sha256';
  captured_at: string;
  proof_status?: 'pending' | 'anchored';
  proof_url?: string;
}

export interface VerifyResult extends OriginRecord {
  proof_status: 'pending' | 'anchored';
  proof_url: string;
}

export interface ProofResult {
  /** Raw .ots proof bytes (only when status is 'anchored') */
  proof: Uint8Array | null;
  status: 'pending' | 'anchored' | 'not_found';
  origin_id: string;
  bitcoin_block_height?: number;
  anchored_at?: string;
}

export interface HealthResult {
  status: 'operational';
  version: string;
}

export interface CoreError {
  code: string;
  message: string;
  retry_after_seconds?: number;
  limit?: number;
  window?: string;
}

export class UmariseCoreError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly retryAfterSeconds?: number;

  constructor(code: string, message: string, statusCode: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'UmariseCoreError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// ─── SDK ────────────────────────────────────────────────────────

export class UmariseCore {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: UmariseCoreConfig = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1').replace(/\/$/, '');
    this.timeout = config.timeout || 30_000;
  }

  // ─── Public Endpoints ───────────────────────────────────────

  /**
   * Check API health.
   * 
   * @returns { status: 'operational', version: 'v1' }
   */
  async health(): Promise<HealthResult> {
    const res = await this.request('GET', '/v1-core-health');
    return res as HealthResult;
  }

  /**
   * Resolve an origin by ID or hash.
   * Returns the earliest attestation (first-in-time).
   * 
   * @param params - Either { originId } or { hash }
   * @returns Origin record, or null if not found
   */
  async resolve(params: { originId: string } | { hash: string }): Promise<OriginRecord | null> {
    const query = 'originId' in params
      ? `origin_id=${encodeURIComponent(params.originId)}`
      : `hash=${encodeURIComponent(normalizeHashInput(params.hash))}`;

    try {
      return await this.request('GET', `/v1-core-resolve?${query}`) as OriginRecord;
    } catch (err) {
      if (err instanceof UmariseCoreError && err.statusCode === 404) return null;
      throw err;
    }
  }

  /**
   * Verify a hash against the registry.
   * Returns the origin record if found, null if no match.
   * 
   * @param hash - SHA-256 hash (with or without 'sha256:' prefix)
   * @returns Origin record with proof status, or null
   */
  async verify(hash: string): Promise<VerifyResult | null> {
    try {
      return await this.request('POST', '/v1-core-verify', {
        hash: normalizeHashInput(hash),
      }) as VerifyResult;
    } catch (err) {
      if (err instanceof UmariseCoreError && err.statusCode === 404) return null;
      throw err;
    }
  }

  /**
   * Download the OpenTimestamps proof for an origin.
   * 
   * @param originId - UUID of the origin
   * @returns Proof result with binary .ots data (or pending/not_found status)
   */
  async proof(originId: string): Promise<ProofResult> {
    const url = `${this.baseUrl}/v1-core-proof?origin_id=${encodeURIComponent(originId)}`;
    const res = await this.fetchWithTimeout(url, { method: 'GET', headers: {} });

    if (res.status === 404) {
      return { proof: null, status: 'not_found', origin_id: originId };
    }

    if (res.status === 202) {
      return { proof: null, status: 'pending', origin_id: originId };
    }

    if (res.status === 200) {
      const bytes = new Uint8Array(await res.arrayBuffer());
      return {
        proof: bytes,
        status: 'anchored',
        origin_id: originId,
        bitcoin_block_height: parseInt(res.headers.get('x-bitcoin-block-height') || '0') || undefined,
        anchored_at: res.headers.get('x-anchored-at') || undefined,
      };
    }

    await this.handleErrorResponse(res);
    throw new Error('Unreachable');
  }

  // ─── Partner Endpoint (requires API key) ────────────────────

  /**
   * Create an origin attestation.
   * Requires a Partner API key.
   * 
   * @param hash - SHA-256 hash (with or without 'sha256:' prefix)
   * @returns Created origin record
   * @throws UmariseCoreError if no API key is configured
   */
  async attest(hash: string): Promise<OriginRecord> {
    if (!this.apiKey) {
      throw new UmariseCoreError(
        'UNAUTHORIZED',
        'API key required for attest(). Pass apiKey in UmariseCore config.',
        401
      );
    }

    return await this.request('POST', '/v1-core-origins', {
      hash: normalizeHashInput(hash),
    }, true) as OriginRecord;
  }

  // ─── Internal Helpers ───────────────────────────────────────

  private async request(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
    authenticated = false
  ): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authenticated && this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const res = await this.fetchWithTimeout(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.ok) {
      return res.json();
    }

    await this.handleErrorResponse(res);
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new UmariseCoreError('TIMEOUT', `Request timed out after ${this.timeout}ms`, 0);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private async handleErrorResponse(res: Response): Promise<never> {
    let errorBody: { error?: CoreError } | undefined;
    try {
      errorBody = await res.json();
    } catch {
      // Response is not JSON
    }

    const err = errorBody?.error;
    throw new UmariseCoreError(
      err?.code || 'UNKNOWN_ERROR',
      err?.message || `HTTP ${res.status}`,
      res.status,
      err?.retry_after_seconds
    );
  }
}

// ─── Utility ────────────────────────────────────────────────────

/**
 * Normalize hash input: accepts raw 64-char hex or sha256: prefixed.
 * Always returns sha256: prefixed format.
 */
function normalizeHashInput(hash: string): string {
  const trimmed = hash.trim().toLowerCase();
  if (trimmed.startsWith('sha256:')) return trimmed;
  if (/^[a-f0-9]{64}$/.test(trimmed)) return `sha256:${trimmed}`;
  return trimmed; // Let the API validate and return proper error
}

// ─── Convenience: hash a file (Node.js) ─────────────────────────

/**
 * Hash a Buffer or Uint8Array using SHA-256.
 * Works in Node.js 18+ (Web Crypto API) and browsers.
 * 
 * @param data - File content as Buffer or Uint8Array
 * @returns Hash string in 'sha256:<hex>' format
 */
export async function hashBytes(data: BufferSource): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}

// ─── Default export ─────────────────────────────────────────────

export default UmariseCore;
