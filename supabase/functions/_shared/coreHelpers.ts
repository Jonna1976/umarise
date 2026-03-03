/**
 * Shared helpers for Core API v1 endpoints
 * 
 * Provides: rate limiting, request logging, error formatting, IP hashing
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Standard CORS headers for all Core endpoints
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Error codes as defined in the plan
export type CoreErrorCode =
  | 'INVALID_HASH_FORMAT'
  | 'INVALID_REQUEST_BODY'
  | 'REJECTED_FIELD'
  | 'UNAUTHORIZED'
  | 'API_KEY_REVOKED'
  | 'INSUFFICIENT_CREDITS'
  | 'NOT_FOUND'
  | 'DUPLICATE_HASH'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

// Standard error response format
export interface CoreError {
  error: {
    code: CoreErrorCode;
    message: string;
    retry_after_seconds?: number;
    limit?: number;
    window?: string;
  };
}

// Create error response with proper headers
export function errorResponse(
  code: CoreErrorCode,
  message: string,
  status: number,
  extraHeaders: Record<string, string> = {}
): Response {
  const body: CoreError = {
    error: { code, message },
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
      ...extraHeaders,
    },
  });
}

// Rate limit exceeded response
export function rateLimitResponse(
  retryAfterSeconds: number,
  limit: number
): Response {
  const body: CoreError = {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`,
      retry_after_seconds: retryAfterSeconds,
      limit,
      window: '1m',
    },
  };
  return new Response(JSON.stringify(body), {
    status: 429,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
      'Retry-After': String(retryAfterSeconds),
    },
  });
}

// Hash IP address for privacy
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'ip:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract client IP from request
export function getClientIp(req: Request): string {
  // Try x-forwarded-for first (standard for proxied requests)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Can be comma-separated list, take the first one
    return forwarded.split(',')[0].trim();
  }
  // Fallback to x-real-ip
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  // Default fallback
  return 'unknown';
}

// Rate limit check and increment
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetInSeconds: number;
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  rateKey: string,
  endpoint: string,
  limit: number
): Promise<RateLimitResult> {
  // Use UPSERT to atomically increment counter
  const { data, error } = await supabase.rpc('core_check_rate_limit', {
    p_rate_key: rateKey,
    p_endpoint: endpoint,
    p_limit: limit,
  });

  if (error) {
    console.error('[rate-limit] Check failed:', error);
    // On error, allow the request (fail open for availability)
    return { allowed: true, remaining: limit, limit, resetInSeconds: 60 };
  }

  // Calculate seconds until next minute
  const now = new Date();
  const resetInSeconds = 60 - now.getSeconds();

  return {
    allowed: data.allowed,
    remaining: Math.max(0, limit - data.count),
    limit,
    resetInSeconds,
  };
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + result.resetInSeconds),
  };
}

// Log request (fire-and-forget)
export async function logRequest(
  supabase: SupabaseClient,
  data: {
    endpoint: string;
    method: string;
    api_key_prefix?: string;
    status_code: number;
    response_time_ms: number;
    error_code?: string;
    ip_hash?: string;
  }
): Promise<void> {
  try {
    await supabase.from('core_request_log').insert({
      endpoint: data.endpoint,
      method: data.method,
      api_key_prefix: data.api_key_prefix || null,
      status_code: data.status_code,
      response_time_ms: data.response_time_ms,
      error_code: data.error_code || null,
      ip_hash: data.ip_hash || null,
    });
  } catch (err) {
    // Fire-and-forget: don't let logging failures affect the response
    console.error('[request-log] Failed to log:', err);
  }
}

// Normalize hash format
export function normalizeHash(input: string): { hash: string; algo: 'sha256' } | null {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim().toLowerCase();
  
  // Handle "sha256:<hex>" format
  if (trimmed.startsWith('sha256:')) {
    const hex = trimmed.slice(7);
    if (/^[a-f0-9]{64}$/.test(hex)) {
      return { hash: `sha256:${hex}`, algo: 'sha256' };
    }
    return null;
  }
  
  // Handle raw hex format (64 chars = SHA-256)
  if (/^[a-f0-9]{64}$/.test(trimmed)) {
    return { hash: `sha256:${trimmed}`, algo: 'sha256' };
  }
  
  return null;
}

// Success response with standard headers
export function successResponse(
  data: unknown,
  status: number = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
      ...extraHeaders,
    },
  });
}

// Create service role Supabase client
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Create anon Supabase client (for public endpoints)
export function createAnonClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}
