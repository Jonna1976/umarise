/**
 * Haptic feedback utility for mobile devices
 * Uses Capacitor Haptics on native, falls back to Vibration API on web
 */
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Web fallback patterns (milliseconds)
const webPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 30],
  warning: [30, 30, 30],
  error: [50, 30, 50, 30, 50],
  selection: 5,
};

/**
 * Check if we're running in a native Capacitor context
 */
function isNativeApp(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor.isNativePlatform?.();
}

/**
 * Check if web vibration is supported
 */
function isWebVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 * Uses Capacitor Haptics on native, Vibration API on web
 */
export async function triggerHaptic(style: HapticStyle = 'light'): Promise<void> {
  try {
    if (isNativeApp()) {
      // Use Capacitor Haptics for native apps
      switch (style) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionEnd();
          break;
      }
    } else if (isWebVibrationSupported()) {
      // Fall back to Vibration API for web
      const pattern = webPatterns[style];
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Trigger a custom haptic pattern (web only fallback)
 * On native, this will use medium impact
 */
export async function triggerHapticPattern(pattern: number[]): Promise<void> {
  try {
    if (isNativeApp()) {
      // Native doesn't support custom patterns, use medium impact
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (isWebVibrationSupported()) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Start a selection haptic (for drag/scroll interactions)
 */
export async function startSelectionHaptic(): Promise<void> {
  try {
    if (isNativeApp()) {
      await Haptics.selectionStart();
    }
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Update selection haptic (call during drag)
 */
export async function updateSelectionHaptic(): Promise<void> {
  try {
    if (isNativeApp()) {
      await Haptics.selectionChanged();
    }
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * End selection haptic (call when drag ends)
 */
export async function endSelectionHaptic(): Promise<void> {
  try {
    if (isNativeApp()) {
      await Haptics.selectionEnd();
    }
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Stop any ongoing haptic feedback (web only)
 */
export function stopHaptic(): void {
  if (!isNativeApp() && isWebVibrationSupported()) {
    try {
      navigator.vibrate(0);
    } catch (error) {
      console.debug('Could not stop haptic:', error);
    }
  }
}

/**
 * Check if haptics are supported on this device
 */
export function isHapticsSupported(): boolean {
  return isNativeApp() || isWebVibrationSupported();
}
