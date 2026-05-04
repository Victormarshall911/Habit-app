import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Countdown } from '../types/habit';

/**
 * Synchronizes the app's countdown data with the native home screen widget.
 * This ensures the widget always shows the most relevant or newest countdown.
 * 
 * Safety: This function checks if we are running in Expo Go to prevent 
 * loading native modules that don't exist there.
 */
export async function syncWidget(countdowns: Countdown[]) {
    // Check if we are in Expo Go. Native widgets are NOT supported in Expo Go.
    // We only attempt to sync if we are in a development build or standalone app.
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    
    if (isExpoGo) {
        return;
    }

    try {
        // Attempt to load expo-widgets safely
        let ExpoWidgets;
        try {
            // Using a dynamic require to avoid bundling issues in environments where it's missing
            ExpoWidgets = require('expo-widgets');
        } catch (e) {
            // Native module not available or failed to load
            return;
        }

        if (!ExpoWidgets || !ExpoWidgets.setWidgetData) {
            return;
        }

        if (countdowns.length === 0) {
            // Clear widget data if no countdowns exist
            await ExpoWidgets.setWidgetData('CountdownWidget', {
                title: 'No active countdowns',
                targetDate: null,
                color: '#7C3AED',
                emoji: '🎯'
            });
            return;
        }

        // We show the most recent or upcoming countdown on the widget
        const activeCountdown = countdowns[countdowns.length - 1];

        await ExpoWidgets.setWidgetData('CountdownWidget', {
            title: activeCountdown.title,
            targetDate: activeCountdown.targetDate,
            color: activeCountdown.color,
            emoji: activeCountdown.emoji
        });
    } catch (error) {
        // Silently fail in dev if something goes wrong with the native bridge
        if (__DEV__) {
            console.log('[WidgetSync] Sync skipped or failed:', error.message);
        }
    }
}
