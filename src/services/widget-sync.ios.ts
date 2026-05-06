import { Countdown } from '../types/habit';

/**
 * Synchronizes the app's countdown data with the native iOS home screen widget.
 * This ensures the widget always shows the most relevant or newest countdown.
 */
export async function syncWidget(countdowns: Countdown[]): Promise<void> {
    try {
        // Import expo-widgets — safe on iOS with a native/dev build
        const { Widget } = require('expo-widgets');

        const widget = new Widget('CountdownWidget');

        if (countdowns.length === 0) {
            // Clear widget data if no countdowns exist
            widget.updateSnapshot({
                title: 'No active countdowns',
                targetDate: null,
                color: '#7C3AED',
                emoji: '🎯',
            });
            return;
        }

        // Show the most recent or upcoming countdown on the widget
        const activeCountdown = countdowns[countdowns.length - 1];

        widget.updateSnapshot({
            title: activeCountdown.title,
            targetDate: activeCountdown.targetDate,
            color: activeCountdown.color,
            emoji: activeCountdown.emoji,
        });
    } catch (error) {
        // Silently fail in dev if something goes wrong with the native bridge
        if (__DEV__) {
            console.log(
                '[WidgetSync] Sync skipped or failed:',
                error instanceof Error ? error.message : String(error)
            );
        }
    }
}
