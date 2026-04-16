import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { initializeNotifications, cancelAllReminders, scheduleHabitReminders } from '../src/services/notifications';
import { updateAppIcon } from '../src/services/appIcon';
import { useHabitStore } from '../src/store/habitStore';
import { useTheme } from '../src/hooks/useTheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { colors, isDark } = useTheme();
    const [isAppReady, setIsAppReady] = useState(false);
    const hasAnyBrokenStreak = useHabitStore((s) => s.hasAnyBrokenStreak);
    const habits = useHabitStore((s) => s.habits);
    const isAllCompletedToday = useHabitStore((s) => s.isAllCompletedToday);
    const reminderHours = useHabitStore((s) => s.reminderHours);

    useEffect(() => {
        const prepare = async () => {
            try {
                // Initialize notifications on first launch
                initializeNotifications(reminderHours);

                // Simulate some loading time for more "premium" feel
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (e) {
                console.warn(e);
            } finally {
                setIsAppReady(true);
            }
        };

        prepare();
    }, []);

    useEffect(() => {
        if (isAppReady) {
            SplashScreen.hideAsync();
        }
    }, [isAppReady]);

    // Reactively cancel/re-schedule reminders based on completion status
    useEffect(() => {
        if (habits.length === 0) return;

        if (isAllCompletedToday()) {
            cancelAllReminders();
        } else {
            scheduleHabitReminders(reminderHours);
        }
    }, [habits, reminderHours]);

    useEffect(() => {
        // Update app icon whenever habits change
        if (habits.length > 0) {
            const broken = hasAnyBrokenStreak();
            updateAppIcon(!broken);
        }
    }, [habits]);

    if (!isAppReady) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Image
                    source={require('../assets/splash-icon.png')}
                    style={styles.loadingLogo}
                    resizeMode="contain"
                />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: colors.background },
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen
                            name="add-habit"
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                        <Stack.Screen
                            name="habit/[id]"
                            options={{
                                animation: 'slide_from_right',
                            }}
                        />
                    </Stack>
                </View>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingLogo: {
        width: 200,
        height: 200,
    },
});
