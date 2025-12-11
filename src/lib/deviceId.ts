// Device ID management for anonymous privacy-first identity

const DEVICE_ID_KEY = 'umarise_device_id';

export function generateDeviceId(): string {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getDeviceId(): string | null {
  try {
    return localStorage.getItem(DEVICE_ID_KEY);
  } catch {
    return null;
  }
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
