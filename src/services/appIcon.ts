/**
 * Dynamic App Icon Service
 * 
 * This service handles changing the app icon based on streak status.
 * 
 * NOTE: This requires a native development build (won't work in Expo Go).
 */

export type AppIconName = 'happy' | 'angry';

export async function updateAppIcon(allStreaksAlive: boolean): Promise<void> {
    // Icon switching is currently disabled/removed as requested.
    // console.log('[AppIcon] Dynamic icon switching is disabled.');
    return;
}

export function isIconSwitchingAvailable(): boolean {
    return false;
}
