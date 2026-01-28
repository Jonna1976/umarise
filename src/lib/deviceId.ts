// Device ID management for anonymous privacy-first identity

const DEVICE_ID_KEY = 'umarise_device_id';
// UI feature-mode toggle ("Demo" = wedge mode). This must NOT control which dataset is used.
const DEMO_MODE_KEY = 'umarise_demo_mode';
// Separate flag for switching to an isolated demo dataset (DEMO_DEVICE_ID)
const DEMO_DATASET_KEY = 'umarise_demo_dataset';
const PILOT_TEAM_KEY = 'umarise_pilot_team';

// Fixed demo device ID - must be 36+ chars to pass RLS policy
// Using a fixed UUID that will never collide with real user IDs
export const DEMO_DEVICE_ID = 'demo0000-0000-0000-0000-000000000001';

// Fixed pilot team device IDs for MKB pilot (21-day test)
// Each team shares a device_user_id for collaborative data access
// Must be exactly 36 characters to match UUID format validation
export const PILOT_TEAM_IDS = {
  A: 'pilot-team-aa-000-0000-000000000001',
  B: 'pilot-team-bb-000-0000-000000000002', 
  C: 'pilot-team-cc-000-0000-000000000003',
} as const;

export type PilotTeam = keyof typeof PILOT_TEAM_IDS;

/**
 * Get current pilot team (if joined)
 */
export function getPilotTeam(): PilotTeam | null {
  try {
    const team = localStorage.getItem(PILOT_TEAM_KEY);
    if (team && (team === 'A' || team === 'B' || team === 'C')) {
      return team as PilotTeam;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Join a pilot team - sets device_user_id to team's shared ID
 */
export function joinPilotTeam(team: PilotTeam): void {
  try {
    localStorage.setItem(PILOT_TEAM_KEY, team);
    localStorage.setItem(DEVICE_ID_KEY, PILOT_TEAM_IDS[team]);
  } catch {
    console.error('Failed to join pilot team');
  }
}

/**
 * Leave pilot team - generates new personal device ID
 */
export function leavePilotTeam(): void {
  try {
    localStorage.removeItem(PILOT_TEAM_KEY);
    const newId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, newId);
  } catch {
    console.error('Failed to leave pilot team');
  }
}

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
 * Check if the isolated demo dataset is active.
 *
 * IMPORTANT: This is intentionally NOT tied to the UI "Demo/Jonna" (wedge) mode.
 * Wedge mode should show your real data; demo dataset is only for test-data flows.
 */
export function isDemoModeActive(): boolean {
  try {
    return localStorage.getItem(DEMO_DATASET_KEY) === 'true';
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
