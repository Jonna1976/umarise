// Device ID management for anonymous privacy-first identity

const DEVICE_ID_KEY = 'umarise_device_id';
const DEMO_MODE_KEY = 'umarise_demo_mode';

// Fixed demo device ID - must be 36+ chars to pass RLS policy
// Using a fixed UUID that will never collide with real user IDs
export const DEMO_DEVICE_ID = 'demo0000-0000-0000-0000-000000000001';

export function generateDeviceId(): string {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get the user's real device ID (never the demo ID)
 */
export function getDeviceId(): string | null {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    // Auto-initialize if not present so the rest of the app never sees a null ID
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return null;
  }
}

/**
 * Check if demo mode is active
 */
export function isDemoModeActive(): boolean {
  try {
    return localStorage.getItem(DEMO_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Get the active device ID based on demo mode
 * Returns DEMO_DEVICE_ID when in demo mode, otherwise the user's real ID
 */
export function getActiveDeviceId(): string | null {
  if (isDemoModeActive()) {
    return DEMO_DEVICE_ID;
  }
  return getDeviceId();
}

export function setDeviceId(id: string): void {
  try {
    localStorage.setItem(DEVICE_ID_KEY, id);
  } catch {
    console.error('Failed to store device ID');
  }
}

export function initializeDeviceId(): string {
  let deviceId = getDeviceId();
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    setDeviceId(deviceId);
  }
  
  return deviceId;
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem('umarise_onboarding_complete') === 'true';
  } catch {
    return false;
  }
}

export function completeOnboarding(): void {
  try {
    localStorage.setItem('umarise_onboarding_complete', 'true');
  } catch {
    console.error('Failed to mark onboarding complete');
  }
}
