/**
 * Shared rate limiting for public (unauthenticated) edge functions.
 * Uses IP-hash as rate key for privacy-preserving limiting.
 * Reuses the core_check_rate_limit DB function.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInSeconds: number
}

/**
 * Hash an IP address with SHA-256 for privacy-preserving rate limiting.
 */
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const arr = new Uint8Array(hash)
  return Array.from(arr.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Extract client IP from request headers.
 */
function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Check rate limit for a public endpoint using IP-hash as key.
 *
 * @param req - The incoming request (used to extract IP)
 * @param endpoint - Function name (e.g. 'companion-verify')
 * @param limit - Max requests per minute
 */
export async function checkPublicRateLimit(
  req: Request,
  endpoint: string,
  limit: number
): Promise<RateLimitResult> {
  try {
    const ip = getClientIp(req)
    const ipHash = await hashIp(ip)
    const rateKey = `ip:${ipHash}`

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase.rpc('core_check_rate_limit', {
      p_rate_key: rateKey,
      p_endpoint: endpoint,
      p_limit: limit,
    })

    if (error) {
      console.error(`[rate-limit:${endpoint}] Check failed:`, error)
      // Fail open for availability
      return { allowed: true, remaining: limit, resetInSeconds: 60 }
    }

    const now = new Date()
    const resetInSeconds = 60 - now.getSeconds()

    return {
      allowed: data.allowed,
      remaining: Math.max(0, limit - data.count),
      resetInSeconds,
    }
  } catch (err) {
    console.error(`[rate-limit:${endpoint}] Unexpected error:`, err)
    return { allowed: true, remaining: limit, resetInSeconds: 60 }
  }
}

/**
 * Build a 429 response for rate-limited requests.
 */
export function publicRateLimitResponse(
  corsHeaders: Record<string, string>,
  resetInSeconds: number
): Response {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded', retryAfterSeconds: resetInSeconds }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(resetInSeconds),
      },
    }
  )
}
