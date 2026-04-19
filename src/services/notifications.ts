import { Platform, LogBox } from 'react-native';

// Suppress the known Expo Go warning about push notifications
// Local/scheduled notifications still work fine in Expo Go —
// only remote push was removed in SDK 53.
LogBox.ignoreLogs([
    'expo-notifications',
    '`expo-notifications` functionality is not fully supported in Expo Go',
]);

// Lazily loaded module — only loaded on first actual API call
let Notifications: typeof import('expo-notifications') | null = null;
let handlerConfigured = false;

function getNotificationsModule() {
    if (Notifications) return Notifications;
    try {
        Notifications = require('expo-notifications');
    } catch (e) {
        console.warn('expo-notifications could not be loaded:', e);
        return null;
    }
    return Notifications;
}

/**
 * Configures how notifications appear in the foreground.
 * Called lazily before any scheduling/permission operation.
 */
function ensureHandlerConfigured() {
    if (handlerConfigured) return;
    handlerConfigured = true;
    const mod = getNotificationsModule();
    if (!mod) return;
    try {
        mod.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch (e) {
        console.warn('Failed to set notification handler:', e);
    }
}

export async function getNotificationPermissionStatus(): Promise<string> {
    ensureHandlerConfigured();
    const mod = getNotificationsModule();
    if (!mod) return 'unavailable';
    try {
        const { status } = await mod.getPermissionsAsync();
        return status;
    } catch (e) {
        console.warn('Failed to get notification permissions:', e);
        return 'unavailable';
    }
}

export async function requestNotificationPermissions(): Promise<boolean> {
    ensureHandlerConfigured();
    const mod = getNotificationsModule();
    if (!mod) return false;
    try {
        const { status: existingStatus } = await mod.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await mod.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await mod.setNotificationChannelAsync('habit-reminders', {
                name: 'Habit Reminders',
                importance: mod.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#7C3AED',
                sound: 'default',
            });
        }

        return true;
    } catch (e) {
        console.warn('Notification permissions not available:', e);
        return false;
    }
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

// Default reminder hours
const DEFAULT_HOURS = [8, 12, 16, 20];

export async function scheduleHabitReminders(customHours?: number[]): Promise<void> {
    ensureHandlerConfigured();
    const mod = getNotificationsModule();
    if (!mod) return;
    try {
        // Cancel all existing scheduled notifications first
        await mod.cancelAllScheduledNotificationsAsync();

        const hours = customHours && customHours.length > 0 ? customHours : DEFAULT_HOURS;

        for (const hour of hours) {
            const message = getMessageForHour(hour);

            await mod.scheduleNotificationAsync({
                content: {
                    title: message.title,
                    body: message.body,
                    sound: 'default',
                    ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
                },
                trigger: {
                    type: mod.SchedulableTriggerInputTypes.DAILY,
                    hour: hour,
                    minute: 0,
                },
            });
        }
    } catch (e) {
        console.warn('Failed to schedule notifications:', e);
    }
}

export async function cancelAllReminders(): Promise<void> {
    const mod = getNotificationsModule();
    if (!mod) return;
    try {
        await mod.cancelAllScheduledNotificationsAsync();
    } catch (e) {
        console.warn('Failed to cancel notifications:', e);
    }
}

export async function initializeNotifications(customHours?: number[]): Promise<void> {
    try {
        const granted = await requestNotificationPermissions();
        if (granted) {
            await scheduleHabitReminders(customHours);
        }
    } catch (e) {
        console.warn('Failed to initialize notifications:', e);
    }
}

/** Returns true if the notifications module loaded successfully */
export function isNotificationsAvailable(): boolean {
    return getNotificationsModule() !== null;
}
