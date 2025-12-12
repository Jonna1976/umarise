/**
 * Haptic feedback utility for mobile devices
 * Uses the Vibration API where available
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 30],
  warning: [30, 30, 30],
  error: [50, 30, 50, 30, 50],
  selection: 5,
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 * @param style - The style of haptic feedback to trigger
 */
export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    const pattern = hapticPatterns[style];
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration is blocked
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Trigger a custom haptic pattern
 * @param pattern - Array of milliseconds for vibration/pause alternating
 */
export function triggerHapticPattern(pattern: number[]): void {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Stop any ongoing haptic feedback
 */
export function stopHaptic(): void {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.debug('Could not stop haptic:', error);
  }
}
