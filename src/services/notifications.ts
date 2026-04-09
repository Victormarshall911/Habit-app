import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
            name: 'Habit Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#7C3AED',
            sound: 'default',
        });
    }

    return true;
}

const REMINDER_MESSAGES = [
    { title: '🌅 Morning Check-in', body: "Rise and shine! Time to crush your habits today." },
    { title: '☀️ Midday Momentum', body: "Keep the streak alive! Check off your habits." },
    { title: '🌆 Afternoon Push', body: "Don't let the day slip by — your streaks are counting on you!" },
    { title: '🌙 Evening Wrap-up', body: "Last call! Complete your habits before the day ends." },
];

function getMessageForHour(hour: number) {
    if (hour < 11) return REMINDER_MESSAGES[0];
    if (hour < 15) return REMINDER_MESSAGES[1];
    if (hour < 19) return REMINDER_MESSAGES[2];
    return REMINDER_MESSAGES[3];
}

// Default hours — used as fallback
const DEFAULT_HOURS = [8, 12, 16, 20];

export async function scheduleHabitReminders(customHours?: number[]): Promise<void> {
    // Cancel all existing scheduled notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const hours = customHours && customHours.length > 0 ? customHours : DEFAULT_HOURS;

    for (const hour of hours) {
        const message = getMessageForHour(hour);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: message.title,
                body: message.body,
                sound: 'default',
                ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hour,
                minute: 0,
            },
        });
    }
}

export async function cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function initializeNotifications(customHours?: number[]): Promise<void> {
    const granted = await requestNotificationPermissions();
    if (granted) {
        await scheduleHabitReminders(customHours);
    }
}
