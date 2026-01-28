/**
 * Device Validation Module
 * 
 * Implements header-based device validation as an additional security layer.
 * The x-device-id header must match the device_user_id in the request payload.
 * 
 * Security model:
 * - Device IDs are 128-bit UUIDs (2^122 entropy) stored only in localStorage
 * - This validation ensures the header matches the payload, preventing request tampering
 * - Combined with RLS policies, this creates defense-in-depth
 */

export const DEVICE_HEADER = 'x-device-id';

export interface DeviceValidationResult {
  valid: boolean;
  deviceId: string | null;
  error?: string;
}

/**
 * Validate device identity from request header against payload
 * 
 * @param req - The incoming request
 * @param payloadDeviceId - The device_user_id from the request payload
 * @returns Validation result with device ID or error
 */
export function validateDeviceHeader(
  req: Request,
  payloadDeviceId?: string
): DeviceValidationResult {
  const headerDeviceId = req.headers.get(DEVICE_HEADER);
  
  // If no header provided, check if payload has device ID (backward compatibility)
  if (!headerDeviceId) {
    if (payloadDeviceId && isValidDeviceId(payloadDeviceId)) {
      // Log warning for missing header but allow (for migration period)
      console.warn('[device-validation] Missing x-device-id header, using payload device_user_id');
      return { valid: true, deviceId: payloadDeviceId };
    }
    return { 
      valid: false, 
      deviceId: null, 
      error: 'Missing x-device-id header' 
    };
  }
  
  // Validate header format
  if (!isValidDeviceId(headerDeviceId)) {
    return { 
      valid: false, 
      deviceId: null, 
      error: 'Invalid x-device-id header format' 
    };
  }
  
  // If payload has device ID, it must match header
  if (payloadDeviceId && payloadDeviceId !== headerDeviceId) {
    console.error('[device-validation] Header/payload mismatch:', {
      header: headerDeviceId.slice(0, 8) + '...',
      payload: payloadDeviceId.slice(0, 8) + '...'
    });
    return { 
      valid: false, 
      deviceId: null, 
      error: 'Device ID mismatch between header and payload' 
    };
  }
  
  return { valid: true, deviceId: headerDeviceId };
}

/**
 * Check if device ID has valid UUID format (36+ chars)
 */
export function isValidDeviceId(deviceId: string): boolean {
  return deviceId.length >= 36 && /^[a-f0-9-]+$/i.test(deviceId);
}

/**
 * Extract device ID from request, preferring header over payload
 */
export function getDeviceIdFromRequest(
  req: Request,
  payloadDeviceId?: string
): string | null {
  const headerDeviceId = req.headers.get(DEVICE_HEADER);
  
  if (headerDeviceId && isValidDeviceId(headerDeviceId)) {
    return headerDeviceId;
  }
  
  if (payloadDeviceId && isValidDeviceId(payloadDeviceId)) {
    return payloadDeviceId;
  }
  
  return null;
}

/**
 * Create error response for device validation failure
 */
export function createDeviceValidationErrorResponse(
  error: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error, code: 'DEVICE_VALIDATION_FAILED' }),
    { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
