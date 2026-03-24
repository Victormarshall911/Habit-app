/**
 * Dynamic App Icon Service
 * 
 * This service handles changing the app icon based on streak status.
 * 
 * NOTE: This requires @g9k/expo-dynamic-app-icon which needs a dev build
 * (won't work in Expo Go). The package must be installed and configured
 * in app.json plugins when ready to use.
 * 
 * For now, this provides the logic structure. When the package is installed:
 * 1. Add to app.json plugins with icon definitions
 * 2. Run `npx expo prebuild`
 * 3. Build with `npx expo run:ios` or `npx expo run:android`
 */

let setAppIcon: ((name: string) => Promise<void>) | null = null;
let getAppIcon: (() => Promise<string | null>) | null = null;

// Try to import the dynamic icon package (it may not be installed yet)
try {
    const dynamicIcon = require('@g9k/expo-dynamic-app-icon');
    setAppIcon = dynamicIcon.setAppIcon;
    getAppIcon = dynamicIcon.getAppIcon;
} catch {
    // Package not installed — icon switching disabled
    console.log('[AppIcon] @g9k/expo-dynamic-app-icon not installed. Dynamic icons disabled.');
}

export type AppIconName = 'happy' | 'angry';

export async function updateAppIcon(allStreaksAlive: boolean): Promise<void> {
    if (!setAppIcon) {
        console.log('[AppIcon] Dynamic icons not available. Skipping icon update.');
        return;
    }

    try {
        const targetIcon: AppIconName = allStreaksAlive ? 'happy' : 'angry';

        if (getAppIcon) {
            const currentIcon = await getAppIcon();
            if (currentIcon === targetIcon) return; // Already set
        }

        await setAppIcon(targetIcon);
        console.log(`[AppIcon] Changed app icon to: ${targetIcon}`);
    } catch (error) {
        console.warn('[AppIcon] Failed to update app icon:', error);
    }
}

export function isIconSwitchingAvailable(): boolean {
    return setAppIcon !== null;
}
