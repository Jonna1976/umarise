/**
 * Shared CORS configuration for App (Companion) layer edge functions.
 * 
 * Locks browser-based API access to known domains.
 * Core API (v1-core-*) is NOT affected — those use '*' for B2B partner access.
 * 
 * Note: CORS only restricts browser-initiated requests.
 * Server-to-server (curl, SDKs) is unaffected by CORS.
 */

const ALLOWED_ORIGINS = [
  'https://anchoring.app',
  'https://umarise.com',
  'https://www.umarise.com',
  'https://umarise.lovable.app',
];

/**
 * Check if an origin is allowed.
 * Also allows *.lovable.app for preview environments.
 */
function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow Lovable preview domains
  if (origin.endsWith('.lovable.app')) return true;
  return false;
}

/**
 * Get dynamic CORS headers based on the request's Origin header.
 * Returns the matched origin (not '*') for proper browser enforcement.
 */
export function getCompanionCorsHeaders(
  req: Request,
  extraHeaders: string = ''
): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];

  const baseHeaders = 'authorization, x-client-info, apikey, content-type';
  const allowHeaders = extraHeaders
    ? `${baseHeaders}, ${extraHeaders}`
    : baseHeaders;

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': allowHeaders,
    'Vary': 'Origin',
  };
}

/**
 * Build a preflight (OPTIONS) response with proper CORS headers.
 */
export function companionPreflightResponse(
  req: Request,
  extraHeaders: string = ''
): Response {
  return new Response(null, {
    headers: getCompanionCorsHeaders(req, extraHeaders),
  });
}
