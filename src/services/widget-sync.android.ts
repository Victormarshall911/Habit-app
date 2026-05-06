import { Countdown } from '../types/habit';

/**
 * Android stub for widget sync.
 * 
 * expo-widgets is iOS-only. This no-op file prevents the Android build
 * from ever importing the native module, which would crash the app.
 */
export async function syncWidget(_countdowns: Countdown[]): Promise<void> {
    // No-op on Android — expo-widgets does not support Android home screen widgets
}
